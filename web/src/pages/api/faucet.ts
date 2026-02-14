import type { APIRoute } from "astro"
import { getStore, type SessionData } from "~/lib/claim-store"

// Error codes for structured error responses
type FaucetErrorCode = "INVALID_PROOF" | "RATE_LIMITED" | "TRANSFER_FAILED" | "INVALID_REQUEST" | "SERVER_ERROR"

interface FaucetError {
  error: string
  code: FaucetErrorCode
  details?: Record<string, unknown>
}

interface ZkPassportProof {
  nullifierHash: string
  proof: string
  walletAddress: string
}

// Configuration
const MATE_TOKEN_ADDRESS = import.meta.env.MATE_TOKEN_ADDRESS || "0xc139c86de76df41c041a30853c3958427fa7cebd"
const FAUCET_PRIVATE_KEY = import.meta.env.FAUCET_PRIVATE_KEY
const BASE_RPC_URL = import.meta.env.BASE_RPC_URL || "https://mainnet.base.org"
const CLAIM_AMOUNT = "100"
const CLAIM_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000 // 1 week

// Check if running in production mode (has required env vars)
function isProductionMode(): boolean {
  const required = ["FAUCET_PRIVATE_KEY"]
  const missing = required.filter(k => !import.meta.env[k])

  if (missing.length > 0) {
    console.warn(`[Faucet] Missing env vars: ${missing.join(", ")} - running in demo mode`)
    return false
  }
  return true
}

const IS_PRODUCTION = isProductionMode()

// Create JSON response helper
function jsonResponse(data: object, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function errorResponse(error: string, code: FaucetErrorCode, status: number, details?: Record<string, unknown>): Response {
  const body: FaucetError = { error, code }
  if (details) body.details = details
  return jsonResponse(body, status)
}

// Verify zkPassport proof
async function verifyZkPassportProof(proof: string): Promise<ZkPassportProof | null> {
  // TODO: Integrate with @zkpassport/sdk or @rarimo/zk-passport-react
  // This should verify:
  // 1. The proof is valid cryptographically
  // 2. The passport is real and not expired
  // 3. Extract the nullifier hash for rate limiting

  try {
    const proofData = JSON.parse(proof) as ZkPassportProof

    if (!proofData.nullifierHash || !proofData.walletAddress) {
      return null
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(proofData.walletAddress)) {
      return null
    }

    return proofData
  } catch {
    return null
  }
}

// Send MATE tokens
async function sendMateTokens(toAddress: string, amount: string): Promise<string | null> {
  if (!IS_PRODUCTION) {
    // Demo mode - return fake transaction hash
    console.log(`[Faucet] Demo mode: Would send ${amount} MATE to ${toAddress}`)
    return "0x_demo_tx_hash_" + Date.now().toString(16)
  }

  // Production mode - actual token transfer
  // TODO: Integrate with ethers.js or viem
  // const provider = new ethers.JsonRpcProvider(BASE_RPC_URL)
  // const wallet = new ethers.Wallet(FAUCET_PRIVATE_KEY!, provider)
  // const token = new ethers.Contract(MATE_TOKEN_ADDRESS, ERC20_ABI, wallet)
  // const tx = await token.transfer(toAddress, ethers.parseUnits(amount, 18))
  // await tx.wait()
  // return tx.hash

  console.log(`[Faucet] Production: Sending ${amount} MATE to ${toAddress}`)
  return "0x_demo_tx_hash_" + Date.now().toString(16)
}

// GET handler - check session status
export const GET: APIRoute = async ({ url }) => {
  const action = url.searchParams.get("action")
  const sessionId = url.searchParams.get("sessionId")

  if (action === "check-session" && sessionId) {
    const store = getStore()
    const session = await store.getSession(sessionId)

    if (!session) {
      return jsonResponse({ verified: false })
    }

    return jsonResponse({
      verified: session.verified,
      proof: session.proof,
    })
  }

  return errorResponse("Invalid request", "INVALID_REQUEST", 400)
}

// POST handler - claim tokens
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { proof } = body

    if (!proof) {
      return errorResponse("Proof required", "INVALID_REQUEST", 400)
    }

    // Verify the zkPassport proof
    const verifiedProof = await verifyZkPassportProof(proof)

    if (!verifiedProof) {
      return errorResponse("Invalid or malformed proof", "INVALID_PROOF", 400)
    }

    const { nullifierHash, walletAddress } = verifiedProof
    const store = getStore()

    // Check rate limit (once per week)
    const lastClaim = await store.getLastClaim(nullifierHash)
    const now = Date.now()

    if (lastClaim && now - lastClaim < CLAIM_COOLDOWN_MS) {
      const nextClaimTime = new Date(lastClaim + CLAIM_COOLDOWN_MS)
      const hoursRemaining = Math.ceil((lastClaim + CLAIM_COOLDOWN_MS - now) / (60 * 60 * 1000))

      return errorResponse(
        "Already claimed this week",
        "RATE_LIMITED",
        429,
        {
          nextClaimAvailable: nextClaimTime.toISOString(),
          hoursRemaining,
        }
      )
    }

    // Send tokens
    const txHash = await sendMateTokens(walletAddress, CLAIM_AMOUNT)

    if (!txHash) {
      return errorResponse("Token transfer failed", "TRANSFER_FAILED", 500)
    }

    // Record the claim
    await store.recordClaim(nullifierHash, now)

    return jsonResponse({
      success: true,
      message: `Successfully claimed ${CLAIM_AMOUNT} MATE tokens!`,
      txHash,
      demoMode: !IS_PRODUCTION,
    })

  } catch (error) {
    console.error("[Faucet] Error:", error)
    return errorResponse("Internal server error", "SERVER_ERROR", 500)
  }
}

// PUT handler - webhook for zkPassport verification callbacks
export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { sessionId, proof, walletAddress } = body

    if (!sessionId || !proof) {
      return errorResponse("Missing required fields", "INVALID_REQUEST", 400)
    }

    const store = getStore()

    // Store the verified session
    const sessionData: SessionData = {
      verified: true,
      proof: JSON.stringify({ ...JSON.parse(proof), walletAddress }),
      wallet: walletAddress,
      createdAt: Date.now(),
    }

    await store.setSession(sessionId, sessionData)

    return jsonResponse({ success: true })

  } catch (error) {
    console.error("[Faucet] Webhook error:", error)
    return errorResponse("Internal server error", "SERVER_ERROR", 500)
  }
}

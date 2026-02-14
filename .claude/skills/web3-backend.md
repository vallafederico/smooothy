# Web3 Backend

Backend development for Web3/blockchain integrations.

## API Routes
Location: `/web/src/pages/api/`

```ts
import type { APIRoute } from "astro"

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json()

  // Handle request
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
```

## Environment Variables
Access via `import.meta.env`:
```ts
const PRIVATE_KEY = import.meta.env.FAUCET_PRIVATE_KEY
const RPC_URL = import.meta.env.BASE_RPC_URL
```

## Token Transfers (ethers.js pattern)
```ts
import { ethers } from "ethers"

const provider = new ethers.JsonRpcProvider("https://mainnet.base.org")
const wallet = new ethers.Wallet(PRIVATE_KEY, provider)

// ERC20 transfer
const token = new ethers.Contract(TOKEN_ADDRESS, [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)"
], wallet)

const tx = await token.transfer(toAddress, ethers.parseUnits("100", 18))
await tx.wait()
```

## Rate Limiting Pattern
```ts
const claimHistory = new Map<string, number>()
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000 // 1 week

function canClaim(userId: string): boolean {
  const lastClaim = claimHistory.get(userId)
  if (!lastClaim) return true
  return Date.now() - lastClaim >= COOLDOWN_MS
}
```

## zkPassport Verification
```ts
interface ZkPassportProof {
  nullifierHash: string  // Unique user identifier (privacy-preserving)
  proof: string          // ZK proof data
  walletAddress: string  // Recipient address
}

async function verifyProof(proof: string): Promise<ZkPassportProof | null> {
  // Verify with zkPassport SDK
  // Return null if invalid
}
```

## Base Chain
- Chain ID: 8453
- RPC: https://mainnet.base.org
- Explorer: https://basescan.org
- MATE Token: 0xc139c86de76df41c041a30853c3958427fa7cebd

## Current Endpoints
- `GET /api/faucet?action=check-session&sessionId=...` - Check verification
- `POST /api/faucet` - Claim tokens with proof
- `PUT /api/faucet` - Webhook for verification callbacks

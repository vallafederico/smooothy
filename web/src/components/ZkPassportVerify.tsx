import { useState, useEffect, useCallback, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import { LoadingSpinner } from "./LoadingSpinner"

type VerificationState = "idle" | "scanning" | "verifying" | "verified" | "error"

interface ClaimResult {
  success: boolean
  message: string
  txHash?: string
}

interface MarketEmbedProps {
  marketId: number
}

function MarketEmbed({ marketId }: MarketEmbedProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const embedUrl = `https://embed.precog.market/market?network=8453&id=${marketId}&type=compact&theme=dark&source=chain`

  if (error) {
    return (
      <div className="flex h-[315px] w-[420px] max-w-full items-center justify-center rounded-lg bg-white/5 p-4">
        <div className="text-center">
          <p className="text-sm text-white/60">Failed to load market</p>
          <a
            href={`https://precog.market/market/${marketId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs text-blue-400 underline hover:text-blue-300"
          >
            View on Precog
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-lg bg-white/5">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="md" />
        </div>
      )}
      <iframe
        src={embedUrl}
        width="420"
        height="315"
        frameBorder="0"
        allow="clipboard-write"
        loading="lazy"
        className={`block max-w-full transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  )
}

interface ZkPassportVerifyProps {
  marketIds?: number[]
}

// Scanning timeout in milliseconds (5 minutes)
const SCAN_TIMEOUT_MS = 5 * 60 * 1000

export default function ZkPassportVerify({ marketIds = [39, 40, 41] }: ZkPassportVerifyProps) {
  const [state, setState] = useState<VerificationState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [proof, setProof] = useState<string | null>(null)
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  // Use ref for session ID to avoid re-renders
  const sessionIdRef = useRef<string | null>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Generate session ID lazily
  const getSessionId = useCallback(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = crypto.randomUUID()
    }
    return sessionIdRef.current
  }, [])

  // QR code URL
  const qrCodeUrl = `https://verify.zkpassport.id/session/${getSessionId()}`

  // Cleanup function
  const cleanup = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    setTimeRemaining(null)
  }, [])

  // Poll for verification status
  useEffect(() => {
    if (state !== "scanning") {
      cleanup()
      return
    }

    const sessionId = getSessionId()
    const startTime = Date.now()

    // Set up countdown
    setTimeRemaining(Math.ceil(SCAN_TIMEOUT_MS / 1000))
    countdownRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.ceil((SCAN_TIMEOUT_MS - elapsed) / 1000)
      setTimeRemaining(Math.max(0, remaining))
    }, 1000)

    // Set up timeout
    timeoutRef.current = setTimeout(() => {
      cleanup()
      setState("error")
      setError("Verification timed out. Please try again.")
    }, SCAN_TIMEOUT_MS)

    // Set up polling
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/faucet?action=check-session&sessionId=${sessionId}`)
        const data = await response.json()

        if (data.verified) {
          cleanup()
          setProof(data.proof)
          setState("verified")
        }
      } catch {
        // Continue polling on error
      }
    }, 2000)

    return cleanup
  }, [state, getSessionId, cleanup])

  const startVerification = useCallback(() => {
    // Reset session ID for new verification
    sessionIdRef.current = null
    setState("scanning")
    setError(null)
  }, [])

  const claimTokens = useCallback(async () => {
    if (!proof) return

    setClaiming(true)
    setError(null)

    try {
      const response = await fetch("/api/faucet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ proof }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Claim failed")
      }

      setClaimResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to claim tokens")
    } finally {
      setClaiming(false)
    }
  }, [proof])

  const reset = useCallback(() => {
    cleanup()
    sessionIdRef.current = null
    setState("idle")
    setError(null)
    setProof(null)
    setClaimResult(null)
  }, [cleanup])

  // Format time remaining for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Idle state
  if (state === "idle") {
    return (
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={startVerification}
          className="rounded-lg bg-white px-6 py-3 font-mono text-sm font-semibold text-black transition-opacity hover:opacity-80"
        >
          Start Verification
        </button>
        <p className="text-center text-xs text-white/40">
          You'll need the zkPassport mobile app
        </p>
      </div>
    )
  }

  // Scanning state - show QR code
  if (state === "scanning") {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-lg bg-white p-4">
          <QRCodeSVG
            value={qrCodeUrl}
            size={192}
            level="M"
            includeMargin={false}
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>
        <p className="text-center text-sm text-white/60">
          Scan with your zkPassport app
        </p>
        <div className="flex items-center gap-2 text-sm text-white/60">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
          Waiting for verification...
          {timeRemaining !== null && (
            <span className="text-white/40">({formatTime(timeRemaining)})</span>
          )}
        </div>
        <button
          onClick={reset}
          className="text-xs text-white/40 underline hover:text-white/60"
        >
          Cancel
        </button>
      </div>
    )
  }

  // Verified state - ready to claim
  if (state === "verified" && !claimResult) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <span className="text-2xl text-green-400">&#10003;</span>
          </div>
          <p className="font-mono text-lg font-semibold text-green-400">
            Identity Verified
          </p>
          <button
            onClick={claimTokens}
            disabled={claiming}
            className="rounded-lg bg-green-500 px-6 py-3 font-mono text-sm font-semibold text-black transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {claiming ? "Claiming..." : "Claim 100 MATE"}
          </button>
          {error && (
            <p className="text-center text-sm text-red-400">{error}</p>
          )}
        </div>

        {marketIds.length > 0 && (
          <div className="w-full space-y-4 pt-6 border-t border-white/10">
            <h3 className="font-mono text-lg font-semibold text-center">
              Active Markets
            </h3>
            <p className="text-sm text-white/60 text-center">
              Use your MATE tokens in these prediction markets:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {marketIds.map(id => (
                <MarketEmbed key={id} marketId={id} />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Success state
  if (claimResult?.success) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <span className="text-2xl text-green-400">&#10003;</span>
          </div>
          <p className="font-mono text-lg font-semibold text-green-400">
            Tokens Claimed!
          </p>
          <p className="text-center text-sm text-white/60">{claimResult.message}</p>
          {claimResult.txHash && (
            <a
              href={`https://basescan.org/tx/${claimResult.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 underline hover:text-blue-300"
            >
              View transaction
            </a>
          )}
          <button
            onClick={reset}
            className="mt-2 text-xs text-white/40 underline hover:text-white/60"
          >
            Done
          </button>
        </div>

        {marketIds.length > 0 && (
          <div className="w-full space-y-4 pt-6 border-t border-white/10">
            <h3 className="font-mono text-lg font-semibold text-center">
              Active Markets
            </h3>
            <p className="text-sm text-white/60 text-center">
              Use your MATE tokens in these prediction markets:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {marketIds.map(id => (
                <MarketEmbed key={id} marketId={id} />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Error state
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
        <span className="text-2xl text-red-400">&#10005;</span>
      </div>
      <p className="font-mono text-lg font-semibold text-red-400">
        Verification Failed
      </p>
      <p className="text-center text-sm text-white/60">
        {error || "An error occurred"}
      </p>
      <button
        onClick={reset}
        className="rounded-lg border border-white/20 px-4 py-2 text-sm transition-colors hover:bg-white/5"
      >
        Try Again
      </button>
    </div>
  )
}

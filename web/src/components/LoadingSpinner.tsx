interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
}

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-white/20 border-t-white ${sizeMap[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/50 backdrop-blur-sm">
      <LoadingSpinner size="lg" />
      {message && (
        <p className="text-sm text-white/60">{message}</p>
      )}
    </div>
  )
}

export default LoadingSpinner

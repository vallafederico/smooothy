import { Component, type ReactNode } from "react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
            <span className="text-2xl text-red-400">!</span>
          </div>
          <h2 className="font-mono text-lg font-semibold text-red-400">
            Something went wrong
          </h2>
          <p className="max-w-md text-center text-sm text-white/60">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={this.handleRetry}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm transition-colors hover:bg-white/5"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorCount: number
}

/**
 * Error Boundary component that catches React errors and displays a fallback UI
 * Prevents entire application crash from component errors
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo)
    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }))
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Alert variant="destructive" className="max-w-2xl">
              <AlertCircle className="h-6 w-6" />
              <AlertDescription className="ml-2">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">
                      Oops! Something went wrong
                    </h2>
                    <p className="text-sm">
                      The application encountered an error and needs to be
                      recovered.
                    </p>
                  </div>

                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <details className="text-xs whitespace-pre-wrap overflow-auto max-h-60 bg-muted p-2 rounded border">
                      <summary className="cursor-pointer font-mono mb-2">
                        Error details (development only)
                      </summary>
                      <div>
                        <strong>Message:</strong>
                        {'\n'}
                        {this.state.error.toString()}
                        {'\n\n'}
                        <strong>Stack:</strong>
                        {'\n'}
                        {this.state.error.stack}
                        {'\n\n'}
                        {this.state.errorInfo?.componentStack && (
                          <>
                            <strong>Component Stack:</strong>
                            {'\n'}
                            {this.state.errorInfo.componentStack}
                          </>
                        )}
                      </div>
                    </details>
                  )}

                  <div className="flex gap-2 flex-wrap pt-2">
                    <Button
                      onClick={this.handleReset}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Try again
                    </Button>
                    <Button
                      onClick={this.handleReload}
                      size="sm"
                      variant="outline"
                    >
                      Reload page
                    </Button>
                  </div>

                  {this.state.errorCount > 2 && (
                    <p className="text-xs text-muted-foreground">
                      Multiple errors detected. Try clearing your browser cache
                      or reloading the page.
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )
      )
    }

    return this.props.children
  }
}

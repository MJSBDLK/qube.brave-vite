import React from 'react'
import { Bug, Clipboard, Check } from 'lucide-react'
import BugReportContext from '../contexts/BugReportContext'

class ErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null, copied: false }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  handleReportCrash = () => {
    const { openBugReport } = this.props
    if (openBugReport) {
      openBugReport({
        message: this.state.error?.message || 'Unknown error',
        stack: this.state.error?.stack || '',
        componentStack: this.state.errorInfo?.componentStack || ''
      })
    }
  }

  handleCopyError = async () => {
    const errorText = [
      '=== Error ===',
      this.state.error?.toString() || 'Unknown error',
      '',
      '=== Stack Trace ===',
      this.state.error?.stack || 'No stack trace',
      '',
      '=== Component Stack ===',
      this.state.errorInfo?.componentStack || 'No component stack',
      '',
      '=== URL ===',
      window.location.href,
      '',
      '=== Timestamp ===',
      new Date().toISOString()
    ].join('\n')

    try {
      await navigator.clipboard.writeText(errorText)
      this.setState({ copied: true })
      setTimeout(() => this.setState({ copied: false }), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h2>Something went wrong</h2>
            <p>The page encountered an error and couldn't load properly.</p>

            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error Details (Development Mode)</summary>
                <div className="error-info">
                  <h4>Error:</h4>
                  <pre>{this.state.error && this.state.error.toString()}</pre>

                  <h4>Component Stack:</h4>
                  <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                </div>
              </details>
            )}

            <div className="error-actions">
              <button
                onClick={this.handleCopyError}
                className="error-copy-btn"
                title="Copy error details to clipboard"
              >
                {this.state.copied ? <Check size={16} /> : <Clipboard size={16} />}
                {this.state.copied ? 'Copied!' : 'Copy Error'}
              </button>
              <button
                onClick={this.handleReportCrash}
                className="error-report-btn"
                title="Help us fix this issue"
              >
                <Bug size={16} />
                Report Crash
              </button>
              <button
                onClick={() => window.location.reload()}
                className="error-reload-btn"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="error-home-btn"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Wrapper component to provide context to class component
function ErrorBoundary({ children }) {
  return (
    <BugReportContext.Consumer>
      {(context) => (
        <ErrorBoundaryInner openBugReport={context?.openBugReport}>
          {children}
        </ErrorBoundaryInner>
      )}
    </BugReportContext.Consumer>
  )
}

export default ErrorBoundary

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { reportDiagnostic } from '../lib/observability'

type Props = { children: ReactNode }
type State = { failed: boolean }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    reportDiagnostic(error, { source: 'react-render', severity: 'fatal' })
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="page-state error-state" role="alert">
          <h1>BulkText could not continue</h1>
          <p>A technical error was recorded without message content or account data. Reload BulkText and try again.</p>
          <button type="button" className="primary-button" onClick={() => window.location.reload()}>Reload BulkText</button>
        </main>
      )
    }
    return this.props.children
  }
}

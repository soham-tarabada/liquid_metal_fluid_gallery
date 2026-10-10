import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  onFailure?: () => void
}

type State = {
  failed: boolean
}

export class SceneBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[scene] render failed, continuing without WebGL', error, info)
    this.props.onFailure?.()
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}

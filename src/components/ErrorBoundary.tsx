import { Component, type ErrorInfo, type ReactNode } from 'react'
import { safeWindow } from '../lib/runtime'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    const name = error?.name || 'Error'
    if (typeof console !== 'undefined') console.error('VUNA render failed', name)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="min-h-svh bg-[#0A0A0A] px-6 py-16 text-white">
        <p className="text-[11px] tracking-[0.18em] text-[#888]">VUNA</p>
        <h1 className="mt-2 text-[28px] font-bold">The board did not load</h1>
        <p className="mt-3 text-[14px] leading-snug text-[#888]">
          Refresh the page. If it stays blank, clear site data for this app and try again.
        </p>
        <button
          type="button"
          className="mt-6 rounded-full bg-[#CCFF00] px-5 py-3 text-[14px] font-semibold text-black"
          onClick={() => safeWindow()?.location.reload()}
        >
          Reload
        </button>
      </div>
    )
  }
}

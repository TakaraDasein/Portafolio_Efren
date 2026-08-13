"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class DashboardErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[DashboardShell] runtime error:", error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="border border-white/10 p-8 w-full max-w-sm space-y-5 text-center">
            <p className="font-mono text-[10px] text-muted-foreground/60 tracking-widest uppercase">
              Algo se interrumpió
            </p>
            <h1 className="font-sans text-2xl font-light">
              Todo está <span className="italic text-white">bien</span>
            </h1>
            <p className="font-mono text-xs text-muted-foreground tracking-wider">
              Ocurrió un error inesperado en el panel. Ya quedó registrado en la consola para revisarlo.
            </p>
            <a
              href="/"
              className="inline-block w-full px-6 py-3 bg-white text-black font-mono text-xs tracking-wider hover:bg-gray-300 transition-colors"
            >
              VOLVER AL INICIO
            </a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

"use client";

import { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Error caught:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center h-full bg-black text-green-500 p-4">
            <div className="text-center">
              <h2 className="text-xl mb-2">⚠️ ERREUR SCÈNE 3D</h2>
              <div className="text-xs text-left bg-gray-900 p-2 rounded max-w-md overflow-auto space-y-2">
                <p className="text-red-400 font-bold">Message:</p>
                <pre className="text-gray-300">{this.state.error?.message}</pre>
                <p className="text-red-400 font-bold">Stack Trace:</p>
                <pre className="text-gray-400 text-[10px] whitespace-pre-wrap">
                  {this.state.error?.stack}
                </pre>
              </div>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="mt-4 px-4 py-2 border border-green-500 hover:bg-green-500/20"
              >
                Réessayer
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

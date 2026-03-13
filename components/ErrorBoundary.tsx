import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col justify-center items-center p-6 text-center">
            <div className="bg-[var(--bg-secondary)] p-8 rounded-2xl shadow-2xl border border-[var(--border-primary)] max-w-md w-full">
                <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Something went wrong</h1>
                <p className="text-[var(--text-secondary)] mb-6 text-sm">
                    An unexpected error occurred in the application. We apologize for the interruption.
                </p>
                <div className="bg-black/20 p-3 rounded text-xs text-left font-mono text-red-300 mb-6 overflow-auto max-h-32">
                    {this.state.error?.message || 'Unknown Error'}
                </div>
                <button
                    onClick={this.handleReload}
                    className="w-full py-3 px-4 bg-[var(--accent-primary)] text-white font-bold rounded-lg hover:bg-[var(--accent-primary-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--accent-primary)]"
                >
                    Reload Game
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
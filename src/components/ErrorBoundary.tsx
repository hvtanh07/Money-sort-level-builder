import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Money Sort App:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.log(e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p4">
          <div className="max-w-lg w-full bg-slate-950/85 p-6 rounded-2xl border border-red-500/50 shadow-2xl space-y-4">
            <h2 className="text-xl font-black text-red-400">Something went wrong during rendering</h2>
            <p className="text-sm text-slate-300">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={this.handleReset}
              className="py-2 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition"
            >
              Clear Local Storage & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

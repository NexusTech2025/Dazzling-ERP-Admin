import React from 'react';

class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Page Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-surface-light dark:bg-surface-dark rounded-2xl border-2 border-dashed border-red-200 dark:border-red-900/30 m-6">
          <div className="size-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h2 className="text-xl font-bold text-text-main dark:text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-text-secondary max-w-md mb-6">
            We encountered an unexpected error while loading this page. This might be due to missing mock data or a connection issue.
          </p>
          <div className="flex gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
            >
              Reload Page
            </button>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="px-6 py-2 text-sm font-bold text-text-secondary hover:text-text-main transition-colors"
            >
              Try Again
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-left overflow-auto max-w-full">
              <p className="text-[10px] font-mono text-red-600 dark:text-red-400 whitespace-pre-wrap">
                {this.state.error?.stack}
              </p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default PageErrorBoundary;

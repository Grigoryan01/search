import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Application error captured by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="mx-auto my-16 max-w-2xl rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm dark:border-red-900 dark:bg-slate-900">
          <h2 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Something went wrong.
          </h2>
          <p className="m-0 text-slate-700 dark:text-slate-300">
            Please refresh the page to continue.
          </p>
        </main>
      );
    }

    return this.props.children;
  }
}

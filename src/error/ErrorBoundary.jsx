import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4">
          <span className="text-6xl">⚠️</span>
          <h1 className="text-2xl font-bold text-gray-800">Something went wrong</h1>
          <p className="text-gray-500 text-sm max-w-md text-center">
            An unexpected error occurred. Please refresh the page or contact support.
          </p>
          {import.meta.env.DEV && (
            <pre className="text-xs text-red-500 bg-red-50 p-4 rounded-lg max-w-xl overflow-auto">
              {this.state.error?.message}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
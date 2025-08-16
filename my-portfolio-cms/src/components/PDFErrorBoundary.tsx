import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class PDFErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PDF ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium mb-2">PDF Component Error</h3>
          <p className="text-red-600 text-sm mb-3">
            The PDF download component encountered an error:
          </p>
          <div className="bg-red-100 border border-red-300 rounded p-2 mb-3">
            <code className="text-red-800 text-xs">{this.state.error?.message}</code>
          </div>
          <p className="text-red-600 text-sm mb-3">
            Common causes:
          </p>
          <ul className="text-red-600 text-sm list-disc list-inside mb-3 space-y-1">
            <li>Internet connection issues (fonts loading from CDN)</li>
            <li>Browser compatibility with @react-pdf/renderer</li>
            <li>Missing or invalid resume data</li>
            <li>Template rendering errors</li>
          </ul>
          <div className="flex gap-2">
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PDFErrorBoundary;

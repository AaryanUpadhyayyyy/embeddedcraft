import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  componentId?: string;
  componentType?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Component rendering error:', {
      componentId: this.props.componentId,
      componentType: this.props.componentType,
      error: error.message,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#FEE2E2',
            border: '2px dashed #EF4444',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minHeight: '60px',
          }}
        >
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <p className="text-sm font-semibold text-red-900">
              Component Error
            </p>
            <p className="text-xs text-red-700">
              {this.props.componentType || 'Component'} failed to render
            </p>
            {this.state.error && (
              <p className="text-xs text-red-600 mt-1">
                {this.state.error.message}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

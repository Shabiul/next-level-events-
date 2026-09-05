import { Component, ErrorInfo, ReactNode } from 'react';
import { trackException } from '../../utils/analytics';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Unhandled App Error]:', error, errorInfo);
    trackException(`${error.name}: ${error.message} \nStack: ${errorInfo.componentStack}`, true);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-[#FFF3E6] text-[#381932] dark:bg-[#381932] dark:text-[#FFF3E6]">
          <div className="rounded-2xl border border-[#381932]/30 bg-[#FFF3E6] p-8 shadow-card max-w-md w-full dark:bg-[#381932] dark:border-[#381932]">
            <h2 className="text-lg font-bold text-[#381932] mb-2 dark:text-[#FFF3E6]">Something went wrong</h2>
            <p className="text-xs text-[#381932] mb-6 dark:text-[#381932]">
              An unexpected error occurred. Please refresh the page to continue.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

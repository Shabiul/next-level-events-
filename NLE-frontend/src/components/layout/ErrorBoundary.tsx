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
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-[#FAFAF8] text-[#1C1C1C] dark:bg-[#121212] dark:text-white">
          <div className="rounded-2xl border border-[#E8E7E3] bg-white p-8 shadow-card max-w-md w-full dark:bg-[#1E1E1E] dark:border-[#2E2E2E]">
            <h2 className="text-lg font-bold text-[#1C1C1C] mb-2 dark:text-white">Something went wrong</h2>
            <p className="text-xs text-[#6F6F6B] mb-6 dark:text-[#A0A09C]">
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

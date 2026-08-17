import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { AIProvider } from '../context/AIContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ErrorBoundary } from '../components/layout/ErrorBoundary';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AIProvider>
            {children}
          </AIProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

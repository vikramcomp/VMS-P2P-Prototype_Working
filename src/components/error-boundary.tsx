"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "@/utils/logger";
import { errorHandler } from "@/utils/error-handler";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: "",
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    logger.error("Error Boundary caught an error", error, {
      errorInfo,
      errorId: this.state.errorId,
      componentStack: errorInfo.componentStack,
    });

    // Call the optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorId: "" });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          className="min-h-screen flex items-center justify-center p-4"
          data-testid="error-boundary-fallback"
        >
          <Card className="w-full max-w-md" data-testid="error-card">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <CardTitle className="text-red-600">
                  Something went wrong
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                {errorHandler.sanitizeErrorMessage(this.state.error)}
              </p>
              <div className="text-sm text-gray-500" data-testid="error-id">
                Error ID: {this.state.errorId}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={this.handleRetry}
                  className="flex items-center space-x-2"
                  data-testid="retry-button"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => globalThis.location.reload()}
                  data-testid="reload-button"
                >
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

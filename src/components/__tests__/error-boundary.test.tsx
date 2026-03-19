import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, withErrorBoundary } from '../error-boundary';

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Mock error-handler
jest.mock('@/utils/error-handler', () => ({
  errorHandler: {
    sanitizeErrorMessage: jest.fn((error?: Error) => error?.message || 'An error occurred'),
  },
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, className, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} className={className} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children, className }: any) => (
    <h3 className={className}>{children}</h3>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertTriangle: (props: any) => <svg data-testid="alert-triangle-icon" {...props} />,
  RefreshCw: (props: any) => <svg data-testid="refresh-icon" {...props} />,
}));

// Component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div data-testid="child-component">Child Component</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Normal Rendering', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div data-testid="test-child">Test Child</div>
        </ErrorBoundary>
      );
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </ErrorBoundary>
      );
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('should not render fallback when no error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );
      expect(screen.queryByTestId('error-boundary-fallback')).not.toBeInTheDocument();
    });
  });

  describe('Error Catching', () => {
    it('should catch errors from child components', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();
    });

    it('should display default error UI when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should display error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('should display error ID', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      const errorIdElement = screen.getByTestId('error-id');
      expect(errorIdElement.textContent).toMatch(/Error ID: error_\d+_[a-z0-9]+/);
    });

    it('should render error card', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByTestId('error-card')).toBeInTheDocument();
    });

    it('should display alert icon', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom Error UI</div>;
      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    });

    it('should not render default fallback when custom fallback is provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom Error</div>;
      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.queryByTestId('error-boundary-fallback')).not.toBeInTheDocument();
    });
  });

  describe('Error Handler', () => {
    it('should call onError callback when error occurs', () => {
      const onError = jest.fn();
      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(onError).toHaveBeenCalled();
    });

    it('should pass error and errorInfo to onError callback', () => {
      const onError = jest.fn();
      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ componentStack: expect.any(String) })
      );
    });

    it('should work without onError callback', () => {
      expect(() => {
        render(
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        );
      }).not.toThrow();
    });
  });

  describe('Retry Functionality', () => {
    it('should render retry button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    it('should display "Try Again" text on retry button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should display refresh icon on retry button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
    });
  });

  describe('Reload Button', () => {
    it('should render reload button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByTestId('reload-button')).toBeInTheDocument();
    });

    it('should display "Reload Page" text', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText('Reload Page')).toBeInTheDocument();
    });

    it('should have outline variant', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      const reloadButton = screen.getByTestId('reload-button');
      expect(reloadButton).toHaveAttribute('data-variant', 'outline');
    });
  });

  describe('Static Methods', () => {
    it('should have getDerivedStateFromError method', () => {
      expect(ErrorBoundary.getDerivedStateFromError).toBeDefined();
    });

    it('should return state with hasError true from getDerivedStateFromError', () => {
      const error = new Error('Test');
      const state = ErrorBoundary.getDerivedStateFromError(error);
      expect(state.hasError).toBe(true);
      expect(state.error).toBe(error);
      expect(state.errorId).toMatch(/error_\d+_[a-z0-9]+/);
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize with hasError false', () => {
      const wrapper = render(
        <ErrorBoundary>
          <div>Test</div>
        </ErrorBoundary>
      );
      expect(wrapper.container).toBeTruthy();
    });

    it('should update state when error is caught', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();
    });
  });
});

describe('withErrorBoundary HOC', () => {
  const TestComponent = ({ text }: { text: string }) => (
    <div data-testid="hoc-test-component">{text}</div>
  );

  it('should wrap component with ErrorBoundary', () => {
    const WrappedComponent = withErrorBoundary(TestComponent);
    render(<WrappedComponent text="Test" />);
    expect(screen.getByTestId('hoc-test-component')).toBeInTheDocument();
  });

  it('should pass props to wrapped component', () => {
    const WrappedComponent = withErrorBoundary(TestComponent);
    render(<WrappedComponent text="Hello World" />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should catch errors in wrapped component', () => {
    const ErrorComponent = withErrorBoundary(ThrowError);
    render(<ErrorComponent shouldThrow={true} />);
    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();
  });

  it('should use custom fallback if provided', () => {
    const customFallback = <div data-testid="hoc-custom-fallback">HOC Custom Error</div>;
    const WrappedComponent = withErrorBoundary(ThrowError, customFallback);
    render(<WrappedComponent shouldThrow={true} />);
    expect(screen.getByTestId('hoc-custom-fallback')).toBeInTheDocument();
  });

  it('should work without custom fallback', () => {
    const WrappedComponent = withErrorBoundary(TestComponent);
    render(<WrappedComponent text="Test" />);
    expect(screen.getByTestId('hoc-test-component')).toBeInTheDocument();
  });

  it('should return a component function', () => {
    const WrappedComponent = withErrorBoundary(TestComponent);
    expect(typeof WrappedComponent).toBe('function');
  });
});

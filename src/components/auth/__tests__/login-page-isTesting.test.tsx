import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import LoginPage from '../login-page';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock useToast
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock authService
const mockLogin = jest.fn();
const mockForgotPassword = jest.fn();
jest.mock('@/services/auth-service', () => ({
  authService: {
    login: (...args: any[]) => mockLogin(...args),
    forgotPassword: (...args: any[]) => mockForgotPassword(...args),
  },
}));

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, disabled, className, ...props }: any) => (
    <button onClick={onClick} type={type} disabled={disabled} className={className} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <div data-testid="separator" />,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Eye: () => <svg data-testid="eye-icon" />,
  EyeOff: () => <svg data-testid="eye-off-icon" />,
  Lock: () => <svg data-testid="lock-icon" />,
  User: () => <svg data-testid="user-icon" />,
  Loader2: ({ className }: any) => <svg data-testid="loader-icon" className={className} />,
  Mail: () => <svg data-testid="mail-icon" />,
  ArrowLeft: () => <svg data-testid="arrow-left-icon" />,
}));

describe('LoginPage - isTesting prop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('isTesting=true', () => {
    it('should render with isTesting=true', async () => {
      render(<LoginPage isTesting={true} />);
      jest.runAllTimers();
      
      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });

    it('should have all interactive elements accessible when isTesting=true', async () => {
      render(<LoginPage isTesting={true} />);
      jest.runAllTimers();
      
      await waitFor(() => {
        expect(screen.getByTestId('sso-button')).toBeInTheDocument();
        expect(screen.getByTestId('username-input')).toBeInTheDocument();
        expect(screen.getByTestId('password-input')).toBeInTheDocument();
        expect(screen.getByTestId('toggle-password-button')).toBeInTheDocument();
        expect(screen.getByTestId('remember-me-checkbox')).toBeInTheDocument();
        expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument();
        expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
      });
    });
  });

  describe('isTesting=false', () => {
    it('should render with isTesting=false', async () => {
      render(<LoginPage isTesting={false} />);
      jest.runAllTimers();
      
      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });

    it('should have all interactive elements accessible when isTesting=false', async () => {
      render(<LoginPage isTesting={false} />);
      jest.runAllTimers();
      
      await waitFor(() => {
        expect(screen.getByTestId('sso-button')).toBeInTheDocument();
        expect(screen.getByTestId('username-input')).toBeInTheDocument();
        expect(screen.getByTestId('password-input')).toBeInTheDocument();
        expect(screen.getByTestId('toggle-password-button')).toBeInTheDocument();
        expect(screen.getByTestId('remember-me-checkbox')).toBeInTheDocument();
        expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument();
        expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
      });
    });
  });

  describe('Default behavior', () => {
    it('should render without props', async () => {
      render(<LoginPage />);
      jest.runAllTimers();
      
      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });

    it('should have all interactive elements accessible by default', async () => {
      render(<LoginPage />);
      jest.runAllTimers();
      
      await waitFor(() => {
        expect(screen.getByTestId('sso-button')).toBeInTheDocument();
        expect(screen.getByTestId('username-input')).toBeInTheDocument();
        expect(screen.getByTestId('password-input')).toBeInTheDocument();
        expect(screen.getByTestId('toggle-password-button')).toBeInTheDocument();
        expect(screen.getByTestId('remember-me-checkbox')).toBeInTheDocument();
        expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument();
        expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
      });
    });
  });
});

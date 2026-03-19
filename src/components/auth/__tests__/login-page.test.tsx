import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('LoginPage', () => {
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

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      render(<LoginPage />);
      jest.runAllTimers();
      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });

    it('should render SSO button', async () => {
      render(<LoginPage />);
      jest.runAllTimers();
      await waitFor(() => {
        expect(screen.getByTestId('sso-button')).toBeInTheDocument();
      });
    });

    it('should render username input', async () => {
      render(<LoginPage />);
      jest.runAllTimers();
      await waitFor(() => {
        expect(screen.getByTestId('username-input')).toBeInTheDocument();
      });
    });

    it('should render password input', async () => {
      render(<LoginPage />);
      jest.runAllTimers();
      await waitFor(() => {
        expect(screen.getByTestId('password-input')).toBeInTheDocument();
      });
    });

    it('should render login submit button', async () => {
      render(<LoginPage />);
      jest.runAllTimers();
      await waitFor(() => {
        expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
      });
    });

    it('should render remember me checkbox', async () => {
      render(<LoginPage />);
      jest.runAllTimers();
      await waitFor(() => {
        expect(screen.getByTestId('remember-me-checkbox')).toBeInTheDocument();
      });
    });

    it('should render forgot password link', async () => {
      render(<LoginPage />);
      jest.runAllTimers();
      await waitFor(() => {
        expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument();
      });
    });
  });

  describe('Form Input', () => {
    it('should update username field when typing', async () => {
      render(<LoginPage />);
      jest.runAllTimers();
      
      await waitFor(() => {
        const usernameInput = screen.getByTestId('username-input') as HTMLInputElement;
        fireEvent.change(usernameInput, { target: { value: 'test@example.com' } });
        expect(usernameInput.value).toBe('test@example.com');
      });
    });

    it('should update password field when typing', async () => {
      render(<LoginPage />);
      jest.runAllTimers();
      
      await waitFor(() => {
        const passwordInput = screen.getByTestId('password-input') as HTMLInputElement;
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        expect(passwordInput.value).toBe('password123');
      });
    });

    it('should toggle password visibility', async () => {
      render(<LoginPage />);
      jest.runAllTimers();
      
      await waitFor(() => {
        const passwordInput = screen.getByTestId('password-input') as HTMLInputElement;
        const toggleButton = screen.getByTestId('toggle-password-button');
        
        expect(passwordInput.type).toBe('password');
        
        fireEvent.click(toggleButton);
        expect(passwordInput.type).toBe('text');
        
        fireEvent.click(toggleButton);
        expect(passwordInput.type).toBe('password');
      });
    });
  });

  describe('Remember Me', () => {
    it('should toggle remember me checkbox', async () => {
      render(<LoginPage />);
      jest.runAllTimers();
      
      await waitFor(() => {
        const checkbox = screen.getByTestId('remember-me-checkbox') as HTMLInputElement;
        expect(checkbox.checked).toBe(false);
        
        fireEvent.click(checkbox);
        expect(checkbox.checked).toBe(true);
      });
    });

    it('should save email to localStorage when remember me is checked', async () => {
      render(<LoginPage />);
      jest.runAllTimers();
      
      await waitFor(() => {
        const usernameInput = screen.getByTestId('username-input');
        const checkbox = screen.getByTestId('remember-me-checkbox');
        
        fireEvent.change(usernameInput, { target: { value: 'test@example.com' } });
        fireEvent.click(checkbox);
        
        expect(localStorage.getItem('rememberedEmail')).toBe('test@example.com');
        expect(localStorage.getItem('rememberMe')).toBe('true');
      });
    });

    it('should load saved email on mount', async () => {
      localStorage.setItem('rememberedEmail', 'saved@example.com');
      localStorage.setItem('rememberMe', 'true');
      
      render(<LoginPage />);
      jest.runAllTimers();
      
      await waitFor(() => {
        const usernameInput = screen.getByTestId('username-input') as HTMLInputElement;
        expect(usernameInput.value).toBe('saved@example.com');
      });
    });
  });

  describe('Login Submission', () => {
    it('should call authService.login on form submit with valid credentials', async () => {
      mockLogin.mockResolvedValue({ success: true });
      
      render(<LoginPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('username-input')).toBeInTheDocument();
      });
      
      const usernameInput = screen.getByTestId('username-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('login-submit-button');
      
      fireEvent.change(usernameInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          UserName: 'test@example.com',
          Password: 'password123',
        });
      });
    });
  });

  describe('Microsoft SSO', () => {
    it('should call SSO handler on button click', async () => {
      render(<LoginPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('sso-button')).toBeInTheDocument();
      });
      
      const ssoButton = screen.getByTestId('sso-button');
      fireEvent.click(ssoButton);
      
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Microsoft SSO',
        })
      );
    });
  });

  describe('Forgot Password Flow', () => {
    it('should switch to forgot password view when link is clicked', async () => {
      render(<LoginPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument();
      });
      
      const forgotLink = screen.getByTestId('forgot-password-link');
      fireEvent.click(forgotLink);
      
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByTestId('forgot-email-input')).toBeInTheDocument();
      });
    });

    it('should submit forgot password with valid email', async () => {
      mockForgotPassword.mockResolvedValue({ success: true, message: 'Reset link sent' });
      
      render(<LoginPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByTestId('forgot-password-link'));
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByTestId('forgot-email-input')).toBeInTheDocument();
      });
      
      const emailInput = screen.getByTestId('forgot-email-input');
      const submitButton = screen.getByTestId('forgot-password-submit-button');
      
      fireEvent.change(emailInput, { target: { value: 'reset@example.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockForgotPassword).toHaveBeenCalledWith({
          LoginId: 'reset@example.com',
        });
      });
    });



    it('should handle forgot password API failure', async () => {
      mockForgotPassword.mockResolvedValue({ success: false, message: 'User not found' });
      
      render(<LoginPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByTestId('forgot-password-link'));
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByTestId('forgot-email-input')).toBeInTheDocument();
      });
      
      const emailInput = screen.getByTestId('forgot-email-input');
      const submitButton = screen.getByTestId('forgot-password-submit-button');
      
      fireEvent.change(emailInput, { target: { value: 'notfound@example.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            variant: 'destructive',
          })
        );
      });
    });

    it('should handle forgot password network error', async () => {
      mockForgotPassword.mockRejectedValue(new Error('Network error'));
      
      render(<LoginPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByTestId('forgot-password-link'));
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByTestId('forgot-email-input')).toBeInTheDocument();
      });
      
      const emailInput = screen.getByTestId('forgot-email-input');
      const submitButton = screen.getByTestId('forgot-password-submit-button');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: 'Failed to send reset link. Please try again.',
            variant: 'destructive',
          })
        );
      });
    });

    it('should navigate back to login form', async () => {
      render(<LoginPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByTestId('forgot-password-link'));
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByTestId('back-to-login-button')).toBeInTheDocument();
      });
      
      const backButton = screen.getByTestId('back-to-login-button');
      fireEvent.click(backButton);
      
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle login network error', async () => {
      mockLogin.mockRejectedValue(new Error('Network error'));
      
      render(<LoginPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('username-input')).toBeInTheDocument();
      });
      
      const usernameInput = screen.getByTestId('username-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('login-submit-button');
      
      fireEvent.change(usernameInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Login Error',
            description: 'An unexpected error occurred. Please try again.',
            variant: 'destructive',
          })
        );
      });
    });

    it('should handle failed login response', async () => {
      mockLogin.mockResolvedValue({ success: false, message: 'Invalid credentials' });
      
      render(<LoginPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('username-input')).toBeInTheDocument();
      });
      
      const usernameInput = screen.getByTestId('username-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('login-submit-button');
      
      fireEvent.change(usernameInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Authentication Failed',
            variant: 'destructive',
          })
        );
      });
    });
  });

  describe('Existence Tests', () => {
    it('should be defined', () => {
      expect(LoginPage).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof LoginPage).toBe('function');
    });
  });
});

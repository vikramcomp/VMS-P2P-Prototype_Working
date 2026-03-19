import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthGuard } from '../auth-guard';

// Mock next/navigation
const mockPush = jest.fn();
const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockUsePathname(),
}));

// Mock authService
const mockGetToken = jest.fn();
const mockValidateToken = jest.fn();
jest.mock('@/services/auth-service', () => ({
  authService: {
    getToken: () => mockGetToken(),
    validateToken: () => mockValidateToken(),
  },
}));

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Public Routes', () => {
    it('should render children for /login route without authentication check', async () => {
      mockUsePathname.mockReturnValue('/login');
      
      render(
        <AuthGuard>
          <div data-testid="child-content">Login Page</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-guard-public')).toBeInTheDocument();
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
      });

      expect(mockGetToken).not.toHaveBeenCalled();
      expect(mockValidateToken).not.toHaveBeenCalled();
    });

    it('should render children for /register route', async () => {
      mockUsePathname.mockReturnValue('/register');
      
      render(
        <AuthGuard>
          <div data-testid="child-content">Register Page</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-guard-public')).toBeInTheDocument();
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
      });
    });

    it('should render children for /forgot-password route', async () => {
      mockUsePathname.mockReturnValue('/forgot-password');
      
      render(
        <AuthGuard>
          <div data-testid="child-content">Forgot Password</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-guard-public')).toBeInTheDocument();
      });
    });

    it('should render children for /toast-demo route', async () => {
      mockUsePathname.mockReturnValue('/toast-demo');
      
      render(
        <AuthGuard>
          <div data-testid="child-content">Toast Demo</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-guard-public')).toBeInTheDocument();
      });
    });

    it('should render children for /validation-demo route', async () => {
      mockUsePathname.mockReturnValue('/validation-demo');
      
      render(
        <AuthGuard>
          <div data-testid="child-content">Validation Demo</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-guard-public')).toBeInTheDocument();
      });
    });

    it('should render children for /auth-test route', async () => {
      mockUsePathname.mockReturnValue('/auth-test');
      
      render(
        <AuthGuard>
          <div data-testid="child-content">Auth Test</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-guard-public')).toBeInTheDocument();
      });
    });

    it('should render children for /auth-debug route', async () => {
      mockUsePathname.mockReturnValue('/auth-debug');
      
      render(
        <AuthGuard>
          <div data-testid="child-content">Auth Debug</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-guard-public')).toBeInTheDocument();
      });
    });
  });

  describe('Protected Routes - No Token', () => {
    it('should redirect to login when token is not present', async () => {
      mockUsePathname.mockReturnValue('/dashboard');
      mockGetToken.mockReturnValue(null);
      
      render(
        <AuthGuard>
          <div data-testid="child-content">Protected Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(mockGetToken).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should redirect to login for /profile when no token', async () => {
      mockUsePathname.mockReturnValue('/profile');
      mockGetToken.mockReturnValue(null);
      
      render(
        <AuthGuard>
          <div data-testid="child-content">Profile</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should redirect to login for /users when no token', async () => {
      mockUsePathname.mockReturnValue('/users');
      mockGetToken.mockReturnValue(null);
      
      render(
        <AuthGuard>
          <div data-testid="child-content">Users</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Protected Routes - Valid Token', () => {
    it('should render children when token is valid', async () => {
      mockUsePathname.mockReturnValue('/dashboard');
      mockGetToken.mockReturnValue('valid-token');
      mockValidateToken.mockResolvedValue(true);
      
      render(
        <AuthGuard>
          <div data-testid="child-content">Protected Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(mockGetToken).toHaveBeenCalled();
        expect(mockValidateToken).toHaveBeenCalled();
        expect(screen.getByTestId('auth-guard-authenticated')).toBeInTheDocument();
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
      });
    });

    it('should render children for /profile with valid token', async () => {
      mockUsePathname.mockReturnValue('/profile');
      mockGetToken.mockReturnValue('valid-token');
      mockValidateToken.mockResolvedValue(true);
      
      render(
        <AuthGuard>
          <div data-testid="child-content">Profile</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-guard-authenticated')).toBeInTheDocument();
      });
    });

    it('should render children for /users with valid token', async () => {
      mockUsePathname.mockReturnValue('/users');
      mockGetToken.mockReturnValue('valid-token');
      mockValidateToken.mockResolvedValue(true);
      
      render(
        <AuthGuard>
          <div data-testid="child-content">Users</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-guard-authenticated')).toBeInTheDocument();
      });
    });
  });

  describe('Protected Routes - Invalid Token', () => {
    it('should redirect to login when token is invalid', async () => {
      mockUsePathname.mockReturnValue('/dashboard');
      mockGetToken.mockReturnValue('invalid-token');
      mockValidateToken.mockResolvedValue(false);
      
      render(
        <AuthGuard>
          <div data-testid="child-content">Protected Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(mockGetToken).toHaveBeenCalled();
        expect(mockValidateToken).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should redirect to login for /profile with invalid token', async () => {
      mockUsePathname.mockReturnValue('/profile');
      mockGetToken.mockReturnValue('expired-token');
      mockValidateToken.mockResolvedValue(false);
      
      render(
        <AuthGuard>
          <div data-testid="child-content">Profile</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should redirect to login for /users with invalid token', async () => {
      mockUsePathname.mockReturnValue('/users');
      mockGetToken.mockReturnValue('bad-token');
      mockValidateToken.mockResolvedValue(false);
      
      render(
        <AuthGuard>
          <div data-testid="child-content">Users</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner while checking authentication', () => {
      mockUsePathname.mockReturnValue('/dashboard');
      mockGetToken.mockReturnValue('token');
      mockValidateToken.mockReturnValue(new Promise(() => {})); // Never resolves
      
      render(
        <AuthGuard>
          <div data-testid="child-content">Content</div>
        </AuthGuard>
      );

      expect(screen.getByTestId('auth-guard-loading')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
    });

    it('should hide loading spinner after authentication check', async () => {
      mockUsePathname.mockReturnValue('/dashboard');
      mockGetToken.mockReturnValue('valid-token');
      mockValidateToken.mockResolvedValue(true);
      
      render(
        <AuthGuard>
          <div data-testid="child-content">Content</div>
        </AuthGuard>
      );

      expect(screen.getByTestId('auth-guard-loading')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByTestId('auth-guard-loading')).not.toBeInTheDocument();
      });
    });
  });

  describe('Props Handling', () => {
    it('should accept isTesting prop as false', async () => {
      mockUsePathname.mockReturnValue('/login');
      
      render(
        <AuthGuard isTesting={false}>
          <div data-testid="child-content">Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-guard-public')).toBeInTheDocument();
      });
    });

    it('should accept isTesting prop as true', async () => {
      mockUsePathname.mockReturnValue('/login');
      
      render(
        <AuthGuard isTesting={true}>
          <div data-testid="child-content">Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-guard-public')).toBeInTheDocument();
      });
    });

    it('should work without isTesting prop', async () => {
      mockUsePathname.mockReturnValue('/login');
      
      render(
        <AuthGuard>
          <div data-testid="child-content">Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-guard-public')).toBeInTheDocument();
      });
    });
  });

  describe('Existence Tests', () => {
    it('should be defined', () => {
      expect(AuthGuard).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof AuthGuard).toBe('function');
    });
  });
});

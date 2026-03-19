import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthTestPage from '../page';

// Mock authService
const mockIsAuthenticated = jest.fn();
const mockGetUser = jest.fn();
const mockGetToken = jest.fn();
const mockLogout = jest.fn();

jest.mock('@/services/auth-service', () => ({
  authService: {
    isAuthenticated: () => mockIsAuthenticated(),
    getUser: () => mockGetUser(),
    getToken: () => mockGetToken(),
    logout: () => mockLogout(),
  },
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} data-size={size} className={className} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children, className }: any) => <h3 className={className}>{children}</h3>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CheckCircle: (props: any) => <svg data-testid="check-circle-icon" {...props} />,
  XCircle: (props: any) => <svg data-testid="x-circle-icon" {...props} />,
  Shield: (props: any) => <svg data-testid="shield-icon" {...props} />,
  Key: (props: any) => <svg data-testid="key-icon" {...props} />,
}));

describe('AuthTestPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering - Authenticated User', () => {
    beforeEach(() => {
      mockIsAuthenticated.mockReturnValue(true);
      mockGetUser.mockReturnValue({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
      });
      mockGetToken.mockReturnValue('mock-jwt-token-1234567890');
    });

    it('should render without crashing', () => {
      render(<AuthTestPage />);
      expect(screen.getByTestId('auth-test-page')).toBeInTheDocument();
    });

    it('should display page title', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('Authentication Status Test')).toBeInTheDocument();
    });

    it('should show authenticated status', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('Authenticated')).toBeInTheDocument();
    });

    it('should display check circle icon when authenticated', () => {
      render(<AuthTestPage />);
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    });

    it('should display "Logged In" status', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('Logged In')).toBeInTheDocument();
    });

    it('should display token present as "Yes"', () => {
      render(<AuthTestPage />);
      const tokenYes = screen.getAllByText('Yes');
      expect(tokenYes.length).toBeGreaterThan(0);
    });

    it('should render logout button when authenticated', () => {
      render(<AuthTestPage />);
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    });

    it('should display user ID', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('should display user email', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should display user name', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should display user role', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('admin')).toBeInTheDocument();
    });

    it('should display truncated token', () => {
      render(<AuthTestPage />);
      expect(screen.getByText(/mock-jwt-token-1234567890/)).toBeInTheDocument();
    });
  });

  describe('Rendering - Non-Authenticated User', () => {
    beforeEach(() => {
      mockIsAuthenticated.mockReturnValue(false);
      mockGetUser.mockReturnValue(null);
      mockGetToken.mockReturnValue(null);
    });

    it('should render without crashing', () => {
      render(<AuthTestPage />);
      expect(screen.getByTestId('auth-test-page')).toBeInTheDocument();
    });

    it('should show not authenticated status', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('Not Authenticated')).toBeInTheDocument();
    });

    it('should display X circle icon when not authenticated', () => {
      render(<AuthTestPage />);
      expect(screen.getByTestId('x-circle-icon')).toBeInTheDocument();
    });

    it('should display "Logged Out" status', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('Logged Out')).toBeInTheDocument();
    });

    it('should display token present as "No"', () => {
      render(<AuthTestPage />);
      const tokenNo = screen.getAllByText('No');
      expect(tokenNo.length).toBeGreaterThan(0);
    });

    it('should not render logout button when not authenticated', () => {
      render(<AuthTestPage />);
      expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();
    });

    it('should display "No user data available" message', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('No user data available')).toBeInTheDocument();
    });

    it('should display "No authentication token found" message', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('No authentication token found')).toBeInTheDocument();
    });
  });

  describe('Logout Functionality', () => {
    beforeEach(() => {
      mockIsAuthenticated.mockReturnValue(true);
      mockGetUser.mockReturnValue({ id: '123', email: 'test@example.com' });
      mockGetToken.mockReturnValue('token');
    });

    it('should call logout when logout button is clicked', () => {
      render(<AuthTestPage />);
      const logoutButton = screen.getByTestId('logout-button');
      fireEvent.click(logoutButton);
      expect(mockLogout).toHaveBeenCalled();
    });

    it('should call logout exactly once per click', () => {
      render(<AuthTestPage />);
      const logoutButton = screen.getByTestId('logout-button');
      fireEvent.click(logoutButton);
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Icons', () => {
    it('should display shield icon', () => {
      mockIsAuthenticated.mockReturnValue(false);
      mockGetUser.mockReturnValue(null);
      mockGetToken.mockReturnValue(null);
      render(<AuthTestPage />);
      expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
    });

    it('should display key icon', () => {
      mockIsAuthenticated.mockReturnValue(false);
      mockGetUser.mockReturnValue(null);
      mockGetToken.mockReturnValue(null);
      render(<AuthTestPage />);
      expect(screen.getByTestId('key-icon')).toBeInTheDocument();
    });
  });

  describe('Card Sections', () => {
    beforeEach(() => {
      mockIsAuthenticated.mockReturnValue(false);
      mockGetUser.mockReturnValue(null);
      mockGetToken.mockReturnValue(null);
    });

    it('should display User Information card title', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('User Information')).toBeInTheDocument();
    });

    it('should display Token Information card title', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('Token Information')).toBeInTheDocument();
    });

    it('should display Test Protected Routes card title', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('Test Protected Routes')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    beforeEach(() => {
      mockIsAuthenticated.mockReturnValue(false);
      mockGetUser.mockReturnValue(null);
      mockGetToken.mockReturnValue(null);
    });

    it('should render Dashboard button', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should render Groups button', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('Groups')).toBeInTheDocument();
    });

    it('should render Users button', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    beforeEach(() => {
      mockIsAuthenticated.mockReturnValue(false);
      mockGetUser.mockReturnValue(null);
      mockGetToken.mockReturnValue(null);
    });

    it('should accept isTesting prop as false', () => {
      render(<AuthTestPage isTesting={false} />);
      expect(screen.getByTestId('auth-test-page')).toBeInTheDocument();
    });

    it('should accept isTesting prop as true', () => {
      render(<AuthTestPage isTesting={true} />);
      expect(screen.getByTestId('auth-test-page')).toBeInTheDocument();
    });

    it('should handle undefined isTesting prop', () => {
      render(<AuthTestPage isTesting={undefined} />);
      expect(screen.getByTestId('auth-test-page')).toBeInTheDocument();
    });

    it('should work without any props', () => {
      render(<AuthTestPage />);
      expect(screen.getByTestId('auth-test-page')).toBeInTheDocument();
    });
  });

  describe('User with loginId instead of email', () => {
    beforeEach(() => {
      mockIsAuthenticated.mockReturnValue(true);
      mockGetUser.mockReturnValue({
        id: '456',
        loginId: 'user123',
        name: 'Login User',
        role: 'user',
      });
      mockGetToken.mockReturnValue('token');
    });

    it('should display loginId when email is not available', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('user123')).toBeInTheDocument();
    });
  });

  describe('User with partial data', () => {
    beforeEach(() => {
      mockIsAuthenticated.mockReturnValue(true);
      mockGetUser.mockReturnValue({
        id: '789',
      });
      mockGetToken.mockReturnValue('token');
    });

    it('should display N/A for missing fields', () => {
      render(<AuthTestPage />);
      const naElements = screen.getAllByText('N/A');
      expect(naElements.length).toBeGreaterThan(0);
    });
  });

  describe('Consistency', () => {
    beforeEach(() => {
      mockIsAuthenticated.mockReturnValue(false);
      mockGetUser.mockReturnValue(null);
      mockGetToken.mockReturnValue(null);
    });

    it('should render consistently on multiple calls', () => {
      const { rerender } = render(<AuthTestPage />);
      expect(screen.getByTestId('auth-test-page')).toBeInTheDocument();
      
      rerender(<AuthTestPage />);
      expect(screen.getByTestId('auth-test-page')).toBeInTheDocument();
    });

    it('should maintain structure on re-render', () => {
      const { rerender } = render(<AuthTestPage />);
      const firstRender = screen.getByTestId('auth-test-page');
      
      rerender(<AuthTestPage />);
      const secondRender = screen.getByTestId('auth-test-page');
      
      expect(firstRender).toBeTruthy();
      expect(secondRender).toBeTruthy();
    });
  });

  describe('Existence Tests', () => {
    it('should be defined', () => {
      expect(AuthTestPage).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof AuthTestPage).toBe('function');
    });
  });
});

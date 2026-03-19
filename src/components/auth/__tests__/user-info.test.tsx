import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { UserInfo } from '../user-info';

// Mock authService
const mockIsAuthenticated = jest.fn();
const mockGetUser = jest.fn();
jest.mock('@/services/auth-service', () => ({
  authService: {
    isAuthenticated: () => mockIsAuthenticated(),
    getUser: () => mockGetUser(),
  },
}));

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardTitle: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  User: () => <svg data-testid="user-icon" />,
  Mail: () => <svg data-testid="mail-icon" />,
  Shield: () => <svg data-testid="shield-icon" />,
}));

describe('UserInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authenticated User', () => {
    it('should render user information when authenticated', async () => {
      const mockUser = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'admin',
        loginId: 'john.doe',
      };

      mockIsAuthenticated.mockReturnValue(true);
      mockGetUser.mockReturnValue(mockUser);

      render(<UserInfo />);

      await waitFor(() => {
        expect(screen.getByTestId('user-info-card')).toBeInTheDocument();
      });

      expect(screen.getByText('User Information')).toBeInTheDocument();
      expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe');
      expect(screen.getByTestId('user-email')).toHaveTextContent('john.doe@example.com');
      expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
      expect(screen.getByTestId('user-login-id')).toHaveTextContent('john.doe');
    });

    it('should render with different user data', async () => {
      const mockUser = {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'user',
        loginId: 'jane.smith',
      };

      mockIsAuthenticated.mockReturnValue(true);
      mockGetUser.mockReturnValue(mockUser);

      render(<UserInfo />);

      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toHaveTextContent('Jane Smith');
        expect(screen.getByTestId('user-email')).toHaveTextContent('jane.smith@example.com');
        expect(screen.getByTestId('user-role')).toHaveTextContent('user');
        expect(screen.getByTestId('user-login-id')).toHaveTextContent('jane.smith');
      });
    });

    it('should render with manager role', async () => {
      const mockUser = {
        name: 'Bob Manager',
        email: 'bob@example.com',
        role: 'manager',
        loginId: 'bob.manager',
      };

      mockIsAuthenticated.mockReturnValue(true);
      mockGetUser.mockReturnValue(mockUser);

      render(<UserInfo />);

      await waitFor(() => {
        expect(screen.getByTestId('user-role')).toHaveTextContent('manager');
      });
    });

    it('should render with vendor role', async () => {
      const mockUser = {
        name: 'Vendor User',
        email: 'vendor@example.com',
        role: 'vendor',
        loginId: 'vendor.user',
      };

      mockIsAuthenticated.mockReturnValue(true);
      mockGetUser.mockReturnValue(mockUser);

      render(<UserInfo />);

      await waitFor(() => {
        expect(screen.getByTestId('user-role')).toHaveTextContent('vendor');
      });
    });

    it('should render all icons', async () => {
      const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        loginId: 'test.user',
      };

      mockIsAuthenticated.mockReturnValue(true);
      mockGetUser.mockReturnValue(mockUser);

      render(<UserInfo />);

      await waitFor(() => {
        const userIcons = screen.getAllByTestId('user-icon');
        expect(userIcons.length).toBeGreaterThan(0);
        expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
        expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
      });
    });

    it('should display name label', async () => {
      const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        loginId: 'test.user',
      };

      mockIsAuthenticated.mockReturnValue(true);
      mockGetUser.mockReturnValue(mockUser);

      render(<UserInfo />);

      await waitFor(() => {
        expect(screen.getByText('Name:')).toBeInTheDocument();
      });
    });

    it('should display email label', async () => {
      const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        loginId: 'test.user',
      };

      mockIsAuthenticated.mockReturnValue(true);
      mockGetUser.mockReturnValue(mockUser);

      render(<UserInfo />);

      await waitFor(() => {
        expect(screen.getByText('Email:')).toBeInTheDocument();
      });
    });

    it('should display role label', async () => {
      const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        loginId: 'test.user',
      };

      mockIsAuthenticated.mockReturnValue(true);
      mockGetUser.mockReturnValue(mockUser);

      render(<UserInfo />);

      await waitFor(() => {
        expect(screen.getByText('Role:')).toBeInTheDocument();
      });
    });

    it('should display login ID label', async () => {
      const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        loginId: 'test.user',
      };

      mockIsAuthenticated.mockReturnValue(true);
      mockGetUser.mockReturnValue(mockUser);

      render(<UserInfo />);

      await waitFor(() => {
        expect(screen.getByText('Login ID:')).toBeInTheDocument();
      });
    });
  });

  describe('Unauthenticated User', () => {
    it('should not render when user is not authenticated', () => {
      mockIsAuthenticated.mockReturnValue(false);
      mockGetUser.mockReturnValue(null);

      const { container } = render(<UserInfo />);

      expect(container.firstChild).toBeNull();
    });

    it('should not render when authenticated but no user data', () => {
      mockIsAuthenticated.mockReturnValue(true);
      mockGetUser.mockReturnValue(null);

      const { container } = render(<UserInfo />);

      expect(container.firstChild).toBeNull();
    });

    it('should not render when not authenticated but has user data', () => {
      mockIsAuthenticated.mockReturnValue(false);
      mockGetUser.mockReturnValue({
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        loginId: 'test.user',
      });

      const { container } = render(<UserInfo />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Props Handling', () => {
    it('should accept isTesting prop as false', async () => {
      const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        loginId: 'test.user',
      };

      mockIsAuthenticated.mockReturnValue(true);
      mockGetUser.mockReturnValue(mockUser);

      render(<UserInfo isTesting={false} />);

      await waitFor(() => {
        expect(screen.getByTestId('user-info-card')).toBeInTheDocument();
      });
    });

    it('should accept isTesting prop as true', async () => {
      const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        loginId: 'test.user',
      };

      mockIsAuthenticated.mockReturnValue(true);
      mockGetUser.mockReturnValue(mockUser);

      render(<UserInfo isTesting={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('user-info-card')).toBeInTheDocument();
      });
    });

    it('should work without isTesting prop', async () => {
      const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        loginId: 'test.user',
      };

      mockIsAuthenticated.mockReturnValue(true);
      mockGetUser.mockReturnValue(mockUser);

      render(<UserInfo />);

      await waitFor(() => {
        expect(screen.getByTestId('user-info-card')).toBeInTheDocument();
      });
    });
  });

  describe('User Data Variations', () => {
    it('should handle user with minimal data', async () => {
      const mockUser = {
        name: 'Min User',
        email: 'min@example.com',
        role: 'user',
        loginId: 'min',
      };

      mockIsAuthenticated.mockReturnValue(true);
      mockGetUser.mockReturnValue(mockUser);

      render(<UserInfo />);

      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toHaveTextContent('Min User');
        expect(screen.getByTestId('user-email')).toHaveTextContent('min@example.com');
        expect(screen.getByTestId('user-role')).toHaveTextContent('user');
        expect(screen.getByTestId('user-login-id')).toHaveTextContent('min');
      });
    });

    it('should handle user with long email', async () => {
      const mockUser = {
        name: 'Test User',
        email: 'very.long.email.address@example.company.com',
        role: 'admin',
        loginId: 'test.user',
      };

      mockIsAuthenticated.mockReturnValue(true);
      mockGetUser.mockReturnValue(mockUser);

      render(<UserInfo />);

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('very.long.email.address@example.company.com');
      });
    });

    it('should capitalize role', async () => {
      const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'supervisor',
        loginId: 'test.user',
      };

      mockIsAuthenticated.mockReturnValue(true);
      mockGetUser.mockReturnValue(mockUser);

      render(<UserInfo />);

      await waitFor(() => {
        const roleElement = screen.getByTestId('user-role');
        expect(roleElement).toHaveTextContent('supervisor');
        // Check if capitalize class is present
        expect(roleElement.querySelector('.capitalize')).toBeInTheDocument();
      });
    });
  });

  describe('Existence Tests', () => {
    it('should be defined', () => {
      expect(UserInfo).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof UserInfo).toBe('function');
    });
  });
});

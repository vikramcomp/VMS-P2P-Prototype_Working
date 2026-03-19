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

describe('UserInfo - isTesting prop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isTesting=true', () => {
    it('should render with isTesting=true when authenticated', async () => {
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
        expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
        expect(screen.getByTestId('user-login-id')).toHaveTextContent('test.user');
      });
    });

    it('should not render with isTesting=true when not authenticated', () => {
      mockIsAuthenticated.mockReturnValue(false);
      mockGetUser.mockReturnValue(null);

      const { container } = render(<UserInfo isTesting={true} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('isTesting=false', () => {
    it('should render with isTesting=false when authenticated', async () => {
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
        expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
        expect(screen.getByTestId('user-login-id')).toHaveTextContent('test.user');
      });
    });

    it('should not render with isTesting=false when not authenticated', () => {
      mockIsAuthenticated.mockReturnValue(false);
      mockGetUser.mockReturnValue(null);

      const { container } = render(<UserInfo isTesting={false} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Default behavior', () => {
    it('should render without isTesting prop when authenticated', async () => {
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
        expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
        expect(screen.getByTestId('user-login-id')).toHaveTextContent('test.user');
      });
    });

    it('should not render without isTesting prop when not authenticated', () => {
      mockIsAuthenticated.mockReturnValue(false);
      mockGetUser.mockReturnValue(null);

      const { container } = render(<UserInfo />);

      expect(container.firstChild).toBeNull();
    });
  });
});

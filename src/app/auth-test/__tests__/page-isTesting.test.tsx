import React from 'react';
import { render, screen } from '@testing-library/react';
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

describe('AuthTestPage - isTesting prop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAuthenticated.mockReturnValue(true);
    mockGetUser.mockReturnValue({
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin',
    });
    mockGetToken.mockReturnValue('token');
  });

  it('should handle isTesting prop set to true and call logout', () => {
    render(<AuthTestPage isTesting={true} />);
    expect(screen.getByTestId('auth-test-page')).toBeInTheDocument();
    expect(mockLogout).toHaveBeenCalled();
  });

  it('should handle isTesting prop set to false', () => {
    mockLogout.mockClear();
    render(<AuthTestPage isTesting={false} />);
    expect(screen.getByTestId('auth-test-page')).toBeInTheDocument();
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it('should handle missing isTesting prop', () => {
    mockLogout.mockClear();
    render(<AuthTestPage />);
    expect(screen.getByTestId('auth-test-page')).toBeInTheDocument();
    expect(mockLogout).not.toHaveBeenCalled();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { LogoutButton } from '../logout-button';

// Mock authService
const mockLogout = jest.fn();
jest.mock('@/services/auth-service', () => ({
  authService: {
    logout: () => mockLogout(),
  },
}));

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className, ...props }: any) => (
    <button 
      onClick={onClick} 
      data-variant={variant} 
      data-size={size} 
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  LogOut: ({ className }: any) => <svg data-testid="logout-icon" className={className} />,
}));

describe('LogoutButton - isTesting prop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isTesting=true', () => {
    it('should render with isTesting=true', () => {
      render(<LogoutButton isTesting={true} />);
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should render with isTesting=true and custom props', () => {
      render(
        <LogoutButton 
          isTesting={true} 
          variant="destructive" 
          size="lg"
          showIcon={true}
        >
          Sign Out
        </LogoutButton>
      );
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
      expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
    });

    it('should render with isTesting=true and no icon', () => {
      render(<LogoutButton isTesting={true} showIcon={false} />);
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
      expect(screen.queryByTestId('logout-icon')).not.toBeInTheDocument();
    });
  });

  describe('isTesting=false', () => {
    it('should render with isTesting=false', () => {
      render(<LogoutButton isTesting={false} />);
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should render with isTesting=false and custom props', () => {
      render(
        <LogoutButton 
          isTesting={false} 
          variant="secondary" 
          size="sm"
          className="custom-class"
        >
          Exit
        </LogoutButton>
      );
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
      expect(screen.getByText('Exit')).toBeInTheDocument();
    });

    it('should render with isTesting=false and icon', () => {
      render(<LogoutButton isTesting={false} showIcon={true} />);
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
      expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
    });
  });

  describe('Default behavior', () => {
    it('should render without isTesting prop', () => {
      render(<LogoutButton />);
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should render without isTesting prop with custom children', () => {
      render(<LogoutButton>Log Out</LogoutButton>);
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
      expect(screen.getByText('Log Out')).toBeInTheDocument();
    });

    it('should render without isTesting prop with all variants', () => {
      const { rerender } = render(<LogoutButton variant="default" />);
      expect(screen.getByTestId('logout-button')).toHaveAttribute('data-variant', 'default');

      rerender(<LogoutButton variant="destructive" />);
      expect(screen.getByTestId('logout-button')).toHaveAttribute('data-variant', 'destructive');

      rerender(<LogoutButton variant="outline" />);
      expect(screen.getByTestId('logout-button')).toHaveAttribute('data-variant', 'outline');

      rerender(<LogoutButton variant="secondary" />);
      expect(screen.getByTestId('logout-button')).toHaveAttribute('data-variant', 'secondary');

      rerender(<LogoutButton variant="ghost" />);
      expect(screen.getByTestId('logout-button')).toHaveAttribute('data-variant', 'ghost');

      rerender(<LogoutButton variant="link" />);
      expect(screen.getByTestId('logout-button')).toHaveAttribute('data-variant', 'link');
    });
  });
});

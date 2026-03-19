import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('LogoutButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(<LogoutButton />);
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    });

    it('should render with default text "Logout"', () => {
      render(<LogoutButton />);
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should render with custom children text', () => {
      render(<LogoutButton>Sign Out</LogoutButton>);
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });

    it('should render with icon by default', () => {
      render(<LogoutButton />);
      expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
    });

    it('should not render icon when showIcon is false', () => {
      render(<LogoutButton showIcon={false} />);
      expect(screen.queryByTestId('logout-icon')).not.toBeInTheDocument();
    });

    it('should render icon when showIcon is true', () => {
      render(<LogoutButton showIcon={true} />);
      expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
    });
  });

  describe('Logout Functionality', () => {
    it('should call authService.logout when clicked', () => {
      render(<LogoutButton />);
      
      const button = screen.getByTestId('logout-button');
      fireEvent.click(button);

      expect(mockLogout).toHaveBeenCalled();
    });

    it('should call logout only once per click', () => {
      render(<LogoutButton />);
      
      const button = screen.getByTestId('logout-button');
      fireEvent.click(button);

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('should call logout on each click', () => {
      render(<LogoutButton />);
      
      const button = screen.getByTestId('logout-button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockLogout).toHaveBeenCalledTimes(3);
    });
  });

  describe('Variant Prop', () => {
    it('should render with default variant', () => {
      render(<LogoutButton />);
      const button = screen.getByTestId('logout-button');
      expect(button).toHaveAttribute('data-variant', 'outline');
    });

    it('should render with destructive variant', () => {
      render(<LogoutButton variant="destructive" />);
      const button = screen.getByTestId('logout-button');
      expect(button).toHaveAttribute('data-variant', 'destructive');
    });

    it('should render with outline variant', () => {
      render(<LogoutButton variant="outline" />);
      const button = screen.getByTestId('logout-button');
      expect(button).toHaveAttribute('data-variant', 'outline');
    });

    it('should render with secondary variant', () => {
      render(<LogoutButton variant="secondary" />);
      const button = screen.getByTestId('logout-button');
      expect(button).toHaveAttribute('data-variant', 'secondary');
    });

    it('should render with ghost variant', () => {
      render(<LogoutButton variant="ghost" />);
      const button = screen.getByTestId('logout-button');
      expect(button).toHaveAttribute('data-variant', 'ghost');
    });

    it('should render with link variant', () => {
      render(<LogoutButton variant="link" />);
      const button = screen.getByTestId('logout-button');
      expect(button).toHaveAttribute('data-variant', 'link');
    });

    it('should render with default variant (explicit)', () => {
      render(<LogoutButton variant="default" />);
      const button = screen.getByTestId('logout-button');
      expect(button).toHaveAttribute('data-variant', 'default');
    });
  });

  describe('Size Prop', () => {
    it('should render with default size', () => {
      render(<LogoutButton />);
      const button = screen.getByTestId('logout-button');
      expect(button).toHaveAttribute('data-size', 'default');
    });

    it('should render with sm size', () => {
      render(<LogoutButton size="sm" />);
      const button = screen.getByTestId('logout-button');
      expect(button).toHaveAttribute('data-size', 'sm');
    });

    it('should render with lg size', () => {
      render(<LogoutButton size="lg" />);
      const button = screen.getByTestId('logout-button');
      expect(button).toHaveAttribute('data-size', 'lg');
    });

    it('should render with icon size', () => {
      render(<LogoutButton size="icon" />);
      const button = screen.getByTestId('logout-button');
      expect(button).toHaveAttribute('data-size', 'icon');
    });
  });

  describe('ClassName Prop', () => {
    it('should apply default empty className', () => {
      render(<LogoutButton />);
      const button = screen.getByTestId('logout-button');
      expect(button).toHaveAttribute('class', '');
    });

    it('should apply custom className', () => {
      render(<LogoutButton className="custom-class" />);
      const button = screen.getByTestId('logout-button');
      expect(button).toHaveClass('custom-class');
    });

    it('should apply multiple classNames', () => {
      render(<LogoutButton className="class1 class2 class3" />);
      const button = screen.getByTestId('logout-button');
      expect(button).toHaveClass('class1', 'class2', 'class3');
    });
  });

  describe('Combined Props', () => {
    it('should render with multiple props combined', () => {
      render(
        <LogoutButton 
          variant="destructive" 
          size="lg" 
          className="custom-logout"
          showIcon={true}
        >
          Sign Out Now
        </LogoutButton>
      );
      
      expect(screen.getByText('Sign Out Now')).toBeInTheDocument();
      expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
      const button = screen.getByTestId('logout-button');
      expect(button).toHaveAttribute('data-variant', 'destructive');
      expect(button).toHaveAttribute('data-size', 'lg');
      expect(button).toHaveClass('custom-logout');
    });

    it('should render with all props including no icon', () => {
      render(
        <LogoutButton 
          variant="ghost" 
          size="sm" 
          className="minimal-button"
          showIcon={false}
        >
          Exit
        </LogoutButton>
      );
      
      expect(screen.getByText('Exit')).toBeInTheDocument();
      expect(screen.queryByTestId('logout-icon')).not.toBeInTheDocument();
      const button = screen.getByTestId('logout-button');
      expect(button).toHaveAttribute('data-variant', 'ghost');
      expect(button).toHaveAttribute('data-size', 'sm');
      expect(button).toHaveClass('minimal-button');
    });
  });

  describe('Props Handling', () => {
    it('should accept isTesting prop as false', () => {
      render(<LogoutButton isTesting={false} />);
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    });

    it('should accept isTesting prop as true', () => {
      render(<LogoutButton isTesting={true} />);
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    });

    it('should work without isTesting prop', () => {
      render(<LogoutButton />);
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    });
  });

  describe('Icon Styling', () => {
    it('should render icon with correct className', () => {
      render(<LogoutButton />);
      const icon = screen.getByTestId('logout-icon');
      expect(icon).toHaveClass('w-4', 'h-4', 'mr-2');
    });
  });

  describe('Existence Tests', () => {
    it('should be defined', () => {
      expect(LogoutButton).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof LogoutButton).toBe('function');
    });
  });
});

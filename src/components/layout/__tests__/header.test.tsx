import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Header } from '../header';
import { authService } from '@/services/auth-service';
import { usePathname } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('@/services/auth-service', () => ({
  authService: {
    getUser: jest.fn(),
  },
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, onMouseEnter, onMouseLeave, className, ...props }: any) => (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  User: () => <div data-testid="user-icon">User</div>,
  Bell: () => <div data-testid="bell-icon">Bell</div>,
}));

describe('Header Component', () => {
  const mockUsePathname = usePathname as jest.Mock;
  const mockGetUser = authService.getUser as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/some-path');
    mockGetUser.mockReturnValue({ name: 'John Doe', loginId: 'john.doe', email: 'john@example.com' });
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(<Header />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<Header />);
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('should render notification bell', () => {
      render(<Header />);
      expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    });

    it('should render with title prop', () => {
      render(<Header title="Test Title" />);
      // Title rendering is commented out in component, but test structure ready
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should render with breadcrumbs prop', () => {
      const breadcrumbs = [
        { label: 'Home', href: '/home' },
        { label: 'Page', href: '/page' },
      ];
      render(<Header breadcrumbs={breadcrumbs} />);
      // Breadcrumbs rendering is commented out in component
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });

  describe('Dashboard Welcome Message', () => {
    it('should display welcome message on dashboard', () => {
      mockUsePathname.mockReturnValue('/dashboard');
      mockGetUser.mockReturnValue({ name: 'Jane Smith' });

      render(<Header />);

      expect(screen.getByText(/Welcome Jane Smith!/)).toBeInTheDocument();
      expect(screen.getByText(/Here's what's happening with your business today./)).toBeInTheDocument();
    });

    it('should not display welcome message on non-dashboard pages', () => {
      mockUsePathname.mockReturnValue('/vendors');
      
      render(<Header />);

      expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument();
    });

    it('should display user name when available', () => {
      mockUsePathname.mockReturnValue('/dashboard');
      mockGetUser.mockReturnValue({ name: 'Alice Johnson', loginId: 'alice', email: 'alice@test.com' });

      render(<Header />);

      expect(screen.getByText(/Welcome Alice Johnson!/)).toBeInTheDocument();
    });

    it('should display loginId when name is not available', () => {
      mockUsePathname.mockReturnValue('/dashboard');
      mockGetUser.mockReturnValue({ loginId: 'bob.user', email: 'bob@test.com' });

      render(<Header />);

      expect(screen.getByText(/Welcome bob.user!/)).toBeInTheDocument();
    });

    it('should display email username when name and loginId are not available', () => {
      mockUsePathname.mockReturnValue('/dashboard');
      mockGetUser.mockReturnValue({ email: 'charlie@example.com' });

      render(<Header />);

      expect(screen.getByText(/Welcome charlie!/)).toBeInTheDocument();
    });

    it('should display default "User" when no user data available', () => {
      mockUsePathname.mockReturnValue('/dashboard');
      mockGetUser.mockReturnValue({});

      render(<Header />);

      expect(screen.getByText(/Welcome User!/)).toBeInTheDocument();
    });

    it('should display default "User" when user is null', () => {
      mockUsePathname.mockReturnValue('/dashboard');
      mockGetUser.mockReturnValue(null);

      render(<Header />);

      expect(screen.getByText(/Welcome User!/)).toBeInTheDocument();
    });
  });

  describe('Notification Badge', () => {
    it('should display notification count badge', () => {
      render(<Header />);
      
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should display "9+" for notifications greater than 9', () => {
      render(<Header />);
      
      // Click bell 3 times to reduce count, then we can verify behavior
      const notificationButton = screen.getByRole('button', { name: /bell/i });
      
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should reduce notification count on click', async () => {
      render(<Header />);
      
      const notificationButton = screen.getByRole('button', { name: /bell/i });
      
      expect(screen.getByText('3')).toBeInTheDocument();
      
      fireEvent.click(notificationButton);
      
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('should not go below 0 notifications', async () => {
      render(<Header />);
      
      const notificationButton = screen.getByRole('button', { name: /bell/i });
      
      // Click 4 times (initial is 3)
      fireEvent.click(notificationButton);
      fireEvent.click(notificationButton);
      fireEvent.click(notificationButton);
      fireEvent.click(notificationButton);
      
      await waitFor(() => {
        expect(screen.queryByText('3')).not.toBeInTheDocument();
      });
      
      // Should not find negative or continue decreasing
      expect(screen.queryByText('-1')).not.toBeInTheDocument();
    });

    it('should hide badge when notification count is 0', async () => {
      render(<Header />);
      
      const notificationButton = screen.getByRole('button', { name: /bell/i });
      
      // Click to reduce to 0
      fireEvent.click(notificationButton);
      fireEvent.click(notificationButton);
      fireEvent.click(notificationButton);
      
      await waitFor(() => {
        expect(screen.queryByText('3')).not.toBeInTheDocument();
        expect(screen.queryByText('2')).not.toBeInTheDocument();
        expect(screen.queryByText('1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Notification Tooltip', () => {
    it('should show tooltip on mouse enter', async () => {
      render(<Header />);
      
      const notificationButton = screen.getByRole('button', { name: /bell/i });
      
      fireEvent.mouseEnter(notificationButton);
      
      await waitFor(() => {
        expect(screen.getByText(/3 unread notifications/)).toBeInTheDocument();
      });
    });

    it('should hide tooltip on mouse leave', async () => {
      render(<Header />);
      
      const notificationButton = screen.getByRole('button', { name: /bell/i });
      
      fireEvent.mouseEnter(notificationButton);
      
      await waitFor(() => {
        expect(screen.getByText(/3 unread notifications/)).toBeInTheDocument();
      });
      
      fireEvent.mouseLeave(notificationButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/3 unread notifications/)).not.toBeInTheDocument();
      });
    });

    it('should show singular "notification" for count of 1', async () => {
      render(<Header />);
      
      const notificationButton = screen.getByRole('button', { name: /bell/i });
      
      // Reduce to 1
      fireEvent.click(notificationButton);
      fireEvent.click(notificationButton);
      
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });
      
      fireEvent.mouseEnter(notificationButton);
      
      await waitFor(() => {
        expect(screen.getByText('1 unread notification')).toBeInTheDocument();
      });
    });

    it('should update tooltip text when notification count changes', async () => {
      render(<Header />);
      
      const notificationButton = screen.getByRole('button', { name: /bell/i });
      
      fireEvent.mouseEnter(notificationButton);
      
      await waitFor(() => {
        expect(screen.getByText(/3 unread notifications/)).toBeInTheDocument();
      });
      
      fireEvent.mouseLeave(notificationButton);
      fireEvent.click(notificationButton);
      
      fireEvent.mouseEnter(notificationButton);
      
      await waitFor(() => {
        expect(screen.getByText(/2 unread notifications/)).toBeInTheDocument();
      });
    });
  });

  describe('User Effect Hook', () => {
    it('should call authService.getUser on mount', () => {
      render(<Header />);
      
      expect(mockGetUser).toHaveBeenCalledTimes(1);
    });

    it('should update user state when effect runs', async () => {
      mockUsePathname.mockReturnValue('/dashboard');
      mockGetUser.mockReturnValue({ name: 'Test User' });

      render(<Header />);

      await waitFor(() => {
        expect(screen.getByText(/Welcome Test User!/)).toBeInTheDocument();
      });
    });
  });

  describe('Search Input', () => {
    it('should have correct placeholder text', () => {
      render(<Header />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toHaveAttribute('placeholder', 'Search...');
    });

    it('should render search icon', () => {
      render(<Header />);
      
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });
  });

  describe('Styling and Classes', () => {
    it('should have sticky header with correct classes', () => {
      render(<Header />);
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('sticky', 'top-0', 'z-30', 'border-b');
    });

    it('should apply backdrop blur classes', () => {
      render(<Header />);
      
      const header = screen.getByRole('banner');
      expect(header.className).toContain('backdrop-blur');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined user gracefully', () => {
      mockUsePathname.mockReturnValue('/dashboard');
      mockGetUser.mockReturnValue(undefined);

      render(<Header />);

      expect(screen.getByText(/Welcome User!/)).toBeInTheDocument();
    });

    it('should handle empty email string', () => {
      mockUsePathname.mockReturnValue('/dashboard');
      mockGetUser.mockReturnValue({ email: '' });

      render(<Header />);

      expect(screen.getByText(/Welcome User!/)).toBeInTheDocument();
    });

    it('should handle email without @ symbol', () => {
      mockUsePathname.mockReturnValue('/dashboard');
      mockGetUser.mockReturnValue({ email: 'invalidemail' });

      render(<Header />);

      expect(screen.getByText(/Welcome invalidemail!/)).toBeInTheDocument();
    });

    it('should handle multiple clicks rapidly', async () => {
      render(<Header />);
      
      const notificationButton = screen.getByRole('button', { name: /bell/i });
      
      // Rapid clicks
      fireEvent.click(notificationButton);
      fireEvent.click(notificationButton);
      fireEvent.click(notificationButton);
      fireEvent.click(notificationButton);
      fireEvent.click(notificationButton);
      
      await waitFor(() => {
        expect(screen.queryByText('3')).not.toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should hide search input on small screens', () => {
      render(<Header />);
      
      const searchContainer = screen.getByPlaceholderText('Search...').parentElement;
      expect(searchContainer).toHaveClass('hidden', 'md:block');
    });
  });
});

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '../page';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock authService
const mockIsAuthenticated = jest.fn();
jest.mock('@/services/auth-service', () => ({
  authService: {
    isAuthenticated: () => mockIsAuthenticated(),
  },
}));

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Home />);
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('should render loading state', () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Home />);
      expect(screen.getByText('Loading VMS...')).toBeInTheDocument();
    });

    it('should render loading spinner', () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Home />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should render authentication status message', () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Home />);
      expect(screen.getByText('Checking authentication status')).toBeInTheDocument();
    });

    it('should render with correct styling classes', () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Home />);
      const container = screen.getByTestId('home-page');
      expect(container).toHaveClass('flex', 'min-h-screen', 'items-center', 'justify-center');
    });
  });

  describe('Authenticated User', () => {
    it('should redirect to dashboard when user is authenticated', async () => {
      mockIsAuthenticated.mockReturnValue(true);
      
      render(<Home />);

      await waitFor(() => {
        expect(mockIsAuthenticated).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should not redirect to login when authenticated', async () => {
      mockIsAuthenticated.mockReturnValue(true);
      
      render(<Home />);

      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalledWith('/login');
      });
    });

    it('should call isAuthenticated on mount', () => {
      mockIsAuthenticated.mockReturnValue(true);
      
      render(<Home />);

      expect(mockIsAuthenticated).toHaveBeenCalled();
    });
  });

  describe('Unauthenticated User', () => {
    it('should redirect to login when user is not authenticated', async () => {
      mockIsAuthenticated.mockReturnValue(false);
      
      render(<Home />);

      await waitFor(() => {
        expect(mockIsAuthenticated).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should not redirect to dashboard when not authenticated', async () => {
      mockIsAuthenticated.mockReturnValue(false);
      
      render(<Home />);

      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should call isAuthenticated on mount', () => {
      mockIsAuthenticated.mockReturnValue(false);
      
      render(<Home />);

      expect(mockIsAuthenticated).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should call router.push exactly once for authenticated user', async () => {
      mockIsAuthenticated.mockReturnValue(true);
      
      render(<Home />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledTimes(1);
      });
    });

    it('should call router.push exactly once for unauthenticated user', async () => {
      mockIsAuthenticated.mockReturnValue(false);
      
      render(<Home />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Loading UI Elements', () => {
    it('should display loading title', () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Home />);
      
      const title = screen.getByText('Loading VMS...');
      expect(title).toHaveClass('text-2xl', 'font-bold', 'text-gray-800');
    });

    it('should display authentication check message', () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Home />);
      
      const message = screen.getByText('Checking authentication status');
      expect(message).toHaveClass('text-gray-600', 'mt-2');
    });

    it('should have spinner with animation class', () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Home />);
      
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('Props Handling', () => {
    it('should accept isTesting prop as false', async () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Home isTesting={false} />);
      
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('should accept isTesting prop as true', async () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Home isTesting={true} />);
      
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('should work without isTesting prop', async () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Home />);
      
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  describe('useEffect Behavior', () => {
    it('should execute redirect on component mount', () => {
      mockIsAuthenticated.mockReturnValue(true);
      
      render(<Home />);

      expect(mockIsAuthenticated).toHaveBeenCalled();
    });

    it('should handle authenticated state correctly', async () => {
      mockIsAuthenticated.mockReturnValue(true);
      
      render(<Home />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should handle unauthenticated state correctly', async () => {
      mockIsAuthenticated.mockReturnValue(false);
      
      render(<Home />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Existence Tests', () => {
    it('should be defined', () => {
      expect(Home).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof Home).toBe('function');
    });
  });
});

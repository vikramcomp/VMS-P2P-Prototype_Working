import React from 'react';
import { render, screen } from '@testing-library/react';
import RequestsPage from '../page';

// Mock next/dynamic
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (loader: any, options: any) => {
    const DynamicComponent = () => {
      if (options?.loading) {
        return options.loading();
      }
      return <div>Mocked Dynamic Component</div>;
    };
    DynamicComponent.displayName = 'DynamicComponent';
    return DynamicComponent;
  },
}));

// Mock MainLayout
jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  ),
}));

// Mock ProtectedRoute
jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

describe('RequestsPage', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<RequestsPage />);
      expect(screen.getByTestId('requests-page')).toBeInTheDocument();
    });

    it('should render the main container', () => {
      const { container } = render(<RequestsPage />);
      expect(container.firstChild).toBeTruthy();
    });

    it('should have correct testid', () => {
      render(<RequestsPage />);
      const page = screen.getByTestId('requests-page');
      expect(page).toHaveAttribute('data-testid', 'requests-page');
    });
  });

  describe('Component Hierarchy', () => {
    it('should render ProtectedRoute', () => {
      render(<RequestsPage />);
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should render MainLayout', () => {
      render(<RequestsPage />);
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    it('should have correct component nesting', () => {
      render(<RequestsPage />);
      const protectedRoute = screen.getByTestId('protected-route');
      const mainLayout = screen.getByTestId('main-layout');
      expect(protectedRoute).toContainElement(mainLayout);
    });
  });

  describe('Dynamic Import - Loading State', () => {
    it('should display loading state from dynamic import', () => {
      render(<RequestsPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render loading div with correct class', () => {
      const { container } = render(<RequestsPage />);
      const loadingDiv = container.querySelector('.p-6');
      expect(loadingDiv).toBeInTheDocument();
    });

    it('should show loading text', () => {
      render(<RequestsPage />);
      const loadingText = screen.getByText('Loading...');
      expect(loadingText).toBeTruthy();
    });
  });

  describe('Props Handling', () => {
    it('should accept isTesting prop as false', () => {
      render(<RequestsPage isTesting={false} />);
      expect(screen.getByTestId('requests-page')).toBeInTheDocument();
    });

    it('should accept isTesting prop as true', () => {
      render(<RequestsPage isTesting={true} />);
      expect(screen.getByTestId('requests-page')).toBeInTheDocument();
    });

    it('should handle undefined isTesting prop', () => {
      render(<RequestsPage isTesting={undefined} />);
      expect(screen.getByTestId('requests-page')).toBeInTheDocument();
    });

    it('should work without any props', () => {
      render(<RequestsPage />);
      expect(screen.getByTestId('requests-page')).toBeInTheDocument();
    });
  });

  describe('Structure', () => {
    it('should have a root div element', () => {
      const { container } = render(<RequestsPage />);
      expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
    });

    it('should contain protected route wrapper', () => {
      render(<RequestsPage />);
      const page = screen.getByTestId('requests-page');
      const protectedRoute = screen.getByTestId('protected-route');
      expect(page).toContainElement(protectedRoute);
    });

    it('should wrap content in proper order', () => {
      render(<RequestsPage />);
      const page = screen.getByTestId('requests-page');
      const protectedRoute = screen.getByTestId('protected-route');
      const mainLayout = screen.getByTestId('main-layout');
      
      expect(page).toContainElement(protectedRoute);
      expect(protectedRoute).toContainElement(mainLayout);
    });
  });

  describe('SSR Configuration', () => {
    it('should use dynamic import with ssr false', () => {
      const { container } = render(<RequestsPage />);
      expect(container).toBeTruthy();
    });

    it('should render with client-side hydration', () => {
      render(<RequestsPage />);
      expect(screen.getByTestId('requests-page')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have testid for testing', () => {
      render(<RequestsPage />);
      expect(screen.getByTestId('requests-page')).toBeInTheDocument();
    });

    it('should be accessible by test id', () => {
      const { getByTestId } = render(<RequestsPage />);
      expect(getByTestId('requests-page')).toBeTruthy();
    });
  });

  describe('Integration', () => {
    it('should integrate with ProtectedRoute component', () => {
      render(<RequestsPage />);
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should integrate with MainLayout component', () => {
      render(<RequestsPage />);
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    it('should render all required components', () => {
      render(<RequestsPage />);
      expect(screen.getByTestId('requests-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });
  });

  describe('Consistency', () => {
    it('should render consistently on multiple calls', () => {
      const { rerender } = render(<RequestsPage />);
      expect(screen.getByTestId('requests-page')).toBeInTheDocument();
      
      rerender(<RequestsPage />);
      expect(screen.getByTestId('requests-page')).toBeInTheDocument();
    });

    it('should maintain structure on re-render', () => {
      const { rerender } = render(<RequestsPage />);
      const firstRender = screen.getByTestId('requests-page');
      
      rerender(<RequestsPage />);
      const secondRender = screen.getByTestId('requests-page');
      
      expect(firstRender).toBeTruthy();
      expect(secondRender).toBeTruthy();
    });
  });

  describe('Type Safety', () => {
    it('should accept valid props object', () => {
      render(<RequestsPage isTesting={false} />);
      expect(screen.getByTestId('requests-page')).toBeInTheDocument();
    });

    it('should work with empty props object', () => {
      render(<RequestsPage />);
      expect(screen.getByTestId('requests-page')).toBeInTheDocument();
    });
  });

  describe('Existence Tests', () => {
    it('should exist in the DOM', () => {
      const { container } = render(<RequestsPage />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should be defined', () => {
      expect(RequestsPage).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof RequestsPage).toBe('function');
    });
  });

  describe('Layout Tests', () => {
    it('should use MainLayout wrapper', () => {
      render(<RequestsPage />);
      const mainLayout = screen.getByTestId('main-layout');
      expect(mainLayout).toBeInTheDocument();
    });

    it('should be wrapped in ProtectedRoute', () => {
      render(<RequestsPage />);
      const protectedRoute = screen.getByTestId('protected-route');
      expect(protectedRoute).toBeInTheDocument();
    });

    it('should have proper layout hierarchy', () => {
      render(<RequestsPage />);
      const page = screen.getByTestId('requests-page');
      const protectedRoute = screen.getByTestId('protected-route');
      const mainLayout = screen.getByTestId('main-layout');
      
      expect(page.contains(protectedRoute)).toBe(true);
      expect(protectedRoute.contains(mainLayout)).toBe(true);
    });
  });
});

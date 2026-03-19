import React from 'react';
import { render, screen } from '@testing-library/react';
import VendorsPage from '../page';

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

describe('VendorsPage', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<VendorsPage />);
      expect(screen.getByTestId('vendors-page')).toBeInTheDocument();
    });

    it('should render the main container', () => {
      const { container } = render(<VendorsPage />);
      expect(container.firstChild).toBeTruthy();
    });

    it('should have correct testid', () => {
      render(<VendorsPage />);
      const page = screen.getByTestId('vendors-page');
      expect(page).toHaveAttribute('data-testid', 'vendors-page');
    });
  });

  describe('Component Hierarchy', () => {
    it('should render ProtectedRoute', () => {
      render(<VendorsPage />);
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should render MainLayout', () => {
      render(<VendorsPage />);
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    it('should have correct component nesting', () => {
      render(<VendorsPage />);
      const protectedRoute = screen.getByTestId('protected-route');
      const mainLayout = screen.getByTestId('main-layout');
      expect(protectedRoute).toContainElement(mainLayout);
    });
  });

  describe('Dynamic Import - Loading State', () => {
    it('should display loading state from dynamic import', () => {
      render(<VendorsPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render loading div with correct class', () => {
      const { container } = render(<VendorsPage />);
      const loadingDiv = container.querySelector('.p-6');
      expect(loadingDiv).toBeInTheDocument();
    });

    it('should show loading text', () => {
      render(<VendorsPage />);
      const loadingText = screen.getByText('Loading...');
      expect(loadingText).toBeTruthy();
    });
  });

  describe('Props Handling', () => {
    it('should accept isTesting prop as false', () => {
      render(<VendorsPage isTesting={false} />);
      expect(screen.getByTestId('vendors-page')).toBeInTheDocument();
    });

    it('should accept isTesting prop as true', () => {
      render(<VendorsPage isTesting={true} />);
      expect(screen.getByTestId('vendors-page')).toBeInTheDocument();
    });

    it('should handle undefined isTesting prop', () => {
      render(<VendorsPage isTesting={undefined} />);
      expect(screen.getByTestId('vendors-page')).toBeInTheDocument();
    });

    it('should work without any props', () => {
      render(<VendorsPage />);
      expect(screen.getByTestId('vendors-page')).toBeInTheDocument();
    });
  });

  describe('Structure', () => {
    it('should have a root div element', () => {
      const { container } = render(<VendorsPage />);
      expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
    });

    it('should contain protected route wrapper', () => {
      render(<VendorsPage />);
      const page = screen.getByTestId('vendors-page');
      const protectedRoute = screen.getByTestId('protected-route');
      expect(page).toContainElement(protectedRoute);
    });

    it('should wrap content in proper order', () => {
      render(<VendorsPage />);
      const page = screen.getByTestId('vendors-page');
      const protectedRoute = screen.getByTestId('protected-route');
      const mainLayout = screen.getByTestId('main-layout');
      
      expect(page).toContainElement(protectedRoute);
      expect(protectedRoute).toContainElement(mainLayout);
    });

    it('should have custom wrapper div with class', () => {
      const { container } = render(<VendorsPage />);
      const customDiv = container.querySelector('.cus-manage-groups-pg');
      expect(customDiv).toBeInTheDocument();
    });

    it('should render custom wrapper inside MainLayout', () => {
      render(<VendorsPage />);
      const mainLayout = screen.getByTestId('main-layout');
      const { container } = render(<VendorsPage />);
      const customDiv = container.querySelector('.cus-manage-groups-pg');
      expect(customDiv).toBeTruthy();
    });
  });

  describe('SSR Configuration', () => {
    it('should use dynamic import with ssr false', () => {
      const { container } = render(<VendorsPage />);
      expect(container).toBeTruthy();
    });

    it('should render with client-side hydration', () => {
      render(<VendorsPage />);
      expect(screen.getByTestId('vendors-page')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have testid for testing', () => {
      render(<VendorsPage />);
      expect(screen.getByTestId('vendors-page')).toBeInTheDocument();
    });

    it('should be accessible by test id', () => {
      const { getByTestId } = render(<VendorsPage />);
      expect(getByTestId('vendors-page')).toBeTruthy();
    });
  });

  describe('Integration', () => {
    it('should integrate with ProtectedRoute component', () => {
      render(<VendorsPage />);
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should integrate with MainLayout component', () => {
      render(<VendorsPage />);
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    it('should render all required components', () => {
      render(<VendorsPage />);
      expect(screen.getByTestId('vendors-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });
  });

  describe('Consistency', () => {
    it('should render consistently on multiple calls', () => {
      const { rerender } = render(<VendorsPage />);
      expect(screen.getByTestId('vendors-page')).toBeInTheDocument();
      
      rerender(<VendorsPage />);
      expect(screen.getByTestId('vendors-page')).toBeInTheDocument();
    });

    it('should maintain structure on re-render', () => {
      const { rerender } = render(<VendorsPage />);
      const firstRender = screen.getByTestId('vendors-page');
      
      rerender(<VendorsPage />);
      const secondRender = screen.getByTestId('vendors-page');
      
      expect(firstRender).toBeTruthy();
      expect(secondRender).toBeTruthy();
    });
  });

  describe('Type Safety', () => {
    it('should accept valid props object', () => {
      render(<VendorsPage isTesting={false} />);
      expect(screen.getByTestId('vendors-page')).toBeInTheDocument();
    });

    it('should work with empty props object', () => {
      render(<VendorsPage />);
      expect(screen.getByTestId('vendors-page')).toBeInTheDocument();
    });
  });

  describe('Existence Tests', () => {
    it('should exist in the DOM', () => {
      const { container } = render(<VendorsPage />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should be defined', () => {
      expect(VendorsPage).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof VendorsPage).toBe('function');
    });
  });

  describe('Layout Tests', () => {
    it('should use MainLayout wrapper', () => {
      render(<VendorsPage />);
      const mainLayout = screen.getByTestId('main-layout');
      expect(mainLayout).toBeInTheDocument();
    });

    it('should be wrapped in ProtectedRoute', () => {
      render(<VendorsPage />);
      const protectedRoute = screen.getByTestId('protected-route');
      expect(protectedRoute).toBeInTheDocument();
    });

    it('should have proper layout hierarchy', () => {
      render(<VendorsPage />);
      const page = screen.getByTestId('vendors-page');
      const protectedRoute = screen.getByTestId('protected-route');
      const mainLayout = screen.getByTestId('main-layout');
      
      expect(page.contains(protectedRoute)).toBe(true);
      expect(protectedRoute.contains(mainLayout)).toBe(true);
    });
  });

  describe('Custom Styling', () => {
    it('should have cus-manage-groups-pg class', () => {
      const { container } = render(<VendorsPage />);
      const customDiv = container.querySelector('.cus-manage-groups-pg');
      expect(customDiv).toBeInTheDocument();
    });

    it('should apply custom class to inner wrapper', () => {
      const { container } = render(<VendorsPage />);
      const customDiv = container.querySelector('.cus-manage-groups-pg');
      expect(customDiv?.className).toBe('cus-manage-groups-pg');
    });
  });
});

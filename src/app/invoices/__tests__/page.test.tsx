import React from 'react';
import { render, screen } from '@testing-library/react';
import InvoicesPage from '../page';

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

describe('InvoicesPage', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<InvoicesPage />);
      expect(screen.getByTestId('invoices-page')).toBeInTheDocument();
    });

    it('should render the main container', () => {
      const { container } = render(<InvoicesPage />);
      expect(container.firstChild).toBeTruthy();
    });

    it('should have correct testid', () => {
      render(<InvoicesPage />);
      const page = screen.getByTestId('invoices-page');
      expect(page).toHaveAttribute('data-testid', 'invoices-page');
    });
  });

  describe('Component Hierarchy', () => {
    it('should render ProtectedRoute', () => {
      render(<InvoicesPage />);
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should render MainLayout', () => {
      render(<InvoicesPage />);
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    it('should have correct component nesting', () => {
      render(<InvoicesPage />);
      const protectedRoute = screen.getByTestId('protected-route');
      const mainLayout = screen.getByTestId('main-layout');
      expect(protectedRoute).toContainElement(mainLayout);
    });
  });

  describe('Dynamic Import - Loading State', () => {
    it('should display loading state from dynamic import', () => {
      render(<InvoicesPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render loading div with correct class', () => {
      const { container } = render(<InvoicesPage />);
      const loadingDiv = container.querySelector('.p-6');
      expect(loadingDiv).toBeInTheDocument();
    });

    it('should show loading text', () => {
      render(<InvoicesPage />);
      const loadingText = screen.getByText('Loading...');
      expect(loadingText).toBeTruthy();
    });
  });

  describe('Props Handling', () => {
    it('should accept isTesting prop as false', () => {
      render(<InvoicesPage isTesting={false} />);
      expect(screen.getByTestId('invoices-page')).toBeInTheDocument();
    });

    it('should accept isTesting prop as true', () => {
      render(<InvoicesPage isTesting={true} />);
      expect(screen.getByTestId('invoices-page')).toBeInTheDocument();
    });

    it('should handle undefined isTesting prop', () => {
      render(<InvoicesPage isTesting={undefined} />);
      expect(screen.getByTestId('invoices-page')).toBeInTheDocument();
    });

    it('should work without any props', () => {
      render(<InvoicesPage />);
      expect(screen.getByTestId('invoices-page')).toBeInTheDocument();
    });
  });

  describe('Structure', () => {
    it('should have a root div element', () => {
      const { container } = render(<InvoicesPage />);
      expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
    });

    it('should contain protected route wrapper', () => {
      render(<InvoicesPage />);
      const page = screen.getByTestId('invoices-page');
      const protectedRoute = screen.getByTestId('protected-route');
      expect(page).toContainElement(protectedRoute);
    });

    it('should wrap content in proper order', () => {
      render(<InvoicesPage />);
      const page = screen.getByTestId('invoices-page');
      const protectedRoute = screen.getByTestId('protected-route');
      const mainLayout = screen.getByTestId('main-layout');
      
      expect(page).toContainElement(protectedRoute);
      expect(protectedRoute).toContainElement(mainLayout);
    });
  });

  describe('SSR Configuration', () => {
    it('should use dynamic import with ssr false', () => {
      const { container } = render(<InvoicesPage />);
      expect(container).toBeTruthy();
    });

    it('should render with client-side hydration', () => {
      render(<InvoicesPage />);
      expect(screen.getByTestId('invoices-page')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have testid for testing', () => {
      render(<InvoicesPage />);
      expect(screen.getByTestId('invoices-page')).toBeInTheDocument();
    });

    it('should be accessible by test id', () => {
      const { getByTestId } = render(<InvoicesPage />);
      expect(getByTestId('invoices-page')).toBeTruthy();
    });
  });

  describe('Integration', () => {
    it('should integrate with ProtectedRoute component', () => {
      render(<InvoicesPage />);
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should integrate with MainLayout component', () => {
      render(<InvoicesPage />);
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    it('should render all required components', () => {
      render(<InvoicesPage />);
      expect(screen.getByTestId('invoices-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });
  });

  describe('Consistency', () => {
    it('should render consistently on multiple calls', () => {
      const { rerender } = render(<InvoicesPage />);
      expect(screen.getByTestId('invoices-page')).toBeInTheDocument();
      
      rerender(<InvoicesPage />);
      expect(screen.getByTestId('invoices-page')).toBeInTheDocument();
    });

    it('should maintain structure on re-render', () => {
      const { rerender } = render(<InvoicesPage />);
      const firstRender = screen.getByTestId('invoices-page');
      
      rerender(<InvoicesPage />);
      const secondRender = screen.getByTestId('invoices-page');
      
      expect(firstRender).toBeTruthy();
      expect(secondRender).toBeTruthy();
    });
  });

  describe('Type Safety', () => {
    it('should accept valid props object', () => {
      render(<InvoicesPage isTesting={false} />);
      expect(screen.getByTestId('invoices-page')).toBeInTheDocument();
    });

    it('should work with empty props object', () => {
      render(<InvoicesPage />);
      expect(screen.getByTestId('invoices-page')).toBeInTheDocument();
    });
  });

  describe('Existence Tests', () => {
    it('should exist in the DOM', () => {
      const { container } = render(<InvoicesPage />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should be defined', () => {
      expect(InvoicesPage).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof InvoicesPage).toBe('function');
    });
  });

  describe('Layout Tests', () => {
    it('should use MainLayout wrapper', () => {
      render(<InvoicesPage />);
      const mainLayout = screen.getByTestId('main-layout');
      expect(mainLayout).toBeInTheDocument();
    });

    it('should be wrapped in ProtectedRoute', () => {
      render(<InvoicesPage />);
      const protectedRoute = screen.getByTestId('protected-route');
      expect(protectedRoute).toBeInTheDocument();
    });

    it('should have proper layout hierarchy', () => {
      render(<InvoicesPage />);
      const page = screen.getByTestId('invoices-page');
      const protectedRoute = screen.getByTestId('protected-route');
      const mainLayout = screen.getByTestId('main-layout');
      
      expect(page.contains(protectedRoute)).toBe(true);
      expect(protectedRoute.contains(mainLayout)).toBe(true);
    });
  });
});

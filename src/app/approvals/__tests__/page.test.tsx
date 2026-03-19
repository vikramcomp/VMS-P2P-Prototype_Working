import React from 'react';
import { render, screen } from '@testing-library/react';
import ApprovalsPage from '../page';

// Mock Next.js dynamic
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (importFn: any, options: any) => {
    const DynamicComponent = (props: any) => {
      if (options?.loading) {
        return options.loading();
      }
      return <div data-testid="approvals-content">ApprovalsContent</div>;
    };
    DynamicComponent.displayName = 'DynamicApprovalsContent';
    return DynamicComponent;
  },
}));

// Mock MainLayout
jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: any) => <div data-testid="main-layout">{children}</div>,
}));

// Mock ProtectedRoute
jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: any) => <div data-testid="protected-route">{children}</div>,
}));

describe('ApprovalsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the page', () => {
      render(<ApprovalsPage />);
      expect(screen.getByTestId('approvals-page')).toBeInTheDocument();
    });

    it('should render with data-testid', () => {
      render(<ApprovalsPage />);
      expect(screen.getByTestId('approvals-page')).toBeInTheDocument();
    });

    it('should render ProtectedRoute', () => {
      render(<ApprovalsPage />);
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should render MainLayout', () => {
      render(<ApprovalsPage />);
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

  });

  describe('Component Hierarchy', () => {
    it('should render ProtectedRoute as wrapper', () => {
      render(<ApprovalsPage />);
      const page = screen.getByTestId('approvals-page');
      const protectedRoute = screen.getByTestId('protected-route');
      expect(page).toContainElement(protectedRoute);
    });

    it('should render MainLayout inside ProtectedRoute', () => {
      render(<ApprovalsPage />);
      const protectedRoute = screen.getByTestId('protected-route');
      const mainLayout = screen.getByTestId('main-layout');
      expect(protectedRoute).toContainElement(mainLayout);
    });

    it('should have correct nesting order', () => {
      render(<ApprovalsPage />);
      const page = screen.getByTestId('approvals-page');
      const protectedRoute = screen.getByTestId('protected-route');
      const mainLayout = screen.getByTestId('main-layout');
      
      expect(page).toContainElement(protectedRoute);
      expect(protectedRoute).toContainElement(mainLayout);
    });
  });

  describe('Dynamic Import', () => {
    it('should show loading state', () => {
      render(<ApprovalsPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should have loading div with correct class', () => {
      render(<ApprovalsPage />);
      const loadingDiv = screen.getByText('Loading...').closest('div');
      expect(loadingDiv).toHaveClass('p-6');
    });
  });

  describe('Props', () => {
    it('should accept isTesting prop', () => {
      render(<ApprovalsPage isTesting={false} />);
      expect(screen.getByTestId('approvals-page')).toBeInTheDocument();
    });

    it('should render when isTesting is true', () => {
      render(<ApprovalsPage isTesting={true} />);
      expect(screen.getByTestId('approvals-page')).toBeInTheDocument();
    });

    it('should render all components with isTesting prop', () => {
      render(<ApprovalsPage isTesting={true} />);
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });
  });

  describe('Default Props', () => {
    it('should work without props', () => {
      render(<ApprovalsPage />);
      expect(screen.getByTestId('approvals-page')).toBeInTheDocument();
    });

    it('should render all nested components without props', () => {
      render(<ApprovalsPage />);
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should have a root div element', () => {
      render(<ApprovalsPage />);
      const page = screen.getByTestId('approvals-page');
      expect(page.tagName).toBe('DIV');
    });

    it('should render exactly one ProtectedRoute', () => {
      render(<ApprovalsPage />);
      const protectedRoutes = screen.getAllByTestId('protected-route');
      expect(protectedRoutes).toHaveLength(1);
    });

    it('should render exactly one MainLayout', () => {
      render(<ApprovalsPage />);
      const mainLayouts = screen.getAllByTestId('main-layout');
      expect(mainLayouts).toHaveLength(1);
    });

  });

  describe('SSR Configuration', () => {
    it('should use client directive', () => {
      // The file has 'use client' directive at the top
      // This test verifies the component renders in client mode
      render(<ApprovalsPage />);
      expect(screen.getByTestId('approvals-page')).toBeInTheDocument();
    });

    it('should render with loading state for dynamic content', () => {
      // Dynamic import is configured with ssr: false and shows loading
      render(<ApprovalsPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have testid for testing', () => {
      render(<ApprovalsPage />);
      const page = screen.getByTestId('approvals-page');
      expect(page).toHaveAttribute('data-testid', 'approvals-page');
    });

    it('should render all child components with testids', () => {
      render(<ApprovalsPage />);
      expect(screen.getByTestId('approvals-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should integrate ProtectedRoute correctly', () => {
      render(<ApprovalsPage />);
      const protectedRoute = screen.getByTestId('protected-route');
      expect(protectedRoute).toBeInTheDocument();
    });

    it('should integrate MainLayout correctly', () => {
      render(<ApprovalsPage />);
      const mainLayout = screen.getByTestId('main-layout');
      expect(mainLayout).toBeInTheDocument();
    });

    it('should pass children to ProtectedRoute', () => {
      render(<ApprovalsPage />);
      const protectedRoute = screen.getByTestId('protected-route');
      const mainLayout = screen.getByTestId('main-layout');
      expect(protectedRoute).toContainElement(mainLayout);
    });

    it('should render loading content inside MainLayout', () => {
      render(<ApprovalsPage />);
      const mainLayout = screen.getByTestId('main-layout');
      const loadingDiv = screen.getByText('Loading...');
      expect(mainLayout).toContainElement(loadingDiv);
    });
  });

  describe('Rendering Consistency', () => {
    it('should render consistently on multiple renders', () => {
      const { rerender } = render(<ApprovalsPage />);
      expect(screen.getByTestId('approvals-page')).toBeInTheDocument();
      
      rerender(<ApprovalsPage />);
      expect(screen.getByTestId('approvals-page')).toBeInTheDocument();
    });

    it('should maintain component structure on rerender', () => {
      const { rerender } = render(<ApprovalsPage />);
      const initialPage = screen.getByTestId('approvals-page');
      
      rerender(<ApprovalsPage />);
      const rerenderPage = screen.getByTestId('approvals-page');
      
      expect(initialPage).toBeInTheDocument();
      expect(rerenderPage).toBeInTheDocument();
    });
  });

  describe('Type Safety', () => {
    it('should accept valid props', () => {
      expect(() => render(<ApprovalsPage isTesting={false} />)).not.toThrow();
    });

    it('should work with isTesting true', () => {
      expect(() => render(<ApprovalsPage isTesting={true} />)).not.toThrow();
    });

    it('should work with default values', () => {
      expect(() => render(<ApprovalsPage />)).not.toThrow();
    });
  });

  describe('Component Existence', () => {
    it('should render without errors', () => {
      const { container } = render(<ApprovalsPage />);
      expect(container).toBeInTheDocument();
    });

    it('should have content', () => {
      const { container } = render(<ApprovalsPage />);
      expect(container.firstChild).not.toBeNull();
    });

    it('should render all expected elements', () => {
      render(<ApprovalsPage />);
      expect(screen.getByTestId('approvals-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});

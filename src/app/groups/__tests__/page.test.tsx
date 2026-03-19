import React from 'react';
import { render, screen } from '@testing-library/react';
import GroupsPage from '../page';

// Mock Next.js dynamic
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (importFn: any, options: any) => {
    const DynamicComponent = (props: any) => {
      if (options?.loading) {
        return options.loading();
      }
      return <div data-testid="groups-content">GroupsContent</div>;
    };
    DynamicComponent.displayName = 'DynamicGroupsContent';
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

describe('GroupsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the page', () => {
      render(<GroupsPage />);
      expect(screen.getByTestId('groups-page')).toBeInTheDocument();
    });

    it('should render with data-testid', () => {
      render(<GroupsPage />);
      expect(screen.getByTestId('groups-page')).toBeInTheDocument();
    });

    it('should render ProtectedRoute', () => {
      render(<GroupsPage />);
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should render MainLayout', () => {
      render(<GroupsPage />);
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    it('should render custom groups page wrapper', () => {
      render(<GroupsPage />);
      const wrapper = screen.getByTestId('main-layout').querySelector('.cus-manage-groups-pg');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Component Hierarchy', () => {
    it('should render ProtectedRoute as wrapper', () => {
      render(<GroupsPage />);
      const page = screen.getByTestId('groups-page');
      const protectedRoute = screen.getByTestId('protected-route');
      expect(page).toContainElement(protectedRoute);
    });

    it('should render MainLayout inside ProtectedRoute', () => {
      render(<GroupsPage />);
      const protectedRoute = screen.getByTestId('protected-route');
      const mainLayout = screen.getByTestId('main-layout');
      expect(protectedRoute).toContainElement(mainLayout);
    });

    it('should have correct nesting order', () => {
      render(<GroupsPage />);
      const page = screen.getByTestId('groups-page');
      const protectedRoute = screen.getByTestId('protected-route');
      const mainLayout = screen.getByTestId('main-layout');
      
      expect(page).toContainElement(protectedRoute);
      expect(protectedRoute).toContainElement(mainLayout);
    });

    it('should have custom wrapper inside MainLayout', () => {
      render(<GroupsPage />);
      const mainLayout = screen.getByTestId('main-layout');
      const wrapper = mainLayout.querySelector('.cus-manage-groups-pg');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Dynamic Import', () => {
    it('should show loading state', () => {
      render(<GroupsPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should have loading div with correct class', () => {
      render(<GroupsPage />);
      const loadingDiv = screen.getByText('Loading...').closest('div');
      expect(loadingDiv).toHaveClass('p-6');
    });
  });

  describe('Props', () => {
    it('should accept isTesting prop', () => {
      render(<GroupsPage isTesting={false} />);
      expect(screen.getByTestId('groups-page')).toBeInTheDocument();
    });

    it('should render when isTesting is true', () => {
      render(<GroupsPage isTesting={true} />);
      expect(screen.getByTestId('groups-page')).toBeInTheDocument();
    });

    it('should render all components with isTesting prop', () => {
      render(<GroupsPage isTesting={true} />);
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });
  });

  describe('Default Props', () => {
    it('should work without props', () => {
      render(<GroupsPage />);
      expect(screen.getByTestId('groups-page')).toBeInTheDocument();
    });

    it('should render all nested components without props', () => {
      render(<GroupsPage />);
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should have a root div element', () => {
      render(<GroupsPage />);
      const page = screen.getByTestId('groups-page');
      expect(page.tagName).toBe('DIV');
    });

    it('should render exactly one ProtectedRoute', () => {
      render(<GroupsPage />);
      const protectedRoutes = screen.getAllByTestId('protected-route');
      expect(protectedRoutes).toHaveLength(1);
    });

    it('should render exactly one MainLayout', () => {
      render(<GroupsPage />);
      const mainLayouts = screen.getAllByTestId('main-layout');
      expect(mainLayouts).toHaveLength(1);
    });
  });

  describe('SSR Configuration', () => {
    it('should use client directive', () => {
      // The file has 'use client' directive at the top
      // This test verifies the component renders in client mode
      render(<GroupsPage />);
      expect(screen.getByTestId('groups-page')).toBeInTheDocument();
    });

    it('should render with loading state for dynamic content', () => {
      // Dynamic import is configured with ssr: false and shows loading
      render(<GroupsPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have testid for testing', () => {
      render(<GroupsPage />);
      const page = screen.getByTestId('groups-page');
      expect(page).toHaveAttribute('data-testid', 'groups-page');
    });

    it('should render all child components with testids', () => {
      render(<GroupsPage />);
      expect(screen.getByTestId('groups-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should integrate ProtectedRoute correctly', () => {
      render(<GroupsPage />);
      const protectedRoute = screen.getByTestId('protected-route');
      expect(protectedRoute).toBeInTheDocument();
    });

    it('should integrate MainLayout correctly', () => {
      render(<GroupsPage />);
      const mainLayout = screen.getByTestId('main-layout');
      expect(mainLayout).toBeInTheDocument();
    });

    it('should pass children to ProtectedRoute', () => {
      render(<GroupsPage />);
      const protectedRoute = screen.getByTestId('protected-route');
      const mainLayout = screen.getByTestId('main-layout');
      expect(protectedRoute).toContainElement(mainLayout);
    });

    it('should render loading content inside MainLayout', () => {
      render(<GroupsPage />);
      const mainLayout = screen.getByTestId('main-layout');
      const loadingDiv = screen.getByText('Loading...');
      expect(mainLayout).toContainElement(loadingDiv);
    });
  });

  describe('Rendering Consistency', () => {
    it('should render consistently on multiple renders', () => {
      const { rerender } = render(<GroupsPage />);
      expect(screen.getByTestId('groups-page')).toBeInTheDocument();
      
      rerender(<GroupsPage />);
      expect(screen.getByTestId('groups-page')).toBeInTheDocument();
    });

    it('should maintain component structure on rerender', () => {
      const { rerender } = render(<GroupsPage />);
      const initialPage = screen.getByTestId('groups-page');
      
      rerender(<GroupsPage />);
      const rerenderPage = screen.getByTestId('groups-page');
      
      expect(initialPage).toBeInTheDocument();
      expect(rerenderPage).toBeInTheDocument();
    });
  });

  describe('Type Safety', () => {
    it('should accept valid props', () => {
      expect(() => render(<GroupsPage isTesting={false} />)).not.toThrow();
    });

    it('should work with isTesting true', () => {
      expect(() => render(<GroupsPage isTesting={true} />)).not.toThrow();
    });

    it('should work with default values', () => {
      expect(() => render(<GroupsPage />)).not.toThrow();
    });
  });

  describe('Component Existence', () => {
    it('should render without errors', () => {
      const { container } = render(<GroupsPage />);
      expect(container).toBeInTheDocument();
    });

    it('should have content', () => {
      const { container } = render(<GroupsPage />);
      expect(container.firstChild).not.toBeNull();
    });

    it('should render all expected elements', () => {
      render(<GroupsPage />);
      expect(screen.getByTestId('groups-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should have custom groups page class', () => {
      render(<GroupsPage />);
      const wrapper = screen.getByTestId('main-layout').querySelector('.cus-manage-groups-pg');
      expect(wrapper).toHaveClass('cus-manage-groups-pg');
    });

    it('should nest custom wrapper correctly', () => {
      render(<GroupsPage />);
      const mainLayout = screen.getByTestId('main-layout');
      const customWrapper = mainLayout.querySelector('.cus-manage-groups-pg');
      expect(mainLayout).toContainElement(customWrapper);
    });
  });

  describe('Layout Structure', () => {
    it('should have proper layout hierarchy', () => {
      render(<GroupsPage />);
      const page = screen.getByTestId('groups-page');
      const protectedRoute = screen.getByTestId('protected-route');
      const mainLayout = screen.getByTestId('main-layout');
      
      expect(page.children[0]).toBe(protectedRoute);
      expect(protectedRoute.children[0]).toBe(mainLayout);
    });

    it('should contain exactly one custom wrapper div', () => {
      render(<GroupsPage />);
      const wrappers = document.querySelectorAll('.cus-manage-groups-pg');
      expect(wrappers).toHaveLength(1);
    });
  });
});

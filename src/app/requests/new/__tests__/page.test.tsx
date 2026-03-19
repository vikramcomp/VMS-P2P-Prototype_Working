import React from 'react';
import { render, screen } from '@testing-library/react';
import AddNewRequestPage from '../page';

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

// Mock RequestForm
jest.mock('@/components/requests/request-form', () => ({
  __esModule: true,
  default: ({ mode }: { mode: string }) => (
    <div data-testid="request-form" data-mode={mode}>Request Form - {mode} mode</div>
  ),
}));

describe('AddNewRequestPage', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<AddNewRequestPage />);
      expect(screen.getByTestId('add-new-request-page')).toBeInTheDocument();
    });

    it('should render the main container', () => {
      const { container } = render(<AddNewRequestPage />);
      expect(container.firstChild).toBeTruthy();
    });

    it('should have correct testid', () => {
      render(<AddNewRequestPage />);
      const page = screen.getByTestId('add-new-request-page');
      expect(page).toHaveAttribute('data-testid', 'add-new-request-page');
    });
  });

  describe('Component Hierarchy', () => {
    it('should render ProtectedRoute', () => {
      render(<AddNewRequestPage />);
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should render MainLayout', () => {
      render(<AddNewRequestPage />);
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    it('should render RequestForm', () => {
      render(<AddNewRequestPage />);
      expect(screen.getByTestId('request-form')).toBeInTheDocument();
    });

    it('should have correct component nesting', () => {
      render(<AddNewRequestPage />);
      const protectedRoute = screen.getByTestId('protected-route');
      const mainLayout = screen.getByTestId('main-layout');
      const requestForm = screen.getByTestId('request-form');
      
      expect(protectedRoute).toContainElement(mainLayout);
      expect(mainLayout).toContainElement(requestForm);
    });
  });

  describe('RequestForm Props', () => {
    it('should pass mode="add" to RequestForm', () => {
      render(<AddNewRequestPage />);
      const requestForm = screen.getByTestId('request-form');
      expect(requestForm).toHaveAttribute('data-mode', 'add');
    });

    it('should display RequestForm with add mode text', () => {
      render(<AddNewRequestPage />);
      expect(screen.getByText('Request Form - add mode')).toBeInTheDocument();
    });

    it('should render RequestForm with correct mode', () => {
      render(<AddNewRequestPage />);
      const requestForm = screen.getByTestId('request-form');
      expect(requestForm.getAttribute('data-mode')).toBe('add');
    });
  });

  describe('Props Handling', () => {
    it('should accept isTesting prop as false', () => {
      render(<AddNewRequestPage isTesting={false} />);
      expect(screen.getByTestId('add-new-request-page')).toBeInTheDocument();
    });

    it('should accept isTesting prop as true', () => {
      render(<AddNewRequestPage isTesting={true} />);
      expect(screen.getByTestId('add-new-request-page')).toBeInTheDocument();
    });

    it('should handle undefined isTesting prop', () => {
      render(<AddNewRequestPage isTesting={undefined} />);
      expect(screen.getByTestId('add-new-request-page')).toBeInTheDocument();
    });

    it('should work without any props', () => {
      render(<AddNewRequestPage />);
      expect(screen.getByTestId('add-new-request-page')).toBeInTheDocument();
    });
  });

  describe('Structure', () => {
    it('should have a root div element', () => {
      const { container } = render(<AddNewRequestPage />);
      expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
    });

    it('should contain protected route wrapper', () => {
      render(<AddNewRequestPage />);
      const page = screen.getByTestId('add-new-request-page');
      const protectedRoute = screen.getByTestId('protected-route');
      expect(page).toContainElement(protectedRoute);
    });

    it('should wrap content in proper order', () => {
      render(<AddNewRequestPage />);
      const page = screen.getByTestId('add-new-request-page');
      const protectedRoute = screen.getByTestId('protected-route');
      const mainLayout = screen.getByTestId('main-layout');
      
      expect(page).toContainElement(protectedRoute);
      expect(protectedRoute).toContainElement(mainLayout);
    });
  });

  describe('Accessibility', () => {
    it('should have testid for testing', () => {
      render(<AddNewRequestPage />);
      expect(screen.getByTestId('add-new-request-page')).toBeInTheDocument();
    });

    it('should be accessible by test id', () => {
      const { getByTestId } = render(<AddNewRequestPage />);
      expect(getByTestId('add-new-request-page')).toBeTruthy();
    });
  });

  describe('Integration', () => {
    it('should integrate with ProtectedRoute component', () => {
      render(<AddNewRequestPage />);
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should integrate with MainLayout component', () => {
      render(<AddNewRequestPage />);
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    it('should integrate with RequestForm component', () => {
      render(<AddNewRequestPage />);
      expect(screen.getByTestId('request-form')).toBeInTheDocument();
    });

    it('should render all required components', () => {
      render(<AddNewRequestPage />);
      expect(screen.getByTestId('add-new-request-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
      expect(screen.getByTestId('request-form')).toBeInTheDocument();
    });
  });

  describe('Consistency', () => {
    it('should render consistently on multiple calls', () => {
      const { rerender } = render(<AddNewRequestPage />);
      expect(screen.getByTestId('add-new-request-page')).toBeInTheDocument();
      
      rerender(<AddNewRequestPage />);
      expect(screen.getByTestId('add-new-request-page')).toBeInTheDocument();
    });

    it('should maintain structure on re-render', () => {
      const { rerender } = render(<AddNewRequestPage />);
      const firstRender = screen.getByTestId('add-new-request-page');
      
      rerender(<AddNewRequestPage />);
      const secondRender = screen.getByTestId('add-new-request-page');
      
      expect(firstRender).toBeTruthy();
      expect(secondRender).toBeTruthy();
    });

    it('should maintain mode prop on re-render', () => {
      const { rerender } = render(<AddNewRequestPage />);
      expect(screen.getByTestId('request-form')).toHaveAttribute('data-mode', 'add');
      
      rerender(<AddNewRequestPage />);
      expect(screen.getByTestId('request-form')).toHaveAttribute('data-mode', 'add');
    });
  });

  describe('Type Safety', () => {
    it('should accept valid props object', () => {
      render(<AddNewRequestPage isTesting={false} />);
      expect(screen.getByTestId('add-new-request-page')).toBeInTheDocument();
    });

    it('should work with empty props object', () => {
      render(<AddNewRequestPage />);
      expect(screen.getByTestId('add-new-request-page')).toBeInTheDocument();
    });
  });

  describe('Existence Tests', () => {
    it('should exist in the DOM', () => {
      const { container } = render(<AddNewRequestPage />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should be defined', () => {
      expect(AddNewRequestPage).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof AddNewRequestPage).toBe('function');
    });
  });

  describe('Layout Tests', () => {
    it('should use MainLayout wrapper', () => {
      render(<AddNewRequestPage />);
      const mainLayout = screen.getByTestId('main-layout');
      expect(mainLayout).toBeInTheDocument();
    });

    it('should be wrapped in ProtectedRoute', () => {
      render(<AddNewRequestPage />);
      const protectedRoute = screen.getByTestId('protected-route');
      expect(protectedRoute).toBeInTheDocument();
    });

    it('should have proper layout hierarchy', () => {
      render(<AddNewRequestPage />);
      const page = screen.getByTestId('add-new-request-page');
      const protectedRoute = screen.getByTestId('protected-route');
      const mainLayout = screen.getByTestId('main-layout');
      
      expect(page.contains(protectedRoute)).toBe(true);
      expect(protectedRoute.contains(mainLayout)).toBe(true);
    });
  });

  describe('Form Mode', () => {
    it('should always render form in add mode', () => {
      render(<AddNewRequestPage />);
      const requestForm = screen.getByTestId('request-form');
      expect(requestForm).toHaveAttribute('data-mode', 'add');
    });

    it('should not change mode on re-render', () => {
      const { rerender } = render(<AddNewRequestPage />);
      let requestForm = screen.getByTestId('request-form');
      expect(requestForm).toHaveAttribute('data-mode', 'add');
      
      rerender(<AddNewRequestPage />);
      requestForm = screen.getByTestId('request-form');
      expect(requestForm).toHaveAttribute('data-mode', 'add');
    });
  });
});

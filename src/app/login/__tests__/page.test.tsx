import React from 'react';
import { render, screen } from '@testing-library/react';
import Login from '../page';

// Mock LoginPage component
jest.mock('@/components/auth/login-page', () => ({
  __esModule: true,
  default: () => <div data-testid="login-page-component">Login Page Component</div>,
}));

describe('Login', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<Login />);
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should render the main container', () => {
      const { container } = render(<Login />);
      expect(container.firstChild).toBeTruthy();
    });

    it('should have correct testid', () => {
      render(<Login />);
      const page = screen.getByTestId('login-page');
      expect(page).toHaveAttribute('data-testid', 'login-page');
    });
  });

  describe('LoginPage Component', () => {
    it('should render LoginPage component', () => {
      render(<Login />);
      expect(screen.getByTestId('login-page-component')).toBeInTheDocument();
    });

    it('should display LoginPage component text', () => {
      render(<Login />);
      expect(screen.getByText('Login Page Component')).toBeInTheDocument();
    });

    it('should contain LoginPage component', () => {
      render(<Login />);
      const page = screen.getByTestId('login-page');
      const loginPageComponent = screen.getByTestId('login-page-component');
      expect(page).toContainElement(loginPageComponent);
    });
  });

  describe('Props Handling', () => {
    it('should accept isTesting prop as false', () => {
      render(<Login isTesting={false} />);
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should accept isTesting prop as true', () => {
      render(<Login isTesting={true} />);
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should handle undefined isTesting prop', () => {
      render(<Login isTesting={undefined} />);
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should work without any props', () => {
      render(<Login />);
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  describe('Structure', () => {
    it('should have a root div element', () => {
      const { container } = render(<Login />);
      expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
    });

    it('should wrap LoginPage component', () => {
      render(<Login />);
      const page = screen.getByTestId('login-page');
      const loginPageComponent = screen.getByTestId('login-page-component');
      expect(page).toContainElement(loginPageComponent);
    });
  });

  describe('Accessibility', () => {
    it('should have testid for testing', () => {
      render(<Login />);
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should be accessible by test id', () => {
      const { getByTestId } = render(<Login />);
      expect(getByTestId('login-page')).toBeTruthy();
    });
  });

  describe('Integration', () => {
    it('should integrate with LoginPage component', () => {
      render(<Login />);
      expect(screen.getByTestId('login-page-component')).toBeInTheDocument();
    });

    it('should render all required components', () => {
      render(<Login />);
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.getByTestId('login-page-component')).toBeInTheDocument();
    });
  });

  describe('Consistency', () => {
    it('should render consistently on multiple calls', () => {
      const { rerender } = render(<Login />);
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      
      rerender(<Login />);
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should maintain structure on re-render', () => {
      const { rerender } = render(<Login />);
      const firstRender = screen.getByTestId('login-page');
      
      rerender(<Login />);
      const secondRender = screen.getByTestId('login-page');
      
      expect(firstRender).toBeTruthy();
      expect(secondRender).toBeTruthy();
    });
  });

  describe('Type Safety', () => {
    it('should accept valid props object', () => {
      render(<Login isTesting={false} />);
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should work with empty props object', () => {
      render(<Login />);
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  describe('Existence Tests', () => {
    it('should exist in the DOM', () => {
      const { container } = render(<Login />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should be defined', () => {
      expect(Login).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof Login).toBe('function');
    });
  });

  describe('Component Tests', () => {
    it('should render only one LoginPage component', () => {
      render(<Login />);
      const loginPages = screen.getAllByTestId('login-page-component');
      expect(loginPages).toHaveLength(1);
    });

    it('should pass through to LoginPage component', () => {
      render(<Login />);
      expect(screen.getByTestId('login-page-component')).toBeInTheDocument();
    });
  });

  describe('Wrapper Tests', () => {
    it('should have wrapper with testid', () => {
      render(<Login />);
      const wrapper = screen.getByTestId('login-page');
      expect(wrapper).toBeInTheDocument();
    });

    it('should wrap content in div', () => {
      const { container } = render(<Login />);
      const wrapper = container.querySelector('[data-testid="login-page"]');
      expect(wrapper?.tagName).toBe('DIV');
    });
  });
});

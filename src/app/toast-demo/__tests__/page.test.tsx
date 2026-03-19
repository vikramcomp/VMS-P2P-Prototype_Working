import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ToastDemoPage from '../page';

// Mock useToast hook
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant, ...props }: any) => (
    <button onClick={onClick} className={className} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}));

describe('ToastDemoPage', () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<ToastDemoPage />);
      expect(screen.getByTestId('toast-demo-page')).toBeInTheDocument();
    });

    it('should render the page title', () => {
      render(<ToastDemoPage />);
      expect(screen.getByText('Toast UI Demo')).toBeInTheDocument();
    });

    it('should render the card title', () => {
      render(<ToastDemoPage />);
      expect(screen.getByText('Test Different Toast Variants')).toBeInTheDocument();
    });

    it('should have correct testid', () => {
      render(<ToastDemoPage />);
      const page = screen.getByTestId('toast-demo-page');
      expect(page).toHaveAttribute('data-testid', 'toast-demo-page');
    });
  });

  describe('Buttons', () => {
    it('should render success toast button', () => {
      render(<ToastDemoPage />);
      expect(screen.getByTestId('success-toast-button')).toBeInTheDocument();
    });

    it('should render error toast button', () => {
      render(<ToastDemoPage />);
      expect(screen.getByTestId('error-toast-button')).toBeInTheDocument();
    });

    it('should render warning toast button', () => {
      render(<ToastDemoPage />);
      expect(screen.getByTestId('warning-toast-button')).toBeInTheDocument();
    });

    it('should render info toast button', () => {
      render(<ToastDemoPage />);
      expect(screen.getByTestId('info-toast-button')).toBeInTheDocument();
    });

    it('should display correct button text for success', () => {
      render(<ToastDemoPage />);
      expect(screen.getByText('Show Success Toast')).toBeInTheDocument();
    });

    it('should display correct button text for error', () => {
      render(<ToastDemoPage />);
      expect(screen.getByText('Show Error Toast')).toBeInTheDocument();
    });

    it('should display correct button text for warning', () => {
      render(<ToastDemoPage />);
      expect(screen.getByText('Show Warning Toast')).toBeInTheDocument();
    });

    it('should display correct button text for info', () => {
      render(<ToastDemoPage />);
      expect(screen.getByText('Show Info Toast')).toBeInTheDocument();
    });
  });

  describe('Toast Functionality', () => {
    it('should call toast with success variant when success button is clicked', () => {
      render(<ToastDemoPage />);
      const button = screen.getByTestId('success-toast-button');
      fireEvent.click(button);
      
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success!',
        description: 'Your operation completed successfully.',
        variant: 'success',
      });
    });

    it('should call toast with destructive variant when error button is clicked', () => {
      render(<ToastDemoPage />);
      const button = screen.getByTestId('error-toast-button');
      fireEvent.click(button);
      
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error!',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    });

    it('should call toast with warning variant when warning button is clicked', () => {
      render(<ToastDemoPage />);
      const button = screen.getByTestId('warning-toast-button');
      fireEvent.click(button);
      
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Warning!',
        description: 'Please check your input and proceed with caution.',
        variant: 'warning',
      });
    });

    it('should call toast with default variant when info button is clicked', () => {
      render(<ToastDemoPage />);
      const button = screen.getByTestId('info-toast-button');
      fireEvent.click(button);
      
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Information',
        description: "Here's some helpful information for you.",
        variant: 'default',
      });
    });

    it('should call toast exactly once per button click', () => {
      render(<ToastDemoPage />);
      const button = screen.getByTestId('success-toast-button');
      
      mockToast.mockClear();
      fireEvent.click(button);
      
      expect(mockToast).toHaveBeenCalledTimes(1);
    });
  });

  describe('Props Handling', () => {
    it('should accept isTesting prop as false', () => {
      render(<ToastDemoPage isTesting={false} />);
      expect(screen.getByTestId('toast-demo-page')).toBeInTheDocument();
    });

    it('should accept isTesting prop as true', () => {
      render(<ToastDemoPage isTesting={true} />);
      expect(screen.getByTestId('toast-demo-page')).toBeInTheDocument();
    });

    it('should handle undefined isTesting prop', () => {
      render(<ToastDemoPage isTesting={undefined} />);
      expect(screen.getByTestId('toast-demo-page')).toBeInTheDocument();
    });

    it('should work without any props', () => {
      render(<ToastDemoPage />);
      expect(screen.getByTestId('toast-demo-page')).toBeInTheDocument();
    });
  });

  describe('Documentation Content', () => {
    it('should display toast variants heading', () => {
      render(<ToastDemoPage />);
      expect(screen.getByText('Toast Variants:')).toBeInTheDocument();
    });

    it('should display success variant description', () => {
      render(<ToastDemoPage />);
      expect(screen.getByText(/Green theme with check circle icon/i)).toBeInTheDocument();
    });

    it('should display error variant description', () => {
      render(<ToastDemoPage />);
      expect(screen.getByText(/Red theme with X circle icon/i)).toBeInTheDocument();
    });

    it('should display warning variant description', () => {
      render(<ToastDemoPage />);
      expect(screen.getByText(/Amber theme with triangle icon/i)).toBeInTheDocument();
    });

    it('should display info variant description', () => {
      render(<ToastDemoPage />);
      expect(screen.getByText(/Blue theme with info circle icon/i)).toBeInTheDocument();
    });
  });

  describe('Layout and Structure', () => {
    it('should have min-h-screen class on container', () => {
      render(<ToastDemoPage />);
      const container = screen.getByTestId('toast-demo-page');
      expect(container).toHaveClass('min-h-screen');
    });

    it('should render all four buttons', () => {
      render(<ToastDemoPage />);
      const buttons = [
        screen.getByTestId('success-toast-button'),
        screen.getByTestId('error-toast-button'),
        screen.getByTestId('warning-toast-button'),
        screen.getByTestId('info-toast-button'),
      ];
      expect(buttons).toHaveLength(4);
    });

    it('should exist in the DOM', () => {
      const { container } = render(<ToastDemoPage />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Consistency', () => {
    it('should render consistently on multiple calls', () => {
      const { rerender } = render(<ToastDemoPage />);
      expect(screen.getByTestId('toast-demo-page')).toBeInTheDocument();
      
      rerender(<ToastDemoPage />);
      expect(screen.getByTestId('toast-demo-page')).toBeInTheDocument();
    });

    it('should maintain structure on re-render', () => {
      const { rerender } = render(<ToastDemoPage />);
      const firstRender = screen.getByTestId('toast-demo-page');
      
      rerender(<ToastDemoPage />);
      const secondRender = screen.getByTestId('toast-demo-page');
      
      expect(firstRender).toBeTruthy();
      expect(secondRender).toBeTruthy();
    });
  });

  describe('Type Safety', () => {
    it('should accept valid props object', () => {
      render(<ToastDemoPage isTesting={false} />);
      expect(screen.getByTestId('toast-demo-page')).toBeInTheDocument();
    });

    it('should work with empty props object', () => {
      render(<ToastDemoPage />);
      expect(screen.getByTestId('toast-demo-page')).toBeInTheDocument();
    });
  });

  describe('Existence Tests', () => {
    it('should be defined', () => {
      expect(ToastDemoPage).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof ToastDemoPage).toBe('function');
    });
  });

  describe('Multiple Button Clicks', () => {
    it('should handle multiple success button clicks', () => {
      render(<ToastDemoPage />);
      const button = screen.getByTestId('success-toast-button');
      
      mockToast.mockClear();
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(mockToast).toHaveBeenCalledTimes(2);
    });

    it('should handle clicks on different buttons', () => {
      render(<ToastDemoPage />);
      
      mockToast.mockClear();
      fireEvent.click(screen.getByTestId('success-toast-button'));
      fireEvent.click(screen.getByTestId('error-toast-button'));
      fireEvent.click(screen.getByTestId('warning-toast-button'));
      fireEvent.click(screen.getByTestId('info-toast-button'));
      
      expect(mockToast).toHaveBeenCalledTimes(4);
    });
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConfirmationDialog } from '../confirmation-dialog';

// Mock the Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant, style }: any) => (
    <button onClick={onClick} className={className} data-variant={variant} style={style}>
      {children}
    </button>
  ),
}));

// Mock the Card components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardTitle: ({ children, className }: any) => <h2 className={className}>{children}</h2>,
  CardDescription: ({ children, className }: any) => <p className={className}>{children}</p>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertTriangle: ({ className }: any) => <svg className={className} data-testid="alert-icon" />,
}));

describe('ConfirmationDialog', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Visibility', () => {
    it('should not render when isOpen is false', () => {
      render(
        <ConfirmationDialog
          isOpen={false}
          title="Test Title"
          message="Test Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Message')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Test Title"
          message="Test Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Message')).toBeInTheDocument();
    });
  });

  describe('Content Rendering', () => {
    it('should display the correct title and message', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Delete Confirmation"
          message="Are you sure you want to delete this item?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.getByText('Delete Confirmation')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
    });

    it('should render alert icon', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
    });

    it('should render with default button texts', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.getByText('Yes')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should render with custom button texts', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
          confirmText="Delete"
          cancelText="Go Back"
        />
      );
      
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });
  });

  describe('Button Actions', () => {
    it('should call onConfirm when confirm button is clicked', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const confirmButton = screen.getByText('Yes');
      fireEvent.click(confirmButton);
      
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnCancel).not.toHaveBeenCalled();
    });

    it('should call onCancel when cancel button is clicked', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Variant Styles', () => {
    it('should apply warning variant styles by default', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const icon = screen.getByTestId('alert-icon');
      expect(icon).toHaveClass('text-amber-600');
      
      const confirmButton = screen.getByText('Yes');
      expect(confirmButton).toHaveClass('bg-amber-600');
    });

    it('should apply warning variant styles explicitly', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
          variant="warning"
        />
      );
      
      const icon = screen.getByTestId('alert-icon');
      expect(icon).toHaveClass('text-amber-600');
      
      const confirmButton = screen.getByText('Yes');
      expect(confirmButton).toHaveClass('bg-amber-600');
      expect(confirmButton).toHaveClass('hover:bg-amber-700');
    });

    it('should apply danger variant styles', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
          variant="danger"
        />
      );
      
      const icon = screen.getByTestId('alert-icon');
      expect(icon).toHaveClass('text-red-600');
      
      const confirmButton = screen.getByText('Yes');
      expect(confirmButton).toHaveClass('bg-red-600');
      expect(confirmButton).toHaveClass('hover:bg-red-700');
    });

    it('should apply info variant styles', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
          variant="info"
        />
      );
      
      const icon = screen.getByTestId('alert-icon');
      expect(icon).toHaveClass('text-blue-600');
      
      const confirmButton = screen.getByText('Yes');
      expect(confirmButton).toHaveClass('bg-blue-600');
      expect(confirmButton).toHaveClass('hover:bg-blue-700');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom confirmButtonStyle', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
          confirmButtonStyle="bg-custom-color hover:bg-custom-hover"
        />
      );
      
      const confirmButton = screen.getByText('Yes');
      expect(confirmButton).toHaveClass('bg-custom-color');
      expect(confirmButton).toHaveClass('hover:bg-custom-hover');
    });

    it('should apply custom confirmButtonBgColor', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
          confirmButtonBgColor="#123456"
        />
      );
      
      const confirmButton = screen.getByText('Yes');
      expect(confirmButton).toHaveStyle({ backgroundColor: '#123456' });
    });

    it('should apply both custom style and bg color', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
          confirmButtonStyle="custom-class"
          confirmButtonBgColor="#abcdef"
        />
      );
      
      const confirmButton = screen.getByText('Yes');
      expect(confirmButton).toHaveClass('custom-class');
      expect(confirmButton).toHaveStyle({ backgroundColor: '#abcdef' });
    });

    it('should not apply inline style when confirmButtonBgColor is not provided', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const confirmButton = screen.getByText('Yes');
      expect(confirmButton).not.toHaveAttribute('style');
    });
  });

  describe('Dialog Overlay', () => {
    it('should render dialog with overlay', () => {
      const { container } = render(
        <ConfirmationDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const overlay = container.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
      expect(overlay).toBeInTheDocument();
    });

    it('should render with z-50 for proper layering', () => {
      const { container } = render(
        <ConfirmationDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const overlay = container.querySelector('.z-50');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('Button Layout', () => {
    it('should render buttons in correct order', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
          confirmText="Confirm"
          cancelText="Cancel"
        />
      );
      
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveTextContent('Cancel');
      expect(buttons[1]).toHaveTextContent('Confirm');
    });

    it('should apply outline variant to cancel button', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toHaveAttribute('data-variant', 'outline');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings for title and message', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title=""
          message=""
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      // Component should still render even with empty strings
      expect(screen.getByText('Yes')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should handle long title and message text', () => {
      const longTitle = 'This is a very long title that might wrap to multiple lines in the dialog';
      const longMessage = 'This is a very long message that contains a lot of text and might need to wrap to multiple lines to fit within the dialog width properly.';
      
      render(
        <ConfirmationDialog
          isOpen={true}
          title={longTitle}
          message={longMessage}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.getByText(longTitle)).toBeInTheDocument();
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle multiple rapid clicks on confirm button', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const confirmButton = screen.getByText('Yes');
      fireEvent.click(confirmButton);
      fireEvent.click(confirmButton);
      fireEvent.click(confirmButton);
      
      expect(mockOnConfirm).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple rapid clicks on cancel button', () => {
      render(
        <ConfirmationDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      fireEvent.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalledTimes(2);
    });
  });

  describe('Re-rendering', () => {
    it('should update when props change', () => {
      const { rerender } = render(
        <ConfirmationDialog
          isOpen={true}
          title="Original Title"
          message="Original Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.getByText('Original Title')).toBeInTheDocument();
      expect(screen.getByText('Original Message')).toBeInTheDocument();
      
      rerender(
        <ConfirmationDialog
          isOpen={true}
          title="Updated Title"
          message="Updated Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.getByText('Updated Title')).toBeInTheDocument();
      expect(screen.getByText('Updated Message')).toBeInTheDocument();
      expect(screen.queryByText('Original Title')).not.toBeInTheDocument();
    });

    it('should hide when isOpen changes to false', () => {
      const { rerender } = render(
        <ConfirmationDialog
          isOpen={true}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.getByText('Test')).toBeInTheDocument();
      
      rerender(
        <ConfirmationDialog
          isOpen={false}
          title="Test"
          message="Message"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.queryByText('Test')).not.toBeInTheDocument();
    });
  });
});

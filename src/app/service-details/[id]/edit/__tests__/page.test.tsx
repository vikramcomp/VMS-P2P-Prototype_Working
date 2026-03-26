import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditServiceDetailPage from '../page';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { serviceDetailsService } from '@/services/service-details-service';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// Mock useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock service-details-service
jest.mock('@/services/service-details-service', () => ({
  serviceDetailsService: {
    getServiceDetail: jest.fn(),
    updateServiceDetail: jest.fn(),
  },
}));

// Mock components
jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="main-layout">{children}</div>,
}));

jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div data-testid="protected-route">{children}</div>,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, disabled, className, variant, size, style }: any) => (
    <button onClick={onClick} type={type} disabled={disabled} className={className} style={style}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('EditServiceDetailPage', () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();
  const mockServiceDetail = {
    VendorMgrServiceDetailId: 1,
    ServiceDetailName: 'Test Service Detail',
    ServiceDetailDescription: 'Test Description',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useParams as jest.Mock).mockReturnValue({
      id: '1',
    });
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });
    (serviceDetailsService.getServiceDetail as jest.Mock).mockResolvedValue({
      Data: mockServiceDetail,
    });
  });

  describe('Loading and Rendering', () => {
    it('should display loading state initially', () => {
      render(<EditServiceDetailPage />);
      
      expect(screen.getByText(/Loading item.../i)).toBeInTheDocument();
    });

    it('should load and display service detail data', async () => {
      render(<EditServiceDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Service Detail')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
      });
    });

    it('should render all form fields', async () => {
      render(<EditServiceDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter item name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter item description/i)).toBeInTheDocument();
      });
    });

    it('should render action buttons', async () => {
      render(<EditServiceDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Update/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Discard Changes/i })).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when no changes are made', async () => {
      render(<EditServiceDetailPage />);
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Update/i });
        expect(submitButton).toBeDisabled();
      });
    });

    it('should enable submit button when valid changes are made', async () => {
      render(<EditServiceDetailPage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter item name/i);
        fireEvent.change(nameInput, { target: { value: 'Updated Service Detail' } });
      });

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Update/i });
        expect(submitButton).toBeEnabled();
      });
    });

    it('should show validation error for empty item name', async () => {
      render(<EditServiceDetailPage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter item name/i);
        fireEvent.change(nameInput, { target: { value: '' } });
      });

      await waitFor(() => {
        expect(screen.getByText(/Item name is required/i)).toBeInTheDocument();
      });
    });

    it('should show success indicator for valid item name', async () => {
      render(<EditServiceDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/✓ Valid item name/i)).toBeInTheDocument();
      });
    });
  });

  describe('Change Detection', () => {
    it('should show unsaved changes indicator when form is modified', async () => {
      render(<EditServiceDetailPage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter item name/i);
        fireEvent.change(nameInput, { target: { value: 'Modified Service Detail' } });
      });

      await waitFor(() => {
        expect(screen.getByText(/You have unsaved changes/i)).toBeInTheDocument();
      });
    });

    it('should not show unsaved changes indicator initially', async () => {
      render(<EditServiceDetailPage />);
      
      await waitFor(() => {
        expect(screen.queryByText(/You have unsaved changes/i)).not.toBeInTheDocument();
      });
    });

    it('should enable discard button when changes are made', async () => {
      render(<EditServiceDetailPage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter item name/i);
        fireEvent.change(nameInput, { target: { value: 'Modified Service Detail' } });
      });

      await waitFor(() => {
        const discardButton = screen.getByRole('button', { name: /Discard Changes/i });
        expect(discardButton).toBeEnabled();
      });
    });
  });

  describe('Form Submission', () => {
    it('should prevent submission without changes', async () => {
      render(<EditServiceDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter item name/i)).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /Update/i });
      fireEvent.click(submitButton);

      expect(serviceDetailsService.updateServiceDetail).not.toHaveBeenCalled();
    });
  });

  describe('Discard Functionality', () => {
    it('should reset form to original values', async () => {
      render(<EditServiceDetailPage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter item name/i);
        fireEvent.change(nameInput, { target: { value: 'Modified Service Detail' } });
      });

      const discardButton = screen.getByRole('button', { name: /Discard Changes/i });
      fireEvent.click(discardButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Service Detail')).toBeInTheDocument();
      });
    });

    it('should show discard confirmation toast', async () => {
      render(<EditServiceDetailPage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter item name/i);
        fireEvent.change(nameInput, { target: { value: 'Modified Service Detail' } });
      });

      const discardButton = screen.getByRole('button', { name: /Discard Changes/i });
      fireEvent.click(discardButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Changes Discarded",
          description: "Form has been reset to original values",
          variant: "default",
        });
      });
    });

    it('should disable discard button when no changes', async () => {
      render(<EditServiceDetailPage />);
      
      await waitFor(() => {
        const discardButton = screen.getByRole('button', { name: /Discard Changes/i });
        expect(discardButton).toBeDisabled();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back to service details page on cancel', async () => {
      render(<EditServiceDetailPage />);
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const backButton = buttons[0];
        fireEvent.click(backButton);
      });

      expect(mockPush).toHaveBeenCalledWith('/service-details');
    });
  });

  describe('Error Handling', () => {
    it('should handle API error when loading service detail', async () => {
      (serviceDetailsService.getServiceDetail as jest.Mock).mockRejectedValue(
        new Error('Failed to fetch')
      );

      render(<EditServiceDetailPage />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Error",
            variant: "destructive",
          })
        );
      });
    });

    it('should show not found message when service detail not found', async () => {
      (serviceDetailsService.getServiceDetail as jest.Mock).mockResolvedValue({
        Data: null,
      });

      render(<EditServiceDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Item not found/i)).toBeInTheDocument();
      });
    });

    it('should handle paginated response structure', async () => {
      (serviceDetailsService.getServiceDetail as jest.Mock).mockResolvedValue({
        Data: {
          Records: [mockServiceDetail],
        },
      });

      render(<EditServiceDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Service Detail')).toBeInTheDocument();
      });
    });
  });

  describe('Input Handling', () => {
    it('should update form data when inputs change', async () => {
      render(<EditServiceDetailPage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter item name/i);
        const descInput = screen.getByPlaceholderText(/Enter item description/i);

        fireEvent.change(nameInput, { target: { value: 'New Name' } });
        fireEvent.change(descInput, { target: { value: 'New Description' } });
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('New Name')).toBeInTheDocument();
        expect(screen.getByDisplayValue('New Description')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner during data fetch', () => {
      render(<EditServiceDetailPage />);
      
      expect(screen.getByText(/Loading item.../i)).toBeInTheDocument();
    });

    it('should hide loading spinner after data is loaded', async () => {
      render(<EditServiceDetailPage />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Loading item.../i)).not.toBeInTheDocument();
      });
    });
  });
});

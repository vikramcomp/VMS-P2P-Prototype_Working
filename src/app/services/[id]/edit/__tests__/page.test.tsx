import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditServicePage from '../page';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { servicesService } from '@/services/services-service';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// Mock useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock services-service
jest.mock('@/services/services-service', () => ({
  servicesService: {
    getServiceById: jest.fn(),
    updateService: jest.fn(),
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
  Button: ({ children, onClick, type, disabled, className }: any) => (
    <button onClick={onClick} type={type} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('EditServicePage', () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();
  const mockService = {
    VendorMgrServiceId: 1,
    ServiceName: 'Test Service',
    Description: 'Test Description',
    MaxAmount: 1000,
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
    (servicesService.getServiceById as jest.Mock).mockResolvedValue({
      success: true,
      data: mockService,
    });
  });

  describe('Loading and Rendering', () => {
    it('should display loading state initially', () => {
      render(<EditServicePage />);
      
      expect(screen.getByText(/Loading service data.../i)).toBeInTheDocument();
    });

    it('should load and display service data', async () => {
      render(<EditServicePage />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Service')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
      });
    });

    it('should display success toast after loading service', async () => {
      render(<EditServicePage />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Success",
          description: "Service data loaded successfully",
          variant: "success",
        });
      });
    });

    it('should handle camelCase API response', async () => {
      (servicesService.getServiceById as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          vendorMgrServiceId: 1,
          serviceName: 'Test Service',
          description: 'Test Description',
          maxAmount: 1000,
        },
      });

      render(<EditServicePage />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Service')).toBeInTheDocument();
      });
    });

    it('should render all form fields with labels', async () => {
      render(<EditServicePage />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter service name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter maximum amount/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter service description/i)).toBeInTheDocument();
      });
    });

    it('should render action buttons', async () => {
      render(<EditServicePage />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Update/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when no changes are made', async () => {
      render(<EditServicePage />);
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Update/i });
        expect(submitButton).toBeDisabled();
      });
    });

    it('should enable submit button when valid changes are made', async () => {
      render(<EditServicePage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter service name/i);
        fireEvent.change(nameInput, { target: { value: 'Updated Service' } });
      });

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Update/i });
        expect(submitButton).toBeEnabled();
      });
    });

    it('should show validation error for empty service name', async () => {
      render(<EditServicePage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter service name/i);
        fireEvent.change(nameInput, { target: { value: '' } });
        fireEvent.blur(nameInput);
      });

      await waitFor(() => {
        expect(screen.getByText(/Service name is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for empty description', async () => {
      render(<EditServicePage />);
      
      await waitFor(() => {
        const descInput = screen.getByPlaceholderText(/Enter service description/i);
        fireEvent.change(descInput, { target: { value: '' } });
        fireEvent.blur(descInput);
      });

      await waitFor(() => {
        expect(screen.getByText(/Description is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid max amount', async () => {
      render(<EditServicePage />);
      
      await waitFor(() => {
        const amountInput = screen.getByPlaceholderText(/Enter maximum amount/i);
        fireEvent.change(amountInput, { target: { value: '-100' } });
        fireEvent.blur(amountInput);
      });

      await waitFor(() => {
        expect(screen.getByText(/Valid max amount is required/i)).toBeInTheDocument();
      });
    });

    it('should show success indicator for valid inputs', async () => {
      render(<EditServicePage />);
      
      await waitFor(() => {
        expect(screen.getByText(/✓ Valid service name/i)).toBeInTheDocument();
        expect(screen.getByText(/✓ Valid description/i)).toBeInTheDocument();
        expect(screen.getByText(/✓ Valid amount/i)).toBeInTheDocument();
      });
    });
  });

  describe('Change Detection', () => {
    it('should show unsaved changes indicator when form is modified', async () => {
      render(<EditServicePage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter service name/i);
        fireEvent.change(nameInput, { target: { value: 'Modified Service' } });
      });

      await waitFor(() => {
        expect(screen.getByText(/You have unsaved changes/i)).toBeInTheDocument();
      });
    });

    it('should not show unsaved changes indicator initially', async () => {
      render(<EditServicePage />);
      
      await waitFor(() => {
        expect(screen.queryByText(/You have unsaved changes/i)).not.toBeInTheDocument();
      });
    });

    it('should enable reset button when changes are made', async () => {
      render(<EditServicePage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter service name/i);
        fireEvent.change(nameInput, { target: { value: 'Modified Service' } });
      });

      await waitFor(() => {
        const resetButton = screen.getByRole('button', { name: /Reset/i });
        expect(resetButton).toBeEnabled();
      });
    });
  });

  describe('Form Submission', () => {
    it('should prevent submission without changes', async () => {
      render(<EditServicePage />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter service name/i)).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /Update/i });
      fireEvent.click(submitButton);

      expect(servicesService.updateService).not.toHaveBeenCalled();
    });

  });

  describe('Reset Functionality', () => {
    it('should reset form to original values', async () => {
      render(<EditServicePage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter service name/i);
        fireEvent.change(nameInput, { target: { value: 'Modified Service' } });
      });

      const resetButton = screen.getByRole('button', { name: /Reset/i });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Service')).toBeInTheDocument();
      });
    });

    it('should show reset confirmation toast', async () => {
      render(<EditServicePage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter service name/i);
        fireEvent.change(nameInput, { target: { value: 'Modified Service' } });
      });

      const resetButton = screen.getByRole('button', { name: /Reset/i });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Form Reset",
          description: "Form has been reset to original values",
          variant: "default",
        });
      });
    });

    it('should disable reset button when no changes', async () => {
      render(<EditServicePage />);
      
      await waitFor(() => {
        const resetButton = screen.getByRole('button', { name: /Reset/i });
        expect(resetButton).toBeDisabled();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back to services page on cancel', async () => {
      render(<EditServicePage />);
      
      await waitFor(() => {
        const cancelButton = screen.getAllByRole('button')[0]; // Back button
        fireEvent.click(cancelButton);
      });

      expect(mockPush).toHaveBeenCalledWith('/services');
    });
  });

  describe('Error Handling', () => {
    it('should handle API error when loading service', async () => {
      (servicesService.getServiceById as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Service not found',
      });

      render(<EditServicePage />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Error",
          description: "Service not found",
          variant: "destructive",
        });
      });

      expect(mockPush).toHaveBeenCalledWith('/services');
    });

    it('should handle exception when loading service', async () => {
      (servicesService.getServiceById as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<EditServicePage />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Error",
          description: "An unexpected error occurred: Network error",
          variant: "destructive",
        });
      });

      expect(mockPush).toHaveBeenCalledWith('/services');
    });

    it('should handle missing service ID', async () => {
      (useParams as jest.Mock).mockReturnValue({
        id: undefined,
      });

      render(<EditServicePage />);
      
      await waitFor(() => {
        expect(servicesService.getServiceById).not.toHaveBeenCalled();
      });
    });
  });

  describe('Input Handling', () => {
    it('should update form data when inputs change', async () => {
      render(<EditServicePage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter service name/i);
        const descInput = screen.getByPlaceholderText(/Enter service description/i);
        const amountInput = screen.getByPlaceholderText(/Enter maximum amount/i);

        fireEvent.change(nameInput, { target: { value: 'New Name' } });
        fireEvent.change(descInput, { target: { value: 'New Description' } });
        fireEvent.change(amountInput, { target: { value: '2000' } });
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('New Name')).toBeInTheDocument();
        expect(screen.getByDisplayValue('New Description')).toBeInTheDocument();
        expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
      });
    });

    it('should trim whitespace from inputs on submission', async () => {
      (servicesService.updateService as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Service updated successfully',
      });

      render(<EditServicePage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter service name/i);
        fireEvent.change(nameInput, { target: { value: '  Trimmed Service  ' } });
      });

      const submitButton = screen.getByRole('button', { name: /Update/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(servicesService.updateService).toHaveBeenCalledWith(1, {
          VendorMgrServiceId: 1,
          ServiceName: 'Trimmed Service',
          Description: 'Test Description',
          MaxAmount: 1000,
        });
      });
    });

    it('should handle decimal values for max amount', async () => {
      render(<EditServicePage />);
      
      await waitFor(() => {
        const amountInput = screen.getByPlaceholderText(/Enter maximum amount/i);
        fireEvent.change(amountInput, { target: { value: '1500.75' } });
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('1500.75')).toBeInTheDocument();
      });
    });
  });

  describe('Touch State', () => {
    it('should mark field as touched on blur', async () => {
      render(<EditServicePage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter service name/i);
        fireEvent.change(nameInput, { target: { value: '' } });
        fireEvent.blur(nameInput);
      });

      await waitFor(() => {
        expect(screen.getByText(/Service name is required/i)).toBeInTheDocument();
      });
    });

    it('should not show validation errors before field is touched', async () => {
      render(<EditServicePage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter service name/i);
        fireEvent.change(nameInput, { target: { value: '' } });
      });

      expect(screen.queryByText(/Service name is required/i)).not.toBeInTheDocument();
    });
  });

  describe('Testing Mode Coverage', () => {
    it('should execute testing mode code when isTesting is true', async () => {
      render(<EditServicePage isTesting={true} />);
      
      await waitFor(() => {
        expect(servicesService.getServiceById).toHaveBeenCalled();
      });
    });
  });
});

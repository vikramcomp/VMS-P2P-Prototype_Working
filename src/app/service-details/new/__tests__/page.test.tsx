import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewServiceDetailPage from '../page';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { serviceDetailsService } from '@/services/service-details-service';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/hooks/use-toast');
jest.mock('@/services/service-details-service');
jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));
jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} type={type} {...props}>{children}</button>
  )
}));
jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children, content }: any) => <div title={content}>{children}</div>
}));

const mockPush = jest.fn();
const mockToast = jest.fn();

describe('NewServiceDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  // Loading and Rendering Tests
  describe('Loading and Rendering', () => {
    it('should render new service detail page with all form fields', () => {
      render(<NewServiceDetailPage />);
      
      expect(screen.getByTestId('new-service-detail-page')).toBeInTheDocument();
      expect(screen.getByText('Add New Item')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter item name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter item description')).toBeInTheDocument();
    });

    it('should render all action buttons', () => {
      render(<NewServiceDetailPage />);
      
      expect(screen.getByText('Submit')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('should display header with correct title and description', () => {
      render(<NewServiceDetailPage />);
      
      expect(screen.getByText('Add New Item')).toBeInTheDocument();
      expect(screen.getByText('Create a new item entry')).toBeInTheDocument();
    });

    it('should render required field indicator', () => {
      render(<NewServiceDetailPage />);
      
      const requiredIndicators = screen.getAllByText('*');
      expect(requiredIndicators.length).toBeGreaterThan(0);
    });
  });

  // Form Validation Tests
  describe('Form Validation', () => {
    it('should disable submit button when form is invalid', () => {
      render(<NewServiceDetailPage />);
      
      const submitButton = screen.getByText('Submit').closest('button');
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when service detail name is filled', () => {
      render(<NewServiceDetailPage />);
      
      const nameInput = screen.getByPlaceholderText('Enter item name');
      fireEvent.change(nameInput, { target: { value: 'Test Service Detail' } });
      
      const submitButton = screen.getByText('Submit').closest('button');
      expect(submitButton).not.toBeDisabled();
    });

    it('should show validation message for valid service detail name', () => {
      render(<NewServiceDetailPage />);
      
      const nameInput = screen.getByPlaceholderText('Enter item name');
      fireEvent.change(nameInput, { target: { value: 'Test Service Detail' } });
      
      expect(screen.getByText('✓ Valid item name')).toBeInTheDocument();
    });

    it('should not show validation message when name is empty', () => {
      render(<NewServiceDetailPage />);
      
      expect(screen.queryByText('✓ Valid item name')).not.toBeInTheDocument();
    });
  });

  // Input Handling Tests
  describe('Input Handling', () => {
    it('should handle service detail name input changes', () => {
      render(<NewServiceDetailPage />);
      
      const nameInput = screen.getByPlaceholderText('Enter item name');
      fireEvent.change(nameInput, { target: { value: 'New Service Detail' } });
      
      expect(nameInput).toHaveValue('New Service Detail');
    });

    it('should handle description input changes', () => {
      render(<NewServiceDetailPage />);
      
      const descriptionInput = screen.getByPlaceholderText('Enter item description');
      fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
      
      expect(descriptionInput).toHaveValue('Test description');
    });

    it('should update form data correctly when inputs change', () => {
      render(<NewServiceDetailPage />);
      
      const nameInput = screen.getByPlaceholderText('Enter item name');
      const descriptionInput = screen.getByPlaceholderText('Enter item description');
      
      fireEvent.change(nameInput, { target: { value: 'Service Name' } });
      fireEvent.change(descriptionInput, { target: { value: 'Service Description' } });
      
      expect(nameInput).toHaveValue('Service Name');
      expect(descriptionInput).toHaveValue('Service Description');
    });
  });

  // Form Submission Tests
  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      (serviceDetailsService.addServiceDetail as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Service detail created successfully'
      });
      
      render(<NewServiceDetailPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter item name'), { target: { value: 'Test Service Detail' } });
      fireEvent.change(screen.getByPlaceholderText('Enter item description'), { target: { value: 'Test description' } });
      
      const submitButton = screen.getByText('Submit').closest('button');
      fireEvent.click(submitButton!);
      
      await waitFor(() => {
        expect(serviceDetailsService.addServiceDetail).toHaveBeenCalledWith({
          VendorMgrServiceDetailId: null,
          ServiceDetailName: 'Test Service Detail',
          ServiceDetailDescription: 'Test description',
        });
      });
    });

    it('should show success toast and redirect on successful submission', async () => {
      (serviceDetailsService.addServiceDetail as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Service detail created successfully'
      });
      
      render(<NewServiceDetailPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter item name'), { target: { value: 'Test Service Detail' } });
      
      const submitButton = screen.getByText('Submit').closest('button');
      fireEvent.click(submitButton!);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Success',
          description: 'Item created successfully!',
          variant: 'success',
        });
      });
      
      expect(mockPush).toHaveBeenCalledWith('/service-details');
    });

    it('should show error toast when submission fails', async () => {
      (serviceDetailsService.addServiceDetail as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Failed to create service detail'
      });
      
      render(<NewServiceDetailPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter item name'), { target: { value: 'Test Service Detail' } });
      
      const submitButton = screen.getByText('Submit').closest('button');
      fireEvent.click(submitButton!);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to create item',
          variant: 'destructive',
        });
      });
    });

    it('should show validation error toast when form is invalid', async () => {
      render(<NewServiceDetailPage />);
      
      const form = screen.getByTestId('new-service-detail-page').querySelector('form');
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Validation Error',
          description: 'Please fill in all required fields correctly.',
          variant: 'destructive',
        });
      });
    });

    it('should handle unexpected errors during submission', async () => {
      (serviceDetailsService.addServiceDetail as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      render(<NewServiceDetailPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter item name'), { target: { value: 'Test Service Detail' } });
      
      const submitButton = screen.getByText('Submit').closest('button');
      fireEvent.click(submitButton!);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      });
    });

    it('should show loading state during submission', async () => {
      (serviceDetailsService.addServiceDetail as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );
      
      render(<NewServiceDetailPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter item name'), { target: { value: 'Test Service Detail' } });
      
      const submitButton = screen.getByText('Submit').closest('button');
      fireEvent.click(submitButton!);
      
      await waitFor(() => {
        expect(screen.getByText('Creating...')).toBeInTheDocument();
      });
    });

    it('should disable buttons during submission', async () => {
      (serviceDetailsService.addServiceDetail as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );
      
      render(<NewServiceDetailPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter item name'), { target: { value: 'Test Service Detail' } });
      
      const submitButton = screen.getByText('Submit').closest('button');
      fireEvent.click(submitButton!);
      
      await waitFor(() => {
        expect(screen.getByText('Reset').closest('button')).toBeDisabled();
      });
    });

    it('should submit with empty description', async () => {
      (serviceDetailsService.addServiceDetail as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Service detail created successfully'
      });
      
      render(<NewServiceDetailPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter item name'), { target: { value: 'Test Service Detail' } });
      
      const submitButton = screen.getByText('Submit').closest('button');
      fireEvent.click(submitButton!);
      
      await waitFor(() => {
        expect(serviceDetailsService.addServiceDetail).toHaveBeenCalledWith(
          expect.objectContaining({
            ServiceDetailDescription: '',
          })
        );
      });
    });
  });

  // Reset Functionality Tests
  describe('Reset Functionality', () => {
    it('should reset form fields when reset button is clicked', () => {
      render(<NewServiceDetailPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter item name'), { target: { value: 'Test Service Detail' } });
      fireEvent.change(screen.getByPlaceholderText('Enter item description'), { target: { value: 'Test description' } });
      
      const resetButton = screen.getByText('Reset').closest('button');
      fireEvent.click(resetButton!);
      
      expect(screen.getByPlaceholderText('Enter item name')).toHaveValue('');
      expect(screen.getByPlaceholderText('Enter item description')).toHaveValue('');
    });

    it('should disable submit button after reset if form becomes invalid', () => {
      render(<NewServiceDetailPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter item name'), { target: { value: 'Test Service Detail' } });
      
      const resetButton = screen.getByText('Reset').closest('button');
      fireEvent.click(resetButton!);
      
      const submitButton = screen.getByText('Submit').closest('button');
      expect(submitButton).toBeDisabled();
    });

    it('should not disable reset button when form is empty', () => {
      render(<NewServiceDetailPage />);
      
      const resetButton = screen.getByText('Reset').closest('button');
      expect(resetButton).not.toBeDisabled();
    });
  });

  // Edge Cases Tests
  describe('Edge Cases', () => {
    it('should handle service detail name with only whitespace', () => {
      render(<NewServiceDetailPage />);
      
      const nameInput = screen.getByPlaceholderText('Enter item name');
      fireEvent.change(nameInput, { target: { value: '   ' } });
      
      const submitButton = screen.getByText('Submit').closest('button');
      expect(submitButton).toBeDisabled();
    });

    it('should trim service detail name before validation', () => {
      render(<NewServiceDetailPage />);
      
      const nameInput = screen.getByPlaceholderText('Enter item name');
      fireEvent.change(nameInput, { target: { value: '  Test  ' } });
      
      const submitButton = screen.getByText('Submit').closest('button');
      expect(submitButton).not.toBeDisabled();
    });

    it('should handle long service detail names', () => {
      render(<NewServiceDetailPage />);
      
      const longName = 'A'.repeat(500);
      const nameInput = screen.getByPlaceholderText('Enter item name');
      fireEvent.change(nameInput, { target: { value: longName } });
      
      expect(nameInput).toHaveValue(longName);
    });

    it('should handle long descriptions', () => {
      render(<NewServiceDetailPage />);
      
      const longDescription = 'A'.repeat(1000);
      const descriptionInput = screen.getByPlaceholderText('Enter item description');
      fireEvent.change(descriptionInput, { target: { value: longDescription } });
      
      expect(descriptionInput).toHaveValue(longDescription);
    });

    it('should handle special characters in inputs', () => {
      render(<NewServiceDetailPage />);
      
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const nameInput = screen.getByPlaceholderText('Enter item name');
      fireEvent.change(nameInput, { target: { value: specialChars } });
      
      expect(nameInput).toHaveValue(specialChars);
    });
  });

  // UI State Tests
  describe('UI State', () => {
    it('should not prevent navigation during submission', async () => {
      (serviceDetailsService.addServiceDetail as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Success'
      });
      
      render(<NewServiceDetailPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter item name'), { target: { value: 'Test' } });
      
      const submitButton = screen.getByText('Submit').closest('button');
      fireEvent.click(submitButton!);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddNewSubgroupPage from '../page';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { subgroupsService } from '@/services/subgroups-service';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/hooks/use-toast');
jest.mock('@/services/subgroups-service');
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

describe('AddNewSubgroupPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  // Loading and Rendering Tests
  describe('Loading and Rendering', () => {
    it('should render add new subgroup page with all form fields', () => {
      render(<AddNewSubgroupPage />);
      
      expect(screen.getByTestId('add-new-subgroup-page')).toBeInTheDocument();
      expect(screen.getByText('Add New Subgroup')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter subgroup name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter subgroup description')).toBeInTheDocument();
    });

    it('should render all action buttons', () => {
      render(<AddNewSubgroupPage />);
      
      expect(screen.getByText('Create Subgroup')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('should render status dropdown with Active as default', () => {
      render(<AddNewSubgroupPage />);
      
      const statusSelect = screen.getByRole('combobox');
      expect(statusSelect).toHaveValue('1');
    });

    it('should display header with correct title and description', () => {
      render(<AddNewSubgroupPage />);
      
      expect(screen.getByText('Add New Subgroup')).toBeInTheDocument();
      expect(screen.getByText('Create a new subgroup in your system')).toBeInTheDocument();
    });
  });

  // Form Validation Tests
  describe('Form Validation', () => {
    it('should disable submit button when form is invalid', () => {
      render(<AddNewSubgroupPage />);
      
      const submitButton = screen.getByText('Create Subgroup').closest('button');
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when subgroup name is filled', () => {
      render(<AddNewSubgroupPage />);
      
      const nameInput = screen.getByPlaceholderText('Enter subgroup name');
      fireEvent.change(nameInput, { target: { value: 'Test Subgroup' } });
      
      const submitButton = screen.getByText('Create Subgroup').closest('button');
      expect(submitButton).not.toBeDisabled();
    });

    it('should show validation message for valid subgroup name', () => {
      render(<AddNewSubgroupPage />);
      
      const nameInput = screen.getByPlaceholderText('Enter subgroup name');
      fireEvent.change(nameInput, { target: { value: 'Test Subgroup' } });
      
      expect(screen.getByText('✓ Valid subgroup name')).toBeInTheDocument();
    });

    it('should show error message when subgroup name is touched but empty', () => {
      render(<AddNewSubgroupPage />);
      
      const nameInput = screen.getByPlaceholderText('Enter subgroup name');
      fireEvent.blur(nameInput);
      
      expect(screen.getByText('Subgroup name is required')).toBeInTheDocument();
    });

    it('should show validation message for status', () => {
      render(<AddNewSubgroupPage />);
      
      expect(screen.getByText('✓ Valid status selected')).toBeInTheDocument();
    });
  });

  // Input Handling Tests
  describe('Input Handling', () => {
    it('should handle subgroup name input changes', () => {
      render(<AddNewSubgroupPage />);
      
      const nameInput = screen.getByPlaceholderText('Enter subgroup name');
      fireEvent.change(nameInput, { target: { value: 'New Subgroup' } });
      
      expect(nameInput).toHaveValue('New Subgroup');
    });

    it('should handle description input changes', () => {
      render(<AddNewSubgroupPage />);
      
      const descriptionInput = screen.getByPlaceholderText('Enter subgroup description');
      fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
      
      expect(descriptionInput).toHaveValue('Test description');
    });

    it('should handle status selection changes', () => {
      render(<AddNewSubgroupPage />);
      
      const statusSelect = screen.getByRole('combobox');
      fireEvent.change(statusSelect, { target: { value: '0' } });
      
      expect(statusSelect).toHaveValue('0');
    });

    it('should update touched state on blur', () => {
      render(<AddNewSubgroupPage />);
      
      const nameInput = screen.getByPlaceholderText('Enter subgroup name');
      fireEvent.blur(nameInput);
      
      expect(screen.getByText('Subgroup name is required')).toBeInTheDocument();
    });
  });

  // Form Submission Tests
  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      (subgroupsService.addSubgroup as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Subgroup created successfully'
      });
      
      render(<AddNewSubgroupPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter subgroup name'), { target: { value: 'Test Subgroup' } });
      fireEvent.change(screen.getByPlaceholderText('Enter subgroup description'), { target: { value: 'Test description' } });
      
      const submitButton = screen.getByText('Create Subgroup').closest('button');
      fireEvent.click(submitButton!);
      
      await waitFor(() => {
        expect(subgroupsService.addSubgroup).toHaveBeenCalledWith({
          SubgroupId: 0,
          SubgroupName: 'Test Subgroup',
          SubgroupDescription: 'Test description',
          Status: 1,
        });
      });
    });

    it('should show success toast and redirect on successful submission', async () => {
      (subgroupsService.addSubgroup as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Subgroup created successfully'
      });
      
      render(<AddNewSubgroupPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter subgroup name'), { target: { value: 'Test Subgroup' } });
      
      const submitButton = screen.getByText('Create Subgroup').closest('button');
      fireEvent.click(submitButton!);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Success',
          description: 'Subgroup created successfully!',
          variant: 'success',
        });
      });
      
      expect(mockPush).toHaveBeenCalledWith('/subgroups');
    });

    it('should show error toast when submission fails', async () => {
      (subgroupsService.addSubgroup as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Failed to create subgroup'
      });
      
      render(<AddNewSubgroupPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter subgroup name'), { target: { value: 'Test Subgroup' } });
      
      const submitButton = screen.getByText('Create Subgroup').closest('button');
      fireEvent.click(submitButton!);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to create subgroup',
          variant: 'destructive',
        });
      });
    });

    it('should show validation error toast when form is invalid', async () => {
      render(<AddNewSubgroupPage />);
      
      const form = screen.getByTestId('add-new-subgroup-page').querySelector('form');
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
      (subgroupsService.addSubgroup as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      render(<AddNewSubgroupPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter subgroup name'), { target: { value: 'Test Subgroup' } });
      
      const submitButton = screen.getByText('Create Subgroup').closest('button');
      fireEvent.click(submitButton!);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Network error',
          variant: 'destructive',
        });
      });
    });

    it('should show loading state during submission', async () => {
      (subgroupsService.addSubgroup as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );
      
      render(<AddNewSubgroupPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter subgroup name'), { target: { value: 'Test Subgroup' } });
      
      const submitButton = screen.getByText('Create Subgroup').closest('button');
      fireEvent.click(submitButton!);
      
      await waitFor(() => {
        expect(screen.getByText('Creating...')).toBeInTheDocument();
      });
    });

    it('should disable buttons during submission', async () => {
      (subgroupsService.addSubgroup as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );
      
      render(<AddNewSubgroupPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter subgroup name'), { target: { value: 'Test Subgroup' } });
      
      const submitButton = screen.getByText('Create Subgroup').closest('button');
      fireEvent.click(submitButton!);
      
      await waitFor(() => {
        expect(screen.getByText('Reset').closest('button')).toBeDisabled();
      });
    });

    it('should show error message after submit attempt with empty name', async () => {
      render(<AddNewSubgroupPage />);
      
      const form = screen.getByTestId('add-new-subgroup-page').querySelector('form');
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText('Subgroup name is required')).toBeInTheDocument();
      });
    });
  });

  // Reset Functionality Tests
  describe('Reset Functionality', () => {
    it('should reset form fields when reset button is clicked', () => {
      render(<AddNewSubgroupPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter subgroup name'), { target: { value: 'Test Subgroup' } });
      fireEvent.change(screen.getByPlaceholderText('Enter subgroup description'), { target: { value: 'Test description' } });
      
      const resetButton = screen.getByText('Reset').closest('button');
      fireEvent.click(resetButton!);
      
      expect(screen.getByPlaceholderText('Enter subgroup name')).toHaveValue('');
      expect(screen.getByPlaceholderText('Enter subgroup description')).toHaveValue('');
    });

    it('should reset status to Active (1) when reset button is clicked', () => {
      render(<AddNewSubgroupPage />);
      
      const statusSelect = screen.getByRole('combobox');
      fireEvent.change(statusSelect, { target: { value: '0' } });
      
      const resetButton = screen.getByText('Reset').closest('button');
      fireEvent.click(resetButton!);
      
      expect(statusSelect).toHaveValue('1');
    });

    it('should reset touched state when reset button is clicked', () => {
      render(<AddNewSubgroupPage />);
      
      const nameInput = screen.getByPlaceholderText('Enter subgroup name');
      fireEvent.blur(nameInput);
      
      expect(screen.getByText('Subgroup name is required')).toBeInTheDocument();
      
      const resetButton = screen.getByText('Reset').closest('button');
      fireEvent.click(resetButton!);
      
      expect(screen.queryByText('Subgroup name is required')).not.toBeInTheDocument();
    });

    it('should show toast notification when form is reset', () => {
      render(<AddNewSubgroupPage />);
      
      const resetButton = screen.getByText('Reset').closest('button');
      fireEvent.click(resetButton!);
      
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Form Reset',
        description: 'All fields have been cleared',
        variant: 'default',
      });
    });
  });

  // Status Selection Tests
  describe('Status Selection', () => {
    it('should display both Active and In-Active status options', () => {
      render(<AddNewSubgroupPage />);
      
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('In-Active')).toBeInTheDocument();
    });

    it('should submit with selected status', async () => {
      (subgroupsService.addSubgroup as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Subgroup created successfully'
      });
      
      render(<AddNewSubgroupPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter subgroup name'), { target: { value: 'Test Subgroup' } });
      
      const statusSelect = screen.getByRole('combobox');
      fireEvent.change(statusSelect, { target: { value: '0' } });
      
      const submitButton = screen.getByText('Create Subgroup').closest('button');
      fireEvent.click(submitButton!);
      
      await waitFor(() => {
        expect(subgroupsService.addSubgroup).toHaveBeenCalledWith(
          expect.objectContaining({
            Status: 0,
          })
        );
      });
    });
  });

  // Edge Cases Tests
  describe('Edge Cases', () => {
    it('should handle subgroup name with only whitespace', () => {
      render(<AddNewSubgroupPage />);
      
      const nameInput = screen.getByPlaceholderText('Enter subgroup name');
      fireEvent.change(nameInput, { target: { value: '   ' } });
      
      const submitButton = screen.getByText('Create Subgroup').closest('button');
      expect(submitButton).toBeDisabled();
    });

    it('should trim subgroup name before validation', () => {
      render(<AddNewSubgroupPage />);
      
      const nameInput = screen.getByPlaceholderText('Enter subgroup name');
      fireEvent.change(nameInput, { target: { value: '  Test  ' } });
      
      const submitButton = screen.getByText('Create Subgroup').closest('button');
      expect(submitButton).not.toBeDisabled();
    });

    it('should handle empty description', async () => {
      (subgroupsService.addSubgroup as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Subgroup created successfully'
      });
      
      render(<AddNewSubgroupPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter subgroup name'), { target: { value: 'Test Subgroup' } });
      
      const submitButton = screen.getByText('Create Subgroup').closest('button');
      fireEvent.click(submitButton!);
      
      await waitFor(() => {
        expect(subgroupsService.addSubgroup).toHaveBeenCalledWith(
          expect.objectContaining({
            SubgroupDescription: '',
          })
        );
      });
    });
  });
});

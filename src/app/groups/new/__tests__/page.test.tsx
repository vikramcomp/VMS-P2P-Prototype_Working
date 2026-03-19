import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewGroupPage from '../page';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useStudios } from '@/hooks/use-studios';
import { groupsService } from '@/services/groups-service';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/hooks/use-toast');
jest.mock('@/hooks/use-studios');
jest.mock('@/services/groups-service');
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

const mockStudios = [
  { StudioId: 1, StudioName: 'Studio A', id: 1, name: 'Studio A' },
  { StudioId: 2, StudioName: 'Studio B', id: 2, name: 'Studio B' },
  { StudioId: 3, StudioName: 'Studio C', id: 3, name: 'Studio C' }
];

describe('NewGroupPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (useStudios as jest.Mock).mockReturnValue({
      studios: mockStudios,
      loading: false,
      error: null
    });
  });

  // Loading and Rendering Tests
  describe('Loading and Rendering', () => {
    it('should render new group page with all form fields', () => {
      render(<NewGroupPage />);
      
      expect(screen.getByTestId('new-group-page')).toBeInTheDocument();
      expect(screen.getByText('Add New Group')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter group name')).toBeInTheDocument();
      expect(screen.getByText('Select Studio Name')).toBeInTheDocument();
    });

    it('should render with studios loaded in dropdown', () => {
      render(<NewGroupPage />);
      
      expect(screen.getByText('Studio A')).toBeInTheDocument();
      expect(screen.getByText('Studio B')).toBeInTheDocument();
      expect(screen.getByText('Studio C')).toBeInTheDocument();
    });

    it('should show loading state when studios are loading', () => {
      (useStudios as jest.Mock).mockReturnValue({
        studios: [],
        loading: true,
        error: null
      });
      
      render(<NewGroupPage />);
      
      expect(screen.getByText('Loading studios...')).toBeInTheDocument();
    });

    it('should show error message when studios fail to load', () => {
      (useStudios as jest.Mock).mockReturnValue({
        studios: [],
        loading: false,
        error: 'Failed to load'
      });
      
      render(<NewGroupPage />);
      
      expect(screen.getByText('Failed to load studios. Please try again later.')).toBeInTheDocument();
    });

    it('should render all action buttons', () => {
      render(<NewGroupPage />);
      
      expect(screen.getByText('Submit')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });
  });

  // Form Validation Tests
  describe('Form Validation', () => {
    it('should disable submit button when form is invalid', () => {
      render(<NewGroupPage />);
      
      const submitButton = screen.getByText('Submit').closest('button');
      expect(submitButton).toBeDisabled();
    });

    it('should show validation error for short group name', () => {
      render(<NewGroupPage />);
      
      const nameInput = screen.getByPlaceholderText('Enter group name');
      fireEvent.change(nameInput, { target: { value: 'AB' } });
      
      expect(screen.getByText('Group name must be at least 3 characters long')).toBeInTheDocument();
    });

    it('should show valid message for group name with 3+ characters', () => {
      render(<NewGroupPage />);
      
      const nameInput = screen.getByPlaceholderText('Enter group name');
      fireEvent.change(nameInput, { target: { value: 'Test Group' } });
      
      expect(screen.getByText('✓ Valid group name')).toBeInTheDocument();
    });

    it('should enable submit button when form is valid', () => {
      render(<NewGroupPage />);
      
      const nameInput = screen.getByPlaceholderText('Enter group name');
      const studioSelect = screen.getByDisplayValue('Select Studio Name');
      
      fireEvent.change(nameInput, { target: { value: 'Test Group' } });
      fireEvent.change(studioSelect, { target: { value: '1' } });
      
      const submitButton = screen.getByText('Submit').closest('button');
      expect(submitButton).not.toBeDisabled();
    });
  });

  // Input Handling Tests
  describe('Input Handling', () => {
    it('should handle group name input changes', () => {
      render(<NewGroupPage />);
      
      const nameInput = screen.getByPlaceholderText('Enter group name');
      fireEvent.change(nameInput, { target: { value: 'New Group Name' } });
      
      expect(nameInput).toHaveValue('New Group Name');
    });

    it('should handle studio selection changes', () => {
      render(<NewGroupPage />);
      
      const studioSelect = screen.getByDisplayValue('Select Studio Name');
      fireEvent.change(studioSelect, { target: { value: '1' } });
      
      expect(studioSelect).toHaveValue('1');
    });

    it('should handle description input changes', () => {
      render(<NewGroupPage />);
      
      const descriptionInput = screen.getByPlaceholderText('Enter group description');
      fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
      
      expect(descriptionInput).toHaveValue('Test description');
    });

    it('should handle status selection changes', () => {
      render(<NewGroupPage />);
      
      const statusSelects = screen.getAllByRole('combobox');
      const statusSelect = statusSelects.find(select => 
        select.querySelector('option[value="1"]')?.textContent === 'Active'
      );
      
      fireEvent.change(statusSelect!, { target: { value: '0' } });
      
      expect(statusSelect).toHaveValue('0');
    });

    it('should sanitize group name by trimming spaces', () => {
      render(<NewGroupPage />);
      
      const nameInput = screen.getByPlaceholderText('Enter group name');
      fireEvent.change(nameInput, { target: { value: '  Test  Group  ' } });
      
      expect(nameInput).toHaveValue('Test Group');
    });
  });

  // Form Submission Tests
  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      (groupsService.addGroup as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Group created successfully'
      });
      
      render(<NewGroupPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter group name'), { target: { value: 'Test Group' } });
      fireEvent.change(screen.getByDisplayValue('Select Studio Name'), { target: { value: '1' } });
      fireEvent.change(screen.getByPlaceholderText('Enter group description'), { target: { value: 'Test description' } });
      
      const submitButton = screen.getByText('Submit').closest('button');
      fireEvent.click(submitButton!);
      
      await waitFor(() => {
        expect(groupsService.addGroup).toHaveBeenCalledWith({
          StudioId: 1,
          CategoryId: 0,
          CategoryName: 'Test Group',
          CategoryDescription: 'Test description',
          Status: 1,
          StudioName: 'Studio A'
        });
      });
    });

    it('should show success toast and redirect on successful submission', async () => {
      jest.useFakeTimers();
      (groupsService.addGroup as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Group created successfully'
      });
      
      render(<NewGroupPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter group name'), { target: { value: 'Test Group' } });
      fireEvent.change(screen.getByDisplayValue('Select Studio Name'), { target: { value: '1' } });
      
      const submitButton = screen.getByText('Submit').closest('button');
      fireEvent.click(submitButton!);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Success',
          description: 'Group created successfully!',
          variant: 'success',
        });
      });
      
      jest.advanceTimersByTime(600);
      
      expect(mockPush).toHaveBeenCalledWith('/groups');
      
      jest.useRealTimers();
    });

    it('should show error toast when submission fails', async () => {
      (groupsService.addGroup as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Failed to create group'
      });
      
      render(<NewGroupPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter group name'), { target: { value: 'Test Group' } });
      fireEvent.change(screen.getByDisplayValue('Select Studio Name'), { target: { value: '1' } });
      
      const submitButton = screen.getByText('Submit').closest('button');
      fireEvent.click(submitButton!);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to create group',
          variant: 'destructive',
        });
      });
    });

    it('should show validation error toast when form is invalid', async () => {
      render(<NewGroupPage />);
      
      const form = screen.getByTestId('new-group-page').querySelector('form');
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
      (groupsService.addGroup as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      render(<NewGroupPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter group name'), { target: { value: 'Test Group' } });
      fireEvent.change(screen.getByDisplayValue('Select Studio Name'), { target: { value: '1' } });
      
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
      (groupsService.addGroup as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );
      
      render(<NewGroupPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter group name'), { target: { value: 'Test Group' } });
      fireEvent.change(screen.getByDisplayValue('Select Studio Name'), { target: { value: '1' } });
      
      const submitButton = screen.getByText('Submit').closest('button');
      fireEvent.click(submitButton!);
      
      await waitFor(() => {
        expect(screen.getByText('Creating...')).toBeInTheDocument();
      });
    });
  });

  // Reset Functionality Tests
  describe('Reset Functionality', () => {
    it('should reset form fields when reset button is clicked', () => {
      render(<NewGroupPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter group name'), { target: { value: 'Test Group' } });
      fireEvent.change(screen.getByDisplayValue('Select Studio Name'), { target: { value: '1' } });
      fireEvent.change(screen.getByPlaceholderText('Enter group description'), { target: { value: 'Test description' } });
      
      const resetButton = screen.getByText('Reset').closest('button');
      fireEvent.click(resetButton!);
      
      expect(screen.getByPlaceholderText('Enter group name')).toHaveValue('');
      expect(screen.getByPlaceholderText('Enter group description')).toHaveValue('');
    });

    it('should reset status to Active (1) when reset button is clicked', () => {
      render(<NewGroupPage />);
      
      const statusSelects = screen.getAllByRole('combobox');
      const statusSelect = statusSelects.find(select => 
        select.querySelector('option[value="1"]')?.textContent === 'Active'
      );
      
      fireEvent.change(statusSelect!, { target: { value: '0' } });
      
      const resetButton = screen.getByText('Reset').closest('button');
      fireEvent.click(resetButton!);
      
      expect(statusSelect).toHaveValue('1');
    });
  });

  // Studio Loading States Tests
  describe('Studio Loading States', () => {
    it('should disable studio dropdown when loading', () => {
      (useStudios as jest.Mock).mockReturnValue({
        studios: [],
        loading: true,
        error: null
      });
      
      render(<NewGroupPage />);
      
      const studioSelect = screen.getByText('Loading studios...').closest('select');
      expect(studioSelect).toBeDisabled();
    });

    it('should show no studios message when studios list is empty', () => {
      (useStudios as jest.Mock).mockReturnValue({
        studios: [],
        loading: false,
        error: null
      });
      
      render(<NewGroupPage />);
      
      expect(screen.getByText('No studios available')).toBeInTheDocument();
    });

    it('should show helper text when studios are loaded', () => {
      render(<NewGroupPage />);
      
      expect(screen.getByText('Choose the studio this group belongs to')).toBeInTheDocument();
    });
  });

  // Edge Cases Tests
  describe('Edge Cases', () => {
    it('should handle studio with different property names', async () => {
      (useStudios as jest.Mock).mockReturnValue({
        studios: [{ studioid: 5, studioname: 'Custom Studio' }],
        loading: false,
        error: null
      });
      
      render(<NewGroupPage />);
      
      expect(screen.getByText('Custom Studio')).toBeInTheDocument();
    });

    it('should disable buttons during submission', async () => {
      (groupsService.addGroup as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );
      
      render(<NewGroupPage />);
      
      fireEvent.change(screen.getByPlaceholderText('Enter group name'), { target: { value: 'Test Group' } });
      fireEvent.change(screen.getByDisplayValue('Select Studio Name'), { target: { value: '1' } });
      
      const submitButton = screen.getByText('Submit').closest('button');
      fireEvent.click(submitButton!);
      
      await waitFor(() => {
        expect(screen.getByText('Reset').closest('button')).toBeDisabled();
      });
    });
  });
});

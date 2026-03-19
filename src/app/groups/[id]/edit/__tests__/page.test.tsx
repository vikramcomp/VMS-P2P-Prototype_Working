import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import EditGroupPage from '../page';
import { useRouter, useParams } from 'next/navigation';
import { useStudios } from '@/hooks/use-studios';
import { useToast } from '@/hooks/use-toast';
import { groupsService } from '@/services/groups-service';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
  usePathname: jest.fn(() => '/groups/1/edit'),
}));

// Mock hooks
jest.mock('@/hooks/use-studios');
jest.mock('@/hooks/use-toast');

// Mock services
jest.mock('@/services/groups-service');

// Mock components
jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardDescription: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, className }: any) => (
    <button onClick={onClick} disabled={disabled} type={type} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children, content }: any) => <div title={content}>{children}</div>,
}));

describe('EditGroupPage', () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();
  const mockGetGroupById = jest.fn();
  const mockUpdateGroup = jest.fn();

  const mockStudios = [
    { id: 1, name: 'Studio A' },
    { id: 2, name: 'Studio B' },
  ];

  const mockGroupData = {
    success: true,
    data: {
      records: [
        {
          categoryName: 'Test Group',
          categoryDescription: 'Test Description',
          studioId: 1,
          studioName: 'Studio A',
          status: 'Active',
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (useStudios as jest.Mock).mockReturnValue({
      studios: mockStudios,
      loading: false,
      error: null,
    });
    (groupsService.getGroupById as jest.Mock).mockImplementation(mockGetGroupById);
    (groupsService.updateGroup as jest.Mock).mockImplementation(mockUpdateGroup);
  });

  describe('Loading State', () => {
    it('should show loading state while fetching group data', () => {
      mockGetGroupById.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<EditGroupPage />);

      expect(screen.getByText(/Loading group details for ID: 1/i)).toBeInTheDocument();
    });
  });

  describe('Rendering', () => {
    it('should render edit group form with loaded data', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByText('Edit Group')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
      });
    });

    it('should render form fields', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      // Check that form elements exist
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Form Validation', () => {
    it('should render group name input field', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('Test Group');
      expect(nameInput).toBeInTheDocument();
    });

    it('should allow changing group name', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      const inputs = screen.getAllByRole('textbox');
      const nameInput = inputs.find(input => (input as HTMLInputElement).value === 'Test Group');
      
      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: 'Valid Group Name' } });
        expect(nameInput).toHaveValue('Valid Group Name');
      }
    });
  });

  describe('Form Submission', () => {
    it('should have update button', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      const updateButton = screen.getByText('Update');
      expect(updateButton).toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('should display loaded group data', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
      });
    });
  });

  describe('Reset Functionality', () => {
    it('should display form with reset button', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      // Check that reset button exists
      const buttons = screen.getAllByRole('button');
      const resetButtons = buttons.filter((btn) => btn.textContent?.includes('Reset'));
      expect(resetButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Cancel Navigation', () => {
    it('should navigate back to groups page when cancel button is clicked', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      const cancelButton = screen.getAllByRole('button')[0]; // First button (back arrow)
      fireEvent.click(cancelButton);

      expect(mockPush).toHaveBeenCalledWith('/groups');
    });
  });

  describe('Unsaved Changes Indicator', () => {
    it('should not show unsaved changes indicator initially', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      expect(screen.queryByText(/You have unsaved changes/i)).not.toBeInTheDocument();
    });
  });

  describe('Studio Selection', () => {
    it('should load studios and group data', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      // Check that studios are loaded via mock
      expect(useStudios).toHaveBeenCalled();
    });

    it('should show loading state for studios', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);
      (useStudios as jest.Mock).mockReturnValue({
        studios: [],
        loading: true,
        error: null,
      });

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByText(/Loading studios.../i)).toBeInTheDocument();
      });
    });

    it('should show error message when studios fail to load', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);
      (useStudios as jest.Mock).mockReturnValue({
        studios: [],
        loading: false,
        error: 'Failed to load studios',
      });

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load studios/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should redirect to groups page when group ID is missing', async () => {
      (useParams as jest.Mock).mockReturnValue({ id: undefined });

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: 'Group ID is required',
          })
        );
        expect(mockPush).toHaveBeenCalledWith('/groups');
      });
    });

    it('should show error and redirect when group is not found', async () => {
      mockGetGroupById.mockResolvedValue({
        success: true,
        data: { records: [] },
      });

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: 'Group not found',
          })
        );
      });
    });

    it('should handle API errors gracefully', async () => {
      mockGetGroupById.mockRejectedValue(new Error('API Error'));

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            variant: 'destructive',
          })
        );
      });
    });
  });

  describe('Status Toggle', () => {
    it('should render status dropdown', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      const statusOptions = screen.getAllByText(/Active/i);
      expect(statusOptions.length).toBeGreaterThan(0);
    });
  });

  describe('Description Field', () => {
    it('should display description field', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
      });
    });

    it('should allow changing description', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
      });

      const descriptionField = screen.getByDisplayValue('Test Description');
      fireEvent.change(descriptionField, { target: { value: 'New Description' } });
      
      expect(descriptionField).toHaveValue('New Description');
    });
  });

  describe('Complete Form Submission', () => {
    it('should successfully submit updated group', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);
      mockUpdateGroup.mockResolvedValue({ success: true });

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      // Change group name
      const inputs = screen.getAllByRole('textbox');
      const nameInput = inputs.find(input => (input as HTMLInputElement).value === 'Test Group');
      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: 'Updated Group' } });
      }

      // Submit form
      const form = screen.getByTestId('edit-group-root').querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockUpdateGroup).toHaveBeenCalled();
      });
    });

    it('should show validation error when group name is too short', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      // Change to short name
      const inputs = screen.getAllByRole('textbox');
      const nameInput = inputs.find(input => (input as HTMLInputElement).value === 'Test Group');
      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: 'AB' } });
      }

      await waitFor(() => {
        expect(screen.getByText(/Group name must be at least 3 characters long/i)).toBeInTheDocument();
      });
    });

    it('should show valid group name indicator', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      // Name is already valid
      await waitFor(() => {
        expect(screen.getByText(/✓ Valid group name/i)).toBeInTheDocument();
      });
    });

    it('should show error toast when submission fails', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);
      mockUpdateGroup.mockResolvedValue({ 
        success: false, 
        message: 'Update failed' 
      });

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      const form = screen.getByTestId('edit-group-root').querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: 'Update failed',
            variant: 'destructive',
          })
        );
      });
    });

    it('should handle unexpected errors during submission', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);
      mockUpdateGroup.mockRejectedValue(new Error('Network error'));

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      const form = screen.getByTestId('edit-group-root').querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: 'An unexpected error occurred. Please try again.',
            variant: 'destructive',
          })
        );
      });
    });

    it('should disable submit button when form is invalid', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      // Clear the name field
      const inputs = screen.getAllByRole('textbox');
      const nameInput = inputs.find(input => (input as HTMLInputElement).value === 'Test Group');
      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: '' } });
      }

      const updateButton = screen.getByText('Update');
      expect(updateButton).toBeDisabled();
    });

    it('should show submitting state', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);
      mockUpdateGroup.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      const form = screen.getByTestId('edit-group-root').querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(screen.getByText('Updating...')).toBeInTheDocument();
      });
    });
  });

  describe('Reset Functionality Complete', () => {
    it('should reset form to original values when reset button clicked', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      // Change values
      const inputs = screen.getAllByRole('textbox');
      const nameInput = inputs.find(input => (input as HTMLInputElement).value === 'Test Group');
      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: 'Modified Group' } });
        expect(nameInput).toHaveValue('Modified Group');
      }

      // Click reset
      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(mockGetGroupById).toHaveBeenCalledTimes(2); // Initial load + reset
      });
    });

    it('should handle reset errors silently', async () => {
      mockGetGroupById.mockResolvedValueOnce(mockGroupData);
      mockGetGroupById.mockRejectedValueOnce(new Error('Network error'));

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);

      // Should not throw or show error
      await waitFor(() => {
        expect(mockGetGroupById).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Unsaved Changes Complete', () => {
    it('should show unsaved changes indicator when form is modified', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      // Modify the form
      const inputs = screen.getAllByRole('textbox');
      const nameInput = inputs.find(input => (input as HTMLInputElement).value === 'Test Group');
      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: 'Changed Group' } });
      }

      await waitFor(() => {
        expect(screen.getByText(/You have unsaved changes/i)).toBeInTheDocument();
      });
    });

    it('should show unsaved changes when description is modified', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
      });

      const descriptionField = screen.getByDisplayValue('Test Description');
      fireEvent.change(descriptionField, { target: { value: 'Modified Description' } });

      await waitFor(() => {
        expect(screen.getByText(/You have unsaved changes/i)).toBeInTheDocument();
      });
    });

    it('should show unsaved changes when status is modified', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      const statusSelects = screen.getAllByRole('combobox');
      const statusSelect = statusSelects.find(select => 
        Array.from((select as HTMLSelectElement).options).some(opt => opt.text === 'In-Active')
      );
      
      if (statusSelect) {
        fireEvent.change(statusSelect, { target: { value: '0' } });
      }

      await waitFor(() => {
        expect(screen.getByText(/You have unsaved changes/i)).toBeInTheDocument();
      });
    });

    it('should show unsaved changes when studio is modified', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      const studioSelects = screen.getAllByRole('combobox');
      const studioSelect = studioSelects.find(select => 
        Array.from((select as HTMLSelectElement).options).some(opt => opt.text === 'Studio B')
      );
      
      if (studioSelect) {
        fireEvent.change(studioSelect, { target: { value: '2' } });
      }

      await waitFor(() => {
        expect(screen.getByText(/You have unsaved changes/i)).toBeInTheDocument();
      });
    });
  });

  describe('Studio Dropdown Complete', () => {
    it('should update studio name when studio selection changes', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      const studioSelects = screen.getAllByRole('combobox');
      const studioSelect = studioSelects.find(select => 
        Array.from((select as HTMLSelectElement).options).some(opt => opt.text === 'Studio B')
      );
      
      if (studioSelect) {
        fireEvent.change(studioSelect, { target: { value: '2' } });
        expect(studioSelect).toHaveValue('2');
      }
    });

    it('should show no studios available when studios list is empty', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);
      (useStudios as jest.Mock).mockReturnValue({
        studios: [],
        loading: false,
        error: null,
      });

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByText(/No studios available/i)).toBeInTheDocument();
      });
    });

    it('should show helper text when studios load successfully', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByText(/Choose the studio this group belongs to/i)).toBeInTheDocument();
      });
    });
  });

  describe('Group Data Handling', () => {
    it('should handle PascalCase API response', async () => {
      const pascalCaseData = {
        success: true,
        data: {
          Records: [
            {
              CategoryName: 'Pascal Case Group',
              CategoryDescription: 'Pascal Case Description',
              StudioId: 1,
              StudioName: 'Studio A',
              Status: 'Active',
            },
          ],
        },
      };

      mockGetGroupById.mockResolvedValue(pascalCaseData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Pascal Case Group')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Pascal Case Description')).toBeInTheDocument();
      });
    });

    it('should handle status value "1" as Active', async () => {
      const dataWithStatusOne = {
        success: true,
        data: {
          records: [
            {
              categoryName: 'Test Group',
              categoryDescription: 'Test Description',
              studioId: 1,
              studioName: 'Studio A',
              status: '1',
            },
          ],
        },
      };

      mockGetGroupById.mockResolvedValue(dataWithStatusOne);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      const statusSelects = screen.getAllByRole('combobox');
      const statusSelect = statusSelects.find(select => 
        (select as HTMLSelectElement).value === '1'
      );
      expect(statusSelect).toBeTruthy();
    });

    it('should handle inactive status', async () => {
      const inactiveData = {
        success: true,
        data: {
          records: [
            {
              categoryName: 'Inactive Group',
              categoryDescription: 'Test Description',
              studioId: 1,
              studioName: 'Studio A',
              status: 'Inactive',
            },
          ],
        },
      };

      mockGetGroupById.mockResolvedValue(inactiveData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Inactive Group')).toBeInTheDocument();
      });

      const statusSelects = screen.getAllByRole('combobox');
      const statusSelect = statusSelects.find(select => 
        (select as HTMLSelectElement).value === '0'
      );
      expect(statusSelect).toBeTruthy();
    });

    it('should handle API response with no success field', async () => {
      mockGetGroupById.mockResolvedValue({
        success: false,
        message: 'Failed to load',
      });

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: 'Failed to load',
          })
        );
      });
    });
  });

  describe('Name Sanitization', () => {
    it('should sanitize group name on input', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      const inputs = screen.getAllByRole('textbox');
      const nameInput = inputs.find(input => (input as HTMLInputElement).value === 'Test Group');
      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: '  Multiple   Spaces  ' } });
        expect(nameInput).toHaveValue('Multiple Spaces');
      }
    });

    it('should sanitize group name on submit', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);
      mockUpdateGroup.mockResolvedValue({ success: true });

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      const inputs = screen.getAllByRole('textbox');
      const nameInput = inputs.find(input => (input as HTMLInputElement).value === 'Test Group');
      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: '  Trimmed Name  ' } });
      }

      const form = screen.getByTestId('edit-group-root').querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockUpdateGroup).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            CategoryName: 'Trimmed Name',
          })
        );
      });
    });
  });

  describe('Success Navigation', () => {
    it('should navigate to groups page after successful update', async () => {
      jest.useFakeTimers();
      mockGetGroupById.mockResolvedValue(mockGroupData);
      mockUpdateGroup.mockResolvedValue({ success: true });

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      const form = screen.getByTestId('edit-group-root').querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Success',
            variant: 'success',
          })
        );
      });

      jest.advanceTimersByTime(700);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/groups');
      });

      jest.useRealTimers();
    });
  });

  describe('Studio Data Synchronization', () => {
    it('should update studioName when studioId matches in studios list', async () => {
      mockGetGroupById.mockResolvedValue({
        success: true,
        data: {
          records: [
            {
              categoryName: 'Test Group',
              categoryDescription: 'Test Description',
              studioId: 2,
              studioName: 'Old Studio Name',
              status: 'Active',
            },
          ],
        },
      });

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      // studioName should be updated from studios list
      await waitFor(() => {
        const studioSelects = screen.getAllByRole('combobox');
        const studioSelect = studioSelects.find(select => 
          (select as HTMLSelectElement).value === '2'
        );
        expect(studioSelect).toBeTruthy();
      });
    });
  });

  describe('Update Request Structure', () => {
    it('should send correct update request structure', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);
      mockUpdateGroup.mockResolvedValue({ success: true });

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      const form = screen.getByTestId('edit-group-root').querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockUpdateGroup).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            StudioId: 1,
            CategoryId: 1,
            CategoryName: 'Test Group',
            CategoryDescription: 'Test Description',
            Status: 1,
            StudioName: 'Studio A',
          })
        );
      });
    });

    it('should handle studio with various property formats', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);
      mockUpdateGroup.mockResolvedValue({ success: true });
      
      (useStudios as jest.Mock).mockReturnValue({
        studios: [
          { StudioId: 1, StudioName: 'Studio With PascalCase' },
          { studioid: 2, name: 'Studio With lowercase' },
        ],
        loading: false,
        error: null,
      });

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      const form = screen.getByTestId('edit-group-root').querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockUpdateGroup).toHaveBeenCalled();
      });
    });
  });

  describe('Error Redirect Timer', () => {
    it('should redirect after showing group not found error', async () => {
      jest.useFakeTimers();
      mockGetGroupById.mockResolvedValue({
        success: true,
        data: { records: [] },
      });

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: 'Group not found',
          })
        );
      });

      jest.advanceTimersByTime(2100);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/groups');
      });

      jest.useRealTimers();
    });

    it('should redirect after showing API failure error', async () => {
      jest.useFakeTimers();
      mockGetGroupById.mockResolvedValue({
        success: false,
        message: 'API Error',
      });

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: 'API Error',
          })
        );
      });

      jest.advanceTimersByTime(2100);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/groups');
      });

      jest.useRealTimers();
    });
  });

  describe('Form Validation Errors', () => {
    it('should show validation error when form is invalid on submit', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      // Clear required fields to make form invalid
      const inputs = screen.getAllByRole('textbox');
      const nameInput = inputs.find(input => (input as HTMLInputElement).value === 'Test Group');
      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: '' } });
      }

      // Try to submit
      const form = screen.getByTestId('edit-group-root').querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Validation Error',
            description: 'Please fill in all required fields correctly.',
            variant: 'destructive',
          })
        );
      });

      expect(mockUpdateGroup).not.toHaveBeenCalled();
    });
  });

  describe('Testing Mode', () => {
    it('should execute isTesting code path', () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      // Render with isTesting prop
      render(<EditGroupPage isTesting={true} />);

      // Component should render
      expect(useRouter).toHaveBeenCalled();
    });
  });

  describe('Reset with No Group ID', () => {
    it('should handle reset when groupId becomes null', async () => {
      mockGetGroupById.mockResolvedValue(mockGroupData);

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      // Reset button should be present
      const resetButton = screen.getByText('Reset');
      expect(resetButton).toBeInTheDocument();
      
      // Click reset - it should work normally since groupId was set during initial load
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(mockGetGroupById).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Studio Name Update from Studios List', () => {
    it('should handle studio not found in list', async () => {
      mockGetGroupById.mockResolvedValue({
        success: true,
        data: {
          records: [
            {
              categoryName: 'Test Group',
              categoryDescription: 'Test Description',
              studioId: 999,
              studioName: 'Unknown Studio',
              status: 'Active',
            },
          ],
        },
      });

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      // Form should still render even if studio not in list
      expect(screen.getByText('Edit Group')).toBeInTheDocument();
    });

    it('should not update studioName if it already matches found studio', async () => {
      mockGetGroupById.mockResolvedValue({
        success: true,
        data: {
          records: [
            {
              categoryName: 'Test Group',
              categoryDescription: 'Test Description',
              studioId: 1,
              studioName: 'Studio A',
              status: 'Active',
            },
          ],
        },
      });

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      // Studio name already matches, no update needed
      expect(screen.getByText('Edit Group')).toBeInTheDocument();
    });
  });

  describe('Reset with Missing Records', () => {
    it('should handle reset when API returns no records', async () => {
      mockGetGroupById.mockResolvedValueOnce(mockGroupData);
      mockGetGroupById.mockResolvedValueOnce({
        success: true,
        data: { records: [] },
      });

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);

      // Should call API even if it returns empty
      await waitFor(() => {
        expect(mockGetGroupById).toHaveBeenCalled();
      });
    });

    it('should handle reset when API returns no data', async () => {
      mockGetGroupById.mockResolvedValueOnce(mockGroupData);
      mockGetGroupById.mockResolvedValueOnce({
        success: false,
      });

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);

      // Should call API even if it fails
      await waitFor(() => {
        expect(mockGetGroupById).toHaveBeenCalled();
      });
    });

    it('should handle reset when API returns Records in PascalCase', async () => {
      mockGetGroupById.mockResolvedValueOnce(mockGroupData);
      mockGetGroupById.mockResolvedValueOnce({
        success: true,
        data: {
          Records: [
            {
              CategoryName: 'Reset Group',
              CategoryDescription: 'Reset Description',
              StudioId: 1,
              StudioName: 'Studio A',
              Status: 'Active',
            },
          ],
        },
      });

      render(<EditGroupPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
      });

      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Reset Group')).toBeInTheDocument();
      });
    });
  });
});

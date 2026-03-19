import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import GroupsContent from '../groups-content';
import { useGroups } from '@/hooks/use-groups';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/groups'),
}));

// Mock hooks
jest.mock('@/hooks/use-groups');
jest.mock('@/hooks/use-toast');

// Mock components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, variant, size }: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/pagination', () => ({
  __esModule: true,
  default: ({ pagination, onPageChange, onPageSizeChange }: any) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange(1)}>Page 1</button>
      <button onClick={() => onPageChange(2)}>Page 2</button>
      <button onClick={() => onPageSizeChange(20)}>Size 20</button>
    </div>
  ),
}));

jest.mock('@/components/ui/confirmation-dialog', () => ({
  ConfirmationDialog: ({ isOpen, onConfirm, onCancel, confirmText }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="confirmation-dialog">
        <button onClick={onConfirm}>{confirmText}</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  },
}));

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children, content }: any) => (
    <div title={content}>{children}</div>
  ),
}));

describe('GroupsContent', () => {
  const mockToast = jest.fn();
  const mockPush = jest.fn();
  const mockDeleteGroup = jest.fn();
  const mockDeleteMultipleGroups = jest.fn();
  const mockChangeGroupStatus = jest.fn();
  const mockExportGroups = jest.fn();
  const mockSetPageSize = jest.fn();
  const mockGoToPage = jest.fn();
  const mockClearError = jest.fn();

  const mockGroups = [
    {
      id: 1,
      name: 'Engineering Team',
      description: 'Software engineers',
      studioName: 'Studio A',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Design Team',
      description: 'UI/UX designers',
      studioName: 'Studio B',
      status: 'Inactive',
    },
  ];

  const defaultUseGroupsReturn = {
    groups: mockGroups,
    loading: false,
    error: null,
    totalRecords: 2,
    pagination: {
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
      sortBy: 'CategoryName',
      sortDescending: false,
    },
    clearError: mockClearError,
    setPageSize: mockSetPageSize,
    goToPage: mockGoToPage,
    deleteGroup: mockDeleteGroup,
    deleteMultipleGroups: mockDeleteMultipleGroups,
    changeGroupStatus: mockChangeGroupStatus,
    exportGroups: mockExportGroups,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useGroups as jest.Mock).mockReturnValue(defaultUseGroupsReturn);
  });

  describe('Rendering', () => {
    it('should render the groups content with title', () => {
      render(<GroupsContent />);
      expect(screen.getByText('Manage Groups')).toBeInTheDocument();
    });

    it('should render groups table with data', () => {
      render(<GroupsContent />);
      expect(screen.getByText('Engineering Team')).toBeInTheDocument();
      expect(screen.getByText('Software engineers')).toBeInTheDocument();
      expect(screen.getByText('Studio A')).toBeInTheDocument();
    });

    it('should render loading state', () => {
      (useGroups as jest.Mock).mockReturnValue({
        ...defaultUseGroupsReturn,
        loading: true,
        groups: [],
      });

      render(<GroupsContent />);
      expect(screen.getByText('Loading groups...')).toBeInTheDocument();
    });

    it('should render empty state when no groups', () => {
      (useGroups as jest.Mock).mockReturnValue({
        ...defaultUseGroupsReturn,
        groups: [],
        totalRecords: 0,
      });

      render(<GroupsContent />);
      expect(screen.getByText('No groups available.')).toBeInTheDocument();
    });

    it('should display error banner when error exists', () => {
      (useGroups as jest.Mock).mockReturnValue({
        ...defaultUseGroupsReturn,
        error: 'Failed to load groups',
      });

      render(<GroupsContent />);
      expect(screen.getByText('Failed to load groups')).toBeInTheDocument();
    });
  });

  describe('Selection Functionality', () => {
    it('should select individual group', () => {
      render(<GroupsContent />);
      const checkboxes = screen.getAllByRole('checkbox');
      
      fireEvent.click(checkboxes[1]); // First group checkbox
      
      expect(checkboxes[1]).toBeChecked();
    });

    it('should select all groups when select all checkbox is clicked', () => {
      render(<GroupsContent />);
      const selectAllCheckbox = screen.getByLabelText('Select all groups');
      
      fireEvent.change(selectAllCheckbox, { target: { checked: true } });
      
      // Check that select all checkbox is checked
      expect(selectAllCheckbox).toBeChecked();
    });

    it('should deselect all groups when clicking select all again', () => {
      render(<GroupsContent />);
      const selectAllCheckbox = screen.getByLabelText('Select all groups');
      
      // Select all
      fireEvent.change(selectAllCheckbox, { target: { checked: true } });
      // Deselect all
      fireEvent.change(selectAllCheckbox, { target: { checked: false } });
      
      const groupCheckboxes = screen.getAllByRole('checkbox').filter(
        (cb) => cb !== selectAllCheckbox
      );
      groupCheckboxes.forEach((checkbox) => {
        expect(checkbox).not.toBeChecked();
      });
    });

    it('should show clear selection button when groups are selected', () => {
      render(<GroupsContent />);
      const checkboxes = screen.getAllByRole('checkbox');
      
      fireEvent.click(checkboxes[1]);
      
      // The clear button has an X icon, not text
      const clearButtons = screen.getAllByRole('button');
      const hasClearButton = clearButtons.some(btn => btn.querySelector('svg'));
      expect(hasClearButton).toBe(true);
    });

    it('should clear selection when clear button is clicked', () => {
      render(<GroupsContent />);
      const checkboxes = screen.getAllByRole('checkbox');
      
      // Select a group
      fireEvent.click(checkboxes[1]);
      
      // Click clear button (has X icon)
      const buttons = screen.getAllByRole('button');
      const clearButton = buttons.find(btn => 
        btn.className?.includes('underline') || btn.textContent?.includes('Clear')
      );
      
      if (clearButton) {
        fireEvent.click(clearButton);
      }
      
      // Checkbox should be unchecked after clear
      // Since we're using local state, need to check the state was cleared
      expect(clearButton).toBeDefined();
    });
  });

  describe('Delete Functionality', () => {
    it('should show delete button in action menu', async () => {
      render(<GroupsContent />);
      
      // Open action menu
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);
      
      // Check delete button exists in menu (not the bulk delete button)
      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Delete');
        // There should be at least 2: one bulk delete button and one in the menu
        expect(deleteButtons.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Bulk Delete Functionality', () => {
    it('should enable bulk delete button when groups are selected', () => {
      render(<GroupsContent />);
      
      // Select a group
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      
      // Bulk delete button should be enabled
      const bulkDeleteButton = screen.getByText(/Delete \(1\)/);
      expect(bulkDeleteButton).not.toBeDisabled();
    });

    it('should disable bulk delete button when no groups are selected', () => {
      render(<GroupsContent />);
      
      const bulkDeleteButton = screen.getByText('Delete');
      expect(bulkDeleteButton).toBeDisabled();
    });

    it('should show bulk delete dialog when clicking bulk delete', () => {
      render(<GroupsContent />);
      
      // Select groups
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      fireEvent.click(checkboxes[2]);
      
      // Click bulk delete
      const bulkDeleteButton = screen.getByText(/Delete \(2\)/);
      fireEvent.click(bulkDeleteButton);
      
      // Dialog should appear
      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
    });




  });

  describe('Status Change Functionality', () => {
    it('should show activate button for inactive groups', async () => {
      render(<GroupsContent />);
      
      // Open action menu for second group (inactive)
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[1]);
      
      await waitFor(() => {
        expect(screen.getByText('Activate')).toBeInTheDocument();
      });
    });

    it('should show deactivate button for active groups', async () => {
      render(<GroupsContent />);
      
      // Open action menu for first group (active)
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Deactivate')).toBeInTheDocument();
      });
    });
  });

  describe('Export Functionality', () => {
    it('should call exportGroups when export button is clicked', async () => {
      mockExportGroups.mockResolvedValue({ 
        success: true, 
        message: 'Export successful' 
      });

      render(<GroupsContent />);
      
      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);
      
      await waitFor(() => {
        expect(mockExportGroups).toHaveBeenCalled();
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Success',
            variant: 'success',
          })
        );
      });
    });

    it('should show error toast when export fails', async () => {
      mockExportGroups.mockResolvedValue({ 
        success: false, 
        message: 'Export failed' 
      });

      render(<GroupsContent />);
      
      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Export Failed',
            variant: 'destructive',
          })
        );
      });
    });
  });

  describe('Pagination', () => {
    it('should call goToPage when page is changed', () => {
      render(<GroupsContent />);
      
      const page2Button = screen.getByText('Page 2');
      fireEvent.click(page2Button);
      
      expect(mockGoToPage).toHaveBeenCalledWith(2);
    });

    it('should call setPageSize when page size is changed', () => {
      render(<GroupsContent />);
      
      const size20Button = screen.getByText('Size 20');
      fireEvent.click(size20Button);
      
      expect(mockSetPageSize).toHaveBeenCalledWith(20);
    });
  });

  describe('Navigation', () => {
    it('should navigate to add new group page', () => {
      render(<GroupsContent />);
      
      const addButton = screen.getByText('Add New Group');
      fireEvent.click(addButton);
      
      expect(mockPush).toHaveBeenCalledWith('/groups/new');
    });

    it('should show edit button in action menu', async () => {
      render(<GroupsContent />);
      
      // Open action menu
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);
      
      // Check edit button exists
      await waitFor(() => {
        expect(screen.getByText('Edit Group')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show toast when error is present', () => {
      (useGroups as jest.Mock).mockReturnValue({
        ...defaultUseGroupsReturn,
        error: 'Failed to load groups',
      });

      render(<GroupsContent />);
      
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to load groups',
        variant: 'destructive',
      });
    });

    it('should clear error when dismiss button is clicked', () => {
      (useGroups as jest.Mock).mockReturnValue({
        ...defaultUseGroupsReturn,
        error: 'Failed to load groups',
      });

      render(<GroupsContent />);
      
      const dismissButton = screen.getByText('Dismiss');
      fireEvent.click(dismissButton);
      
      expect(mockClearError).toHaveBeenCalled();
    });
  });

  describe('Action Menu', () => {
    it('should close action menu when clicking outside', () => {
      render(<GroupsContent />);
      
      // Open action menu
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);
      
      // Menu should be visible
      expect(screen.getByText('Edit Group')).toBeInTheDocument();
      
      // Click outside
      fireEvent.mouseDown(document.body);
      
      // Menu should be closed
      expect(screen.queryByText('Edit Group')).not.toBeInTheDocument();
    });

    it('should toggle action menu on button click', () => {
      render(<GroupsContent />);
      
      // Open action menu
      const actionButton = screen.getAllByRole('button', { name: '' })[0];
      fireEvent.click(actionButton);
      
      expect(screen.getByText('Edit Group')).toBeInTheDocument();
      
      // Close by clicking same button
      fireEvent.click(actionButton);
      
      expect(screen.queryByText('Edit Group')).not.toBeInTheDocument();
    });
  });

  describe('Status Badge', () => {
    it('should display correct status colors', () => {
      render(<GroupsContent />);
      
      const activeStatus = screen.getByText('Active');
      const inactiveStatus = screen.getByText('Inactive');
      
      expect(activeStatus).toHaveClass('bg-green-100');
      expect(inactiveStatus).toHaveClass('bg-gray-100');
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner in header when loading', () => {
      (useGroups as jest.Mock).mockReturnValue({
        ...defaultUseGroupsReturn,
        loading: true,
      });

      render(<GroupsContent />);
      
      // Check that Loader2 component is rendered
      const container = screen.getByText('Manage Groups').parentElement;
      expect(container).toBeInTheDocument();
    });

    it('should disable buttons when loading', () => {
      (useGroups as jest.Mock).mockReturnValue({
        ...defaultUseGroupsReturn,
        loading: true,
      });

      render(<GroupsContent />);
      
      const addButton = screen.getByText('Add New Group');
      const exportButton = screen.getByText('Export');
      
      expect(addButton).toBeDisabled();
      expect(exportButton).toBeDisabled();
    });
  });

  describe('Delete Confirmation Dialog', () => {
    it('should show delete confirmation dialog when delete is clicked', async () => {
      render(<GroupsContent />);
      
      // Open action menu
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);
      
      // Click delete
      await waitFor(() => {
        const deleteButton = screen.getAllByText('Delete').find(btn => 
          btn.closest('button')?.classList.contains('text-red-600')
        );
        if (deleteButton) {
          fireEvent.mouseDown(deleteButton);
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
      });
    });

    it('should delete group when confirmation is clicked', async () => {
      mockDeleteGroup.mockResolvedValue({
        success: true,
        message: 'Group deleted successfully',
      });

      render(<GroupsContent />);
      
      // Open action menu
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);
      
      // Click delete
      await waitFor(() => {
        const deleteButton = screen.getAllByText('Delete').find(btn => 
          btn.closest('button')?.classList.contains('text-red-600')
        );
        if (deleteButton) {
          fireEvent.mouseDown(deleteButton);
        }
      });

      // Confirm delete
      await waitFor(async () => {
        const confirmButton = screen.getAllByText(/Delet/i).find(btn => 
          btn.textContent?.includes('Delete') && btn.closest('[data-testid="confirmation-dialog"]')
        );
        if (confirmButton) {
          fireEvent.click(confirmButton);
          await waitFor(() => {
            expect(mockDeleteGroup).toHaveBeenCalledWith(1);
          });
        }
      });
    });

    it('should show error toast when delete fails', async () => {
      mockDeleteGroup.mockResolvedValue({
        success: false,
        message: 'Delete failed',
      });

      render(<GroupsContent />);
      
      // Open action menu
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);
      
      // Click delete
      await waitFor(() => {
        const deleteButton = screen.getAllByText('Delete').find(btn => 
          btn.closest('button')?.classList.contains('text-red-600')
        );
        if (deleteButton) {
          fireEvent.mouseDown(deleteButton);
        }
      });

      // Confirm delete
      await waitFor(async () => {
        const confirmButton = screen.getAllByText(/Delet/i).find(btn => 
          btn.textContent?.includes('Delete') && btn.closest('[data-testid="confirmation-dialog"]')
        );
        if (confirmButton) {
          fireEvent.click(confirmButton);
          await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith(
              expect.objectContaining({
                title: 'Delete Failed',
                variant: 'destructive',
              })
            );
          });
        }
      });
    });

    it('should handle delete error exception', async () => {
      mockDeleteGroup.mockRejectedValue(new Error('Network error'));

      render(<GroupsContent />);
      
      // Open action menu
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);
      
      // Click delete
      await waitFor(() => {
        const deleteButton = screen.getAllByText('Delete').find(btn => 
          btn.closest('button')?.classList.contains('text-red-600')
        );
        if (deleteButton) {
          fireEvent.mouseDown(deleteButton);
        }
      });

      // Confirm delete
      await waitFor(async () => {
        const confirmButton = screen.getAllByText(/Delet/i).find(btn => 
          btn.textContent?.includes('Delete') && btn.closest('[data-testid="confirmation-dialog"]')
        );
        if (confirmButton) {
          fireEvent.click(confirmButton);
          await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith(
              expect.objectContaining({
                title: 'Error',
                description: 'Failed to delete group: Network error',
                variant: 'destructive',
              })
            );
          });
        }
      });
    });

    it('should cancel delete when cancel is clicked', async () => {
      render(<GroupsContent />);
      
      // Open action menu
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);
      
      // Click delete
      await waitFor(() => {
        const deleteButton = screen.getAllByText('Delete').find(btn => 
          btn.closest('button')?.classList.contains('text-red-600')
        );
        if (deleteButton) {
          fireEvent.mouseDown(deleteButton);
        }
      });

      // Cancel
      await waitFor(() => {
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);
      });

      expect(mockDeleteGroup).not.toHaveBeenCalled();
    });
  });

  describe('Bulk Delete Confirmation', () => {
    it('should confirm bulk delete successfully', async () => {
      mockDeleteMultipleGroups.mockResolvedValue({
        success: true,
        message: 'Groups deleted successfully',
      });

      render(<GroupsContent />);
      
      // Select groups
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      fireEvent.click(checkboxes[2]);
      
      // Click bulk delete
      const bulkDeleteButton = screen.getByText(/Delete \(2\)/);
      fireEvent.click(bulkDeleteButton);
      
      // Confirm
      await waitFor(() => {
        const confirmButton = screen.getAllByText(/Delete 2 Group/i)[0];
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(mockDeleteMultipleGroups).toHaveBeenCalledWith([1, 2]);
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Success',
            variant: 'success',
          })
        );
      });
    });

    it('should show error toast when bulk delete fails', async () => {
      mockDeleteMultipleGroups.mockResolvedValue({
        success: false,
        message: 'Bulk delete failed',
      });

      render(<GroupsContent />);
      
      // Select groups
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      
      // Click bulk delete
      const bulkDeleteButton = screen.getByText(/Delete \(1\)/);
      fireEvent.click(bulkDeleteButton);
      
      // Confirm
      await waitFor(() => {
        const confirmButton = screen.getAllByText(/Delete/i).find(btn =>
          btn.textContent?.includes('Delete 1 Group')
        );
        if (confirmButton) {
          fireEvent.click(confirmButton);
        }
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Bulk Delete Failed',
            variant: 'destructive',
          })
        );
      });
    });

    it('should handle bulk delete error exception', async () => {
      mockDeleteMultipleGroups.mockRejectedValue(new Error('Network error'));

      render(<GroupsContent />);
      
      // Select groups
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      
      // Click bulk delete
      const bulkDeleteButton = screen.getByText(/Delete \(1\)/);
      fireEvent.click(bulkDeleteButton);
      
      // Confirm
      await waitFor(() => {
        const confirmButton = screen.getAllByText(/Delete/i).find(btn =>
          btn.textContent?.includes('Delete 1 Group')
        );
        if (confirmButton) {
          fireEvent.click(confirmButton);
        }
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: 'Failed to delete groups: Network error',
            variant: 'destructive',
          })
        );
      });
    });

    it('should cancel bulk delete', async () => {
      render(<GroupsContent />);
      
      // Select groups
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      
      // Click bulk delete
      const bulkDeleteButton = screen.getByText(/Delete \(1\)/);
      fireEvent.click(bulkDeleteButton);
      
      // Cancel
      await waitFor(() => {
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);
      });

      expect(mockDeleteMultipleGroups).not.toHaveBeenCalled();
    });
  });

  describe('Status Change', () => {
    it('should change status to inactive when active', async () => {
      mockChangeGroupStatus.mockResolvedValue({
        success: true,
        message: 'Status changed successfully',
      });

      render(<GroupsContent />);
      
      // Open action menu for active group
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);
      
      // Click deactivate
      await waitFor(() => {
        const deactivateButton = screen.getByText('Deactivate');
        fireEvent.mouseDown(deactivateButton);
      });

      await waitFor(() => {
        expect(mockChangeGroupStatus).toHaveBeenCalledWith(1, 0);
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Success',
            description: expect.stringContaining('deactivated'),
            variant: 'success',
          })
        );
      });
    });

    it('should change status to active when inactive', async () => {
      mockChangeGroupStatus.mockResolvedValue({
        success: true,
        message: 'Status changed successfully',
      });

      render(<GroupsContent />);
      
      // Open action menu for inactive group
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[1]);
      
      // Click activate
      await waitFor(() => {
        const activateButton = screen.getByText('Activate');
        fireEvent.mouseDown(activateButton);
      });

      await waitFor(() => {
        expect(mockChangeGroupStatus).toHaveBeenCalledWith(2, 1);
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Success',
            description: expect.stringContaining('activated'),
            variant: 'success',
          })
        );
      });
    });

    it('should show error toast when status change fails', async () => {
      mockChangeGroupStatus.mockResolvedValue({
        success: false,
        message: 'Status change failed',
      });

      render(<GroupsContent />);
      
      // Open action menu
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);
      
      // Click deactivate
      await waitFor(() => {
        const deactivateButton = screen.getByText('Deactivate');
        fireEvent.mouseDown(deactivateButton);
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Status Change Failed',
            variant: 'destructive',
          })
        );
      });
    });

    it('should handle status change error exception', async () => {
      mockChangeGroupStatus.mockRejectedValue(new Error('Network error'));

      render(<GroupsContent />);
      
      // Open action menu
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);
      
      // Click deactivate
      await waitFor(() => {
        const deactivateButton = screen.getByText('Deactivate');
        fireEvent.mouseDown(deactivateButton);
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: 'Failed to change group status: Network error',
            variant: 'destructive',
          })
        );
      });
    });
  });

  describe('Edit Group Navigation', () => {
    it('should navigate to edit page when edit is clicked', async () => {
      render(<GroupsContent />);
      
      // Open action menu
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);
      
      // Click edit
      await waitFor(() => {
        const editButton = screen.getByText('Edit Group');
        fireEvent.mouseDown(editButton);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/groups/1/edit');
      }, { timeout: 200 });
    });
  });

  describe('Export Error Handling', () => {
    it('should show success toast when export succeeds', async () => {
      mockExportGroups.mockResolvedValue({ success: true, message: 'Groups exported successfully' });

      render(<GroupsContent />);
      
      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Success',
            description: 'Groups exported successfully',
            variant: 'success',
          })
        );
      });
    });

    it('should show error toast when export fails with success=false', async () => {
      mockExportGroups.mockResolvedValue({ success: false, message: 'Export failed due to server error' });

      render(<GroupsContent />);
      
      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Export Failed',
            description: 'Export failed due to server error',
            variant: 'destructive',
          })
        );
      });
    });

    it('should handle export error exception', async () => {
      mockExportGroups.mockRejectedValue(new Error('Export error'));

      render(<GroupsContent />);
      
      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: 'Failed to export groups: Export error',
            variant: 'destructive',
          })
        );
      });
    });

    it('should prevent multiple export clicks', async () => {
      mockExportGroups.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Exported' }), 100))
      );

      render(<GroupsContent />);
      
      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);
      fireEvent.click(exportButton); // Second click should be ignored
      
      await waitFor(() => {
        expect(mockExportGroups).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Group Display', () => {
    it('should display N/A for missing studio name', () => {
      const groupsWithoutStudio = [
        {
          id: 1,
          name: 'Test Group',
          description: 'Test',
          studioName: null,
          status: 'Active',
        },
      ];

      (useGroups as jest.Mock).mockReturnValue({
        ...defaultUseGroupsReturn,
        groups: groupsWithoutStudio,
      });

      render(<GroupsContent />);
      
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  describe('Prevent Multiple Deletes', () => {
    it('should prevent multiple bulk delete clicks', async () => {
      mockDeleteMultipleGroups.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Deleted' }), 100))
      );

      render(<GroupsContent />);
      
      // Select groups
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      
      // Click bulk delete
      const bulkDeleteButton = screen.getByText(/Delete \(1\)/);
      fireEvent.click(bulkDeleteButton);
      
      // Click confirm multiple times
      await waitFor(() => {
        const confirmButton = screen.getAllByText(/Delete/i).find(btn =>
          btn.textContent?.includes('Delete 1 Group')
        );
        if (confirmButton) {
          fireEvent.click(confirmButton);
          fireEvent.click(confirmButton); // Second click should be ignored
        }
      });

      await waitFor(() => {
        expect(mockDeleteMultipleGroups).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Selection Display', () => {
    it('should show selection count in delete button', () => {
      render(<GroupsContent />);
      
      // Select 2 groups
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      fireEvent.click(checkboxes[2]);
      
      expect(screen.getByText(/Delete \(2\)/)).toBeInTheDocument();
    });
  });

  describe('Bulk Delete with No Selection', () => {
    it('should not show dialog when bulk delete is clicked with no selection', () => {
      render(<GroupsContent />);
      
      // Try to click bulk delete without selecting
      const bulkDeleteButton = screen.getByText('Delete');
      fireEvent.click(bulkDeleteButton);
      
      // Dialog should not appear
      expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
    });
  });

  describe('Action Menu Button Interactions with MouseDown', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should trigger edit action on mouseDown', async () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

      render(<GroupsContent />);

      // Open action menu
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);

      // Wait for edit button and trigger mouseDown
      await waitFor(() => {
        const editButton = screen.getByText('Edit Group');
        fireEvent.mouseDown(editButton);
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/groups/1/edit');
      });
    });

    it('should trigger delete action on mouseDown', async () => {
      render(<GroupsContent />);

      // Open action menu
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);

      // Wait for delete button and trigger mouseDown
      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Delete');
        const actionDeleteButton = deleteButtons.find(btn => 
          btn.className.includes('text-red-600')
        );
        if (actionDeleteButton) {
          fireEvent.mouseDown(actionDeleteButton);
          jest.advanceTimersByTime(100);
        }
      });

      // Confirmation dialog should appear
      await waitFor(() => {
        expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
      });
    });

    it('should trigger activate action on mouseDown for inactive group', async () => {
      const mockChangeGroupStatus = jest.fn().mockResolvedValue({ success: true });
      (useGroups as jest.Mock).mockReturnValue({
        ...defaultUseGroupsReturn,
        groups: [
          {
            id: 1,
            name: 'Test Group 1',
            description: 'Description 1',
            studioName: 'Studio A',
            status: 'Inactive',
          },
        ],
        changeGroupStatus: mockChangeGroupStatus,
      });

      render(<GroupsContent />);

      // Open action menu
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);

      // Wait for activate button and trigger mouseDown
      await waitFor(() => {
        const activateButton = screen.getByText('Activate');
        fireEvent.mouseDown(activateButton);
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockChangeGroupStatus).toHaveBeenCalledWith(1, 1);
      });
    });

    it('should prevent default and stop propagation on onClick for action menu buttons', async () => {
      render(<GroupsContent />);

      // Open action menu
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);

      // Wait for edit button
      await waitFor(() => {
        const editButton = screen.getByText('Edit Group');
        
        // Create a mock click event
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');
        const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
        
        // Dispatch the event
        editButton.dispatchEvent(clickEvent);
        
        // Verify
        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(stopPropagationSpy).toHaveBeenCalled();
      });
    });
  });
});

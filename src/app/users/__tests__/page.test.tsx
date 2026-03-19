import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import UsersPage from '../page';
import { useUsers } from '@/hooks/use-users';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/users'),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock hooks
jest.mock('@/hooks/use-users');
jest.mock('@/hooks/use-toast');

// Mock components
jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
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

describe('UsersPage', () => {
  const mockToast = jest.fn();
  const mockPush = jest.fn();
  const mockDeleteUser = jest.fn();
  const mockDeleteMultipleUsers = jest.fn();
  const mockChangeUserStatus = jest.fn();
  const mockExportUsers = jest.fn();
  const mockSetPageSize = jest.fn();
  const mockGoToPage = jest.fn();
  const mockSetSearchTerm = jest.fn();
  const mockSetSorting = jest.fn();
  const mockClearError = jest.fn();

  const mockUsers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'User',
      status: 'Inactive',
    },
  ];

  const defaultUseUsersReturn = {
    users: mockUsers,
    loading: false,
    error: null,
    totalRecords: 2,
    pagination: {
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
      sortBy: 'FullName',
      sortDescending: false,
    },
    filter: {
      searchTerm: '',
    },
    clearError: mockClearError,
    setPageSize: mockSetPageSize,
    goToPage: mockGoToPage,
    setSearchTerm: mockSetSearchTerm,
    setSorting: mockSetSorting,
    deleteUser: mockDeleteUser,
    deleteMultipleUsers: mockDeleteMultipleUsers,
    changeUserStatus: mockChangeUserStatus,
    exportUsers: mockExportUsers,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useUsers as jest.Mock).mockReturnValue(defaultUseUsersReturn);
  });

  describe('Rendering', () => {
    it('should render the users page with title', () => {
      render(<UsersPage />);
      expect(screen.getByText('Manage Users')).toBeInTheDocument();
    });

    it('should render users table with data', () => {
      render(<UsersPage />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should render loading state', () => {
      (useUsers as jest.Mock).mockReturnValue({
        ...defaultUseUsersReturn,
        loading: true,
        users: [],
      });

      render(<UsersPage />);
      expect(screen.getByText('Loading users...')).toBeInTheDocument();
    });

    it('should render empty state when no users', () => {
      (useUsers as jest.Mock).mockReturnValue({
        ...defaultUseUsersReturn,
        users: [],
        totalRecords: 0,
      });

      render(<UsersPage />);
      expect(screen.getByText('No users found')).toBeInTheDocument();
      expect(screen.getByText('Get started by adding your first user')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should call setSearchTerm when search input changes', () => {
      render(<UsersPage />);
      const searchInput = screen.getByPlaceholderText(/Search users by name/i);
      
      fireEvent.change(searchInput, { target: { value: 'John' } });
      
      expect(mockSetSearchTerm).toHaveBeenCalledWith('John');
    });
  });

  describe('Sorting Functionality', () => {
    it('should call setSorting when column header is clicked', () => {
      // Start with a different sort column
      (useUsers as jest.Mock).mockReturnValue({
        ...defaultUseUsersReturn,
        pagination: {
          ...defaultUseUsersReturn.pagination,
          sortBy: 'Email',
          sortDescending: false,
        },
      });

      render(<UsersPage />);
      const nameHeader = screen.getByText('Name').closest('button');
      
      fireEvent.click(nameHeader!);
      
      expect(mockSetSorting).toHaveBeenCalledWith('FullName', false);
    });

    it('should toggle sort direction when clicking same column', () => {
      (useUsers as jest.Mock).mockReturnValue({
        ...defaultUseUsersReturn,
        pagination: {
          ...defaultUseUsersReturn.pagination,
          sortBy: 'FullName',
          sortDescending: false,
        },
      });

      render(<UsersPage />);
      const nameHeader = screen.getByText('Name').closest('button');
      
      fireEvent.click(nameHeader!);
      
      expect(mockSetSorting).toHaveBeenCalledWith('FullName', true);
    });
  });

  describe('Selection Functionality', () => {
    it('should select individual user', () => {
      render(<UsersPage />);
      const checkboxes = screen.getAllByRole('checkbox');
      
      fireEvent.click(checkboxes[1]); // First user checkbox (index 0 is select all)
      
      // Checkbox should be checked
      expect(checkboxes[1]).toBeChecked();
    });

    it('should select all users when select all checkbox is clicked', () => {
      render(<UsersPage />);
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      
      fireEvent.click(selectAllCheckbox);
      
      // All checkboxes should be checked
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeChecked();
      });
    });

    it('should deselect all users when clicking select all again', () => {
      render(<UsersPage />);
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      
      // Select all
      fireEvent.click(selectAllCheckbox);
      // Deselect all
      fireEvent.click(selectAllCheckbox);
      
      // All checkboxes should be unchecked
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((checkbox) => {
        expect(checkbox).not.toBeChecked();
      });
    });
  });

  describe('Delete Functionality', () => {
    it('should show delete dialog when delete is clicked', async () => {
      render(<UsersPage />);
      
      // Open action menu
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);
      
      // Click delete button
      await waitFor(() => {
        const deleteButton = screen.getByText('Delete');
        fireEvent.mouseDown(deleteButton);
      });
      
      // Dialog should appear
      await waitFor(() => {
        expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
      });
    });

    it('should delete user when confirmed', async () => {
      mockDeleteUser.mockResolvedValue({ success: true });

      render(<UsersPage />);
      
      // Open action menu
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);
      
      // Click delete
      await waitFor(() => {
        const deleteButton = screen.getByText('Delete');
        fireEvent.mouseDown(deleteButton);
      });
      
      // Confirm deletion
      await waitFor(() => {
        const confirmButton = screen.getAllByText(/Delete/i)[1]; // Get the confirm button
        fireEvent.click(confirmButton);
      });
      
      await waitFor(() => {
        expect(mockDeleteUser).toHaveBeenCalledWith(1);
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Success',
            variant: 'success',
          })
        );
      });
    });

    it('should show error toast when delete fails', async () => {
      mockDeleteUser.mockResolvedValue({ 
        success: false, 
        message: 'Delete failed' 
      });

      render(<UsersPage />);
      
      // Open action menu
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);
      
      // Click delete
      await waitFor(() => {
        const deleteButton = screen.getByText('Delete');
        fireEvent.mouseDown(deleteButton);
      });
      
      // Confirm deletion
      await waitFor(() => {
        const confirmButton = screen.getAllByText(/Delete/i)[1];
        fireEvent.click(confirmButton);
      });
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Delete Failed',
            variant: 'destructive',
          })
        );
      });
    });
  });

  describe('Bulk Delete Functionality', () => {
    it('should enable bulk delete button when users are selected', () => {
      render(<UsersPage />);
      
      // Select a user
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      
      // Bulk delete button should be enabled
      const bulkDeleteButton = screen.getByText(/Delete Selected/);
      expect(bulkDeleteButton).not.toBeDisabled();
    });

    it('should disable bulk delete button when no users are selected', () => {
      render(<UsersPage />);
      
      const bulkDeleteButton = screen.getByText('Delete Selected');
      expect(bulkDeleteButton).toBeDisabled();
    });

    it('should delete multiple users when bulk delete is confirmed', async () => {
      mockDeleteMultipleUsers.mockResolvedValue({ success: true });

      render(<UsersPage />);
      
      // Select users
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      fireEvent.click(checkboxes[2]);
      
      // Click bulk delete
      const bulkDeleteButton = screen.getByText(/Delete Selected/);
      fireEvent.click(bulkDeleteButton);
      
      // Confirm deletion
      await waitFor(() => {
        const confirmButton = screen.getAllByText(/Delete/i).find(
          (el) => el.textContent?.includes('User(s)')
        );
        fireEvent.click(confirmButton!);
      });
      
      await waitFor(() => {
        expect(mockDeleteMultipleUsers).toHaveBeenCalledWith([1, 2]);
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Success',
            variant: 'success',
          })
        );
      });
    });
  });

  describe('Status Change Functionality', () => {
    it('should change user status when status button is clicked', async () => {
      mockChangeUserStatus.mockResolvedValue({ success: true });

      render(<UsersPage />);
      
      // Open action menu
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);
      
      // Click deactivate button
      await waitFor(() => {
        const statusButton = screen.getByText('Deactivate');
        fireEvent.mouseDown(statusButton);
      });
      
      await waitFor(() => {
        expect(mockChangeUserStatus).toHaveBeenCalledWith(1, 0);
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Success',
            variant: 'success',
          })
        );
      });
    });

    it('should show activate button for inactive users', async () => {
      render(<UsersPage />);
      
      // Open action menu for second user (inactive)
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[1]);
      
      await waitFor(() => {
        expect(screen.getByText('Activate')).toBeInTheDocument();
      });
    });
  });

  describe('Export Functionality', () => {
    it('should call exportUsers when export button is clicked', async () => {
      mockExportUsers.mockResolvedValue({ 
        success: true, 
        message: 'Export successful' 
      });

      render(<UsersPage />);
      
      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);
      
      await waitFor(() => {
        expect(mockExportUsers).toHaveBeenCalled();
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Success',
            variant: 'success',
          })
        );
      });
    });

    it('should show error toast when export fails', async () => {
      mockExportUsers.mockResolvedValue({ 
        success: false, 
        message: 'Export failed' 
      });

      render(<UsersPage />);
      
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
      render(<UsersPage />);
      
      const page2Button = screen.getByText('Page 2');
      fireEvent.click(page2Button);
      
      expect(mockGoToPage).toHaveBeenCalledWith(2);
    });

    it('should call setPageSize when page size is changed', () => {
      render(<UsersPage />);
      
      const size20Button = screen.getByText('Size 20');
      fireEvent.click(size20Button);
      
      expect(mockSetPageSize).toHaveBeenCalledWith(20);
    });
  });

  describe('Navigation', () => {
    it('should render add new user link', () => {
      render(<UsersPage />);
      
      const addButton = screen.getByText('Add New User').closest('a');
      expect(addButton).toHaveAttribute('href', '/users/new');
    });

    it('should navigate to edit page when edit is clicked', async () => {
      render(<UsersPage />);
      
      // Open action menu
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);
      
      // Click edit button
      await waitFor(() => {
        const editButton = screen.getByText('Edit User');
        fireEvent.mouseDown(editButton);
      });
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/users/1/edit');
      });
    });
  });

  describe('Error Handling', () => {
    it('should show toast when error is present', () => {
      (useUsers as jest.Mock).mockReturnValue({
        ...defaultUseUsersReturn,
        error: 'Failed to load users',
      });

      render(<UsersPage />);
      
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    });
  });

  describe('Action Menu', () => {
    it('should close action menu when clicking outside', () => {
      render(<UsersPage />);
      
      // Open action menu
      const actionButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(actionButtons[0]);
      
      // Menu should be visible
      expect(screen.getByText('Edit User')).toBeInTheDocument();
      
      // Click outside (simulate mousedown on document)
      fireEvent.mouseDown(document.body);
      
      // Menu should be closed
      expect(screen.queryByText('Edit User')).not.toBeInTheDocument();
    });

    it('should toggle action menu on button click', () => {
      render(<UsersPage />);
      
      // Open action menu
      const actionButton = screen.getAllByRole('button', { name: '' })[0];
      fireEvent.click(actionButton);
      
      expect(screen.getByText('Edit User')).toBeInTheDocument();
      
      // Close by clicking same button
      fireEvent.click(actionButton);
      
      expect(screen.queryByText('Edit User')).not.toBeInTheDocument();
    });
  });

  describe('Status Badge', () => {
    it('should display correct status colors', () => {
      render(<UsersPage />);
      
      const activeStatus = screen.getByText('Active');
      const inactiveStatus = screen.getByText('Inactive');
      
      expect(activeStatus).toHaveClass('bg-green-100');
      expect(inactiveStatus).toHaveClass('bg-red-100');
    });
  });
});

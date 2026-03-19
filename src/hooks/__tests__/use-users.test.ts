import { renderHook, act, waitFor } from '@testing-library/react';
import { useUsers } from '../use-users';
import * as usersService from '@/services/users-service';

// Mock the users service
jest.mock('@/services/users-service');

const mockUsersService = usersService as jest.Mocked<typeof usersService>;

describe('useUsers', () => {
  const mockUsers = [
    {
      userId: 1,
      fullName: 'John Doe',
      email: 'john@example.com',
      roleName: 'Admin',
      status: 1
    },
    {
      userId: 2,
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      roleName: 'User',
      status: 1
    }
  ];

  const mockApiResponse = {
    isSuccess: true,
    data: {
      records: mockUsers,
      currentPage: 1,
      pageSize: 10,
      totalRecords: 2,
      totalPages: 1
    },
    message: 'Success'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Default mock implementations
    mockUsersService.getUsers.mockResolvedValue(mockApiResponse as any);
    mockUsersService.deleteUser.mockResolvedValue({ success: true, message: 'User deleted' });
    mockUsersService.deleteMultipleUsers.mockResolvedValue({ success: true, message: 'Users deleted' });
    mockUsersService.changeUserStatus.mockResolvedValue({ success: true, message: 'Status changed' });
    mockUsersService.exportUsers.mockResolvedValue(new Blob(['test'], { type: 'text/csv' }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', async () => {
      const { result } = renderHook(() => useUsers({ autoFetch: false }));

      expect(result.current.users).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination.currentPage).toBe(1);
      expect(result.current.pagination.pageSize).toBe(10);
    });

    it('should auto-fetch users on mount by default', async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockUsersService.getUsers).toHaveBeenCalled();
      expect(result.current.users).toHaveLength(2);
    });

    it('should not auto-fetch when autoFetch is false', async () => {
      renderHook(() => useUsers({ autoFetch: false }));

      await waitFor(() => {
        expect(mockUsersService.getUsers).not.toHaveBeenCalled();
      });
    });

    it('should initialize with custom options', () => {
      const { result } = renderHook(() =>
        useUsers({
          initialPageSize: 20,
          initialSortBy: 'name',
          initialSortDescending: false,
          autoFetch: false
        })
      );

      expect(result.current.pagination.pageSize).toBe(20);
      expect(result.current.pagination.sortBy).toBe('name');
      expect(result.current.pagination.sortDescending).toBe(false);
    });
  });

  describe('User data fetching', () => {
    it('should transform API users to internal format', async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.users[0]).toEqual({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Admin',
        status: 1
      });
    });

    it('should handle API error', async () => {
      mockUsersService.getUsers.mockResolvedValue({
        isSuccess: false,
        data: null,
        message: 'Failed to fetch users'
      } as any);

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch users');
      expect(result.current.users).toEqual([]);
    });

    it('should handle API exception', async () => {
      mockUsersService.getUsers.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });
  });

  describe('Pagination', () => {
    it('should set page size', async () => {
      const { result } = renderHook(() => useUsers({ autoFetch: false }));

      act(() => {
        result.current.setPageSize(20);
      });

      expect(result.current.pagination.pageSize).toBe(20);
      expect(result.current.pagination.currentPage).toBe(1); // Should reset to first page
    });

    it('should go to specific page', async () => {
      const { result } = renderHook(() => useUsers({ autoFetch: false }));

      act(() => {
        result.current.goToPage(3);
      });

      expect(result.current.pagination.currentPage).toBe(3);
    });

    it('should handle "All" page size', async () => {
      mockUsersService.getUsers.mockResolvedValueOnce({
        isSuccess: true,
        data: {
          records: mockUsers,
          currentPage: 1,
          pageSize: 1,
          totalRecords: 100,
          totalPages: 100
        },
        message: 'Success'
      } as any);

      mockUsersService.getUsers.mockResolvedValueOnce({
        isSuccess: true,
        data: {
          records: mockUsers,
          currentPage: 1,
          pageSize: 100,
          totalRecords: 100,
          totalPages: 1
        },
        message: 'Success'
      } as any);

      const { result } = renderHook(() => useUsers({ autoFetch: false }));

      act(() => {
        result.current.setPageSize('All');
      });

      await waitFor(() => {
        expect(result.current.pagination.pageSize).toBe('All');
      });
    });

    it('should calculate showing from and to correctly', async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.pagination.totalRecords).toBe(2);
      });

      // With 2 total records on page 1 with page size 10, should show records 1-2
      expect(result.current.pagination.showingFrom).toBe(1);
      expect(result.current.pagination.showingTo).toBe(2);
    });
  });

  describe('Filtering', () => {
    it('should set search term and reset to first page', async () => {
      const { result } = renderHook(() => useUsers({ autoFetch: false }));

      act(() => {
        result.current.goToPage(3);
        result.current.setSearchTerm('test');
      });

      expect(result.current.filter.searchTerm).toBe('test');
      expect(result.current.pagination.currentPage).toBe(1);
    });

    it('should set status filter', async () => {
      const { result } = renderHook(() => useUsers({ autoFetch: false }));

      act(() => {
        result.current.setStatusFilter(1);
      });

      expect(result.current.filter.status).toBe(1);
      expect(result.current.pagination.currentPage).toBe(1);
    });

    it('should set role filter', async () => {
      const { result } = renderHook(() => useUsers({ autoFetch: false }));

      act(() => {
        result.current.setRoleFilter(2);
      });

      expect(result.current.filter.roleId).toBe(2);
      expect(result.current.pagination.currentPage).toBe(1);
    });
  });

  describe('Sorting', () => {
    it('should set sorting', async () => {
      const { result } = renderHook(() => useUsers({ autoFetch: false }));

      act(() => {
        result.current.setSorting('name', false);
      });

      expect(result.current.pagination.sortBy).toBe('name');
      expect(result.current.pagination.sortDescending).toBe(false);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteUser(1);
      });

      expect(mockUsersService.deleteUser).toHaveBeenCalledWith(1);
      expect(deleteResult).toEqual({
        success: true,
        message: 'User deleted'
      });
      // Should refresh after delete
      expect(mockUsersService.getUsers.mock.calls.length).toBeGreaterThan(1);
    });

    it('should handle delete error', async () => {
      mockUsersService.deleteUser.mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteUser(1);
      });

      expect(deleteResult).toEqual({
        success: false,
        message: 'Delete failed'
      });
    });
  });

  describe('deleteMultipleUsers', () => {
    it('should delete multiple users successfully', async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteMultipleUsers([1, 2]);
      });

      expect(mockUsersService.deleteMultipleUsers).toHaveBeenCalledWith([1, 2]);
      expect(deleteResult).toEqual({
        success: true,
        message: 'Users deleted'
      });
    });
  });

  describe('changeUserStatus', () => {
    it('should change user status successfully', async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let statusResult;
      await act(async () => {
        statusResult = await result.current.changeUserStatus(1, 0);
      });

      expect(mockUsersService.changeUserStatus).toHaveBeenCalledWith({
        userIds: [1],
        status: 0
      });
      expect(statusResult).toEqual({
        success: true,
        message: 'Status changed'
      });
    });
  });

  describe('changeMultipleUsersStatus', () => {
    it('should change multiple users status successfully', async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let statusResult;
      await act(async () => {
        statusResult = await result.current.changeMultipleUsersStatus([1, 2], 1);
      });

      expect(mockUsersService.changeUserStatus).toHaveBeenCalledWith({
        userIds: [1, 2],
        status: 1
      });
    });
  });

  describe('exportUsers', () => {
    it('should export users successfully', async () => {
      // Mock DOM methods
      const createElementSpy = jest.spyOn(document, 'createElement');
      const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
      global.URL.createObjectURL = jest.fn(() => 'blob:test');
      global.URL.revokeObjectURL = jest.fn();

      // Create a proper container for renderHook
      const container = document.createElement('div');
      container.id = 'test-container';
      document.body.appendChild(container);

      const { result } = renderHook(() => useUsers(), { container });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let exportResult;
      await act(async () => {
        exportResult = await result.current.exportUsers();
      });

      expect(mockUsersService.exportUsers).toHaveBeenCalled();
      expect(exportResult).toEqual({
        success: true,
        message: 'Users exported successfully'
      });

      // Cleanup
      document.body.removeChild(container);
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('should handle export error', async () => {
      mockUsersService.exportUsers.mockRejectedValue(new Error('Export failed'));

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let exportResult;
      await act(async () => {
        exportResult = await result.current.exportUsers();
      });

      expect(exportResult).toEqual({
        success: false,
        message: 'Export failed'
      });
    });
  });

  describe('refreshUsers', () => {
    it('should refresh users list', async () => {
      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const callCountBefore = mockUsersService.getUsers.mock.calls.length;

      await act(async () => {
        await result.current.refreshUsers();
      });

      expect(mockUsersService.getUsers.mock.calls.length).toBe(callCountBefore + 1);
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      mockUsersService.getUsers.mockResolvedValue({
        isSuccess: false,
        data: null,
        message: 'Test error'
      } as any);

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.error).toBe('Test error');
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty users array', async () => {
      mockUsersService.getUsers.mockResolvedValue({
        isSuccess: true,
        data: {
          records: [],
          currentPage: 1,
          pageSize: 10,
          totalRecords: 0,
          totalPages: 0
        },
        message: 'Success'
      } as any);

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.users).toEqual([]);
      expect(result.current.pagination.showingFrom).toBe(0);
      expect(result.current.pagination.showingTo).toBe(0);
    });

    it('should handle null data gracefully', async () => {
      mockUsersService.getUsers.mockResolvedValue({
        isSuccess: true,
        data: null,
        message: 'Success'
      } as any);

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.users).toEqual([]);
    });
  });
});

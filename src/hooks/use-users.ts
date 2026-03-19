import { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  UsersFilter, 
  UsersPagination, 
  PageSize, 
  UseUsersReturn,
  GetUsersRequest
} from '@/types/users';
import { 
  getUsers, 
  deleteUser as deleteUserAPI, 
  deleteMultipleUsers as deleteMultipleUsersAPI,
  changeUserStatus as changeUserStatusAPI,
  exportUsers as exportUsersAPI
} from '@/services/users-service';

interface UseUsersOptions {
  initialPageSize?: PageSize;
  initialSortBy?: string;
  initialSortDescending?: boolean;
  autoFetch?: boolean;
}

export const useUsers = (options: UseUsersOptions = {}): UseUsersReturn => {
  const {
    initialPageSize = 10,
    initialSortBy = '',
    initialSortDescending = true,
    autoFetch = true,
  } = options;

  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState<UsersPagination>({
    currentPage: 1,
    pageSize: initialPageSize,
    totalRecords: 0,
    totalPages: 0,
    showingFrom: 0,
    showingTo: 0,
    sortBy: initialSortBy,
    sortDescending: initialSortDescending,
  });

  // Filter state
  const [filter, setFilter] = useState<UsersFilter>({
    roleId: 0,
    status: 0,
    searchTerm: '',
  });

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Helper function to determine actual page size
  const determineActualPageSize = useCallback(async (): Promise<number> => {
    if (pagination.pageSize === 'All' && pagination.totalRecords === 0) {
      const countRequest: GetUsersRequest = {
        SearchTerm: filter.searchTerm,
        PageNumber: 1,
        PageSize: 1,
        SortBy: pagination.sortBy,
        SortDescending: pagination.sortDescending,
        Filter: {
          RoleId: filter.roleId,
          Status: filter.status,
        },
      };
      
      console.log('Getting total count first:', countRequest);
      const countResponse = await getUsers(countRequest);
      
      if (countResponse.isSuccess || countResponse.IsSuccess) {
        const count = countResponse.data?.totalRecords || countResponse.Data?.TotalRecords || 50000;
        console.log('Got total count:', count);
        return count;
      }
      return 50000;
    }
    
    return pagination.pageSize === 'All' 
      ? Math.max(pagination.totalRecords, 50000)
      : Number(pagination.pageSize);
  }, [pagination.pageSize, pagination.totalRecords, pagination.sortBy, pagination.sortDescending, filter]);

  // Helper function to convert API users to internal format
  const convertApiUsersToUsers = useCallback((records: any[]): User[] => {
    return records.map((apiUser: any) => ({
      id: apiUser.userId,
      name: apiUser.fullName,
      email: apiUser.email,
      role: apiUser.roleName,
      status: apiUser.status as 'Active' | 'Inactive' | 'Draft' | 'Deleted',
    }));
  }, []);

  // Helper function to calculate pagination info
  const calculatePaginationInfo = useCallback((responseData: any, currentPageSize: PageSize) => {
    const currentPage = responseData?.currentPage || 1;
    const pageSize = responseData?.pageSize || currentPageSize;
    const totalRecords = responseData?.totalRecords || 0;
    const totalPages = responseData?.totalPages || 0;
    
    let effectivePageSize: number;
    if (typeof pageSize === 'string' && pageSize === 'All') {
      effectivePageSize = totalRecords;
    } else if (typeof pageSize === 'number') {
      effectivePageSize = pageSize;
    } else {
      effectivePageSize = Number(pageSize);
    }
    
    const showingFrom = totalRecords > 0 ? ((currentPage - 1) * effectivePageSize) + 1 : 0;
    const showingTo = Math.min(showingFrom + effectivePageSize - 1, totalRecords);
    
    return {
      currentPage,
      pageSize: pageSize as PageSize,
      totalRecords,
      totalPages,
      showingFrom,
      showingTo,
      effectivePageSize,
    };
  }, []);

  // Helper function to process successful response
  const processSuccessfulResponse = useCallback((response: any) => {
    const responseData = response.data;
    console.log('Response data analysis:', {
      responseData,
      recordsLength: responseData?.records?.length
    });
    
    const records = responseData?.records || [];
    const convertedUsers = convertApiUsersToUsers(records);
    setUsers(convertedUsers);
    
    const paginationInfo = calculatePaginationInfo(responseData, pagination.pageSize);
    
    console.log('Pagination calculation:', {
      ...paginationInfo,
      usersCount: convertedUsers.length
    });
    
    setPagination(prev => ({
      ...prev,
      ...paginationInfo,
    }));
  }, [pagination.pageSize, convertApiUsersToUsers, calculatePaginationInfo]);

  // Fetch users function
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const actualPageSize = await determineActualPageSize();

      const request: GetUsersRequest = {
        SearchTerm: filter.searchTerm,
        PageNumber: pagination.currentPage,
        PageSize: actualPageSize,
        SortBy: pagination.sortBy,
        SortDescending: pagination.sortDescending,
        Filter: {
          RoleId: filter.roleId,
          Status: filter.status,
        },
      };

      console.log('API Request:', request);
      if (pagination.pageSize === 'All') {
        console.log('ALL selected - using PageSize:', actualPageSize, 'totalRecords:', pagination.totalRecords);
      }
      
      const response = await getUsers(request);
      console.log('API Response:', response);
      
      if (pagination.pageSize === 'All') {
        console.log('ALL response - received records:', response.data?.records?.length, 'total available:', response.data?.totalRecords);
      }

      if (response.isSuccess) {
        processSuccessfulResponse(response);
      } else {
        const errorMessage = response.message || response.Message || 'Failed to fetch users';
        setError(errorMessage);
        setUsers([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, pagination.sortBy, pagination.sortDescending, pagination.totalRecords, filter, determineActualPageSize, processSuccessfulResponse]);

  // Auto-fetch on mount and dependency changes
  useEffect(() => {
    if (autoFetch) {
      fetchUsers();
    }
  }, [fetchUsers, autoFetch]);

  // Manual refresh function
  const refreshUsers = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  // Pagination functions
  const setPageSize = useCallback((pageSize: PageSize) => {
    console.log('Setting page size to:', pageSize);
    setPagination(prev => ({
      ...prev,
      pageSize: pageSize,
      currentPage: 1, // Reset to first page when changing page size
    }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page,
    }));
  }, []);

  // Filter functions
  const setSearchTerm = useCallback((term: string) => {
    setFilter(prev => ({
      ...prev,
      searchTerm: term,
    }));
    // Reset to first page when searching
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
    }));
  }, []);

  const setStatusFilter = useCallback((status: number) => {
    setFilter(prev => ({
      ...prev,
      status,
    }));
    // Reset to first page when filtering
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
    }));
  }, []);

  const setRoleFilter = useCallback((roleId: number) => {
    setFilter(prev => ({
      ...prev,
      roleId,
    }));
    // Reset to first page when filtering
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
    }));
  }, []);

  // Sorting function
  const setSorting = useCallback((sortBy: string, sortDescending: boolean) => {
    setPagination(prev => ({
      ...prev,
      sortBy,
      sortDescending,
    }));
  }, []);

  // Delete single user
  const deleteUser = useCallback(async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await deleteUserAPI(id);
      
      if (response.success) {
        // Refresh the users list after successful deletion
        await refreshUsers();
      }
      
      return {
        success: response.success,
        message: response.message || 'User deleted successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      return {
        success: false,
        message: errorMessage,
      };
    }
  }, [refreshUsers]);

  // Delete multiple users
  const deleteMultipleUsers = useCallback(async (ids: number[]): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await deleteMultipleUsersAPI(ids);
      
      if (response.success) {
        // Refresh the users list after successful deletion
        await refreshUsers();
      }
      
      return {
        success: response.success,
        message: response.message || `${ids.length} users deleted successfully`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete users';
      return {
        success: false,
        message: errorMessage,
      };
    }
  }, [refreshUsers]);

  // Change user status (activate/deactivate)
  const changeUserStatus = useCallback(async (userId: number, status: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await changeUserStatusAPI({ userIds: [userId], status: status });
      
      if (response.success) {
        // Refresh the users list after successful status change
        await refreshUsers();
      }
      
      return {
        success: response.success,
        message: response.message || 'User status changed successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change user status';
      return {
        success: false,
        message: errorMessage,
      };
    }
  }, [refreshUsers]);

  // Change multiple users status (bulk activate/deactivate)
  const changeMultipleUsersStatus = useCallback(async (userIds: number[], status: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await changeUserStatusAPI({ userIds: userIds, status: status });
      
      if (response.success) {
        // Refresh the users list after successful status change
        await refreshUsers();
      }
      
      const userText = userIds.length === 1 ? 'User' : 'Users';
      const statusText = status === 1 ? 'activated' : 'deactivated';
      
      return {
        success: response.success,
        message: response.message || `${userText} ${statusText} successfully`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change users status';
      return {
        success: false,
        message: errorMessage,
      };
    }
  }, [refreshUsers]);

  // Export users to file
  const exportUsers = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    try {
      const exportRequest = {
        SearchTerm: filter.searchTerm,
        PageNumber: 0, // Export all pages
        PageSize: 0,   // Export all records
        SortBy: pagination.sortBy,
        SortDescending: pagination.sortDescending,
        Filter: {
          RoleId: filter.roleId,
          Status: filter.status,
        },
      };

      const blob = await exportUsersAPI(exportRequest);
      
      // Create download link
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      a.download = `users_export_${dateStr}.csv`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      a.remove();
      globalThis.URL.revokeObjectURL(url);

      return {
        success: true,
        message: 'Users exported successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export users';
      return {
        success: false,
        message: errorMessage,
      };
    }
  }, [filter, pagination]);

  return {
    users,
    loading,
    error,
    totalRecords: pagination.totalRecords,
    pagination,
    filter,
    clearError,
    setPageSize,
    goToPage,
    setSearchTerm,
    setStatusFilter,
    setRoleFilter,
    setSorting,
    refreshUsers,
    deleteUser,
    deleteMultipleUsers,
    changeUserStatus,
    changeMultipleUsersStatus,
    exportUsers,
  };
};
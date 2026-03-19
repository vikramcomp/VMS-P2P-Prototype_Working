import { useState, useEffect, useCallback, useRef } from 'react';
import { groupsService } from '@/services/groups-service';
import { GroupSearchParams, UseGroupsState, PageSize } from '@/types/groups';

interface UseGroupsReturn extends UseGroupsState {
  fetchGroups: (params?: GroupSearchParams) => Promise<void>;
  refreshGroups: () => Promise<void>;
  clearError: () => void;
  setSearchParams: (params: GroupSearchParams) => void;
  deleteGroup: (categoryId: number) => Promise<{ success: boolean; message: string }>;
  deleteMultipleGroups: (categoryIds: number[]) => Promise<{ success: boolean; message: string }>;
  changeGroupStatus: (categoryId: number, status: number) => Promise<{ success: boolean; message: string }>;
  exportGroups: () => Promise<{ success: boolean; message: string }>;
  // Pagination methods
  setPageSize: (pageSize: PageSize) => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
}

/**
 * Custom hook for managing groups state and API operations
 */
export function useGroups(initialParams?: GroupSearchParams): UseGroupsReturn {
  const [state, setState] = useState<UseGroupsState>({
    groups: [],
    loading: false,
    error: null,
    totalRecords: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10, // Default to 10 per requirements
    sortColumn: '',
    sortType: 'asc',
    pagination: {
      currentPage: 1,
      pageSize: 10,
      totalRecords: 0,
      totalPages: 0,
      showingFrom: 0,
      showingTo: 0,
    }
  });

  const [searchParams, setSearchParams] = useState<GroupSearchParams>(initialParams || {
    pageNumber: 1,
    pageSize: 10, // Default to 10 per requirements
    sortColumn: '',
    sortType: 'asc',
    oldWorkflowOnly: true
  });

  // Use ref to track if we've already made the initial call
  const initialLoadRef = useRef(false);
  
  const fetchGroups = useCallback(async (params?: GroupSearchParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('🔄 useGroups: Fetching groups with params:', params);
      
      const finalParams = params || searchParams;
      const apiResponse: any = await groupsService.getGroups(finalParams);
      
      console.log('✅ useGroups: API response received:', apiResponse);
      
      // Transform API data to local format
      const transformedGroups = groupsService.transformApiDataToGroups(apiResponse);
      
      // Safely extract data with fallback values (handle both PascalCase and camelCase)
      const responseData = apiResponse?.data || apiResponse?.Data || {};
      const currentPage = responseData.currentPage || responseData.CurrentPage || 1;
      const pageSize = (params?.pageSize as PageSize) || state.pageSize;
      const totalRecords = responseData.totalRecords || responseData.TotalRecords || 0;
      
      // Calculate pagination info
      const paginationInfo = groupsService.calculatePaginationInfo(totalRecords, currentPage, pageSize);
      
      // Update search params if new params were provided
      if (params) {
        setSearchParams(params);
      }
      
      setState(prev => ({
        ...prev,
        groups: transformedGroups,
        totalRecords,
        totalPages: paginationInfo.totalPages,
        currentPage,
        pageSize,
        sortColumn: responseData.sortColumn || responseData.SortColumn || '',
        sortType: responseData.sortType || responseData.SortType || 'asc',
        loading: false,
        error: null,
        pagination: {
          currentPage,
          pageSize,
          totalRecords,
          totalPages: paginationInfo.totalPages,
          showingFrom: paginationInfo.showingFrom,
          showingTo: paginationInfo.showingTo,
        }
      }));
      
      console.log('✅ useGroups: State updated with', transformedGroups.length, 'groups');
    } catch (error) {
      console.error('❌ useGroups: Error fetching groups:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }));
    }
  }, [searchParams]);

  const refreshGroups = useCallback(async () => {
    await fetchGroups(searchParams);
  }, [fetchGroups, searchParams]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Pagination methods
  const setPageSize = useCallback(async (newPageSize: PageSize) => {
    const newParams = {
      ...searchParams,
      pageSize: newPageSize,
      pageNumber: 1, // Reset to first page when changing page size
    };
    setSearchParams(newParams);
    await fetchGroups(newParams);
  }, [searchParams, fetchGroups]);

  const goToPage = useCallback(async (page: number) => {
    const newParams = {
      ...searchParams,
      pageNumber: page,
    };
    setSearchParams(newParams);
    await fetchGroups(newParams);
  }, [searchParams, fetchGroups]);

  const nextPage = useCallback(async () => {
    if (state.currentPage < state.totalPages) {
      await goToPage(state.currentPage + 1);
    }
  }, [state.currentPage, state.totalPages, goToPage]);

  const previousPage = useCallback(async () => {
    if (state.currentPage > 1) {
      await goToPage(state.currentPage - 1);
    }
  }, [state.currentPage, goToPage]);

  const deleteGroup = useCallback(async (categoryId: number): Promise<{ success: boolean; message: string }> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await groupsService.deleteGroup(categoryId);
      
      if (result.success) {
        // Refresh the groups list after successful deletion
        await fetchGroups(searchParams);
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete group';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [fetchGroups, searchParams]);

  const deleteMultipleGroups = useCallback(async (categoryIds: number[]): Promise<{ success: boolean; message: string }> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await groupsService.deleteMultipleGroups(categoryIds);
      
      if (result.success) {
        // Refresh the groups list after successful deletion
        await fetchGroups(searchParams);
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete groups';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [fetchGroups, searchParams]);

  const changeGroupStatus = useCallback(async (categoryId: number, status: number): Promise<{ success: boolean; message: string }> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await groupsService.changeGroupStatus([categoryId], status);
      
      if (result.success) {
        // Refresh the groups list after successful status change
        await fetchGroups(searchParams);
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change group status';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [fetchGroups, searchParams]);

  const exportGroups = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const blob = await groupsService.exportGroups();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Try to get filename from content-disposition header, fallback to default
      const currentDate = new Date().toISOString().split('T')[0];
      link.download = `groups_export_${currentDate}.csv`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up
      URL.revokeObjectURL(url);
      
      setState(prev => ({ ...prev, loading: false }));
      return {
        success: true,
        message: 'Groups exported successfully'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export groups';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return {
        success: false,
        message: errorMessage
      };
    }
  }, []);

  // Only fetch on mount, not on searchParams change
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      fetchGroups();
    }
  }, []); // Empty dependency array

  return {
    ...state,
    fetchGroups,
    refreshGroups,
    clearError,
    setSearchParams,
    deleteGroup,
    deleteMultipleGroups,
    changeGroupStatus,
    exportGroups,
    // Pagination methods
    setPageSize,
    goToPage,
    nextPage,
    previousPage,
  };
}
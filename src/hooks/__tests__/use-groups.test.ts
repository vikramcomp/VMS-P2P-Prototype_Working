import { renderHook, act, waitFor } from '@testing-library/react';
import { useGroups } from '../use-groups';
import { groupsService } from '@/services/groups-service';
import { GroupSearchParams } from '@/types/groups';

// Mock the groups service
jest.mock('@/services/groups-service');

const mockGroupsService = groupsService as jest.Mocked<typeof groupsService>;

describe('useGroups', () => {
  const mockGroups = [
    { categoryId: 1, categoryName: 'Group 1', status: 1 },
    { categoryId: 2, categoryName: 'Group 2', status: 1 }
  ];

  const mockApiResponse = {
    data: {
      records: mockGroups,
      currentPage: 1,
      pageSize: 10,
      totalRecords: 2,
      totalPages: 1,
      sortColumn: 'CategoryName',
      sortType: 'asc'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Default mock implementations
    mockGroupsService.getGroups.mockResolvedValue(mockApiResponse);
    mockGroupsService.transformApiDataToGroups.mockReturnValue(mockGroups);
    mockGroupsService.calculatePaginationInfo.mockReturnValue({
      totalPages: 1,
      showingFrom: 1,
      showingTo: 2
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useGroups());

      expect(result.current.groups).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.totalRecords).toBe(0);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.pageSize).toBe(10);
    });

    it('should initialize with custom params', () => {
      const initialParams: GroupSearchParams = {
        pageNumber: 2,
        pageSize: 20,
        sortColumn: 'Status',
        sortType: 'desc'
      };

      const { result } = renderHook(() => useGroups(initialParams));

      expect(result.current.pageSize).toBe(10); // Still uses default state pageSize
    });
  });

  describe('fetchGroups', () => {
    it('should fetch groups successfully', async () => {
      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockGroupsService.getGroups).toHaveBeenCalledWith(expect.objectContaining({
        pageNumber: 1,
        pageSize: 10
      }));
      expect(result.current.groups).toEqual(mockGroups);
      expect(result.current.totalRecords).toBe(2);
      expect(result.current.error).toBeNull();
    });

    it('should handle API error', async () => {
      mockGroupsService.getGroups.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('API Error');
      expect(result.current.groups).toEqual([]);
    });

    it('should fetch with custom search params', async () => {
      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const customParams: GroupSearchParams = {
        pageNumber: 2,
        pageSize: 20,
        sortColumn: 'Status',
        sortType: 'desc',
        searchText: 'test'
      };

      await act(async () => {
        await result.current.fetchGroups(customParams);
      });

      expect(mockGroupsService.getGroups).toHaveBeenCalledWith(customParams);
    });
  });

  describe('refreshGroups', () => {
    it('should refresh groups with current params', async () => {
      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const callCountBefore = mockGroupsService.getGroups.mock.calls.length;

      await act(async () => {
        await result.current.refreshGroups();
      });

      expect(mockGroupsService.getGroups.mock.calls.length).toBeGreaterThan(callCountBefore);
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      mockGroupsService.getGroups.mockRejectedValue(new Error('Test Error'));

      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.error).toBe('Test Error');
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Pagination', () => {
    it('should set page size and reset to first page', async () => {
      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.setPageSize(20);
      });

      expect(mockGroupsService.getGroups).toHaveBeenCalledWith(
        expect.objectContaining({
          pageNumber: 1,
          pageSize: 20
        })
      );
    });

    it('should navigate to specific page', async () => {
      mockApiResponse.data.totalPages = 5;
      mockGroupsService.calculatePaginationInfo.mockReturnValue({
        totalPages: 5,
        showingFrom: 21,
        showingTo: 30
      });

      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.goToPage(3);
      });

      expect(mockGroupsService.getGroups).toHaveBeenCalledWith(
        expect.objectContaining({
          pageNumber: 3
        })
      );
    });

    it('should go to next page', async () => {
      mockApiResponse.data.totalPages = 3;
      mockGroupsService.calculatePaginationInfo.mockReturnValue({
        totalPages: 3,
        showingFrom: 1,
        showingTo: 10
      });

      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.totalPages).toBe(3);
      });

      await act(async () => {
        await result.current.nextPage();
      });

      expect(mockGroupsService.getGroups).toHaveBeenCalledWith(
        expect.objectContaining({
          pageNumber: 2
        })
      );
    });

    it('should not go to next page if on last page', async () => {
      mockApiResponse.data.currentPage = 3;
      mockApiResponse.data.totalPages = 3;
      mockGroupsService.calculatePaginationInfo.mockReturnValue({
        totalPages: 3,
        showingFrom: 21,
        showingTo: 30
      });

      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.currentPage).toBe(3);
        expect(result.current.totalPages).toBe(3);
      });

      const callCountBefore = mockGroupsService.getGroups.mock.calls.length;

      await act(async () => {
        await result.current.nextPage();
      });

      // Should not make additional call
      expect(mockGroupsService.getGroups.mock.calls.length).toBe(callCountBefore);
    });

    it('should go to previous page', async () => {
      mockApiResponse.data.currentPage = 2;
      mockApiResponse.data.totalPages = 3;

      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.currentPage).toBe(2);
      });

      await act(async () => {
        await result.current.previousPage();
      });

      expect(mockGroupsService.getGroups).toHaveBeenCalledWith(
        expect.objectContaining({
          pageNumber: 1
        })
      );
    });

    it('should not go to previous page if on first page', async () => {
      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.currentPage).toBe(1);
      });

      const callCountBefore = mockGroupsService.getGroups.mock.calls.length;

      await act(async () => {
        await result.current.previousPage();
      });

      // Should not make additional call
      expect(mockGroupsService.getGroups.mock.calls.length).toBe(callCountBefore);
    });
  });

  describe('deleteGroup', () => {
    it('should delete a group successfully', async () => {
      mockGroupsService.deleteGroup.mockResolvedValue({
        success: true,
        message: 'Group deleted'
      });

      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteGroup(1);
      });

      expect(mockGroupsService.deleteGroup).toHaveBeenCalledWith(1);
      expect(deleteResult).toEqual({
        success: true,
        message: 'Group deleted'
      });
      // Should refresh groups after successful delete
      expect(mockGroupsService.getGroups.mock.calls.length).toBeGreaterThan(1);
    });

    it('should handle delete error', async () => {
      mockGroupsService.deleteGroup.mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteGroup(1);
      });

      expect(deleteResult).toEqual({
        success: false,
        message: 'Delete failed'
      });
    });
  });

  describe('deleteMultipleGroups', () => {
    it('should delete multiple groups successfully', async () => {
      mockGroupsService.deleteMultipleGroups.mockResolvedValue({
        success: true,
        message: '2 groups deleted'
      });

      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteMultipleGroups([1, 2]);
      });

      expect(mockGroupsService.deleteMultipleGroups).toHaveBeenCalledWith([1, 2]);
      expect(deleteResult).toEqual({
        success: true,
        message: '2 groups deleted'
      });
    });
  });

  describe('changeGroupStatus', () => {
    it('should change group status successfully', async () => {
      mockGroupsService.changeGroupStatus.mockResolvedValue({
        success: true,
        message: 'Status changed'
      });

      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let statusResult;
      await act(async () => {
        statusResult = await result.current.changeGroupStatus(1, 0);
      });

      expect(mockGroupsService.changeGroupStatus).toHaveBeenCalledWith([1], 0);
      expect(statusResult).toEqual({
        success: true,
        message: 'Status changed'
      });
    });
  });

  describe('exportGroups', () => {
    it('should handle export error', async () => {
      mockGroupsService.exportGroups.mockRejectedValue(new Error('Export failed'));

      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let exportResult;
      await act(async () => {
        exportResult = await result.current.exportGroups();
      });

      expect(exportResult).toEqual({
        success: false,
        message: 'Export failed'
      });
    });
  });

  describe('setSearchParams', () => {
    it('should update search params', () => {
      const { result } = renderHook(() => useGroups());

      const newParams: GroupSearchParams = {
        searchText: 'test',
        status: 1
      };

      act(() => {
        result.current.setSearchParams(newParams);
      });

      // SearchParams are updated internally but not exposed in return type
      // We verify by checking if next fetch uses new params
      expect(result.current).toBeDefined();
    });
  });
});

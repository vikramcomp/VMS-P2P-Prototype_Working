import { renderHook, act, waitFor } from '@testing-library/react';
import { useStudios } from '../use-studios';
import { studiosService } from '@/services/studios-service';

// Mock the studios service
jest.mock('@/services/studios-service');

const mockStudiosService = studiosService as jest.Mocked<typeof studiosService>;

describe('useStudios', () => {
  const mockStudios = [
    { id: '1', name: 'Studio Alpha', status: 1 },
    { id: '2', name: 'Studio Beta', status: 1 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Default mock implementation
    mockStudiosService.getStudios.mockResolvedValue({
      success: true,
      data: mockStudios,
      message: 'Success'
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize and fetch studios on mount', async () => {
      const { result } = renderHook(() => useStudios());

      // Initial state before fetch completes
      expect(result.current.studios).toEqual([]);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockStudiosService.getStudios).toHaveBeenCalledWith(true);
      expect(result.current.studios).toEqual(mockStudios);
      expect(result.current.error).toBeNull();
    });

    it('should accept activeOnly parameter', async () => {
      const { result } = renderHook(() => useStudios(false));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockStudiosService.getStudios).toHaveBeenCalledWith(false);
    });
  });

  describe('fetchStudios', () => {
    it('should fetch active studios successfully', async () => {
      const { result } = renderHook(() => useStudios());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.fetchStudios(true);
      });

      expect(mockStudiosService.getStudios).toHaveBeenCalledWith(true);
      expect(result.current.studios).toEqual(mockStudios);
      expect(result.current.error).toBeNull();
    });

    it('should fetch all studios including inactive', async () => {
      const allStudios = [
        ...mockStudios,
        { id: '3', name: 'Studio Inactive', status: 0 }
      ];

      mockStudiosService.getStudios.mockResolvedValue({
        success: true,
        data: allStudios,
        message: 'Success'
      });

      const { result } = renderHook(() => useStudios(false));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.studios).toEqual(allStudios);
    });

    it('should handle API error response', async () => {
      mockStudiosService.getStudios.mockResolvedValue({
        success: false,
        data: [],
        message: 'Failed to load studios'
      });

      const { result } = renderHook(() => useStudios());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load studios');
      expect(result.current.studios).toEqual([]);
    });

    it('should handle API exception', async () => {
      mockStudiosService.getStudios.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useStudios());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('An error occurred while fetching studios');
      expect(result.current.studios).toEqual([]);
    });

    it('should filter out studios without name or id', async () => {
      const studiosWithInvalid = [
        { id: '1', name: 'Valid Studio', status: 1 },
        { id: '', name: '', status: 1 }, // Invalid - no name or id
        { name: 'No ID Studio', status: 1 } as any, // Invalid - no id
        { id: '2', status: 1 } as any, // Invalid - no name
        { id: '3', name: 'Another Valid', status: 1 }
      ];

      mockStudiosService.getStudios.mockResolvedValue({
        success: true,
        data: studiosWithInvalid,
        message: 'Success'
      });

      const { result } = renderHook(() => useStudios());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should only have the 2 valid studios
      expect(result.current.studios.length).toBe(2);
      expect(result.current.studios[0].name).toBe('Valid Studio');
      expect(result.current.studios[1].name).toBe('Another Valid');
    });

    it('should handle studios with different property cases', async () => {
      const studiosWithDifferentCases = [
        { id: '1', name: 'Normal Studio', status: 1 },
        { id: '2', StudioName: 'PascalCase Studio', status: 1 },
        { StudioId: '3', studioname: 'lowercase studio', status: 1 }
      ];

      mockStudiosService.getStudios.mockResolvedValue({
        success: true,
        data: studiosWithDifferentCases as any,
        message: 'Success'
      });

      const { result } = renderHook(() => useStudios());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // All should be included as they have valid names and IDs
      expect(result.current.studios.length).toBe(3);
    });
  });

  describe('refreshStudios', () => {
    it('should refresh studios with current activeOnly setting', async () => {
      const { result } = renderHook(() => useStudios(true));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const callCountBefore = mockStudiosService.getStudios.mock.calls.length;

      await act(async () => {
        await result.current.refreshStudios();
      });

      expect(mockStudiosService.getStudios.mock.calls.length).toBe(callCountBefore + 1);
      expect(mockStudiosService.getStudios).toHaveBeenLastCalledWith(true);
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      mockStudiosService.getStudios.mockResolvedValue({
        success: false,
        data: [],
        message: 'Test error'
      });

      const { result } = renderHook(() => useStudios());

      await waitFor(() => {
        expect(result.current.error).toBe('Test error');
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Loading state', () => {
    it('should set loading to true while fetching', async () => {
      let resolvePromise: any;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockStudiosService.getStudios.mockReturnValue(promise as any);

      const { result } = renderHook(() => useStudios());

      // Should eventually be loading
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      // Resolve the promise
      await act(async () => {
        resolvePromise({
          success: true,
          data: mockStudios,
          message: 'Success'
        });
        await promise;
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty studios array', async () => {
      mockStudiosService.getStudios.mockResolvedValue({
        success: true,
        data: [],
        message: 'No studios found'
      });

      const { result } = renderHook(() => useStudios());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.studios).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle null response data gracefully', async () => {
      mockStudiosService.getStudios.mockResolvedValue({
        success: true,
        data: null as any,
        message: 'Success'
      });

      const { result } = renderHook(() => useStudios());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should not crash and should show empty array
      expect(result.current.studios).toEqual([]);
    });
  });
});

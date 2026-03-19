import { subgroupsMappingService } from '../subgroups-mapping-service';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

// Mock api-client
jest.mock('../api-client', () => ({
  buildApiUrl: jest.fn((path) => `https://api.test.com/${path}`),
}));

describe('SubgroupsMappingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('getSubgroupMapping', () => {
    it('should fetch subgroup mapping by group ID successfully', async () => {
      const mockResponse = {
        MappedSubgroups: [
          { SubgroupId: 1, SubgroupName: 'Mapped 1' },
          { SubgroupId: 2, SubgroupName: 'Mapped 2' }
        ],
        UnmappedSubgroups: [
          { SubgroupId: 3, SubgroupName: 'Unmapped 1' }
        ],
        IsSuccess: true,
        Message: 'Success'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await subgroupsMappingService.getSubgroupMapping('100');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/group-subgroup-mapping/group/100',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle HTTP errors with error text', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Group not found',
      });

      await expect(
        subgroupsMappingService.getSubgroupMapping('999')
      ).rejects.toThrow('HTTP error! status: 404, message: Group not found');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        subgroupsMappingService.getSubgroupMapping('100')
      ).rejects.toThrow('Network error');
    });

    it('should handle empty mapping response', async () => {
      const mockResponse = {
        MappedSubgroups: [],
        UnmappedSubgroups: [],
        IsSuccess: true
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await subgroupsMappingService.getSubgroupMapping('100');

      expect(result.MappedSubgroups).toEqual([]);
      expect(result.UnmappedSubgroups).toEqual([]);
    });
  });

  describe('saveSubgroupMapping', () => {
    it('should save subgroup mapping successfully', async () => {
      const mockResponse = {
        IsSuccess: true,
        Message: 'Mapping saved successfully'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await subgroupsMappingService.saveSubgroupMapping('1', ['10', '20', '30']);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/subgroup-mapping/save-mapping',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            subgroupMappingId: '1',
            subgroupIds: ['10', '20', '30']
          })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty subgroup IDs array', async () => {
      const mockResponse = {
        IsSuccess: true,
        Message: 'No mappings to save'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await subgroupsMappingService.saveSubgroupMapping('1', []);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/subgroup-mapping/save-mapping',
        expect.objectContaining({
          body: JSON.stringify({
            subgroupMappingId: '1',
            subgroupIds: []
          })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle save errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(
        subgroupsMappingService.saveSubgroupMapping('1', ['10'])
      ).rejects.toThrow('HTTP error! status: 400');
    });

    it('should handle network errors during save', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection timeout'));

      await expect(
        subgroupsMappingService.saveSubgroupMapping('1', ['10'])
      ).rejects.toThrow('Connection timeout');
    });
  });

  describe('updateSubgroupMapping', () => {
    it('should update subgroup mapping successfully', async () => {
      const mockResponse = {
        IsSuccess: true,
        Message: 'Mapping updated successfully'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await subgroupsMappingService.updateSubgroupMapping(
        '100',
        [1, 2, 3],
        [4, 5]
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/group-subgroup-mapping/group/100/update',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            MappedSubgroupIds: [1, 2, 3],
            UnMappedSubgroupIds: [4, 5]
          })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle update with empty arrays', async () => {
      const mockResponse = {
        IsSuccess: true,
        Message: 'No changes'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await subgroupsMappingService.updateSubgroupMapping('100', [], []);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/group-subgroup-mapping/group/100/update',
        expect.objectContaining({
          body: JSON.stringify({
            MappedSubgroupIds: [],
            UnMappedSubgroupIds: []
          })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle only mapped IDs', async () => {
      const mockResponse = { IsSuccess: true };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await subgroupsMappingService.updateSubgroupMapping('100', [1, 2], []);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            MappedSubgroupIds: [1, 2],
            UnMappedSubgroupIds: []
          })
        })
      );
    });

    it('should handle only unmapped IDs', async () => {
      const mockResponse = { IsSuccess: true };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await subgroupsMappingService.updateSubgroupMapping('100', [], [3, 4]);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            MappedSubgroupIds: [],
            UnMappedSubgroupIds: [3, 4]
          })
        })
      );
    });

    it('should handle update errors with error text', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal server error',
      });

      await expect(
        subgroupsMappingService.updateSubgroupMapping('100', [1], [2])
      ).rejects.toThrow('HTTP error! status: 500, message: Internal server error');
    });

    it('should handle update errors without detailed message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => '',
      });

      await expect(
        subgroupsMappingService.updateSubgroupMapping('100', [1], [2])
      ).rejects.toThrow('HTTP error! status: 403');
    });

    it('should handle network errors during update', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Request timeout'));

      await expect(
        subgroupsMappingService.updateSubgroupMapping('100', [1], [2])
      ).rejects.toThrow('Request timeout');
    });
  });

  describe('Edge Cases', () => {
    it('should handle string group IDs in all methods', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ IsSuccess: true }),
      });

      await subgroupsMappingService.getSubgroupMapping('string-id');
      await subgroupsMappingService.updateSubgroupMapping('string-id', [1], [2]);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('string-id'),
        expect.any(Object)
      );
    });

    it('should handle large arrays of subgroup IDs', async () => {
      const largeArray = Array.from({ length: 100 }, (_, i) => i + 1);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ IsSuccess: true }),
      });

      await subgroupsMappingService.updateSubgroupMapping('100', largeArray, []);

      expect(mockFetch).toHaveBeenCalled();
      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.MappedSubgroupIds).toHaveLength(100);
    });
  });
});


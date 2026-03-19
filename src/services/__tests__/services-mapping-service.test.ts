import { servicesMappingService } from '../services-mapping-service';

// Mock dependencies
jest.mock('../api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
  buildApiUrl: jest.fn((path: string) => `http://localhost:3000/api/${path}`),
}));

jest.mock('@/utils/logger', () => ({
  logger: {
    apiRequest: jest.fn(),
    apiResponse: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/utils/error-handler', () => ({
  errorHandler: {
    handleAPIResponse: jest.fn(),
    handleError: jest.fn((error: any, message: string) => {
      throw error;
    }),
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('ServicesMappingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Instance', () => {
    it('should be defined as an instance', () => {
      expect(servicesMappingService).toBeDefined();
      expect(typeof servicesMappingService).toBe('object');
    });

    it('should have all required methods', () => {
      expect(typeof servicesMappingService.getDivisionMapping).toBe('function');
      expect(typeof servicesMappingService.saveDivisionMapping).toBe('function');
      expect(typeof servicesMappingService.updateDivisionMappingBulk).toBe('function');
      expect(typeof servicesMappingService.updateDivisionMapping).toBe('function');
    });
  });

  describe('getDivisionMapping', () => {
    it('should fetch division mapping successfully', async () => {
      const mockResponse = {
        mapped: [
          { serviceId: 1, serviceName: 'Service 1' },
          { serviceId: 2, serviceName: 'Service 2' },
        ],
        unmapped: [
          { serviceId: 3, serviceName: 'Service 3' },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await servicesMappingService.getDivisionMapping('division-123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/service-division-mapping/division/division-123',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(result).toEqual(mockResponse);
      expect(result.mapped).toHaveLength(2);
      expect(result.unmapped).toHaveLength(1);
    });

    it('should handle empty response data', async () => {
      const mockResponse = {
        mapped: [],
        unmapped: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await servicesMappingService.getDivisionMapping('division-456');

      expect(result.mapped).toEqual([]);
      expect(result.unmapped).toEqual([]);
    });

    it('should handle API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Division not found',
      });

      await expect(
        servicesMappingService.getDivisionMapping('invalid-id')
      ).rejects.toThrow();
    });

    it('should handle network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        servicesMappingService.getDivisionMapping('division-123')
      ).rejects.toThrow('Network error');
    });
  });

  describe('saveDivisionMapping', () => {
    it('should save division mapping successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Mapping saved successfully',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await servicesMappingService.saveDivisionMapping('division-123', ['1', '2', '3']);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/service-details-mapping/save-mapping',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            divisionMappingId: 'division-123',
            serviceIds: ['1', '2', '3'],
          }),
        })
      );

      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
    });

    it('should save mapping with empty service IDs array', async () => {
      const mockResponse = {
        success: true,
        message: 'Mapping cleared',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await servicesMappingService.saveDivisionMapping('division-123', []);

      expect(result.success).toBe(true);
    });

    it('should handle save error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal server error',
      });

      await expect(
        servicesMappingService.saveDivisionMapping('division-123', ['1', '2'])
      ).rejects.toThrow();
    });
  });

  describe('updateDivisionMappingBulk', () => {
    it('should update division mapping in bulk successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Mappings updated successfully',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await servicesMappingService.updateDivisionMappingBulk(
        'division-123',
        [1, 2, 3],
        [4, 5]
      );

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/service-division-mapping/division/division-123/update',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            mappedServiceIds: [1, 2, 3],
            unMappedServiceIds: [4, 5],
          }),
        })
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Mappings updated successfully');
    });

    it('should handle PascalCase response', async () => {
      const mockResponse = {
        Success: true,
        Message: 'Updated successfully',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await servicesMappingService.updateDivisionMappingBulk(
        'division-456',
        [1, 2],
        [3]
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Updated successfully');
    });

    it('should handle bulk update with empty arrays', async () => {
      const mockResponse = {
        success: true,
        message: 'Mappings updated successfully',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await servicesMappingService.updateDivisionMappingBulk(
        'division-123',
        [],
        []
      );

      expect(result.success).toBe(true);
    });

    it('should handle bulk update error gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad request',
      });

      const result = await servicesMappingService.updateDivisionMappingBulk(
        'division-123',
        [1, 2],
        [3, 4]
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Bad request');
    });

    it('should handle network error in bulk update', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await servicesMappingService.updateDivisionMappingBulk(
        'division-123',
        [1],
        [2]
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Network error');
    });
  });

  describe('updateDivisionMapping (deprecated)', () => {
    it('should update division mapping successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Updated successfully',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await servicesMappingService.updateDivisionMapping(
        'mapping-123',
        [1, 2, 3],
        [4, 5]
      );

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/service-details-mapping/division-mapping/mapping-123/update',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            MappedServiceDetailIds: [1, 2, 3],
            UnMappedServiceDetailIds: [4, 5],
          }),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle update error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Server error',
      });

      await expect(
        servicesMappingService.updateDivisionMapping('mapping-123', [1], [2])
      ).rejects.toThrow();
    });
  });
});

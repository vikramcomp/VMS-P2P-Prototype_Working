import { studiosService } from '../studios-service';

// Mock dependencies
jest.mock('../api-client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

jest.mock('../enhanced-api-client', () => ({
  EnhancedApiClient: {
    fetchWithTransform: jest.fn(),
    getRecords: jest.fn((data: any) => {
      if (Array.isArray(data)) return data;
      if (data?.data?.records) return data.data.records;
      if (data?.Data?.Records) return data.Data.Records;
      return [];
    }),
  },
  ResponseUtils: {
    transformRecords: jest.fn((records: any[], mapping: any) => {
      return records.map((record: any) => ({
        id: record.StudioId || record.studioId,
        name: record.StudioName || record.studioName,
        description: record.Description || record.description,
        isActive: record.IsActive ?? record.isActive ?? true,
      }));
    }),
  },
}));

describe('StudiosService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set environment variable
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3000/api';
  });

  describe('Service Instance', () => {
    it('should be defined as an instance', () => {
      expect(studiosService).toBeDefined();
      expect(typeof studiosService).toBe('object');
    });

    it('should have all required methods', () => {
      expect(typeof studiosService.getAllStudios).toBe('function');
      expect(typeof studiosService.getStudios).toBe('function');
      expect(typeof studiosService.getStudioById).toBe('function');
    });
  });

  describe('getAllStudios', () => {
    it('should fetch all studios successfully', async () => {
      const mockApiResponse = [
        { StudioId: '1', StudioName: 'Studio Alpha', Description: 'Main studio', IsActive: true },
        { StudioId: '2', StudioName: 'Studio Beta', Description: 'Dev studio', IsActive: true },
        { StudioId: '3', StudioName: 'Studio Gamma', Description: 'Test studio', IsActive: false },
      ];

      const { EnhancedApiClient } = require('../enhanced-api-client');
      EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce(mockApiResponse);

      const result = await studiosService.getAllStudios();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('name');
      expect(result.data[0]).toHaveProperty('isActive');
    });

    it('should handle nested API response structure', async () => {
      const mockApiResponse = {
        data: {
          records: [
            { StudioId: '1', StudioName: 'Studio One', Description: 'First studio', IsActive: true },
          ],
        },
      };

      const { EnhancedApiClient } = require('../enhanced-api-client');
      EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce(mockApiResponse);
      EnhancedApiClient.getRecords.mockReturnValueOnce(mockApiResponse.data.records);

      const result = await studiosService.getAllStudios();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('should handle PascalCase response', async () => {
      const mockApiResponse = {
        Data: {
          Records: [
            { StudioId: '1', StudioName: 'Studio Test', Description: 'Test', IsActive: true },
          ],
        },
      };

      const { EnhancedApiClient } = require('../enhanced-api-client');
      EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce(mockApiResponse);
      EnhancedApiClient.getRecords.mockReturnValueOnce(mockApiResponse.Data.Records);

      const result = await studiosService.getAllStudios();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('should handle empty studios array', async () => {
      const { EnhancedApiClient } = require('../enhanced-api-client');
      EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce([]);

      const result = await studiosService.getAllStudios();

      // API returns empty array which is normalized to empty
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should fallback to mock data on API error', async () => {
      const { EnhancedApiClient } = require('../enhanced-api-client');
      EnhancedApiClient.fetchWithTransform.mockRejectedValueOnce(new Error('API Error'));

      const result = await studiosService.getAllStudios();

      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0); // Mock data
      expect(result.message).toContain('mock data');
    });

    it('should normalize studio data correctly', async () => {
      const mockApiResponse = [
        { StudioId: '123', StudioName: 'Test Studio', Description: 'Test Description', IsActive: true },
      ];

      const { EnhancedApiClient, ResponseUtils } = require('../enhanced-api-client');
      EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce(mockApiResponse);
      ResponseUtils.transformRecords.mockReturnValueOnce([
        { id: '123', name: 'Test Studio', description: 'Test Description', isActive: true },
      ]);

      const result = await studiosService.getAllStudios();

      expect(result.data[0].id).toBe('123');
      expect(result.data[0].name).toBe('Test Studio');
      expect(result.data[0].description).toBe('Test Description');
      expect(result.data[0].isActive).toBe(true);
    });
  });

  describe('getStudios', () => {
    it('should filter active studios when onlyActive is true', async () => {
      const mockApiResponse = [
        { StudioId: '1', StudioName: 'Active Studio', Description: 'Active', IsActive: true },
        { StudioId: '2', StudioName: 'Inactive Studio', Description: 'Inactive', IsActive: false },
      ];

      const { EnhancedApiClient, ResponseUtils } = require('../enhanced-api-client');
      EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce(mockApiResponse);
      ResponseUtils.transformRecords.mockReturnValueOnce([
        { id: '1', name: 'Active Studio', description: 'Active', isActive: true },
        { id: '2', name: 'Inactive Studio', description: 'Inactive', isActive: false },
      ]);

      const result = await studiosService.getStudios(true);

      expect(result.success).toBe(true);
      expect(result.data.every((s: any) => s.isActive !== false)).toBe(true);
    });

    it('should return all studios when onlyActive is false', async () => {
      const mockApiResponse = [
        { StudioId: '1', StudioName: 'Active Studio', Description: 'Active', IsActive: true },
        { StudioId: '2', StudioName: 'Inactive Studio', Description: 'Inactive', IsActive: false },
      ];

      const { EnhancedApiClient, ResponseUtils } = require('../enhanced-api-client');
      EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce(mockApiResponse);
      ResponseUtils.transformRecords.mockReturnValueOnce([
        { id: '1', name: 'Active Studio', description: 'Active', isActive: true },
        { id: '2', name: 'Inactive Studio', description: 'Inactive', isActive: false },
      ]);

      const result = await studiosService.getStudios(false);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should fallback to filtered mock data on error', async () => {
      const { EnhancedApiClient } = require('../enhanced-api-client');
      EnhancedApiClient.fetchWithTransform.mockRejectedValueOnce(new Error('Network error'));

      const result = await studiosService.getStudios(true);

      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.message).toContain('mock');
    });
  });

  describe('getStudioById', () => {
    it('should fetch studio by ID successfully', async () => {
      const mockApiResponse = [
        { StudioId: '1', StudioName: 'Studio Alpha', Description: 'Main studio', IsActive: true },
        { StudioId: '2', StudioName: 'Studio Beta', Description: 'Dev studio', IsActive: true },
      ];

      const { EnhancedApiClient, ResponseUtils } = require('../enhanced-api-client');
      EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce(mockApiResponse);
      ResponseUtils.transformRecords.mockReturnValueOnce([
        { id: '1', name: 'Studio Alpha', description: 'Main studio', isActive: true },
        { id: '2', name: 'Studio Beta', description: 'Dev studio', isActive: true },
      ]);

      const result = await studiosService.getStudioById('1');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('1');
      expect(result.data?.name).toBe('Studio Alpha');
    });

    it('should return mock data when studio not found in API', async () => {
      const mockApiResponse = [
        { StudioId: '1', StudioName: 'Studio Alpha', Description: 'Main studio', IsActive: true },
      ];

      const { EnhancedApiClient, ResponseUtils } = require('../enhanced-api-client');
      EnhancedApiClient.fetchWithTransform.mockResolvedValueOnce(mockApiResponse);
      ResponseUtils.transformRecords.mockReturnValueOnce([
        { id: '1', name: 'Studio Alpha', description: 'Main studio', isActive: true },
      ]);

      const result = await studiosService.getStudioById('999');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.message).toContain('mock');
    });

    it('should fallback to mock data on API error', async () => {
      const { EnhancedApiClient } = require('../enhanced-api-client');
      EnhancedApiClient.fetchWithTransform.mockRejectedValueOnce(new Error('API Error'));

      const result = await studiosService.getStudioById('1');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('1');
    });

    it('should create a default studio when ID not found in mock data', async () => {
      const { EnhancedApiClient } = require('../enhanced-api-client');
      EnhancedApiClient.fetchWithTransform.mockRejectedValueOnce(new Error('API Error'));

      const result = await studiosService.getStudioById('new-studio-123');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('new-studio-123');
      expect(result.data?.isActive).toBe(true);
    });
  });
});

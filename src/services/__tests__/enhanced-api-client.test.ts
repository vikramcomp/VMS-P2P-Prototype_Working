import { EnhancedApiClient, ResponseUtils } from '../enhanced-api-client';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

// Mock apiClient
jest.mock('../api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    setTransformationConfig: jest.fn(),
  },
  buildApiUrl: jest.fn((path) => `https://api.test.com/${path}`),
}));

// Mock response transformer
jest.mock('@/utils/response-transformer', () => ({
  createResponseAccessor: jest.fn((response) => response),
  getCompatibleValue: jest.fn((obj, camelKey, pascalKey) => {
    return obj?.[camelKey] ?? obj?.[pascalKey];
  }),
  transformApiResponse: jest.fn((data) => data),
}));

import { apiClient } from '../api-client';
import { getCompatibleValue, transformApiResponse } from '@/utils/response-transformer';

describe('EnhancedApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('HTTP Methods', () => {
    it('should make GET request', async () => {
      const mockResponse = { data: 'test' };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await EnhancedApiClient.get('/test', { param: 'value' });

      expect(apiClient.get).toHaveBeenCalledWith('/test', { param: 'value' });
      expect(result).toEqual(mockResponse);
    });

    it('should make POST request', async () => {
      const mockResponse = { id: 1 };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await EnhancedApiClient.post('/test', { name: 'test' });

      expect(apiClient.post).toHaveBeenCalledWith('/test', { name: 'test' });
      expect(result).toEqual(mockResponse);
    });

    it('should make PUT request', async () => {
      const mockResponse = { updated: true };
      (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await EnhancedApiClient.put('/test/1', { name: 'updated' });

      expect(apiClient.put).toHaveBeenCalledWith('/test/1', { name: 'updated' });
      expect(result).toEqual(mockResponse);
    });

    it('should make DELETE request', async () => {
      const mockResponse = { deleted: true };
      (apiClient.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await EnhancedApiClient.delete('/test/1');

      expect(apiClient.delete).toHaveBeenCalledWith('/test/1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('fetchWithTransform', () => {
    it('should fetch with transformation successfully', async () => {
      const mockResponse = { Data: { Records: [] } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await EnhancedApiClient.fetchWithTransform('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle HTTP errors in fetchWithTransform', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(
        EnhancedApiClient.fetchWithTransform('/api/test')
      ).rejects.toThrow('HTTP error! status: 404');
    });

    it('should pass custom headers in fetchWithTransform', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await EnhancedApiClient.fetchWithTransform('/api/test', {
        headers: {
          'Authorization': 'Bearer token',
          'Custom-Header': 'value'
        }
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer token',
            'Custom-Header': 'value'
          })
        })
      );
    });
  });

  describe('Response Helper Methods', () => {
    it('should check if response is successful', () => {
      const response1 = { isSuccess: true };
      const response2 = { IsSuccess: true };
      const response3 = { isSuccess: false };

      expect(EnhancedApiClient.isSuccessResponse(response1)).toBe(true);
      expect(EnhancedApiClient.isSuccessResponse(response2)).toBe(true);
      expect(EnhancedApiClient.isSuccessResponse(response3)).toBe(false);
    });

    it('should get response message', () => {
      const response1 = { message: 'Success' };
      const response2 = { Message: 'Success' };

      EnhancedApiClient.getResponseMessage(response1);
      EnhancedApiClient.getResponseMessage(response2);

      expect(getCompatibleValue).toHaveBeenCalledWith(response1, 'message', 'Message');
      expect(getCompatibleValue).toHaveBeenCalledWith(response2, 'message', 'Message');
    });

    it('should get response data', () => {
      const response1 = { data: { records: [] } };
      const response2 = { Data: { Records: [] } };

      EnhancedApiClient.getResponseData(response1);
      EnhancedApiClient.getResponseData(response2);

      expect(getCompatibleValue).toHaveBeenCalledWith(response1, 'data', 'Data');
      expect(getCompatibleValue).toHaveBeenCalledWith(response2, 'data', 'Data');
    });

    it('should get records from response', () => {
      const response = {
        data: { records: [{ id: 1 }] }
      };

      (getCompatibleValue as jest.Mock).mockImplementation((obj, camelKey) => {
        if (camelKey === 'data') return obj.data;
        if (camelKey === 'records') return obj.records;
        return undefined;
      });

      const records = EnhancedApiClient.getRecords(response);

      expect(records).toBeDefined();
    });

    it('should return empty array when no records', () => {
      const response = { data: {} };

      (getCompatibleValue as jest.Mock).mockReturnValue(undefined);

      const records = EnhancedApiClient.getRecords(response);

      expect(records).toEqual([]);
    });

    it('should get total records count', () => {
      const response = { data: { totalRecords: 100 } };

      (getCompatibleValue as jest.Mock).mockImplementation((obj, camelKey) => {
        if (camelKey === 'data') return obj.data;
        if (camelKey === 'totalRecords') return 100;
        return 0;
      });

      const total = EnhancedApiClient.getTotalRecords(response);

      expect(total).toBe(100);
    });

    it('should get current page number', () => {
      const response = { data: { currentPage: 2 } };

      (getCompatibleValue as jest.Mock).mockImplementation((obj, camelKey) => {
        if (camelKey === 'data') return obj.data;
        if (camelKey === 'currentPage') return 2;
        return 1;
      });

      const page = EnhancedApiClient.getCurrentPage(response);

      expect(page).toBe(2);
    });

    it('should get page size', () => {
      const response = { data: { pageSize: 20 } };

      (getCompatibleValue as jest.Mock).mockImplementation((obj, camelKey) => {
        if (camelKey === 'data') return obj.data;
        if (camelKey === 'pageSize') return 20;
        return 10;
      });

      const pageSize = EnhancedApiClient.getPageSize(response);

      expect(pageSize).toBe(20);
    });
  });

  describe('Utility Methods', () => {
    it('should create response accessor', () => {
      const response = { data: 'test' };
      const accessor = EnhancedApiClient.createAccessor(response);

      expect(accessor).toBeDefined();
    });

    it('should get compatible value', () => {
      const obj = { camelCase: 'value1', PascalCase: 'value2' };

      EnhancedApiClient.getCompatibleValue(obj, 'camelCase', 'PascalCase');

      expect(getCompatibleValue).toHaveBeenCalledWith(obj, 'camelCase', 'PascalCase');
    });

    it('should configure transformation settings', () => {
      EnhancedApiClient.configureTransformation(true, { option: 'value' });

      expect(apiClient.setTransformationConfig).toHaveBeenCalledWith(true, { option: 'value' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null response in helper methods', () => {
      (getCompatibleValue as jest.Mock).mockReturnValue(undefined);

      expect(EnhancedApiClient.isSuccessResponse(null)).toBe(false);
      expect(EnhancedApiClient.getTotalRecords(null)).toBe(0);
      expect(EnhancedApiClient.getCurrentPage(null)).toBe(1);
      expect(EnhancedApiClient.getPageSize(null)).toBe(10);
      expect(EnhancedApiClient.getRecords(null)).toEqual([]);
    });

    it('should handle undefined response data', () => {
      const response = {};

      (getCompatibleValue as jest.Mock).mockReturnValue(undefined);

      expect(EnhancedApiClient.getRecords(response)).toEqual([]);
      expect(EnhancedApiClient.getTotalRecords(response)).toBe(0);
    });
  });
});

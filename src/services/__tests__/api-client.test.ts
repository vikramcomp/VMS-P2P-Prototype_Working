// Mock axios before any imports
jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(() => 0)
      },
      response: {
        use: jest.fn(() => 0)
      }
    }
  };

  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockAxiosInstance)
    }
  };
});

import { buildApiUrl } from '../api-client';
import axios from 'axios';

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockAxiosInstance = (mockedAxios.create as jest.Mock)();

// Mock environment variable
const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;

describe('API Client', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.test.com';
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
  });

  describe('buildApiUrl', () => {
    it('should build URL with base URL', () => {
      const url = buildApiUrl('users');
      expect(url).toBe('https://api.test.com/users');
    });

    it('should handle paths with leading slash', () => {
      const url = buildApiUrl('/users');
      expect(url).toBe('https://api.test.com/users');
    });

    it('should handle nested paths', () => {
      const url = buildApiUrl('users/123/profile');
      expect(url).toBe('https://api.test.com/users/123/profile');
    });

    it('should handle empty path', () => {
      const url = buildApiUrl('');
      expect(url).toBe('https://api.test.com/');
    });

    it('should handle path with query parameters', () => {
      const url = buildApiUrl('users?page=1&size=10');
      expect(url).toBe('https://api.test.com/users?page=1&size=10');
    });

    it('should handle path with hash', () => {
      const url = buildApiUrl('users#section');
      expect(url).toBe('https://api.test.com/users#section');
    });

    it('should handle complex paths', () => {
      const url = buildApiUrl('api/v1/users/123/roles/456');
      expect(url).toBe('https://api.test.com/api/v1/users/123/roles/456');
    });

    it('should handle trailing slash in base URL', () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.test.com/';
      const url = buildApiUrl('users');
      expect(url).toBe('https://api.test.com/users');
    });

    it('should handle multiple slashes', () => {
      const url = buildApiUrl('//users');
      expect(url).toBe('https://api.test.com/users');
    });

    it('should throw error when NEXT_PUBLIC_API_BASE_URL is not defined', () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      expect(() => buildApiUrl('users')).toThrow('NEXT_PUBLIC_API_BASE_URL is not defined');
    });
  });

  describe('ApiClient class methods', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Reset mock implementations
      mockAxiosInstance.get.mockReset();
      mockAxiosInstance.post.mockReset();
      mockAxiosInstance.put.mockReset();
      mockAxiosInstance.delete.mockReset();
    });

    it('should configure transformation settings', () => {
      jest.isolateModules(() => {
        const { apiClient } = require('../api-client');
        expect(() => {
          apiClient.setTransformationConfig(false);
        }).not.toThrow();
        
        expect(() => {
          apiClient.setTransformationConfig(true, { backwardCompatibility: false, maxDepth: 5 });
        }).not.toThrow();
      });
    });

    it('should create response accessor', () => {
      jest.isolateModules(() => {
        const { apiClient } = require('../api-client');
        const mockResponse = { data: { id: 1, name: 'Test' } };
        const accessor = apiClient.createAccessor(mockResponse);
        expect(accessor).toBeDefined();
      });
    });

    it('should handle get request errors with response', async () => {
      jest.isolateModules(() => {
        const { apiClient } = require('../api-client');
        const mockInstance = (apiClient as any).client;
        
        mockInstance.get = jest.fn().mockRejectedValue({
          response: {
            status: 500,
            statusText: 'Internal Server Error',
            data: { message: 'Server error' }
          }
        });

        expect(apiClient.get('/test')).rejects.toThrow('Server error 500');
      });
    });

    it('should handle get request errors with request only', async () => {
      jest.isolateModules(() => {
        const { apiClient } = require('../api-client');
        const mockInstance = (apiClient as any).client;
        
        mockInstance.get = jest.fn().mockRejectedValue({
          request: {},
          message: 'Network error'
        });

        expect(apiClient.get('/test')).rejects.toThrow('Network error: No response received from server');
      });
    });

    it('should handle get request errors without response or request', async () => {
      jest.isolateModules(() => {
        const { apiClient } = require('../api-client');
        const mockInstance = (apiClient as any).client;
        
        mockInstance.get = jest.fn().mockRejectedValue({
          message: 'Generic error'
        });

        expect(apiClient.get('/test')).rejects.toThrow('Generic error');
      });
    });

    it('should handle post request with empty response', async () => {
      await jest.isolateModules(async () => {
        const { apiClient } = require('../api-client');
        const mockInstance = (apiClient as any).client;
        
        mockInstance.post = jest.fn().mockResolvedValue({
          status: 200,
          statusText: 'OK',
          data: null
        });

        const result = await apiClient.post('/test', { data: 'test' });
        expect(result.success).toBe(true);
        expect(result.message).toContain('no data');
      });
    });

    it('should handle post request errors with request only', async () => {
      jest.isolateModules(() => {
        const { apiClient } = require('../api-client');
        const mockInstance = (apiClient as any).client;
        
        mockInstance.post = jest.fn().mockRejectedValue({
          request: {},
          message: 'Network error'
        });

        expect(apiClient.post('/test', {})).rejects.toThrow('Network error: No response received from server');
      });
    });

    it('should handle post request errors without response or request', async () => {
      jest.isolateModules(() => {
        const { apiClient } = require('../api-client');
        const mockInstance = (apiClient as any).client;
        
        mockInstance.post = jest.fn().mockRejectedValue({
          message: 'Generic error'
        });

        expect(apiClient.post('/test', {})).rejects.toThrow('Generic error');
      });
    });

    it('should handle put request errors', async () => {
      jest.isolateModules(() => {
        const { apiClient } = require('../api-client');
        const mockInstance = (apiClient as any).client;
        
        mockInstance.put = jest.fn().mockRejectedValue({
          response: {
            status: 400,
            data: { message: 'Bad request' }
          }
        });

        expect(apiClient.put('/test', {})).rejects.toThrow('Server error 400: Bad request');
      });
    });

    it('should handle delete request errors with status text only', async () => {
      jest.isolateModules(() => {
        const { apiClient } = require('../api-client');
        const mockInstance = (apiClient as any).client;
        
        mockInstance.delete = jest.fn().mockRejectedValue({
          response: {
            status: 404,
            statusText: 'Not Found',
            data: {}
          }
        });

        expect(apiClient.delete('/test')).rejects.toThrow('Server error 404: Not Found');
      });
    });

    it('should handle getRaw method', async () => {
      await jest.isolateModules(async () => {
        const { apiClient } = require('../api-client');
        const mockInstance = (apiClient as any).client;
        
        const mockData = { rawData: true };
        mockInstance.get = jest.fn().mockResolvedValue({
          data: mockData
        });

        const result = await apiClient.getRaw('/test');
        expect(result).toEqual(mockData);
      });
    });

    it('should handle getRaw method errors', async () => {
      jest.isolateModules(() => {
        const { apiClient } = require('../api-client');
        const mockInstance = (apiClient as any).client;
        
        mockInstance.get = jest.fn().mockRejectedValue({
          response: {
            status: 403,
            statusText: 'Forbidden',
            data: { message: 'Access denied' }
          }
        });

        expect(apiClient.getRaw('/test')).rejects.toThrow('Server error 403: Access denied');
      });
    });

    it('should handle successful get request', async () => {
      await jest.isolateModules(async () => {
        const { apiClient } = require('../api-client');
        const mockInstance = (apiClient as any).client;
        
        const mockData = { data: { id: 1 }, success: true };
        mockInstance.get = jest.fn().mockResolvedValue({
          data: mockData
        });

        const result = await apiClient.get('/test');
        expect(result).toEqual(mockData);
      });
    });

    it('should handle successful post request', async () => {
      await jest.isolateModules(async () => {
        const { apiClient } = require('../api-client');
        const mockInstance = (apiClient as any).client;
        
        const mockData = { data: { id: 1 }, success: true };
        mockInstance.post = jest.fn().mockResolvedValue({
          status: 201,
          statusText: 'Created',
          data: mockData
        });

        const result = await apiClient.post('/test', { name: 'Test' });
        expect(result).toEqual(mockData);
      });
    });

    it('should handle successful put request', async () => {
      await jest.isolateModules(async () => {
        const { apiClient } = require('../api-client');
        const mockInstance = (apiClient as any).client;
        
        const mockData = { data: { id: 1 }, success: true };
        mockInstance.put = jest.fn().mockResolvedValue({
          data: mockData
        });

        const result = await apiClient.put('/test', { name: 'Updated' });
        expect(result).toEqual(mockData);
      });
    });

    it('should handle successful delete request', async () => {
      await jest.isolateModules(async () => {
        const { apiClient } = require('../api-client');
        const mockInstance = (apiClient as any).client;
        
        const mockData = { data: null, success: true };
        mockInstance.delete = jest.fn().mockResolvedValue({
          data: mockData
        });

        const result = await apiClient.delete('/test');
        expect(result).toEqual(mockData);
      });
    });

    it('should handle getRaw with params', async () => {
      await jest.isolateModules(async () => {
        const { apiClient } = require('../api-client');
        const mockInstance = (apiClient as any).client;
        
        const mockData = { data: [1, 2, 3] };
        mockInstance.get = jest.fn().mockResolvedValue({
          data: mockData
        });

        const result = await apiClient.getRaw('/test', { page: 1 });
        expect(result).toEqual(mockData);
        expect(mockInstance.get).toHaveBeenCalledWith('/test', { params: { page: 1 } });
      });
    });

    it('should handle get with params', async () => {
      await jest.isolateModules(async () => {
        const { apiClient } = require('../api-client');
        const mockInstance = (apiClient as any).client;
        
        const mockData = { data: [], success: true };
        mockInstance.get = jest.fn().mockResolvedValue({
          data: mockData
        });

        const result = await apiClient.get('/test', { filter: 'active' });
        expect(result).toEqual(mockData);
        expect(mockInstance.get).toHaveBeenCalledWith('/test', { params: { filter: 'active' } });
      });
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle error without message', async () => {
      await jest.isolateModules(async () => {
        const { apiClient } = require('../api-client');
        const mockInstance = (apiClient as any).client;
        
        mockInstance.get = jest.fn().mockRejectedValue({});

        expect(apiClient.get('/test')).rejects.toThrow('An unexpected error occurred');
      });
    });

    it('should handle response error without data or statusText', async () => {
      await jest.isolateModules(async () => {
        const { apiClient } = require('../api-client');
        const mockInstance = (apiClient as any).client;
        
        mockInstance.get = jest.fn().mockRejectedValue({
          response: {
            status: 500,
            data: {},
            statusText: ''
          }
        });

        expect(apiClient.get('/test')).rejects.toThrow('Server error 500: Unknown error');
      });
    });

    it('should handle transformation configuration with options', () => {
      const { apiClient } = require('../api-client');
      
      apiClient.setTransformationConfig(true, { 
        backwardCompatibility: false, 
        maxDepth: 5 
      });
      
      // Should not throw
      expect(true).toBe(true);
    });

    it('should handle transformation configuration without options', () => {
      const { apiClient } = require('../api-client');
      
      apiClient.setTransformationConfig(false);
      
      // Should not throw
      expect(true).toBe(true);
    });

    it('should handle delete with various error types', async () => {
      await jest.isolateModules(async () => {
        const { apiClient } = require('../api-client');
        const mockInstance = (apiClient as any).client;
        
        mockInstance.delete = jest.fn().mockRejectedValue({
          response: {
            status: 403,
            data: {},
            statusText: 'Forbidden'
          }
        });

        expect(apiClient.delete('/test')).rejects.toThrow('Server error 403');
      });
    });

    it('should handle put with request error', async () => {
      await jest.isolateModules(async () => {
        const { apiClient } = require('../api-client');
        const mockInstance = (apiClient as any).client;
        
        mockInstance.put = jest.fn().mockRejectedValue({
          request: { data: 'something' }
        });

        expect(apiClient.put('/test', {})).rejects.toThrow('Network error: No response received from server');
      });
    });

    it('should handle post with valid response data', async () => {
      await jest.isolateModules(async () => {
        const { apiClient } = require('../api-client');
        const mockInstance = (apiClient as any).client;
        
        const responseData = { data: { id: 123 }, success: true };
        mockInstance.post = jest.fn().mockResolvedValue({
          status: 200,
          statusText: 'OK',
          data: responseData
        });

        const result = await apiClient.post('/test', { value: 'test' });
        expect(result).toEqual(responseData);
        expect(result.success).toBe(true);
      });
    });
  });
});

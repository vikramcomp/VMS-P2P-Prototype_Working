import { serviceDetailsService } from '../service-details-service';
import { authService } from '../auth-service';
import { buildApiUrl } from '../api-client';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

// Mock api-client
jest.mock('../api-client', () => ({
  buildApiUrl: jest.fn((path) => `https://api.test.com/${path}`),
}));

// Mock auth-service
jest.mock('../auth-service', () => ({
  authService: {
    getToken: jest.fn(),
  },
}));

// Mock environment variable
process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.test.com';

describe('ServiceDetailsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    (buildApiUrl as jest.Mock).mockImplementation((path) => `https://api.test.com/${path}`);
    (authService.getToken as jest.Mock).mockReturnValue('test-token');
  });

  describe('Service Instance', () => {
    it('should be defined', () => {
      expect(serviceDetailsService).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(serviceDetailsService.getServiceDetails).toBeDefined();
      expect(serviceDetailsService.addServiceDetail).toBeDefined();
      expect(serviceDetailsService.getServiceDetail).toBeDefined();
      expect(serviceDetailsService.updateServiceDetail).toBeDefined();
      expect(serviceDetailsService.deleteServiceDetails).toBeDefined();
    });
  });

  describe('getServiceDetails', () => {
    it('should fetch service details successfully with PascalCase', async () => {
      const mockResponse = {
        Data: {
          Records: [
            {
              VendorMgrServiceDetailId: 1,
              ServiceDetailName: 'Detail 1',
              ServiceDetailDescription: 'Description 1',
              CreatedDate: '2024-01-01',
              ModifiedDate: '2024-01-02',
              IsActive: true,
            },
          ],
          TotalRecords: 1,
          TotalPages: 1,
          PageSize: 10,
          CurrentPage: 1,
          SortColumn: 'ServiceDetailName',
          SortType: 'asc',
        },
        Message: 'success',
        IsSuccess: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await serviceDetailsService.getServiceDetails({
        pageNumber: 1,
        pageSize: 10,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/service-details/all',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          }),
        })
      );
      expect(result.Data.Records).toHaveLength(1);
      expect(result.Data.Records[0].VendorMgrServiceDetailId).toBe(1);
    });

    it('should fetch service details successfully with camelCase', async () => {
      const mockResponse = {
        data: {
          records: [
            {
              vendorMgrServiceDetailId: 2,
              serviceDetailName: 'Detail 2',
              serviceDetailDescription: 'Description 2',
              createdDate: '2024-02-01',
              modifiedDate: '2024-02-02',
              isActive: true,
            },
          ],
          totalRecords: 1,
          totalPages: 1,
          pageSize: 10,
          currentPage: 1,
          sortColumn: 'serviceDetailName',
          sortType: 'asc',
        },
        message: 'success',
        isSuccess: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await serviceDetailsService.getServiceDetails();

      expect(result.Data.Records).toHaveLength(1);
      expect(result.Data.Records[0].VendorMgrServiceDetailId).toBe(2);
    });

    it('should handle "All" page size option', async () => {
      const mockResponse = {
        Data: {
          Records: Array(50).fill(null).map((_, i) => ({
            VendorMgrServiceDetailId: i + 1,
            ServiceDetailName: `Detail ${i + 1}`,
          })),
          TotalRecords: 50,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await serviceDetailsService.getServiceDetails({
        pageSize: 'All' as any,
      });

      expect(result.Data.Records).toHaveLength(50);
    });

    it('should apply search term filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ Data: { Records: [] } }),
      });

      await serviceDetailsService.getServiceDetails({
        searchTerm: 'test search',
        pageNumber: 1,
        pageSize: 10,
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.SearchTerm).toBe('test search');
    });

    it('should apply sorting parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ Data: { Records: [] } }),
      });

      await serviceDetailsService.getServiceDetails({
        sortBy: 'ServiceDetailName',
        sortDescending: true,
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.SortBy).toBe('ServiceDetailName');
      expect(callBody.SortDescending).toBe(true);
    });

    it('should use default parameters when none provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ Data: { Records: [] } }),
      });

      await serviceDetailsService.getServiceDetails();

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.SearchTerm).toBe('');
      expect(callBody.PageNumber).toBe(1);
      expect(callBody.PageSize).toBe(10);
      expect(callBody.SortBy).toBe('ServiceDetailName');
      expect(callBody.SortDescending).toBe(false);
    });

    it('should handle HTTP errors by throwing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Server error',
      });

      // HTTP errors should be thrown, not caught
      await expect(serviceDetailsService.getServiceDetails()).rejects.toThrow('HTTP error! status: 500');
    });

    it('should handle network errors and return mock data', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Network error'));

      const result = await serviceDetailsService.getServiceDetails();

      // Should return mock data as fallback
      expect(result.Data.Records.length).toBeGreaterThan(0);
    });

    it('should normalize mixed case response fields', async () => {
      const mockResponse = {
        Data: {
          Records: [
            {
              vendorMgrServiceDetailId: 1,
              ServiceDetailName: 'Mixed Case',
              serviceDetailDescription: 'Description',
              CreatedDate: '2024-01-01',
              isActive: true,
            },
          ],
          totalRecords: 1,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await serviceDetailsService.getServiceDetails();

      expect(result.Data.Records[0].VendorMgrServiceDetailId).toBe(1);
      expect(result.Data.Records[0].ServiceDetailName).toBe('Mixed Case');
    });

    it('should include authorization header when token exists', async () => {
      (authService.getToken as jest.Mock).mockReturnValue('my-token');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ Data: { Records: [] } }),
      });

      await serviceDetailsService.getServiceDetails();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer my-token',
          }),
        })
      );
    });

    it('should not include authorization header when no token', async () => {
      (authService.getToken as jest.Mock).mockReturnValue(null);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ Data: { Records: [] } }),
      });

      await serviceDetailsService.getServiceDetails();

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers.Authorization).toBeUndefined();
    });
  });

  describe('addServiceDetail', () => {
    it('should add service detail successfully', async () => {
      const mockResponse = {
        VendorMgrServiceDetailId: 1,
        ServiceDetailName: 'New Detail',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await serviceDetailsService.addServiceDetail({
        ServiceDetailName: 'New Detail',
        ServiceDetailDescription: 'New Description',
        IsActive: true,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/service-details',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result.success).toBe(true);
      expect(result.message).toContain('created successfully');
    });

    it('should handle add errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad request',
      });

      const result = await serviceDetailsService.addServiceDetail({
        ServiceDetailName: 'Invalid',
        ServiceDetailDescription: '',
        IsActive: true,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('400');
    });

    it('should handle network errors during add', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      const result = await serviceDetailsService.addServiceDetail({
        ServiceDetailName: 'Test',
        ServiceDetailDescription: 'Test',
        IsActive: true,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Network failure');
    });
  });

  describe('getServiceDetail', () => {
    it('should get single service detail successfully with paginated response', async () => {
      const mockResponse = {
        Data: {
          Records: [
            {
              VendorMgrServiceDetailId: 5,
              ServiceDetailName: 'Detail 5',
              ServiceDetailDescription: 'Description 5',
              CreatedDate: '2024-01-01',
              ModifiedDate: '2024-01-02',
              IsActive: true,
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await serviceDetailsService.getServiceDetail(5);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/service-details/5',
        expect.objectContaining({ method: 'GET' })
      );
      expect(result.Data.VendorMgrServiceDetailId).toBe(5);
    });

    it('should get single service detail with direct object response', async () => {
      const mockResponse = {
        Data: {
          VendorMgrServiceDetailId: 7,
          ServiceDetailName: 'Detail 7',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await serviceDetailsService.getServiceDetail(7);

      expect(result.Data.VendorMgrServiceDetailId).toBe(7);
    });

    it('should get single service detail with root level response', async () => {
      const mockResponse = {
        VendorMgrServiceDetailId: 9,
        ServiceDetailName: 'Detail 9',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await serviceDetailsService.getServiceDetail(9);

      expect(result.Data.VendorMgrServiceDetailId).toBe(9);
    });

    it('should handle array response with single item', async () => {
      const mockResponse = [
        {
          VendorMgrServiceDetailId: 11,
          ServiceDetailName: 'Detail 11',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await serviceDetailsService.getServiceDetail(11);

      expect(result.Data.VendorMgrServiceDetailId).toBe(11);
    });

    it('should handle camelCase response', async () => {
      const mockResponse = {
        data: {
          records: [
            {
              vendorMgrServiceDetailId: 13,
              serviceDetailName: 'Detail 13',
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await serviceDetailsService.getServiceDetail(13);

      expect(result.Data.VendorMgrServiceDetailId).toBe(13);
    });

    it('should throw error if service detail not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not found',
      });

      // HTTP 404 errors should be thrown, not caught
      await expect(serviceDetailsService.getServiceDetail(999)).rejects.toThrow('HTTP error! status: 404');
    });

    it('should handle network errors and return mock data', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const result = await serviceDetailsService.getServiceDetail(20);

      // Should return mock data as fallback
      expect(result.Data.VendorMgrServiceDetailId).toBe(20);
    });
  });

  describe('updateServiceDetail', () => {
    it('should update service detail successfully', async () => {
      const mockResponse = {
        VendorMgrServiceDetailId: 3,
        ServiceDetailName: 'Updated Detail',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await serviceDetailsService.updateServiceDetail(3, {
        ServiceDetailName: 'Updated Detail',
        ServiceDetailDescription: 'Updated Description',
        IsActive: true,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/service-details/3',
        expect.objectContaining({
          method: 'PUT',
        })
      );
      expect(result.success).toBe(true);
      expect(result.message).toContain('updated successfully');
    });

    it('should handle update errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not found',
      });

      const result = await serviceDetailsService.updateServiceDetail(999, {
        ServiceDetailName: 'Test',
        ServiceDetailDescription: 'Test',
        IsActive: true,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('404');
    });

    it('should handle network errors during update', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await serviceDetailsService.updateServiceDetail(1, {
        ServiceDetailName: 'Test',
        ServiceDetailDescription: 'Test',
        IsActive: true,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('deleteServiceDetails', () => {
    it('should delete single service detail successfully', async () => {
      const mockResponse = {
        message: 'Deleted successfully',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await serviceDetailsService.deleteServiceDetails([1]);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/service-details/delete-multiple',
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify([1]),
        })
      );
      expect(result.success).toBe(true);
    });

    it('should delete multiple service details successfully', async () => {
      const mockResponse = {
        message: '3 service details deleted',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await serviceDetailsService.deleteServiceDetails([1, 2, 3]);

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify([1, 2, 3]),
        })
      );
    });

    it('should handle delete errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad request',
      });

      const result = await serviceDetailsService.deleteServiceDetails([999]);

      expect(result.success).toBe(false);
      expect(result.message).toContain('400');
    });

    it('should handle network errors during delete', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      const result = await serviceDetailsService.deleteServiceDetails([1]);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Network failure');
    });
  });

  describe('Mock Data Fallback', () => {
    it('should generate different mock data for different pagination', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result1 = await serviceDetailsService.getServiceDetails({
        pageNumber: 1,
        pageSize: 10,
      });

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result2 = await serviceDetailsService.getServiceDetails({
        pageNumber: 2,
        pageSize: 10,
      });

      expect(result1.Data.Records).not.toEqual(result2.Data.Records);
    });

    it('should filter mock data by search term', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await serviceDetailsService.getServiceDetails({
        searchTerm: 'Capital',
      });

      const hasMatch = result.Data.Records.some(r =>
        r.ServiceDetailName.toLowerCase().includes('capital')
      );
      expect(hasMatch).toBe(true);
    });

    it('should generate consistent mock data for same service detail ID on network errors', async () => {
      // Use TypeError to trigger mock data fallback (network error)
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
      const result1 = await serviceDetailsService.getServiceDetail(15);

      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
      const result2 = await serviceDetailsService.getServiceDetail(15);

      expect(result1.Data.VendorMgrServiceDetailId).toBe(result2.Data.VendorMgrServiceDetailId);
      expect(result1.Data.ServiceDetailName).toBe(result2.Data.ServiceDetailName);
    });
  });
});

import { servicesService } from '../services-service';

// Mock fetch globally
global.fetch = jest.fn();

// Mock auth-service
jest.mock('../auth-service', () => ({
  authService: {
    getToken: jest.fn(() => 'test-token'),
  },
}));

describe('ServicesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3000/api';
  });

  describe('Service Instance', () => {
    it('should be defined as an instance', () => {
      expect(servicesService).toBeDefined();
      expect(typeof servicesService).toBe('object');
    });

    it('should have all required methods', () => {
      expect(typeof servicesService.getServices).toBe('function');
      expect(typeof servicesService.getServiceById).toBe('function');
      expect(typeof servicesService.addService).toBe('function');
      expect(typeof servicesService.updateService).toBe('function');
      expect(typeof servicesService.deleteServices).toBe('function');
    });
  });

  describe('getServices', () => {
    it('should fetch services successfully with default params', async () => {
      const mockResponse = {
        Data: {
          Records: [
            { VendorMgrServiceId: 1, ServiceName: 'Service 1', Description: 'Desc 1', MaxAmount: 1000 },
            { VendorMgrServiceId: 2, ServiceName: 'Service 2', Description: 'Desc 2', MaxAmount: 2000 },
          ],
          TotalRecords: 2,
          TotalPages: 1,
          PageSize: 10,
          CurrentPage: 1,
          SortColumn: '',
          SortType: '',
        },
        Message: 'success',
        IsSuccess: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await servicesService.getServices();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/services/all',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(result.Data.Records).toHaveLength(2);
      expect(result.IsSuccess).toBe(true);
    });

    it('should handle pagination parameters', async () => {
      const mockResponse = {
        Data: {
          Records: [{ VendorMgrServiceId: 1, ServiceName: 'Service 1', Description: 'Desc', MaxAmount: 1000 }],
          TotalRecords: 20,
          TotalPages: 2,
          PageSize: 10,
          CurrentPage: 2,
          SortColumn: '',
          SortType: '',
        },
        Message: 'success',
        IsSuccess: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await servicesService.getServices({ pageNumber: 2, pageSize: 10 });

      expect(result.Data.CurrentPage).toBe(2);
    });

    it('should handle search term', async () => {
      const mockResponse = {
        Data: {
          Records: [{ VendorMgrServiceId: 1, ServiceName: 'Web Development', Description: 'Web', MaxAmount: 1000 }],
          TotalRecords: 1,
          TotalPages: 1,
          PageSize: 10,
          CurrentPage: 1,
          SortColumn: '',
          SortType: '',
        },
        Message: 'success',
        IsSuccess: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await servicesService.getServices({ searchTerm: 'Web' });

      expect(result.Data.Records[0].ServiceName).toContain('Web');
    });

    it('should handle "All" page size', async () => {
      const mockResponse = {
        Data: {
          Records: new Array(20).fill({ VendorMgrServiceId: 1, ServiceName: 'Service', Description: 'Desc', MaxAmount: 1000 }),
          TotalRecords: 20,
          TotalPages: 1,
          PageSize: 1000,
          CurrentPage: 1,
          SortColumn: '',
          SortType: '',
        },
        Message: 'success',
        IsSuccess: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await servicesService.getServices({ pageSize: 'All' });

      expect(result.Data.Records.length).toBe(20);
    });

    it('should fallback to mock data on server error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await servicesService.getServices();

      expect(result.Data.Records.length).toBeGreaterThan(0);
      expect(result.IsSuccess).toBe(true);
    });

    it('should handle camelCase response', async () => {
      const mockResponse = {
        data: {
          records: [{ VendorMgrServiceId: 1, ServiceName: 'Service', Description: 'Desc', MaxAmount: 1000 }],
          totalRecords: 1,
          totalPages: 1,
          pageSize: 10,
          currentPage: 1,
        },
        message: 'success',
        isSuccess: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await servicesService.getServices();

      expect(result.Data.Records).toHaveLength(1);
    });

    it('should handle network error with mock data fallback', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

      const result = await servicesService.getServices();

      expect(result.Data.Records.length).toBeGreaterThan(0);
    });
  });

  describe('getServiceById', () => {
    it('should fetch service by ID successfully', async () => {
      const mockResponse = {
        Data: {
          Records: [{ VendorMgrServiceId: 1, ServiceName: 'Web Development', Description: 'Web', MaxAmount: 5000 }],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await servicesService.getServiceById(1);

      expect(result.success).toBe(true);
      expect(result.data?.VendorMgrServiceId).toBe(1);
    });

    it('should handle direct service object response', async () => {
      const mockResponse = {
        VendorMgrServiceId: 1,
        ServiceName: 'Service 1',
        Description: 'Description',
        MaxAmount: 1000,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await servicesService.getServiceById(1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
    });

    it('should fallback to mock data when service not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await servicesService.getServiceById(1);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should handle network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await servicesService.getServiceById(1);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('addService', () => {
    it('should add service successfully', async () => {
      const mockResponse = {
        VendorMgrServiceId: 21,
        ServiceName: 'New Service',
        Description: 'New Description',
        MaxAmount: 3000,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const newService = {
        ServiceName: 'New Service',
        Description: 'New Description',
        MaxAmount: 3000,
      };

      const result = await servicesService.addService(newService);

      expect(result.success).toBe(true);
      expect(result.message).toContain('created successfully');
    });

    it('should handle add service error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad request',
      });

      const newService = {
        ServiceName: 'Invalid Service',
        Description: '',
        MaxAmount: -100,
      };

      const result = await servicesService.addService(newService);

      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe('updateService', () => {
    it('should update service successfully', async () => {
      const mockResponse = {
        VendorMgrServiceId: 1,
        ServiceName: 'Updated Service',
        Description: 'Updated Description',
        MaxAmount: 6000,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const updateData = {
        ServiceName: 'Updated Service',
        Description: 'Updated Description',
        MaxAmount: 6000,
      };

      const result = await servicesService.updateService(1, updateData);

      expect(result.success).toBe(true);
      expect(result.message).toContain('updated successfully');
    });

    it('should handle update service error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal server error',
      });

      const updateData = {
        ServiceName: 'Update Failed',
        Description: 'Description',
        MaxAmount: 1000,
      };

      const result = await servicesService.updateService(999, updateData);

      expect(result.success).toBe(false);
    });
  });

  describe('deleteServices', () => {
    it('should delete services successfully', async () => {
      const mockResponse = { success: true };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await servicesService.deleteServices([1, 2, 3]);

      expect(result.success).toBe(true);
      expect(result.message).toContain('deleted successfully');
    });

    it('should delete single service', async () => {
      const mockResponse = { success: true };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await servicesService.deleteServices([1]);

      expect(result.success).toBe(true);
    });

    it('should handle delete error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Cannot delete service',
      });

      const result = await servicesService.deleteServices([1]);

      expect(result.success).toBe(false);
    });
  });
});

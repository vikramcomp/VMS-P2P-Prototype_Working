import { vendorsService } from '../vendors-service';
import { authService } from '../auth-service';

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

describe('VendorsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    (authService.getToken as jest.Mock).mockReturnValue('mock-token');
  });

  describe('getAllVendors', () => {
    it('should fetch all vendors successfully', async () => {
      const mockResponse = {
        Data: {
          Records: [{ VendorId: 1, VendorName: 'Vendor 1' }],
          TotalRecords: 1
        },
        IsSuccess: true
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request = {
        SearchText: '',
        PageSize: 10,
        PageNumber: 1
      };

      const result = await vendorsService.getAllVendors(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/vendors/GetAllVendors',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should work without token', async () => {
      (authService.getToken as jest.Mock).mockReturnValue(null);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ Data: { Records: [] } }),
      });

      await vendorsService.getAllVendors({ SearchText: '', PageSize: 10, PageNumber: 1 });

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['Authorization']).toBeUndefined();
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(vendorsService.getAllVendors({
        SearchText: '',
        PageSize: 10,
        PageNumber: 1
      })).rejects.toThrow('HTTP error! status: 500');
    });
  });

  describe('exportVendors', () => {
    it('should export vendors successfully', async () => {
      const mockBlob = new Blob(['data'], { type: 'application/vnd.ms-excel' });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      const request = {
        SearchText: '',
        PageSize: -1,
        PageNumber: -1
      };

      const result = await vendorsService.exportVendors(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/vendors/export',
        expect.objectContaining({
          method: 'POST'
        })
      );
      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle export errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(vendorsService.exportVendors({
        SearchText: '',
        PageSize: -1,
        PageNumber: -1
      })).rejects.toThrow();
    });
  });

  describe('changeVendorStatus', () => {
    it('should change vendor status successfully', async () => {
      const mockResponse = {
        Message: 'Status changed',
        IsSuccess: true
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request = {
        VendorIds: [1, 2],
        Status: 0
      };

      const result = await vendorsService.changeVendorStatus(request);

      expect(result).toEqual(mockResponse);
    });

    it('should handle status change errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(vendorsService.changeVendorStatus({
        VendorIds: [1],
        Status: 0
      })).rejects.toThrow();
    });
  });

  describe('createVendor', () => {
    it('should create vendor with FormData', async () => {
      const mockResponse = {
        VendorId: 1,
        Message: 'Created'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const vendorData = {
        VendorName: 'New Vendor',
        Email: 'vendor@test.com',
        Modules: [1, 2, 3]
      };

      const result = await vendorsService.createVendor(vendorData);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/vendors',
        expect.objectContaining({
          method: 'POST'
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle file uploads', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ VendorId: 1 }),
      });

      await vendorsService.createVendor({
        VendorName: 'Vendor',
        Document: mockFile
      });

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.body).toBeInstanceOf(FormData);
    });

    it('should handle null and undefined values', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ VendorId: 1 }),
      });

      await vendorsService.createVendor({
        VendorName: 'Vendor',
        Email: null,
        Phone: undefined
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should handle creation errors with message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Validation failed' }),
      });

      await expect(vendorsService.createVendor({
        VendorName: 'Vendor'
      })).rejects.toThrow('Validation failed');
    });

    it('should handle creation errors without message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new Error('Invalid JSON'); },
      });

      await expect(vendorsService.createVendor({
        VendorName: 'Vendor'
      })).rejects.toThrow('HTTP error! status: 500');
    });
  });

  describe('getVendorById', () => {
    it('should fetch vendor by ID successfully', async () => {
      const mockVendor = {
        VendorId: 1,
        VendorName: 'Vendor 1',
        Email: 'vendor@test.com'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockVendor,
      });

      const result = await vendorsService.getVendorById(1);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/vendors/1',
        expect.objectContaining({
          method: 'GET'
        })
      );
      expect(result).toEqual(mockVendor);
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(vendorsService.getVendorById(999)).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe('updateVendor', () => {
    it('should update vendor with FormData', async () => {
      const mockResponse = {
        VendorId: 1,
        Message: 'Updated'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const vendorData = {
        VendorName: 'Updated Vendor',
        Email: 'updated@test.com'
      };

      const result = await vendorsService.updateVendor(1, vendorData);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/vendors',
        expect.objectContaining({
          method: 'PUT'
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle arrays in FormData', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ VendorId: 1 }),
      });

      await vendorsService.updateVendor(1, {
        VendorName: 'Vendor',
        Modules: [1, 2, 3]
      });

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.body).toBeInstanceOf(FormData);
    });

    it('should handle update errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Update failed' }),
      });

      await expect(vendorsService.updateVendor(1, {
        VendorName: 'Vendor'
      })).rejects.toThrow('Update failed');
    });

    it('should handle update errors without message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new Error('Invalid JSON'); },
        text: async () => '',
      });

      await expect(vendorsService.updateVendor(1, {
        VendorName: 'Vendor'
      })).rejects.toThrow('HTTP error! status: 500');
    });
  });
});

import { quotationsService } from '../quotations-service';
import { authService } from '../auth-service';
import { buildApiUrl } from '../api-client';

// Mock dependencies
jest.mock('../auth-service');
jest.mock('../api-client');

// Mock fetch globally
global.fetch = jest.fn();

describe('quotationsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authService.getToken as jest.Mock).mockReturnValue('test-token');
    (buildApiUrl as jest.Mock).mockImplementation((endpoint) => `https://api.test.com/${endpoint}`);
  });

  describe('getQuotations', () => {
    it('should fetch quotations successfully', async () => {
      const mockResponse = {
        items: [{ id: 1, name: 'Test Quotation' }],
        totalRecords: 1,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request = {
        SearchText: '',
        PageSize: 10,
        PageNumber: 1,
      };

      const result = await quotationsService.getQuotations(request);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/quotations/list',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          }),
          body: JSON.stringify(request),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should throw error when response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(quotationsService.getQuotations({
        SearchText: '',
        PageSize: 10,
        PageNumber: 1,
      })).rejects.toThrow('HTTP error! status: 500');
    });
  });

  describe('exportQuotations', () => {
    it('should export quotations successfully', async () => {
      const mockBlob = new Blob(['test'], { type: 'text/csv' });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
      });

      const request = {
        SearchText: '',
        PageSize: 10,
        PageNumber: 1,
      };

      const result = await quotationsService.exportQuotations(request);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/requests/export',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          }),
          body: JSON.stringify(request),
        })
      );

      expect(result).toEqual(mockBlob);
    });

    it('should throw error when export fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(quotationsService.exportQuotations({
        SearchText: '',
        PageSize: 10,
        PageNumber: 1,
      })).rejects.toThrow('HTTP error! status: 500');
    });
  });

  describe('changeQuotationStatus', () => {
    it('should change quotation status successfully', async () => {
      const mockResponse = { success: true };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await quotationsService.changeQuotationStatus([1, 2], 5);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/requests/change-status',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          }),
          body: JSON.stringify({ requestIds: [1, 2], status: 5 }),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should throw error when status change fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
      });

      await expect(quotationsService.changeQuotationStatus([1], 5))
        .rejects.toThrow('HTTP error! status: 400');
    });
  });

  describe('comprehensive branch coverage tests', () => {
    it('should handle getQuotations without token', async () => {
      (authService.getToken as jest.Mock).mockReturnValue(null);

      const mockResponse = { items: [] };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await quotationsService.getQuotations({
        SearchText: '',
        PageSize: 10,
        PageNumber: 1,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/quotations/list',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.anything(),
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle exportQuotations without token', async () => {
      (authService.getToken as jest.Mock).mockReturnValue(null);

      const mockBlob = new Blob(['test']);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
      });

      await quotationsService.exportQuotations({
        SearchText: '',
        PageSize: 10,
        PageNumber: 1,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/requests/export',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.anything(),
          }),
        })
      );
    });

    it('should handle changeQuotationStatus without token', async () => {
      (authService.getToken as jest.Mock).mockReturnValue(null);

      const mockResponse = { success: true };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await quotationsService.changeQuotationStatus([1], 5);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/requests/change-status',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.anything(),
          }),
        })
      );
    });
  });
});

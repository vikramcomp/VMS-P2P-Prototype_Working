import { approvalsService } from '../approvals-service';
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

describe('ApprovalsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    (authService.getToken as jest.Mock).mockReturnValue('mock-token');
  });

  describe('getApprovals', () => {
    it('should fetch approvals successfully with token', async () => {
      const mockResponse = {
        Data: {
          Records: [
            {
              ApprovalId: 1,
              RequestName: 'Request 1',
              Status: 'Pending'
            }
          ],
          TotalRecords: 1,
          TotalPages: 1,
          CurrentPage: 1
        },
        IsSuccess: true,
        Message: 'Success'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request = {
        SearchText: '',
        PageSize: 10,
        PageNumber: 1,
        IgnorePaging: false,
        SortColumn: '',
        SortType: 'asc',
        Filter: {}
      };

      const result = await approvalsService.getApprovals(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/approvals/list',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          },
          body: JSON.stringify(request)
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should work without token', async () => {
      (authService.getToken as jest.Mock).mockReturnValue(null);

      const mockResponse = {
        Data: {
          Records: [],
          TotalRecords: 0
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
        PageNumber: 1,
        IgnorePaging: false,
        SortColumn: '',
        SortType: 'asc',
        Filter: {}
      };

      const result = await approvalsService.getApprovals(request);

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['Authorization']).toBeUndefined();
      expect(result).toEqual(mockResponse);
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const request = {
        SearchText: '',
        PageSize: 10,
        PageNumber: 1,
        IgnorePaging: false,
        SortColumn: '',
        SortType: 'asc',
        Filter: {}
      };

      await expect(approvalsService.getApprovals(request)).rejects.toThrow('HTTP error! status: 500');
    });

    it('should fetch approvals with search parameters', async () => {
      const mockResponse = {
        Data: {
          Records: [],
          TotalRecords: 0
        },
        IsSuccess: true
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request = {
        SearchText: 'test search',
        PageSize: 20,
        PageNumber: 2,
        IgnorePaging: false,
        SortColumn: 'RequestName',
        SortType: 'desc',
        Filter: {
          Status: 1,
          GroupId: 5
        }
      };

      await approvalsService.getApprovals(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/approvals/list',
        expect.objectContaining({
          body: JSON.stringify(request)
        })
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request = {
        SearchText: '',
        PageSize: 10,
        PageNumber: 1,
        IgnorePaging: false,
        SortColumn: '',
        SortType: 'asc',
        Filter: {}
      };

      await expect(approvalsService.getApprovals(request)).rejects.toThrow('Network error');
    });

    it('should handle empty response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const request = {
        SearchText: '',
        PageSize: 10,
        PageNumber: 1,
        IgnorePaging: false,
        SortColumn: '',
        SortType: 'asc',
        Filter: {}
      };

      const result = await approvalsService.getApprovals(request);
      expect(result).toEqual({});
    });
  });

  describe('exportApprovals', () => {
    it('should export approvals successfully', async () => {
      const mockBlob = new Blob(['test'], { type: 'text/csv' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      const request = {
        SearchText: '',
        PageSize: 10,
        PageNumber: 1,
        IgnorePaging: false,
        SortColumn: '',
        SortType: 'asc',
        Filter: {}
      };

      const result = await approvalsService.exportApprovals(request);
      expect(result).toEqual(mockBlob);
    });

    it('should handle export error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(approvalsService.exportApprovals({
        SearchText: '',
        PageSize: 10,
        PageNumber: 1,
      })).rejects.toThrow('HTTP error! status: 500');
    });

    it('should export without token', async () => {
      (authService.getToken as jest.Mock).mockReturnValue(null);
      const mockBlob = new Blob(['test']);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      await approvalsService.exportApprovals({
        SearchText: '',
        PageSize: 10,
        PageNumber: 1,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/approvals/export',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.anything(),
          }),
        })
      );
    });
  });

  describe('changeRequestStatus', () => {
    it('should change request status successfully', async () => {
      const mockResponse = { success: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await approvalsService.changeRequestStatus([1, 2], 5);
      expect(result).toEqual(mockResponse);
    });

    it('should handle status change error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(approvalsService.changeRequestStatus([1], 5))
        .rejects.toThrow('HTTP error! status: 400');
    });

    it('should change status without token', async () => {
      (authService.getToken as jest.Mock).mockReturnValue(null);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await approvalsService.changeRequestStatus([1], 5);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/requests/change-status',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.anything(),
          }),
        })
      );
    });
  });

  describe('getApprovalContext', () => {
    it('should get approval context successfully', async () => {
      const mockContext = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockContext,
      });

      const result = await approvalsService.getApprovalContext(1);
      expect(result).toEqual(mockContext);
    });

    it('should handle context fetch error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(approvalsService.getApprovalContext(1))
        .rejects.toThrow('HTTP error! status: 404');
    });

    it('should get context without token', async () => {
      (authService.getToken as jest.Mock).mockReturnValue(null);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await approvalsService.getApprovalContext(1);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/approvals/1/context',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.anything(),
          }),
        })
      );
    });
  });
});

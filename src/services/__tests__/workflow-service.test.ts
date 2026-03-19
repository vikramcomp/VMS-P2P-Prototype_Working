import {
  getWorkflowList,
  exportWorkflows,
  getWorkflowById,
  updateWorkflow,
  changeWorkflowStatus,
  WorkflowListRequest,
  WorkflowExportRequest,
  WorkflowStatusChangeRequest,
} from '../workflow-service';
import { apiClient, buildApiUrl } from '../api-client';

// Mock apiClient and buildApiUrl
jest.mock('../api-client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
  buildApiUrl: jest.fn((path) => `https://api.test.com/${path}`),
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    apiRequest: jest.fn(),
    apiResponse: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock error-handler
jest.mock('@/utils/error-handler', () => ({
  errorHandler: {
    handleError: jest.fn((error, msg) => new Error(msg)),
  },
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe('WorkflowService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    (buildApiUrl as jest.Mock).mockImplementation((path) => `https://api.test.com/${path}`);
  });

  describe('getWorkflowList', () => {
    it('should fetch workflow list successfully with PascalCase response', async () => {
      const mockResponse = {
        Data: {
          Records: [
            {
              WorkflowId: 1,
              CategoryName: 'Test Category',
              ServiceName: 'Test Service',
              RoleName: 'Test Role',
              VendorManager: 'Vendor 1',
              PriceName: 'Fixed',
              FinanceHead: 'Finance Head',
              POGenerator: 'PO Gen',
              POVerifier: 'PO Ver',
              PODespatcher: 'PO Disp',
              StatusName: 'Active',
              Approver1: 'Approver A',
              Approver2: 'Approver B',
            },
          ],
          TotalRecords: 1,
          TotalPages: 1,
          PageSize: 10,
          CurrentPage: 1,
          SortColumn: 'serviceName',
          SortType: 'asc',
        },
        Message: 'success',
        IsSuccess: true,
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getWorkflowList(false, 1, 10, 'serviceName', 'asc', '', '');

      expect(apiClient.post).toHaveBeenCalledWith('/workflow-editor/list', expect.objectContaining({
        PageSize: 10,
        PageNumber: 1,
        Filter: { OldWorkflowOnly: false },
      }));
      expect(result.success).toBe(true);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe(1);
      expect(result.items[0].purchasingGroup).toBe('Test Category');
      expect(result.items[0].serviceName).toBe('Test Service');
      expect(result.totalCount).toBe(1);
    });

    it('should fetch workflow list successfully with camelCase response', async () => {
      const mockResponse = {
        data: {
          records: [
            {
              workflowId: 2,
              categoryName: 'Test Category 2',
              serviceName: 'Test Service 2',
              roleName: 'Test Role 2',
              vendorManager: 'Vendor 2',
              priceName: 'Variable',
              financeHead: 'Finance Head 2',
              poGenerator: 'PO Gen 2',
              poVerifier: 'PO Ver 2',
              poDespatcher: 'PO Disp 2',
              statusName: 'Inactive',
              approver1: 'Approver C',
            },
          ],
          totalRecords: 1,
          totalPages: 1,
          pageSize: 10,
          currentPage: 1,
          sortColumn: 'serviceName',
          sortType: 'asc',
        },
        message: 'success',
        isSuccess: true,
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getWorkflowList();

      expect(result.success).toBe(true);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe(2);
      expect(result.items[0].status).toBe('Inactive');
    });

    it('should handle numeric status codes (1 = Active, 0 = Inactive)', async () => {
      const mockResponse = {
        Data: {
          Records: [
            {
              WorkflowId: 1,
              CategoryName: 'Category',
              ServiceName: 'Service',
              StatusName: 1,
            },
            {
              WorkflowId: 2,
              CategoryName: 'Category',
              ServiceName: 'Service',
              StatusName: 0,
            },
          ],
          TotalRecords: 2,
          TotalPages: 1,
          PageSize: 10,
          CurrentPage: 1,
        },
        IsSuccess: true,
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getWorkflowList();

      expect(result.items[0].status).toBe('Active');
      expect(result.items[1].status).toBe('Inactive');
    });

    it('should handle alternative response structures', async () => {
      const mockResponse = {
        Records: [
          {
            WorkflowId: 1,
            CategoryName: 'Test',
            ServiceName: 'Service',
          },
        ],
        TotalRecords: 1,
        TotalPages: 1,
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getWorkflowList();

      expect(result.success).toBe(true);
      expect(result.items).toHaveLength(1);
    });

    it('should handle Items array structure', async () => {
      const mockResponse = {
        Items: [
          {
            WorkflowId: 1,
            CategoryName: 'Test',
            ServiceName: 'Service',
          },
        ],
        TotalRecords: 1,
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getWorkflowList();

      expect(result.items).toHaveLength(1);
    });

    it('should handle direct array response', async () => {
      const mockResponse = [
        {
          WorkflowId: 1,
          CategoryName: 'Test',
          ServiceName: 'Service',
        },
      ];

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getWorkflowList();

      expect(result.items).toHaveLength(1);
    });

    it('should handle empty records gracefully', async () => {
      const mockResponse = {
        Data: {
          Records: [],
          TotalRecords: 0,
          TotalPages: 0,
        },
        IsSuccess: true,
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getWorkflowList();

      expect(result.success).toBe(true);
      expect(result.items).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it('should handle null/undefined items in records', async () => {
      const mockResponse = {
        Data: {
          Records: [null, undefined, { WorkflowId: 1, CategoryName: 'Test' }],
          TotalRecords: 3,
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getWorkflowList();

      expect(result.items).toHaveLength(3);
      expect(result.items[0].purchasingGroup).toBe('Error');
      expect(result.items[2].id).toBe(1);
    });

    it('should apply search parameters correctly', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        Data: { Records: [], TotalRecords: 0 },
      });

      await getWorkflowList(true, 2, 25, 'categoryName', 'desc', 'search term', 'serviceName');

      expect(apiClient.post).toHaveBeenCalledWith('/workflow-editor/list', {
        SearchText: 'search term',
        SearchColumn: 'serviceName',
        PageSize: 25,
        PageNumber: 2,
        IgnorePaging: false,
        SortColumn: 'categoryName',
        SortType: 'desc',
        Filter: { OldWorkflowOnly: true },
      });
    });

    it('should format multiple approvers correctly', async () => {
      const mockResponse = {
        Data: {
          Records: [
            {
              WorkflowId: 1,
              Approver1: 'Approver A',
              Approver2: 'Approver B',
              Approver3: 'Approver C',
              Approver4: 'Approver D',
            },
          ],
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getWorkflowList();

      expect(result.items[0].approveStatus).toBe('Approver A, Approver B, Approver C, Approver D');
    });

    it('should skip empty approvers', async () => {
      const mockResponse = {
        Data: {
          Records: [
            {
              WorkflowId: 1,
              Approver1: 'Approver A',
              Approver2: '',
              Approver3: ' ',
              Approver4: 'Approver D',
            },
          ],
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getWorkflowList();

      expect(result.items[0].approveStatus).toBe('Approver A, Approver D');
    });

    it('should handle error during fetch', async () => {
      (apiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(getWorkflowList()).rejects.toThrow('Network error');
    });

    it('should handle mapping errors gracefully', async () => {
      const mockResponse = {
        Data: {
          Records: [
            { WorkflowId: 1 },
            { WorkflowId: null }, // This might cause mapping issues
          ],
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getWorkflowList();

      expect(result.items).toHaveLength(2);
    });

    it('should use default parameters when none provided', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        Data: { Records: [] },
      });

      await getWorkflowList();

      expect(apiClient.post).toHaveBeenCalledWith('/workflow-editor/list', expect.objectContaining({
        SearchText: '',
        SearchColumn: '',
        PageSize: 10,
        PageNumber: 1,
        SortColumn: 'serviceName',
        SortType: 'asc',
      }));
    });
  });

  describe('exportWorkflows', () => {
    it('should export workflows successfully', async () => {
      const mockBlob = new Blob(['test data'], { type: 'application/octet-stream' });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
        headers: new Headers(),
      });

      const request: WorkflowExportRequest = {
        SearchText: '',
        SearchColumn: '',
        PageSize: 10,
        PageNumber: 1,
        IgnorePaging: true,
        SortColumn: 'serviceName',
        SortType: 'asc',
        Filter: { OldWorkflowOnly: false },
      };

      const result = await exportWorkflows(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/workflow-editor/export',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request),
        })
      );
      expect(result).toBe(mockBlob);
    });

    it('should handle export errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const request: WorkflowExportRequest = {
        SearchText: '',
        SearchColumn: '',
        PageSize: 10,
        PageNumber: 1,
        IgnorePaging: true,
        SortColumn: 'serviceName',
        SortType: 'asc',
        Filter: { OldWorkflowOnly: false },
      };

      await expect(exportWorkflows(request)).rejects.toThrow();
    });

    it('should handle network errors during export', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      const request: WorkflowExportRequest = {
        SearchText: '',
        SearchColumn: '',
        PageSize: 10,
        PageNumber: 1,
        IgnorePaging: true,
        SortColumn: 'serviceName',
        SortType: 'asc',
        Filter: { OldWorkflowOnly: false },
      };

      await expect(exportWorkflows(request)).rejects.toThrow();
    });
  });

  describe('getWorkflowById', () => {
    it('should fetch workflow by ID successfully', async () => {
      const mockWorkflow = {
        WorkflowId: 1,
        CategoryName: 'Test Category',
        ServiceName: 'Test Service',
      };

      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockWorkflow);

      const result = await getWorkflowById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/workflow-editor/1');
      expect(result).toEqual(mockWorkflow);
    });

    it('should handle response with nested data property', async () => {
      const mockWorkflow = {
        WorkflowId: 1,
        CategoryName: 'Test',
      };

      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockWorkflow });

      const result = await getWorkflowById(1);

      expect(result).toEqual(mockWorkflow);
    });

    it('should handle errors when fetching by ID', async () => {
      (apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('Not found'));

      await expect(getWorkflowById(1)).rejects.toThrow('Not found');
    });
  });

  describe('updateWorkflow', () => {
    it('should update workflow successfully', async () => {
      const workflowData = {
        CategoryName: 'Updated Category',
        ServiceName: 'Updated Service',
      };

      const mockResponse = {
        Message: 'Updated successfully',
        IsSuccess: true,
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await updateWorkflow(1, workflowData);

      expect(apiClient.post).toHaveBeenCalledWith('/workflow-editor/1', workflowData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle update errors', async () => {
      (apiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));

      await expect(updateWorkflow(1, {})).rejects.toThrow('Update failed');
    });
  });

  describe('changeWorkflowStatus', () => {
    it('should change workflow status to active successfully', async () => {
      const mockResponse = {
        Message: 'Status changed successfully',
        IsSuccess: true,
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await changeWorkflowStatus([1, 2, 3], 1);

      expect(apiClient.post).toHaveBeenCalledWith('/workflow-editor/change-status', {
        WorkflowIds: [1, 2, 3],
        Status: 1,
      });
      expect(result.IsSuccess).toBe(true);
      expect(result.Message).toBe('Status changed successfully');
    });

    it('should change workflow status to inactive successfully', async () => {
      const mockResponse = {
        Message: 'Status changed successfully',
        IsSuccess: true,
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await changeWorkflowStatus([4, 5], 0);

      expect(apiClient.post).toHaveBeenCalledWith('/workflow-editor/change-status', {
        WorkflowIds: [4, 5],
        Status: 0,
      });
      expect(result.IsSuccess).toBe(true);
    });

    it('should handle response with nested data property', async () => {
      const mockResponse = {
        data: {
          Message: 'Success',
          IsSuccess: true,
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await changeWorkflowStatus([1], 1);

      expect(result.Message).toBe('Success');
      expect(result.IsSuccess).toBe(true);
    });

    it('should handle response with camelCase properties', async () => {
      const mockResponse = {
        message: 'Updated',
        success: true,
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await changeWorkflowStatus([1], 1);

      expect(result.Message).toBe('Updated');
      expect(result.IsSuccess).toBe(true);
    });

    it('should handle status change errors', async () => {
      (apiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Status change failed'));

      await expect(changeWorkflowStatus([1], 1)).rejects.toThrow('Status change failed');
    });

    it('should provide default success message if none provided', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({});

      const result = await changeWorkflowStatus([1], 1);

      expect(result.Message).toBe('Status changed successfully');
      expect(result.IsSuccess).toBe(true);
    });

    it('should handle single workflow ID', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        Message: 'Success',
        IsSuccess: true,
      });

      const result = await changeWorkflowStatus([1], 1);

      expect(result.IsSuccess).toBe(true);
    });

    it('should handle multiple workflow IDs', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        Message: 'Success',
        IsSuccess: true,
      });

      const result = await changeWorkflowStatus([1, 2, 3, 4, 5], 0);

      expect(apiClient.post).toHaveBeenCalledWith('/workflow-editor/change-status', {
        WorkflowIds: [1, 2, 3, 4, 5],
        Status: 0,
      });
    });
  });
});


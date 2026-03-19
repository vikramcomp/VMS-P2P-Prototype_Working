import { requestsService, SaveRequestPayload } from '../requests-service';
import { buildApiUrl } from '../api-client';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

// Mock api-client
jest.mock('../api-client', () => ({
  buildApiUrl: jest.fn((path) => `https://api.test.com/${path}`),
}));

describe('RequestsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    (buildApiUrl as jest.Mock).mockImplementation((path) => `https://api.test.com/${path}`);
  });

  describe('Service Instance', () => {
    it('should be defined', () => {
      expect(requestsService).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(requestsService.getEditorContext).toBeDefined();
      expect(requestsService.changeRequestStatus).toBeDefined();
      expect(requestsService.getRequestById).toBeDefined();
      expect(requestsService.createRequest).toBeDefined();
      expect(requestsService.saveAndSubmitRequest).toBeDefined();
      expect(requestsService.exportRequests).toBeDefined();
      expect(requestsService.saveRequest).toBeDefined();
      expect(requestsService.updateRequest).toBeDefined();
    });
  });

  describe('getEditorContext', () => {
    it('should fetch editor context successfully', async () => {
      const mockResponse = {
        groups: [{ GroupId: 1, GroupName: 'Division 1', IsActive: true }],
        subgroups: [{ SubgroupId: 1, SubgroupName: 'Subgroup 1', GroupId: 1, IsActive: true }],
        services: [{ ServiceId: 1, ServiceName: 'Service 1', SubgroupId: 1, IsActive: true }],
        serviceDetails: [{ ServiceDetailId: 1, ServiceDetailName: 'Detail 1', ServiceId: 1, IsActive: true }],
        requestTypes: [{ RequestTypeId: 1, RequestTypeName: 'Type 1', IsActive: true }],
        projectProposals: [{ ProjectProposalId: 1, ProjectProposalName: 'Proposal 1', RequestTypeId: 1 }],
        quotationsOptions: [{ QuotationId: 1, QuotationValue: '3' }],
        specificationMaster: [{ SpecificationId: 1, SpecificationName: 'Spec 1' }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await requestsService.getEditorContext();

      expect(mockFetch).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.divisions).toBeDefined();
      expect(result.data.requestTypes).toBeDefined();
    });

    it('should fetch editor context with query parameters', async () => {
      const mockResponse = {
        groups: [],
        subgroups: [],
        services: [],
        serviceDetails: [],
        requestTypes: [],
        projectProposals: [],
        quotationsOptions: [],
        specificationMaster: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await requestsService.getEditorContext({
        groupId: '1',
        requestId: '5',
        categoryId: '2',
        serviceId: '3',
        serviceDetailMappingId: '4',
        subgroupId: '6'
      });

      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain('groupId=1');
      expect(callUrl).toContain('requestId=5');
      expect(callUrl).toContain('categoryId=2');
      expect(callUrl).toContain('serviceId=3');
      expect(callUrl).toContain('serviceDetailMappingId=4');
      expect(callUrl).toContain('subgroupId=6');
    });

    it('should handle nested data property in response', async () => {
      const mockResponse = {
        data: {
          groups: [{ GroupId: 1, GroupName: 'Division 1' }],
          requestTypes: [{ RequestTypeId: 1, RequestTypeName: 'Type 1' }],
          subgroups: [],
          services: [],
          serviceDetails: [],
          projectProposals: [],
          quotationsOptions: [],
          specificationMaster: []
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await requestsService.getEditorContext();

      expect(result.success).toBe(true);
      expect(result.data.divisions).toHaveLength(1);
    });

    it('should handle success wrapper in response', async () => {
      const mockResponse = {
        success: true,
        data: {
          groups: [{ GroupId: 1, GroupName: 'Division 1' }],
          requestTypes: [],
          subgroups: [],
          services: [],
          serviceDetails: [],
          projectProposals: [],
          quotationsOptions: [],
          specificationMaster: []
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await requestsService.getEditorContext();

      expect(result.success).toBe(true);
      expect(result.data.divisions).toHaveLength(1);
    });

    it('should normalize PascalCase field names', async () => {
      const mockResponse = {
        Groups: [{ GroupId: 1, GroupName: 'Division 1', IsActive: true }],
        Subgroups: [{ SubgroupId: 1, SubgroupName: 'Subgroup 1', GroupId: 1 }],
        Services: [{ ServiceId: 1, ServiceName: 'Service 1', SubgroupId: 1 }],
        ServiceDetails: [{ ServiceDetailId: 1, ServiceDetailName: 'Detail 1', ServiceId: 1 }],
        RequestTypes: [{ RequestTypeId: 1, RequestTypeName: 'Type 1' }],
        ProjectProposals: [],
        QuotationsOptions: [{ QuotationId: 1, QuotationValue: '5' }],
        SpecificationMaster: [{ SpecificationId: 1, SpecificationName: 'Spec 1' }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await requestsService.getEditorContext();

      expect(result.success).toBe(true);
      expect(result.data.divisions).toHaveLength(1);
      expect(result.data.subgroups).toHaveLength(1);
      expect(result.data.services).toHaveLength(1);
      expect(result.data.serviceDetails).toHaveLength(1);
      expect(result.data.requestTypes).toHaveLength(1);
      expect(result.data.quotationsOptions).toHaveLength(1);
      expect(result.data.specificationMaster).toHaveLength(1);
    });

    it('should handle alternative field names (divisions/groups)', async () => {
      const mockResponse = {
        divisions: [{ DivisionId: 1, DivisionName: 'Division 1' }],
        requestTypes: [],
        subgroups: [],
        services: [],
        serviceDetails: [],
        projectProposals: [],
        quotationsOptions: [],
        specificationMaster: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await requestsService.getEditorContext();

      expect(result.success).toBe(true);
      expect(result.data.divisions).toHaveLength(1);
    });

    it('should handle camelCase field variations', async () => {
      const mockResponse = {
        groups: [{ id: 1, name: 'Division 1' }],
        requestTypes: [{ id: 1, value: 'Type 1' }],
        quotationsOptions: [{ id: 1, title: '3' }],
        subgroups: [],
        services: [],
        serviceDetails: [],
        projectProposals: [],
        specificationMaster: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await requestsService.getEditorContext();

      expect(result.success).toBe(true);
      expect(result.data.divisions[0].divisionName).toBe('Division 1');
      expect(result.data.requestTypes[0].requestTypeName).toBe('Type 1');
    });

    it('should handle parent ID fields correctly', async () => {
      const mockResponse = {
        groups: [],
        subgroups: [{ SubgroupId: 1, SubgroupName: 'Sub 1', DivisionId: 5 }],
        services: [{ ServiceId: 1, ServiceName: 'Svc 1', SubgroupId: 2 }],
        serviceDetails: [{ ServiceDetailId: 1, ServiceDetailName: 'Detail 1', ServiceId: 3 }],
        projectProposals: [{ ProjectProposalId: 1, ProjectProposalName: 'Prop 1', RequestTypeId: 4 }],
        requestTypes: [],
        quotationsOptions: [],
        specificationMaster: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await requestsService.getEditorContext();

      expect(result.data.subgroups[0].divisionId).toBe(5);
      expect(result.data.services[0].subgroupId).toBe(2);
      expect(result.data.serviceDetails[0].serviceId).toBe(3);
      expect(result.data.projectProposals[0].requestTypeId).toBe(4);
    });

    it('should handle groupId as alternative to divisionId', async () => {
      const mockResponse = {
        groups: [],
        subgroups: [{ SubgroupId: 1, SubgroupName: 'Sub 1', GroupId: 10 }],
        services: [],
        serviceDetails: [],
        requestTypes: [],
        projectProposals: [],
        quotationsOptions: [],
        specificationMaster: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await requestsService.getEditorContext();

      expect(result.data.subgroups[0].divisionId).toBe(10);
    });

    it('should handle API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await requestsService.getEditorContext();

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to fetch editor context');
      expect(result.data.divisions).toEqual([]);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await requestsService.getEditorContext();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Network error');
      expect(result.data.divisions).toEqual([]);
    });

    it('should handle non-array data gracefully', async () => {
      const mockResponse = {
        groups: null,
        subgroups: undefined,
        services: 'invalid',
        serviceDetails: 123,
        requestTypes: [],
        projectProposals: [],
        quotationsOptions: [],
        specificationMaster: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await requestsService.getEditorContext();

      expect(result.success).toBe(true);
      expect(result.data.divisions).toEqual([]);
      expect(result.data.subgroups).toEqual([]);
      expect(result.data.services).toEqual([]);
    });
  });

  describe('changeRequestStatus', () => {
    it('should change request status successfully', async () => {
      const mockResponse = { success: true, message: 'Status changed' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await requestsService.changeRequestStatus([1, 2, 3], 2);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/requests/change-status',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            RequestIds: [1, 2, 3],
            Status: 2
          })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should use default status 2 when not provided', async () => {
      const mockResponse = { success: true };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await requestsService.changeRequestStatus([5]);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.Status).toBe(2);
    });

    it('should handle API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad request',
      });

      await expect(requestsService.changeRequestStatus([1], 2)).rejects.toThrow('Change status failed: 400 - Bad request');
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failed'));

      await expect(requestsService.changeRequestStatus([1], 2)).rejects.toThrow('Network failed');
    });
  });

  describe('getRequestById', () => {
    it('should fetch request by ID successfully', async () => {
      const mockResponse = { 
        RequestId: 1, 
        RequestName: 'Test Request',
        GroupId: 5,
        SubgroupId: 10
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await requestsService.getRequestById(1);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/requests/1',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle 404 not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not found',
      });

      await expect(requestsService.getRequestById(999)).rejects.toThrow('Failed to fetch request: 404 - Not found');
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection timeout'));

      await expect(requestsService.getRequestById(1)).rejects.toThrow('Connection timeout');
    });
  });

  describe('createRequest', () => {
    it('should create a new request successfully', async () => {
      const requestData = {
        RequestName: 'New Request',
        GroupId: 1,
        SubgroupId: 2
      };

      const mockResponse = { 
        success: true, 
        requestId: 123,
        message: 'Request created'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await requestsService.createRequest(requestData);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/requests',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle validation error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Validation error',
      });

      await expect(requestsService.createRequest({})).rejects.toThrow('Failed to save request: 400 - Validation error');
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Save failed'));

      await expect(requestsService.createRequest({})).rejects.toThrow('Save failed');
    });
  });

  describe('exportRequests', () => {
    it('should export requests successfully', async () => {
      const mockBlob = new Blob(['test data'], { type: 'application/vnd.ms-excel' });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
        headers: {
          get: (name: string) => name === 'content-type' ? 'application/vnd.ms-excel' : null
        }
      });

      const result = await requestsService.exportRequests();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/requests/export',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toBeInstanceOf(Blob);
    });

    it('should export with custom parameters', async () => {
      const mockBlob = new Blob(['filtered data']);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
        headers: {
          get: () => 'application/octet-stream'
        }
      });

      const params = {
        SearchText: 'test',
        SearchColumn: 'RequestName',
        SortColumn: 'CreatedDate',
        SortType: 'DESC',
        Filter: {
          DivisionId: 5,
          SubgroupId: 10,
          RequestTypeId: 2,
          RequestNumber: 'REQ-001'
        }
      };

      await requestsService.exportRequests(params);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.SearchText).toBe('test');
      expect(callBody.Filter.DivisionId).toBe(5);
      expect(callBody.PageSize).toBe(-1);
      expect(callBody.IgnorePaging).toBe(true);
    });

    it('should handle export failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Export failed',
      });

      await expect(requestsService.exportRequests()).rejects.toThrow('Export failed: 500 - Export failed');
    });
  });

  describe('saveRequest', () => {
    const mockPayload: SaveRequestPayload = {
      RequestId: '0',
      GroupId: 1,
      SubgroupId: 2,
      ServiceId: 3,
      ServiceDetailId: 4,
      RequestName: 'Test Request',
      RequestDescription: 'Description',
      RequestTypeId: 1,
      AdvanceReceived: 1000,
      MinimumQuotationsRequested: 3,
      NoOfQuotations: 3,
      PantherProjectProposalId: 'PROP-001',
      StartDate: '2024-12-18T10:30:00.000Z',
      EndDate: '2024-12-31T10:30:00.000Z',
      Document: '',
      Specification1: 1,
      Specification2: 2,
      Specification3: 3,
      Specification4: 4,
      Specification5: 5
    };

    it('should save request as draft successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Saved',
        requestId: 100
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await requestsService.saveRequest(mockPayload);

      expect(result.success).toBe(true);
      expect(result.requestId).toBe(100);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com//requests',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should use FormData for save request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await requestsService.saveRequest(mockPayload);

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.body).toBeInstanceOf(FormData);
    });

    it('should return error on save failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Validation failed' }),
      });

      const result = await requestsService.saveRequest(mockPayload);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Validation failed');
    });

    it('should handle network error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await requestsService.saveRequest(mockPayload);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Network error');
    });

    it('should handle response with different id field names', async () => {
      const mockResponse = {
        success: true,
        id: 200,
        message: 'Saved'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await requestsService.saveRequest(mockPayload);

      expect(result.requestId).toBe(200);
    });
  });

  describe('updateRequest', () => {
    const mockPayload: SaveRequestPayload = {
      RequestId: '10',
      GroupId: 1,
      SubgroupId: 2,
      ServiceId: 3,
      ServiceDetailId: 4,
      RequestName: 'Updated Request',
      RequestDescription: 'Updated Description',
      RequestTypeId: 1,
      AdvanceReceived: 2000,
      MinimumQuotationsRequested: 5,
      NoOfQuotations: 5,
      PantherProjectProposalId: 'PROP-002',
      StartDate: '2024-12-20T10:30:00.000Z',
      EndDate: '2025-01-10T10:30:00.000Z',
      Document: '',
      Specification1: 1,
      Specification2: 2,
      Specification3: 3,
      Specification4: 4,
      Specification5: 5
    };

    it('should update request successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Updated',
        requestId: 10
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await requestsService.updateRequest(mockPayload);

      expect(result.success).toBe(true);
      expect(result.requestId).toBe(10);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com//requests',
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });

    it('should use FormData for update request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await requestsService.updateRequest(mockPayload);

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.body).toBeInstanceOf(FormData);
    });

    it('should return error on update failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Request not found' }),
      });

      const result = await requestsService.updateRequest(mockPayload);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Request not found');
    });

    it('should handle network error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Update failed'));

      const result = await requestsService.updateRequest(mockPayload);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Update failed');
    });
  });

  describe('saveAndSubmitRequest (FormData version)', () => {
    const mockPayload: SaveRequestPayload = {
      RequestId: '0',
      GroupId: 1,
      SubgroupId: 2,
      ServiceId: 3,
      ServiceDetailId: 4,
      RequestName: 'Submit Request',
      RequestDescription: 'Submit Description',
      RequestTypeId: 1,
      AdvanceReceived: 3000,
      MinimumQuotationsRequested: 4,
      NoOfQuotations: 4,
      PantherProjectProposalId: 'PROP-003',
      StartDate: '2024-12-25T10:30:00.000Z',
      EndDate: '2025-01-15T10:30:00.000Z',
      Document: '',
      Specification1: 1,
      Specification2: 2,
      Specification3: 3,
      Specification4: 4,
      Specification5: 5
    };

    it('should save and submit request successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Submitted',
        requestId: 300
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await requestsService.saveAndSubmitRequest(mockPayload);

      expect(result.success).toBe(true);
      expect(result.requestId).toBe(300);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com//requests/save-and-submit',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should use FormData for save and submit', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await requestsService.saveAndSubmitRequest(mockPayload);

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.body).toBeInstanceOf(FormData);
    });

    it('should return error on submission failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Not authorized' }),
      });

      const result = await requestsService.saveAndSubmitRequest(mockPayload);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not authorized');
    });

    it('should handle network error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Submission failed'));

      const result = await requestsService.saveAndSubmitRequest(mockPayload);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Submission failed');
    });

    it('should use default message when not provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, requestId: 400 }),
      });

      const result = await requestsService.saveAndSubmitRequest(mockPayload);

      expect(result.message).toBe('Request saved and submitted successfully');
    });
  });
});

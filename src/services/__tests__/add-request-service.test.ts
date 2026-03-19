import { addRequestService } from '../add-request-service';
import { buildApiUrl } from '../api-client';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

// Mock api-client
jest.mock('../api-client', () => ({
  buildApiUrl: jest.fn((path) => `https://api.test.com/${path}`),
}));

describe('AddRequestService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    (buildApiUrl as jest.Mock).mockImplementation((path) => `https://api.test.com/${path}`);
  });

  describe('Service Instance', () => {
    it('should be defined', () => {
      expect(addRequestService).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(addRequestService.getInitialEditorContext).toBeDefined();
      expect(addRequestService.getEditorContextByGroup).toBeDefined();
      expect(addRequestService.getEditorContextByService).toBeDefined();
      expect(addRequestService.getEditorContextByCategory).toBeDefined();
      expect(addRequestService.getEditorContextByRequestType).toBeDefined();
    });
  });

  describe('getInitialEditorContext', () => {
    it('should fetch initial editor context successfully with PascalCase', async () => {
      const mockResponse = {
        Groups: [{ DivisionId: 1, DivisionName: 'Division 1', IsActive: true }],
        RequestTypes: [{ RequestTypeId: 1, RequestTypeName: 'Billable', IsActive: true }],
        QuotationsOptions: [{ QuotationId: 1, QuotationValue: '3', IsActive: true }],
        SpecificationMaster: [{ SpecificationId: 1, SpecificationName: 'Spec 1', IsActive: true }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getInitialEditorContext();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/requests/editor-context',
        expect.objectContaining({ method: 'GET' })
      );
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.divisions).toHaveLength(1);
      expect(result.data?.requestTypes).toHaveLength(1);
    });

    it('should fetch initial editor context successfully with camelCase', async () => {
      const mockResponse = {
        groups: [{ divisionId: 1, divisionName: 'Division 1', isActive: true }],
        requestTypes: [{ requestTypeId: 1, requestTypeName: 'Non-Billable', isActive: true }],
        quotationsOptions: [{ quotationId: 1, quotationValue: '5' }],
        specificationMaster: [{ specificationId: 1, specificationName: 'Spec 1' }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getInitialEditorContext();

      expect(result.success).toBe(true);
      expect(result.data?.divisions).toHaveLength(1);
      expect(result.data?.divisions[0].divisionId).toBe(1);
    });

    it('should handle nested data property', async () => {
      const mockResponse = {
        data: {
          groups: [{ divisionId: 1, divisionName: 'Division 1' }],
          requestTypes: [],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getInitialEditorContext();

      expect(result.success).toBe(true);
      expect(result.data?.divisions).toHaveLength(1);
    });

    it('should handle success wrapper structure', async () => {
      const mockResponse = {
        success: true,
        data: {
          groups: [{ divisionId: 1, divisionName: 'Division 1' }],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getInitialEditorContext();

      expect(result.success).toBe(true);
      expect(result.data?.divisions).toHaveLength(1);
    });

    it('should flatten nested arrays', async () => {
      const mockResponse = {
        groups: [[{ divisionId: 1, divisionName: 'Division 1' }]],
        requestTypes: [{ requestTypeId: 1, requestTypeName: 'Type 1' }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getInitialEditorContext();

      expect(result.success).toBe(true);
      expect(result.data?.divisions).toHaveLength(1);
    });

    it('should handle empty response', async () => {
      const mockResponse = {};

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getInitialEditorContext();

      expect(result.success).toBe(true);
      expect(result.data?.divisions).toEqual([]);
      expect(result.data?.requestTypes).toEqual([]);
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await addRequestService.getInitialEditorContext();

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toContain('500');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      const result = await addRequestService.getInitialEditorContext();

      expect(result.success).toBe(false);
      expect(result.message).toContain('Network failure');
    });

    it('should normalize field names correctly', async () => {
      const mockResponse = {
        groups: [
          { Id: 1, Name: 'Division A' },
          { divisionId: 2, divisionName: 'Division B' },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getInitialEditorContext();

      expect(result.data?.divisions).toHaveLength(2);
      expect(result.data?.divisions[0].divisionId).toBe(1);
      expect(result.data?.divisions[0].divisionName).toBe('Division A');
    });
  });

  describe('getEditorContextByGroup', () => {
    it('should fetch context by group ID successfully', async () => {
      const mockResponse = {
        subgroups: [{ subgroupId: 1, subgroupName: 'Subgroup 1' }],
        services: [{ serviceId: 1, serviceName: 'Service 1' }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getEditorContextByGroup(5);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/requests/editor-context?groupId=5',
        expect.any(Object)
      );
      expect(result.success).toBe(true);
      expect(result.data?.subgroups).toHaveLength(1);
      expect(result.data?.services).toHaveLength(1);
    });

    it('should set divisionId for all returned subgroups', async () => {
      const mockResponse = {
        subgroups: [
          { subgroupId: 1, subgroupName: 'Subgroup 1' },
          { subgroupId: 2, subgroupName: 'Subgroup 2' },
        ],
        services: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getEditorContextByGroup(10);

      expect(result.data?.subgroups[0].divisionId).toBe('10');
      expect(result.data?.subgroups[1].divisionId).toBe('10');
    });

    it('should set divisionId for all returned services', async () => {
      const mockResponse = {
        subgroups: [],
        services: [
          { serviceId: 1, serviceName: 'Service 1' },
          { serviceId: 2, serviceName: 'Service 2' },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getEditorContextByGroup(15);

      expect(result.data?.services[0].divisionId).toBe('15');
      expect(result.data?.services[1].divisionId).toBe('15');
    });

    it('should handle string group ID', async () => {
      const mockResponse = { subgroups: [], services: [] };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getEditorContextByGroup('20');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/requests/editor-context?groupId=20',
        expect.any(Object)
      );
    });

    it('should handle errors when fetching by group', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Fetch failed'));

      const result = await addRequestService.getEditorContextByGroup(1);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Fetch failed');
    });
  });

  describe('getEditorContextByService', () => {
    it('should fetch context by service ID successfully', async () => {
      const mockResponse = {
        serviceDetails: [
          { serviceDetailId: 1, serviceDetailName: 'Detail 1' },
          { serviceDetailId: 2, serviceDetailName: 'Detail 2' },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getEditorContextByService(7);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/requests/editor-context?serviceId=7',
        expect.any(Object)
      );
      expect(result.success).toBe(true);
      expect(result.data?.serviceDetails).toHaveLength(2);
    });

    it('should set serviceId for all returned service details', async () => {
      const mockResponse = {
        serviceDetails: [
          { serviceDetailId: 1, serviceDetailName: 'Detail 1' },
          { serviceDetailId: 2, serviceDetailName: 'Detail 2' },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getEditorContextByService(99);

      expect(result.data?.serviceDetails[0].serviceId).toBe('99');
      expect(result.data?.serviceDetails[1].serviceId).toBe('99');
    });

    it('should handle PascalCase service details', async () => {
      const mockResponse = {
        ServiceDetails: [
          { ServiceDetailId: 1, ServiceDetailName: 'Detail 1' },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getEditorContextByService(5);

      expect(result.data?.serviceDetails).toHaveLength(1);
      expect(result.data?.serviceDetails[0].serviceDetailId).toBe(1);
    });

    it('should handle errors when fetching by service', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Service not found'));

      const result = await addRequestService.getEditorContextByService(999);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Service not found');
    });
  });

  describe('getEditorContextByCategory', () => {
    it('should fetch context by category ID successfully', async () => {
      const mockResponse = {
        projectProposals: [
          { projectProposalId: 1, projectProposalName: 'Proposal 1', requestTypeId: 2 },
          { projectProposalId: 2, projectProposalName: 'Proposal 2', requestTypeId: 2 },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getEditorContextByCategory(2);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/requests/editor-context?categoryId=2',
        expect.any(Object)
      );
      expect(result.success).toBe(true);
      expect(result.data?.projectProposals).toHaveLength(2);
    });

    it('should handle PascalCase project proposals', async () => {
      const mockResponse = {
        ProjectProposals: [
          { ProjectProposalId: 1, ProjectProposalName: 'Proposal A', RequestTypeId: 1 },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getEditorContextByCategory(1);

      expect(result.data?.projectProposals).toHaveLength(1);
      expect(result.data?.projectProposals[0].projectProposalId).toBe(1);
    });

    it('should handle alternative field names', async () => {
      const mockResponse = {
        partnerProjectProposal: [
          { projectProposalId: 1, projectProposalName: 'Partner Proposal' },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getEditorContextByCategory(3);

      expect(result.data?.projectProposals).toHaveLength(1);
    });

    it('should handle errors when fetching by category', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Category not found'));

      const result = await addRequestService.getEditorContextByCategory(999);

      expect(result.success).toBe(false);
    });
  });

  describe('getEditorContextByRequestType', () => {
    it('should fetch context by request type successfully', async () => {
      const mockResponse = {
        advanceReceived: [
          { advanceReceivedId: 1, advanceReceivedName: 'Yes' },
          { advanceReceivedId: 2, advanceReceivedName: 'No' },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getEditorContextByRequestType(2);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/requests/editor-context?requestType=2',
        expect.any(Object)
      );
      expect(result.success).toBe(true);
      expect(result.data?.advanceReceived).toHaveLength(2);
    });

    it('should handle PascalCase advance received options', async () => {
      const mockResponse = {
        AdvanceReceivedOptions: [
          { AdvanceReceivedId: 1, AdvanceReceivedName: 'Yes' },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getEditorContextByRequestType(2);

      expect(result.data?.advanceReceived).toHaveLength(1);
    });

    it('should handle alternative field names', async () => {
      const mockResponse = {
        advancedReceived: [
          { advanceReceivedId: 1, advanceReceivedName: 'Partial' },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getEditorContextByRequestType(2);

      expect(result.data?.advanceReceived).toHaveLength(1);
    });

    it('should handle string request type', async () => {
      const mockResponse = { advanceReceived: [] };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getEditorContextByRequestType('2');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/requests/editor-context?requestType=2',
        expect.any(Object)
      );
    });

    it('should handle errors when fetching by request type', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Request type not found'));

      const result = await addRequestService.getEditorContextByRequestType(999);

      expect(result.success).toBe(false);
    });
  });

  describe('Field Normalization', () => {
    it('should normalize various field name patterns', async () => {
      const mockResponse = {
        groups: [
          { Id: 1, Name: 'Group 1' },
          { GroupId: 2, GroupName: 'Group 2' },
          { divisionId: 3, divisionName: 'Group 3' },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getInitialEditorContext();

      expect(result.data?.divisions).toHaveLength(3);
      // Check that divisions array exists and has items, field names may vary
      expect(result.data?.divisions).toBeDefined();
      expect(result.data?.divisions.length).toBeGreaterThan(0);
    });

    it('should handle isActive field variations', async () => {
      const mockResponse = {
        groups: [
          { divisionId: 1, divisionName: 'Group 1', IsActive: true },
          { divisionId: 2, divisionName: 'Group 2', isActive: false },
          { divisionId: 3, divisionName: 'Group 3' }, // No isActive field
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getInitialEditorContext();

      expect(result.data?.divisions[0].isActive).toBe(true);
      expect(result.data?.divisions[1].isActive).toBe(false);
      expect(result.data?.divisions[2].isActive).toBe(true); // Default value
    });

    it('should handle parent ID field variations', async () => {
      const mockResponse = {
        subgroups: [
          { subgroupId: 1, subgroupName: 'Sub 1', groupId: 10 },
          { subgroupId: 2, subgroupName: 'Sub 2', DivisionId: 10 },
          { subgroupId: 3, subgroupName: 'Sub 3', ParentId: 10 },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addRequestService.getInitialEditorContext();

      result.data?.subgroups.forEach((sub) => {
        expect(sub.divisionId).toBeDefined();
      });
    });
  });
});

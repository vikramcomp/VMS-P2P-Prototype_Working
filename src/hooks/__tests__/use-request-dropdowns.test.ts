import { renderHook, act, waitFor } from '@testing-library/react';
import { useRequestDropdowns } from '../use-request-dropdowns';
import { addRequestService } from '@/services/add-request-service';
import { pantherSOAPService } from '@/services/panther-soap-service';

// Mock the services
jest.mock('@/services/add-request-service');
jest.mock('@/services/panther-soap-service');

const mockAddRequestService = addRequestService as jest.Mocked<typeof addRequestService>;
const mockPantherSOAPService = pantherSOAPService as jest.Mocked<typeof pantherSOAPService>;

describe('useRequestDropdowns', () => {
  const mockEditorContext = {
    divisions: [
      { divisionId: 1, divisionName: 'Division 1', groupId: 1 },
      { divisionId: 2, divisionName: 'Division 2', groupId: 2 }
    ],
    subgroups: [
      { subgroupId: 1, subgroupName: 'Subgroup 1', divisionId: 1 },
      { subgroupId: 2, subgroupName: 'Subgroup 2', divisionId: 2 }
    ],
    services: [
      { serviceId: 1, serviceName: 'Service 1', divisionId: 1, subgroupId: 1 },
      { serviceId: 2, serviceName: 'Service 2', divisionId: 2, subgroupId: 2 }
    ],
    serviceDetails: [
      { serviceDetailId: 1, serviceDetailName: 'Detail 1', serviceId: 1 },
      { serviceDetailId: 2, serviceDetailName: 'Detail 2', serviceId: 2 }
    ],
    requestTypes: [
      { requestTypeId: 1, requestTypeName: 'Type 1' },
      { requestTypeId: 2, requestTypeName: 'Type 2' }
    ],
    projectProposals: [
      { projectProposalId: 'PP1', projectProposalName: 'Project 1', requestTypeId: 1 },
      { projectProposalId: 'PP2', projectProposalName: 'Project 2', requestTypeId: 2 }
    ],
    quotationsOptions: [
      { quotationId: 1, quotationValue: 'Q001' },
      { quotationId: 2, quotationValue: 'Q002' }
    ],
    specificationMaster: [
      { specificationId: 1, specificationName: 'Spec 1' }
    ],
    advanceReceived: [
      { advanceReceivedId: 1, advanceReceivedName: 'Yes' },
      { advanceReceivedId: 2, advanceReceivedName: 'No' }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Default mock implementation
    mockAddRequestService.getInitialEditorContext.mockResolvedValue({
      success: true,
      data: mockEditorContext,
      message: 'Success'
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useRequestDropdowns());

      expect(result.current.editorContext).toBeNull();
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.projectProposalIdsSOAP).toEqual([]);
    });

    it('should fetch initial editor context on mount', async () => {
      const { result } = renderHook(() => useRequestDropdowns());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockAddRequestService.getInitialEditorContext).toHaveBeenCalled();
      expect(result.current.editorContext).toEqual(mockEditorContext);
    });
  });

  describe('Dropdown options conversion', () => {
    it('should convert divisions to dropdown options', async () => {
      const { result } = renderHook(() => useRequestDropdowns());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.requestGroups).toHaveLength(2);
      expect(result.current.requestGroups[0]).toEqual({
        id: '1',
        name: 'Division 1',
        parentId: undefined
      });
    });

    it('should convert subgroups with parentId', async () => {
      const { result } = renderHook(() => useRequestDropdowns());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.subgroups).toHaveLength(2);
      expect(result.current.subgroups[0].parentId).toBe('1');
    });

    it('should convert services with parentId', async () => {
      const { result } = renderHook(() => useRequestDropdowns());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.services).toHaveLength(2);
      expect(result.current.services[0].parentId).toBe('1');
    });

    it('should filter out inactive items', async () => {
      const contextWithInactive = {
        ...mockEditorContext,
        services: [
          { serviceId: 1, serviceName: 'Active Service', isActive: true, subgroupId: 1 },
          { serviceId: 2, serviceName: 'Inactive Service', isActive: false, subgroupId: 1 }
        ]
      };

      mockAddRequestService.getInitialEditorContext.mockResolvedValue({
        success: true,
        data: contextWithInactive,
        message: 'Success'
      });

      const { result } = renderHook(() => useRequestDropdowns());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.services).toHaveLength(1);
      expect(result.current.services[0].name).toBe('Active Service');
    });
  });

  describe('getFilteredSubgroups', () => {
    it('should filter subgroups by divisionId', async () => {
      const { result } = renderHook(() => useRequestDropdowns());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const filtered = result.current.getFilteredSubgroups('1');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Subgroup 1');
    });

    it('should return empty array for non-existent divisionId', async () => {
      const { result } = renderHook(() => useRequestDropdowns());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const filtered = result.current.getFilteredSubgroups('999');
      expect(filtered).toEqual([]);
    });
  });

  describe('getFilteredServices', () => {
    it('should filter services by divisionId', async () => {
      const { result } = renderHook(() => useRequestDropdowns());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const filtered = result.current.getFilteredServices('1');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Service 1');
    });

    it('should filter services by divisionId and subgroupId', async () => {
      const { result } = renderHook(() => useRequestDropdowns());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const filtered = result.current.getFilteredServices('1', '1');
      expect(filtered).toHaveLength(1);
    });

    it('should return empty array when no match', async () => {
      const { result } = renderHook(() => useRequestDropdowns());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const filtered = result.current.getFilteredServices('999');
      expect(filtered).toEqual([]);
    });
  });

  describe('getFilteredServiceDetails', () => {
    it('should filter service details by serviceId', async () => {
      const { result } = renderHook(() => useRequestDropdowns());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const filtered = result.current.getFilteredServiceDetails('1');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Detail 1');
    });
  });

  describe('getFilteredProjectProposals', () => {
    it('should filter project proposals by requestTypeId', async () => {
      const { result } = renderHook(() => useRequestDropdowns());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const filtered = result.current.getFilteredProjectProposals('1');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Project 1');
    });
  });

  describe('fetchProjectProposalsSOAP', () => {
    it('should fetch project proposals from REST API for Billable request type', async () => {
      const mockData = [
        { id: 0, name: '19001-Management Meeting' },
        { id: 1, name: '19002-Development Project' }
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useRequestDropdowns());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.fetchProjectProposalsSOAP('2'); // Billable type
      });

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/requests/project-proposals'));
      expect(result.current.projectProposalIdsSOAP).toHaveLength(2);
      expect(result.current.projectProposalIdsSOAP[0].name).toBe('19001-Management Meeting');
    });

    it('should skip fetching for non-Billable request types', async () => {
      global.fetch = jest.fn();

      const { result } = renderHook(() => useRequestDropdowns());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.fetchProjectProposalsSOAP('1'); // Non-billable type
      });

      expect(global.fetch).not.toHaveBeenCalled();
      expect(result.current.projectProposalIdsSOAP).toEqual([]);
    });
  });

  describe('refetch', () => {
    it('should refetch editor context', async () => {
      const { result } = renderHook(() => useRequestDropdowns());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockAddRequestService.getInitialEditorContext).toHaveBeenCalledTimes(2);
    });

    it('should set isRefetching during refetch', async () => {
      const { result } = renderHook(() => useRequestDropdowns());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let refetchPromise: Promise<void>;
      act(() => {
        refetchPromise = result.current.refetch();
      });

      expect(result.current.isRefetching).toBe(true);

      await act(async () => {
        await refetchPromise!;
      });

      expect(result.current.isRefetching).toBe(false);
    });

    it('should call different API based on params', async () => {
      mockAddRequestService.getEditorContextByGroup.mockResolvedValue({
        success: true,
        data: mockEditorContext,
        message: 'Success'
      });

      const { result } = renderHook(() => useRequestDropdowns());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refetch({ groupId: 1 });
      });

      expect(mockAddRequestService.getEditorContextByGroup).toHaveBeenCalledWith(1);
    });
  });

  describe('Error handling', () => {
    it('should handle API error', async () => {
      mockAddRequestService.getInitialEditorContext.mockResolvedValue({
        success: false,
        data: null,
        message: 'Failed to load data'
      });

      const { result } = renderHook(() => useRequestDropdowns());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load data');
      expect(result.current.editorContext).toBeNull();
    });

    it('should handle API exception', async () => {
      mockAddRequestService.getInitialEditorContext.mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useRequestDropdowns());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty editor context', async () => {
      const emptyContext = {
        divisions: [],
        subgroups: [],
        services: [],
        serviceDetails: [],
        requestTypes: [],
        projectProposals: [],
        quotationsOptions: [],
        specificationMaster: [],
        advanceReceived: []
      };

      mockAddRequestService.getInitialEditorContext.mockResolvedValue({
        success: true,
        data: emptyContext,
        message: 'Success'
      });

      const { result } = renderHook(() => useRequestDropdowns());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.requestGroups).toEqual([]);
      expect(result.current.subgroups).toEqual([]);
      expect(result.current.services).toEqual([]);
    });

    it('should handle null values in dropdown items', async () => {
      const contextWithNulls = {
        ...mockEditorContext,
        divisions: [
          { divisionId: null, divisionName: null } as any
        ]
      };

      mockAddRequestService.getInitialEditorContext.mockResolvedValue({
        success: true,
        data: contextWithNulls,
        message: 'Success'
      });

      const { result } = renderHook(() => useRequestDropdowns());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should filter out items with empty id and name
      expect(result.current.requestGroups).toHaveLength(0);
    });
  });
});

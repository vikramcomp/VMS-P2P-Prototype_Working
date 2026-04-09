import { useState, useEffect, useMemo } from 'react';
import { addRequestService } from '@/services/add-request-service';
import { pantherSOAPService } from '@/services/panther-soap-service';
import { 
  RequestEditorContext, 
  EditorContextParams, 
  DropdownOption,
} from '@/types/requests';
import { BUSINESS_UNITS, DEPARTMENTS } from '@/data/seedData/businessUnits';

interface UseRequestDropdownsReturn {
  // Data
  editorContext: RequestEditorContext | null;
  
  // Dropdown options
  requestGroups: DropdownOption[];
  subgroups: DropdownOption[];
  services: DropdownOption[];
  serviceDetails: DropdownOption[];
  requestTypes: DropdownOption[];
  projectProposalIds: DropdownOption[];
  quotationOptions: DropdownOption[];
  specifications: DropdownOption[];
  advanceReceivedOptions: DropdownOption[];
  
  // SOAP-based dropdown (from Panther WSDL)
  projectProposalIdsSOAP: DropdownOption[];
  
  // State
  isLoading: boolean;
  isRefetching: boolean;
  error: string | null;
  
  // Functions
  refetch: (params?: EditorContextParams) => Promise<void>;
  fetchProjectProposalsSOAP: (requestTypeId: string) => Promise<void>;
  getFilteredSubgroups: (divisionId: string) => DropdownOption[];
  getFilteredServices: (divisionId: string, subgroupId?: string) => DropdownOption[];
  getFilteredServiceDetails: (serviceId: string) => DropdownOption[];
  getFilteredProjectProposals: (requestTypeId: string) => DropdownOption[];
  
  // Debug
  rawApiResponse?: any;
}

export function useRequestDropdowns(): UseRequestDropdownsReturn {
  const [editorContext, setEditorContext] = useState<RequestEditorContext | null>(null);
  const [projectProposalIdsSOAP, setProjectProposalIdsSOAP] = useState<DropdownOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawApiResponse, setRawApiResponse] = useState<any>(null);

  // Convert API data to dropdown options format
  const convertToDropdownOptions = (items: any[], idField: string, nameField: string, parentIdField?: string): DropdownOption[] => {
    if (!items || !Array.isArray(items)) {
      console.log('convertToDropdownOptions: Items is not an array:', items);
      return [];
    }
    
    console.log(`Converting ${items.length} items with fields: id=${idField}, name=${nameField}, parent=${parentIdField}`);
    if (items.length > 0) {
      console.log('First item structure:', items[0]);
      console.log('First item keys:', Object.keys(items[0] || {}));
    }
    
    const converted = items
      .filter(item => {
        const isValid = item && (item.isActive === true || item.isActive === undefined || item.isActive === null);
        if (!isValid) {
          console.log('Filtering out inactive item:', item);
        }
        return isValid;
      })
      .map(item => {
        const id = item[idField];
        const name = item[nameField];
        
        // Log if we're missing ID or name
        if (!id && id !== 0) {
          console.warn(`Missing ${idField} for item:`, item);
        }
        if (!name) {
          console.warn(`Missing ${nameField} for item:`, item);
        }
        
        const result = {
          id: id?.toString() || '',
          name: name || item.name || item.Name || '',
          parentId: parentIdField ? item[parentIdField]?.toString() : undefined
        };
        console.log('Converted item:', result);
        return result;
      });
    
    console.log(`Successfully converted ${converted.length} items (before filtering empty)`);
    
    // Only filter out items that have both empty id AND empty name
    const filtered = converted.filter(item => item.id || item.name);
    console.log(`After filtering: ${filtered.length} items remain`);
    
    return filtered;
  };

  // Memoized dropdown options
  const requestGroups = useMemo(() => {
    console.log('Processing requestGroups, editorContext:', editorContext);
    console.log('Divisions data:', editorContext?.divisions);
    
    if (!editorContext?.divisions) return [];
    
    // Use the normalized field names from the service
    const result = convertToDropdownOptions(editorContext.divisions, 'divisionId', 'divisionName');
    console.log('Converted requestGroups:', result);
    return result;
  }, [editorContext]);

  const subgroups = useMemo(() => {
    console.log('Processing subgroups, data:', editorContext?.subgroups);
    if (!editorContext?.subgroups) return [];
    
    const result = convertToDropdownOptions(editorContext.subgroups, 'subgroupId', 'subgroupName', 'divisionId');
    console.log('Converted subgroups:', result);
    return result;
  }, [editorContext]);

  const services = useMemo(() => {
    if (!editorContext?.services) return [];
    return convertToDropdownOptions(editorContext.services, 'serviceId', 'serviceName', 'subgroupId');
  }, [editorContext]);

  const serviceDetails = useMemo(() => {
    if (!editorContext?.serviceDetails) return [];
    return convertToDropdownOptions(editorContext.serviceDetails, 'serviceDetailId', 'serviceDetailName', 'serviceId');
  }, [editorContext]);

  const requestTypes = useMemo(() => {
    console.log('Processing requestTypes, data:', editorContext?.requestTypes);
    if (!editorContext?.requestTypes) return [];
    const result = convertToDropdownOptions(editorContext.requestTypes, 'requestTypeId', 'requestTypeName');
    console.log('Converted requestTypes:', result);
    return result;
  }, [editorContext]);

  const projectProposalIds = useMemo(() => {
    console.log('Processing projectProposals, data:', editorContext?.projectProposals);
    if (!editorContext?.projectProposals) return [];
    const result = convertToDropdownOptions(editorContext.projectProposals, 'projectProposalId', 'projectProposalName', 'requestTypeId');
    console.log('Converted projectProposals:', result);
    return result;
  }, [editorContext]);

  const quotationOptions = useMemo(() => {
    console.log('Processing quotationsOptions, data:', editorContext?.quotationsOptions);
    if (!editorContext?.quotationsOptions) return [];
    const result = convertToDropdownOptions(editorContext.quotationsOptions, 'quotationId', 'quotationValue');
    console.log('Converted quotationOptions:', result);
    return result;
  }, [editorContext]);

  const specifications = useMemo(() => {
    if (!editorContext?.specificationMaster) return [];
    return convertToDropdownOptions(editorContext.specificationMaster, 'specificationId', 'specificationName');
  }, [editorContext]);

  const advanceReceivedOptions = useMemo(() => {
    console.log('Processing advanceReceived, data:', editorContext?.advanceReceived);
    if (!editorContext?.advanceReceived) return [];
    const result = convertToDropdownOptions(editorContext.advanceReceived, 'advanceReceivedId', 'advanceReceivedName');
    console.log('Converted advanceReceivedOptions:', result);
    return result;
  }, [editorContext]);

  // Filtered dropdown functions for dependent dropdowns
  const getFilteredSubgroups = (divisionId: string): DropdownOption[] => {
    return subgroups.filter(subgroup => subgroup.parentId === divisionId);
  };

  const getFilteredServices = (divisionId: string, subgroupId?: string): DropdownOption[] => {
    if (subgroupId) {
      return services.filter(service => service.parentId === subgroupId);
    }
    // If no subgroup selected, show services for the division
    const divisionSubgroups = getFilteredSubgroups(divisionId);
    const subgroupIds = new Set(divisionSubgroups.map(sg => sg.id));
    return services.filter(service => subgroupIds.has(service.parentId || ''));
  };

  const getFilteredServiceDetails = (serviceId: string): DropdownOption[] => {
    return serviceDetails.filter(detail => detail.parentId === serviceId);
  };

  const getFilteredProjectProposals = (requestTypeId: string): DropdownOption[] => {
    console.log('Filtering project proposals for requestTypeId:', requestTypeId);
    console.log('All project proposals:', projectProposalIds);
    const filtered = projectProposalIds.filter(proposal => {
      console.log(`Comparing proposal.parentId (${proposal.parentId}) === requestTypeId (${requestTypeId}):`, proposal.parentId === requestTypeId);
      return proposal.parentId === requestTypeId;
    });
    console.log('Filtered project proposals:', filtered);
    return filtered;
  };

  // Helper: Fetch API based on params
  const fetchEditorContextData = async (params?: EditorContextParams) => {
    if (params?.requestType) {
      console.log('Calling getEditorContextByRequestType with requestType:', params.requestType);
      return await addRequestService.getEditorContextByRequestType(params.requestType);
    }
    if (params?.groupId) {
      console.log('Calling getEditorContextByGroup with groupId:', params.groupId);
      return await addRequestService.getEditorContextByGroup(params.groupId);
    }
    if (params?.serviceId) {
      console.log('Calling getEditorContextByService with serviceId:', params.serviceId);
      return await addRequestService.getEditorContextByService(params.serviceId);
    }
    if (params?.categoryId) {
      console.log('Calling getEditorContextByCategory with categoryId:', params.categoryId);
      return await addRequestService.getEditorContextByCategory(params.categoryId);
    }
    console.log('Calling getInitialEditorContext for initial load');
    return await addRequestService.getInitialEditorContext();
  };

  // Helper: Preserve subgroups based on params
  const getPreservedSubgroups = (params: EditorContextParams | undefined, responseData: any, currentContext: RequestEditorContext) => {
    if (params?.serviceId || params?.requestType) {
      return currentContext.subgroups;
    }
    return responseData.subgroups?.length > 0 ? responseData.subgroups : currentContext.subgroups;
  };

  // Helper: Preserve services based on params
  const getPreservedServices = (params: EditorContextParams | undefined, responseData: any, currentContext: RequestEditorContext) => {
    if (params?.serviceId || params?.requestType) {
      return currentContext.services;
    }
    return responseData.services?.length > 0 ? responseData.services : currentContext.services;
  };

  // Helper: Preserve service details based on params
  const getPreservedServiceDetails = (params: EditorContextParams | undefined, responseData: any, currentContext: RequestEditorContext) => {
    if (params?.requestType) {
      return currentContext.serviceDetails;
    }
    return responseData.serviceDetails?.length > 0 ? responseData.serviceDetails : currentContext.serviceDetails;
  };

  // Helper: Preserve project proposals based on params
  const getPreservedProjectProposals = (params: EditorContextParams | undefined, responseData: any, currentContext: RequestEditorContext) => {
    if (params?.categoryId) {
      return responseData.projectProposals?.length > 0 ? responseData.projectProposals : currentContext.projectProposals;
    }
    return currentContext.projectProposals;
  };

  // Helper: Merge new data with existing context
  const mergeEditorContext = (responseData: any, params: EditorContextParams | undefined, currentContext: RequestEditorContext): RequestEditorContext => {
    return {
      ...responseData,
      requestTypes: responseData.requestTypes?.length > 0 ? responseData.requestTypes : currentContext.requestTypes,
      quotationsOptions: responseData.quotationsOptions?.length > 0 ? responseData.quotationsOptions : currentContext.quotationsOptions,
      specificationMaster: responseData.specificationMaster?.length > 0 ? responseData.specificationMaster : currentContext.specificationMaster,
      divisions: responseData.divisions?.length > 0 ? responseData.divisions : currentContext.divisions,
      subgroups: getPreservedSubgroups(params, responseData, currentContext),
      services: getPreservedServices(params, responseData, currentContext),
      serviceDetails: getPreservedServiceDetails(params, responseData, currentContext),
      projectProposals: getPreservedProjectProposals(params, responseData, currentContext),
      advanceReceived: params?.requestType ? (responseData.advanceReceived || []) : (currentContext.advanceReceived || []),
    } as RequestEditorContext;
  };

  // Fetch editor context data
  const refetch = async (params?: EditorContextParams) => {
    if (editorContext === null) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }
    setError(null);

    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

    if (useMockData) {
      console.log('🛠️ [useRequestDropdowns] Using Mock Data for Prototype');
      // Convert businessUnits to divisions format
      const mockDivisions = BUSINESS_UNITS.map(bu => ({
        divisionId: bu.id,
        divisionName: bu.name,
        isActive: bu.isActive
      }));

      // Convert departments to subgroups format
      const mockSubgroups = DEPARTMENTS.map(dept => ({
        subgroupId: dept.id,
        subgroupName: dept.name,
        divisionId: dept.companyId, // Mapping to company for now as divisions in seed are by company
        isActive: dept.isActive
      }));

      const mockData = {
        divisions: mockDivisions,
        subgroups: mockSubgroups,
        services: [], // Add mock services if needed
        serviceDetails: [],
        requestTypes: [
          { requestTypeId: 1, requestTypeName: 'Goods', isActive: true },
          { requestTypeId: 2, requestTypeName: 'Service', isActive: true },
          { requestTypeId: 3, requestTypeName: 'Goods & Service', isActive: true }
        ],
        quotationsOptions: [
          { quotationId: 1, quotationValue: '1', isActive: true },
          { quotationId: 2, quotationValue: '2', isActive: true },
          { quotationId: 3, quotationValue: '3', isActive: true }
        ],
        specificationMaster: [
          { specificationId: 1, specificationName: 'Technical specification', isActive: true },
          { specificationId: 2, specificationName: 'Commercial specification', isActive: true }
        ],
        projectProposals: [],
        advanceReceived: [
          { advanceReceivedId: 1, advanceReceivedName: 'Yes', isActive: true },
          { advanceReceivedId: 2, advanceReceivedName: 'No', isActive: true }
        ]
      };

      setEditorContext(mockData as any);
      setIsLoading(false);
      setIsRefetching(false);
      return;
    }

    try {
      const response = await fetchEditorContextData(params);
      
      console.log('API Response:', response);
      console.log('Response Data:', response.data);
      console.log('API called with params:', params);
      
      setRawApiResponse(response);
      
      if (response.success && response.data) {
        console.log('Setting editor context:', response.data);
        
        const shouldMerge = params && Object.keys(params).length > 0 && editorContext !== null;
        
        if (shouldMerge) {
          console.log('Merging new data with existing context');
          const mergedData = mergeEditorContext(response.data, params, editorContext);
          console.log('Merged editor context:', mergedData);
          setEditorContext(mergedData);
        } else {
          console.log('Initial load - setting data as is');
          setEditorContext(response.data as RequestEditorContext);
        }
      } else {
        console.log('Failed to load data:', response.message);
        setError(response.message || 'Failed to load dropdown data');
      }
    } catch (err) {
      console.error('Error in useRequestDropdowns:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  };

  // Fetch Project/Proposal IDs from REST API (only for Billable request type)
  const fetchProjectProposalsSOAP = async (requestTypeId: string) => {
    try {
      console.log('🌐 [useRequestDropdowns] Fetching project proposals for requestType:', requestTypeId);
      setIsRefetching(true);
      
      // Only fetch if request type is Billable (ID = 2)
      if (requestTypeId !== '2') {
        console.log('⏭️ [useRequestDropdowns] Skipping project proposals fetch - not Billable request type');
        setProjectProposalIdsSOAP([]);
        return;
      }
      
      const response = await fetch('/api/requests/project-proposals');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📦 [useRequestDropdowns] Raw API response:', result);
      
      // The API returns an array directly or wrapped in a data property
      let data = result;
      if (result.data || result.Data) {
        data = result.data || result.Data;
      }
      
      if (Array.isArray(data)) {
        // Convert REST response to DropdownOption format
        const dropdownOptions: DropdownOption[] = data.map((item: any) => {
          // The API response structure shows: {id: 0, name: "19001-Management Meeting"}
          const id = (item.id !== undefined && item.id !== null) ? item.id.toString() : '';
          const name = item.name || '';
          
          console.log('Mapping item:', { original: item, mapped: { id, name } });
          
          return {
            id: id,
            name: name,
            parentId: requestTypeId
          };
        }).filter(opt => opt.id !== '' && opt.name !== '');
        
        console.log('✅ [useRequestDropdowns] Project proposals loaded:', dropdownOptions.length, dropdownOptions);
        setProjectProposalIdsSOAP(dropdownOptions);
      } else {
        console.warn('⚠️ [useRequestDropdowns] REST API returned no array data:', data);
        setProjectProposalIdsSOAP([]);
      }
    } catch (error) {
      console.error('❌ [useRequestDropdowns] Error fetching project proposals:', error);
      setProjectProposalIdsSOAP([]);
    } finally {
      setIsRefetching(false);
    }
  };

  // Initial load on mount
  useEffect(() => {
    refetch();
  }, []);

  return {
    editorContext,
    requestGroups,
    subgroups,
    services,
    serviceDetails,
    requestTypes,
    projectProposalIds,
    quotationOptions,
    specifications,
    advanceReceivedOptions,
    projectProposalIdsSOAP,
    isLoading,
    isRefetching,
    error,
    refetch,
    fetchProjectProposalsSOAP,
    getFilteredSubgroups,
    getFilteredServices,
    getFilteredServiceDetails,
    getFilteredProjectProposals,
    // Debug info
    rawApiResponse
  };
}
import { RequestEditorContextResponse, EditorContextParams } from '../types/requests';
import { buildApiUrl, createAuthHeaders } from './api-client';

/**
 * Interface for request export parameters
 */
interface RequestExportParams {
  SearchText?: string;
  SearchColumn?: string;
  PageSize?: number;
  PageNumber?: number;
  IgnorePaging?: boolean;
  SortColumn?: string;
  SortType?: string;
  Filter?: {
    DivisionId?: number;
    SubgroupId?: number;
    RequestTypeId?: number;
    RequestNumber?: string;
  };
}

/**
 * Interface for request status change parameters
 */
interface RequestStatusChangeParams {
  RequestIds: number[];
  Status: number;
}

/**
 * Interface for save request payload
 */
export interface SaveRequestPayload {
  RequestId: string | number;
  GroupId: number;
  SubgroupId: number;
  ServiceId: number;
  ServiceDetailId: number;
  RequestName: string;
  RequestDescription: string;
  RequestTypeId: number;
  AdvanceReceived: number;
  MinimumQuotationsRequested: number;
  NoOfQuotations: number;
  PantherProjectProposalId: string;
  StartDate: string; // ISO 8601 format: "2024-12-18T10:30:00.000Z"
  EndDate: string;   // ISO 8601 format: "2024-12-18T10:30:00.000Z"
  Document: string;
  Specification1: number;
  Specification2: number;
  Specification3: number;
  Specification4: number;
  Specification5: number;
  Currency: string;
  PRType: string;
}

/**
 * Interface for save request response
 */
export interface SaveRequestResponse {
  success: boolean;
  message: string;
  data?: any;
  requestId?: number;
}

/**
 * Service for managing request editor context API calls
 */
class RequestsService {

  /**
   * Normalize array items with flexible field mapping
   */
  private normalizeArray(items: any[], idFieldName: string, nameFieldName: string, parentIdField?: string) {
    if (!Array.isArray(items)) {
      console.warn(`normalizeArray: items is not an array for ${idFieldName}/${nameFieldName}:`, items);
      return [];
    }
    
    return items.map(item => {
      const pascalCaseId = idFieldName.charAt(0).toUpperCase() + idFieldName.slice(1);
      const idValue = item[idFieldName] || item[pascalCaseId] || item.Id || item.id;
      
      const pascalCaseName = nameFieldName.charAt(0).toUpperCase() + nameFieldName.slice(1);
      const nameValue = item[nameFieldName] || item[pascalCaseName] || item.Name || item.name || item.Value || item.value || item.Title || item.title;
      
      const isActiveValue = item.IsActive ?? item.isActive ?? true;
      
      const normalized: any = {
        ...item,
        [idFieldName]: idValue,
        [nameFieldName]: nameValue,
        isActive: isActiveValue
      };
      
      if (parentIdField) {
        normalized[parentIdField] = this.extractParentId(item, parentIdField);
      }
      
      return normalized;
    });
  }

  /**
   * Extract parent ID with multiple fallback variations
   */
  private extractParentId(item: any, parentIdField: string): number | undefined {
    const pascalCaseField = parentIdField.charAt(0).toUpperCase() + parentIdField.slice(1);
    
    if (parentIdField === 'divisionId') {
      return item.divisionId || item.DivisionId || item.groupId || item.GroupId || item.ParentId || item.parentId || undefined;
    }
    
    if (parentIdField === 'subgroupId') {
      return item.subgroupId || item.SubgroupId || item.subGroupId || item.SubGroupId || item.ParentId || item.parentId || undefined;
    }
    
    return item[pascalCaseField] || item[parentIdField] || item.ParentId || item.parentId || undefined;
  }

  /**
   * Normalize API data to expected structure
   */
  private normalizeData(apiData: any) {
    return {
      ...apiData,
      divisions: this.normalizeArray(apiData.groups || apiData.divisions || apiData.Divisions || apiData.Groups || [], 'divisionId', 'divisionName'),
      subgroups: this.normalizeArray(apiData.subgroups || apiData.subGroups || apiData.SubGroups || apiData.Subgroups || [], 'subgroupId', 'subgroupName', 'divisionId'),
      services: this.normalizeArray(apiData.services || apiData.Services || [], 'serviceId', 'serviceName', 'subgroupId'),
      serviceDetails: this.normalizeArray(apiData.serviceDetails || apiData.ServiceDetails || [], 'serviceDetailId', 'serviceDetailName', 'serviceId'),
      requestTypes: this.normalizeArray(apiData.requestTypes || apiData.RequestTypes || apiData.requestType || apiData.RequestType || [], 'requestTypeId', 'requestTypeName'),
      projectProposals: this.normalizeArray(apiData.projectProposals || apiData.ProjectProposals || apiData.partnerProjectProposal || apiData.PartnerProjectProposal || [], 'projectProposalId', 'projectProposalName', 'requestTypeId'),
      quotationsOptions: this.normalizeArray(apiData.quotationsOptions || apiData.QuotationsOptions || apiData.quotationOptions || apiData.QuotationOptions || [], 'quotationId', 'quotationValue'),
      specificationMaster: this.normalizeArray(apiData.specificationMaster || apiData.SpecificationMaster || apiData.specifications || apiData.Specifications || [], 'specificationId', 'specificationName')
    };
  }

  /**
   * Extract data from API response with multiple structure variations
   */
  private extractResponseData(rawData: any): any {
    if (rawData && typeof rawData === 'object' && 'data' in rawData) {
      return rawData.data;
    }
    
    if (rawData?.success && rawData.data) {
      return rawData.data;
    }
    
    return rawData;
  }

  /**
   * Build query parameters from editor context params
   */
  private buildEditorContextQueryParams(params?: EditorContextParams): URLSearchParams {
    const queryParams = new URLSearchParams();
    
    if (params?.groupId) queryParams.append('groupId', params.groupId);
    if (params?.requestId) queryParams.append('requestId', params.requestId);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.serviceId) queryParams.append('serviceId', params.serviceId);
    if (params?.serviceDetailMappingId) queryParams.append('serviceDetailMappingId', params.serviceDetailMappingId);
    if (params?.subgroupId) queryParams.append('subgroupId', params.subgroupId);
    
    return queryParams;
  }

  /**
   * Fetches editor context data including all dropdown options
   */
  async getEditorContext(params?: EditorContextParams): Promise<RequestEditorContextResponse> {
    try {
      const queryParams = this.buildEditorContextQueryParams(params);
      const url = `${buildApiUrl('requests/editor-context')}?${queryParams.toString()}`;
      
      console.log('Making API call to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch editor context: ${response.status} ${response.statusText}`);
      }

      const rawData = await response.json();
      
      console.log('Raw API Response:', rawData);
      console.log('Response keys:', Object.keys(rawData || {}));
      
      const data = this.extractResponseData(rawData);
      const normalizedData = this.normalizeData(data);
      console.log('=== API Response Normalization ===');
      console.log('Raw data keys:', Object.keys(data || {}));
      console.log('Divisions count:', normalizedData.divisions?.length);
      console.log('Request Types count:', normalizedData.requestTypes?.length);
      console.log('Quotation Options count:', normalizedData.quotationsOptions?.length);
      console.log('Specification Master count:', normalizedData.specificationMaster?.length);
      
      if (normalizedData.requestTypes?.length > 0) {
        console.log('Request Types sample:', normalizedData.requestTypes[0]);
      } else {
        console.warn('Request Types is empty. Raw data:', data.requestTypes || data.RequestTypes);
      }
      
      if (normalizedData.quotationsOptions?.length > 0) {
        console.log('Quotation Options sample:', normalizedData.quotationsOptions[0]);
      } else {
        console.warn('Quotation Options is empty. Raw data:', data.quotationsOptions || data.QuotationsOptions);
      }
      
      if (normalizedData.specificationMaster?.length > 0) {
        console.log('Specification Master sample:', normalizedData.specificationMaster[0]);
      } else {
        console.warn('Specification Master is empty. Raw data:', data.specificationMaster || data.SpecificationMaster);
      }
      console.log('=== End Normalization ===');
      
      return {
        success: true,
        data: normalizedData,
        message: 'Editor context loaded successfully'
      };

    } catch (error) {
      console.error('Error fetching editor context:', error);
      
      return {
        success: false,
        data: {
          divisions: [],
          subgroups: [],
          services: [],
          serviceDetails: [],
          requestTypes: [],
          projectProposals: [],
          quotationsOptions: [],
          specificationMaster: [],
          advanceReceived: []
        },
        message: error instanceof Error ? error.message : 'Failed to fetch editor context'
      };
    }
  }

  /**
   * Change status of one or more requests (used for deletion)
   * Status 2 is for deletion
   */
  async changeRequestStatus(requestIds: number[], status: number = 2): Promise<any> {
    try {
      const requestBody: RequestStatusChangeParams = {
        RequestIds: requestIds,
        Status: status
      };

      const url = buildApiUrl('requests/change-status');
      
      console.log('Making change status API call to:', url);
      console.log('Request body:', requestBody);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Change status failed: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error changing request status:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to change request status');
    }
  }

  /**
   * Get request by ID
   * @param id - Request ID
   */
  async getRequestById(id: number): Promise<any> {
    try {
      const url = buildApiUrl(`requests/${id}`);
      
      console.log('🔍 [RequestsService] Fetching request by ID:', id, 'URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: createAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch request: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📥 [RequestsService] Request data response:', data);
      console.log('📥 [RequestsService] Request data keys:', Object.keys(data || {}));
      
      return data;
    } catch (error) {
      console.error('❌ [RequestsService] Error fetching request by ID:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch request');
    }
  }

  /**
   * Create a new request (Save)
   */
  async createRequest(requestData: any): Promise<any> {
    try {
      const url = buildApiUrl('requests');
      
      console.log('Saving new request with data:', requestData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save request: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Request saved successfully:', data);
      
      return data;
    } catch (error) {
      console.error('Error saving request:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to save request');
    }
  }

  /**
   * Export requests data as file
   */
  async exportRequests(params?: Partial<RequestExportParams>): Promise<Blob> {
    try {
      const requestBody: RequestExportParams = {
        SearchText: params?.SearchText || "",
        SearchColumn: params?.SearchColumn || "",
        PageSize: -1,
        PageNumber: -1,
        IgnorePaging: true,
        SortColumn: params?.SortColumn || "",
        SortType: params?.SortType || "",
        Filter: {
          DivisionId: params?.Filter?.DivisionId || -1,
          SubgroupId: params?.Filter?.SubgroupId || -1,
          RequestTypeId: params?.Filter?.RequestTypeId || -1,
          RequestNumber: params?.Filter?.RequestNumber || ""
        }
      };

      const url = buildApiUrl('requests/export');
      
      console.log('Making export API call to:', url);
      console.log('Request body:', requestBody);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Export failed: ${response.status} - ${errorText}`);
      }
      
      // Check content type to ensure we're getting the expected format
      const contentType = response.headers.get('content-type');
      console.log('Export response content type:', contentType);
      
      // Return the blob directly for file download
      return await response.blob();
    } catch (error) {
      console.error('Error exporting requests:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to export requests');
    }
  }

  /**
   * Save request as draft
   * POST /api/requests
   */
  async saveRequest(payload: SaveRequestPayload): Promise<SaveRequestResponse> {
    try {
      console.log('💾 [RequestsService] Saving request as draft:', payload);

      const url = buildApiUrl('/requests');
      
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      Object.keys(payload).forEach(key => {
        const value = payload[key as keyof SaveRequestPayload];
        if (value !== null && value !== undefined) {
          // Handle different types appropriately
          if (typeof value === 'object' && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      
      // Get auth token
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('❌ [RequestsService] Error parsing response JSON:', parseError);
        data = { message: 'Invalid response from server' };
      }
      
      console.log('📥 [RequestsService] Save response:', data);
      console.log('📥 [RequestsService] Response status:', response.status);

      // Check for success - prioritize API response isSuccess flag, fallback to HTTP status
      const isSuccess = data.isSuccess ?? data.IsSuccess ?? response.ok;
      
      if (!isSuccess) {
        const errorMessage = data.message || data.Message || `Save failed: ${response.status}`;
        throw new Error(errorMessage);
      }

      return {
        success: true,
        message: data.message || data.Message || 'Request saved as draft successfully',
        data: data,
        requestId: data.requestId || data.RequestId || data.id || data.Id
      };

    } catch (error) {
      console.error('❌ [RequestsService] Error saving request:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save request'
      };
    }
  }

  /**
   * Update existing request
   * PUT /api/requests
   */
  async updateRequest(payload: SaveRequestPayload): Promise<SaveRequestResponse> {
    try {
      console.log('✏️ [RequestsService] Updating request:', payload);

      const url = buildApiUrl('/requests');
      
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      Object.keys(payload).forEach(key => {
        const value = payload[key as keyof SaveRequestPayload];
        if (value !== null && value !== undefined) {
          // Handle different types appropriately
          if (typeof value === 'object' && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      
      // Get auth token
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: formData,
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('❌ [RequestsService] Error parsing response JSON:', parseError);
        data = { message: 'Invalid response from server' };
      }
      
      console.log('📥 [RequestsService] Update response:', data);
      console.log('📥 [RequestsService] Response status:', response.status);
      console.log('📥 [RequestsService] Response ok:', response.ok);

      // Check for success - prioritize API response isSuccess flag, fallback to HTTP status
      const isSuccess = data.isSuccess ?? data.IsSuccess ?? response.ok;
      
      if (!isSuccess) {
        const errorMessage = data.message || data.Message || `Update failed: ${response.status}`;
        throw new Error(errorMessage);
      }

      return {
        success: true,
        message: data.message || data.Message || 'Request updated successfully',
        data: data,
        requestId: data.requestId || data.RequestId || data.id || data.Id
      };

    } catch (error) {
      console.error('❌ [RequestsService] Error updating request:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update request'
      };
    }
  }

  /**
   * Save request and submit for approval
   * POST /api/requests/save-and-submit
   */
  async saveAndSubmitRequest(payload: SaveRequestPayload): Promise<SaveRequestResponse> {
    try {
      console.log('📤 [RequestsService] Saving and submitting request:', payload);

      const url = buildApiUrl('/requests/save-and-submit');
      
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      Object.keys(payload).forEach(key => {
        const value = payload[key as keyof SaveRequestPayload];
        formData.append(key, value?.toString() || '');
      });
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('📥 [RequestsService] Save & Submit response:', data);

      if (!response.ok) {
        throw new Error(data.message || `Save & Submit failed: ${response.status}`);
      }

      return {
        success: true,
        message: data.message || 'Request saved and submitted successfully',
        data: data,
        requestId: data.requestId || data.id
      };

    } catch (error) {
      console.error('❌ [RequestsService] Error saving and submitting request:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save and submit request'
      };
    }
  }
}

export const requestsService = new RequestsService();
export default requestsService;
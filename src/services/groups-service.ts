import { apiClient, buildApiUrl, createAuthHeaders } from './api-client';
import { EnhancedApiClient, ResponseUtils } from './enhanced-api-client';
import { 
  GroupsSearchRequest, 
  GroupsApiResponse, 
  Group, 
  GroupSearchParams,
  PageSize,
  AddGroupRequest,
  AddGroupResponse,
  GetGroupRequest,
  GetGroupApiResponse,
  UpdateGroupRequest,
  UpdateGroupResponse,
  ChangeStatusRequest,
  ChangeStatusResponse,
  GetGroupsLookupResponse,
  GroupLookupItem,
  FormattedGroupOption,
  GetRolesLookupResponse,
  RoleLookupItem,
  FormattedRoleOption,
  GetModulesLookupResponse,
  ModuleLookupItem,
  FormattedModuleOption
} from '@/types/groups';

/**
 * Groups API Service
 * Handles all group-related API operations using the specific VMS API structure
 */
class GroupsService {
  private readonly endpoint = '/groups/getgroups';
  private static callCounter = 0;

  /**
   * Fetch groups using POST request with specific body structure
   */
  async getGroups(params?: GroupSearchParams): Promise<GroupsApiResponse> {
    GroupsService.callCounter++;
    
    try {
      const requestBody = this.buildRequestBody(params);
      
      // Use fetch with auth headers
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}${this.endpoint}`;
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const rawResponse = await response.json();
      
      if (!rawResponse || typeof rawResponse !== 'object') {
        throw new Error('Invalid API response format');
      }
      
      // Apply transformation to handle both PascalCase and camelCase
      const { transformApiResponse } = await import('@/utils/response-transformer');
      const apiResponse = transformApiResponse(rawResponse, { backwardCompatibility: true });
      
      // Validate VMS API response structure (supports both formats)
      const hasData = EnhancedApiClient.getResponseData(apiResponse);
      const hasRecords = EnhancedApiClient.getRecords(apiResponse);
      
      if (hasData && hasRecords) {
        return apiResponse;
      } else {
        // Return empty response structure if no records
        return {
          Data: {
            Records: [],
            TotalRecords: 0,
            TotalPages: 0,
            CurrentPage: 1,
            PageSize: params?.pageSize || 10,
          },
          Message: 'No records found',
          Success: true,
        };
      }
    } catch (error) {
      // Return empty response for network errors to show empty table
      console.warn('Groups API error:', error instanceof Error ? error.message : 'Unknown error');
      return {
        Data: {
          Records: [],
          TotalRecords: 0,
          TotalPages: 0,
          CurrentPage: 1,
          PageSize: params?.pageSize || 10,
        },
        Message: error instanceof Error ? error.message : 'Failed to fetch groups',
        Success: false,
      };
    }
  }

  /**
   * Build the specific request body structure required by the VMS API
   */
  private buildRequestBody(params?: GroupSearchParams): GroupsSearchRequest {
    // Handle 'All' page size option
    const isAllRecords = params?.pageSize === 'All';
    const pageSize = isAllRecords ? 1000 : (params?.pageSize as number) || 10; // Use large number for 'All'
    
    return {
      SearchText: params?.searchText || '',
      SearchColumn: params?.searchColumn || '',
      PageSize: pageSize,
      PageNumber: params?.pageNumber || 1,
      IgnorePaging: isAllRecords || (params?.ignorePaging || false),
      SortColumn: params?.sortColumn ?? '',
      SortType: params?.sortType || 'asc',
      Filter: {
        OldWorkflowOnly: params?.oldWorkflowOnly ?? true
      }
    };
  }

  /**
   * Transform API response data to local component format
   */
  transformApiDataToGroups(apiResponse: GroupsApiResponse): Group[] {
    // Use enhanced client to get records with backward compatibility
    const records = EnhancedApiClient.getRecords(apiResponse);
    
    if (!Array.isArray(records)) {
      return [];
    }

    // Field mapping for transformation (internal field -> API field)
    const fieldMapping = {
      id: 'CategoryId',
      name: 'CategoryName',
      description: 'CategoryDescription',
      status: 'Status',
      studioName: 'StudioName'
    };

    const transformedGroups = ResponseUtils.transformRecords(records, fieldMapping).map((record, index) => {
      return {
        id: record.id,
        name: record.name || '',
        description: record.description || '',
        status: record.status as 'Active' | 'In-Active',
        studioName: record.studioName
      };
    });
    
    return transformedGroups;
  }

  /**
   * Calculate pagination display information
   */
  calculatePaginationInfo(totalRecords: number, currentPage: number, pageSize: PageSize): {
    showingFrom: number;
    showingTo: number;
    totalPages: number;
  } {
    if (pageSize === 'All' || totalRecords === 0) {
      return {
        showingFrom: totalRecords > 0 ? 1 : 0,
        showingTo: totalRecords,
        totalPages: 1
      };
    }

    const numericPageSize = pageSize as number;
    const totalPages = Math.ceil(totalRecords / numericPageSize);
    const showingFrom = totalRecords > 0 ? (currentPage - 1) * numericPageSize + 1 : 0;
    const showingTo = Math.min(currentPage * numericPageSize, totalRecords);

    return {
      showingFrom,
      showingTo,
      totalPages
    };
  }

  /**
   * Add a new group
   * @param groupData - The group data to create
   * @returns Promise with add group response
   */
  async addGroup(groupData: AddGroupRequest): Promise<AddGroupResponse> {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}/groups`;
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(groupData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        message: 'Group created successfully',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create group'
      };
    }
  }

  /**
   * Get a group by ID
   * @param id - The group ID (CategoryId)
   * @returns Promise with group details
   */
  async getGroupById(id: number): Promise<GetGroupApiResponse> {
    
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}/groups/${id}`;
      
      // Use enhanced client for consistent transformation
      const transformedResult = await EnhancedApiClient.fetchWithTransform(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔍 getGroupById: Transformed result:', transformedResult);
      
      // Extract data using enhanced client methods with backward compatibility
      const resultData = EnhancedApiClient.getResponseData(transformedResult);
      
      if (resultData) {
        // The API returns data in a specific structure: { Data: { Records: [...] } }
        return {
          success: true,
          message: 'Group details retrieved successfully',
          data: resultData
        };
      } else {
        return {
          success: false,
          message: 'No group data found'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get group details'
      };
    }
  }

  /**
   * Get mock group data by ID for demonstration
   */
  private getMockGroupById(id: number): GetGroupApiResponse {
    const mockGroups = [
      {
        CategoryId: 1,
        CategoryName: 'Finance Team',
        CategoryDescription: 'Financial operations and accounting team',
        Status: 'Active',
        StudioId: 1,
        StudioName: 'Studio Alpha'
      },
      {
        CategoryId: 2,
        CategoryName: 'Procurement Team', 
        CategoryDescription: 'Vendor management and procurement specialists',
        Status: 'Active',
        StudioId: 2,
        StudioName: 'Studio Beta'
      },
      {
        CategoryId: 3,
        CategoryName: 'IT Administrators',
        CategoryDescription: 'System administrators and IT support',
        Status: 'Active',
        StudioId: 3,
        StudioName: 'Studio Gamma'
      },
      {
        CategoryId: 4,
        CategoryName: 'Audit Team',
        CategoryDescription: 'Internal audit and compliance team',
        Status: 'In-Active',
        StudioId: 4,
        StudioName: 'Studio Delta'
      }
    ];

    const group = mockGroups.find(g => g.CategoryId === id);
    
    if (group) {
      return {
        success: true,
        message: 'Group details retrieved successfully (mock data)',
        data: {
          Records: [group],
          TotalRecords: 1,
          TotalPages: 1,
          PageSize: 1,
          CurrentPage: 1
        }
      };
    } else {
      return {
        success: false,
        message: 'Group not found'
      };
    }
  }

  /**
   * Update a group
   * @param id - The group ID (CategoryId)
   * @param groupData - The group data to update
   * @returns Promise with update group response
   */
  async updateGroup(id: number, groupData: UpdateGroupRequest): Promise<UpdateGroupResponse> {
    
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}/groups/${id}`;
      
      // Use enhanced client for consistent transformation
      const result = await EnhancedApiClient.fetchWithTransform(fullUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupData),
      });
      
      console.log('🔄 updateGroup: Transformed result:', result);
      
      return {
        success: true,
        message: 'Group updated successfully',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update group'
      };
    }
  }

  /**
   * Delete a group
   */
  async deleteGroup(categoryId: number): Promise<{ success: boolean; message: string }> {
    try {
      
      // Use the specific API URL from requirements
      const fullUrl = buildApiUrl(`groups/${categoryId}`);
      
      
      // Try with DELETE method first using enhanced client
      try {
        const result = await EnhancedApiClient.fetchWithTransform(fullUrl, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });
        
        console.log('🗑️ deleteGroup: Delete successful:', result);
        
        return {
          success: true,
          message: 'Group deleted successfully'
        };
      } catch (deleteError: any) {
        // If DELETE is not allowed (405) or fails, try POST as originally specified
        if (deleteError.message?.includes('405') || deleteError.message?.includes('Method Not Allowed')) {
          console.log('🔄 deleteGroup: DELETE not allowed, trying POST method...');
          return await this.deleteGroupWithPost(categoryId);
        } else {
          return {
            success: false,
            message: `Failed to delete group: ${deleteError.message || 'Unknown error'}`
          };
        }
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Network error: Unable to connect to the server. Please check your connection.'
        };
      }
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete group'
      };
    }
  }

  /**
   * Fallback delete method using POST
   */
  private async deleteGroupWithPost(categoryId: number): Promise<{ success: boolean; message: string }> {
    try {
      const fullUrl = buildApiUrl(`groups/${categoryId}`);
      
      
      const result = await EnhancedApiClient.fetchWithTransform(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          CategoryId: categoryId
        })
      });
      
      console.log('🗑️ deleteGroupWithPost: Delete successful:', result);
      
      return {
        success: true,
        message: 'Group deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete group'
      };
    }
  }

  /**
   * Delete multiple groups
   */
  async deleteMultipleGroups(categoryIds: number[]): Promise<{ success: boolean; message: string }> {
    try {
      
      // Use the bulk delete API endpoint
      const fullUrl = buildApiUrl('groups/delete-multiple');
      
      
      const result = await EnhancedApiClient.fetchWithTransform(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(categoryIds)
      });
      
      console.log('🗑️ deleteMultipleGroups: Bulk delete successful:', result);
      
      return {
        success: true,
        message: `Successfully deleted ${categoryIds.length} group${categoryIds.length === 1 ? '' : 's'}`
      };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Network error: Unable to connect to the server. Please check your connection.'
        };
      }
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete groups'
      };
    }
  }

  /**
   * Change status of groups (Active/In-Active)
   * @param categoryIds - Array of category IDs to change status
   * @param status - New status (1 for Active, 0 for In-Active)
   * @returns Promise with status change response
   */
  async changeGroupStatus(categoryIds: number[], status: number): Promise<ChangeStatusResponse> {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}/groups/change-status`;
      
      const requestBody = {
        CategoryIds: categoryIds,
        Status: status
      };
      
      const result = await EnhancedApiClient.fetchWithTransform(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('🔄 changeGroupStatus: Status change successful:', result);
      
      const statusText = status === 1 ? 'activated' : 'deactivated';
      return {
        success: true,
        message: `Successfully ${statusText} ${categoryIds.length} group${categoryIds.length === 1 ? '' : 's'}`
      };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Network error: Unable to connect to the server. Please check your connection.'
        };
      }
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to change group status'
      };
    }
  }

  /**
   * Fetch groups lookup for dropdowns
   */
  async getGroupsLookup(): Promise<import('@/types/groups').GetGroupsLookupResponse> {
    try {
      const data = await EnhancedApiClient.fetchWithTransform(buildApiUrl('lookups/groups'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔍 Groups lookup response:', data);
      return data;
    } catch (error) {
      // Use console.warn to avoid triggering Next.js error overlay in development
      console.warn('Warning: Failed to fetch groups lookup (API may be unavailable):', error);
      return { data: { records: [] } } as any;
    }
  }

  /**
   * Fetch roles lookup for dropdowns
   */
  async getRolesLookup(): Promise<import('@/types/groups').GetRolesLookupResponse> {
    try {
      const data = await EnhancedApiClient.fetchWithTransform(buildApiUrl('lookups/roles'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔍 Roles lookup response:', data);
      return data;
    } catch (error) {
      console.warn('Warning: Failed to fetch roles lookup (API may be unavailable):', error);
      return { data: { records: [] } } as any;
    }
  }

  /**
   * Fetch modules lookup for dropdowns
   */
  async getModulesLookup(): Promise<import('@/types/groups').GetModulesLookupResponse> {
    try {
      const data = await EnhancedApiClient.fetchWithTransform(buildApiUrl('lookups/master-modules'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔍 Modules lookup response:', data);
      return data;
    } catch (error) {
      console.warn('Warning: Failed to fetch modules lookup (API may be unavailable):', error);
      return { data: { records: [] } } as any;
    }
  }

  /**
   * Fetch request types lookup for dropdowns
   */
  async getRequestTypesLookup(): Promise<any> {
    try {
      const data = await EnhancedApiClient.fetchWithTransform(buildApiUrl('lookups/request-types?includeAll=false'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔍 Request types lookup response:', data);
      return data;
    } catch (error) {
      console.warn('Warning: Failed to fetch request types lookup (API may be unavailable):', error);
      return { data: { records: [] } };
    }
  }

  /**
   * Export groups data as file
   */
  async exportGroups(): Promise<Blob> {
    try {
      const requestBody = {
        SearchText: "",
        SearchColumn: "",
        PageSize: 0,
        PageNumber: 0,
        IgnorePaging: false,
        SortColumn: "",
        SortType: "",
        Filter: {
          OldWorkflowOnly: false
        }
      };

      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}/groups/export`;
      
      const response = await fetch(fullUrl, {
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
      console.error('Error exporting groups:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to export groups');
    }
  }
}

// Export singleton instance
export const groupsService = new GroupsService();

// Helper function to get formatted groups for dropdowns
export const getFormattedGroups = async (): Promise<FormattedGroupOption[]> => {
  try {
    const response: any = await groupsService.getGroupsLookup();
    console.log('🔍 getFormattedGroups RAW response:', response);
    console.log('🔍 getFormattedGroups response.data:', response?.data);
    console.log('🔍 getFormattedGroups response.data.records:', response?.data?.records);
    
    // After transformation by EnhancedApiClient.fetchWithTransform, the structure is:
    // { data: { records: [...], currentPage: 1, pageSize: 15, ... }, message: "success", isSuccess: true }
    let items: any[] = [];
    
    // Check for data.records pattern (most likely after transformation)
    if (response?.data?.records && Array.isArray(response.data.records)) {
      items = response.data.records;
      console.log('✅ Found items in response.data.records');
    }
    // Check if response is already an array
    else if (Array.isArray(response)) {
      items = response;
      console.log('✅ Response is direct array');
    }
    // Check for data.items pattern
    else if (response?.data?.items && Array.isArray(response.data.items)) {
      items = response.data.items;
      console.log('✅ Found items in response.data.items');
    }
    // Check direct data property that might be an array
    else if (response?.data && Array.isArray(response.data)) {
      items = response.data;
      console.log('✅ response.data is array');
    }
    // Check for items property directly on response
    else if (response?.items && Array.isArray(response.items)) {
      items = response.items;
      console.log('✅ Found items in response.items');
    }
    // Fallback to PascalCase (backward compatibility)
    else if (response?.Data?.Records && Array.isArray(response.Data.Records)) {
      items = response.Data.Records;
      console.log('✅ Found items in response.Data.Records (PascalCase)');
    }
    else if (response?.Items && Array.isArray(response.Items)) {
      items = response.Items;
      console.log('✅ Found items in response.Items (PascalCase)');
    }
    
    console.log('🔍 getFormattedGroups extracted items:', items);
    console.log('🔍 getFormattedGroups items length:', items.length);
    console.log('🔍 getFormattedGroups first item:', items[0]);
    
    if (!Array.isArray(items) || items.length === 0) {
      console.warn('⚠️ getFormattedGroups: No valid items array found');
      return [];
    }
    
    const mapped = items.map((item: any, index: number) => {
      const formatted = {
        // Try both camelCase and PascalCase for value/id
        id: item?.value || item?.Value || item?.id || item?.Id || item?.categoryId || item?.CategoryId || `group-${index}`,
        // Try both camelCase and PascalCase for text/name
        name: item?.text || item?.Text || item?.name || item?.Name || item?.categoryName || item?.CategoryName || `Group ${index}`
      };
      if (index === 0) {
        console.log(`🔍 Mapping first group:`, { original: item, mapped: formatted });
      }
      return formatted;
    });
    
    console.log('✅ getFormattedGroups final mapped result count:', mapped.length);
    console.log('🔍 getFormattedGroups first mapped item:', mapped[0]);
    return mapped;
  } catch (error) {
    console.warn('⚠️ Warning in getFormattedGroups:', error);
    return [];
  }
};

// Helper function to get formatted roles for dropdowns
export const getFormattedRoles = async (): Promise<FormattedRoleOption[]> => {
  try {
    const response: any = await groupsService.getRolesLookup();
    console.log('🔍 getFormattedRoles RAW response:', response);
    console.log('🔍 getFormattedRoles response.data:', response?.data);
    console.log('🔍 getFormattedRoles response.data.records:', response?.data?.records);
    
    let items: any[] = [];
    
    if (response?.data?.records && Array.isArray(response.data.records)) {
      items = response.data.records;
      console.log('✅ Found items in response.data.records');
    }
    else if (Array.isArray(response)) {
      items = response;
      console.log('✅ Response is direct array');
    }
    else if (response?.data?.items && Array.isArray(response.data.items)) {
      items = response.data.items;
      console.log('✅ Found items in response.data.items');
    }
    else if (response?.data && Array.isArray(response.data)) {
      items = response.data;
      console.log('✅ response.data is array');
    }
    else if (response?.items && Array.isArray(response.items)) {
      items = response.items;
      console.log('✅ Found items in response.items');
    }
    else if (response?.Data?.Records && Array.isArray(response.Data.Records)) {
      items = response.Data.Records;
      console.log('✅ Found items in response.Data.Records (PascalCase)');
    }
    else if (response?.Items && Array.isArray(response.Items)) {
      items = response.Items;
      console.log('✅ Found items in response.Items (PascalCase)');
    }
    
    console.log('🔍 getFormattedRoles extracted items:', items);
    console.log('🔍 getFormattedRoles items length:', items.length);
    console.log('🔍 getFormattedRoles first item:', items[0]);
    
    if (!Array.isArray(items) || items.length === 0) {
      console.warn('⚠️ getFormattedRoles: No valid items array found');
      return [];
    }
    
    const mapped = items.map((item: any, index: number) => {
      const formatted = {
        id: item?.value || item?.Value || item?.id || item?.Id || item?.roleId || item?.RoleId || `role-${index}`,
        name: item?.text || item?.Text || item?.name || item?.Name || item?.roleName || item?.RoleName || `Role ${index}`
      };
      if (index === 0) {
        console.log(`🔍 Mapping first role:`, { original: item, mapped: formatted });
      }
      return formatted;
    });
    
    console.log('✅ getFormattedRoles final mapped result count:', mapped.length);
    console.log('🔍 getFormattedRoles first mapped item:', mapped[0]);
    return mapped;
  } catch (error) {
    console.error('❌ Error in getFormattedRoles:', error);
    return [];
  }
};

// Helper function to get formatted modules for dropdowns
export const getFormattedModules = async (): Promise<FormattedModuleOption[]> => {
  try {
    const response: any = await groupsService.getModulesLookup();
    console.log('🔍 getFormattedModules RAW response:', response);
    console.log('🔍 getFormattedModules response.data:', response?.data);
    console.log('🔍 getFormattedModules response.data.records:', response?.data?.records);
    
    let items: any[] = [];
    
    if (response?.data?.records && Array.isArray(response.data.records)) {
      items = response.data.records;
      console.log('✅ Found items in response.data.records');
    }
    else if (Array.isArray(response)) {
      items = response;
      console.log('✅ Response is direct array');
    }
    else if (response?.data?.items && Array.isArray(response.data.items)) {
      items = response.data.items;
      console.log('✅ Found items in response.data.items');
    }
    else if (response?.data && Array.isArray(response.data)) {
      items = response.data;
      console.log('✅ response.data is array');
    }
    else if (response?.items && Array.isArray(response.items)) {
      items = response.items;
      console.log('✅ Found items in response.items');
    }
    else if (response?.Data?.Records && Array.isArray(response.Data.Records)) {
      items = response.Data.Records;
      console.log('✅ Found items in response.Data.Records (PascalCase)');
    }
    else if (response?.Items && Array.isArray(response.Items)) {
      items = response.Items;
      console.log('✅ Found items in response.Items (PascalCase)');
    }
    
    console.log('🔍 getFormattedModules extracted items:', items);
    console.log('🔍 getFormattedModules items length:', items.length);
    console.log('🔍 getFormattedModules first item:', items[0]);
    
    if (!Array.isArray(items) || items.length === 0) {
      console.warn('⚠️ getFormattedModules: No valid items array found');
      return [];
    }
    
    // Filter only active modules and format them
    const filtered = items.filter((item: any) => {
      // After transformation, Status becomes status
      const status = item?.status || item?.Status;
      return status === 1;
    });
    
    console.log('🔍 getFormattedModules filtered active items:', filtered.length);
    
    const mapped = filtered.map((item: any, index: number) => {
      const formatted = {
        // After transformation, ModuleId becomes moduleId
        id: item?.moduleId || item?.ModuleId || item?.id || item?.Id || 0,
        // After transformation, ModuleName becomes moduleName
        name: item?.moduleName || item?.ModuleName || item?.name || item?.Name || `Module ${index}`
      };
      if (index === 0) {
        console.log(`🔍 Mapping first module:`, { original: item, mapped: formatted });
      }
      return formatted;
    });
    
    console.log('✅ getFormattedModules final mapped result count:', mapped.length);
    console.log('🔍 getFormattedModules first mapped item:', mapped[0]);
    return mapped;
  } catch (error) {
    console.error('❌ Error in getFormattedModules:', error);
    return [];
  }
};

// Helper function to get formatted request types for dropdowns
export const getFormattedRequestTypes = async (): Promise<Array<{ id: number | string; name: string }>> => {
  try {
    const response: any = await groupsService.getRequestTypesLookup();
    console.log('🔍 getFormattedRequestTypes RAW response:', response);
    
    let items: any[] = [];
    
    if (response?.data?.records && Array.isArray(response.data.records)) {
      items = response.data.records;
      console.log('✅ Found items in response.data.records');
    } else if (Array.isArray(response)) {
      items = response;
      console.log('✅ Response is direct array');
    } else if (response?.data?.items && Array.isArray(response.data.items)) {
      items = response.data.items;
      console.log('✅ Found items in response.data.items');
    } else if (response?.data && Array.isArray(response.data)) {
      items = response.data;
      console.log('✅ Found items in response.data');
    } else if (response?.items && Array.isArray(response.items)) {
      items = response.items;
      console.log('✅ Found items in response.items');
    } else if (response?.Records && Array.isArray(response.Records)) {
      items = response.Records;
      console.log('✅ Found items in response.Records');
    }
    
    if (!Array.isArray(items) || items.length === 0) {
      console.warn('⚠️ getFormattedRequestTypes: No valid items array found');
      return [];
    }
    
    const mapped = items.map((item: any, index: number) => {
      const formatted = {
        id: item?.requestTypeId || item?.RequestTypeId || item?.value || item?.Value || item?.id || item?.Id || `type-${index}`,
        name: item?.requestTypeName || item?.RequestTypeName || item?.text || item?.Text || item?.name || item?.Name || `Type ${index}`
      };
      if (index === 0) {
        console.log(`🔍 Mapping first request type:`, { original: item, mapped: formatted });
      }
      return formatted;
    });
    
    console.log('✅ getFormattedRequestTypes final mapped result count:', mapped.length);
    console.log('🔍 getFormattedRequestTypes first mapped item:', mapped[0]);
    return mapped;
  } catch (error) {
    console.warn('⚠️ Warning in getFormattedRequestTypes:', error);
    return [];
  }
};

// Helper function to get role data for conditional dropdowns
export const getRoleData = async () => {
  try {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseURL}/users/role-data`;
    
    const data = await EnhancedApiClient.fetchWithTransform(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('🔍 Role data API response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching role data:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch role data');
  }
};

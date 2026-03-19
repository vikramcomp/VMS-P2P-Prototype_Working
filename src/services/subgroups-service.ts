import { 
  SubgroupsApiResponse,  
  SubgroupsSearchParams,
  AddSubgroupRequest,
  AddSubgroupResponse,
  SubgroupDetailsApiResponse,
  UpdateSubgroupRequest,
  UpdateSubgroupResponse,
  DeleteSubgroupResponse,
  ChangeSubgroupStatusRequest,
  ChangeSubgroupStatusResponse,
  SUBGROUP_STATUSES
} from '@/types/subgroups';
import { authService } from './auth-service';

/**
 * Subgroups API Service
 * Handles all subgroups-related API operations using the VMS API
 */
class SubgroupsService {
  private readonly listEndpoint = '/subgroups/list';
  private readonly addEndpoint = '/subgroups';

  /**
   * Helper method to get authentication headers
   */
  private getAuthHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  /**
   * Build request body for POST list API
   */
  private buildListRequestBody(params: SubgroupsSearchParams): { sortColumn: string; sortType: string } {
    return {
      sortColumn: params.sortBy || '',
      sortType: params.sortDescending ? 'desc' : (params.sortBy ? 'asc' : 'desc'),
    };
  }

  /**
   * Build query string from search parameters (kept for backwards compatibility)
   */
  private buildQueryString(params: SubgroupsSearchParams): string {
    const queryParams = new URLSearchParams();
    if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    if (params.pageSize !== undefined) {
      const pageSize = params.pageSize === 'All' ? 1000 : params.pageSize;
      queryParams.append('pageSize', pageSize.toString());
    }
    if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDescending !== undefined) queryParams.append('sortDescending', params.sortDescending.toString());
    return queryParams.toString();
  }

  /**
   * Normalize a single subgroup record to PascalCase format
   */
  private normalizeSubgroupRecord(record: any): any {
    return {
      SubgroupId: record.SubgroupId || record.subgroupId || record.id,
      SubgroupName: record.SubgroupName || record.subgroupName || record.name,
      SubgroupDescription: record.SubgroupDescription || record.subgroupDescription || record.description,
      Status: record.Status ?? record.status ?? 1
    };
  }

  /**
   * Normalize API response to expected format
   */
  private normalizeApiResponse(apiResponse: any): SubgroupsApiResponse | null {
    const data = apiResponse.Data || apiResponse.data;
    const records = data?.Records || data?.records;
    
    if (!data || !records) {
      return null;
    }

    const normalizedRecords = records.map((record: any) => this.normalizeSubgroupRecord(record));
    
    let isSuccess = true;
    if (apiResponse.IsSuccess !== undefined) {
      isSuccess = apiResponse.IsSuccess;
    } else if (apiResponse.isSuccess !== undefined) {
      isSuccess = apiResponse.isSuccess;
    }
    
    return {
      Data: {
        Records: normalizedRecords,
        TotalRecords: data.TotalRecords || data.totalRecords || normalizedRecords.length,
        TotalPages: data.TotalPages || data.totalPages || 1,
        PageSize: data.PageSize || data.pageSize || normalizedRecords.length,
        CurrentPage: data.CurrentPage || data.currentPage || 1,
        SortColumn: data.SortColumn || data.sortColumn || "",
        SortType: data.SortType || data.sortType || ""
      },
      Message: apiResponse.Message || apiResponse.message || "success",
      IsSuccess: isSuccess
    };
  }

  /**
   * Fetch subgroups using POST request
   * @param params - Search parameters including pagination, sorting, and filtering
   */
  async getSubgroups(params: SubgroupsSearchParams = {}): Promise<SubgroupsApiResponse> {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}${this.listEndpoint}`;
      const requestBody = this.buildListRequestBody(params);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const apiResponse = await response.json();
      
      if (!apiResponse || typeof apiResponse !== 'object') {
        return this.getEmptyResponse(params);
      }
      
      const normalizedResponse = this.normalizeApiResponse(apiResponse);
      
      if (normalizedResponse) {
        return normalizedResponse;
      }
      
      console.warn('API response missing Data.Records or data.records, returning empty response');
      return this.getEmptyResponse(params);
    } catch (error) {
      console.warn('Subgroups API error:', error instanceof Error ? error.message : 'Unknown error');
      return this.getEmptyResponse(params);
    }
  }

  /**
   * Add a new subgroup
   * @param subgroupData - The subgroup data to create
   * @returns Promise with add subgroup response
   */
  async addSubgroup(subgroupData: AddSubgroupRequest): Promise<AddSubgroupResponse> {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}${this.addEndpoint}`;
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(subgroupData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        message: 'Subgroup created successfully',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create subgroup'
      };
    }
  }

  /**
   * Get a specific subgroup by ID
   * @param id - The subgroup ID to fetch
   * @returns Promise with subgroup details response
   */
  async getSubgroupById(id: number): Promise<SubgroupDetailsApiResponse> {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}${this.listEndpoint}/${id}`;
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const apiResponse = await response.json();
      
      if (!apiResponse || typeof apiResponse !== 'object') {
        throw new Error('Invalid API response format');
      }
      
      // Validate API response structure - support both PascalCase and camelCase
      const data = apiResponse.Data || apiResponse.data;
      const records = data?.Records || data?.records;
      
      if (data && records && records.length > 0) {
        // Transform the API response to match expected structure
        const subgroupData = records[0];
        return {
          Data: {
            SubgroupId: subgroupData.SubgroupId || subgroupData.subgroupId || subgroupData.id,
            SubgroupName: subgroupData.SubgroupName || subgroupData.subgroupName || subgroupData.name,
            SubgroupDescription: subgroupData.SubgroupDescription || subgroupData.subgroupDescription || subgroupData.description,
            Status: subgroupData.Status ?? subgroupData.status ?? 1
          },
          Message: apiResponse.Message || apiResponse.message || "success",
          IsSuccess: apiResponse.IsSuccess ?? apiResponse.isSuccess ?? true
        };
      } else if (data && (data.SubgroupId || data.subgroupId)) {
        // Handle direct data structure (fallback for different API versions)
        return {
          Data: {
            SubgroupId: data.SubgroupId || data.subgroupId || data.id,
            SubgroupName: data.SubgroupName || data.subgroupName || data.name,
            SubgroupDescription: data.SubgroupDescription || data.subgroupDescription || data.description,
            Status: data.Status ?? data.status ?? 1
          },
          Message: apiResponse.Message || apiResponse.message || "success",
          IsSuccess: apiResponse.IsSuccess ?? apiResponse.isSuccess ?? true
        };
      } else {
        throw new Error('No subgroup data found');
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing subgroup
   * @param id - The subgroup ID to update
   * @param subgroupData - The updated subgroup data
   * @returns Promise with update subgroup response
   */
  async updateSubgroup(id: number, subgroupData: UpdateSubgroupRequest): Promise<UpdateSubgroupResponse> {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}${this.listEndpoint}/${id}`;
      
      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(subgroupData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        message: 'Subgroup updated successfully',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update subgroup'
      };
    }
  }

  /**
   * Delete a subgroup by ID
   * @param id - The subgroup ID to delete
   * @returns Promise with delete response
   */
  async deleteSubgroup(id: number): Promise<DeleteSubgroupResponse> {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}${this.listEndpoint}/${id}`;
      
      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return {
        success: true,
        message: 'Subgroup deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete subgroup'
      };
    }
  }

  /**
   * Change status of subgroups
   * @param subgroupIds - Array of subgroup IDs to change status
   * @param status - New status (0 = In-Active, 1 = Active)
   * @returns Promise with change status response
   */
  async changeSubgroupStatus(subgroupIds: number[], status: number): Promise<ChangeSubgroupStatusResponse> {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}/subgroups/change-status`;
      
      const requestBody: ChangeSubgroupStatusRequest = {
        SubgroupIds: subgroupIds,
        Status: status
      };
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const statusText = status === 1 ? 'activated' : 'deactivated';
      const subgroupText = subgroupIds.length === 1 ? 'Subgroup' : 'Subgroups';
      
      return {
        success: true,
        message: `${subgroupText} ${statusText} successfully`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to change subgroup status'
      };
    }
  }

  /**
   * Generate empty response when API is unavailable
   */
  private getEmptyResponse(params: SubgroupsSearchParams = {}): SubgroupsApiResponse {
    const pageSize = params.pageSize || 10;
    return {
      Data: {
        Records: [],
        TotalRecords: 0,
        TotalPages: 0,
        CurrentPage: params.pageNumber || 1,
        PageSize: pageSize,
        SortColumn: params.sortColumn || "SubgroupName",
        SortType: params.sortType || "asc"
      },
      Message: "No records found",
      IsSuccess: true
    };
  }

  /**
   * Get status label by value
   */
  getStatusLabel(statusValue: number): string {
    const status = SUBGROUP_STATUSES.find(s => s.value === statusValue);
    return status?.label || 'Unknown';
  }

  /**
   * Get status display with color
   */
  getStatusDisplay(statusValue: number): { label: string; className: string } {
    const label = this.getStatusLabel(statusValue);
    
    switch (statusValue) {
      case 1: // Active
        return {
          label,
          className: 'bg-green-50 text-green-700 border-green-200'
        };
      case 0: // In-Active
        return {
          label,
          className: 'bg-red-50 text-red-700 border-red-200'
        };
      default:
        return {
          label,
          className: 'bg-gray-50 text-gray-700 border-gray-200'
        };
    }
  }

  /**
   * Get subgroups by group ID
   * @param groupId - The group ID to fetch subgroups for
   * @returns Promise with array of subgroups for the specified group
   */
  async getSubgroupsByGroupId(groupId: number): Promise<{ id: number; name: string }[]> {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}/group-subgroup/groups/${groupId}/subgroups`;
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        console.warn(`Failed to fetch subgroups for group ${groupId}: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      
      // Handle different response structures
      let subgroups: any[] = [];
      
      if (Array.isArray(data)) {
        subgroups = data;
      } else if (data?.rows && Array.isArray(data.rows)) {
        subgroups = data.rows;
      } else if (data?.data?.records) {
        subgroups = data.data.records;
      } else if (data?.Data?.Records) {
        subgroups = data.Data.Records;
      } else if (data?.records) {
        subgroups = data.records;
      } else if (data?.Records) {
        subgroups = data.Records;
      }
      
      // Map to consistent format
      return subgroups.map((subgroup: any) => ({
        id: subgroup.subgroup_Id || subgroup.subgroupId || subgroup.SubgroupId || subgroup.id || subgroup.Id,
        name: subgroup.subgroup_Name || subgroup.subgroupName || subgroup.SubgroupName || subgroup.name || subgroup.Name || 'Unnamed Subgroup'
      }));
    } catch (error) {
      console.error('Error fetching subgroups by group ID:', error);
      return [];
    }
  }
}

// Export service instance
export const subgroupsService = new SubgroupsService();
import { 
  ServiceDetailsSearchRequest, 
  ServiceDetailsApiResponse, 
  ServiceDetail, 
  ServiceDetailsSearchParams,
  PageSize,
  AddServiceDetailRequest,
  AddServiceDetailResponse,
  UpdateServiceDetailRequest,
  UpdateServiceDetailResponse,
  GetServiceDetailResponse,
  ServiceDetailRecord
} from '@/types/service-details';
import { authService } from './auth-service';
import { buildApiUrl } from './api-client';

/**
 * Service Details API Service
 * Handles all service-details-related API operations using the specific VMS API structure
 */
class ServiceDetailsService {
  /**
   * Delete service details by IDs
   * @param serviceDetailIds - Array of service detail IDs to delete
   * @returns Promise with delete service detail response
   */
  async deleteServiceDetails(serviceDetailIds: number[]): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      // Use the hardcoded endpoint as requested
      const fullUrl = buildApiUrl('service-details/delete-multiple');
      // Try sending as a raw array
      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(serviceDetailIds),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      const result = await response.json();
      return {
        success: true,
        message: result.message || 'Service detail(s) deleted successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete service detail(s)',
      };
    }
  }
  private readonly listEndpoint = '/service-details/all';
  private readonly addEndpoint = '/service-details';
  private readonly getEndpoint = '/service-details'; // GET /service-details/{id}
  private readonly updateEndpoint = '/service-details'; // PUT /service-details/{id}
  private static callCounter = 0;

  /**
   * Fetch service details using POST request with specific body structure
   */
  async getServiceDetails(params?: ServiceDetailsSearchParams): Promise<ServiceDetailsApiResponse> {
    ServiceDetailsService.callCounter++;
    
    try {
      const requestBody = this.buildRequestBody(params);
      
      // Use direct fetch call
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}${this.listEndpoint}`;
      
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
      
      // Validate VMS API response structure - check both PascalCase and camelCase
      const dataObj = apiResponse.Data || apiResponse.data;
      const records = dataObj?.Records || dataObj?.records;
      
      if (dataObj && records) {
        // Normalize individual records to PascalCase
        const normalizedRecords = records.map((record: any) => ({
          VendorMgrServiceDetailId: record.VendorMgrServiceDetailId || record.vendorMgrServiceDetailId || record.serviceDetailId,
          ServiceDetailName: record.ServiceDetailName || record.serviceDetailName,
          ServiceDetailDescription: record.ServiceDetailDescription || record.serviceDetailDescription,
          CreatedDate: record.CreatedDate || record.createdDate,
          ModifiedDate: record.ModifiedDate || record.modifiedDate,
          IsActive: record.IsActive ?? record.isActive
        }));
        
        // Normalize the response to PascalCase for consistency
        return {
          Data: {
            Records: normalizedRecords,
            TotalRecords: dataObj.TotalRecords || dataObj.totalRecords || 0,
            TotalPages: dataObj.TotalPages || dataObj.totalPages || 1,
            PageSize: dataObj.PageSize || dataObj.pageSize || 10,
            CurrentPage: dataObj.CurrentPage || dataObj.currentPage || 1,
            SortColumn: dataObj.SortColumn || dataObj.sortColumn || '',
            SortType: dataObj.SortType || dataObj.sortType || ''
          },
          Message: apiResponse.Message || apiResponse.message || 'success',
          IsSuccess: apiResponse.IsSuccess ?? apiResponse.isSuccess ?? true
        };
      } else {
        console.warn('API response missing Data.Records, returning empty response');
        return this.getEmptyResponse(params);
      }
    } catch (error) {
      console.warn('Service Details API error:', error instanceof Error ? error.message : 'Unknown error');
      return this.getEmptyResponse(params);
    }
  }

  /**
   * Add a new service detail
   * @param serviceDetailData - The service detail data to create
   * @returns Promise with add service detail response
   */
  async addServiceDetail(serviceDetailData: AddServiceDetailRequest): Promise<AddServiceDetailResponse> {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}${this.addEndpoint}`;
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(serviceDetailData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        message: 'Service detail created successfully',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create service detail'
      };
    }
  }

  /**
   * Get a single service detail by ID
   * @param id - The service detail ID
   * @returns Promise with get service detail response
   */
  async getServiceDetail(id: number): Promise<GetServiceDetailResponse> {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}${this.getEndpoint}/${id}`;
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      
      // Check both PascalCase and camelCase for data property
      const dataObj = result.Data || result.data;
      const records = dataObj?.Records || dataObj?.records;
      
      let serviceDetailRecord: any = null;
      
      // Handle different possible response structures
      if (records && Array.isArray(records) && records.length > 0) {
        // Paginated response - extract first record
        serviceDetailRecord = records[0];
      } else if (dataObj && (dataObj.VendorMgrServiceDetailId || dataObj.vendorMgrServiceDetailId)) {
        // Direct service detail in Data property
        serviceDetailRecord = dataObj;
      } else if (result.VendorMgrServiceDetailId || result.vendorMgrServiceDetailId) {
        // Direct ServiceDetailRecord structure at root level
        serviceDetailRecord = result;
      } else if (Array.isArray(result) && result.length > 0 && (result[0].VendorMgrServiceDetailId || result[0].vendorMgrServiceDetailId)) {
        // Array with single item
        serviceDetailRecord = result[0];
      }
      
      // If we found a record, normalize it to PascalCase
      if (serviceDetailRecord) {
        const normalized = {
          VendorMgrServiceDetailId: serviceDetailRecord.VendorMgrServiceDetailId || serviceDetailRecord.vendorMgrServiceDetailId || serviceDetailRecord.serviceDetailId,
          ServiceDetailName: serviceDetailRecord.ServiceDetailName || serviceDetailRecord.serviceDetailName,
          ServiceDetailDescription: serviceDetailRecord.ServiceDetailDescription || serviceDetailRecord.serviceDetailDescription,
          CreatedDate: serviceDetailRecord.CreatedDate || serviceDetailRecord.createdDate,
          ModifiedDate: serviceDetailRecord.ModifiedDate || serviceDetailRecord.modifiedDate,
          IsActive: serviceDetailRecord.IsActive ?? serviceDetailRecord.isActive
        };
        
        return { Data: normalized };
      }
      
      // If no valid structure found, throw error
      throw new Error('Service detail not found');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing service detail
   * @param id - The service detail ID
   * @param serviceDetailData - The updated service detail data
   * @returns Promise with update service detail response
   */
  async updateServiceDetail(id: number, serviceDetailData: UpdateServiceDetailRequest): Promise<UpdateServiceDetailResponse> {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}${this.updateEndpoint}/${id}`;
      
      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(serviceDetailData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        message: 'Service detail updated successfully',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update service detail'
      };
    }
  }

  /**
   * Build the specific request body structure required by the VMS API
   */
  private buildRequestBody(params?: ServiceDetailsSearchParams): ServiceDetailsSearchRequest {
    // Handle 'All' page size option
    const isAllRecords = params?.pageSize === 'All';
    const pageSize = isAllRecords ? 1000 : (params?.pageSize as number) || 10; // Use large number for 'All'
    
    return {
      SearchTerm: params?.searchTerm || '',
      PageNumber: params?.pageNumber || 1,
      PageSize: pageSize,
      SortBy: params?.sortBy ?? '',
      SortDescending: params?.sortDescending ?? false,
      Filter: params?.filter || {}
    };
  }

  /**
   * Return empty response when API fails
   */
  private getEmptyResponse(params?: ServiceDetailsSearchParams): ServiceDetailsApiResponse {
    const pageSize = params?.pageSize === 'All' ? 1000 : (params?.pageSize as number) || 10;
    return {
      Data: {
        Records: [],
        TotalRecords: 0,
        TotalPages: 0,
        PageSize: pageSize,
        CurrentPage: params?.pageNumber || 1,
        SortColumn: params?.sortBy ?? '',
        SortType: params?.sortDescending ? 'desc' : 'asc'
      },
      Message: 'No records found',
      IsSuccess: true
    };
  }

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
}

// Export singleton instance
export const serviceDetailsService = new ServiceDetailsService();
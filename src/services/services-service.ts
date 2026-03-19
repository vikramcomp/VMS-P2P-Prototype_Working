import { 
  ServicesApiResponse, 
  Service, 
  ServicesListRequest,
  ServicesSearchParams,
  AddServiceRequest,
  UpdateServiceRequest,
  AddServiceResponse
} from '@/types/services';
import { authService } from './auth-service';

/**
 * Services API Service
 * Handles all services-related API operations using the VMS API
 */
class ServicesService {
  private readonly listEndpoint = '/services/all';
  private readonly addEndpoint = '/services';
  private readonly getByIdEndpoint = '/services';
  private readonly updateEndpoint = '/services';
  private readonly deleteEndpoint = '/services/delete-multiple';

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
   * Fetch services using POST request
   * @param params - Search parameters including pagination, sorting, and filtering
   */
  async getServices(params: ServicesSearchParams = {}): Promise<ServicesApiResponse> {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}${this.listEndpoint}`;
      
      // Prepare the POST request body according to API specification
      const requestBody: ServicesListRequest = {
        SearchTerm: params.searchTerm || "",
        PageNumber: params.pageNumber || 1,
        PageSize: params.pageSize === 'All' ? 1000 : (params.pageSize as number) || 10,
        SortBy: params.sortBy || "",
        SortDescending: params.sortDescending || false,
        Filter: params.filter || {}
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
      
      const apiResponse = await response.json();
      
      if (!apiResponse || typeof apiResponse !== 'object') {
        return this.getEmptyResponse(params);
      }
      
      // Validate API response structure - check both PascalCase and camelCase
      const dataObj = apiResponse.Data || apiResponse.data;
      const records = dataObj?.Records || dataObj?.records;
      
      if (dataObj && records) {
        // Normalize the response to PascalCase for consistency
        return {
          Data: {
            Records: records,
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
        console.warn('Unexpected API response structure, returning empty response');
        return this.getEmptyResponse(params);
      }
    } catch (error) {
      console.warn('Services API error:', error instanceof Error ? error.message : 'Unknown error');
      return this.getEmptyResponse(params);
    }
  }

  /**
   * Get a service by ID
   * @param id - The service ID
   * @returns Promise with service data
   */
  async getServiceById(id: number): Promise<{ success: boolean; data?: Service; message?: string }> {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}${this.getByIdEndpoint}/${id}`;
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const apiResponse = await response.json();
      
      // Handle the actual API response structure - check both PascalCase and camelCase
      const dataObj = apiResponse?.Data || apiResponse?.data;
      const records = dataObj?.Records || dataObj?.records;
      
      if (apiResponse && dataObj && records && records.length > 0) {
        const serviceData = records[0]; // Get first record
        return {
          success: true,
          data: serviceData
        };
      } else if (apiResponse && typeof apiResponse === 'object' && 
                 (apiResponse.VendorMgrServiceId || apiResponse.vendorMgrServiceId)) {
        // Handle case where API returns service object directly
        return {
          success: true,
          data: apiResponse
        };
      } else {
        return {
          success: false,
          message: 'No service data found'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch service'
      };
    }
  }

  /**
   * Update an existing service
   * @param id - The service ID
   * @param serviceData - The updated service data
   * @returns Promise with update service response
   */
  async updateService(id: number, serviceData: UpdateServiceRequest): Promise<AddServiceResponse> {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}${this.updateEndpoint}/${id}`;
      
      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(serviceData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        message: 'Service updated successfully',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update service'
      };
    }
  }

  /**
   * Add a new service
   * @param serviceData - The service data to create
   * @returns Promise with add service response
   */
  async addService(serviceData: AddServiceRequest): Promise<AddServiceResponse> {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}${this.addEndpoint}`;
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(serviceData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        message: 'Service created successfully',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create service'
      };
    }
  }

  /**
   * Delete services by IDs
   * @param serviceIds - Array of service IDs to delete
   * @returns Promise with delete service response
   */
  async deleteServices(serviceIds: number[]): Promise<AddServiceResponse> {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${baseURL}${this.deleteEndpoint}`;
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(serviceIds),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        message: 'Service(s) deleted successfully',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete service(s)'
      };
    }
  }

  /**
   * Get mock service by ID for demonstration/fallback purposes
   */
  private getMockServiceById(id: number): { success: boolean; data?: Service; message?: string } {
    const allMockServices = this.getAllMockServices();
    const service = allMockServices.find(s => s.VendorMgrServiceId === id);
    
    if (service) {
      return {
        success: true,
        data: service
      };
    }
    
    return {
      success: false,
      message: 'Service not found'
    };
  }

  /**
   * Return empty response when API fails
   */
  private getEmptyResponse(params: ServicesSearchParams = {}): ServicesApiResponse {
    return {
      Data: {
        Records: [],
        TotalRecords: 0,
        TotalPages: 0,
        PageSize: typeof params.pageSize === 'number' ? params.pageSize : 10,
        CurrentPage: params.pageNumber || 1,
        SortColumn: '',
        SortType: ''
      },
      Message: 'No records found',
      IsSuccess: true
    };
  }
}

// Export service instance
export const servicesService = new ServicesService();
import { apiClient, buildApiUrl, createAuthHeaders } from './api-client';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/utils/error-handler';
import { 
  DivisionMappingResponse, 
  SaveDivisionMappingRequest, 
  SaveDivisionMappingResponse,
  UpdateDivisionMappingRequest,
  UpdateDivisionMappingResponse
} from '@/types/service-mappings';

/**
 * Services Mapping API Service
 * Handles service mapping operations
 */
class ServicesMappingService {
  /**
   * Get division mapping by ID
   * @param divisionMappingId - The ID of the division to get mapping for
   * @returns Promise with mapped and unmapped services
   */
  async getDivisionMapping(divisionMappingId: string): Promise<DivisionMappingResponse> {
    try {
      // Log the request for debugging
      logger.apiRequest('GET', `service-division-mapping/division/${divisionMappingId}`, { divisionMappingId });
      
      // Direct API call using fetch to ensure we have full control over the request
      const url = buildApiUrl(`service-division-mapping/division/${divisionMappingId}`);
      
      logger.debug('API URL constructed', { url });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: createAuthHeaders(),
      });
      
      // Handle API response
      if (!response.ok) {
        await errorHandler.handleAPIResponse(response);
      }
      
      const data = await response.json();
      logger.apiResponse(response.status, `service-division-mapping/division/${divisionMappingId}`, { data });
      
      // Validate data structure - new API returns { mapped: [...], unmapped: [...] }
      if (!data) {
        logger.warn('API response is empty');
      } else if (typeof data !== 'object') {
        logger.warn('API response is not an object', { type: typeof data });
      } else {
        logger.debug('API response structure validated', { 
          keys: Object.keys(data),
          hasMapped: Array.isArray(data.mapped),
          hasUnmapped: Array.isArray(data.unmapped),
          mappedCount: data.mapped?.length || 0,
          unmappedCount: data.unmapped?.length || 0
        });
      }
      
      return data;
    } catch (error) {
      logger.error('Error fetching division mapping', error, { divisionMappingId });
      throw errorHandler.handleError(error, 'Failed to fetch division mapping');
    }
  }

  /**
   * Save division mapping
   * @param divisionMappingId - The ID of the division to save mapping for
   * @param mappedServiceIds - Array of service IDs to be mapped
   * @returns Promise with the response
   */
  async saveDivisionMapping(divisionMappingId: string, mappedServiceIds: string[]): Promise<SaveDivisionMappingResponse> {
    try {
      const requestData = {
        divisionMappingId,
        serviceIds: mappedServiceIds
      };
      
      logger.apiRequest('POST', 'service-details-mapping/save-mapping', requestData);
      
      const response = await fetch(buildApiUrl('service-details-mapping/save-mapping'), {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        await errorHandler.handleAPIResponse(response);
      }
      
      const data = await response.json();
      logger.apiResponse(response.status, 'service-details-mapping/save-mapping', { data });
      
      return data;
    } catch (error) {
      logger.error('Error saving division mapping', error, { divisionMappingId, serviceCount: mappedServiceIds.length });
      throw errorHandler.handleError(error, 'Failed to save division mapping');
    }
  }

  /**
   * Update division mapping with mapped and unmapped service IDs using bulk update API
   * @param divisionId - The ID of the division/group
   * @param mappedServiceIds - Array of service IDs to be mapped
   * @param unmappedServiceIds - Array of service IDs to be unmapped
   * @returns Promise with the response
   */
  async updateDivisionMappingBulk(
    divisionId: string,
    mappedServiceIds: number[],
    unmappedServiceIds: number[]
  ): Promise<UpdateDivisionMappingResponse> {
    try {
      const requestData = {
        mappedServiceIds: mappedServiceIds,
        unMappedServiceIds: unmappedServiceIds
      };
      
      logger.apiRequest('POST', `service-division-mapping/division/${divisionId}/update`, requestData);
      
      const response = await fetch(buildApiUrl(`service-division-mapping/division/${divisionId}/update`), {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Bulk update failed', new Error(errorText), { 
          divisionId, 
          mappedCount: mappedServiceIds.length,
          unmappedCount: unmappedServiceIds.length,
          status: response.status 
        });
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      logger.apiResponse(response.status, `service-division-mapping/division/${divisionId}/update`, { data });
      
      // Handle both camelCase and PascalCase response
      return {
        success: data.success ?? data.Success ?? true,
        message: data.message || data.Message || 'Mappings updated successfully'
      };
    } catch (error) {
      logger.error('Error updating division mapping (bulk)', error, { 
        divisionId, 
        mappedCount: mappedServiceIds.length,
        unmappedCount: unmappedServiceIds.length 
      });
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update service mappings'
      };
    }
  }

  /**
   * @deprecated Use updateDivisionMappingBulk instead
   * Update division mapping with mapped and unmapped service IDs
   * @param divisionMappingId - The ID of the division to update mapping for
   * @param mappedServiceIds - Array of service IDs to be mapped
   * @param unmappedServiceIds - Array of service IDs to be unmapped
   * @returns Promise with the response
   */
  async updateDivisionMapping(
    divisionMappingId: string,
    mappedServiceIds: number[],
    unmappedServiceIds: number[]
  ): Promise<UpdateDivisionMappingResponse> {
    try {
      // Prepare the request body according to the API requirements
      const requestBody: UpdateDivisionMappingRequest = {
        MappedServiceDetailIds: mappedServiceIds,
        UnMappedServiceDetailIds: unmappedServiceIds
      };
      
      logger.apiRequest('POST', `service-details-mapping/division-mapping/${divisionMappingId}/update`, {
        divisionMappingId,
        mappedCount: mappedServiceIds.length,
        unmappedCount: unmappedServiceIds.length
      });
      
      const url = buildApiUrl(`service-details-mapping/division-mapping/${divisionMappingId}/update`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        await errorHandler.handleAPIResponse(response);
      }
      
      const data = await response.json();
      logger.apiResponse(response.status, `service-details-mapping/division-mapping/${divisionMappingId}/update`, { data });
      
      return data;
    } catch (error) {
      logger.error('Error updating division mapping', error, { 
        divisionMappingId,
        mappedCount: mappedServiceIds.length,
        unmappedCount: unmappedServiceIds.length
      });
      throw errorHandler.handleError(error, 'Failed to update division mapping');
    }
  }
}

export const servicesMappingService = new ServicesMappingService();

import { apiClient, buildApiUrl, createAuthHeaders } from './api-client';
import { 
  SubgroupMappingResponse, 
  SaveSubgroupMappingRequest, 
  SaveSubgroupMappingResponse,
  UpdateSubgroupMappingRequest,
  UpdateSubgroupMappingResponse
} from '../types/subgroup-mappings';

/**
 * Subgroups Mapping API Service
 * Handles subgroup mapping operations
 */
class SubgroupsMappingService {
  /**
   * Get subgroup mapping by group ID
   * @param groupId - The ID of the group to get subgroup mapping for
   * @returns Promise with mapped and unmapped subgroups
   */
  async getSubgroupMapping(groupId: string): Promise<SubgroupMappingResponse> {
    try {
      // Direct API call using fetch to ensure we have full control over the request
      const url = buildApiUrl(`group-subgroup-mapping/group/${groupId}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: createAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Save subgroup mapping
   * @param subgroupMappingId - The ID of the subgroup to save mapping for
   * @param mappedSubgroupIds - Array of subgroup IDs to be mapped
   * @returns Promise with the response
   */
  async saveSubgroupMapping(subgroupMappingId: string, mappedSubgroupIds: string[]): Promise<SaveSubgroupMappingResponse> {
    try {
      const response = await fetch(buildApiUrl('subgroup-mapping/save-mapping'), {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify({
          subgroupMappingId,
          subgroupIds: mappedSubgroupIds
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get mapped subgroups for a specific group
   * @param groupId - The ID of the group to get mapped subgroups for
   * @returns Promise with the list of mapped subgroups
   */
  async getMappedSubgroups(groupId: string): Promise<any> {
    try {
      const url = buildApiUrl(`group-subgroup-mapping/group/${groupId}/mapped-subgroups`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: createAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update subgroup mapping with mapped and unmapped subgroup IDs
   * @param groupId - The ID of the group to update subgroup mapping for
   * @param mappedSubgroupIds - Array of subgroup IDs that are mapped
   * @param unmappedSubgroupIds - Array of subgroup IDs that are unmapped
   * @returns Promise with the response
   */
  async updateSubgroupMapping(
    groupId: string,
    mappedSubgroupIds: number[],
    unmappedSubgroupIds: number[]
  ): Promise<UpdateSubgroupMappingResponse> {
    try {
      // Prepare the request body according to the API requirements
      const requestBody: UpdateSubgroupMappingRequest = {
        MappedSubgroupIds: mappedSubgroupIds,
        UnMappedSubgroupIds: unmappedSubgroupIds
      };
      
      const url = buildApiUrl(`group-subgroup-mapping/group/${groupId}/update`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      
      return data;
    } catch (error) {
      throw error;
    }
  }
}

export const subgroupsMappingService = new SubgroupsMappingService();
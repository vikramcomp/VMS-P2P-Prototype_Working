/**
 * Enhanced API Client with Response Transformation
 * 
 * Provides additional utilities and methods for handling transformed API responses
 * across different services while maintaining backward compatibility.
 */

import { apiClient, buildApiUrl, createAuthHeaders } from './api-client';
import { createResponseAccessor, getCompatibleValue } from '@/utils/response-transformer';

/**
 * Enhanced API client wrapper that provides helper methods for common API patterns
 */
export class EnhancedApiClient {
  /**
   * Make a GET request with automatic response transformation
   */
  static async get<T = any>(url: string, params?: any): Promise<T> {
    return await apiClient.get(url, params);
  }

  /**
   * Make a POST request with automatic response transformation
   */
  static async post<T = any>(url: string, data?: any): Promise<T> {
    return await apiClient.post(url, data);
  }

  /**
   * Make a PUT request with automatic response transformation
   */
  static async put<T = any>(url: string, data?: any): Promise<T> {
    return await apiClient.put(url, data);
  }

  /**
   * Make a DELETE request with automatic response transformation
   */
  static async delete<T = any>(url: string): Promise<T> {
    return await apiClient.delete(url);
  }

  /**
   * Fetch data using raw fetch with automatic transformation
   * Useful for services that don't use the axios-based apiClient
   */
  static async fetchWithTransform<T = any>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T> {
    // Merge provided headers with auth headers
    const authHeaders = createAuthHeaders();
    const mergedHeaders = {
      ...authHeaders,
      ...(options.headers as Record<string, string>),
    };
    
    const response = await fetch(url, {
      ...options,
      headers: mergedHeaders,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Apply transformation manually for fetch-based requests
    const { transformApiResponse } = await import('@/utils/response-transformer');
    return transformApiResponse(data, { backwardCompatibility: true });
  }

  /**
   * Create a response accessor for enhanced response handling
   */
  static createAccessor(response: any) {
    return createResponseAccessor(response);
  }

  /**
   * Get a value with backward compatibility (checks both camelCase and PascalCase)
   */
  static getCompatibleValue(obj: any, camelKey: string, pascalKey?: string): any {
    return getCompatibleValue(obj, camelKey, pascalKey);
  }

  /**
   * Check if a response indicates success (handles both naming conventions)
   */
  static isSuccessResponse(response: any): boolean {
    return getCompatibleValue(response, 'isSuccess', 'IsSuccess') === true;
  }

  /**
   * Get response message (handles both naming conventions)
   */
  static getResponseMessage(response: any): string | undefined {
    return getCompatibleValue(response, 'message', 'Message');
  }

  /**
   * Get response data (handles both naming conventions)
   */
  static getResponseData(response: any): any {
    return getCompatibleValue(response, 'data', 'Data');
  }

  /**
   * Get records from response data (handles both naming conventions)
   */
  static getRecords(response: any): any[] {
    const data = this.getResponseData(response);
    return getCompatibleValue(data, 'records', 'Records') || [];
  }

  /**
   * Get total records count from response data
   */
  static getTotalRecords(response: any): number {
    const data = this.getResponseData(response);
    return getCompatibleValue(data, 'totalRecords', 'TotalRecords') || 0;
  }

  /**
   * Get current page from response data
   */
  static getCurrentPage(response: any): number {
    const data = this.getResponseData(response);
    return getCompatibleValue(data, 'currentPage', 'CurrentPage') || 1;
  }

  /**
   * Get page size from response data
   */
  static getPageSize(response: any): number | string {
    const data = this.getResponseData(response);
    return getCompatibleValue(data, 'pageSize', 'PageSize') || 10;
  }

  /**
   * Configure global transformation settings
   */
  static configureTransformation(enabled: boolean, options?: any): void {
    apiClient.setTransformationConfig(enabled, options);
  }
}

/**
 * Utility functions for working with transformed responses
 */
export const ResponseUtils = {
  /**
   * Safely access nested properties with fallback to both naming conventions
   */
  safeGet: (obj: any, camelPath: string, pascalPath?: string): any => {
    if (!obj || typeof obj !== 'object') return undefined;
    
    const getValue = (target: any, path: string) => {
      return path.split('.').reduce((current, key) => {
        return current?.[key];
      }, target);
    };
    
    const camelValue = getValue(obj, camelPath);
    if (camelValue !== undefined) return camelValue;
    
    if (pascalPath) {
      const pascalValue = getValue(obj, pascalPath);
      if (pascalValue !== undefined) return pascalValue;
    }
    
    return undefined;
  },

  /**
   * Transform a single record from API format to internal format
   */
  transformRecord: (record: any, fieldMapping: Record<string, string>): any => {
    if (!record || typeof record !== 'object') return record;
    
    const transformed: any = {};
    
    for (const [internalKey, apiKey] of Object.entries(fieldMapping)) {
      // Try camelCase first, then PascalCase
      const camelApiKey = apiKey.charAt(0).toLowerCase() + apiKey.slice(1);
      const value = getCompatibleValue(record, camelApiKey, apiKey);
      transformed[internalKey] = value;
    }
    
    return transformed;
  },

  /**
   * Transform an array of records
   */
  transformRecords: (records: any[], fieldMapping: Record<string, string>): any[] => {
    if (!Array.isArray(records)) return [];
    return records.map(record => ResponseUtils.transformRecord(record, fieldMapping));
  }
};

export default EnhancedApiClient;
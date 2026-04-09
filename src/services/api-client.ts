import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { transformApiResponse, createResponseAccessor, TransformOptions } from '@/utils/response-transformer';

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

class ApiClient {
  private readonly client: AxiosInstance;
  private transformResponses: boolean = true;
  private transformOptions: TransformOptions = {
    backwardCompatibility: true,
    maxDepth: 10
  };
  private useMockData: boolean = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available (using same key as authService)
        const token = globalThis.window === undefined ? null : localStorage.getItem('vms_auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor with key transformation
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Apply global response transformation if enabled
        if (this.transformResponses && response.data) {
          console.log('Original API Response:', response.data);
          response.data = transformApiResponse(response.data, this.transformOptions);
          console.log('Transformed API Response:', response.data);
        }
        return response;
      },
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          if (globalThis.window === undefined) {
            // Skip client-side operations in SSR
          } else {
            localStorage.removeItem('vms_auth_token');
            // Only redirect if not already on the login page to avoid infinite loops
            if (globalThis.window.location.pathname !== '/login') {
              globalThis.window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Configure response transformation settings
   * @param enabled - Whether to enable response transformation
   * @param options - Transformation options
   */
  setTransformationConfig(enabled: boolean, options?: TransformOptions): void {
    this.transformResponses = enabled;
    if (options) {
      this.transformOptions = { ...this.transformOptions, ...options };
    }
  }

  /**
   * Disable response transformation for specific calls
   * @param url - API endpoint
   * @param params - Request parameters
   * @returns Raw API response without transformation
   */
  async getRaw<T>(url: string, params?: any): Promise<T> {
    try {
      const originalSetting = this.transformResponses;
      this.transformResponses = false;
      const response = await this.client.get(url, { params });
      this.transformResponses = originalSetting;
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a response accessor for enhanced API response handling
   * @param response - The API response
   * @returns Response accessor with helper methods
   */
  createAccessor(response: any) {
    return createResponseAccessor(response, this.transformResponses);
  }

  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(url, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      console.log(`API Client POST request to ${url}`, data);
      const response = await this.client.post(url, data);
      
      // Debug log
      console.log(`API Client POST response from ${url}:`, {
        status: response.status,
        statusText: response.statusText,
        hasData: !!response.data,
        dataType: typeof response.data
      });
      
      if (!response.data) {
        console.warn(`POST ${url} returned empty data`);
        // Return a default successful response instead of empty data
        return {
          data: {} as T,
          success: true,
          message: 'Operation completed successfully but returned no data'
        };
      }
      
      return response.data;
    } catch (error) {
      console.error(`API Client POST error for ${url}:`, error);
      throw this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    console.error('API Client Error:', error);
    
    // Create a detailed error message
    let errorMsg = '';
    
    if (error.response) {
      // Server responded with error status
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      
      errorMsg = `Server error ${error.response.status}: ${
        error.response.data?.message || 
        error.response.statusText || 
        'Unknown error'
      }`;
    } else if (error.request) {
      // Request was made but no response received
      console.error('Error request:', error.request);
      errorMsg = 'Network error: No response received from server';
    } else {
      // Something else happened
      errorMsg = error.message || 'An unexpected error occurred';
    }
    
    console.error('API Client Error Message:', errorMsg);
    return new Error(errorMsg);
  }
}

export const apiClient = new ApiClient();

// Utility function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  // Remove trailing slashes from base URL and leading slashes from endpoint
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  return `${cleanBaseUrl}/${cleanEndpoint}`;
};

/**
 * Auth token key - must match authService.TOKEN_KEY
 */
const AUTH_TOKEN_KEY = 'vms_auth_token';

/**
 * Get the authentication token from storage
 * @returns The auth token or null if not available
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Create headers object with authentication token included
 * Use this helper for any direct fetch calls that need auth
 * @param additionalHeaders - Optional additional headers to merge
 * @returns Headers object with auth token and common headers
 */
export const createAuthHeaders = (additionalHeaders?: Record<string, string>): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...additionalHeaders,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Authenticated fetch wrapper that automatically adds auth token to requests
 * Drop-in replacement for native fetch with automatic authentication
 * @param url - The URL to fetch
 * @param options - Fetch options (same as native fetch)
 * @returns Promise<Response> - Same as native fetch
 */
export const authFetch = async (
  url: string | URL | Request,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  
  // Merge headers with auth token
  const headers = new Headers(options.headers);
  
  // Set default content type if not provided
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Set accept header if not provided
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  
  // Add auth token if available
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Handle 401 unauthorized - redirect to login
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      // Only redirect if not already on the login page to avoid infinite loops
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }
  
  return response;
};
import { buildApiUrl, createAuthHeaders, getAuthToken } from './api-client';
import type { GetAllVendorsRequest, GetAllVendorsResponse, ChangeVendorStatusRequest, ChangeVendorStatusResponse } from '@/types/vendors';

export const vendorsService = {
  async getAllVendors(request: GetAllVendorsRequest): Promise<GetAllVendorsResponse> {
    const response = await fetch(buildApiUrl('vendors/GetAllVendors'), {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async exportVendors(request: GetAllVendorsRequest): Promise<Blob> {
    const response = await fetch(buildApiUrl('vendors/export'), {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  },

  async changeVendorStatus(request: ChangeVendorStatusRequest): Promise<ChangeVendorStatusResponse> {
    const response = await fetch(buildApiUrl('vendors/change-status'), {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async createVendor(vendorData: any): Promise<any> {
    const token = getAuthToken();
    
    // Convert vendorData to FormData
    const formData = new FormData();
    
    Object.keys(vendorData).forEach((key) => {
      const value = vendorData[key];
      
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          // For arrays, append each item with the same key
          value.forEach((item) => {
            formData.append(key, item.toString());
          });
        } else if (value instanceof File) {
          // For file uploads
          formData.append(key, value);
        } else {
          // For primitive values
          formData.append(key, value.toString());
        }
      }
    });

    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData - browser will set it with boundary automatically

    const response = await fetch(buildApiUrl('vendors'), {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async getVendorById(vendorId: number): Promise<any> {
    const response = await fetch(buildApiUrl(`vendors/${vendorId}`), {
      method: 'GET',
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async updateVendor(vendorId: number, vendorData: any): Promise<any> {
    const token = getAuthToken();
    
    // Convert vendorData to FormData (matching createVendor pattern exactly)
    const formData = new FormData();
    
    Object.keys(vendorData).forEach((key) => {
      const value = vendorData[key];
      
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          // For arrays, append each item with the same key (matching createVendor)
          value.forEach((item) => {
            formData.append(key, item.toString());
          });
        } else if (value instanceof File) {
          // For file uploads
          formData.append(key, value);
        } else {
          // For primitive values
          formData.append(key, value.toString());
        }
      }
    });

    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData - browser will set it with boundary automatically

    const response = await fetch(buildApiUrl('vendors'), {
      method: 'PUT',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData?.message || errorData?.Message) {
        throw new Error(errorData.message || errorData.Message);
      }
      const errorText = await response.text().catch(() => '');
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

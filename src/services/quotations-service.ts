import { buildApiUrl, createAuthHeaders, getAuthToken } from './api-client';
import type { GetQuotationsRequest, GetQuotationsResponse } from '@/types/quotations';

export const quotationsService = {
  async getQuotations(request: GetQuotationsRequest): Promise<GetQuotationsResponse> {
    const response = await fetch(buildApiUrl('quotations/list'), {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async exportQuotations(request: GetQuotationsRequest): Promise<Blob> {
    const response = await fetch(buildApiUrl('requests/export'), {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  },

  async changeQuotationStatus(quotationIds: number[], status: number): Promise<any> {
    const response = await fetch(buildApiUrl('requests/change-status'), {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify({ requestIds: quotationIds, status }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async getQuotationContext(requestId: string | number): Promise<any> {
    const response = await fetch(buildApiUrl(`quotations/${requestId}/context`), {
      method: 'GET',
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async getPaymentModes(): Promise<any> {
    const response = await fetch(buildApiUrl('quotations/payment-modes'), {
      method: 'GET',
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async getBillingTypes(): Promise<any> {
    const response = await fetch(buildApiUrl('quotations/billing-types'), {
      method: 'GET',
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async getSpecificationMasters(serviceDetailId: string | number): Promise<any> {
    const response = await fetch(buildApiUrl(`quotations/specification-masters?serviceDetailId=${serviceDetailId}`), {
      method: 'GET',
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async addSpecifications(requestId: string | number, data: any): Promise<any> {
    const response = await fetch(buildApiUrl(`quotations/${requestId}/add-specifications`), {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async submitQuotation(requestId: string | number, formData: FormData): Promise<any> {
    const token = getAuthToken();
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(buildApiUrl(`quotations/${requestId}/submit`), {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      // Try to parse error message from response body
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          // Handle specific error messages
          if (errorData.message === 'WORKFLOW_NOT_EXIST_MESSAGE') {
            errorMessage = 'Workflow not configured for this request. Please contact the administrator.';
          } else {
            errorMessage = errorData.message;
          }
        }
      } catch {
        // If parsing fails, use the default error message
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async getEligibleVendors(serviceDetailId: string | number, paymentMode: string): Promise<any> {
    const params = new URLSearchParams();
    params.append('serviceDetailId', serviceDetailId.toString());
    if (paymentMode) {
      params.append('paymentMode', paymentMode);
    }

    const response = await fetch(buildApiUrl(`quotations/eligible-vendors?${params.toString()}`), {
      method: 'GET',
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async getPOForecast(request: { 
    dateFrom: string; 
    dateTo: string; 
    requestOrPONo: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<any> {
    const requestBody = {
      dateFrom: request.dateFrom,
      dateTo: request.dateTo,
      requestOrPONo: request.requestOrPONo,
      pageNumber: request.pageNumber || 1,
      pageSize: request.pageSize || 10,
    };

    const response = await fetch(buildApiUrl('quotations/po-forecast'), {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async exportPOForecast(request: { 
    dateFrom: string; 
    dateTo: string; 
    requestOrPONo: string;
  }): Promise<Blob> {
    const requestBody = {
      dateFrom: request.dateFrom,
      dateTo: request.dateTo,
      requestOrPONo: request.requestOrPONo,
    };

    const response = await fetch(buildApiUrl('quotations/po-forecast/export'), {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  },

  async rejectQuotation(requestId: string | number, rejectReason: string): Promise<any> {
    const response = await fetch(buildApiUrl(`quotations/${requestId}/reject`), {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify({ rejectReason }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

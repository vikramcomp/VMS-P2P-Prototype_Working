import { buildApiUrl, createAuthHeaders } from './api-client';
import type { GetApprovalsRequest, GetApprovalsResponse } from '@/types/approvals';

export const approvalsService = {
  async getApprovals(request: GetApprovalsRequest): Promise<GetApprovalsResponse> {
    const response = await fetch(buildApiUrl('approvals/list'), {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async exportApprovals(request: GetApprovalsRequest): Promise<Blob> {
    const response = await fetch(buildApiUrl('approvals/export'), {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  },

  async changeRequestStatus(requestIds: number[], status: number): Promise<any> {
    const response = await fetch(buildApiUrl('requests/change-status'), {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify({ requestIds, status }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async getApprovalContext(requestId: number): Promise<any> {
    const response = await fetch(buildApiUrl(`approvals/${requestId}/context`), {
      method: 'GET',
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async getPoApproval(requestId: number): Promise<any> {
    const response = await fetch(buildApiUrl(`approvals/${requestId}/po-approval`), {
      method: 'GET',
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};


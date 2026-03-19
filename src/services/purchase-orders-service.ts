import { buildApiUrl, createAuthHeaders, getAuthToken } from './api-client';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/utils/error-handler';

export interface POType {
  poTypeId: number;
  poTypeName: string;
}

export interface Template {
  templateId: number;
  templateName: string;
}

export interface POContext {
  requestId: string;
  requestGroup: string;
  subgroupName: string;
  projectProposalDisplay: string;
  requestName: string;
  requestDescription: string;
  approvedQuotationAmount: number;
  purchaseOrderId?: string | number;
  isSettled?: boolean;
  discount?: number;
  paymentTerms?: Array<{ term: string }>;
  notes?: Array<{ text: string }>;
  taxes?: Array<{ label: string; value: number }>;
  invoicePlan?: Array<{ invoiceDate: string; amount: number }>;
  budgetAllocations?: Array<{ divisionId: number; subgroupId: number; amount: number }>;
  quotationSpecifications?: Array<{
    specificationId: number;
    specificationName: string;
    fieldType: string;
    vendorCells: Array<{
      vendorId?: number;
      vendorName?: string;
      textValue?: string;
      value?: string;
      fileUrl?: string;
    }>;
  }>;
}

/**
 * Purchase Orders API Service
 */

/**
 * Fetch PO types list
 */
export const getPOTypes = async (): Promise<POType[]> => {
  try {
    logger.info('Fetching PO types');

    const url = buildApiUrl('purchase-orders/po-types');
    logger.info('Fetching from URL:', { url });

    const response = await fetch(url, {
      method: 'GET',
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('PO types API error', { status: response.status, errorText, url });
      throw new Error(`Failed to fetch PO types: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logger.info('PO types fetched successfully', { data });

    // Handle different response structures
    let rawData: any[] = [];
    
    if (Array.isArray(data)) {
      rawData = data;
    } else if (data.data && Array.isArray(data.data)) {
      rawData = data.data;
    } else if (data.Data && Array.isArray(data.Data)) {
      rawData = data.Data;
    } else {
      logger.warn('Unexpected PO types response structure', { data });
      rawData = [];
    }

    // Map API response fields to interface fields
    const poTypes: POType[] = rawData.map((item: any) => ({
      poTypeId: item.id,
      poTypeName: item.name,
    }));

    return poTypes;
  } catch (error) {
    logger.error('Error fetching PO types', error);
    throw errorHandler.handleError(error);
  }
};

/**
 * Fetch templates list
 */
export const getTemplates = async (): Promise<Template[]> => {
  try {
    logger.info('Fetching templates');

    const url = buildApiUrl('purchase-orders/templates');
    logger.info('Fetching from URL:', { url });

    const response = await fetch(url, {
      method: 'GET',
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Templates API error', { status: response.status, errorText, url });
      throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logger.info('Templates fetched successfully', { data });

    // Handle different response structures
    let rawData: any[] = [];
    
    if (Array.isArray(data)) {
      rawData = data;
    } else if (data.data && Array.isArray(data.data)) {
      rawData = data.data;
    } else if (data.Data && Array.isArray(data.Data)) {
      rawData = data.Data;
    } else {
      logger.warn('Unexpected templates response structure', { data });
      rawData = [];
    }

    // Map API response fields to interface fields
    const templates: Template[] = rawData.map((item: any) => ({
      templateId: item.id,
      templateName: item.name,
    }));

    return templates;
  } catch (error) {
    logger.error('Error fetching templates', error);
    throw errorHandler.handleError(error);
  }
};

/**
 * Fetch PO context by requestId
 */
export const getPOContext = async (requestId: string | number): Promise<POContext> => {
  try {
    logger.info('Fetching PO context', { requestId });

    const url = buildApiUrl(`purchase-orders/${requestId}/context`);
    logger.info('Fetching from URL:', { url });

    const response = await fetch(url, {
      method: 'GET',
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('PO context API error', { status: response.status, errorText, url });
      throw new Error(`Failed to fetch PO context: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logger.info('PO context fetched successfully', { data });

    // Handle different response structures
    const contextData = data.data || data.Data || data;

    const poContext: POContext = {
      requestId: contextData.requestId || '',
      requestGroup: contextData.requestGroup || '',
      subgroupName: contextData.subgroupName || '',
      projectProposalDisplay: contextData.projectProposalDisplay || '',
      requestName: contextData.requestName || '',
      requestDescription: contextData.requestDescription || '',
      approvedQuotationAmount: contextData.approvedQuotationAmount || 0,
      purchaseOrderId: contextData.purchaseOrderId,
      isSettled: contextData.isSettled,
      discount: contextData.discount,
      paymentTerms: contextData.paymentTerms || [],
      notes: contextData.notes || [],
      taxes: contextData.taxes || [],
      invoicePlan: contextData.invoicePlan || [],
      budgetAllocations: contextData.budgetAllocations || [],
      quotationSpecifications: contextData.quotationSpecifications || contextData.specifications || [],
      requestNumber: contextData.requestNumber || contextData.requestId || '',
      purchaseOrderNumber: contextData.purchaseOrderNumber || contextData.poNumber || '',
      paymentTermNumeric: contextData.paymentTermNumeric || "",
      poTypeName: contextData.poTypeName || "",
      companyTemplateTypeName: contextData.companyTemplateTypeName || "",
      poType: contextData.poType || "",
    };

    return poContext;
  } catch (error) {
    logger.error('Error fetching PO context', error);
    throw errorHandler.handleError(error);
  }
};

/**
 * Generate PO number for a request
 */
export const generatePONumber = async (requestId: string | number): Promise<string> => {
  try {
    logger.info('Generating PO number', { requestId });

    const url = buildApiUrl(`purchase-orders/${requestId}/generate-number`);
    logger.info('Calling PO number generation API:', { url });

    const response = await fetch(url, {
      method: 'POST',
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('PO number generation API error', { status: response.status, errorText, url });
      throw new Error(`Failed to generate PO number: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logger.info('PO number generated successfully', { data });

    // Extract PO number from response (handle different response structures)
    const poNumber = data.poNumber || data.PONumber || data.data?.poNumber || data.data?.PONumber || data.number || data.Number || '';
    
    if (!poNumber) {
      logger.warn('No PO number in API response', { data });
      throw new Error('PO number not found in API response');
    }

    return poNumber;
  } catch (error) {
    logger.error('Error generating PO number', error);
    throw errorHandler.handleError(error);
  }
};

export const purchaseOrdersService = {
  getPOTypes,
  getTemplates,
  getPOContext,
  generatePONumber,

  async getPODistribution(requestId: string | number): Promise<any> {
    try {
      logger.info('Fetching PO distribution for requestId:', requestId);

      const response = await fetch(buildApiUrl(`purchase-orders/${requestId}/distribution`), {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      // Handle 404 gracefully - distribution data may not exist yet
      if (response.status === 404) {
        logger.info('PO distribution not found (404) - data may not be created yet');
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logger.info('PO distribution received:', data);
      return data;
    } catch (error) {
      // Only log and throw if it's not a 404
      logger.error('Error fetching PO distribution', error);
      throw errorHandler.handleError(error);
    }
  },

  /**
   * Get PO PDF for printing
   */
  async getPOPdf(purchaseOrderId: number | string): Promise<Blob> {
    try {
      logger.info('Fetching PO PDF', { purchaseOrderId });

      const token = getAuthToken();
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(buildApiUrl(`purchase-orders/${purchaseOrderId}/pdf`), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.blob();
    } catch (error) {
      logger.error('Error fetching PO PDF', error);
      throw errorHandler.handleError(error);
    }
  },
};

import { apiClient, buildApiUrl, createAuthHeaders } from './api-client';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/utils/error-handler';

/**
 * Workflow API Service
 * Handles workflow-related API operations
 */

export interface WorkflowListRequest {
  SearchText: string;
  SearchColumn: string;
  PageSize: number;
  PageNumber: number;
  IgnorePaging: boolean;
  SortColumn: string;
  SortType: string;
  Filter: {
    OldWorkflowOnly: boolean;
  };
}

export interface WorkflowItem {
  WorkflowId: number;
  CategoryName: string;
  ServiceName: string;
  RoleName: string;
  VendorManager: string;
  PaymentLocation: string;
  ComparisionFactor: string;
  QuoteValue: string;
  Approver1: string;
  Approver2: string;
  Approver3: string;
  Approver4: string;
  FinanceHead: string;
  CreatedOn: string;
  Status: number;
  POGenerator: string;
  POVerifier: string;
  PODespatcher: string;
  PriceLabel: string;
  PriceName: string;
  StatusName: string;
}

export interface WorkflowApiResponse {
  Data: {
    Records: WorkflowItem[];
    TotalRecords: number;
    TotalPages: number;
    PageSize: number;
    CurrentPage: number;
    SortColumn: string;
    SortType: string;
  };
  Message: string;
  IsSuccess: boolean;
}

export interface WorkflowListResponse {
  items: FormattedWorkflowItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  success: boolean;
  message: string;
}

export interface WorkflowExportRequest {
  SearchText: string;
  SearchColumn: string;
  PageSize: number;
  PageNumber: number;
  IgnorePaging: boolean;
  SortColumn: string;
  SortType: string;
  Filter: {
    OldWorkflowOnly: boolean;
  };
}

export interface WorkflowStatusChangeRequest {
  WorkflowIds: number[];
  Status: number; // 1 = Active, 0 = Inactive
}

export interface WorkflowStatusChangeResponse {
  Message: string;
  IsSuccess: boolean;
}

// Formatted version for UI consumption
export interface FormattedWorkflowItem {
  id: number;
  purchasingGroup: string;
  serviceName: string;
  requester: string;
  quotationProvider: string;
  paymentMode: string;
  paymentLocationQuoteValue: string;
  approver1: string;
  approver2: string;
  approver3: string;
  approver4: string;
  approveStatus: string;
  financeHead: string;
  poGenerator: string;
  poVerification: string;
  poDispatch: string;
  status: string;
  function: string;
}

// Helper function to safely get values with multiple possible field names
function getValueSafely(obj: any, possibleKeys: string[], defaultValue: any): any {
  if (!obj || typeof obj !== 'object') return defaultValue;
  
  for (const key of possibleKeys) {
    if (obj[key] !== undefined && obj[key] !== null) {
      return obj[key];
    }
  }
  
  return defaultValue;
}

// Helper function to format approvers
function formatApprovers(item: any): string {
  if (!item) return '';
  
  const approvers = [
    item.Approver1, item.Approver2, item.Approver3, item.Approver4,
    item.approver1, item.approver2, item.approver3, item.approver4
  ].filter(approver => approver && typeof approver === 'string' && approver.trim() !== '' && approver.trim() !== ' ');
  
  return approvers.length > 0 ? approvers.join(', ') : (item.approveStatus || '');
}

// Helper function to create a default error item
function createErrorItem(): FormattedWorkflowItem {
  return {
    id: 0,
    purchasingGroup: 'Error',
    serviceName: 'Error mapping data',
    requester: '',
    quotationProvider: '',
    paymentMode: '',
    paymentLocationQuoteValue: '',
    approver1: '',
    approver2: '',
    approver3: '',
    approver4: '',
    approveStatus: '',
    financeHead: '',
    poGenerator: '',
    poVerification: '',
    poDispatch: '',
    status: '',
    function: ''
  };
}

// Helper function to extract records from various response structures
function extractRecordsFromResponse(responseData: any, pageSize: number, page: number) {
  let records: any[] = [];
  let totalRecords = 0;
  let totalPages = 1;
  let currentPage = page;
  let isSuccess = true;
  let message = 'success';

  const dataObj = responseData?.Data || responseData?.data;
  const recordsArray = dataObj?.Records || dataObj?.records;

  if (responseData && dataObj && recordsArray && Array.isArray(recordsArray)) {
    records = recordsArray;
    totalRecords = dataObj.TotalRecords || dataObj.totalRecords || records.length;
    totalPages = dataObj.TotalPages || dataObj.totalPages || Math.ceil(totalRecords / pageSize);
    currentPage = dataObj.CurrentPage || dataObj.currentPage || page;
    isSuccess = (responseData.IsSuccess || responseData.isSuccess) !== false;
    message = responseData.Message || responseData.message || 'success';
    logger.info('Records found in Data.Records structure', { recordCount: records.length, totalRecords, totalPages, currentPage });
  } else if (responseData && (Array.isArray(responseData.Records) || Array.isArray(responseData.records))) {
    records = responseData.Records || responseData.records;
    totalRecords = responseData.TotalRecords || responseData.totalRecords || records.length;
    totalPages = responseData.TotalPages || responseData.totalPages || Math.ceil(totalRecords / pageSize);
    currentPage = responseData.CurrentPage || responseData.currentPage || page;
    isSuccess = (responseData.IsSuccess || responseData.isSuccess) !== false;
    message = responseData.Message || responseData.message || 'success';
    logger.info('Records found in direct Records structure', { recordCount: records.length, totalRecords, totalPages, currentPage });
  } else if (responseData && Array.isArray(responseData.Items)) {
    records = responseData.Items;
    totalRecords = responseData.TotalRecords || records.length;
    totalPages = responseData.TotalPages || Math.ceil(totalRecords / pageSize);
    currentPage = responseData.CurrentPage || page;
    isSuccess = responseData.IsSuccess !== false;
    message = responseData.Message || 'success';
    logger.info('Records found in Items structure', { recordCount: records.length });
  } else if (responseData?.Data && Array.isArray(responseData.Data)) {
    records = responseData.Data;
    totalRecords = records.length;
    totalPages = Math.ceil(totalRecords / pageSize);
    isSuccess = responseData.IsSuccess !== false;
    message = responseData.Message || 'success';
    logger.info('Records found in Data array structure', { recordCount: records.length });
  } else if (Array.isArray(responseData)) {
    records = responseData;
    totalRecords = records.length;
    totalPages = Math.ceil(totalRecords / pageSize);
    logger.info('Records found in direct array structure', { recordCount: records.length });
  } else {
    const extracted = extractRecordsFromNestedStructure(responseData);
    records = extracted.records;
    totalRecords = extracted.records.length;
    totalPages = Math.ceil(totalRecords / pageSize);
  }

  return { records, totalRecords, totalPages, currentPage, isSuccess, message };
}

// Helper function to extract records from nested structures
function extractRecordsFromNestedStructure(responseData: any): { records: any[] } {
  if (!responseData || typeof responseData !== 'object') {
    logger.warn('Returning empty records array as fallback');
    return { records: [] };
  }

  const possibleArrays = Object.values(responseData).filter(val => Array.isArray(val));
  if (possibleArrays.length > 0) {
    const records = possibleArrays.reduce((a, b) => a.length > b.length ? a : b, []);
    logger.info('Using largest array found in response', { recordCount: records.length });
    return { records };
  }

  const nestedObjects = Object.values(responseData).filter(val => typeof val === 'object' && val !== null && !Array.isArray(val));
  for (const obj of nestedObjects) {
    const nestedArrays = Object.values(obj as object).filter(val => Array.isArray(val));
    if (nestedArrays.length > 0) {
      const records = nestedArrays.reduce((a, b) => a.length > b.length ? a : b, []);
      logger.info('Records found in nested object array', { recordCount: records.length });
      return { records };
    }
  }

  logger.warn('No arrays found in response', { responseData });
  return { records: [] };
}

// Helper function to format workflow status
function formatWorkflowStatus(item: any): string {
  const rawStatus = getValueSafely(item, ['StatusName', 'statusName', 'status', 'Status'], '');
  logger.debug('Processing workflow status', {
    workflowId: getValueSafely(item, ['WorkflowId', 'workflowId', 'id'], 0),
    rawStatus,
    statusType: typeof rawStatus
  });

  if (rawStatus === 1 || rawStatus === '1') {
    return 'Active';
  } else if (rawStatus === 0 || rawStatus === '0') {
    return 'Inactive';
  }

  if (typeof rawStatus === 'string') {
    const status = rawStatus.trim();
    if (status.toLowerCase() === 'active' || status.toLowerCase() === 'enabled') {
      return 'Active';
    } else if (status.toLowerCase() === 'inactive' || status.toLowerCase() === 'disabled') {
      return 'Inactive';
    }
    return status;
  }

  logger.warn('Using fallback status for unknown value', { rawStatus });
  return rawStatus || 'Unknown';
}

// Helper function to map a single workflow item
function mapWorkflowItem(item: any): FormattedWorkflowItem {
  try {
    if (!item) return createErrorItem();

    if (item && typeof item === 'object') {
      logger.debug('Sample record fields', {
        sampleFields: Object.keys(item).slice(0, 5)
      });
    }

    const paymentLocation = getValueSafely(item, ['PaymentLocation', 'paymentLocation'], '');
    const quoteValue = getValueSafely(item, ['QuoteValue', 'quoteValue'], '');
    const paymentLocationQuoteValue = [paymentLocation, quoteValue]
      .filter(val => val && val.trim() !== '')
      .join(' + ');

    return {
      id: getValueSafely(item, ['WorkflowId', 'workflowId', 'id'], 0),
      purchasingGroup: getValueSafely(item, ['groupName', 'GroupName', 'CategoryName', 'categoryName', 'purchasingGroup'], ''),
      serviceName: getValueSafely(item, ['ServiceName', 'serviceName'], ''),
      requester: getValueSafely(item, ['RoleName', 'roleName', 'requester'], ''),
      quotationProvider: getValueSafely(item, ['VendorManager', 'vendorManager', 'quotationProvider'], ''),
      paymentMode: getValueSafely(item, ['PriceName', 'priceName', 'paymentMode'], ''),
      paymentLocationQuoteValue,
      approver1: getValueSafely(item, ['Approver1', 'approver1'], ''),
      approver2: getValueSafely(item, ['Approver2', 'approver2'], ''),
      approver3: getValueSafely(item, ['Approver3', 'approver3'], ''),
      approver4: getValueSafely(item, ['Approver4', 'approver4'], ''),
      approveStatus: formatApprovers(item),
      financeHead: getValueSafely(item, ['FinanceHead', 'financeHead'], ''),
      poGenerator: getValueSafely(item, ['POGenerator', 'poGenerator'], ''),
      poVerification: getValueSafely(item, ['POVerifier', 'poVerifier', 'poVerification'], ''),
      poDispatch: getValueSafely(item, ['PODespatcher', 'poDespatcher', 'poDispatch'], ''),
      status: formatWorkflowStatus(item),
      function: ''
    };
  } catch (mapError) {
    logger.error('Error mapping workflow item', mapError, { item });
    return createErrorItem();
  }
}

/**
 * Fetch workflow list with POST method
 * @param oldWorkflowOnly - Flag to determine if fetching old workflows
 * @param page - Page number to fetch (defaults to 1)
 * @param pageSize - Number of items per page (defaults to 10)
 * @param sortColumn - Column to sort by (defaults to 'serviceName')
 * @param sortType - Sort direction (defaults to 'asc')
 * @param searchText - Search term to filter workflows (defaults to '')
 * @param searchColumn - Column to search in (defaults to '')
 * @returns Promise<WorkflowListResponse> - Returns items, pagination info and status
 */
export async function getWorkflowList(
  oldWorkflowOnly: boolean = false,
  page: number = 1,
  pageSize: number = 10,
  sortColumn: string = '',
  sortType: 'asc' | 'desc' | '' = '',
  searchText: string = '',
  searchColumn: string = ''
): Promise<WorkflowListResponse> {
  try {
    logger.apiRequest('POST', '/workflow-editor/list', {
      oldWorkflowOnly,
      page,
      pageSize,
      sortColumn,
      sortType,
      searchText
    });
    
    // Prepare the request payload according to the API specification
    const requestPayload: WorkflowListRequest = {
      SearchText: searchText,
      SearchColumn: searchColumn,
      PageSize: pageSize,
      PageNumber: page,
      IgnorePaging: false,
      SortColumn: sortColumn,
      SortType: sortType,
      Filter: {
        OldWorkflowOnly: oldWorkflowOnly
      }
    };
    
    logger.debug('Workflow request payload prepared', { requestPayload });
    
    // apiClient.post already returns ApiResponse<T> type which is the processed response.data
    const response = await apiClient.post('/workflow-editor/list', requestPayload);

    logger.debug('API Response received', { responseType: typeof response });
    
    // Check if response exists
    if (!response) {
      logger.error('Empty response object from workflow API');
      throw new Error('Empty response object from API');
    }
    
    logger.debug('API Response preview', { 
      responsePreview: JSON.stringify(response).substring(0, 200) 
    });
    
    // The response IS the data since apiClient already processes it
    const responseData = response as any;
    
    // Try to find records using various potential paths in the response
    logger.debug('Response structure validation', {
      hasResponseData: !!responseData,
      hasData: !!responseData?.Data,
      hasRecords: !!responseData?.Data?.Records,
      recordsIsArray: !!(responseData?.Data?.Records && Array.isArray(responseData.Data.Records))
    });
    
    // Extract records and metadata using helper function
    const { records, totalRecords, totalPages, currentPage, isSuccess, message } = 
      extractRecordsFromResponse(responseData, pageSize, page);

    // Map records to UI format using helper function
    const formattedItems: FormattedWorkflowItem[] = records.map(mapWorkflowItem);
    
    // Even if no records were found, return a successful response with empty items array
    logger.info('Workflow fetch completed', {
      itemCount: formattedItems.length,
      totalRecords,
      totalPages,
      currentPage,
      success: isSuccess
    });
    
    return {
      items: formattedItems || [],
      totalCount: totalRecords,
      totalPages: totalPages,
      currentPage: currentPage,
      pageSize: pageSize,
      success: true, // Always return success: true unless there's a specific API error
      message: message
    };
  } catch (error) {
    logger.error('Workflow service error', error, {
      oldWorkflowOnly,
      page,
      pageSize,
      sortColumn,
      sortType,
      searchText
    });
    
    // Re-throw with message for UI display
    if (error instanceof Error) {
      throw error; // Keep the original error with its stack trace
    } else {
      throw new Error('Failed to fetch workflow list: Unknown error');
    }
  }
}

/**
 * Export workflows data
 */
export async function exportWorkflows(request: WorkflowExportRequest): Promise<Blob> {
  try {
    logger.info('Starting workflow export', { request });

    const response = await fetch(buildApiUrl('workflow-editor/export'), {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(request),
    });

    logger.debug('Export response received', { 
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    logger.info('Workflow export completed', { blobSize: blob.size });

    return blob;
  } catch (error) {
    logger.error('Workflow export failed', error, { request });
    throw errorHandler.handleError(error, 'Failed to export workflows');
  }
}

/**
 * Get workflow by ID
 * @param id - Workflow ID to fetch
 * @returns Promise with workflow details
 */
export async function getWorkflowById(id: number): Promise<any> {
  try {
    logger.apiRequest('GET', `/workflow-editor/${id}`, { id });
    
    const response = await apiClient.get(`/workflow-editor/${id}`);
    
    logger.info('Workflow fetched successfully', { id, response });
    
    // Return the workflow data
    if (response && typeof response === 'object') {
      const responseData = (response as any).data || response;
      return responseData;
    }
    
    return response;
  } catch (error) {
    logger.error('Error fetching workflow by ID', { id, error });
    throw error instanceof Error ? error : new Error('Failed to fetch workflow');
  }
}

/**
 * Update workflow
 * @param id - Workflow ID to update
 * @param workflowData - Updated workflow data
 * @returns Promise with update response
 */
export async function updateWorkflow(id: number, workflowData: any): Promise<any> {
  try {
    logger.apiRequest('POST', `/workflow-editor/${id}`, workflowData);
    
    const response = await apiClient.post(`/workflow-editor/${id}`, workflowData);
    
    logger.info('Workflow updated successfully', { id, response });
    
    return response;
  } catch (error) {
    logger.error('Error updating workflow', { id, error });
    throw error instanceof Error ? error : new Error('Failed to update workflow');
  }
}

/**
 * Change workflow status (Activate/Deactivate)
 * @param workflowIds - Array of workflow IDs to change status
 * @param status - Status to set (1 = Active, 0 = Inactive)
 * @returns Promise<WorkflowStatusChangeResponse> - Returns success status and message
 */
export async function changeWorkflowStatus(
  workflowIds: number[],
  status: number
): Promise<WorkflowStatusChangeResponse> {
  try {
    console.log(`===== WORKFLOW STATUS CHANGE SERVICE =====`);
    console.log(`Changing status for workflows: ${workflowIds.join(', ')} to status: ${status}`);
    
    const request: WorkflowStatusChangeRequest = {
      WorkflowIds: workflowIds,
      Status: status
    };
    
    console.log('Status change request:', JSON.stringify(request, null, 2));
    
    const response = await apiClient.post('/workflow-editor/change-status', request);
    
    console.log('Status change response:', response);
    console.log('===== END WORKFLOW STATUS CHANGE SERVICE =====');
    
    // Handle the response based on the API structure
    if (response && typeof response === 'object') {
      const responseData: any = (response as any).data || response;
      return {
        Message: responseData.Message || responseData.message || (response as any).message || 'Status changed successfully',
        IsSuccess: responseData.IsSuccess !== false || (response as any).success !== false
      };
    }
    
    // Fallback for successful response
    return {
      Message: 'Status changed successfully',
      IsSuccess: true
    };
  } catch (error) {
    console.error('===== WORKFLOW STATUS CHANGE ERROR =====');
    if (error instanceof Error) {
      console.error(`Error changing workflow status: ${error.message}`);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Unknown error changing workflow status:', error);
    }
    console.error('===== END WORKFLOW STATUS CHANGE ERROR =====');
    
    throw error instanceof Error ? error : new Error('Failed to change workflow status: Unknown error');
  }
}

import { apiClient, buildApiUrl, createAuthHeaders } from './api-client';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/utils/error-handler';
import type { Invoice, InvoicesApiResponse, InvoicesRequest, InvoiceExportRequest, InvoiceDetails, InvoiceContext, PaymentDetails } from '@/types/invoices';

/**
 * Invoice API Service
 */

/**
 * Fetch invoices list with pagination and filters
 */
export const getInvoicesList = async (
  request?: InvoicesRequest
): Promise<{
  items: Invoice[];
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}> => {
  try {
    logger.info('Fetching invoices list', { request });

    // Build URL - if no request params, call API without query string
    let url = buildApiUrl('invoices');
    
    if (request) {
      const params: string[] = [];
      
      // Only add non-empty parameters
      if (request.SearchText) params.push(`SearchText=${encodeURIComponent(request.SearchText)}`);
      if (request.SearchColumn) params.push(`SearchColumn=${encodeURIComponent(request.SearchColumn)}`);
      if (request.PageSize) params.push(`PageSize=${request.PageSize.toString()}`);
      if (request.PageNumber) params.push(`PageNumber=${request.PageNumber.toString()}`);
      if (request.IgnorePaging !== undefined) params.push(`IgnorePaging=${request.IgnorePaging.toString()}`);
      if (request.SortColumn) params.push(`SortColumn=${encodeURIComponent(request.SortColumn)}`);
      if (request.SortType) params.push(`SortType=${encodeURIComponent(request.SortType)}`);
      
      // Add filter parameters if they exist
      if ((request as any).DateFrom) params.push(`DateFrom=${encodeURIComponent((request as any).DateFrom)}`);
      if ((request as any).DateTo) params.push(`DateTo=${encodeURIComponent((request as any).DateTo)}`);
      // PONumber: encode but preserve forward slashes
      if ((request as any).PONumber) {
        const poValue = encodeURIComponent((request as any).PONumber).replace(/%2F/g, '/');
        params.push(`PONumber=${poValue}`);
      }
      if ((request as any).Status) params.push(`Status=${encodeURIComponent((request as any).Status)}`);
      if ((request as any).GroupId) params.push(`GroupId=${(request as any).GroupId.toString()}`);
      
      if (params.length > 0) {
        url = `${buildApiUrl('invoices')}?${params.join('&')}`;
      }
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Invoice API error', { status: response.status, errorText });
      throw new Error(`Failed to fetch invoices: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logger.info('Invoices API response received', { 
      data,
      isArray: Array.isArray(data),
      keys: typeof data === 'object' ? Object.keys(data) : 'not an object',
      dataType: typeof data
    });

    // Handle different response structures
    let records = [];
    let totalRecords = 0;
    let currentPage = 1;
    let pageSize = 10;
    let totalPages = 1;

    // Check for direct array response
    if (Array.isArray(data)) {
      console.log('Response is direct array, length:', data.length);
      records = data;
      totalRecords = data.length;
    }
    // Check for nested data structures (case-insensitive)
    else if (data && typeof data === 'object') {
      console.log('Response is object, checking for nested arrays...');
      // Try different response structure variations
      records = data.Data?.Records || data.data?.records || data.records || data.Records || 
                data.items || data.Items || [];
      
      console.log('Records found:', records.length, 'First record:', records[0]);
      
      totalRecords = data.Data?.TotalRecords || data.data?.totalRecords || 
                    data.totalRecords || data.TotalRecords || 
                    data.grossAmount || data.total || records.length;
      currentPage = data.Data?.CurrentPage || data.data?.currentPage || 
                   data.currentPage || data.CurrentPage || data.page || 1;
      pageSize = data.Data?.PageSize || data.data?.pageSize || 
                data.pageSize || data.PageSize || data.limit || 10;
      totalPages = data.Data?.TotalPages || data.data?.totalPages || 
                  data.totalPages || data.TotalPages || data.pages || 
                  Math.ceil(totalRecords / pageSize);
    }

    console.log('Parsed metadata:', { totalRecords, currentPage, pageSize, totalPages, recordsCount: records.length });

    // Map API response to Invoice type with all possible field name variations
    const items: Invoice[] = records.map((record: any) => {
      const mappedInvoice = {
        requestId: record.requestId || record.RequestId || record.id || 0,
        purchaseOrderId: record.purchaseOrderId || record.PurchaseOrderId || record.poId || record.POId || 
                        record.purchaseOrder_Id || record.purchase_order_id || record.po_Id || 
                        record.requestId || record.RequestId || 0,
        poNumber: record.poNumber || record.PONumber || record.ponumber || '',
        requestNumber: record.requestNumber || record.RequestNumber || record.requestnumber || '',
        requestName: record.requestName || record.RequestName || '',
        poStatus: record.poStatus || record.POStatus || '',
        poPaymentStatus: record.poPaymentStatus || record.POPaymentStatus || 0,
        invoiceNumber: record.invoiceNumber || record.InvoiceNumber || record.invoice_Bill_No || record.invoiceBillNo || '',
        advancePaymentNumber: record.advancePaymentNumber || record.AdvancePaymentNumber || record.invoiceBillAdPaymentId || '',
        invoiceDate: record.invoiceDate || record.InvoiceDate || record.invoicedate || '',
        currentInvoiceAmount: record.currentInvoiceAmount || record.CurrentInvoiceAmount || record.invoiceAmount || 0,
        projectProposalId: record.projectProposalId || record.ProjectProposalId || record.pantherProjectProposalId || '',
        currentAgingDays: record.currentAgingDays || record.CurrentAgingDays || record.currentInvoiceAging || record.CurrentInvoiceAging || 0,
        totalAgeing: record.totalAgingDays || record.TotalAgingDays || record.totalAgeing || record.TotalAgeing || record.totalAging || record.TotalAging || record.totalDays || 0,
        paymentRequest: record.paymentRequest || record.PaymentRequest || '',
      };
      
      console.log('Mapped invoice record:', {
        original: record,
        mapped: mappedInvoice,
        allKeys: Object.keys(record)
      });
      
      return mappedInvoice;
    });

    logger.info('Invoices parsed successfully', { 
      count: items.length, 
      totalRecords,
      currentPage,
      pageSize,
      totalPages
    });

    return {
      items,
      totalRecords,
      currentPage,
      pageSize,
      totalPages,
    };
  } catch (error) {
    logger.error('Error fetching invoices', { error });
    throw errorHandler.handleError(error);
  }
};

/**
 * Export invoices to Excel
 */
export const exportInvoices = async (
  request: InvoiceExportRequest
): Promise<Blob> => {
  try {
    logger.info('Exporting invoices', { request });

    // Build query parameters
    const params: string[] = [];
    if (request.SearchText) params.push(`SearchText=${encodeURIComponent(request.SearchText)}`);
    if (request.SearchColumn) params.push(`SearchColumn=${encodeURIComponent(request.SearchColumn)}`);
    if (request.PageSize !== undefined) params.push(`PageSize=${request.PageSize.toString()}`);
    if (request.PageNumber !== undefined) params.push(`PageNumber=${request.PageNumber.toString()}`);
    if (request.IgnorePaging !== undefined) params.push(`IgnorePaging=${request.IgnorePaging.toString()}`);
    if ((request as any).ExportAll !== undefined) params.push(`ExportAll=${(request as any).ExportAll.toString()}`);
    if (request.SortColumn) params.push(`SortColumn=${encodeURIComponent(request.SortColumn)}`);
    if (request.SortType) params.push(`SortType=${encodeURIComponent(request.SortType)}`);
    
    // Add filter parameters if they exist
    if ((request as any).DateFrom) params.push(`DateFrom=${encodeURIComponent((request as any).DateFrom)}`);
    if ((request as any).DateTo) params.push(`DateTo=${encodeURIComponent((request as any).DateTo)}`);
    // PONumber: encode but preserve forward slashes
    if ((request as any).PONumber) {
      const poValue = encodeURIComponent((request as any).PONumber).replace(/%2F/g, '/');
      params.push(`PONumber=${poValue}`);
    }
    if ((request as any).Status) params.push(`Status=${encodeURIComponent((request as any).Status)}`);
    if ((request as any).GroupId) params.push(`GroupId=${(request as any).GroupId.toString()}`);

    const url = params.length > 0
      ? `${buildApiUrl('invoices/export')}?${params.join('&')}`
      : buildApiUrl('invoices/export');

    const response = await fetch(url, {
      method: 'GET',
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.text();
        if (errorData) {
          errorMessage += ` - ${errorData}`;
        }
      } catch (e) {
        // Ignore if can't parse error response
      }
      throw new Error(errorMessage);
    }

    const blob = await response.blob();
    logger.info('Invoices export completed');

    return blob;
  } catch (error) {
    logger.error('Error exporting invoices', error);
    throw errorHandler.handleError(error);
  }
};

/**
 * Get invoice details by request ID
 */
export const getInvoiceDetails = async (
  requestId: number
): Promise<InvoiceDetails> => {
  try {
    logger.info('Fetching invoice details', { requestId });

    const response = await fetch(buildApiUrl(`invoices/details?requestId=${requestId}`), {
      method: 'GET',
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    logger.info('Invoice details fetched successfully', { data });

    // Handle different response structures and flatten nested objects
    let rawDetails = data.data || data.Data || data;
    
    // Flatten the nested structure
    const details: InvoiceDetails = {
      // PO Details
      poNumber: rawDetails.poDetails?.poNumber || rawDetails.poNumber,
      poDate: rawDetails.poDetails?.poDate || rawDetails.poDate,
      poType: rawDetails.poDetails?.poType || rawDetails.poType,
      poAmount: rawDetails.poDetails?.poAmount || rawDetails.poAmount,
      poCreatedBy: rawDetails.poDetails?.poCreatedBy || rawDetails.poCreatedBy,
      poApprovedBy: rawDetails.poDetails?.poApprovedBy || rawDetails.poApprovedBy,
      dateSubmitted: rawDetails.quotationDetails?.dateSubmitted || rawDetails.dateSubmitted,
      
      // Quotation Details
      vendorManager: rawDetails.quotationDetails?.vendorManager || rawDetails.vendorManager,
      status: rawDetails.quotationDetails?.status || rawDetails.status,
      approvedVendor: rawDetails.quotationDetails?.approvedVendor || rawDetails.approvedVendor,
      approvedVendorEmail: rawDetails.quotationDetails?.approvedVendorEmail || rawDetails.approvedVendorEmail,
      approvedVendorMobile: rawDetails.quotationDetails?.approvedVendorMobile || rawDetails.approvedVendorMobile,
      contactPerson: rawDetails.quotationDetails?.contactPerson || rawDetails.contactPerson,
      approvedQuotationAmount: rawDetails.quotationDetails?.approvedQuotationAmount || rawDetails.approvedQuotationAmount,
      
      // Request Approval Details
      approver1: rawDetails.requestApprovalDetails?.approver1?.name || rawDetails.approver1?.name || rawDetails.requestApprovalDetails?.name || rawDetails.approverName || '',
      comments: rawDetails.requestApprovalDetails?.approver1?.comments || rawDetails.requestApprovalDetails?.comments || rawDetails.comments || '',
      
      // Request Details
      requestNumber: rawDetails.requestDetails?.requestNumber || rawDetails.requestNumber,
      requestType: rawDetails.requestDetails?.requestType || rawDetails.requestType,
      requestGroup: rawDetails.requestDetails?.requestGroup || rawDetails.requestGroup,
      subgroup: rawDetails.requestDetails?.subgroup || rawDetails.subgroup,
      projectProposal: (rawDetails.requestDetails?.projectProposal === -1 || rawDetails.requestDetails?.projectProposal === '-1' || rawDetails.projectProposal === -1 || rawDetails.projectProposal === '-1') ? '--' : (rawDetails.requestDetails?.projectProposal || rawDetails.projectProposal),
      request: rawDetails.requestDetails?.request || rawDetails.request,
      description: rawDetails.requestDetails?.description || rawDetails.description,
      requestDate: rawDetails.requestDetails?.requestDate || rawDetails.requestDate,
      requesterName: rawDetails.requestDetails?.requesterName || rawDetails.requesterName,
      service: rawDetails.requestDetails?.service || rawDetails.service,
      serviceDetails: rawDetails.requestDetails?.serviceDetails || rawDetails.serviceDetails,
    };

    return details;
  } catch (error) {
    logger.error('Error fetching invoice details', error);
    throw errorHandler.handleError(error);
  }
};

/**
 * Get invoice context by purchase order ID
 */
export const getInvoiceContext = async (
  purchaseOrderId: number | string
): Promise<InvoiceContext> => {
  try {
    logger.info('Fetching invoice context', { purchaseOrderId });

    const url = buildApiUrl(`purchase-orders/${purchaseOrderId}/invoices/context`);
    logger.info('Fetching from URL:', { url, purchaseOrderId });

    const response = await fetch(url, {
      method: 'GET',
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Invoice context API error', { status: response.status, errorText, url, purchaseOrderId });
      throw new Error(`Failed to fetch invoice context: ${response.status} ${response.statusText}. PO ID: ${purchaseOrderId}`);
    }

    const data = await response.json();
    logger.info('Invoice context fetched successfully', { data });

    // Handle different response structures
    const contextData = data.data || data.Data || data;
    
    const context: InvoiceContext = {
      poNumber: contextData.poNumber,
      ipwPrlusNumber: contextData.ipwPrlusNumber,
      poAmount: contextData.poAmount,
      submittedAmount: contextData.submittedAmount,
      projectProposalId: contextData.projectProposalId,
      poBalance: contextData.poBalance,
      advanceAdjBalance: contextData.advanceAdjBalance,
      poType: contextData.poType,
      poTypeName: contextData.poTypeName || contextData.PoTypeName,
      rateBasedPoMaxValue: contextData.rateBasedPoMaxValue,
      validityStartDate: contextData.validityStartDate,
      validityEndDate: contextData.validityEndDate,
      plannedInvoiceListing: contextData.plannedInvoiceListing || [],
      // Map 'invoices' from API to 'actualInvoicesAdvancePaymentsListing'
      actualInvoicesAdvancePaymentsListing: contextData.invoices || contextData.actualInvoicesAdvancePaymentsListing || [],
    };

    return context;
  } catch (error) {
    logger.error('Error fetching invoice context', error);
    throw errorHandler.handleError(error);
  }
};

/**
 * Change invoice status (Open/Closed)
 */
export const changeInvoiceStatus = async (
  purchaseOrderIds: number[],
  targetStatus: number // 2 = Open, 5 = Closed
): Promise<void> => {
  try {
    logger.info('Changing invoice status', { purchaseOrderIds, targetStatus });

    const response = await fetch(buildApiUrl('invoices/status'), {
      method: 'PUT',
      headers: createAuthHeaders(),
      body: JSON.stringify({
        purchaseOrderIds,
        targetStatus,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Invoice status change API error', { status: response.status, errorText });
      throw new Error(`Failed to change invoice status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logger.info('Invoice status changed successfully', { data });
  } catch (error) {
    logger.error('Error changing invoice status', error);
    throw errorHandler.handleError(error);
  }
};

/**
 * Get payment details by invoiceBillAdvPaymentId
 */
export const getPaymentDetails = async (
  invoiceBillAdvPaymentId: number
): Promise<PaymentDetails> => {
  try {
    logger.info('Fetching payment details', { invoiceBillAdvPaymentId });

    const url = buildApiUrl(`payments/context/${invoiceBillAdvPaymentId}`);
    logger.info('Fetching payment from URL:', { url, invoiceBillAdvPaymentId });

    const response = await fetch(url, {
      method: 'GET',
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Payment details API error', { status: response.status, errorText, url, invoiceBillAdvPaymentId });
      throw new Error(`Failed to fetch payment details: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logger.info('Payment details fetched successfully', { data });

    // Handle different response structures
    // Check if data is wrapped or direct
    const rawData = data.data || data.Data || data;
    
    // Get payments array from the response - it could be nested under 'payments' property
    const paymentsArray = rawData.payments || rawData.Payments || (Array.isArray(rawData) ? rawData : []);
    
    const details: PaymentDetails = {
      invoiceNumber: rawData.invoiceNumber || rawData.InvoiceNumber || rawData.invoiceBillNo || rawData.InvoiceBillNo,
      invoiceAmount: rawData.invoiceAmount || rawData.InvoiceAmount || rawData.amount || rawData.Amount,
      invoiceLabel: rawData.invoiceLabel || rawData.InvoiceLabel || 'Invoice #:',
      date: rawData.invoiceDate || rawData.InvoiceDate || rawData.date || rawData.Date,
      amountPaid: rawData.amountPaid || rawData.AmountPaid || rawData.amount || rawData.Amount,
      currency: rawData.currency || rawData.Currency || 'USD',
      payments: paymentsArray.map((payment: any) => ({
        paymentMode: payment.paymentModeName || payment.PaymentModeName || payment.paymentMode || payment.PaymentMode || '',
        checkNoTransactionId: payment.reference || payment.Reference || payment.checkNo || payment.CheckNo || '',
        paidAmount: payment.amount || payment.Amount || payment.paidAmount || payment.PaidAmount || 0,
        checkPaymentDate: payment.paymentDate || payment.PaymentDate || payment.checkPaymentDate || payment.CheckPaymentDate || '',
        document: payment.fileOriginalName || payment.FileOriginalName || payment.document || payment.Document || '',
        comments: payment.comments || payment.Comments || '',
        status: payment.statusName || payment.StatusName || payment.status || payment.Status || '',
      })),
    };

    return details;
  } catch (error) {
    logger.error('Error fetching payment details', error);
    throw errorHandler.handleError(error);
  }
};

export const invoicesService = {
  getInvoicesList,
  exportInvoices,
  getInvoiceDetails,
  getInvoiceContext,
  changeInvoiceStatus,
  getPaymentDetails,
};
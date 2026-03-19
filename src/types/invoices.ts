/**
 * Invoice Type Definitions
 */

export interface Invoice {
  requestId: number;
  purchaseOrderId?: number;
  poNumber: string;
  requestNumber: string;
  requestName: string;
  poStatus: string;
  poPaymentStatus: number;
  invoiceNumber: string;
  advancePaymentNumber: string;
  invoiceDate: string;
  currentInvoiceAmount: number;
  projectProposalId: string;
  currentAgingDays: number;
  totalAgeing: number;
  paymentRequest: string;
}

export interface InvoicesApiResponse {
  Data?: {
    Records?: Invoice[];
    TotalRecords?: number;
    CurrentPage?: number;
    PageSize?: number;
    TotalPages?: number;
  };
  data?: {
    records?: Invoice[];
    totalRecords?: number;
    currentPage?: number;
    pageSize?: number;
    totalPages?: number;
  };
  IsSuccess?: boolean;
  isSuccess?: boolean;
  Message?: string;
  message?: string;
}

export interface InvoicesRequest {
  SearchText: string;
  SearchColumn: string;
  PageSize: number;
  PageNumber: number;
  IgnorePaging: boolean;
  SortColumn: string;
  SortType: string;
}

export interface InvoiceExportRequest {
  SearchText: string;
  SearchColumn: string;
  PageSize: number;
  PageNumber: number;
  IgnorePaging: boolean;
  SortColumn: string;
  SortType: string;
}

export interface InvoiceDetails {
  // PO Details
  poNumber?: string;
  poDate?: string;
  poType?: string;
  poAmount?: number;
  poCreatedBy?: string;
  poApprovedBy?: string;
  dateSubmitted?: string;
  
  // Quotation Details
  vendorManager?: string;
  status?: string;
  approvedVendor?: string;
  approvedVendorEmail?: string;
  approvedVendorMobile?: string;
  contactPerson?: string;
  approvedQuotationAmount?: number;
  
  // Request Approval Details
  approver1?: string;
  comments?: string;
  
  // Request Details
  requestNumber?: string;
  requestType?: string;
  requestGroup?: string;
  subgroup?: string;
  projectProposal?: string;
  request?: string;
  description?: string;
  requestDate?: string;
  requesterName?: string;
  service?: string;
  serviceDetails?: string;
}

export interface InvoiceContext {
  poNumber?: string;
  ipwPrlusNumber?: string;
  poAmount?: number;
  submittedAmount?: number;
  projectProposalId?: string;
  poBalance?: number;
  advanceAdjBalance?: number;
  poType?: string;
  poTypeName?: string;
  rateBasedPoMaxValue?: number;
  validityStartDate?: string;
  validityEndDate?: string;
  plannedInvoiceListing?: PlannedInvoice[];
  actualInvoicesAdvancePaymentsListing?: ActualInvoiceAdvancePayment[];
}

export interface PlannedInvoice {
  invoiceMilestoneId?: number;
  milestoneName?: string;
  amount?: number;
  currency?: string;
  invoicePercent?: number;
  taxAmount?: number;
  netAmount?: number;
}

export interface ActualInvoiceAdvancePayment {
  invoiceBillAdvPaymentId?: number;
  invoiceBillNo?: string;
  itemTypeName?: string;
  currency?: string;
  netAmount?: number;
  advanceAdjustedAmount?: number;
  tin?: string;
  SubmittedDate?: string;
  fileOriginalName?: string;
  fileStoredName?: string;
  statusName?: string;
  reason?: string;
  paymentId?: number;
}

export interface PaymentDetails {
  invoiceNumber?: string;
  invoiceAmount?: number;
  invoiceLabel?: string;
  date?: string;
  amountPaid?: number;
  currency?: string;
  payments?: Payment[];
}

export interface Payment {
  paymentMode?: string;
  checkNoTransactionId?: string;
  paidAmount?: number;
  checkPaymentDate?: string;
  document?: string;
  comments?: string;
  status?: string;
}

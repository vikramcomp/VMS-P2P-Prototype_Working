// Quotation types
export interface Quotation {
  id?: number;
  quotationNo: string;
  requestNumber?: string;
  requestName?: string;
  requestType?: string;
  requestDescription?: string;
  groupId?: string;
  subgroup_Name?: string;
  pantherProjectProposalId?: string;
  requestNotes?: string;
  requestStatus?: string;
  totalAgeing?: number;
  showCreatePOButton?: boolean;
  showViewQuoteButton?: boolean;
  showViewPOButton?: boolean;
  showEditButton?: boolean;
  showPrintPOButton?: boolean;
  canEditPO?: boolean;
  // Additional fields for edit functionality
  requestGroup?: string;
  subgroup?: string;
  projectProposal?: string;
  service?: string;
  serviceDetails?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  advanceReceived?: string;
  paymentMode?: string;
  poDescription?: string;
}

export interface GetQuotationsRequest {
  searchText: string;
  searchColumn: string;
  pageSize: number;
  pageNumber: number;
  ignorePaging: boolean;
  sortColumn: string;
  sortType: string;
  filter: {
    groupId: number;
    requestTypeId: number;
    subgroupId: number;
    statusId: number;
    quotationNo?: string;
  };
}

export interface GetQuotationsResponse {
  data?: {
    records?: Quotation[];
    totalRecords?: number;
    currentPage?: number;
    totalPages?: number;
    pageSize?: number;
  };
  records?: Quotation[];
  totalRecords?: number;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  message?: string;
  success?: boolean;
}

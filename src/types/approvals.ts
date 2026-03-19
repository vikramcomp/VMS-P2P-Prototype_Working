// Approval types
export interface Approval {
  requestNumber: string;
  requestName: string;
  requestType: string;
  requestDescription: string;
  groupId: string;
  subgroup_Name: string;
  pantherProjectProposalId: string;
  requestNotes: string;
  requestStatus: string;
  totalAgeing: number;
}

export interface ApprovalFilter {
  groupId: number;
  requestTypeId: number;  // API only accepts single value
  requestStatus: number;
  subgroupId: number;
}

export interface GetApprovalsRequest {
  searchText: string;
  searchColumn: string;
  pageSize: number;
  pageNumber: number;
  ignorePaging: boolean;
  sortColumn: string;
  sortType: string;
  filter: ApprovalFilter;
}

export interface GetApprovalsResponse {
  records: Approval[];
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  message?: string;
}

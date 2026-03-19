// Vendor types
export interface Vendor {
  vendorId?: number;
  VendorId?: number;
  vendorName?: string;
  VendorName?: string;
  vendorCode?: string;
  VendorCode?: string;
  paymentCycle?: string;
  PaymentCycle?: string;
  address?: string;
  Address?: string;
  servicesOffered?: string;
  ServicesOffered?: string;
  status?: string;
  Status?: string;
  // Add other fields as per API response
}

export interface VendorFilter {
  criteria: string;
  value: string;
  vendorTypeId: number;
}

export interface GetAllVendorsRequest {
  searchText: string;
  searchColumn: string;
  pageSize: number;
  pageNumber: number;
  ignorePaging: boolean;
  sortColumn: string;
  sortType: string;
  filter: VendorFilter;
}

export interface GetAllVendorsResponse {
  data: {
    records: Vendor[];
    totalRecords: number;
  };
  message: string;
  isSuccess: boolean;
}

export interface ChangeVendorStatusRequest {
  vendorIds: number[];
  status: number; // 0=Inactive, 1=Active, 2=Delete
}

export interface ChangeVendorStatusResponse {
  data: any;
  message: string;
  isSuccess: boolean;
}

// Service Details API types for VMS application

// Request interfaces
export interface ServiceDetailsSearchRequest {
  SearchTerm: string;
  PageNumber: number;
  PageSize: number;
  SortBy: string;
  SortDescending: boolean;
  Filter: Record<string, any>;
}

// Add Service Detail API interfaces
export interface AddServiceDetailRequest {
  VendorMgrServiceDetailId: number | null;
  ServiceDetailName: string;
  ServiceDetailDescription: string;
}

export interface AddServiceDetailResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Edit Service Detail API interfaces
export interface UpdateServiceDetailRequest {
  VendorMgrServiceDetailId: number;
  ServiceDetailName: string;
  ServiceDetailDescription: string;
}

export interface UpdateServiceDetailResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Get Single Service Detail interfaces
export interface GetServiceDetailResponse {
  Data: ServiceDetailRecord | ServiceDetailsApiResponse['Data'];
}

// Response interfaces
export interface ServiceDetailRecord {
  VendorMgrServiceDetailId?: number;
  vendorMgrServiceDetailId?: number;
  ServiceDetailName?: string;
  serviceDetailName?: string;
  ServiceDetailDescription?: string;
  serviceDetailDescription?: string;
  CreatedDate?: string;
  createdDate?: string;
  ModifiedDate?: string;
  modifiedDate?: string;
  IsActive?: boolean;
  isActive?: boolean;
}

export interface ServiceDetailsApiResponse {
  Data: {
    Records: ServiceDetailRecord[];
    TotalRecords: number;
    TotalPages: number;
    PageSize: number;
    CurrentPage: number;
    SortColumn: string;
    SortType: string;
  };
  Message?: string;
  IsSuccess?: boolean;
}

// Local interfaces for component use - matching API response structure
export interface ServiceDetail {
  VendorMgrServiceDetailId?: number;
  vendorMgrServiceDetailId?: number;
  ServiceDetailName?: string;
  serviceDetailName?: string;
  ServiceDetailDescription?: string;
  serviceDetailDescription?: string;
  CreatedDate?: string;
  createdDate?: string;
  ModifiedDate?: string;
  modifiedDate?: string;
  IsActive?: boolean;
  isActive?: boolean;
}

// Pagination specific types
export type PageSize = 10 | 25 | 50 | 100 | 'All';

export interface PaginationState {
  currentPage: number;
  pageSize: PageSize;
  totalRecords: number;
  totalPages: number;
  showingFrom: number;
  showingTo: number;
}

export interface PaginationConfig {
  pageSizeOptions: PageSize[];
  defaultPageSize: PageSize;
}

// Search and filter parameters
export interface ServiceDetailsSearchParams {
  searchTerm?: string;
  pageSize?: PageSize;
  pageNumber?: number;
  sortBy?: string;
  sortDescending?: boolean;
  filter?: Record<string, any>;
}

// Hook state interface
export interface UseServiceDetailsState {
  serviceDetails: ServiceDetail[];
  loading: boolean;
  error: string | null;
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: PageSize;
  sortBy: string;
  sortDescending: boolean;
  pagination: PaginationState;
}
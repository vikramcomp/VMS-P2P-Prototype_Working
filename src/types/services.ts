// Services API Types

// Base Service record structure
export interface Service {
  VendorMgrServiceId?: number;
  vendorMgrServiceId?: number;
  ServiceName?: string;
  serviceName?: string;
  Description?: string;
  description?: string;
  MaxAmount?: number;
  maxAmount?: number;
  Status?: number;
  status?: number;
  StatusText?: string;
  statusText?: string;
}

// Request for listing services (POST /services/all)
export interface ServicesListRequest {
  SearchTerm: string;
  PageNumber: number;
  PageSize: number;
  SortBy: string;
  SortDescending: boolean;
  Filter: Record<string, any>;
}

// API Response for list of services (POST /services/all)
export interface ServicesApiResponse {
  Data: {
    Records: Service[];
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

// Request for adding a new service (POST /services)
export interface AddServiceRequest {
  VendorMgrServiceId: null; // Always null for new services
  ServiceName: string;
  Description: string;
  MaxAmount: number;
}

// Request for updating an existing service (PUT /services/{id})
export interface UpdateServiceRequest {
  VendorMgrServiceId: number; // Service ID for updates
  ServiceName: string;
  Description: string;
  MaxAmount: number;
}

// Response for adding a new service
export interface AddServiceResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Search/Filter parameters for services (client-side)
export interface ServicesSearchParams {
  searchTerm?: string;
  pageSize?: number | 'All';
  pageNumber?: number;
  sortBy?: string;
  sortDescending?: boolean;
  filter?: Record<string, any>;
}

// Note: PageSize and PaginationState are imported from @/types/groups 
// to maintain consistency with existing pagination components
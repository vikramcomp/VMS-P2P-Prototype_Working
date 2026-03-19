// Subgroups API Types

// Request interfaces
export interface SubgroupsSearchRequest {
  SearchTerm: string;
  PageNumber: number;
  PageSize: number;
  SortBy: string;
  SortDescending: boolean;
  Filter: Record<string, any>;
}

// Base Subgroup record structure
export interface Subgroup {
  SubgroupId: number;
  SubgroupName: string;
  SubgroupDescription: string;
  Status: number;
}

// API Response for list of subgroups (GET /subgroups)
export interface SubgroupsApiResponse {
  Data: {
    Records: Subgroup[];
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

// Request for adding a new subgroup (POST /subgroups)
export interface AddSubgroupRequest {
  SubgroupId: 0; // Always 0 for new subgroups
  SubgroupName: string;
  SubgroupDescription: string;
  Status: number; // 0 = In-Active, 1 = Active
}

// Response for adding a new subgroup
export interface AddSubgroupResponse {
  success: boolean;
  message: string;
  data?: any;
}

// API Response for single subgroup (GET /subgroups/{id})
export interface SubgroupDetailsApiResponse {
  Data: Subgroup;
  Message: string;
  IsSuccess: boolean;
}

// Request for updating a subgroup (PUT /subgroups/{id})
export interface UpdateSubgroupRequest {
  SubgroupId: number;
  SubgroupName: string;
  SubgroupDescription: string;
  Status: number;
}

// Response for updating a subgroup
export interface UpdateSubgroupResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Request for changing subgroup status (POST /subgroups/change-status)
export interface ChangeSubgroupStatusRequest {
  SubgroupIds: number[];
  Status: number; // 0 = In-Active, 1 = Active
}

// Response for changing subgroup status
export interface ChangeSubgroupStatusResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Response for deleting a subgroup
export interface DeleteSubgroupResponse {
  success: boolean;
  message: string;
}

// Search/Filter parameters for subgroups
export interface SubgroupsSearchParams {
  searchTerm?: string;
  pageSize?: number | 'All';
  pageNumber?: number;
  sortBy?: string;
  sortDescending?: boolean;
  filter?: Record<string, any>;
}

// Status options for subgroups
export interface SubgroupStatus {
  value: number;
  label: string;
}

export const SUBGROUP_STATUSES: SubgroupStatus[] = [
  { value: 0, label: 'In-Active' },
  { value: 1, label: 'Active' },
];

// Note: PageSize and PaginationState are imported from @/types/groups 
// to maintain consistency with existing pagination components
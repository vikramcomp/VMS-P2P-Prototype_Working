// Groups API types for VMS application

// Role Data API interfaces for conditional dropdowns
// Supports both camelCase (after transformation) and PascalCase (legacy) for backward compatibility
export interface RoleDataApiResponse {
  // CamelCase (after API transformation)
  data?: {
    records?: [{
      modules?: any;
      additionalGroups?: AdditionalGroupOption[];  // Alternative path
      roles?: {
        vendorManager?: {
          roleId?: number;
          roleName?: string;
          services?: ServiceOption[];
        };
        approver?: {
          roleId?: number;
          roleName?: string;
          additionalGroups?: AdditionalGroupOption[];
        };
        vendorUser?: {
          roleId?: number;
          roleName?: string;
          vendors?: VendorOption[];
        };
      };
    }];
  };
  // PascalCase (legacy)
  Data?: {
    Records?: [{
      Modules?: any;
      AdditionalGroups?: AdditionalGroupOption[];  // Alternative path
      Roles?: {
        VendorManager?: {
          RoleId?: number;
          RoleName?: string;
          Services?: ServiceOption[];
        };
        Approver?: {
          RoleId?: number;
          RoleName?: string;
          AdditionalGroups?: AdditionalGroupOption[];
        };
        VendorUser?: {
          RoleId?: number;
          RoleName?: string;
          Vendors?: VendorOption[];
        };
      };
    }];
  };
}

export interface ServiceOption {
  id: string;
  name: string;
}

export interface AdditionalGroupOption {
  id: string;
  name: string;
}

export interface VendorOption {
  id: string;
  name: string;
}

// Request interfaces
export interface GroupsSearchRequest {
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

// Add Group API interfaces
export interface AddGroupRequest {
  StudioId: number;
  CategoryId: number;
  CategoryName: string;
  CategoryDescription: string;
  Status: number; // 1 = Active, 0 = In-Active
  StudioName: string;
}

export interface AddGroupResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Get Group by ID API interfaces
export interface GetGroupRequest {
  id: number;
}

export interface GetGroupApiResponse {
  success: boolean;
  message: string;
  data?: {
    Records: GroupRecord[];
    TotalRecords: number;
    TotalPages: number;
    PageSize: number;
    CurrentPage: number;
  };
}

// Update Group API interfaces
export interface UpdateGroupRequest {
  StudioId: number;
  CategoryId: number;
  CategoryName: string;
  CategoryDescription: string;
  Status: number; // 1 = Active, 0 = In-Active
  StudioName: string;
}

export interface UpdateGroupResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Status Change API interfaces
export interface ChangeStatusRequest {
  CategoryIds: number[];
  Status: number; // 1 = Active, 0 = In-Active
}

export interface ChangeStatusResponse {
  success: boolean;
  message: string;
}

// Response interfaces
export interface GroupRecord {
  CategoryId: number;
  CategoryName: string;
  CategoryDescription: string;
  Status: string;
  StudioId?: number;
  StudioName: string | null;
}

export interface GroupsApiResponse {
  Data: {
    Records: GroupRecord[];
    TotalRecords: number;
    TotalPages: number;
    PageSize: number;
    CurrentPage: number;
    SortColumn: string;
    SortType: string;
  };
}

// Local interfaces for component use
export interface Group {
  id: number;
  name: string;
  description: string;
  status: 'Active' | 'In-Active';
  studioName: string | null;
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
export interface GroupSearchParams {
  searchText?: string;
  searchColumn?: string;
  pageSize?: PageSize;
  pageNumber?: number;
  ignorePaging?: boolean;
  sortColumn?: string;
  sortType?: 'asc' | 'desc';
  oldWorkflowOnly?: boolean;
}

// Hook state interface
export interface UseGroupsState {
  groups: Group[];
  loading: boolean;
  error: string | null;
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: PageSize;
  sortColumn: string;
  sortType: string;
  pagination: PaginationState;
}

// Group Lookup API interfaces (for dropdowns)
export interface GroupLookupItem {
  Value: string;
  Text: string;
}

export interface GetGroupsLookupResponse {
  items: GroupLookupItem[];
}

// Formatted group for UI consumption
export interface FormattedGroupOption {
  id: string;
  name: string;
}

// Role Lookup API interfaces (for dropdowns)
export interface RoleLookupItem {
  Value: string;
  Text: string;
}

export interface GetRolesLookupResponse {
  items: RoleLookupItem[];
}

// Formatted role for UI consumption
export interface FormattedRoleOption {
  id: string;
  name: string;
}

// Module Lookup API interfaces (for dropdowns)
export interface ModuleLookupItem {
  ModuleId: number;
  ModuleName: string;
  ParentId: number;
  ModuleUrl: string;
  Status: number;
  DisplayOrder: number | null;
}

export interface GetModulesLookupResponse {
  items: ModuleLookupItem[];
}

// Formatted module for UI consumption
export interface FormattedModuleOption {
  id: number;
  name: string;
}
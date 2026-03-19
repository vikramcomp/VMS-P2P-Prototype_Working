// Base User interface matching API response
export interface User {
  id: number;         // Mapped from UserId
  name: string;       // Mapped from FullName
  email: string;      // Email
  role: string;       // Mapped from RoleName
  roleId?: number;    // Optional, may not be in response
  status: 'Active' | 'Inactive' | 'Draft' | 'Deleted';  // Status
  statusId?: number;  // Optional
  createdDate?: string;
  modifiedDate?: string;
  phone?: string;
  department?: string;
  lastLogin?: string;
}

// API User interface (matches actual API response)
export interface ApiUser {
  UserId: number;
  FullName: string;
  Email: string;
  RoleName: string;
  Status: string;
}

// API Request interfaces
export interface GetUsersRequest {
  SearchTerm: string;
  PageNumber: number;
  PageSize: number;
  SortBy: string;
  SortDescending: boolean;
  Filter: {
    RoleId: number;
    Status: number;
  };
}

// API Response interface (supports both PascalCase and camelCase for transition)
export interface GetUsersResponse {
  // Original PascalCase format (maintained for backward compatibility)
  IsSuccess?: boolean;
  Message?: string;
  Data?: {
    Records: ApiUser[];
    TotalRecords: number;
    CurrentPage: number;
    PageSize: number;
    TotalPages: number;
  };
  
  // New camelCase format (added by global transformer)
  isSuccess?: boolean;
  message?: string;
  data?: {
    records: ApiUser[];
    totalRecords: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
}

// User CRUD API interfaces
export interface CreateUserRequest {
  name: string;
  email: string;
  roleId: number;
  status: number;
  phone?: string;
  department?: string;
}

// Actual API structure for creating users
export interface CreateUserApiRequest {
  UserId: number;
  Fname: string;
  Mname: string;
  Lname: string;
  RoleId: number;
  DepartmentId: number;
  LoginId: string;
  Email: string;
  Password: string;
  PhoneNumber: string;
  Status: number;
  VenderId: number;
  VendorMgrServiceIds: number[];
  ApproverServiceIds: number[];
  UserPermissionIds: number[];
}

// API structure for updating users (same as create but with actual UserId)
export interface UpdateUserApiRequest {
  UserId: number;
  Fname: string;
  Mname: string;
  Lname: string;
  RoleId: number;
  DepartmentId: number;
  LoginId: string;
  Email: string;
  Password: string;
  PhoneNumber: string;
  Status: number;
  VenderId: number;
  VendorMgrServiceIds: number[];
  ApproverServiceIds: number[];
  UserPermissionIds: number[];
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data?: {
    userId: number;
    user: User;
  };
}

export interface UpdateUserRequest {
  id: number;
  name: string;
  email: string;
  roleId: number;
  status: number;
  phone?: string;
  department?: string;
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  data?: User;
}

export interface DeleteUserRequest {
  id: number;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}

export interface ChangeUserStatusRequest {
  userIds: number[];
  status: number; // 1 = Active, 0 = Inactive
}

export interface ChangeUserStatusResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Export Users Request interface
export interface ExportUsersRequest {
  SearchTerm: string;
  PageNumber: number;
  PageSize: number;
  SortBy: string;
  SortDescending: boolean;
  Filter: {
    RoleId: number;
    Status: number;
  };
}

// Filter and pagination interfaces
export interface UsersFilter {
  roleId: number;
  status: number;
  searchTerm: string;
}

export interface UsersPagination {
  currentPage: number;  // Changed from pageNumber
  pageSize: PageSize;
  totalRecords: number;
  totalPages: number;
  showingFrom: number;  // Added
  showingTo: number;    // Added
  sortBy: string;
  sortDescending: boolean;
}

// Pagination specific types
export type PageSize = 10 | 25 | 50 | 100 | 'All';

// Role interface for user roles
export interface UserRole {
  id: number;
  name: string;
  description?: string;
}

// Hook return type for useUsers
export interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  totalRecords: number;
  pagination: UsersPagination;
  filter: UsersFilter;
  clearError: () => void;
  setPageSize: (pageSize: PageSize) => void;
  goToPage: (page: number) => void;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: number) => void;
  setRoleFilter: (roleId: number) => void;
  setSorting: (sortBy: string, sortDescending: boolean) => void;
  refreshUsers: () => Promise<void>;
  deleteUser: (id: number) => Promise<{ success: boolean; message: string }>;
  deleteMultipleUsers: (ids: number[]) => Promise<{ success: boolean; message: string }>;
  changeUserStatus: (userId: number, status: number) => Promise<{ success: boolean; message: string }>;
  changeMultipleUsersStatus: (userIds: number[], status: number) => Promise<{ success: boolean; message: string }>;
  exportUsers: () => Promise<{ success: boolean; message: string }>;
}
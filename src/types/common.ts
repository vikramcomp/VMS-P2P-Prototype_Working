// Common types used across the application
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: SelectOption[];
  placeholder?: string;
}

export interface DashboardStats {
  totalVendors: number;
  activeVendors: number;
  activeContracts: number;
  activeUsers: number;
  totalSpend: number;
  contractAlerts: number;
  expiringContracts: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: Date;
}

// Form validation schemas
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  placeholder?: string;
  options?: SelectOption[];
  validation?: ValidationRule;
  disabled?: boolean;
  defaultValue?: any;
}
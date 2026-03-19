import { Service } from './services';

// Service Mapping interfaces

export interface ServiceMappingItem {
  id: string;
  name: string;
}

// API response structure for division mapping
export interface DivisionMappingResponse {
  // New API format (primary)
  mapped?: Array<{
    vendorMgrServiceId?: number;
    serviceName?: string;
    description?: string | null;
    status?: number;
    statusText?: string;
    maxAmount?: number | null;
  }>;
  unmapped?: Array<{
    vendorMgrServiceId?: number;
    serviceName?: string;
    description?: string | null;
    status?: number;
    statusText?: string;
    maxAmount?: number | null;
  }>;
  // Legacy formats for backward compatibility
  Mapped?: Array<{
    VendorMgrServiceDetailId?: string | number;
    ServiceDetailName?: string;
    ServiceDetailDescription?: string;
    Status?: string | number;
  }>;
  Unmapped?: Array<{
    VendorMgrServiceDetailId?: string | number;
    ServiceDetailName?: string;
    ServiceDetailDescription?: string;
    Status?: string | number;
  }>;
  Data?: {
    MappedList?: Array<{
      ServiceId?: string | number;
      Id?: string | number;
      ServiceName?: string;
      Name?: string;
    }>;
    UnmappedList?: Array<{
      ServiceId?: string | number;
      Id?: string | number;
      ServiceName?: string;
      Name?: string;
    }>;
  };
  data?: {
    mappedList?: Array<{
      serviceId?: string | number;
      id?: string | number;
      serviceName?: string;
      name?: string;
    }>;
    unmappedList?: Array<{
      serviceId?: string | number;
      id?: string | number;
      serviceName?: string;
      name?: string;
    }>;
  };
  mappedList?: Array<{
    serviceId?: string | number;
    id?: string | number;
    serviceName?: string;
    name?: string;
  }>;
  unmappedList?: Array<{
    serviceId?: string | number;
    id?: string | number;
    serviceName?: string;
    name?: string;
  }>;
  Message?: string;
  message?: string;
  IsSuccess?: boolean;
  isSuccess?: boolean;
}

// Request to save division mapping
export interface SaveDivisionMappingRequest {
  divisionMappingId: string;
  serviceIds: string[];
}

// Request to update division mapping
export interface UpdateDivisionMappingRequest {
  MappedServiceDetailIds: number[];
  UnMappedServiceDetailIds: number[];
}

// Response from save division mapping
export interface SaveDivisionMappingResponse {
  success?: boolean;
  message?: string;
  IsSuccess?: boolean;
  Message?: string;
}

// Response from update division mapping
export interface UpdateDivisionMappingResponse {
  success?: boolean;
  Success?: boolean;
  message?: string;
  Message?: string;
  IsSuccess?: boolean;
  isSuccess?: boolean;
}
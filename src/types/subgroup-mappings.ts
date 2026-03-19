// Subgroup Mapping interfaces

export interface SubgroupMappingItem {
  id: string;
  name: string;
}

// API response structure for subgroup mapping
export interface SubgroupMappingResponse {
  // Based on the screenshot format
  Mapped?: Array<{
    SubgroupId?: string | number;
    SubgroupName?: string;
    SubgroupDescription?: string;
    Status?: string | number;
  }>;
  Unmapped?: Array<{
    SubgroupId?: string | number;
    SubgroupName?: string;
    SubgroupDescription?: string;
    Status?: string | number;
  }>;
  // Alternate formats
  Data?: {
    MappedList?: Array<{
      SubgroupId?: string | number;
      Id?: string | number;
      SubgroupName?: string;
      Name?: string;
    }>;
    UnmappedList?: Array<{
      SubgroupId?: string | number;
      Id?: string | number;
      SubgroupName?: string;
      Name?: string;
    }>;
  };
  data?: {
    mappedList?: Array<{
      subgroupId?: string | number;
      id?: string | number;
      subgroupName?: string;
      name?: string;
    }>;
    unmappedList?: Array<{
      subgroupId?: string | number;
      id?: string | number;
      subgroupName?: string;
      name?: string;
    }>;
  };
  mappedList?: Array<{
    subgroupId?: string | number;
    id?: string | number;
    subgroupName?: string;
    name?: string;
  }>;
  unmappedList?: Array<{
    subgroupId?: string | number;
    id?: string | number;
    subgroupName?: string;
    name?: string;
  }>;
  Message?: string;
  message?: string;
  IsSuccess?: boolean;
  isSuccess?: boolean;
}

// Request to save subgroup mapping
export interface SaveSubgroupMappingRequest {
  subgroupMappingId: string;
  subgroupIds: string[];
}

// Request to update subgroup mapping
export interface UpdateSubgroupMappingRequest {
  MappedSubgroupIds: number[];
  UnMappedSubgroupIds: number[];
}

// Response from save subgroup mapping
export interface SaveSubgroupMappingResponse {
  success?: boolean;
  message?: string;
  IsSuccess?: boolean;
  Message?: string;
}

// Response from update subgroup mapping
export interface UpdateSubgroupMappingResponse {
  success?: boolean;
  message?: string;
  IsSuccess?: boolean;
  Message?: string;
}
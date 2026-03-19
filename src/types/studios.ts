// Studio API types for VMS application

// Studio entity interface - matches the actual API response structure
export interface Studio {
  // Use capitalized property names to match API response
  StudioId?: string;  // API might use StudioId instead of id
  StudioName?: string; // API might use StudioName instead of name
  Description?: string;
  IsActive?: boolean;
  
  // Also keep lowercase properties for consistency with our application
  id?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

// API response interfaces
export interface StudiosApiResponse {
  success: boolean;
  data: Studio[];
  message?: string;
}

export interface StudioApiResponse {
  success: boolean;
  data: Studio;
  message?: string;
}
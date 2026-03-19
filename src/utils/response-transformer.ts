/**
 * Global Response Transformer Utility
 * 
 * Provides centralized key transformation from PascalCase to camelCase
 * for API responses across the entire application.
 * 
 * Features:
 * - Recursive transformation of nested objects and arrays
 * - Backward compatibility during API transition
 * - Preserves data types and structure
 * - Handles edge cases (null, undefined, circular references)
 */

export interface TransformOptions {
  /**
   * Enable backward compatibility mode
   * When true, checks for both PascalCase and camelCase keys
   */
  backwardCompatibility?: boolean;
  
  /**
   * Keys to exclude from transformation
   */
  excludeKeys?: string[];
  
  /**
   * Maximum depth for recursive transformation (prevents infinite loops)
   */
  maxDepth?: number;
}

/**
 * Converts PascalCase string to camelCase
 * @param str - The PascalCase string to convert
 * @returns The camelCase equivalent
 */
export const pascalToCamel = (str: string): string => {
  if (typeof str !== 'string' || str.length === 0) {
    return str;
  }
  
  // Handle single character strings
  if (str.length === 1) {
    return str.toLowerCase();
  }
  
  // Convert first character to lowercase
  return str.charAt(0).toLowerCase() + str.slice(1);
};

/**
 * Checks if a string is in PascalCase format
 * @param str - The string to check
 * @returns True if the string is PascalCase
 */
export const isPascalCase = (str: string): boolean => {
  if (typeof str !== 'string' || str.length === 0) {
    return false;
  }
  
  // Must start with uppercase letter and contain only letters/numbers
  return /^[A-Z][a-zA-Z0-9]*$/.test(str) && str.length > 1;
};

/**
 * Creates a backward-compatible key accessor
 * Tries camelCase first, then PascalCase as fallback
 * @param obj - The object to access
 * @param camelKey - The camelCase key
 * @param pascalKey - The PascalCase key (optional, auto-generated if not provided)
 * @returns The value for the key, or undefined if neither exists
 */
export const getCompatibleValue = (
  obj: any, 
  camelKey: string, 
  pascalKey?: string
): any => {
  if (!obj || typeof obj !== 'object') {
    return undefined;
  }
  
  // Try camelCase first (preferred format)
  if (obj.hasOwnProperty(camelKey)) {
    return obj[camelKey];
  }
  
  // Generate PascalCase if not provided
  if (!pascalKey && camelKey) {
    pascalKey = camelKey.charAt(0).toUpperCase() + camelKey.slice(1);
  }
  
  // Try PascalCase as fallback
  if (pascalKey && obj.hasOwnProperty(pascalKey)) {
    return obj[pascalKey];
  }
  
  return undefined;
};

/**
 * Transforms API response keys from PascalCase to camelCase recursively
 * @param data - The data to transform (can be object, array, or primitive)
 * @param options - Transformation options
 * @param depth - Current recursion depth (internal use)
 * @param visited - Set of visited objects to prevent circular references
 * @returns Transformed data with camelCase keys
 */
export const transformResponseKeys = (
  data: any,
  options: TransformOptions = {},
  depth: number = 0,
  visited: WeakSet<object> = new WeakSet()
): any => {
  const {
    backwardCompatibility = true,
    excludeKeys = [],
    maxDepth = 10
  } = options;
  
  // Prevent infinite recursion
  if (depth > maxDepth) {
    console.warn('Maximum transformation depth reached, returning data as-is');
    return data;
  }
  
  // Handle null, undefined, or primitive values
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data !== 'object') {
    return data;
  }
  
  // Prevent circular references
  if (visited.has(data)) {
    return data;
  }
  visited.add(data);
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => 
      transformResponseKeys(item, options, depth + 1, visited)
    );
  }
  
  // Handle Date objects and other special objects
  if (data instanceof Date || data instanceof RegExp) {
    return data;
  }
  
  // Handle plain objects
  const transformed: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Skip excluded keys
    if (excludeKeys.includes(key)) {
      transformed[key] = value;
      continue;
    }
    
    // Transform the key
    let transformedKey = key;
    if (isPascalCase(key)) {
      transformedKey = pascalToCamel(key);
    }
    
    // Recursively transform nested values
    const transformedValue = transformResponseKeys(value, options, depth + 1, visited);
    
    // In backward compatibility mode, keep both keys if they're different
    if (backwardCompatibility && transformedKey !== key) {
      transformed[key] = transformedValue; // Keep original PascalCase
      transformed[transformedKey] = transformedValue; // Add camelCase
    } else {
      transformed[transformedKey] = transformedValue;
    }
  }
  
  return transformed;
};

/**
 * Specialized transformer for common API response patterns
 * Handles typical API response structures with IsSuccess, Data, Message, etc.
 * @param response - The API response to transform
 * @param options - Transformation options
 * @returns Transformed response
 */
export const transformApiResponse = (
  response: any,
  options: TransformOptions = {}
): any => {
  if (!response || typeof response !== 'object') {
    return response;
  }
  
  // Apply general transformation
  const transformed = transformResponseKeys(response, {
    backwardCompatibility: true,
    ...options
  });
  
  return transformed;
};

/**
 * Helper function to safely access nested properties with both naming conventions
 * @param obj - The object to access
 * @param path - Dot-notation path (e.g., 'data.records.0.userId')
 * @returns The value at the path, or undefined if not found
 */
export const safeGet = (obj: any, path: string): any => {
  if (!obj || typeof obj !== 'object' || !path) {
    return undefined;
  }
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    
    // Try both camelCase and PascalCase
    const camelKey = key;
    const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
    
    if (current.hasOwnProperty(camelKey)) {
      current = current[camelKey];
    } else if (current.hasOwnProperty(pascalKey)) {
      current = current[pascalKey];
    } else {
      return undefined;
    }
  }
  
  return current;
};

/**
 * Creates a typed accessor for API responses with key transformation
 * @param response - The API response
 * @param transform - Whether to transform the response (default: true)
 * @returns Object with helper methods for accessing response data
 */
export const createResponseAccessor = (response: any, transform: boolean = true) => {
  const data = transform ? transformApiResponse(response) : response;
  
  return {
    /**
     * Get the success status (handles both isSuccess and IsSuccess)
     */
    isSuccess(): boolean {
      return getCompatibleValue(data, 'isSuccess', 'IsSuccess') === true;
    },
    
    /**
     * Get the response message (handles both message and Message)
     */
    getMessage(): string | undefined {
      return getCompatibleValue(data, 'message', 'Message');
    },
    
    /**
     * Get the response data (handles both data and Data)
     */
    getData(): any {
      return getCompatibleValue(data, 'data', 'Data');
    },
    
    /**
     * Get records array (handles both records and Records)
     */
    getRecords(): any[] {
      const dataObj = this.getData();
      return getCompatibleValue(dataObj, 'records', 'Records') || [];
    },
    
    /**
     * Get total records count
     */
    getTotalRecords(): number {
      const dataObj = this.getData();
      return getCompatibleValue(dataObj, 'totalRecords', 'TotalRecords') || 0;
    },
    
    /**
     * Get current page
     */
    getCurrentPage(): number {
      const dataObj = this.getData();
      return getCompatibleValue(dataObj, 'currentPage', 'CurrentPage') || 1;
    },
    
    /**
     * Get page size
     */
    getPageSize(): number | string {
      const dataObj = this.getData();
      return getCompatibleValue(dataObj, 'pageSize', 'PageSize') || 10;
    },
    
    /**
     * Get total pages
     */
    getTotalPages(): number {
      const dataObj = this.getData();
      return getCompatibleValue(dataObj, 'totalPages', 'TotalPages') || 0;
    },
    
    /**
     * Get the raw transformed data
     */
    getRaw(): any {
      return data;
    },
    
    /**
     * Safely get a nested value
     */
    get(path: string): any {
      return safeGet(data, path);
    }
  };
};

// Debug logging and global exposure for testing
if (process.env.NODE_ENV === 'development') {
  console.log('🔄 Response transformer loaded');
  
  // Make transformApiResponse available globally for debugging
  if (typeof window !== 'undefined') {
    (window as any).transformApiResponse = transformApiResponse;
    console.log('🌐 transformApiResponse available globally for testing');
  }
}
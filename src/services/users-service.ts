import { 
  GetUsersRequest, 
  GetUsersResponse, 
  CreateUserRequest,
  CreateUserApiRequest,
  UpdateUserApiRequest,
  CreateUserResponse, 
  UpdateUserRequest, 
  UpdateUserResponse, 
  DeleteUserResponse,
  ChangeUserStatusRequest,
  ChangeUserStatusResponse,
  ExportUsersRequest,
  User,
  ApiUser
} from '@/types/users';

// Helper function to convert API user to internal User interface
const convertApiUserToUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser.UserId,
    name: apiUser.FullName,
    email: apiUser.Email,
    role: apiUser.RoleName,
    status: apiUser.Status as 'Active' | 'Inactive' | 'Draft' | 'Deleted',
  };
};

import { buildApiUrl, createAuthHeaders } from './api-client';

// Get users with pagination, filtering, and sorting
export const getUsers = async (request: GetUsersRequest): Promise<GetUsersResponse> => {
  try {
    const response = await fetch(buildApiUrl('users/getUsers'), {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Users API error:', error instanceof Error ? error.message : 'Unknown error');
    // Return empty response when API fails
    return {
      Data: {
        Records: [],
        TotalRecords: 0,
        TotalPages: 0,
        PageSize: request.pageSize || 10,
        CurrentPage: request.pageNumber || 1,
        SortColumn: request.sortColumn || '',
        SortType: request.sortType || ''
      },
      Message: 'No records found',
      IsSuccess: true
    };
  }
};

// Create a new user
export const createUser = async (request: CreateUserRequest): Promise<CreateUserResponse> => {
  try {
    const response = await fetch(buildApiUrl('users/create'), {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create user');
  }
};

// Create a new user with proper API structure
export const createUserWithApi = async (request: CreateUserApiRequest): Promise<CreateUserResponse> => {
  try {
    const response = await fetch(buildApiUrl('users'), {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create user';
      
      try {
        const errorData = await response.json();
        
        // Handle specific error codes
        if (errorData.errorCode === 'USERNAME_ALREADY_EXISTS') {
          errorMessage = errorData.message || 'A user with this username already exists.';
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If JSON parsing fails, try text
        const errorText = await response.text();
        errorMessage = errorText || `HTTP error! status: ${response.status}`;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: 'User created successfully',
      data: data
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
};

// Update user with API request structure
export const updateUserWithApi = async (request: UpdateUserApiRequest): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Updating user with request:', request);
    
    const response = await fetch(buildApiUrl(`users/${request.UserId}`), {
      method: 'PUT',
      headers: createAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('User update response:', data);
    
    // Check for success based on camelCase API response format
    const isSuccess = data.isSuccess === true || data.success === true;
    
    return {
      success: isSuccess,
      message: data.message || 'User updated successfully'
    };
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update user');
  }
};

// Update an existing user
export const updateUser = async (request: UpdateUserRequest): Promise<UpdateUserResponse> => {
  try {
    const response = await fetch(buildApiUrl('users/update'), {
      method: 'PUT',
      headers: createAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update user');
  }
};

// Delete a user (single)
export const deleteUser = async (userId: number): Promise<DeleteUserResponse> => {
  try {
    const response = await fetch(buildApiUrl('users/delete'), {
      method: 'DELETE',
      headers: createAuthHeaders(),
      body: JSON.stringify([userId]),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    await response.json();
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete user');
  }
};

// Delete multiple users (bulk)
export const deleteMultipleUsers = async (userIds: number[]): Promise<DeleteUserResponse> => {
  try {
    const response = await fetch(buildApiUrl('users/delete'), {
      method: 'DELETE',
      headers: createAuthHeaders(),
      body: JSON.stringify(userIds),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    await response.json();
    return { success: true, message: `${userIds.length} user(s) deleted successfully` };
  } catch (error) {
    console.error('Error deleting multiple users:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete users');
  }
};

// Change user status (activate/deactivate)
export const changeUserStatus = async (request: ChangeUserStatusRequest): Promise<ChangeUserStatusResponse> => {
  try {
    const response = await fetch(buildApiUrl('users/change-status'), {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // API now uses camelCase format: { "data": true, "message": "success", "isSuccess": true }
    const isSuccess = data.isSuccess === true || data.success === true;
    
    return {
      success: isSuccess,
      message: data.message || 'User status changed successfully',
      data: data
    };
  } catch (error) {
    console.error('Error changing user status:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to change user status'
    };
  }
};

// Get user by ID
export const getUserById = async (id: number) => {
  try {
    const response = await fetch(buildApiUrl(`users/${id}`), {
      method: 'GET',
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch user');
  }
};

// Export users to CSV/Excel file
export const exportUsers = async (request: ExportUsersRequest): Promise<Blob> => {
  try {
    const response = await fetch(buildApiUrl('users/export'), {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || errorData?.title || 'Failed to export users');
    }

    // Return the response as a blob for file download
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error exporting users:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to export users');
  }
};

// Get modules by role ID
export const getModulesByRole = async (roleId: string): Promise<any> => {
  try {
    console.log('🔄 Calling modules-by-role API for roleId:', roleId);
    
    const response = await fetch(buildApiUrl(`users/modules-by-role/${roleId}`), {
      method: 'GET',
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Modules by role API response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching modules by role:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch modules by role');
  }
};
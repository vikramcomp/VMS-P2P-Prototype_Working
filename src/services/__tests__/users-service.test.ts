import * as usersService from '../users-service';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

// Mock the api-client
jest.mock('../api-client', () => ({
  buildApiUrl: jest.fn((path) => `https://api.test.com/${path}`),
}));

describe('UsersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('getUsers', () => {
    it('should fetch users successfully', async () => {
      const mockResponse = {
        Data: {
          Records: [
            { UserId: 1, FullName: 'User 1', Email: 'user1@test.com', RoleName: 'Admin', Status: 'Active' },
          ],
          TotalRecords: 1,
        },
        IsSuccess: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await usersService.getUsers({
        SearchText: '',
        PageSize: 10,
        PageNumber: 1,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/users/getUsers',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(
        usersService.getUsers({ SearchText: '', PageSize: 10, PageNumber: 1 })
      ).rejects.toThrow('HTTP error! status: 500');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        usersService.getUsers({ SearchText: '', PageSize: 10, PageNumber: 1 })
      ).rejects.toThrow('Network error');
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'User created',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await usersService.createUser({
        FirstName: 'John',
        LastName: 'Doe',
        Email: 'john@test.com',
        RoleId: 1,
        GroupId: 1,
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle create errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(
        usersService.createUser({
          FirstName: 'John',
          LastName: 'Doe',
          Email: 'john@test.com',
          RoleId: 1,
          GroupId: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe('createUserWithApi', () => {
    it('should create user with API structure', async () => {
      const mockResponse = {
        UserId: 123,
        FullName: 'John Doe',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await usersService.createUserWithApi({
        FirstName: 'John',
        LastName: 'Doe',
        Email: 'john@test.com',
        PhoneNumber: '1234567890',
        RoleId: 1,
        GroupId: 1,
        AssignedModules: [1, 2],
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
    });

    it('should handle create errors with error text', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Validation error',
      });

      await expect(
        usersService.createUserWithApi({
          FirstName: 'John',
          LastName: 'Doe',
          Email: 'john@test.com',
          PhoneNumber: '1234567890',
          RoleId: 1,
          GroupId: 1,
          AssignedModules: [],
        })
      ).rejects.toThrow('Validation error');
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'User updated',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await usersService.updateUser({
        UserId: 1,
        FirstName: 'John',
        LastName: 'Doe',
        Email: 'john@test.com',
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle update errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(
        usersService.updateUser({
          UserId: 999,
          FirstName: 'John',
          LastName: 'Doe',
          Email: 'john@test.com',
        })
      ).rejects.toThrow();
    });
  });

  describe('updateUserWithApi', () => {
    it('should update user with API structure', async () => {
      const mockResponse = {
        isSuccess: true,
        message: 'Updated',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await usersService.updateUserWithApi({
        UserId: 1,
        FirstName: 'Jane',
        LastName: 'Doe',
        Email: 'jane@test.com',
        PhoneNumber: '1234567890',
        RoleId: 2,
        GroupId: 1,
        AssignedModules: [1],
      });

      expect(result.success).toBe(true);
    });

    it('should handle success field variations', async () => {
      const mockResponse = {
        success: true,
        message: 'Updated',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await usersService.updateUserWithApi({
        UserId: 1,
        FirstName: 'Jane',
        LastName: 'Doe',
        Email: 'jane@test.com',
        PhoneNumber: '1234567890',
        RoleId: 2,
        GroupId: 1,
        AssignedModules: [1],
      });

      expect(result.success).toBe(true);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'User deleted successfully',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await usersService.deleteUser({ UserIds: [1] });

      expect(result).toEqual(mockResponse);
    });

    it('should handle delete errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      await expect(usersService.deleteUser({ UserIds: [1] })).rejects.toThrow();
    });
  });

  describe('getUserById', () => {
    it('should fetch user by ID successfully', async () => {
      const mockResponse = {
        UserId: 1,
        FullName: 'John Doe',
        Email: 'john@test.com',
        RoleName: 'Admin',
        Status: 'Active',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await usersService.getUserById(1);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/users/1',
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle getUserById errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(usersService.getUserById(999)).rejects.toThrow();
    });
  });

  describe('changeUserStatus', () => {
    it('should change user status successfully', async () => {
      const mockResponse = {
        isSuccess: true,
        message: 'Status changed',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await usersService.changeUserStatus({
        UserIds: [1, 2],
        Status: 1,
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('Status changed');
    });

    it('should handle status change errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const result = await usersService.changeUserStatus({ UserIds: [1], Status: 1 });
      
      // Service catches errors and returns success:false
      expect(result.success).toBe(false);
      expect(result.message).toContain('HTTP error');
    });
  });

  describe('exportUsers', () => {
    it('should export users successfully', async () => {
      const mockBlob = new Blob(['data'], { type: 'application/vnd.ms-excel' });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      const result = await usersService.exportUsers({
        SearchText: '',
        PageSize: -1,
        PageNumber: -1,
      });

      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle export errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(
        usersService.exportUsers({ SearchText: '', PageSize: -1, PageNumber: -1 })
      ).rejects.toThrow();
    });
  });
});

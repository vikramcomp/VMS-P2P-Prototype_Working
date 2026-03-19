import { authService } from '../auth-service';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

// Mock api-client
jest.mock('../api-client', () => ({
  buildApiUrl: jest.fn((path) => `https://api.test.com/${path}`),
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    apiRequest: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock error-handler
jest.mock('@/utils/error-handler', () => ({
  errorHandler: {
    handle: jest.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('login', () => {
    it('should login successfully with full user data', async () => {
      const mockResponse = {
        userId: '123',
        userName: 'Test User',
        email: 'test@example.com',
        roleName: 'Admin',
        isSuccess: true,
        message: 'Login successful',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockResponse),
        headers: new Headers(),
      });

      const result = await authService.login({ UserName: 'test@example.com', Password: 'password' });

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.loginId).toBe('Test User');
    });

    it('should handle 204 No Content response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        text: async () => '',
        headers: new Headers(),
      });

      const result = await authService.login({ UserName: 'test@example.com', Password: 'password' });

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.loginId).toBe('test@example.com');
      expect(result.user?.name).toBe('test');
    });

    it('should handle empty response with ok status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => '',
        headers: new Headers(),
      });

      const result = await authService.login({ UserName: 'test@example.com', Password: 'password' });

      expect(result.success).toBe(true);
    });

    it('should handle invalid JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => 'Invalid JSON',
        headers: new Headers(),
      });

      const result = await authService.login({ UserName: 'test@example.com', Password: 'password' });

      expect(result.success).toBe(true);
    });

    it('should handle failed response with invalid JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Invalid JSON',
        headers: new Headers(),
      });

      const result = await authService.login({ UserName: 'test@example.com', Password: 'wrong' });

      expect(result.success).toBe(false);
    });

    it('should handle PascalCase response properties', async () => {
      const mockResponse = {
        UserId: '456',
        UserName: 'Test User',
        RoleName: 'User',
        IsSuccess: true,
        Message: 'Success',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockResponse),
        headers: new Headers(),
      });

      const result = await authService.login({ UserName: 'test@example.com', Password: 'password' });

      expect(result.success).toBe(true);
    });

    it('should handle nested data structure', async () => {
      const mockResponse = {
        data: {
          records: [
            {
              userId: '789',
              userName: 'Nested User',
              roleName: 'Manager',
            },
          ],
        },
        isSuccess: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockResponse),
        headers: new Headers(),
      });

      const result = await authService.login({ UserName: 'test@example.com', Password: 'password' });

      expect(result.success).toBe(true);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.login({ UserName: 'test', Password: 'pass' });

      expect(result.success).toBe(false);
      expect(result.message).toContain('error');
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => JSON.stringify({ message: 'Server error' }),
        headers: new Headers(),
      });

      const result = await authService.login({ UserName: 'test', Password: 'pass' });

      expect(result.success).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return null in test environment', () => {
      const token = authService.getToken();
      expect(token).toBeNull();
    });

    it('should return token from localStorage', () => {
      localStorage.setItem('vms_auth_token', 'test-token');
      const token = authService.getToken();
      expect(token).toBe('test-token');
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token', () => {
      const isAuth = authService.isAuthenticated();
      expect(isAuth).toBe(false);
    });

    it('should return true when token exists', () => {
      localStorage.setItem('vms_auth_token', 'test-token');
      const isAuth = authService.isAuthenticated();
      expect(isAuth).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear localStorage', () => {
      localStorage.setItem('vms_auth_token', 'test-token');
      localStorage.setItem('vms_user_data', '{}');

      authService.logout();

      expect(localStorage.getItem('vms_auth_token')).toBeNull();
      expect(localStorage.getItem('vms_user_data')).toBeNull();
    });
  });



  describe('forgotPassword', () => {
    it('should handle forgot password successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Password reset email sent',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await authService.forgotPassword({ loginId: 'test@example.com' });

      expect(result.success).toBe(true);
    });

    it('should handle forgot password errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.forgotPassword({ loginId: 'test@example.com' });

      expect(result.success).toBe(false);
    });
  });

  describe('changePassword', () => {
    it('should handle change password successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Password changed',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await authService.changePassword({
        oldPassword: 'old',
        newPassword: 'new',
        confirmPassword: 'new',
      });

      // Service returns success based on response
      expect(result).toBeDefined();
    });

    it('should handle change password errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.changePassword({
        oldPassword: 'old',
        newPassword: 'new',
        confirmPassword: 'new',
      });

      expect(result.success).toBe(false);
    });
  });
});

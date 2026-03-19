import {
  User,
  UserRole,
  CreateUserRequest,
  UpdateUserRequest,
  LoginRequest,
  LoginResponse,
  AuthContextType,
} from '../auth';

describe('Auth Types', () => {
  describe('UserRole Enum', () => {
    it('should have Admin role', () => {
      expect(UserRole.Admin).toBe('Admin');
    });

    it('should have Manager role', () => {
      expect(UserRole.Manager).toBe('Manager');
    });

    it('should have Vendor role', () => {
      expect(UserRole.Vendor).toBe('Vendor');
    });

    it('should have Viewer role', () => {
      expect(UserRole.Viewer).toBe('Viewer');
    });

    it('should have exactly 4 roles', () => {
      const roles = Object.values(UserRole);
      expect(roles).toHaveLength(4);
    });

    it('should contain all expected role values', () => {
      const roles = Object.values(UserRole);
      expect(roles).toContain('Admin');
      expect(roles).toContain('Manager');
      expect(roles).toContain('Vendor');
      expect(roles).toContain('Viewer');
    });
  });

  describe('User Interface', () => {
    it('should create a valid User object', () => {
      const user: User = {
        id: '123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.Admin,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      expect(user.id).toBe('123');
      expect(user.email).toBe('test@example.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.role).toBe(UserRole.Admin);
      expect(user.isActive).toBe(true);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should accept all UserRole enum values', () => {
      const roles = [UserRole.Admin, UserRole.Manager, UserRole.Vendor, UserRole.Viewer];
      
      roles.forEach(role => {
        const user: User = {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: role,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        expect(user.role).toBe(role);
      });
    });

    it('should handle inactive users', () => {
      const user: User = {
        id: '123',
        email: 'inactive@example.com',
        firstName: 'Inactive',
        lastName: 'User',
        role: UserRole.Viewer,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(user.isActive).toBe(false);
    });
  });

  describe('CreateUserRequest Interface', () => {
    it('should create a valid CreateUserRequest object', () => {
      const request: CreateUserRequest = {
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        password: 'securePassword123',
        role: UserRole.Vendor,
      };

      expect(request.email).toBe('newuser@example.com');
      expect(request.firstName).toBe('New');
      expect(request.lastName).toBe('User');
      expect(request.password).toBe('securePassword123');
      expect(request.role).toBe(UserRole.Vendor);
    });

    it('should require all fields', () => {
      const request: CreateUserRequest = {
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'pass',
        role: UserRole.Manager,
      };

      expect(request).toHaveProperty('email');
      expect(request).toHaveProperty('firstName');
      expect(request).toHaveProperty('lastName');
      expect(request).toHaveProperty('password');
      expect(request).toHaveProperty('role');
    });
  });

  describe('UpdateUserRequest Interface', () => {
    it('should create a valid UpdateUserRequest with all fields', () => {
      const request: UpdateUserRequest = {
        firstName: 'Updated',
        lastName: 'Name',
        role: UserRole.Manager,
        isActive: false,
      };

      expect(request.firstName).toBe('Updated');
      expect(request.lastName).toBe('Name');
      expect(request.role).toBe(UserRole.Manager);
      expect(request.isActive).toBe(false);
    });

    it('should allow partial updates with only firstName', () => {
      const request: UpdateUserRequest = {
        firstName: 'OnlyFirst',
      };

      expect(request.firstName).toBe('OnlyFirst');
      expect(request.lastName).toBeUndefined();
      expect(request.role).toBeUndefined();
      expect(request.isActive).toBeUndefined();
    });

    it('should allow partial updates with only lastName', () => {
      const request: UpdateUserRequest = {
        lastName: 'OnlyLast',
      };

      expect(request.lastName).toBe('OnlyLast');
    });

    it('should allow partial updates with only role', () => {
      const request: UpdateUserRequest = {
        role: UserRole.Admin,
      };

      expect(request.role).toBe(UserRole.Admin);
    });

    it('should allow partial updates with only isActive', () => {
      const request: UpdateUserRequest = {
        isActive: true,
      };

      expect(request.isActive).toBe(true);
    });

    it('should allow empty object', () => {
      const request: UpdateUserRequest = {};

      expect(Object.keys(request)).toHaveLength(0);
    });
  });

  describe('LoginRequest Interface', () => {
    it('should create a valid LoginRequest object', () => {
      const request: LoginRequest = {
        email: 'user@example.com',
        password: 'myPassword123',
      };

      expect(request.email).toBe('user@example.com');
      expect(request.password).toBe('myPassword123');
    });

    it('should require both email and password', () => {
      const request: LoginRequest = {
        email: 'test@test.com',
        password: 'testpass',
      };

      expect(request).toHaveProperty('email');
      expect(request).toHaveProperty('password');
    });
  });

  describe('LoginResponse Interface', () => {
    it('should create a valid LoginResponse object', () => {
      const user: User = {
        id: '123',
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.Admin,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response: LoginResponse = {
        token: 'jwt-token-here',
        user: user,
        expiresAt: new Date('2024-12-31'),
      };

      expect(response.token).toBe('jwt-token-here');
      expect(response.user).toEqual(user);
      expect(response.expiresAt).toBeInstanceOf(Date);
    });

    it('should contain all required fields', () => {
      const user: User = {
        id: '1',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.Viewer,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response: LoginResponse = {
        token: 'token123',
        user: user,
        expiresAt: new Date(),
      };

      expect(response).toHaveProperty('token');
      expect(response).toHaveProperty('user');
      expect(response).toHaveProperty('expiresAt');
    });
  });

  describe('AuthContextType Interface', () => {
    it('should create a valid AuthContextType object with authenticated user', () => {
      const mockUser: User = {
        id: '123',
        email: 'user@example.com',
        firstName: 'Auth',
        lastName: 'User',
        role: UserRole.Manager,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const context: AuthContextType = {
        user: mockUser,
        token: 'auth-token',
        login: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        isAuthenticated: true,
      };

      expect(context.user).toEqual(mockUser);
      expect(context.token).toBe('auth-token');
      expect(context.login).toBeDefined();
      expect(context.logout).toBeDefined();
      expect(context.isLoading).toBe(false);
      expect(context.isAuthenticated).toBe(true);
    });

    it('should create a valid AuthContextType object with no user', () => {
      const context: AuthContextType = {
        user: null,
        token: null,
        login: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        isAuthenticated: false,
      };

      expect(context.user).toBeNull();
      expect(context.token).toBeNull();
      expect(context.isAuthenticated).toBe(false);
    });

    it('should create a valid AuthContextType object in loading state', () => {
      const context: AuthContextType = {
        user: null,
        token: null,
        login: jest.fn(),
        logout: jest.fn(),
        isLoading: true,
        isAuthenticated: false,
      };

      expect(context.isLoading).toBe(true);
      expect(context.user).toBeNull();
    });

    it('should have callable login function', async () => {
      const mockLogin = jest.fn().mockResolvedValue(undefined);
      
      const context: AuthContextType = {
        user: null,
        token: null,
        login: mockLogin,
        logout: jest.fn(),
        isLoading: false,
        isAuthenticated: false,
      };

      await context.login('test@test.com', 'password');
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password');
    });

    it('should have callable logout function', () => {
      const mockLogout = jest.fn();
      
      const context: AuthContextType = {
        user: null,
        token: null,
        login: jest.fn(),
        logout: mockLogout,
        isLoading: false,
        isAuthenticated: false,
      };

      context.logout();
      expect(mockLogout).toHaveBeenCalled();
    });

    it('should contain all required properties', () => {
      const context: AuthContextType = {
        user: null,
        token: null,
        login: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        isAuthenticated: false,
      };

      expect(context).toHaveProperty('user');
      expect(context).toHaveProperty('token');
      expect(context).toHaveProperty('login');
      expect(context).toHaveProperty('logout');
      expect(context).toHaveProperty('isLoading');
      expect(context).toHaveProperty('isAuthenticated');
    });
  });

  describe('Type Compatibility', () => {
    it('should allow User in LoginResponse', () => {
      const user: User = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.Admin,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response: LoginResponse = {
        token: 'token',
        user: user,
        expiresAt: new Date(),
      };

      expect(response.user).toBe(user);
    });

    it('should allow User in AuthContextType', () => {
      const user: User = {
        id: '456',
        email: 'context@example.com',
        firstName: 'Context',
        lastName: 'User',
        role: UserRole.Vendor,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const context: AuthContextType = {
        user: user,
        token: 'token',
        login: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        isAuthenticated: true,
      };

      expect(context.user).toBe(user);
    });

    it('should allow null user in AuthContextType', () => {
      const context: AuthContextType = {
        user: null,
        token: null,
        login: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        isAuthenticated: false,
      };

      expect(context.user).toBeNull();
    });
  });
});

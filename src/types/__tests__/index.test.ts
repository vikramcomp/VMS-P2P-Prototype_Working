/**
 * Tests for Types Index Barrel Exports
 * 
 * This test verifies that all type exports are available through the index file
 */

import * as TypesIndex from '../index';

describe('Types Index Exports', () => {
  describe('Auth Types', () => {
    it('should export UserRole enum', () => {
      expect(TypesIndex.UserRole).toBeDefined();
      expect(TypesIndex.UserRole.Admin).toBe('Admin');
      expect(TypesIndex.UserRole.Manager).toBe('Manager');
      expect(TypesIndex.UserRole.Vendor).toBe('Vendor');
      expect(TypesIndex.UserRole.Viewer).toBe('Viewer');
    });

    it('should allow creating User type from index', () => {
      const user: TypesIndex.User = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: TypesIndex.UserRole.Admin,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(user.id).toBe('123');
      expect(user.role).toBe(TypesIndex.UserRole.Admin);
    });

    it('should allow creating CreateUserRequest from index', () => {
      const request: TypesIndex.CreateUserRequest = {
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        password: 'password123',
        role: TypesIndex.UserRole.Vendor,
      };

      expect(request.email).toBe('new@example.com');
      expect(request.role).toBe(TypesIndex.UserRole.Vendor);
    });

    it('should allow creating UpdateUserRequest from index', () => {
      const request: TypesIndex.UpdateUserRequest = {
        firstName: 'Updated',
        role: TypesIndex.UserRole.Manager,
      };

      expect(request.firstName).toBe('Updated');
    });

    it('should allow creating LoginRequest from index', () => {
      const request: TypesIndex.LoginRequest = {
        email: 'user@example.com',
        password: 'password',
      };

      expect(request.email).toBe('user@example.com');
    });

    it('should allow creating LoginResponse from index', () => {
      const user: TypesIndex.User = {
        id: '123',
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: TypesIndex.UserRole.Admin,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response: TypesIndex.LoginResponse = {
        token: 'jwt-token',
        user: user,
        expiresAt: new Date(),
      };

      expect(response.token).toBe('jwt-token');
      expect(response.user).toBe(user);
    });

    it('should allow creating AuthContextType from index', () => {
      const context: TypesIndex.AuthContextType = {
        user: null,
        token: null,
        login: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        isAuthenticated: false,
      };

      expect(context.isAuthenticated).toBe(false);
    });
  });

  describe('Common Types', () => {
    it('should export PaginationParams', () => {
      const params: TypesIndex.PaginationParams = {
        pageNumber: 1,
        pageSize: 10,
      };

      expect(params.pageNumber).toBe(1);
      expect(params.pageSize).toBe(10);
    });

    it('should export SortParams', () => {
      const params: TypesIndex.SortParams = {
        sortColumn: 'name',
        sortType: 'asc',
      };

      expect(params.sortColumn).toBe('name');
      expect(params.sortType).toBe('asc');
    });

    it('should export APIResponse', () => {
      const response: TypesIndex.APIResponse<{ id: number }> = {
        Data: {
          Records: [{ id: 1 }],
          TotalRecords: 1,
        },
        IsSuccess: true,
        Message: 'Success',
      };

      expect(response.IsSuccess).toBe(true);
      expect(response.Data.Records[0].id).toBe(1);
    });

    it('should export DropdownOption', () => {
      const option: TypesIndex.DropdownOption = {
        label: 'Option 1',
        value: '1',
      };

      expect(option.label).toBe('Option 1');
      expect(option.value).toBe('1');
    });

    it('should export StatusType', () => {
      const status: TypesIndex.StatusType = 'Active';
      expect(status).toBe('Active');

      const status2: TypesIndex.StatusType = 'Inactive';
      expect(status2).toBe('Inactive');
    });
  });

  describe('Groups Types', () => {
    it('should export Group', () => {
      const group: TypesIndex.Group = {
        id: 1,
        name: 'Test Group',
        description: 'Test Description',
        status: 'Active',
        studioName: 'Test Studio',
        createdAt: '2024-01-01',
      };

      expect(group.id).toBe(1);
      expect(group.name).toBe('Test Group');
    });

    it('should export GroupsListParams', () => {
      const params: TypesIndex.GroupsListParams = {
        pageNumber: 1,
        pageSize: 10,
        sortColumn: 'CategoryName',
        sortType: 'asc',
        oldWorkflowOnly: true,
      };

      expect(params.oldWorkflowOnly).toBe(true);
    });

    it('should export CreateGroupRequest', () => {
      const request: TypesIndex.CreateGroupRequest = {
        categoryName: 'New Group',
        description: 'Group Description',
        studioId: 1,
        isActive: true,
      };

      expect(request.categoryName).toBe('New Group');
    });

    it('should export UpdateGroupRequest', () => {
      const request: TypesIndex.UpdateGroupRequest = {
        categoryName: 'Updated Group',
        description: 'Updated Description',
      };

      expect(request.categoryName).toBe('Updated Group');
    });
  });

  describe('Subgroup Mappings Types', () => {
    it('should export SubgroupMapping', () => {
      const mapping: TypesIndex.SubgroupMapping = {
        id: 1,
        parentGroupId: 10,
        parentGroupName: 'Parent Group',
        childGroupId: 20,
        childGroupName: 'Child Group',
        createdAt: '2024-01-01',
        createdBy: 'admin',
      };

      expect(mapping.id).toBe(1);
      expect(mapping.parentGroupId).toBe(10);
      expect(mapping.childGroupId).toBe(20);
    });

    it('should export SubgroupMappingsParams', () => {
      const params: TypesIndex.SubgroupMappingsParams = {
        pageNumber: 1,
        pageSize: 10,
        sortColumn: 'parentGroupName',
        sortType: 'asc',
        parentGroupId: 5,
      };

      expect(params.parentGroupId).toBe(5);
    });

    it('should export CreateSubgroupMappingRequest', () => {
      const request: TypesIndex.CreateSubgroupMappingRequest = {
        parentGroupId: 10,
        childGroupId: 20,
      };

      expect(request.parentGroupId).toBe(10);
      expect(request.childGroupId).toBe(20);
    });
  });

  describe('Type Availability', () => {
    it('should have all exports available as named exports', () => {
      // Verify key exports are available
      expect(TypesIndex.UserRole).toBeDefined();
      
      // Check that TypeScript interfaces can be used (compile-time check)
      const testUser: TypesIndex.User = {
        id: '1',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        role: TypesIndex.UserRole.Admin,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const testGroup: TypesIndex.Group = {
        id: 1,
        name: 'Group',
        description: 'Description',
        status: 'Active',
        studioName: 'Studio',
        createdAt: '2024-01-01',
      };
      
      expect(testUser.id).toBeDefined();
      expect(testGroup.id).toBeDefined();
    });

    it('should support wildcard import pattern', () => {
      // Verify that wildcard import works
      expect(typeof TypesIndex).toBe('object');
      expect(TypesIndex).toBeDefined();
    });
  });

  describe('Import Patterns', () => {
    it('should support destructured imports', () => {
      // This test verifies the types can be destructured
      const { UserRole, StatusType } = TypesIndex as any;
      
      expect(UserRole).toBeDefined();
      expect(UserRole.Admin).toBe('Admin');
    });

    it('should allow mixing enum and interface imports', () => {
      const user: TypesIndex.User = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: TypesIndex.UserRole.Manager,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const option: TypesIndex.DropdownOption = {
        label: user.firstName,
        value: user.id,
      };

      expect(option.label).toBe('Test');
      expect(user.role).toBe(TypesIndex.UserRole.Manager);
    });
  });

  describe('Type Exports Verification', () => {
    it('should export all expected UserRole values', () => {
      const roles = Object.values(TypesIndex.UserRole);
      expect(roles).toContain('Admin');
      expect(roles).toContain('Manager');
      expect(roles).toContain('Vendor');
      expect(roles).toContain('Viewer');
      expect(roles).toHaveLength(4);
    });

    it('should allow type usage in function signatures', () => {
      const createUser = (request: TypesIndex.CreateUserRequest): TypesIndex.User => {
        return {
          id: '123',
          email: request.email,
          firstName: request.firstName,
          lastName: request.lastName,
          role: request.role,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      };

      const request: TypesIndex.CreateUserRequest = {
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password',
        role: TypesIndex.UserRole.Admin,
      };

      const user = createUser(request);
      expect(user.email).toBe('test@test.com');
    });

    it('should allow type usage with generic APIResponse', () => {
      const response: TypesIndex.APIResponse<TypesIndex.Group> = {
        Data: {
          Records: [
            {
              id: 1,
              name: 'Group 1',
              description: 'Description',
              status: 'Active',
              studioName: 'Studio',
              createdAt: '2024-01-01',
            },
          ],
          TotalRecords: 1,
        },
        IsSuccess: true,
        Message: 'Success',
      };

      expect(response.Data.Records[0].name).toBe('Group 1');
    });
  });
});

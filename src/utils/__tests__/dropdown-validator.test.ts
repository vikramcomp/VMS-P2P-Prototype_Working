/**
 * Tests for Dropdown Validator
 */

import { DropdownValidator, validateAllDropdowns, testDropdownService } from '../dropdown-validator';
import * as groupsService from '@/services/groups-service';
import { studiosService } from '@/services/studios-service';

// Mock the services
jest.mock('@/services/groups-service', () => ({
  getFormattedGroups: jest.fn(),
  getFormattedRoles: jest.fn(),
  getFormattedModules: jest.fn(),
  getRoleData: jest.fn(),
}));

jest.mock('@/services/studios-service', () => ({
  studiosService: {
    getStudios: jest.fn(),
  },
}));

const mockGroupsService = groupsService as jest.Mocked<typeof groupsService>;

describe('DropdownValidator', () => {
  let validator: DropdownValidator;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleGroupSpy: jest.SpyInstance;
  let consoleGroupEndSpy: jest.SpyInstance;

  beforeEach(() => {
    validator = new DropdownValidator();
    jest.clearAllMocks();
    
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleGroupSpy = jest.spyOn(console, 'group').mockImplementation();
    consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleGroupSpy.mockRestore();
    consoleGroupEndSpy.mockRestore();
  });

  describe('Constructor', () => {
    it('should create instance', () => {
      expect(validator).toBeInstanceOf(DropdownValidator);
    });

    it('should initialize with empty results', () => {
      expect(validator.getResults()).toEqual([]);
    });
  });

  describe('validateAllDropdowns', () => {
    beforeEach(() => {
      mockGroupsService.getFormattedGroups.mockResolvedValue([{ id: '1', name: 'Group 1' }]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([{ id: '1', name: 'Role 1' }]);
      mockGroupsService.getFormattedModules.mockResolvedValue([{ id: '1', name: 'Module 1' }]);
      mockGroupsService.getRoleData.mockResolvedValue({ data: { records: [{ roles: { approver: { additionalGroups: [] } } }] } });
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [{ id: '1', name: 'Studio 1' }] });
    });

    it('should validate all dropdowns and return results', async () => {
      const results = await validator.validateAllDropdowns();
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(5); // Groups, Roles, Modules, Studios, Role Data
    });

    it('should call all validation methods', async () => {
      await validator.validateAllDropdowns();
      
      expect(mockGroupsService.getFormattedGroups).toHaveBeenCalled();
      expect(mockGroupsService.getFormattedRoles).toHaveBeenCalled();
      expect(mockGroupsService.getFormattedModules).toHaveBeenCalled();
      expect(studiosService.getStudios).toHaveBeenCalled();
      expect(mockGroupsService.getRoleData).toHaveBeenCalled();
    });

    it('should log validation start', async () => {
      await validator.validateAllDropdowns();
      
      expect(consoleGroupSpy).toHaveBeenCalledWith('🔍 Validating All Dropdown Services');
      expect(consoleGroupEndSpy).toHaveBeenCalled();
    });

    it('should return results in correct order', async () => {
      const results = await validator.validateAllDropdowns();
      
      expect(results[0].service).toBe('Groups');
      expect(results[1].service).toBe('Roles');
      expect(results[2].service).toBe('Modules');
      expect(results[3].service).toBe('Studios');
      expect(results[4].service).toBe('Role Data');
    });
  });

  describe('validateGroups - Success', () => {
    it('should validate groups successfully', async () => {
      const mockGroups = [
        { id: '1', name: 'Group 1' },
        { id: '2', name: 'Group 2' }
      ];
      mockGroupsService.getFormattedGroups.mockResolvedValue(mockGroups);
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      const results = await validator.validateAllDropdowns();
      const groupsResult = results.find(r => r.service === 'Groups');

      expect(groupsResult).toBeDefined();
      expect(groupsResult?.status).toBe('success');
      expect(groupsResult?.dataCount).toBe(2);
      expect(groupsResult?.message).toBe('Found 2 groups');
      expect(groupsResult?.sampleData).toEqual(mockGroups[0]);
    });

    it('should handle empty groups array', async () => {
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      const results = await validator.validateAllDropdowns();
      const groupsResult = results.find(r => r.service === 'Groups');

      expect(groupsResult?.status).toBe('empty');
      expect(groupsResult?.message).toBe('No groups found');
      expect(groupsResult?.dataCount).toBe(0);
      expect(groupsResult?.sampleData).toBeNull();
    });
  });

  describe('validateGroups - Error', () => {
    it('should handle groups validation error', async () => {
      const error = new Error('Network error');
      mockGroupsService.getFormattedGroups.mockRejectedValue(error);
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      const results = await validator.validateAllDropdowns();
      const groupsResult = results.find(r => r.service === 'Groups');

      expect(groupsResult?.status).toBe('error');
      expect(groupsResult?.message).toBe('Failed to fetch groups');
      expect(groupsResult?.error).toBe('Network error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Groups validation failed:', error);
    });

    it('should handle non-Error exception in groups', async () => {
      mockGroupsService.getFormattedGroups.mockRejectedValue('String error');
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      const results = await validator.validateAllDropdowns();
      const groupsResult = results.find(r => r.service === 'Groups');

      expect(groupsResult?.status).toBe('error');
      expect(groupsResult?.error).toBe('Unknown error');
    });
  });

  describe('validateRoles - Success', () => {
    it('should validate roles successfully', async () => {
      const mockRoles = [
        { id: '1', name: 'Admin' },
        { id: '2', name: 'Manager' }
      ];
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);
      mockGroupsService.getFormattedRoles.mockResolvedValue(mockRoles);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      const results = await validator.validateAllDropdowns();
      const rolesResult = results.find(r => r.service === 'Roles');

      expect(rolesResult?.status).toBe('success');
      expect(rolesResult?.dataCount).toBe(2);
      expect(rolesResult?.message).toBe('Found 2 roles');
      expect(rolesResult?.endpoint).toBe('lookups/roles');
    });

    it('should handle empty roles array', async () => {
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      const results = await validator.validateAllDropdowns();
      const rolesResult = results.find(r => r.service === 'Roles');

      expect(rolesResult?.status).toBe('empty');
      expect(rolesResult?.message).toBe('No roles found');
    });
  });

  describe('validateRoles - Error', () => {
    it('should handle roles validation error', async () => {
      const error = new Error('API timeout');
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);
      mockGroupsService.getFormattedRoles.mockRejectedValue(error);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      const results = await validator.validateAllDropdowns();
      const rolesResult = results.find(r => r.service === 'Roles');

      expect(rolesResult?.status).toBe('error');
      expect(rolesResult?.message).toBe('Failed to fetch roles');
      expect(rolesResult?.error).toBe('API timeout');
    });

    it('should handle non-Error exception in roles', async () => {
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);
      mockGroupsService.getFormattedRoles.mockRejectedValue(null);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      const results = await validator.validateAllDropdowns();
      const rolesResult = results.find(r => r.service === 'Roles');

      expect(rolesResult?.error).toBe('Unknown error');
    });
  });

  describe('validateModules - Success', () => {
    it('should validate modules successfully', async () => {
      const mockModules = [
        { id: '1', name: 'Module A' },
        { id: '2', name: 'Module B' },
        { id: '3', name: 'Module C' }
      ];
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockResolvedValue(mockModules);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      const results = await validator.validateAllDropdowns();
      const modulesResult = results.find(r => r.service === 'Modules');

      expect(modulesResult?.status).toBe('success');
      expect(modulesResult?.dataCount).toBe(3);
      expect(modulesResult?.endpoint).toBe('lookups/master-modules');
    });

    it('should handle empty modules array', async () => {
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      const results = await validator.validateAllDropdowns();
      const modulesResult = results.find(r => r.service === 'Modules');

      expect(modulesResult?.status).toBe('empty');
      expect(modulesResult?.message).toBe('No modules found');
    });
  });

  describe('validateModules - Error', () => {
    it('should handle modules validation error', async () => {
      const error = new Error('Connection refused');
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockRejectedValue(error);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      const results = await validator.validateAllDropdowns();
      const modulesResult = results.find(r => r.service === 'Modules');

      expect(modulesResult?.status).toBe('error');
      expect(modulesResult?.error).toBe('Connection refused');
    });

    it('should handle non-Error exception in modules', async () => {
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockRejectedValue('String error');
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      const results = await validator.validateAllDropdowns();
      const modulesResult = results.find(r => r.service === 'Modules');

      expect(modulesResult?.error).toBe('Unknown error');
    });
  });

  describe('validateStudios - Success', () => {
    it('should validate studios successfully', async () => {
      const mockStudios = [
        { id: '1', name: 'Studio 1' },
        { id: '2', name: 'Studio 2' }
      ];
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: mockStudios });

      const results = await validator.validateAllDropdowns();
      const studiosResult = results.find(r => r.service === 'Studios');

      expect(studiosResult?.status).toBe('success');
      expect(studiosResult?.dataCount).toBe(2);
      expect(studiosResult?.endpoint).toBe('groups/getstudio');
    });

    it('should handle empty studios array', async () => {
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      const results = await validator.validateAllDropdowns();
      const studiosResult = results.find(r => r.service === 'Studios');

      expect(studiosResult?.status).toBe('empty');
      expect(studiosResult?.message).toBe('No studios found');
    });

    it('should handle undefined studios data', async () => {
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockResolvedValue({});

      const results = await validator.validateAllDropdowns();
      const studiosResult = results.find(r => r.service === 'Studios');

      expect(studiosResult?.status).toBe('empty');
      expect(studiosResult?.dataCount).toBe(0);
    });
  });

  describe('validateStudios - Error', () => {
    it('should handle studios validation error', async () => {
      const error = new Error('Service unavailable');
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockRejectedValue(error);

      const results = await validator.validateAllDropdowns();
      const studiosResult = results.find(r => r.service === 'Studios');

      expect(studiosResult?.status).toBe('error');
      expect(studiosResult?.error).toBe('Service unavailable');
    });

    it('should handle non-Error exception in studios', async () => {
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockRejectedValue({ code: 500 });

      const results = await validator.validateAllDropdowns();
      const studiosResult = results.find(r => r.service === 'Studios');

      expect(studiosResult?.error).toBe('Unknown error');
    });
  });

  describe('validateRoleData - Success', () => {
    it('should validate role data with lowercase format', async () => {
      const mockRoleData = {
        data: {
          records: [{
            roles: {
              approver: {
                additionalGroups: [{ id: '1', name: 'Group 1' }]
              },
              vendorManager: {
                services: [{ id: '1', name: 'Service 1' }]
              },
              vendorUser: {
                vendors: [{ id: '1', name: 'Vendor 1' }]
              }
            }
          }]
        }
      };
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockResolvedValue(mockRoleData);
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      const results = await validator.validateAllDropdowns();
      const roleDataResult = results.find(r => r.service === 'Role Data');

      expect(roleDataResult?.status).toBe('success');
      expect(roleDataResult?.dataCount).toBe(3);
      expect(roleDataResult?.message).toContain('Approver Groups: 1');
      expect(roleDataResult?.message).toContain('Vendor Services: 1');
      expect(roleDataResult?.message).toContain('Vendor Users: 1');
    });

    it('should validate role data with uppercase format', async () => {
      const mockRoleData = {
        Data: {
          Records: [{
            Roles: {
              Approver: {
                AdditionalGroups: [{ id: '1' }, { id: '2' }]
              },
              VendorManager: {
                Services: [{ id: '1' }]
              },
              VendorUser: {
                Vendors: []
              }
            }
          }]
        }
      };
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockResolvedValue(mockRoleData);
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      const results = await validator.validateAllDropdowns();
      const roleDataResult = results.find(r => r.service === 'Role Data');

      expect(roleDataResult?.status).toBe('success');
      expect(roleDataResult?.dataCount).toBe(3);
      expect(roleDataResult?.message).toContain('Approver Groups: 2');
    });

    it('should handle empty role data', async () => {
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      const results = await validator.validateAllDropdowns();
      const roleDataResult = results.find(r => r.service === 'Role Data');

      expect(roleDataResult?.status).toBe('empty');
      expect(roleDataResult?.dataCount).toBe(0);
    });
  });

  describe('validateRoleData - Error', () => {
    it('should handle role data validation error', async () => {
      const error = new Error('Unauthorized');
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockRejectedValue(error);
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      const results = await validator.validateAllDropdowns();
      const roleDataResult = results.find(r => r.service === 'Role Data');

      expect(roleDataResult?.status).toBe('error');
      expect(roleDataResult?.error).toBe('Unauthorized');
      expect(roleDataResult?.endpoint).toBe('users/role-data');
    });

    it('should handle non-Error exception in role data', async () => {
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockRejectedValue(undefined);
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      const results = await validator.validateAllDropdowns();
      const roleDataResult = results.find(r => r.service === 'Role Data');

      expect(roleDataResult?.error).toBe('Unknown error');
    });
  });

  describe('getValidationSummary', () => {
    it('should return correct summary for successful validations', async () => {
      mockGroupsService.getFormattedGroups.mockResolvedValue([{ id: '1' }]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([{ id: '1' }]);
      mockGroupsService.getFormattedModules.mockResolvedValue([{ id: '1' }]);
      mockGroupsService.getRoleData.mockResolvedValue({
        data: { records: [{ roles: { approver: { additionalGroups: [{ id: '1' }] } } }] }
      });
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [{ id: '1' }] });

      await validator.validateAllDropdowns();
      const summary = validator.getValidationSummary();

      expect(summary.total).toBe(5);
      expect(summary.successful).toBe(5);
      expect(summary.empty).toBe(0);
      expect(summary.failed).toBe(0);
      expect(summary.issues).toHaveLength(0);
    });

    it('should return correct summary with empty results', async () => {
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      await validator.validateAllDropdowns();
      const summary = validator.getValidationSummary();

      expect(summary.successful).toBe(0);
      expect(summary.empty).toBe(5);
      expect(summary.issues).toHaveLength(5);
    });

    it('should return correct summary with errors', async () => {
      mockGroupsService.getFormattedGroups.mockRejectedValue(new Error('Error 1'));
      mockGroupsService.getFormattedRoles.mockRejectedValue(new Error('Error 2'));
      mockGroupsService.getFormattedModules.mockResolvedValue([{ id: '1' }]);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      await validator.validateAllDropdowns();
      const summary = validator.getValidationSummary();

      expect(summary.failed).toBe(2);
      expect(summary.issues.length).toBeGreaterThan(0);
    });
  });

  describe('printValidationReport', () => {
    it('should print report without issues', async () => {
      mockGroupsService.getFormattedGroups.mockResolvedValue([{ id: '1' }]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([{ id: '1' }]);
      mockGroupsService.getFormattedModules.mockResolvedValue([{ id: '1' }]);
      mockGroupsService.getRoleData.mockResolvedValue({
        data: { records: [{ roles: { approver: { additionalGroups: [{ id: '1' }] } } }] }
      });
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [{ id: '1' }] });

      await validator.validateAllDropdowns();
      validator.printValidationReport();

      expect(consoleGroupSpy).toHaveBeenCalledWith('📊 Dropdown Validation Report');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Summary:'));
    });

    it('should print report with issues', async () => {
      mockGroupsService.getFormattedGroups.mockRejectedValue(new Error('Test error'));
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      await validator.validateAllDropdowns();
      validator.printValidationReport();

      expect(consoleGroupSpy).toHaveBeenCalledWith('🚨 Issues Found:');
    });
  });

  describe('getResults', () => {
    it('should return empty array initially', () => {
      expect(validator.getResults()).toEqual([]);
    });

    it('should return results after validation', async () => {
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      await validator.validateAllDropdowns();
      const results = validator.getResults();

      expect(results).toHaveLength(5);
    });
  });

  describe('validateAllDropdowns exported function', () => {
    it('should run validation and print report', async () => {
      mockGroupsService.getFormattedGroups.mockResolvedValue([{ id: '1' }]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([{ id: '1' }]);
      mockGroupsService.getFormattedModules.mockResolvedValue([{ id: '1' }]);
      mockGroupsService.getRoleData.mockResolvedValue({
        data: { records: [{ roles: { approver: { additionalGroups: [] } } }] }
      });
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [{ id: '1' }] });

      const results = await validateAllDropdowns();

      expect(results).toHaveLength(5);
      expect(consoleGroupSpy).toHaveBeenCalledWith('📊 Dropdown Validation Report');
    });
  });

  describe('testDropdownService', () => {
    it('should test groups service', async () => {
      mockGroupsService.getFormattedGroups.mockResolvedValue([{ id: '1', name: 'Group' }]);

      const result = await testDropdownService('groups');

      expect(result).toBeDefined();
      expect(result?.service).toBe('Groups');
      expect(mockGroupsService.getFormattedGroups).toHaveBeenCalled();
    });

    it('should test roles service', async () => {
      mockGroupsService.getFormattedRoles.mockResolvedValue([{ id: '1', name: 'Role' }]);

      const result = await testDropdownService('roles');

      expect(result?.service).toBe('Roles');
      expect(mockGroupsService.getFormattedRoles).toHaveBeenCalled();
    });

    it('should test modules service', async () => {
      mockGroupsService.getFormattedModules.mockResolvedValue([{ id: '1', name: 'Module' }]);

      const result = await testDropdownService('modules');

      expect(result?.service).toBe('Modules');
      expect(mockGroupsService.getFormattedModules).toHaveBeenCalled();
    });

    it('should test studios service', async () => {
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [{ id: '1' }] });

      const result = await testDropdownService('studios');

      expect(result?.service).toBe('Studios');
      expect(studiosService.getStudios).toHaveBeenCalled();
    });

    it('should test roledata service', async () => {
      mockGroupsService.getRoleData.mockResolvedValue({});

      const result = await testDropdownService('roledata');

      expect(result?.service).toBe('Role Data');
      expect(mockGroupsService.getRoleData).toHaveBeenCalled();
    });

    it('should handle unknown service name', async () => {
      const result = await testDropdownService('unknown');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Unknown service:', 'unknown');
    });

    it('should handle case-insensitive service names', async () => {
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);

      const result = await testDropdownService('GROUPS');

      expect(result?.service).toBe('Groups');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty results in validateAllDropdowns', async () => {
      mockGroupsService.getFormattedGroups.mockResolvedValue([]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([]);
      mockGroupsService.getFormattedModules.mockResolvedValue([]);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockResolvedValue({});

      const results = await validator.validateAllDropdowns();
      expect(results).toHaveLength(5);
    });

    it('should handle multiple calls to validateAllDropdowns', async () => {
      mockGroupsService.getFormattedGroups.mockResolvedValue([{ id: '1' }]);
      mockGroupsService.getFormattedRoles.mockResolvedValue([{ id: '1' }]);
      mockGroupsService.getFormattedModules.mockResolvedValue([{ id: '1' }]);
      mockGroupsService.getRoleData.mockResolvedValue({});
      (studiosService.getStudios as jest.Mock).mockResolvedValue({ data: [] });

      const results1 = await validator.validateAllDropdowns();
      const results2 = await validator.validateAllDropdowns();

      expect(results1).toHaveLength(5);
      expect(results2).toHaveLength(5);
    });
  });
});

/**
 * Dropdown Validation Utility
 * 
 * Comprehensive testing utility for all dropdown services across the VMS application.
 * This helps identify and debug blank dropdown issues by testing all data sources.
 */

import { getFormattedGroups, getFormattedRoles, getFormattedModules, getRoleData } from '@/services/groups-service';
import { studiosService } from '@/services/studios-service';

interface ValidationResult {
  service: string;
  endpoint: string;
  status: 'success' | 'error' | 'empty';
  message: string;
  dataCount: number;
  sampleData?: any;
  error?: string;
}

export class DropdownValidator {
  private results: ValidationResult[] = [];

  /**
   * Run comprehensive validation of all dropdown services
   */
  async validateAllDropdowns(): Promise<ValidationResult[]> {
    this.results = [];
    
    console.group('🔍 Validating All Dropdown Services');
    
    // Test Groups dropdown
    await this.validateGroups();
    
    // Test Roles dropdown
    await this.validateRoles();
    
    // Test Modules dropdown
    await this.validateModules();
    
    // Test Studios dropdown
    await this.validateStudios();
    
    // Test Role Data (for conditional dropdowns)
    await this.validateRoleData();
    
    console.groupEnd();
    
    return this.results;
  }

  /**
   * Validate Groups dropdown service
   */
  private async validateGroups(): Promise<void> {
    try {
      console.log('🧪 Testing Groups dropdown...');
      const groups = await getFormattedGroups();
      
      this.results.push({
        service: 'Groups',
        endpoint: 'lookups/groups',
        status: groups.length > 0 ? 'success' : 'empty',
        message: groups.length > 0 ? `Found ${groups.length} groups` : 'No groups found',
        dataCount: groups.length,
        sampleData: groups[0] || null
      });
      
      console.log(`✅ Groups: ${groups.length} items`, groups[0]);
    } catch (error) {
      console.error('❌ Groups validation failed:', error);
      this.results.push({
        service: 'Groups',
        endpoint: 'lookups/groups',
        status: 'error',
        message: 'Failed to fetch groups',
        dataCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Validate Roles dropdown service
   */
  private async validateRoles(): Promise<void> {
    try {
      console.log('🧪 Testing Roles dropdown...');
      const roles = await getFormattedRoles();
      
      this.results.push({
        service: 'Roles',
        endpoint: 'lookups/roles',
        status: roles.length > 0 ? 'success' : 'empty',
        message: roles.length > 0 ? `Found ${roles.length} roles` : 'No roles found',
        dataCount: roles.length,
        sampleData: roles[0] || null
      });
      
      console.log(`✅ Roles: ${roles.length} items`, roles[0]);
    } catch (error) {
      console.error('❌ Roles validation failed:', error);
      this.results.push({
        service: 'Roles',
        endpoint: 'lookups/roles',
        status: 'error',
        message: 'Failed to fetch roles',
        dataCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Validate Modules dropdown service
   */
  private async validateModules(): Promise<void> {
    try {
      console.log('🧪 Testing Modules dropdown...');
      const modules = await getFormattedModules();
      
      this.results.push({
        service: 'Modules',
        endpoint: 'lookups/master-modules',
        status: modules.length > 0 ? 'success' : 'empty',
        message: modules.length > 0 ? `Found ${modules.length} modules` : 'No modules found',
        dataCount: modules.length,
        sampleData: modules[0] || null
      });
      
      console.log(`✅ Modules: ${modules.length} items`, modules[0]);
    } catch (error) {
      console.error('❌ Modules validation failed:', error);
      this.results.push({
        service: 'Modules',
        endpoint: 'lookups/master-modules',
        status: 'error',
        message: 'Failed to fetch modules',
        dataCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Validate Studios dropdown service
   */
  private async validateStudios(): Promise<void> {
    try {
      console.log('🧪 Testing Studios dropdown...');
      const response = await studiosService.getStudios();
      const studios = response.data || [];
      
      this.results.push({
        service: 'Studios',
        endpoint: 'groups/getstudio',
        status: studios.length > 0 ? 'success' : 'empty',
        message: studios.length > 0 ? `Found ${studios.length} studios` : 'No studios found',
        dataCount: studios.length,
        sampleData: studios[0] || null
      });
      
      console.log(`✅ Studios: ${studios.length} items`, studios[0]);
    } catch (error) {
      console.error('❌ Studios validation failed:', error);
      this.results.push({
        service: 'Studios',
        endpoint: 'groups/getstudio',
        status: 'error',
        message: 'Failed to fetch studios',
        dataCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Validate Role Data service (for conditional dropdowns)
   */
  private async validateRoleData(): Promise<void> {
    try {
      console.log('🧪 Testing Role Data service...');
      const roleData = await getRoleData();
      
      // Check for approver groups
      const approverGroups = roleData?.data?.records?.[0]?.roles?.approver?.additionalGroups || 
                           roleData?.Data?.Records?.[0]?.Roles?.Approver?.AdditionalGroups || [];
      
      // Check for vendor manager services
      const vendorServices = roleData?.data?.records?.[0]?.roles?.vendorManager?.services ||
                           roleData?.Data?.Records?.[0]?.Roles?.VendorManager?.Services || [];
      
      // Check for vendor user vendors
      const vendorUsers = roleData?.data?.records?.[0]?.roles?.vendorUser?.vendors ||
                        roleData?.Data?.Records?.[0]?.Roles?.VendorUser?.Vendors || [];
      
      const totalConditionalData = approverGroups.length + vendorServices.length + vendorUsers.length;
      
      this.results.push({
        service: 'Role Data',
        endpoint: 'users/role-data',
        status: totalConditionalData > 0 ? 'success' : 'empty',
        message: `Approver Groups: ${approverGroups.length}, Vendor Services: ${vendorServices.length}, Vendor Users: ${vendorUsers.length}`,
        dataCount: totalConditionalData,
        sampleData: {
          approverGroups: approverGroups[0] || null,
          vendorServices: vendorServices[0] || null,
          vendorUsers: vendorUsers[0] || null
        }
      });
      
      console.log('✅ Role Data:', {
        approverGroups: approverGroups.length,
        vendorServices: vendorServices.length,
        vendorUsers: vendorUsers.length
      });
    } catch (error) {
      console.error('❌ Role Data validation failed:', error);
      this.results.push({
        service: 'Role Data',
        endpoint: 'users/role-data',
        status: 'error',
        message: 'Failed to fetch role data',
        dataCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get validation summary
   */
  getValidationSummary(): {
    total: number;
    successful: number;
    empty: number;
    failed: number;
    issues: ValidationResult[];
  } {
    const successful = this.results.filter(r => r.status === 'success').length;
    const empty = this.results.filter(r => r.status === 'empty').length;
    const failed = this.results.filter(r => r.status === 'error').length;
    const issues = this.results.filter(r => r.status !== 'success');
    
    return {
      total: this.results.length,
      successful,
      empty,
      failed,
      issues
    };
  }

  /**
   * Print detailed validation report
   */
  printValidationReport(): void {
    const summary = this.getValidationSummary();
    
    console.group('📊 Dropdown Validation Report');
    
    console.log(`📈 Summary: ${summary.successful}/${summary.total} services working properly`);
    console.log(`✅ Successful: ${summary.successful}`);
    console.log(`⚠️ Empty Results: ${summary.empty}`);
    console.log(`❌ Failed: ${summary.failed}`);
    
    if (summary.issues.length > 0) {
      console.group('🚨 Issues Found:');
      summary.issues.forEach(issue => {
        const icon = issue.status === 'error' ? '❌' : '⚠️';
        console.log(`${icon} ${issue.service} (${issue.endpoint}): ${issue.message}`);
        if (issue.error) {
          console.log(`   Error: ${issue.error}`);
        }
        if (issue.sampleData) {
          console.log(`   Sample Data:`, issue.sampleData);
        }
      });
      console.groupEnd();
    }
    
    console.groupEnd();
  }

  /**
   * Get results
   */
  getResults(): ValidationResult[] {
    return this.results;
  }
}

/**
 * Quick validation function for development
 */
export const validateAllDropdowns = async (): Promise<ValidationResult[]> => {
  const validator = new DropdownValidator();
  const results = await validator.validateAllDropdowns();
  validator.printValidationReport();
  return results;
};

/**
 * Test specific dropdown service
 */
export const testDropdownService = async (serviceName: string): Promise<ValidationResult | null> => {
  const validator = new DropdownValidator();
  
  switch (serviceName.toLowerCase()) {
    case 'groups':
      await validator.validateGroups();
      break;
    case 'roles':
      await validator.validateRoles();
      break;
    case 'modules':
      await validator.validateModules();
      break;
    case 'studios':
      await validator.validateStudios();
      break;
    case 'roledata':
      await validator.validateRoleData();
      break;
    default:
      console.error('Unknown service:', serviceName);
      return null;
  }
  
  const results = validator.getResults();
  return results[0] || null;
};
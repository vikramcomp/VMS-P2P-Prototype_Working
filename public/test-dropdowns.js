/**
 * Browser Console Test Script for Dropdown Validation
 * 
 * Copy and paste this script into your browser console on any VMS page to test all dropdowns.
 * This will help identify which dropdown services are working and which are returning blank results.
 */

// Test script for browser console
const testAllDropdowns = async () => {
  console.log('🚀 Starting comprehensive dropdown validation...');
  
  try {
    // Import validation utility
    const { validateAllDropdowns } = await import('/src/utils/dropdown-validator.ts');
    
    // Run all validations
    const results = await validateAllDropdowns();
    
    // Show summary
    console.log('📋 Validation Complete! Check the detailed report above.');
    
    return results;
  } catch (error) {
    console.error('❌ Validation failed:', error);
    
    // Fallback: Manual testing
    console.log('🔄 Running manual validation as fallback...');
    
    const manualResults = [];
    
    // Test Groups
    try {
      const { getFormattedGroups } = await import('/src/services/groups-service.ts');
      const groups = await getFormattedGroups();
      console.log('🏢 Groups:', groups.length, 'items', groups[0]);
      manualResults.push({ service: 'Groups', count: groups.length, sample: groups[0] });
    } catch (e) {
      console.error('❌ Groups failed:', e);
      manualResults.push({ service: 'Groups', error: e.message });
    }
    
    // Test Roles
    try {
      const { getFormattedRoles } = await import('/src/services/groups-service.ts');
      const roles = await getFormattedRoles();
      console.log('👥 Roles:', roles.length, 'items', roles[0]);
      manualResults.push({ service: 'Roles', count: roles.length, sample: roles[0] });
    } catch (e) {
      console.error('❌ Roles failed:', e);
      manualResults.push({ service: 'Roles', error: e.message });
    }
    
    // Test Studios
    try {
      const { studiosService } = await import('/src/services/studios-service.ts');
      const studiosResponse = await studiosService.getStudios();
      const studios = studiosResponse.data || [];
      console.log('🎬 Studios:', studios.length, 'items', studios[0]);
      manualResults.push({ service: 'Studios', count: studios.length, sample: studios[0] });
    } catch (e) {
      console.error('❌ Studios failed:', e);
      manualResults.push({ service: 'Studios', error: e.message });
    }
    
    return manualResults;
  }
};

// Test individual dropdown
const testDropdown = async (serviceName) => {
  console.log(`🧪 Testing ${serviceName} dropdown...`);
  
  try {
    switch (serviceName.toLowerCase()) {
      case 'groups':
        const { getFormattedGroups } = await import('/src/services/groups-service.ts');
        const groups = await getFormattedGroups();
        console.log(`✅ Groups: ${groups.length} items`, groups);
        return groups;
        
      case 'roles':
        const { getFormattedRoles } = await import('/src/services/groups-service.ts');
        const roles = await getFormattedRoles();
        console.log(`✅ Roles: ${roles.length} items`, roles);
        return roles;
        
      case 'studios':
        const { studiosService } = await import('/src/services/studios-service.ts');
        const studiosResponse = await studiosService.getStudios();
        const studios = studiosResponse.data || [];
        console.log(`✅ Studios: ${studios.length} items`, studios);
        return studios;
        
      default:
        console.error('❌ Unknown service. Available: groups, roles, studios');
        return null;
    }
  } catch (error) {
    console.error(`❌ ${serviceName} test failed:`, error);
    return null;
  }
};

// Make functions available globally
window.testAllDropdowns = testAllDropdowns;
window.testDropdown = testDropdown;

console.log('🔧 Dropdown test utilities loaded!');
console.log('📝 Available commands:');
console.log('   testAllDropdowns() - Test all dropdown services');
console.log('   testDropdown("groups") - Test specific service (groups, roles, studios)');
console.log('');
console.log('🚀 Run testAllDropdowns() to start comprehensive testing');
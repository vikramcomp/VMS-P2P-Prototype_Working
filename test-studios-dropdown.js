/**
 * Studios Dropdown Test Script
 * 
 * Run this script in the browser console to test the studios dropdown functionality
 * Navigate to: http://localhost:3002/groups/new
 */

console.log('🎬 Starting Studios Dropdown Test');

// Test 1: Check if studios service is working
async function testStudiosService() {
  try {
    console.log('📡 Testing Studios Service...');
    
    // Make a direct API call to test transformation
    const baseURL = 'https://vms2api.azurewebsites.net/api';
    const response = await fetch(`${baseURL}/LookUp/Studios`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const rawData = await response.json();
    console.log('📊 Raw API Response:', rawData);
    
    // Test transformation
    if (window.transformApiResponse) {
      const transformedData = window.transformApiResponse(rawData);
      console.log('🔄 Transformed Response:', transformedData);
    }
    
    return rawData;
  } catch (error) {
    console.error('❌ Studios Service Test Failed:', error);
    return null;
  }
}

// Test 2: Check dropdown rendering
function testDropdownRendering() {
  console.log('🔍 Testing Dropdown Rendering...');
  
  // Look for studio dropdown elements
  const studioDropdowns = document.querySelectorAll('[role="combobox"]');
  console.log('📋 Found dropdowns:', studioDropdowns.length);
  
  studioDropdowns.forEach((dropdown, index) => {
    const label = dropdown.getAttribute('aria-label') || 'Unknown';
    console.log(`📋 Dropdown ${index + 1}: ${label}`);
    
    // Check if it's the studio dropdown
    if (label.toLowerCase().includes('studio') || 
        dropdown.closest('[data-testid*="studio"]') ||
        dropdown.getAttribute('name') === 'studioId') {
      console.log('🎯 Found Studios Dropdown!');
      
      // Check for options
      const options = dropdown.querySelectorAll('[role="option"]');
      console.log(`📝 Options found: ${options.length}`);
      
      if (options.length === 0) {
        // Check if dropdown is closed - look for trigger button
        const trigger = dropdown.closest('.relative')?.querySelector('button');
        if (trigger) {
          console.log('🔽 Clicking dropdown to open...');
          trigger.click();
          
          // Wait a moment then check again
          setTimeout(() => {
            const newOptions = document.querySelectorAll('[role="option"]');
            console.log(`📝 Options after opening: ${newOptions.length}`);
            
            newOptions.forEach((option, idx) => {
              console.log(`  Option ${idx + 1}: ${option.textContent}`);
            });
          }, 500);
        }
      }
    }
  });
}

// Test 3: Check useStudios hook data
function testUseStudiosHook() {
  console.log('🪝 Testing useStudios Hook...');
  
  // Look for React DevTools or hook state
  if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    console.log('⚛️ React found, checking component state...');
    // This would require more complex React inspection
  }
  
  // Check localStorage for any cached studio data
  const storageKeys = Object.keys(localStorage);
  storageKeys.forEach(key => {
    if (key.toLowerCase().includes('studio')) {
      console.log(`💾 Found studio-related storage: ${key}`, localStorage.getItem(key));
    }
  });
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Complete Studios Dropdown Test Suite');
  console.log('=====================================');
  
  const apiData = await testStudiosService();
  console.log('=====================================');
  
  testDropdownRendering();
  console.log('=====================================');
  
  testUseStudiosHook();
  console.log('=====================================');
  
  console.log('✅ Test Suite Complete!');
  
  if (apiData) {
    console.log('📈 Summary:');
    console.log('- API Response received:', !!apiData);
    console.log('- Data structure:', typeof apiData);
    console.log('- Records found:', Array.isArray(apiData) ? apiData.length : 
                    (apiData.Data?.Records?.length || 'Unknown'));
  }
}

// Auto-run if on the correct page
if (window.location.pathname === '/groups/new') {
  console.log('📍 Detected Add New Group page - running tests automatically in 2 seconds...');
  setTimeout(runAllTests, 2000);
} else {
  console.log('📍 Navigate to http://localhost:3002/groups/new then run: runAllTests()');
}

// Expose functions globally for manual testing
window.testStudiosDropdown = {
  runAllTests,
  testStudiosService,
  testDropdownRendering,
  testUseStudiosHook
};

console.log('🎯 Studios dropdown test functions available:', Object.keys(window.testStudiosDropdown));
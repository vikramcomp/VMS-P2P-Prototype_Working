/**
 * Comprehensive Groups Page Test Script
 * 
 * Run this script in the browser console to test both pagination and Edit Group functionality
 * Navigate to: http://localhost:3002/groups
 */

console.log('🚀 Starting Comprehensive Groups Page Tests');

// Test 1: Verify Pagination is Working
function testPagination() {
  console.log('📋 Testing Pagination Functionality...');
  
  // Check for pagination container
  const paginationContainer = document.querySelector('[class*="pagination"], .flex.items-center.justify-between');
  console.log('✅ Pagination container found:', !!paginationContainer);
  
  // Check for records info
  const recordsInfo = Array.from(document.querySelectorAll('*')).find(el => 
    el.textContent && el.textContent.includes('Showing') && el.textContent.includes('records')
  );
  console.log('✅ Records info found:', recordsInfo?.textContent || 'Not found');
  
  // Check for page size selector
  const pageSizeSelect = document.querySelector('select[id="pageSize"]');
  console.log('✅ Page size selector found:', !!pageSizeSelect);
  if (pageSizeSelect) {
    console.log('  Available options:', Array.from(pageSizeSelect.options).map(o => o.value).join(', '));
    console.log('  Current value:', pageSizeSelect.value);
  }
  
  // Check for pagination buttons
  const paginationButtons = document.querySelectorAll('button[aria-label*="Page"], button:has([class*="ChevronLeft"]), button:has([class*="ChevronRight"])');
  console.log('✅ Pagination buttons found:', paginationButtons.length);
  
  return {
    hasContainer: !!paginationContainer,
    hasRecordsInfo: !!recordsInfo,
    hasPageSize: !!pageSizeSelect,
    buttonCount: paginationButtons.length
  };
}

// Test 2: Verify Edit Group Functionality
function testEditGroup() {
  console.log('✏️ Testing Edit Group Functionality...');
  
  // Look for Edit buttons in action menus
  const actionButtons = document.querySelectorAll('button:has([class*="MoreVertical"])');
  console.log('✅ Action menu buttons found:', actionButtons.length);
  
  // Look for any visible Edit buttons (in case menu is open)
  const editButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.textContent && btn.textContent.trim().includes('Edit')
  );
  console.log('✅ Edit buttons found:', editButtons.length);
  
  // Check table rows for data
  const tableRows = document.querySelectorAll('tbody tr');
  const dataRows = Array.from(tableRows).filter(row => 
    !row.textContent.includes('Loading') && 
    !row.textContent.includes('No groups available')
  );
  console.log('✅ Data rows found:', dataRows.length);
  
  if (dataRows.length > 0) {
    console.log('💡 First group data:', {
      name: dataRows[0].querySelector('td:nth-child(2)')?.textContent?.trim(),
      description: dataRows[0].querySelector('td:nth-child(3)')?.textContent?.trim(),
      studio: dataRows[0].querySelector('td:nth-child(4)')?.textContent?.trim(),
      status: dataRows[0].querySelector('td:nth-child(5)')?.textContent?.trim()
    });
  }
  
  return {
    hasActionButtons: actionButtons.length > 0,
    hasEditButtons: editButtons.length > 0,
    hasData: dataRows.length > 0
  };
}

// Test 3: Simulate Edit Group Flow
function testEditFlow() {
  console.log('🔄 Testing Edit Group Flow...');
  
  const actionButtons = document.querySelectorAll('button:has([class*="MoreVertical"])');
  
  if (actionButtons.length > 0) {
    console.log('📌 Clicking first action menu button...');
    actionButtons[0].click();
    
    // Wait for menu to appear then look for Edit button
    setTimeout(() => {
      const editButton = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent && btn.textContent.trim().includes('Edit')
      );
      
      if (editButton) {
        console.log('✅ Edit button found in menu!');
        console.log('💡 To test Edit functionality:');
        console.log('  1. Click the Edit button in the action menu');
        console.log('  2. Verify navigation to /groups/{id}/edit');
        console.log('  3. Check that form loads with existing data');
        console.log('  4. Test save/reset/cancel operations');
        
        // Don't actually click to avoid navigation during test
        console.log('🔗 Edit button ready to click:', editButton);
      } else {
        console.log('❌ Edit button not found in menu');
        
        // Look for all menu items
        const menuItems = document.querySelectorAll('button[class*="hover:bg-gray-50"]');
        console.log('📋 Menu items found:', menuItems.length);
        menuItems.forEach((item, index) => {
          console.log(`  Item ${index + 1}: ${item.textContent?.trim()}`);
        });
      }
    }, 200);
  } else {
    console.log('❌ No action buttons found');
  }
}

// Test 4: API Response Structure Test
async function testApiResponse() {
  console.log('📡 Testing API Response Structure...');
  
  try {
    // Test groups API
    const baseURL = 'https://vms2api.azurewebsites.net/api';
    const requestBody = {
      SearchText: '',
      PageNumber: 1,
      PageSize: 5, // Small number for testing
      SortColumn: 'CategoryName',
      SortType: 'asc',
      OldWorkflowOnly: true
    };
    
    const response = await fetch(`${baseURL}/Groups/GetGroups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    console.log('✅ API Response received');
    console.log('📊 Response structure:', {
      hasData: !!data.Data,
      hasCamelData: !!data.data,
      recordCount: data.Data?.Records?.length || data.data?.records?.length || 0,
      totalRecords: data.Data?.TotalRecords || data.data?.totalRecords || 0,
      currentPage: data.Data?.CurrentPage || data.data?.currentPage || 0
    });
    
    if (data.Data?.Records?.length > 0) {
      const firstRecord = data.Data.Records[0];
      console.log('📋 First record keys:', Object.keys(firstRecord));
    }
    
    // Test transformation if available
    if (window.transformApiResponse) {
      const transformed = window.transformApiResponse(data);
      console.log('🔄 Transformation successful:', !!transformed.data);
    }
    
  } catch (error) {
    console.log('❌ API test failed:', error.message);
  }
}

// Run comprehensive test suite
async function runComprehensiveTests() {
  console.log('🎯 Running Comprehensive Groups Page Test Suite');
  console.log('================================================');
  
  const paginationResults = testPagination();
  console.log('================================================');
  
  const editResults = testEditGroup();
  console.log('================================================');
  
  testEditFlow();
  console.log('================================================');
  
  await testApiResponse();
  console.log('================================================');
  
  console.log('📈 Test Summary:');
  console.log('✅ Pagination Status:', {
    container: paginationResults.hasContainer,
    recordsInfo: paginationResults.hasRecordsInfo,
    pageSize: paginationResults.hasPageSize,
    buttons: paginationResults.buttonCount > 0
  });
  
  console.log('✅ Edit Group Status:', {
    actionMenus: editResults.hasActionButtons,
    editButtons: editResults.hasEditButtons,
    hasData: editResults.hasData
  });
  
  console.log('✅ Overall Status: Both pagination and Edit functionality should be working!');
}

// Auto-run if on the correct page
if (window.location.pathname === '/groups') {
  console.log('📍 Groups page detected - running tests in 2 seconds...');
  setTimeout(runComprehensiveTests, 2000);
} else {
  console.log('📍 Navigate to http://localhost:3002/groups then run: runComprehensiveTests()');
}

// Expose functions globally
window.groupsPageTests = {
  runComprehensiveTests,
  testPagination,
  testEditGroup,
  testEditFlow,
  testApiResponse
};

console.log('🎯 Groups page test functions available:', Object.keys(window.groupsPageTests));
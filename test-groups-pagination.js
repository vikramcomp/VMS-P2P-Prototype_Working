/**
 * Groups Pagination Debug Script
 * 
 * Run this script in the browser console on the Groups page to debug pagination issues
 * Navigate to: http://localhost:3002/groups
 */

console.log('🔍 Starting Groups Pagination Debug');

// Test 1: Check API Response Structure
async function testGroupsAPI() {
  try {
    console.log('📡 Testing Groups API...');
    
    const baseURL = 'https://vms2api.azurewebsites.net/api';
    const requestBody = {
      SearchText: '',
      PageNumber: 1,
      PageSize: 10,
      SortColumn: 'CategoryName',
      SortType: 'asc',
      OldWorkflowOnly: true
    };
    
    const response = await fetch(`${baseURL}/Groups/GetGroups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    const rawData = await response.json();
    console.log('📊 Raw API Response:', rawData);
    console.log('📊 Raw Response Structure:', {
      hasData: !!rawData.Data,
      hasRecords: !!rawData.Data?.Records,
      totalRecords: rawData.Data?.TotalRecords,
      currentPage: rawData.Data?.CurrentPage,
      pageSize: rawData.Data?.PageSize,
      recordsLength: Array.isArray(rawData.Data?.Records) ? rawData.Data.Records.length : 'Not an array'
    });
    
    // Test transformation if available
    if (window.transformApiResponse) {
      const transformedData = window.transformApiResponse(rawData);
      console.log('🔄 Transformed Response:', transformedData);
      console.log('🔄 Transformed Structure:', {
        hasData: !!transformedData.data,
        hasRecords: !!transformedData.data?.records,
        totalRecords: transformedData.data?.totalRecords,
        currentPage: transformedData.data?.currentPage,
        pageSize: transformedData.data?.pageSize
      });
    }
    
    return rawData;
  } catch (error) {
    console.error('❌ Groups API Test Failed:', error);
    return null;
  }
}

// Test 2: Check React Component State
function testReactState() {
  console.log('⚛️ Testing React Component State...');
  
  // Look for pagination elements
  const paginationContainer = document.querySelector('[class*="pagination"]');
  console.log('📋 Pagination Container:', paginationContainer);
  
  const paginationElements = document.querySelectorAll('button[aria-label*="Page"]');
  console.log('📋 Pagination Buttons:', paginationElements.length);
  
  const recordsInfo = document.querySelector('span:contains("Showing"), [class*="records"]');
  console.log('📋 Records Info Element:', recordsInfo?.textContent);
  
  // Check for any pagination-related text
  const allText = document.body.innerText;
  const paginationText = allText.match(/Showing \d+ to \d+ of \d+ records/);
  console.log('📋 Pagination Text Found:', paginationText);
  
  // Check table rows count
  const tableRows = document.querySelectorAll('tbody tr');
  console.log('📋 Table Rows Count:', tableRows.length);
  
  // Check if there are any loading indicators
  const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
  console.log('⏳ Loading Indicators:', loadingElements.length);
}

// Test 3: Check Console Logs for Errors
function checkConsoleLogs() {
  console.log('📝 Checking for Related Console Messages...');
  
  // This won't show historical console logs, but can help identify current issues
  console.log('💡 To see full debug info:');
  console.log('1. Open Network tab and reload page');
  console.log('2. Look for "GetGroups" API call');
  console.log('3. Check Console for React/useGroups logs');
  console.log('4. Inspect elements to see if pagination HTML exists');
}

// Test 4: Simulate Pagination Action
function testPaginationAction() {
  console.log('🎯 Testing Pagination Actions...');
  
  // Look for page size selector
  const pageSizeSelect = document.querySelector('select[id="pageSize"]');
  if (pageSizeSelect) {
    console.log('📋 Page Size Select Found:', pageSizeSelect.value);
    console.log('📋 Available Options:', Array.from(pageSizeSelect.options).map(o => o.value));
  } else {
    console.log('❌ Page Size Select Not Found');
  }
  
  // Look for next/previous buttons
  const prevButton = document.querySelector('button[aria-label*="Previous"], button:has([class*="ChevronLeft"])');
  const nextButton = document.querySelector('button[aria-label*="Next"], button:has([class*="ChevronRight"])');
  
  console.log('📋 Previous Button:', !!prevButton, prevButton?.disabled);
  console.log('📋 Next Button:', !!nextButton, nextButton?.disabled);
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Complete Groups Pagination Debug Suite');
  console.log('================================================');
  
  const apiData = await testGroupsAPI();
  console.log('================================================');
  
  testReactState();
  console.log('================================================');
  
  checkConsoleLogs();
  console.log('================================================');
  
  testPaginationAction();
  console.log('================================================');
  
  console.log('✅ Debug Suite Complete!');
  
  if (apiData) {
    console.log('📈 Quick Summary:');
    console.log('- API Response received:', !!apiData);
    console.log('- Has pagination data:', !!(apiData.Data?.TotalRecords));
    console.log('- Total records from API:', apiData.Data?.TotalRecords || 0);
    console.log('- Records in response:', Array.isArray(apiData.Data?.Records) ? apiData.Data.Records.length : 0);
  }
}

// Auto-run if on the correct page
if (window.location.pathname === '/groups') {
  console.log('📍 Detected Groups page - running tests automatically in 2 seconds...');
  setTimeout(runAllTests, 2000);
} else {
  console.log('📍 Navigate to http://localhost:3002/groups then run: runAllTests()');
}

// Expose functions globally for manual testing
window.debugGroupsPagination = {
  runAllTests,
  testGroupsAPI,
  testReactState,
  checkConsoleLogs,
  testPaginationAction
};

console.log('🎯 Groups pagination debug functions available:', Object.keys(window.debugGroupsPagination));
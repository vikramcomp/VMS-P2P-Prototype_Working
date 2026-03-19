// Configuration object to control mock behavior
export const mockConfig = {
  paymentOptions: {
    scenario: 'success' as 'success' | 'http-error' | 'network-error',
    httpStatus: 500,
  },
};

// Helper to reset mock config
export function resetMockConfig() {
  mockConfig.paymentOptions.scenario = 'success';
  mockConfig.paymentOptions.httpStatus = 500;
}

// Helper functions to create responses
function createSuccessResponse(status: number, data: any): Promise<Response> {
  return Promise.resolve({
    ok: true,
    status,
    json: async () => data,
  } as Response);
}

function createErrorResponse(status: number, statusText: string, message: string): Promise<Response> {
  return Promise.resolve({
    ok: false,
    status,
    statusText,
    json: async () => ({ error: statusText, message }),
  } as Response);
}

// Setup fetch mock handlers for API endpoints
export function setupFetchMock() {
  const mockPaymentOptionsResponse = {
    data: [
      { Id: -1, Name: '--Select--' },
      { Id: 1, Name: 'INR' },
      { Id: 2, Name: 'USD' },
      { Id: 3, Name: 'EUR' },
      { Id: 4, Name: 'GBP' }
    ]
  };

  const mockPurchasingGroupsResponse = {
    data: [
      { Value: '', Text: '--Select--' },
      { Value: '1', Text: 'IT Department' },
      { Value: '2', Text: 'HR Department' },
      { Value: '3', Text: 'Finance Department' },
      { Value: '4', Text: 'Operations' }
    ]
  };

  const mockRequestTypesResponse = {
    data: {
      records: [
        { requestTypeId: 1, requestTypeName: 'Consulting' },
        { requestTypeId: 2, requestTypeName: 'Software' },
        { requestTypeId: 3, requestTypeName: 'Hardware' },
        { requestTypeId: 4, requestTypeName: 'Services' }
      ]
    }
  };

  const mockSubgroupsResponse = {
    data: {
      records: [
        { subgroupId: 101, subgroupName: 'Development Team' },
        { subgroupId: 102, subgroupName: 'QA Team' },
        { subgroupId: 103, subgroupName: 'DevOps Team' }
      ]
    }
  };

  const mockFinanceHeadsResponse = {
    Data: {
      Records: [
        { Id: -1, Name: '--Select--' },
        { Id: 1, Name: 'John Smith' },
        { Id: 2, Name: 'Jane Doe' },
        { Id: 3, Name: 'Robert Johnson' },
        { Id: 4, Name: 'Maria Garcia' }
      ]
    }
  };

  const mockServicesResponse = {
    Data: {
      Records: [
        { Id: 1, Name: 'Cloud Services' },
        { Id: 2, Name: 'Software Licenses' },
        { Id: 3, Name: 'Hardware Equipment' },
        { Id: 4, Name: 'Consulting Services' },
        { Id: 5, Name: 'Maintenance Support' }
      ]
    }
  };

  const mockApproversResponse = {
    data: {
      records: [
        {
          approver2List: [
            { Id: 1, Name: 'Sarah Connor' },
            { Id: 2, Name: 'Kyle Reese' },
            { Id: 3, Name: 'John Connor' }
          ],
          approver3List: [
            { Id: 2, Name: 'Kyle Reese' },
            { Id: 3, Name: 'John Connor' },
            { Id: 4, Name: 'Ellen Ripley' }
          ],
          approver4List: [
            { Id: 3, Name: 'John Connor' },
            { Id: 4, Name: 'Ellen Ripley' },
            { Id: 5, Name: 'Dutch Schaefer' }
          ]
        }
      ]
    }
  };

  const mockFilteredApprovers3Response = {
    data: {
      records: [
        {
          approver3List: [
            { Id: 3, Name: 'Approver Three A' },
            { Id: 4, Name: 'Approver Three B' },
            { Id: 5, Name: 'Approver Three C' }
          ]
        }
      ]
    }
  };

  const mockFilteredApprovers4Response = {
    data: {
      records: [
        {
          approver4List: [
            { Id: 4, Name: 'Approver Four A' },
            { Id: 5, Name: 'Approver Four B' },
            { Id: 6, Name: 'Approver Four C' }
          ]
        }
      ]
    }
  };

  const mockVendorManagersResponse = {
    data: {
      records: [
        {
          label: 'Manager Assignment',
          vendorManager: 'Alice Manager',
          poGenerator: 'Bob Generator',
          poDispatch: 'Charlie Dispatcher'
        }
      ]
    }
  };

  const mockWorkflowCreateResponse = {
    success: true,
    message: 'Workflow created successfully',
    data: {
      workflowId: 12345
    }
  };

  // Mock countries response - expects array with countryId and countryName
  const mockCountriesResponse = [
    { countryId: 1, countryName: 'United States' },
    { countryId: 2, countryName: 'United Kingdom' },
    { countryId: 3, countryName: 'Canada' },
    { countryId: 4, countryName: 'Australia' },
    { countryId: 5, countryName: 'India' }
  ];

  // Mock states response - expects array with stateId and stateName
  const mockStatesResponse = [
    { stateId: 1, stateName: 'California' },
    { stateId: 2, stateName: 'Texas' },
    { stateId: 3, stateName: 'New York' },
    { stateId: 4, stateName: 'Florida' },
    { stateId: 5, stateName: 'Illinois' }
  ];

  // Mock vendor types response - can be array or { data: array }
  const mockVendorTypesResponse = [
    { vendorTypeId: 1, vendorType: 'Company' },
    { vendorTypeId: 2, vendorType: 'Individual' }
  ];

  // Mock payment modes response - expects nested structure
  const mockPaymentModesResponse = {
    data: {
      records: [
        {
          availablePaymentModes: [
            { priceUnitId: 1, priceUnitName: 'Per Hour' },
            { priceUnitId: 2, priceUnitName: 'Per Day' },
            { priceUnitId: 3, priceUnitName: 'Per Week' },
            { priceUnitId: 4, priceUnitName: 'Per Month' },
            { priceUnitId: 5, priceUnitName: 'Fixed Price' }
          ]
        }
      ]
    }
  };

  // Mock service details response - expects nested structure with availableServiceDetails
  const mockServiceDetailsResponse = {
    data: {
      records: [
        {
          availableServiceDetails: [
            { serviceDetailId: 1, serviceName: 'Web Development' },
            { serviceDetailId: 2, serviceName: 'Mobile Development' },
            { serviceDetailId: 3, serviceName: 'UI/UX Design' },
            { serviceDetailId: 4, serviceName: 'QA Testing' },
            { serviceDetailId: 5, serviceName: 'DevOps Services' }
          ]
        }
      ]
    }
  };

  // Mock vendor creation response
  const mockVendorCreateResponse = {
    success: true,
    message: 'Vendor created successfully',
    data: {
      vendorId: 123
    }
  };

  // Helper functions to handle different route types
  const handlePaymentOptionsRequest = (url: string) => {
    if (url.includes('error=network')) {
      return Promise.reject(new Error('Network request failed'));
    }
    if (url.includes('error=500')) {
      return createErrorResponse(500, 'Internal Server Error', 'Something went wrong');
    }
    if (url.includes('error=404')) {
      return createErrorResponse(404, 'Not Found', 'Payment options endpoint not found');
    }
    if (url.includes('error=401')) {
      return createErrorResponse(401, 'Unauthorized', 'Authentication required');
    }
    
    if (mockConfig.paymentOptions.scenario === 'network-error') {
      return Promise.reject(new Error('Network request failed'));
    }
    
    if (mockConfig.paymentOptions.scenario === 'http-error') {
      const status = mockConfig.paymentOptions.httpStatus || 500;
      const statusMessages: { [key: number]: string } = {
        400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden',
        404: 'Not Found', 500: 'Internal Server Error', 502: 'Bad Gateway',
        503: 'Service Unavailable',
      };
      return createErrorResponse(status, statusMessages[status] || 'Error', `HTTP ${status} error occurred`);
    }
    
    return createSuccessResponse(200, mockPaymentOptionsResponse);
  };

  const handleApproversRequest = (url: string) => {
    if (url.includes('selectedApprover3=')) {
      return createSuccessResponse(200, mockFilteredApprovers4Response);
    }
    if (url.includes('selectedApprover2=') && !url.includes('groupId=')) {
      return createSuccessResponse(200, mockFilteredApprovers3Response);
    }
    return createSuccessResponse(200, mockApproversResponse);
  };

  const handleGetRequest = (url: string) => {
    if (url.includes('/lookups/countries')) return createSuccessResponse(200, mockCountriesResponse);
    if (url.includes('/lookups/states/')) return createSuccessResponse(200, mockStatesResponse);
    if (url.includes('/lookups/payment-options')) return handlePaymentOptionsRequest(url);
    if (url.includes('/lookups/request-types')) return createSuccessResponse(200, mockRequestTypesResponse);
    if (url.includes('/lookups/groups')) return createSuccessResponse(200, mockPurchasingGroupsResponse);
    if (url.includes('/group-subgroup/groups/') && url.includes('/subgroups')) return createSuccessResponse(200, mockSubgroupsResponse);
    if (url.includes('/workflow-editor/finance-heads')) return createSuccessResponse(200, mockFinanceHeadsResponse);
    if (url.includes('/workflow-editor/services')) return createSuccessResponse(200, mockServicesResponse);
    if (url.includes('/workflow-editor/vendor-managers')) return createSuccessResponse(200, mockVendorManagersResponse);
    if (url.includes('/workflow-editor/approvers')) return handleApproversRequest(url);
    if (url.includes('/vendors/vendor-types')) return createSuccessResponse(200, mockVendorTypesResponse);
    if (url.includes('/vendors/0/payment-modes') || url.includes('/vendors/*/payment-modes')) return createSuccessResponse(200, mockPaymentModesResponse);
    if (url.includes('/vendors/0/service-details-mapping') || url.includes('/vendors/*/service-details-mapping')) return createSuccessResponse(200, mockServiceDetailsResponse);
    return createErrorResponse(404, 'Not Found', 'Not found');
  };

  const handlePostRequest = (url: string) => {
    if (url.includes('/workflow-editor') && !url.includes('?')) return createSuccessResponse(201, mockWorkflowCreateResponse);
    if (url.includes('/vendors') && !url.includes('/vendor-types') && !url.includes('/payment-modes') && !url.includes('/service-details')) {
      return createSuccessResponse(201, mockVendorCreateResponse);
    }
    return createErrorResponse(404, 'Not Found', 'Not found');
  };

  (globalThis.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
    if (options?.method === 'POST') {
      return handlePostRequest(url);
    }
    return handleGetRequest(url);
  });
}

export function resetFetchMock() {
  (globalThis.fetch as jest.Mock).mockClear();
  resetMockConfig();
}

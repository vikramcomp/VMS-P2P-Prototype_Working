import { setupFetchMock, resetFetchMock, mockConfig, resetMockConfig } from '../fetch-mock';

describe('fetch-mock', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
    setupFetchMock();
  });

  afterEach(() => {
    resetFetchMock();
    jest.clearAllMocks();
  });

  describe('setupFetchMock', () => {
    it('should setup fetch mock successfully', () => {
      expect(globalThis.fetch).toBeDefined();
      expect(typeof globalThis.fetch).toBe('function');
    });
  });

  describe('Payment Options Endpoint', () => {
    it('should return payment options successfully', async () => {
      const response = await fetch('/lookups/payment-options');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(5);
      expect(data.data[0]).toEqual({ Id: -1, Name: '--Select--' });
      expect(data.data[1]).toEqual({ Id: 1, Name: 'INR' });
    });

    it('should return network error when error=network query param is set', async () => {
      await expect(
        fetch('/lookups/payment-options?error=network')
      ).rejects.toThrow('Network request failed');
    });

    it('should return 500 error when error=500 query param is set', async () => {
      const response = await fetch('/lookups/payment-options?error=500');
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
      expect(response.statusText).toBe('Internal Server Error');
      expect(data.error).toBe('Internal Server Error');
    });

    it('should return 404 error when error=404 query param is set', async () => {
      const response = await fetch('/lookups/payment-options?error=404');
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(response.statusText).toBe('Not Found');
      expect(data.error).toBe('Not Found');
    });

    it('should return 401 error when error=401 query param is set', async () => {
      const response = await fetch('/lookups/payment-options?error=401');
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
      expect(response.statusText).toBe('Unauthorized');
      expect(data.error).toBe('Unauthorized');
    });

    it('should return network error when mockConfig scenario is network-error', async () => {
      mockConfig.paymentOptions.scenario = 'network-error';
      
      await expect(
        fetch('/lookups/payment-options')
      ).rejects.toThrow('Network request failed');
    });

    it('should return 500 HTTP error when mockConfig scenario is http-error', async () => {
      mockConfig.paymentOptions.scenario = 'http-error';
      mockConfig.paymentOptions.httpStatus = 500;
      
      const response = await fetch('/lookups/payment-options');
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
      expect(data.message).toBe('HTTP 500 error occurred');
    });

    it('should return 400 HTTP error when mockConfig is set to 400', async () => {
      mockConfig.paymentOptions.scenario = 'http-error';
      mockConfig.paymentOptions.httpStatus = 400;
      
      const response = await fetch('/lookups/payment-options');


      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(response.statusText).toBe('Bad Request');
    });

    it('should return 401 HTTP error when mockConfig is set to 401', async () => {
      mockConfig.paymentOptions.scenario = 'http-error';
      mockConfig.paymentOptions.httpStatus = 401;
      
      const response = await fetch('/lookups/payment-options');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
      expect(response.statusText).toBe('Unauthorized');
    });

    it('should return 403 HTTP error when mockConfig is set to 403', async () => {
      mockConfig.paymentOptions.scenario = 'http-error';
      mockConfig.paymentOptions.httpStatus = 403;
      
      const response = await fetch('/lookups/payment-options');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);
      expect(response.statusText).toBe('Forbidden');
    });

    it('should return 404 HTTP error when mockConfig is set to 404', async () => {
      mockConfig.paymentOptions.scenario = 'http-error';
      mockConfig.paymentOptions.httpStatus = 404;
      
      const response = await fetch('/lookups/payment-options');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(response.statusText).toBe('Not Found');
    });

    it('should return 502 HTTP error when mockConfig is set to 502', async () => {
      mockConfig.paymentOptions.scenario = 'http-error';
      mockConfig.paymentOptions.httpStatus = 502;
      
      const response = await fetch('/lookups/payment-options');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(502);
      expect(response.statusText).toBe('Bad Gateway');
    });

    it('should return 503 HTTP error when mockConfig is set to 503', async () => {
      mockConfig.paymentOptions.scenario = 'http-error';
      mockConfig.paymentOptions.httpStatus = 503;
      
      const response = await fetch('/lookups/payment-options');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(503);
      expect(response.statusText).toBe('Service Unavailable');
    });

    it('should return generic error for unknown status codes', async () => {
      mockConfig.paymentOptions.scenario = 'http-error';
      mockConfig.paymentOptions.httpStatus = 599;
      
      const response = await fetch('/lookups/payment-options');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(599);
      expect(response.statusText).toBe('Error');
    });
  });

  describe('Countries Endpoint', () => {
    it('should return countries list', async () => {
      const response = await fetch('/lookups/countries');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(data).toHaveLength(5);
      expect(data[0]).toEqual({ countryId: 1, countryName: 'United States' });
    });
  });

  describe('States Endpoint', () => {
    it('should return states list by country ID', async () => {
      const response = await fetch('/lookups/states/1');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(data).toHaveLength(5);
      expect(data[0]).toEqual({ stateId: 1, stateName: 'California' });
    });
  });

  describe('Groups Endpoint', () => {
    it('should return purchasing groups', async () => {
      const response = await fetch('/lookups/groups');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(5);
      expect(data.data[0]).toEqual({ Value: '', Text: '--Select--' });
      expect(data.data[1]).toEqual({ Value: '1', Text: 'IT Department' });
    });
  });

  describe('Finance Heads Endpoint', () => {
    it('should return finance heads', async () => {
      const response = await fetch('/workflow-editor/finance-heads');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(data.Data.Records).toHaveLength(5);
      expect(data.Data.Records[0]).toEqual({ Id: -1, Name: '--Select--' });
    });
  });

  describe('Services Endpoint', () => {
    it('should return services', async () => {
      const response = await fetch('/workflow-editor/services');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(data.Data.Records).toHaveLength(5);
      expect(data.Data.Records[0]).toEqual({ Id: 1, Name: 'Cloud Services' });
    });
  });

  describe('Vendor Managers Endpoint', () => {
    it('should return vendor managers', async () => {
      const response = await fetch('/workflow-editor/vendor-managers');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(data.data.records[0]).toHaveProperty('vendorManager');
      expect(data.data.records[0].vendorManager).toBe('Alice Manager');
    });
  });

  describe('Approvers Endpoint', () => {
    it('should return all approvers with groupId', async () => {
      const response = await fetch('/workflow-editor/approvers?groupId=1');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(data.data.records[0]).toHaveProperty('approver2List');
      expect(data.data.records[0]).toHaveProperty('approver3List');
      expect(data.data.records[0]).toHaveProperty('approver4List');
    });

    it('should return filtered approver3 list when selectedApprover2 is provided', async () => {
      const response = await fetch('/workflow-editor/approvers?selectedApprover2=1');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(data.data.records[0]).toHaveProperty('approver3List');
      expect(data.data.records[0].approver3List[0].Name).toContain('Approver Three');
    });

    it('should return filtered approver4 list when selectedApprover3 is provided', async () => {
      const response = await fetch('/workflow-editor/approvers?selectedApprover3=2');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(data.data.records[0]).toHaveProperty('approver4List');
      expect(data.data.records[0].approver4List[0].Name).toContain('Approver Four');
    });
  });

  describe('Vendor Types Endpoint', () => {
    it('should return vendor types', async () => {
      const response = await fetch('/vendors/vendor-types');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0]).toEqual({ vendorTypeId: 1, vendorType: 'Company' });
    });
  });

  describe('Payment Modes Endpoint', () => {
    it('should return payment modes for vendor ID 0', async () => {
      const response = await fetch('/vendors/0/payment-modes');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(data.data.records[0].availablePaymentModes).toHaveLength(5);
      expect(data.data.records[0].availablePaymentModes[0]).toEqual({ 
        priceUnitId: 1, 
        priceUnitName: 'Per Hour' 
      });
    });

    it('should return payment modes for wildcard vendor ID', async () => {
      const response = await fetch('/vendors/*/payment-modes');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(data.data.records[0].availablePaymentModes).toBeDefined();
    });
  });

  describe('Service Details Endpoint', () => {
    it('should return service details for vendor ID 0', async () => {
      const response = await fetch('/vendors/0/service-details-mapping');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(data.data.records[0].availableServiceDetails).toHaveLength(5);
      expect(data.data.records[0].availableServiceDetails[0]).toEqual({ 
        serviceDetailId: 1, 
        serviceName: 'Web Development' 
      });
    });

    it('should return service details for wildcard vendor ID', async () => {
      const response = await fetch('/vendors/*/service-details-mapping');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(data.data.records[0].availableServiceDetails).toBeDefined();
    });
  });

  describe('Workflow Creation Endpoint', () => {
    it('should create workflow successfully', async () => {
      const response = await fetch('/workflow-editor', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Workflow' }),
      });
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.workflowId).toBe(12345);
    });
  });

  describe('Vendor Creation Endpoint', () => {
    it('should create vendor successfully', async () => {
      const response = await fetch('/vendors', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Vendor' }),
      });
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.vendorId).toBe(123);
    });

    it('should not intercept payment-modes endpoint with POST', async () => {
      const response = await fetch('/vendors/payment-modes', {
        method: 'POST',
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it('should not intercept service-details endpoint with POST', async () => {
      const response = await fetch('/vendors/service-details', {
        method: 'POST',
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });
  });

  describe('Unknown Endpoints', () => {
    it('should return 404 for unknown GET endpoints', async () => {
      const response = await fetch('/unknown/endpoint');
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(data.error).toBe('Not Found');
    });

    it('should return 404 for unknown POST endpoints', async () => {
      const response = await fetch('/unknown/endpoint', {
        method: 'POST',
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });
  });

  describe('resetMockConfig', () => {
    it('should reset mock config to default values', () => {
      mockConfig.paymentOptions.scenario = 'network-error';
      mockConfig.paymentOptions.httpStatus = 400;

      resetMockConfig();

      expect(mockConfig.paymentOptions.scenario).toBe('success');
      expect(mockConfig.paymentOptions.httpStatus).toBe(500);
    });
  });

  describe('resetFetchMock', () => {
    it('should clear fetch mock and reset config', () => {
      mockConfig.paymentOptions.scenario = 'network-error';
      const mockFn = globalThis.fetch as jest.Mock;
      
      // Make a call to add to call count
      fetch('/test');
      expect(mockFn).toHaveBeenCalled();

      resetFetchMock();

      expect(mockFn).not.toHaveBeenCalled();
      expect(mockConfig.paymentOptions.scenario).toBe('success');
    });
  });

  describe('Workflow Endpoint Edge Cases', () => {
    it('should not intercept workflow GET with query params', async () => {
      const response = await fetch('/workflow-editor?id=123', {
        method: 'POST',
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });
  });
});

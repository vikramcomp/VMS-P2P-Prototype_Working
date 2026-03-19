// Mock fetch before everything else
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({
      json: async () => data,
      status: init?.status || 200,
      headers: {
        get: () => null,
      },
    }),
  },
  NextRequest: jest.fn(),
}));

// Import after mocking
let POST: any;

beforeAll(async () => {
  const module = await import('../route');
  POST = module.POST;
});

describe('SOAP Project Proposals API Route', () => {
  const SOAP_SERVICE_URL = 'https://inspireqaservices.compunnel.com/Panther.svc';
  const SOAP_ACTION = 'http://tempuri.org/IPanther/GetProjectProposals';

  // Helper to create mock request
  const createMockRequest = (body: any) => {
    return {
      json: async () => body,
      headers: {
        get: () => null,
      },
    } as any;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Successful Requests', () => {
    it('should successfully fetch project proposals with valid requestTypeId', async () => {
      const mockXmlResponse = `<?xml version="1.0"?><soap:Envelope><soap:Body><GetProjectProposalsResponse><Result>Success</Result></GetProjectProposalsResponse></soap:Body></soap:Envelope>`;
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => mockXmlResponse,
        headers: new Map([['content-type', 'text/xml']]),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.xmlResponse).toBe(mockXmlResponse);
      expect(data.message).toBe('SOAP response received successfully');
    });

    it('should call SOAP service with correct URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      await POST(request);

      expect(mockFetch).toHaveBeenCalledWith(
        SOAP_SERVICE_URL,
        expect.any(Object)
      );
    });

    it('should include correct SOAP headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      await POST(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': SOAP_ACTION,
          },
        })
      );
    });

    it('should build correct SOAP envelope with requestTypeId', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 123 });
      await POST(request);

      const soapBody = mockFetch.mock.calls[0][1].body;
      expect(soapBody).toContain('<tem:requestTypeId>123</tem:requestTypeId>');
      expect(soapBody).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(soapBody).toContain('<tem:GetProjectProposals>');
    });

    it('should handle string requestTypeId', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: '456' });
      await POST(request);

      const soapBody = mockFetch.mock.calls[0][1].body;
      expect(soapBody).toContain('<tem:requestTypeId>456</tem:requestTypeId>');
    });

    it('should handle numeric requestTypeId', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 789 });
      await POST(request);

      const soapBody = mockFetch.mock.calls[0][1].body;
      expect(soapBody).toContain('<tem:requestTypeId>789</tem:requestTypeId>');
    });

    it('should log request details', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SOAP API]'),
        expect.anything()
      );
    });

    it('should log SOAP envelope', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('SOAP Request:'),
        expect.stringContaining('GetProjectProposals')
      );
    });

    it('should log response status', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map([['content-type', 'text/xml']]),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Response status:'),
        200,
        'OK'
      );
    });

    it('should log response headers', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map([['content-type', 'text/xml']]),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Response headers:'),
        expect.any(Object)
      );
    });

    it('should log XML response', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const mockXml = '<response>data</response>';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => mockXml,
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('SOAP Response:'),
        mockXml
      );
    });

    it('should log request completion', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Request Complete')
      );
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 when requestTypeId is missing', async () => {
      const request = createMockRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toBe('requestTypeId is required');
    });

    it('should return 400 when requestTypeId is null', async () => {
      const request = createMockRequest({ requestTypeId: null });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 400 when requestTypeId is undefined', async () => {
      const request = createMockRequest({ requestTypeId: undefined });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 400 when requestTypeId is empty string', async () => {
      const request = createMockRequest({ requestTypeId: '' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should log error when requestTypeId is missing', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      const request = createMockRequest({});
      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing requestTypeId')
      );
    });
  });

  describe('SOAP Service Errors', () => {
    it('should handle 400 SOAP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => '<error>Bad request</error>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toContain('SOAP HTTP 400');
      expect(data.error).toContain('<error>');
    });

    it('should handle 401 SOAP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => '<error>Unauthorized</error>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toContain('SOAP HTTP 401');
    });

    it('should handle 500 SOAP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => '<error>Server error</error>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.message).toContain('SOAP HTTP 500');
    });

    it('should log SOAP error response', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      const errorText = '<soap:Fault>Error</soap:Fault>';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => errorText,
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error response:'),
        errorText
      );
    });

    it('should include error details in response', async () => {
      const errorText = '<fault>SOAP fault</fault>';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        text: async () => errorText,
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      const response = await POST(request);
      const data = await response.json();

      expect(data.error).toBe(errorText);
      expect(data.message).toBe('SOAP HTTP 500: Server Error');
    });
  });

  describe('Network and Exception Errors', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request = createMockRequest({ requestTypeId: 1 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Network error');
    });

    it('should handle timeout errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Timeout'));

      const request = createMockRequest({ requestTypeId: 1 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Timeout');
    });

    it('should handle connection refused', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

      const request = createMockRequest({ requestTypeId: 1 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Connection refused');
    });

    it('should log error details', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      const error = new Error('Test error');
      mockFetch.mockRejectedValueOnce(error);

      const request = createMockRequest({ requestTypeId: 1 });
      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SOAP API] Error:'),
        error
      );
    });

    it('should log error stack', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      const error = new Error('Test error');
      mockFetch.mockRejectedValueOnce(error);

      const request = createMockRequest({ requestTypeId: 1 });
      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error stack:'),
        expect.any(String)
      );
    });

    it('should handle non-Error exceptions', async () => {
      mockFetch.mockRejectedValueOnce('String error');

      const request = createMockRequest({ requestTypeId: 1 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Failed to fetch project proposals');
      expect(data.error).toBe('String error');
    });

    it('should handle null exceptions', async () => {
      mockFetch.mockRejectedValueOnce(null);

      const request = createMockRequest({ requestTypeId: 1 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it('should log when error has no stack', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      mockFetch.mockRejectedValueOnce('non-error object');

      const request = createMockRequest({ requestTypeId: 1 });
      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error stack:'),
        'No stack'
      );
    });
  });

  describe('Request Body Parsing', () => {
    it('should parse JSON request body', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const requestBody = { requestTypeId: 999 };
      const request = createMockRequest(requestBody);
      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Request body:'),
        requestBody
      );
    });

    it('should log extracted requestTypeId', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 777 });
      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Request Type ID:'),
        777
      );
    });

    it('should handle request body with extra fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const request = createMockRequest({
        requestTypeId: 1,
        extraField: 'ignored',
        anotherField: 123,
      });
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
    });
  });

  describe('SOAP Envelope Structure', () => {
    it('should include XML declaration', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      await POST(request);

      const soapBody = mockFetch.mock.calls[0][1].body;
      expect(soapBody).toContain('<?xml version="1.0" encoding="utf-8"?>');
    });

    it('should include SOAP namespaces', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      await POST(request);

      const soapBody = mockFetch.mock.calls[0][1].body;
      expect(soapBody).toContain('xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"');
      expect(soapBody).toContain('xmlns:tem="http://tempuri.org/"');
    });

    it('should include SOAP Header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      await POST(request);

      const soapBody = mockFetch.mock.calls[0][1].body;
      expect(soapBody).toContain('<soap:Header/>');
    });

    it('should include SOAP Body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      await POST(request);

      const soapBody = mockFetch.mock.calls[0][1].body;
      expect(soapBody).toContain('<soap:Body>');
      expect(soapBody).toContain('</soap:Body>');
    });

    it('should properly nest GetProjectProposals element', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      await POST(request);

      const soapBody = mockFetch.mock.calls[0][1].body;
      expect(soapBody).toContain('<tem:GetProjectProposals>');
      expect(soapBody).toContain('</tem:GetProjectProposals>');
    });

    it('should close all XML tags properly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      await POST(request);

      const soapBody = mockFetch.mock.calls[0][1].body;
      expect(soapBody).toContain('</soap:Envelope>');
      expect((soapBody.match(/<soap:Envelope/g) || []).length).toBe(1);
      expect((soapBody.match(/<\/soap:Envelope>/g) || []).length).toBe(1);
    });
  });

  describe('Response Structure', () => {
    it('should return success flag', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(typeof data.success).toBe('boolean');
    });

    it('should return xmlResponse on success', async () => {
      const mockXml = '<response>test</response>';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => mockXml,
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('xmlResponse');
      expect(data.xmlResponse).toBe(mockXml);
    });

    it('should return message on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('message');
      expect(data.message).toBe('SOAP response received successfully');
    });

    it('should return error details on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        text: async () => '<error>details</error>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('error');
      expect(data.error).toBe('<error>details</error>');
    });

    it('should include error string on exception', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Test error'));

      const request = createMockRequest({ requestTypeId: 1 });
      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Error: Test error');
    });
  });

  describe('Logging', () => {
    it('should log request received', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('POST Request Received')
      );
    });

    it('should log fetching project proposals', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 5 });
      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Fetching project proposals for requestType:'),
        5
      );
    });

    it('should log SOAP service URL', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Calling SOAP service:'),
        SOAP_SERVICE_URL
      );
    });

    it('should log success completion', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<xml/>',
        headers: new Map(),
      });

      const request = createMockRequest({ requestTypeId: 1 });
      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Returning response')
      );
    });
  });
});

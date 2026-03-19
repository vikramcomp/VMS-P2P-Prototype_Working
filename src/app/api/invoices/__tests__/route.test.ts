// Mock fetch before everything else
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

// Mock Next.js server completely
const mockNextResponse = {
  json: jest.fn((data: any, init?: any) => ({
    json: async () => data,
    blob: async () => new Blob([JSON.stringify(data)]),
    status: init?.status || 200,
    headers: {
      get: () => null,
    },
  })),
};

const mockNextRequest = jest.fn();

// Store the original module before mocking
let GET: any;
let POST: any;

jest.mock('next/server', () => ({
  NextRequest: mockNextRequest,
  NextResponse: mockNextResponse,
}));

// Import after mocking
beforeAll(async () => {
  const module = await import('../route');
  GET = module.GET;
  POST = module.POST;
});

describe('Invoices API Route', () => {
  const API_BASE_URL = 'https://vmsqa-ver2.compunnel.com/api';

  // Helper to create mock request
  const createMockRequest = (url: string, options: any = {}) => {
    const urlObj = new URL(url);
    return {
      nextUrl: {
        searchParams: urlObj.searchParams,
      },
      headers: {
        get: (name: string) => options.headers?.[name.toLowerCase()] || null,
      },
      json: async () => (options.body ? JSON.parse(options.body) : {}),
      url,
    } as any;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    mockNextResponse.json.mockClear();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET Handler', () => {
    it('should fetch invoices successfully', async () => {
      const mockData = [{ id: 1, name: 'Invoice 1' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const request = createMockRequest('http://localhost:3000/api/invoices');
      const response = await GET(request);
      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(data).toEqual(mockData);
    });

    it('should include query params in request', async () => {
      const mockData = [{ id: 2, name: 'Invoice 2' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const request = createMockRequest('http://localhost:3000/api/invoices?page=1&limit=10');
      await GET(request);

      expect(mockFetch).toHaveBeenCalled();
      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain('page=1');
      expect(callUrl).toContain('limit=10');
    });

    it('should include authorization header when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const request = createMockRequest('http://localhost:3000/api/invoices', {
        headers: {
          authorization: 'Bearer token123',
        },
      });
      await GET(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token123',
          }),
        })
      );
    });

    it('should log proxy request URL', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const request = createMockRequest('http://localhost:3000/api/invoices?page=1');
      await GET(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Proxy request to:',
        expect.any(String)
      );
    });

    it('should log response structure for array', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1 }],
      });

      const request = createMockRequest('http://localhost:3000/api/invoices');
      await GET(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        'API Response structure:',
        expect.objectContaining({
          isArray: true,
        })
      );
    });

    it('should log response structure for object', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total: 10 }),
      });

      const request = createMockRequest('http://localhost:3000/api/invoices');
      await GET(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        'API Response structure:',
        expect.objectContaining({
          isArray: false,
        })
      );
    });

    it('should handle 404 error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not found',
      });

      const request = createMockRequest('http://localhost:3000/api/invoices');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toEqual({ error: 'API error: 404' });
    });

    it('should handle 401 error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      const request = createMockRequest('http://localhost:3000/api/invoices');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toEqual({ error: 'API error: 401' });
    });

    it('should handle 500 error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Server error',
      });

      const request = createMockRequest('http://localhost:3000/api/invoices');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toEqual({ error: 'API error: 500' });
    });

    it('should log API errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad request',
      });

      const request = createMockRequest('http://localhost:3000/api/invoices');
      await GET(request);

      expect(consoleSpy).toHaveBeenCalledWith('API error:', 400, 'Bad request');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request = createMockRequest('http://localhost:3000/api/invoices');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toEqual({ error: 'Internal server error' });
    });

    it('should log proxy errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      const error = new Error('Connection failed');
      mockFetch.mockRejectedValueOnce(error);

      const request = createMockRequest('http://localhost:3000/api/invoices');
      await GET(request);

      expect(consoleSpy).toHaveBeenCalledWith('Proxy error:', error);
    });

    it('should handle empty query string', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const request = createMockRequest('http://localhost:3000/api/invoices');
      await GET(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should not include authorization when not provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const request = createMockRequest('http://localhost:3000/api/invoices');
      await GET(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    });
  });

  describe('POST Handler', () => {
    it('should export invoices successfully', async () => {
      const mockBlob = new Blob(['test data']);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      const requestBody = { filters: { status: 'paid' } };
      const request = createMockRequest('http://localhost:3000/api/invoices', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      await POST(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(requestBody),
        })
      );
    });

    it('should include authorization header in POST', async () => {
      const mockBlob = new Blob(['test data']);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      const request = createMockRequest('http://localhost:3000/api/invoices', {
        method: 'POST',
        headers: {
          authorization: 'Bearer token456',
        },
        body: JSON.stringify({}),
      });

      await POST(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token456',
          }),
        })
      );
    });

    it('should handle empty request body', async () => {
      const mockBlob = new Blob(['test data']);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      const request = createMockRequest('http://localhost:3000/api/invoices', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      await POST(request);

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should handle 400 error in POST', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad request',
      });

      const request = createMockRequest('http://localhost:3000/api/invoices', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toEqual({ error: 'Export API error: 400' });
    });

    it('should handle 401 error in POST', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      const request = createMockRequest('http://localhost:3000/api/invoices', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toEqual({ error: 'Export API error: 401' });
    });

    it('should handle 500 error in POST', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Server error',
      });

      const request = createMockRequest('http://localhost:3000/api/invoices', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toEqual({ error: 'Export API error: 500' });
    });

    it('should log export API errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => 'Forbidden',
      });

      const request = createMockRequest('http://localhost:3000/api/invoices', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith('Export API error:', 403, 'Forbidden');
    });

    it('should handle network errors in POST', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request = createMockRequest('http://localhost:3000/api/invoices', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toEqual({ error: 'Internal server error' });
    });

    it('should log export proxy errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      const error = new Error('Export failed');
      mockFetch.mockRejectedValueOnce(error);

      const request = createMockRequest('http://localhost:3000/api/invoices', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith('Export proxy error:', error);
    });

    it('should handle invalid JSON in request body', async () => {
      const request = createMockRequest('http://localhost:3000/api/invoices', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toEqual({ error: 'Internal server error' });
    });

    it('should not include authorization when not provided in POST', async () => {
      const mockBlob = new Blob(['test data']);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      const request = createMockRequest('http://localhost:3000/api/invoices', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      await POST(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.any(String),
        }
      );
    });
  });
});

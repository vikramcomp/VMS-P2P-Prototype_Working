import { pantherSOAPService } from '../panther-soap-service';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

// Mock DOMParser
const mockParseFromString = jest.fn();
global.DOMParser = jest.fn().mockImplementation(() => ({
  parseFromString: mockParseFromString
})) as any;

describe('PantherSOAPService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    mockParseFromString.mockClear();
  });

  describe('getProjectProposalsByRequestType', () => {
    it('should fetch project proposals for Non-Billable type', async () => {
      const mockXMLResponse = `
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <GetProjectProposalsResponse>
              <ProjectProposal>
                <Id>101</Id>
                <Name>Project Alpha</Name>
              </ProjectProposal>
            </GetProjectProposalsResponse>
          </soap:Body>
        </soap:Envelope>
      `;

      const mockApiResponse = {
        success: true,
        xmlResponse: mockXMLResponse,
        message: 'Success'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockApiResponse,
      });

      // Mock XML parsing
      const mockDoc = {
        getElementsByTagName: jest.fn().mockReturnValue([])
      };
      mockParseFromString.mockReturnValue(mockDoc);

      const result = await pantherSOAPService.getProjectProposalsByRequestType('1');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/soap/project-proposals',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ requestTypeId: '1' })
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should fetch project proposals for Billable type', async () => {
      const mockApiResponse = {
        success: true,
        xmlResponse: '<Response></Response>',
        message: 'Success'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const mockDoc = {
        getElementsByTagName: jest.fn().mockReturnValue([])
      };
      mockParseFromString.mockReturnValue(mockDoc);

      const result = await pantherSOAPService.getProjectProposalsByRequestType(2);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/soap/project-proposals',
        expect.objectContaining({
          body: JSON.stringify({ requestTypeId: 2 })
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle HTTP errors and fallback to mock data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Server error' }),
      });

      const result = await pantherSOAPService.getProjectProposalsByRequestType('1');

      // Should fallback to mock data
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.message).toContain('FALLBACK');
    });

    it('should handle network errors and fallback to mock data', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await pantherSOAPService.getProjectProposalsByRequestType('2');

      // Should fallback to mock data for Billable
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.message).toContain('FALLBACK');
      expect(result.message).toContain('Network error');
    });

    it('should handle no XML response error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, message: 'No XML' }),
      });

      const result = await pantherSOAPService.getProjectProposalsByRequestType('3');

      // Should fallback to mock data
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should parse SOAP XML with project proposals', async () => {
      const mockXMLResponse = `
        <soap:Envelope>
          <soap:Body>
            <Response></Response>
          </soap:Body>
        </soap:Envelope>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          xmlResponse: mockXMLResponse
        }),
      });

      const mockElements = [
        { textContent: '101' },
        { textContent: 'Project Name' }
      ];
      const mockDoc = {
        getElementsByTagName: jest.fn((tagName) => {
          if (tagName === 'faultstring') return [];
          return mockElements;
        })
      };
      mockParseFromString.mockReturnValue(mockDoc);

      const result = await pantherSOAPService.getProjectProposalsByRequestType('1');

      expect(mockParseFromString).toHaveBeenCalledWith(mockXMLResponse, 'text/xml');
      expect(result.success).toBe(true);
    });

    it('should handle SOAP fault', async () => {
      const mockXMLResponse = `
        <soap:Envelope>
          <soap:Body>
            <soap:Fault>
              <faultstring>Invalid request</faultstring>
            </soap:Fault>
          </soap:Body>
        </soap:Envelope>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          xmlResponse: mockXMLResponse
        }),
      });

      const mockDoc = {
        getElementsByTagName: jest.fn((tagName) => {
          if (tagName === 'faultstring') {
            return [{ textContent: 'Invalid request' }];
          }
          return [];
        })
      };
      mockParseFromString.mockReturnValue(mockDoc);

      const result = await pantherSOAPService.getProjectProposalsByRequestType('1');

      // Should fallback to mock data on SOAP fault
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.message).toContain('FALLBACK');
    });

    it('should use correct mock data for each request type', async () => {
      mockFetch.mockRejectedValue(new Error('Force fallback'));

      // Test Non-Billable (1)
      const result1 = await pantherSOAPService.getProjectProposalsByRequestType('1');
      expect(result1.data.length).toBe(3);
      expect(result1.data[0].requestTypeId).toBe('1');

      // Test Billable (2)
      const result2 = await pantherSOAPService.getProjectProposalsByRequestType('2');
      expect(result2.data.length).toBe(4);
      expect(result2.data[0].requestTypeId).toBe('2');

      // Test Other (3)
      const result3 = await pantherSOAPService.getProjectProposalsByRequestType('3');
      expect(result3.data.length).toBe(2);
      expect(result3.data[0].requestTypeId).toBe('3');

      // Test unknown type
      const result4 = await pantherSOAPService.getProjectProposalsByRequestType('999');
      expect(result4.data).toEqual([]);
    });

    it('should handle missing success field in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          xmlResponse: '<Response></Response>'
        }),
      });

      const mockDoc = {
        getElementsByTagName: jest.fn().mockReturnValue([])
      };
      mockParseFromString.mockReturnValue(mockDoc);

      const result = await pantherSOAPService.getProjectProposalsByRequestType('1');

      // Should fallback due to missing success
      expect(result.success).toBe(true);
      expect(result.message).toContain('FALLBACK');
    });

    it('should parse XML with different tag names', async () => {
      const mockXMLWithId = `
        <Response>
          <ProjectProposalItem>
            <id>201</id>
            <name>Test Project</name>
          </ProjectProposalItem>
        </Response>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          xmlResponse: mockXMLWithId,
        }),
      });

      const mockDoc = {
        getElementsByTagName: jest.fn((tagName) => {
          if (tagName === 'faultstring') return [];
          if (tagName === 'ProjectProposalItem') {
            return [{
              getElementsByTagName: (childTag: string) => {
                if (childTag === 'id') return [{ textContent: '201' }];
                if (childTag === 'name') return [{ textContent: 'Test Project' }];
                return [];
              },
              getAttribute: () => null
            }];
          }
          return [];
        })
      };
      mockParseFromString.mockReturnValue(mockDoc);

      const result = await pantherSOAPService.getProjectProposalsByRequestType('2');

      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should parse XML with Description field', async () => {
      const mockXML = '<Response><Item><Id>301</Id><Description>Test Desc</Description></Item></Response>';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          xmlResponse: mockXML,
        }),
      });

      const mockDoc = {
        getElementsByTagName: jest.fn((tagName) => {
          if (tagName === 'faultstring') return [];
          if (tagName === 'Item') {
            return [{
              getElementsByTagName: (childTag: string) => {
                if (childTag === 'Id') return [{ textContent: '301' }];
                if (childTag === 'Description') return [{ textContent: 'Test Desc' }];
                return [];
              },
              getAttribute: () => null
            }];
          }
          return [];
        })
      };
      mockParseFromString.mockReturnValue(mockDoc);

      const result = await pantherSOAPService.getProjectProposalsByRequestType('3');

      expect(result.success).toBe(true);
    });

    it('should parse XML with attribute-based ID', async () => {
      const mockXML = '<Response><Item id="401"><Name>Test</Name></Item></Response>';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          xmlResponse: mockXML,
        }),
      });

      const mockDoc = {
        getElementsByTagName: jest.fn((tagName) => {
          if (tagName === 'faultstring') return [];
          if (tagName === 'Item') {
            return [{
              getElementsByTagName: (childTag: string) => {
                if (childTag === 'Name') return [{ textContent: 'Test' }];
                return [];
              },
              getAttribute: (attr: string) => attr === 'id' ? '401' : null
            }];
          }
          return [];
        })
      };
      mockParseFromString.mockReturnValue(mockDoc);

      const result = await pantherSOAPService.getProjectProposalsByRequestType('1');

      expect(result.success).toBe(true);
    });

    it('should parse XML with ProjectProposalId and ProjectProposalName', async () => {
      const mockXML = '<Response><Item><ProjectProposalId>501</ProjectProposalId><ProjectProposalName>Test</ProjectProposalName></Item></Response>';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          xmlResponse: mockXML,
        }),
      });

      const mockDoc = {
        getElementsByTagName: jest.fn((tagName) => {
          if (tagName === 'faultstring') return [];
          if (tagName === 'Item') {
            return [{
              getElementsByTagName: (childTag: string) => {
                if (childTag === 'ProjectProposalId') return [{ textContent: '501' }];
                if (childTag === 'ProjectProposalName') return [{ textContent: 'Test' }];
                return [];
              },
              getAttribute: () => null
            }];
          }
          return [];
        })
      };
      mockParseFromString.mockReturnValue(mockDoc);

      const result = await pantherSOAPService.getProjectProposalsByRequestType('2');

      expect(result.success).toBe(true);
    });

    it('should handle XML parsing errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          xmlResponse: '<InvalidXML>',
        }),
      });

      mockParseFromString.mockImplementation(() => {
        throw new Error('XML parsing failed');
      });

      const result = await pantherSOAPService.getProjectProposalsByRequestType('1');

      // Should fallback to mock data
      expect(result.success).toBe(true);
      expect(result.message).toContain('FALLBACK');
    });

    it('should handle empty element text content', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          xmlResponse: '<Response></Response>',
        }),
      });

      const mockDoc = {
        getElementsByTagName: jest.fn((tagName) => {
          if (tagName === 'faultstring') return [];
          if (tagName === 'Item') {
            return [{
              getElementsByTagName: () => [{
                textContent: '   '  // Whitespace only
              }],
              getAttribute: () => null
            }];
          }
          return [];
        })
      };
      mockParseFromString.mockReturnValue(mockDoc);

      const result = await pantherSOAPService.getProjectProposalsByRequestType('1');

      expect(result.success).toBe(true);
    });
  });
});

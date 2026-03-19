/**
 * SOAP/WSDL API Service for Panther Integration
 * Handles Project/Proposal ID dropdown data from WSDL service
 * 
 * Third-party SOAP endpoint: https://inspireqaservices.compunnel.com/Panther.svc
 * WSDL: https://inspireqaservices.compunnel.com/Panther.svc?wsdl
 * 
 * NOTE: Currently using static mock data. Update parseSOAPResponse() when actual
 * SOAP response format is available.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ProjectProposalSOAPResponse {
  success: boolean;
  data: ProjectProposalItem[];
  message: string;
}

export interface ProjectProposalItem {
  id: string;
  name: string;
  requestTypeId: string;
}

// ============================================================================
// STATIC MOCK DATA (Replace with actual SOAP call when available)
// ============================================================================

const MOCK_PROJECT_PROPOSALS: Record<string, ProjectProposalItem[]> = {
  '1': [ // Non-Billable
    { id: '101', name: 'Internal Training Project', requestTypeId: '1' },
    { id: '102', name: 'Research & Development', requestTypeId: '1' },
    { id: '103', name: 'Internal IT Infrastructure', requestTypeId: '1' },
  ],
  '2': [ // Billable
    { id: '201', name: 'Client Project Alpha', requestTypeId: '2' },
    { id: '202', name: 'Client Project Beta', requestTypeId: '2' },
    { id: '203', name: 'Client Project Gamma', requestTypeId: '2' },
    { id: '204', name: 'Consulting Engagement Delta', requestTypeId: '2' },
  ],
  '3': [ // Other
    { id: '301', name: 'Miscellaneous Project X', requestTypeId: '3' },
    { id: '302', name: 'Miscellaneous Project Y', requestTypeId: '3' },
  ],
};

// ============================================================================
// SOAP SERVICE CLASS
// ============================================================================

class PantherSOAPService {
  private readonly apiUrl = '/api/soap/project-proposals';

  /**
   * Fetches Project/Proposal IDs from SOAP API based on Request Type
   * @param requestTypeId - The selected request type ID
   * @returns Promise with project/proposal data
   */
  async getProjectProposalsByRequestType(requestTypeId: string | number): Promise<ProjectProposalSOAPResponse> {
    try {
      console.log('🔵 [PantherSOAP] Fetching project proposals for requestType:', requestTypeId);
      console.log('📤 [PantherSOAP] Calling API route:', this.apiUrl);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestTypeId }),
      });

      console.log('📥 [PantherSOAP] Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [PantherSOAP] Error response:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📥 [PantherSOAP] API Response:', result);

      if (!result.success || !result.xmlResponse) {
        throw new Error(result.message || 'No XML response received');
      }

      // Parse the XML response
      const parsedData = this.parseSOAPResponse(result.xmlResponse, requestTypeId);
      
      console.log('✅ [PantherSOAP] Parsed project proposals:', parsedData);

      return {
        success: true,
        data: parsedData,
        message: 'Project proposals loaded successfully'
      };

    } catch (error) {
      console.error('❌ [PantherSOAP] Error fetching project proposals:', error);
      console.error('❌ [PantherSOAP] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error,
        error: error
      });
      
      // FALLBACK: Use mock data if SOAP service is unavailable
      console.warn('⚠️ [PantherSOAP] Using fallback mock data due to SOAP error');
      const mockData = MOCK_PROJECT_PROPOSALS[requestTypeId.toString()] || [];
      
      return {
        success: true,
        data: mockData,
        message: `${mockData.length} project proposals loaded (FALLBACK - SOAP service unavailable: ${error instanceof Error ? error.message : 'Unknown error'})`
      };
    }
  }

  /**
   * Parses SOAP XML response and extracts project/proposal data
   */
  private parseSOAPResponse(xmlText: string, requestTypeId: string | number): ProjectProposalItem[] {
    try {
      console.log('🔍 [PantherSOAP] Parsing XML response...');
      
      const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
      this.checkForSOAPFault(xmlDoc);

      const result = this.extractProjectProposals(xmlDoc, requestTypeId);
      
      if (result.length === 0) {
        console.warn('⚠️ [PantherSOAP] No project proposals found in response');
        console.log('📄 [PantherSOAP] Raw XML for debugging:', xmlText);
      }

      return result;

    } catch (error) {
      console.error('❌ [PantherSOAP] XML parsing error:', error);
      console.error('📄 [PantherSOAP] Failed XML:', xmlText);
      throw error;
    }
  }

  /**
   * Check for SOAP fault in XML response
   */
  private checkForSOAPFault(xmlDoc: Document): void {
    const fault = xmlDoc.getElementsByTagName('faultstring')[0];
    if (fault) {
      throw new Error(`SOAP Fault: ${fault.textContent}`);
    }
  }

  /**
   * Extract project proposals from XML document
   */
  private extractProjectProposals(xmlDoc: Document, requestTypeId: string | number): ProjectProposalItem[] {
    const possibleResultTags = [
      'GetProjectProposalsResult',
      'GetProjectProposalsResponse',
      'ProjectProposal',
      'ProjectProposalItem',
      'Item',
      'ArrayOfProjectProposal'
    ];

    for (const tagName of possibleResultTags) {
      const result = this.parseElementsByTagName(xmlDoc, tagName, requestTypeId);
      if (result.length > 0) {
        console.log(`✅ [PantherSOAP] Successfully parsed ${result.length} items from <${tagName}> elements`);
        return result;
      }
    }

    return [];
  }

  /**
   * Parse elements by tag name and extract project proposal items
   */
  private parseElementsByTagName(xmlDoc: Document, tagName: string, requestTypeId: string | number): ProjectProposalItem[] {
    const elements = xmlDoc.getElementsByTagName(tagName);
    console.log(`🔍 [PantherSOAP] Found ${elements.length} elements with tag: ${tagName}`);
    
    const result: ProjectProposalItem[] = [];
    
    for (const element of elements) {
      const item = this.extractProjectProposalItem(element, requestTypeId);
      if (item) {
        result.push(item);
      }
    }
    
    return result;
  }

  /**
   * Extract a single project proposal item from XML element
   */
  private extractProjectProposalItem(element: Element, requestTypeId: string | number): ProjectProposalItem | null {
    const id = this.getElementText(element, 'Id') || 
              this.getElementText(element, 'ProjectProposalId') ||
              this.getElementText(element, 'id') ||
              element.getAttribute('id');
    
    const name = this.getElementText(element, 'Name') || 
                this.getElementText(element, 'ProjectProposalName') ||
                this.getElementText(element, 'name') ||
                this.getElementText(element, 'Description');

    if (id && name) {
      return {
        id: id,
        name: name,
        requestTypeId: requestTypeId.toString()
      };
    }

    return null;
  }

  /**
   * Helper to get text content from XML element
   */
  private getElementText(parent: Element, tagName: string): string | null {
    const element = parent.getElementsByTagName(tagName)[0];
    return element?.textContent?.trim() || null;
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const pantherSOAPService = new PantherSOAPService();

import { NextRequest, NextResponse } from 'next/server';

const SOAP_SERVICE_URL = 'https://inspireqaservices.compunnel.com/Panther.svc';
const SOAP_ACTION = 'http://tempuri.org/IPanther/GetProjectProposals';

/**
 * Build SOAP envelope for GetProjectProposals
 */
function buildSOAPEnvelope(requestTypeId: string | number): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Header/>
  <soap:Body>
    <tem:GetProjectProposals>
      <tem:requestTypeId>${requestTypeId}</tem:requestTypeId>
    </tem:GetProjectProposals>
  </soap:Body>
</soap:Envelope>`;
}

/**
 * POST /api/soap/project-proposals
 * Proxy SOAP request to avoid CORS issues
 * Returns the raw SOAP XML response for client-side parsing
 */
export async function POST(request: NextRequest) {
  console.log('🟢 [SOAP API] ========== POST Request Received ==========');
  
  try {
    const body = await request.json();
    const { requestTypeId } = body;

    console.log('🟢 [SOAP API] Request body:', body);
    console.log('🟢 [SOAP API] Request Type ID:', requestTypeId);

    if (!requestTypeId) {
      console.error('❌ [SOAP API] Missing requestTypeId');
      return NextResponse.json(
        { success: false, message: 'requestTypeId is required' },
        { status: 400 }
      );
    }

    console.log('🔵 [SOAP API] Fetching project proposals for requestType:', requestTypeId);
    console.log('📤 [SOAP API] Calling SOAP service:', SOAP_SERVICE_URL);

    // Build SOAP envelope
    const soapEnvelope = buildSOAPEnvelope(requestTypeId);
    console.log('📤 [SOAP API] SOAP Request:', soapEnvelope);

    // Make SOAP request (server-side, bypasses CORS)
    const response = await fetch(SOAP_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': SOAP_ACTION,
      },
      body: soapEnvelope,
    });

    console.log('📥 [SOAP API] Response status:', response.status, response.statusText);
    console.log('📥 [SOAP API] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [SOAP API] Error response:', errorText);
      
      return NextResponse.json(
        {
          success: false,
          message: `SOAP HTTP ${response.status}: ${response.statusText}`,
          error: errorText
        },
        { status: response.status }
      );
    }

    const responseText = await response.text();
    console.log('📥 [SOAP API] SOAP Response:', responseText);

    // Return raw XML for client-side parsing
    const result = {
      success: true,
      xmlResponse: responseText,
      message: 'SOAP response received successfully'
    };

    console.log('✅ [SOAP API] Returning response');
    console.log('🟢 [SOAP API] ========== Request Complete ==========');

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ [SOAP API] Error:', error);
    console.error('❌ [SOAP API] Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch project proposals',
        error: String(error)
      },
      { status: 500 }
    );
  }
}

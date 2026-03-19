import { NextRequest, NextResponse } from 'next/server';
import { envConfig } from '@/config/env-validation';

const API_BASE_URL = envConfig.apiBaseUrl;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get authorization header from request
    const authHeader = request.headers.get('authorization');
    
    // Build query string from search params
    const queryString = searchParams.toString();
    const url = queryString 
      ? `${API_BASE_URL}/invoices?${queryString}`
      : `${API_BASE_URL}/invoices`;

    console.log('Proxy request to:', url);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error:', response.status, errorText);
      return NextResponse.json(
        { error: `API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Log the response structure for debugging
    console.log('API Response structure:', {
      isArray: Array.isArray(data),
      keys: typeof data === 'object' ? Object.keys(data) : 'not an object',
      sample: Array.isArray(data) && data.length > 0 ? data[0] : data
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${API_BASE_URL}/invoices/export`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Export API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Export API error: ${response.status}` },
        { status: response.status }
      );
    }

    const blob = await response.blob();
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=invoices.xlsx',
      },
    });
  } catch (error) {
    console.error('Export proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

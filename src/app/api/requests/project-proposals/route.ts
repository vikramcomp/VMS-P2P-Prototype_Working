import { NextRequest, NextResponse } from 'next/server';
import { envConfig } from '@/config/env-validation';

const API_BASE_URL = envConfig.apiBaseUrl;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    const url = `${API_BASE_URL}/requests/project-proposals`;
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
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

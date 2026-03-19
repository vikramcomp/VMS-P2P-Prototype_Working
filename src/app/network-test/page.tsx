'use client';

import React, { useState, useEffect } from 'react';

interface NetworkTestPageProps {
  isTesting?: boolean;
}

export default function NetworkTestPage({ isTesting = false }: NetworkTestPageProps = {}) {
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [testStatus, setTestStatus] = useState('idle');

  React.useEffect(() => {
    if (isTesting) {
      testApiDirect();
    }
  }, [isTesting]);

  const testApiDirect = async () => {
    setTestStatus('testing');
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const endpoint = '/groups/getgroups';
      const fullUrl = `${baseURL}${endpoint}`;
      
      const requestBody = {
        SearchText: '',
        SearchColumn: '',
        PageSize: 10,
        PageNumber: 1,
        IgnorePaging: false,
        SortColumn: 'CategoryName',
        SortType: 'asc',
        Filter: {
          OldWorkflowOnly: true
        }
      };

      console.log('🔥 Network Test - Making API call to:', fullUrl);
      console.log('🔥 Network Test - Request body:', requestBody);

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🔥 Network Test - Response status:', response.status);
      console.log('🔥 Network Test - Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('🔥 Network Test - Response data:', data);

      setNetworkInfo({
        status: response.status,
        url: fullUrl,
        responseData: data,
        totalRecords: data?.Data?.TotalRecords || 'N/A',
        recordsCount: data?.Data?.Records?.length || 0,
        success: true
      });
      setTestStatus('success');
    } catch (error) {
      console.error('🔥 Network Test - Error:', error);
      setNetworkInfo({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
      setTestStatus('error');
    }
  };

  useEffect(() => {
    // Auto-run test on page load
    testApiDirect();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto" data-testid="network-test-page">
      <h1 className="text-2xl font-bold mb-6">Network API Test</h1>
      
      <div className="mb-6">
        <button
          onClick={testApiDirect}
          disabled={testStatus === 'testing'}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {testStatus === 'testing' ? 'Testing...' : 'Test API Call'}
        </button>
      </div>

      {networkInfo && (
        <div className="space-y-4">
          {networkInfo.success ? (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <h3 className="font-bold">✅ API Call Successful!</h3>
              <p><strong>Status:</strong> {networkInfo.status}</p>
              <p><strong>URL:</strong> {networkInfo.url}</p>
              <p><strong>Total Records:</strong> {networkInfo.totalRecords}</p>
              <p><strong>Records in Response:</strong> {networkInfo.recordsCount}</p>
              <p><strong>Data Type:</strong> {networkInfo.totalRecords > 200 ? 'REAL API DATA' : 'Possible Mock Data'}</p>
            </div>
          ) : (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <h3 className="font-bold">❌ API Call Failed</h3>
              <p><strong>Error:</strong> {networkInfo.error}</p>
            </div>
          )}

          <div className="p-4 bg-gray-100 border rounded">
            <h3 className="font-bold mb-2">Raw Response Data:</h3>
            <pre className="text-xs overflow-auto max-h-96 bg-white p-2 rounded border">
              {JSON.stringify(networkInfo.responseData || networkInfo.error, null, 2)}
            </pre>
          </div>

          {networkInfo.success && networkInfo.responseData?.Data?.Records && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-bold mb-2">Sample Records (First 3):</h3>
              {networkInfo.responseData.Data.Records.slice(0, 3).map((record: any) => (
                <div key={record.CategoryId} className="mb-2 p-2 bg-white rounded border">
                  <p><strong>ID:</strong> {record.CategoryId}</p>
                  <p><strong>Name:</strong> {record.CategoryName}</p>
                  <p><strong>Description:</strong> {record.CategoryDescription}</p>
                  <p><strong>Status:</strong> {record.Status}</p>
                  <p><strong>Studio:</strong> {record.StudioName || 'N/A'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
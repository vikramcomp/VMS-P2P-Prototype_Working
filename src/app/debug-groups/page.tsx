'use client';

import React, { useState } from 'react';
import { groupsService } from '@/services/groups-service';
import { GroupSearchParams } from '@/types/groups';

interface DebugGroupsPageProps {
  isTesting?: boolean;
}

export default function DebugGroupsPage({ isTesting = false }: DebugGroupsPageProps = {}) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [callCount, setCallCount] = useState(0);

  React.useEffect(() => {
    if (isTesting) {
      testApiCall();
    }
  }, [isTesting]);

  const testApiCall = async () => {
    setLoading(true);
    setError(null);
    setCallCount(prev => prev + 1);
    
    console.log(`🧪 Debug API Call #${callCount + 1}`);
    
    try {
      const params: GroupSearchParams = {
        pageNumber: 1,
        pageSize: 10,
        sortColumn: 'CategoryName',
        sortType: 'asc',
        oldWorkflowOnly: true
      };
      
      const result = await groupsService.getGroups(params);
      setResponse(result);
      console.log('🧪 Debug API Response:', result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('🧪 Debug API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto" data-testid="debug-groups-page">
      <h1 className="text-2xl font-bold mb-6">Groups API Debug</h1>
      
      <div className="mb-6">
        <button
          onClick={testApiCall}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : `Test API Call (${callCount} calls made)`}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {response && (
        <div className="space-y-4">
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <h3 className="font-bold">API Response Received:</h3>
            <p>Total Records: {response.Data?.TotalRecords || 'N/A'}</p>
            <p>Records Count: {response.Data?.Records?.length || 0}</p>
            <p>Response Type: {response.Data?.Records ? 'Real API Data' : 'Likely Mock Data'}</p>
          </div>

          <div className="p-4 bg-gray-100 border rounded">
            <h3 className="font-bold mb-2">Raw Response:</h3>
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>

          {response.Data?.Records && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-bold mb-2">Sample Records:</h3>
              {response.Data.Records.slice(0, 3).map((record: any) => (
                <div key={record.CategoryId || record.CategoryName || Math.random()} className="mb-2 p-2 bg-white rounded border">
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
'use client';

import React, { useEffect, useState } from 'react';
import { groupsService } from '@/services/groups-service';
import { Group } from '@/types/groups';

interface ApiTestPageProps {
  isTesting?: boolean;
}

export default function ApiTestPage({ isTesting = false }: ApiTestPageProps = {}) {
  const [status, setStatus] = useState<string>('Testing...');
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);

  useEffect(() => {
    async function testApi() {
      try {
        setStatus('🔄 Testing Groups API...');
        console.log('Starting API test...');
        
        const response = await groupsService.getGroups({
          pageNumber: 1,
          pageSize: 10,
          sortColumn: 'CategoryName',
          sortType: 'asc',
          oldWorkflowOnly: true
        });
        
        console.log('API Test Response:', response);
        setApiResponse(response);
        
        if (response?.Data?.Records) {
          setStatus('✅ API working! (or fallback data loaded)');
          const transformedGroups = groupsService.transformApiDataToGroups(response);
          setGroups(transformedGroups);
          setError(null);
        } else {
          setStatus('❌ API returned unexpected format');
          setError('Invalid response structure');
        }
      } catch (err) {
        console.error('API Test Error:', err);
        setStatus('❌ API test failed');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }

    testApi();
  }, []);

  return (
    <div className="p-8" data-testid="api-test-page">
      <h1 className="text-2xl font-bold mb-4" data-testid="page-title">VMS Groups API Integration Test</h1>
      
      <div className="mb-4" data-testid="status-section">
        <p className="text-lg" data-testid="status-text"><strong>Status:</strong> {status}</p>
        {error && (
          <p className="text-red-600 mt-2" data-testid="error-text"><strong>Error:</strong> {error}</p>
        )}
      </div>

      {groups.length > 0 && (
        <div className="mb-6" data-testid="groups-section">
          <h2 className="text-xl font-semibold mb-2" data-testid="groups-title">Groups Data ({groups.length} items):</h2>
          <div className="space-y-2" data-testid="groups-list">
            {groups.map((group) => (
              <div key={group.id} className="border p-3 rounded bg-gray-50" data-testid={`group-${group.id}`}>
                <p data-testid={`group-${group.id}-id`}><strong>ID:</strong> {group.id}</p>
                <p data-testid={`group-${group.id}-name`}><strong>Name:</strong> {group.name}</p>
                <p data-testid={`group-${group.id}-description`}><strong>Description:</strong> {group.description}</p>
                <p data-testid={`group-${group.id}-studio`}><strong>Studio:</strong> {group.studioName || 'N/A'}</p>
                <p data-testid={`group-${group.id}-status`}><strong>Status:</strong> {group.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded" data-testid="environment-info">
        <h3 className="font-semibold" data-testid="env-title">Environment Info:</h3>
        <p data-testid="api-base-url"><strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL}</p>
        <p data-testid="current-time"><strong>Current Time:</strong> {new Date().toISOString()}</p>
      </div>

      {apiResponse && (
        <div className="mt-6 p-4 bg-gray-50 rounded" data-testid="api-response-section">
          <h3 className="font-semibold mb-2" data-testid="api-response-title">Raw API Response:</h3>
          <pre className="text-xs overflow-auto max-h-64" data-testid="api-response-data">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
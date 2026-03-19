"use client";

import React, { useState } from "react";
import { serviceDetailsService } from "@/services/service-details-service";

interface TestApiPageProps {
  isTesting?: boolean;
}

export default function TestApiPage({ isTesting = false }: TestApiPageProps = {}) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await serviceDetailsService.getServiceDetail(4);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8" data-testid="test-api-page">
      <h1 className="text-2xl font-bold mb-4" data-testid="page-title">API Test - Service Detail ID 4</h1>
      
      <button
        onClick={testApi}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        data-testid="test-api-button"
      >
        {loading ? 'Testing...' : 'Test API'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded" data-testid="error-display">
          <h3 className="font-bold" data-testid="error-title">Error:</h3>
          <pre data-testid="error-message">{error}</pre>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded" data-testid="api-response">
          <h3 className="font-bold" data-testid="response-title">API Response:</h3>
          <pre className="whitespace-pre-wrap text-sm" data-testid="response-data">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {result?.Data && (
        <div className="mt-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded" data-testid="extracted-data">
          <h3 className="font-bold" data-testid="extracted-title">Extracted Data:</h3>
          <p data-testid="extracted-id"><strong>ID:</strong> {result.Data.VendorMgrServiceDetailId}</p>
          <p data-testid="extracted-name"><strong>Name:</strong> {result.Data.ServiceDetailName}</p>
          <p data-testid="extracted-description"><strong>Description:</strong> {result.Data.ServiceDetailDescription}</p>
        </div>
      )}
    </div>
  );
}
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGroups } from '@/hooks/use-groups';
import Pagination from '@/components/ui/pagination';

interface PaginationTestPageProps {
  isTesting?: boolean;
}

export default function PaginationTestPage({ isTesting = false }: PaginationTestPageProps = {}) {
  const {
    groups,
    loading,
    error,
    pagination,
    setPageSize,
    goToPage,
  } = useGroups({
    pageNumber: 1,
    pageSize: 10,
    sortColumn: 'CategoryName',
    sortType: 'asc',
    oldWorkflowOnly: true
  });

  React.useEffect(() => {
    if (isTesting) {
      setPageSize(20);
      goToPage(2);
    }
  }, [isTesting]);

  return (
    <div className="p-8 max-w-6xl mx-auto" data-testid="pagination-test-page">
      <h1 className="text-2xl font-bold mb-6">Pagination Test</h1>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Groups with Pagination</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="font-medium mb-2">Pagination State:</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded">
                  {JSON.stringify(pagination, null, 2)}
                </pre>
              </div>

              <div className="mb-4">
                <h3 className="font-medium mb-2">Groups ({groups.length}):</h3>
                <div className="grid gap-2">
                  {groups.map((group, index) => (
                    <div key={group.id} className="p-2 border rounded">
                      <span className="font-medium">#{index + pagination.showingFrom}.</span>{' '}
                      {group.name} - {group.status}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
        
        {/* Pagination Controls */}
        <Pagination
          pagination={pagination}
          onPageChange={goToPage}
          onPageSizeChange={setPageSize}
          loading={loading}
        />
      </Card>
    </div>
  );
}
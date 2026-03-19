'use client';

import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';

// Dynamically import the requests content to avoid hydration issues
const RequestsContent = dynamic(() => import('@/components/requests/requests-content'), {
  ssr: false,
  loading: () => <div className="p-6">Loading...</div>
});

interface RequestsPageProps {
  isTesting?: boolean;
}

export default function RequestsPage({ isTesting = false }: RequestsPageProps = {}) {
  return (
    <div data-testid="requests-page">
      <ProtectedRoute>
        <MainLayout>
          <RequestsContent />
        </MainLayout>
      </ProtectedRoute>
    </div>
  );
}
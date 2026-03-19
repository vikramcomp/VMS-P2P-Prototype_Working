'use client';

import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';

// Dynamically import the approvals content to avoid hydration issues
const ApprovalsContent = dynamic(
  () => import('@/components/approvals'),
  {
    ssr: false,
    loading: () => <div className="p-6">Loading...</div>
  }
);

interface ApprovalsPageProps {
  isTesting?: boolean;
}

export default function ApprovalsPage({ isTesting = false }: ApprovalsPageProps = {}) {
  return (
    <div data-testid="approvals-page">
      <ProtectedRoute>
        <MainLayout>
          <ApprovalsContent />
        </MainLayout>
      </ProtectedRoute>
    </div>
  );
}

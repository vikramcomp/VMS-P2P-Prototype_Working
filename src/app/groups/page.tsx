'use client';

import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';

// Dynamically import the groups content to avoid hydration issues
const GroupsContent = dynamic(() => import('@/components/groups/groups-content'), {
  ssr: false,
  loading: () => <div className="p-6">Loading...</div>
});

interface GroupsPageProps {
  isTesting?: boolean;
}

export default function GroupsPage({ isTesting = false }: GroupsPageProps = {}) {
  return (
    <div data-testid="groups-page">
      <ProtectedRoute>
        <MainLayout>
          <div className="cus-manage-groups-pg">
            <GroupsContent />
          </div>
        </MainLayout>
      </ProtectedRoute>
    </div>
  );
}
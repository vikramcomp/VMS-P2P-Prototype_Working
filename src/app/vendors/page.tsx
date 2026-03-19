'use client';

import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';

// Dynamically import the vendors content to avoid hydration issues
const VendorsContent = dynamic(() => import('@/components/vendors/vendors-content'), {
  ssr: false,
  loading: () => <div className="p-6">Loading...</div>
});

interface VendorsPageProps {
  isTesting?: boolean;
}

export default function VendorsPage({ isTesting = false }: VendorsPageProps = {}) {
  return (
    <div data-testid="vendors-page">
      <ProtectedRoute>
        <MainLayout>
          <div className="cus-manage-groups-pg">
            <VendorsContent />
          </div>
        </MainLayout>
      </ProtectedRoute>
    </div>
  );
}

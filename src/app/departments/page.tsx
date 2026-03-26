'use client';

import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';

// Dynamically import the departments content to avoid hydration issues
const DepartmentsContent = dynamic(() => import('@/components/departments/departments-content'), {
  ssr: false,
  loading: () => <div className="p-6">Loading...</div>
});

interface DepartmentsPageProps {
  isTesting?: boolean;
}

export default function DepartmentsPage({ isTesting = false }: DepartmentsPageProps = {}) {
  return (
    <div data-testid="departments-page">
      <ProtectedRoute>
        <MainLayout>
          <div className="cus-manage-departments-pg">
            <DepartmentsContent isTesting={isTesting} />
          </div>
        </MainLayout>
      </ProtectedRoute>
    </div>
  );
}

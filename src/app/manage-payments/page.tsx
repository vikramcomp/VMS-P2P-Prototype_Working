'use client';

import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { MainLayout } from '@/components/layout/main-layout';

const ManagePaymentsContent = dynamic(
  () => import('@/components/payments/manage-payments-content'),
  { ssr: false }
);

export default function ManagePaymentsPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <ManagePaymentsContent />
      </MainLayout>
    </ProtectedRoute>
  );
}

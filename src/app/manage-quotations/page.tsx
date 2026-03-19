'use client';

import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';

// Dynamically import the quotations content to avoid hydration issues
const QuotationsContent = dynamic(
  () => import('@/components/quotations'),
  {
    ssr: false,
    loading: () => <div className="p-6">Loading...</div>
  }
);

export default function ManageQuotationsPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <QuotationsContent />
      </MainLayout>
    </ProtectedRoute>
  );
}

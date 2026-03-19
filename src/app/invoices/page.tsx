'use client';

import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';

// Dynamically import the invoices content to avoid hydration issues
const InvoicesContent = dynamic(() => import('@/components/invoices/invoices-content'), {
  ssr: false,
  loading: () => <div className="p-6">Loading...</div>
});

interface InvoicesPageProps {
  isTesting?: boolean;
}

export default function InvoicesPage({ isTesting = false }: InvoicesPageProps = {}) {
  return (
    <div data-testid="invoices-page">
      <ProtectedRoute>
        <MainLayout>
          <InvoicesContent />
        </MainLayout>
      </ProtectedRoute>
    </div>
  );
}

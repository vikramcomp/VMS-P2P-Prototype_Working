'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ViewPaymentContent from '@/components/payments/view-payment-content';
import { MainLayout } from '@/components/layout/main-layout';

function ViewPaymentPageContent() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoiceId');

  if (!invoiceId) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Invoice ID</h2>
            <p className="text-gray-600">Please provide a valid invoice ID</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ViewPaymentContent invoiceBillAdvPaymentId={parseInt(invoiceId)} />
    </MainLayout>
  );
}

export default function ViewPaymentPage() {
  return (
    <Suspense fallback={null}>
      <ViewPaymentPageContent />
    </Suspense>
  );
}

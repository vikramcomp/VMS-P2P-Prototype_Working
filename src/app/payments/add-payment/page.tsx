'use client';

import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import AddPaymentContent from '@/components/payments/add-payment-content';

export default function AddPaymentPage() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoiceId');

  if (!invoiceId) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 font-medium">Error: Invoice ID is required</p>
            <p className="text-gray-500 mt-2">Please select a payment from the Manage Payments page</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <AddPaymentContent invoiceBillAdvPaymentId={parseInt(invoiceId)} />
    </MainLayout>
  );
}

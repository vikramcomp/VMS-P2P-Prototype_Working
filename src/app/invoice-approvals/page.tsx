'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import InvoiceApprovalsContent from '@/components/approvals/invoice-approvals-content';

export default function InvoiceApprovalsPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <InvoiceApprovalsContent />
      </MainLayout>
    </ProtectedRoute>
  );
}

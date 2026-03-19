'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import ViewEditInvoiceApproval from '@/components/approvals/view-edit-invoice-approval';

export default function EditInvoiceApprovalPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <ViewEditInvoiceApproval mode="edit" />
      </MainLayout>
    </ProtectedRoute>
  );
}

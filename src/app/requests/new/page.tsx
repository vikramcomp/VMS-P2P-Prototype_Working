'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import RequestForm from '@/components/requests/request-form';

interface AddNewRequestPageProps {
  isTesting?: boolean;
}

export default function AddNewRequestPage({ isTesting = false }: AddNewRequestPageProps = {}) {
  return (
    <div data-testid="add-new-request-page">
      <ProtectedRoute>
        <MainLayout>
          <RequestForm mode="add" />
        </MainLayout>
      </ProtectedRoute>
    </div>
  );
}
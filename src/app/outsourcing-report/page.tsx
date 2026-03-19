'use client';

import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { MainLayout } from '@/components/layout/main-layout';

const OutsourcingReportContent = dynamic(
  () => import('@/components/reports/outsourcing-report-content'),
  { ssr: false }
);

export default function OutsourcingReportPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <OutsourcingReportContent />
      </MainLayout>
    </ProtectedRoute>
  );
}

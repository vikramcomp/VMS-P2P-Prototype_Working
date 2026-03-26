'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCompanyContext } from '@/context/CompanyContext';
import { ArrowLeft, Building2 } from 'lucide-react';

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { companies } = useCompanyContext();

  // TODO: replace local lookup with GET /api/companies/{id} when backend is ready.
  const company = companies.find((item: any) => item.id === params?.id);

  return (
    <MainLayout title="Company Details">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.push('/super-admin/companies')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Company Details</h3>
            <p className="text-xs text-muted-foreground">Tenant account profile</p>
          </div>
        </div>

        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            {!company ? (
              <p className="text-sm text-muted-foreground">Company not found.</p>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-foreground">
                  <Building2 className="h-4 w-4 text-vendor-600" />
                  <span className="font-semibold">{company.name}</span>
                </div>
                <p className="text-muted-foreground">Code: {company.code}</p>
                <p className="text-muted-foreground">Type: {company.type || company.accountType}</p>
                <p className="text-muted-foreground">Subscription: {company.subscriptionPlan}</p>
                <p className="text-muted-foreground">Primary Email: {company.primaryEmail || company.adminEmail}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

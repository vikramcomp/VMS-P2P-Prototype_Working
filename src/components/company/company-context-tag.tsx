'use client';

import React from 'react';
import { Building2 } from 'lucide-react';
import { useCompanyContext } from '@/context/CompanyContext';

export function CompanyContextTag() {
  // TODO: pass activeCompany.id to all API create/fetch calls as tenantId.
  const { activeCompany } = useCompanyContext();

  if (!activeCompany) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
      <Building2 className="h-3.5 w-3.5 text-vendor-600" />
      <span className="font-medium text-foreground">{activeCompany.shortName}</span>
    </div>
  );
}

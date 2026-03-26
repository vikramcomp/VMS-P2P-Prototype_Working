'use client';

import React from 'react';
import { Building2, Lock } from 'lucide-react';
import { useCompanyContext } from '@/context/CompanyContext';
import { Tooltip } from '@/components/ui/tooltip';

export function CompanyReadonlyField() {
  // TODO: pass activeCompany.id to all API create/fetch calls as tenantId.
  const { activeCompany } = useCompanyContext();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Company (Tenant)</label>
      <Tooltip content="Managed by Super Admin. Switch company from the top-right selector." position="top">
        <div className="flex h-10 items-center justify-between rounded-md border border-input bg-muted/40 px-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 text-vendor-600" />
            <span className="truncate">{activeCompany?.name || 'No company selected'}</span>
          </div>
          <Lock className="h-4 w-4" />
        </div>
      </Tooltip>
      {/* TODO: this display-only field must not be submitted in API payload. */}
    </div>
  );
}

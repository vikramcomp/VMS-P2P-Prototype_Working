'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { MappingComponent } from '@/components/common/mapping-component';
import { useCompany } from '@/context/CompanyContext';
import { getBusinessUnitsByCompany } from '@/data/seedData/businessUnits';

export default function BranchMappingPage() {
  const { activeCompany } = useCompany();
  
  // Get branches for current company
  const branches = getBusinessUnitsByCompany(activeCompany?.id || 'comp-001');
  
  // Transform to mapping items
  const mappingItems = branches.map(branch => ({
    id: branch.id,
    sourceName: branch.name,
    mappedName: branch.code.includes('BR-') ? branch.code.replace('BR-', 'BC-BR-') : `BC-DIM-${branch.code}`,
    status: 'Mapped' as const
  }));

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="p-6 max-w-6xl mx-auto">
          <MappingComponent 
            title="Branch Mapping"
            sourceLabel="VMS Branch"
            targetLabel="Business Central Dimension"
            items={mappingItems}
          />
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

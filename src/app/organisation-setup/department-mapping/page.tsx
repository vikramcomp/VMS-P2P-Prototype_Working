'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { MappingComponent } from '@/components/common/mapping-component';
import { useCompany } from '@/context/CompanyContext';
import { getDepartmentsByCompany } from '@/data/seedData/businessUnits';

export default function DepartmentMappingPage() {
  const { activeCompany } = useCompany();
  
  // Get departments for current company
  const departments = getDepartmentsByCompany(activeCompany?.id || 'comp-001');
  
  // Transform to mapping items
  const mappingItems = departments.map(dept => ({
    id: dept.id,
    sourceName: dept.name,
    mappedName: `BC-DEPT-${dept.id}`,
    status: 'Mapped' as const
  }));

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="p-6 max-w-6xl mx-auto">
          <MappingComponent 
            title="Department Mapping"
            sourceLabel="VMS Department"
            targetLabel="Business Central Dimension"
            items={mappingItems}
          />
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

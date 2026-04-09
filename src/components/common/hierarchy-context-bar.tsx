'use client';

import React from 'react';
import { useCompany } from '@/context/CompanyContext';
import { ChevronRight, Building2, UsersRound, Building } from 'lucide-react';
import { cn } from '@/utils/cn';

interface HierarchyContextBarProps {
  branchName?: string;
  departmentName?: string;
  className?: string;
}

/**
 * Read-only hierarchy context display for Create/Mapping screens
 * Shows: Company → Branch → Department
 */
export function HierarchyContextBar({ 
  branchName, 
  departmentName, 
  className 
}: HierarchyContextBarProps) {
  const { activeCompany } = useCompany();

  if (!activeCompany) return null;

  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 bg-gray-50 border rounded-md text-sm text-gray-600 mb-6",
      className
    )}>
      {/* Company */}
      <div className="flex items-center gap-1.5 font-medium text-gray-900">
        <Building2 className="h-4 w-4 text-blue-600" />
        <span>{activeCompany.name}</span>
      </div>

      <ChevronRight className="h-3.5 w-3.5 text-gray-400" />

      {/* Branch */}
      <div className="flex items-center gap-1.5">
        <UsersRound className="h-4 w-4 text-orange-500" />
        <span className={cn(branchName ? "text-gray-900 font-medium" : "text-gray-400 italic")}>
          {branchName || 'Not Selected'}
        </span>
      </div>

      <ChevronRight className="h-3.5 w-3.5 text-gray-400" />

      {/* Department */}
      <div className="flex items-center gap-1.5">
        <Building className="h-4 w-4 text-purple-500" />
        <span className={cn(departmentName ? "text-gray-900 font-medium" : "text-gray-400 italic")}>
          {departmentName || 'Not Selected'}
        </span>
      </div>
    </div>
  );
}

export default HierarchyContextBar;

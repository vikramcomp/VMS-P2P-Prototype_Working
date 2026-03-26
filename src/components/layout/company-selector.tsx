'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Check, ChevronDown, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tooltip } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/context/CompanyContext';

type SelectorVariant = 'header' | 'sidebar';

interface CompanySelectorProps {
  variant?: SelectorVariant;
  isSuperAdmin: boolean;
}

export function CompanySelector({ variant = 'header', isSuperAdmin }: CompanySelectorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { companies, activeCompany, setActiveCompany } = useCompany();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const switchToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (switchToastTimerRef.current) {
        clearTimeout(switchToastTimerRef.current);
        switchToastTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const filteredCompanies = useMemo(() => {
    const lower = searchTerm.trim().toLowerCase();
    const visible = (companies as any[]).filter((company: any) => company.id !== 'comp-003');
    if (!lower) return visible;
    return visible.filter((company: any) => {
      return (
        company.name?.toLowerCase().includes(lower) ||
        company.shortName?.toLowerCase().includes(lower) ||
        company.code?.toLowerCase().includes(lower)
      );
    });
  }, [companies, searchTerm]);

  const groupedCompanies = useMemo(() => {
    const groupOrder = ['Compunnel US', 'Compunnel India'];
    const orderedGroups = groupOrder
      .map((group) => ({
        group,
        companies: filteredCompanies.filter((company: any) => company.group === group),
      }))
      .filter((entry) => entry.companies.length > 0);

    const otherCompanies = filteredCompanies.filter((company: any) => !groupOrder.includes(company.group));
    if (otherCompanies.length > 0) {
      orderedGroups.push({ group: 'Other', companies: otherCompanies });
    }

    return orderedGroups;
  }, [filteredCompanies]);

  const getStatusDotClass = (company: any) => {
    const subscriptionStatus = (company.subscriptionStatus || '').toLowerCase();
    if (!company.isActive) return 'bg-gray-400';
    if (subscriptionStatus === 'active') return 'bg-green-500';
    if (subscriptionStatus === 'trial') return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getTypeBadgeClass = (type: string) => {
    if (type === 'Enterprise') return 'bg-vendor-100 text-vendor-700';
    if (type === 'SMB') return 'bg-teal-100 text-teal-700';
    return 'bg-amber-100 text-amber-700';
  };

  const getDisplayName = (name?: string) => {
    if (!name) return 'Select Company';
    if (name.length <= 28) return name;
    return `${name.slice(0, 28)}...`;
  };

  const getRegionTag = (company: any) => {
    if (company.group === 'Compunnel US') return 'US';
    if (company.group === 'Compunnel India') return 'IN';
    return null;
  };

  const getRegionTagClass = (tag: string | null) => {
    if (tag === 'US') return 'bg-sky-50 text-sky-700';
    if (tag === 'IN') return 'bg-amber-50 text-amber-700';
    return 'bg-gray-50 text-gray-700';
  };

  const handleSelectCompany = (company: any) => {
    if (!company?.isActive) return;
    setActiveCompany(company);
    setIsOpen(false);
    const toastControl = toast({
      title: 'Company switched',
      description: `Switched to ${company.shortName}`,
    });

    if (switchToastTimerRef.current) {
      clearTimeout(switchToastTimerRef.current);
    }

    switchToastTimerRef.current = setTimeout(() => {
      toastControl.dismiss();
      switchToastTimerRef.current = null;
    }, 1200);
  };

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={
          variant === 'sidebar'
            ? 'flex w-full items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-left hover:bg-muted'
            : 'flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50'
        }
      >
        <Building2 className={variant === 'sidebar' ? 'h-4 w-4 text-vendor-500' : 'h-4 w-4 text-vendor-600'} />
        <span className={variant === 'sidebar' ? 'truncate text-xs font-semibold text-foreground' : 'max-w-[220px] truncate text-sm'}>
          {getDisplayName(activeCompany?.name)}
        </span>
        <span className={`h-2 w-2 rounded-full ${getStatusDotClass(activeCompany)}`} aria-hidden="true" />
        <ChevronDown className={variant === 'sidebar' ? 'ml-auto h-4 w-4 text-muted-foreground' : 'h-4 w-4 text-gray-500'} />
      </button>

      {variant === 'sidebar' && (
        <p className="mt-1 px-1 text-[10px] text-muted-foreground">Managing as Super Admin</p>
      )}

      {isOpen && (
        <div className="absolute right-0 top-full z-[120] mt-2 flex max-h-[400px] min-w-[300px] flex-col rounded-md border border-border bg-white shadow-lg">
          <div className="shrink-0 border-b border-border p-3">
            <p className="text-sm font-semibold text-foreground">Select Company Account</p>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search companies..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {groupedCompanies.map((entry, groupIndex) => (
              <React.Fragment key={entry.group}>
                {groupIndex > 0 ? <div className="my-1 h-px bg-border" /> : null}
                {entry.companies.map((company: any) => {
                  const isSelected = activeCompany?.id === company.id;
                  const isInactive = !company.isActive;
                  const regionTag = getRegionTag(company);
                  const itemContent = (
                    <button
                      type="button"
                      key={company.id}
                      onClick={() => handleSelectCompany(company)}
                      disabled={isInactive}
                      className={`mb-1 flex w-full items-center justify-between rounded-md px-2 py-2 text-left ${
                        isInactive ? 'cursor-not-allowed opacity-60' : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="inline-flex h-4 w-4 items-center justify-center">
                          {isSelected ? <Check className="h-4 w-4 text-vendor-600" /> : null}
                        </span>
                        <span className="flex min-w-0 items-center">
                          <span className="truncate text-sm text-foreground">{company.name}</span>
                          {regionTag ? (
                            <span
                              className={`ml-[6px] inline-flex items-center rounded-[3px] border border-current px-[5px] py-[1px] text-[10px] leading-none ${getRegionTagClass(regionTag)}`}
                            >
                              {regionTag}
                            </span>
                          ) : null}
                        </span>
                      </div>
                      <div className="ml-2 flex items-center">
                        <span className={`h-2 w-2 rounded-full ${getStatusDotClass(company)}`} />
                      </div>
                    </button>
                  );

                  if (isInactive) {
                    return (
                      <Tooltip key={company.id} content="This company is inactive" position="left">
                        {itemContent}
                      </Tooltip>
                    );
                  }

                  return <React.Fragment key={company.id}>{itemContent}</React.Fragment>;
                })}
              </React.Fragment>
            ))}
          </div>

          <div className="shrink-0 border-t border-border p-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push('/super-admin/companies/create');
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-vendor-600 hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
              Add New Company
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

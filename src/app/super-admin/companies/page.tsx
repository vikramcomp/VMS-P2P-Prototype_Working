'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/context/CompanyContext';
import {
  Building2,
  Search,
  Plus,
  Eye,
  Pencil,
  LogIn,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  Users,
  CheckCircle2,
  Clock,
  CircleDot,
  Filter,
  X,
} from 'lucide-react';

type CompanyRow = {
  id: string;
  companyName: string;
  companyCode: string;
  accountType: 'Enterprise' | 'SMB' | 'Trial';
  primaryContact: string;
  primaryContactEmail: string;
  usersCount: number;
  subscriptionStatus: 'Active' | 'Inactive' | 'Trial' | 'Suspended';
  setupStatus: 'Complete' | 'In Progress' | 'Pending';
  isActive: boolean;
};

function mapAccountType(type: string): CompanyRow['accountType'] {
  if (type === 'enterprise') return 'Enterprise';
  if (type === 'smb') return 'SMB';
  return 'Trial';
}

function mapSubscriptionStatus(status: string, isActive: boolean): CompanyRow['subscriptionStatus'] {
  if (!isActive) return 'Inactive';
  if (status === 'active') return 'Active';
  if (status === 'trial') return 'Trial';
  return 'Suspended';
}

function mapSetupStatus(status: string): CompanyRow['setupStatus'] {
  if (status === 'complete') return 'Complete';
  if (status === 'in-progress') return 'In Progress';
  return 'Pending';
}

function AccountTypeBadge({ type }: { type: CompanyRow['accountType'] }) {
  const styles: Record<CompanyRow['accountType'], string> = {
    Enterprise: 'bg-blue-900 text-white',
    SMB: 'bg-teal-600 text-white',
    Trial: 'bg-orange-500 text-white',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[type]}`}>
      {type}
    </span>
  );
}

function SubscriptionBadge({ status }: { status: CompanyRow['subscriptionStatus'] }) {
  const styles: Record<CompanyRow['subscriptionStatus'], string> = {
    Active: 'bg-green-100 text-green-800',
    Inactive: 'bg-red-100 text-red-800',
    Trial: 'bg-orange-100 text-orange-800',
    Suspended: 'bg-gray-200 text-gray-600',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

function SetupStatusBadge({ status }: { status: CompanyRow['setupStatus'] }) {
  if (status === 'Complete') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle2 className="h-3 w-3" />
        Complete
      </span>
    );
  }
  if (status === 'In Progress') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="h-3 w-3" />
        In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-200 text-gray-600">
      <CircleDot className="h-3 w-3" />
      Pending
    </span>
  );
}

function CompanyLogoCell({ companyName }: { companyName: string }) {
  const initials = companyName
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <div className="h-8 w-8 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0 bg-vendor-800">
      {initials}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

interface FilterDropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

function FilterDropdown({ label, options, value, onChange }: FilterDropdownProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        <option value="">{label}: All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
    </div>
  );
}

export default function CompaniesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { companies, setActiveCompany } = useCompany();

  const [search, setSearch] = useState('');
  const [filterAccountType, setFilterAccountType] = useState('');
  const [filterSubscription, setFilterSubscription] = useState('');
  const [localCompanyState, setLocalCompanyState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const state: Record<string, boolean> = {};
    companies.forEach((company: any) => {
      state[company.id] = company.isActive;
    });
    setLocalCompanyState(state);
  }, [companies]);

  const rows = useMemo<CompanyRow[]>(() => {
    return companies.map((company: any) => {
      const isActive = localCompanyState[company.id] ?? company.isActive;
      return {
        id: company.id,
        companyName: company.name,
        companyCode: company.code,
        accountType: mapAccountType(company.accountType),
        primaryContact: company.adminName,
        primaryContactEmail: company.adminEmail,
        usersCount: company.userCount,
        subscriptionStatus: mapSubscriptionStatus(company.subscriptionStatus, isActive),
        setupStatus: mapSetupStatus(company.onboardingStatus),
        isActive,
      };
    });
  }, [companies, localCompanyState]);

  const filtered = useMemo(() => {
    return rows.filter((company) => {
      const matchesSearch =
        !search ||
        company.companyName.toLowerCase().includes(search.toLowerCase()) ||
        company.companyCode.toLowerCase().includes(search.toLowerCase());
      const matchesAccountType = !filterAccountType || company.accountType === filterAccountType;
      const matchesSubscription = !filterSubscription || company.subscriptionStatus === filterSubscription;
      return matchesSearch && matchesAccountType && matchesSubscription;
    });
  }, [rows, search, filterAccountType, filterSubscription]);

  const total = rows.length;
  const activeCount = rows.filter((company) => company.subscriptionStatus === 'Active').length;
  const inactiveCount = rows.filter((company) => company.subscriptionStatus === 'Inactive').length;
  const trialOrPendingCount = rows.filter(
    (company) => company.subscriptionStatus === 'Trial' || company.setupStatus === 'Pending'
  ).length;

  const hasActiveFilters = Boolean(search || filterAccountType || filterSubscription);

  const clearFilters = () => {
    setSearch('');
    setFilterAccountType('');
    setFilterSubscription('');
  };

  const handleToggleActive = (id: string) => {
    setLocalCompanyState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));

    const company = rows.find((item) => item.id === id);
    const nextState = !(localCompanyState[id] ?? company?.isActive ?? false);
    toast({
      title: nextState ? 'Company Activated' : 'Company Deactivated',
      description: 'Local state updated. TODO: persist activation status through Company Accounts API.',
    });
  };

  const handleLoginAsCompany = (id: string) => {
    const selected = companies.find((company: any) => company.id === id);
    if (!selected) return;

    const isEnabled = localCompanyState[id] ?? selected.isActive;
    if (!isEnabled) {
      toast({
        title: 'Company Is Inactive',
        description: 'Activate the company before logging in as this tenant.',
        variant: 'destructive',
      });
      return;
    }

    setActiveCompany(selected);
    toast({
      title: 'Active Company Updated',
      description: `Switched context to ${selected.shortName}. Redirecting to dashboard...`,
    });
    router.push('/dashboard');
  };

  return (
    <MainLayout title="Company Accounts">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Company Accounts
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage all tenant companies on this platform</p>
        </div>
        <Button className="flex items-center gap-2 text-sm" onClick={() => router.push('/super-admin/companies/create')}>
          <Plus className="h-4 w-4" />
          Add New Company
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Companies"
          value={total}
          icon={<Building2 className="h-5 w-5 text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          label="Active"
          value={activeCount}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          color="bg-green-50"
        />
        <StatCard
          label="Inactive"
          value={inactiveCount}
          icon={<CircleDot className="h-5 w-5 text-red-500" />}
          color="bg-red-50"
        />
        <StatCard
          label="Trial / Pending Setup"
          value={trialOrPendingCount}
          icon={<Clock className="h-5 w-5 text-orange-500" />}
          color="bg-orange-50"
        />
      </div>

      <Card className="border-0 shadow-sm mb-4">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by company name or code..."
                className="pl-9 text-sm border-gray-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Filter className="h-4 w-4" />
              <span>Filter:</span>
            </div>

            <FilterDropdown
              label="Account Type"
              options={['Enterprise', 'SMB', 'Trial']}
              value={filterAccountType}
              onChange={setFilterAccountType}
            />

            <FilterDropdown
              label="Subscription"
              options={['Active', 'Inactive', 'Trial', 'Suspended']}
              value={filterSubscription}
              onChange={setFilterSubscription}
            />

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-xs"
                onClick={clearFilters}
              >
                <X className="h-3 w-3" />
                Clear
              </Button>
            )}

            <span className="ml-auto text-xs text-gray-400">
              {filtered.length} of {total} companies
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600 w-10 text-center">S.No</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 w-12">Logo</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Company Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Code</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Account Type</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Primary Contact</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-center">Users</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Subscription</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Setup Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-gray-400">
                      <Building2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p>No companies found.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((company, index) => (
                    <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-center text-gray-500">{index + 1}</td>
                      <td className="px-4 py-3">
                        <CompanyLogoCell companyName={company.companyName} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{company.companyName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-gray-100 rounded px-1.5 py-0.5 text-gray-700">{company.companyCode}</code>
                      </td>
                      <td className="px-4 py-3">
                        <AccountTypeBadge type={company.accountType} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900">{company.primaryContact}</div>
                        <div className="text-xs text-gray-400">{company.primaryContactEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center gap-1 text-gray-700">
                          <Users className="h-3.5 w-3.5 text-gray-400" />
                          {company.usersCount}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <SubscriptionBadge status={company.subscriptionStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <SetupStatusBadge status={company.setupStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Tooltip content="View company detail" position="top">
                            <button
                              className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              aria-label="View"
                              onClick={() => toast({ title: 'Coming Soon', description: 'Company detail view will be integrated with API.' })}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </Tooltip>

                          <Tooltip content="Edit company" position="top">
                            <button
                              className="p-1.5 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              aria-label="Edit"
                              onClick={() => toast({ title: 'Coming Soon', description: 'Company edit flow will be integrated with API.' })}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </Tooltip>

                          <Tooltip content="Login as this Company" position="top">
                            <button
                              className="p-1.5 rounded-md text-gray-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                              aria-label="Login as company"
                              onClick={() => handleLoginAsCompany(company.id)}
                            >
                              <LogIn className="h-4 w-4" />
                            </button>
                          </Tooltip>

                          <Tooltip content={company.isActive ? 'Deactivate company' : 'Activate company'} position="top">
                            <button
                              onClick={() => handleToggleActive(company.id)}
                              className={`p-1.5 rounded-md transition-colors ${
                                company.isActive
                                  ? 'text-green-600 hover:text-red-500 hover:bg-red-50'
                                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                              }`}
                              aria-label={company.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {company.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

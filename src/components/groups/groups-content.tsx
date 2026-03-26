"use client";

import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/ui/pagination";
import { Tooltip } from "@/components/ui/tooltip";
import { useCompanyContext } from "@/context/CompanyContext";
import { CompanyContextTag } from "@/components/company/company-context-tag";
import {
  getBusinessUnitsByCompany,
  getLocalBusinessUnitsByCompany,
} from "@/data/seedData/businessUnits";
import { ArrowUpDown, Building2, Edit, Plus, Search, Trash2 } from "lucide-react";
import type { PageSize, PaginationState } from "@/types/groups";

interface GroupsContentProps {
  isTesting?: boolean;
}

type BusinessUnit = {
  id: string;
  companyId: string;
  code: string;
  name: string;
  location: string;
  description: string;
  isActive: boolean;
};

const pageSizeToNumber = (value: PageSize) => (value === "All" ? Number.MAX_SAFE_INTEGER : Number(value));

export default function GroupsContent({ isTesting = false }: GroupsContentProps = {}) {
  const router = useRouter();
  // TODO: pass activeCompany.id to all API create/fetch calls as tenantId.
  const { activeCompany } = useCompanyContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [showSwitchNotice, setShowSwitchNotice] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
    showingFrom: 0,
    showingTo: 0,
  });

  const companySeedUnits = useMemo(() => {
    if (!activeCompany?.id) return [];
    // TODO: replace with API call: GET /api/business-units?companyId={id}
    return getBusinessUnitsByCompany(activeCompany.id);
  }, [activeCompany?.id]);

  const companyLocalUnits = useMemo(() => {
    if (!activeCompany?.id) return [];
    // TODO: replace local additions with API POST + refetch.
    return getLocalBusinessUnitsByCompany(activeCompany.id);
  }, [activeCompany?.id]);

  const allBusinessUnits = useMemo<BusinessUnit[]>(() => {
    const merged = [...companySeedUnits, ...companyLocalUnits];
    const unique = new Map<string, BusinessUnit>();
    merged.forEach((unit) => {
      unique.set(unit.id, unit as BusinessUnit);
    });
    return Array.from(unique.values());
  }, [companySeedUnits, companyLocalUnits]);

  const filteredBusinessUnits = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return allBusinessUnits;
    return allBusinessUnits.filter((unit) => {
      return (
        unit.code.toLowerCase().includes(query) ||
        unit.name.toLowerCase().includes(query) ||
        unit.description.toLowerCase().includes(query)
      );
    });
  }, [allBusinessUnits, searchTerm]);

  useEffect(() => {
    const pageSizeNumber = pageSizeToNumber(pagination.pageSize);
    const totalRecords = filteredBusinessUnits.length;
    const totalPages = pageSizeNumber === Number.MAX_SAFE_INTEGER ? 1 : Math.max(1, Math.ceil(totalRecords / pageSizeNumber));
    const boundedPage = Math.min(pagination.currentPage, totalPages);
    const showingFrom = totalRecords === 0 ? 0 : pageSizeNumber === Number.MAX_SAFE_INTEGER ? 1 : (boundedPage - 1) * pageSizeNumber + 1;
    const showingTo = totalRecords === 0 ? 0 : pageSizeNumber === Number.MAX_SAFE_INTEGER ? totalRecords : Math.min(boundedPage * pageSizeNumber, totalRecords);

    setPagination((prev: PaginationState) => ({
      ...prev,
      currentPage: boundedPage,
      totalRecords,
      totalPages,
      showingFrom,
      showingTo,
    }));
  }, [filteredBusinessUnits, pagination.pageSize, pagination.currentPage]);

  const paginatedBusinessUnits = useMemo(() => {
    if (pagination.pageSize === "All") return filteredBusinessUnits;
    const pageSizeNumber = Number(pagination.pageSize);
    const start = (pagination.currentPage - 1) * pageSizeNumber;
    const end = start + pageSizeNumber;
    return filteredBusinessUnits.slice(start, end);
  }, [filteredBusinessUnits, pagination.pageSize, pagination.currentPage]);

  useEffect(() => {
    // TODO: replace inline switch indicator with event-driven server refresh hint when API is connected.
    if (!activeCompany?.id) return;
    setShowSwitchNotice(true);
    const timer = window.setTimeout(() => setShowSwitchNotice(false), 3000);
    return () => window.clearTimeout(timer);
  }, [activeCompany?.id]);

  const totalCount = filteredBusinessUnits.length;
  const activeCount = filteredBusinessUnits.filter((unit) => unit.isActive).length;
  const inactiveCount = filteredBusinessUnits.filter((unit) => !unit.isActive).length;

  return (
    <div className="space-y-4" data-testid="groups-content-root">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Branches</h3>
          <CompanyContextTag />
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/groups/new")}
          className="cus-primary-btn gap-2 bg-vendor-600 text-xs font-normal hover:bg-vendor-700"
        >
          <Plus className="h-4 w-4" />
          Add Branch
        </Button>
      </div>

      {showSwitchNotice && activeCompany?.shortName && (
        <div className="text-xs text-muted-foreground">
          {"\u21bb"} Showing Branches for {activeCompany.shortName}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="mt-1 text-xl font-semibold text-foreground">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Active</div>
            <div className="mt-1 text-xl font-semibold text-foreground">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Inactive</div>
            <div className="mt-1 text-xl font-semibold text-foreground">{inactiveCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setSearchTerm(event.target.value);
                setPagination((prev: PaginationState) => ({ ...prev, currentPage: 1 }));
              }}
              placeholder="Search Branches"
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-3">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium">S.No</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Code</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">
                    <span className="inline-flex items-center">Branch Name <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground" /></span>
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Location</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Description</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-2 text-center text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBusinessUnits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                        <span>
                          No Branches found for {activeCompany?.shortName || "the selected company"}. Click 'Add Branch' to get started.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedBusinessUnits.map((unit, index) => {
                    const serial = pagination.pageSize === "All"
                      ? index + 1
                      : (pagination.currentPage - 1) * Number(pagination.pageSize) + index + 1;

                    return (
                      <tr key={unit.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-600">{serial}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{unit.code}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{unit.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{unit.location || '-'}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{unit.description}</td>
                        <td className="px-4 py-2">
                          <span className={unit.isActive ? "rounded px-2 py-1 text-xs font-normal bg-green-100 text-green-800" : "rounded px-2 py-1 text-xs font-normal bg-red-100 text-red-700"}>
                            {unit.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <Tooltip content="Edit Branch" position="top">
                              <button
                                type="button"
                                onClick={() => router.push(`/groups/${encodeURIComponent(unit.id)}/edit`)}
                                className="rounded p-1 text-gray-500 transition-colors hover:bg-muted hover:text-vendor-600"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Delete Branch" position="top">
                              <button type="button" className="rounded p-1 text-gray-500 transition-colors hover:bg-muted hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>

        <Pagination
          pagination={pagination}
          onPageChange={(page: number) => setPagination((prev: PaginationState) => ({ ...prev, currentPage: page }))}
          onPageSizeChange={(pageSize: PageSize) => setPagination((prev: PaginationState) => ({ ...prev, pageSize, currentPage: 1 }))}
        />
      </Card>
    </div>
  );
}

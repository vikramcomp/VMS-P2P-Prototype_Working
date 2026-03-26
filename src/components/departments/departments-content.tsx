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
  getDepartmentsByCompany,
} from "@/data/seedData/businessUnits";
import { ArrowUpDown, Building2, Edit, Plus, Search, Trash2 } from "lucide-react";
import type { PageSize, PaginationState } from "@/types/groups";

interface DepartmentsContentProps {
  isTesting?: boolean;
}

type Department = {
  id: string;
  companyId: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
};

interface FormattedDepartment extends Department {
  [key: string]: any;
}

function pageSizeToNumber(pageSize: PageSize): number {
  if (pageSize === "All") return Number.MAX_SAFE_INTEGER;
  return Number(pageSize);
}

export default function DepartmentsContent({ isTesting = false }: DepartmentsContentProps = {}) {
  const router = useRouter();
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

  const companySeedDepartments = useMemo(() => {
    if (!activeCompany?.id) return [];
    return getDepartmentsByCompany(activeCompany.id);
  }, [activeCompany?.id]);

  const allDepartments = useMemo<Department[]>(() => {
    return companySeedDepartments as Department[];
  }, [companySeedDepartments]);

  const filteredDepartments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return allDepartments;
    return allDepartments.filter((dept) => {
      return (
        dept.code.toLowerCase().includes(query) ||
        dept.name.toLowerCase().includes(query) ||
        dept.description.toLowerCase().includes(query)
      );
    });
  }, [allDepartments, searchTerm]);

  useEffect(() => {
    const pageSizeNumber = pageSizeToNumber(pagination.pageSize);
    const totalRecords = filteredDepartments.length;
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
  }, [filteredDepartments, pagination.pageSize, pagination.currentPage]);

  const paginatedDepartments = useMemo(() => {
    if (pagination.pageSize === "All") return filteredDepartments;
    const pageSizeNumber = Number(pagination.pageSize);
    const start = (pagination.currentPage - 1) * pageSizeNumber;
    const end = start + pageSizeNumber;
    return filteredDepartments.slice(start, end);
  }, [filteredDepartments, pagination.pageSize, pagination.currentPage]);

  useEffect(() => {
    if (!activeCompany?.id) return;
    setShowSwitchNotice(true);
    const timer = window.setTimeout(() => setShowSwitchNotice(false), 3000);
    return () => window.clearTimeout(timer);
  }, [activeCompany?.id]);

  const totalCount = filteredDepartments.length;
  const activeCount = filteredDepartments.filter((dept) => dept.isActive).length;
  const inactiveCount = filteredDepartments.filter((dept) => !dept.isActive).length;

  return (
    <div className="space-y-4" data-testid="departments-content-root">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Departments</h3>
          <CompanyContextTag />
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/departments/new")}
          className="cus-primary-btn gap-2 bg-vendor-600 text-xs font-normal hover:bg-vendor-700"
        >
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      {showSwitchNotice && activeCompany?.shortName && (
        <div className="text-xs text-muted-foreground">
          {"\u21bb"} Showing Departments for {activeCompany.shortName}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{totalCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Inactive</p>
              <p className="text-2xl font-bold text-red-600">{inactiveCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative flex items-center gap-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setSearchTerm(event.target.value);
                setPagination((prev: PaginationState) => ({ ...prev, currentPage: 1 }));
              }}
              placeholder="Search Departments"
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
                    <span className="inline-flex items-center">Department Name <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground" /></span>
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Description</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-2 text-center text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                        <span>
                          No Departments found for {activeCompany?.shortName || "the selected company"}. Click 'Add Department' to get started.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedDepartments.map((dept, index) => {
                    const serial = pagination.pageSize === "All"
                      ? index + 1
                      : (pagination.currentPage - 1) * Number(pagination.pageSize) + index + 1;

                    return (
                      <tr key={dept.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-600">{serial}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{dept.code}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{dept.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{dept.description}</td>
                        <td className="px-4 py-2">
                          <span className={dept.isActive ? "rounded px-2 py-1 text-xs font-normal bg-green-100 text-green-800" : "rounded px-2 py-1 text-xs font-normal bg-red-100 text-red-700"}>
                            {dept.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <Tooltip content="Edit Department" position="top">
                              <button type="button" className="rounded p-1 text-gray-500 transition-colors hover:bg-muted hover:text-vendor-600">
                                <Edit className="h-4 w-4" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Delete Department" position="top">
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

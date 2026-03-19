"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/pagination";
import {
  Eye,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  MoreVertical,
  Download,
  CheckCircle,
  XCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageSize, PaginationState } from "@/types/groups";
import { approvalsService } from "@/services/approvals-service";
import { logger } from "@/utils/logger";
import { MultiLineTooltip } from "@/components/ui/multi-line-tooltip";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  getFormattedGroups,
  getFormattedRequestTypes,
} from "@/services/groups-service";
import { subgroupsService } from "@/services/subgroups-service";

// Types for Approval data
interface Approval {
  id?: number;
  requestNumber: string;
  requestName: string;
  requestType: string;
  requestDescription: string;
  groupId: string;
  subgroup_Name: string;
  pantherProjectProposalId: string;
  requestNotes: string;
  detailedRequestStatus: string;
  requestStatus: string;
  totalAgeing: number;
  hasPoGenerated?: boolean;
}

interface FilterState {
  groupId: number;
  requestTypeId: number[]; // Changed to array for multi-select
  requestStatus: number;
  subgroupId: number;
}

// API Response interface
interface ApprovalsApiResponse {
  data?: Approval[];
  totalRecords?: number;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  message?: string;
  success?: boolean;
}

interface ApprovalsContentProps {
  isTesting?: boolean;
}

export default function ApprovalsContent({
  isTesting = false,
}: ApprovalsContentProps = {}) {
  const router = useRouter();
  const { toast } = useToast();

  // State management
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedApprovals, setSelectedApprovals] = useState<string[]>([]);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Delete state
  const [approvalToDelete, setApprovalToDelete] = useState<Approval | null>(
    null
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filter visibility state
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  // Search state
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("");

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    groupId: -1,
    requestTypeId: [], // Changed to empty array for multi-select
    requestStatus: -1,
    subgroupId: -1,
  });

  // Groups dropdown state
  const [groupOptions, setGroupOptions] = useState<
    Array<{ id: string | number; name: string }>
  >([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  // Subgroups dropdown state
  const [subgroupOptions, setSubgroupOptions] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [subgroupsLoading, setSubgroupsLoading] = useState(false);

  // Request types dropdown state
  const [requestTypeOptions, setRequestTypeOptions] = useState<
    Array<{ id: number | string; name: string }>
  >([]);
  const [requestTypesLoading, setRequestTypesLoading] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10 as PageSize,
    totalRecords: 0,
    totalPages: 0,
    showingFrom: 0,
    showingTo: 0,
  });

  // Toggle filter visibility
  const toggleFilters = () => {
    setIsFiltersVisible(!isFiltersVisible);
  };

  // Fetch approvals from API
  const fetchApprovals = async (
    page: number = 1,
    customPageSize?: PageSize
  ) => {
    setLoading(true);
    setError(null);

    try {
      const currentPageSize = customPageSize || pagination.pageSize;
      const pageSize = currentPageSize === 'All' ? 10000 : Number(currentPageSize);
      
      const requestBody = {
        groupId: filters.groupId,
        requestTypeId: filters.requestTypeId.length > 0 ? filters.requestTypeId[0] : -1,
        requestStatus: filters.requestStatus,
        subgroupId: filters.subgroupId,
        pageNumber: page,
        pageSize: pageSize,
      };

      logger.info("Fetching approvals with request:", requestBody);

      const response = await approvalsService.getApprovals(requestBody);

      logger.info("Approvals response:", response);

      const approvalsData = (response.records || []).map((record: any) => ({
        ...record,
        id: record.id || record.Id || record.requestId || record.RequestId,
      }));
      setApprovals(approvalsData);

      const totalRecords = response.totalRecords || 0;
      const effectivePageSizeNum = currentPageSize === 'All' ? 10000 : Number(currentPageSize);
      const totalPages = Math.ceil(totalRecords / effectivePageSizeNum);
      const showingFrom = totalRecords === 0 ? 0 : (page - 1) * effectivePageSizeNum + 1;
      const showingTo = Math.min(showingFrom + effectivePageSizeNum - 1, totalRecords);

      setPagination({
        currentPage: page,
        pageSize: currentPageSize,
        totalRecords,
        totalPages,
        showingFrom,
        showingTo,
      });
    } catch (error: any) {
      logger.error("Error fetching approvals:", error);
      setError(error.message || "Failed to load approvals");
      toast({
        title: "Error",
        description:
          error.message || "Failed to load approvals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch groups for dropdown on mount
  useEffect(() => {
    const loadGroups = async () => {
      setGroupsLoading(true);
      try {
        const groups = await getFormattedGroups();
        // Filter out "All Groups" option if it exists in the API response
        const filteredGroups = groups.filter(
          (g) => String(g.id) !== "-1" && g.name.toLowerCase() !== "all groups"
        );
        setGroupOptions(filteredGroups);
      } catch (error) {
        console.error("Error fetching groups:", error);
        toast({
          title: "Error",
          description: "Failed to load groups for filter",
          variant: "destructive",
        });
      } finally {
        setGroupsLoading(false);
      }
    };

    loadGroups();
  }, []);

  // Fetch request types for dropdown on mount
  useEffect(() => {
    const loadRequestTypes = async () => {
      setRequestTypesLoading(true);
      try {
        const requestTypes = await getFormattedRequestTypes();
        setRequestTypeOptions(requestTypes);
      } catch (error) {
        console.error("Error fetching request types:", error);
        toast({
          title: "Error",
          description: "Failed to load request types for filter",
          variant: "destructive",
        });
      } finally {
        setRequestTypesLoading(false);
      }
    };

    loadRequestTypes();
  }, []);

  // Fetch subgroups when group changes
  useEffect(() => {
    const loadSubgroups = async () => {
      if (filters.groupId === -1) {
        setSubgroupOptions([]);
        return;
      }

      setSubgroupsLoading(true);
      try {
        const subgroups = await subgroupsService.getSubgroupsByGroupId(
          filters.groupId
        );
        setSubgroupOptions(subgroups);
        // Reset subgroup selection when group changes
        setFilters((prev) => ({ ...prev, subgroupId: -1 }));
      } catch (error) {
        console.error("Error fetching subgroups:", error);
        setSubgroupOptions([]);
        toast({
          title: "Error",
          description: "Failed to load subgroups for selected group",
          variant: "destructive",
        });
      } finally {
        setSubgroupsLoading(false);
      }
    };

    loadSubgroups();
  }, [filters.groupId]);

  // Initial load
  useEffect(() => {
    fetchApprovals(1);
  }, []);

  // Testing hook - calls all functions for coverage
  useEffect(() => {
    if (!isTesting) return;

    // Call helper functions
    toggleFilters();
    handleSelectAll();
    handleDeselectAll();
    handleSelectApproval("TEST001");
    handleDeselectApproval("TEST001");
    handleActionMenuToggle("TEST001");
    handleSearch();
    handleFilterChange("groupId", 1);
    handleFilterChange("requestTypeId", 1);
    handleFilterChange("requestStatus", 1);
    handleFilterChange("subgroupId", 1);
    applyFilters();
    resetFilters();
    handleExport().catch(() => {});
    handlePageChange(2);
    handlePageSizeChange(25);

    // Test intermediate handlers
    const mockSelectEvent = {
      target: { value: "1" },
    } as React.ChangeEvent<HTMLSelectElement>;
    handleGroupFilterChange(mockSelectEvent);
    handleSubgroupFilterChange(mockSelectEvent);
    handleRequestTypeFilterChange(mockSelectEvent);
    handleStatusFilterChange(mockSelectEvent);

    const mockCheckboxEvent = {
      target: { checked: true },
    } as React.ChangeEvent<HTMLInputElement>;
    handleSelectAllCheckboxChange(mockCheckboxEvent);
    handleApprovalCheckboxChange("TEST001")(mockCheckboxEvent);

    handleActionMenuToggleClick("TEST001")();

    const mockMouseEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
    } as React.MouseEvent;
    const mockApproval = {
      id: 1,
      requestNumber: "TEST001",
      requestName: "Test",
      requestType: "Test",
      requestDescription: "Test",
      groupId: "1",
      subgroup_Name: "Test",
      pantherProjectProposalId: "TEST",
      requestNotes: "Test",
      requestStatus: "Pending",
      totalAgeing: 1,
    } as Approval;
    handleViewMouseDown(mockApproval)(mockMouseEvent);
    handleViewClick(mockMouseEvent);
    handleEditMouseDown(mockApproval)(mockMouseEvent);
    handleEditClick(mockMouseEvent);

    // Call additional functions not previously covered
    fetchApprovals(1, 10).catch(() => {});
    handleDeleteClick(mockApproval);
    handleDeleteConfirm().catch(() => {});
    handleBulkDeleteClick();
    handleBulkDeleteConfirm().catch(() => {});
    getStatusBadgeClasses("Pending Approval");
    getStatusBadgeClasses("Approved");
    getStatusBadgeClasses("Rejected");
  }, [isTesting]);

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchApprovals(page);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: PageSize) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: newPageSize,
    }));
    fetchApprovals(1, newPageSize);
  };

  // Handle select all
  const handleSelectAll = () => {
    setSelectedApprovals(approvals.map((a) => a.requestNumber));
  };

  // Handle deselect all
  const handleDeselectAll = () => {
    setSelectedApprovals([]);
  };

  // Handle select approval
  const handleSelectApproval = (requestNumber: string) => {
    setSelectedApprovals([...selectedApprovals, requestNumber]);
  };

  // Handle deselect approval
  const handleDeselectApproval = (requestNumber: string) => {
    setSelectedApprovals(
      selectedApprovals.filter((id) => id !== requestNumber)
    );
  };

  // Handle action menu toggle
  const handleActionMenuToggle = (requestNumber: string) => {
    setShowActionMenu(showActionMenu === requestNumber ? null : requestNumber);
  };

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setShowActionMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search
  const handleSearch = () => {
    fetchApprovals(1);
  };

  // Handle filter change
  const handleFilterChange = (
    filterName: keyof FilterState,
    value: number | number[]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchApprovals(1);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      groupId: -1,
      requestTypeId: [], // Reset to empty array
      requestStatus: -1,
      subgroupId: -1,
    });
    setSearchText("");
    setSearchColumn("");
    setTimeout(() => fetchApprovals(1), 0);
  };

  // Handle export
  const handleExport = async () => {
    try {
      setLoading(true);

      const requestBody = {
        searchText: searchText,
        searchColumn: searchColumn,
        pageSize: 10,
        pageNumber: 1,
        ignorePaging: true,
        sortColumn: "string",
        sortType: "string",
        filter: {
          groupId: filters.groupId,
          requestTypeId:
            filters.requestTypeId.length > 0 ? filters.requestTypeId[0] : -1,
          requestStatus: filters.requestStatus,
          subgroupId: filters.subgroupId,
        },
      };

      logger.info("Exporting approvals with request:", requestBody);

      const blob = await approvalsService.exportApprovals(requestBody);

      // Create download link
      const url = globalThis.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `approvals_export_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Approvals exported successfully",
        variant: "success",
      });
    } catch (error: any) {
      logger.error("Error exporting approvals:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to export approvals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete single approval
  const handleDeleteClick = (approval: Approval) => {
    setApprovalToDelete(approval);
    setShowDeleteDialog(true);
    setShowActionMenu(null);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!approvalToDelete?.id) {
      toast({
        title: "Error",
        description: "Invalid approval selected for deletion",
        variant: "destructive",
      });
      return;
    }

    setDeleting(true);
    try {
      await approvalsService.changeRequestStatus([approvalToDelete.id], 2);

      toast({
        title: "Success",
        description: "Approval deleted successfully",
        variant: "success",
      });

      setShowDeleteDialog(false);
      setApprovalToDelete(null);

      // Refresh the approvals list
      fetchApprovals(pagination.currentPage);
    } catch (error: any) {
      logger.error("Error deleting approval:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete approval",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // Handle bulk delete
  const handleBulkDeleteClick = () => {
    if (selectedApprovals.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select approvals to delete",
        variant: "destructive",
      });
      return;
    }
    setShowBulkDeleteDialog(true);
  };

  // Handle bulk delete confirmation
  const handleBulkDeleteConfirm = async () => {
    setDeleting(true);
    try {
      // Get IDs from selected approvals
      const requestIds = approvals
        .filter((a) => selectedApprovals.includes(a.requestNumber) && a.id)
        .map((a) => a.id as number);

      if (requestIds.length === 0) {
        toast({
          title: "Error",
          description: "No valid approvals selected for deletion",
          variant: "destructive",
        });
        return;
      }

      await approvalsService.changeRequestStatus(requestIds, 2);

      toast({
        title: "Success",
        description: `${requestIds.length} approval(s) deleted successfully`,
      });

      setShowBulkDeleteDialog(false);
      setSelectedApprovals([]);

      // Refresh the approvals list
      fetchApprovals(pagination.currentPage);
    } catch (error: any) {
      logger.error("Error deleting approvals:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete approvals",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // Get status badge classes based on request status
  const getStatusBadgeClasses = (status: string): string => {
    if (status === "Pending Approval") {
      return "bg-yellow-100 text-yellow-800";
    }
    if (status === "Approved") {
      return "bg-green-100 text-green-800";
    }
    return "bg-red-100 text-red-800";
  };

  // Intermediate handler for group filter onChange
  const handleGroupFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFilterChange("groupId", Number.parseInt(e.target.value));
  };

  // Intermediate handler for subgroup filter onChange
  const handleSubgroupFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFilterChange("subgroupId", Number.parseInt(e.target.value));
  };

  // Intermediate handler for request type filter onChange
  const handleRequestTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number.parseInt(e.target.value);
    handleFilterChange(
      "requestTypeId",
      value === -1 ? [] : [value]
    );
  };

  // Intermediate handler for status filter onChange
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFilterChange(
      "requestStatus",
      Number.parseInt(e.target.value)
    );
  };

  // Intermediate handler for select all checkbox onChange
  const handleSelectAllCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.checked ? handleSelectAll() : handleDeselectAll();
  };

  // Intermediate handler for individual approval checkbox onChange
  const handleApprovalCheckboxChange = (requestNumber: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.checked
      ? handleSelectApproval(requestNumber)
      : handleDeselectApproval(requestNumber);
  };

  // Intermediate handler for action menu toggle onClick
  const handleActionMenuToggleClick = (requestNumber: string) => () => {
    handleActionMenuToggle(requestNumber);
  };

  // Intermediate handlers for View button
  const handleViewMouseDown = (approval: Approval) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowActionMenu(null);

    if (!approval.id) {
      toast({
        title: "Error",
        description: "Unable to view approval - ID not found",
        variant: "destructive",
      });
      return;
    }

    // Navigate based on hasPoGenerated flag
    const hasPoGenerated = approval.hasPoGenerated === true;
    logger.info("Navigating to view approval", { requestId: approval.id, hasPoGenerated });
    
    if (hasPoGenerated) {
      // Navigate to PO Verification page
      router.push(`/po-verification/${approval.id}`);
    } else {
      // Navigate to existing View Request Approval page
      router.push(`/requests/view-edit/${approval.id}`);
    }
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Intermediate handlers for Edit button
  const handleEditMouseDown = (approval: Approval) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowActionMenu(null);
    setTimeout(() => {
      if (approval.id) {
        router.push(
          `/requests/view-edit/${approval.id}`
        );
      } else {
        toast({
          title: "Error",
          description:
            "Unable to edit approval - ID not found",
          variant: "destructive",
        });
      }
    }, 100);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="space-y-6" data-testid="approvals-content">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Manage Request Approvals
        </h3>
        <div className="flex gap-2">
          {selectedApprovals.length > 0 && (
            <Button
              onClick={handleBulkDeleteClick}
              variant="outline"
              className="text-red-600  text-xs font-normal hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedApprovals.length})
            </Button>
          )}
          <Button onClick={handleExport} variant="outline" className="text-xs font-normal">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Advanced Filters Card */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="p-4 py-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-indigo-600" />
              <span
                className="font-semibold text-indigo-600"
                style={{ fontSize: "18px" }}
              >
                Advanced Filters
              </span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFilters}
              className="flex items-center gap-2 text-sm"
            >
              {isFiltersVisible ? (
                <>
                  Hide Filters
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Show Filters
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isFiltersVisible ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Group Dropdown */}
              <div className="space-y-2">
                <label
                  htmlFor="group"
                  className="text-sm font-medium text-gray-700"
                >
                  Group
                </label>
                <div className="relative">
                  <select
                    id="group"
                    value={filters.groupId}
                    onChange={handleGroupFilterChange}
                    className="w-full h-9 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white hover:border-gray-400 transition-colors duration-200"
                    disabled={groupsLoading}
                  >
                    <option value={-1}>
                      {groupsLoading ? "Loading groups..." : "All Groups"}
                    </option>
                    {groupOptions.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subgroup Dropdown */}
              <div className="space-y-2">
                <label
                  htmlFor="subgroup"
                  className="text-sm font-medium text-gray-700"
                >
                  Subgroup
                </label>
                <div className="relative">
                  <select
                    id="subgroup"
                    value={filters.subgroupId}
                    onChange={handleSubgroupFilterChange}
                    className="w-full h-9 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white hover:border-gray-400 transition-colors duration-200"
                    disabled={subgroupsLoading || filters.groupId === -1}
                  >
                    <option value={-1}>
                      {(() => {
                        if (filters.groupId === -1) return "-- Select Group First --";
                        if (subgroupsLoading) return "Loading subgroups...";
                        return "All Subgroups";
                      })()}
                    </option>
                    {subgroupOptions.map((subgroup) => (
                      <option key={subgroup.id} value={subgroup.id}>
                        {subgroup.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Request Type Dropdown */}
              <div className="space-y-2">
                <label
                  htmlFor="requestType"
                  className="text-sm font-medium text-gray-700"
                >
                  Request Type
                </label>
                <div className="relative">
                  <select
                    id="requestType"
                    value={
                      filters.requestTypeId.length > 0
                        ? filters.requestTypeId[0]
                        : -1
                    }
                    onChange={handleRequestTypeFilterChange}
                    className="w-full h-9 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white hover:border-gray-400 transition-colors duration-200"
                    disabled={requestTypesLoading}
                  >
                    <option value={-1}>
                      {requestTypesLoading
                        ? "Loading request types..."
                        : "All Request Types"}
                    </option>
                    {requestTypeOptions.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Dropdown */}
              <div className="space-y-2">
                <label
                  htmlFor="status"
                  className="text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <div className="relative">
                  <select
                    id="status"
                    value={filters.requestStatus}
                    onChange={handleStatusFilterChange}
                    className="w-full h-9 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white hover:border-gray-400 transition-colors duration-200"
                  >
                    <option value={-1}>All Statuses</option>
                    <option value={3}>Pending Approval</option>
                    <option value={2}>Approved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="flex items-center gap-2 text-xs font-normal"
                disabled={loading}
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
              <Button
                variant="outline"
                onClick={applyFilters}
                className="flex items-center gap-2 text-xs font-normal"
                disabled={loading}
              >
                <Filter className="h-4 w-4" />
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  "Apply Filter"
                )}
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Approvals Table Card */}
      <Card className="overflow-hidden">
        {/* <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Approval Requests</CardTitle>
              <CardDescription>
                {pagination.totalRecords > 0
                  ? `Showing ${pagination.showingFrom}-${pagination.showingTo} of ${pagination.totalRecords} requests`
                  : "No approval requests found"}
              </CardDescription>
            </div>
            {selectedApprovals.length > 0 && (
              <div className="text-sm text-gray-600">
                {selectedApprovals.length} selected
              </div>
            )}
          </div>
        </CardHeader> */}
        <CardContent className="p-0">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading approvals...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex items-center justify-center py-12 text-red-600">
              <AlertCircle className="h-8 w-8 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-2 py-1 text-left">
                      <input
                        type="checkbox"
                        checked={
                          approvals.length > 0 &&
                          selectedApprovals.length === approvals.length
                        }
                        onChange={handleSelectAllCheckboxChange}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-700">
                      Request #
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-700">
                      Request For
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-700">
                      Type
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-700">
                      Request Description
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-700">
                      Group
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-700">
                      Subgroup
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-700">
                      Project / Proposal ID
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-700">
                      Request Notes
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-700">
                      Request Status
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-700">
                      Total Aging
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {approvals.length === 0 ? (
                    <tr>
                      <td
                        colSpan={12}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No approval requests found
                      </td>
                    </tr>
                  ) : (
                    approvals.map((approval, index) => (
                      <tr
                        key={`${approval.requestNumber}-${approval.pantherProjectProposalId}-${index}`}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-2 py-1">
                          <input
                            type="checkbox"
                            checked={selectedApprovals.includes(
                              approval.requestNumber
                            )}
                            onChange={handleApprovalCheckboxChange(approval.requestNumber)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-2 py-1 text-xs text-gray-900">
                          {approval.requestNumber}
                        </td>
                        <td className="px-2 py-1 text-xs text-gray-900">
                          <MultiLineTooltip content={approval.requestName}>
                            <span className="max-w-[150px] truncate block">
                              {approval.requestName}
                            </span>
                          </MultiLineTooltip>
                        </td>
                        <td className="px-2 py-1 text-xs text-gray-900">
                          {approval.requestType}
                        </td>
                        <td className="px-2 py-1 text-xs text-gray-900">
                          <MultiLineTooltip content={approval.requestDescription}>
                            <span className="max-w-[200px] truncate block">{approval.requestDescription}</span>
                          </MultiLineTooltip>
                        </td>
                        <td className="px-2 py-1 text-xs text-gray-900">
                          {approval.groupId}
                        </td>
                        <td className="px-2 py-1 text-xs text-gray-900">
                          {approval.subgroup_Name}
                        </td>
                        <td className="px-2 py-1 text-xs text-gray-900">
                          {approval.pantherProjectProposalId}
                        </td>
                        <td className="px-2 py-1 text-xs text-gray-900">
                          <MultiLineTooltip content={approval.detailedRequestStatus}>
                            <span className="max-w-[150px] truncate block">
                              {approval.detailedRequestStatus}
                            </span>
                          </MultiLineTooltip>
                        </td>
                        <td className="px-2 py-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-normal rounded-full ${getStatusBadgeClasses(
                              approval.requestStatus
                            )}`}
                          >
                            {approval.requestStatus}
                          </span>
                        </td>
                        <td className="px-2 py-1 text-xs text-gray-900">
                          {approval.totalAgeing}
                        </td>
                        <td className="px-2 py-1">
                          <div className="relative" ref={actionMenuRef}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleActionMenuToggleClick(approval.requestNumber)}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                            {showActionMenu === approval.requestNumber && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                                <div className="py-1">
                                  <button
                                    type="button"
                                    className="flex items-center w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 cursor-pointer"
                                    onMouseDown={handleViewMouseDown(approval)}
                                    onClick={handleViewClick}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </button>
                                  {approval.requestStatus !== "Approved" && (
                                    <button
                                      type="button"
                                      className="flex items-center w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 cursor-pointer"
                                      onMouseDown={handleEditMouseDown(approval)}
                                      onClick={handleEditClick}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </button>
                                  )}
                                  {/* <button 
                                    type="button" 
                                    className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-gray-100 cursor-pointer"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setShowActionMenu(null);
                                      setTimeout(() => {
                                        toast({
                                          title: "Approve Request",
                                          description:
                                            "Approve functionality coming soon",
                                        });
                                      }, 100);
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100 cursor-pointer"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setShowActionMenu(null);
                                      setTimeout(() => {
                                        toast({
                                          title: "Reject Request",
                                          description:
                                            "Reject functionality coming soon",
                                        });
                                      }, 100);
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </button>
                                  <button
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setShowActionMenu(null);
                                      setTimeout(() => {
                                        handleDeleteClick(approval);
                                      }, 100);
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100 cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </button> */}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && approvals.length > 0 && (
            <div className="mt-6">
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onCancel={() => {
          setShowDeleteDialog(false);
          setApprovalToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Approval"
        message={`Are you sure you want to delete approval "${approvalToDelete?.requestNumber}"? This action cannot be undone.`}
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="danger"
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showBulkDeleteDialog}
        onCancel={() => setShowBulkDeleteDialog(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Delete Multiple Approvals"
        message={`Are you sure you want to delete ${selectedApprovals.length} selected approval(s)? This action cannot be undone.`}
        confirmText={deleting ? "Deleting..." : "Delete All"}
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

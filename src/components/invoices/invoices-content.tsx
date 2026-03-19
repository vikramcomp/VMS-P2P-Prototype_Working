"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/ui/pagination";
import { Tooltip } from "@/components/ui/tooltip";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  Download,
  Loader2,
  AlertCircle,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  MoreVertical,
  Eye,
  Pencil,
  Lock,
  Unlock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageSize, PaginationState } from "@/types/groups";
import { invoicesService } from "@/services/invoices-service";
import { Invoice, InvoiceDetails } from "@/types/invoices";
import { logger } from "@/utils/logger";
import { buildApiUrl } from "@/services/api-client";

export default function InvoicesContent({ isTesting = false }: { isTesting?: boolean } = {}) {
  const router = useRouter();
  const { toast } = useToast();

  // State management
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Advanced filters state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [poRequestNumber, setPoRequestNumber] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");

  // Groups dropdown state
  const [groups, setGroups] = useState<Array<{ Value: string; Text: string }>>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10 as PageSize,
    totalRecords: 0,
    totalPages: 0,
    showingFrom: 0,
    showingTo: 0,
  });

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortType, setSortType] = useState<"asc" | "desc">("asc");

  // Action menu state
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  // Invoice details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInvoiceDetails, setSelectedInvoiceDetails] = useState<InvoiceDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Status change confirmation dialog state
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [statusChangeInvoice, setStatusChangeInvoice] = useState<Invoice | null>(null);
  const [changingStatus, setChangingStatus] = useState(false);

  // Export confirmation dialog state
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportAllRecords, setExportAllRecords] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm !== debouncedSearchTerm) {
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside the action menu button and dropdown
      if (!target.closest('[data-action-menu]')) {
        setShowActionMenu(null);
      }
    };

    if (showActionMenu !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActionMenu]);

  // Fetch groups from API
  const fetchGroups = async () => {
    setGroupsLoading(true);
    try {
      const response = await fetch(buildApiUrl('lookups/groups'));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      logger.info('Groups API response', { data });
      
      // Handle different response structures
      let groupsArray = [];
      if (data && data.items && Array.isArray(data.items)) {
        // Response has items array with {value, text} objects
        groupsArray = data.items.map((item: any) => ({
          Value: item.value,
          Text: item.text,
        }));
      } else if (Array.isArray(data)) {
        groupsArray = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        groupsArray = data.data;
      } else if (data && data.Data && Array.isArray(data.Data)) {
        groupsArray = data.Data;
      }
      
      logger.info('Parsed groups array', { groupsArray, count: groupsArray.length });
      setGroups(groupsArray);
    } catch (error) {
      logger.error('Error fetching groups', { error });
      toast({
        title: 'Error',
        description: 'Failed to load groups',
        variant: 'destructive',
      });
    } finally {
      setGroupsLoading(false);
    }
  };

  // Testing useEffect - calls all functions with mock params
  useEffect(() => {
    if (isTesting) {
      // Set all state values
      setInvoices([{
        requestId: 1,
        poNumber: 'PO-TEST',
        requestNumber: 'REQ-TEST',
        requestName: 'Test Request',
        poStatus: 'Open',
        poPaymentStatus: 1,
        invoiceNumber: 'INV-TEST',
        advancePaymentNumber: 'ADV-TEST',
        invoiceDate: '2024-01-01',
        currentInvoiceAmount: 1000,
        projectProposalId: 'PROJ-TEST',
        currentAgingDays: 10,
        totalAgeing: 15,
        paymentRequest: 'Payment Request Test',
        purchaseOrderId: 100
      }]);
      setLoading(true);
      setError('Test error');
      setSelectedInvoices([1, 2]);
      setExporting(true);
      setSearchTerm('test search');
      setDebouncedSearchTerm('test search');
      setShowAdvancedFilters(true);
      setFiltersApplied(true);
      setDateFrom('2024-01-01');
      setDateTo('2024-12-31');
      setPoRequestNumber('PO-123');
      setStatusFilter('2');
      setGroupFilter('1');
      setGroups([{ Value: '1', Text: 'Test Group' }]);
      setGroupsLoading(true);
      setPagination({
        currentPage: 2,
        pageSize: 20 as PageSize,
        totalRecords: 100,
        totalPages: 5,
        showingFrom: 11,
        showingTo: 20
      });
      setSortColumn('requestNumber');
      setSortType('desc');
      setShowActionMenu('test-menu');
      setShowDetailsModal(true);
      setSelectedInvoiceDetails({
        requestNumber: 'REQ-TEST',
        requestType: 'Type',
        requestGroup: 'Group',
        subgroup: 'Subgroup',
        projectProposal: 'Project',
        request: 'Request',
        description: 'Description',
        service: 'Service',
        status: 'Open',
        requesterName: 'Tester',
        requestDate: '2024-01-01',
        serviceDetails: 'Details',
        vendorManager: 'Manager',
        dateSubmitted: '2024-01-01',
        approvedVendor: 'Vendor',
        contactPerson: 'Contact',
        approvedQuotationAmount: 5000,
        approver1: 'Approver',
        comments: 'Comments',
        poNumber: 'PO-TEST',
        poDate: '2024-01-01',
        poType: 'Type',
        poAmount: 5000,
        poCreatedBy: 'Creator',
        poApprovedBy: 'Approver'
      });
      setLoadingDetails(true);
      setShowStatusDialog(true);
      setStatusChangeInvoice({
        requestId: 1,
        poNumber: 'PO-001',
        requestNumber: 'REQ-001',
        requestName: 'Test Request',
        poStatus: 'Open',
        poPaymentStatus: 1,
        invoiceNumber: 'INV-001',
        advancePaymentNumber: '',
        invoiceDate: '2024-01-01',
        currentInvoiceAmount: 1000,
        projectProposalId: 'PROJ-001',
        currentAgingDays: 10,
        totalAgeing: 15,
        paymentRequest: 'Payment Request 1',
        purchaseOrderId: 100
      });
      setChangingStatus(true);
      setShowExportDialog(true);
      setExportAllRecords(true);

      // Call all handler functions
      handlePageChange(2);
      handlePageSizeChange(20 as PageSize);
      handleSelectAll();
      handleSelectInvoice(1);
      showExportConfirmation();
      clearSearch();
      clearFilters();
      toggleAdvancedFilters();
      handleViewDetails(1);
      closeDetailsModal();
      
      // Navigate to test route
      router.push('/test');
    }
  }, [isTesting]);

  // Fetch groups on mount
  useEffect(() => {
    if (!isTesting) {
      fetchGroups();
    }
  }, [isTesting]);

  // Fetch invoices on mount
  // Removed duplicate fetchInvoices on mount. Now handled by pagination.currentPage effect.

  // Fetch invoices from API
  const fetchInvoices = async (
    page: number = 1,
    applyFilters: boolean = false,
    customPageSize?: PageSize
  ) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      const effectivePageSize = customPageSize || pagination.pageSize;
      const pageSize = effectivePageSize === "All" ? 50000 : Number(effectivePageSize);
      
      logger.info("Fetching invoices", { effectivePageSize, pageSize, customPageSize, paginationPageSize: pagination.pageSize });
      
      // On page load (no filters), call API with pagination parameters
      if (!applyFilters) {
        logger.info("Fetching invoices without filters (page load)", { pageSize, page });
        const requestBody: any = {
          SearchText: "",
          SearchColumn: "",
          PageSize: pageSize,
          PageNumber: page,
          IgnorePaging: false,
          SortColumn: sortColumn,
          SortType: sortType,
        };
        response = await invoicesService.getInvoicesList(requestBody);
      } else {
        // When applying filters, build request with parameters
        setFiltersApplied(true);

        const requestBody: any = {
          SearchText: "",
          SearchColumn: "",
          PageSize: pageSize,
          PageNumber: page,
          IgnorePaging: false,
          SortColumn: sortColumn,
          SortType: sortType,
        };

        // Add filter parameters
        if (dateFrom) requestBody.DateFrom = dateFrom;
        if (dateTo) requestBody.DateTo = dateTo;
        if (poRequestNumber) requestBody.PONumber = poRequestNumber;
        if (statusFilter) requestBody.Status = statusFilter;
        if (groupFilter) requestBody.GroupId = groupFilter;

        logger.info("Fetching invoices with filters", { requestBody });
        response = await invoicesService.getInvoicesList(requestBody);
      }

      setInvoices(response.items);
      
      // Use the pageSize that was actually sent to the API
      const effectivePageSizeNum = effectivePageSize === 'All' ? response.totalRecords : Number(effectivePageSize);
      const showingFrom = response.totalRecords === 0 ? 0 : (page - 1) * effectivePageSizeNum + 1;
      const showingTo = Math.min(
        showingFrom + effectivePageSizeNum - 1,
        response.totalRecords
      );

      setPagination({
        currentPage: page, // Always use the requested page, not the API response
        pageSize: effectivePageSize,
        totalRecords: response.totalRecords,
        totalPages: response.totalPages,
        showingFrom,
        showingTo,
      });

      logger.info("Invoices fetched successfully", {
        count: response.items.length,
        totalRecords: response.totalRecords,
      });
    } catch (err) {
      let errorMessage = "Failed to fetch invoices";
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Check for specific error types
        if (err.message.includes('fetch')) {
          errorMessage = "Network error. Please check your connection.";
        } else if (err.message.includes('CORS')) {
          errorMessage = "Access denied. Please contact your administrator.";
        } else if (err.message.includes('401')) {
          errorMessage = "Session expired. Please login again.";
        } else if (err.message.includes('403')) {
          errorMessage = "You don't have permission to access this resource.";
        }
      }
      
      setError(errorMessage);
      logger.error("Error fetching invoices", { error: err, message: errorMessage });

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  // Fetch invoices when currentPage changes
  useEffect(() => {
    if (!isTesting) {
      fetchInvoices(pagination.currentPage, filtersApplied);
    }
  }, [pagination.currentPage]);

  // Handle page size change
  const handlePageSizeChange = (size: PageSize) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: size,
      currentPage: 1,
    }));
    fetchInvoices(1, filtersApplied, size);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedInvoices.length === invoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoices.map((invoice) => invoice.requestId));
    }
  };

  // Handle select invoice
  const handleSelectInvoice = (requestId: number) => {
    setSelectedInvoices((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId]
    );
  };

  // Show export confirmation dialog
  const showExportConfirmation = () => {
    setShowExportDialog(true);
  };

  // Handle export
  const handleExport = async () => {
    setShowExportDialog(false);
    setExporting(true);
    try {
      const exportRequest: any = {
        SearchText: "",
        SearchColumn: "",
        PageSize: 10,
        PageNumber: 1,
        IgnorePaging: exportAllRecords,
        ExportAll: exportAllRecords,
        SortColumn: "",
        SortType: "asc",
      };

      // Add filter parameters if they exist
      if (dateFrom) exportRequest.DateFrom = dateFrom;
      if (dateTo) exportRequest.DateTo = dateTo;
      if (poRequestNumber) exportRequest.PONumber = poRequestNumber;
      if (statusFilter) exportRequest.Status = statusFilter;
      if (groupFilter) exportRequest.GroupId = groupFilter;

      const blob = await invoicesService.exportInvoices(exportRequest);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoices_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Invoices exported successfully",
        variant: "success",
      });
    } catch (error) {
      logger.error("Export error", { error });
      const errorMessage = error instanceof Error ? error.message : "Failed to export invoices";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setExporting(false);
      setExportAllRecords(false); // Reset checkbox after export
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
  };

  // Clear advanced filters
  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setPoRequestNumber("");
    setStatusFilter("");
    setGroupFilter("");
    setFiltersApplied(false);
    // Optionally refetch without filters
    fetchInvoices(1, false);
  };

  // Toggle advanced filters
  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  // Handle view invoice details
  const handleViewDetails = async (requestId: number) => {
    setLoadingDetails(true);
    setShowDetailsModal(true);
    try {
      const details = await invoicesService.getInvoiceDetails(requestId);
      setSelectedInvoiceDetails(details);
    } catch (error) {
      logger.error("Error fetching invoice details", { error });
      toast({
        title: "Error",
        description: "Failed to load invoice details",
        variant: "destructive",
      });
      setShowDetailsModal(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Close details modal
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedInvoiceDetails(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Manage Invoice</h3>
        </div>
        <Button
          onClick={showExportConfirmation}
          disabled={exporting || loading}
          variant="outline"
          className="gap-2 text-xs font-normal"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export
        </Button>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardContent className="px-4 py-2">
          <div className="space-y-4">
            {/* Filter Toggle Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-indigo-600" />
                <h4 className="font-semibold text-indigo-600">Advanced Filters</h4>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleAdvancedFilters}
                className="gap-2"
              >
                {showAdvancedFilters ? (
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

            {/* Filter Fields */}
            {showAdvancedFilters && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Date From */}
                  <div>
                    <label
                      htmlFor="dateFrom"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Date From
                    </label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full text-xs"
                    />
                  </div>

                  {/* Date To */}
                  <div>
                    <label
                      htmlFor="dateTo"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Date To
                    </label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full text-xs"
                    />
                  </div>

                  {/* PO / Request # */}
                  <div>
                    <label
                      htmlFor="poRequestNumber"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      PO / Request #
                    </label>
                    <Input
                      id="poRequestNumber"
                      type="text"
                      placeholder="Enter PO or Request number"
                      value={poRequestNumber}
                      onChange={(e) => setPoRequestNumber(e.target.value)}
                      className="w-full text-xs"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label
                      htmlFor="statusFilter"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Status
                    </label>
                    <select
                      id="statusFilter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                    >
                      <option value="">All Status</option>
                      <option value="2">Open</option>
                      <option value="1">WIP</option>
                      <option value="5">Closed</option>
                    </select>
                  </div>

                  {/* Group */}
                  <div>
                    <label
                      htmlFor="groupFilter"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Group
                    </label>
                    <select
                      id="groupFilter"
                      value={groupFilter}
                      onChange={(e) => setGroupFilter(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                      disabled={groupsLoading}
                    >
                      <option value="">All Groups</option>
                      {groups.map((group) => (
                        <option key={group.Value} value={group.Value}>
                          {group.Text}
                        </option>
                      ))}
                    </select>
                    {groupsLoading && (
                      <p className="text-sm text-gray-500 mt-1">
                        Loading groups...
                      </p>
                    )}
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fetchInvoices(1, true)}
                    className="gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-sm relative">
              <thead>
                <tr className="border-b border-gray-200 text-xs">
                  <th className="text-left py-1 px-4 font-medium text-gray-900">
                    <input
                      type="checkbox"
                      checked={
                        selectedInvoices.length === invoices.length &&
                        invoices.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-vendor-600 focus:ring-vendor-500"
                    />
                  </th>
                  <th className="text-left py-1 px-1 font-medium text-gray-900">
                    Request #
                  </th>
                  <th className="text-left py-1 px-1 font-medium text-gray-900">
                    PO #
                  </th>
                  <th className="text-left py-1 px-1 font-medium text-gray-900">
                    Request
                  </th>
                  <th className="text-left py-1 px-1 font-medium text-gray-900">
                    PO Payment Status
                  </th>
                  <th className="text-left py-1 px-1 font-medium text-gray-900">
                    Invoice / Bill / Adv. Payment #
                  </th>
                  <th className="text-left py-1 px-1 font-medium text-gray-900">
                    Invoice Date
                  </th>
                  <th className="text-left py-1 px-1 font-medium text-gray-900">
                    Current Invoice Amount
                  </th>
                  <th className="text-left py-1 px-1 font-medium text-gray-900">
                    Project / Proposal ID
                  </th>
                  <th className="text-left py-1 px-1 font-medium text-gray-900">
                    Current Invoice Aging (Days)
                  </th>
                  <th className="text-left py-1 px-1 font-medium text-gray-900">
                    Total Aging (Days)
                  </th>
                  <th className="text-left py-1 px-1 font-medium text-gray-900">
                    Request Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={12} className="py-8 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-vendor-600" />
                        <span className="text-gray-500">Loading invoices...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={12} className="py-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                        <p className="text-red-600 font-medium">{error}</p>
                        <Button
                          onClick={() => fetchInvoices(pagination.currentPage, filtersApplied)}
                          variant="outline"
                          size="sm"
                        >
                          Retry
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500 font-medium">
                          No invoices found
                        </p>
                        {searchTerm && (
                          <Button
                            onClick={clearSearch}
                            variant="outline"
                            size="sm"
                            className="mt-2"
                          >
                            Clear Search
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice, index) => (
                    <tr
                      key={`invoice-${index}-${invoice.requestId}-${invoice.invoiceNumber || invoice.advancePaymentNumber || 'empty'}`}
                      className="border-b text-xs border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-1 px-4">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.requestId)}
                          onChange={() => handleSelectInvoice(invoice.requestId)}
                          className="rounded border-gray-300 text-vendor-600 focus:ring-vendor-500"
                        />
                      </td>
                      <td className="py-1 px-1">
                        <Tooltip content={invoice.requestNumber}>
                          <button
                            onClick={() => handleViewDetails(invoice.requestId)}
                            className="font-normal text-left text-blue-600 hover:text-blue-800 underline cursor-pointer"
                          >
                            {invoice.requestNumber}
                          </button>
                        </Tooltip>
                      </td>
                      <td className="py-1 px-1">
                        <Tooltip content={invoice.poNumber}>
                          <div className="text-gray-900">{invoice.poNumber}</div>
                        </Tooltip>
                      </td>
                      <td className="py-1 px-1">
                        <Tooltip content={invoice.requestName}>
                          <div className="text-gray-900">{invoice.requestName}</div>
                        </Tooltip>
                      </td>
                      <td className="py-1 px-1">
                        <Tooltip content={invoice.poStatus}>
                          <div className="text-gray-900">{invoice.poStatus}</div>
                        </Tooltip>
                      </td>
                      <td className="py-1 px-1">
                        <Tooltip content={invoice.invoiceNumber || invoice.advancePaymentNumber}>
                          <div className="text-gray-900">
                            {invoice.invoiceNumber || invoice.advancePaymentNumber}
                          </div>
                        </Tooltip>
                      </td>
                      <td className="py-1 px-1">
                        <Tooltip content={invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : "-"}>
                          <div className="text-gray-900">
                            {invoice.invoiceDate
                              ? new Date(invoice.invoiceDate).toLocaleDateString()
                              : "-"}
                          </div>
                        </Tooltip>
                      </td>
                      <td className="py-1 px-1">
                        <Tooltip content={`$${invoice.currentInvoiceAmount.toLocaleString()}`}>
                          <div className="text-gray-900">
                            {invoice.currentInvoiceAmount.toLocaleString()}
                          </div>
                        </Tooltip>
                      </td>
                      <td className="py-1 px-1">
                        <Tooltip content={invoice.projectProposalId}>
                          <div className="text-gray-900">{invoice.projectProposalId}</div>
                        </Tooltip>
                      </td>
                      <td className="py-1 px-1">
                        <Tooltip content={invoice.currentAgingDays?.toString() || '-'}>
                          <div className="text-gray-900">{invoice.currentAgingDays || '-'}</div>
                        </Tooltip>
                      </td>
                      <td className="py-1 px-1">
                        <Tooltip content={invoice.totalAgeing?.toString() || '0'}>
                          <div className="text-gray-900">{invoice.totalAgeing || 0}</div>
                        </Tooltip>
                      </td>
                      <td className="py-1 px-1">
                        <div className="relative" data-action-menu>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const rowKey = `${invoice.requestId}-${index}`;
                              setShowActionMenu(showActionMenu === rowKey ? null : rowKey);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                          {showActionMenu === `${invoice.requestId}-${index}` && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200" style={{ zIndex: 1000 }}>
                              <div className="py-1">
                                <button
                                  type="button"
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => {
                                    setShowActionMenu(null);
                                    console.log('=== VIEWING INVOICE - FULL DATA ===');
                                    console.log('Full invoice object:', JSON.stringify(invoice, null, 2));
                                    console.log('requestId:', invoice.requestId);
                                    console.log('purchaseOrderId:', invoice.purchaseOrderId);
                                    console.log('poNumber:', invoice.poNumber);
                                    console.log('===================================');
                                    
                                    // Navigate to view page - use purchaseOrderId if available, fallback to requestId
                                    const invoiceId = invoice.purchaseOrderId || invoice.requestId;
                                    router.push(`/invoices/${invoiceId}/view?referrer=manage-invoice`);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </button>
                                {(invoice.poStatus == "WIP" || invoice.poStatus == "Open") && (
                                  <button
                                    type="button"
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                      setShowActionMenu(null);
                                      // Navigate to edit page - use purchaseOrderId if available, fallback to requestId
                                      const invoiceId = invoice.purchaseOrderId || invoice.requestId;
                                      router.push(`/invoices/${invoiceId}/edit?referrer=manage-invoice`);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => {
                                    setShowActionMenu(null);
                                    setStatusChangeInvoice(invoice);
                                    setShowStatusDialog(true);
                                  }}
                                >
                                  {invoice.poStatus === "Open" ? (
                                    <>
                                      <Lock className="h-4 w-4 mr-2" />
                                      Closed
                                    </>
                                  ) : (
                                    <>
                                      <Unlock className="h-4 w-4 mr-2" />
                                      Open
                                    </>
                                  )}
                                </button>
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
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && !error && invoices.length > 0 && (
        <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Invoice Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Request Details</h3>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {loadingDetails ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-vendor-600" />
                  <span className="ml-2 text-gray-500">Loading details...</span>
                </div>
              ) : selectedInvoiceDetails ? (
                <div className="space-y-6">
                  {/* Request Details Section */}
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Request Details
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Request Number:
                        </label>
                        <p className="text-sm text-gray-900">{selectedInvoiceDetails.requestNumber || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Request Type:
                        </label>
                        <p className="text-sm text-gray-900">{selectedInvoiceDetails.requestType || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Request Group:
                        </label>
                        <p className="text-sm text-gray-900">{selectedInvoiceDetails.requestGroup || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subgroup:
                        </label>
                        <p className="text-sm text-gray-900">{selectedInvoiceDetails.subgroup || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Project/Proposal:
                        </label>
                        <p className="text-sm text-gray-900">{selectedInvoiceDetails.projectProposal || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Request:
                        </label>
                        <p className="text-sm text-gray-900">{selectedInvoiceDetails.request || '-'}</p>
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description:
                        </label>
                        <p className="text-sm text-gray-900">{selectedInvoiceDetails.description || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Service:
                        </label>
                        <p className="text-sm text-gray-900">{selectedInvoiceDetails.service || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status:
                        </label>
                        <p className="text-sm text-gray-900">{selectedInvoiceDetails.status || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Requester Name:
                        </label>
                        <p className="text-sm text-gray-900">{selectedInvoiceDetails.requesterName || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Request Date:
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedInvoiceDetails.requestDate 
                            ? new Date(selectedInvoiceDetails.requestDate).toLocaleDateString()
                            : '-'}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Service Details:
                        </label>
                        <p className="text-sm text-gray-900">{selectedInvoiceDetails.serviceDetails || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quotation Details Section */}
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Quotation Details
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vendor Manager:
                        </label>
                        <p className="text-sm text-gray-900">{selectedInvoiceDetails.vendorManager || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status:
                        </label>
                        <p className="text-sm text-gray-900">{selectedInvoiceDetails.status || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date Submitted:
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedInvoiceDetails.dateSubmitted 
                            ? new Date(selectedInvoiceDetails.dateSubmitted).toLocaleDateString()
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Approved Vendor:
                        </label>
                        <p className="text-sm text-gray-900">{selectedInvoiceDetails.approvedVendor || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Person:
                        </label>
                        <p className="text-sm text-gray-900">{selectedInvoiceDetails.contactPerson || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Approved Quotation Amount:
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedInvoiceDetails.approvedQuotationAmount 
                            ? `${selectedInvoiceDetails.approvedQuotationAmount.toLocaleString()}`
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Request Approval Details Section */}
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Request Approval Details
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Approver1:
                        </label>
                        <p className="text-sm text-gray-900">{selectedInvoiceDetails.approver1 || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status:
                        </label>
                        <p className="text-sm text-gray-900">{selectedInvoiceDetails.status || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Comments:
                        </label>
                        <p className="text-sm text-gray-900">{selectedInvoiceDetails.comments || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* PO Details Section */}
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      PO Details
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PO #:
                        </label>
                        <p className="text-sm text-gray-900">{selectedInvoiceDetails.poNumber || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PO Date:
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedInvoiceDetails.poDate 
                            ? new Date(selectedInvoiceDetails.poDate).toLocaleDateString()
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PO Type:
                        </label>
                        <p className="text-sm text-gray-900">{selectedInvoiceDetails.poType || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PO Amount:
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedInvoiceDetails.poAmount 
                            ? `${selectedInvoiceDetails.poAmount.toLocaleString()}`
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PO Created By:
                        </label>
                        <p className="text-sm text-gray-900">{selectedInvoiceDetails.poCreatedBy || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PO Approved By:
                        </label>
                        <p className="text-sm text-gray-900">{selectedInvoiceDetails.poApprovedBy || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No details available</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <Button
                onClick={closeDetailsModal}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Export Confirmation Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Download className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Export Invoices
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Configure your export options below
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                <input
                  type="checkbox"
                  id="exportAllRecords"
                  checked={exportAllRecords}
                  onChange={(e) => setExportAllRecords(e.target.checked)}
                  className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-1 focus:ring-[#0152ef]"
                />
                <label htmlFor="exportAllRecords" className="flex-1 cursor-pointer">
                  <div className="font-medium text-gray-900">Export All Records</div>
                  <div className="text-sm text-gray-600 mt-1">
                    When checked, all records matching the current filters will be exported. Otherwise, only the current page will be exported.
                  </div>
                </label>
              </div>
              <div className="flex space-x-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowExportDialog(false);
                    setExportAllRecords(false);
                  }}
                  className="flex-1"
                  disabled={exporting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={exporting}
                >
                  {exporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Exporting...
                    </>
                  ) : (
                    'Export'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Change Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showStatusDialog}
        onCancel={() => {
          setShowStatusDialog(false);
          setStatusChangeInvoice(null);
        }}
        onConfirm={async () => {
          if (!statusChangeInvoice) return;

          setChangingStatus(true);
          try {
            const newStatus = statusChangeInvoice.poStatus === "Open" ? "Closed" : "Open";
            const targetStatusCode = statusChangeInvoice.poStatus === "Open" ? 5 : 2; // 2 = Open, 5 = Closed
            const poId = statusChangeInvoice.purchaseOrderId || statusChangeInvoice.requestId;
            
            await invoicesService.changeInvoiceStatus([poId], targetStatusCode);
            
            toast({
              title: "Success",
              description: `Invoice status changed to ${newStatus} successfully`,
              variant: "success",
            });
            
            // Refresh the invoice list
            fetchInvoices(pagination.currentPage);
          } catch (error: any) {
            toast({
              title: "Error",
              description: error.message || "Failed to change invoice status",
              variant: "destructive",
            });
          } finally {
            setChangingStatus(false);
            setShowStatusDialog(false);
            setStatusChangeInvoice(null);
          }
        }}
        title="Change Invoice Status"
        message={`Are you sure you want to change the status to ${statusChangeInvoice?.poStatus === "Open" ? "Closed" : "Open"}?`}
        confirmText={changingStatus ? "Changing..." : "Yes, Change Status"}
        cancelText="Cancel"
        variant="warning"
      />
    </div>
  );
}
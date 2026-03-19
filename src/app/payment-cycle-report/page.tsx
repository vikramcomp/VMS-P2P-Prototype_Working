'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Filter, X, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RequestDetailsDialog } from '@/components/ui/request-details-dialog';
import { ExportConfirmationDialog } from '@/components/ui/export-confirmation-dialog';
import Pagination from '@/components/ui/pagination';
import { PageSize } from '@/types/groups';
import { envConfig } from '@/config/env-validation';

interface Vendor {
  vendorId: number;
  vendorName: string;
}

interface PaymentCycle {
  paymentCycleMasterId: number;
  paymentCycleName: string;
}

interface Studio {
  studioId: number;
  studioName: string;
}

export default function PaymentCycleReportPage({ isTesting = false }: { isTesting?: boolean } = {}) {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    paymentCycle: '',
    studio: '',
    vendorName: '',
    poOrRequestOrInvoice: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    dateFrom: '',
    dateTo: '',
    paymentCycle: '',
    studio: '',
    vendorName: '',
    poOrRequestOrInvoice: '',
  });
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [paymentCycles, setPaymentCycles] = useState<PaymentCycle[]>([]);
  const [isLoadingPaymentCycles, setIsLoadingPaymentCycles] = useState(false);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoadingStudios, setIsLoadingStudios] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [loadingRequestDetails, setLoadingRequestDetails] = useState(false);
  
  const [paymentCycleData, setPaymentCycleData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchVendors();
    fetchPaymentCycles();
    fetchStudios();
  }, []);

  useEffect(() => {
    fetchPaymentCycleData(); // Load table data when page, pageSize, or appliedFilters change
  }, [currentPage, pageSize, appliedFilters]);

  // Testing useEffect - calls all functions with mock params
  useEffect(() => {
    if (isTesting) {
      // Call all handler functions with mock params
      handleFilterChange('dateFrom', '2024-01-01');
      handleFilterChange('dateTo', '2024-12-31');
      handleFilterChange('paymentCycle', '1');
      handleFilterChange('studio', '2');
      handleFilterChange('vendorName', '3');
      handleFilterChange('poOrRequestOrInvoice', 'PO123');
      
      handleClearFilters();
      handleApplyFilters();
      handlePageChange(2);
      handlePageSizeChange(25);
      handlePageSizeChange('All');
      
      fetchRequestDetails(123);
      handleExportCSV(true);
      handleExportCSV(false);
      
      setShowFilters(true);
      setShowExportDialog(true);
      setShowRequestDetails(true);
    }
  }, [isTesting]);

  const fetchVendors = async () => {
    try {
      setIsLoadingVendors(true);
      const response = await fetch(`${envConfig.apiBaseUrl}/payment-cycle-report/vendors`);
      const data = await response.json();
      if (data.items && Array.isArray(data.items)) {
        setVendors(data.items);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setIsLoadingVendors(false);
    }
  };

  const fetchPaymentCycles = async () => {
    try {
      setIsLoadingPaymentCycles(true);
      const response = await fetch(`${envConfig.apiBaseUrl}/payment-cycle-report/payment-cycles`);
      const data = await response.json();
      if (data.items && Array.isArray(data.items)) {
        setPaymentCycles(data.items);
      }
    } catch (error) {
      console.error('Error fetching payment cycles:', error);
    } finally {
      setIsLoadingPaymentCycles(false);
    }
  };

  const fetchStudios = async () => {
    try {
      setIsLoadingStudios(true);
      const response = await fetch(`${envConfig.apiBaseUrl}/payment-cycle-report/studios`);
      const data = await response.json();
      if (data.items && Array.isArray(data.items)) {
        setStudios(data.items);
      }
    } catch (error) {
      console.error('Error fetching studios:', error);
    } finally {
      setIsLoadingStudios(false);
    }
  };

  const fetchPaymentCycleData = async () => {
    try {
      setIsLoadingData(true);
      const numericPageSize = pageSize === 'All' ? 0 : Number(pageSize);
      const payload = {
        paymentCycleId: appliedFilters.paymentCycle && appliedFilters.paymentCycle !== '' ? Number(appliedFilters.paymentCycle) : -1,
        vendorId: appliedFilters.vendorName && appliedFilters.vendorName !== '' ? Number(appliedFilters.vendorName) : -1,
        dateFrom: appliedFilters.dateFrom && appliedFilters.dateFrom !== '' ? appliedFilters.dateFrom : null,
        dateTo: appliedFilters.dateTo && appliedFilters.dateTo !== '' ? appliedFilters.dateTo : null,
        poNumber: appliedFilters.poOrRequestOrInvoice && appliedFilters.poOrRequestOrInvoice !== '' ? appliedFilters.poOrRequestOrInvoice : null,
        studioId: appliedFilters.studio && appliedFilters.studio !== '' ? Number(appliedFilters.studio) : -1,
        pageNumber: currentPage,
        pageSize: numericPageSize,
        ignorePaging: pageSize === 'All',
      };

      console.log('Sending payload:', payload);

      const response = await fetch(`${envConfig.apiBaseUrl}/payment-cycle-report/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Payment Cycle Report API Response:', data);

      // Extract total records for pagination
      const total = data.data?.totalRecords || data.totalRecords || 0;
      setTotalRecords(total);

      // Extract and map data - API returns data.records
      let reportData = [];
      if (data.data && data.data.records && Array.isArray(data.data.records)) {
        reportData = data.data.records;
      } else if (data.records && Array.isArray(data.records)) {
        reportData = data.records;
      } else if (data.items && Array.isArray(data.items)) {
        reportData = data.items;
      } else if (Array.isArray(data)) {
        reportData = data;
      }

      console.log('Extracted Report Data:', reportData);

      // Map API response to table structure
      const mappedData = reportData.map((item: any) => {
        // Format date to remove time portion
        const formatDateOnly = (dateString: string) => {
          if (!dateString) return '';
          try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
          } catch {
            return dateString;
          }
        };

        return {
          requestId: item.requestId || '',
          requestNumber: item.requestNumber || '',
          poNumber: item.poNumber || '',
          invoiceAdvPaymentNumber: item.invoiceBillNo || '',
          invoiceDate: formatDateOnly(item.invoiceDate || ''),
          projectCode: item.projectCode || '',
          organizationName: item.organizationName || '',
          invoiceAmount: item.invoiceAmount || item.poAmount || '0',
          currency: item.currency || 'USD',
          vendorName: item.vendorName || '',
          workflowStatus: item.currentStatus || item.invPaymentStatus || 'Workflow Not Started',
          studioName: item.studioName || '',
          brigadeName: item.brigadeName || '',
          lob: item.lob || '',
          payoutStatus: item.payOutStatus || '',
          payoutCycle: item.paymentCycleName || '',
          cycleDate: formatDateOnly(item.paymentCycleDate || ''),
          status: item.invPaymentStatus || 'Open',
        };
      });

      console.log('Mapped Payment Cycle Data:', mappedData);
      setPaymentCycleData(mappedData);
    } catch (error) {
      console.error('Error fetching payment cycle data:', error);
      setPaymentCycleData([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      dateFrom: '',
      dateTo: '',
      paymentCycle: '',
      studio: '',
      vendorName: '',
      poOrRequestOrInvoice: '',
    };
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters }); // Apply the current filter form values
    setCurrentPage(1); // Reset to first page when applying filters
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: PageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const fetchRequestDetails = async (requestId: string | number) => {
    if (!requestId) {
      console.error('Request ID is required');
      return;
    }

    setLoadingRequestDetails(true);
    try {
      const url = `${envConfig.apiBaseUrl}/payment-cycle-report/request-details/${requestId}`;
      console.log('Fetching Request Details from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Request Details API Response:', data);

      // Extract nested sections from API response
      const requestDetails = data.requestDetails || {};
      const quotationDetails = data.quotationDetails || {};
      const requestApprovalDetails = data.requestApprovalDetails || {};
      const poDetails = data.poDetails || {};

      // Map API response to dialog structure with 4 sections
      const mappedRequestData = {
        // Request Details Section (12 fields) - from requestDetails object
        requestNumber: requestDetails.requestNumber || data.requestNumber || data.requestNo || '',
        requestGroup: requestDetails.requestGroup || data.requestGroup || data.groupName || '',
        projectProposal: requestDetails.projectProposal || data.projectProposal || data.projectName || '',
        request: requestDetails.request || data.request || data.requestType || '',
        description: requestDetails.description || data.description || data.requestDescription || '',
        service: requestDetails.service || data.service || data.serviceName || '',
        status: requestDetails.status || data.status || data.requestStatus || '',
        requesterName: requestDetails.requesterName || data.requesterName || data.initiatedBy || '',
        requestType: requestDetails.requestType || data.requestType || '',
        subgroup: requestDetails.subgroup || data.subgroup || data.subgroupName || '',
        serviceDetails: requestDetails.serviceDetails || data.serviceDetails || data.subServiceName || '',
        requestDate: requestDetails.requestDate || data.requestDate || data.requestSubmittedDate || '',

        // Quotation Details Section (8 fields) - from quotationDetails object
        vendorManager: quotationDetails.vendorManager || data.vendorManager || '',
        approvedVendor: quotationDetails.approvedVendor || data.approvedVendor || data.vendorName || '',
        quotationStatus: quotationDetails.status || quotationDetails.quotationStatus || data.quotationStatus || '',
        dateSubmitted: quotationDetails.dateSubmitted || data.dateSubmitted || data.quotationSubmittedDate || '',
        contactPerson: quotationDetails.contactPerson || data.contactPerson || data.vendorContactPerson || '',
        approvedQuotationAmount: quotationDetails.approvedQuotationAmount || data.approvedQuotationAmount || data.quotationAmount || '',
        approvedVendorEmail: quotationDetails.approvedVendorEmail || data.approvedVendorEmail || data.vendorEmail || '',
        approvedVendorMobile: quotationDetails.approvedVendorMobile || data.approvedVendorMobile || data.vendorMobile || '',

        // Request Approval Details Section (3 fields) - from requestApprovalDetails object
        approver1: requestApprovalDetails.approver1?.name || requestApprovalDetails.name || data.approver1?.name || data.approverName || '',
        approverStatus: requestApprovalDetails.approver1?.status || requestApprovalDetails.status || requestApprovalDetails.approverStatus || data.approver1?.status || data.approverStatus || data.approvalStatus || '',
        approverComments: requestApprovalDetails.approver1?.comments || requestApprovalDetails.comments || requestApprovalDetails.approverComments || data.approver1?.comments || data.approverComments || data.comments || '',

        // PO Details Section (8 fields) - from poDetails object
        poNumber: poDetails.poNumber || data.poNumber || data.poNo || '',
        poType: poDetails.poType || data.poType || '',
        poCreatedBy: poDetails.poCreatedBy || data.poCreatedBy || data.poInitiatedBy || '',
        poDate: poDetails.poDate || data.poDate || data.poCreatedDate || '',
        poAmount: poDetails.poAmount || data.poAmount || data.poTotalAmount || '',
        poApprovedBy: poDetails.poApprovedBy || data.poApprovedBy || data.poApprover || '',
        poDateSubmitted: poDetails.dateSubmitted || poDetails.poDateSubmitted || data.poDateSubmitted || data.poSubmittedDate || '',
        poApprovedDate: poDetails.poApprovedDate || data.poApprovedDate || data.poApprovalDate || '',
      };

      console.log('Mapped Request Details:', mappedRequestData);
      setSelectedRequest(mappedRequestData);
      setShowRequestDetails(true);
    } catch (error) {
      console.error('Error fetching request details:', error);
      // Show dialog anyway with empty data
      setShowRequestDetails(true);
    } finally {
      setLoadingRequestDetails(false);
    }
  };

  const handleExportCSV = async (exportAll: boolean) => {
    try {
      setIsExporting(true);
      setShowExportDialog(false);
      
      const payload = {
        paymentCycleId: appliedFilters.paymentCycle && appliedFilters.paymentCycle !== '' ? Number(appliedFilters.paymentCycle) : -1,
        vendorId: appliedFilters.vendorName && appliedFilters.vendorName !== '' ? Number(appliedFilters.vendorName) : -1,
        dateFrom: appliedFilters.dateFrom && appliedFilters.dateFrom !== '' ? appliedFilters.dateFrom : null,
        dateTo: appliedFilters.dateTo && appliedFilters.dateTo !== '' ? appliedFilters.dateTo : null,
        poNumber: appliedFilters.poOrRequestOrInvoice && appliedFilters.poOrRequestOrInvoice !== '' ? appliedFilters.poOrRequestOrInvoice : null,
        studioId: appliedFilters.studio && appliedFilters.studio !== '' ? Number(appliedFilters.studio) : -1,
        pageNumber: exportAll ? 1 : currentPage,
        pageSize: exportAll ? 0 : (pageSize === 'All' ? 0 : Number(pageSize)),
        ignorePaging: exportAll,
      };

      console.log('Exporting with payload:', payload);

      const response = await fetch(`${envConfig.apiBaseUrl}/payment-cycle-report/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/csv',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      link.download = `payment-cycle-report-${date}.csv`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('Export completed successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="p-0 max-w-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pt-0">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold">Payment Cycle Report</h3>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(true)}
                disabled={isExporting}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-start mb-4">
                    <Filter className="h-5 w-5 text-indigo-600 mr-2" />
                    <h4 className="font-semibold text-indigo-600">Advanced Filters</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Date From */}
                    <div className="space-y-2">
                      <Label htmlFor="dateFrom">Date From:</Label>
                      <Input
                        type="date"
                        id="dateFrom"
                        value={filters.dateFrom}
                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      />
                    </div>

                    {/* Date To */}
                    <div className="space-y-2">
                      <Label htmlFor="dateTo">Date To:</Label>
                      <Input
                        type="date"
                        id="dateTo"
                        value={filters.dateTo}
                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      />
                    </div>

                    {/* Payment Cycle */}
                    <div className="space-y-2">
                      <Label htmlFor="paymentCycle">Payment Cycle:</Label>
                      <select
                        id="paymentCycle"
                        value={filters.paymentCycle}
                        onChange={(e) => handleFilterChange('paymentCycle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                        disabled={isLoadingPaymentCycles}
                      >
                        <option value="">-- ALL --</option>
                        {paymentCycles.map((cycle) => (
                          <option key={cycle.paymentCycleMasterId} value={cycle.paymentCycleMasterId}>
                            {cycle.paymentCycleName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Studio */}
                    <div className="space-y-2">
                      <Label htmlFor="studio">Studio:</Label>
                      <select
                        id="studio"
                        value={filters.studio}
                        onChange={(e) => handleFilterChange('studio', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                        disabled={isLoadingStudios}
                      >
                        <option value="">-- ALL --</option>
                        {studios.map((studio) => (
                          <option key={studio.studioId} value={studio.studioId}>
                            {studio.studioName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Vendor Name */}
                    <div className="space-y-2">
                      <Label htmlFor="vendorName">Vendor Name:</Label>
                      <select
                        id="vendorName"
                        value={filters.vendorName}
                        onChange={(e) => handleFilterChange('vendorName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                        disabled={isLoadingVendors}
                      >
                        <option value="">-- ALL --</option>
                        {vendors.map((vendor) => (
                          <option key={vendor.vendorId} value={vendor.vendorId}>
                            {vendor.vendorName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* PO # or Request # or Invoice */}
                    <div className="space-y-2">
                      <Label htmlFor="poOrRequestOrInvoice">PO # or Request # or Invoice:</Label>
                      <Input
                        type="text"
                        id="poOrRequestOrInvoice"
                        value={filters.poOrRequestOrInvoice}
                        onChange={(e) => handleFilterChange('poOrRequestOrInvoice', e.target.value)}
                        placeholder="Enter PO, Request, or Invoice #"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Clear Filters
                    </Button>
                    <Button
                      onClick={handleApplyFilters}
                      disabled={isLoadingData}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isLoadingData ? 'Loading...' : 'Apply Filters'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Table Card */}
          <Card className="w-full">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b vms-table-header">
                    <tr>
                      <th className="text-left p-1 font-medium text-sm w-[6%]">
                        Request #
                      </th>
                      <th className="text-left p-1 font-medium text-sm w-[5%]">
                        PO #
                      </th>
                      <th className="text-left p-1 font-medium text-sm w-[7%]">
                        Invoice/Adv. Payment #
                      </th>
                      <th className="text-left p-1 font-medium text-sm w-[6%]">
                        Invoice Date
                      </th>
                      <th className="text-left p-1 font-medium text-sm w-[6%]">
                        Project Code
                      </th>
                      <th className="text-left p-1 font-medium text-sm w-[7%]">
                        Org. Name
                      </th>
                      <th className="text-left p-1 font-medium text-sm w-[5%]">
                        Invoice Amount
                      </th>
                      <th className="text-left p-1 font-medium text-sm w-[4%]">
                        Currency
                      </th>
                      <th className="text-left p-1 font-medium text-sm w-[8%]">
                        Vendor
                      </th>
                      <th className="text-left p-1 font-medium text-sm w-[9%]">
                        Workflow Status
                      </th>
                      <th className="text-left p-1 font-medium text-sm w-[6%]">
                        Studio
                      </th>
                      <th className="text-left p-1 font-medium text-sm w-[6%]">
                        Brigade
                      </th>
                      <th className="text-left p-1 font-medium text-sm w-[4%]">
                        LOB
                      </th>
                      <th className="text-left p-1 font-medium text-sm w-[7%]">
                        Payout Status
                      </th>
                      <th className="text-left p-1 font-medium text-sm w-[7%]">
                        Payout Cycle
                      </th>
                      <th className="text-left p-1 font-medium text-sm w-[6%]">
                        Cycle Date
                      </th>
                      <th className="text-left p-1 font-medium text-sm w-[5%]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingData ? (
                      <tr>
                        <td colSpan={17} className="py-8 text-center text-gray-500">
                          Loading payment cycle data...
                        </td>
                      </tr>
                    ) : paymentCycleData.length === 0 ? (
                      <tr>
                        <td colSpan={17} className="py-8 text-center text-gray-500">
                          No data available. Please apply filters to search.
                        </td>
                      </tr>
                    ) : (
                      paymentCycleData.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-1 text-sm">
                          <button
                            onClick={() => fetchRequestDetails(row.requestId)}
                            disabled={loadingRequestDetails}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium disabled:opacity-50 truncate block max-w-full"
                          >
                            {row.requestNumber}
                          </button>
                        </td>
                        <td className="p-1 text-sm text-gray-900">
                          <div className="truncate" title={row.poNumber || '-'}>
                            {row.poNumber || '-'}
                          </div>
                        </td>
                        <td className="p-1 text-sm text-gray-900">
                          <div className="truncate" title={row.invoiceAdvPaymentNumber}>
                            {row.invoiceAdvPaymentNumber}
                          </div>
                        </td>
                        <td className="p-1 text-sm text-gray-900">
                          <div className="truncate" title={row.invoiceDate}>
                            {row.invoiceDate}
                          </div>
                        </td>
                        <td className="p-1 text-sm text-gray-900">
                          <div className="truncate" title={row.projectCode}>
                            {row.projectCode}
                          </div>
                        </td>
                        <td className="p-1 text-sm text-gray-900">
                          <div className="truncate" title={row.organizationName}>
                            {row.organizationName}
                          </div>
                        </td>
                        <td className="p-1 text-sm text-gray-900">
                          <div className="truncate" title={row.invoiceAmount}>
                            {row.invoiceAmount}
                          </div>
                        </td>
                        <td className="p-1 text-sm text-gray-900">
                          <div className="truncate" title={row.currency}>
                            {row.currency}
                          </div>
                        </td>
                        <td className="p-1 text-sm text-gray-900">
                          <div className="break-words">
                            {row.vendorName}
                          </div>
                        </td>
                        <td className="p-1 text-sm">
                          <div className="break-words text-blue-600">
                            {row.workflowStatus}
                          </div>
                        </td>
                        <td className="p-1 text-sm text-gray-900">
                          <div className="truncate" title={row.studioName}>
                            {row.studioName}
                          </div>
                        </td>
                        <td className="p-1 text-sm text-gray-900">
                          <div className="truncate" title={row.brigadeName}>
                            {row.brigadeName}
                          </div>
                        </td>
                        <td className="p-1 text-sm text-gray-900">
                          <div className="truncate" title={row.lob}>
                            {row.lob}
                          </div>
                        </td>
                        <td className="p-1 text-sm">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            row.payoutStatus === 'W/P'
                              ? 'bg-blue-100 text-blue-800'
                              : row.payoutStatus === 'Missed Cycle'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {row.payoutStatus}
                          </span>
                        </td>
                        <td className="p-1 text-sm text-gray-900">
                          <div className="truncate" title={row.payoutCycle}>
                            {row.payoutCycle}
                          </div>
                        </td>
                        <td className="p-1 text-sm text-gray-900">
                          <div className="truncate" title={row.cycleDate}>
                            {row.cycleDate}
                          </div>
                        </td>
                        <td className="p-1 text-sm">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <Pagination
                pagination={{
                  currentPage,
                  pageSize,
                  totalRecords,
                  totalPages: Math.ceil(totalRecords / (pageSize === 'All' ? totalRecords || 1 : Number(pageSize))),
                  showingFrom: totalRecords > 0 ? (currentPage - 1) * (pageSize === 'All' ? totalRecords : Number(pageSize)) + 1 : 0,
                  showingTo: Math.min(currentPage * (pageSize === 'All' ? totalRecords : Number(pageSize)), totalRecords),
                }}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                loading={isLoadingData}
              />
            </CardContent>
          </Card>
        </div>

        {/* Request Details Dialog */}
        <RequestDetailsDialog
          isOpen={showRequestDetails}
          onClose={() => setShowRequestDetails(false)}
          requestData={selectedRequest || {}}
        />

        {/* Export Confirmation Dialog */}
        <ExportConfirmationDialog
          isOpen={showExportDialog}
          onConfirm={handleExportCSV}
          onCancel={() => setShowExportDialog(false)}
          recordCount={paymentCycleData.length}
        />
      </MainLayout>
    </ProtectedRoute>
  );
}

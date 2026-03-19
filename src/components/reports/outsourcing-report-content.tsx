'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import { Search, Filter, X, Download, Loader2, AlertCircle, FileText, Info, ArrowLeft, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip } from '@/components/ui/tooltip';
import { InvoiceRequestDetailsDialog } from '@/components/ui/invoice-request-details-dialog';
import { envConfig } from '@/config/env-validation';
import type { PageSize } from '@/types/groups';

// Interface for outsourcing report data
interface OutsourcingReport {
  id: number;
  requestId: number;
  requestNumber: string;
  poNumber: string;
  invoiceBillAdvPaymentNumber: string;
  createdOn: string;
  invoiceDate: string;
  projectCode: string;
  currency: string;
  invoiceAmount: number;
  vendorName: string;
  status: string;
}

export default function OutsourcingReportContent({ isTesting = false }: { isTesting?: boolean } = {}) {
  const router = useRouter();
  const { toast } = useToast();

  // Filter states
  const [showFilter, setShowFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [vendorName, setVendorName] = useState('-- ALL --');
  const [division, setDivision] = useState('-1');
  const [services, setServices] = useState('0');
  const [poOrRequestNumber, setPoOrRequestNumber] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('0');

  // Data states
  const [reports, setReports] = useState<OutsourcingReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Request Details Dialog states
  const [showRequestDetailsDialog, setShowRequestDetailsDialog] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<any>(null);
  const [loadingRequestDetails, setLoadingRequestDetails] = useState(false);

  // Export dialog states
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportAllRecords, setExportAllRecords] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Dropdown options (will be populated from API later)
  const [vendorOptions, setVendorOptions] = useState<Array<{ value: string; label: string }>>([
    { value: '-- ALL --', label: '-- ALL --' }
  ]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [divisionOptions, setDivisionOptions] = useState<Array<{ id: string; name: string }>>([
    { id: '-1', name: 'All Groups' }
  ]);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [servicesOptions, setServicesOptions] = useState<Array<{ id: string; name: string }>>([
    { id: '0', name: '[SELECT]' }
  ]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [statusOptions] = useState([
    { id: '0', name: 'All' },
    { id: '1', name: 'Approved' },
    { id: '2', name: 'Pending' },
    { id: '3', name: 'Rejected' }
  ]);

  // Fetch vendors from API
  const fetchVendors = async () => {
    setLoadingVendors(true);
    try {
      const response = await fetch(`${envConfig.apiBaseUrl}/lookups/vendors`);
      
      if (!response.ok) {
        console.error('Failed to fetch vendors:', response.status);
        setLoadingVendors(false);
        return;
      }

      const result = await response.json();
      
      if (result.items && Array.isArray(result.items)) {
        const vendors = result.items.map((vendor: any) => ({
          value: vendor.vendorId?.toString() || '',
          label: vendor.vendorName || ''
        }));

        // Sort vendors alphabetically by label
        vendors.sort((a: { value: string; label: string }, b: { value: string; label: string }) => (a.label || '').localeCompare(b.label || ''));

        setVendorOptions([
          { value: '-- ALL --', label: '-- ALL --' },
          ...vendors
        ]);
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
    } finally {
      setLoadingVendors(false);
    }
  };

  // Fetch divisions/groups from API
  const fetchDivisions = async () => {
    setLoadingDivisions(true);
    try {
      const response = await fetch(`${envConfig.apiBaseUrl}/lookups/groups`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.items && Array.isArray(result.items)) {
          const groups = result.items.map((group: any) => ({
            id: group.value?.toString() || '',
            name: group.text || ''
          }));

          setDivisionOptions([
            { id: '-1', name: 'All Groups' },
            ...groups
          ]);
        }
      } else {
        console.error('Failed to fetch divisions:', response.status);
      }
    } catch (err) {
      console.error('Error fetching divisions:', err);
    } finally {
      setLoadingDivisions(false);
    }
  };

  // Fetch services from API
  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const response = await fetch(`${envConfig.apiBaseUrl}/services/all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          SearchTerm: "",
          PageNumber: 1,
          PageSize: 1000,
          SortBy: "",
          SortDescending: false,
          Filter: {}
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Extract services from response
        const dataArray = result.data?.records || result.records || result.items || result.data || [];
        
        if (Array.isArray(dataArray)) {
          const services = dataArray.map((service: any) => ({
            id: service.vendorMgrServiceId?.toString() || service.VendorMgrServiceId?.toString() || service.serviceId?.toString() || service.id?.toString() || '',
            name: service.serviceName || service.ServiceName || service.name || ''
          }));

          // Sort services alphabetically by name
          services.sort((a: { id: string; name: string }, b: { id: string; name: string }) => (a.name || '').localeCompare(b.name || ''));

          setServicesOptions([
            { id: '0', name: '[SELECT]' },
            ...services
          ]);
        }
      }
      // Silently handle API errors - keep default [SELECT] option if API fails
    } catch (err) {
      // Silently handle fetch errors - keep default [SELECT] option if API fails
    } finally {
      setLoadingServices(false);
    }
  };

  // Fetch outsourcing report data
  const fetchOutsourcingReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        Status: selectedStatus,
        Page: currentPage.toString(),
        PageSize: (pageSize === 'All' ? 10000 : pageSize).toString(),
        ExportAll: 'false'
      });

      // Add optional filter parameters only if they have values
      if (dateFrom && dateFrom.trim()) {
        params.append('DateFrom', dateFrom);
      }
      if (dateTo && dateTo.trim()) {
        params.append('DateTo', dateTo);
      }
      if (vendorName && vendorName !== '-- ALL --') {
        params.append('VendorId', vendorName);
      }
      if (division && division !== '-1') {
        params.append('DivisionId', division);
      }
      if (services && services !== '0') {
        params.append('ServiceId', services);
      }
      if (poOrRequestNumber && poOrRequestNumber.trim()) {
        params.append('RequestOrPONo', poOrRequestNumber.trim());
      }

      const response = await fetch(`${envConfig.apiBaseUrl}/outsourcing-report?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch outsourcing report');
      }

      const result = await response.json();

      // Extract data from response
      const dataArray = result.data?.records || result.records || result.data || result.items || [];
      
      if (Array.isArray(dataArray)) {
        const mappedReports: OutsourcingReport[] = dataArray.map((item: any) => ({
          id: item.id || item.Id || 0,
          requestId: item.requestId || item.RequestId || item.requestID || item.RequestID || 0,
          requestNumber: item.requestNumber || item.RequestNumber || '',
          poNumber: item.poNumber || item.PONumber || item.PoNumber || '',
          invoiceBillAdvPaymentNumber: item.invoiceBillNo || item.InvoiceBillNo || item.invoiceNumber || item.InvoiceNumber || item.billNumber || item.BillNumber || item.advPaymentNumber || item.AdvPaymentNumber || '',
          createdOn: item.createdOn || item.CreatedOn || '',
          invoiceDate: item.invoiceDate || item.InvoiceDate || '',
          projectCode: item.projectCode || item.ProjectCode || '',
          currency: item.currency || item.Currency || '',
          invoiceAmount: parseFloat(item.invoiceAmount || item.InvoiceAmount || 0),
          vendorName: item.vendorName || item.VendorName || '',
          status: item.invoiceStatus || item.InvoiceStatus || ''
        }));

        setReports(mappedReports);
        setTotalRecords(result.data?.totalRecords || result.totalRecords || mappedReports.length);
      } else {
        setReports([]);
        setTotalRecords(0);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch outsourcing report';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      setReports([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle view request details
  const handleViewRequestDetails = async (requestId: number) => {
    setLoadingRequestDetails(true);
    try {
      const response = await fetch(`${envConfig.apiBaseUrl}/invoices/details?requestId=${requestId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch request details');
      }

      const result = await response.json();
      
      // Extract nested data
      const requestDetails = result.requestDetails || {};
      const requestApprovalDetails = result.requestApprovalDetails || {};
      const poDetails = result.poDetails || {};
      const quotationDetails = result.quotationDetails || {};
      
      // Map API response to dialog format
      const requestData = {
        requestNumber: requestDetails.requestNumber || result.requestNumber || result.RequestNumber || '',
        requestType: requestDetails.requestType || result.requestType || result.RequestType || '',
        requestGroup: requestDetails.requestGroup || result.requestGroup || result.RequestGroup || result.group || result.Group || '',
        subgroup: requestDetails.subgroup || result.subgroup || result.Subgroup || result.subGroup || result.SubGroup || '',
        request: requestDetails.request || result.request || result.Request || result.requestName || result.RequestName || '',
        description: requestDetails.description || result.description || result.Description || '',
        service: requestDetails.service || result.service || result.Service || result.serviceName || result.ServiceName || '',
        serviceDetails: requestDetails.serviceDetails || result.serviceDetails || result.ServiceDetails || '',
        status: requestApprovalDetails.status || quotationDetails.status || result.status || result.Status || '',
        requestDate: requestDetails.requestDate || result.requestDate || result.RequestDate || poDetails.poDate || '',
        requesterName: requestDetails.requesterName || result.requesterName || result.RequesterName || result.requester || result.Requester || '',
        vendorManager: quotationDetails.vendorManager || result.vendorManager || result.VendorManager || '',
        approvedVendor: quotationDetails.approvedVendor || result.approvedVendor || result.ApprovedVendor || result.vendorName || result.VendorName || '',
        contactPerson: quotationDetails.contactPerson || result.contactPerson || result.ContactPerson || '',
        quotationStatus: quotationDetails.status || result.quotationStatus || result.QuotationStatus || '',
        dateSubmitted: quotationDetails.dateSubmitted || poDetails.dateSubmitted || result.dateSubmitted || result.DateSubmitted || '',
        approvedQuotationAmount: quotationDetails.approvedQuotationAmount || result.approvedQuotationAmount || result.ApprovedQuotationAmount || '',
        approver1: requestApprovalDetails.approver1?.name || requestApprovalDetails.name || result.approver1?.name || result.Approver1?.name || result.approverName || '',
        approver1Status: requestApprovalDetails.approver1?.status || requestApprovalDetails.status || result.approver1?.status || result.Approver1?.status || result.approverStatus || '',
        approver1Comments: requestApprovalDetails.approver1?.comments || requestApprovalDetails.comments || result.approver1?.comments || result.Approver1?.comments || result.approverComments || '',
        poNumber: poDetails.poNumber || result.poNumber || result.PONumber || result.poNo || result.PONo || '',
        poType: poDetails.poType || result.poType || result.POType || '',
        poDate: poDetails.poDate || result.poDate || result.PODate || '',
        poAmount: poDetails.poAmount || result.poAmount || result.POAmount || '',
        poCreatedBy: poDetails.poCreatedBy || result.poCreatedBy || result.POCreatedBy || '',
        poApprovedBy: poDetails.poApprovedBy || result.poApprovedBy || result.POApprovedBy || '',
        poApprovedDate: poDetails.poApprovedDate || result.poApprovedDate || result.POApprovedDate || '',
      };

      setSelectedRequestDetails(requestData);
      setShowRequestDetailsDialog(true);
    } catch (error) {
      console.error('Error fetching request details:', error);
      toast({
        title: "Error",
        description: "Failed to load request details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingRequestDetails(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchOutsourcingReport();
  };

  // Handle clear filters
  const handleClearFilters = async () => {
    // Reset all filter states
    setDateFrom('');
    setDateTo('');
    setVendorName('-- ALL --');
    setDivision('-1');
    setServices('0');
    setPoOrRequestNumber('');
    setSelectedStatus('0');
    setCurrentPage(1);
    
    // Fetch data immediately with cleared filters
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        Status: '0',
        Page: '1',
        PageSize: (pageSize === 'All' ? 10000 : pageSize).toString(),
        ExportAll: 'false'
      });

      const response = await fetch(`${envConfig.apiBaseUrl}/outsourcing-report?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch outsourcing report');
      }

      const result = await response.json();

      // Extract data from response
      const dataArray = result.data?.records || result.records || result.data || result.items || [];
      
      if (Array.isArray(dataArray)) {
        const mappedReports: OutsourcingReport[] = dataArray.map((item: any) => ({
          id: item.id || item.Id || 0,
          requestId: item.requestId || item.RequestId || item.requestID || item.RequestID || 0,
          requestNumber: item.requestNumber || item.RequestNumber || '',
          poNumber: item.poNumber || item.PONumber || item.PoNumber || '',
          invoiceBillAdvPaymentNumber: item.invoiceBillNo || item.InvoiceBillNo || item.invoiceNumber || item.InvoiceNumber || item.billNumber || item.BillNumber || item.advPaymentNumber || item.AdvPaymentNumber || '',
          createdOn: item.createdOn || item.CreatedOn || '',
          invoiceDate: item.invoiceDate || item.InvoiceDate || '',
          projectCode: item.projectCode || item.ProjectCode || '',
          currency: item.currency || item.Currency || '',
          invoiceAmount: parseFloat(item.invoiceAmount || item.InvoiceAmount || 0),
          vendorName: item.vendorName || item.VendorName || '',
          status: item.invoiceStatus || item.InvoiceStatus || ''
        }));

        setReports(mappedReports);
        setTotalRecords(result.data?.totalRecords || result.totalRecords || mappedReports.length);
      } else {
        setReports([]);
        setTotalRecords(0);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch outsourcing report';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      setReports([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
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
      const params = new URLSearchParams({
        Status: selectedStatus,
        Page: currentPage.toString(),
        PageSize: (pageSize === 'All' ? 10000 : pageSize).toString(),
        ExportAll: exportAllRecords.toString()
      });

      // Add optional filter parameters only if they have values
      if (dateFrom && dateFrom.trim()) {
        params.append('DateFrom', dateFrom);
      }
      if (dateTo && dateTo.trim()) {
        params.append('DateTo', dateTo);
      }
      if (vendorName && vendorName !== '-- ALL --') {
        params.append('VendorId', vendorName);
      }
      if (division && division !== '-1') {
        params.append('DivisionId', division);
      }
      if (services && services !== '0') {
        params.append('ServiceId', services);
      }
      if (poOrRequestNumber && poOrRequestNumber.trim()) {
        params.append('RequestOrPONo', poOrRequestNumber.trim());
      }

      const response = await fetch(`${envConfig.apiBaseUrl}/outsourcing-report/export?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export outsourcing report');
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `outsourcing_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Outsourcing report exported successfully',
        variant: 'success',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export outsourcing report';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
      setExportAllRecords(false); // Reset checkbox after export
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: PageSize) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchVendors();
    fetchDivisions();
    fetchServices();
    fetchOutsourcingReport();
  }, [currentPage, pageSize]);

  // Testing useEffect - calls all functions with mock params
  useEffect(() => {
    if (isTesting) {
      // Test filter state changes
      setDateFrom('2024-01-01');
      setDateTo('2024-12-31');
      setVendorName('123');
      setDivision('5');
      setServices('10');
      setPoOrRequestNumber('PO12345');
      setSelectedStatus('1');
      
      // Test pagination
      handlePageChange(2);
      handlePageSizeChange(25);
      handlePageSizeChange('All');
      
      // Test filter visibility
      setShowFilter(false);
      setShowFilter(true);
      
      // Test action functions
      handleSearch();
      handleClearFilters();
      showExportConfirmation();
      
      // Test export with different options
      setExportAllRecords(true);
      handleExport();
      setExportAllRecords(false);
      handleExport();
      
      // Test request details (async, will call the function but dialog might not open immediately)
      handleViewRequestDetails(999);
      
      // Test dialog states (but don't open request details dialog as data might not be ready)
      setShowExportDialog(true);
      setLoadingRequestDetails(true);
    }
  }, [isTesting]);

  // Pagination object
  const totalPages = Math.ceil(totalRecords / (pageSize === 'All' ? totalRecords : pageSize));
  const showingFrom = totalRecords === 0 ? 0 : (currentPage - 1) * (pageSize === 'All' ? totalRecords : pageSize) + 1;
  const showingTo = Math.min(currentPage * (pageSize === 'All' ? totalRecords : pageSize), totalRecords);

  const pagination = {
    currentPage,
    totalPages,
    pageSize,
    totalRecords,
    showingFrom,
    showingTo
  };

  // Handle back navigation
  const handleBackNavigation = () => {
    router.push('/invoice-approvals');
  };

  return (
    <div className="p-0">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Tooltip content="Back to Invoice Approvals" position="bottom">
            <Button
              variant="outline"
              size="icon"
              onClick={handleBackNavigation}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Tooltip>
          <h3 className="text-lg font-semibold">Outsourcing Report</h3>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-vendor-600" />}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={showExportConfirmation}
            className="gap-2 font-normal text-xs"
            disabled={exporting}
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export Data
              </>
            )}
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="px-4 py-2">
          {/* Filter Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-indigo-600" />
              <h4 className="font-semibold text-indigo-600">Advanced Filters</h4>
            </div>
            <Button
              variant="ghost"
              onClick={() => setShowFilter(!showFilter)}
              className="gap-2 text-xs"
            >
              {/* <Filter className="h-4 w-4" />
              {showFilter ? 'Hide Filters' : 'Show Filters'} */}
              {showFilter ? (
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
          {showFilter && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Date From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date From
                  </label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    placeholder="Select Date"
                  />
                </div>

                {/* Date To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date To
                  </label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    placeholder="Select Date"
                  />
                </div>

                {/* PO # or Request # */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PO # or Request #
                  </label>
                  <Input
                    type="text"
                    value={poOrRequestNumber}
                    onChange={(e) => setPoOrRequestNumber(e.target.value)}
                    placeholder="Enter PO or Request Number"
                  />
                </div>

                {/* Vendor Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor Name
                  </label>
                  <select
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500 text-sm"
                    disabled={loadingVendors}
                  >
                    <option value="-- ALL --">{loadingVendors ? 'Loading...' : '-- ALL --'}</option>
                    {vendorOptions.filter(option => option.value !== '-- ALL --').map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Division */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Division
                  </label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500 text-sm"
                    disabled={loadingDivisions}
                  >
                    <option value="-1">{loadingDivisions ? 'Loading...' : 'All Groups'}</option>
                    {divisionOptions.filter(option => option.id !== '-1').map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500 text-sm"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Services */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Services
                  </label>
                  <select
                    value={services}
                    onChange={(e) => setServices(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500 text-sm"
                    disabled={loadingServices}
                  >
                    <option value="0">{loadingServices ? 'Loading...' : '[SELECT]'}</option>
                    {servicesOptions.filter(option => option.id !== '0').map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="px-4 text-xs font-normal"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
                <Button
                  onClick={handleSearch}
                  variant="outline"
                  className="px-4 text-xs font-normal"
                  disabled={loading}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {/* Data Context Note */}
          {/* <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-md p-3">
            <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="font-medium">Note:</span>
            <span>Table displays current year data by default.</span>
          </div> */}
          
          <div className="overflow-x-auto">
            <table className="w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-1 px-4 font-medium text-sm w-[10%]">Request #</th>
                  <th className="text-left py-1 px-2 font-medium text-sm w-[10%]">PO #</th>
                  <th className="text-left py-1 px-2 font-medium text-sm w-[12%]">Invoice/Bill/Adv. Payment #</th>
                  <th className="text-left py-1 px-2 font-medium text-sm w-[10%]">Created On</th>
                  <th className="text-left py-1 px-2 font-medium text-sm w-[10%]">Invoice Date</th>
                  <th className="text-left py-1 px-2 font-medium text-sm w-[10%]">Project Code</th>
                  <th className="text-left py-1 px-2 font-medium text-sm w-[8%]">Currency</th>
                  <th className="text-left py-1 px-2 font-medium text-sm w-[10%]">Invoice Amount</th>
                  <th className="text-left py-1 px-2 font-medium text-sm w-[12%]">Vendor Name</th>
                  <th className="text-left py-1 px-2 font-medium text-sm w-[8%]">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-vendor-600" />
                        <span className="text-gray-500">Loading outsourcing report...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                        <p className="text-red-600 font-normal">{error}</p>
                        <Button
                          onClick={fetchOutsourcingReport}
                          variant="outline"
                          size="sm"
                        >
                          Retry
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500 font-medium">
                          No outsourcing reports found
                        </p>
                        <p className="text-gray-400 text-sm">
                          Try adjusting your filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reports.map((report, index) => (
                    <tr key={`report-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-4 text-xs">
                        <button
                          onClick={() => handleViewRequestDetails(report.requestId)}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-normal text-left"
                        >
                          {report.requestNumber}
                        </button>
                      </td>
                      <td className="py-2 px-2 text-xs text-gray-900">{report.poNumber}</td>
                      <td className="py-2 px-2 text-xs text-gray-900">{report.invoiceBillAdvPaymentNumber}</td>
                      <td className="py-2 px-2 text-xs text-gray-900">{report.createdOn}</td>
                      <td className="py-2 px-2 text-xs text-gray-900">{report.invoiceDate}</td>
                      <td className="py-2 px-2 text-xs text-gray-900">{report.projectCode}</td>
                      <td className="py-2 px-2 text-xs text-gray-900">{report.currency}</td>
                      <td className="py-2 px-2 text-xs text-gray-900">{report.invoiceAmount.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-gray-900">{report.vendorName}</td>
                      <td className="py-2 px-2 text-xs">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.status === 'Approved' 
                            ? 'bg-green-100 text-green-800'
                            : report.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6">
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              loading={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <InvoiceRequestDetailsDialog
        isOpen={showRequestDetailsDialog}
        onClose={() => setShowRequestDetailsDialog(false)}
        requestData={selectedRequestDetails}
      />

      {/* Export Confirmation Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 shadow-2xl">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Download className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Export Outsourcing Report
                </h3>
                <p className="text-gray-600">
                  Configure your export options below
                </p>
              </div>

              <div className="space-y-4">
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
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    disabled={exporting}
                  >
                    {exporting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

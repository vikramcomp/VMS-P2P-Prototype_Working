'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Download } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RequestDetailsDialog } from '@/components/ui/request-details-dialog';
import { buildApiUrl } from '@/services/api-client';
import Pagination from '@/components/ui/pagination';
import { PageSize, PaginationState } from '@/types/groups';

export default function POReportPage({ isTesting = false }: { isTesting?: boolean } = {}) {
  const [showFilters, setShowFilters] = useState(false);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [brigades, setBrigades] = useState<any[]>([]);
  const [studios, setStudios] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [loadingStudios, setLoadingStudios] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [loadingRequestDetails, setLoadingRequestDetails] = useState(false);
  const [poReportList, setPoReportList] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10 as PageSize,
    totalRecords: 0,
    totalPages: 0,
    showingFrom: 0,
    showingTo: 0,
  });
  const [filters, setFilters] = useState({
    brigade: '',
    dateFrom: '',
    dateTo: '',
    studio: '',
    services: '',
    status: '',
    selectVendor: '',
    poOrRequestNumber: '',
  });

  // Fetch filter lookups and table data on component mount
  useEffect(() => {
    fetchFilterLookups();
    fetchPoReportData();
  }, []);

  // Testing useEffect - calls all functions with mock params
  useEffect(() => {
    if (isTesting) {
      // Test all state setters
      setShowFilters(true);
      setShowRequestDetails(true);
      setSelectedRequest({ requestNumber: 'TEST-001', requestId: 123 });
      setBrigades([{ brigadeId: 1, brigadeName: 'Brigade 1' }]);
      setStudios([{ studioId: 1, studioName: 'Studio 1' }]);
      setServices([{ serviceId: 1, serviceName: 'Service 1' }]);
      setStatuses([{ poStatusID: 1, poStatusName: 'Active' }]);
      setVendors([{ vendorId: 1, vendorName: 'Vendor 1' }]);
      setLoadingFilters(true);
      setLoadingStudios(true);
      setLoadingTable(true);
      setLoadingExport(true);
      setLoadingRequestDetails(true);
      setPoReportList([{
        requestNumber: 'REQ001',
        requestDesc: 'Test Request',
        poNumber: 'PO001',
        poRaisedDate: '2024-01-01',
        poReleasedDate: '2024-01-02',
        projectCode: 'PROJ001',
        currency: 'USD',
        poTotalAmount: '1000.00',
        invoicedAmount: '500.00',
        poBalanceAmount: '500.00',
        brigadeName: 'Test Brigade',
        studioName: 'Test Studio',
        status: 'On Process',
        requestId: 123
      }]);
      setPagination({
        currentPage: 2,
        pageSize: 25 as PageSize,
        totalRecords: 100,
        totalPages: 4,
        showingFrom: 26,
        showingTo: 50,
      });
      
      // Test all filter changes
      handleFilterChange('brigade', '1');
      handleFilterChange('dateFrom', '2024-01-01');
      handleFilterChange('dateTo', '2024-12-31');
      handleFilterChange('studio', '1');
      handleFilterChange('services', '1');
      handleFilterChange('status', '1');
      handleFilterChange('selectVendor', '1');
      handleFilterChange('poOrRequestNumber', 'PO12345');
      
      // Test action handlers
      handleSearch();
      handleClearFilters();
      handlePageChange(2);
      handlePageSizeChange(25 as PageSize);
      handlePageSizeChange('All' as PageSize);
      
      // Test async functions
      fetchStudios('1');
      fetchStudios(''); // Test empty brigade
      fetchPoReportData(2);
      fetchPoReportData(1, 50 as PageSize);
      fetchRequestDetails(123);
      fetchRequestDetails(''); // Test empty requestId
      handleExport();
      
      // Test UI state changes
      setShowFilters(false);
      setShowRequestDetails(false);
    }
  }, [isTesting]);

  const fetchFilterLookups = async () => {
    setLoadingFilters(true);
    try {
      const url = buildApiUrl('po-reports/lookups');
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
      console.log('PO Report Lookups API Response:', data);

      // Extract and set each dropdown data
      if (data.brigades || data.Brigades || data.brigade || data.Brigade) {
        const brigadesData = data.brigades || data.Brigades || data.brigade || data.Brigade || [];
        console.log('Brigades Data:', brigadesData);
        setBrigades(brigadesData);
      }

      if (data.services || data.Services) {
        const servicesData = data.services || data.Services || [];
        console.log('Services Data:', servicesData);
        setServices(servicesData);
      }

      if (data.poStatuses || data.statuses || data.Statuses || data.status || data.Status) {
        const statusesData = data.poStatuses || data.statuses || data.Statuses || data.status || data.Status || [];
        console.log('Statuses Data:', statusesData);
        setStatuses(statusesData);
      }

      if (data.vendors || data.Vendors || data.vendor || data.Vendor) {
        const vendorsData = data.vendors || data.Vendors || data.vendor || data.Vendor || [];
        console.log('Vendors Data:', vendorsData);
        setVendors(vendorsData);
      }
    } catch (error) {
      console.error('Error fetching filter lookups:', error);
    } finally {
      setLoadingFilters(false);
    }
  };

  const fetchStudios = async (brigadeId: string) => {
    if (!brigadeId) {
      setStudios([]);
      setFilters(prev => ({ ...prev, studio: '' }));
      return;
    }

    setLoadingStudios(true);
    try {
      const url = buildApiUrl(`brigade-studio/brigades/${brigadeId}/studios`);
      console.log('Fetching studios for brigade:', brigadeId, 'URL:', url);
      
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
      console.log('Studios API Response:', data);

      // Handle different response structures
      let studiosData = [];
      if (Array.isArray(data)) {
        studiosData = data;
      } else if (data.studios || data.Studios) {
        studiosData = data.studios || data.Studios || [];
      } else if (data.data) {
        studiosData = Array.isArray(data.data) ? data.data : [];
      }

      console.log('Extracted Studios Data:', studiosData);
      setStudios(studiosData);
    } catch (error) {
      console.error('Error fetching studios:', error);
      setStudios([]);
    } finally {
      setLoadingStudios(false);
    }
  };

  const fetchPoReportData = async (page: number = 1, customPageSize?: PageSize, customFilters?: typeof filters) => {
    setLoadingTable(true);
    try {
      const url = buildApiUrl('po-reports/search');
      console.log('Fetching PO Report data, URL:', url);

      const effectivePageSize = customPageSize || pagination.pageSize;
      const pageSize = effectivePageSize === 'All' ? 0 : Number(effectivePageSize);

      // Use customFilters if provided, otherwise fall back to state filters
      const activeFilters = customFilters ?? filters;

      // Build request payload
      const payload = {
        brigadeId: activeFilters.brigade ? parseInt(activeFilters.brigade) : 0,
        studioId: activeFilters.studio ? parseInt(activeFilters.studio) : 0,
        serviceId: activeFilters.services ? parseInt(activeFilters.services) : 0,
        poStatusId: activeFilters.status ? parseInt(activeFilters.status) : 0,
        vendorId: activeFilters.selectVendor ? parseInt(activeFilters.selectVendor) : 0,
        poNumber: activeFilters.poOrRequestNumber || '',
        dateFrom: activeFilters.dateFrom || null,
        dateTo: activeFilters.dateTo || null,
        page: page,
        pageSize: pageSize,
        vendorView: false,
      };

      console.log('Request Payload:', payload);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('PO Report Search API Response:', data);

      // Extract table data and pagination info
      let tableData = [];
      let totalRecords = 0;
      let totalPages = 0;
      let currentPage = page;

      if (data.items && Array.isArray(data.items)) {
        tableData = data.items;
        totalRecords = data.totalRecords || data.totalCount || 0;
        totalPages = data.totalPages || Math.ceil(totalRecords / (pageSize || 10));
        currentPage = data.page || page;
      } else if (data?.data) {
        tableData = Array.isArray(data.data) ? data.data : [];
        totalRecords = data.totalRecords || data.totalCount || tableData.length;
        totalPages = data.totalPages || Math.ceil(totalRecords / (pageSize || 10));
        currentPage = data.currentPage || data.pageNumber || page;
      } else if (Array.isArray(data)) {
        tableData = data;
        totalRecords = data.length;
        totalPages = 1;
      }

      console.log('Extracted Table Data:', tableData);

      // Map API response to table structure
      const mappedData = tableData.map((item: any) => ({
        requestNumber: item.requestNo || '',
        requestDesc: item.requestDesc || '',
        poNumber: item.poNo || '',
        poRaisedDate: item.poRaisedDate || '',
        poReleasedDate: item.poReleasedDate || '',
        projectCode: item.projectCode || '',
        currency: item.currency || '',
        poTotalAmount: item.poTotalAmount || '0.00',
        invoicedAmount: item.invoicedAmount || '0.00',
        poBalanceAmount: item.poBalanceAmount || '0.00',
        brigadeName: item.brigadeName || '',
        studioName: item.studioName || '',
        status: item.poStatus || '',
        requestId: item.requestId || item.id || '',
      }));

      console.log('Mapped Table Data:', mappedData);
      setPoReportList(mappedData);

      // Update pagination state
      const effectivePageSizeNum = effectivePageSize === 'All' ? totalRecords : Number(effectivePageSize);
      const showingFrom = totalRecords === 0 ? 0 : (currentPage - 1) * effectivePageSizeNum + 1;
      const showingTo = Math.min(
        showingFrom + effectivePageSizeNum - 1,
        totalRecords
      );

      setPagination({
        currentPage,
        pageSize: effectivePageSize,
        totalRecords,
        totalPages,
        showingFrom,
        showingTo,
      });
    } catch (error) {
      console.error('Error fetching PO Report data:', error);
      setPoReportList([]);
      setPagination({
        currentPage: 1,
        pageSize: pagination.pageSize,
        totalRecords: 0,
        totalPages: 0,
        showingFrom: 0,
        showingTo: 0,
      });
    } finally {
      setLoadingTable(false);
    }
  };

  // Fetch Request Details
  const fetchRequestDetails = async (requestId: string | number) => {
    if (!requestId) {
      console.error('Request ID is required');
      return;
    }

    setLoadingRequestDetails(true);
    try {
      const url = buildApiUrl(`invoices/details?requestId=${requestId}`);
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
      // Show basic data if API fails
      setShowRequestDetails(true);
    } finally {
      setLoadingRequestDetails(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    
    // If brigade changes, fetch studios and reset studio selection
    if (field === 'brigade') {
      fetchStudios(value);
    }
  };

  const handleSearch = () => {
    console.log('Search with filters:', filters);
    fetchPoReportData(1);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      brigade: '',
      dateFrom: '',
      dateTo: '',
      studio: '',
      services: '',
      status: '',
      selectVendor: '',
      poOrRequestNumber: '',
    };
    setFilters(clearedFilters);
    setStudios([]); // Clear studios when filters are cleared
    // Pass cleared filters directly to avoid async state update issue
    fetchPoReportData(1, undefined, clearedFilters);
  };

  const handlePageChange = (page: number) => {
    fetchPoReportData(page);
  };

  const handlePageSizeChange = (newPageSize: PageSize) => {
    fetchPoReportData(1, newPageSize);
  };

  const handleExport = async () => {
    setLoadingExport(true);
    try {
      const url = buildApiUrl('po-reports/export');
      console.log('Exporting PO Report data, URL:', url);

      // Static payload - not affected by filters
      const payload = {
        brigadeId: 0,
        studioId: 0,
        serviceId: 0,
        poStatusId: 0,
        vendorId: 0,
        poNumber: '',
        dateFrom: null,
        dateTo: null,
        page: 1,
        pageSize: 10,
        vendorView: false,
      };

      console.log('Export Payload:', payload);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/csv',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create a download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      link.download = `PO_Report_${currentDate}.csv`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log('PO Report exported successfully');
    } catch (error) {
      console.error('Error exporting PO Report:', error);
      alert('Failed to export PO Report. Please try again.');
    } finally {
      setLoadingExport(false);
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="p-0">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6 pt-0">
            <h3 className="text-lg font-semibold">PO Report</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={loadingExport}
                className="flex items-center gap-2 font-normal text-xs"
              >
                <Download className="h-4 w-4" />
                {loadingExport ? 'Exporting...' : 'Export'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 font-normal text-xs"
              >
                {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                {showFilters ? 'Hide Filters' : 'Show Filters'}
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
                   
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Brigade */}
                    <div className="space-y-2">
                      <Label htmlFor="brigade">Brigade:</Label>
                      <select
                        id="brigade"
                        value={filters.brigade}
                        onChange={(e) => handleFilterChange('brigade', e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                        disabled={loadingFilters}
                      >
                        <option value="">{loadingFilters ? 'Loading...' : 'Select Brigade'}</option>
                        {brigades.map((brigade) => (
                          <option key={brigade.brigadeId || brigade.id} value={brigade.brigadeId || brigade.id}>
                            {brigade.brigadeName || brigade.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date From */}
                    <div className="space-y-2">
                      <Label htmlFor="dateFrom">Date From:</Label>
                      <Input
                        type="date"
                        id="dateFrom"
                        value={filters.dateFrom}
                        className='text-xs'
                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      />
                    </div>

                    {/* Date To */}
                    <div className="space-y-2">
                      <Label htmlFor="dateTo">Date To:</Label>
                      <Input
                        type="date"
                        id="dateTo"
                        className='text-xs'
                        value={filters.dateTo}
                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      />
                    </div>

                    {/* Studio */}
                    <div className="space-y-2">
                      <Label htmlFor="studio">Studio:</Label>
                      <select
                        id="studio"
                        value={filters.studio}
                        onChange={(e) => handleFilterChange('studio', e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                        disabled={!filters.brigade || loadingStudios}
                      >
                        <option value="">
                          {!filters.brigade 
                            ? 'First Select Brigade' 
                            : loadingStudios 
                            ? 'Loading...' 
                            : 'Select Studio'}
                        </option>
                        {studios.map((studio) => (
                          <option key={studio.studioId || studio.id} value={studio.studioId || studio.id}>
                            {studio.studioName || studio.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Services */}
                    <div className="space-y-2">
                      <Label htmlFor="services">Services:</Label>
                      <select
                        id="services"
                        value={filters.services}
                        onChange={(e) => handleFilterChange('services', e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                        disabled={loadingFilters}
                      >
                        <option value="">{loadingFilters ? 'Loading...' : 'Select Services'}</option>
                        {services.map((service) => (
                          <option key={service.serviceId || service.id} value={service.serviceId || service.id}>
                            {service.serviceName || service.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <Label htmlFor="status">Status:</Label>
                      <select
                        id="status"
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                        disabled={loadingFilters}
                      >
                        <option value="">{loadingFilters ? 'Loading...' : 'Select Status'}</option>
                        {statuses.map((status) => (
                          <option key={status.poStatusID || status.id} value={status.poStatusID || status.id}>
                            {status.poStatusName || status.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Vendor */}
                    <div className="space-y-2">
                      <Label htmlFor="selectVendor">Vendor:</Label>
                      <select
                        id="selectVendor"
                        value={filters.selectVendor}
                        onChange={(e) => handleFilterChange('selectVendor', e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                        disabled={loadingFilters}
                      >
                        <option value="">{loadingFilters ? 'Loading...' : 'Select Vendor'}</option>
                        {vendors.map((vendor) => (
                          <option key={vendor.vendorId || vendor.id} value={vendor.vendorId || vendor.id}>
                            {vendor.vendorName || vendor.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* PO # Or Request # */}
                    <div className="space-y-2">
                      <Label htmlFor="poOrRequestNumber">PO # Or Request #:</Label>
                      <Input
                        type="text"
                        id="poOrRequestNumber"
                        value={filters.poOrRequestNumber}
                        onChange={(e) => handleFilterChange('poOrRequestNumber', e.target.value)}
                        placeholder=""
                      />
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      className='text-xs font-normal'
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear Filters
                    </Button>
                    <Button
                      onClick={handleSearch}
                      variant="outline"
                      className="flex items-center gap-2 text-xs font-normal"
                    >
                      <Filter className="h-4 w-4" />
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* PO Report Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-1 text-left text-xs font-medium">
                        Request #
                      </th>
                      <th className="px-4 py-1 text-left text-xs font-medium">
                        Request Desc
                      </th>
                      <th className="px-4 py-1 text-left text-xs font-medium">
                        PO #
                      </th>
                      <th className="px-4 py-1 text-left text-xs font-medium">
                        PO Request Raised Date
                      </th>
                      <th className="px-4 py-1 text-left text-xs font-medium">
                        PO Released Date
                      </th>
                      <th className="px-4 py-1 text-left text-xs font-medium">
                        Project Code
                      </th>
                      <th className="px-4 py-1 text-left text-xs font-medium">
                        Currency
                      </th>
                      <th className="px-4 py-1 text-left text-xs font-medium">
                        PO Total Amount
                      </th>
                      <th className="px-4 py-1 text-left text-xs font-medium">
                        Invoiced Amount
                      </th>
                      <th className="px-4 py-1 text-left text-xs font-medium">
                        PO Balance Amount
                      </th>
                      <th className="px-4 py-1 text-left text-xs font-medium">
                        Brigade Name
                      </th>
                      <th className="px-4 py-1 text-left text-xs font-medium">
                        Studio Name
                      </th>
                      <th className="px-4 py-1 text-left text-xs font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loadingTable ? (
                      <tr>
                        <td colSpan={13} className="px-4 py-8 text-center text-sm text-gray-500">
                          Loading PO Report data...
                        </td>
                      </tr>
                    ) : poReportList.length > 0 ? (
                      poReportList.map((po, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-xs">
                            <button
                              onClick={() => fetchRequestDetails(po.requestId)}
                              disabled={loadingRequestDetails}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-normal disabled:opacity-50 whitespace-nowrap"
                            >
                              {po.requestNumber}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-900">
                            {po.requestDesc}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-900">
                            {po.poNumber || '-'}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-900">
                            {po.poRaisedDate || '-'}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-900">
                            {po.poReleasedDate || '-'}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-900">
                            {po.projectCode || '-'}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-900">
                            {po.currency || '-'}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-900">
                            {po.poTotalAmount}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-900">
                            {po.invoicedAmount}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-900">
                            {po.poBalanceAmount}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-900">
                            {po.brigadeName || '-'}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-900">
                            {po.studioName || '-'}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-900">
                            <span className={`inline-flex whitespace-nowrap items-center px-2.5 py-0.5 rounded-full text-xs font-normal ${
                              po.status === 'On Process' 
                                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                : po.status === 'On Approval'
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                : po.status === 'Under Verification'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : po.status === 'Under Execution'
                                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                : po.status === 'Closed'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              {po.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={13} className="px-4 py-8 text-center text-sm text-gray-500">
                          No PO records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {!loadingTable && poReportList.length > 0 && (
                <Pagination
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  loading={loadingTable}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Request Details Dialog */}
        <RequestDetailsDialog
          isOpen={showRequestDetails}
          onClose={() => setShowRequestDetails(false)}
          requestData={selectedRequest || {}}
        />
      </MainLayout>
    </ProtectedRoute>
  );
}

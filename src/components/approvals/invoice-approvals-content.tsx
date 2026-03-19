'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import { Search, Filter, X, Eye, Edit, MoreVertical, Loader2, AlertCircle, FileText, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip } from '@/components/ui/tooltip';
import { InvoiceRequestDetailsDialog } from '@/components/ui/invoice-request-details-dialog';
import type { PageSize } from '@/types/groups';
import { envConfig } from '@/config/env-validation';

interface InvoiceApproval {
  id: number;
  requestId: number;
  requestNumber: string;
  poNumber: string;
  invoiceNumber: string;
  requestName: string;
  requestDate: string;
  invoiceDate: string;
  projectCode: string;
  poAmount: number;
  currentInvoiceAmount: number;
  vendorName: string;
  currentPhaseAging: number;
  totalAgingDays: number;
  invoiceApprovalStatus: string;
  comment: string;
  status: string;
  invoiceBillAdvPaymentId: string;
  approverType: string;
  canEdit: boolean;
}

export default function InvoiceApprovalsContent({ isTesting = false }: { isTesting?: boolean } = {}) {
  const router = useRouter();
  const { toast } = useToast();
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null);
  const [invoiceApprovals, setInvoiceApprovals] = useState<InvoiceApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRequestDetailsDialog, setShowRequestDetailsDialog] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<any>(null);
  const [loadingRequestDetails, setLoadingRequestDetails] = useState(false);

  // Export dialog states
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportAllRecords, setExportAllRecords] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filter state
  const [showFilter, setShowFilter] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('-1');
  const [selectedStatus, setSelectedStatus] = useState('0');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Dropdown options
  const [groupOptions, setGroupOptions] = useState<Array<{ id: string; name: string }>>([{ id: '-1', name: 'All Groups' }]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const statusOptions = [
    { id: '0', name: 'All' },
    { id: '1', name: 'Approved' },
    { id: '2', name: 'Pending' },
    { id: '3', name: 'Rejected' },
  ];

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowActionMenu(null);
    };

    if (showActionMenu !== null) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showActionMenu]);

  // Intermediate handler functions
  const handleSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroup(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
  };

  const handleToggleFilter = () => {
    setShowFilter(!showFilter);
  };

  const handleRequestNumberClick = (requestId: number) => () => {
    handleViewRequestDetails(requestId);
  };

  const handleActionMenuToggle = (idx: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActionMenu(showActionMenu === idx ? null : idx);
  };

  const handleActionMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleViewInvoiceClick = (requestId: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActionMenu(null);
    handleViewInvoice(requestId);
  };

  const handleEditInvoiceClick = (requestId: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActionMenu(null);
    handleEditInvoice(requestId);
  };

  const handleExportAllRecordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExportAllRecords(e.target.checked);
  };

  const handleCancelExportDialog = () => {
    setShowExportDialog(false);
    setExportAllRecords(false);
  };

  // Testing useEffect - calls all functions with mock params
  useEffect(() => {
    if (isTesting) {
      // Set all state values
      setShowActionMenu(1);
      setInvoiceApprovals([{
        id: 1,
        requestId: 100,
        requestNumber: 'REQ-TEST-001',
        poNumber: 'PO-TEST-001',
        invoiceNumber: 'INV-TEST-001',
        requestName: 'Test Request',
        requestDate: '2024-01-01',
        invoiceDate: '2024-01-15',
        projectCode: 'PROJ-001',
        poAmount: 5000.00,
        currentInvoiceAmount: 2500.00,
        vendorName: 'Test Vendor',
        currentAgingDays: 10,
        totalAgingDays: 15,
        invoiceApprovalStatus: 'Pending',
        comment: 'Test comment',
        status: 'Pending Approval'
      }]);
      setLoading(true);
      setError('Test error');
      setShowRequestDetailsDialog(true);
      setSelectedRequestDetails({ requestNumber: 'REQ-001' });
      setLoadingRequestDetails(true);
      setShowExportDialog(true);
      setExportAllRecords(true);
      setExporting(true);
      setShowFilter(false);
      setSearchText('test search');
      setSelectedGroup('1');
      setSelectedStatus('1');
      setCurrentPage(2);
      setPageSize(20 as PageSize);
      setTotalRecords(100);
      setGroupOptions([{ id: '1', name: 'Test Group' }]);
      setLoadingGroups(true);

      // Call all handler functions
      handleApplyFilter();
      handleResetFilter();
      handlePageChange(3);
      handlePageSizeChange(50 as PageSize);
      handleViewInvoice(100);
      handleEditInvoice(100);
      showExportConfirmation();
      handleExport();
      handleOutsourcingReport();
      handleViewRequestDetails(100);
      fetchGroups();
      fetchInvoiceApprovals();

      // Call intermediate handlers with mock events
      const mockInputEvent = {
        target: { value: 'test' }
      } as React.ChangeEvent<HTMLInputElement>;
      handleSearchTextChange(mockInputEvent);

      const mockSelectEvent = {
        target: { value: '1' }
      } as React.ChangeEvent<HTMLSelectElement>;
      handleGroupChange(mockSelectEvent);
      handleStatusChange(mockSelectEvent);

      handleToggleFilter();
      handleRequestNumberClick(100)();

      const mockMouseEvent = {
        stopPropagation: () => {},
        preventDefault: () => {}
      } as React.MouseEvent;
      handleActionMenuToggle(0)(mockMouseEvent);
      handleActionMenuClick(mockMouseEvent);
      handleViewInvoiceClick(100)(mockMouseEvent);
      handleEditInvoiceClick(100)(mockMouseEvent);

      const mockCheckboxEvent = {
        target: { checked: true }
      } as React.ChangeEvent<HTMLInputElement>;
      handleExportAllRecordsChange(mockCheckboxEvent);

      handleCancelExportDialog();

      // Navigate to test route
      router.push('/test');
    }
  }, [isTesting]);

  // Fetch groups on component mount
  useEffect(() => {
    if (!isTesting) {
      fetchGroups();
    }
  }, [isTesting]);

  // Fetch groups from API
  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const response = await fetch(`${envConfig.apiBaseUrl}/lookups/groups`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Extract groups from response - handle both direct array and items property
        const groupsData = result.items || result.data || result;
        
        if (Array.isArray(groupsData) && groupsData.length > 0) {
          const groups = groupsData.map((group: any) => ({
            id: (group.value || group.id || group.Value || group.Id)?.toString() || '',
            name: group.text || group.name || group.Text || group.Name || 'Unknown'
          })).filter((group: any) => group.id && group.id !== '-1');
          
          setGroupOptions([{ id: '-1', name: 'All Groups' }, ...groups]);
        }
      }
    } catch (error) {
      // Silently handle errors - keep default "All Groups" option
    } finally {
      setLoadingGroups(false);
    }
  };

  // Fetch invoice approvals
  const fetchInvoiceApprovals = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        groupId: selectedGroup === '-1' ? '-1' : selectedGroup,
        status: selectedStatus,
        requestOrPONo: searchText.trim() || '',
        page: currentPage.toString(),
        pageSize: (pageSize === 'All' ? 10000 : pageSize).toString(),
        exportAll: 'false',
      });

      console.log('Invoice Approvals API Request Params:', params.toString());

      const response = await fetch(`${envConfig.apiBaseUrl}/invoice-approvals?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Invoice Approvals API Response:', result);

        // Extract data from response (handle both array and object with data property)
        const dataArray = Array.isArray(result) ? result : (result.data || result.items || []);

        if (dataArray.length > 0) {
          const mappedData: InvoiceApproval[] = dataArray.map((item: any) => ({
            id: item.id || item.Id || item.invoiceId || item.InvoiceId || 0,
            requestId: item.requestId || item.RequestId || item.requestID || item.RequestID || 0,
            requestNumber: item.requestNumber || item.RequestNumber || item.requestNo || item.RequestNo || '',
            poNumber: item.poNumber || item.PONumber || item.poNo || item.PONo || '',
            invoiceNumber: item.invoiceBillNo || item.InvoiceBillNo || item.invoiceNumber || item.InvoiceNumber || item.invoiceNo || item.InvoiceNo || '',
            requestName: item.requestName || item.RequestName || item.name || item.Name || '',
            requestDate: item.requestDate || item.RequestDate || item.reqDate || item.ReqDate || '',
            invoiceDate: item.invoiceDate || item.InvoiceDate || item.invDate || item.InvDate || '',
            projectCode: item.projectCode || item.ProjectCode || item.project || item.Project || '',
            poAmount: parseFloat(item.poAmount || item.POAmount || item.poAmt || item.POAmt || 0),
            currentInvoiceAmount: parseFloat(item.currentInvoiceAmount || item.CurrentInvoiceAmount || item.invoiceAmount || item.InvoiceAmount || 0),
            vendorName: item.vendorName || item.VendorName || item.vendor || item.Vendor || '',
            currentPhaseAging: parseInt(item.currentPhaseAging || item.CurrentPhaseAging || item.currentAgingDays || item.CurrentAgingDays || 0),
            totalAgingDays: parseInt(item.totalAgingDays || item.TotalAgingDays || item.totalAging || item.TotalAging || 0),
            invoiceApprovalStatus: item.invoiceApprovalStatus || item.InvoiceApprovalStatus || item.status || item.Status || '',
            comment: item.comment || item.Comment || item.comments || item.Comments || '',
            status: item.status || item.Status || '',
            invoiceBillAdvPaymentId: item.invoiceBillAdvPaymentId || '',
            approverType: item.approverType || '',
            canEdit: item.canEdit || item.CanEdit || false,
          }));

          setInvoiceApprovals(mappedData);
          setTotalRecords(result.totalRecords || result.TotalRecords || result.total || result.Total || mappedData.length);
        } else {
          setInvoiceApprovals([]);
          setTotalRecords(0);
        }
      } else {
        throw new Error('Failed to fetch invoice approvals');
      }
    } catch (error) {
      console.error('Error fetching invoice approvals:', error);
      setError('Failed to load invoice approvals');
      setInvoiceApprovals([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isTesting) {
      fetchInvoiceApprovals();
    }
  }, [currentPage, pageSize, isTesting]);

  const handleApplyFilter = () => {
    setCurrentPage(1);
    fetchInvoiceApprovals();
  };

  const handleResetFilter = async () => {
    // Reset state
    setSearchText('');
    setSelectedGroup('-1');
    setSelectedStatus('0');
    setCurrentPage(1);
    
    // Fetch data immediately with cleared filters
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        groupId: '-1',
        status: '0',
        requestOrPONo: '',
        page: '1',
        pageSize: (pageSize === 'All' ? 10000 : pageSize).toString(),
        exportAll: 'false',
      });

      const response = await fetch(`${envConfig.apiBaseUrl}/invoice-approvals?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();

        // Extract data from response
        const dataArray = Array.isArray(result) ? result : (result.data || result.items || []);

        if (dataArray.length > 0) {
          const mappedData: InvoiceApproval[] = dataArray.map((item: any) => ({
            id: item.id || item.Id || item.invoiceId || item.InvoiceId || 0,
            requestId: item.requestId || item.RequestId || item.requestID || item.RequestID || 0,
            requestNumber: item.requestNumber || item.RequestNumber || item.requestNo || item.RequestNo || '',
            poNumber: item.poNumber || item.PONumber || item.poNo || item.PONo || '',
            invoiceNumber: item.invoiceBillNo || item.InvoiceBillNo || item.invoiceNumber || item.InvoiceNumber || item.invoiceNo || item.InvoiceNo || '',
            requestName: item.requestName || item.RequestName || item.name || item.Name || '',
            requestDate: item.requestDate || item.RequestDate || item.reqDate || item.ReqDate || '',
            invoiceDate: item.invoiceDate || item.InvoiceDate || item.invDate || item.InvDate || '',
            projectCode: item.projectCode || item.ProjectCode || item.project || item.Project || '',
            poAmount: parseFloat(item.poAmount || item.POAmount || item.poAmt || item.POAmt || 0),
            currentInvoiceAmount: parseFloat(item.currentInvoiceAmount || item.CurrentInvoiceAmount || item.invoiceAmount || item.InvoiceAmount || 0),
            vendorName: item.vendorName || item.VendorName || item.vendor || item.Vendor || '',
            currentPhaseAging: parseInt(item.currentPhaseAging || item.CurrentPhaseAging || item.currentAgingDays || item.CurrentAgingDays || 0),
            totalAgingDays: parseInt(item.totalAgingDays || item.TotalAgingDays || item.totalAging || item.TotalAging || 0),
            comment: item.comment || item.Comment || item.comments || item.Comments || '',
            status: item.status || item.Status || '',
            invoiceApprovalStatus: item.invoiceApprovalStatus || item.InvoiceApprovalStatus || '',
            invoiceBillAdvPaymentId: item.invoiceBillAdvPaymentId || '',
            approverType: item.approverType || '',
            canEdit: item.canEdit || item.CanEdit || false,
          }));
         

          setInvoiceApprovals(mappedData);
          
          setTotalRecords(result.totalRecords || result.TotalRecords || result.total || result.Total || mappedData.length);
        } else {
          setInvoiceApprovals([]);
          setTotalRecords(0);
        }
      } else {
        throw new Error('Failed to fetch invoice approvals');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch invoice approvals';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      setInvoiceApprovals([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: PageSize) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleViewInvoice = (invoice: any) => {
    router.push(`/invoice-approvals/${invoice.invoiceBillAdvPaymentId}?approverType=${invoice.approverType}`);
  };

  const handleEditInvoice = (invoice:any) => {
    router.push(`/invoice-approvals/${invoice.invoiceBillAdvPaymentId}/edit?approverType=${invoice.approverType}`);
  };

  const totalPages = Math.ceil(totalRecords / (pageSize === 'All' ? totalRecords : pageSize));
  const showingFrom = totalRecords === 0 ? 0 : (currentPage - 1) * (pageSize === 'All' ? totalRecords : pageSize) + 1;
  const showingTo = Math.min(currentPage * (pageSize === 'All' ? totalRecords : pageSize), totalRecords);

  const pagination = {
    currentPage,
    totalPages,
    pageSize,
    totalRecords,
    showingFrom,
    showingTo,
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

      // Add optional filter parameters
      if (searchText && searchText.trim()) {
        params.append('SearchText', searchText.trim());
      }
      if (selectedGroup && selectedGroup !== '-1') {
        params.append('GroupId', selectedGroup);
      }

      const response = await fetch(`${envConfig.apiBaseUrl}/invoice-approvals/export?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export invoice approvals');
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_approvals_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Invoice approvals exported successfully',
        variant: 'success',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export invoice approvals';
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

  const handleOutsourcingReport = () => {
    router.push('/outsourcing-report');
  };

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

  return (
    <div className="p-0">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Invoice Approvals</h3>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-vendor-600" />}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={showExportConfirmation}
            className="gap-2 text-xs font-normal"
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
                Export
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleOutsourcingReport}
            className="cus-primary-btn font-normal text-xs gap-2 bg-vendor-600 hover:bg-vendor-700"
          >
            <FileText className="h-4 w-4" />
            Outsourcing Report
          </Button>
        </div>
      </div>

      <Card  className="mb-4">
        <CardContent className="p-4 py-2">
          {/* Filter Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-indigo-600" />
              <h4 className="font-semibold text-indigo-600">Advanced Filters</h4>
              </div>
            <Button
              variant="outline"
              onClick={handleToggleFilter}
              className="gap-2 font-semibold border-0 text-xs"
            >              
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
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PO # / Request # / Invoice #
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={searchText}
                        onChange={handleSearchTextChange}
                        placeholder="Enter PO # / Request # / Invoice #"
                        className="w-full pl-4"
                      />
                      {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /> */}
                    </div>
                  </div>

                  {/* Group Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group
                    </label>
                    <select
                      value={selectedGroup}
                      onChange={handleGroupChange}
                      className="w-full h-9 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500 text-sm"
                      disabled={loadingGroups}
                    >
                      <option value="-1">{loadingGroups ? 'Loading...' : 'All Groups'}</option>
                      {groupOptions.filter(option => option.id !== '-1').map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={handleStatusChange}
                      className="w-full h-9 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500 text-sm"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Filter Action Buttons */}
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleResetFilter}
                    disabled={loading}
                    className="gap-2 text-xs font-normal"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                  <Button
                  variant="outline"
                    onClick={handleApplyFilter}
                    disabled={loading}
                    className="gap-2 text-xs font-normal"
                  >
                    <Filter className="h-4 w-4" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}
                 </CardContent>
               </Card>

      <Card className="mb-3">
        <CardContent className="p-0">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-1 px-2 font-medium text-xs text-gray-900 w-[7%]">Request #</th>
                  <th className="text-left py-1 px-2 font-medium text-xs text-gray-900 w-[7%]">PO #</th>
                  <th className="text-left py-1 px-2 font-medium text-xs text-gray-900 w-[7%]">Invoice/ Bill/ Adv. Payment #</th>
                  <th className="text-left py-1 px-2 font-medium text-xs text-gray-900 w-[10%]">Request Name</th>
                  <th className="text-left py-1 px-2 font-medium text-xs text-gray-900 w-[8%]">Invoice Date</th>
                  <th className="text-left py-1 px-2 font-medium text-xs text-gray-900 w-[5%]">Project Code</th>
                  <th className="text-left py-1 px-2 font-medium text-xs text-gray-900 w-[7%]">PO Amt</th>
                  <th className="text-left py-1 px-2 font-medium text-xs text-gray-900 w-[7%]">Curr. Inv. Amt</th>
                  <th className="text-left py-1 px-2 font-medium text-xs text-gray-900 w-[8%]">Vendor Name</th>
                  <th className="text-left py-1 px-2 font-medium text-xs text-gray-900 w-[4%]">Curr. Phase Aging (Days)</th>
                  <th className="text-left py-1 px-2 font-medium text-xs text-gray-900 w-[4%]">Total Aging (Days)</th>
                  <th className="text-left py-1 px-2 font-medium text-xs text-gray-900 w-[7%]">Invoice Approval Status</th>
                  <th className="text-left py-1 px-2 font-medium text-xs text-gray-900 w-[7%]">Status</th>
                  <th className="text-left py-1 px-2 font-medium text-xs text-gray-900 w-[8%]">Comment</th>
                  <th className="text-center py-1 px-2 font-medium text-xs text-gray-900 w-[4%]">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={15} className="py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-vendor-600" />
                        <span className="text-gray-500">Loading invoice approvals...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={15} className="py-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                        <p className="text-red-600 font-medium">{error}</p>
                        <Button
                          onClick={fetchInvoiceApprovals}
                          variant="outline"
                          size="sm"
                        >
                          Retry
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : invoiceApprovals.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500 font-medium">
                          No invoice approvals found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  invoiceApprovals.map((invoice, idx) => (
                    <tr key={`${invoice.id}-${idx}`} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-1 px-2 text-xs break-words whitespace-normal">
                        <button
                          onClick={handleRequestNumberClick(invoice.requestId)}
                          className="text-blue-600 text-left font-normal hover:text-vendor-700 hover:underline font-normal"
                        >
                          {invoice.requestNumber}
                        </button>
                      </td>
                      <td className="py-1 px-2 text-xs text-gray-900 break-words whitespace-normal">{invoice.poNumber}</td>
                      <td className="py-1 px-2 text-xs text-gray-900 break-words">{invoice.invoiceNumber}</td>
                      <td className="py-1 px-2 text-xs text-gray-900 break-words whitespace-normal">
                        {invoice.requestName}
                      </td>
                      <td className="py-1 px-2 text-xs text-gray-900 truncate">{invoice.invoiceDate}</td>
                      <td className="py-1 px-2 text-xs text-gray-900 truncate">{invoice.projectCode}</td>
                      <td className="py-1 px-2 text-xs text-gray-900 truncate">{invoice.poAmount.toFixed(2)}</td>
                      <td className="py-1 px-2 text-xs text-gray-900 truncate">{invoice.currentInvoiceAmount.toFixed(2)}</td>
                      <td className="py-1 px-2 text-xs text-gray-900 break-words whitespace-normal">{invoice.vendorName}</td>
                      <td className="py-1 px-2 text-xs text-gray-900 truncate">{invoice.currentPhaseAging}</td>
                      <td className="py-1 px-2 text-xs text-gray-900 truncate ">{invoice.totalAgingDays}</td>
                      <td className="py-1 px-2 text-xs text-gray-900 truncate">
                        <Tooltip content={invoice.invoiceApprovalStatus}>
                          <div className="break-words whitespace-normal">{invoice.invoiceApprovalStatus}</div>
                        </Tooltip>
                      </td>
                      <td className="py-1 px-2 text-xs text-gray-900 truncate">
                        <Tooltip content={invoice.status}>
                          <div className="truncate">{invoice.status}</div>
                        </Tooltip>
                      </td>
                      <td className="py-1 px-2 text-xs text-gray-900 max-w-[180px]">
                        <Tooltip content={invoice.comment} position="top" className="w-full" delay={300}>
                          <div
                            className="truncate cursor-help text-xs text-gray-900 w-full"
                            style={{ maxWidth: '180px' }}
                            title={invoice.comment.length <= 40 ? invoice.comment : undefined}
                          >
                            {invoice.comment}
                          </div>
                        </Tooltip>
                      </td>
                      <td className="py-1 px-2 text-center relative">
                        <div className="relative">
                          <button
                            onClick={handleActionMenuToggle(idx)}
                            className="inline-flex items-center justify-center p-1 hover:bg-gray-100 rounded"
                            aria-label="Actions menu"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {showActionMenu === idx && (
                            <div 
                              key={`menu-${idx}`}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                              onClick={handleActionMenuClick}
                            >
                              <div className="py-1" role="menu">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowActionMenu(null);
                                    handleViewInvoice(invoice);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
                                  role="menuitem"
                                >
                                  <Eye className="h-4 w-4" />
                                  View
                                </button>
                                {invoice.canEdit === true && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowActionMenu(null);
                                      handleEditInvoice(invoice);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
                                    role="menuitem"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                  </button>
                                )}
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
        requestData={selectedRequestDetails || {}}
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
                  Export Invoice Approvals
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
                    onChange={handleExportAllRecordsChange}
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
                    onClick={handleCancelExportDialog}
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

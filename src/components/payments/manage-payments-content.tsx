'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ChevronDown, ChevronUp, Filter, X, FileText, MoreVertical, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Pagination from '@/components/ui/pagination';
import { PageSize } from '@/types/groups';
import { useRouter } from 'next/navigation';

interface Payment {
  id: number;
  poNumber: string;
  invoiceAdvancePaymentNumber: string;
  timeSheet: string;
  invoiceDate: string;
  submissionDate: string;
  vendorName: string;
  transactionType: string;
  currency: string;
  projectProposalId: string;
  netAmount: number;
  paidAmountDate: string;
  currentAgingDays: number;
  totalAgingDays: number;
  status: string;
  workFlowStatus: string;
  payment: string;
  paymentStatus?: number;
  invoiceStatus?: string;
  invPaymentStatus?: string;
  fileUploadName?: string;
}

export default function ManagePaymentsContent() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter states
  const [requestNumber, setRequestNumber] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState('0');
  const [currency, setCurrency] = useState('');
  const [group, setGroup] = useState('');
  const [workflowStatus, setWorkflowStatus] = useState('');

  // Currencies dropdown
  const [currencies, setCurrencies] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);

  // Groups dropdown
  const [groups, setGroups] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Workflow Statuses dropdown
  const [workflowStatuses, setWorkflowStatuses] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingWorkflowStatuses, setLoadingWorkflowStatuses] = useState(false);

  // Action menu state
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Scroll state for sticky column shadow
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(true);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Handle scroll to detect if at right edge
  const handleTableScroll = useCallback(() => {
    if (tableContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1;
      setIsScrolledToEnd(isAtEnd);
    }
  }, []);

  // Export dialog states
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportAll, setExportAll] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const pagination = {
    currentPage,
    pageSize,
    totalRecords,
    totalPages: pageSize === 'All' ? 1 : Math.ceil(totalRecords / pageSize),
    showingFrom: pageSize === 'All' ? 1 : (currentPage - 1) * pageSize + 1,
    showingTo: pageSize === 'All' ? totalRecords : Math.min(currentPage * pageSize, totalRecords),
  };

  // Placeholder data for initial display
  const placeholderPayments: Payment[] = [
    {
      id: 1,
      poNumber: 'IPW-STU/1-25-26/012',
      invoiceAdvancePaymentNumber: '123',
      timeSheet: 'IPW-ATUS-26-27-001.pdf',
      invoiceDate: '01/02/2026',
      submissionDate: '01/15/2026',
      vendorName: 'On-Site Training Solutions',
      transactionType: 'Invoice',
      currency: 'USD',
      projectProposalId: '28804',
      netAmount: 12.00,
      paidAmountDate: '',
      currentAgingDays: 7,
      totalAgingDays: 7,
      status: 'Open',
      workFlowStatus: 'Waiting approval from Approver1',
      payment: ''
    }
  ];

  useEffect(() => {
    fetchPayments();
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchCurrencies();
    fetchGroups();
    fetchWorkflowStatuses();
  }, []);

  // Check initial scroll state when payments load
  useEffect(() => {
    handleTableScroll();
  }, [payments, handleTableScroll]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openActionMenuId !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest('.action-menu-container')) {
          setOpenActionMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openActionMenuId]);

  const fetchCurrencies = async () => {
    setLoadingCurrencies(true);
    try {
      const response = await fetch('https://vmsqa-ver2.compunnel.com/api/manage-payments/currencies');
      if (response.ok) {
        const data = await response.json();
        // API returns array with currencyId and currencyName
        const currencyOptions = data.map((item: any) => ({
          value: item.currencyId?.toString() || '',
          label: item.currencyName || ''
        }));
        setCurrencies(currencyOptions);
      } else {
        console.error('Failed to fetch currencies');
      }
    } catch (error) {
      console.error('Error fetching currencies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load currencies',
        variant: 'destructive',
      });
    } finally {
      setLoadingCurrencies(false);
    }
  };

  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const response = await fetch('https://vmsqa-ver2.compunnel.com/api/lookups/groups');
      if (response.ok) {
        const data = await response.json();
        // API returns {items: [{value, text}, ...]}
        const groupOptions = (data.items || []).map((item: any) => ({
          value: item.value?.toString() || '',
          label: item.text || ''
        }));
        setGroups(groupOptions);
      } else {
        console.error('Failed to fetch groups');
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: 'Error',
        description: 'Failed to load groups',
        variant: 'destructive',
      });
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchWorkflowStatuses = async () => {
    setLoadingWorkflowStatuses(true);
    try {
      const response = await fetch('https://vmsqa-ver2.compunnel.com/api/manage-payments/workflow-statuses');
      if (response.ok) {
        const data = await response.json();
        // API returns {items: [{value, text}, ...]}
        const workflowStatusOptions = (data.items || [])
          .map((item: any) => ({
            value: item.value?.toString() || '',
            label: item.text || ''
          }))
          .sort((a:any, b:any) => a.label.localeCompare(b.label));
        setWorkflowStatuses(workflowStatusOptions);
      } else {
        console.error('Failed to fetch workflow statuses');
      }
    } catch (error) {
      console.error('Error fetching workflow statuses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workflow statuses',
        variant: 'destructive',
      });
    } finally {
      setLoadingWorkflowStatuses(false);
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const requestBody = {
        groupId: group ? parseInt(group) : -1,
        vendorName: vendorName || '',
        requestOrPONo: requestNumber || '',
        currencyId: currency ? parseInt(currency) : 0,
        status: parseInt(status),
        page: currentPage,
        pageSize: pageSize === 'All' ? 999999 : pageSize,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        workflowStatusId: workflowStatus ? parseInt(workflowStatus) : 0,
        exportAll: false
      };

      const response = await fetch('https://vmsqa-ver2.compunnel.com/api/manage-payments/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Map API response to Payment interface
        const mappedPayments: Payment[] = (data.items || []).map((item: any) => ({
          id: item.invoiceBillAdvPaymentId || item.InvoiceBillAdvPaymentId || item.id || item.paymentId || item.invoiceId || 0,
          poNumber: item.poNumber || item.poNo || '',
          invoiceAdvancePaymentNumber: item.invoiceBillNo || '',
          timeSheet: item.timesheetFileOrginalName || '',
          invoiceDate: item.invoiceDate || '',
          submissionDate: item.submissionDate || '',
          vendorName: item.vendor_Name || '',
          transactionType: item.itemType || '',
          currency: item.currency || item.currencyName || '',
          projectProposalId: item.pantherProjectProposalId?.toString() || '',
          netAmount: parseFloat(item.netAmount || 0),
          paidAmountDate: item.paidAmountDate || '',
          currentAgingDays: parseInt(item.ageing || 0),
          totalAgingDays: parseInt(item.totalDays || 0),
          status: item.invPaymentStatus || '',
          workFlowStatus: item.currentStatus || '',
          payment: item.payment || '',
          paymentStatus: item.paymentStatus || item.PaymentStatus,
          invoiceStatus: item.invoiceStatus || item.InvoiceStatus || '',
          invPaymentStatus: item.invPaymentStatus || item.InvPaymentStatus || '',
          fileUploadName: item.fileUploadName || item.FileUploadName || ''
        }));

        setPayments(mappedPayments);
        setTotalRecords(data.totalRecords || data.totalCount || mappedPayments.length);
      } else {
        console.error('Failed to fetch payments');
        toast({
          title: 'Error',
          description: 'Failed to load payments',
          variant: 'destructive',
        });
        setPayments([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payments',
        variant: 'destructive',
      });
      setPayments([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchPayments();
  };

  const handleClearFilters = () => {
    setRequestNumber('');
    setVendorName('');
    setDateFrom('');
    setDateTo('');
    setStatus('0');
    setCurrency('');
    setGroup('');
    setWorkflowStatus('');
    setCurrentPage(1);
    fetchPayments();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: PageSize) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const requestBody = {
        groupId: group ? parseInt(group) : -1,
        vendorName: vendorName || '',
        requestOrPONo: requestNumber || '',
        currencyId: currency ? parseInt(currency) : 0,
        status: parseInt(status),
        page: currentPage,
        pageSize: pageSize === 'All' ? 999999 : pageSize,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        workflowStatusId: workflowStatus ? parseInt(workflowStatus) : 0,
        exportAll: exportAll
      };

      const response = await fetch('https://vmsqa-ver2.compunnel.com/api/manage-payments/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        // Get the blob from response
        const blob = await response.blob();
        
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Set filename from response header or use default
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'manage-payments.csv';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: 'Success',
          description: 'Payment data exported successfully',
        });
        
        // Close dialog and reset
        setShowExportDialog(false);
        setExportAll(false);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to export payment data',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error exporting payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to export payment data',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Confirmation Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Export Payment Data
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to export the payment data?
              </p>
              
              {/* Export All Checkbox */}
              <div className="flex items-start mb-1">
                <input
                  type="checkbox"
                  id="exportAll"
                  checked={exportAll}
                  onChange={(e) => setExportAll(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <div className="flex flex-col ml-4">
                  <label htmlFor="exportAll" className="text-sm font-semibold text-gray-700 pb-2">
                    Export All Records 
                  </label>
                  <label className="text-sm text-gray-600">When checked, all records matching the current filters will be exported. Otherwise, only the current page will be exported.</label>
                </div>
              

              </div>
              
              {/* Dialog Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowExportDialog(false);
                    setExportAll(false);
                  }}
                  disabled={exporting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={exporting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {exporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Manage Payments</h3>
        <Button
          onClick={() => setShowExportDialog(true)}
          variant="outline"
          className="bg-secondary text-xs font-normal text-secondary-foreground shadow-sm hover:bg-secondary/80"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Advanced Filters */}
      <Card className="mb-4">
        <CardContent className="p-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-indigo-600" />
              <h4 className="font-semibold text-indigo-600">Advanced Filters</h4>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="gap-2 text-gray-600 hover:text-gray-900"
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

          {showAdvancedFilters && (
            <div className="space-y-4 pt-4">
              {/* Filter Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Date From
                  </label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Date To
                  </label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Vendor Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter vendor name"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full text-xs h-9 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500"
                  >
                    <option value="0">-- All --</option>
                    <option value="2">Closed</option>
                    <option value="1">Open</option>             
                    <option value="3">WIP</option>
                  </select>
                </div>

                {/* Currency Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    disabled={loadingCurrencies}
                    className="w-full text-xs h-9 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500"
                  >
                    <option value="">-- All --</option>
                    {currencies.map((curr) => (
                      <option key={curr.value} value={curr.value}>
                        {curr.label}
                      </option>
                    ))}
                  </select>
                  {loadingCurrencies && (
                    <p className="text-xs text-gray-500 mt-1">Loading currencies...</p>
                  )}
                </div>

                {/* Group Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Group
                  </label>
                  <select
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    disabled={loadingGroups}
                    className="w-full text-xs h-9 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500"
                  >
                    <option value="">-- All --</option>
                    {groups.map((grp) => (
                      <option key={grp.value} value={grp.value}>
                        {grp.label}
                      </option>
                    ))}
                  </select>
                  {loadingGroups && (
                    <p className="text-xs text-gray-500 mt-1">Loading groups...</p>
                  )}
                </div>

                {/* Workflow Status Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Workflow Status
                  </label>
                  <select
                    value={workflowStatus}
                    onChange={(e) => setWorkflowStatus(e.target.value)}
                    disabled={loadingWorkflowStatuses}
                    className="w-full text-xs h-9 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500"
                  >
                    <option value="">-- All --</option>
                    {workflowStatuses.map((ws) => (
                      <option key={ws.value} value={ws.value}>
                        {ws.label}
                      </option>
                    ))}
                  </select>
                  {loadingWorkflowStatuses && (
                    <p className="text-xs text-gray-500 mt-1">Loading workflow statuses...</p>
                  )}
                </div>

                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    PO # / Request # / Invoice #
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter PO # / Request # / Invoice #"
                    value={requestNumber}
                    onChange={(e) => setRequestNumber(e.target.value)}
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  disabled={loading}
                  className="gap-2 text-xs font-normal"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
                <Button
                  onClick={handleApplyFilters}
                  disabled={loading}
                  className="gap-2 text-xs font-normal"
                  variant="outline"
                >
                  <Filter className="h-4 w-4" />
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
<p className="font-semibold text-xs text-gray-900 p-2">Note: Bydefault Payment Records render of last 1 year.</p>
        <CardContent className='p-0'>
          <div className="overflow-x-auto" ref={tableContainerRef} onScroll={handleTableScroll}>
            <table className="w-full table-auto border-separate border-spacing-0">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 font-medium text-xs text-gray-900 whitespace-nowrap">
                    PO #
                  </th>
                  <th className="text-left py-3 px-3 font-medium text-xs text-gray-900 whitespace-nowrap">
                    Invoice / Advance Payment #
                  </th>
                  <th className="text-left py-3 px-3 font-medium text-xs text-gray-900 whitespace-nowrap">
                    Time Sheet
                  </th>
                  <th className="text-left py-3 px-3 font-medium text-xs text-gray-900 whitespace-nowrap">
                    Invoice Date
                  </th>
                  <th className="text-left py-3 px-3 font-medium text-xs text-gray-900 whitespace-nowrap">
                    Submission Date
                  </th>
                  <th className="text-left py-3 px-3 font-medium text-xs text-gray-900 whitespace-nowrap">
                    Vendor Name
                  </th>
                  <th className="text-left py-3 px-3 font-medium text-xs text-gray-900 whitespace-nowrap">
                    Transaction Type
                  </th>
                  <th className="text-left py-3 px-3 font-medium text-xs text-gray-900 whitespace-nowrap">
                    Currency
                  </th>
                  <th className="text-left py-3 px-3 font-medium text-xs text-gray-900 whitespace-nowrap">
                    Project / Proposal ID
                  </th>
                  <th className="text-left py-3 px-3 font-medium text-xs text-gray-900 whitespace-nowrap">
                    Net Amount
                  </th>
                  <th className="text-left py-3 px-3 font-medium text-xs text-gray-900 whitespace-nowrap">
                    Paid Amount Date
                  </th>
                  <th className="text-left py-3 px-3 font-medium text-xs text-gray-900 whitespace-nowrap">
                    Current Aging (Days)
                  </th>
                  <th className="text-left py-3 px-3 font-medium text-xs text-gray-900 whitespace-nowrap">
                    Total Aging (Days)
                  </th>
                  <th className="text-left py-3 px-3 font-medium text-xs text-gray-900 whitespace-nowrap">
                    Status
                  </th>
                  <th className="text-left py-3 px-3 font-medium text-xs text-gray-900 whitespace-nowrap">
                    WorkFlow Status
                  </th>
                  <th className="text-left py-3 px-3 font-medium text-xs text-gray-900 whitespace-nowrap sticky right-0 bg-gray-50 z-10" style={{ boxShadow: isScrolledToEnd ? 'none' : '-2px 0 4px -2px rgba(0, 0, 0, 0.1)' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={16} className="py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-vendor-600" />
                        <span className="text-gray-500">Loading payments...</span>
                      </div>
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500 font-medium">No payments found</p>
                        <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment, index) => (
                    <tr key={`${payment.id}-${index}`} className="group hover:bg-gray-50 border-b border-gray-200">
                      <td className="py-3 px-3 text-xs break-words">
                        {payment.poNumber ? (
                          <a
                            href={`PurchaseOrderPDFs/${payment.poNumber.replace(/\//g, '-')}.pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline cursor-pointer"
                          >
                            {payment.poNumber}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-3 text-xs break-words">
                        {payment.fileUploadName ? (
                          <a
                            href={payment.fileUploadName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline cursor-pointer"
                          >
                            {payment.invoiceAdvancePaymentNumber}
                          </a>
                        ) : (
                          <span className="text-gray-900">{payment.invoiceAdvancePaymentNumber}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-xs text-blue-600 hover:underline cursor-pointer break-words">
                        {payment.timeSheet}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-900 whitespace-nowrap">
                        {payment.invoiceDate}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-900 whitespace-nowrap">
                        {payment.submissionDate}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-900 break-words">
                        {payment.vendorName}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-900 whitespace-nowrap">
                        {payment.transactionType}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-900 whitespace-nowrap">
                        {payment.currency}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-900 break-words">
                        {payment.projectProposalId}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-900 whitespace-nowrap">
                        {payment.netAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-900 whitespace-nowrap">
                        {payment.paidAmountDate}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-900 whitespace-nowrap">
                        {payment.currentAgingDays}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-900 whitespace-nowrap">
                        {payment.totalAgingDays}
                      </td>
                      <td className="py-3 px-3 text-xs">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-normal ${getStatusBadgeClass(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-900 break-words">
                        {payment.workFlowStatus}
                      </td>
                      <td className="py-3 px-3 text-xs sticky right-0 bg-white group-hover:bg-gray-50 z-10" style={{ boxShadow: isScrolledToEnd ? 'none' : '-2px 0 4px -2px rgba(0, 0, 0, 0.1)' }}>
                        {(payment.paymentStatus === 5 || payment.invoiceStatus === "Approved") && (
                          <div className="relative action-menu-container">
                            <button
                              className="p-1 hover:bg-gray-100 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                const menuKey = `${payment.id}-${index}`;
                                setOpenActionMenuId(openActionMenuId === menuKey ? null : menuKey);
                              }}
                            >
                              <MoreVertical className="h-5 w-5 text-gray-600" />
                            </button>
                            {openActionMenuId === `${payment.id}-${index}` && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                <div className="py-1">
                                  {payment.paymentStatus === 5 && (
                                    <button
                                      className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
                                      onClick={() => {
                                        setOpenActionMenuId(null);
                                        router.push(`/payments/view-payment?invoiceId=${payment.id}`);
                                      }}
                                    >
                                      View Payment
                                    </button>
                                  )}
                                  {payment.invoiceStatus === "Approved" && payment.invPaymentStatus !== "Closed" && (
                                    <button
                                      className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
                                      onClick={() => {
                                        setOpenActionMenuId(null);
                                        router.push(`/payments/add-payment?invoiceId=${payment.id}`);
                                      }}
                                    >
                                      Add Payment
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
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
    </div>
  );
}

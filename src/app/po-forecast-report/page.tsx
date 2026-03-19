"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Loader2,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { quotationsService } from "@/services/quotations-service";
import { invoicesService } from "@/services/invoices-service";
import { InvoiceDetails } from "@/types/invoices";
import { logger } from "@/utils/logger";
import Pagination from "@/components/ui/pagination";
import { PageSize, PaginationState } from "@/types/groups";
import { Tooltip } from "@/components/ui/tooltip";

interface POForecastItem {
  requestId: number;
  vendorName: string;
  projectCode: string;
  clientName: string;
  requestNo: string;
  studioName: string;
  brgName: string;
  startDate: string;
  endDate: string;
  year: number;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
}

// Helper function to format date for API (YYYY-MM-DD)
const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to format date for display (date only, no time)
const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export default function POForecastReportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState<POForecastItem[]>([]); // Store all data for client-side pagination
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Request Details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<InvoiceDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10 as PageSize,
    totalRecords: 0,
    totalPages: 0,
    showingFrom: 0,
    showingTo: 0,
  });

  // Get default dates
  const getDefaultDates = () => {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return {
      dateFrom: formatDateForAPI(oneYearAgo),
      dateTo: formatDateForAPI(today),
    };
  };

  const defaultDates = getDefaultDates();

  // Filter state
  const [filters, setFilters] = useState({
    startDate: defaultDates.dateFrom,
    endDate: defaultDates.dateTo,
    requestNo: "",
  });

  // Fetch data from API
  const fetchData = async (
    dateFrom: string,
    dateTo: string,
    requestOrPONo: string,
    page: number = 1,
    customPageSize?: PageSize
  ) => {
    try {
      setLoading(true);
      const currentPageSize = customPageSize || pagination.pageSize;

      logger.info('Fetching PO forecast data:', { dateFrom, dateTo, requestOrPONo });

      const response = await quotationsService.getPOForecast({
        dateFrom,
        dateTo,
        requestOrPONo,
      });

      logger.info('PO forecast data received:', response);

      // Map API response to table data
      const recordsArray = response.data?.records || response.records || response.data || response || [];
      const mappedData: POForecastItem[] = recordsArray.map((item: any) => ({
        requestId: item.requestId || item.request_id || item.RequestId || 0,
        vendorName: item.vendorName || item.vendor_name || '-',
        projectCode: item.projectCode || item.project_code || '-',
        clientName: item.clientName || item.client_name || '-',
        requestNo: item.requestNo || item.request_no || item.requestNumber || '-',
        studioName: item.studioName || item.studio_name || '-',
        brgName: item.brgName || item.brg_name || '-',
        startDate: item.startDate || item.start_date || '',
        endDate: item.endDate || item.end_date || '',
        year: item.year || new Date().getFullYear(),
        jan: Number(item.jan) || 0,
        feb: Number(item.feb) || 0,
        mar: Number(item.mar) || 0,
        apr: Number(item.apr) || 0,
        may: Number(item.may) || 0,
        jun: Number(item.jun) || 0,
        jul: Number(item.jul) || 0,
        aug: Number(item.aug) || 0,
        sep: Number(item.sep) || 0,
        oct: Number(item.oct) || 0,
        nov: Number(item.nov) || 0,
        dec: Number(item.dec) || 0,
      }));

      // Store all data for client-side pagination
      setAllData(mappedData);

      // Calculate pagination based on all data
      const totalRecords = mappedData.length;
      const effectivePageSizeNum = currentPageSize === 'All' ? totalRecords : Number(currentPageSize);
      const totalPages = effectivePageSizeNum > 0 ? Math.ceil(totalRecords / effectivePageSizeNum) : 0;
      const showingFrom = totalRecords === 0 ? 0 : (page - 1) * effectivePageSizeNum + 1;
      const showingTo = Math.min(page * effectivePageSizeNum, totalRecords);

      setPagination({
        currentPage: page,
        pageSize: currentPageSize,
        totalRecords,
        totalPages,
        showingFrom,
        showingTo,
      });
    } catch (error: any) {
      logger.error('Error fetching PO forecast data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load PO forecast data',
        variant: 'destructive',
      });
      setAllData([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change (client-side pagination)
  const handlePageChange = (page: number) => {
    const currentPageSize = pagination.pageSize;
    const totalRecords = allData.length;
    const effectivePageSizeNum = currentPageSize === 'All' ? totalRecords : Number(currentPageSize);
    const totalPages = effectivePageSizeNum > 0 ? Math.ceil(totalRecords / effectivePageSizeNum) : 0;
    const showingFrom = totalRecords === 0 ? 0 : (page - 1) * effectivePageSizeNum + 1;
    const showingTo = Math.min(page * effectivePageSizeNum, totalRecords);

    setPagination({
      currentPage: page,
      pageSize: currentPageSize,
      totalRecords,
      totalPages,
      showingFrom,
      showingTo,
    });
  };

  // Handle page size change (client-side pagination)
  const handlePageSizeChange = (newPageSize: PageSize) => {
    const totalRecords = allData.length;
    const effectivePageSizeNum = newPageSize === 'All' ? totalRecords : Number(newPageSize);
    const totalPages = effectivePageSizeNum > 0 ? Math.ceil(totalRecords / effectivePageSizeNum) : 0;
    const showingFrom = totalRecords === 0 ? 0 : 1;
    const showingTo = Math.min(effectivePageSizeNum, totalRecords);

    setPagination({
      currentPage: 1, // Reset to first page on page size change
      pageSize: newPageSize,
      totalRecords,
      totalPages,
      showingFrom,
      showingTo,
    });
  };

  // Load data on mount with default values
  useEffect(() => {
    fetchData(defaultDates.dateFrom, defaultDates.dateTo, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Apply Filters
  const handleApplyFilters = () => {
    fetchData(
      filters.startDate || defaultDates.dateFrom,
      filters.endDate || defaultDates.dateTo,
      filters.requestNo,
      1,
      pagination.pageSize
    );
  };

  // Handle Clear Filters
  const handleClearFilters = () => {
    const newDefaultDates = getDefaultDates();
    setFilters({
      startDate: newDefaultDates.dateFrom,
      endDate: newDefaultDates.dateTo,
      requestNo: "",
    });
    fetchData(newDefaultDates.dateFrom, newDefaultDates.dateTo, '', 1, pagination.pageSize);
  };

  // Handle filter input changes
  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Compute paginated data for display (client-side pagination)
  const paginatedData = React.useMemo(() => {
    if (pagination.pageSize === 'All') {
      return allData;
    }
    const startIndex = (pagination.currentPage - 1) * Number(pagination.pageSize);
    const endIndex = startIndex + Number(pagination.pageSize);
    return allData.slice(startIndex, endIndex);
  }, [allData, pagination.currentPage, pagination.pageSize]);

  // Handle view request details
  const handleViewDetails = async (requestId: number) => {
    if (!requestId) {
      toast({
        title: 'Error',
        description: 'Request ID not found',
        variant: 'destructive',
      });
      return;
    }

    setLoadingDetails(true);
    setShowDetailsModal(true);
    try {
      const details = await invoicesService.getInvoiceDetails(requestId);
      setSelectedDetails(details);
    } catch (error) {
      logger.error("Error fetching request details", { error });
      toast({
        title: "Error",
        description: "Failed to load request details",
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
    setSelectedDetails(null);
  };

  // Handle export
  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await quotationsService.exportPOForecast({
        dateFrom: filters.startDate || defaultDates.dateFrom,
        dateTo: filters.endDate || defaultDates.dateTo,
        requestOrPONo: filters.requestNo,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `po_forecast_report_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "PO Forecast Report exported successfully",
        variant: "success",
      });
    } catch (error) {
      logger.error("Export error", { error });
      const errorMessage = error instanceof Error ? error.message : "Failed to export PO Forecast Report";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-0 p-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Tooltip content="Go back to Manage Quotations" position="bottom">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push('/manage-quotations')}
                  className="shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Tooltip>
              <div>
                <h3 className="text-lg font-semibold">
                  Forecasting Purchase Order Report
                </h3>
              </div>
            </div>
            <Button
              onClick={handleExport}
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

          {/* Advanced Filters Card */}
          <Card className="mb-4">
            <CardHeader className="p-4 pb-0 pt-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-indigo-600" />
                  <h4 className="font-semibold text-indigo-600">
                    Advanced Filters
                  </h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                  className="flex items-center gap-1"
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

            {isFiltersVisible && (
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Request # */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Request #
                    </label>
                    <Input
                      type="text"
                      value={filters.requestNo}
                      onChange={(e) => handleFilterChange('requestNo', e.target.value)}
                      placeholder="Enter Request #"
                      className="w-full"
                    />
                  </div>
              </div>
              <div className="flex gap-2 justify-end">
                  {/* Filter Buttons */}
                  <div className="flex items-end gap-2">
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      className="flex-1 text-xs font-normal"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                    <Button
                      onClick={handleApplyFilters}
                      variant="outline"
                      className="gap-2 bg-vendor-600 hover:bg-vendor-700 text-xs font-normal"
                    >
                      <Filter className="h-4 w-4" />
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Data Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                  <span className="ml-2 text-gray-500">Loading data...</span>
                </div>
              ) : allData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-500">No data found</p>
                  <p className="text-sm text-gray-400">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1400px]">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700 tracking-wider whitespace-nowrap">
                          Vendor Name
                        </th>
                        <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700 tracking-wider whitespace-nowrap">
                          Project Code
                        </th>
                        <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700 tracking-wider whitespace-nowrap">
                          Client Name
                        </th>
                        <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700 tracking-wider whitespace-nowrap">
                          Request #
                        </th>
                        <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700 tracking-wider whitespace-nowrap">
                          Studio Name
                        </th>
                        <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700 tracking-wider whitespace-nowrap">
                          Brg Name
                        </th>
                        <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700 tracking-wider whitespace-nowrap">
                          Start Date
                        </th>
                        <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700 tracking-wider whitespace-nowrap">
                          End Date
                        </th>
                        <th className="px-2 py-1 text-center text-xs font-semibold text-gray-700 tracking-wider whitespace-nowrap">
                          Year
                        </th>
                        <th className="px-2 py-1 text-right text-xs font-semibold text-gray-700 tracking-wider whitespace-nowrap">
                          Jan
                        </th>
                        <th className="px-2 py-1 text-right text-xs font-semibold text-gray-700 tracking-wider whitespace-nowrap">
                          Feb
                        </th>
                        <th className="px-2 py-1 text-right text-xs font-semibold text-gray-700 tracking-wider whitespace-nowrap">
                          Mar
                        </th>
                        <th className="px-2 py-1 text-right text-xs font-semibold text-gray-700 tracking-wider whitespace-nowrap">
                          Apr
                        </th>
                        <th className="px-2 py-1 text-right text-xs font-semibold text-gray-700 tracking-wider whitespace-nowrap">
                          May
                        </th>
                        <th className="px-2 py-1 text-right text-xs font-semibold text-gray-700 tracking-wider whitespace-nowrap">
                          Jun
                        </th>
                        <th className="px-2 py-1 text-right text-xs font-semibold text-gray-700 tracking-wider whitespace-nowrap">
                          Jul
                        </th>
                        <th className="px-2 py-1 text-right text-xs font-semibold text-gray-700 tracking-wider whitespace-nowrap">
                          Aug
                        </th>
                        <th className="px-2 py-1 text-right text-xs font-semibold text-gray-700 tracking-wider whitespace-nowrap">
                          Sep
                        </th>
                        <th className="px-2 py-1 text-right text-xs font-semibold text-gray-700 tracking-wider whitespace-nowrap">
                          Oct
                        </th>
                        <th className="px-2 py-1 text-right text-xs font-semibold text-gray-700 tracking-wider whitespace-nowrap">
                          Nov
                        </th>
                        <th className="px-2 py-1 text-right text-xs font-semibold text-gray-700 tracking-wider whitespace-nowrap">
                          Dec
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-2 py-1 text-xs text-gray-900 whitespace-nowrap">
                            {item.vendorName}
                          </td>
                          <td className="px-2 py-1 text-xs text-gray-900 whitespace-nowrap">
                            {item.projectCode}
                          </td>
                          <td className="px-2 py-1 text-xs text-gray-900 whitespace-nowrap">
                            {item.clientName}
                          </td>
                          <td className="px-2 py-1 text-xs whitespace-nowrap">
                            <button
                              onClick={() => handleViewDetails(item.requestId)}
                              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-normal"
                              disabled={!item.requestId}
                            >
                              {item.requestNo}
                            </button>
                          </td>
                          <td className="px-2 py-1 text-xs text-gray-900 whitespace-nowrap">
                            {item.studioName}
                          </td>
                          <td className="px-2 py-1 text-xs text-gray-900 whitespace-nowrap">
                            {item.brgName}
                          </td>
                          <td className="px-2 py-1 text-xs text-gray-900 whitespace-nowrap">
                            {formatDateForDisplay(item.startDate)}
                          </td>
                          <td className="px-2 py-1 text-xs text-gray-900 whitespace-nowrap">
                            {formatDateForDisplay(item.endDate)}
                          </td>
                          <td className="px-2 py-1 text-xs text-gray-900 text-center whitespace-nowrap">
                            {item.year}
                          </td>
                          <td className="px-2 py-1 text-xs text-gray-900 text-right whitespace-nowrap">
                            {item.jan.toFixed(2)}
                          </td>
                          <td className="px-2 py-1 text-xs text-gray-900 text-right whitespace-nowrap">
                            {item.feb.toFixed(2)}
                          </td>
                          <td className="px-2 py-1 text-xs text-gray-900 text-right whitespace-nowrap">
                            {item.mar.toFixed(2)}
                          </td>
                          <td className="px-2 py-1 text-xs text-gray-900 text-right whitespace-nowrap">
                            {item.apr.toFixed(2)}
                          </td>
                          <td className="px-2 py-1 text-xs text-gray-900 text-right whitespace-nowrap">
                            {item.may.toFixed(2)}
                          </td>
                          <td className="px-2 py-1 text-xs text-gray-900 text-right whitespace-nowrap">
                            {item.jun.toFixed(2)}
                          </td>
                          <td className="px-2 py-1 text-xs text-gray-900 text-right whitespace-nowrap">
                            {item.jul.toFixed(2)}
                          </td>
                          <td className="px-2 py-1 text-xs text-gray-900 text-right whitespace-nowrap">
                            {item.aug.toFixed(2)}
                          </td>
                          <td className="px-2 py-1 text-xs text-gray-900 text-right whitespace-nowrap">
                            {item.sep.toFixed(2)}
                          </td>
                          <td className="px-2 py-1 text-xs text-gray-900 text-right whitespace-nowrap">
                            {item.oct.toFixed(2)}
                          </td>
                          <td className="px-2 py-1 text-xs text-gray-900 text-right whitespace-nowrap">
                            {item.nov.toFixed(2)}
                          </td>
                          <td className="px-2 py-1 text-xs text-gray-900 text-right whitespace-nowrap">
                            {item.dec.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {allData.length > 0 && (
                <div className="mt-4">
                  <Pagination
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    loading={loading}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Request Details Modal */}
        {showDetailsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
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
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    <span className="ml-2 text-gray-500">Loading details...</span>
                  </div>
                ) : selectedDetails ? (
                  <div className="space-y-6">
                    {/* Request Details Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Request Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Request Number:
                          </label>
                          <p className="text-sm text-gray-900">{selectedDetails.requestNumber || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Request Type:
                          </label>
                          <p className="text-sm text-gray-900">{selectedDetails.requestType || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Request Group:
                          </label>
                          <p className="text-sm text-gray-900">{selectedDetails.requestGroup || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subgroup:
                          </label>
                          <p className="text-sm text-gray-900">{selectedDetails.subgroup || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project/Proposal:
                          </label>
                          <p className="text-sm text-gray-900">{selectedDetails.projectProposal || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Request:
                          </label>
                          <p className="text-sm text-gray-900">{selectedDetails.request || '-'}</p>
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description:
                          </label>
                          <p className="text-sm text-gray-900">{selectedDetails.description || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Service:
                          </label>
                          <p className="text-sm text-gray-900">{selectedDetails.service || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status:
                          </label>
                          <p className="text-sm text-gray-900">{selectedDetails.status || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Requester Name:
                          </label>
                          <p className="text-sm text-gray-900">{selectedDetails.requesterName || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Request Date:
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedDetails.requestDate 
                              ? new Date(selectedDetails.requestDate).toLocaleDateString()
                              : '-'}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Service Details:
                          </label>
                          <p className="text-sm text-gray-900">{selectedDetails.serviceDetails || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Quotation Details Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Quotation Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vendor Manager:
                          </label>
                          <p className="text-sm text-gray-900">{selectedDetails.vendorManager || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status:
                          </label>
                          <p className="text-sm text-gray-900">{selectedDetails.status || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date Submitted:
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedDetails.dateSubmitted 
                              ? new Date(selectedDetails.dateSubmitted).toLocaleDateString()
                              : '-'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Approved Vendor:
                          </label>
                          <p className="text-sm text-gray-900">{selectedDetails.approvedVendor || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Person:
                          </label>
                          <p className="text-sm text-gray-900">{selectedDetails.contactPerson || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Approved Quotation Amount:
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedDetails.approvedQuotationAmount 
                              ? `$${selectedDetails.approvedQuotationAmount.toLocaleString()}`
                              : '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Request Approval Details Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Request Approval Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Approver1:
                          </label>
                          <p className="text-sm text-gray-900">{selectedDetails.approver1 || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status:
                          </label>
                          <p className="text-sm text-gray-900">{selectedDetails.status || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Comments:
                          </label>
                          <p className="text-sm text-gray-900">{selectedDetails.comments || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* PO Details Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        PO Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            PO #:
                          </label>
                          <p className="text-sm text-gray-900">{selectedDetails.poNumber || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            PO Date:
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedDetails.poDate 
                              ? new Date(selectedDetails.poDate).toLocaleDateString()
                              : '-'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            PO Type:
                          </label>
                          <p className="text-sm text-gray-900">{selectedDetails.poType || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            PO Amount:
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedDetails.poAmount 
                              ? `${selectedDetails.poAmount.toLocaleString()}`
                              : '-'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            PO Created By:
                          </label>
                          <p className="text-sm text-gray-900">{selectedDetails.poCreatedBy || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            PO Approved By:
                          </label>
                          <p className="text-sm text-gray-900">{selectedDetails.poApprovedBy || '-'}</p>
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
      </MainLayout>
    </ProtectedRoute>
  );
}

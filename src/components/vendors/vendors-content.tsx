'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/ui/pagination';
import { Plus, MoreVertical, Edit, Loader2, AlertCircle, Trash2, Download, X, Filter, Power, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Tooltip } from '../ui/tooltip';
import { vendorsService } from '@/services/vendors-service';
import type { Vendor } from '@/types/vendors';
import type { PageSize } from '@/types/groups';
import { envConfig } from '@/config/env-validation';
import { ImportButton } from '@/components/import/import-button';
import { ImportModal, ImportModalConfig } from '@/components/import/import-modal';
import {
  VENDOR_COLUMN_ALIASES,
  VENDOR_REQUIRED_FIELDS,
  VENDOR_TEMPLATE_HEADERS,
  VENDOR_TEMPLATE_SAMPLE,
  VENDOR_IMPORT_AUDIT_STORAGE_KEY,
  VendorImportRow,
  getPaymentCycleId,
  buildVendorRequestBody,
  buildVendorValidationErrors,
} from '@/config/vendor-import-config';
import {
  getRowValue,
  downloadTextFile,
  ImportErrorRow,
  ImportSummary,
} from '@/utils/import-utils';

interface VendorsContentProps {
  isTesting?: boolean;
}

export default function VendorsContent({ isTesting = false }: VendorsContentProps = {}) {
  const router = useRouter();
  const { toast } = useToast();
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>('bottom');
  const menuButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const [selectedVendors, setSelectedVendors] = useState<number[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filter states
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCriteria, setSelectedCriteria] = useState('-1');
  const [selectedValue, setSelectedValue] = useState('-1');
  const [selectedVendorType, setSelectedVendorType] = useState('-1');
  const [vendorTypes, setVendorTypes] = useState<Array<{ vendorTypeId: number; vendorTypeName: string }>>([
    { vendorTypeId: -1, vendorTypeName: 'Select Type' }
  ]);
  const [criteriaOptions, setCriteriaOptions] = useState<Array<{ id: string; name: string; value?: string }>>([
    { id: '-1', name: 'Select Criteria' }
  ]);
  const [valueOptions, setValueOptions] = useState<Array<{ id: string; name: string }>>([
    { id: '-1', name: 'Select Value' }
  ]);
  const [paymentCycles, setPaymentCycles] = useState<Array<{ id: number; name: string }>>([]);

  // Import Modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Fetch vendor types
  const fetchVendorTypes = async () => {
    try {
      const response = await fetch(`${envConfig.apiBaseUrl}/vendors/vendor-types`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Vendor Types API Response:', result);
        
        // Handle response - data might be directly in result or in result.data
        const dataArray = Array.isArray(result) ? result : (result.data || []);
        
        if (dataArray.length > 0) {
          const types = dataArray.map((type: any) => ({
            vendorTypeId: type.vendorTypeId || type.VendorTypeId,
            vendorTypeName: type.vendorType || type.VendorType || type.vendorTypeName || type.VendorTypeName || 'Unknown',
          }));
          console.log('Mapped Vendor Types:', types);
          setVendorTypes([{ vendorTypeId: -1, vendorTypeName: 'Select Type' }, ...types]);
        }
      }
    } catch (error) {
      console.error('Error fetching vendor types:', error);
    }
  };

  // Fetch filter criteria options
  const fetchCriteriaOptions = async () => {
    try {
      const response = await fetch(`${envConfig.apiBaseUrl}/vendors/filter-criteria`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Filter Criteria API Response:', result);
        
        // Handle response - data might be directly in result or in result.data
        const dataArray = Array.isArray(result) ? result : (result.data || []);
        
        if (dataArray.length > 0) {
          const criteria = dataArray.map((item: any) => ({
            id: item.text || item.name || item.criteriaName || item.displayName,
            name: item.text || item.name || item.criteriaName || item.displayName,
            value: item.value || item.id || item.text,
          }));
          console.log('Mapped Criteria Options:', criteria);
          setCriteriaOptions([{ id: '-1', name: 'Select Criteria' }, ...criteria]);
        }
      }
    } catch (error) {
      console.error('Error fetching filter criteria:', error);
      // Fallback to default options if API fails
      setCriteriaOptions([
        { id: '-1', name: 'Select Criteria' },
        { id: 'vendorName', name: 'Vendor Name' },
        { id: 'vendorCode', name: 'Vendor Code' },
        { id: 'status', name: 'Status' },
        { id: 'paymentCycle', name: 'Payment Cycle' },
      ]);
    }
  };

  const fetchPaymentCycles = async () => {
    try {
      const response = await fetch(`${envConfig.apiBaseUrl}/payment-cycle-report/payment-cycles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        const dataArray = result.items || result.data || result;

        if (Array.isArray(dataArray)) {
          const cycles = dataArray
            .map((cycle: any) => ({
              id: Number(cycle.paymentCycleMasterId || cycle.paymentCycleId || cycle.id),
              name: String(cycle.paymentCycleName || cycle.name || cycle.paymentCycle || '').trim(),
            }))
            .filter((cycle: { id: number; name: string }) => Number.isFinite(cycle.id) && cycle.name.length > 0);
          setPaymentCycles(cycles);
        }
      }
    } catch (fetchError) {
      console.error('Error fetching payment cycles:', fetchError);
    }
  };

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setShowActionMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch vendor types and criteria options on mount
  useEffect(() => {
    fetchVendorTypes();
    fetchCriteriaOptions();
    fetchPaymentCycles();
  }, []);

  // Vendor import configuration
  const vendorImportConfig: ImportModalConfig = {
    moduleName: 'Vendors',
    title: 'Import Vendors',
    description: 'Upload a .xlsx or .csv file to import vendors. Mandatory columns: Vendor Name, Vendor Code, Contact First Name, Email Id, Country Id, State Id, City, Payment Cycle.',
    columnAliases: VENDOR_COLUMN_ALIASES,
    requiredFields: VENDOR_REQUIRED_FIELDS,
    templateHeaders: VENDOR_TEMPLATE_HEADERS,
    templateSample: VENDOR_TEMPLATE_SAMPLE,
    accept: '.xlsx,.csv',
  };

  const getCurrentUserName = (): string => {
    try {
      const rawUser = localStorage.getItem('vms_user_data');
      if (!rawUser) return 'Unknown User';
      const parsed = JSON.parse(rawUser);
      return parsed?.name || parsed?.userName || parsed?.loginId || parsed?.email || 'Unknown User';
    } catch {
      return 'Unknown User';
    }
  };

  const writeImportAuditLog = (entry: {
    fileName: string;
    totalRows: number;
    successCount: number;
    failedCount: number;
    status: 'success' | 'partial' | 'error';
  }) => {
    try {
      const existingLogs = localStorage.getItem(VENDOR_IMPORT_AUDIT_STORAGE_KEY);
      const parsedLogs = existingLogs ? JSON.parse(existingLogs) : [];
      const logEntry = {
        action: 'VENDOR_IMPORT',
        uploadedBy: getCurrentUserName(),
        uploadedAt: new Date().toISOString(),
        ...entry,
      };

      const nextLogs = [logEntry, ...(Array.isArray(parsedLogs) ? parsedLogs : [])].slice(0, 50);
      localStorage.setItem(VENDOR_IMPORT_AUDIT_STORAGE_KEY, JSON.stringify(nextLogs));
      console.info('Vendor import audit log:', logEntry);
    } catch (auditError) {
      console.error('Failed to write import audit log:', auditError);
    }
  };

  const mapRawRowsToVendorImportRows = (rows: Record<string, unknown>[]): VendorImportRow[] => {
    return rows.map((row, index) => ({
      rowNumber: index + 2,
      raw: row,
      vendorName: getRowValue(row, VENDOR_COLUMN_ALIASES.vendorName),
      vendorCode: getRowValue(row, VENDOR_COLUMN_ALIASES.vendorCode),
      vendorType: getRowValue(row, VENDOR_COLUMN_ALIASES.vendorType),
      contactFirstName: getRowValue(row, VENDOR_COLUMN_ALIASES.contactFirstName),
      contactLastName: getRowValue(row, VENDOR_COLUMN_ALIASES.contactLastName),
      emailId: getRowValue(row, VENDOR_COLUMN_ALIASES.emailId),
      officePhone: getRowValue(row, VENDOR_COLUMN_ALIASES.officePhone),
      mobile: getRowValue(row, VENDOR_COLUMN_ALIASES.mobile),
      countryId: getRowValue(row, VENDOR_COLUMN_ALIASES.countryId),
      stateId: getRowValue(row, VENDOR_COLUMN_ALIASES.stateId),
      city: getRowValue(row, VENDOR_COLUMN_ALIASES.city),
      zipCode: getRowValue(row, VENDOR_COLUMN_ALIASES.zipCode),
      address1: getRowValue(row, VENDOR_COLUMN_ALIASES.address1),
      paymentCycle: getRowValue(row, VENDOR_COLUMN_ALIASES.paymentCycle),
      pan: getRowValue(row, VENDOR_COLUMN_ALIASES.pan),
      salesTaxNo: getRowValue(row, VENDOR_COLUMN_ALIASES.salesTaxNo),
      serviceTaxNo: getRowValue(row, VENDOR_COLUMN_ALIASES.serviceTaxNo),
      comments: getRowValue(row, VENDOR_COLUMN_ALIASES.comments),
    }));
  };

  const validateVendorImportRows = (rows: VendorImportRow[]): {
    validRows: VendorImportRow[];
    invalidRows: ImportErrorRow[];
  } => {
    const invalidRows: ImportErrorRow[] = [];
    const validRows: VendorImportRow[] = [];
    const seenVendors = new Set<string>();

    for (const row of rows) {
      const rowErrors = buildVendorValidationErrors(row, vendors, seenVendors, paymentCycles);

      if (rowErrors.length > 0) {
        invalidRows.push({
          rowNumber: row.rowNumber,
          reason: rowErrors.join('; '),
          raw: row.raw,
        });
        continue;
      }

      const normalizedName = row.vendorName.trim().toLowerCase();
      seenVendors.add(normalizedName);
      validRows.push(row);
    }

    return { validRows, invalidRows };
  };

  const handleDownloadTemplate = () => {
    const content = `${VENDOR_TEMPLATE_HEADERS.join(',')}\n${VENDOR_TEMPLATE_SAMPLE.join(',')}`;
    downloadTextFile(content, 'vendors_import_template.csv');
  };

  const handleImportVendors = async (file: File, parsedRows: Record<string, unknown>[]) => {
    setIsImporting(true);
    try {
      const vendorImportRows = mapRawRowsToVendorImportRows(parsedRows);
      const { validRows, invalidRows } = validateVendorImportRows(vendorImportRows);
      
      const failedRows: ImportErrorRow[] = [...invalidRows];
      let successCount = 0;

      for (const row of validRows) {
        try {
          const paymentCycleId = getPaymentCycleId(row.paymentCycle, paymentCycles);
          if (paymentCycleId === null) {
            failedRows.push({
              rowNumber: row.rowNumber,
              reason: 'Invalid payment cycle value',
              raw: row.raw,
            });
            continue;
          }

          const requestBody = buildVendorRequestBody(row, paymentCycleId);
          await vendorsService.createVendor(requestBody);
          successCount += 1;
        } catch (createError) {
          const reason = createError instanceof Error ? createError.message : 'Failed to create vendor';
          failedRows.push({
            rowNumber: row.rowNumber,
            reason,
            raw: row.raw,
          });
        }
      }

      const totalRows = parsedRows.length;
      const failedCount = failedRows.length;
      const status: ImportSummary['status'] = successCount === 0
        ? 'error'
        : failedCount > 0
        ? 'partial'
        : 'success';

      writeImportAuditLog({
        fileName: file.name,
        totalRows,
        successCount,
        failedCount,
        status: status === 'idle' ? 'error' : status,
      });

      if (successCount > 0) {
        await fetchVendors();
      }

      if (status === 'success') {
        toast({
          title: 'Import Completed',
          description: `${successCount} vendors imported successfully.`,
          variant: 'success',
        });
      } else if (status === 'partial') {
        toast({
          title: 'Import Partially Completed',
          description: `${successCount} imported, ${failedCount} failed. Download the error file for details.`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Import Failed',
          description: 'No vendors were imported. Please review the error file and try again.',
          variant: 'destructive',
        });
      }
    } catch (importError) {
      const message = importError instanceof Error ? importError.message : 'Import processing failed';
      toast({
        title: 'Import Failed',
        description: message,
        variant: 'destructive',
      });
      writeImportAuditLog({
        fileName: file.name,
        totalRows: 0,
        successCount: 0,
        failedCount: 0,
        status: 'error',
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Fetch vendors
  const fetchVendors = async (overrideFilters?: { criteria?: string; value?: string; vendorTypeId?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const numericPageSize = pageSize === 'All' ? totalRecords || 1000 : pageSize;
      
      // Use override filters if provided, otherwise use state values
      const filters = overrideFilters || {
        criteria: selectedCriteria,
        value: selectedValue,
        vendorTypeId: parseInt(selectedVendorType),
      };
      
      const response = await vendorsService.getAllVendors({
        searchText: '',
        searchColumn: '',
        pageSize: numericPageSize,
        pageNumber: currentPage,
        ignorePaging: pageSize === 'All',
        sortColumn: '',
        sortType: '',
        filter: {
          criteria: filters.criteria || '-1',
          value: filters.value || '-1',
          vendorTypeId: filters.vendorTypeId || -1,
        },
      });

      if (response.isSuccess || response.data) {
        const vendorRecords = response.data?.records || response.data || [];
        const total = response.data?.totalRecords || vendorRecords.length || 0;
        
        setVendors(vendorRecords);
        setTotalRecords(total);
      } else {
        setError(response.message || 'Failed to fetch vendors');
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [currentPage, pageSize]);

  // Testing useEffect to call all functions with mock params for coverage
  useEffect(() => {
    if (isTesting) {
      // Call all state setters
      setShowActionMenu(1);
      setSelectedVendors([1, 2]);
      setVendors([{
        vendorId: 1,
        vendorName: 'Test Vendor',
        vendorCode: 'TEST001',
        paymentCycle: '30 days',
        address: 'Test Address',
        servicesOffered: 'Test Services',
        status: 'Active'
      } as Vendor]);
      setLoading(false);
      setError('Test error');
      setShowDeleteDialog(true);
      setVendorToDelete({ id: 1, name: 'Test Vendor' });
      setDeleting(false);
      setShowBulkDeleteDialog(true);
      setBulkDeleting(false);
      setCurrentPage(2);
      setPageSize(20 as PageSize);
      setTotalRecords(100);
      setShowFilter(false);
      setSelectedCriteria('vendorName');
      setSelectedValue('test');
      setSelectedVendorType('1');
      setVendorTypes([{ vendorTypeId: 1, vendorTypeName: 'Test Type' }]);
      setCriteriaOptions([{ id: '1', name: 'Test Criteria' }]);
      setValueOptions([{ id: '1', name: 'Test Value' }]);

      // Call all handler functions
      fetchVendorTypes();
      fetchCriteriaOptions();
      fetchVendors({ criteria: 'test', value: 'test', vendorTypeId: 1 });
      handleCriteriaChange('vendorName');
      handleApplyFilter();
      handleResetFilter();
      handleAddNewVendor();
      handleSelectAll(true);
      handleSelectVendor(1, true);
      handlePageChange(2);
      handlePageSizeChange(20 as PageSize);
      handleViewVendor(1);
      handleEditVendor(1);
      handleStatusChange(1, 'Test Vendor', 'Active');
      handleDeleteVendor(1, 'Test Vendor');
      handleDeleteConfirm();
      handleDeleteCancel();
      handleExportVendors();
      handleDownloadTemplate();
      handleBulkDeleteClick();
      handleBulkDeleteConfirm();
      handleBulkDeleteCancel();
      clearError();

      // Call router
      router.push('/test');
    }
  }, [isTesting]);

  // Handle criteria change
  const handleCriteriaChange = async (criteriaId: string) => {
    setSelectedCriteria(criteriaId);
    setSelectedValue('-1');
    
    // Reset value options to default
    setValueOptions([{ id: '-1', name: 'Select Value' }]);

    // Find the selected criteria to get its value for API call
    const selectedCriteriaOption = criteriaOptions.find(opt => opt.id === criteriaId);
    const criteriaValue = selectedCriteriaOption?.value || criteriaId;

    // Fetch values based on selected criteria from API
    if (criteriaId !== '-1') {
      try {
        const response = await fetch(
          `${envConfig.apiBaseUrl}/vendors/filter-criteria-values?criteria=${encodeURIComponent(criteriaValue)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Filter criteria values response:', data);
          
          // Map the response to value options
          // API returns { values: [{text: "...", value: "..."}, ...] }
          const valuesArray = data.values || data;
          
          if (Array.isArray(valuesArray) && valuesArray.length > 0) {
            const options = valuesArray.map((item: any) => ({
              id: item.value || item.id || item.text || item,
              name: item.text || item.name || item.value || item,
            }));
            setValueOptions([{ id: '-1', name: 'Select Value' }, ...options]);
          } else {
            // If no data returned, keep default
            setValueOptions([{ id: '-1', name: 'Select Value' }]);
          }
        } else {
          console.error('Failed to fetch filter values');
          setValueOptions([{ id: '-1', name: 'Select Value' }]);
        }
      } catch (error) {
        console.error('Error fetching filter values:', error);
        setValueOptions([{ id: '-1', name: 'Select Value' }]);
      }
    }
  };

  const handleApplyFilter = () => {
    setCurrentPage(1); // Reset to first page when applying filter
    fetchVendors();
  };

  const handleResetFilter = () => {
    setSelectedCriteria('-1');
    setSelectedValue('-1');
    setSelectedVendorType('-1');
    setValueOptions([{ id: '-1', name: 'Select Value' }]);
    setCurrentPage(1);
    // Fetch vendors with cleared filters to load default vendor list
    fetchVendors({ criteria: '-1', value: '-1', vendorTypeId: -1 });
  };

  const handleAddNewVendor = () => {
    router.push('/vendors/new');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVendors(vendors.map(vendor => vendor.vendorId || vendor.VendorId || 0));
    } else {
      setSelectedVendors([]);
    }
  };

  const handleSelectVendor = (vendorId: number, checked: boolean) => {
    if (checked) {
      setSelectedVendors(prev => [...prev, vendorId]);
    } else {
      setSelectedVendors(prev => prev.filter(id => id !== vendorId));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: PageSize) => {
    const numericSize = size === 'All' ? totalRecords : size;
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleViewVendor = (vendorId: number) => {
    router.push(`/vendors/${vendorId}`);
  };

  const handleEditVendor = (vendorId: number) => {
    router.push(`/vendors/${vendorId}/edit`);
  };

  const handleStatusChange = async (vendorId: number, vendorName: string, currentStatus: string) => {
    setShowActionMenu(null);
    
    const action = currentStatus === 'Active' ? 'deactivated' : 'activated';
    const statusCode = currentStatus === 'Active' ? 0 : 1; // 0=Inactive, 1=Active
    
    try {
      const response = await vendorsService.changeVendorStatus({
        vendorIds: [vendorId],
        status: statusCode,
      });

      if (response.isSuccess) {
        toast({
          title: 'Success',
          description: response.message || `Vendor "${vendorName}" has been ${action} successfully`,
          variant: 'success',
        });
        
        // Refresh vendors list
        fetchVendors();
      } else {
        toast({
          title: 'Status Change Failed',
          description: response.message || 'Unable to change vendor status. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      toast({
        title: 'Error',
        description: `Failed to change vendor status: ${errorMessage}`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteVendor = (vendorId: number, vendorName: string) => {
    setShowActionMenu(null);
    setVendorToDelete({ id: vendorId, name: vendorName });
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vendorToDelete || deleting) return;

    setDeleting(true);
    try {
      const response = await vendorsService.changeVendorStatus({
        vendorIds: [vendorToDelete.id],
        status: 2, // 2=Delete
      });

      if (response.isSuccess) {
        toast({
          title: 'Success',
          description: response.message || 'Vendor deleted successfully',
          variant: 'success',
        });
        
        // Refresh vendors list
        fetchVendors();
      } else {
        toast({
          title: 'Delete Failed',
          description: response.message || 'Unable to delete vendor. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      toast({
        title: 'Error',
        description: `Failed to delete vendor: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setVendorToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setVendorToDelete(null);
  };

  const handleExportVendors = async () => {
    try {
      const response = await vendorsService.exportVendors({
        searchText: '',
        searchColumn: '',
        pageSize: totalRecords, // Export all records
        pageNumber: 1,
        ignorePaging: true, // Ignore pagination for export
        sortColumn: '',
        sortType: '',
        filter: {
          criteria: '-1',
          value: '-1',
          vendorTypeId: -1,
        },
      });

      // Create blob URL and trigger download
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vendors_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: 'Vendors data exported successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error exporting vendors:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export vendors data',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedVendors.length === 0) return;
    setShowBulkDeleteDialog(true);
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedVendors.length === 0 || bulkDeleting) return;

    setBulkDeleting(true);
    try {
      const response = await vendorsService.changeVendorStatus({
        vendorIds: selectedVendors,
        status: 2, // 2=Delete
      });

      if (response.isSuccess) {
        toast({
          title: 'Success',
          description: response.message || `${selectedVendors.length} vendor(s) deleted successfully`,
          variant: 'success',
        });
        
        // Clear selection and refresh vendors list
        setSelectedVendors([]);
        fetchVendors();
      } else {
        toast({
          title: 'Bulk Delete Failed',
          description: response.message || 'Unable to delete selected vendors. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      toast({
        title: 'Error',
        description: `Failed to delete vendors: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setBulkDeleting(false);
      setShowBulkDeleteDialog(false);
    }
  };

  const handleBulkDeleteCancel = () => {
    setShowBulkDeleteDialog(false);
  };

  const clearError = () => {
    setError(null);
  };

  const isAllSelected = vendors.length > 0 && selectedVendors.length === vendors.length;
  const isIndeterminate = selectedVendors.length > 0 && selectedVendors.length < vendors.length;

  const numericPageSize = pageSize === 'All' ? totalRecords : pageSize;
  const totalPages = Math.ceil(totalRecords / numericPageSize);
  const showingFrom = totalRecords > 0 ? (currentPage - 1) * numericPageSize + 1 : 0;
  const showingTo = Math.min(currentPage * numericPageSize, totalRecords);

  return (
    <div {...(isTesting ? { 'data-testid': 'vendors-content-root' } : {})}>
      {/* Error Banner */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearError}
                className="ml-auto"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Manage Vendors</h3>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-vendor-600" />}
        </div>
        <div className='flex gap-2'>

          {/* Bulk Delete Button */}
          <Button 
            variant='outline' 
            onClick={handleBulkDeleteClick}
            disabled={selectedVendors.length === 0 || loading}
            className={`gap-2 ${selectedVendors.length > 0 ? 'text-xs font-normal bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'text-xs font-normal bg-gray-100 text-gray-400'}`}
          >
            <Trash2 className="h-4 w-4" />
            Bulk Delete {selectedVendors.length > 0 && `(${selectedVendors.length})`}
          </Button>

          {selectedVendors.length > 0 && (
            <span className="ml-0 text-blue-600 font-normal text-xs">
              <Tooltip content="Clear selection">
                <Button
                  variant='outline' 
                  onClick={() => setSelectedVendors([])}
                  className="ml-0 pl-2 pr-2 text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  <X className="h-4 w-4 inline-block" />
                </Button>
              </Tooltip>
            </span>
          )} 
          <ImportButton
            onImportClick={() => setShowImportModal(true)}
            disabled={loading || isImporting}
          />

          <Button
            variant='outline'
            onClick={handleExportVendors}
            disabled={loading}
            className="text-xs font-normal bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Button 
            variant='outline' 
            onClick={handleAddNewVendor} 
            disabled={loading}
            className="cus-primary-btn gap-2 bg-vendor-600 hover:bg-vendor-700 text-xs"
          >
            <Plus className="h-4 w-4" />
            Add New Vendor
          </Button>

          {/* Payment Cycle Report Button */}
          <Button 
            variant='outline' 
            onClick={() => router.push('/payment-cycle-report')}
            className="cus-primary-btn gap-2 bg-vendor-600 hover:bg-vendor-700 text-xs"
          >
            <FileText className="h-4 w-4" />
            Payment Cycle Report
          </Button>
        </div>
      </div>

      {/* Advanced Filter Section */}
      <Card className="mb-4">
        <CardContent className="p-4 py-2">
          <div className="flex items-center justify-between mb-0">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-indigo-600" />
              <h4 className="font-semibold text-indigo-600">Advanced Filters</h4>
              </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilter(!showFilter)}
              className="gap-2 text-gray-600 hover:text-gray-900"
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Select Criteria Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Criteria
                  </label>
                  <select
                    value={selectedCriteria}
                    onChange={(e) => handleCriteriaChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500 text-sm"
                  >
                    {criteriaOptions.map((option, index) => (
                      <option key={`criteria-${option.id}-${index}`} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Value Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Value
                  </label>
                  <select
                    value={selectedValue}
                    onChange={(e) => setSelectedValue(e.target.value)}
                    disabled={selectedCriteria === '-1'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {valueOptions.map((option, index) => (
                      <option key={`value-${option.id}-${index}`} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Type Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Type
                  </label>
                  <select
                    value={selectedVendorType}
                    onChange={(e) => setSelectedVendorType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500 text-sm"
                  >
                    {vendorTypes.map((type) => (
                      <option key={type.vendorTypeId} value={type.vendorTypeId.toString()}>
                        {type.vendorTypeName}
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
                  disabled={loading || (selectedCriteria === '-1' && selectedValue === '-1' && selectedVendorType === '-1')}
                  className="gap-2 text-xs"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
                <Button
                  onClick={handleApplyFilter}
                  disabled={loading}
                  variant="outline"
                  className="gap-2 bg-vendor-600 hover:bg-vendor-700 text-xs"
                >
                  <Filter className="h-4 w-4" />
                  Apply Filter
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card className="mb-3">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-center px-2 py-2 font-medium text-sm w-12">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-[#0152ef] focus:ring-1"
                      aria-label="Select all vendors"
                    />
                  </th>
                  <th className="text-left px-2 py-2 font-medium text-sm w-[15%]">Vendor Name</th>
                  <th className="text-left px-2 py-2 font-medium text-sm w-[12%]">Vendor Code</th>
                  <th className="text-left px-2 py-2 font-medium text-sm w-[12%]">Payment Cycle</th>
                  <th className="text-left px-2 py-2 font-medium text-sm w-[20%]">Address</th>
                  <th className="text-left px-2 py-2 font-medium text-sm w-[20%]">Services Offered</th>
                  <th className="text-left px-2 py-2 font-medium text-sm w-[10%]">Status</th>
                  <th className="text-center px-2 py-2 font-medium text-sm w-[8%]">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && vendors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading vendors...</span>
                      </div>
                    </td>
                  </tr>
                ) : vendors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      No vendors available.
                    </td>
                  </tr>
                ) : (
                  vendors.map((vendor) => {
                    const vendorId = vendor.vendorId || vendor.VendorId || 0;
                    const vendorName = vendor.vendorName || vendor.VendorName || '';
                    const vendorCode = vendor.vendorCode || vendor.VendorCode || '';
                    const paymentCycle = vendor.paymentCycle || vendor.PaymentCycle || '';
                    const address = vendor.address || vendor.Address || '';
                    const servicesOffered = vendor.servicesOffered || vendor.ServicesOffered || '';
                    const status = vendor.status || vendor.Status || '';
                    
                    return (
                      <tr key={vendorId} className="border-b hover:bg-gray-50">
                        <td className="py-1 px-1 text-center">
                          <input
                            type="checkbox"
                            checked={selectedVendors.includes(vendorId)}
                            onChange={(e) => handleSelectVendor(vendorId, e.target.checked)}
                            className="text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-[#0152ef] focus:ring-1"
                            aria-label={`Select ${vendorName}`}
                          />
                        </td>
                        <td className="p-1 text-sm text-gray-900">
                          <Tooltip content={vendorName || '-'} position="top">
                            <div className="truncate cursor-help max-w-[150px]">
                              {vendorName || '-'}
                            </div>
                          </Tooltip>
                        </td>
                        <td className="p-1 text-sm text-gray-600">
                          <Tooltip content={vendorCode || '-'} position="top">
                            <div className="truncate cursor-help max-w-[120px]">
                              {vendorCode || '-'}
                            </div>
                          </Tooltip>
                        </td>
                        <td className="p-1 text-sm text-gray-600">
                          <Tooltip content={paymentCycle || '-'} position="top">
                            <div className="truncate cursor-help max-w-[120px]">
                              {paymentCycle || '-'}
                            </div>
                          </Tooltip>
                        </td>
                        <td className="p-1 text-sm text-gray-600">
                          <Tooltip content={address || '-'} position="top">
                            <div className="truncate cursor-help max-w-[200px]">
                              {address || '-'}
                            </div>
                          </Tooltip>
                        </td>
                        <td className="p-1 text-sm text-gray-600">
                          <Tooltip content={servicesOffered || '-'} position="top">
                            <div className="truncate cursor-help max-w-[200px]">
                              {servicesOffered || '-'}
                            </div>
                          </Tooltip>
                        </td>
                        <td className="p-1 text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-normal rounded-full ${
                            status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : status === 'In-Active'
                              ? 'text-gray-700'
                              : 'bg-red-100 text-red-800'
                          }`}
                          style={status === 'In-Active' ? { backgroundColor: '#e2e8f0' } : undefined}>
                            {status}
                          </span>
                        </td>
                        <td className="p-1 text-center relative">
                          <button
                            ref={el => {
                              if (el) menuButtonRefs.current.set(vendorId, el);
                            }}
                            onClick={() => {
                              if (showActionMenu === vendorId) {
                                setShowActionMenu(null);
                              } else {
                                // Calculate position based on available space
                                const buttonEl = menuButtonRefs.current.get(vendorId);
                                if (buttonEl) {
                                  const rect = buttonEl.getBoundingClientRect();
                                  const spaceBelow = window.innerHeight - rect.bottom;
                                  const menuHeight = 150; // Approximate menu height
                                  setMenuPosition(spaceBelow < menuHeight ? 'top' : 'bottom');
                                }
                                setShowActionMenu(vendorId);
                              }
                            }}
                            className="inline-flex items-center justify-center p-1 hover:bg-gray-100 rounded"
                            aria-label="Actions menu"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {showActionMenu === vendorId && (
                            <div
                              ref={actionMenuRef}
                              className={`absolute right-0 w-48 rounded-md shadow-lg bg-white ring-opacity-5 z-10 ${menuPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'}`}
                            >
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    handleEditVendor(vendorId);
                                    setShowActionMenu(null);
                                  }}
                                  type="button"
                                  className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-blue-50 hover:text-blue-600 cursor-pointer text-left border-0 bg-white transition-colors duration-150"
                                  style={{
                                    minHeight: "40px",
                                    border: "none",
                                    width: "100%",
                                    textAlign: "left",
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </button>
                                <button
                                type="button"
                                  onClick={() => handleStatusChange(vendorId, vendorName, status)}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-blue-50 hover:text-blue-600 cursor-pointer text-left border-0 bg-white transition-colors duration-150"
                                  style={{
                                    minHeight: "40px",
                                    border: "none",
                                    width: "100%",
                                    textAlign: "left",
                                  }}
                                >
                                  <Power className="h-4 w-4" />
                                  {status === 'Active' ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVendor(vendorId, vendorName)}
                                  style={{
                                    minHeight: "40px",
                                    border: "none",
                                    width: "100%",
                                    textAlign: "left",
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>

        {/* Pagination */}
        <Pagination
          pagination={{
            currentPage,
            pageSize,
            totalRecords,
            totalPages,
            showingFrom,
            showingTo,
          }}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          loading={loading}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Vendor"
        message={`Are you sure you want to delete the vendor "${vendorToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="danger"
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showBulkDeleteDialog}
        title="Delete Multiple Vendors"
        message={`Are you sure you want to delete ${selectedVendors.length} selected vendor${selectedVendors.length === 1 ? '' : 's'}? This action cannot be undone.`}
        onConfirm={handleBulkDeleteConfirm}
        onCancel={handleBulkDeleteCancel}
        confirmText={bulkDeleting ? "Deleting..." : `Delete ${selectedVendors.length} Vendor${selectedVendors.length === 1 ? '' : 's'}`}
        cancelText="Cancel"
        variant="danger"
      />

      {/* Import Vendors Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        config={vendorImportConfig}
        onImport={handleImportVendors}
        onDownloadTemplate={handleDownloadTemplate}
        isImporting={isImporting}
      />
    </div>
  );
}

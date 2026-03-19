'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip } from '@/components/ui/tooltip';
import { ArrowLeft, Loader2, X, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { quotationsService } from '@/services/quotations-service';
import { purchaseOrdersService } from '@/services/purchase-orders-service';

interface ViewQuotationFormData {
  requestNumber: string;
  requestGroup: string;
  subgroup: string;
  projectProposal: string;
  service: string;
  serviceDetails: string;
  request: string;
  description: string;
  startDate: string;
  endDate: string;
  requestType: string;
  advanceReceived: string;
  paymentMode: string;
  billingType: string;
  poDescription: string;
}

interface VendorCell {
  value: string;
  fileUrl?: string;
  vendorId?: number;
  vendorName?: string;
}

interface SpecificationRow {
  specificationId: number;
  specificationName: string;
  fieldType: 'text' | 'checkbox' | 'hyperlink' | 'dropdown';
  vendorCells: VendorCell[];
  dropdownOptions?: string[];
}

interface SpecificationTableData {
  vendorsToShow: number;
  specifications: SpecificationRow[];
}

export default function ViewQuotationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loadingData, setLoadingData] = useState(true);
  const [showViewSpecificationModal, setShowViewSpecificationModal] = useState(false);
  const [billingTypes, setBillingTypes] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any>(null);
  const [loadingDistribution, setLoadingDistribution] = useState(false);
  const [requestId, setRequestId] = useState<string>('');
  const [vendorsToShow, setVendorsToShow] = useState<number>(0);
  const [specificationsTableData, setSpecificationsTableData] = useState<SpecificationTableData | null>(null);
  const [loadingSpecificationsTable, setLoadingSpecificationsTable] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<(number | null)[]>([]);

  const [formData, setFormData] = useState<ViewQuotationFormData>({
    requestNumber: '',
    requestGroup: '',
    subgroup: '',
    projectProposal: '',
    service: '',
    serviceDetails: '',
    request: '',
    description: '',
    startDate: '',
    endDate: '',
    requestType: '',
    advanceReceived: '',
    paymentMode: '',
    billingType: '',
    poDescription: '',
  });

  useEffect(() => {
    // Load data from API
    const loadQuotationData = async () => {
      try {
        setLoadingData(true);

        // Fetch billing types for dropdown display
        const billingTypesData = await quotationsService.getBillingTypes();
        if (Array.isArray(billingTypesData)) {
          setBillingTypes(billingTypesData);
        } else {
          setBillingTypes([]);
        }

        // Get requestId from URL params
        const reqId = searchParams.get('requestId');
        
        if (reqId) {
          setRequestId(reqId);
        }
        
        if (!reqId) {
          toast({
            title: 'Error',
            description: 'Request ID not found',
            variant: 'destructive',
          });
          setLoadingData(false);
          return;
        }

        // Fetch from API
        logger.info('View Quotation - Fetching data from API', { requestId: reqId });
        const quotationData = await quotationsService.getQuotationContext(reqId);
        logger.info('View Quotation - API data received', { quotationData });
        
        // Store in sessionStorage for specifications table
        sessionStorage.setItem('viewQuotationData', JSON.stringify(quotationData));

        // Store vendorsToShow
        if (quotationData.vendorsToShow || quotationData.noOfQuotations) {
          setVendorsToShow(quotationData.vendorsToShow || quotationData.noOfQuotations || 0);
        }

        // Extract selected vendors from specifications vendorCells
        if (quotationData.specifications && quotationData.specifications.length > 0) {
          const vendorCount = quotationData.vendorsToShow || quotationData.noOfQuotations || 0;
          const vendorIds: (number | null)[] = Array(vendorCount).fill(null);
          
          const firstSpec = quotationData.specifications[0];
          if (firstSpec.vendorCells) {
            firstSpec.vendorCells.forEach((cell: any) => {
              const index = (cell.columnIndex || 1) - 1;
              if (index >= 0 && index < vendorCount && cell.vendorId) {
                vendorIds[index] = cell.vendorId;
              }
            });
          }
          
          setSelectedVendors(vendorIds);
        }

        // Map API response to form fields
        setFormData({
          requestNumber: quotationData.requestNumber || quotationData.requestId || '',
          requestGroup: quotationData.requestGroup || '',
          subgroup: quotationData.subgroup || quotationData.subgroupName || '',
          projectProposal: quotationData.projectProposal || quotationData.projectProposalDisplay || '',
          service: quotationData.service || quotationData.serviceName || '',
          serviceDetails: quotationData.serviceDetailName || quotationData['Service Details'] || quotationData.serviceDetails || quotationData.serviceDetail || '',
          request: quotationData.request || quotationData.requestName || '',
          description: quotationData.description || quotationData.requestDescription || '',
          startDate: quotationData.startDate || '',
          endDate: quotationData.endDate || '',
          requestType: quotationData.requestTypeName || quotationData.requestType || '',
          advanceReceived: quotationData.advanceReceivedLabel || quotationData.advanceReceived || '',
          paymentMode: quotationData.paymentModeName || quotationData.paymentMode || '',
          billingType: quotationData.billingType || '',
          poDescription: quotationData.poDescription || '',
        });

        setLoadingData(false);
      } catch (error: any) {
        logger.error('Error loading quotation data:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load quotation data',
          variant: 'destructive',
        });
        setLoadingData(false);
      }
    };

    loadQuotationData();
  }, [searchParams, toast]);

  useEffect(() => {
    if (requestId && vendorsToShow > 0) {
      fetchSpecificationsTable();
    }
  }, [requestId, vendorsToShow, billingTypes]);

  const handleViewSpecification = async () => {
    setShowViewSpecificationModal(true);
    
    if (!requestId) {
      logger.warn('No requestId available for fetching distribution data');
      setDistributionData(null);
      return;
    }

    try {
      setLoadingDistribution(true);
      logger.info('Fetching PO distribution', { requestId });
      const distData = await purchaseOrdersService.getPODistribution(requestId);
      logger.info('Distribution data received', { distData });
      setDistributionData(distData);
      setLoadingDistribution(false);
    } catch (error: any) {
      logger.error('Error loading distribution data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load distribution data',
        variant: 'destructive',
      });
      setDistributionData(null);
      setLoadingDistribution(false);
    }
  };

  const fetchSpecificationsTable = async () => {
    if (!requestId) {
      logger.warn('No requestId available for fetching specifications table');
      return;
    }

    try {
      setLoadingSpecificationsTable(true);
      logger.info('Fetching specifications table', { requestId });
      
      const storedData = sessionStorage.getItem('viewQuotationData');
      if (!storedData) {
        logger.warn('No quotation data found in sessionStorage');
        setLoadingSpecificationsTable(false);
        return;
      }

      const quotationData = JSON.parse(storedData);
      const apiSpecifications = quotationData.specifications || [];
      
      if (!apiSpecifications || apiSpecifications.length === 0) {
        logger.warn('No specifications found in quotation data');
        setSpecificationsTableData(null);
        setLoadingSpecificationsTable(false);
        return;
      }

      // Map API specifications to table format
      const mappedSpecifications: SpecificationRow[] = apiSpecifications.map((spec: any) => {
        const vendorCells: VendorCell[] = Array(vendorsToShow || 2).fill(null).map((_, index) => {
          const cellData = spec.vendorCells?.[index] || {};
          return {
            value: cellData.textValue || cellData.value || '',
            fileUrl: cellData.fileUrl || '',
            vendorId: cellData.vendorId || undefined,
            vendorName: cellData.vendorName || undefined
          };
        });

        const specName = spec.specificationName || spec.name || '';
        const specFieldType = spec.fieldType || 'text';
        
        let specDropdownOptions = spec.dropdownOptions || [];
        if (specName.toLowerCase() === 'billing type' && specFieldType === 'dropdown' && billingTypes.length > 0) {
          specDropdownOptions = billingTypes.map((bt: any) => bt.name || bt);
        }

        return {
          specificationId: spec.specificationId || spec.id || 0,
          specificationName: specName,
          fieldType: specFieldType,
          vendorCells: vendorCells,
          dropdownOptions: specDropdownOptions
        };
      });

      const tableData: SpecificationTableData = {
        vendorsToShow: vendorsToShow || 2,
        specifications: mappedSpecifications
      };
      
      setSpecificationsTableData(tableData);
      
      // Sync selectedVendors from the mapped specifications data
      if (mappedSpecifications.length > 0) {
        const firstSpec = mappedSpecifications[0];
        const vendorIds: (number | null)[] = firstSpec.vendorCells.map((cell: VendorCell) => cell.vendorId || null);
        setSelectedVendors(vendorIds);
      }
      
      setLoadingSpecificationsTable(false);
    } catch (error: any) {
      logger.error('Error loading specifications table:', error);
      toast({
        title: 'Error',
        description: 'Failed to load specifications table',
        variant: 'destructive',
      });
      setLoadingSpecificationsTable(false);
    }
  };

  const handleCancel = () => {
    router.push('/manage-quotations');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Loading State */}
        {loadingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading quotation data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Tooltip content="Go back to Manage Quotations" position="bottom">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCancel}
                    className="shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Tooltip>
                <div>
                  <h3 className="text-lg font-semibold">View Quotation</h3>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={handleViewSpecification}
                  className="font-normal text-xs bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Distribution
                </Button>
              </div>
            </div>

            {/* Form Card */}
            <Card>
              <CardHeader>
                <h4 className="text-lg font-semibold text-gray-900">Quotation Details</h4>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => e.preventDefault()}>
                  {/* Form Fields - 3 Column Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Request # */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Request # <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.requestNumber}
                        readOnly
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    {/* Request Group */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Request Group <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.requestGroup}
                        readOnly
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    {/* Subgroup */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Subgroup <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.subgroup}
                        readOnly
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    {/* Project/Proposal */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Project/Proposal <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.projectProposal}
                        readOnly
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    {/* Service */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Service <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.service}
                        readOnly
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    {/* Service Details */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Service Details
                      </label>
                      <Input
                        type="text"
                        value={formData.serviceDetails}
                        readOnly
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    {/* Request */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Request <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.request}
                        readOnly
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    {/* Start Date */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.startDate}
                        readOnly
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.endDate}
                        readOnly
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    {/* Request Type */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Request Type <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.requestType}
                        readOnly
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    {/* Advance Received */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Advance Received <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.advanceReceived}
                        readOnly
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    {/* Payment Mode */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Payment Mode
                      </label>
                      <Input
                        value={formData.paymentMode}
                        readOnly
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    {/* Description - Full Width */}
                    <div className="space-y-2 md:col-span-3">
                      <label className="text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        readOnly
                        disabled
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm resize-none bg-gray-50"
                      />
                    </div>

                    {/* PO Description - Full Width */}
                    <div className="space-y-2 md:col-span-3">
                      <label className="text-sm font-medium text-gray-700">
                        PO Description
                      </label>
                      <textarea
                        value={formData.poDescription}
                        readOnly
                        disabled
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm resize-none bg-gray-50"
                      />
                    </div>
                  </div>

                  {/* Specifications Table */}
                  {specificationsTableData && specificationsTableData.specifications.length > 0 && (
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-base font-semibold text-gray-900">Vendor Specifications</h5>
                        {loadingSpecificationsTable && (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        )}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 min-w-[200px]">
                                Specification
                              </th>
                              {Array.from({ length: specificationsTableData.vendorsToShow }).map((_, index) => (
                                <th key={index} className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700 min-w-[200px]">
                                  {specificationsTableData?.specifications[0]?.vendorCells[index]?.vendorName || 
                                   `Vendor ${selectedVendors[index] || index + 1}`}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {specificationsTableData.specifications.map((spec) => (
                              <tr key={spec.specificationId} className="bg-white hover:bg-gray-50">
                                <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">
                                  {spec.specificationName}
                                </td>
                                {spec.vendorCells.map((cell, vendorIndex) => (
                                  <td key={vendorIndex} className="border border-gray-300 px-4 py-3">
                                    {spec.fieldType === 'text' && (
                                      <span className="text-gray-700">{cell.value || '-'}</span>
                                    )}
                                    {spec.fieldType === 'checkbox' && (
                                      <div className="flex items-center justify-center">
                                        <input
                                          type="checkbox"
                                          checked={cell.value?.toLowerCase() === 'true' || cell.value?.toLowerCase() === 'yes'}
                                          disabled
                                          className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                        />
                                      </div>
                                    )}
                                    {spec.fieldType === 'dropdown' && (
                                      <span className="text-gray-700">{cell.value || '-'}</span>
                                    )}
                                    {spec.fieldType === 'hyperlink' && (
                                      <div className="flex items-center justify-center">
                                        {cell.fileUrl ? (
                                          <a
                                            href={cell.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 underline text-sm"
                                          >
                                            {cell.value || 'View File'}
                                          </a>
                                        ) : (
                                          <span className="text-gray-400">-</span>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* View Specification Modal */}
      {showViewSpecificationModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowViewSpecificationModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-6xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900">Purchase Order Distribution</h3>
              <button
                onClick={() => setShowViewSpecificationModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content - Distribution Table */}
            <div className="px-6 py-6">
              {loadingDistribution ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                  <p className="text-gray-600 ml-3">Loading distribution data...</p>
                </div>
              ) : distributionData ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">Year</th>
                        <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700">Jan</th>
                        <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700">Feb</th>
                        <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700">Mar</th>
                        <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700">Apr</th>
                        <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700">May</th>
                        <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700">Jun</th>
                        <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700">Jul</th>
                        <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700">Aug</th>
                        <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700">Sep</th>
                        <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700">Oct</th>
                        <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700">Nov</th>
                        <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700">Dec</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(distributionData) ? (
                        distributionData.map((row: any, index: number) => (
                          <tr key={index} className="bg-white hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2 text-gray-700">{row.year || row.Year || ''}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{row.jan || row.Jan || '0.00'}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{row.feb || row.Feb || '0.00'}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{row.mar || row.Mar || '0.00'}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{row.apr || row.Apr || '0.00'}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{row.may || row.May || '0.00'}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{row.jun || row.Jun || '0.00'}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{row.jul || row.Jul || '0.00'}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{row.aug || row.Aug || '0.00'}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{row.sep || row.Sep || '0.00'}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{row.oct || row.Oct || '0.00'}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{row.nov || row.Nov || '0.00'}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{row.dec || row.Dec || '0.00'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr className="bg-white hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">{distributionData.year || distributionData.Year || '2025'}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{distributionData.jan || distributionData.Jan || '0.00'}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{distributionData.feb || distributionData.Feb || '0.00'}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{distributionData.mar || distributionData.Mar || '0.00'}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{distributionData.apr || distributionData.Apr || '0.00'}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{distributionData.may || distributionData.May || '0.00'}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{distributionData.jun || distributionData.Jun || '0.00'}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{distributionData.jul || distributionData.Jul || '0.00'}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{distributionData.aug || distributionData.Aug || '0.00'}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{distributionData.sep || distributionData.Sep || '0.00'}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{distributionData.oct || distributionData.Oct || '0.00'}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{distributionData.nov || distributionData.Nov || '0.00'}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">{distributionData.dec || distributionData.Dec || '0.00'}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No distribution data available</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t px-6 py-4 flex items-center justify-center rounded-b-lg">
              <Button
                type="button"
                onClick={() => setShowViewSpecificationModal(false)}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

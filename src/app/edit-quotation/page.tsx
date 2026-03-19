'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip } from '@/components/ui/tooltip';
import { ArrowLeft, Save, Loader2, Plus, X, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { quotationsService } from '@/services/quotations-service';
import { purchaseOrdersService } from '@/services/purchase-orders-service';

interface EditQuotationFormData {
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

interface SpecificationFormData {
  division: string;
  serviceName: string;
  serviceDetail: string;
  noOfQuotations: string;
  specification1: string;
  specification1Custom: string;
  specification2: string;
  specification2Custom: string;
  specification3: string;
  specification3Custom: string;
  specification4: string;
  specification4Custom: string;
  specification5: string;
  specification5Custom: string;
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

interface EligibleVendor {
  vendorId: number;
  vendorName: string;
}

function EditQuotationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showSpecificationModal, setShowSpecificationModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showViewSpecificationModal, setShowViewSpecificationModal] = useState(false);
  const [paymentModes, setPaymentModes] = useState<any[]>([]);
  const [billingTypes, setBillingTypes] = useState<any[]>([]);
  const [serviceDetailMappingId, setServiceDetailMappingId] = useState<string | number>('');
  const [specifications, setSpecifications] = useState<any[]>([]);
  const [loadingSpecifications, setLoadingSpecifications] = useState(false);
  const [distributionData, setDistributionData] = useState<any>(null);
  const [loadingDistribution, setLoadingDistribution] = useState(false);
  const [requestId, setRequestId] = useState<string>('');
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [vendorsToShow, setVendorsToShow] = useState<number>(0);
  const [specificationsTableData, setSpecificationsTableData] = useState<SpecificationTableData | null>(null);
  const [loadingSpecificationsTable, setLoadingSpecificationsTable] = useState(false);
  const [eligibleVendors, setEligibleVendors] = useState<EligibleVendor[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<(number | null)[]>([]);
  const [loadingEligibleVendors, setLoadingEligibleVendors] = useState(false);
  const [paymentModeName, setPaymentModeName] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [formData, setFormData] = useState<EditQuotationFormData>({
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

  const [specificationData, setSpecificationData] = useState<SpecificationFormData>({
    division: 'Studio 1 < INR 150000',
    serviceName: 'eLearning-Contract Resources',
    serviceDetail: 'Resource',
    noOfQuotations: '1',
    specification1: '',
    specification1Custom: '',
    specification2: '',
    specification2Custom: '',
    specification3: '',
    specification3Custom: '',
    specification4: '',
    specification4Custom: '',
    specification5: '',
    specification5Custom: '',
  });

  useEffect(() => {
    // Load data from API
    const loadQuotationData = async () => {
      try {
        setLoadingData(true);

        // Fetch payment modes
        const modesData = await quotationsService.getPaymentModes();
        setPaymentModes(modesData || []);

        // Fetch billing types
        const billingTypesData = await quotationsService.getBillingTypes();
        logger.info('Billing types received from API', { billingTypesData });
        logger.info('Billing types is array', { isArray: Array.isArray(billingTypesData) });
        logger.info('Billing types length', { length: billingTypesData?.length });
        if (Array.isArray(billingTypesData)) {
          setBillingTypes(billingTypesData);
        } else {
          logger.error('Billing types is not an array', { type: typeof billingTypesData });
          setBillingTypes([]);
        }

        // Get requestId from URL params or sessionStorage
        const reqId = searchParams.get('requestId');
        const storedData = sessionStorage.getItem('editQuotationData');
        
        if (reqId) {
          setRequestId(reqId);
        }
        
        if (!reqId && !storedData) {
          toast({
            title: 'Error',
            description: 'Request ID not found',
            variant: 'destructive',
          });
          setLoadingData(false);
          return;
        }

        let quotationData;

        if (reqId) {
          // Fetch from API
          logger.info('Edit Quotation - Fetching data from API', { requestId: reqId });
          quotationData = await quotationsService.getQuotationContext(reqId);
          logger.info('Edit Quotation - API data received', { quotationData });
          
          // Store in sessionStorage for future use
          sessionStorage.setItem('editQuotationData', JSON.stringify(quotationData));
        } else {
          // Use stored data
          quotationData = JSON.parse(storedData!);
          logger.info('Edit Quotation - Loaded data from sessionStorage', { quotationData });
        }
        
        // Store serviceDetailMappingId for specification fetching
        if (quotationData.serviceDetailMappingId) {
          setServiceDetailMappingId(quotationData.serviceDetailMappingId);
        }

        // Store vendorsToShow for submission
        if (quotationData.vendorsToShow || quotationData.noOfQuotations) {
          setVendorsToShow(quotationData.vendorsToShow || quotationData.noOfQuotations || 0);
        }

        // Extract selected vendors from specifications vendorCells
        if (quotationData.specifications && quotationData.specifications.length > 0) {
          const vendorCount = quotationData.vendorsToShow || quotationData.noOfQuotations || 0;
          const vendorIds: (number | null)[] = Array(vendorCount).fill(null);
          
          // Get vendorIds from the first specification's vendorCells (they should be same across all specs)
          const firstSpec = quotationData.specifications[0];
          if (firstSpec.vendorCells) {
            firstSpec.vendorCells.forEach((cell: any) => {
              // columnIndex is 1-based, so subtract 1 for array index
              const index = (cell.columnIndex || 1) - 1;
              if (index >= 0 && index < vendorCount && cell.vendorId) {
                vendorIds[index] = cell.vendorId;
              }
            });
          }
          
          logger.info('Setting selectedVendors from API data:', vendorIds);
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
          paymentMode: quotationData.paymentMode || '',
          billingType: quotationData.billingType || '',
          poDescription: quotationData.poDescription || '',
        });

        // Store paymentModeName from API response (null check for Reject button visibility)
        setPaymentModeName(quotationData.paymentModeName !== undefined ? quotationData.paymentModeName : null);

        // Map API response to specification data for Division, Service Name, and Service Detail
        setSpecificationData(prev => ({
          ...prev,
          division: quotationData.requestGroup || quotationData.division || quotationData.divisionName || quotationData.subgroup || quotationData.subgroupName || prev.division,
          serviceName: quotationData.service || quotationData.serviceName || prev.serviceName,
          serviceDetail: quotationData.serviceDetailName || quotationData['Service Details'] || quotationData.serviceDetails || quotationData.serviceDetail || prev.serviceDetail,
        }));

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

  const handlePaymentModeChange = async (value: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMode: value,
    }));
    
    // Only fetch eligible vendors when user changes the payment mode and serviceDetailMappingId exists
    if (serviceDetailMappingId && value) {
      try {
        setLoadingEligibleVendors(true);
        
        const response = await quotationsService.getEligibleVendors(
          serviceDetailMappingId,
          value
        );
        
        setEligibleVendors(response || []);
        setLoadingEligibleVendors(false);
      } catch (error: any) {
        setEligibleVendors([]);
        setLoadingEligibleVendors(false);
      }
    }
  };

  const handleInputChange = (field: keyof EditQuotationFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSpecificationChange = (field: keyof SpecificationFormData, value: string) => {
    setSpecificationData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenSpecificationModal = async () => {
    setShowSpecificationModal(true);
    
    // Fetch specifications if serviceDetailMappingId is available
    if (serviceDetailMappingId) {
      try {
        setLoadingSpecifications(true);
        logger.info('Fetching specifications', { serviceDetailId: serviceDetailMappingId });
        const specsData = await quotationsService.getSpecificationMasters(serviceDetailMappingId);
        logger.info('Specifications data received', { specsData });
        setSpecifications(specsData || []);
        setLoadingSpecifications(false);
      } catch (error: any) {
        logger.error('Error loading specifications:', error);
        toast({
          title: 'Error',
          description: 'Failed to load specifications',
          variant: 'destructive',
        });
        setLoadingSpecifications(false);
      }
    }
  };

  const handleViewSpecification = async () => {
    setShowViewSpecificationModal(true);
    
    // Fetch distribution data if requestId is available
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

  const handleCloseSpecificationModal = () => {
    setShowSpecificationModal(false);
  };

  // Function to refresh quotation data after saving specifications
  const refreshQuotationData = async () => {
    if (!requestId) {
      logger.warn('No requestId available for refreshing quotation data');
      return;
    }

    try {
      logger.info('Refreshing quotation data after save', { requestId });
      
      // Fetch fresh data from API
      const quotationData = await quotationsService.getQuotationContext(requestId);
      logger.info('Refreshed quotation data received', { quotationData });
      
      // Update sessionStorage with fresh data
      sessionStorage.setItem('editQuotationData', JSON.stringify(quotationData));
      
      // Update vendorsToShow if changed
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
        
        logger.info('Refreshed selectedVendors from API data:', vendorIds);
        setSelectedVendors(vendorIds);
      }

      // Refresh the specifications table
      await fetchSpecificationsTable();
      
      logger.info('Quotation data refreshed successfully');
    } catch (error: any) {
      logger.error('Error refreshing quotation data:', error);
      // Don't show error toast - the save was successful, this is just a refresh failure
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
      
      // Get quotation data from sessionStorage
      const storedData = sessionStorage.getItem('editQuotationData');
      if (!storedData) {
        logger.warn('No quotation data found in sessionStorage');
        setLoadingSpecificationsTable(false);
        return;
      }

      const quotationData = JSON.parse(storedData);
      logger.info('Quotation data from sessionStorage', { quotationData });
      
      // Extract specifications from quotationData
      const apiSpecifications = quotationData.specifications || [];
      
      if (!apiSpecifications || apiSpecifications.length === 0) {
        logger.warn('No specifications found in quotation data');
        setSpecificationsTableData(null);
        setLoadingSpecificationsTable(false);
        return;
      }

      // Map API specifications to table format
      const mappedSpecifications: SpecificationRow[] = apiSpecifications.map((spec: any) => {
        // Initialize vendor cells based on vendorsToShow
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
        
        // For "Billing Type" dropdown, use the billing types from API
        let specDropdownOptions = spec.dropdownOptions || [];
        if (specName.toLowerCase() === 'billing type' && specFieldType === 'dropdown' && billingTypes.length > 0) {
          specDropdownOptions = billingTypes.map((bt: any) => bt.name || bt);
          logger.info('Setting Billing Type dropdown options from API:', specDropdownOptions);
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
      
      // Also sync selectedVendors from the mapped specifications data
      if (mappedSpecifications.length > 0) {
        const firstSpec = mappedSpecifications[0];
        const vendorIds: (number | null)[] = firstSpec.vendorCells.map((cell: VendorCell) => cell.vendorId || null);
        logger.info('Syncing selectedVendors from specifications table:', vendorIds);
        setSelectedVendors(vendorIds);
      }
      
      logger.info('Specifications table data loaded from API:', tableData);
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

  const fetchEligibleVendors = async () => {
    // Only fetch if we have a valid serviceDetailMappingId (not empty string, null, or undefined)
    if (!serviceDetailMappingId || serviceDetailMappingId === '' || serviceDetailMappingId === 0) {
      return;
    }

    try {
      setLoadingEligibleVendors(true);
      
      const response = await quotationsService.getEligibleVendors(
        serviceDetailMappingId,
        formData.paymentMode || ''
      );
      
      setEligibleVendors(response || []);
      setLoadingEligibleVendors(false);
    } catch (error: any) {
      // Don't show toast for this non-critical error - vendors can be selected manually if needed
      setEligibleVendors([]);
      setLoadingEligibleVendors(false);
    }
  };

  const handleSaveSpecification = async () => {
    try {
      // Validate required fields
      if (!requestId) {
        toast({
          title: 'Error',
          description: 'Request ID is required',
          variant: 'destructive',
        });
        return;
      }

      if (!serviceDetailMappingId) {
        toast({
          title: 'Error',
          description: 'Service Detail Mapping ID is required',
          variant: 'destructive',
        });
        return;
      }

      // Collect selected specifications (non-empty values, excluding custom inputs)
      const specifications: Array<{ specificationId: number }> = [];
      
      if (specificationData.specification1 && specificationData.specification1 !== 'Add New Specification' && specificationData.specification1 !== '--Select--') {
        specifications.push({ specificationId: Number(specificationData.specification1) });
      }
      if (specificationData.specification2 && specificationData.specification2 !== 'Add New Specification' && specificationData.specification2 !== '--Select--') {
        specifications.push({ specificationId: Number(specificationData.specification2) });
      }
      if (specificationData.specification3 && specificationData.specification3 !== 'Add New Specification' && specificationData.specification3 !== '--Select--') {
        specifications.push({ specificationId: Number(specificationData.specification3) });
      }
      if (specificationData.specification4 && specificationData.specification4 !== 'Add New Specification' && specificationData.specification4 !== '--Select--') {
        specifications.push({ specificationId: Number(specificationData.specification4) });
      }
      if (specificationData.specification5 && specificationData.specification5 !== 'Add New Specification' && specificationData.specification5 !== '--Select--') {
        specifications.push({ specificationId: Number(specificationData.specification5) });
      }

      // Prepare request body
      const requestBody = {
        serviceDetailId: Number(serviceDetailMappingId),
        noOfQuotations: Number(specificationData.noOfQuotations),
        specifications: specifications,
      };

      logger.info('Saving specification data:', requestBody);
      setLoading(true);

      // Call API
      const response = await quotationsService.addSpecifications(requestId, requestBody);
      logger.info('Specification saved successfully:', response);

      toast({
        title: 'Success',
        variant: 'success',
        description: 'Specification saved successfully',
      });

      setLoading(false);
      handleCloseSpecificationModal();
      
      // Refresh the page data to show updated specifications
      await refreshQuotationData();
    } catch (error: any) {
      logger.error('Error saving specification:', error);
      setLoading(false);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save specification',
        variant: 'destructive',
      });
    }
  };

  const handleAddMoreSpecification = () => {
    // Reset form and keep modal open, but preserve division, serviceName, and serviceDetail from API
    setSpecificationData(prev => ({
      division: prev.division,
      serviceName: prev.serviceName,
      serviceDetail: prev.serviceDetail,
      noOfQuotations: '1',
      specification1: '',
      specification1Custom: '',
      specification2: '',
      specification2Custom: '',
      specification3: '',
      specification3Custom: '',
      specification4: '',
      specification4Custom: '',
      specification5: '',
      specification5Custom: '',
    }));

    toast({
      title: 'Info',
      description: 'Form cleared. Add another specification.',
    });
  };

  const handleSaveQuotation = async (submit: boolean) => {
    try {
      setLoading(true);
      logger.info('Saving quotation data:', { formData, submit });

      // Validate required fields
      if (!requestId) {
        toast({
          title: 'Error',
          description: 'Request ID is required',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Validation for Save & Submit: At least one vendor must have both Total Price and Recommendation
      if (submit && specificationsTableData) {
        const totalPriceSpec = specificationsTableData.specifications.find(
          (spec) => spec.specificationName?.toLowerCase() === 'total price'
        );
        const recommendationSpec = specificationsTableData.specifications.find(
          (spec) => spec.specificationName?.toLowerCase() === 'recommended' || 
                   spec.specificationName?.toLowerCase() === 'recommendation'
        );

        let hasValidVendor = false;
        if (totalPriceSpec && recommendationSpec) {
          // Check each vendor column
          for (let i = 0; i < vendorsToShow; i++) {
            // Check if vendor is selected from dropdown (not empty or null)
            const isVendorSelected = selectedVendors[i] !== null && selectedVendors[i] !== undefined && selectedVendors[i] !== 0;
            const totalPriceValue = totalPriceSpec.vendorCells[i]?.value?.trim();
            const recommendationValue = recommendationSpec.vendorCells[i]?.value?.toLowerCase();
            // Check if Total Price is populated AND Recommendation checkbox is checked (true/Yes)
            const isRecommendationChecked = recommendationValue === 'true' || recommendationValue === 'yes';
            
            // All three conditions must be met: vendor selected, total price filled, recommendation checked
            if (isVendorSelected && totalPriceValue && isRecommendationChecked) {
              hasValidVendor = true;
              break;
            }
          }
        }

        if (!hasValidVendor) {
          toast({
            title: 'Error',
            description: 'At least one selected specification vendor must have Vendor selected, Total Price filled, and Recommendation checked',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
      }

      // Prepare FormData for multipart/form-data
      const submitFormData = new FormData();
      
      // Add form fields
      submitFormData.append('RequestId', requestId);
      submitFormData.append('VendorsToShow', vendorsToShow.toString());
      submitFormData.append('PaymentMode', formData.paymentMode || '0');
      submitFormData.append('StartDate', formData.startDate);
      submitFormData.append('EndDate', formData.endDate);
      submitFormData.append('PODescription', formData.poDescription);
      submitFormData.append('Submit', submit.toString());

      // Build specifications array from specificationsTableData with proper field type handling
      const specificationsArray = specificationsTableData?.specifications.map((spec) => ({
        specificationId: spec.specificationId || 0,
        specificationName: spec.specificationName || '',
        vendorCells: spec.vendorCells.map((cell, columnIndex) => {
          const fieldType = spec.fieldType?.toLowerCase() || 'text';
          const isCheckbox = fieldType === 'checkbox';
          const isHyperlink = fieldType === 'hyperlink';
          
          // Determine recommended: true only for "Recommended" checkbox when value is "true" or "Yes"
          const isRecommended = isCheckbox && 
            spec.specificationName?.toLowerCase() === 'recommended' && 
            (cell.value?.toLowerCase() === 'true' || cell.value?.toLowerCase() === 'yes');
          
          // Determine textValue based on field type
          let textValue: string | null = null;
          if (!isCheckbox && !isHyperlink) {
            // For text and dropdown types, use the value
            textValue = cell.value || null;
          }
          
          // Determine existingFileStoredName based on field type
          let existingFileStoredName: string | null = null;
          if (isHyperlink && cell.value) {
            // For hyperlink type, use the filename from value
            existingFileStoredName = cell.value;
          }
          
          return {
            columnIndex: columnIndex + 1, // API expects 1-based index
            vendorId: cell.vendorId || selectedVendors[columnIndex] || 0,
            recommended: isRecommended,
            textValue: textValue,
            existingFileStoredName: existingFileStoredName
          };
        })
      })) || [];
      logger.info('Specifications table data for conversion', { specificationsTableData });
      submitFormData.append('specifications', JSON.stringify(specificationsArray));
      logger.info('Specifications payload', { specificationsArray });

      // Add uploaded file if exists
      if (uploadedDocument) {
        submitFormData.append('files', uploadedDocument);
      }

      // Call API
      const response = await quotationsService.submitQuotation(requestId, submitFormData);
      logger.info('Quotation saved successfully:', response);

      toast({
        title: 'Success',
        variant: 'success',
        description: submit ? 'Quotation submitted successfully' : 'Quotation saved successfully',
      });

      // Navigate back to manage quotations only if submitted
      if (submit) {
        router.push('/manage-quotations');
      }
    } catch (error: any) {
      logger.error('Error saving quotation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save quotation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleRejectQuotation = async () => {
    if (!requestId) {
      toast({
        title: 'Error',
        description: 'Request ID is required',
        variant: 'destructive',
      });
      return;
    }

    if (!rejectReason.trim()) {
      toast({
        title: 'Error',
        description: 'Reject Reason is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setRejecting(true);
      await quotationsService.rejectQuotation(requestId, rejectReason.trim());
      toast({
        title: 'Success',
        description: 'Quotation rejected successfully',
        variant: 'success',
      });
      router.push('/quotations');
    } catch (error: any) {
      logger.error('Error rejecting quotation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject quotation',
        variant: 'destructive',
      });
    } finally {
      setRejecting(false);
    }
  };

  const handleSpecificationCellChange = (specIndex: number, vendorIndex: number, value: string) => {
    if (!specificationsTableData) return;
    
    const updatedData = { ...specificationsTableData };
    updatedData.specifications[specIndex].vendorCells[vendorIndex].value = value;
    setSpecificationsTableData(updatedData);
  };

  const handleSpecificationFileUpload = (specIndex: number, vendorIndex: number, file: File) => {
    if (!specificationsTableData) return;
    
    const updatedData = { ...specificationsTableData };
    updatedData.specifications[specIndex].vendorCells[vendorIndex].value = file.name;
    updatedData.specifications[specIndex].vendorCells[vendorIndex].fileUrl = URL.createObjectURL(file);
    setSpecificationsTableData(updatedData);
    
    toast({
      title: 'File Uploaded',
      description: `${file.name} uploaded successfully`,
    });
  };

  const handleVendorSelect = (vendorIndex: number, vendorId: number) => {
    const updatedSelections = [...selectedVendors];
    updatedSelections[vendorIndex] = vendorId;
    setSelectedVendors(updatedSelections);
    
    // Update all specification cells for this vendor with vendorId and vendorName
    if (specificationsTableData) {
      const vendor = eligibleVendors.find(v => v.vendorId === vendorId);
      if (vendor) {
        const updatedData = { ...specificationsTableData };
        updatedData.specifications.forEach(spec => {
          if (spec.vendorCells[vendorIndex]) {
            spec.vendorCells[vendorIndex].vendorId = vendor.vendorId;
            spec.vendorCells[vendorIndex].vendorName = vendor.vendorName;
          }
        });
        setSpecificationsTableData(updatedData);
      }
    }
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
              <h3 className="text-lg font-semibold">Edit Quotation</h3>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleViewSpecification}
              variant="outline"
              className="cus-primary-btn font-normal text-xs gap-2 bg-vendor-600 hover:bg-vendor-700"
            >
              <Eye className="h-4 w-4" />
              View Distribution
            </Button>
            <Button
              type="button"
              onClick={handleOpenSpecificationModal}
              variant="outline"
              className="cus-primary-btn font-normal text-xs gap-2 bg-vendor-600 hover:bg-vendor-700"
            >
              <Plus className="h-4 w-4" />
              Add Specification
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
                    onChange={(e) => handleInputChange('requestNumber', e.target.value)}
                    placeholder="Enter request number"
                    disabled={true}
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
                    onChange={(e) => handleInputChange('requestGroup', e.target.value)}
                    placeholder="Enter request group"
                    disabled={true}
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
                    onChange={(e) => handleInputChange('subgroup', e.target.value)}
                    placeholder="Enter subgroup"
                    disabled={true}
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
                    onChange={(e) => handleInputChange('projectProposal', e.target.value)}
                    placeholder="Enter project/proposal"
                    disabled={true}
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
                    onChange={(e) => handleInputChange('service', e.target.value)}
                    placeholder="Enter service"
                    disabled={true}
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
                    onChange={(e) => handleInputChange('serviceDetails', e.target.value)}
                    placeholder="Enter service details"
                    disabled={true}
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
                    onChange={(e) => handleInputChange('request', e.target.value)}
                    placeholder="Enter request"
                    disabled={true}
                    className="bg-gray-50"
                  />
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    disabled={true}
                    className="bg-gray-50"
                  />
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    disabled={true}
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
                    onChange={(e) => handleInputChange('requestType', e.target.value)}
                    placeholder="Enter request type"
                    disabled={true}
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
                    onChange={(e) => handleInputChange('advanceReceived', e.target.value)}
                    placeholder="Enter advance received"
                    disabled={true}
                    className="bg-gray-50"
                  />
                </div>

                {/* Payment Mode */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Payment Mode
                  </label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => handlePaymentModeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white hover:border-gray-400 transition-colors duration-200"
                  >
                    <option value="">--Select--</option>
                    {paymentModes.map((mode, index) => (
                      <option key={index} value={mode.id || mode.name || mode}>
                        {mode.name || mode}
                      </option>
                    ))}
                  </select>
                </div>

              

                {/* Description - Full Width */}
                <div className="space-y-2 md:col-span-3">
                  <label className="text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter description"
                    rows={3}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 resize-none bg-gray-50"
                  />
                </div>

                {/* Upload Document - Full Width */}
                <div className="space-y-2 md:col-span-3">
                  <label className="text-sm font-medium text-gray-700">
                    Upload Document
                  </label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadedDocument(file);
                        }
                      }}
                      className="flex-1"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    />
                    {uploadedDocument && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{uploadedDocument.name}</span>
                        <button
                          type="button"
                          onClick={() => setUploadedDocument(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* PO Description - Full Width */}
                <div className="space-y-2 md:col-span-3">
                  <label className="text-sm font-medium text-gray-700">
                    PO Description
                  </label>
                  <textarea
                    value={formData.poDescription}
                    onChange={(e) => handleInputChange('poDescription', e.target.value)}
                    placeholder="Enter PO description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 resize-none"
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
                              <select
                                value={selectedVendors[index] || ''}
                                onChange={(e) => handleVendorSelect(index, Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white font-semibold text-gray-900"
                                disabled={loadingEligibleVendors}
                              >
                                <option value="">
                                  {loadingEligibleVendors ? 'Loading...' : 'Select Vendor'}
                                </option>
                                {/* Show pre-selected vendors from API that may not be in eligibleVendors */}
                                {selectedVendors[index] && !eligibleVendors.some(v => v.vendorId === selectedVendors[index]) && specificationsTableData?.specifications[0]?.vendorCells[index]?.vendorId && (
                                  <option key={specificationsTableData.specifications[0].vendorCells[index].vendorId} value={specificationsTableData.specifications[0].vendorCells[index].vendorId}>
                                    {specificationsTableData.specifications[0].vendorCells[index].vendorName || `Vendor ${specificationsTableData.specifications[0].vendorCells[index].vendorId}`}
                                  </option>
                                )}
                                {eligibleVendors.map((vendor) => (
                                  <option key={vendor.vendorId} value={vendor.vendorId}>
                                    {vendor.vendorName}
                                  </option>
                                ))}
                              </select>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {specificationsTableData.specifications.map((spec, specIndex) => (
                          <tr key={spec.specificationId} className="bg-white hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">
                              {spec.specificationName}
                            </td>
                            {spec.vendorCells.map((cell, vendorIndex) => (
                              <td key={vendorIndex} className="border border-gray-300 px-4 py-3">
                                {spec.fieldType === 'text' && (
                                  <Input
                                    type={spec.specificationName?.toLowerCase() === 'billing type value' ? 'number' : 'text'}
                                    value={cell.value}
                                    onChange={(e) => {
                                      // For "Billing Type Value" field, only allow numeric values
                                      if (spec.specificationName?.toLowerCase() === 'billing type value') {
                                        const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                                        handleSpecificationCellChange(specIndex, vendorIndex, numericValue);
                                      } else {
                                        handleSpecificationCellChange(specIndex, vendorIndex, e.target.value);
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      // For "Billing Type Value" field, prevent non-numeric key presses
                                      if (spec.specificationName?.toLowerCase() === 'billing type value') {
                                        const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', '.'];
                                        if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
                                          e.preventDefault();
                                        }
                                        // Prevent multiple decimal points
                                        if (e.key === '.' && (e.currentTarget as HTMLInputElement).value.includes('.')) {
                                          e.preventDefault();
                                        }
                                      }
                                    }}
                                    placeholder="Enter value"
                                    className="w-full"
                                  />
                                )}
                                {spec.fieldType === 'checkbox' && (
                                  <div className="flex items-center justify-center">
                                    <input
                                      type="checkbox"
                                      checked={cell.value?.toLowerCase() === 'true' || cell.value?.toLowerCase() === 'yes'}
                                      onChange={(e) => handleSpecificationCellChange(specIndex, vendorIndex, e.target.checked ? 'Yes' : 'No')}
                                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                  </div>
                                )}
                                {spec.fieldType === 'dropdown' && (
                                  <select
                                    value={cell.value}
                                    onChange={(e) => handleSpecificationCellChange(specIndex, vendorIndex, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white"
                                  >
                                    <option value="">--Select--</option>
                                    {spec.dropdownOptions?.map((option, optIndex) => (
                                      <option key={optIndex} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                )}
                                {spec.fieldType === 'hyperlink' && (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="file"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleSpecificationFileUpload(specIndex, vendorIndex, file);
                                        }
                                      }}
                                      className="flex-1"
                                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                    />
                                    {cell.fileUrl && (
                                      <a
                                        href={cell.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 underline text-sm whitespace-nowrap"
                                      >
                                        View
                                      </a>
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

              {/* Reject Reason Field - visible when paymentModeName is null */}
              {paymentModeName === null && (
                <div className="space-y-2 mt-6">
                  <label className="text-sm font-medium text-gray-700">
                    Reject Reason <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reject reason"
                    className="w-full"
                    disabled={loading || rejecting}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  className="text-xs gap-2 cus-secondary-reset-btn"
                  onClick={handleCancel}
                  disabled={loading || rejecting}
                >
                  Cancel
                </Button>
                {paymentModeName === null && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="text-xs gap-2 cus-secondary-reset-btn"
                    onClick={handleRejectQuotation}
                    disabled={loading || rejecting}
                   
                  >
                    {rejecting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      'Reject'
                    )}
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="ghost"
                  className="gap-2 text-xs cus-primary-submit-btn"
                  onClick={() => handleSaveQuotation(false)}
                  disabled={loading || rejecting}
                  
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {/* <Save className="h-4 w-4" /> */}
                      Save
                    </>
                  )}
                </Button>
                <Button
                  type="submit"
                  variant="ghost"
                  className="gap-2 text-xs cus-primary-submit-btn"
                  onClick={() => handleSaveQuotation(true)}
                  disabled={loading || rejecting}
                  
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      {/* <Save className="h-4 w-4" /> */}
                      Save & Submit
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
          </>
        )}
      </div>

      {/* Add Specification Modal */}
      {showSpecificationModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseSpecificationModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900">Add Specification</h3>
              <button
                onClick={handleCloseSpecificationModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4">
              {/* Instructions Section - Collapsible */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg mb-6">
                <button
                  type="button"
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-blue-100 transition-colors rounded-lg"
                >
                  <h4 className="font-semibold text-blue-900">Instructions</h4>
                  {showInstructions ? (
                    <ChevronUp className="h-5 w-5 text-blue-900" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-blue-900" />
                  )}
                </button>
                {showInstructions && (
                  <div className="px-4 pb-4">
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li><strong>Step 1:</strong> Please mention the parameters required to assess the vendors.</li>
                      <li><strong>Step 2:</strong> Choose from the dropdown list provided.</li>
                      <li><strong>Step 3:</strong> If the parameter does not exist, create your own by selecting - Add New Specification.</li>
                      <li><strong>Step 4:</strong> Add the required parameter in the textbox.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Division */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Division <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={specificationData.division}
                    onChange={(e) => handleSpecificationChange('division', e.target.value)}
                    disabled={true}
                    className="bg-gray-50"
                  />
                </div>

                {/* Service Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Service Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={specificationData.serviceName}
                    onChange={(e) => handleSpecificationChange('serviceName', e.target.value)}
                    disabled={true}
                    className="bg-gray-50"
                  />
                </div>

                {/* Service Detail */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Service Detail <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={specificationData.serviceDetail}
                    onChange={(e) => handleSpecificationChange('serviceDetail', e.target.value)}
                    disabled={true}
                    className="bg-gray-50"
                  />
                </div>

                {/* No. of Quotations */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    No. of Quotations <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={specificationData.noOfQuotations}
                    onChange={(e) => handleSpecificationChange('noOfQuotations', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>

                {/* Specification 1 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Specification 1
                  </label>
                  <select
                    value={specificationData.specification1}
                    onChange={(e) => handleSpecificationChange('specification1', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white"
                    disabled={loadingSpecifications}
                  >
                    <option value="">{loadingSpecifications ? 'Loading...' : '--Select--'}</option>
                    {!loadingSpecifications && specifications.map((spec, index) => (
                      <option key={index} value={spec.id || spec.name || spec}>
                        {spec.name || spec}
                      </option>
                    ))}
                    <option value="Add New Specification">Add New Specification</option>
                  </select>
                </div>

                {/* Specification 1 Custom Input */}
                {specificationData.specification1 === 'Add New Specification' && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Custom Specification 1
                    </label>
                    <Input
                      type="text"
                      value={specificationData.specification1Custom}
                      onChange={(e) => handleSpecificationChange('specification1Custom', e.target.value)}
                      placeholder="Enter custom specification"
                    />
                  </div>
                )}

                {/* Specification 2 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Specification 2
                  </label>
                  <select
                    value={specificationData.specification2}
                    onChange={(e) => handleSpecificationChange('specification2', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white"
                    disabled={loadingSpecifications}
                  >
                    <option value="">{loadingSpecifications ? 'Loading...' : '--Select--'}</option>
                    {!loadingSpecifications && specifications.map((spec, index) => (
                      <option key={index} value={spec.id || spec.name || spec}>
                        {spec.name || spec}
                      </option>
                    ))}
                    <option value="Add New Specification">Add New Specification</option>
                  </select>
                </div>

                {/* Specification 2 Custom Input */}
                {specificationData.specification2 === 'Add New Specification' && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Custom Specification 2
                    </label>
                    <Input
                      type="text"
                      value={specificationData.specification2Custom}
                      onChange={(e) => handleSpecificationChange('specification2Custom', e.target.value)}
                      placeholder="Enter custom specification"
                    />
                  </div>
                )}

                {/* Specification 3 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Specification 3
                  </label>
                  <select
                    value={specificationData.specification3}
                    onChange={(e) => handleSpecificationChange('specification3', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white"
                    disabled={loadingSpecifications}
                  >
                    <option value="">{loadingSpecifications ? 'Loading...' : '--Select--'}</option>
                    {!loadingSpecifications && specifications.map((spec, index) => (
                      <option key={index} value={spec.id || spec.name || spec}>
                        {spec.name || spec}
                      </option>
                    ))}
                    <option value="Add New Specification">Add New Specification</option>
                  </select>
                </div>

                {/* Specification 3 Custom Input */}
                {specificationData.specification3 === 'Add New Specification' && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Custom Specification 3
                    </label>
                    <Input
                      type="text"
                      value={specificationData.specification3Custom}
                      onChange={(e) => handleSpecificationChange('specification3Custom', e.target.value)}
                      placeholder="Enter custom specification"
                    />
                  </div>
                )}

                {/* Specification 4 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Specification 4
                  </label>
                  <select
                    value={specificationData.specification4}
                    onChange={(e) => handleSpecificationChange('specification4', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white"
                    disabled={loadingSpecifications}
                  >
                    <option value="">{loadingSpecifications ? 'Loading...' : '--Select--'}</option>
                    {!loadingSpecifications && specifications.map((spec, index) => (
                      <option key={index} value={spec.id || spec.name || spec}>
                        {spec.name || spec}
                      </option>
                    ))}
                    <option value="Add New Specification">Add New Specification</option>
                  </select>
                </div>

                {/* Specification 4 Custom Input */}
                {specificationData.specification4 === 'Add New Specification' && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Custom Specification 4
                    </label>
                    <Input
                      type="text"
                      value={specificationData.specification4Custom}
                      onChange={(e) => handleSpecificationChange('specification4Custom', e.target.value)}
                      placeholder="Enter custom specification"
                    />
                  </div>
                )}

                {/* Specification 5 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Specification 5
                  </label>
                  <select
                    value={specificationData.specification5}
                    onChange={(e) => handleSpecificationChange('specification5', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white"
                    disabled={loadingSpecifications}
                  >
                    <option value="">{loadingSpecifications ? 'Loading...' : '--Select--'}</option>
                    {!loadingSpecifications && specifications.map((spec, index) => (
                      <option key={index} value={spec.id || spec.name || spec}>
                        {spec.name || spec}
                      </option>
                    ))}
                    <option value="Add New Specification">Add New Specification</option>
                  </select>
                </div>

                {/* Specification 5 Custom Input */}
                {specificationData.specification5 === 'Add New Specification' && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Custom Specification 5
                    </label>
                    <Input
                      type="text"
                      value={specificationData.specification5Custom}
                      onChange={(e) => handleSpecificationChange('specification5Custom', e.target.value)}
                      placeholder="Enter custom specification"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex items-center justify-end gap-3 rounded-b-lg">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseSpecificationModal}
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={handleSaveSpecification}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

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

export default function EditQuotationPage() {
  return (
    <Suspense fallback={null}>
      <EditQuotationPageContent />
    </Suspense>
  );
}

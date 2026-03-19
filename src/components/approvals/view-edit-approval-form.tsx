'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Edit, Save, X, CheckCircle, XCircle } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { getFormattedGroups, getFormattedRequestTypes } from '@/services/groups-service';
import { subgroupsService } from '@/services/subgroups-service';
import { servicesService } from '@/services/services-service';
import { serviceDetailsService } from '@/services/service-details-service';
import { envConfig } from '@/config/env-validation';

interface ViewEditApprovalFormProps {
  requestId: number;
  initialData: any;
  isPoApproval?: boolean;
}

interface DropdownOption {
  id: number | string;
  name: string;
}

interface VendorSpecification {
  vendorName: string;
  quotationName: string;
  totalPrice: number | string;
  recommended: boolean;
  quotation: string;
  billingType: string;
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

interface FormData {
  requestNumber: string;
  groupId: number;
  subgroupId: number;
  requestGroup: string;
  subgroupName: string;
  projectProposalId: string;
  serviceId: number;
  startDate: string;
  endDate: string;
  serviceDetailsId: number;
  requestDescription: string;
  requestTypeId: number;
  currencyId: number;
  documentUrl: string;
  commentsHistory: string;
  uploadDocument: File | null;
  comments: string;
}

export default function ViewEditApprovalForm({ requestId, initialData, isPoApproval = false }: ViewEditApprovalFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string>('');
  const [approverType, setApproverType] = useState<string>('');
  const [vendorSpecifications, setVendorSpecifications] = useState<VendorSpecification[]>([]);
  const [specificationsTableData, setSpecificationsTableData] = useState<SpecificationTableData | null>(null);
  const [selectedVendors, setSelectedVendors] = useState<(number | null)[]>([]);
  const [commentsHistoryHtml, setCommentsHistoryHtml] = useState<string>('');

  // Dropdown options
  const [groupOptions, setGroupOptions] = useState<DropdownOption[]>([]);
  const [subgroupOptions, setSubgroupOptions] = useState<DropdownOption[]>([]);
  const [requestTypeOptions, setRequestTypeOptions] = useState<DropdownOption[]>([]);
  const [serviceOptions, setServiceOptions] = useState<DropdownOption[]>([]);
  const [serviceDetailsOptions, setServiceDetailsOptions] = useState<DropdownOption[]>([]);
  const [currencyOptions, setCurrencyOptions] = useState<DropdownOption[]>([
    { id: 1, name: 'USD' },
    { id: 2, name: 'EUR' },
    { id: 3, name: 'GBP' },
    { id: 4, name: 'INR' },
    { id: 5, name: 'CAD' },
  ]);

  // Loading states
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingSubgroups, setLoadingSubgroups] = useState(false);
  const [loadingRequestTypes, setLoadingRequestTypes] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingServiceDetails, setLoadingServiceDetails] = useState(false);

  // Form data
  const [formData, setFormData] = useState<FormData>({
    requestNumber: '',
    groupId: -1,
    subgroupId: -1,
    requestGroup: '',
    subgroupName: '',
    projectProposalId: '',
    serviceId: -1,
    startDate: '',
    endDate: '',
    serviceDetailsId: -1,
    requestDescription: '',
    requestTypeId: -1,
    currencyId: -1,
    documentUrl: '',
    commentsHistory: '',
    uploadDocument: null,
    comments: '',
  });

  const isPopulatingData = useRef(false);

  // Fetch dropdown options on mount
  useEffect(() => {
    fetchGroups();
    fetchRequestTypes();
    fetchServices();
  }, []);

  // Fetch context data (vendor specifications and comments) on mount
  // Skip if isPoApproval is true since data is already passed from parent
  useEffect(() => {
    if (requestId && !isPoApproval) {
      fetchContextData();
    }
  }, [requestId, isPoApproval]);

  // Fetch subgroups when group changes
  useEffect(() => {
    if (formData.groupId && formData.groupId !== -1) {
      fetchSubgroups(formData.groupId);
    } else {
      setSubgroupOptions([]);
      setFormData(prev => ({ ...prev, subgroupId: -1 }));
    }
  }, [formData.groupId]);

  // Fetch service details when service changes
  useEffect(() => {
    if (formData.serviceId && formData.serviceId !== -1 && !isPopulatingData.current) {
      fetchServiceDetails(formData.serviceId);
    } else if (!isPopulatingData.current) {
      setServiceDetailsOptions([]);
      setFormData(prev => ({ ...prev, serviceDetailsId: -1 }));
    }
  }, [formData.serviceId]);

  // Populate form with initial data - wait for options to be loaded
  useEffect(() => {
    if (initialData && groupOptions.length > 0 && requestTypeOptions.length > 0 && serviceOptions.length > 0) {
      populateFormData(initialData);
    }
  }, [initialData, groupOptions, requestTypeOptions, serviceOptions]);

  const populateFormData = async (data: any) => {
    isPopulatingData.current = true;
    // Handle both PascalCase and camelCase from API
    const apiData = data.data || data.Data || data;
    
    console.log('Populating form with API data:', apiData);
    
    // Extract request status
    const status = apiData.requestStatus || apiData.RequestStatus || '';
    setRequestStatus(status);
    
    // Get IDs or names from API
    let groupId = apiData.groupId || apiData.GroupId || -1;
    let subgroupId = apiData.subgroupId || apiData.SubgroupId || -1;
    // API Key: groupName - Map to Request Group dropdown
    const groupName = apiData.groupName || apiData.GroupName || '';
    const subgroupName = apiData.subgroupName || apiData.SubgroupName || '';
    
    console.log('Initial IDs - groupId:', groupId, 'subgroupId:', subgroupId);
    console.log('Names from API - groupName:', groupName, 'subgroupName:', subgroupName);
    
    // If groupId is -1 or we have groupName, find the ID from options by matching groupName
    if (groupName && groupOptions.length > 0) {
      console.log('Searching for group by name:', groupName);
      console.log('Available groups:', groupOptions);
      
      const matchedGroup = groupOptions.find(opt => 
        opt.name.toLowerCase().trim() === groupName.toLowerCase().trim() || 
        opt.name.toLowerCase().includes(groupName.toLowerCase()) ||
        groupName.toLowerCase().includes(opt.name.toLowerCase())
      );
      
      if (matchedGroup) {
        groupId = Number(matchedGroup.id);
        console.log('Matched group by name:', matchedGroup, 'ID:', groupId);
      } else {
        console.warn('No matching group found for name:', groupName);
      }
    }
    
    // Get service ID
    // API Key: service - Map to Service dropdown
    let serviceId = apiData.serviceId || apiData.ServiceId || -1;
    const serviceName = apiData.service || apiData.Service || apiData.serviceName || apiData.ServiceName || '';
    
    console.log('Service from API - serviceId:', serviceId, 'serviceName:', serviceName);
    
    if (serviceName && serviceOptions.length > 0) {
      console.log('Searching for service by name:', serviceName);
      const matchedService = serviceOptions.find(opt => 
        opt.name.toLowerCase().trim() === serviceName.toLowerCase().trim() ||
        opt.name.toLowerCase().includes(serviceName.toLowerCase()) ||
        serviceName.toLowerCase().includes(opt.name.toLowerCase())
      );
      if (matchedService) {
        serviceId = Number(matchedService.id);
        console.log('Matched service by name:', matchedService, 'ID:', serviceId);
      } else {
        console.warn('No matching service found for name:', serviceName);
      }
    }
    
    // Get request type ID
    let requestTypeId = apiData.requestTypeId || apiData.RequestTypeId || -1;
    const requestTypeName = apiData.requestTypeName || apiData.RequestTypeName || '';
    
    if (requestTypeId === -1 && requestTypeName && requestTypeOptions.length > 0) {
      const matchedType = requestTypeOptions.find(opt => 
        opt.name.toLowerCase() === requestTypeName.toLowerCase()
      );
      if (matchedType) {
        requestTypeId = Number(matchedType.id);
      }
    }
    
    // Get currency ID - prioritize currencyName lookup since backend IDs may differ from frontend IDs
    let currencyId = -1;
    const currencyName = apiData.currencyName || apiData.CurrencyName || '';
    
    // First try to match by currencyName (more reliable)
    if (currencyName && currencyOptions.length > 0) {
      const matchedCurrency = currencyOptions.find(opt => 
        opt.name.toLowerCase().includes(currencyName.toLowerCase()) ||
        currencyName.toLowerCase().includes(opt.name.toLowerCase())
      );
      if (matchedCurrency) {
        currencyId = Number(matchedCurrency.id);
      }
    }
    
    // Fall back to currencyId from API only if name lookup failed
    if (currencyId === -1) {
      currencyId = apiData.currencyId || apiData.CurrencyId || -1;
    }
    
    // Set form data with resolved IDs
    setFormData({
      requestNumber: apiData.requestNumber || apiData.RequestNumber || '',
      groupId: groupId,
      subgroupId: -1, // Will be set after subgroups are loaded
      requestGroup: apiData.requestGroup || apiData.RequestGroup || apiData.groupName || apiData.GroupName || '',
      subgroupName: apiData.subgroupName || apiData.SubgroupName || '',
      projectProposalId: apiData.projectProposalId || apiData.ProjectProposalId || apiData.pantherProjectProposalId || apiData.PantherProjectProposalId || apiData.projectProposalId || '',
      serviceId: serviceId,
      startDate: formatDateForInput(apiData.startDate || apiData.StartDate || ''),
      endDate: formatDateForInput(apiData.endDate || apiData.EndDate || ''),
      serviceDetailsId: -1, // Will be set after service details are loaded
      requestDescription: apiData.requestDescription || apiData.RequestDescription || '',
      requestTypeId: requestTypeId,
      currencyId: currencyId,
      documentUrl: apiData.documentUrl || apiData.DocumentUrl || apiData.documentPath || apiData.DocumentPath || '',
      commentsHistory: '',
      uploadDocument: null,
      comments: '',
    });
    
    // If we have a groupId, fetch subgroups and then set subgroupId
    if (groupId !== -1) {
      console.log('Fetching subgroups for groupId:', groupId);
      const fetchedSubgroups = await fetchSubgroups(groupId);
      console.log('Fetched subgroups:', fetchedSubgroups);
      
      // Use the returned subgroups directly instead of waiting for state update
      console.log('Looking for subgroupId:', subgroupId, 'or name:', subgroupName);
      
      // First try to use the subgroupId directly if it exists
      if (subgroupId !== -1) {
        console.log('Using direct subgroupId:', subgroupId);
        // Verify the subgroup exists in the fetched list
        const subgroupExists = fetchedSubgroups.some(opt => Number(opt.id) === subgroupId);
        if (subgroupExists) {
          setFormData(prev => ({ ...prev, subgroupId }));
        } else {
          console.warn('SubgroupId', subgroupId, 'not found in fetched subgroups');
        }
      } 
      // Otherwise try to match by name
      else if (subgroupName && fetchedSubgroups.length > 0) {
        const matchedSubgroup = fetchedSubgroups.find(opt => 
          opt.name.toLowerCase().trim() === subgroupName.toLowerCase().trim() ||
          opt.name.toLowerCase().includes(subgroupName.toLowerCase()) ||
          subgroupName.toLowerCase().includes(opt.name.toLowerCase())
        );
        
        if (matchedSubgroup) {
          const matchedSubgroupId = Number(matchedSubgroup.id);
          console.log('Matched subgroup by name:', matchedSubgroup, 'ID:', matchedSubgroupId);
          setFormData(prev => ({ ...prev, subgroupId: matchedSubgroupId }));
        } else {
          console.warn('No matching subgroup found for name:', subgroupName);
        }
      }
    }
    
    // If we have a serviceId, fetch service details and then set serviceDetailsId
    if (serviceId !== -1) {
      console.log('Fetching service details for serviceId:', serviceId);
      const fetchedServiceDetails = await fetchServiceDetails(serviceId);
      console.log('Fetched service details:', fetchedServiceDetails);
      
      // API Key: serviceDetails - Map to Service Details dropdown
      let serviceDetailsId = apiData.serviceDetailsId || apiData.ServiceDetailsId || -1;
      const serviceDetailsName = apiData.serviceDetails || apiData.ServiceDetails || apiData.serviceDetailsName || apiData.ServiceDetailsName || '';
      
      console.log('Looking for serviceDetailsId:', serviceDetailsId, 'or name:', serviceDetailsName);
      
      // Try to match by name if we have it (prioritize name matching since API returns name)
      if (serviceDetailsName && fetchedServiceDetails.length > 0) {
        console.log('Attempting to match service detail by name:', serviceDetailsName);
        console.log('Available service details:', fetchedServiceDetails);
        
        const matchedServiceDetail = fetchedServiceDetails.find(opt => 
          opt.name.toLowerCase().trim() === serviceDetailsName.toLowerCase().trim() ||
          opt.name.toLowerCase().includes(serviceDetailsName.toLowerCase()) ||
          serviceDetailsName.toLowerCase().includes(opt.name.toLowerCase())
        );
        
        if (matchedServiceDetail) {
          const matchedServiceDetailId = Number(matchedServiceDetail.id);
          console.log('Matched service detail by name:', matchedServiceDetail, 'ID:', matchedServiceDetailId);
          setFormData(prev => ({ ...prev, serviceDetailsId: matchedServiceDetailId }));
        } else {
          console.warn('No matching service detail found for name:', serviceDetailsName);
          console.warn('Available options:', fetchedServiceDetails.map(opt => opt.name));
        }
      }
      // Fallback: try to use the serviceDetailsId directly if it exists
      else if (serviceDetailsId !== -1) {
        console.log('Using direct serviceDetailsId:', serviceDetailsId);
        const serviceDetailExists = fetchedServiceDetails.some(opt => Number(opt.id) === serviceDetailsId);
        if (serviceDetailExists) {
          setFormData(prev => ({ ...prev, serviceDetailsId }));
        } else {
          console.warn('ServiceDetailsId', serviceDetailsId, 'not found in fetched service details');
        }
      }
    }
    
    isPopulatingData.current = false;
  };

  const fetchContextData = async () => {
    try {
      const response = await fetch(`${envConfig.apiBaseUrl}/approvals/${requestId}/context`);
      if (!response.ok) {
        throw new Error('Failed to fetch context data');
      }
      const contextData = await response.json();
      const data = contextData.data || contextData.Data || contextData;
      
      // Extract and set vendor specifications (legacy format)
      const vendorSpecs = data.vendorSpecifications || data.VendorSpecifications || data.vendorQuotations || data.VendorQuotations || [];
      if (Array.isArray(vendorSpecs)) {
        const mappedSpecs = vendorSpecs.map((spec: any) => ({
          vendorName: spec.vendorName || spec.VendorName || '',
          quotationName: spec.quotationName || spec.QuotationName || spec.quotationNumber || spec.QuotationNumber || '',
          totalPrice: spec.totalPrice || spec.TotalPrice || spec.price || spec.Price || 0,
          recommended: spec.recommended || spec.Recommended || spec.isRecommended || spec.IsRecommended || false,
          quotation: spec.quotation || spec.Quotation || spec.quotationDetails || spec.QuotationDetails || '',
          billingType: spec.billingType || spec.BillingType || spec.billing || spec.Billing || '',
        }));
        setVendorSpecifications(mappedSpecs);
      }
      
      // Extract and map specifications to table format (new format matching View Quotation)
      const specifications = data.specifications || data.Specifications || [];
      if (Array.isArray(specifications) && specifications.length > 0) {
        // Determine number of vendors from first specification
        const vendorsCount = specifications[0]?.vendorCells?.length || 2;
        
        const mappedSpecifications: SpecificationRow[] = specifications.map((spec: any) => {
          const vendorCells: VendorCell[] = Array(vendorsCount).fill(null).map((_, index) => {
            const cellData = spec.vendorCells?.[index] || {};
            return {
              value: cellData.textValue || cellData.value || '',
              fileUrl: cellData.fileUrl || '',
              vendorId: cellData.vendorId || undefined,
              vendorName: cellData.vendorName || undefined
            };
          });

          return {
            specificationId: spec.specificationId || spec.id || 0,
            specificationName: spec.specificationName || spec.name || '',
            fieldType: spec.fieldType || 'text',
            vendorCells: vendorCells,
            dropdownOptions: spec.dropdownOptions || []
          };
        });

        const tableData: SpecificationTableData = {
          vendorsToShow: vendorsCount,
          specifications: mappedSpecifications
        };
        
        setSpecificationsTableData(tableData);
        
        // Set selected vendors from specifications
        if (mappedSpecifications.length > 0) {
          const firstSpec = mappedSpecifications[0];
          const vendorIds: (number | null)[] = firstSpec.vendorCells.map((cell: VendorCell) => cell.vendorId || null);
          setSelectedVendors(vendorIds);
        }
      }
      
      // Extract approverType from context
      const extractedApproverType = data.approverType || data.ApproverType || '';
      setApproverType(extractedApproverType);
      
      // Extract and set comments
      // First try to get HTML formatted comments, then fall back to plain text
      const htmlComments = data.commentsHistoryHtml || data.CommentsHistoryHtml || 
                           data.commentHistoryHtml || data.CommentHistoryHtml || '';
      setCommentsHistoryHtml(htmlComments);
      
      setFormData(prev => ({
        ...prev,
        commentsHistory: data.commentsHistory || data.CommentsHistory || data.commentHistory || data.CommentHistory || '',
        comments: data.comments || data.Comments || data.comment || data.Comment || '',
      }));
      
    } catch (error) {
      console.error('Error fetching context data:', error);
    }
  };

  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const groups = await getFormattedGroups();
      setGroupOptions(groups);
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

  const fetchSubgroups = async (groupId: number): Promise<DropdownOption[]> => {
    setLoadingSubgroups(true);
    try {
      const subgroups = await subgroupsService.getSubgroupsByGroupId(groupId);
      setSubgroupOptions(subgroups);
      return subgroups;
    } catch (error) {
      console.error('Error fetching subgroups:', error);
      setSubgroupOptions([]);
      return [];
    } finally {
      setLoadingSubgroups(false);
    }
  };

  const fetchRequestTypes = async () => {
    setLoadingRequestTypes(true);
    try {
      const requestTypes = await getFormattedRequestTypes();
      setRequestTypeOptions(requestTypes);
    } catch (error) {
      console.error('Error fetching request types:', error);
      toast({
        title: 'Error',
        description: 'Failed to load request types',
        variant: 'destructive',
      });
    } finally {
      setLoadingRequestTypes(false);
    }
  };

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const response = await servicesService.getServices({ pageSize: 1000 });
      const services = response.Data?.Records || [];
      setServiceOptions(services.map((service: any) => ({
        id: service.serviceId || service.ServiceId,
        name: service.serviceName || service.ServiceName || service.name || service.Name,
      })));
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Error',
        description: 'Failed to load services',
        variant: 'destructive',
      });
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchServiceDetails = async (serviceId: number): Promise<DropdownOption[]> => {
    setLoadingServiceDetails(true);
    try {
      const response = await serviceDetailsService.getServiceDetails({ 
        filter: { serviceId: serviceId },
        pageSize: 'All' as any
      });
      const details = response.Data?.Records || [];
      const formattedDetails = details
        .map((detail: any) => ({
          id: detail.serviceDetailsId || detail.ServiceDetailsId || detail.VendorMgrServiceDetailId || detail.vendorMgrServiceDetailId,
          name: detail.serviceDetailsName || detail.ServiceDetailsName || detail.ServiceDetailName || detail.serviceDetailName || detail.name || detail.Name,
        }))
        .filter((detail: DropdownOption) => detail.id != null && detail.id !== undefined); // Filter out records with undefined IDs
      
      setServiceDetailsOptions(formattedDetails);
      return formattedDetails;
    } catch (error) {
      console.error('Error fetching service details:', error);
      setServiceDetailsOptions([]);
      return [];
    } finally {
      setLoadingServiceDetails(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('Id')) {
      const parsedValue = parseInt(value, 10);
      const finalValue = isNaN(parsedValue) ? -1 : parsedValue;
      
      setFormData(prev => {
        const newData = {
          ...prev,
          [name]: finalValue,
        };
        
        // Reset dependent dropdowns when parent changes
        if (name === 'groupId') {
          // Reset subgroup when group changes
          newData.subgroupId = -1;
          setSubgroupOptions([]);
        } else if (name === 'serviceId') {
          // Reset service details when service changes
          newData.serviceDetailsId = -1;
          setServiceDetailsOptions([]);
        }
        
        return newData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handler for updating the Recommended checkbox in specifications table
  const handleRecommendedChange = (specIndex: number, vendorIndex: number, checked: boolean) => {
    setSpecificationsTableData(prev => {
      if (!prev) return prev;
      
      const updatedSpecifications = prev.specifications.map((spec, sIdx) => {
        if (spec.specificationName.toLowerCase() === 'recommended') {
          return {
            ...spec,
            vendorCells: spec.vendorCells.map((cell, vIdx) => ({
              ...cell,
              value: vIdx === vendorIndex ? (checked ? 'Yes' : 'No') : cell.value
            }))
          };
        }
        return spec;
      });
      
      return {
        ...prev,
        specifications: updatedSpecifications
      };
    });
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Reset form data to initial data
    if (initialData) {
      populateFormData(initialData);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Implement save functionality
      console.log('Saving approval data:', formData);
      
      toast({
        title: 'Success',
        description: 'Approval updated successfully',
        variant: 'default',
      });
      
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving approval:', error);
      toast({
        title: 'Error',
        description: 'Failed to save approval',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    setSaving(true);
    try {
      // Get recommended vendor IDs from specifications table
      const recommendedVendorIds: number[] = [];
      let finalApprovedVendorId = 0;
      let finalApprovedAmount = 0;
      
      if (specificationsTableData) {
        // Find the "Recommended" specification row
        const recommendedSpec = specificationsTableData.specifications.find(
          spec => spec.specificationName.toLowerCase() === 'recommended'
        );
        
        // Find the "Total Price" specification row
        const totalPriceSpec = specificationsTableData.specifications.find(
          spec => spec.specificationName.toLowerCase() === 'total price'
        );
        
        if (recommendedSpec) {
          // Collect vendor IDs where recommended is checked (Yes/true)
          recommendedSpec.vendorCells.forEach((cell, index) => {
            const isRecommended = cell.value?.toLowerCase() === 'yes' || cell.value?.toLowerCase() === 'true';
            if (isRecommended && cell.vendorId) {
              recommendedVendorIds.push(cell.vendorId);
              
              // For FinanceHead, get the first recommended vendor's details
              if (approverType === 'FinanceHead' && finalApprovedVendorId === 0) {
                finalApprovedVendorId = cell.vendorId;
                
                // Get the total price for this vendor
                if (totalPriceSpec && totalPriceSpec.vendorCells[index]) {
                  const priceValue = totalPriceSpec.vendorCells[index].value;
                  // Parse the price value (remove currency symbols, commas, etc.)
                  const numericPrice = parseFloat(priceValue?.replace(/[^0-9.-]+/g, '') || '0');
                  finalApprovedAmount = isNaN(numericPrice) ? 0 : numericPrice;
                }
              }
            }
          });
        }
      }

      // Validation for Finance Head: Only 1 recommendation is allowed
      if (approverType === 'FinanceHead' && recommendedVendorIds.length > 1) {
        toast({
          title: 'Validation Error',
          description: 'Only 1 recommendation is allowed for Finance Head approval',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }
      
      const requestBody = {
        approverType: approverType,
        comments: formData.comments,
        recommendedVendorIdsInOrder: recommendedVendorIds,
        finalApprovedVendorId: approverType === 'FinanceHead' ? finalApprovedVendorId : 0,
        finalApprovedAmount: approverType === 'FinanceHead' ? finalApprovedAmount : 0,
      };
      
      const response = await fetch(`${envConfig.apiBaseUrl}/approvals/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.Message || 'Failed to approve request');
      }
      
      toast({
        title: 'Success',
        description: 'Request approved successfully',
        variant: 'success',
      });
      
      setIsEditMode(false);
      // Navigate back to approvals list
      router.push('/approvals');
      
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve request',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    // Validate that comments are provided for rejection
    if (!formData.comments || formData.comments.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Please enter a reason in the Comments field before rejecting',
        variant: 'destructive',
      });
      return;
    }
    
    setSaving(true);
    try {
      const requestBody = {
        approverType: approverType,
        reason: formData.comments,
      };
      
      const response = await fetch(`${envConfig.apiBaseUrl}/approvals/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.Message || 'Failed to reject request');
      }
      
      toast({
        title: 'Success',
        description: 'Request rejected successfully',
        variant: 'success',
      });
      
      setIsEditMode(false);
      // Navigate back to approvals list
      router.push('/approvals');
      
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject request',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Tooltip content="Go back to Request Approvals" position="right">
            <Button
            variant="outline" size="icon"
              onClick={handleBack}
              
            >
              <ArrowLeft className="h-4 w-4 text-gray-700" />
            </Button>
          </Tooltip>
          <div>
            <h3 className="text-lg font-semibold">
              {isEditMode ? 'Edit Request Approval' : 'View Request Approval'}
            </h3>
            <p className="text-xs text-gray-500">
              {isEditMode ? 'Update request approval information' : 'Request # ' + formData.requestNumber}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {!isEditMode ? (
            requestStatus !== "Approved" && (
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleEditClick}
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )
          ) : (
            <>
              <Button
                variant="outline"
                className="flex items-center gap-2 text-green-700 border-green-700 hover:bg-green-50"
                onClick={handleApprove}
                disabled={saving}
              >
                <CheckCircle className="h-4 w-4" />
                {saving ? 'Processing...' : 'Approve'}
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 text-red-700 border-red-700 hover:bg-red-50"
                onClick={handleReject}
                disabled={saving}
              >
                <XCircle className="h-4 w-4" />
                {saving ? 'Processing...' : 'Reject'}
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={(e) => e.preventDefault()}>
            {/* 3-Column Grid Layout */}
            <div className="grid gap-6 md:grid-cols-3 mb-6">
              
              {/* Request Number - Read-only */}
              <div>
                <label htmlFor="requestNumber" className="block text-sm font-medium mb-2 text-gray-700">
                  Request # <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="requestNumber"
                  name="requestNumber"
                  value={formData.requestNumber}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>

              {/* Request Group - Read-only text display */}
              <div>
                <label htmlFor="requestGroup" className="block text-sm font-medium mb-2 text-gray-700">
                  Request Group <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="requestGroup"
                  name="requestGroup"
                  value={formData.requestGroup}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>

              {/* Subgroup - Read-only text display */}
              <div>
                <label htmlFor="subgroupName" className="block text-sm font-medium mb-2 text-gray-700">
                  Subgroup <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subgroupName"
                  name="subgroupName"
                  value={formData.subgroupName}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>

              {/* Project/Proposal - Read-only */}
              <div>
                <label htmlFor="projectProposalId" className="block text-sm font-medium mb-2 text-gray-700">
                  Project/Proposal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="projectProposalId"
                  name="projectProposalId"
                  value={formData.projectProposalId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>

              {/* Service - Read-only */}
              <div>
                <label htmlFor="serviceId" className="block text-sm font-medium mb-2 text-gray-700">
                  Service <span className="text-red-500">*</span>
                </label>
                <select
                  id="serviceId"
                  name="serviceId"
                  value={formData.serviceId === -1 ? "-1" : String(formData.serviceId)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  disabled
                >
                  <option value="-1">
                    {loadingServices ? 'Loading...' : 'Select Service'}
                  </option>
                  {serviceOptions.map((option) => (
                    <option key={`service-${option.id}`} value={String(option.id)}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date - Read-only */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium mb-2 text-gray-700">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>

              {/* End Date - Read-only */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium mb-2 text-gray-700">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>

              {/* Service Details - Read-only */}
              <div>
                <label htmlFor="serviceDetailsId" className="block text-sm font-medium mb-2 text-gray-700">
                  Service Details <span className="text-red-500">*</span>
                </label>
                <select
                  id="serviceDetailsId"
                  name="serviceDetailsId"
                  value={formData.serviceDetailsId === -1 ? "-1" : String(formData.serviceDetailsId)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  disabled
                >
                  <option value="-1">
                    {loadingServiceDetails ? 'Loading...' : formData.serviceId === -1 ? '-- Select Service First --' : 'Select Service Details'}
                  </option>
                  {serviceDetailsOptions.map((option) => (
                    <option key={`serviceDetail-${option.id}`} value={String(option.id)}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Request Type - Read-only */}
              <div>
                <label htmlFor="requestTypeId" className="block text-sm font-medium mb-2 text-gray-700">
                  Request Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="requestTypeId"
                  name="requestTypeId"
                  value={formData.requestTypeId === -1 ? "-1" : String(formData.requestTypeId)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  disabled
                >
                  <option value="-1">
                    {loadingRequestTypes ? 'Loading...' : 'Select Request Type'}
                  </option>
                  {requestTypeOptions.map((option) => (
                    <option key={`requestType-${option.id}`} value={String(option.id)}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency - Read-only */}
              <div>
                <label htmlFor="currencyId" className="block text-sm font-medium mb-2 text-gray-700">
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  id="currencyId"
                  name="currencyId"
                  value={formData.currencyId === -1 ? "-1" : String(formData.currencyId)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  disabled
                >
                  <option value="-1">Select Currency</option>
                  {currencyOptions.map((option) => (
                    <option key={`currency-${option.id}`} value={String(option.id)}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Uploaded Document */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Uploaded Document
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  {formData.documentUrl ? (
                    <a
                      href={formData.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2"
                    >
                      View Request Document
                    </a>
                  ) : (
                    <span className="text-gray-500">No document uploaded</span>
                  )}
                </div>
              </div>

              {/* Request Description - Full width - Read-only */}
              <div className="md:col-span-3">
                <label htmlFor="requestDescription" className="block text-sm font-medium mb-2 text-gray-700">
                  Request Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="requestDescription"
                  name="requestDescription"
                  value={formData.requestDescription}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>

            </div>
          </form>
        </CardContent>
      </Card>

      {/* Vendor Specification Section */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Specification</CardTitle>
        </CardHeader>
        <CardContent>
          {/* New Specifications Table Format (matching View Quotation) */}
          {specificationsTableData && specificationsTableData.specifications.length > 0 ? (
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
                  {specificationsTableData.specifications.map((spec, specIndex) => (
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
                              {spec.specificationName.toLowerCase() === 'recommended' ? (
                                // Editable checkbox for "Recommended" field - only enabled in edit mode
                                <input
                                  type="checkbox"
                                  checked={cell.value?.toLowerCase() === 'true' || cell.value?.toLowerCase() === 'yes'}
                                  onChange={(e) => handleRecommendedChange(specIndex, vendorIndex, e.target.checked)}
                                  disabled={!isEditMode}
                                  className={`h-4 w-4 rounded border-gray-300 text-blue-600 ${isEditMode ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                />
                              ) : (
                                // Read-only checkbox for other checkbox fields
                                <input
                                  type="checkbox"
                                  checked={cell.value?.toLowerCase() === 'true' || cell.value?.toLowerCase() === 'yes'}
                                  disabled
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                />
                              )}
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
          ) : vendorSpecifications.length > 0 ? (
            // Fallback to legacy format if new format not available
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Vendor Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Quotation Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Total Price
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Recommended
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Quotation
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Billing Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendorSpecifications.map((spec, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {spec.vendorName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {spec.quotationName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {spec.totalPrice ? `$${Number(spec.totalPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {spec.recommended ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {spec.quotation || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {spec.billingType || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              No vendor specifications available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Comments History - Read Only */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Comments History
              </label>
              {commentsHistoryHtml || formData.commentsHistory ? (
                <div 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 min-h-[80px] max-h-[300px] overflow-y-auto text-sm text-gray-700"
                >
                  {commentsHistoryHtml ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: commentsHistoryHtml }}
                      className="prose prose-sm max-w-none [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&_strong]:font-semibold [&_em]:italic"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{formData.commentsHistory}</p>
                  )}
                </div>
              ) : (
                <div className="w-full px-3 py-4 border border-gray-300 rounded-md bg-gray-50 text-center text-gray-500 text-sm">
                  No comments history available
                </div>
              )}
            </div>

            {/* Upload Document */}
            <div>
              <label htmlFor="uploadDocument" className="block text-sm font-medium mb-2 text-gray-700">
                Upload Document
              </label>
              <input
                type="file"
                id="uploadDocument"
                name="uploadDocument"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFormData(prev => ({ ...prev, uploadDocument: file }));
                }}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] ${
                  !isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                disabled={!isEditMode}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              {formData.uploadDocument && (
                <p className="mt-1 text-sm text-gray-600">
                  Selected: {formData.uploadDocument.name}
                </p>
              )}
            </div>

            {/* Comments */}
            <div>
              <label htmlFor="comments" className="block text-sm font-medium mb-2 text-gray-700">
                Comments
              </label>
              <textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] ${
                  !isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                disabled={!isEditMode}
                placeholder="Enter comments..."
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tooltip } from '../ui/tooltip';
import { useToast } from '../../hooks/use-toast';
import { ArrowLeft, Upload, Loader2, Info, AlertCircle, RotateCcw, FileText, Download, X, Plus, Trash2 } from 'lucide-react';
import { useRequestDropdowns } from '../../hooks/use-request-dropdowns';
import { AddNewRequestFormData, PRLineItem } from '../../types/requests';
import { requestsService } from '../../services/requests-service';
import { authService } from '../../services/auth-service';

interface RequestFormProps {
  mode: 'add' | 'view' | 'edit';
  requestId?: number;
  initialData?: any;
  isTesting?: boolean;
}

export default function RequestForm({ mode, requestId, initialData, isTesting = false }: RequestFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isReadOnly = mode === 'view';
  const [showValidation, setShowValidation] = useState(false);

  // Helper for mandatory field indicators
  const RequiredAsterisk = () => (
    <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
  );

  // Use the custom hook for dropdown data
  const {
    requestGroups,
    subgroups,
    services,
    serviceDetails,
    requestTypes,
    projectProposalIds,
    quotationOptions,
    specifications,
    advanceReceivedOptions,
    projectProposalIdsSOAP,
    isLoading,
    isRefetching,
    error,
    refetch,
    fetchProjectProposalsSOAP,
    getFilteredSubgroups,
    getFilteredServices,
    getFilteredServiceDetails,
    getFilteredProjectProposals,
  } = useRequestDropdowns();

  const [formData, setFormData] = useState<AddNewRequestFormData>({
    requestGroup: '',
    subgroup: '',
    service: '',
    serviceDetails: '',
    request: '',
    requestType: '',
    advanceReceived: '',
    startDate: '',
    endDate: '',
    projectProposalId: '',
    description: '',
    specificationDocument: null,
    numberOfQuotations: '',
    specification1: '',
    specification2: '',
    specification3: '',
    specification4: '',
    specification5: '',
    currency: 'INR',
    prType: '',
    prId: '',
    location: '',
    address: '',
    items: [{
      sNo: 1,
      productId: '',
      productName: '',
      productDescription: '',
      unitType: '',
      productType: '',
      quantity: 1,
      remarks: '',
      attachmentName: ''
    }]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitType, setSubmitType] = useState<'save' | 'submit' | 'update'>('submit');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [initialDataCache, setInitialDataCache] = useState<any>(null);
  const [dropdownsFetched, setDropdownsFetched] = useState(false);
  const [apiCallsInProgress, setApiCallsInProgress] = useState(false);
  const [retryGroupFetchDone, setRetryGroupFetchDone] = useState(false);
  const [retryServiceDetailsFetchDone, setRetryServiceDetailsFetchDone] = useState(false);
  
  // Status tracking for conditional button display in edit mode
  const [requesterStatus, setRequesterStatus] = useState<number | null>(null);
  const [requestStatus, setRequestStatus] = useState<number | null>(null);
  
  // Document handling for edit mode
  const [existingDocumentName, setExistingDocumentName] = useState<string | null>(null);
  const [documentRemoved, setDocumentRemoved] = useState(false);

  // User Details (Read-only)
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [prDate, setPrDate] = useState<string>('');

  useEffect(() => {
    const user = authService.getUser();
    setCurrentUser(user);
    const now = new Date();
    setPrDate(now.toLocaleString());

    // Generate PR ID (e.g., PR-20260316-0001)
    // Business Central or backend will handle this later
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); // Mock unique suffix
    const generatedPrId = `PR-${dateStr}-${randomSuffix}`;
    
    setFormData(prev => ({
      ...prev,
      prId: generatedPrId
    }));
  }, []);

  // Mock locations for UI demonstration (to be replaced by Business Central APIs)
  const locations = [
    { id: 'MOHALI', name: 'Mohali', address: 'Bestech Business Tower Unit No A803 8Th Floor, Industrial Plot No. 1(Focal Point) Phase -9 Sec66, Chandigarh, PB, 160059' },
    { id: 'BHOPAL', name: 'Bhopal', address: '2Nd Floor Plot No 21 M P Nagar, Bhopal, MP, 462011' },
    { id: 'NOIDA_HO', name: 'Noida Head Office', address: 'C-4 Sector-58, Noida, UP, 201309' },
    { id: 'VIZG', name: 'Visakhapatnam', address: 'Room No. 101 GF Door No 10-28-2/1/1 A Square, Business Centre Waltair Uplands Waltair Main Road, Visakhapatnam, AP, 530003' },
    { id: 'JAIPUR', name: 'Jaipur', address: '6Th Floor Jaipur Centre Tonk Road, And B2 Bypass Junction Sector B 4 Near Airport, Jaipur, RJ, 302018' },
    { id: 'HYD', name: 'Hydrabad', address: '4Th Floor Gumidelli Commercial Complex, 1 10 39 To 44 Old Airport Road Begumpet, Hyderabad, TS, 500016' },
    { id: 'VADODARA', name: 'Vadodra', address: '1008 10th Floor Ocean Sarabhai, Compound Vikram Sarabhai Marg, Vadodara, GJ, 390007' },
    { id: 'GOA', name: 'Goa', address: '5Th Floor Being No 501 502 503 504 505 507, Plot No 39 Amrosia Corporate Park Patto, Panaji, GA, 403001' },
  ];

  // Testing useEffect - calls all functions with mock params
  useEffect(() => {
    if (isTesting) {
      // Set all state values
      setFormData({
        requestGroup: '1',
        subgroup: '2',
        service: '3',
        serviceDetails: '4',
        request: 'Test Request',
        requestType: '2',
        advanceReceived: '1',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        projectProposalId: '101-Test Project',
        description: 'Test description',
        specificationDocument: new File(['test'], 'test.pdf'),
        numberOfQuotations: '3',
        specification1: '1',
        specification2: '2',
        specification3: '3',
        specification4: '4',
        specification5: '5',
        currency: 'INR',
        prType: 'Goods',
        prId: 'PR-TEST-0001',
        location: '',
        address: '',
        items: [{
          sNo: 1,
          productId: '',
          productName: '',
          productDescription: '',
          unitType: '',
          productType: '',
          quantity: 1,
          remarks: '',
          attachmentName: ''
        }]
      });
      setIsSubmitting(true);
      setSubmitType('submit');
      setDataLoaded(true);
      setInitialDataCache({ requestId: 1, groupId: 1 });
      setDropdownsFetched(true);
      setApiCallsInProgress(true);
      setRetryGroupFetchDone(true);
      setRetryServiceDetailsFetchDone(true);

      // Call all handler functions with mock params
      handleInputChange('requestGroup', '1');
      handleInputChange('subgroup', '2');
      handleInputChange('service', '3');
      handleInputChange('serviceDetails', '4');
      handleInputChange('request', 'Test');
      handleInputChange('requestType', '2');
      handleInputChange('advanceReceived', '1');
      handleInputChange('startDate', '2024-01-01');
      handleInputChange('endDate', '2024-12-31');
      handleInputChange('projectProposalId', '101');
      handleInputChange('description', 'Test');
      handleInputChange('numberOfQuotations', '3');
      handleInputChange('specification1', '1');
      
      // Simulate file change
      const mockFileEvent = {
        target: {
          files: [new File(['test'], 'test.pdf')]
        }
      } as any;
      handleFileChange(mockFileEvent);

      // Navigate to test route
      router.push('/test');
    }
  }, [isTesting]);

  // Load initial data when in view or edit mode - Step 1: Wait for initial dropdown load, then trigger specific fetches
  useEffect(() => {
    if (isTesting) return;
    if ((mode === 'view' || mode === 'edit') && initialData && !initialDataCache && !apiCallsInProgress && !isLoading) {
      console.log('=== STEP 1: Initial dropdowns loaded, now loading specific data ===', initialData);
      setInitialDataCache(initialData);
      setApiCallsInProgress(true);
      
      const data = initialData;

      // Trigger API calls to load dependent dropdowns sequentially
      const fetchDropdowns = async () => {
        try {
          console.log('Starting sequential API calls...');
          
          // First call - load based on groupId
          if (data.groupId) {
            console.log('Fetching dropdowns for groupId:', data.groupId);
            await refetch({ groupId: data.groupId.toString() });
            // Wait for state to update
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('After groupId refetch - Dropdown counts:', {
              requestGroups: requestGroups.length,
              subgroups: subgroups.length,
              services: services.length,
            });
          }
          
          // Second call - load based on serviceId
          if (data.serviceId) {
            console.log('Fetching dropdowns for serviceId:', data.serviceId);
            await refetch({ serviceId: data.serviceId.toString() });
            // Wait for state to update
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('After serviceId refetch - Dropdown counts:', {
              services: services.length,
              serviceDetails: serviceDetails.length,
            });
          }
          
          // Third call - load based on requestType if billable
          if (data.requestTypeId === 2) {
            console.log('Fetching dropdowns for requestType: 2 (Billable)');
            await refetch({ requestType: '2' });
            // Also fetch project proposals for billable requests
            await fetchProjectProposalsSOAP('2');
            // Wait for state to update
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('After requestType refetch - Dropdown counts:', {
              advanceReceivedOptions: advanceReceivedOptions.length,
              projectProposalIdsSOAP: projectProposalIdsSOAP.length,
            });
          }
          
          // Mark dropdowns as fetched
          console.log('=== All dropdowns fetched successfully ===');
          console.log('Final dropdown counts before setting flag:', {
            requestGroups: requestGroups.length,
            subgroups: subgroups.length,
            services: services.length,
            serviceDetails: serviceDetails.length,
            requestTypes: requestTypes.length,
          });
          setDropdownsFetched(true);
          setApiCallsInProgress(false);
        } catch (error) {
          console.error('Error fetching dropdowns:', error);
          setApiCallsInProgress(false);
        }
      };

      fetchDropdowns();
    }
  }, [mode, initialData, initialDataCache, apiCallsInProgress, isLoading, refetch]);

  // Debug: Monitor dropdown changes
  useEffect(() => {
    if (mode === 'view' || mode === 'edit') {
      console.log('📊 Dropdown arrays updated:', {
        subgroups: subgroups.length,
        services: services.length,
        serviceDetails: serviceDetails.length,
        subgroupsSample: subgroups.slice(0, 2),
        servicesSample: services.slice(0, 2)
      });
    }
  }, [subgroups, services, serviceDetails, mode]);

  // Step 2: Populate form data after dropdowns are loaded
  useEffect(() => {
    if (initialDataCache && !dataLoaded && dropdownsFetched && !isLoading && !isRefetching && !apiCallsInProgress) {
      // Wait a bit more to ensure all state updates from refetch have propagated
      const timer = setTimeout(() => {
        console.log('=== STEP 2: Populating form with data ===');
        console.log('Initial Data Cache:', initialDataCache);
        console.log('Dropdown data available:', {
          requestGroups: requestGroups.length,
          subgroups: subgroups.length,
          services: services.length,
          serviceDetails: serviceDetails.length,
          requestTypes: requestTypes.length,
          advanceReceivedOptions: advanceReceivedOptions.length,
          quotationOptions: quotationOptions.length,
          specifications: specifications.length
        });
        
        const data = initialDataCache;
        
        // Format dates from API (remove time portion if present)
        const formatDate = (dateStr: string) => {
          if (!dateStr) return '';
          return dateStr.split('T')[0];
        };
        
        // Parse specifications - handle both array format and individual fields
        let specs: string[] = [];
        if (Array.isArray(data.specifications)) {
          specs = data.specifications;
        } else if (data.specification1 || data.specification2 || data.specification3 || data.specification4 || data.specification5) {
          specs = [
            data.specification1 || '',
            data.specification2 || '',
            data.specification3 || '',
            data.specification4 || '',
            data.specification5 || ''
          ];
        }
        
        // Helper function to find specification ID by name/value
        const findSpecificationId = (specValue: string): string => {
          if (!specValue) return '';
          
          // If it's already a number (ID), return it
          if (/^\d+$/.test(specValue)) {
            return specValue;
          }
          
          // Otherwise, search for the specification by name
          const matchingSpec = specifications.find(spec => 
            spec.name.toLowerCase().trim() === specValue.toLowerCase().trim()
          );
          
          if (matchingSpec) {
            console.log(`✅ Found specification ID for "${specValue}": ${matchingSpec.id}`);
            return matchingSpec.id;
          }
          
          console.warn(`⚠️ No specification found matching "${specValue}"`);
          return '';
        };
        
        const newFormData = {
          requestGroup: data.groupId?.toString() || '',
          subgroup: data.subgroupId?.toString() || '',
          service: data.serviceId?.toString() || '',
          serviceDetails: data.serviceDetailId?.toString() || '',
          request: data.requestName || '',
          requestType: data.requestTypeId?.toString() || '',
          advanceReceived: data.advanceReceived !== undefined && data.advanceReceived !== null ? data.advanceReceived.toString() : '',
          startDate: formatDate(data.startDate || data.endDate) || '',
          endDate: formatDate(data.endDate) || '',
          // For billable requests, leave empty - will be populated by useEffect after proposals load
          projectProposalId: data.requestTypeId === 2 ? '' : (data.pantherProjectProposalId || ''),
          description: data.requestDescription || '',
          specificationDocument: null,
          numberOfQuotations: data.noOfQuotations?.toString() || data.minimumQuotationsRequested?.toString() || '',
          specification1: findSpecificationId(specs[0] || ''),
          specification2: findSpecificationId(specs[1] || ''),
          specification3: findSpecificationId(specs[2] || ''),
          specification4: findSpecificationId(specs[3] || ''),
          specification5: findSpecificationId(specs[4] || ''),
          currency: data.currency || 'INR',
          prType: data.prType || '',
          prId: data.prId || `PR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-EXISTING`,
          location: '',
          address: '',
          items: []
        };

        console.log('=== Setting form data ===', newFormData);
        console.log('Available dropdown values check:');
        console.log('- Request Group', data.groupId, ':', requestGroups.find(r => r.id === data.groupId?.toString()));
        console.log('- Subgroup', data.subgroupId, ':', subgroups.find(s => s.id === data.subgroupId?.toString()));
        console.log('- Service', data.serviceId, ':', services.find(s => s.id === data.serviceId?.toString()));
        console.log('- Service Details', data.serviceDetailId, ':', serviceDetails.find(s => s.id === data.serviceDetailId?.toString()));
        console.log('- Request Type', data.requestTypeId, ':', requestTypes.find(r => r.id === data.requestTypeId?.toString()));
        console.log('Full dropdown counts:', {
          requestGroups: requestGroups.length,
          subgroups: subgroups.length,
          services: services.length,
          serviceDetails: serviceDetails.length
        });
        
        // Set requesterStatus and requestStatus from initialData
        const reqStatus = data.requesterStatus ?? data.RequesterStatus ?? null;
        const status = data.status ?? data.Status ?? null;
        console.log('=== Setting status values ===', { requesterStatus: reqStatus, requestStatus: status });
        setRequesterStatus(reqStatus !== null ? Number(reqStatus) : null);
        setRequestStatus(status !== null ? Number(status) : null);
        
        // Set existing document name from API response
        const docName = data.documentName || data.DocumentName || data.document || data.Document || null;
        console.log('=== Setting document name ===', { documentName: docName });
        setExistingDocumentName(docName);
        setDocumentRemoved(false);
        
        setFormData(newFormData);
        setDataLoaded(true);
        console.log('=== Form data populated successfully ===');
      }, 800); // Wait 800ms for all state updates to complete

      return () => clearTimeout(timer);
    }
  }, [initialDataCache, dataLoaded, dropdownsFetched, isLoading, isRefetching, apiCallsInProgress]);

  // Separate effect to handle re-fetching if dropdowns are empty (doesn't reset form data)
  useEffect(() => {
    if (dataLoaded && initialDataCache && mode !== 'add') {
      const data = initialDataCache;
      
      // Re-fetch Group Dropdowns if empty (subgroups/services)
      if (!retryGroupFetchDone && (subgroups.length === 0 || services.length === 0) && data.groupId) {
        console.log('⚠️ CRITICAL: Subgroups/Services still empty, re-fetching for groupId:', data.groupId);
        const timer = setTimeout(() => {
          refetch({ groupId: data.groupId.toString() });
          setRetryGroupFetchDone(true);
        }, 500);
        return () => clearTimeout(timer);
      }
      
      // Re-fetch Service Details if empty (independent retry)
      if (!retryServiceDetailsFetchDone && serviceDetails.length === 0 && data.serviceId) {
        console.log('⚠️ CRITICAL: Service Details still empty, re-fetching for serviceId:', data.serviceId);
        const timer = setTimeout(() => {
          refetch({ serviceId: data.serviceId.toString() });
          setRetryServiceDetailsFetchDone(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [dataLoaded, initialDataCache, mode, retryGroupFetchDone, retryServiceDetailsFetchDone, subgroups.length, services.length, serviceDetails.length, refetch]);

  // Update projectProposalId when proposals are loaded (match ID to full name)
  useEffect(() => {
    if (dataLoaded && initialDataCache && projectProposalIdsSOAP.length > 0 && formData.requestType === '2') {
      const proposalIdFromAPI = initialDataCache.pantherProjectProposalId;
      if (proposalIdFromAPI) {
        // Find the matching proposal by checking if the name starts with the ID
        const matchingProposal = projectProposalIdsSOAP.find(proposal => 
          proposal.name.startsWith(proposalIdFromAPI + '-') || proposal.name === proposalIdFromAPI
        );
        
        if (matchingProposal && formData.projectProposalId !== matchingProposal.name) {
          console.log('✅ Matched Project/Proposal ID:', proposalIdFromAPI, '→', matchingProposal.name);
          console.log('   Current formData.projectProposalId:', formData.projectProposalId);
          console.log('   All available proposals:', projectProposalIdsSOAP);
          setFormData(prev => ({
            ...prev,
            projectProposalId: matchingProposal.name
          }));
        } else if (!matchingProposal) {
          console.warn('⚠️ No matching proposal found for ID:', proposalIdFromAPI);
          console.warn('   Available proposals:', projectProposalIdsSOAP.map(p => p.name));
        }
      }
    }
  }, [dataLoaded, initialDataCache, projectProposalIdsSOAP, formData.requestType]);

  // Filtered dropdown options using hook's filtering functions
  const filteredSubgroups = formData.requestGroup ? getFilteredSubgroups(formData.requestGroup) : [];
  
  // For services: show all services when group is selected (API doesn't provide subgroup-service mapping)
  const filteredServices = formData.requestGroup ? services : [];
  
  const filteredServiceDetails = formData.service ? getFilteredServiceDetails(formData.service) : [];
  const filteredProjectProposals = formData.requestType ? getFilteredProjectProposals(formData.requestType) : [];

  console.log('🎯 Dropdown Filtering Debug:', {
    requestGroup: formData.requestGroup,
    subgroup: formData.subgroup,
    service: formData.service,
    requestType: formData.requestType,
    isBillable: formData.requestType === '2',
    filteredSubgroups: filteredSubgroups.length,
    filteredServices: filteredServices.length,
    filteredServiceDetails: filteredServiceDetails.length,
    advanceReceivedOptions: advanceReceivedOptions.length,
    projectProposalIdsSOAP: projectProposalIdsSOAP.length,
    soapApiTriggered: formData.requestType === '2' ? 'YES - Billable selected' : 'NO - Only for Billable'
  });

  // Show error state if API call failed
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-red-500 font-medium">Failed to load form data</div>
          <p className="text-gray-600">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="bg-vendor-600 hover:bg-vendor-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: keyof AddNewRequestFormData, value: string) => {
    if (isReadOnly) return;

    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Clear dependent dropdowns when parent changes
      if (field === 'requestGroup') {
        newData.subgroup = '';
        newData.service = '';
        newData.serviceDetails = '';
        
        if (value) {
          refetch({ groupId: value });
        }
      } else if (field === 'subgroup') {
        newData.service = '';
        newData.serviceDetails = '';
      } else if (field === 'service') {
        newData.serviceDetails = '';
        
        if (value) {
          refetch({ serviceId: value });
        }
      } else if (field === 'requestType') {
        // Clear dependent fields
        newData.advanceReceived = '';
        newData.projectProposalId = '';
        
        if (value === '2') {
          // Billable request type - fetch BOTH Advance Received AND Project/Proposal IDs
          console.log('✅ Billable Request Type selected - Triggering dual dependent dropdowns');
          console.log('   → REST API: Fetching Advance Received options');
          console.log('   → REST API: Fetching Project/Proposal IDs from /api/requests/project-proposals');
          
          // Fetch Advance Received from REST API
          refetch({ requestType: value });
          
          // Fetch Project/Proposal IDs from REST API (ONLY for Billable)
          fetchProjectProposalsSOAP(value);
        } else if (value) {
          // Non-Billable request type - fetch ONLY Advance Received
          console.log('✅ Non-Billable Request Type selected - Fetching Advance Received options');
          console.log('   → REST API: Fetching Advance Received options');
          
          // Fetch Advance Received from REST API for non-billable as well
          refetch({ requestType: value });
        }
      }
      
      return newData;
    });
  };

  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          sNo: prev.items.length + 1,
          productId: '',
          productName: '',
          productDescription: '',
          unitType: '',
          productType: '',
          quantity: 1,
          remarks: '',
          attachmentName: ''
        }
      ]
    }));
  };

  const handleItemFileChange = (index: number, fileName: string) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], attachmentName: fileName };
    setFormData({ ...formData, items: updatedItems });
  };

  const removeItemRow = (index: number) => {
    setFormData(prev => {
      const newItems = prev.items.filter((_, i) => i !== index).map((item, i) => ({
        ...item,
        sNo: i + 1
      }));
      return { ...prev, items: newItems };
    });
  };

  const handleItemChange = (index: number, field: keyof PRLineItem, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Auto-populate logic for Product Name (mock)
      if (field === 'productName') {
        // Business Central integration point: Match product ID and populate description/type
        // For now, using placeholder logic
        newItems[index].productDescription = `Description for ${value}`;
        newItems[index].unitType = 'PCS';
        newItems[index].productType = 'Generic';
      }
      
      return { ...prev, items: newItems };
    });
  };

  const handleLocationChange = (locationId: string) => {
    const selectedLocation = locations.find(loc => loc.id === locationId);
    setFormData(prev => ({
      ...prev,
      location: locationId,
      address: selectedLocation ? selectedLocation.address : ''
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      specificationDocument: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent, type: 'save' | 'submit' | 'update' = submitType) => {
    if (e) e.preventDefault();
    
    if (isReadOnly) return;

    // Check mandatory fields
    const isBasicValid = 
      formData.prType && 
      formData.currency && 
      formData.request && 
      formData.location;
    
    const areItemsValid = formData.items.length > 0 && formData.items.every(item => item.productName && item.quantity > 0);

    if (!isBasicValid || !areItemsValid) {
      setShowValidation(true);
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields marked with *',
        variant: 'destructive',
      });
      return;
    }

    // Validate advance received for billable requests (only for submit, not for save)
    if (type === 'submit' && formData.requestType === '2' && !formData.advanceReceived) {
      toast({
        title: 'Validation Error',
        description: 'Advance Received is required for Billable request type',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'add') {
        // Prepare request payload matching exact API structure
        const requestPayload = {
          RequestId: '',
          GroupId: parseInt(formData.requestGroup),
          SubgroupId: parseInt(formData.subgroup) || 0,
          ServiceId: parseInt(formData.service),
          ServiceDetailId: parseInt(formData.serviceDetails),
          RequestName: formData.request,
          RequestDescription: formData.description || "",
          RequestTypeId: parseInt(formData.requestType),
          AdvanceReceived: formData.advanceReceived ? parseInt(formData.advanceReceived) : 0,
          MinimumQuotationsRequested: formData.numberOfQuotations ? parseInt(formData.numberOfQuotations) : 0,
          NoOfQuotations: formData.numberOfQuotations ? parseInt(formData.numberOfQuotations) : 0,
          pantherProjectProposalId: formData.projectProposalId || "",
          StartDate: formData.startDate,
          EndDate: formData.endDate,
          Document: formData.specificationDocument?.name || "",
          Specification1: formData.specification1 ? parseInt(formData.specification1) : '',
          Specification2: formData.specification2 ? parseInt(formData.specification2) : '',
          Specification3: formData.specification3 ? parseInt(formData.specification3) : '',
          Specification4: formData.specification4 ? parseInt(formData.specification4) : '',
          Specification5: formData.specification5 ? parseInt(formData.specification5) : '',
          Currency: formData.currency,
          PRType: formData.prType,
        };

        console.log(`${type === 'save' ? '💾 Saving as draft' : '📤 Saving and submitting'} request:`, requestPayload);
        
        // Call different API endpoint based on action type
        let result;
        if (type === 'save') {
          result = await requestsService.saveRequest(requestPayload as any);
        } else {
          result = await requestsService.saveAndSubmitRequest(requestPayload as any);
        }

        if (!result.success) {
          throw new Error(result.message);
        }

        toast({
          title: 'Success',
          description: type === 'save' 
            ? 'Request has been saved as draft successfully' 
            : 'Request has been saved and submitted for approval successfully',
          variant: 'success',
        });

        // Redirect to requests list
        // Redirect to requests list
        router.push('/requests');
      } else if (mode === 'edit') {
        // Determine document value for payload:
        // - If new file selected: use new file name
        // - If document removed: send empty string 
        // - If unchanged: keep existing document name
        let documentValue = "";
        if (formData.specificationDocument) {
          documentValue = formData.specificationDocument.name;
        } else if (documentRemoved) {
          documentValue = "";
        } else if (existingDocumentName) {
          documentValue = existingDocumentName;
        }
        
        // Prepare request payload for update (similar to add, but with actual RequestId)
        const requestPayload = {
          RequestId: requestId || initialData?.requestId || 0,
          GroupId: parseInt(formData.requestGroup),
          SubgroupId: parseInt(formData.subgroup) || 0,
          ServiceId: parseInt(formData.service),
          ServiceDetailId: parseInt(formData.serviceDetails),
          RequestName: formData.request,
          RequestDescription: formData.description || "",
          RequestTypeId: parseInt(formData.requestType),
          AdvanceReceived: formData.advanceReceived ? parseInt(formData.advanceReceived) : 0,
          MinimumQuotationsRequested: formData.numberOfQuotations ? parseInt(formData.numberOfQuotations) : 0,
          NoOfQuotations: formData.numberOfQuotations ? parseInt(formData.numberOfQuotations) : 0,
          PantherProjectProposalId: formData.projectProposalId || "",
          StartDate: formData.startDate,
          EndDate: formData.endDate,
          Document: documentValue,
          Specification1: formData.specification1 ? parseInt(formData.specification1) : '',
          Specification2: formData.specification2 ? parseInt(formData.specification2) : '',
          Specification3: formData.specification3 ? parseInt(formData.specification3) : '',
          Specification4: formData.specification4 ? parseInt(formData.specification4) : '',
          Specification5: formData.specification5 ? parseInt(formData.specification5) : '',
          Currency: formData.currency,
          PRType: formData.prType,
        };

        let result;
        let successMessage = '';

        if (type === 'submit') {
          // Save & Submit - POST to /requests/save-and-submit
          console.log('✏️📤 Saving and submitting request:', requestPayload);
          result = await requestsService.saveAndSubmitRequest(requestPayload as any);
          successMessage = 'Request has been saved and submitted for approval successfully';
        } else {
          // Save or Update Request - PUT to /requests
          console.log(`✏️ ${type === 'update' ? 'Updating' : 'Saving'} request:`, requestPayload);
          result = await requestsService.updateRequest(requestPayload as any);
          successMessage = type === 'update' 
            ? 'Request has been updated successfully'
            : 'Request has been saved successfully';
        }

        if (!result.success) {
          throw new Error(result.message);
        }

        toast({
          title: 'Success',
          description: successMessage,
          variant: 'success',
        });

        router.push('/requests');
      }
    } catch (error: any) {
      console.error('❌ Error submitting request:', error);
      toast({
        title: 'Error',
        description: error.message || `Failed to ${type === 'save' ? 'save' : 'submit'} request. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'view':
        return 'View Purchase Request';
      case 'edit':
        return 'Edit Request';
      default:
        return 'Add New Purchase Request';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Tooltip content="Back to Manage Purchase Requests" position="bottom">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/requests')}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Tooltip>
          <div>
            <h3 className="text-lg font-semibold">{getTitle()}</h3>
            <p className="text-xs text-gray-500">
              {mode === 'view' ? 'View request details' : mode === 'edit' ? 'Update request information' : 'Fill in the details to create a new request'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: User Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold border-b pb-2">User Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">PR ID</Label>
                  <p className="text-sm font-medium">{formData.prId || 'Generating...'}</p>
                  <p className="text-[10px] text-gray-400 italic mt-0.5">// Will be backend-generated in future</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Requested By</Label>
                  <p className="text-sm font-medium">{currentUser?.name || 'Loading...'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Department</Label>
                  <p className="text-sm font-medium">{currentUser?.department || 'IT Administration'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">PR Date</Label>
                  <p className="text-sm font-medium">{prDate}</p>
                </div>
              </div>
            </div>

            {/* Section 2: Location Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold border-b pb-2">Location Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center">
                    Location <RequiredAsterisk />
                  </Label>
                  <select
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    className={`w-full px-3 py-1 text-xs h-9 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] disabled:opacity-50 disabled:cursor-not-allowed ${
                      showValidation && !formData.location ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    required
                    disabled={isReadOnly}
                  >
                    <option value="">Select Location</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-500 italic">// Will be integrated with Business Central APIs later</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    readOnly
                    className="bg-gray-50 text-xs h-9"
                    placeholder="Auto-populated based on location"
                  />
                  <p className="text-[10px] text-gray-500 italic">// UI-only field, remains read-only</p>
                </div>
              </div>
            </div>

            {/* Section 3: Basic Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold border-b pb-2">Basic Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PR Type selector - Primary workflow driver */}
                <div className="space-y-2">
                  <Label htmlFor="prType" className="flex items-center">
                    PR Type <RequiredAsterisk />
                  </Label>
                  <select
                    id="prType"
                    value={formData.prType}
                    onChange={(e) => handleInputChange('prType', e.target.value)}
                    className={`w-full px-3 py-1 border rounded-md text-xs h-9 focus:outline-none focus:ring-1 focus:ring-[#0152ef] disabled:opacity-50 disabled:cursor-not-allowed ${
                      showValidation && !formData.prType ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    required
                    disabled={isReadOnly}
                  >
                    <option value="">Select PR Type</option>
                    <option value="Goods">Goods</option>
                    <option value="Services">Services</option>
                    <option value="Goods and Services">Goods and Services</option>
                  </select>
                  <p className="text-[10px] text-gray-500 italic">// Will drive approval workflows in later BC integration</p>
                </div>

                {/* Currency Selector - Primary workflow driver for approval chains */}
                <div className="space-y-2">
                  <Label className="flex items-center">
                    Currency <RequiredAsterisk />
                  </Label>
                  <div className={`flex items-center gap-6 h-9 px-3 border rounded-md transition-colors ${
                    showValidation && !formData.currency ? 'border-red-500' : 'border-transparent'
                  }`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="currencyINR"
                        name="currency"
                        value="INR"
                        checked={formData.currency === 'INR'}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        disabled={isReadOnly}
                        className="w-4 h-4 text-[#0152ef] border-gray-300 focus:ring-[#0152ef]"
                      />
                      <Label htmlFor="currencyINR" className="text-xs font-normal cursor-pointer flex items-center gap-1">
                        INR <span className="text-gray-400">(₹)</span>
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="currencyUSD"
                        name="currency"
                        value="USD"
                        checked={formData.currency === 'USD'}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        disabled={isReadOnly}
                        className="w-4 h-4 text-[#0152ef] border-gray-300 focus:ring-[#0152ef]"
                      />
                      <Label htmlFor="currencyUSD" className="text-xs font-normal cursor-pointer flex items-center gap-1">
                        USD <span className="text-gray-400">($)</span>
                      </Label>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 italic">// Important: Currency determines approval chains (USD vs INR)</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="request" className="flex items-center">
                  Purchase Requisition Title <RequiredAsterisk />
                </Label>
                <Input
                  id="request"
                  type="text"
                  value={formData.request}
                  onChange={(e) => handleInputChange('request', e.target.value)}
                  placeholder="Enter purchase requisition title"
                  required
                  disabled={isReadOnly}
                  className={`text-xs h-9 ${
                    showValidation && !formData.request ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <div className="relative min-h-[100px]">
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter additional requisition details"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none transition-none shadow-none"
                    disabled={isReadOnly}
                  />
                </div>
                <p className="text-[10px] text-gray-400 italic">// Fixed layout to prevent shifting on interaction</p>
              </div>

              {/* Hidden Fields for Logic Maintenance (to be integrated with BC APIs later) */}
              <div className="hidden">
                 {/* Reusing existing fields for background logic */}
                 <select value={formData.requestType} onChange={() => {}} id="requestType"><option value={formData.requestType}/></select>
                 <select value={formData.requestGroup} onChange={() => {}} id="requestGroup"><option value={formData.requestGroup}/></select>
                 <select value={formData.subgroup} onChange={() => {}} id="subgroup"><option value={formData.subgroup}/></select>
                 <select value={formData.service} onChange={() => {}} id="service"><option value={formData.service}/></select>
                 <select value={formData.serviceDetails} onChange={() => {}} id="serviceDetails"><option value={formData.serviceDetails}/></select>
                 <select value={formData.advanceReceived} onChange={() => {}} id="advanceReceived"><option value={formData.advanceReceived}/></select>
                 <select value={formData.projectProposalId} onChange={() => {}} id="projectProposalId"><option value={formData.projectProposalId}/></select>
                 <select value={formData.numberOfQuotations} onChange={() => {}} id="numberOfQuotations"><option value={formData.numberOfQuotations}/></select>
                 <Input value={formData.startDate} readOnly />
                 <Input value={formData.endDate} readOnly />
                 <select value={formData.specification1} onChange={() => {}}><option value={formData.specification1}/></select>
                 <select value={formData.specification2} onChange={() => {}}><option value={formData.specification2}/></select>
                 <select value={formData.specification3} onChange={() => {}}><option value={formData.specification3}/></select>
                 <select value={formData.specification4} onChange={() => {}}><option value={formData.specification4}/></select>
                 <select value={formData.specification5} onChange={() => {}}><option value={formData.specification5}/></select>
              </div>
            </div>

            {/* Section 4: List of Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <hgroup>
                  <h4 className="text-sm font-semibold text-gray-800">List of Items</h4>
                  <p className="text-[10px] text-gray-400 italic">Individual item details and attachments</p>
                </hgroup>
                {!isReadOnly && (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={addItemRow}
                    className="h-8 gap-2 text-xs font-medium px-4 bg-[#0152ef] hover:bg-[#0041c2] text-white transition-all shadow-sm rounded-md"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Row
                  </Button>
                )}
              </div>

              <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
                <table className="w-full text-[11px] text-left border-collapse table-fixed min-w-[1000px]">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-3 py-3 font-semibold text-gray-700 border-r w-[50px] text-center">S.No</th>
                      <th className="px-3 py-3 font-semibold text-gray-700 border-r w-[200px]">
                        Product Name <RequiredAsterisk />
                      </th>
                      <th className="px-3 py-3 font-semibold text-gray-700 border-r w-[250px]">Product Description</th>
                      <th className="px-3 py-3 font-semibold text-gray-700 border-r w-[100px] text-center">Unit Type</th>
                      <th className="px-3 py-3 font-semibold text-gray-700 border-r w-[110px] text-center">Product Type</th>
                      <th className="px-3 py-3 font-semibold text-gray-700 border-r w-[80px] text-center">
                        Quantity <RequiredAsterisk />
                      </th>
                      <th className="px-3 py-3 font-semibold text-gray-700 border-r w-[180px]">Remarks</th>
                      <th className="px-3 py-3 font-semibold text-gray-700 border-r w-[140px]">Attachment</th>
                      {!isReadOnly && <th className="px-3 py-3 font-semibold text-gray-700 w-[60px] text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50/50 transition-colors h-12">
                        <td className="px-3 py-2 border-r text-center text-gray-500 font-medium">{item.sNo}</td>
                        <td className="px-2 py-1.5 border-r">
                          <select
                            value={item.productName}
                            onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                            className={`w-full px-2 py-1.5 border rounded text-xs h-8 focus:outline-none focus:ring-1 bg-white disabled:bg-gray-50 ${
                              showValidation && !item.productName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#0152ef]'
                            }`}
                            disabled={isReadOnly}
                            required
                          >
                            <option value="">Select Product</option>
                            {services.map(service => (
                              <option key={service.id} value={service.name}>{service.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-1.5 border-r">
                          <textarea
                            value={item.productDescription}
                            onChange={(e) => handleItemChange(index, 'productDescription', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-[11px] h-8 focus:outline-none focus:ring-1 focus:ring-[#0152ef] resize-none overflow-hidden hover:overflow-y-auto disabled:bg-gray-50"
                            rows={1}
                            placeholder="Enter description"
                            disabled={isReadOnly}
                          />
                        </td>
                        <td className="px-2 py-1.5 border-r">
                          <Input
                            value={item.unitType}
                            readOnly
                            className="bg-gray-50 h-8 text-[11px] border-gray-200"
                            placeholder="Unit"
                          />
                        </td>
                        <td className="px-2 py-1.5 border-r">
                          <Input
                            value={item.productType}
                            readOnly
                            className="bg-gray-50 h-8 text-[11px] border-gray-200"
                            placeholder="Type"
                          />
                        </td>
                        <td className="px-2 py-1.5 border-r">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                            className={`h-8 text-[11px] text-center focus-visible:ring-[#0152ef] ${
                              showValidation && (!item.quantity || item.quantity <= 0) ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300'
                            }`}
                            min={1}
                            required
                            disabled={isReadOnly}
                          />
                        </td>
                        <td className="px-2 py-2 border-r">
                          <Input
                            value={item.remarks}
                            onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                            className="h-8 text-[11px] border-gray-300 focus:ring-[#0152ef] w-full"
                            placeholder="Optional"
                            disabled={isReadOnly}
                          />
                        </td>
                        <td className="px-2 py-2 border-r relative group">
                          <div className="flex flex-col justify-center h-full">
                            {!isReadOnly ? (
                              <div className="relative">
                                <input
                                  type="file"
                                  id={`item-file-${index}`}
                                  className="hidden"
                                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleItemFileChange(index, file.name);
                                  }}
                                />
                                <label
                                  htmlFor={`item-file-${index}`}
                                  className="flex items-center gap-1.5 px-2 py-1 border border-dashed border-[#0152ef]/30 rounded hover:bg-[#0152ef]/5 cursor-pointer transition-all h-8 overflow-hidden"
                                >
                                  <Upload className="h-3 w-3 text-[#0152ef] shrink-0" />
                                  <span className="text-[10px] text-gray-600 truncate">
                                    {item.attachmentName || 'Attach'}
                                  </span>
                                </label>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-2 h-8">
                                <FileText className="h-3 w-3 text-gray-400 shrink-0" />
                                <span className="text-[10px] text-gray-500 italic truncate">
                                  {item.attachmentName || 'None'}
                                </span>
                              </div>
                            )}
                          </div>
                          {/* Item-level attachments will later map to BC line-item document attachments */}
                        </td>
                        {!isReadOnly && (
                          <td className="px-2 py-1.5 text-center">
                            {formData.items.length > 1 ? (
                              <button
                                type="button"
                                onClick={() => removeItemRow(index)}
                                className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
                                title="Remove row"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : (
                              <div className="w-7 h-7" />
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-start gap-2 text-[10px] text-gray-500 italic px-1">
                <Info className="h-3 w-3 mt-0.5 text-[#0152ef]/70" />
                <p>
                  Table columns have fixed widths for consistent alignment. Product names and attachments 
                  will be mapped to Business Central item-level data and line-item attachments during integration.
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                className='font-normal text-xs gap-2 cus-secondary-reset-btn'
                onClick={() => router.push('/requests')}
              >
                {isReadOnly ? 'Close' : 'Cancel'}
              </Button>
              {!isReadOnly && mode === 'add' && (
                <>
                  {/* Save as Draft Button */}
                  <Button
                    type="submit"
                    variant="ghost"
                    className="gap-2 text-xs cus-primary-submit-btn"
                    disabled={isSubmitting}
                    onClick={(e: any) => {
                      setSubmitType('save');
                      handleSubmit(e, 'save');
                    }}
                    
                  >
                    {isSubmitting && submitType === 'save' ? (
                      'Saving Draft...'
                    ) : (
                      <>
                        {/* <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg> */}
                        Save
                      </>
                    )}
                  </Button>
                  
                  {/* Save & Submit for Approval Button */}
                  <Button
                    type="submit"
                    variant="ghost"
                    className="gap-2 text-xs cus-primary-submit-btn"
                    disabled={isSubmitting}
                    onClick={(e: any) => {
                      setSubmitType('submit');
                      handleSubmit(e, 'submit');
                    }}
                    
                  >
                    {isSubmitting && submitType === 'submit' ? (
                      'Submitting...'
                    ) : (
                      <>
                        {/* <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg> */}
                        Save & Submit Request
                      </>
                    )}
                  </Button>
                </>
              )}
              {!isReadOnly && mode === 'edit' && (
                <>
                  {/* Case A: requesterStatus === 5 && status === 0 → Update Request */}
                  {requesterStatus === 5 && requestStatus === 0 && (
                    <Button
                      type="submit"
                      variant="ghost"
                      className="gap-2 text-xs cus-primary-submit-btn"
                      disabled={isSubmitting}                      
                      onClick={(e: any) => {
                        setSubmitType('update');
                        handleSubmit(e, 'update');
                      }}
                      
                    >
                      {isSubmitting && submitType === 'update' ? 'Updating...' : 'Update Request'}
                    </Button>
                  )}
                  
                  {/* Case B: requesterStatus !== 5 && status === 0 → Save */}
                  {requesterStatus !== 5 && requestStatus === 0 && (
                    <Button
                      type="submit"
                      variant="ghost"
                      className="gap-2 text-xs cus-primary-submit-btn"
                      disabled={isSubmitting}
                      onClick={(e: any) => {
                        setSubmitType('save');
                        handleSubmit(e, 'save');
                      }}
                     
                    >
                      {isSubmitting && submitType === 'save' ? (
                        'Saving...'
                      ) : (
                        <>
                          {/* <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg> */}
                          Save
                        </>
                      )}
                    </Button>
                  )}
                  
                  {/* Case C: requesterStatus !== 5 && status === 1 → Save, Save & Submit */}
                  {requesterStatus !== 5 && requestStatus === 1 && (
                    <>
                      <Button
                    type="submit"
                    variant="ghost"
                    className="gap-2 text-xs cus-primary-submit-btn"
                        disabled={isSubmitting}
                        onClick={(e: any) => {
                          setSubmitType('save');
                          handleSubmit(e, 'save');
                        }}
                       
                      >
                        {isSubmitting && submitType === 'save' ? (
                          'Saving...'
                        ) : (
                          <>
                            {/* <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg> */}
                            Save
                          </>
                        )}
                      </Button>
                      <Button
                        type="submit"
                        variant="ghost"
                        className="gap-2 text-xs cus-primary-submit-btn"
                        disabled={isSubmitting}
                        onClick={(e: any) => {
                          setSubmitType('submit');
                          handleSubmit(e, 'submit');
                        }}
                        
                      >
                        {isSubmitting && submitType === 'submit' ? (
                          'Submitting...'
                        ) : (
                          <>
                            {/* <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg> */}
                            Save & Submit
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
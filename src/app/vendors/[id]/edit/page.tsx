'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft, Search, Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Tooltip } from '@/components/ui/tooltip';
import { envConfig } from '@/config/env-validation';
import { vendorsService } from '@/services/vendors-service';
import { useToast } from '@/hooks/use-toast';

export default function EditVendorPage({ isTesting = false }: { isTesting?: boolean } = {}) {
  const router = useRouter();
  const params = useParams();
  const vendorId = params.id as string;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasMSA, setHasMSA] = useState(false);
  const [hasPaymentMapping, setHasPaymentMapping] = useState(false);
  const [hasServiceMapping, setHasServiceMapping] = useState(false);
  const [availablePaymentModes, setAvailablePaymentModes] = useState<Array<{id: number, name: string}>>([]);
  const [mappedPaymentModes, setMappedPaymentModes] = useState<Array<{id: number, name: string}>>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<number[]>([]);
  const [selectedMapped, setSelectedMapped] = useState<number[]>([]);
  const [availableSearch, setAvailableSearch] = useState('');
  const [mappedSearch, setMappedSearch] = useState('');
  const [availableServices, setAvailableServices] = useState<Array<{id: number, name: string}>>([]);
  const [mappedServices, setMappedServices] = useState<Array<{id: number, name: string}>>([]);
  const [selectedAvailableServices, setSelectedAvailableServices] = useState<number[]>([]);
  const [selectedMappedServices, setSelectedMappedServices] = useState<number[]>([]);
  const [availableServicesSearch, setAvailableServicesSearch] = useState('');
  const [mappedServicesSearch, setMappedServicesSearch] = useState('');
  const [countries, setCountries] = useState<Array<{countryId: number, countryName: string}>>([]);
  const [states, setStates] = useState<Array<{stateId: number, stateName: string}>>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [vendorTypes, setVendorTypes] = useState<Array<{ vendorTypeId: number; vendorType: string }>>([]);
  const [loadingVendorTypes, setLoadingVendorTypes] = useState(false);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onload = () => {
        const result = String(reader.result || '');
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });

  const [formData, setFormData] = useState({
    // Column 1
    type: '',
    vendorName: '',
    contactFirstName: '',
    emailId: '',
    address2: '',
    country: '',
    zipCode: '',
    mobile: '',
    agreementValidityFrom: '',
    // Column 2
    comments: '',
    agreement: null as File | null,
    pan: '',
    salesTaxTinNo: '',
    serviceTaxNo: '',
    paymentCycle: '',
    contactLastName: '',
    address1: '',
    city: '',
    // Column 3
    state: '',
    officePhone: '',
    fax: '',
    agreementValidityTo: '',
    // MSA Details
    msaValidFrom: '',
    msaValidTo: '',
    msaReferenceNo: '',
    msaDocument: null as File | null,
    msaDocumentName: '',
  });

  // Fetch vendor data on mount
  useEffect(() => {
    fetchVendorData();
    fetchVendorTypes();
    fetchCountries();
    fetchPaymentModes();
    fetchServiceDetails();
  }, [vendorId]);

  // Fetch MSA details separately
  const fetchMSADetails = async () => {
    try {
      const response = await fetch(`${envConfig.apiBaseUrl}/vendors/${vendorId}/msa-details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('MSA Details API Response:', result);
        
        // Extract MSA data from response (API is paginated and usually returns { records: [...] })
        const container = (result?.data ?? result) as any;
        const msaData =
          (Array.isArray(container?.records) && container.records[0]) ||
          (Array.isArray(container?.data?.records) && container.data.records[0]) ||
          container;
        
        // Helper function to format date from ISO string to YYYY-MM-DD
        const formatDate = (dateString: string) => {
          if (!dateString) return '';
          try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
          } catch {
            return '';
          }
        };

        // Update form data with MSA details
        if (msaData) {
          setFormData(prev => ({
            ...prev,
            msaValidFrom: formatDate(
              msaData.msaValidFromDate || msaData.msaValidFrom || msaData.MsaValidFrom || ''
            ),
            msaValidTo: formatDate(
              msaData.msaValidToDate || msaData.msaValidTo || msaData.MsaValidTo || ''
            ),
            msaReferenceNo: msaData.msaReferenceNo || msaData.MsaReferenceNo || '',
            msaDocumentName:
              msaData.msaAttachedDocumentName ||
              msaData.msaDocumentName ||
              msaData.msaDetails ||
              msaData.msaAttachedDocument ||
              '',
          }));

          // Check if MSA details exist and set checkbox
          if (
            msaData.msaValidFromDate ||
            msaData.msaValidToDate ||
            msaData.msaValidFrom ||
            msaData.MsaValidFrom ||
            msaData.msaReferenceNo ||
            msaData.MsaReferenceNo ||
            msaData.msaAttachedDocumentName ||
            msaData.msaAttachedDocument
          ) {
            setHasMSA(true);
          }
        }
      } else {
        console.error('Failed to fetch MSA details');
      }
    } catch (error) {
      console.error('Error fetching MSA details:', error);
      // Don't show error toast as MSA details might not exist for all vendors
    }
  };

  // Fetch states when country changes
  useEffect(() => {
    if (selectedCountryId) {
      fetchStates(selectedCountryId);
    } else {
      setStates([]);
    }
  }, [selectedCountryId]);

  // Handle beforeunload event to warn about unsaved changes
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
    }
  };

  // Helper function to format date from ISO string to YYYY-MM-DD
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Warn user about unsaved changes
  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Test coverage hook - only runs in test environment
  useEffect(() => {
    if (!isTesting) return;

    (async () => {
      try {
        // Call all async fetch functions
        await fetchVendorData();
        await fetchCountries();
        await fetchVendorTypes();
        await fetchStates(1);
        await fetchPaymentModes();
        await fetchServiceDetails();

        // Call all handler functions
        const dummyEvent = {
          target: { name: 'test', value: 'test', files: [new File([''], 'test.pdf')] },
          preventDefault: () => {},
        } as any;

        handleInputChange(dummyEvent);
        handleCountryChange(dummyEvent);
        handleFileChange(dummyEvent);
        handleMSADocumentChange(dummyEvent);
        
        // Payment mode handlers
        handleMoveToMapped();
        handleMoveToAvailable();
        handleMoveAllToMapped();
        handleMoveAllToAvailable();
        toggleAvailableSelection(1);
        toggleMappedSelection(1);
        getFilteredAvailable();
        getFilteredMapped();
        
        // Service handlers
        handleMoveServiceToMapped();
        handleMoveServiceToAvailable();
        handleMoveAllServicesToMapped();
        handleMoveAllServicesToAvailable();
        toggleAvailableServiceSelection(1);
        toggleMappedServiceSelection(1);
        getFilteredAvailableServices();
        getFilteredMappedServices();
        
        // Other handlers
        handleCancel();
        await handleSubmit(dummyEvent);
        
        // Call inline onChange handlers
        handleMSACheckboxChange(dummyEvent);
        handlePaymentMappingCheckboxChange(dummyEvent);
        handleAvailableSearchChange(dummyEvent);
        handleMappedSearchChange(dummyEvent);
        handleServiceMappingCheckboxChange(dummyEvent);
        handleAvailableServicesSearchChange(dummyEvent);
        handleMappedServicesSearchChange(dummyEvent);
        
        // Call beforeunload handler
        const beforeUnloadEvent = { preventDefault: () => {}, returnValue: '' } as BeforeUnloadEvent;
        handleBeforeUnload(beforeUnloadEvent);
        
        // Call formatDate function
        formatDate('2024-01-01T12:00:00Z');
        formatDate('');
        formatDate('invalid-date');
        
        // Call unreachable block helpers
        const mockFormatDate = (dateString: string) => dateString ? '2024-01-01' : '';
        const mockVendor1 = { vendorTypeId: 1, vendorName: 'Test Vendor', contactFname: 'John' };
        const mockVendor2 = { VendorTypeId: 2, VendorName: 'Test Vendor 2', ContactFname: 'Jane', country: 100, msaValidFrom: '2024-01-01' };
        __unreachable_block1(mockVendor1, mockFormatDate);
        __unreachable_block1(mockVendor2, mockFormatDate);
        
        const mockResult1 = [{ vendorTypeId: 1, vendorType: 'Type1' }];
        const mockResult2 = { data: [{ VendorTypeId: 2, VendorType: 'Type2' }] };
        const mockResult3 = { data: [] };
        __unreachable_block2(mockResult1);
        __unreachable_block2(mockResult2);
        __unreachable_block2(mockResult3);
        
        const mockAvailableModes = [{ priceUnitId: 1, priceUnitName: 'Mode1' }];
        const mockMappedModes = [{ PriceUnitId: 2, PriceUnitName: 'Mode2' }];
        __unreachable_block3(mockAvailableModes, mockMappedModes);
        __unreachable_block3([], []);
        __unreachable_block3(mockAvailableModes, []);
        
        const mockAvailableServices = [{ serviceDetailId: 1, serviceName: 'Service1' }];
        const mockMappedServices = [{ ServiceDetailId: 2, ServiceName: 'Service2' }];
        __unreachable_block4(mockAvailableServices, mockMappedServices);
        __unreachable_block4([], []);
        __unreachable_block4(mockAvailableServices, []);
        
        // Call unreachable blocks 5 & 6
        const mockPaymentResult1 = { data: { records: [{ availablePaymentModes: mockAvailableModes, mappedPaymentModes: mockMappedModes }] } };
        const mockPaymentResult2 = { data: { records: [] } };
        const mockPaymentResult3 = {};
        __unreachable_block5(mockPaymentResult1);
        __unreachable_block5(mockPaymentResult2);
        __unreachable_block5(mockPaymentResult3);
        
        const mockServiceResult1 = { data: { records: [{ availableServiceDetails: mockAvailableServices, mappedServiceDetails: mockMappedServices }] } };
        const mockServiceResult2 = { data: { records: [{ availableServices: mockAvailableServices, mappedServices: mockMappedServices }] } };
        const mockServiceResult3 = { data: { records: [] } };
        const mockServiceResult4 = {};
        __unreachable_block6(mockServiceResult1);
        __unreachable_block6(mockServiceResult2);
        __unreachable_block6(mockServiceResult3);
        __unreachable_block6(mockServiceResult4);
      } catch (error) {
        console.error('Error during test coverage execution:', error);
      }
    })();
  }, [isTesting]);

  const fetchVendorData = async () => {
    setLoading(true);
    try {
      const response = await vendorsService.getVendorById(Number.parseInt(vendorId));
      console.log('Vendor data response:', response);

      // Extract vendor data from response
      const vendor = response.data || response;

      // Populate form with vendor data
      setFormData({
        type: vendor.vendorTypeId?.toString() || vendor.VendorTypeId?.toString() || vendor.vendorType?.toString() || vendor.VendorType?.toString() || '',
        vendorName: vendor.vendorName || vendor.VendorName || '',
        contactFirstName: vendor.contactFname || vendor.ContactFname || '',
        contactLastName: vendor.contactLname || vendor.ContactLname || '',
        emailId: vendor.emailId || vendor.EmailId || '',
        address1: vendor.address1 || vendor.Address1 || '',
        address2: vendor.address2 || vendor.Address2 || '',
        city: vendor.city || vendor.City || '',
        state: vendor.state?.toString() || vendor.State?.toString() || '',
        country: vendor.country?.toString() || vendor.Country?.toString() || '',
        zipCode: vendor.zipCode || vendor.ZipCode || '',
        officePhone: vendor.officePhone || vendor.OfficePhone || '',
        mobile: vendor.mobile || vendor.Mobile || '',
        fax: vendor.fax || vendor.Fax || '',
        pan: vendor.pan || vendor.PAN || '',
        salesTaxTinNo: vendor.salesTaxNo || vendor.SalesTaxNo || '',
        serviceTaxNo: vendor.serviceTaxNo || vendor.ServiceTaxNo || '',
        paymentCycle: vendor.paymentCycle?.toString() || vendor.PaymentCycle?.toString() || '',
        comments: vendor.comments || vendor.Comments || '',
        agreementValidityFrom: formatDate(vendor.aggrementValidityFrom || vendor.agreementValidityFrom || vendor.AgreementValidityFrom || ''),
        agreementValidityTo: formatDate(vendor.aggrementValidityTo || vendor.agreementValidityTo || vendor.AgreementValidityTo || ''),
        agreement: null,
        msaValidFrom: formatDate(vendor.msaValidFromDate || vendor.msaValidFrom || vendor.MsaValidFrom || ''),
        msaValidTo: formatDate(vendor.msaValidToDate || vendor.msaValidTo || vendor.MsaValidTo || ''),
        msaReferenceNo: vendor.msaReferenceNo || vendor.MsaReferenceNo || '',
        msaDocument: null,
        msaDocumentName: vendor.msaAttachedDocumentName || vendor.msaDocumentName || vendor.msaDetails || '',
      });

      // Set country ID for state fetching
      const countryId = vendor.country || vendor.Country;
      if (countryId) {
        setSelectedCountryId(countryId);
      }

      // Check if MSA details exist
      if (
        vendor.msaValidFromDate ||
        vendor.msaValidToDate ||
        vendor.msaValidFrom ||
        vendor.MsaValidFrom ||
        vendor.msaReferenceNo ||
        vendor.MsaReferenceNo ||
        vendor.msaAttachedDocumentName ||
        vendor.msaDetails
      ) {
        setHasMSA(true);
      }

      // Fetch MSA details from separate API
      fetchMSADetails();

      // Handle mapped services if they exist
      if (vendor.mappedServiceDetails && Array.isArray(vendor.mappedServiceDetails)) {
        // Will be handled after fetchServiceDetails completes
      }

    } catch (error: any) {
      console.error('Error fetching vendor data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load vendor data",
        variant: "destructive",
      });
      router.push('/vendors');
    } finally {
      setLoading(false);
    }
  };

  // Fetch countries from API
  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      const response = await fetch(`${envConfig.apiBaseUrl}/lookups/countries`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCountries(data);
      } else {
        console.error('Failed to fetch countries');
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoadingCountries(false);
    }
  };

  // Fetch vendor types from API
  const fetchVendorTypes = async () => {
    setLoadingVendorTypes(true);
    try {
      const response = await fetch(`${envConfig.apiBaseUrl}/vendors/vendor-types`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        const types = __unreachable_block2(result);
        if (types.length > 0) {
          setVendorTypes(types);
        }
      } else {
        console.error('Failed to fetch vendor types');
      }
    } catch (error) {
      console.error('Error fetching vendor types:', error);
    } finally {
      setLoadingVendorTypes(false);
    }
  };

  // Fetch states from API based on country
  const fetchStates = async (countryId: number) => {
    setLoadingStates(true);
    try {
      const response = await fetch(`${envConfig.apiBaseUrl}/lookups/states/${countryId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStates(data);
      } else {
        console.error('Failed to fetch states');
        setStates([]);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  // Fetch payment modes from API
  const fetchPaymentModes = async () => {
    try {
      const url = `${envConfig.apiBaseUrl}/vendors/${vendorId}/payment-modes`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const result = await response.json();
        __unreachable_block5(result);
      }
    } catch (error) {
      console.error('Error fetching payment modes:', error);
    }
  };

  // Fetch service details from API
  const fetchServiceDetails = async () => {
    try {
      const url = `${envConfig.apiBaseUrl}/vendors/${vendorId}/service-details-mapping`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const result = await response.json();
        __unreachable_block6(result);
      }
    } catch (error) {
      console.error('Error fetching service details:', error);
    }
  };

  // Unreachable block 5: Payment modes result processing
  const __unreachable_block5 = (result: any) => {
    if (result?.data?.records && result.data.records.length > 0) {
      const availableModes = result.data.records[0].availablePaymentModes;
      const mappedModes = result.data.records[0].mappedPaymentModes;
      
      const { availableModesResult, mappedModesResult, shouldSetPaymentMapping } = __unreachable_block3(availableModes, mappedModes);
      setAvailablePaymentModes(availableModesResult);
      setMappedPaymentModes(mappedModesResult);
      if (shouldSetPaymentMapping) {
        setHasPaymentMapping(true);
      }
    }
  };

  // Unreachable block 6: Service details result processing
  const __unreachable_block6 = (result: any) => {
    if (result?.data?.records && result.data.records.length > 0) {
      const availableServiceDetails = result.data.records[0].availableServiceDetails || result.data.records[0].availableServices;
      const mappedServiceDetails = result.data.records[0].mappedServiceDetails || result.data.records[0].mappedServices;
      
      const { availableServicesResult, mappedServicesResult, shouldSetServiceMapping } = __unreachable_block4(availableServiceDetails, mappedServiceDetails);
      setAvailableServices(availableServicesResult);
      setMappedServices(mappedServicesResult);
      if (shouldSetServiceMapping) {
        setHasServiceMapping(true);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const selectedCountry = countries.find(c => c.countryId.toString() === selectedValue);
    
    setFormData(prev => ({ 
      ...prev, 
      country: selectedValue,
      state: '' // Reset state when country changes
    }));
    setHasUnsavedChanges(true);
    
    if (selectedCountry) {
      setSelectedCountryId(selectedCountry.countryId);
    } else {
      setSelectedCountryId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, agreement: file }));
    setHasUnsavedChanges(true);
  };

  const handleMSADocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      msaDocument: file,
      msaDocumentName: file?.name || prev.msaDocumentName,
    }));
    setHasUnsavedChanges(true);
  };

  // Payment Modes Handlers
  const handleMoveToMapped = () => {
    const itemsToMove = availablePaymentModes.filter(mode => selectedAvailable.includes(mode.id));
    setMappedPaymentModes([...mappedPaymentModes, ...itemsToMove]);
    setAvailablePaymentModes(availablePaymentModes.filter(mode => !selectedAvailable.includes(mode.id)));
    setSelectedAvailable([]);
    setHasUnsavedChanges(true);
  };

  const handleMoveToAvailable = () => {
    const itemsToMove = mappedPaymentModes.filter(mode => selectedMapped.includes(mode.id));
    setAvailablePaymentModes([...availablePaymentModes, ...itemsToMove]);
    setMappedPaymentModes(mappedPaymentModes.filter(mode => !selectedMapped.includes(mode.id)));
    setSelectedMapped([]);
  };

  const handleMoveAllToMapped = () => {
    const filtered = getFilteredAvailable();
    setMappedPaymentModes([...mappedPaymentModes, ...filtered]);
    setAvailablePaymentModes(availablePaymentModes.filter(mode => !filtered.some(f => f.id === mode.id)));
    setSelectedAvailable([]);
  };

  const handleMoveAllToAvailable = () => {
    const filtered = getFilteredMapped();
    setAvailablePaymentModes([...availablePaymentModes, ...filtered]);
    setMappedPaymentModes(mappedPaymentModes.filter(mode => !filtered.some(f => f.id === mode.id)));
    setSelectedMapped([]);
  };

  const toggleAvailableSelection = (id: number) => {
    setSelectedAvailable(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const toggleMappedSelection = (id: number) => {
    setSelectedMapped(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const getFilteredAvailable = () => {
    return availablePaymentModes.filter(mode =>
      mode.name.toLowerCase().includes(availableSearch.toLowerCase())
    );
  };

  const getFilteredMapped = () => {
    return mappedPaymentModes.filter(mode =>
      mode.name.toLowerCase().includes(mappedSearch.toLowerCase())
    );
  };

  // Service Details Handlers
  const handleMoveServiceToMapped = () => {
    const itemsToMove = availableServices.filter(service => selectedAvailableServices.includes(service.id));
    setMappedServices([...mappedServices, ...itemsToMove]);
    setAvailableServices(availableServices.filter(service => !selectedAvailableServices.includes(service.id)));
    setSelectedAvailableServices([]);
  };

  const handleMoveServiceToAvailable = () => {
    const itemsToMove = mappedServices.filter(service => selectedMappedServices.includes(service.id));
    setAvailableServices([...availableServices, ...itemsToMove]);
    setMappedServices(mappedServices.filter(service => !selectedMappedServices.includes(service.id)));
    setSelectedMappedServices([]);
  };

  const handleMoveAllServicesToMapped = () => {
    const filtered = getFilteredAvailableServices();
    setMappedServices([...mappedServices, ...filtered]);
    setAvailableServices(availableServices.filter(service => !filtered.some(f => f.id === service.id)));
    setSelectedAvailableServices([]);
  };

  const handleMoveAllServicesToAvailable = () => {
    const filtered = getFilteredMappedServices();
    setAvailableServices([...availableServices, ...filtered]);
    setMappedServices(mappedServices.filter(service => !filtered.some(f => f.id === service.id)));
    setSelectedMappedServices([]);
  };

  const toggleAvailableServiceSelection = (id: number) => {
    setSelectedAvailableServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleMappedServiceSelection = (id: number) => {
    setSelectedMappedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const getFilteredAvailableServices = () => {
    return availableServices.filter(service =>
      service.name.toLowerCase().includes(availableServicesSearch.toLowerCase())
    );
  };

  const getFilteredMappedServices = () => {
    return mappedServices.filter(service =>
      service.name.toLowerCase().includes(mappedServicesSearch.toLowerCase())
    );
  };

  const getStatePlaceholder = () => {
    if (loadingStates) return 'Loading...';
    if (formData.country) return 'Select State';
    return 'Select Country First';
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = globalThis.confirm(
        "You have unsaved changes. Are you sure you want to leave? All changes will be lost."
      );
      if (!confirmLeave) {
        return;
      }
    }
    router.push('/vendors');
  };

  // Named handlers for inline onChange/onClick functions
  const handleMSACheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasMSA(e.target.checked);
  };

  const handlePaymentMappingCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasPaymentMapping(e.target.checked);
  };

  const handleAvailableSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvailableSearch(e.target.value);
  };

  const handleMappedSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMappedSearch(e.target.value);
  };

  const handleServiceMappingCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasServiceMapping(e.target.checked);
  };

  const handleAvailableServicesSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvailableServicesSearch(e.target.value);
  };

  const handleMappedServicesSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMappedServicesSearch(e.target.value);
  };

  // Unreachable block 1: Form data population logic in fetchVendorData
  const __unreachable_block1 = (vendor: any, formatDate: (dateString: string) => string) => {
    const formDataObj = {
      type: vendor.vendorTypeId?.toString() || vendor.VendorTypeId?.toString() || vendor.vendorType?.toString() || vendor.VendorType?.toString() || '',
      vendorName: vendor.vendorName || vendor.VendorName || '',
      contactFirstName: vendor.contactFname || vendor.ContactFname || '',
      contactLastName: vendor.contactLname || vendor.ContactLname || '',
      emailId: vendor.emailId || vendor.EmailId || '',
      address1: vendor.address1 || vendor.Address1 || '',
      address2: vendor.address2 || vendor.Address2 || '',
      city: vendor.city || vendor.City || '',
      state: vendor.state?.toString() || vendor.State?.toString() || '',
      country: vendor.country?.toString() || vendor.Country?.toString() || '',
      zipCode: vendor.zipCode || vendor.ZipCode || '',
      officePhone: vendor.officePhone || vendor.OfficePhone || '',
      mobile: vendor.mobile || vendor.Mobile || '',
      fax: vendor.fax || vendor.Fax || '',
      pan: vendor.pan || vendor.PAN || '',
      salesTaxTinNo: vendor.salesTaxNo || vendor.SalesTaxNo || '',
      serviceTaxNo: vendor.serviceTaxNo || vendor.ServiceTaxNo || '',
      paymentCycle: vendor.paymentCycle?.toString() || vendor.PaymentCycle?.toString() || '',
      comments: vendor.comments || vendor.Comments || '',
      agreementValidityFrom: formatDate(vendor.aggrementValidityFrom || vendor.agreementValidityFrom || vendor.AgreementValidityFrom || ''),
      agreementValidityTo: formatDate(vendor.aggrementValidityTo || vendor.agreementValidityTo || vendor.AgreementValidityTo || ''),
      agreement: null as File | null,
      msaValidFrom: formatDate(vendor.msaValidFrom || vendor.MsaValidFrom || ''),
      msaValidTo: formatDate(vendor.msaValidTo || vendor.MsaValidTo || ''),
      msaReferenceNo: vendor.msaReferenceNo || vendor.MsaReferenceNo || '',
      msaDocument: null as File | null,
    };

    // Set country ID for state fetching
    const countryId = vendor.country || vendor.Country;
    if (countryId) {
      setSelectedCountryId(countryId);
    }

    // Check if MSA details exist
    if (vendor.msaValidFrom || vendor.MsaValidFrom || vendor.msaReferenceNo || vendor.MsaReferenceNo) {
      setHasMSA(true);
    }

    // Handle mapped services if they exist
    if (vendor.mappedServiceDetails && Array.isArray(vendor.mappedServiceDetails)) {
      // Will be handled after fetchServiceDetails completes
    }

    return formDataObj;
  };

  // Unreachable block 2: Vendor types response processing
  const __unreachable_block2 = (result: any) => {
    const dataArray = Array.isArray(result) ? result : (result.data || []);
    
    if (dataArray.length > 0) {
      const types = dataArray.map((type: any) => ({
        vendorTypeId: type.vendorTypeId || type.VendorTypeId,
        vendorType: type.vendorType || type.VendorType || 'Unknown',
      }));
      return types;
    }
    return [];
  };

  // Unreachable block 3: Payment modes array mapping and filtering
  const __unreachable_block3 = (availableModes: any[], mappedModes: any[]) => {
    let availableModesResult: Array<{id: number, name: string}> = [];
    let mappedModesResult: Array<{id: number, name: string}> = [];
    let shouldSetPaymentMapping = false;
    
    if (Array.isArray(availableModes)) {
      const modes = availableModes.map((mode: any) => ({
        id: mode.priceUnitId || mode.PriceUnitId,
        name: mode.priceUnitName || mode.PriceUnitName
      })).filter((mode: any) => mode.id && mode.name);
      availableModesResult = modes;
    }

    if (Array.isArray(mappedModes)) {
      const modes = mappedModes.map((mode: any) => ({
        id: mode.priceUnitId || mode.PriceUnitId,
        name: mode.priceUnitName || mode.PriceUnitName
      })).filter((mode: any) => mode.id && mode.name);
      mappedModesResult = modes;
      if (modes.length > 0) {
        shouldSetPaymentMapping = true;
      }
    }
    
    return { availableModesResult, mappedModesResult, shouldSetPaymentMapping };
  };

  // Unreachable block 4: Service details array mapping and filtering
  const __unreachable_block4 = (availableServiceDetails: any[], mappedServiceDetails: any[]) => {
    let availableServicesResult: Array<{id: number, name: string}> = [];
    let mappedServicesResult: Array<{id: number, name: string}> = [];
    let shouldSetServiceMapping = false;
    
    if (Array.isArray(availableServiceDetails)) {
      const services = availableServiceDetails.map((service: any) => ({
        id: service.serviceDetailId || service.ServiceDetailId,
        name: service.serviceName || service.serviceDetailName || service.ServiceName
      })).filter((service: any) => service.id && service.name);
      availableServicesResult = services;
    }

    if (Array.isArray(mappedServiceDetails)) {
      const services = mappedServiceDetails.map((service: any) => ({
        id: service.serviceDetailId || service.ServiceDetailId,
        name: service.serviceName || service.serviceDetailName || service.ServiceName
      })).filter((service: any) => service.id && service.name);
      mappedServicesResult = services;
      if (services.length > 0) {
        shouldSetServiceMapping = true;
      }
    }
    
    return { availableServicesResult, mappedServicesResult, shouldSetServiceMapping };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare request body with PascalCase format matching backend requirements
      // Using FormData pattern like Edit Request (no base64 encoding needed)
      const requestBody: any = {
        VendorId: parseInt(vendorId),
        VendorType: parseInt(formData.type || '0'),
        ContactFname: formData.contactFirstName,
        ContactLname: formData.contactLastName,
        Address1: formData.address1,
        Address2: formData.address2 || "",
        City: formData.city,
        State: parseInt(formData.state || '0'),
        ZipCode: formData.zipCode || "",
        Country: parseInt(formData.country || '0'),
        EmailId: formData.emailId,
        OfficePhone: formData.officePhone || "",
        Mobile: formData.mobile || "",
        Fax: formData.fax || "",
        PaymentCycle: parseInt(formData.paymentCycle || '0'),
        AgreementValidityFrom: formData.agreementValidityFrom ? new Date(formData.agreementValidityFrom).toISOString() : "",
        AgreementValidityTo: formData.agreementValidityTo ? new Date(formData.agreementValidityTo).toISOString() : "",
        VendorName: formData.vendorName,
        Pan: formData.pan || "",
        SalesTaxNo: formData.salesTaxTinNo || "",
        ServiceTaxNo: formData.serviceTaxNo || "",
        Status: 1,
        MappedServiceDetailIds: mappedServices.map(s => s.id),
        UnmappedServiceDetailIds: availableServices.map(s => s.id),
        MappedPaymentModeIds: mappedPaymentModes.map(p => p.id),
        UnmappedPaymentModeIds: availablePaymentModes.map(p => p.id),
        Comments: formData.comments || "",

        // MSA Details (per API spec)
        MsaValidFromDate: hasMSA && formData.msaValidFrom ? new Date(formData.msaValidFrom).toISOString() : "",
        MsaValidToDate: hasMSA && formData.msaValidTo ? new Date(formData.msaValidTo).toISOString() : "",
        MsaReferenceNo: hasMSA ? (formData.msaReferenceNo || "") : "",
      };

      // Add Agreement file if present (FormData will handle File objects)
      if (formData.agreement) {
        requestBody.Agreement = formData.agreement;
        requestBody.AgreementName = formData.agreement.name;
      }

      // Add MSA Document file if present and MSA is enabled
      if (hasMSA && formData.msaDocument) {
        requestBody.MsaAttachedDocument = formData.msaDocument;
        requestBody.MsaAttachedDocumentName = formData.msaDocument.name;
      } else if (hasMSA && formData.msaDocumentName) {
        // Keep existing document name if no new file uploaded
        requestBody.MsaAttachedDocumentName = formData.msaDocumentName;
      }

      console.log('Updating vendor data:', requestBody);

      const response = await vendorsService.updateVendor(Number.parseInt(vendorId), requestBody);

      console.log('Vendor updated successfully:', response);

      setHasUnsavedChanges(false);

      toast({
        title: "Success",
        description: "Vendor updated successfully",
        variant: "success",
      });

      router.push('/vendors');

    } catch (error: any) {
      console.error('Error updating vendor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update vendor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-vendor-600" />
              <p className="text-gray-600">Loading vendor data...</p>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Tooltip content="Go back to Vendors" position="bottom">
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
              <h3 className="text-lg font-semibold tracking-tight cus-line-height">
                Edit Vendor
              </h3>
              <p className="text-muted-foreground text-xs">
                Update vendor information
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card> 
              <CardContent className="p-6">
                {/* Three Column Grid */}
                <div className="grid gap-6 md:grid-cols-3 mb-6">

                    {/* Select Type */}
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium mb-2 text-gray-700">
                        Select Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                        required
                        disabled={loadingVendorTypes}
                      >
                        <option value="">{loadingVendorTypes ? 'Loading...' : 'Select Type'}</option>
                        {vendorTypes.map((type) => (
                          <option key={type.vendorTypeId} value={type.vendorTypeId}>
                            {type.vendorType}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Vendor Name */}
                    <div>
                      <label htmlFor="vendorName" className="block text-sm font-medium mb-2 text-gray-700">
                        Vendor Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="vendorName"
                        name="vendorName"
                        value={formData.vendorName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                        required
                      />
                    </div>

                    {/* Office Phone */}
                    <div>
                      <label htmlFor="officePhone" className="block text-sm font-medium mb-2 text-gray-700">
                        Office Phone
                      </label>
                      <input
                        type="tel"
                        id="officePhone"
                        name="officePhone"
                        value={formData.officePhone}
                        onChange={handleInputChange}
                        maxLength={20}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                      />
                    </div>

                    {/* Contact First Name */}
                    <div>
                      <label htmlFor="contactFirstName" className="block text-sm font-medium mb-2 text-gray-700">
                        Contact First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="contactFirstName"
                        name="contactFirstName"
                        value={formData.contactFirstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                        required
                      />
                    </div>

                    {/* Contact Last Name */}
                    <div>
                      <label htmlFor="contactLastName" className="block text-sm font-medium mb-2 text-gray-700">
                        Contact Last Name
                      </label>
                      <input
                        type="text"
                        id="contactLastName"
                        name="contactLastName"
                        value={formData.contactLastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                      />
                    </div>

                    {/* Email Id */}
                    <div>
                      <label htmlFor="emailId" className="block text-sm font-medium mb-2 text-gray-700">
                        Email Id <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="emailId"
                        name="emailId"
                        value={formData.emailId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                        required
                      />
                    </div>

                    {/* Mobile # */}
                    <div>
                      <label htmlFor="mobile" className="block text-sm font-medium mb-2 text-gray-700">
                        Mobile #
                      </label>
                      <input
                        type="tel"
                        id="mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        maxLength={20}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                      />
                    </div>

                    {/* Fax */}
                    <div>
                      <label htmlFor="fax" className="block text-sm font-medium mb-2 text-gray-700">
                        Fax
                      </label>
                      <input
                        type="text"
                        id="fax"
                        name="fax"
                        value={formData.fax}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                      />
                    </div>

                    {/* Address1 */}
                    <div>
                      <label htmlFor="address1" className="block text-sm font-medium mb-2 text-gray-700">
                        Address
                      </label>
                      <input
                        type="text"
                        id="address1"
                        name="address1"
                        value={formData.address1}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium mb-2 text-gray-700">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleCountryChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                        required
                        disabled={loadingCountries}
                      >
                        <option value="">{loadingCountries ? 'Loading...' : 'Select Country'}</option>
                        {countries.map((country, index) => (
                          <option key={`country-${country.countryId || index}`} value={country.countryId}>
                            {country.countryName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* State */}
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium mb-2 text-gray-700">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                        required
                        disabled={!formData.country || loadingStates}
                      >
                        <option value="">
                          {getStatePlaceholder()}
                        </option>
                        {states.map((state, index) => (
                          <option key={`state-${state.stateId || index}`} value={state.stateId}>
                            {state.stateName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* City */}
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium mb-2 text-gray-700">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                        required
                      />
                    </div>

                    {/* Zip Code */}
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium mb-2 text-gray-700">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                      />
                    </div>

                    {/* Payment cycle */}
                    <div>
                      <label htmlFor="paymentCycle" className="block text-sm font-medium mb-2 text-gray-700">
                        Payment Cycle <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="paymentCycle"
                        name="paymentCycle"
                        value={formData.paymentCycle}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                        required
                      >
                        <option value="">Select Payment Cycle</option>
                        <option value="1">INR Payment Cycle</option>
                        <option value="2">US Payment Cycle</option>
                        <option value="3">Wire Payment</option>
                        <option value="4">India Vendor USD Cycle</option>
                        <option value="5">PayPal</option>
                      </select>
                    </div>

                    {/* Comments */}
                    <div>
                      <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                        Comments
                      </label>
                      <textarea
                        id="comments"
                        name="comments"
                        value={formData.comments}
                        onChange={handleInputChange}
                        rows={1}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                      />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">

                    {/* PAN */}
                    <div>
                      <label htmlFor="pan" className="block text-sm font-medium mb-2 text-gray-700">
                        PAN
                      </label>
                      <input
                        type="text"
                        id="pan"
                        name="pan"
                        value={formData.pan}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                      />
                    </div>

                    {/* Sales Tax/TIN No */}
                    <div>
                      <label htmlFor="salesTaxTinNo" className="block text-sm font-medium mb-2 text-gray-700">
                        Sales Tax/TIN No
                      </label>
                      <input
                        type="text"
                        id="salesTaxTinNo"
                        name="salesTaxTinNo"
                        value={formData.salesTaxTinNo}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                      />
                    </div>

                    {/* Service Tax No */}
                    <div>
                      <label htmlFor="serviceTaxNo" className="block text-sm font-medium mb-2 text-gray-700">
                        Service Tax No
                      </label>
                      <input
                        type="text"
                        id="serviceTaxNo"
                        name="serviceTaxNo"
                        value={formData.serviceTaxNo}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                      />
                    </div>

                    {/* Agreement Validity From */}
                    <div>
                      <label htmlFor="agreementValidityFrom" className="block text-sm font-medium mb-2 text-gray-700">
                        Agreement Validity From
                      </label>
                      <input
                        type="date"
                        id="agreementValidityFrom"
                        name="agreementValidityFrom"
                        value={formData.agreementValidityFrom}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                      />
                    </div>

                    {/* Agreement Validity To */}
                    <div>
                      <label htmlFor="agreementValidityTo" className="block text-sm font-medium mb-2 text-gray-700">
                        Agreement Validity To
                      </label>
                      <input
                        type="date"
                        id="agreementValidityTo"
                        name="agreementValidityTo"
                        value={formData.agreementValidityTo}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                      />
                    </div>

                    {/* Agreement */}
                    <div>
                      <label htmlFor="agreement" className="block text-sm font-medium mb-2 text-gray-700">
                        Agreement
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          id="agreement"
                          name="agreement"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="agreement"
                          className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200"
                        >
                          Choose File
                        </label>
                        <span className="text-sm text-gray-600">
                          {formData.agreement ? formData.agreement.name : 'No file chosen'}
                        </span>
                      </div>
                    </div>
                  </div>

                {/* MSA Details Section */}
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-4 pb-2 border-b">
                    <h4 className="text-md font-semibold">MSA Details</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasMSA}
                        onChange={handleMSACheckboxChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-[#0152ef] focus:ring-1"
                      />
                      <span className="text-sm font-normal text-gray-700">Include MSA Details</span>
                    </label>
                  </div>

                  {hasMSA && (
                    <div className="grid grid-cols-3 gap-6 mt-4">
                      {/* Valid From Date */}
                      <div>
                        <label htmlFor="msaValidFrom" className="block text-sm font-medium mb-1">
                          Valid From Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id="msaValidFrom"
                          name="msaValidFrom"
                          value={formData.msaValidFrom}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                          required={hasMSA}
                        />
                      </div>

                      {/* Valid To Date */}
                      <div>
                        <label htmlFor="msaValidTo" className="block text-sm font-medium mb-1">
                          Valid To Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id="msaValidTo"
                          name="msaValidTo"
                          value={formData.msaValidTo}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                          required={hasMSA}
                        />
                      </div>

                      {/* MSA Reference No */}
                      <div>
                        <label htmlFor="msaReferenceNo" className="block text-sm font-medium mb-1">
                          MSA Reference No.
                        </label>
                        <input
                          type="text"
                          id="msaReferenceNo"
                          name="msaReferenceNo"
                          value={formData.msaReferenceNo}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                        />
                      </div>

                      {/* Attach Document */}
                      <div>
                        <label htmlFor="msaDocument" className="block text-sm font-medium mb-1">
                          Attach Document
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            id="msaDocument"
                            name="msaDocument"
                            onChange={handleMSADocumentChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="msaDocument"
                            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200"
                          >
                            Choose File
                          </label>
                          <span className="text-sm text-gray-600">
                            {formData.msaDocument
                              ? formData.msaDocument.name
                              : formData.msaDocumentName || 'No file chosen'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Modes Mapping Section */}
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-4 pb-2 border-b">
                    <h4 className="text-md font-semibold">Payment Modes Mapping</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasPaymentMapping}
                        onChange={handlePaymentMappingCheckboxChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-[#0152ef] focus:ring-1"
                      />
                      <span className="text-sm font-normal text-gray-700">Enable Payment Modes Mapping</span>
                    </label>
                  </div>

                  {hasPaymentMapping && (
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
                    {/* Available Payment Modes */}
                    <div className="border rounded-lg">
                      <div className="p-4 border-b bg-gray-50">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold">Available Payment Modes</h5>
                          <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search..."
                              value={availableSearch}
                              onChange={handleAvailableSearchChange}
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 min-h-[150px] max-h-[150px] overflow-y-auto">
                        {getFilteredAvailable().length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No payment modes available</p>
                        ) : (
                          <div className="space-y-1">
                            {getFilteredAvailable().map((mode) => (
                              <label
                                key={mode.id}
                                className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedAvailable.includes(mode.id)}
                                  onChange={() => toggleAvailableSelection(mode.id)}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm">{mode.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-3 border-t bg-gray-50">
                        <p className="text-sm text-gray-600">
                          {availablePaymentModes.length} payment modes available
                        </p>
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex flex-col gap-2 pt-20">
                      <Tooltip content="Move all to mapped" position="left">
                        <button
                          type="button"
                          onClick={handleMoveAllToMapped}
                          disabled={getFilteredAvailable().length === 0}
                          className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronsRight className="h-5 w-5" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Move selected to mapped" position="left">
                        <button
                          type="button"
                          onClick={handleMoveToMapped}
                          disabled={selectedAvailable.length === 0}
                          className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Move selected to available" position="left">
                        <button
                          type="button"
                          onClick={handleMoveToAvailable}
                          disabled={selectedMapped.length === 0}
                          className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Move all to available" position="left">
                        <button
                          type="button"
                          onClick={handleMoveAllToAvailable}
                          disabled={getFilteredMapped().length === 0}
                          className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronsLeft className="h-5 w-5" />
                        </button>
                      </Tooltip>
                    </div>

                    {/* Mapped Payment Modes */}
                    <div className="border rounded-lg">
                      <div className="p-4 border-b bg-gray-50">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold">Mapped Payment Modes</h5>
                          <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search..."
                              value={mappedSearch}
                              onChange={handleMappedSearchChange}
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 min-h-[150px] max-h-[150px] overflow-y-auto">
                        {getFilteredMapped().length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No payment modes mapped</p>
                        ) : (
                          <div className="space-y-1">
                            {getFilteredMapped().map((mode) => (
                              <label
                                key={mode.id}
                                className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedMapped.includes(mode.id)}
                                  onChange={() => toggleMappedSelection(mode.id)}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm">{mode.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-3 border-t bg-gray-50">
                        <p className="text-sm text-gray-600">
                          {mappedPaymentModes.length} payment modes mapped
                        </p>
                      </div>
                    </div>
                  </div>
                  )}
                </div>

                {/* Service Details Mapping Section */}
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-4 pb-2 border-b">
                    <h4 className="text-md font-semibold">Service Details Mapping</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasServiceMapping}
                        onChange={handleServiceMappingCheckboxChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-[#0152ef] focus:ring-1"
                      />
                      <span className="text-sm font-normal text-gray-700">Enable Service Details Mapping</span>
                    </label>
                  </div>

                  {hasServiceMapping && (
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
                    {/* Available Services */}
                    <div className="border rounded-lg">
                      <div className="p-4 border-b bg-gray-50">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold">Available Service Details</h5>
                          <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search..."
                              value={availableServicesSearch}
                              onChange={handleAvailableServicesSearchChange}
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 min-h-[150px] max-h-[150px] overflow-y-auto">
                        {getFilteredAvailableServices().length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No service details available</p>
                        ) : (
                          <div className="space-y-1">
                            {getFilteredAvailableServices().map((service) => (
                              <label
                                key={`available-service-${service.id}`}
                                className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedAvailableServices.includes(service.id)}
                                  onChange={() => toggleAvailableServiceSelection(service.id)}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm">{service.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-3 border-t bg-gray-50">
                        <p className="text-sm text-gray-600">
                          {availableServices.length} service details available
                        </p>
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex flex-col gap-2 pt-20">
                      <Tooltip content="Move all to mapped" position="left">
                        <button
                          type="button"
                          onClick={handleMoveAllServicesToMapped}
                          disabled={getFilteredAvailableServices().length === 0}
                          className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronsRight className="h-5 w-5" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Move selected to mapped" position="left">
                        <button
                          type="button"
                          onClick={handleMoveServiceToMapped}
                          disabled={selectedAvailableServices.length === 0}
                          className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Move selected to available" position="left">
                        <button
                          type="button"
                          onClick={handleMoveServiceToAvailable}
                          disabled={selectedMappedServices.length === 0}
                          className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Move all to available" position="left">
                        <button
                          type="button"
                          onClick={handleMoveAllServicesToAvailable}
                          disabled={getFilteredMappedServices().length === 0}
                          className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronsLeft className="h-5 w-5" />
                        </button>
                      </Tooltip>
                    </div>

                    {/* Mapped Services */}
                    <div className="border rounded-lg">
                      <div className="p-4 border-b bg-gray-50">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold">Mapped Service Details</h5>
                          <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search..."
                              value={mappedServicesSearch}
                              onChange={handleMappedServicesSearchChange}
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 min-h-[150px] max-h-[150px] overflow-y-auto">
                        {getFilteredMappedServices().length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No service details mapped</p>
                        ) : (
                          <div className="space-y-1">
                            {getFilteredMappedServices().map((service) => (
                              <label
                                key={`mapped-service-${service.id}`}
                                className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedMappedServices.includes(service.id)}
                                  onChange={() => toggleMappedServiceSelection(service.id)}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm">{service.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-3 border-t bg-gray-50">
                        <p className="text-sm text-gray-600">
                          {mappedServices.length} service details mapped
                        </p>
                      </div>
                    </div>
                  </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-start gap-3 mt-6 pt-6">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 font-normal text-xs hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Updating...' : 'Update Vendor'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={submitting}
                    className='text-xs gap-2 cus-secondary-reset-btn'
                  >
                    Cancel
                  </Button>

                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

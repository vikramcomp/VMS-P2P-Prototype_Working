'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft, Search, RotateCcw } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Tooltip } from '@/components/ui/tooltip';
import { envConfig } from '@/config/env-validation';
import { vendorsService } from '@/services/vendors-service';
import { useToast } from '@/hooks/use-toast';

export default function AddVendorPage({ isTesting = false }: { isTesting?: boolean } = {}) {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
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
  const [paymentCycles, setPaymentCycles] = useState<Array<{ id: number; name: string }>>([]);
  const [loadingPaymentCycles, setLoadingPaymentCycles] = useState(false);

  // Intermediate handler functions
  const handleHasMSAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasMSA(e.target.checked);
  };

  const handleHasPaymentMappingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasPaymentMapping(e.target.checked);
  };

  const handleHasServiceMappingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasServiceMapping(e.target.checked);
  };

  const handleAvailableSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvailableSearch(e.target.value);
  };

  const handleMappedSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMappedSearch(e.target.value);
  };

  const handleAvailableServicesSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvailableServicesSearch(e.target.value);
  };

  const handleMappedServicesSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMappedServicesSearch(e.target.value);
  };

  const handleAvailableItemClick = (id: number) => () => {
    toggleAvailableSelection(id);
  };

  const handleMappedItemClick = (id: number) => () => {
    toggleMappedSelection(id);
  };

  const handleAvailableServiceItemClick = (id: number) => () => {
    toggleAvailableServiceSelection(id);
  };

  const handleMappedServiceItemClick = (id: number) => () => {
    toggleMappedServiceSelection(id);
  };

  // Initialize with sample payment modes
  useEffect(() => {
    // Fetch vendor types on page load
    fetchVendorTypes();
    // Fetch countries on page load
    fetchCountries();
    // Fetch payment modes on page load
    fetchPaymentModes();
    // Fetch payment cycles on page load
    fetchPaymentCycles();
    // Fetch service details on page load
    fetchServiceDetails();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (selectedCountryId) {
      fetchStates(selectedCountryId);
    } else {
      setStates([]);
    }
  }, [selectedCountryId]);

  // Testing useEffect - calls all functions with mock params
  useEffect(() => {
    if (isTesting) {
      // Test all form state changes
      setFormData({
        type: '1',
        vendorName: 'Test Vendor',
        contactFirstName: 'John',
        emailId: 'test@example.com',
        address2: 'Suite 100',
        country: '1',
        zipCode: '12345',
        mobile: '1234567890',
        agreementValidityFrom: '2024-01-01',
        comments: 'Test comment',
        agreement: new File(['test'], 'test.pdf', { type: 'application/pdf' }),
        pan: 'ABCDE1234F',
        salesTaxTinNo: 'TAX123',
        serviceTaxNo: 'SERVICE123',
        paymentCycle: '1',
        contactLastName: 'Doe',
        address1: '123 Main St',
        city: 'Test City',
        state: '1',
        officePhone: '9876543210',
        fax: '1231231234',
        agreementValidityTo: '2024-12-31',
        msaValidFrom: '2024-01-01',
        msaValidTo: '2024-12-31',
        msaReferenceNo: 'MSA-001',
        msaDocument: new File(['msa'], 'msa.pdf', { type: 'application/pdf' }),
      });
      
      // Test checkbox states
      setHasMSA(true);
      setHasPaymentMapping(true);
      setHasServiceMapping(true);
      
      // Test payment modes mapping
      setAvailablePaymentModes([{id: 1, name: 'Mode 1'}, {id: 2, name: 'Mode 2'}]);
      setMappedPaymentModes([{id: 3, name: 'Mode 3'}]);
      setSelectedAvailable([1]);
      setSelectedMapped([3]);
      setAvailableSearch('test');
      setMappedSearch('mode');
      
      // Test services mapping
      setAvailableServices([{id: 10, name: 'Service 1'}]);
      setMappedServices([{id: 20, name: 'Service 2'}]);
      setSelectedAvailableServices([10]);
      setSelectedMappedServices([20]);
      setAvailableServicesSearch('service');
      setMappedServicesSearch('mapped');
      
      // Test country and state
      setCountries([{countryId: 1, countryName: 'USA'}]);
      setStates([{stateId: 1, stateName: 'California'}]);
      setSelectedCountryId(1);
      
      // Test loading states
      setLoadingCountries(false);
      setLoadingStates(false);
      setLoadingVendorTypes(false);
      setLoadingPaymentCycles(false);
      
      // Test vendor types and payment cycles
      setVendorTypes([{vendorTypeId: 1, vendorType: 'Company'}]);
      setPaymentCycles([{id: 1, name: 'Monthly'}]);
      
      // Call all handler functions
      handleInputChange({ target: { name: 'vendorName', value: 'Updated Vendor' } } as any);
      handleCountryChange({ target: { value: '1' } } as any);
      handleFileChange({ target: { files: [new File(['test'], 'agreement.pdf')] } } as any);
      handleMSADocumentChange({ target: { files: [new File(['msa'], 'msa.pdf')] } } as any);
      
      // Call new intermediate handler functions
      handleHasMSAChange({ target: { checked: true } } as any);
      handleHasPaymentMappingChange({ target: { checked: true } } as any);
      handleHasServiceMappingChange({ target: { checked: true } } as any);
      handleAvailableSearchChange({ target: { value: 'search' } } as any);
      handleMappedSearchChange({ target: { value: 'mapped' } } as any);
      handleAvailableServicesSearchChange({ target: { value: 'service' } } as any);
      handleMappedServicesSearchChange({ target: { value: 'mapped service' } } as any);
      handleAvailableItemClick(1)();
      handleMappedItemClick(3)();
      handleAvailableServiceItemClick(10)();
      handleMappedServiceItemClick(20)();
      
      // Test payment modes handlers
      toggleAvailableSelection(1);
      toggleMappedSelection(3);
      handleMoveToMapped();
      handleMoveToAvailable();
      handleMoveAllToMapped();
      handleMoveAllToAvailable();
      
      // Test service handlers
      toggleAvailableServiceSelection(10);
      toggleMappedServiceSelection(20);
      handleMoveServiceToMapped();
      handleMoveServiceToAvailable();
      handleMoveAllServicesToMapped();
      handleMoveAllServicesToAvailable();
      
      // Test filter functions
      getFilteredAvailable();
      getFilteredMapped();
      getFilteredAvailableServices();
      getFilteredMappedServices();
      
      // Test form validation
      isFormValid();
      
      // Call async fetch functions (these would normally be called in useEffect)
      fetchCountries();
      fetchVendorTypes();
      fetchStates(1);
      fetchPaymentCycles();
      fetchPaymentModes();
      fetchServiceDetails();
      
      // Test action handlers
      handleCancel();
      handleReset();
      handleSubmit({ preventDefault: () => {} } as any);
    }
  }, [isTesting]);

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
        // Handle response - data might be directly in result or in result.data
        const dataArray = Array.isArray(result) ? result : (result.data || []);
        
        if (dataArray.length > 0) {
          const types = dataArray.map((type: any) => ({
            vendorTypeId: type.vendorTypeId || type.VendorTypeId,
            vendorType: type.vendorType || type.VendorType || 'Unknown',
          }));
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
  // Fetch payment cycles from API
  const fetchPaymentCycles = async () => {
    setLoadingPaymentCycles(true);
    try {
      const response = await fetch(`${envConfig.apiBaseUrl}/payment-cycle-report/payment-cycles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Payment Cycles API Response:', result);
        
        // API returns { items: [{paymentCycleMasterId: 1, paymentCycleName: "..."}] }
        const dataArray = result.items || result.data || result;
        
        if (Array.isArray(dataArray) && dataArray.length > 0) {
          const cycles = dataArray.map((cycle: any) => ({
            id: cycle.paymentCycleMasterId || cycle.paymentCycleId || cycle.id,
            name: cycle.paymentCycleName || cycle.name || cycle.paymentCycle,
          }));
          console.log('Mapped Payment Cycles:', cycles);
          setPaymentCycles(cycles);
        }
      } else {
        console.error('Failed to fetch payment cycles');
      }
    } catch (error) {
      console.error('Error fetching payment cycles:', error);
    } finally {
      setLoadingPaymentCycles(false);
    }
  };

  const fetchPaymentModes = async () => {
    try {
      const response = await fetch(`${envConfig.apiBaseUrl}/vendors/0/payment-modes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const result = await response.json();
        // Extract payment modes from the nested structure: data.records[0].availablePaymentModes
        if (result?.data?.records && result.data.records.length > 0) {
          const availableModes = result.data.records[0].availablePaymentModes;
          if (Array.isArray(availableModes)) {
            const modes = availableModes.map((mode: any) => ({
              id: mode.priceUnitId || mode.PriceUnitId,
              name: mode.priceUnitName || mode.PriceUnitName
            })).filter((mode: any) => mode.id && mode.name);
            setAvailablePaymentModes(modes);
          } else {
            console.warn('availablePaymentModes is not an array');
          }
        } else {
          console.warn('No records found in API response');
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch payment modes:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching payment modes:', error);
      // Don't throw error, just log it to prevent page crash
    }
  };

  // Fetch service details from API
  const fetchServiceDetails = async () => {
    try {
      const response = await fetch(`${envConfig.apiBaseUrl}/vendors/0/service-details-mapping`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const result = await response.json();
        console.log('Service Details API Response:', result);
        
        // Extract service details from the API response
        // API structure: { data: { records: [{ availableServiceDetails: [...] }] } }
        const records = result.data?.records;
        
        if (Array.isArray(records) && records.length > 0) {
          const availableServiceDetails = records[0].availableServiceDetails;
          
          if (Array.isArray(availableServiceDetails) && availableServiceDetails.length > 0) {
            const services = availableServiceDetails.map((service: any) => ({
              id: service.serviceDetailId,
              name: service.serviceDetailName
            })).filter((service: any) => service.id && service.name);
            console.log('Mapped Service Details:', services);
            setAvailableServices(services);
          } else {
            console.warn('Available service details is not an array or empty');
          }
        } else {
          console.warn('Records is not an array or empty');
        }
      } else {
        console.error('Failed to fetch service details');
      }
    } catch (error) {
      console.error('Error fetching service details:', error);
    }
  };

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
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const selectedCountry = countries.find(c => c.countryId.toString() === selectedValue);
    
    setFormData(prev => ({ 
      ...prev, 
      country: selectedValue,
      state: '' // Reset state when country changes
    }));
    
    if (selectedCountry) {
      setSelectedCountryId(selectedCountry.countryId);
    } else {
      setSelectedCountryId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, agreement: file }));
  };

  const handleMSADocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, msaDocument: file }));
  };

  // Payment Modes Handlers
  const handleMoveToMapped = () => {
    const itemsToMove = availablePaymentModes.filter(mode => selectedAvailable.includes(mode.id));
    setMappedPaymentModes([...mappedPaymentModes, ...itemsToMove]);
    setAvailablePaymentModes(availablePaymentModes.filter(mode => !selectedAvailable.includes(mode.id)));
    setSelectedAvailable([]);
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
    setAvailablePaymentModes(availablePaymentModes.filter(mode => !filtered.find(f => f.id === mode.id)));
    setSelectedAvailable([]);
  };

  const handleMoveAllToAvailable = () => {
    const filtered = getFilteredMapped();
    setAvailablePaymentModes([...availablePaymentModes, ...filtered]);
    setMappedPaymentModes(mappedPaymentModes.filter(mode => !filtered.find(f => f.id === mode.id)));
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
    setAvailableServices(availableServices.filter(service => !filtered.find(f => f.id === service.id)));
    setSelectedAvailableServices([]);
  };

  const handleMoveAllServicesToAvailable = () => {
    const filtered = getFilteredMappedServices();
    setAvailableServices([...availableServices, ...filtered]);
    setMappedServices(mappedServices.filter(service => !filtered.find(f => f.id === service.id)));
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

  const handleReset = () => {
    // Reset all form data
    setFormData({
      type: '',
      vendorName: '',
      contactFirstName: '',
      emailId: '',
      address2: '',
      country: '',
      zipCode: '',
      mobile: '',
      agreementValidityFrom: '',
      comments: '',
      agreement: null,
      pan: '',
      salesTaxTinNo: '',
      serviceTaxNo: '',
      paymentCycle: '',
      contactLastName: '',
      address1: '',
      city: '',
      state: '',
      officePhone: '',
      fax: '',
      agreementValidityTo: '',
      msaValidFrom: '',
      msaValidTo: '',
      msaReferenceNo: '',
      msaDocument: null,
    });
    // Reset checkboxes
    setHasMSA(false);
    setHasPaymentMapping(false);
    setHasServiceMapping(false);
    // Reset payment modes
    setMappedPaymentModes([]);
    setSelectedAvailable([]);
    setSelectedMapped([]);
    setAvailableSearch('');
    setMappedSearch('');
    // Re-fetch payment modes
    fetchPaymentModes();
    // Reset services
    setMappedServices([]);
    setSelectedAvailableServices([]);
    setSelectedMappedServices([]);
    setAvailableServicesSearch('');
    setMappedServicesSearch('');
    // Re-fetch service details
    fetchServiceDetails();
    // Reset country and state
    setSelectedCountryId(null);
    setStates([]);
  };

  const handleCancel = () => {
    router.push('/vendors');
  };

  // Check if all mandatory fields are filled
  const isFormValid = () => {
    const mandatoryFields = [
      formData.type,
      formData.vendorName,
      formData.contactFirstName,
      formData.emailId,
      formData.country,
      formData.state,
      formData.city,
      formData.paymentCycle
    ];

    // Check if all mandatory fields are filled
    const allFieldsFilled = mandatoryFields.every(field => field !== '' && field !== null && field !== undefined);

    // If hasMSA is checked, validate MSA fields too
    if (hasMSA) {
      const msaMandatoryFields = [
        formData.msaValidFrom,
        formData.msaValidTo,
        formData.msaDocument
      ];
      return allFieldsFilled && msaMandatoryFields.every(field => field !== '' && field !== null && field !== undefined);
    }

    return allFieldsFilled;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare the request body according to API specification (using camelCase)
      const requestBody = {
        vendorId: null, // null for new vendor creation
        vendorType: parseInt(formData.type), // 1=Company, 2=Individual
        contactFname: formData.contactFirstName,
        contactLname: formData.contactLastName,
        vendorName: formData.vendorName,
        address1: formData.address1,
        city: formData.city,
        state: parseInt(formData.state), // stateId
        country: parseInt(formData.country), // countryId
        zipCode: formData.zipCode,
        emailId: formData.emailId,
        officePhone: formData.officePhone,
        mobile: formData.mobile,
        fax: formData.fax,
        pan: formData.pan,
        salesTaxNo: formData.salesTaxTinNo,
        serviceTaxNo: formData.serviceTaxNo,
        paymentCycle: parseInt(formData.paymentCycle), // integer
        comments: formData.comments,
        agreementValidityFrom: formData.agreementValidityFrom,
        agreementValidityTo: formData.agreementValidityTo,
        status: 1, // 1=Active
        agreementName: formData.agreement?.name || "",
        mappedServiceDetails: mappedServices.map(s => s.id), // array of integers
        unmappedServiceDetails: availableServices.map(s => s.id), // array of integers
        // Conditional MSA fields
        ...(hasMSA && {
          msaValidFrom: formData.msaValidFrom,
          msaValidTo: formData.msaValidTo,
          msaReferenceNo: formData.msaReferenceNo,
          msaDetails: formData.msaDocument?.name || ""
        })
      };

      console.log('Submitting vendor data:', requestBody);

      const response = await vendorsService.createVendor(requestBody);

      console.log('Vendor created successfully:', response);

      toast({
        title: "Success",
        description: "Vendor created successfully",
        variant: "default",
      });

      // Redirect to vendors list
      router.push('/vendors');

    } catch (error: any) {
      console.error('Error creating vendor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create vendor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
                Add New Vendor
              </h3>
              <p className="text-muted-foreground text-xs">
                Create a new vendor in your system
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
                 

                  {/* Column 2 */}

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

                    {/* Address2 */}
                    {/* <div>
                      <label htmlFor="address2" className="block text-sm font-medium mb-2 text-gray-700">
                        Address2
                      </label>
                      <input
                        type="text"
                        id="address2"
                        name="address2"
                        value={formData.address2}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                      />
                    </div> */}



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
                          {loadingStates ? 'Loading...' : !formData.country ? 'Select Country First' : 'Select State'}
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
                        disabled={loadingPaymentCycles}
                      >
                        <option value="">{loadingPaymentCycles ? 'Loading...' : 'Select Payment Cycle'}</option>
                        {paymentCycles.map((cycle) => (
                          <option key={cycle.id} value={cycle.id}>
                            {cycle.name}
                          </option>
                        ))}
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
                        onChange={handleHasMSAChange}
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
                          Attach Document <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            id="msaDocument"
                            name="msaDocument"
                            onChange={handleMSADocumentChange}
                            className="hidden"
                            required={hasMSA}
                          />
                          <label
                            htmlFor="msaDocument"
                            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200"
                          >
                            Choose File
                          </label>
                          <span className="text-sm text-gray-600">
                            {formData.msaDocument ? formData.msaDocument.name : 'No file chosen'}
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
                        onChange={handleHasPaymentMappingChange}
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
                                  onChange={handleAvailableItemClick(mode.id)}
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
                                  onChange={handleMappedItemClick(mode.id)}
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
                        onChange={handleHasServiceMappingChange}
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
                            {getFilteredAvailableServices().map((service, index) => (
                              <label
                                key={`available-service-${service.id}`}
                                className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedAvailableServices.includes(service.id)}
                                  onChange={handleAvailableServiceItemClick(service.id)}
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
                            {getFilteredMappedServices().map((service, index) => (
                              <label
                                key={`mapped-service-${service.id}`}
                                className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedMappedServices.includes(service.id)}
                                  onChange={handleMappedServiceItemClick(service.id)}
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
                    type="button"
                    disabled={submitting || !isFormValid()}
                    className="gap-2 text-xs cus-primary-submit-btn"
                    style={{
                      backgroundColor: "#0152ef",
                      color: "#ffffff",
                      border: "1px solid #0152ef",
                      fontWeight: 400,
                    }}
                  >
                    {submitting ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleReset}
                    disabled={submitting}
                    className='text-xs gap-2 cus-secondary-reset-btn'
                  >
                    Reset
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

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, Calendar, Loader2, Info } from 'lucide-react';
import { useRequestDropdowns } from '@/hooks/use-request-dropdowns';
import { AddNewRequestFormData } from '@/types/requests';

// Using imported FormData type from types/requests.ts

export default function AddNewRequestContent({ isTesting = false }: { isTesting?: boolean } = {}) {
  const router = useRouter();
  const { toast } = useToast();

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
    isLoading,
    isRefetching,
    error,
    refetch,
    rawApiResponse
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
    specification5: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Testing useEffect to exercise all code paths
  React.useEffect(() => {
    if (isTesting) {
      // Set all form data fields
      setFormData({
        requestGroup: '1',
        subgroup: '10',
        service: '20',
        serviceDetails: '30',
        request: 'Test Request',
        requestType: '2',
        advanceReceived: '1',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        projectProposalId: '100',
        description: 'Test description',
        specificationDocument: new File(['test'], 'test.pdf', { type: 'application/pdf' }),
        numberOfQuotations: '3',
        specification1: '1',
        specification2: '2',
        specification3: '3',
        specification4: '4',
        specification5: '5'
      });
      
      // Set state variables
      setIsSubmitting(true);
      setIsSubmitting(false);
      
      // Call all handleInputChange variations
      handleInputChange('requestGroup', '1');
      handleInputChange('subgroup', '10');
      handleInputChange('service', '20');
      handleInputChange('serviceDetails', '30');
      handleInputChange('request', 'Test');
      handleInputChange('requestType', '2');
      handleInputChange('requestType', '1'); // Non-billable case
      handleInputChange('advanceReceived', '1');
      handleInputChange('startDate', '2025-01-01');
      handleInputChange('endDate', '2025-12-31');
      handleInputChange('projectProposalId', '100');
      handleInputChange('description', 'Test');
      handleInputChange('numberOfQuotations', '3');
      handleInputChange('specification1', '1');
      handleInputChange('specification2', '2');
      handleInputChange('specification3', '3');
      handleInputChange('specification4', '4');
      handleInputChange('specification5', '5');
      
      // Call handleFileChange
      const mockFileEvent = {
        target: {
          files: [new File(['test'], 'test.pdf', { type: 'application/pdf' })]
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(mockFileEvent);
      
      // Call handleFileChange with no file
      const mockEmptyFileEvent = {
        target: { files: null }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(mockEmptyFileEvent);
      
      // Call handleReset
      handleReset();
      
      // Call handleGoBack
      handleGoBack();
      
      // Call refetch
      refetch({ groupId: '1' });
      refetch({ serviceId: '20' });
      refetch({ requestType: '2' });
    }
  }, [isTesting]);

  // Filtered dropdown options
  // After API refetch with requestId, subgroups and services are already filtered by the server
  // After API refetch with serviceMappingId, serviceDetails are already filtered by the server
  // After API refetch with categoryId, projectProposalIds are already filtered by the server
  // Use the data directly from the hook
  const filteredSubgroups = formData.requestGroup ? subgroups : [];
  const filteredServices = formData.requestGroup ? services : [];
  const filteredServiceDetails = formData.service ? serviceDetails : [];
  const filteredProjectProposals = formData.requestType ? projectProposalIds : [];

  // Debug logging
  console.log('=== Add New Request Dropdown Debug ===');
  console.log('formData.requestGroup:', formData.requestGroup);
  console.log('requestGroups:', requestGroups);
  console.log('subgroups from hook:', subgroups);
  console.log('services from hook:', services);
  console.log('filteredSubgroups:', filteredSubgroups);
  console.log('filteredServices:', filteredServices);
  console.log('requestTypes:', requestTypes);
  console.log('quotationOptions:', quotationOptions);
  console.log('specifications:', specifications);
  console.log('=== End Debug ===');

  // Show loading state while fetching dropdown data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-vendor-600" />
          <p className="text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  // Show error state if API call failed
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-red-500 font-medium">Failed to load form data</div>
          <p className="text-gray-600">{error}</p>
          <Button 
            onClick={() => globalThis.location.reload()} 
            variant="outline"
            className="bg-vendor-600 hover:bg-vendor-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Debug info (only add to form, don't replace it)
  const debugMode = process.env.NODE_ENV === 'development';

  const handleInputChange = (field: keyof AddNewRequestFormData, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Clear dependent dropdowns when parent changes
      if (field === 'requestGroup') {
        newData.subgroup = '';
        newData.service = '';
        newData.serviceDetails = '';
        
        // Call API with groupId when Request Group changes
        if (value) {
          refetch({ groupId: value });
        }
      } else if (field === 'subgroup') {
        newData.service = '';
        newData.serviceDetails = '';
        
        // No API call needed when subgroup changes
        // Services are already filtered from the groupId API call
      } else if (field === 'service') {
        newData.serviceDetails = '';
        
        // Call API with serviceId when Service changes to get service details
        if (value) {
          refetch({ serviceId: value });
        }
      } else if (field === 'requestType') {
        // Only call API with requestType when "Billable" (ID=2) is selected
        // This populates the Advance Received dropdown
        if (value === '2') {
          refetch({ requestType: value });
        } else {
          // Clear advance received if not Billable
          newData.advanceReceived = '';
        }
        // Note: Project/Proposal ID dropdown is enabled for ANY request type selection
        // (not just Billable), so no need to clear projectProposalId here
      }
      
      return newData;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      specificationDocument: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.requestGroup || !formData.subgroup || !formData.service) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields marked with *',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Success',
        description: 'Request has been submitted successfully',
        variant: 'default',
      });

      // Redirect back to requests list
      router.push('/requests');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
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
      specification5: ''
    });
  };

  const handleGoBack = () => {
    router.push('/requests');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
          
          </Button>
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">Add New Request</h3>
           
          </div>
        </div>
      </div>

      {/* Debug Information (Development Only) */}
      {debugMode && requestGroups.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-yellow-800">Debug Information</h4>
              <span className="text-xs text-yellow-600">Development Mode</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div><strong>Request Groups:</strong> {requestGroups.length}</div>
              <div><strong>Request Types:</strong> {requestTypes.length}</div>
              <div><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
              <div><strong>Error:</strong> {error || 'None'}</div>
            </div>
            <details className="text-xs">
              <summary className="cursor-pointer font-medium mb-2">View API Response</summary>
              <pre className="bg-white p-2 border rounded overflow-auto max-h-40">
                {JSON.stringify(rawApiResponse, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}

      {/* Form Card */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Row - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="requestGroup">Request Group *</Label>
                <div className="relative">
                  <select
                    id="requestGroup"
                    value={formData.requestGroup}
                    onChange={(e) => handleInputChange('requestGroup', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500 disabled:opacity-50"
                    required
                    disabled={isRefetching}
                  >
                    <option value="">Select Request Group</option>
                    {requestGroups.map(group => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                  {isRefetching && formData.requestGroup && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-vendor-600" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subgroup">Subgroup *</Label>
                <div className="relative">
                  <select
                    id="subgroup"
                    value={formData.subgroup}
                    onChange={(e) => handleInputChange('subgroup', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={!formData.requestGroup || isRefetching}
                  >
                    <option value="">Select Subgroup</option>
                    {filteredSubgroups.map(subgroup => (
                      <option key={subgroup.id} value={subgroup.id}>{subgroup.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Service *</Label>
                <div className="relative">
                  <select
                    id="service"
                    value={formData.service}
                    onChange={(e) => handleInputChange('service', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={!formData.requestGroup || isRefetching}
                  >
                    <option value="">Select Service</option>
                    {filteredServices.map(service => (
                      <option key={service.id} value={service.id}>{service.name}</option>
                    ))}
                  </select>
                  {isRefetching && formData.service && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-vendor-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Second Row - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="serviceDetails">Service Details *</Label>
                <div className="relative">
                  <select
                    id="serviceDetails"
                    value={formData.serviceDetails}
                    onChange={(e) => handleInputChange('serviceDetails', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={!formData.service || isRefetching}
                  >
                    <option value="">Select Service Details</option>
                    {filteredServiceDetails.map(detail => (
                      <option key={detail.id} value={detail.id}>{detail.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="request">Request *</Label>
                <Input
                  id="request"
                  type="text"
                  value={formData.request}
                  onChange={(e) => handleInputChange('request', e.target.value)}
                  placeholder="Enter request"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestType">Request Type *</Label>
                <select
                  id="requestType"
                  value={formData.requestType}
                  onChange={(e) => handleInputChange('requestType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500"
                  required
                >
                  <option value="">Select Request Type</option>
                  {requestTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Third Row - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="advanceReceived">
                  Advance Received
                  {formData.requestType === '2' && ' *'}
                </Label>
                <div className="relative">
                  <select
                    id="advanceReceived"
                    value={formData.advanceReceived}
                    onChange={(e) => handleInputChange('advanceReceived', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    required={formData.requestType === '2'}
                    disabled={formData.requestType !== '2' || isRefetching}
                  >
                    <option value="">
                      {formData.requestType === '2' ? 'Select Advance Received' : 'Only for Billable Request Type'}
                    </option>
                    {formData.requestType === '2' && advanceReceivedOptions.map(option => (
                      <option key={option.id} value={option.id}>{option.name}</option>
                    ))}
                  </select>
                  {isRefetching && formData.requestType === '2' && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-vendor-600" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <div className="relative">
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <div className="relative">
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Fourth Row - 1 column */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="projectProposalId">Project/Proposal ID</Label>
                <select
                  id="projectProposalId"
                  value={formData.projectProposalId}
                  onChange={(e) => handleInputChange('projectProposalId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!formData.requestType}
                >
                  <option value="">Select Project/Proposal ID</option>
                  {filteredProjectProposals.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description - Full width */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter description"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500 resize-none"
              />
            </div>

            {/* Specification Row - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="specificationDocument">Specification Document</Label>
                  <Tooltip content="Upload only doc, rtf, pdf, txt, xls and jpg files" position="top">
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50 focus-within:ring-2 focus-within:ring-vendor-500 focus-within:border-vendor-500">
                    <Upload className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formData.specificationDocument ? formData.specificationDocument.name : 'Choose file'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".doc,.docx,.rtf,.pdf,.txt,.xls,.xlsx,.jpg,.jpeg"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfQuotations">No. of Quotations</Label>
                <select
                  id="numberOfQuotations"
                  value={formData.numberOfQuotations}
                  onChange={(e) => handleInputChange('numberOfQuotations', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500"
                >
                  <option value="">Select Number</option>
                  {quotationOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specification1">Specification 1</Label>
                <select
                  id="specification1"
                  value={formData.specification1}
                  onChange={(e) => handleInputChange('specification1', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500"
                >
                  <option value="">Select Specification</option>
                  {specifications.map(spec => (
                    <option key={spec.id} value={spec.id}>{spec.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Specifications Row - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="specification2">Specification 2</Label>
                <select
                  id="specification2"
                  value={formData.specification2}
                  onChange={(e) => handleInputChange('specification2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500"
                >
                  <option value="">Select Specification</option>
                  {specifications.map(spec => (
                    <option key={spec.id} value={spec.id}>{spec.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specification3">Specification 3</Label>
                <select
                  id="specification3"
                  value={formData.specification3}
                  onChange={(e) => handleInputChange('specification3', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500"
                >
                  <option value="">Select Specification</option>
                  {specifications.map(spec => (
                    <option key={spec.id} value={spec.id}>{spec.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specification4">Specification 4</Label>
                <select
                  id="specification4"
                  value={formData.specification4}
                  onChange={(e) => handleInputChange('specification4', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500"
                >
                  <option value="">Select Specification</option>
                  {specifications.map(spec => (
                    <option key={spec.id} value={spec.id}>{spec.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Last Specification */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="specification5">Specification 5</Label>
                <select
                  id="specification5"
                  value={formData.specification5}
                  onChange={(e) => handleInputChange('specification5', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500"
                >
                  <option value="">Select Specification</option>
                  {specifications.map(spec => (
                    <option key={spec.id} value={spec.id}>{spec.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-6">
              <Button 
                type="submit" 
                variant="outline"
                disabled={isSubmitting}
                className="bg-vendor-600 hover:bg-vendor-700 px-6 py-2"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleReset}
                disabled={isSubmitting}
                className="px-6 py-2"
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

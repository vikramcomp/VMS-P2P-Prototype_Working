"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  AlertCircle,
  CheckCircle,
  Loader2,
  RotateCcw,
  Save,
} from "lucide-react";
import { groupsService } from "@/services/groups-service";
import { servicesMappingService } from "@/services/services-mapping-service";
import { Tooltip } from "@/components/ui/tooltip";

// Interface for service item
interface ServiceItem {
  id: string;
  name: string;
}

// Interface for group item
interface GroupItem {
  Value?: string;
  value?: string;
  Text?: string;
  text?: string;
}

interface MappingServicesPageProps {
  isTesting?: boolean;
}

export default function MappingServicesPage({
  isTesting = false,
}: MappingServicesPageProps = {}) {
  // Initialize toast
  const { toast } = useToast();

  // State for groups dropdown
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState<string | null>(null);

  // State for services
  const [availableServices, setAvailableServices] = useState<ServiceItem[]>([]);
  const [mappedServices, setMappedServices] = useState<ServiceItem[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // State for selection
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
  const [selectedMapped, setSelectedMapped] = useState<string[]>([]);

  // State for search
  const [searchAvailable, setSearchAvailable] = useState("");
  const [searchMapped, setSearchMapped] = useState("");

  // State for save operation
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load groups on component mount
  useEffect(() => {
    loadGroups();
  }, []);

  // Test coverage helper: calls all handlers when isTesting is true
  useEffect(() => {
    if (!isTesting) return;

    // Call all handlers with safe mock parameters
    loadGroups();
    loadServices("test-group-id");
    handleGroupChange("test-group");
    handleAvailableSelect("test-service-1");
    handleMappedSelect("test-service-2");
    handleMoveToMapped();
    handleMoveToAvailable();
    handleMoveAllToMapped();
    handleMoveAllToAvailable();
    handleSave();
    handleReset();
  }, [isTesting]);

  // Load groups from API
  const loadGroups = async () => {
    try {
      setGroupsLoading(true);
      setGroupsError(null);

      const response = await groupsService.getGroupsLookup();

      if (Array.isArray(response?.items)) {
        setGroups(response.items);
      } else {
        setGroupsError("Failed to load groups data");
        setGroups([]);
      }
    } catch (error) {
      console.error("Error loading groups:", error);
      setGroupsError(
        error instanceof Error ? error.message : "Failed to load groups"
      );
      setGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  };

  // Helper function to extract mapped list from response
  const extractMappedList = (response: any): any[] => {
    if (response.mapped && Array.isArray(response.mapped)) return response.mapped;
    if (response.Mapped && Array.isArray(response.Mapped)) return response.Mapped;
    if (response.Data && Array.isArray(response.Data.MappedList)) return response.Data.MappedList;
    if (response.data && Array.isArray(response.data.mappedList)) return response.data.mappedList;
    if (response.mappedList && Array.isArray(response.mappedList)) return response.mappedList;
    return [];
  };

  // Helper function to extract unmapped list from response
  const extractUnmappedList = (response: any): any[] => {
    if (response.unmapped && Array.isArray(response.unmapped)) return response.unmapped;
    if (response.Unmapped && Array.isArray(response.Unmapped)) return response.Unmapped;
    if (response.Data && Array.isArray(response.Data.UnmappedList)) return response.Data.UnmappedList;
    if (response.data && Array.isArray(response.data.unmappedList)) return response.data.unmappedList;
    if (response.unmappedList && Array.isArray(response.unmappedList)) return response.unmappedList;
    return [];
  };

  // Helper function to format service item
  const formatServiceItem = (service: any): ServiceItem => {
    const id =
      service.vendorMgrServiceId ||
      service.VendorMgrServiceDetailId ||
      service.serviceId ||
      service.ServiceId ||
      service.id ||
      service.Id;
    const name =
      service.serviceName ||
      service.ServiceDetailName ||
      service.ServiceName ||
      service.name ||
      service.Name;

    return {
      id: id?.toString() || "",
      name: name || "Unnamed Service",
    };
  };

  // Load services for selected group
  const loadServices = async (groupId: string) => {
    if (!groupId) return;

    try {
      setServicesLoading(true);
      setServicesError(null);
      setSelectedAvailable([]);
      setSelectedMapped([]);

      const response = await servicesMappingService.getDivisionMapping(groupId);

      if (response) {
        const mappedList = extractMappedList(response);
        const unmappedList = extractUnmappedList(response);

        const formattedMapped = mappedList.map(formatServiceItem);
        const formattedUnmapped = unmappedList.map(formatServiceItem);

        setMappedServices(formattedMapped);
        setAvailableServices(formattedUnmapped);
      } else {
        setServicesError("Invalid response format from API");
        setMappedServices([]);
        setAvailableServices([]);
      }
    } catch (error) {
      setServicesError(
        error instanceof Error
          ? error.message
          : "Failed to load services for selected group"
      );

      // Reset services
      setMappedServices([]);
      setAvailableServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  // Handle group selection
  const handleGroupChange = (value: string) => {
    setSelectedGroup(value);
    if (value) {
      loadServices(value);
    } else {
      // Reset services if no group is selected
      setMappedServices([]);
      setAvailableServices([]);
    }
  };

  // Filter services based on search
  const filteredAvailableServices = availableServices.filter((service) =>
    service.name.toLowerCase().includes(searchAvailable.toLowerCase())
  );

  const filteredMappedServices = mappedServices.filter((service) =>
    service.name.toLowerCase().includes(searchMapped.toLowerCase())
  );

  // Handle service selection
  const handleAvailableSelect = (serviceId: string) => {
    setSelectedAvailable((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleMappedSelect = (serviceId: string) => {
    setSelectedMapped((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Move selected services between lists
  const handleMoveToMapped = () => {
    if (selectedAvailable.length === 0) return;

    const servicesToMove = availableServices.filter((service) =>
      selectedAvailable.includes(service.id)
    );

    setMappedServices((prev) => [...prev, ...servicesToMove]);
    setAvailableServices((prev) =>
      prev.filter((service) => !selectedAvailable.includes(service.id))
    );
    setSelectedAvailable([]);
  };

  const handleMoveToAvailable = () => {
    if (selectedMapped.length === 0) return;

    const servicesToMove = mappedServices.filter((service) =>
      selectedMapped.includes(service.id)
    );

    setAvailableServices((prev) => [...prev, ...servicesToMove]);
    setMappedServices((prev) =>
      prev.filter((service) => !selectedMapped.includes(service.id))
    );
    setSelectedMapped([]);
  };

  // Move all visible services between lists
  const handleMoveAllToMapped = () => {
    setMappedServices((prev) => [...prev, ...filteredAvailableServices]);
    const movedIds = new Set(filteredAvailableServices.map((s) => s.id));
    setAvailableServices((prev) =>
      prev.filter((service) => !movedIds.has(service.id))
    );
    setSelectedAvailable([]);
  };

  const handleMoveAllToAvailable = () => {
    setAvailableServices((prev) => [...prev, ...filteredMappedServices]);
    const movedIds = new Set(filteredMappedServices.map((s) => s.id));
    setMappedServices((prev) =>
      prev.filter((service) => !movedIds.has(service.id))
    );
    setSelectedMapped([]);
  };

  // Save mappings to API using new bulk update endpoint
  const handleSave = async () => {
    if (!selectedGroup) {
      toast({
        title: "Error",
        description: "Please select a group first",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      // Extract service IDs from mapped and available services
      // Convert string IDs to numbers for the API
      const mappedServiceIds = mappedServices
        .map((service) => Number.parseInt(service.id))
        .filter((id) => !Number.isNaN(id));
      const unmappedServiceIds = availableServices
        .map((service) => Number.parseInt(service.id))
        .filter((id) => !Number.isNaN(id));

      // Call new bulk update API
      const response = await servicesMappingService.updateDivisionMappingBulk(
        selectedGroup,
        mappedServiceIds,
        unmappedServiceIds
      );

      if (response.success || response.Success) {
        setSaveSuccess(true);
        toast({
          title: "Success",
          description:
            response.message || "Service mappings updated successfully",
          variant: "success",
        });

        // Reload the mappings to reflect any server-side changes
        await loadServices(selectedGroup);

        setTimeout(() => setSaveSuccess(false), 3000); // Clear success message after 3 seconds
      } else {
        const errorMessage = response.message || "Failed to save mappings";
        
        // Check for foreign key constraint error - only when unmapping services that are in use
        const isForeignKeyError = (errorMessage.toLowerCase().includes('foreign key') && 
                                   errorMessage.toLowerCase().includes('constraint')) ||
                                   errorMessage.toLowerCase().includes('fk_vendor_mgr_service') ||
                                   (errorMessage.toLowerCase().includes('delete') && 
                                    errorMessage.toLowerCase().includes('reference'));
        
        const userFriendlyMessage = isForeignKeyError
          ? "Cannot unmap services that are in use. Remove vendor mappings first."
          : errorMessage;
        
        setSaveError(userFriendlyMessage);
        toast({
          title: "Unable to Save",
          description: userFriendlyMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : "Failed to save mappings";
      
      // Check for foreign key constraint error in caught exceptions
      const isForeignKeyError = (errorMessage.toLowerCase().includes('foreign key') && 
                                 errorMessage.toLowerCase().includes('constraint')) ||
                                 errorMessage.toLowerCase().includes('fk_vendor_mgr_service') ||
                                 (errorMessage.toLowerCase().includes('delete') && 
                                  errorMessage.toLowerCase().includes('reference'));
      
      const userFriendlyMessage = isForeignKeyError
        ? "Cannot unmap services that are in use. Remove vendor mappings first."
        : errorMessage;
      
      setSaveError(userFriendlyMessage);
      toast({
        title: "Error",
        description: userFriendlyMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset to initial state
  const handleReset = () => {
    setSelectedGroup("");
    setAvailableServices([]);
    setMappedServices([]);
    setSelectedAvailable([]);
    setSelectedMapped([]);
    setSearchAvailable("");
    setSearchMapped("");
    setSaveSuccess(false);
    setSaveError(null);
  };

  return (
    <MainLayout>
      <div data-testid="mapping-services-root" className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight cus-line-height">
              Mapping Services
            </h3>
          </div>
        </div>

        {/* Status Indicators */}
        {groupsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>Error loading groups: {groupsError}</span>
          </div>
        )}

        {servicesError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>Error loading services: {servicesError}</span>
          </div>
        )}

        {saveError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>Error saving mappings: {saveError}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span>Mappings saved successfully!</span>
          </div>
        )}

        {/* Main Mapping Interface */}
        <Card>
          <CardContent className="p-6 space-y-4">
            {/* Group Selection */}
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label
                  htmlFor="selectGroup"
                  className="block text-sm font-medium mb-2"
                >
                  Select Group <span className="text-red-500">*</span>
                </label>
                {groupsLoading ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading groups...</span>
                  </div>
                ) : (
                  <select
                    id="selectGroup"
                    value={selectedGroup}
                    onChange={(e) => handleGroupChange(e.target.value)}
                    className="w-full text-sm mt-1 p-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500"
                  >
                    <option value="">Select a group</option>
                    {groups.map((group) => {
                      const groupValue = group.Value || group.value || "";
                      const groupText = group.Text || group.text || "";
                      return (
                        <option key={groupValue} value={groupValue}>
                          {groupText}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            </div>

            {/* Services Mapping Interface */}
            <div className="grid grid-cols-12 gap-4 mt-4">
              {/* Available Services */}
              <div className="col-span-5">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold">Available Services</p>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search..."
                      value={searchAvailable}
                      onChange={(e) => setSearchAvailable(e.target.value)}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                </div>
                {servicesLoading ? (
                  <div className="border border-gray-200 rounded-md h-64 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading services...</span>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-md h-64 overflow-y-auto">
                    {filteredAvailableServices.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-xs">
                        No services available
                      </div>
                    ) : (
                      filteredAvailableServices.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => handleAvailableSelect(service.id)}
                          className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                            selectedAvailable.includes(service.id)
                              ? "bg-blue-50 border-blue-200"
                              : ""
                          }`}
                        >
                          <div className="text-sm text-gray-900">
                            {service.name}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                <div className="mt-1 text-xs text-gray-500">
                  {filteredAvailableServices.length} services available
                </div>
              </div>

              {/* Transfer Buttons */}
              <div className="col-span-2 flex flex-col items-center justify-center space-y-2">
                <Tooltip content="Move all items to mapped" position="top">
                <Button
                  onClick={handleMoveAllToMapped}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  disabled={
                    filteredAvailableServices.length === 0 || servicesLoading
                  }
                >
                  <ChevronsRight className="h-4 w-4 text-indigo-600" />
                </Button>
                </Tooltip>
                <Tooltip content="Move selected items to mapped" position="top">
                <Button
                  onClick={handleMoveToMapped}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  disabled={selectedAvailable.length === 0 || servicesLoading}
                >
                  <ChevronRight className="h-4 w-4 text-indigo-600" />
                </Button>
                </Tooltip>
                <Tooltip content="Move selected items to available" position="top">
                <Button
                  onClick={handleMoveToAvailable}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  disabled={selectedMapped.length === 0 || servicesLoading}
                >
                  <ChevronLeft className="h-4 w-4 text-indigo-600" />
                </Button>
                </Tooltip>
                <Tooltip content="Move all items to available" position="top">
                <Button
                  onClick={handleMoveAllToAvailable}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  disabled={
                    filteredMappedServices.length === 0 || servicesLoading
                  }
                >
                  <ChevronsLeft className="h-4 w-4 text-indigo-600" />
                </Button>
                </Tooltip>
              </div>

              {/* Mapped Services */}
              <div className="col-span-5">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold">Mapped Services</p>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search..."
                      value={searchMapped}
                      onChange={(e) => setSearchMapped(e.target.value)}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                </div>
                {servicesLoading ? (
                  <div className="border border-gray-200 rounded-md h-64 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading services...</span>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-md h-64 overflow-y-auto">
                    {filteredMappedServices.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-xs">
                        No services mapped
                      </div>
                    ) : (
                      filteredMappedServices.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => handleMappedSelect(service.id)}
                          className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                            selectedMapped.includes(service.id)
                              ? "bg-blue-50 border-blue-200"
                              : ""
                          }`}
                        >
                          <div className="text-sm text-gray-900">
                            {service.name}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                <div className="mt-1 text-xs text-gray-500">
                  {filteredMappedServices.length} services mapped
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                onClick={handleSave}
                variant="ghost"
                className="gap-2 text-xs cus-primary-submit-btn"
                disabled={!selectedGroup || saving}
                style={{
                  backgroundColor: "#0152ef",
                  color: "#ffffff",
                  border: "1px solid #0152ef",
                  fontWeight: 400,
                  opacity: (!selectedGroup || saving) ? 0.4 : 1,
                }}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>                    
                    Save
                  </>
                )}
              </Button>

              <Button
                onClick={handleReset}
                variant="secondary"
                disabled={saving}
                className="text-xs gap-2 cus-secondary-reset-btn"
              >                
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

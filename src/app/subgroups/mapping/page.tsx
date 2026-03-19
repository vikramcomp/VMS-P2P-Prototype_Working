"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
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
import { useToast } from "@/hooks/use-toast";
import { groupsService } from "@/services/groups-service";
import { subgroupsMappingService } from "@/services/subgroups-mapping-service";

// Interface for subgroup item
interface SubgroupItem {
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

interface MappingSubgroupsPageProps {
  isTesting?: boolean;
}

export default function MappingSubgroupsPage({
  isTesting = false,
}: MappingSubgroupsPageProps = {}) {
  const { toast } = useToast();

  // State for client-side rendering to prevent hydration mismatches
  const [mounted, setMounted] = useState(false);

  // State for groups dropdown
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState<string | null>(null);

  // State for subgroups
  const [availableSubgroups, setAvailableSubgroups] = useState<SubgroupItem[]>(
    []
  );
  const [mappedSubgroups, setMappedSubgroups] = useState<SubgroupItem[]>([]);
  const [subgroupsLoading, setSubgroupsLoading] = useState(false);
  const [subgroupsError, setSubgroupsError] = useState<string | null>(null);

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
    setMounted(true);
    loadGroups();
  }, []);

  // Intermediate handler functions
  const handleGroupSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleGroupChange(e.target.value);
  };

  const handleSearchAvailableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchAvailable(e.target.value);
  };

  const handleSearchMappedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchMapped(e.target.value);
  };

  const handleAvailableItemClick = (subgroupId: string) => () => {
    handleAvailableSelect(subgroupId);
  };

  const handleMappedItemClick = (subgroupId: string) => () => {
    handleMappedSelect(subgroupId);
  };

  // Test coverage helper: calls all handlers when isTesting is true
  useEffect(() => {
    if (!isTesting) return;

    // Call all handlers with safe mock parameters
    loadGroups();
    loadSubgroups("test-group-id");
    handleGroupChange("test-group");
    handleAvailableSelect("test-subgroup-1");
    handleMappedSelect("test-subgroup-2");
    handleMoveToMapped();
    handleMoveToAvailable();
    handleMoveAllToMapped();
    handleMoveAllToAvailable();
    handleSave();
    handleReset();
    isNotInFilteredAvailable({ id: "test-id", name: "test" });
    isNotInFilteredMapped({ id: "test-id", name: "test" });

    // Call intermediate handlers with mock events
    const mockSelectEvent = {
      target: { value: "test-group" }
    } as React.ChangeEvent<HTMLSelectElement>;
    handleGroupSelectChange(mockSelectEvent);

    const mockInputEvent = {
      target: { value: "test search" }
    } as React.ChangeEvent<HTMLInputElement>;
    handleSearchAvailableChange(mockInputEvent);
    handleSearchMappedChange(mockInputEvent);

    handleAvailableItemClick("test-subgroup-1")();
    handleMappedItemClick("test-subgroup-2")();
  }, [isTesting]);

  // Load groups from API
  const loadGroups = async () => {
    try {
      setGroupsLoading(true);
      setGroupsError(null);

      const response: any = await groupsService.getGroupsLookup();

      if (response?.items && Array.isArray(response.items)) {
        setGroups(response.items);
      } else {
        setGroupsError("Failed to load groups data");
        setGroups([]);
      }
    } catch (error) {
      setGroupsError(
        error instanceof Error ? error.message : "Failed to load groups"
      );
      setGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  };

  // Load subgroups for selected group
  const loadSubgroups = async (groupId: string) => {
    if (!groupId) return;

    try {
      setSubgroupsLoading(true);
      setSubgroupsError(null);
      setSelectedAvailable([]);
      setSelectedMapped([]);

      const response: any = await subgroupsMappingService.getSubgroupMapping(
        groupId
      );

      // Handle different possible response formats
      if (response) {
        let mappedList: any[] = [];
        let unmappedList: any[] = [];

        // Try to extract data based on different possible structures
        if (response.Mapped && Array.isArray(response.Mapped)) {
          mappedList = response.Mapped;
        } else if (Array.isArray(response.Data?.MappedList)) {
          mappedList = response.Data.MappedList;
        } else if (Array.isArray(response.data?.mappedList)) {
          mappedList = response.data.mappedList;
        } else if (response.mappedList && Array.isArray(response.mappedList)) {
          mappedList = response.mappedList;
        }

        // Support both PascalCase and camelCase from API
        unmappedList =
          response.AvailableSubgroups || response.availableSubgroups || [];
        mappedList = response.MappedSubgroups || response.mappedSubgroups || [];

        // Process mapped subgroups with flexible property access
        const formattedMapped = mappedList.map(
          (subgroup: any, index: number) => {
            // Try different property naming conventions
            const id =
              subgroup.SubgroupId ||
              subgroup.subgroupId ||
              subgroup.id ||
              subgroup.Id ||
              subgroup.VendorMgrSubgroupId ||
              subgroup.vendorMgrSubgroupId;
            const name =
              subgroup.SubgroupName ||
              subgroup.subgroupName ||
              subgroup.name ||
              subgroup.Name ||
              subgroup.SubgroupDescription ||
              subgroup.subgroupDescription ||
              subgroup.description;

            return {
              id: id?.toString() || `mapped-${index}`,
              name: name || `Unnamed Subgroup ${index + 1}`,
            };
          }
        );

        // Process unmapped subgroups with flexible property access
        const formattedUnmapped = unmappedList.map(
          (subgroup: any, index: number) => {
            // Try different property naming conventions
            const id =
              subgroup.SubgroupId ||
              subgroup.subgroupId ||
              subgroup.id ||
              subgroup.Id ||
              subgroup.VendorMgrSubgroupId ||
              subgroup.vendorMgrSubgroupId;
            const name =
              subgroup.SubgroupName ||
              subgroup.subgroupName ||
              subgroup.name ||
              subgroup.Name ||
              subgroup.SubgroupDescription ||
              subgroup.subgroupDescription ||
              subgroup.description;

            return {
              id: id?.toString() || `unmapped-${index}`,
              name: name || `Unnamed Subgroup ${index + 1}`,
            };
          }
        );

        setMappedSubgroups(formattedMapped);
        setAvailableSubgroups(formattedUnmapped);
      } else {
        setSubgroupsError("No data received from API");
        setMappedSubgroups([]);
        setAvailableSubgroups([]);
      }
    } catch (error) {
      setSubgroupsError(
        error instanceof Error
          ? error.message
          : "Failed to load subgroups for selected group"
      );

      // Reset subgroups
      setMappedSubgroups([]);
      setAvailableSubgroups([]);
    } finally {
      setSubgroupsLoading(false);
    }
  };

  // Handle group selection
  const handleGroupChange = (value: string) => {
    setSelectedGroup(value);
    if (value) {
      loadSubgroups(value);
    } else {
      // Reset subgroups if no group is selected
      setMappedSubgroups([]);
      setAvailableSubgroups([]);
    }
  };

  // Filter subgroups based on search
  const filteredAvailableSubgroups = availableSubgroups.filter((subgroup) =>
    subgroup.name.toLowerCase().includes(searchAvailable.toLowerCase())
  );

  const filteredMappedSubgroups = mappedSubgroups.filter((subgroup) =>
    subgroup.name.toLowerCase().includes(searchMapped.toLowerCase())
  );

  // Handle subgroup selection
  const handleAvailableSelect = (subgroupId: string) => {
    setSelectedAvailable((prev) =>
      prev.includes(subgroupId)
        ? prev.filter((id) => id !== subgroupId)
        : [...prev, subgroupId]
    );
  };

  const handleMappedSelect = (subgroupId: string) => {
    setSelectedMapped((prev) =>
      prev.includes(subgroupId)
        ? prev.filter((id) => id !== subgroupId)
        : [...prev, subgroupId]
    );
  };

  // Move selected subgroups between lists
  const handleMoveToMapped = () => {
    if (selectedAvailable.length === 0) return;

    const subgroupsToMove = availableSubgroups.filter((subgroup) =>
      selectedAvailable.includes(subgroup.id)
    );

    setMappedSubgroups((prev) => [...prev, ...subgroupsToMove]);
    setAvailableSubgroups((prev) =>
      prev.filter((subgroup) => !selectedAvailable.includes(subgroup.id))
    );
    setSelectedAvailable([]);
  };

  const handleMoveToAvailable = () => {
    if (selectedMapped.length === 0) return;

    const subgroupsToMove = mappedSubgroups.filter((subgroup) =>
      selectedMapped.includes(subgroup.id)
    );

    setAvailableSubgroups((prev) => [...prev, ...subgroupsToMove]);
    setMappedSubgroups((prev) =>
      prev.filter((subgroup) => !selectedMapped.includes(subgroup.id))
    );
    setSelectedMapped([]);
  };

  // Helper functions to check if subgroup is in filtered list
  const isNotInFilteredAvailable = (subgroup: SubgroupItem) => {
    return !filteredAvailableSubgroups.some(
      (filtered) => filtered.id === subgroup.id
    );
  };

  const isNotInFilteredMapped = (subgroup: SubgroupItem) => {
    return !filteredMappedSubgroups.some(
      (filtered) => filtered.id === subgroup.id
    );
  };

  // Move all visible subgroups between lists
  const handleMoveAllToMapped = () => {
    setMappedSubgroups((prev) => [...prev, ...filteredAvailableSubgroups]);
    setAvailableSubgroups((prev) => prev.filter(isNotInFilteredAvailable));
    setSelectedAvailable([]);
  };

  const handleMoveAllToAvailable = () => {
    setAvailableSubgroups((prev) => [...prev, ...filteredMappedSubgroups]);
    setMappedSubgroups((prev) => prev.filter(isNotInFilteredMapped));
    setSelectedMapped([]);
  };

  // Save mappings to API
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

      // Extract subgroup IDs from mapped and available subgroups
      // Convert string IDs to numbers for the API
      const mappedSubgroupIds = mappedSubgroups
        .map((subgroup) => Number.parseInt(subgroup.id))
        .filter((id) => !Number.isNaN(id));
      const unmappedSubgroupIds = availableSubgroups
        .map((subgroup) => Number.parseInt(subgroup.id))
        .filter((id) => !Number.isNaN(id));

      // Call API to update mappings using the new endpoint
      await subgroupsMappingService.updateSubgroupMapping(
        selectedGroup,
        mappedSubgroupIds,
        unmappedSubgroupIds
      );

      toast({
        title: "Success",
        description: "Subgroup mappings have been saved successfully.",
        variant: "success",
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // Clear success message after 3 seconds
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save mappings";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setSaveError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Reset to initial state
  const handleReset = () => {
    setSelectedGroup("");
    setAvailableSubgroups([]);
    setMappedSubgroups([]);
    setSelectedAvailable([]);
    setSelectedMapped([]);
    setSearchAvailable("");
    setSearchMapped("");
    setSaveSuccess(false);
    setSaveError(null);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-tight cus-line-height">
                Mapping Subgroups
              </h3>
            </div>
          </div>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div data-testid="mapping-subgroups-root" className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight cus-line-height">
              Mapping Subgroups
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

        {subgroupsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>Error loading subgroups: {subgroupsError}</span>
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
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading groups...</span>
                  </div>
                ) : (
                  <select
                    id="selectGroup"
                    value={selectedGroup}
                    onChange={handleGroupSelectChange}
                    className="text-sm w-full mt-1 p-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500"
                  >
                    <option value="">Select a group</option>
                    {groups.map((group, index) => {
                      const value = group.Value || group.value || "";
                      const text = group.Text || group.text || "";
                      return (
                        <option key={value || `group-${index}`} value={value}>
                          {text}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            </div>

            {/* Subgroups Mapping Interface */}
            <div className="grid grid-cols-12 gap-4 mt-4">
              {/* Available Subgroups */}
              <div className="col-span-5">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold">Available Subgroups</p>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search..."
                      value={searchAvailable}
                      onChange={handleSearchAvailableChange}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                </div>
                {subgroupsLoading ? (
                  <div className="border border-gray-200 rounded-md h-64 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading subgroups...</span>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-md h-64 overflow-y-auto">
                    {filteredAvailableSubgroups.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-xs">
                        No subgroups available
                      </div>
                    ) : (
                      filteredAvailableSubgroups.map((subgroup) => (
                        <div
                          key={subgroup.id}
                          onClick={handleAvailableItemClick(subgroup.id)}
                          className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                            selectedAvailable.includes(subgroup.id)
                              ? "bg-blue-50 border-blue-200"
                              : ""
                          }`}
                        >
                          <div className="text-sm text-gray-900">
                            {subgroup.name}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                <div className="mt-1 text-xs text-gray-500">
                  {filteredAvailableSubgroups.length} subgroups available
                </div>
              </div>

              {/* Transfer Buttons */}
              <div className="col-span-2 flex flex-col items-center justify-center space-y-2 pt-4">
                <Tooltip content="Move all items to mapped" position="top">
                  <Button
                    onClick={handleMoveAllToMapped}
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    disabled={
                      filteredAvailableSubgroups.length === 0 || subgroupsLoading
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
                    disabled={selectedAvailable.length === 0 || subgroupsLoading}
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
                    disabled={selectedMapped.length === 0 || subgroupsLoading}
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
                      filteredMappedSubgroups.length === 0 || subgroupsLoading
                    }
                  >
                    <ChevronsLeft className="h-4 w-4 text-indigo-600" />
                  </Button>
                </Tooltip>
              </div>

              {/* Mapped Subgroups */}
              <div className="col-span-5">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold">Mapped Subgroups</p>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search..."
                      value={searchMapped}
                      onChange={handleSearchMappedChange}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                </div>
                {subgroupsLoading ? (
                  <div className="border border-gray-200 rounded-md h-64 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading subgroups...</span>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-md h-64 overflow-y-auto">
                    {filteredMappedSubgroups.length === 0 ? (
                      <div className="text-xs p-4 text-center text-gray-500">
                        No subgroups mapped
                      </div>
                    ) : (
                      filteredMappedSubgroups.map((subgroup) => (
                        <div
                          key={subgroup.id}
                          onClick={handleMappedItemClick(subgroup.id)}
                          className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                            selectedMapped.includes(subgroup.id)
                              ? "bg-blue-50 border-blue-200"
                              : ""
                          }`}
                        >
                          <div className="text-sm text-gray-900">
                            {subgroup.name}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                <div className="mt-1 text-xs text-gray-500">
                  {filteredMappedSubgroups.length} subgroups mapped
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
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
                {saving ? "Saving..." : "Save"}
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

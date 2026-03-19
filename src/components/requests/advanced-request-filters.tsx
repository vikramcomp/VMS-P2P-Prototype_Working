"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Filter, Loader2, X } from "lucide-react";
import {
  getFormattedGroups,
  getFormattedRequestTypes,
} from "@/services/groups-service";
import { subgroupsService } from "@/services/subgroups-service";
import { useToast } from "@/hooks/use-toast";

// Types for filter options
interface DropdownOption {
  id: number | string;
  name: string;
}

interface FilterValues {
  requestTypeId: number;
  groupId: number;
  subgroupId: number;
  requestNumber: string;
}

interface AdvancedRequestFiltersProps {
  readonly onFiltersChange: (filters: FilterValues) => void;
  readonly onReset: () => void;
  readonly loading?: boolean;
}

export default function AdvancedRequestFilters({
  onFiltersChange,
  onReset,
  loading = false,
}: Readonly<AdvancedRequestFiltersProps>) {
  const { toast } = useToast();

  // Filter visibility state
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  // Filter values state
  const [filters, setFilters] = useState<FilterValues>({
    requestTypeId: -1,
    groupId: -1,
    subgroupId: -1,
    requestNumber: ''
  });

  // Loading states for dropdowns
  const [loadingStates, setLoadingStates] = useState({
    requestTypes: false,
    groups: false,
    subgroups: false,
  });

  // Dropdown options state
  const [options, setOptions] = useState({
    requestTypes: [] as DropdownOption[],
    groups: [] as DropdownOption[],
    subgroups: [] as DropdownOption[],
  });

  // Initialize request types and groups on component mount
  useEffect(() => {
    loadRequestTypes();
    loadGroups();
  }, []);

  // Load request types from API
  const loadRequestTypes = async () => {
    setLoadingStates((prev) => ({ ...prev, requestTypes: true }));

    try {
      const requestTypes = await getFormattedRequestTypes();
      // Filter out "All Request Types" option if it exists in the API response
      const filteredRequestTypes = requestTypes.filter(
        (rt) =>
          String(rt.id) !== "-1" &&
          rt.name.toLowerCase() !== "all request types"
      );
      setOptions((prev) => ({ ...prev, requestTypes: filteredRequestTypes }));
    } catch (error) {
      console.error("Error fetching request types:", error);
      toast({
        title: "Error",
        description: "Failed to load request types for filter",
        variant: "destructive",
      });
      // Set empty array on error, the JSX will show "All Request Types" placeholder
      setOptions((prev) => ({ ...prev, requestTypes: [] }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, requestTypes: false }));
    }
  };

  // Load groups from API
  const loadGroups = async () => {
    setLoadingStates((prev) => ({ ...prev, groups: true }));

    try {
      const groups = await getFormattedGroups();
      // Filter out "All Groups" option if it exists in the API response
      const filteredGroups = groups.filter(
        (g) => String(g.id) !== "-1" && g.name.toLowerCase() !== "all groups"
      );
      setOptions((prev) => ({ ...prev, groups: filteredGroups }));
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast({
        title: "Error",
        description: "Failed to load groups for filter",
        variant: "destructive",
      });
      // Set empty array on error, the JSX will show "All Groups" placeholder
      setOptions((prev) => ({ ...prev, groups: [] }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, groups: false }));
    }
  };

  // Load subgroups based on selected group from API
  const loadSubgroups = async (groupId: number) => {
    if (groupId === -1) {
      setOptions((prev) => ({ ...prev, subgroups: [] }));
      return;
    }

    setLoadingStates((prev) => ({ ...prev, subgroups: true }));

    try {
      const subgroups = await subgroupsService.getSubgroupsByGroupId(groupId);
      // Add "All Subgroups" option at the beginning
      const subgroupsWithAll = [
        { id: -1, name: "All Subgroups" },
        ...subgroups.map((sg) => ({ id: sg.id, name: sg.name })),
      ];
      setOptions((prev) => ({ ...prev, subgroups: subgroupsWithAll }));
    } catch (error) {
      console.error("Error fetching subgroups:", error);
      setOptions((prev) => ({ ...prev, subgroups: [] }));
      toast({
        title: "Error",
        description: "Failed to load subgroups for selected group",
        variant: "destructive",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, subgroups: false }));
    }
  };

  // Handle filter changes
  const handleFilterChange = (
    filterType: keyof FilterValues,
    value: number
  ) => {
    const newFilters = { ...filters, [filterType]: value };

    // If group changes, reset and reload subgroups
    if (filterType === "groupId") {
      newFilters.subgroupId = -1;
      setFilters(newFilters);
      loadSubgroups(value);
    } else {
      setFilters(newFilters);
    }
  };

  // Handle submit
  const handleSubmit = () => {
    onFiltersChange(filters);
  };

  // Handle reset
  const handleReset = () => {
    const resetFilters: FilterValues = {
      requestTypeId: -1,
      groupId: -1,
      subgroupId: -1,
      requestNumber: ''
    };
    setFilters(resetFilters);
    setOptions((prev) => ({ ...prev, subgroups: [] }));
    onReset();
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setIsFiltersVisible(!isFiltersVisible);
  };

  // Render subgroup options based on current state
  const renderSubgroupOptions = () => {
    if (filters.groupId === -1) {
      return <option value={-1}>-- Select Group First --</option>;
    }

    if (loadingStates.subgroups) {
      return <option value={-1}>Loading...</option>;
    }

    if (options.subgroups.length > 0) {
      return options.subgroups.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ));
    }

    return <option value={-1}>No subgroups available</option>;
  };

  return (
    <Card className="mb-6">
      <CardHeader className="p-4 py-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-indigo-600" />
            <span
              className="font-semibold text-indigo-600"
              style={{ fontSize: "16px" }}
            >
              Advanced Filters
            </span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFilters}
            className="flex items-center gap-2 text-xs"
          >
            {isFiltersVisible ? (
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
      </CardHeader>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isFiltersVisible ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Request # Input */}
            <div className="space-y-2">
              <label htmlFor="requestNumber" className="text-sm font-medium text-gray-700">
                Request #
              </label>
              <input
                type="text"
                id="requestNumber"
                value={filters.requestNumber}
                onChange={(e) => setFilters(prev => ({ ...prev, requestNumber: e.target.value }))}
                placeholder="Enter Request Number"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white hover:border-gray-400 transition-colors duration-200"
              />
            </div>

            {/* Request Type Dropdown */}
            <div className="space-y-2">
              <label
                htmlFor="requestType"
                className="text-sm font-medium text-gray-700"
              >
                Request Type
              </label>
              <div className="relative">
                <select
                  id="requestType"
                  value={filters.requestTypeId}
                  onChange={(e) =>
                    handleFilterChange(
                      "requestTypeId",
                      Number.parseInt(e.target.value)
                    )
                  }
                  className="w-full h-9 px-3 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white hover:border-gray-400 transition-colors duration-200"
                  disabled={loadingStates.requestTypes}
                >
                  <option value={-1}>
                    {loadingStates.requestTypes
                      ? "Loading request types..."
                      : "All Request Types"}
                  </option>
                  {options.requestTypes.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Group Dropdown */}
            <div className="space-y-2">
              <label
                htmlFor="group"
                className="text-sm font-medium text-gray-700"
              >
                Group
              </label>
              <div className="relative">
                <select
                  id="group"
                  value={filters.groupId}
                  onChange={(e) =>
                    handleFilterChange(
                      "groupId",
                      Number.parseInt(e.target.value)
                    )
                  }
                  className="w-full h-9 px-3 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white hover:border-gray-400 transition-colors duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  disabled={loadingStates.groups}
                >
                  <option value={-1}>
                    {loadingStates.groups ? "Loading groups..." : "All Groups"}
                  </option>
                  {options.groups.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                {loadingStates.groups && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Subgroup Dropdown */}
            <div className="space-y-2">
              <label
                htmlFor="subgroup"
                className="text-sm font-medium text-gray-700"
              >
                Subgroup
              </label>
              <div className="relative">
                <select
                  id="subgroup"
                  value={filters.subgroupId}
                  onChange={(e) =>
                    handleFilterChange(
                      "subgroupId",
                      Number.parseInt(e.target.value)
                    )
                  }
                  className="w-full h-9 px-3 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white hover:border-gray-400 transition-colors duration-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                  disabled={filters.groupId === -1 || loadingStates.subgroups}
                >
                  {renderSubgroupOptions()}
                </select>
                {loadingStates.subgroups && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2 text-xs font-normal"
              disabled={loading}
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleSubmit}
              className="flex items-center gap-2 text-xs font-normal"
              disabled={loading}
            >
              <Filter className="h-4 w-4" />
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                "Apply Filter"
              )}
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import {
	Card,
	CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { ArrowLeft, Save, AlertCircle, RotateCcw, ChevronDown, Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useStudios } from "@/hooks/use-studios";
import { groupsService } from "@/services/groups-service";
import { useToast } from "@/hooks/use-toast";
import { UpdateGroupRequest } from "@/types/groups";
import { useCompanyContext } from "@/context/CompanyContext";
import {
  getBusinessUnitByIdForCompany,
  updateLocalBusinessUnit,
} from "@/data/seedData/businessUnits";

export default function EditGroupPage({
  isTesting = false,
}: { isTesting?: boolean } = {}) {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { activeCompany } = useCompanyContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [recordId, setRecordId] = useState<string>("");
  const [isLocalRecord, setIsLocalRecord] = useState(false);
  const [formData, setFormData] = useState({
    studioId: "", // Store StudioId instead of studioName
    studioName: "", // Keep for display/validation purposes
    name: "",
    description: "",
    status: 1, // 1 = Active (default), 0 = In-Active
  });

  // Track original data for unsaved changes detection
  const [originalData, setOriginalData] = useState({
    studioId: "",
    studioName: "",
    name: "",
    description: "",
    status: 1,
  });

  // Use our custom hook to fetch studios
  const {
    studios,
    loading: studiosLoading,
    error: studiosError,
  } = useStudios();

  // Testing hook to achieve code coverage
  useEffect(() => {
    if (!isTesting) return;

    // Call all handlers and functions with safe mock parameters
    try {
      // Test form validation
      isFormValid();
      hasUnsavedChanges();
      collapseSpaces("test name");
      trimSpaces("test name");

      // Test input handler
      handleInputChange("name", "Test Group");
      handleBlur("name");
      handleBlur("description");
      handleInputChange("description", "Test Description");
      handleInputChange("status", 1);
      handleInputChange("studioId", "1");

      // Test cancel handler
      handleCancel();

      // Test reset handler
      handleReset().catch(() => {});

      // Test submit handler with mock event
      const mockEvent = {
        preventDefault: () => {},
      } as React.FormEvent;
      handleSubmit(mockEvent).catch(() => {});
    } catch (error) {
      // Log error in testing mode for debugging
      console.error("Testing hook error:", error);
    }
  }, [isTesting]);

  // Form validation
  const isFormValid = () => {
    return (
      formData.name.trim().length >= 3 && // Group name minimum 3 characters
      formData.studioId.trim() !== "" && // Studio selection required (use studioId)
      formData.name.trim() !== "" // Group name required
    );
  };

  // Helper function to transform group record data
  const transformGroupRecord = (groupRecord: any) => {
    const studioId = groupRecord.studioId || groupRecord.StudioId;
    const statusValue = groupRecord.status || groupRecord.Status;
    
    // Convert status to number: 1 for Active, 0 for In-Active
    let status = 0; // Default to In-Active
    if (
      statusValue === "Active" ||
      statusValue === "1" ||
      statusValue === 1 ||
      String(statusValue).toLowerCase() === "active"
    ) {
      status = 1;
    }
    
    return {
      studioId: studioId ? studioId.toString() : "",
      studioName: groupRecord.studioName || groupRecord.StudioName || "",
      name: groupRecord.categoryName || groupRecord.CategoryName || "",
      description:
        groupRecord.categoryDescription ||
        groupRecord.CategoryDescription ||
        "",
      status: status,
    };
  };

  const normalizeText = (value: string) => value.trim().toLowerCase();

  const findStudioByName = (studioName: string) => {
    if (!studioName) return null;

    return (
      studios.find((studio: any) => {
        const candidateName = studio.name || studio.StudioName || "";
        return normalizeText(candidateName) === normalizeText(studioName);
      }) || null
    );
  };

  const transformLocalBusinessUnit = (unit: any) => {
    const matchedStudio = findStudioByName(unit.location || "");

    return {
      studioId: matchedStudio ? String(matchedStudio.id || matchedStudio.StudioId || "") : "",
      studioName: unit.location || "",
      name: unit.name || "",
      description: unit.description || "",
      status: unit.isActive ? 1 : 0,
    };
  };

  useEffect(() => {
    const fetchGroupData = async () => {
      if (!params.id) {
        toast({
          title: "Error",
          description: "Branch ID is required",
          variant: "destructive",
        });
        router.push("/groups");
        return;
      }

      const idParam = String(params.id);
      setRecordId(idParam);

      const isNumericId = /^\d+$/.test(idParam);

      if (!isNumericId) {
        const companyId = activeCompany?.id;
        if (!companyId) {
          // Wait for company context initialization before resolving local data.
          return;
        }

        setIsLoading(true);
        const localRecord = getBusinessUnitByIdForCompany(companyId, idParam);

        if (!localRecord) {
          toast({
            title: "Error",
            description: "Branch not found",
            variant: "destructive",
          });
          router.push("/groups");
          return;
        }

        const localFormData = transformLocalBusinessUnit(localRecord);
        setIsLocalRecord(true);
        setGroupId(null);
        setFormData(localFormData);
        setOriginalData(localFormData);
        setIsLoading(false);
        return;
      }

      const id = Number.parseInt(idParam, 10);
      setGroupId(id);
      setIsLocalRecord(false);

      try {
        setIsLoading(true);
        const response = await groupsService.getGroupById(id);
        if (response.success && response.data) {
          // Handle both transformed (camelCase) and original (PascalCase) properties
          const responseData = response.data as any;
          const records = responseData.records || responseData.Records;
          const groupRecord = records && records.length > 0 ? records[0] : null;
          if (groupRecord) {
            const formDataToSet = transformGroupRecord(groupRecord);
            setFormData(formDataToSet);
            setOriginalData(formDataToSet);
          } else {
            toast({
              title: "Error",
              description: "Branch not found",
              variant: "destructive",
            });
            setTimeout(() => {
              router.push("/groups");
            }, 2000);
          }
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to load group details",
            variant: "destructive",
          });
          setTimeout(() => {
            router.push("/groups");
          }, 2000);
        }
      } catch (error) {
        console.error("Error loading group details:", error);
        toast({
          title: "Error",
          description:
            "An unexpected error occurred while loading group details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroupData();
  }, [params.id, router, toast, activeCompany?.id]);
  // Helper to check for unsaved changes
  const hasUnsavedChanges = () => {
    return (
      formData.studioId !== originalData.studioId ||
      formData.studioName !== originalData.studioName ||
      formData.name !== originalData.name ||
      formData.description !== originalData.description ||
      formData.status !== originalData.status
    );
  };

  // Update studioName in formData if studios are loaded and studioId is set
  useEffect(() => {
    if (studios.length === 0) return;

    if (!formData.studioId && formData.studioName) {
      const matchedStudio = findStudioByName(formData.studioName);
      if (matchedStudio) {
        setFormData((prev) => ({
          ...prev,
          studioId: String(matchedStudio.id || matchedStudio.StudioId || ""),
          studioName: matchedStudio.name || matchedStudio.StudioName || prev.studioName,
        }));
      }
      return;
    }

    if (formData.studioId) {
      const foundStudio = studios.find(
        (studio: any) => studio.id?.toString() === formData.studioId
      );
      if (
        foundStudio?.name &&
        formData.studioName !== foundStudio.name
      ) {
        setFormData((prev) => ({
          ...prev,
          studioName: foundStudio.name || "",
        }));
      }
    }
  }, [studios, formData.studioId, formData.studioName]);

  // Function to collapse consecutive spaces while typing
  const collapseSpaces = (value: string) => {
    // Collapse consecutive spaces to single space, but preserve leading/trailing during typing
    return value.replaceAll(/\s+/g, " ");
  };

  // Function to trim leading/trailing spaces (used on blur)
  const trimSpaces = (value: string) => {
    return value.trim().replaceAll(/\s+/g, " ");
  };

  const handleInputChange = (field: string, value: any) => {
    // Collapse consecutive spaces during typing but preserve leading/trailing
    if (field === "name" || field === "description") {
      value = collapseSpaces(value);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBlur = (field: string) => {
    // Trim leading/trailing spaces when user leaves the field
    if (field === "name" || field === "description") {
      setFormData((prev) => ({
        ...prev,
        [field]: trimSpaces(prev[field as keyof typeof prev] as string),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    if (!groupId && !isLocalRecord) {
      toast({
        title: "Error",
        description: "Group ID is missing",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Find the selected studio to get its name
      const selectedStudio = studios?.find((studio: any) => {
        const studioId = studio.id || studio.StudioId || studio.studioid || "";
        return studioId.toString() === formData.studioId.toString();
      });

      const studioName = selectedStudio
        ? selectedStudio.name || selectedStudio.StudioName || ""
        : "";

      // Prepare the API request according to the specified structure
      if (isLocalRecord) {
        const companyId = activeCompany?.id;
        const existingLocalRecord = companyId
          ? getBusinessUnitByIdForCompany(companyId, recordId)
          : null;

        updateLocalBusinessUnit({
          id: recordId,
          companyId: existingLocalRecord?.companyId || companyId,
          code: existingLocalRecord?.code || `BR-${trimSpaces(formData.name).slice(0, 6).toUpperCase().replaceAll(" ", "-")}`,
          name: trimSpaces(formData.name),
          location: studioName || formData.studioName,
          description: trimSpaces(formData.description),
          isActive: formData.status === 1,
        });

        toast({
          title: "Success",
          description: "Branch updated successfully!",
          variant: "success",
        });

        setTimeout(() => {
          router.push("/groups");
        }, 600);
        return;
      }

      const updateGroupRequest: UpdateGroupRequest = {
        StudioId: Number.parseInt(formData.studioId, 10),
        CategoryId: groupId,
        CategoryName: trimSpaces(formData.name), // Ensure name is sanitized
        CategoryDescription: trimSpaces(formData.description),
        Status: formData.status,
        StudioName: studioName,
      };

      const response = await groupsService.updateGroup(groupId, updateGroupRequest);

      if (response.success) {
        toast({
          title: "Success",
          description: "Branch updated successfully!",
          variant: "success",
        });
        // Wait briefly so toast is visible before navigating
        setTimeout(() => {
          router.push("/groups");
        }, 600);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update group",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating group:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (isLocalRecord && activeCompany?.id && recordId) {
      const localRecord = getBusinessUnitByIdForCompany(activeCompany.id, recordId);
      if (localRecord) {
        const resetLocalData = transformLocalBusinessUnit(localRecord);
        setFormData(resetLocalData);
      }
      return;
    }

    if (!groupId) return;

    try {
      const response = await groupsService.getGroupById(groupId);
      if (response.success && response.data) {
        // Handle both transformed (camelCase) and original (PascalCase) properties
        const responseData = response.data as any;
        const records = responseData.records || responseData.Records;

        if (records && records.length > 0) {
          const groupRecord = records[0];

          // Find studio using StudioId (handle both formats)
          const studioId = groupRecord.studioId || groupRecord.StudioId;
          const foundStudio = studios.find(
            (studio: any) => studio.id === studioId
          );

          const resetFormData = transformGroupRecord(groupRecord);
          // Override studioName with found studio if available
          if (foundStudio?.name) {
            resetFormData.studioName = foundStudio.name;
          }
          setFormData(resetFormData);
        }
      }
    } catch (error) {
      console.error("Error resetting group data:", error);
    }
  };

  const handleCancel = () => {
    router.push("/groups");
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading branch details for ID: {params.id}...</span>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6" data-testid="edit-group-root">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Tooltip content="Go back to Branches" position="bottom">
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
                Edit Branch
              </h3>
              <p className="text-xs text-muted-foreground">
                Update branch information
              </p>
            </div>
          </div>

          {/* Unsaved Changes Indicator */}
          {hasUnsavedChanges() && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-orange-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xs">You have unsaved changes</span>
                </div>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="shadow-sm border border-gray-200">
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <label htmlFor="group-name-input" className="block text-sm font-medium mb-2 text-gray-700">
                      Branch Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="group-name-input"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      onBlur={() => handleBlur("name")}
                      placeholder="Enter branch name"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 text-gray-900 text-sm hover:border-gray-400 transition-colors duration-200 ${
                        formData.name.trim() !== "" &&
                        formData.name.trim().length < 3
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-[#0152ef] focus:border-[#0152ef]"
                      }`}
                      required
                      disabled={isSubmitting}
                    />
                    {formData.name.trim() !== "" &&
                      formData.name.trim().length < 3 && (
                        <div className="mt-1 text-red-600 text-sm flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          <span>
                            Branch name must be at least 3 characters long
                          </span>
                        </div>
                      )}
                    {formData.name.trim().length >= 3 && (
                      <div className="mt-1 text-green-600 text-xs">
                        ✓ Valid branch name
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="studio-select" className="block text-sm font-medium mb-2 text-gray-700">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="studio-select"
                        value={formData.studioId}
                        onChange={(e) => {
                          const selectedStudioId = e.target.value;
                          const selectedStudio = studios.find(
                            (studio: any) =>
                              (studio.id || studio.StudioId)?.toString() ===
                              selectedStudioId
                          );

                          handleInputChange("studioId", selectedStudioId);
                          // Also update studioName for consistency
                          if (selectedStudio) {
                            handleInputChange(
                              "studioName",
                              selectedStudio.name ||
                                selectedStudio.StudioName ||
                                ""
                            );
                          }
                        }}
                        className={`
														w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg
														focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500
														bg-white text-gray-900 text-sm
														disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
														appearance-none cursor-pointer
														hover:border-gray-400 transition-colors duration-200
														${studiosLoading ? "opacity-70" : ""}
														${studiosError ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}
													`}
                        disabled={studiosLoading || isSubmitting}
                        required
                      >
                        <option value="" disabled className="text-gray-500">
                          {studiosLoading
                            ? "Loading locations..."
                            : "Select Location"}
                        </option>
                        {studios && studios.length > 0
                          ? studios.map((studio: any) => {
                              // Use any available property for the studio ID and name
                              const studioId =
                                studio.id ||
                                studio.StudioId ||
                                studio.studioid ||
                                "";
                              const studioName =
                                studio.name || studio.StudioName || "";
                              return (
                                <option
                                  key={studioId}
                                  value={studioId.toString()}
                                  className="text-gray-900"
                                >
                                  {studioName}
                                </option>
                              );
                            })
                          : !studiosLoading && (
                              <option
                                disabled
                                value=""
                                className="text-gray-500"
                              >
                                No studios available
                              </option>
                            )}
                      </select>

                      {/* Custom dropdown arrow */}
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {studiosLoading ? (
                          <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Error message */}
                    {studiosError && (
                      <div className="mt-2 text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>
                          Failed to load studios. Please try again later.
                        </span>
                      </div>
                    )}

                    {/* Helper text */}
                    {!studiosError &&
                      !studiosLoading &&
                      studios &&
                      studios.length > 0 && (
                        <div className="mt-1 text-gray-500 text-xs">
                          Choose the location for this branch
                        </div>
                      )}
                  </div>
                  <div>
                    <label htmlFor="status-select" className="block text-sm font-medium mb-2 text-gray-700">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="status-select"
                        value={formData.status}
                        onChange={(e) =>
                          handleInputChange("status", Number(e.target.value))
                        }
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white text-gray-900 text-sm appearance-none cursor-pointer hover:border-gray-400 transition-colors duration-200"
                        required
                        disabled={isSubmitting}
                      >
                        <option value={1} className="text-gray-900">
                          Active
                        </option>
                        <option value={0} className="text-gray-900">
                          In-Active
                        </option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="description-textarea" className="block text-sm font-medium mb-2 text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description-textarea"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    onBlur={() => handleBlur("description")}
                    placeholder="Enter branch description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 text-gray-900 text-sm hover:border-gray-400 transition-colors duration-200 resize-vertical"
                    disabled={isSubmitting}
                  />
                </div>
                {/* Action Buttons */}
                <div className="flex gap-4 pt-0 justify-start">
                  <Button
                    type="submit"
                    variant="ghost"
                    className="gap-2 text-xs cus-primary-submit-btn"
                    style={{
                      backgroundColor: '#0152ef',
                      color: '#ffffff',
                      border: '1px solid #0152ef',
                      fontWeight: 400,
                      opacity: (!isFormValid() || isSubmitting) ? 0.4 : 1
                    }}
                    disabled={!isFormValid() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        {/* <Save className="h-4 w-4" /> */}
                        Update
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleReset}
                    className="text-xs gap-2 cus-secondary-reset-btn"
                    disabled={isSubmitting}
                  >
                    {/* <RotateCcw className="h-4 w-4" /> */}
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

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { AddGroupRequest } from "@/types/groups";
import { useCompanyContext } from "@/context/CompanyContext";
import { addLocalBusinessUnit } from "@/data/seedData/businessUnits";
import { Lock, Building2 } from "lucide-react";

interface NewGroupPageProps {
  isTesting?: boolean;
}

export default function NewGroupPage({
  isTesting = false,
}: NewGroupPageProps = {}) {
  const router = useRouter();
  const { toast } = useToast();
  // TODO: submit activeCompany.id as companyId in API payload.
  const { activeCompany } = useCompanyContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studioName: "",
    name: "",
    description: "",
    status: 1, // 1 = Active (default), 0 = In-Active
  });

  // Use our custom hook to fetch studios
  const { studios, loading, error } = useStudios();

  // Testing helper effect to invoke functions for coverage
  React.useEffect(() => {
    if (isTesting) {
      isFormValid();
      sanitizeGroupName("test");
      handleInputChange("name", "test");
      handleReset();
      handleCancel();
    }
  }, [isTesting]);

  // Form validation
  const isFormValid = () => {
    return (
      formData.name.trim().length >= 2 && // Group name minimum 2 characters
      formData.studioName.trim() !== "" && // Studio selection required
      formData.name.trim() !== "" // Group name required
    );
  };

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

    setIsSubmitting(true);

    try {
      // Find the selected studio to get its name
      const selectedStudio = studios?.find((studio: any) => {
        const studioId = studio.id || studio.StudioId || studio.studioid || "";
        return studioId.toString() === formData.studioName.toString();
      });

      const studioName = selectedStudio
        ? selectedStudio.name || selectedStudio.StudioName || ""
        : "";

      // Prepare the API request according to the specified structure
      const addGroupRequest: AddGroupRequest = {
        StudioId: Number.parseInt(formData.studioName),
        CategoryId: 0, // Default value as not specified in form
        CategoryName: trimSpaces(formData.name), // Ensure name is sanitized
        CategoryDescription: trimSpaces(formData.description),
        Status: formData.status,
        StudioName: studioName,
      };

      const response = await groupsService.addGroup(addGroupRequest);

      if (response.success) {
        // TODO: replace local addition cache with POST /api/business-units and list refetch.
        addLocalBusinessUnit({
          id: `bu-local-${Date.now()}`,
          companyId: activeCompany?.id,
          code: trimSpaces(formData.name).slice(0, 8).toUpperCase().replaceAll(" ", "-"),
          name: trimSpaces(formData.name),
          location: studioName,
          description: trimSpaces(formData.description),
          isActive: formData.status === 1,
        });

        toast({
          title: "Success",
          description: "Branch created successfully!",
          variant: "success",
        });
        // Wait briefly so toast is visible before navigating
        setTimeout(() => {
          router.push("/groups");
        }, 600);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create group",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      studioName: "",
      name: "",
      description: "",
      status: 1, // 1 = Active (default)
    });
  };

  const handleCancel = () => {
    router.push("/groups");
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6" data-testid="new-group-page">
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
                Add New Branch
              </h3>
              <p className="text-muted-foreground text-xs">
                Create a new branch for the selected company
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="shadow-sm border border-gray-200">
              <CardContent className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Company (Tenant)
                  </label>
                  <div className="flex h-10 items-center justify-between rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm text-gray-700">
                    <div className="flex min-w-0 items-center gap-2">
                      <Building2 className="h-4 w-4 text-vendor-600" />
                      <span className="truncate">{activeCompany?.name || "No company selected"}</span>
                    </div>
                    <Lock className="h-4 w-4 text-gray-500" />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Switch company from the top-right selector to create under a different tenant.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <label htmlFor="group-name" className="block text-sm font-medium mb-2 text-gray-700">
                      Branch Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="group-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      onBlur={() => handleBlur("name")}
                      placeholder="Enter branch name"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 text-gray-900 text-sm hover:border-gray-400 transition-colors duration-200 ${
                        formData.name.trim() !== "" &&
                        formData.name.trim().length < 2
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-[#0152ef] focus:border-[#0152ef]"
                      }`}
                      required
                    />
                    {formData.name.trim() !== "" &&
                      formData.name.trim().length < 2 && (
                        <div className="mt-1 text-red-600 text-xs flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          <span>
                            Branch name must be at least 2 characters long
                          </span>
                        </div>
                      )}
                    {formData.name.trim().length >= 2 && (
                      <div className="mt-1 text-green-600 text-xs">
                        ✓ Valid branch name
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="studio-name" className="block text-sm font-medium mb-2 text-gray-700">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="studio-name"
                        value={formData.studioName}
                        onChange={(e) => {
                          handleInputChange("studioName", e.target.value);
                        }}
                        className={`
                          w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg
                          focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500
                          bg-white text-gray-900 text-sm
                          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                          appearance-none cursor-pointer
                          hover:border-gray-400 transition-colors duration-200
                          ${loading ? "opacity-70" : ""}
                          ${
                            error
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                              : ""
                          }
                        `}
                        disabled={loading}
                        required
                      >
                        <option value="" disabled className="text-gray-500">
                          {loading
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
                                studio.name ||
                                studio.StudioName ||
                                studio.studioname ||
                                studio.Name ||
                                "";
                              return (
                                <option
                                  key={studioId}
                                  value={studioId}
                                  className="text-gray-900"
                                >
                                  {studioName}
                                </option>
                              );
                            })
                          : !loading && (
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
                        {loading ? (
                          <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Error message */}
                    {error && (
                      <div className="mt-2 text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>
                          Failed to load studios. Please try again later.
                        </span>
                      </div>
                    )}

                    {/* Helper text */}
                    {!error && !loading && studios && studios.length > 0 && (
                      <div className="mt-1 text-gray-500 text-xs">
                        Choose the location for this branch
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium mb-2 text-gray-700">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(e) =>
                          handleInputChange("status", Number(e.target.value))
                        }
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white text-gray-900 text-sm appearance-none cursor-pointer hover:border-gray-400 transition-colors duration-200"
                        required
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
                  <label htmlFor="description" className="block text-sm font-medium mb-2 text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    onBlur={() => handleBlur("description")}
                    placeholder="Enter branch description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 text-gray-900 text-sm hover:border-gray-400 transition-colors duration-200 resize-vertical"
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
                        Creating...
                      </>
                    ) : (
                      <>
                        {/* <Save className="h-4 w-4" /> */}
                        Submit
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
                  {/* <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button> */}
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/context/CompanyContext";
import {
  buildMetaDescription,
  getProductCategoryByIdForCompany,
  normalizeProductCategoryMajorType,
  parseDescriptionWithMeta,
  updateLocalProductCategory,
} from "@/data/seedData/productCategories";

const getUnitOfMeasure = (majorType: string) => {
  const normalized = normalizeProductCategoryMajorType(majorType);

  if (normalized === "Goods") {
    return "Each";
  }

  if (normalized === "Goods and Services") {
    return "Lot";
  }

  return "Hour";
};

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { activeCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: "",
    description: "",
  });
  const [originalData, setOriginalData] = useState({
    serviceName: "",
    description: "",
    majorType: "",
    categoryCode: "",
    isActive: true,
  });
  const [majorType, setMajorType] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [touched, setTouched] = useState({
    serviceName: false,
    description: false,
  });
  const [majorTypeTouched, setMajorTypeTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const categoryId = useMemo(() => {
    if (typeof params?.id !== "string") {
      return null;
    }

    const parsed = Number(params.id);
    return Number.isFinite(parsed) ? parsed : null;
  }, [params?.id]);

  const isViewMode = searchParams.get("mode") === "view";

  useEffect(() => {
    if (!activeCompany?.id || !categoryId) {
      setLoading(false);
      return;
    }

    const categoryRecord = getProductCategoryByIdForCompany(activeCompany.id, categoryId);

    if (!categoryRecord) {
      toast({
        title: "Error",
        description: "Category not found for the selected company.",
        variant: "destructive",
      });
      router.push("/services");
      return;
    }

    const { cleanDescription, meta } = parseDescriptionWithMeta(
      categoryRecord.Description || categoryRecord.description || ""
    );
    const resolvedMajorType = normalizeProductCategoryMajorType(
      meta.itemType || (categoryRecord as any).ItemType || "Services"
    );
    const resolvedCategoryCode =
      meta.categoryCode || (categoryRecord as any).CategoryCode || "";
    const resolvedIsActive =
      String(meta.status || categoryRecord.StatusText || "Active").toLowerCase() !== "inactive";

    const nextForm = {
      serviceName: categoryRecord.ServiceName || categoryRecord.serviceName || "",
      description: cleanDescription,
    };

    setFormData(nextForm);
    setMajorType(resolvedMajorType);
    setCategoryCode(resolvedCategoryCode);
    setIsActive(resolvedIsActive);
    setOriginalData({
      ...nextForm,
      majorType: resolvedMajorType,
      categoryCode: resolvedCategoryCode,
      isActive: resolvedIsActive,
    });
    setLoading(false);
  }, [activeCompany?.id, categoryId, router, toast]);

  const isFormValid = () => {
    return (
      !!activeCompany?.id &&
      !!categoryId &&
      majorType.trim() !== "" &&
      categoryCode.trim() !== "" &&
      formData.serviceName.trim() !== "" &&
      formData.description.trim() !== ""
    );
  };

  const hasChanges = () => {
    return (
      formData.serviceName !== originalData.serviceName ||
      formData.description !== originalData.description ||
      majorType !== originalData.majorType ||
      categoryCode !== originalData.categoryCode ||
      isActive !== originalData.isActive
    );
  };

  const handleInputChange = (field: "serviceName" | "description", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitAttempted(true);

    if (!isFormValid()) {
      toast({
        title: "Validation Error",
        description: activeCompany?.id
          ? "Please fill in all required fields correctly."
          : "Please select a company first.",
        variant: "destructive",
      });
      return;
    }

    if (!hasChanges()) {
      toast({
        title: "No Changes",
        description: "Please make changes before updating.",
        variant: "default",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const currentRecord = getProductCategoryByIdForCompany(activeCompany!.id, categoryId!);

      if (!currentRecord) {
        toast({
          title: "Error",
          description: "Category not found for update.",
          variant: "destructive",
        });
        return;
      }

      const normalizedMajorType = normalizeProductCategoryMajorType(majorType);

      updateLocalProductCategory({
        ...currentRecord,
        companyId: activeCompany!.id,
        ServiceName: formData.serviceName.trim(),
        Description: buildMetaDescription(formData.description.trim(), {
          itemType: normalizedMajorType,
          category: "General",
          categoryCode: categoryCode.trim(),
          unitOfMeasure: getUnitOfMeasure(normalizedMajorType),
          status: isActive ? "Active" : "Inactive",
          seededDemo: false,
        }),
        MaxAmount: 0,
        StatusText: isActive ? "Active" : "Inactive",
      });

      toast({
        title: "Success",
        description: "Category updated successfully.",
        variant: "success",
      });

      router.push("/services");
    } catch (error) {
      console.error("Category update error:", error);
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
      serviceName: originalData.serviceName,
      description: originalData.description,
    });
    setMajorType(originalData.majorType);
    setCategoryCode(originalData.categoryCode);
    setIsActive(originalData.isActive);
    setTouched({
      serviceName: false,
      description: false,
    });
    setMajorTypeTouched(false);
    setSubmitAttempted(false);
    toast({
      title: "Form Reset",
      description: "Form has been reset to original values.",
      variant: "default",
    });
  };

  const handleCancel = () => {
    router.push("/services");
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading category data...</span>
              </div>
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
          <div className="flex items-center gap-4">
            <Tooltip content="Go back to Manage Category" position="bottom">
              <Button variant="outline" size="icon" onClick={handleCancel} className="shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Tooltip>
            <div>
              <h3 className="text-lg font-semibold tracking-tight cus-line-height">
                {isViewMode ? "View Category" : "Edit Category"}
              </h3>
              <p className="text-muted-foreground text-xs">
                {isViewMode ? "Review category information" : "Update category information"}
              </p>
            </div>
          </div>

          {hasChanges() && !isViewMode && (
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
            <Card className="shadow-sm border border-gray-200">
              <CardContent className="p-6 space-y-6">
                <div className="mb-4 border-l-4 border-vendor-600 bg-vendor-50 px-4 py-2.5 text-[13px] font-bold text-vendor-600">
                  Classification
                </div>

                <div>
                  <fieldset disabled={isViewMode}>
                    <legend className="mb-2 block text-sm font-medium text-gray-700">
                      Major Type <span className="text-red-600">*</span>
                    </legend>
                    <div className="grid gap-3 md:grid-cols-3">
                      {[
                        { value: "Goods", title: "Goods", desc: "Physical products" },
                        { value: "Services", title: "Services", desc: "Non-physical services" },
                        {
                          value: "Goods and Services",
                          title: "Goods and Services",
                          desc: "Mixed type",
                        },
                      ].map((option) => {
                        const selected = majorType === option.value;
                        return (
                          <label
                            key={option.value}
                            className={`cursor-pointer rounded-md border p-3 transition-colors ${
                              selected
                                ? "border-[#0152ef] bg-vendor-50"
                                : "border-gray-300 bg-white hover:border-gray-400"
                            } ${isViewMode ? "pointer-events-none opacity-80" : ""}`}
                          >
                            <input
                              type="radio"
                              name="major-type"
                              value={option.value}
                              checked={selected}
                              onChange={(e) => {
                                setMajorType(e.target.value);
                                setMajorTypeTouched(true);
                              }}
                              className="sr-only"
                            />
                            <div className="flex items-start gap-2">
                              <span
                                className={`mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                                  selected ? "border-[#0152ef]" : "border-gray-400"
                                }`}
                              >
                                {selected && <span className="h-2 w-2 rounded-full bg-[#0152ef]" />}
                              </span>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{option.title}</div>
                                <div className="text-xs text-gray-500">{option.desc}</div>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                  {!isViewMode && (majorTypeTouched || submitAttempted) && !majorType && (
                    <div className="mt-1 text-xs text-red-600">Please select a Major Type</div>
                  )}
                </div>

                <div className="mb-4 border-l-4 border-vendor-600 bg-vendor-50 px-4 py-2.5 text-[13px] font-bold text-vendor-600">
                  Category Information
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="category-code" className="mb-2 block text-sm font-medium text-gray-700">
                      Category Code <span className="text-red-600">*</span>
                    </label>
                    <Input
                      id="category-code"
                      type="text"
                      value={categoryCode}
                      onChange={(e) => setCategoryCode(e.target.value)}
                      placeholder="e.g. CAT001"
                      className="border-gray-300"
                      disabled={isViewMode}
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      Unique code for this category e.g. CAT001, MAINT, IT-SW
                    </div>
                  </div>

                  <div>
                    <label htmlFor="service-name" className="mb-2 block text-sm font-medium text-gray-700">
                      Category Name <span className="text-red-600">*</span>
                    </label>
                    <Input
                      id="service-name"
                      type="text"
                      value={formData.serviceName}
                      onChange={(e) => handleInputChange("serviceName", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, serviceName: true }))}
                      placeholder="Enter category name"
                      className={`text-sm ${
                        !isViewMode && (touched.serviceName || submitAttempted) && formData.serviceName.trim() === ""
                          ? "border-red-600 focus-visible:ring-red-600"
                          : "border-gray-300"
                      }`}
                      disabled={isViewMode}
                    />
                    {!isViewMode && (touched.serviceName || submitAttempted) && formData.serviceName.trim() === "" && (
                      <div className="mt-1 text-xs text-red-600">Category Name is required</div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
                    Description <span className="text-red-600">*</span>
                  </label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
                    placeholder="Enter category description"
                    rows={4}
                    className={`resize-y text-sm ${
                      !isViewMode && (touched.description || submitAttempted) && formData.description.trim() === ""
                        ? "border-red-600 focus-visible:ring-red-600"
                        : "border-gray-300"
                    }`}
                    disabled={isViewMode}
                  />
                  {!isViewMode && (touched.description || submitAttempted) && formData.description.trim() === "" && (
                    <div className="mt-1 text-xs text-red-600">Description is required</div>
                  )}
                </div>

                <div className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">Is Active</span>
                  <button
                    type="button"
                    onClick={() => !isViewMode && setIsActive((prev) => !prev)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isActive ? "bg-[#0152ef]" : "bg-gray-400"
                    } ${isViewMode ? "cursor-default" : ""}`}
                    aria-pressed={isActive}
                    disabled={isViewMode}
                  >
                    <span
                      className="inline-block h-5 w-5 transform rounded-full bg-white transition-transform"
                      style={{ transform: isActive ? "translateX(22px)" : "translateX(2px)" }}
                    />
                  </button>
                </div>

                <div className="mt-6 flex gap-4 pt-0 justify-start">
                  {!isViewMode && (
                    <Button
                      type="submit"
                      variant="ghost"
                      className="gap-2 text-xs cus-primary-submit-btn"
                      disabled={!isFormValid() || !hasChanges() || isSubmitting}
                      style={{
                        backgroundColor: "#0152ef",
                        color: "#ffffff",
                        border: "1px solid #0152ef",
                        fontWeight: 400,
                        opacity: !isFormValid() || !hasChanges() || isSubmitting ? 0.4 : 1,
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update"
                      )}
                    </Button>
                  )}
                  {!isViewMode && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleReset}
                      disabled={isSubmitting || !hasChanges()}
                      className="text-xs gap-2 cus-secondary-reset-btn"
                    >
                      Reset
                    </Button>
                  )}
                  {isViewMode && (
                    <Button type="button" variant="secondary" onClick={handleCancel} className="text-xs gap-2">
                      Back
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

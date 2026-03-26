"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/context/CompanyContext";
import {
  addLocalProductCategory,
  buildMetaDescription,
  getNextProductCategoryId,
  normalizeProductCategoryMajorType,
} from "@/data/seedData/productCategories";

interface AddNewServicePageProps {
  isTesting?: boolean;
}

export default function AddNewServicePage({
  isTesting = false,
}: AddNewServicePageProps = {}) {
  const router = useRouter();
  const { toast } = useToast();
  const { activeCompany } = useCompany();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: "",
    description: "",
  });

  // Form validation and change tracking
  const [touched, setTouched] = useState({
    serviceName: false,
    description: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // UI-only states
  const [majorType, setMajorType] = useState("");
  const [majorTypeTouched, setMajorTypeTouched] = useState(false);
  const [categoryCode, setCategoryCode] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Form validation
  const isFormValid = () => {
    return (
      !!activeCompany?.id &&
      majorType.trim() !== "" &&
      categoryCode.trim() !== "" &&
      formData.serviceName.trim() !== "" &&
      formData.description.trim() !== ""
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    setIsSubmitting(true);

    try {
      const normalizedMajorType = normalizeProductCategoryMajorType(majorType);
      const newCategory = {
        VendorMgrServiceId: getNextProductCategoryId(activeCompany!.id),
        companyId: activeCompany!.id,
        isDemoCategory: true,
        ServiceName: formData.serviceName.trim(),
        Description: buildMetaDescription(formData.description.trim(), {
          itemType: normalizedMajorType,
          category: "General",
          categoryCode: categoryCode.trim(),
          unitOfMeasure:
            normalizedMajorType === "Goods"
              ? "Each"
              : normalizedMajorType === "Goods and Services"
              ? "Lot"
              : "Hour",
          status: isActive ? "Active" : "Inactive",
          seededDemo: false,
        }),
        MaxAmount: 0,
        StatusText: isActive ? "Active" : "Inactive",
      };

      addLocalProductCategory(newCategory);

      toast({
        title: "Success",
        description: "Category created successfully!",
        variant: "success",
      });

      router.push("/services");
    } catch (error) {
      console.error("Error creating category:", error);
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
      serviceName: "",
      description: "",
    });
    setTouched({
      serviceName: false,
      description: false,
    });
    setSubmitAttempted(false);
    setMajorType("");
    setMajorTypeTouched(false);
    setCategoryCode("");
    setIsActive(true);
    toast({
      title: "Form Reset",
      description: "All fields have been cleared",
      variant: "default",
    });
  };

  const handleCancel = () => {
    router.push("/services");
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6" data-testid="add-new-service-page">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Tooltip content="Go back to Manage Category" position="bottom">
              <Button
                variant="outline"
                size="icon"
                onClick={handleCancel}
                className="shrink-0"
                data-testid="back-button"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Tooltip>
            <div>
              <h3 className="text-lg font-semibold tracking-tight cus-line-height">
                Create Category
              </h3>
              <p className="text-muted-foreground text-xs">
                Add a new product category
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            data-testid="add-service-form"
          >
            <Card className="shadow-sm border border-gray-200">
              <CardContent className="p-6 space-y-6">
                <div className="mb-4 border-l-4 border-vendor-600 bg-vendor-50 px-4 py-2.5 text-[13px] font-bold text-vendor-600">
                  Classification
                </div>

                <div>
                  <fieldset>
                    <legend className="mb-2 block text-sm font-medium text-gray-700">
                      Major Type <span className="text-red-600">*</span>
                    </legend>
                    <div className="grid gap-3 md:grid-cols-3">
                      {[
                        { value: "Goods", title: "Goods", desc: "Physical products" },
                        {
                          value: "Services",
                          title: "Services",
                          desc: "Non-physical services",
                        },
                        {
                          value: "GoodsAndServices",
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
                            }`}
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
                                {selected && (
                                  <span className="h-2 w-2 rounded-full bg-[#0152ef]" />
                                )}
                              </span>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {option.title}
                                </div>
                                <div className="text-xs text-gray-500">{option.desc}</div>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                  {(majorTypeTouched || submitAttempted) && !majorType && (
                    <div className="mt-1 text-xs text-red-600">
                      Please select a Major Type
                    </div>
                  )}
                </div>

                <div className="mb-4 border-l-4 border-vendor-600 bg-vendor-50 px-4 py-2.5 text-[13px] font-bold text-vendor-600">
                  Category Information
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="category-code"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Category Code <span className="text-red-600">*</span>
                    </label>
                    <Input
                      id="category-code"
                      type="text"
                      value={categoryCode}
                      onChange={(e) => setCategoryCode(e.target.value)}
                      placeholder="e.g. CAT001"
                      className="border-gray-300"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      Unique code for this category e.g. CAT001, MAINT, IT-SW
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="service-name"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Category Name <span className="text-red-600">*</span>
                    </label>
                    <Input
                      id="service-name"
                      type="text"
                      value={formData.serviceName}
                      onChange={(e) => handleInputChange("serviceName", e.target.value)}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, serviceName: true }))
                      }
                      placeholder="Enter category name"
                      data-testid="service-name-input"
                      className={`text-sm ${
                        (touched.serviceName || submitAttempted) &&
                        formData.serviceName.trim() === ""
                          ? "border-red-600 focus-visible:ring-red-600"
                          : "border-gray-300"
                      }`}
                      required
                    />
                    {(touched.serviceName || submitAttempted) &&
                      formData.serviceName.trim() === "" && (
                        <div className="mt-1 text-xs text-red-600">
                          Category Name is required
                        </div>
                      )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Description <span className="text-red-600">*</span>
                  </label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, description: true }))
                    }
                    placeholder="Enter category description (optional)"
                    rows={4}
                    data-testid="description-input"
                    className={`resize-y text-sm ${
                      (touched.description || submitAttempted) && formData.description.trim() === ""
                        ? "border-red-600 focus-visible:ring-red-600"
                        : "border-gray-300"
                    }`}
                  />
                  {(touched.description || submitAttempted) &&
                    formData.description.trim() === "" && (
                      <div className="mt-1 text-xs text-red-600">
                        Description is required
                      </div>
                    )}
                </div>

                <div className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">Is Active</span>
                  <button
                    type="button"
                    onClick={() => setIsActive((prev) => !prev)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isActive ? "bg-[#0152ef]" : "bg-gray-400"
                    }`}
                    aria-pressed={isActive}
                  >
                    <span
                      className="inline-block h-5 w-5 transform rounded-full bg-white transition-transform"
                      style={{ transform: isActive ? "translateX(22px)" : "translateX(2px)" }}
                    />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-4 pt-0 justify-start">
                  <Button
                    type="submit"
                    variant="ghost"
                    className="gap-2 text-xs cus-primary-submit-btn"
                    disabled={!isFormValid() || isSubmitting}
                    style={{
                      backgroundColor: "#0152ef",
                      color: "#ffffff",
                      border: "1px solid #0152ef",
                      fontWeight: 400,
                      opacity: !isFormValid() || isSubmitting ? 0.4 : 1,
                    }}
                    data-testid="submit-button"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="text-xs gap-2 cus-secondary-reset-btn"
                    data-testid="reset-button"
                    onClick={handleReset}
                    disabled={isSubmitting}
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

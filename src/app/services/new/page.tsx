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
import { ArrowLeft, Save, RotateCcw, Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { servicesService } from "@/services/services-service";
import { useToast } from "@/hooks/use-toast";
import { AddServiceRequest } from "@/types/services";

interface AddNewServicePageProps {
  isTesting?: boolean;
}

export default function AddNewServicePage({
  isTesting = false,
}: AddNewServicePageProps = {}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: "",
    description: "",
    maxAmount: "",
  });

  // Form validation and change tracking
  const [touched, setTouched] = useState({
    serviceName: false,
    description: false,
    maxAmount: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Form validation
  const isFormValid = () => {
    return (
      formData.serviceName.trim() !== "" &&
      // maxAmount is optional, but if provided must be valid
      (formData.maxAmount.trim() === "" ||
        (!Number.isNaN(Number.parseFloat(formData.maxAmount)) &&
        Number.parseFloat(formData.maxAmount) >= 0))
    );
  };

  const handleInputChange = (field: string, value: string) => {
    // Limit maxAmount to 10 characters
    if (field === "maxAmount" && value.length > 10) {
      return;
    }
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
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the API request according to the specified structure
      const addServiceRequest: AddServiceRequest = {
        VendorMgrServiceId: null, // Always null for new services
        ServiceName: formData.serviceName,
        Description: formData.description,
        MaxAmount: Number.parseFloat(formData.maxAmount),
      };

      const response = await servicesService.addService(addServiceRequest);

      if (response.success) {
        toast({
          title: "Success",
          description: "Service created successfully!",
          variant: "success",
        });

        // Navigate to View Services page after successful submission
        router.push("/services");
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create service",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating service:", error);
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
      maxAmount: "",
    });
    setTouched({
      serviceName: false,
      description: false,
      maxAmount: false,
    });
    setSubmitAttempted(false);
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
            <Tooltip content="Go back to Services" position="bottom">
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
                Add New Service
              </h3>
              <p className="text-muted-foreground text-xs">
                Create a new service in your system
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            data-testid="add-service-form"
          >
            {/* Basic Information */}
            <Card className="shadow-sm border border-gray-200">
              {/* <CardHeader>
                <CardTitle>Service Information</CardTitle>
                <CardDescription>
                  Enter the details for the new service
                </CardDescription>
              </CardHeader> */}
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="service-name" className="block text-sm font-medium mb-2 text-gray-700">
                      Service Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="service-name"
                      type="text"
                      value={formData.serviceName}
                      onChange={(e) =>
                        handleInputChange("serviceName", e.target.value)
                      }
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, serviceName: true }))
                      }
                      placeholder="Enter service name"
                      data-testid="service-name-input"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 text-gray-900 text-sm hover:border-gray-400 transition-colors duration-200 ${
                        (touched.serviceName || submitAttempted) &&
                        formData.serviceName.trim() === ""
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                      required
                    />
                    {formData.serviceName.trim() !== "" && (
                      <div className="mt-1 text-green-600 text-xs">
                        ✓ Valid service name
                      </div>
                    )}
                    {(touched.serviceName || submitAttempted) &&
                      formData.serviceName.trim() === "" && (
                        <div className="mt-1 text-red-600 text-xs">
                          Service name is required
                        </div>
                      )}
                  </div>

                  <div>
                    <label htmlFor="max-amount" className="block text-sm font-medium mb-2 text-gray-700">
                      Max Amount
                    </label>
                    <input
                      id="max-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      maxLength={10}
                      value={formData.maxAmount}
                      onChange={(e) =>
                        handleInputChange("maxAmount", e.target.value)
                      }
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, maxAmount: true }))
                      }
                      placeholder="Enter maximum amount"
                      data-testid="max-amount-input"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 text-gray-900 text-sm hover:border-gray-400 transition-colors duration-200 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {formData.maxAmount.trim() !== "" &&
                      !Number.isNaN(Number.parseFloat(formData.maxAmount)) &&
                      Number.parseFloat(formData.maxAmount) >= 0 && (
                        <div className="mt-1 text-green-600 text-xs">
                          ✓ Valid amount
                        </div>
                      )}
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
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, description: true }))
                    }
                    placeholder="Enter service description"
                    rows={4}
                    data-testid="description-input"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 text-gray-900 text-sm hover:border-gray-400 transition-colors duration-200 resize-vertical border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {formData.description.trim() !== "" && (
                    <div className="mt-1 text-green-600 text-xs">
                      ✓ Valid description
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-0 justify-start">
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
                      opacity: (!isFormValid() || isSubmitting) ? 0.4 : 1,
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

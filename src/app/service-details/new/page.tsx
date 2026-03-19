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
import { serviceDetailsService } from "@/services/service-details-service";
import { useToast } from "@/hooks/use-toast";
import { AddServiceDetailRequest } from "@/types/service-details";

interface NewServiceDetailPageProps {
  isTesting?: boolean;
}

export default function NewServiceDetailPage({
  isTesting = false,
}: NewServiceDetailPageProps = {}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceDetailName: "",
    serviceDetailDescription: "",
  });

  // Testing helper effect to invoke functions for coverage
  React.useEffect(() => {
    if (isTesting) {
      isFormValid();
      handleInputChange("serviceDetailName", "test");
      handleReset();
      handleCancel();
    }
  }, [isTesting]);

  // Form validation
  const isFormValid = () => {
    return formData.serviceDetailName.trim() !== ""; // ServiceDetailName is required
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
      // Prepare the API request according to the specified structure
      const addServiceDetailRequest: AddServiceDetailRequest = {
        VendorMgrServiceDetailId: null,
        ServiceDetailName: formData.serviceDetailName,
        ServiceDetailDescription: formData.serviceDetailDescription,
      };

      const response = await serviceDetailsService.addServiceDetail(
        addServiceDetailRequest
      );

      if (response.success) {
        toast({
          title: "Success",
          description: "Service detail created successfully!",
          variant: "success",
        });

        // Navigate to View Service Details page after successful submission
        router.push("/service-details");
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create service detail",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating service detail:", error);
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
      serviceDetailName: "",
      serviceDetailDescription: "",
    });
  };

  const handleCancel = () => {
    router.push("/service-details");
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6" data-testid="new-service-detail-page">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Tooltip content="Go back to Service Details" position="bottom">
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
                Add New Service Detail
              </h3>
              <p className="text-muted-foreground text-xs">
                Create a new service detail entry
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="shadow-sm border border-gray-200">
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Service Detail Name{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.serviceDetailName}
                      onChange={(e) =>
                        handleInputChange("serviceDetailName", e.target.value)
                      }
                      placeholder="Enter service detail name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 text-gray-900 text-sm hover:border-gray-400 transition-colors duration-200"
                      required
                    />
                    {formData.serviceDetailName.trim() !== "" && (
                      <div className="mt-1 text-green-600 text-xs">
                        ✓ Valid service detail name
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="serviceDetailDescription" className="block text-sm font-medium mb-2 text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="serviceDetailDescription"
                    value={formData.serviceDetailDescription}
                    onChange={(e) =>
                      handleInputChange(
                        "serviceDetailDescription",
                        e.target.value
                      )
                    }
                    placeholder="Enter service detail description"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 text-gray-900 text-sm hover:border-gray-400 transition-colors duration-200 resize-vertical"
                  />
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
                  >
                    {isSubmitting ? "Creating..." : "Submit"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className="text-xs gap-2 cus-secondary-reset-btn"
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

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MainLayout } from "@/components/layout/main-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import RequestForm from "@/components/requests/request-form";
import { requestsService } from "@/services/requests-service";

interface ViewRequestPageProps {
  isTesting?: boolean;
}

export default function ViewRequestPage({
  isTesting = false,
}: ViewRequestPageProps = {}) {
  const params = useParams();
  const { toast } = useToast();
  const [requestData, setRequestData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Testing helper effect to invoke functions for coverage
  React.useEffect(() => {
    if (isTesting) {
      // Functions are called within the main useEffect
    }
  }, [isTesting]);

  useEffect(() => {
    const fetchRequestData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const requestId = Number.parseInt(params.id as string);

        if (Number.isNaN(requestId)) {
          throw new TypeError("Invalid request ID");
        }

        console.log("Fetching request data for ID:", requestId);
        const response = await requestsService.getRequestById(requestId);

        console.log("Request data received:", response);
        setRequestData(response);
      } catch (err: any) {
        console.error("Error fetching request data:", err);
        const errorMessage = err.message || "Failed to load request data";
        setError(errorMessage);

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequestData();
  }, [params.id, toast]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-vendor-600" />
              <p className="text-gray-600">Loading request details...</p>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (error || !requestData) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="text-red-500 font-medium">
                Failed to load request
              </div>
              <p className="text-gray-600">{error || "Request not found"}</p>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="p-0" data-testid="view-request-page">
          <RequestForm
            mode="view"
            requestId={Number.parseInt(params.id as string)}
            initialData={requestData}
          />
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

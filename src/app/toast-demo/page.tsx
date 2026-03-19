"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ToastDemoPageProps {
  isTesting?: boolean;
}

export default function ToastDemoPage({ isTesting = false }: ToastDemoPageProps = {}) {
  const { toast } = useToast();

  useEffect(() => {
    if (isTesting) {
      showSuccessToast();
      showErrorToast();
      showWarningToast();
      showInfoToast();
    }
  }, [isTesting]);

  const showSuccessToast = () => {
    toast({
      title: "Success!",
      description: "Your operation completed successfully.",
      variant: "success",
    });
  };

  const showErrorToast = () => {
    toast({
      title: "Error!",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    });
  };

  const showWarningToast = () => {
    toast({
      title: "Warning!",
      description: "Please check your input and proceed with caution.",
      variant: "warning",
    });
  };

  const showInfoToast = () => {
    toast({
      title: "Information",
      description: "Here's some helpful information for you.",
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8" data-testid="toast-demo-page">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Toast UI Demo</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Different Toast Variants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                onClick={showSuccessToast}
                className="bg-green-600 hover:bg-green-700 text-white"
                data-testid="success-toast-button"
              >
                Show Success Toast
              </Button>
              
              <Button 
                onClick={showErrorToast}
                className="bg-red-600 hover:bg-red-700 text-white"
                data-testid="error-toast-button"
              >
                Show Error Toast
              </Button>
              
              <Button 
                onClick={showWarningToast}
                className="bg-amber-600 hover:bg-amber-700 text-white"
                data-testid="warning-toast-button"
              >
                Show Warning Toast
              </Button>
              
              <Button 
                onClick={showInfoToast}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                data-testid="info-toast-button"
              >
                Show Info Toast
              </Button>
            </div>
            
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold">Toast Variants:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><strong>Success:</strong> Green theme with check circle icon for successful operations</li>
                <li><strong>Error (Destructive):</strong> Red theme with X circle icon for errors and failures</li>
                <li><strong>Warning:</strong> Amber theme with triangle icon for warnings and cautions</li>
                <li><strong>Info (Default):</strong> Blue theme with info circle icon for general information</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
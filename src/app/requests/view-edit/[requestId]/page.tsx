'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import ViewEditApprovalForm from '@/components/approvals/view-edit-approval-form';
import { approvalsService } from '@/services/approvals-service';
import { logger } from '@/utils/logger';

export default function ViewEditApprovalPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [approvalData, setApprovalData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPoApproval, setIsPoApproval] = useState(false);

  useEffect(() => {
    const fetchApprovalData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const requestId = Number.parseInt(params.requestId as string);
        
        if (Number.isNaN(requestId)) {
          throw new TypeError('Invalid request ID');
        }

        // Check URL params to determine which API to call
        const hasPoGenerated = searchParams.get('hasPoGenerated') === 'true';
        setIsPoApproval(hasPoGenerated);

        if (hasPoGenerated) {
          // Call PO approval API
          logger.info('Fetching PO approval data for ID:', { requestId });
          const response = await approvalsService.getPoApproval(requestId);
          logger.info('PO approval data received:', { response });
          setApprovalData(response);
        } else {
          // Call regular context API
          logger.info('Fetching approval context for ID:', { requestId });
          const response = await approvalsService.getApprovalContext(requestId);
          logger.info('Approval context received:', { response });
          setApprovalData(response);
        }

      } catch (err: any) {
        logger.error('Error fetching approval data:', err);
        const errorMessage = err.message || 'Failed to load approval data';
        setError(errorMessage);
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovalData();
  }, [params.requestId, searchParams, toast]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-vendor-600" />
              <p className="text-gray-600">Loading approval details...</p>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (error || !approvalData) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="text-red-500 font-medium">Failed to load approval</div>
              <p className="text-gray-600">{error || 'Approval not found'}</p>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="p-6">
          <ViewEditApprovalForm 
            requestId={Number.parseInt(params.requestId as string)} 
            initialData={approvalData}
            isPoApproval={isPoApproval}
          />
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

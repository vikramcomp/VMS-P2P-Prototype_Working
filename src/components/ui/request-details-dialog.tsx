'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RequestDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  requestData: {
    // Request Details
    requestNumber?: string;
    requestGroup?: string;
    projectProposal?: string;
    request?: string;
    description?: string;
    service?: string;
    status?: string;
    requesterName?: string;
    
    // Additional fields
    requestType?: string;
    subgroup?: string;
    serviceDetails?: string;
    requestDate?: string;
    
    // Quotation Details
    vendorManager?: string;
    approvedVendor?: string;
    quotationStatus?: string;
    dateSubmitted?: string;
    contactPerson?: string;
    approvedQuotationAmount?: string;
    approvedVendorEmail?: string;
    approvedVendorMobile?: string;
    
    // Request Approval Details
    approver1?: string;
    approverStatus?: string;
    approverComments?: string;
    
    // PO Details
    poNumber?: string;
    poType?: string;
    poCreatedBy?: string;
    poDate?: string;
    poAmount?: string;
    poApprovedBy?: string;
    poDateSubmitted?: string;
    poApprovedDate?: string;
  };
}

export function RequestDetailsDialog({ isOpen, onClose, requestData }: RequestDetailsDialogProps) {
  if (!isOpen) return null;

  const DetailRow = ({ label, value }: { label: string; value?: string }) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <div className="text-sm text-gray-900">{value || '-'}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50 py-4">
          <CardTitle className="text-xl font-semibold text-gray-900">
           <p className='text-xl font-medium'>Request Details</p> 
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {/* Request Details Section */}
          <div className="mb-6">
            <p className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">
              Request Information
            </p>
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              <DetailRow label="Request Number:" value={requestData.requestNumber} />
              <DetailRow label="Request Type:" value={requestData.requestType} />
              <DetailRow label="Request Group:" value={requestData.requestGroup} />
              <DetailRow label="Subgroup:" value={requestData.subgroup} />
              <DetailRow label="Project/Proposal:" value={requestData.projectProposal} />
              <DetailRow label="Request:" value={requestData.request} />
              <DetailRow label="Description:" value={requestData.description} />
              <DetailRow label="Service:" value={requestData.service} />
              <DetailRow label="Service Details:" value={requestData.serviceDetails} />
              <DetailRow label="Status:" value={requestData.status} />
              <DetailRow label="Request Date:" value={requestData.requestDate} />
              <DetailRow label="Requester Name:" value={requestData.requesterName} />
            </div>
          </div>

          {/* Quotation Details Section */}
          <div className="mb-6">
            <p className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">
              Quotation Details
            </p>
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              <DetailRow label="Vendor Manager:" value={requestData.vendorManager} />
              <DetailRow label="Status:" value={requestData.quotationStatus} />
              <DetailRow label="Date Submitted:" value={requestData.dateSubmitted} />
              <DetailRow label="Approved Vendor:" value={requestData.approvedVendor} />
              <DetailRow label="Approved Vendor Email:" value={requestData.approvedVendorEmail} />
              <DetailRow label="Approved Vendor Mobile:" value={requestData.approvedVendorMobile} />
              <DetailRow label="Contact Person:" value={requestData.contactPerson} />
              <DetailRow label="Approved Quotation Amount:" value={requestData.approvedQuotationAmount} />
            </div>
          </div>

          {/* Request Approval Details Section */}
          <div className="mb-6">
            <p className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">
              Request Approval Details
            </p>
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              <DetailRow label="Approver 1:" value={requestData.approver1} />
              <DetailRow label="Status:" value={requestData.approverStatus} />
              <DetailRow label="Comments:" value={requestData.approverComments} />
            </div>
          </div>

          {/* PO Details Section */}
          <div>
            <p className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">
              PO Details
            </p>
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              <DetailRow label="PO #:" value={requestData.poNumber} />
              <DetailRow label="PO Date:" value={requestData.poDate} />
              <DetailRow label="PO Type:" value={requestData.poType} />
              <DetailRow label="PO Amount:" value={requestData.poAmount} />
              <DetailRow label="PO Created By:" value={requestData.poCreatedBy} />
              <DetailRow label="Date Submitted:" value={requestData.poDateSubmitted} />
              <DetailRow label="PO Approved By:" value={requestData.poApprovedBy} />
              <DetailRow label="PO Approved Date:" value={requestData.poApprovedDate} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

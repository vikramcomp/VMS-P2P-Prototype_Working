'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface RequestDetailsData {
  // Request Details
  requestNumber?: string;
  requestType?: string;
  requestGroup?: string;
  subgroup?: string;
  request?: string;
  description?: string;
  service?: string;
  serviceDetails?: string;
  status?: string;
  requestDate?: string;
  requesterName?: string;

  // Quotation Details
  vendorManager?: string;
  approvedVendor?: string;
  contactPerson?: string;
  quotationStatus?: string;
  dateSubmitted?: string;
  approvedQuotationAmount?: string;

  // Request Approval Details
  approver1?: string;
  approver1Status?: string;
  approver1Comments?: string;

  // PO Details
  poNumber?: string;
  poType?: string;
  poDate?: string;
  poAmount?: string;
  poCreatedBy?: string;
  poApprovedBy?: string;
  poApprovedDate?: string;
}

interface InvoiceRequestDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  requestData: RequestDetailsData;
}

export function InvoiceRequestDetailsDialog({ isOpen, onClose, requestData }: InvoiceRequestDetailsDialogProps) {
  if (!isOpen) return null;

  const renderField = (label: string, value: string | undefined) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
        {value || '-'}
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
          onClick={onClose}
        />
        
        {/* Dialog */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h3 className="text-xl font-semibold text-gray-900">Request Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Request Information Section */}
            <div>
              <p className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 bg-gray-50 px-3 py-2">
                Request Information
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderField('Request Number:', requestData.requestNumber)}
                {renderField('Request Type:', requestData.requestType)}
                {renderField('Request Group:', requestData.requestGroup)}
                {renderField('Subgroup:', requestData.subgroup)}
                {renderField('Request:', requestData.request)}
                {renderField('Description:', requestData.description)}
                {renderField('Service:', requestData.service)}
                {renderField('Service Details:', requestData.serviceDetails)}
                {renderField('Status:', requestData.status)}
                {renderField('Request Date:', requestData.requestDate)}
                {renderField('Requester Name:', requestData.requesterName)}
              </div>
            </div>

            {/* Quotation Details Section */}
            <div>
              <p className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 bg-gray-50 px-3 py-2">
                Quotation Details
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderField('Vendor Manager:', requestData.vendorManager)}
                {renderField('Approved Vendor:', requestData.approvedVendor)}
                {renderField('Contact Person:', requestData.contactPerson)}
                {renderField('Status:', requestData.quotationStatus)}
                {renderField('Date Submitted:', requestData.dateSubmitted)}
                {renderField('Approved Quotation Amount:', requestData.approvedQuotationAmount)}
              </div>
            </div>

            {/* Request Approval Details Section */}
            <div>
              <p className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 bg-gray-50 px-3 py-2">
                Request Approval Details
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderField('Approver1:', requestData.approver1)}
                {renderField('Status:', requestData.approver1Status)}
                {renderField('Comments:', requestData.approver1Comments)}
              </div>
            </div>

            {/* PO Details Section */}
            <div>
              <p className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 bg-gray-50 px-3 py-2">
                PO Details
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderField('PO #:', requestData.poNumber)}
                {renderField('PO Type:', requestData.poType)}
                {renderField('PO Date:', requestData.poDate)}
                {renderField('PO Amount:', requestData.poAmount)}
                {renderField('PO Created By:', requestData.poCreatedBy)}
                {renderField('PO Approved By:', requestData.poApprovedBy)}
                {renderField('PO Approved Date:', requestData.poApprovedDate)}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

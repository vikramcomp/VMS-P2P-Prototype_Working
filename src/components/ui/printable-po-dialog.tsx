'use client';

import React, { useRef } from 'react';
import { X, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrintablePODialogProps {
  isOpen: boolean;
  onClose: () => void;
  poData: {
    poNumber: string;
    requestNumber: string;
    requestDesc: string;
    poRequestRaisedDate: string;
    vendor: string;
    poReleasedDate: string;
    projectCode: string;
    currency: string;
    poTotalAmount: string | number;
    invoicedAmount: string | number;
    poBalanceAmount: string | number;
    status: string;
  } | null;
}

export function PrintablePODialog({ isOpen, onClose, poData }: PrintablePODialogProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const content = printRef.current.innerHTML;
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print PO - ${poData?.poNumber || 'N/A'}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: Arial, sans-serif; 
                  padding: 20mm;
                  font-size: 12pt;
                  line-height: 1.6;
                }
                .print-header {
                  text-align: center;
                  margin-bottom: 30px;
                  border-bottom: 3px solid #2563eb;
                  padding-bottom: 20px;
                }
                .print-header h1 {
                  font-size: 28pt;
                  color: #1e40af;
                  margin-bottom: 10px;
                }
                .print-header h2 {
                  font-size: 18pt;
                  color: #64748b;
                  font-weight: normal;
                }
                .section {
                  margin-bottom: 30px;
                }
                .section-title {
                  font-size: 16pt;
                  font-weight: bold;
                  color: #1e40af;
                  margin-bottom: 15px;
                  padding-bottom: 5px;
                  border-bottom: 2px solid #e2e8f0;
                }
                .info-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 15px 30px;
                }
                .info-row {
                  display: flex;
                  padding: 8px 0;
                }
                .info-label {
                  font-weight: bold;
                  color: #475569;
                  min-width: 180px;
                  flex-shrink: 0;
                }
                .info-value {
                  color: #1e293b;
                }
                .amount-section {
                  background-color: #f8fafc;
                  padding: 20px;
                  border-radius: 8px;
                  margin-top: 20px;
                }
                .amount-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 10px 0;
                  font-size: 14pt;
                }
                .amount-row.total {
                  border-top: 2px solid #cbd5e1;
                  margin-top: 10px;
                  padding-top: 15px;
                  font-weight: bold;
                  font-size: 16pt;
                  color: #1e40af;
                }
                .status-badge {
                  display: inline-block;
                  padding: 6px 16px;
                  border-radius: 20px;
                  font-weight: 600;
                  font-size: 11pt;
                }
                .status-under-execution {
                  background-color: #fef3c7;
                  color: #92400e;
                  border: 2px solid #fbbf24;
                }
                .status-completed {
                  background-color: #d1fae5;
                  color: #065f46;
                  border: 2px solid #10b981;
                }
                .status-default {
                  background-color: #f1f5f9;
                  color: #475569;
                  border: 2px solid #cbd5e1;
                }
                .print-footer {
                  margin-top: 50px;
                  padding-top: 20px;
                  border-top: 2px solid #e2e8f0;
                  text-align: center;
                  color: #64748b;
                  font-size: 10pt;
                }
                @media print {
                  body { padding: 10mm; }
                  .no-print { display: none !important; }
                }
              </style>
            </head>
            <body>
              ${content}
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  if (!poData) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatAmount = (amount: string | number) => {
    if (!amount || amount === '') return '0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toFixed(2);
  };

  const getStatusClass = (status: string) => {
    if (status === 'Under Execution') return 'status-under-execution';
    if (status === 'Completed') return 'status-completed';
    return 'status-default';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Dialog Header with Print Button */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between no-print">
          <h2 className="text-xl font-semibold text-gray-900">Print Purchase Order</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div ref={printRef} className="bg-white p-6">
          {/* Header */}
          <div className="print-header">
            <h1>Purchase Order</h1>
            <h2>PO # {poData.poNumber || 'N/A'}</h2>
          </div>

          {/* PO Information Section */}
          <div className="section">
            <div className="section-title">Purchase Order Information</div>
            <div className="info-grid">
              <div className="info-row">
                <span className="info-label">PO Number:</span>
                <span className="info-value">{poData.poNumber || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Request Number:</span>
                <span className="info-value">{poData.requestNumber || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">PO Raised Date:</span>
                <span className="info-value">{formatDate(poData.poRequestRaisedDate)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">PO Released Date:</span>
                <span className="info-value">{formatDate(poData.poReleasedDate)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Status:</span>
                <span className="info-value">
                  <span className={`status-badge ${getStatusClass(poData.status)}`}>
                    {poData.status || 'N/A'}
                  </span>
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Project Code:</span>
                <span className="info-value">{poData.projectCode || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Vendor Information Section */}
          <div className="section">
            <div className="section-title">Vendor Information</div>
            <div className="info-grid">
              <div className="info-row">
                <span className="info-label">Vendor Name:</span>
                <span className="info-value">{poData.vendor || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Request Details Section */}
          <div className="section">
            <div className="section-title">Request Details</div>
            <div className="info-row">
              <span className="info-label">Description:</span>
              <span className="info-value">{poData.requestDesc || 'N/A'}</span>
            </div>
          </div>

          {/* Financial Information Section */}
          <div className="section">
            <div className="section-title">Financial Summary</div>
            <div className="amount-section">
              <div className="amount-row">
                <span>Currency:</span>
                <span>{poData.currency || 'USD'}</span>
              </div>
              <div className="amount-row">
                <span>PO Total Amount:</span>
                <span>{poData.currency || 'USD'} {formatAmount(poData.poTotalAmount)}</span>
              </div>
              <div className="amount-row">
                <span>Invoiced Amount:</span>
                <span>{poData.currency || 'USD'} {formatAmount(poData.invoicedAmount)}</span>
              </div>
              <div className="amount-row total">
                <span>PO Balance Amount:</span>
                <span>{poData.currency || 'USD'} {formatAmount(poData.poBalanceAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="print-footer">
            <p>This is a computer-generated document. No signature is required.</p>
            <p>Printed on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

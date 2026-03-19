import React from 'react';
import { X } from 'lucide-react';

interface InvoiceDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: any;
}

export function InvoiceDetailsDialog({ isOpen, onClose, invoiceData }: InvoiceDetailsDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Invoice Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* PO Information Section */}
          <div>
            <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
              PO Information
            </h5>
            <div className="grid grid-cols-4 gap-x-6 gap-y-4">
              <div>
                <p className="text-sm font-medium">PO Number:</p>
                <p className="text-sm text-gray-900 mt-1">{invoiceData.poNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">PO Amount:</p>
                <p className="text-sm text-gray-900 mt-1">
                  {invoiceData.currency && invoiceData.poAmount 
                    ? `${invoiceData.currency} ${Number(invoiceData.poAmount).toFixed(2)}` 
                    : invoiceData.poAmount || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Invoice Amt. Submitted:</p>
                <p className="text-sm text-gray-900 mt-1">
                  {invoiceData.currency && invoiceData.invoiceAmtSubmitted 
                    ? `${invoiceData.currency} ${Number(invoiceData.invoiceAmtSubmitted).toFixed(2)}` 
                    : invoiceData.invoiceAmtSubmitted || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">PO Balance:</p>
                <p className="text-sm text-gray-900 mt-1">
                  {invoiceData.currency && invoiceData.poBalance !== undefined
                    ? `${invoiceData.currency} ${Number(invoiceData.poBalance).toFixed(2)}` 
                    : invoiceData.poBalance || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Details Table Section */}
          <div>
            <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
              Invoice Details
            </h5>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium border-r">
                      Invoice #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium border-r">
                      Transaction Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium border-r">
                      Net Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium border-r">
                      Document
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium border-r">
                      Submission Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium border-r">
                      Invoice Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium">
                      Invoice Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoiceData.invoices && invoiceData.invoices.length > 0 ? (
                    invoiceData.invoices.map((invoice: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 border-r">
                          {invoice.invoiceNumber || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-r">
                          {invoice.transactionType || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-r">
                          {invoiceData.currency && invoice.netAmount !== undefined
                            ? `${invoiceData.currency} ${Number(invoice.netAmount).toFixed(2)}`
                            : invoice.netAmount || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm border-r">
                          {invoice.documentUrl ? (
                            <a
                              href={invoice.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {invoice.documentName || 'View Document'}
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-r">
                          {invoice.submissionDate || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-r">
                          {invoice.invoiceDate || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            invoice.invoiceStatus === 'Submitted'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : invoice.invoiceStatus === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              : invoice.invoiceStatus === 'Approved'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : invoice.invoiceStatus === 'Rejected'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {invoice.invoiceStatus || '-'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                        No invoice details available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

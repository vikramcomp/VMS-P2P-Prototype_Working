'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, CheckCircle, XCircle, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { envConfig } from '@/config/env-validation';

interface InvoiceApprovalData {
  id: number;
  requestId: number;
  requestNumber: string;
  poNumber: string;
  invoiceNumber: string;
  totalInvoicedAmount: number;
  poBalance: number;
  poType: string;
  transactionType: string;
  invoiceDate: string;
  submissionDate: string;
  currentInvoiceAmount: number;
  poAmount: number;
  vendorName: string;
  workflow: string;
  comments: string;
  attachedTimeSheet: string;
  status: string;
  priceUnit: string;
  advancePayments: any[];
  approvedComments: any[];
  commentsHistoryItems: any[];
  workflowList: any[];
}

interface ViewEditInvoiceApprovalProps {
  mode: 'view' | 'edit';
}

export default function ViewEditInvoiceApproval({ mode }: ViewEditInvoiceApprovalProps) {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const invoiceBillAdvPaymentId = params.id as string;
  // const approverType = params.approverType as string;
  const searchParams = useSearchParams();
  const approverType = searchParams.get('approverType');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<InvoiceApprovalData | null>(null);
  const [comments, setComments] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workflow, setWorkflow] = useState('');
  // ApproverType: Approver1, Approver2, Approver3, Approver5, Approver6, FinanceHead
  // const [approverType, setApproverType] = useState<string>('Approver1');
console.log("VVVVVVV", approverType, params)
  const isEditMode = mode === 'edit';

  useEffect(() => {
    fetchInvoiceApprovalData();
  }, [invoiceBillAdvPaymentId, approverType]);

  const fetchInvoiceApprovalData = async () => {
    setLoading(true);
    try {
      // Fetch detailed information using invoiceBillAdvPaymentId and approverType
      const response = await fetch(
        `${envConfig.apiBaseUrl}/invoice-approvals/${invoiceBillAdvPaymentId}?approverType=${approverType}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',            
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch invoice approval details');
      }

      const result = await response.json();
      console.log('Invoice Approval Details API Response:', result);

      // Extract invoice object from the API response
      // Based on actual API structure: {invoice: {...}, approvedComments: [...], commentsHistoryItems: [...], advancePayments: [...], workflowList: [...]}
      const invoice = result.invoice || result.Invoice || {};
      
      console.log('Full Invoice Object:', invoice);
      
      // Check multiple possible locations for po object
      const po = invoice.po || invoice.Po || invoice.PO || result.po || result.Po || result.PO || {};
      
      console.log('Invoice keys:', Object.keys(invoice));
      console.log('Result keys:', Object.keys(result));
      
      const approvedComments = result.approvedComments || result.ApprovedComments || [];
      const commentsHistory = result.commentsHistoryItems || result.CommentsHistoryItems || [];
      const advancePayments = result.advancePayments || result.AdvancePayments || [];
      const workflowList = result.workflowList || result.WorkflowList || [];

      console.log('Extracted PO Object:', po);
      console.log('PO Number from po:', po.poNumber);
      console.log('PO Number from invoice:', invoice.poNumber);
      console.log('PO Amount from po:', po.poAmount);
      console.log('PO Amount from invoice:', invoice.poAmount);
      console.log('Vendor Name from po:', po.vendorName);
      console.log('Vendor Name from invoice:', invoice.vendorName);

      const invoiceData: InvoiceApprovalData = {
        id: invoice.invoiceBillAdvPaymentId || invoice.InvoiceBillAdvPaymentId || parseInt(invoiceBillAdvPaymentId) || 0,
        requestId: invoice.requestId || invoice.RequestId || parseInt(invoiceBillAdvPaymentId) || 0,
        requestNumber: invoice.requestNumber || invoice.RequestNumber || invoice.requestNo || '',
        poNumber: po.poNumber || invoice.poNumber || invoice.PONumber || '',
        invoiceNumber: invoice.invoiceBillNo || invoice.InvoiceBillNo || invoice.invoiceNumber || '',
        totalInvoicedAmount: parseFloat(po.totalInvoicedAmount || invoice.totalInvoicedAmount || invoice.TotalInvoicedAmount || '0'),
        poBalance: parseFloat(po.poBalance || invoice.poBalance || invoice.POBalance || '0'),
        poType: po.poTypeName || invoice.poTypeName || invoice.POTypeName || '',
        transactionType: invoice.transactionTypeName || invoice.TransactionTypeName || invoice.transactionType || invoice.TransactionType || '',
        invoiceDate: invoice.invoiceDate || invoice.InvoiceDate || '',
        submissionDate: invoice.submissionDate || invoice.SubmissionDate || invoice.submittedDate || '',
        currentInvoiceAmount: parseFloat(po.currentInvoiceAmount || invoice.currentInvoiceAmount || invoice.CurrentInvoiceAmount || '0'),
        poAmount: parseFloat(po.poAmount || invoice.poAmount || invoice.POAmount || '0'),
        vendorName: po.vendorName || invoice.vendorName || invoice.VendorName || '',
        workflow: invoice.workflow || invoice.Workflow || invoice.workflowStatus || '',
        comments: invoice.comments || invoice.Comments || approvedComments[0]?.comment || '',
        attachedTimeSheet: invoice.fileOriginalName || invoice.FileOriginalName || invoice.attachedTimeSheet || '',
        status: invoice.status || invoice.Status || invoice.invoiceApprovalStatus || '',
        priceUnit: po.priceUnit || invoice.priceUnit || invoice.PriceUnit || '',
        advancePayments: advancePayments,
        approvedComments: approvedComments,
        commentsHistoryItems: commentsHistory,
        workflowList: workflowList,
      };

      console.log('Mapped Invoice Data:', invoiceData);

      setData(invoiceData);
      // Comments field should be blank on page load - user enters their own comments
      setWorkflow(invoiceData.workflow);
    } catch (error) {
      console.error('Error fetching invoice approval:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invoice approval details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleApprove = async () => {
    if (!data) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('Comments', comments || '');
      formData.append('WorkflowId', workflow || '0');
      
      if (selectedFile) {
        formData.append('TimesheetFile', selectedFile);
      }

      const response = await fetch(
        `${envConfig.apiBaseUrl}/invoice-approvals/${invoiceBillAdvPaymentId}/action?action=1&approverType=${approverType}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        let errorMessage = 'Failed to approve invoice';
        
        // Extract error message from API response
        if (errorData) {
          if (errorData.title) {
            errorMessage = errorData.title;
          }
          if (errorData.errors) {
            const errorMessages = Object.values(errorData.errors).flat();
            if (errorMessages.length > 0) {
              errorMessage = errorMessages.join(', ');
            }
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        }
        
        throw new Error(errorMessage);
      }

      const successData = await response.json().catch(() => null);
      const successMessage = successData?.message || 'Invoice approved successfully';

      toast({
        title: 'Success',
        description: successMessage,
        variant: 'success',
      });

      router.push('/invoice-approvals');
    } catch (error: any) {
      console.error('Error approving invoice:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve invoice',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!data) return;

    if (!comments.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide comments for rejection',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('Comments', comments || '');
      formData.append('WorkflowId', '0');

      const response = await fetch(
        `${envConfig.apiBaseUrl}/invoice-approvals/${invoiceBillAdvPaymentId}/action?action=2&approverType=${approverType}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        let errorMessage = 'Failed to reject invoice';
        
        // Extract error message from API response
        if (errorData) {
          if (errorData.title) {
            errorMessage = errorData.title;
          }
          if (errorData.errors) {
            const errorMessages = Object.values(errorData.errors).flat();
            if (errorMessages.length > 0) {
              errorMessage = errorMessages.join(', ');
            }
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        }
        
        throw new Error(errorMessage);
      }

      const successData = await response.json().catch(() => null);
      const successMessage = successData?.message || 'Invoice rejected successfully';

      toast({
        title: 'Success',
        description: successMessage,
        variant: 'success',
      });

      router.push('/invoice-approvals');
    } catch (error: any) {
      console.error('Error rejecting invoice:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject invoice',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadTimesheet = () => {
    if (data?.attachedTimeSheet) {
      window.open(data.attachedTimeSheet, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-vendor-600" />
          <span className="text-gray-600">Loading invoice approval details...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Invoice approval not found</p>
          <Button onClick={() => router.push('/invoice-approvals')}>
            Back to Invoice Approvals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/invoice-approvals')}
            className="gap-0 px-2"
          >
            <ArrowLeft className="h-4 w-4" />
            
          </Button>
          <h3 className="text-lg font-semibold">
            {isEditMode ? 'Review & Approve Invoices' : 'View Invoice Approval'}
          </h3>
        </div>
        {!isEditMode && data.status === 'Pending Approval' && (
          <Button
            onClick={() => router.push(`/invoice-approvals/${invoiceBillAdvPaymentId}/edit`)}
            variant="outline"
          >
            Edit
          </Button>
        )}
      </div>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <h4 className="text-lg font-medium text-gray-900">Invoice Approval Details</h4>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Row 1: PO #, PO Amount, Vendor Name */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PO #
                </label>
                <Input
                  type="text"
                  value={data.poNumber}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PO Amount
                </label>
                <Input
                  type="text"
                  value={`${data.poAmount.toFixed(2)}`}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Name
                </label>
                <Input
                  type="text"
                  value={data.vendorName}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>

            {/* Row 2: Total Invoiced Amount, PO Balance, PO Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Invoiced Amount
                </label>
                <Input
                  type="text"
                  value={data.totalInvoicedAmount.toFixed(2)}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PO Balance
                </label>
                <Input
                  type="text"
                  value={data.poBalance.toFixed(2)}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PO Type
                </label>
                <Input
                  type="text"
                  value={data.poType}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>

            {/* Row 3: Transaction Type, Submission Date, Invoice # */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type
                </label>
                <Input
                  type="text"
                  value={data.transactionType}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submission Date
                </label>
                <Input
                  type="text"
                  value={data.submissionDate}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice #
                </label>
                <Input
                  type="text"
                  value={data.invoiceNumber}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>

            {/* Row 4: Invoice Date, Current Invoice Amount, Workflow (conditionally shown) */}
            <div className={`grid grid-cols-1 gap-4 ${approverType === 'Approver1' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Date
                </label>
                <Input
                  type="text"
                  value={data.invoiceDate}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Invoice Amount
                </label>
                <Input
                  type="text"
                  value={data.currentInvoiceAmount.toFixed(2)}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              {approverType === 'Approver1' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workflow
                  </label>
                  {isEditMode ? (
                    <select
                      value={workflow}
                      onChange={(e) => setWorkflow(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500"
                    >
                      <option value="">--Select--</option>
                      {data.workflowList && data.workflowList.length > 0 ? (
                        data.workflowList.map((wf: any, index: number) => (
                          <option key={index} value={wf.invoiceWorkflowId || wf.InvoiceWorkflowId || wf.id}>
                            {wf.invoiceWorkflowName || wf.InvoiceWorkflowName || wf.name || wf.Name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Standard">Standard</option>
                          <option value="Express">Express</option>
                          <option value="Emergency">Emergency</option>
                        </>
                      )}
                    </select>
                  ) : (
                    <Input
                      type="text"
                      value={data.workflow || '--Select--'}
                      readOnly
                      className="bg-gray-50"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Row 5: Attached TimeSheet (conditionally shown for Approver1 only) */}
            {approverType === 'Approver1' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attached TimeSheet
                </label>
                {isEditMode ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-vendor-50 file:text-vendor-700
                        hover:file:bg-vendor-100"
                    />
                    {selectedFile && (
                      <span className="text-sm text-gray-600">
                        {selectedFile.name}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={data.attachedTimeSheet || 'No file attached'}
                      readOnly
                      className="bg-gray-50"
                    />
                    {data.attachedTimeSheet && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadTimesheet}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Row 6: Comments (spans 3 columns) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments
              </label>
              {isEditMode ? (
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500"
                  placeholder="Enter your comments..."
                />
              ) : (
                <textarea
                  value={data.comments}
                  readOnly
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              )}
            </div>

            {/* Comment History Section - Only visible if NOT Approver1 */}
            {approverType !== 'Approver1' && data.approvedComments && data.approvedComments.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900">Comment History</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                          Comment
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                          Approver Name
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.approvedComments.map((comment: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                            {comment.comment || comment.Comment || comment.comments || ''}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                            {comment.approverName || comment.ApproverName || comment.userName || ''}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                            {comment.approverDate || comment.ApproverDate || comment.date || ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action Buttons (Edit Mode Only) */}
            {isEditMode && (
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  className="text-xs gap-2 cus-secondary-reset-btn"
                  onClick={() => router.push('/invoice-approvals')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="text-xs gap-2 cus-secondary-reset-btn"
                  onClick={handleReject}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      {/* <XCircle className="h-4 w-4" /> */}
                      Reject
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="gap-2 text-xs font-normal bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      {/* <CheckCircle className="h-4 w-4" /> */}
                      Approve
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

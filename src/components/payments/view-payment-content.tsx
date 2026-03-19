'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip } from '@/components/ui/tooltip';
import { Loader2, ArrowLeft, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { envConfig } from '@/config/env-validation';

interface InvoiceDetails {
  invoiceAmount: number;
  invoiceDate: string;
  amountPaid: number;
  purchaseOrderTotal: number;
  vendorName: string;
  invoiceLabel?: string;
  invoiceNumber?: string;
  currency?: string;
  fullyPaid: boolean;
  invoiceBillAdvPaymentId: number;
}

interface PaymentListing {
  paymentId: number;
  paymentMode: number;
  paymentModeName: string;
  reference: string;
  amount: number;
  fileOriginalName: string;
  fileStoredName: string;
  paymentDate: string;
  status: number;
  statusName: string;
}

interface CurrentPayment {
  paymentId: number;
  purchaseOrderId: number;
  requestId: number;
  categoryId: number;
  invoiceBillAdvPaymentId: number;
  paymentMode: number;
  paymentModeName: string;
  reference: string;
  paymentDate: string;
  amount: number;
  status: number;
  statusName: string;
  comments: string;
  fileOriginalName: string;
  fileStoredName: string;
}

interface ViewPaymentContentProps {
  invoiceBillAdvPaymentId: number;
}

export default function ViewPaymentContent({ invoiceBillAdvPaymentId }: ViewPaymentContentProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  // Payment modes dropdown state
  const [paymentModes, setPaymentModes] = useState<Array<{ id: number | string; name: string }>>([]);
  const [loadingPaymentModes, setLoadingPaymentModes] = useState(false);

  // Payments listing state
  const [paymentsListing, setPaymentsListing] = useState<PaymentListing[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Form states for user input fields
  const [paymentMode, setPaymentMode] = useState('');
  const [chequeNumber, setChequeNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [amount, setAmount] = useState('');
  const [comments, setComments] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<CurrentPayment | null>(null);
  const [loadingPaymentDetails, setLoadingPaymentDetails] = useState(false);
  const [modalPaymentMode, setModalPaymentMode] = useState('');
  const [modalReference, setModalReference] = useState('');
  const [modalPaymentDate, setModalPaymentDate] = useState('');
  const [modalAmount, setModalAmount] = useState('');
  const [modalComments, setModalComments] = useState('');
  const [modalUploadedFile, setModalUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchInvoiceDetails();
    fetchPaymentModes();
    fetchPayments();
  }, [invoiceBillAdvPaymentId]);

  const fetchInvoiceDetails = async () => {
    setLoadingInvoice(true);
    try {
      const response = await fetch(
        `${envConfig.apiBaseUrl}/payments/context/${invoiceBillAdvPaymentId}`
      );

      if (response.ok) {
        const data = await response.json();
        
        // Format invoice date to MM/DD/YYYY
        const formatDate = (dateStr: string) => {
          if (!dateStr) return '';
          try {
            const date = new Date(dateStr);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const year = date.getFullYear();
            return `${month}/${day}/${year}`;
          } catch {
            return dateStr;
          }
        };

        setInvoiceDetails({
          invoiceAmount: parseFloat(data.invoiceAmount || 0),
          invoiceDate: formatDate(data.invoiceDate),
          amountPaid: parseFloat(data.amountPaid || 0),
          purchaseOrderTotal: parseFloat(data.purchaseOrderTotal || 0),
          vendorName: data.vendorName || '',
          invoiceLabel: data.invoiceLabel || '',
          invoiceNumber: data.invoiceNumber || '',
          currency: data.currency || '$',
          fullyPaid: data.fullyPaid || false,
          invoiceBillAdvPaymentId: data.invoiceBillAdvPaymentId || invoiceBillAdvPaymentId
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load invoice details',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invoice details',
        variant: 'destructive',
      });
    } finally {
      setLoadingInvoice(false);
    }
  };

  const fetchPaymentModes = async () => {
    setLoadingPaymentModes(true);
    try {
      const response = await fetch(
        `${envConfig.apiBaseUrl}/payments/payment-modes`
      );

      if (response.ok) {
        const data = await response.json();
        const modes = (data.items || data || []).map((item: any) => ({
          id: item.id || item.value || item.paymentModeId,
          name: item.name || item.text || item.paymentModeName || ''
        }));
        setPaymentModes(modes);
      } else {
        console.error('Failed to fetch payment modes');
      }
    } catch (error) {
      console.error('Error fetching payment modes:', error);
    } finally {
      setLoadingPaymentModes(false);
    }
  };

  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      const response = await fetch(
        `${envConfig.apiBaseUrl}/payments/context/${invoiceBillAdvPaymentId}`
      );

      if (response.ok) {
        const data = await response.json();
        const payments = data.payments || [];
        setPaymentsListing(payments);
      } else {
        console.error('Failed to fetch payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchPaymentDetails = async (paymentId: number) => {
    setLoadingPaymentDetails(true);
    try {
      const response = await fetch(
        `${envConfig.apiBaseUrl}/payments/context/${invoiceBillAdvPaymentId}?paymentId=${paymentId}`
      );

      if (response.ok) {
        const data = await response.json();
        const payment = data.currentPayment;
        setSelectedPayment(payment);
        // Find the matching payment mode name by ID for reliable dropdown matching
        const paymentModeId = payment.paymentMode || payment.PaymentMode;
        const matchedMode = paymentModes.find(mode => mode.id === paymentModeId || mode.id?.toString() === paymentModeId?.toString());
        setModalPaymentMode(matchedMode?.name || payment.paymentModeName || payment.PaymentModeName || '');
        setModalReference(payment.reference || payment.Reference || '');
        setModalPaymentDate(payment.paymentDate || payment.PaymentDate || '');
        setModalAmount(payment.amount?.toString() || payment.Amount?.toString() || '');
        setModalComments(payment.comments || payment.Comments || '');
        setIsModalOpen(true);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load payment details',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment details',
        variant: 'destructive',
      });
    } finally {
      setLoadingPaymentDetails(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
    setModalPaymentMode('');
    setModalReference('');
    setModalPaymentDate('');
    setModalAmount('');
    setModalComments('');
    setModalUploadedFile(null);
  };

  const handleModalSave = async () => {
    if (!selectedPayment) return;

    // Validation
    if (!modalPaymentMode) {
      toast({
        title: 'Validation Error',
        description: 'Payment Mode is required',
        variant: 'destructive',
      });
      return;
    }

    if ((modalPaymentMode === 'Cheque' || modalPaymentMode === 'Bank Draft' || modalPaymentMode === 'PayPal' || modalPaymentMode === 'Direct Transfer') && !modalReference) {
      toast({
        title: 'Validation Error',
        description: `${(modalPaymentMode === 'Cheque' || modalPaymentMode === 'Bank Draft') ? 'Cheque/DD No.' : 'Transaction Id'} is required`,
        variant: 'destructive',
      });
      return;
    }

    if (!modalPaymentDate) {
      toast({
        title: 'Validation Error',
        description: 'Date is required',
        variant: 'destructive',
      });
      return;
    }

    if (!modalAmount || parseFloat(modalAmount) <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Valid Amount is required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Find payment mode ID
      const selectedMode = paymentModes.find(mode => mode.name === modalPaymentMode);
      if (!selectedMode) {
        throw new Error('Invalid payment mode selected');
      }

      const formData = new FormData();
      formData.append('InvoiceBillAdvPaymentId', invoiceBillAdvPaymentId.toString());
      formData.append('PaymentId', selectedPayment.paymentId.toString());
      formData.append('PaymentMode', selectedMode.id.toString());
      formData.append('Reference', modalReference);
      formData.append('PaymentDate', modalPaymentDate);
      formData.append('Amount', modalAmount);
      formData.append('Comments', modalComments);
      formData.append('Submit', 'false');
      
      if (modalUploadedFile) {
        formData.append('Document', modalUploadedFile);
      }

      const response = await fetch(`${envConfig.apiBaseUrl}/payments`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: 'Success',
          variant: 'success',
          description: 'Payment saved successfully',
        });
        handleCloseModal();
        fetchInvoiceDetails();
        fetchPayments();
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to save payment');
      }
    } catch (error) {
      console.error('Error saving payment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalSaveAndSubmit = async () => {
    if (!selectedPayment) return;

    // Validation
    if (!modalPaymentMode) {
      toast({
        title: 'Validation Error',
        description: 'Payment Mode is required',
        variant: 'destructive',
      });
      return;
    }

    if ((modalPaymentMode === 'Cheque' || modalPaymentMode === 'Bank Draft' || modalPaymentMode === 'PayPal' || modalPaymentMode === 'Direct Transfer') && !modalReference) {
      toast({
        title: 'Validation Error',
        description: `${(modalPaymentMode === 'Cheque' || modalPaymentMode === 'Bank Draft') ? 'Cheque/DD No.' : 'Transaction Id'} is required`,
        variant: 'destructive',
      });
      return;
    }

    if (!modalPaymentDate) {
      toast({
        title: 'Validation Error',
        description: 'Date is required',
        variant: 'destructive',
      });
      return;
    }

    if (!modalAmount || parseFloat(modalAmount) <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Valid Amount is required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Find payment mode ID
      const selectedMode = paymentModes.find(mode => mode.name === modalPaymentMode);
      if (!selectedMode) {
        throw new Error('Invalid payment mode selected');
      }

      const formData = new FormData();
      formData.append('InvoiceBillAdvPaymentId', invoiceBillAdvPaymentId.toString());
      formData.append('PaymentId', selectedPayment.paymentId.toString());
      formData.append('PaymentMode', selectedMode.id.toString());
      formData.append('Reference', modalReference);
      formData.append('PaymentDate', modalPaymentDate);
      formData.append('Amount', modalAmount);
      formData.append('Comments', modalComments);
      formData.append('Submit', 'true');
      
      if (modalUploadedFile) {
        formData.append('Document', modalUploadedFile);
      }

      const response = await fetch(`${envConfig.apiBaseUrl}/payments`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: 'Success',
          variant: 'success',
          description: 'Payment saved and submitted successfully',
        });
        handleCloseModal();
        fetchInvoiceDetails();
        fetchPayments();
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to save and submit payment');
      }
    } catch (error) {
      console.error('Error saving and submitting payment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save and submit payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      setIsEditMode(false);
      // Reset form fields
      setPaymentMode('');
      setChequeNumber('');
      setIssueDate('');
      setAmount('');
      setComments('');
      setUploadedFile(null);
    } else {
      router.push('/manage-payments');
    }
  };

  const handleGoBack = () => {
    router.push('/manage-payments');
  };

  const handleUpdate = () => {
    setIsEditMode(true);
  };

  const handleSave = async () => {
    // Validation
    if (!paymentMode) {
      toast({
        title: 'Validation Error',
        description: 'Payment Mode is required',
        variant: 'destructive',
      });
      return;
    }

    if ((paymentMode === 'Cheque' || paymentMode === 'Bank Draft' || paymentMode === 'PayPal' || paymentMode === 'Direct Transfer') && !chequeNumber) {
      toast({
        title: 'Validation Error',
        description: `${(paymentMode === 'Cheque' || paymentMode === 'Bank Draft') ? 'Cheque/DD No.' : 'Transaction Id'} is required`,
        variant: 'destructive',
      });
      return;
    }

    if (!issueDate) {
      toast({
        title: 'Validation Error',
        description: 'Date is required',
        variant: 'destructive',
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Valid Amount is required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const selectedMode = paymentModes.find(mode => mode.name === paymentMode);
      if (!selectedMode) {
        throw new Error('Invalid payment mode selected');
      }

      const formData = new FormData();
      formData.append('InvoiceBillAdvPaymentId', invoiceBillAdvPaymentId.toString());
      formData.append('PaymentId', '');
      formData.append('PaymentMode', selectedMode.id.toString());
      formData.append('Reference', chequeNumber);
      formData.append('PaymentDate', issueDate);
      formData.append('Amount', amount);
      formData.append('Comments', comments);
      formData.append('Submit', 'false');
      
      if (uploadedFile) {
        formData.append('Document', uploadedFile);
      }

      const response = await fetch(`${envConfig.apiBaseUrl}/payments`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Payment saved successfully',
          variant: 'success',
        });
        setIsEditMode(false);
        fetchInvoiceDetails();
        fetchPayments();
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to save payment');
      }
    } catch (error) {
      console.error('Error saving payment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndSubmit = async () => {
    // Validation
    if (!paymentMode) {
      toast({
        title: 'Validation Error',
        description: 'Payment Mode is required',
        variant: 'destructive',
      });
      return;
    }

    if ((paymentMode === 'Cheque' || paymentMode === 'Bank Draft' || paymentMode === 'PayPal' || paymentMode === 'Direct Transfer') && !chequeNumber) {
      toast({
        title: 'Validation Error',
        description: `${(paymentMode === 'Cheque' || paymentMode === 'Bank Draft') ? 'Cheque/DD No.' : 'Transaction Id'} is required`,
        variant: 'destructive',
      });
      return;
    }

    if (!issueDate) {
      toast({
        title: 'Validation Error',
        description: 'Date is required',
        variant: 'destructive',
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Valid Amount is required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const selectedMode = paymentModes.find(mode => mode.name === paymentMode);
      if (!selectedMode) {
        throw new Error('Invalid payment mode selected');
      }

      const formData = new FormData();
      formData.append('InvoiceBillAdvPaymentId', invoiceBillAdvPaymentId.toString());
      formData.append('PaymentId', '');
      formData.append('PaymentMode', selectedMode.id.toString());
      formData.append('Reference', chequeNumber);
      formData.append('PaymentDate', issueDate);
      formData.append('Amount', amount);
      formData.append('Comments', comments);
      formData.append('Submit', 'true');
      
      if (uploadedFile) {
        formData.append('Document', uploadedFile);
      }

      const response = await fetch(`${envConfig.apiBaseUrl}/payments`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Payment saved and submitted successfully',
        });
        router.push('/manage-payments');
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to save and submit payment');
      }
    } catch (error) {
      console.error('Error saving and submitting payment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save and submit payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingInvoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-vendor-600" />
          <span className="text-gray-600">Loading payment details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Tooltip content="Go back to Manage Payments" position="bottom">
            <Button
              variant="outline"
              size="icon"
              onClick={handleGoBack}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Tooltip>
          <div>
            <h3 className="text-lg font-semibold tracking-tight cus-line-height">
              View Payment
            </h3>
            <p className="text-muted-foreground text-xs">
              View payment details for the selected invoice
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Details Card - Read-only fields from API */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="pb-0">
            <h4 className="text-lg font-medium text-gray-900">Invoice Details</h4>
          </div>
          {invoiceDetails ? (
            <div className="grid gap-4 md:grid-cols-3">
              {invoiceDetails.invoiceLabel && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {invoiceDetails.invoiceLabel}
                  </label>
                  <p className="text-sm text-gray-900">
                    {invoiceDetails.invoiceNumber}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Invoice Amount
                </label>
                <p className="text-sm text-gray-900">
                  {invoiceDetails.currency}{invoiceDetails.invoiceAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Invoice Date
                </label>
                <p className="text-sm text-gray-900">
                  {invoiceDetails.invoiceDate}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Amount Paid
                </label>
                <p className="text-sm text-gray-900">
                  {invoiceDetails.currency}{invoiceDetails.amountPaid.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  PO Amount
                </label>
                <p className="text-sm text-gray-900">
                  {invoiceDetails.currency}{invoiceDetails.purchaseOrderTotal.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Vendor Name
                </label>
                <p className="text-sm text-gray-900">
                  {invoiceDetails.vendorName}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No invoice details available</p>
          )}
        </CardContent>
      </Card>

      {/* Payment Form Card - User input fields */}
      {isEditMode && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label
                  htmlFor="paymentMode"
                  className="block text-sm font-medium mb-2"
                >
                  Payment Mode <span className="text-red-500">*</span>
                </label>
                <select
                  id="paymentMode"
                  value={paymentMode}
                  onChange={(e) => {
                    setPaymentMode(e.target.value);
                    if (e.target.value !== 'Cheque' && e.target.value !== 'Bank Draft') {
                      setChequeNumber('');
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                  required
                  disabled={loadingPaymentModes}
                >
                  <option value="">
                    {loadingPaymentModes ? 'Loading payment modes...' : 'Select Payment Mode'}
                  </option>
                  {paymentModes.map((mode) => (
                    <option key={mode.id} value={mode.name}>
                      {mode.name}
                    </option>
                  ))}
                </select>
              </div>

              {(paymentMode === 'Cheque' || paymentMode === 'Bank Draft' || paymentMode === 'PayPal' || paymentMode === 'Direct Transfer') && (
                <div>
                  <label
                    htmlFor="chequeNumber"
                    className="block text-sm font-medium mb-2"
                  >
                    {(paymentMode === 'Cheque' || paymentMode === 'Bank Draft') 
                      ? 'Cheque/DD No' 
                      : 'Transaction Id'}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="chequeNumber"
                    type="text"
                    placeholder={
                      (paymentMode === 'Cheque' || paymentMode === 'Bank Draft')
                        ? 'Enter Cheque/DD Number'
                        : 'Enter Transaction ID'
                    }
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="issueDate"
                  className="block text-sm font-medium mb-2"
                >
                  {paymentMode === 'Cheque' || paymentMode === 'Bank Draft'
                    ? 'Issue Date'
                    : paymentMode === 'PayPal'
                    ? 'Date Given On'
                    : paymentMode === 'Direct Transfer'
                    ? 'Transaction Date'
                    : 'Issue Date'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium mb-2"
                >
                  Amount <span className="text-red-500">*</span>
                </label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="Enter Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="uploadDocument"
                  className="block text-sm font-medium mb-2"
                >
                  Upload Document
                </label>
                <div className="space-y-2">
                  <Input
                    id="uploadDocument"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadedFile(file);
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  {uploadedFile && (
                    <div className="flex items-center justify-between p-2 bg-gray-50 border rounded-md">
                      <span className="text-sm text-gray-700 truncate">{uploadedFile.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFile(null);
                          const fileInput = document.getElementById('uploadDocument') as HTMLInputElement;
                          if (fileInput) fileInput.value = '';
                        }}
                        className="text-red-500 hover:text-red-700 text-sm font-medium ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <label
                  htmlFor="comments"
                  className="block text-sm font-medium mb-2"
                >
                  Comments
                </label>
                <textarea
                  id="comments"
                  rows={4}
                  placeholder="Enter comments..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 justify-start">
              <Button
                type="submit"
                variant="ghost"
                className="gap-2 text-xs cus-primary-submit-btn"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
              <Button
                type="submit"
                variant="ghost"
                className="gap-2 text-xs cus-primary-submit-btn"
                onClick={handleSaveAndSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save & Submit'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 gap-2 disabled:opacity-50"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update/Cancel Button - Only show if not fully paid and not in edit mode */}
      {!isEditMode && invoiceDetails && !invoiceDetails.fullyPaid && (
        <div className="flex gap-4">
          <Button
            type="submit"
            variant="ghost"
            className="gap-2 text-xs cus-primary-submit-btn"
            onClick={handleUpdate}
          >
            Update
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="text-xs gap-2 cus-secondary-reset-btn"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Only show Cancel button if fully paid and not in edit mode */}
      {!isEditMode && invoiceDetails && invoiceDetails.fullyPaid && (
        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            className="text-xs gap-2 cus-secondary-reset-btn"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Payments Listing Table */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Payments Listing:</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                  Invoice / Advance Payment #
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                  Payment Mode
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                  Check No. / Transaction Id
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                  Paid Amount
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                  Check / Payment Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                  Document
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700{isEditMode ? ' border-r border-gray-200' : ''}">
                  Status
                </th>
                {isEditMode && (
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadingPayments ? (
                <tr>
                  <td colSpan={isEditMode ? 8 : 7} className="px-4 py-8 text-center text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                    Loading payments...
                  </td>
                </tr>
              ) : paymentsListing.length > 0 ? (
                paymentsListing.map((payment, index) => (
                  <tr key={`${payment.paymentId}-${index}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                      {invoiceDetails?.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                      {payment.paymentModeName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                      {payment.reference}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                      {invoiceDetails?.currency || '$'} {payment.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                      {payment.paymentDate}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                      {payment.fileOriginalName ? (
                        <a
                          href={`${envConfig.apiBaseUrl.replace('/api', '')}/${payment.fileStoredName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {payment.fileOriginalName}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className={`px-4 py-3 text-sm text-gray-900${isEditMode ? ' border-r border-gray-200' : ''}`}>
                      {payment.statusName}
                    </td>
                    {isEditMode && (
                      <td className="px-4 py-3 text-sm border-gray-200">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-1"
                          onClick={() => fetchPaymentDetails(payment.paymentId)}
                        >
                          {payment.statusName === 'Submitted' ? 'View' : 'Edit'}
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isEditMode ? 8 : 7} className="px-4 py-8 text-center text-sm text-gray-500">
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Details Modal */}
      {isModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedPayment.statusName === 'Submitted' ? 'View Payment' : 'Edit Payment'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingPaymentDetails ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-vendor-600" />
                <span className="ml-2 text-gray-600">Loading payment details...</span>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Payment Information */}
                <div className="grid gap-4 md:grid-cols-3 mb-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">{invoiceDetails?.invoiceLabel || 'Invoice #'}</label>
                    <p className="text-sm text-gray-900">{invoiceDetails?.invoiceNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <p className="text-sm text-gray-900">{selectedPayment.statusName}</p>
                  </div>
                </div>

                {/* Editable Fields */}
                <div className="grid gap-4 md:grid-cols-3 mb-2">
                  <div>
                    <label htmlFor="modalPaymentMode" className="block text-sm font-medium mb-2">
                      Payment Mode <span className="text-red-500">*</span>
                    </label>
                    {selectedPayment.statusName === 'Submitted' ? (
                      <p className="text-sm text-gray-900">{modalPaymentMode}</p>
                    ) : (
                      <select
                        id="modalPaymentMode"
                        value={modalPaymentMode}
                        onChange={(e) => {
                          setModalPaymentMode(e.target.value);
                          if (e.target.value !== 'Cheque' && e.target.value !== 'Bank Draft') {
                            setModalReference('');
                          }
                        }}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                        disabled={loadingPaymentModes}
                      >
                        <option value="">
                          {loadingPaymentModes ? 'Loading payment modes...' : 'Select Payment Mode'}
                        </option>
                        {paymentModes.map((mode) => (
                          <option key={mode.id} value={mode.name}>
                            {mode.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {(modalPaymentMode === 'Cheque' || modalPaymentMode === 'Bank Draft' || modalPaymentMode === 'PayPal' || modalPaymentMode === 'Direct Transfer') && (
                    <div>
                      <label htmlFor="modalReference" className="block text-sm font-medium mb-2">
                        {(modalPaymentMode === 'Cheque' || modalPaymentMode === 'Bank Draft')
                          ? 'Cheque/DD No'
                          : 'Transaction Id'}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      {selectedPayment.statusName === 'Submitted' ? (
                        <p className="text-sm text-gray-900">{modalReference}</p>
                      ) : (
                        <Input
                          id="modalReference"
                          type="text"
                          placeholder={
                            (modalPaymentMode === 'Cheque' || modalPaymentMode === 'Bank Draft')
                              ? 'Enter Cheque/DD Number'
                              : 'Enter Transaction ID'
                          }
                          value={modalReference}
                          onChange={(e) => setModalReference(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                        />
                      )}
                    </div>
                  )}

                  <div>
                    <label htmlFor="modalPaymentDate" className="block text-sm font-medium mb-2">
                      {modalPaymentMode === 'Cheque' || modalPaymentMode === 'Bank Draft'
                        ? 'Issue Date'
                        : modalPaymentMode === 'PayPal'
                        ? 'Date Given On'
                        : modalPaymentMode === 'Direct Transfer'
                        ? 'Transaction Date'
                        : 'Issue Date'}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    {selectedPayment.statusName === 'Submitted' ? (
                      <p className="text-sm text-gray-900">{modalPaymentDate}</p>
                    ) : (
                      <Input
                        id="modalPaymentDate"
                        type="date"
                        value={modalPaymentDate}
                        onChange={(e) => setModalPaymentDate(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label htmlFor="modalAmount" className="block text-sm font-medium mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    {selectedPayment.statusName === 'Submitted' ? (
                      <p className="text-sm text-gray-900">{invoiceDetails?.currency || '$'} {parseFloat(modalAmount).toFixed(2)}</p>
                    ) : (
                      <Input
                        id="modalAmount"
                        type="number"
                        step="0.01"
                        placeholder="Enter Amount"
                        value={modalAmount}
                        onChange={(e) => setModalAmount(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                        required
                      />
                    )}
                  </div>

                  <div className="md:col-span-3 mb-0">
                    <label htmlFor="modalComments" className="block text-sm font-medium mb-2">
                      Comments
                    </label>
                    {selectedPayment.statusName === 'Submitted' ? (
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{modalComments || '-'}</p>
                    ) : (
                      <textarea
                        id="modalComments"
                        rows={4}
                        placeholder="Enter comments..."
                        value={modalComments}
                        onChange={(e) => setModalComments(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-vendor-500"
                      />
                    )}
                  </div>

                  {selectedPayment.statusName !== 'Submitted' && (
                    <div className="md:col-span-3">
                      <label htmlFor="modalUploadDocument" className="block text-sm font-medium mb-2">
                        Upload Document
                      </label>
                      <div className="flex flex-wrap items-center gap-4">
                        <Input
                          id="modalUploadDocument"
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setModalUploadedFile(file);
                            }
                          }}
                          className="flex-1 min-w-[200px] px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        {selectedPayment.fileOriginalName && (
                          <div className="text-sm text-gray-600">
                            Current: <a
                              href={`${envConfig.apiBaseUrl.replace('/api', '')}/${selectedPayment.fileStoredName}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {selectedPayment.fileOriginalName}
                            </a>
                          </div>
                        )}
                        {modalUploadedFile && (
                          <div className="flex items-center gap-2 p-2 bg-gray-50 border rounded-md">
                            <span className="text-sm text-gray-700 truncate max-w-[200px]">{modalUploadedFile.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setModalUploadedFile(null);
                                const fileInput = document.getElementById('modalUploadDocument') as HTMLInputElement;
                                if (fileInput) fileInput.value = '';
                              }}
                              className="text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedPayment.statusName === 'Submitted' && selectedPayment.fileOriginalName && (
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium mb-2">Document</label>
                      <a
                        href={`${envConfig.apiBaseUrl.replace('/api', '')}/${selectedPayment.fileStoredName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                      >
                        {selectedPayment.fileOriginalName}
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 justify-end border-t ">
                  {selectedPayment.statusName !== 'Submitted' && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleModalSave}
                        disabled={loading}
                        className="px-6 bg-vendor-600 hover:bg-vendor-700 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleModalSaveAndSubmit}
                        disabled={loading}
                        className="px-6 bg-vendor-600 hover:bg-vendor-700 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save & Submit'
                        )}
                      </Button>
                    </>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    disabled={loading}
                    className="px-6 gap-2 disabled:opacity-50"
                  >
                    {selectedPayment.statusName === 'Submitted' ? 'Close' : 'Cancel'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

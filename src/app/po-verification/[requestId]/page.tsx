"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ArrowLeft, Loader2, Eye, X, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";
import { approvalsService } from "@/services/approvals-service";
import { envConfig } from "@/config/env-validation";

interface POVerificationFormData {
  requestNumber: string;
  requestGroup: string;
  subgroup: string;
  projectProposal: string;
  requestName: string;
  requestDescription: string;
  specification: string;
  quotationList: string;
  quotationDescription: string;
  approvedAmount: string;
  purchaseOrderNumber: string;
  templateType: string;
  poType: string;
  validityStartDate: string;
  validityEndDate: string;
  maxValue: string;
  paymentTerm: string;
  discount: string;
  vendorPanNo: string;
  vendorSalesTaxNo: string;
  vendorServiceTaxNo: string;
}

interface POItem {
  id: string;
  quantity: string;
  unitCost: string;
  description: string;
  totalCost: number;
  template?: string;
  poType?: string;
  validityStartDate?: string;
  validityEndDate?: string;
  maxValue?: string;
}

interface QuantityItem {
  id: string;
  quantity: number;
  unitCost: number;
  description: string;
  totalCost: number;
}

interface VendorCell {
  value: string;
  fileUrl?: string;
  vendorId?: number;
  vendorName?: string;
}

interface SpecificationRow {
  specificationId: number;
  specificationName: string;
  fieldType: 'text' | 'checkbox' | 'hyperlink' | 'dropdown';
  vendorCells: VendorCell[];
}

interface QuotationSpecTableData {
  vendorsToShow: number;
  specifications: SpecificationRow[];
}

export default function POVerificationPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<POItem[]>([]);
  const [comments, setComments] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [approverType, setApproverType] = useState<string>("");
  
  const [formData, setFormData] = useState<POVerificationFormData>({
    requestNumber: "",
    requestGroup: "",
    subgroup: "",
    projectProposal: "",
    requestName: "",
    requestDescription: "",
    specification: "",
    quotationList: "",
    quotationDescription: "",
    approvedAmount: "",
    purchaseOrderNumber: "",
    templateType: "",
    poType: "",
    validityStartDate: "",
    validityEndDate: "",
    maxValue: "",
    paymentTerm: "",
    discount: "0",
    vendorPanNo: "",
    vendorSalesTaxNo: "",
    vendorServiceTaxNo: "",
  });

  // Payment Terms state (read-only)
  const [paymentTerms, setPaymentTerms] = useState({
    term1: "",
    term2: "",
    term3: "",
  });

  // Notes state (read-only)
  const [notes, setNotes] = useState({
    note1: "",
    note2: "",
    note3: "",
  });

  // Taxes state (read-only)
  const [taxes, setTaxes] = useState<Array<{ label: string; value: string }>>([]);
  const [otherTaxes, setOtherTaxes] = useState<string>("");

  // Quantity Items state (from API)
  const [quantityItems, setQuantityItems] = useState<QuantityItem[]>([]);

  // Pricing totals state (from API)
  const [subTotal, setSubTotal] = useState<number>(0);
  const [subtotalAfterDiscount, setSubtotalAfterDiscount] = useState<number>(0);
  const [grandTotal, setGrandTotal] = useState<number>(0);

  // Quotation Specifications state for modal
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [quotationSpecTableData, setQuotationSpecTableData] = useState<QuotationSpecTableData | null>(null);

  // Fetch PO approval data on mount
  useEffect(() => {
    const fetchPOApprovalData = async () => {
      try {
        setLoading(true);
        const requestId = Number.parseInt(params.requestId as string);
        
        if (Number.isNaN(requestId)) {
          throw new TypeError('Invalid request ID');
        }

        logger.info('Fetching PO approval data for ID:', { requestId });
        const response = await approvalsService.getPoApproval(requestId);
        logger.info('PO approval data received:', { response });

        // Map API response to form data
        const data = response.data || response;
        
        const projectProposalValue = data.projectProposalDisplay || data.projectProposal || "";
        
        setFormData({
          requestNumber: data.requestNumber?.toString() || data.requestNumber || "",
          requestGroup: data.requestDivision || data.requestGroup || data.groupName || "",
          subgroup: data.subgroupName || data.subgroup || "",
          projectProposal: projectProposalValue === "-1" ? "-" : projectProposalValue,
          requestName: data.requestName || "",
          requestDescription: data.requestDescription || "",
          specification: data.specification || "",
          quotationList: data.quotationList || "",
          quotationDescription: data.quotationDescription || "Quotations Available",
          approvedAmount: data.approvedQuotationAmount?.toString() || data.approvedAmount || "",
          purchaseOrderNumber: data.poNumber || data.purchaseOrderNumber || "",
          templateType: data.templateType || data.templateName || data.template || "",
          poType: data.poTypeName || data.poType || "",
          vendorPanNo: data.vendorPanNo || "",
          vendorSalesTaxNo: data.vendorSalesTaxNo || "",
          vendorServiceTaxNo: data.vendorServiceTaxNo || "",
          validityStartDate: data.validityStartDate || "",
          validityEndDate: data.validityEndDate || "",
          maxValue: data.maxValue?.toString() || "",
          paymentTerm: data.paymentTerms?.toString() || data.paymentTerm?.toString() || "",
          discount: data.discount?.toString() || "0",
        });

        // Set approverType from API response
        if (data.approverType) {
          setApproverType(data.approverType);
        }

        // Map items
        if (data.items && Array.isArray(data.items)) {
          const mappedItems = data.items.map((item: any, index: number) => ({
            id: item.id?.toString() || `item-${index}`,
            quantity: item.quantity?.toString() || "1",
            unitCost: item.unitCost?.toString() || item.unitPrice?.toString() || "0",
            description: item.description || item.itemDescription || "",
            totalCost: Number(item.totalCost) || (Number(item.quantity) * Number(item.unitCost)) || 0,
            template: item.templateName || item.template || "",
            poType: item.poTypeName || item.poType || "",
            validityStartDate: item.validityStartDate || "",
            validityEndDate: item.validityEndDate || "",
            maxValue: item.maxValue?.toString() || "",
          }));
          setItems(mappedItems);
        }

        // Map payment terms (handle both array of strings and array of objects)
        if (data.paymentTermsList && Array.isArray(data.paymentTermsList)) {
          // paymentTermsList is a simple string array
          setPaymentTerms({
            term1: typeof data.paymentTermsList[0] === 'string' ? data.paymentTermsList[0] : (data.paymentTermsList[0]?.term || ""),
            term2: typeof data.paymentTermsList[1] === 'string' ? data.paymentTermsList[1] : (data.paymentTermsList[1]?.term || ""),
            term3: typeof data.paymentTermsList[2] === 'string' ? data.paymentTermsList[2] : (data.paymentTermsList[2]?.term || ""),
          });
        } else if (data.paymentTerms && Array.isArray(data.paymentTerms)) {
          setPaymentTerms({
            term1: typeof data.paymentTerms[0] === 'string' ? data.paymentTerms[0] : (data.paymentTerms[0]?.term || ""),
            term2: typeof data.paymentTerms[1] === 'string' ? data.paymentTerms[1] : (data.paymentTerms[1]?.term || ""),
            term3: typeof data.paymentTerms[2] === 'string' ? data.paymentTerms[2] : (data.paymentTerms[2]?.term || ""),
          });
        }

        // Map notes (handle both array of strings and array of objects)
        if (data.notes && Array.isArray(data.notes)) {
          setNotes({
            note1: typeof data.notes[0] === 'string' ? data.notes[0] : (data.notes[0]?.text || ""),
            note2: typeof data.notes[1] === 'string' ? data.notes[1] : (data.notes[1]?.text || ""),
            note3: typeof data.notes[2] === 'string' ? data.notes[2] : (data.notes[2]?.text || ""),
          });
        }

        // Map taxes
        if (data.taxes && Array.isArray(data.taxes)) {
          const mappedTaxes = data.taxes.map((tax: any) => ({
            label: tax.taxName || tax.label || tax.name || "",
            value: tax.taxValue?.toString() || tax.value?.toString() || "",
          }));
          setTaxes(mappedTaxes);
        }

        if (data.otherTaxes) {
          setOtherTaxes(data.otherTaxes);
        }

        // Map quantity items from API
        if (data.quantityItems && Array.isArray(data.quantityItems)) {
          const mappedQuantityItems: QuantityItem[] = data.quantityItems.map((item: any, index: number) => ({
            id: item.id?.toString() || `qty-${index}`,
            quantity: Number(item.quantity) || 0,
            unitCost: Number(item.unitCost) || Number(item.unitPrice) || 0,
            description: item.description || '',
            totalCost: Number(item.totalCost) || (Number(item.quantity) * (Number(item.unitCost) || Number(item.unitPrice) || 0)),
          }));
          setQuantityItems(mappedQuantityItems);
        }

        // Map quotation specifications
        const specsData = data.quotationSpecifications || data.specifications;
        if (specsData && Array.isArray(specsData)) {
          const vendorsCount = specsData[0]?.vendorCells?.length || 2;
          const mappedSpecifications: SpecificationRow[] = specsData.map((spec: any) => {
            const vendorCells: VendorCell[] = (spec.vendorCells || []).map((cell: any) => ({
              value: cell.textValue || cell.value || '',
              fileUrl: cell.fileUrl || '',
              vendorId: cell.vendorId,
              vendorName: cell.vendorName,
            }));

            return {
              specificationId: spec.specificationId || spec.id || 0,
              specificationName: spec.specificationName || spec.name || '',
              fieldType: spec.fieldType || 'text',
              vendorCells: vendorCells,
            };
          });

          setQuotationSpecTableData({
            vendorsToShow: vendorsCount,
            specifications: mappedSpecifications,
          });
        }

        // Map pricing totals from API
        if (data.subTotal !== undefined) {
          setSubTotal(Number(data.subTotal) || 0);
        }
        if (data.subtotalAfterDiscount !== undefined) {
          setSubtotalAfterDiscount(Number(data.subtotalAfterDiscount) || 0);
        }
        if (data.grandTotal !== undefined) {
          setGrandTotal(Number(data.grandTotal) || 0);
        }

      } catch (err: any) {
        logger.error('Error fetching PO approval data:', err);
        toast({
          title: 'Error',
          description: err.message || 'Failed to load PO verification data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPOApprovalData();
  }, [params.requestId, toast]);

  // Calculate totals
  const calculateSubTotal = () => {
    return items.reduce((sum, item) => sum + item.totalCost, 0);
  };

  const calculateSubtotalAfterDiscount = () => {
    const subTotal = calculateSubTotal();
    const discount = Number(formData.discount) || 0;
    return subTotal - discount;
  };

  const calculateTaxTotal = () => {
    return taxes.reduce((sum, tax) => sum + (Number(tax.value) || 0), 0);
  };

  const calculateGrandTotal = () => {
    return calculateSubtotalAfterDiscount() + calculateTaxTotal();
  };

  // Handle Approve
  const handleApprove = async () => {
    try {
      setSubmitting(true);
      const requestId = Number.parseInt(params.requestId as string);

      const payload = {
        approverType: approverType,
        comments: comments,
      };

      logger.info('Approving PO with data:', payload);

      const response = await fetch(`${envConfig.apiBaseUrl}/approvals/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to approve PO');
      }

      toast({
        title: 'Success',
        description: 'Purchase Order approved successfully',
        variant: 'success',
      });

      router.push('/approvals');
    } catch (error: any) {
      logger.error('Error approving PO:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve Purchase Order',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
      setShowApproveDialog(false);
    }
  };

  // Handle Reject
  const handleReject = async () => {
    if (!comments.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Comments are required when rejecting',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      const requestId = Number.parseInt(params.requestId as string);

      const payload = {
        approverType: approverType,
        reason: comments,
      };

      logger.info('Rejecting PO with data:', payload);

      const response = await fetch(`${envConfig.apiBaseUrl}/approvals/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to reject PO');
      }

      toast({
        title: 'Success',
        description: 'Purchase Order rejected',
        variant: 'success',
      });

      router.push('/approvals');
    } catch (error: any) {
      logger.error('Error rejecting PO:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject Purchase Order',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
      setShowRejectDialog(false);
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    router.push('/approvals');
  };

  // Handle View Quotation Description
  const handleViewQuotationDescription = () => {
    setShowQuotationModal(true);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Loading PO verification data...</p>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Tooltip content="Go back to Manage Request Approvals" position="bottom">
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
                <h3 className="text-lg font-semibold">PO Verification</h3>                
              </div>
            </div>
          </div>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <h4 className="text-lg font-semibold text-gray-900">Purchase Order Details</h4>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Pre-filled Fields Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Request # */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Request #
                    </label>
                    <Input
                      value={formData.requestNumber}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  {/* Request Group */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Request Group
                    </label>
                    <Input
                      value={formData.requestGroup}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  {/* Subgroup */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Subgroup
                    </label>
                    <Input
                      value={formData.subgroup}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Project/Proposal */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Project/Proposal
                    </label>
                    <Input
                      value={formData.projectProposal}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  {/* Request Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Request Name
                    </label>
                    <Input
                      value={formData.requestName}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  {/* Specification */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Specification
                    </label>
                    <Input
                      value={formData.specification}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                {/* Request Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Request Description
                  </label>
                  <textarea
                    value={formData.requestDescription}
                    disabled
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm resize-none bg-gray-50 text-gray-700"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Quotation Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Quotation Description
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.quotationDescription || "Quotations Available"}
                        disabled
                        className="bg-gray-50 flex-1"
                      />
                      <Tooltip content="View Quotation Specifications">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleViewQuotationDescription}
                          className="shrink-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Approved Amount */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Approved Amount
                    </label>
                    <Input
                      value={formData.approvedAmount}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  {/* Purchase Order Number */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Purchase Order Number
                    </label>
                    <Input
                      value={formData.purchaseOrderNumber}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Template Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Template Type
                    </label>
                    <Input
                      value={formData.templateType}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  {/* PO Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      PO Type
                    </label>
                    <Input
                      value={formData.poType}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  {/* Payment Term */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Payment Term (Days)
                    </label>
                    <Input
                      value={formData.paymentTerm}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>



                {/* Vendor Tax Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Vendor PAN No */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Vendor PAN No
                    </label>
                    <Input
                      value={formData.vendorPanNo}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  {/* Vendor Sales Tax No */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Vendor Sales Tax No
                    </label>
                    <Input
                      value={formData.vendorSalesTaxNo}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  {/* Vendor Service Tax No */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Vendor Service Tax No
                    </label>
                    <Input
                      value={formData.vendorServiceTaxNo}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                                {/* Quantity Items Table (Read-only from API) */}
                {quantityItems.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold text-gray-900">Quantity Items</h4>
                    </div>
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Unit Cost
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Total Cost
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {quantityItems.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {item.unitCost.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 max-w-md">
                                <div className="line-clamp-2">
                                  {item.description || '-'}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                                {item.totalCost.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                              Total:
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                              {quantityItems.reduce((sum, item) => sum + item.totalCost, 0).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Rate-based PO fields (if applicable) */}
                {(formData.validityStartDate || formData.validityEndDate || formData.maxValue) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {formData.validityStartDate && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Validity Start Date
                        </label>
                        <Input
                          type="date"
                          value={formData.validityStartDate}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    )}

                    {formData.validityEndDate && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Validity End Date
                        </label>
                        <Input
                          type="date"
                          value={formData.validityEndDate}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    )}

                    {formData.maxValue && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Max Value
                        </label>
                        <Input
                          value={formData.maxValue}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Items Table (Read-only, no Actions column) */}
                {items.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold text-gray-900">Items ({items.length})</h4>
                    </div>
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Unit Cost
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Total Cost
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                ${parseFloat(item.unitCost).toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 max-w-md">
                                <div className="line-clamp-2">
                                  {item.description || '-'}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                                ${item.totalCost.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                              Total:
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                              ${subTotal.toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Pricing Calculation Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {/* Sub Total */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Sub Total
                    </label>
                    <Input
                      type="text"
                      value={subTotal.toFixed(2)}
                      disabled
                      className="bg-gray-50 font-medium"
                    />
                  </div>

                  {/* Discount */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Discount
                    </label>
                    <Input
                      type="text"
                      value={formData.discount}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  {/* Subtotal after Discount */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Subtotal after Discount
                    </label>
                    <Input
                      type="text"
                      value={subtotalAfterDiscount.toFixed(2)}
                      disabled
                      className="bg-gray-50 font-medium"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-300 my-4"></div>

                {/* Grand Total */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-start-3">
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-bold text-gray-900 whitespace-nowrap">
                        Grand Total:
                      </label>
                      <Input
                        type="text"
                        value={grandTotal.toFixed(2)}
                        disabled
                        className="bg-blue-50 font-bold text-lg border-2 border-blue-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Taxes Section (Read-only) */}
                <div className="border-t pt-4 mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Taxes</h4>
                  {taxes.length > 0 ? (
                    <>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Tax Name</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Tax Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {taxes.map((tax, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2">
                                  <Input
                                    type="text"
                                    value={tax.label}
                                    disabled
                                    className="bg-gray-50 border-0"
                                    placeholder="-"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <Input
                                    type="text"
                                    value={tax.value}
                                    disabled
                                    className="bg-gray-50 border-0"
                                    placeholder="-"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 space-y-2">
                        <label className="text-sm font-medium text-gray-700">Other Taxes</label>
                        <Input
                          value={otherTaxes}
                          disabled
                          className="bg-gray-50"
                          placeholder="-"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p className="text-sm text-gray-500">No taxes have been added for this request.</p>
                    </div>
                  )}
                </div>

                {/* Notes Section (Read-only) */}
                <div className="border-t pt-4 mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Notes</h4>
                  {(notes.note1 || notes.note2 || notes.note3) ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Note 1</label>
                        <Input value={notes.note1} disabled className="bg-gray-50" placeholder="-" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Note 2</label>
                        <Input value={notes.note2} disabled className="bg-gray-50" placeholder="-" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Note 3</label>
                        <Input value={notes.note3} disabled className="bg-gray-50" placeholder="-" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p className="text-sm text-gray-500">No notes have been added for this request.</p>
                    </div>
                  )}
                </div>

                {/* Payment Terms Section (Read-only) */}
                <div className="border-t pt-4 mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Terms</h4>
                  {(paymentTerms.term1 || paymentTerms.term2 || paymentTerms.term3) ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Term 1</label>
                        <Input value={paymentTerms.term1} disabled className="bg-gray-50" placeholder="-" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Term 2</label>
                        <Input value={paymentTerms.term2} disabled className="bg-gray-50" placeholder="-" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Term 3</label>
                        <Input value={paymentTerms.term3} disabled className="bg-gray-50" placeholder="-" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p className="text-sm text-gray-500">No payment terms have been added for this request.</p>
                    </div>
                  )}
                </div>

                {/* Divider before Comments */}
                {approverType === "POVerifier" && (
                  <div className="border-t border-gray-300 my-6"></div>
                )}

                {/* Comments Section (Editable) - Only visible for POVerifier */}
                {approverType === "POVerifier" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Comments <span className="text-gray-400">(Required for rejection)</span>
                    </label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={4}
                      placeholder="Enter your comments here..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  {approverType === "POVerifier" && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowRejectDialog(true)}
                        disabled={submitting}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowApproveDialog(true)}
                        disabled={submitting}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quotation Specifications Modal */}
        {showQuotationModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQuotationModal(false)}
          >
            <div 
              className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Quotation Specifications</h3>
                <button
                  onClick={() => setShowQuotationModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-6 py-6 overflow-auto max-h-[calc(90vh-140px)]">
                {quotationSpecTableData && quotationSpecTableData.specifications.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 min-w-[200px]">
                            Specification
                          </th>
                          {Array.from({ length: quotationSpecTableData.vendorsToShow }).map((_, index) => (
                            <th key={index} className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700 min-w-[200px]">
                              {quotationSpecTableData.specifications[0]?.vendorCells[index]?.vendorName || `Vendor ${index + 1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {quotationSpecTableData.specifications.map((spec) => (
                          <tr key={spec.specificationId} className="bg-white hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">
                              {spec.specificationName}
                            </td>
                            {spec.vendorCells.map((cell, vendorIndex) => (
                              <td key={vendorIndex} className="border border-gray-300 px-4 py-3">
                                {spec.fieldType === 'text' && (
                                  <span className="text-gray-700">{cell.value || '-'}</span>
                                )}
                                {spec.fieldType === 'checkbox' && (
                                  <div className="flex items-center justify-center">
                                    <input
                                      type="checkbox"
                                      checked={cell.value?.toLowerCase() === 'true' || cell.value?.toLowerCase() === 'yes'}
                                      disabled
                                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                    />
                                  </div>
                                )}
                                {spec.fieldType === 'dropdown' && (
                                  <span className="text-gray-700">{cell.value || '-'}</span>
                                )}
                                {spec.fieldType === 'hyperlink' && (
                                  <div className="flex items-center justify-center">
                                    {cell.fileUrl ? (
                                      <a
                                        href={cell.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                                      >
                                        {cell.value || 'View File'}
                                      </a>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </div>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No quotation specifications available</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 border-t px-6 py-4 flex justify-end">
                <Button
                  type="button"
                  onClick={() => setShowQuotationModal(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Approve Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showApproveDialog}
          title="Approve Purchase Order"
          message="Are you sure you want to approve this Purchase Order?"
          onConfirm={handleApprove}
          onCancel={() => setShowApproveDialog(false)}
          confirmText="Approve"
          cancelText="Cancel"
          variant="success"
        />

        {/* Reject Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showRejectDialog}
          title="Reject Purchase Order"
          message="Are you sure you want to reject this Purchase Order? Comments are required."
          onConfirm={handleReject}
          onCancel={() => setShowRejectDialog(false)}
          confirmText="Reject"
          cancelText="Cancel"
          variant="danger"
        />
      </MainLayout>
    </ProtectedRoute>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ArrowLeft, Save, Loader2, Eye, X, Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";
import { subgroupsService } from "@/services/subgroups-service";
import { purchaseOrdersService } from "@/services/purchase-orders-service";
import { envConfig } from "@/config/env-validation";

interface CreatePOFormData {
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
  template: string;
  poType: string;
  validityStartDate: string;
  validityEndDate: string;
  maxValue: string;
  paymentTerm: string;
  quantity: string;
  unitPrice: string;
  itemDescription: string;
  discount: string;
}

interface POItem {
  id: string;
  quantity: string;
  unitCost: string;
  description: string;
  totalCost: number;
  template: string;
  poType: string;
  validityStartDate?: string;
  validityEndDate?: string;
  maxValue?: string;
}

interface VendorCell {
  value: string;
  fileUrl?: string;
  vendorId?: number;
  vendorName?: string;
}

type Tax = { label?: string; value?: string | number };

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

export default function CreatePOPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [purchaseOrderId, setPurchaseOrderId] = useState<number | null>(null);
  const [poNumberFromAPI, setPONumberFromAPI] = useState<string>("");
  const [items, setItems] = useState<POItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreatePOFormData>({
    requestNumber: "",
    requestGroup: "",
    subgroup: "",
    projectProposal: "",
    requestName: "",
    requestDescription: "",
    specification: "",
    quotationList: "",
    quotationDescription: "Quotations Available",
    approvedAmount: "",
    purchaseOrderNumber: "",
    template: "",
    poType: "",
    validityStartDate: "",
    validityEndDate: "",
    maxValue: "",
    paymentTerm: "30",
    quantity: "1",
    unitPrice: "",
    itemDescription: "",
    discount: "0",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  
  // Payment Terms state
  const [showPaymentTerms, setShowPaymentTerms] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState({
    term1: "",
    term2: "",
    term3: "",
  });
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  // Notes state
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState({
    note1: "",
    note2: "",
    note3: "",
  });
  const [showClearNotesConfirmation, setShowClearNotesConfirmation] = useState(false);

  // Projected Invoice Plan state
  const [showInvoicePlan, setShowInvoicePlan] = useState(false);
  const [invoicePlan, setInvoicePlan] = useState<Array<{ invoiceDate: string; amount: string }>>([
    { invoiceDate: "", amount: "" },
    { invoiceDate: "", amount: "" },
    { invoiceDate: "", amount: "" },
  ]);
  const [showClearInvoicePlanConfirmation, setShowClearInvoicePlanConfirmation] = useState(false);

  // Taxes state
  const [showTaxes, setShowTaxes] = useState(false);
  const [taxes, setTaxes] = useState<Array<{ label: string; value: string }>>([
    { label: "", value: "" },
    { label: "", value: "" },
    { label: "", value: "" },
  ]);
  const [otherTaxes, setOtherTaxes] = useState<string>("");
  const [showClearTaxesConfirmation, setShowClearTaxesConfirmation] = useState(false);

  // Quotation Specifications state for modal
  const [quotationSpecTableData, setQuotationSpecTableData] = useState<QuotationSpecTableData | null>(null);

  // Budget Allocation state
  interface BudgetAllocationRow {
    divisionId: string;
    subgroupId: string;
    costHeadAmount: string;
  }
  const [showBudgetAllocation, setShowBudgetAllocation] = useState(false);
  const [budgetAllocationRows, setBudgetAllocationRows] = useState<BudgetAllocationRow[]>([]);
  const [showClearBudgetConfirmation, setShowClearBudgetConfirmation] = useState(false);
  const [groupOptions, setGroupOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [subgroupOptions, setSubgroupOptions] = useState<Record<number, Array<{ id: number; name: string }>>>({});
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingSubgroups, setLoadingSubgroups] = useState<Record<number, boolean>>({});

  // PO Types state
  const [poTypes, setPoTypes] = useState<Array<{ poTypeId: number; poTypeName: string }>>([]);
  const [loadingPoTypes, setLoadingPoTypes] = useState(false);

  // Templates state
  const [templates, setTemplates] = useState<Array<{ templateId: number; templateName: string }>>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Track if form was pre-filled from API
  const [isPreFilled, setIsPreFilled] = useState(false);

  // Fetch PO Types on component mount
  useEffect(() => {
    const fetchPoTypes = async () => {
      setLoadingPoTypes(true);
      try {
        const types = await purchaseOrdersService.getPOTypes();
        setPoTypes(types);
        // Set default to first option if available and not already set
        if (types.length > 0 && !formData.poType) {
          setFormData(prev => ({
            ...prev,
            poType: types[0].poTypeId.toString()
          }));
        }
      } catch (error) {
        console.error('Error fetching PO types:', error);
        toast({
          title: 'Error',
          description: 'Failed to load PO types',
          variant: 'destructive',
        });
      } finally {
        setLoadingPoTypes(false);
      }
    };

    fetchPoTypes();
  }, [toast]);

  // Fetch Templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const templatesList = await purchaseOrdersService.getTemplates();
        setTemplates(templatesList);
        // Set default to first option if available and not already set
        if (templatesList.length > 0 && !formData.template) {
          setFormData(prev => ({
            ...prev,
            template: templatesList[0].templateId.toString()
          }));
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
        toast({
          title: 'Error',
          description: 'Failed to load templates',
          variant: 'destructive',
        });
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, [toast]);

  // Load items from localStorage on component mount
  useEffect(() => {
    const requestId = searchParams.get('requestId');
    if (requestId) {
      const cacheKey = `purchaseOrderItems_${requestId}`;
      const cachedItems = localStorage.getItem(cacheKey);
      if (cachedItems) {
        try {
          const parsedItems = JSON.parse(cachedItems);
          setItems(parsedItems);
          console.log('Loaded items from cache:', parsedItems);
        } catch (error) {
          console.error('Error loading items from cache:', error);
        }
      }
    }
  }, [searchParams]);

  // Pre-fill form data from sessionStorage or fetch from API using URL requestId
  useEffect(() => {
    const fetchAndFillData = async () => {
      // Get poNumber from URL if available
      const poNumberFromURL = searchParams.get('poNumber');
      console.log("Testing purchase order #####", poNumberFromURL);
      if (poNumberFromURL) {
        setPONumberFromAPI(poNumberFromURL);
        setFormData(prev => ({
          ...prev,
          purchaseOrderNumber: poNumberFromURL
        }));
        console.log('Create PO Page - PO Number from URL:', poNumberFromURL);
      }
      
      // Try to get data from sessionStorage first
      let storedData = sessionStorage.getItem('createPOData');
      console.log('Create PO Page - Checking sessionStorage:', storedData);
      
      // If no sessionStorage data, check URL for requestId and fetch from API
      if (!storedData) {
        const requestId = searchParams.get('requestId');
        console.log('Create PO Page - No sessionStorage, checking URL requestId:', requestId);
        
        if (requestId) {
          try {
            console.log('Create PO Page - Fetching data from API for requestId:', requestId);
            const poContext = await purchaseOrdersService.getPOContext(requestId);
            console.log('Create PO Page - API data received:', poContext);
            storedData = JSON.stringify(poContext);
          } catch (error) {
            console.error('Error fetching PO context from API:', error);
            toast({
              title: 'Error',
              description: 'Failed to load purchase order data',
              variant: 'destructive',
            });
            return;
          }
        }
      }
      
      if (storedData) {
        try {
          const poContext = JSON.parse(storedData);
          console.log('Create PO Page - Parsed PO Context:', poContext);
          
          // Set purchaseOrderId if it exists (for Edit PO mode)
          if (poContext.purchaseOrderId) {
            setPurchaseOrderId(poContext.purchaseOrderId);
          }
          
          setFormData((prev) => ({
            ...prev,
            requestNumber: poContext.requestNumber || "",
            requestName: poContext.requestName || "",
            requestGroup: poContext.requestGroup || "",
            subgroup: poContext.subgroupName || "",
            projectProposal: poContext.projectProposalDisplay || "",
            requestDescription: poContext.requestDescription || "",
            approvedAmount: poContext.approvedQuotationAmount ? poContext.approvedQuotationAmount.toString() : "",
            discount: poContext.discount !== undefined && poContext.discount !== null ? poContext.discount.toString() : "0",
          }));
          console.log('requestNumberrrrrrrrrrrrrrrrr', poContext.requestNumber);
          // Map payment terms from API response
          if (poContext.paymentTerms && poContext.paymentTerms.length > 0) {
            const newPaymentTerms = {
              term1: poContext.paymentTerms[0]?.term || "",
              term2: poContext.paymentTerms[1]?.term || "",
              term3: poContext.paymentTerms[2]?.term || "",
            };
            setPaymentTerms(newPaymentTerms);
            
            // Show payment terms section if any terms exist
            if (newPaymentTerms.term1 || newPaymentTerms.term2 || newPaymentTerms.term3) {
              setShowPaymentTerms(true);
            }
          }
          
          // Map notes from API response
          if (poContext.notes && poContext.notes.length > 0) {
            const newNotes = {
              note1: poContext.notes[0]?.text || "",
              note2: poContext.notes[1]?.text || "",
              note3: poContext.notes[2]?.text || "",
            };
            setNotes(newNotes);
            
            // Show notes section if any notes exist
            if (newNotes.note1 || newNotes.note2 || newNotes.note3) {
              setShowNotes(true);
            }
          }
          
          // Map taxes from API response
          if (poContext.taxes && poContext.taxes.length > 0) {
            const newTaxes = poContext.taxes.slice(0, 3).map((tax: Tax) => ({
              label: tax.label || "",
              value: tax.value ? tax.value.toString() : "",
            }));
            
            // Fill remaining slots with empty values if less than 3 taxes
            while (newTaxes.length < 3) {
              newTaxes.push({ label: "", value: "" });
            }
            
            setTaxes(newTaxes);
            
            // Show taxes section if any taxes exist
            const hasTaxes = newTaxes.some((tax: Tax) => tax.label || tax.value);
            if (hasTaxes) {
              setShowTaxes(true);
            }
          }
          
          // Map invoice plan from API response
          if (poContext.invoicePlan && poContext.invoicePlan.length > 0) {
            const newInvoicePlan = poContext.invoicePlan.slice(0, 3).map(invoice => ({
              invoiceDate: invoice.invoiceDate || "",
              amount: invoice.amount ? invoice.amount.toString() : "",
            }));
            
            // Fill remaining slots with empty values if less than 3 invoices
            while (newInvoicePlan.length < 3) {
              newInvoicePlan.push({ invoiceDate: "", amount: "" });
            }
            
            setInvoicePlan(newInvoicePlan);
            
            // Show invoice plan section if any invoices exist
            const hasInvoices = newInvoicePlan.some(invoice => invoice.invoiceDate || invoice.amount);
            if (hasInvoices) {
              setShowInvoicePlan(true);
            }
          }
          
          // Map budget allocations from API response
          if (poContext.budgetAllocations && poContext.budgetAllocations.length > 0) {
            const newBudgetAllocations = poContext.budgetAllocations.slice(0, 3).map(budget => ({
              divisionId: budget.divisionId ? budget.divisionId.toString() : "",
              subgroupId: budget.subgroupId ? budget.subgroupId.toString() : "",
              costHeadAmount: budget.amount ? budget.amount.toString() : "",
            }));
            
            setBudgetAllocationRows(newBudgetAllocations);
            
            // Show budget allocation section if any allocations exist
            if (newBudgetAllocations.length > 0) {
              setShowBudgetAllocation(true);
              // Load groups when section is opened
              loadGroups();
              // Load subgroups for each row that has a divisionId
              newBudgetAllocations.forEach((row, index) => {
                if (row.divisionId) {
                  loadSubgroups(row.divisionId, index);
                }
              });
            }
          }
          
          // Map quotation specifications for modal display
          if (poContext.quotationSpecifications && poContext.quotationSpecifications.length > 0) {
            // Determine the number of vendors from the first specification's vendorCells
            const vendorCount = poContext.quotationSpecifications[0]?.vendorCells?.length || 0;
            
            const mappedSpecifications: SpecificationRow[] = poContext.quotationSpecifications.map((spec: {
              specificationId: number;
              specificationName: string;
              fieldType: string;
              vendorCells: Array<{
                textValue?: string;
                value?: string;
                fileUrl?: string;
                vendorId?: number;
                vendorName?: string;
              }>;
            }) => ({
              specificationId: spec.specificationId,
              specificationName: spec.specificationName,
              fieldType: (spec.fieldType || 'text') as 'text' | 'checkbox' | 'hyperlink' | 'dropdown',
              vendorCells: spec.vendorCells.map(cell => ({
                value: cell.textValue || cell.value || '',
                fileUrl: cell.fileUrl,
                vendorId: cell.vendorId,
                vendorName: cell.vendorName,
              })),
            }));
            
            setQuotationSpecTableData({
              vendorsToShow: vendorCount,
              specifications: mappedSpecifications,
            });
          }
          
          console.log('Create PO Page - Form data updated');
          
          // Mark form as pre-filled to make fields read-only
          setIsPreFilled(true);
          
          // Clear sessionStorage after retrieving data
          sessionStorage.removeItem('createPOData');
        } catch (error) {
          console.error('Error parsing stored PO context data:', error);
        }
      } else {
        console.log('Create PO Page - No data found in sessionStorage or URL');
      }
    };
    
    fetchAndFillData();
  }, [searchParams, toast]);

  // Handle input change
  const handleInputChange = (field: keyof CreatePOFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Check if Add Item button should be enabled
  const isAddItemEnabled = () => {
    const selectedPoType = poTypes.find(type => type.poTypeId.toString() === formData.poType);
    const isRateBasedPO = selectedPoType && selectedPoType.poTypeName ? selectedPoType.poTypeName.toLowerCase().includes('rate based') : false;

    // Required fields for all PO types
    const baseFieldsFilled = 
      formData.template &&
      formData.poType &&
      formData.paymentTerm &&
      formData.quantity &&
      formData.unitPrice &&
      formData.itemDescription &&
      formData.itemDescription.trim() !== '' &&
      !isNaN(Number(formData.quantity)) &&
      Number(formData.quantity) > 0 &&
      !isNaN(Number(formData.unitPrice)) &&
      Number(formData.unitPrice) > 0;

    // Additional required fields for Rate Based PO
    if (isRateBasedPO) {
      return baseFieldsFilled &&
        formData.validityStartDate &&
        formData.validityEndDate &&
        formData.maxValue &&
        !isNaN(Number(formData.maxValue)) &&
        Number(formData.maxValue) > 0;
    }

    return baseFieldsFilled;
  };

  // Handle add/update item
  const handleAddItem = () => {
    if (!isAddItemEnabled()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields before adding an item',
        variant: 'destructive',
      });
      return;
    }

    // Check if it's Rate Based PO
    const selectedPoType = poTypes.find(type => type.poTypeId.toString() === formData.poType);
    const isRateBasedPO = selectedPoType && selectedPoType.poTypeName ? selectedPoType.poTypeName.toLowerCase().includes('rate based') : false;

    // Validate Start Date vs End Date for Rate Based PO
    if (isRateBasedPO && formData.validityStartDate && formData.validityEndDate) {
      const startDate = new Date(formData.validityStartDate);
      const endDate = new Date(formData.validityEndDate);
      if (startDate > endDate) {
        setErrors(prev => ({
          ...prev,
          validityStartDate: 'Start Date cannot be greater than End Date'
        }));
        toast({
          title: 'Validation Error',
          description: 'Start Date cannot be greater than End Date',
          variant: 'destructive',
        });
        return;
      }
    }

    // Validate Unit Price vs Max Value for Rate Based PO
    if (isRateBasedPO && formData.maxValue && Number(formData.unitPrice) > Number(formData.maxValue)) {
      setErrors(prev => ({
        ...prev,
        unitPrice: 'Unit Price cannot exceed Max Value'
      }));
      toast({
        title: 'Validation Error',
        description: 'Unit Price cannot exceed Max Value',
        variant: 'destructive',
      });
      return;
    }

    // Clear any previous errors for unitPrice and validityStartDate
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.unitPrice;
      delete newErrors.validityStartDate;
      return newErrors;
    });

    const quantity = Number(formData.quantity);
    const unitCost = Number(formData.unitPrice);
    const totalCost = quantity * unitCost;

    const newItem: POItem = {
      id: editingItemId || Date.now().toString(),
      quantity: formData.quantity,
      unitCost: formData.unitPrice,
      description: formData.itemDescription,
      totalCost: totalCost,
      template: formData.template,
      poType: formData.poType,
      validityStartDate: isRateBasedPO ? formData.validityStartDate : undefined,
      validityEndDate: isRateBasedPO ? formData.validityEndDate : undefined,
      maxValue: isRateBasedPO ? formData.maxValue : undefined,
    };

    let updatedItems: POItem[];
    if (editingItemId) {
      // Update existing item
      updatedItems = items.map(item => item.id === editingItemId ? newItem : item);
      setEditingItemId(null);
      toast({
        title: 'Success',
        description: 'Item updated successfully',
        variant: 'success',
      });
    } else {
      // Add new item
      updatedItems = [...items, newItem];
      toast({
        title: 'Success',
        description: 'Item added successfully',
        variant: 'success',
      });
    }

    setItems(updatedItems);
    
    // Save to localStorage
    const requestId = searchParams.get('requestId');
    if (requestId) {
      const cacheKey = `purchaseOrderItems_${requestId}`;
      localStorage.setItem(cacheKey, JSON.stringify(updatedItems));
      console.log('Items saved to cache:', updatedItems);
    }

    // Clear input fields
    setFormData(prev => ({
      ...prev,
      quantity: '',
      unitPrice: '',
      itemDescription: '',
    }));
  };

  // Handle edit item
  const handleEditItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      setFormData(prev => ({
        ...prev,
        template: item.template || prev.template,
        poType: item.poType || prev.poType,
        quantity: item.quantity,
        unitPrice: item.unitCost,
        itemDescription: item.description,
        validityStartDate: item.validityStartDate || '',
        validityEndDate: item.validityEndDate || '',
        maxValue: item.maxValue || '',
      }));
      setEditingItemId(itemId);
      
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle delete item confirmation
  const handleDeleteItemClick = (itemId: string) => {
    setItemToDelete(itemId);
    setShowDeleteConfirmation(true);
  };

  // Confirm delete item
  const confirmDeleteItem = () => {
    if (itemToDelete) {
      const updatedItems = items.filter(item => item.id !== itemToDelete);
      setItems(updatedItems);
      
      // Clear editing state if the deleted item was being edited
      if (editingItemId === itemToDelete) {
        setEditingItemId(null);
      }
      
      // Update localStorage
      const requestId = searchParams.get('requestId');
      if (requestId) {
        const cacheKey = `purchaseOrderItems_${requestId}`;
        if (updatedItems.length > 0) {
          localStorage.setItem(cacheKey, JSON.stringify(updatedItems));
        } else {
          localStorage.removeItem(cacheKey);
        }
        console.log('Item deleted, cache updated');
      }
      
      toast({
        title: 'Success',
        description: 'Item deleted successfully',
        variant: 'success',
      });
    }
    
    setShowDeleteConfirmation(false);
    setItemToDelete(null);
  };

  // Cancel delete item
  const cancelDeleteItem = () => {
    setShowDeleteConfirmation(false);
    setItemToDelete(null);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingItemId(null);
    setFormData(prev => ({
      ...prev,
      quantity: '',
      unitPrice: '',
      itemDescription: '',
    }));
  };

  // Handle payment term input change
  const handlePaymentTermChange = (field: keyof typeof paymentTerms, value: string) => {
    setPaymentTerms((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle add payment terms
  const handleAddPaymentTerms = () => {
    setShowPaymentTerms(true);
  };

  // Handle clear payment terms
  const handleClearPaymentTerms = () => {
    const hasContent = paymentTerms.term1 || paymentTerms.term2 || paymentTerms.term3;
    
    if (hasContent) {
      setShowClearConfirmation(true);
    } else {
      setShowPaymentTerms(false);
    }
  };

  // Confirm clear payment terms
  const confirmClearPaymentTerms = () => {
    setPaymentTerms({ term1: "", term2: "", term3: "" });
    setShowPaymentTerms(false);
    setShowClearConfirmation(false);
  };

  // Cancel clear payment terms
  const cancelClearPaymentTerms = () => {
    setShowClearConfirmation(false);
  };

  // Handle note input change
  const handleNoteChange = (field: keyof typeof notes, value: string) => {
    setNotes((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle add notes
  const handleAddNotes = () => {
    setShowNotes(true);
  };

  // Handle clear notes
  const handleClearNotes = () => {
    const hasContent = notes.note1 || notes.note2 || notes.note3;
    
    if (hasContent) {
      setShowClearNotesConfirmation(true);
    } else {
      setShowNotes(false);
    }
  };

  // Confirm clear notes
  const confirmClearNotes = () => {
    setNotes({ note1: "", note2: "", note3: "" });
    setShowNotes(false);
    setShowClearNotesConfirmation(false);
  };

  // Cancel clear notes
  const cancelClearNotes = () => {
    setShowClearNotesConfirmation(false);
  };

  // Handle invoice plan input change
  const handleInvoicePlanChange = (index: number, field: 'invoiceDate' | 'amount', value: string) => {
    setInvoicePlan((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // Handle add invoice plan
  const handleAddInvoicePlan = () => {
    setShowInvoicePlan(true);
  };

  // Handle clear invoice plan
  const handleClearInvoicePlan = () => {
    const hasContent = invoicePlan.some(row => row.invoiceDate || row.amount);
    
    if (hasContent) {
      setShowClearInvoicePlanConfirmation(true);
    } else {
      setShowInvoicePlan(false);
    }
  };

  // Confirm clear invoice plan
  const confirmClearInvoicePlan = () => {
    setInvoicePlan([
      { invoiceDate: "", amount: "" },
      { invoiceDate: "", amount: "" },
      { invoiceDate: "", amount: "" },
    ]);
    setShowInvoicePlan(false);
    setShowClearInvoicePlanConfirmation(false);
  };

  // Cancel clear invoice plan
  const cancelClearInvoicePlan = () => {
    setShowClearInvoicePlanConfirmation(false);
  };

  // Handle tax input change
  const handleTaxChange = (index: number, field: 'label' | 'value', value: string) => {
    setTaxes((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // Handle add taxes
  const handleAddTaxes = () => {
    setShowTaxes(true);
  };

  // Handle clear taxes
  const handleClearTaxes = () => {
    const hasContent = taxes.some(row => row.label || row.value) || otherTaxes.trim() !== '';
    
    if (hasContent) {
      setShowClearTaxesConfirmation(true);
    } else {
      setShowTaxes(false);
    }
  };

  // Confirm clear taxes
  const confirmClearTaxes = () => {
    setTaxes([
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
    ]);
    setOtherTaxes("");
    setShowTaxes(false);
    setShowClearTaxesConfirmation(false);
  };

  // Cancel clear taxes
  const cancelClearTaxes = () => {
    setShowClearTaxesConfirmation(false);
  };

  // Calculate Sub Total (Sum of all items in table)
  const calculateSubTotal = (): number => {
    return items.reduce((total, item) => total + item.totalCost, 0);
  };

  // Calculate Subtotal after Discount
  const calculateSubtotalAfterDiscount = (): number => {
    const subTotal = calculateSubTotal();
    
    // Only apply discount if there are items
    if (items.length === 0) {
      return 0;
    }
    
    const discount = parseFloat(formData.discount) || 0;
    return subTotal - discount;
  };

  // Calculate total taxes
  const calculateTotalTaxes = (): number => {
    // Only calculate taxes if there are items
    if (!showTaxes || items.length === 0) return 0;
    
    return taxes.reduce((total, tax) => {
      const taxValue = parseFloat(tax.value) || 0;
      return total + taxValue;
    }, 0);
  };

  // Calculate Grand Total
  const calculateGrandTotal = (): number => {
    // If no items, grand total is always 0
    if (items.length === 0) {
      return 0;
    }
    
    const subtotalAfterDiscount = calculateSubtotalAfterDiscount();
    const totalTaxes = calculateTotalTaxes();
    return subtotalAfterDiscount + totalTaxes;
  };

  // Load groups from API
  const loadGroups = async () => {
    setLoadingGroups(true);
    try {
      const envConfig = {
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vmsqa-ver2.compunnel.com/api'
      };

      const response = await fetch(`${envConfig.apiBaseUrl}/lookups/groups`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch groups: ${response.status}`);
      }

      const result = await response.json();
      console.log('Groups API Response:', result);
      
      // Handle multiple response formats
      let groupsData = [];
      if (Array.isArray(result)) {
        groupsData = result;
      } else if (result.items && Array.isArray(result.items)) {
        groupsData = result.items;
      } else if (result.data && Array.isArray(result.data)) {
        groupsData = result.data;
      } else if (result.Data && Array.isArray(result.Data)) {
        groupsData = result.Data;
      }
      
      if (groupsData.length > 0) {
        const groups = groupsData
          .map((group: any) => ({
            id: (group.value || group.id || group.Value || group.Id)?.toString() || '',
            name: group.text || group.name || group.Text || group.Name || 'Unknown'
          }))
          .filter((group: any) => group.id && group.id !== '-1' && group.name !== 'Unknown');
        
        setGroupOptions(groups);
        console.log('Mapped Groups:', groups);
      } else {
        console.warn('No groups data found in response');
        setGroupOptions([]);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: 'Error',
        description: 'Failed to load groups. Please try again.',
        variant: 'destructive',
      });
      setGroupOptions([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  // Load subgroups for a specific group
  const loadSubgroups = async (groupId: string, rowIndex: number) => {
    if (!groupId) {
      setSubgroupOptions(prev => ({ ...prev, [rowIndex]: [] }));
      return;
    }
    
    setLoadingSubgroups(prev => ({ ...prev, [rowIndex]: true }));
    try {
      console.log(`Loading subgroups for group ${groupId}, row ${rowIndex}`);
      const subgroups = await subgroupsService.getSubgroupsByGroupId(Number(groupId));
      console.log('Subgroups loaded:', subgroups);
      setSubgroupOptions(prev => ({ ...prev, [rowIndex]: subgroups }));
    } catch (error) {
      console.error('Error fetching subgroups:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subgroups. Please try again.',
        variant: 'destructive',
      });
      setSubgroupOptions(prev => ({ ...prev, [rowIndex]: [] }));
    } finally {
      setLoadingSubgroups(prev => ({ ...prev, [rowIndex]: false }));
    }
  };

  // Handle add budget allocation
  const handleAddBudgetAllocation = () => {
    setShowBudgetAllocation(true);
    setBudgetAllocationRows([{ divisionId: '', subgroupId: '', costHeadAmount: '' }]);
    // Load groups when section is opened (always refresh to get latest data)
    loadGroups();
  };

  // Handle clear budget allocation
  const handleClearBudgetAllocation = () => {
    const hasContent = budgetAllocationRows.some(row => row.divisionId || row.subgroupId || row.costHeadAmount);
    
    if (hasContent) {
      setShowClearBudgetConfirmation(true);
    } else {
      setShowBudgetAllocation(false);
      setBudgetAllocationRows([]);
      setSubgroupOptions({});
    }
  };

  // Confirm clear budget allocation
  const confirmClearBudgetAllocation = () => {
    setBudgetAllocationRows([]);
    setShowBudgetAllocation(false);
    setShowClearBudgetConfirmation(false);
    setSubgroupOptions({});
  };

  // Cancel clear budget allocation
  const cancelClearBudgetAllocation = () => {
    setShowClearBudgetConfirmation(false);
  };

  // Handle budget allocation group change
  const handleBudgetGroupChange = (rowIndex: number, divisionId: string) => {
    setBudgetAllocationRows(prev => {
      const updated = [...prev];
      updated[rowIndex] = { divisionId, subgroupId: '', costHeadAmount: prev[rowIndex].costHeadAmount }; // Reset subgroup when group changes, keep costHeadAmount
      return updated;
    });
    
    // Load subgroups for the selected group
    if (divisionId) {
      loadSubgroups(divisionId, rowIndex);
    } else {
      // Clear subgroups if no group selected
      setSubgroupOptions(prev => ({ ...prev, [rowIndex]: [] }));
    }
  };

  // Handle budget allocation subgroup change
  const handleBudgetSubgroupChange = (rowIndex: number, subgroupId: string) => {
    setBudgetAllocationRows(prev => {
      const updated = [...prev];
      updated[rowIndex].subgroupId = subgroupId;
      return updated;
    });
  };

  // Handle budget allocation cost head amount change
  const handleBudgetCostHeadAmountChange = (rowIndex: number, costHeadAmount: string) => {
    setBudgetAllocationRows(prev => {
      const updated = [...prev];
      updated[rowIndex].costHeadAmount = costHeadAmount;
      return updated;
    });
  };

  // Handle add more budget allocation rows (max 3)
  const handleAddBudgetRow = () => {
    if (budgetAllocationRows.length < 3) {
      setBudgetAllocationRows(prev => [...prev, { divisionId: '', subgroupId: '', costHeadAmount: '' }]);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Check if at least one item is added to the table FIRST
    if (items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one item before saving.",
        variant: "destructive",
      });
      return false;
    }

    // Basic validation for Save/Submit: Template, PO Type, Payment Term
    if (!formData.template) {
      newErrors.template = "Template is required";
    }
    
    if (!formData.poType) {
      newErrors.poType = "PO Type is required";
    }
    
    if (!formData.paymentTerm) {
      newErrors.paymentTerm = "Payment Term is required";
    }

    // Tax pair validation: If either Tax Name OR Tax Value is filled, BOTH must be filled
    if (showTaxes) {
      const incompleteTaxRows = taxes.filter((tax: Tax) => {
        const hasLabel = tax.label && tax.label.trim() !== '';
        const hasValue = tax.value && tax.value.trim() !== '';
        // Return true if one is filled but not both
        return (hasLabel && !hasValue) || (!hasLabel && hasValue);
      });

      if (incompleteTaxRows.length > 0) {
        toast({
          title: "Validation Error",
          description: "Both Tax Name and Tax Value are required for each tax entry",
          variant: "destructive",
        });
        return false;
      }
    }

    // Invoice Plan pair validation: If either Invoice Date OR Amount is filled, BOTH must be filled
    if (showInvoicePlan) {
      const incompleteInvoiceRows = invoicePlan.filter(plan => {
        const hasDate = plan.invoiceDate && plan.invoiceDate.trim() !== '';
        const hasAmount = plan.amount && plan.amount.trim() !== '';
        // Return true if one is filled but not both
        return (hasDate && !hasAmount) || (!hasDate && hasAmount);
      });

      if (incompleteInvoiceRows.length > 0) {
        toast({
          title: "Validation Error",
          description: "Both Invoice Date and Amount are required for each projected invoice entry",
          variant: "destructive",
        });
        return false;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  // Build request payload for API
  const buildRequestPayload = (action: "Save" | "Submit") => {
    const requestId = searchParams.get('requestId');

    // Build lines array from items
    const lines = items.map((item) => ({
      quantity: parseFloat(item.quantity) || 0,
      unitCost: parseFloat(item.unitCost) || 0,
      description: item.description || "",
      orderQuantityId: 0,
    }));

    // Build taxes array
    const taxesArray = showTaxes
      ? taxes
          .filter((tax: Tax) => tax.label && tax.value)
          .map((tax: Tax) => ({
            label: tax.label,
            value: parseFloat(tax.value) || 0,
          }))
      : [];

    // Build notes array
    const notesArray = showNotes
      ? Object.values(notes)
          .filter((note) => note.trim() !== "")
          .map((note) => ({ text: note }))
      : [];

    // Build payment terms array
    const paymentTermsArray = showPaymentTerms
      ? Object.values(paymentTerms)
          .filter((term) => term.trim() !== "")
          .map((term) => ({ term: term }))
      : [];

    // Build budget allocations array
    const budgetAllocationsArray = showBudgetAllocation
      ? budgetAllocationRows
          .filter((row) => row.divisionId && row.subgroupId && row.costHeadAmount)
          .map((row) => ({
            divisionId: parseInt(row.divisionId) || 0,
            subgroupId: parseInt(row.subgroupId) || 0,
            amount: parseFloat(row.costHeadAmount) || 0,
          }))
      : [];

    // Build invoice plan array
    const invoicePlanArray = showInvoicePlan
      ? invoicePlan
          .filter((plan) => plan.invoiceDate && plan.amount)
          .map((plan) => ({
            invoiceDate: plan.invoiceDate,
            amount: parseFloat(plan.amount) || 0,
          }))
      : [];

    return {
      requestId: parseInt(requestId || "0") || 0,
      ...(purchaseOrderId ? { purchaseOrderId } : {}),
      purchaseOrderNumber: formData.purchaseOrderNumber || "",
      action: action,
      poType: parseInt(formData.poType) || 0,
      rateStartDate: formData.validityStartDate || null,
      rateEndDate: formData.validityEndDate || null,
      rateMaxValue: parseFloat(formData.maxValue) || 0,
      paymentTermNumeric: parseInt(formData.paymentTerm) || 0,
      templateType: parseInt(formData.template) || 0,
      subTotal: calculateSubTotal(),
      discount: parseFloat(formData.discount) || 0,
      subTotalAfterDiscount: calculateSubtotalAfterDiscount(),
      grandTotal: calculateGrandTotal(),
      rejectionReason: "",
      lines: lines,
      taxes: taxesArray,
      notes: notesArray,
      paymentTerms: paymentTermsArray,
      budgetAllocations: budgetAllocationsArray,
      invoicePlan: invoicePlanArray,
    };
  };

  // Handle Save (Draft)
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const payload = buildRequestPayload("Save");

      logger.info("Saving PO as draft with data:", payload);

      const response = await fetch(`${envConfig.apiBaseUrl}/purchase-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save Purchase Order');
      }

      const result = await response.json();
      logger.info("Save response:", result);

      toast({
        title: "Success",
        description: "Purchase Order saved as draft",
        variant: "success",
      });

      // NO REDIRECT - User stays on the page
    } catch (error: any) {
      logger.error("Error saving PO:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save Purchase Order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Save & Submit (Final)
  const handleSaveAndSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const payload = buildRequestPayload("Submit");

      logger.info("Submitting PO with data:", payload);

      const response = await fetch(`${envConfig.apiBaseUrl}/purchase-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit Purchase Order');
      }

      const result = await response.json();
      logger.info("Submit response:", result);

      toast({
        title: "Success",
        description: "Purchase Order submitted successfully",
        variant: "success",
      });

      // REDIRECT to Manage Quotations page
      router.push("/manage-quotations");
    } catch (error: any) {
      logger.error("Error submitting PO:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit Purchase Order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form submit is now handled by individual button clicks
  };

  // Handle cancel
  const handleCancel = () => {
    router.push("/manage-quotations");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Tooltip content="Go back to Manage Quotations" position="bottom">
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
              <h3 className="text-lg font-semibold">{searchParams.get('isEdit') === 'true' ? 'Edit Purchase Order' : 'Create Purchase Order'}</h3>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <h4 className="text-lg font-semibold text-gray-900">Purchase Order Details</h4>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {/* Request Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Request Description
                  </label>
                  <textarea
                    value={formData.requestDescription}
                    disabled
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 resize-none"
                  />
                </div>
              </div>



              {/* Editable Fields Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Quotation List */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Quotation List
                  </label>
                  <Input
                    value={formData.quotationList}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                {/* Quotation Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Quotation Description
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.quotationDescription}
                      disabled
                      className="bg-gray-50"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowQuotationModal(true)}
                      className="shrink-0"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>

                {/* Approved Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Approved Amount
                  </label>
                  <Input
                    type="text"
                    value={formData.approvedAmount}
                    onChange={(e) => handleInputChange("approvedAmount", e.target.value)}
                    disabled={isPreFilled}
                    className={isPreFilled ? "bg-gray-50" : ""}
                    placeholder="Enter approved amount"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Purchase Order # */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Purchase Order # {poNumberFromAPI && <span className="text-xs text-gray-500">(Auto-generated)</span>}
                  </label>
                  <Input
                    type="text"
                    value={formData.purchaseOrderNumber}
                    onChange={(e) => handleInputChange("purchaseOrderNumber", e.target.value)}
                    placeholder="Auto-generated or enter manually"
                    disabled={!!poNumberFromAPI}
                    className={poNumberFromAPI ? "bg-gray-50" : ""}
                  />
                </div>
                {/* Template */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Template <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.template}
                    onChange={(e) => handleInputChange("template", e.target.value)}
                    disabled={loadingTemplates}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white hover:border-gray-400 transition-colors duration-200 ${
                      loadingTemplates ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="">{loadingTemplates ? 'Loading Templates...' : 'Select Template'}</option>
                    {templates.map((template) => (
                      <option key={template.templateId} value={template.templateId.toString()}>
                        {template.templateName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PO Type * */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    PO Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.poType}
                    onChange={(e) => handleInputChange("poType", e.target.value)}
                    disabled={loadingPoTypes}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white hover:border-gray-400 transition-colors duration-200 ${
                      errors.poType ? "border-red-500" : "border-gray-300"
                    } ${loadingPoTypes ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <option value="">{loadingPoTypes ? 'Loading PO Types...' : 'Select PO Type'}</option>
                    {poTypes.map((type) => (
                      <option key={type.poTypeId} value={type.poTypeId.toString()}>
                        {type.poTypeName}
                      </option>
                    ))}
                  </select>
                  {errors.poType && (
                    <p className="text-sm text-red-500">{errors.poType}</p>
                  )}
                </div>

                {/* Validity Start Date * - Only show for Rate Based PO */}
                {(() => {
                  const selectedPoType = poTypes.find(type => type.poTypeId.toString() === formData.poType);
                  const isRateBasedPO = selectedPoType && selectedPoType.poTypeName ? selectedPoType.poTypeName.toLowerCase().includes('rate based') : false;
                  return isRateBasedPO ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Validity Start Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={formData.validityStartDate}
                        onChange={(e) => handleInputChange("validityStartDate", e.target.value)}
                        className={errors.validityStartDate ? "border-red-500" : ""}
                      />
                      {errors.validityStartDate && (
                        <p className="text-sm text-red-500">{errors.validityStartDate}</p>
                      )}
                    </div>
                  ) : null;
                })()}

                {/* Validity End Date * - Only show for Rate Based PO */}
                {(() => {
                  const selectedPoType = poTypes.find(type => type.poTypeId.toString() === formData.poType);
                  const isRateBasedPO = selectedPoType && selectedPoType.poTypeName ? selectedPoType.poTypeName.toLowerCase().includes('rate based') : false;
                  return isRateBasedPO ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Validity End Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={formData.validityEndDate}
                        onChange={(e) => handleInputChange("validityEndDate", e.target.value)}
                        className={errors.validityEndDate ? "border-red-500" : ""}
                      />
                      {errors.validityEndDate && (
                        <p className="text-sm text-red-500">{errors.validityEndDate}</p>
                      )}
                    </div>
                  ) : null;
                })()}

                {/* Max. Value * - Only show for Rate Based PO */}
                {(() => {
                  const selectedPoType = poTypes.find(type => type.poTypeId.toString() === formData.poType);
                  const isRateBasedPO = selectedPoType && selectedPoType.poTypeName ? selectedPoType.poTypeName.toLowerCase().includes('rate based') : false;
                  return isRateBasedPO ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Max. Value <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.maxValue}
                        onChange={(e) => handleInputChange("maxValue", e.target.value)}
                        placeholder="Enter maximum value"
                        className={errors.maxValue ? "border-red-500" : ""}
                      />
                      {errors.maxValue && (
                        <p className="text-sm text-red-500">{errors.maxValue}</p>
                      )}
                    </div>
                  ) : null;
                })()}

                {/* Payment Term * */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Payment Term <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.paymentTerm}
                    onChange={(e) => handleInputChange("paymentTerm", e.target.value)}
                    placeholder="e.g., Net 30, Net 60"
                    className={errors.paymentTerm ? "border-red-500" : ""}
                  />
                  {errors.paymentTerm && (
                    <p className="text-sm text-red-500">{errors.paymentTerm}</p>
                  )}
                </div>
              
                {/* Quantity * */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                    placeholder="Enter quantity"
                    className={errors.quantity ? "border-red-500" : ""}
                  />
                  {errors.quantity && (
                    <p className="text-sm text-red-500">{errors.quantity}</p>
                  )}
                </div>

                {/* Unit Price * */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Unit Price <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => handleInputChange("unitPrice", e.target.value)}
                    placeholder="Enter unit price"
                    className={errors.unitPrice ? "border-red-500" : ""}
                  />
                  {errors.unitPrice && (
                    <p className="text-sm text-red-500">{errors.unitPrice}</p>
                  )}
                </div>

                </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {/* Item Description * */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Item Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.itemDescription}
                    onChange={(e) => handleInputChange("itemDescription", e.target.value)}
                    placeholder="Enter item description"
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 resize-y ${
                      errors.itemDescription ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.itemDescription && (
                    <p className="text-sm text-red-500">{errors.itemDescription}</p>
                  )}
                </div>
              </div>

              {/* Add Item Button */}
              <div className="flex items-center gap-3 mt-4">
                <Button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!isAddItemEnabled()}
                  className={`gap-2 ${
                    !isAddItemEnabled() 
                      ? 'opacity-50 cursor-not-allowed bg-gray-400' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  {editingItemId ? 'Update Item' : 'Add Item'}
                </Button>
                {editingItemId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel Edit
                  </Button>
                )}
              </div>

              {/* Items Table */}
              {items.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-semibold text-gray-900">Items Added ({items.length})</h4>
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
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Actions
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
                              {parseFloat(item.unitCost).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 max-w-md">
                              <div className="line-clamp-2">
                                {item.description || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                              {item.totalCost.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditItem(item.id)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteItemClick(item.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
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
                            {items.reduce((sum, item) => sum + item.totalCost, 0).toFixed(2)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Pricing Calculation Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* Sub Total (Read-only/Calculated) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Sub Total
                  </label>
                  <Input
                    type="text"
                    value={calculateSubTotal().toFixed(2)}
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
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => handleInputChange("discount", e.target.value)}
                    placeholder="Enter discount amount"
                  />
                </div>

                {/* Subtotal after Discount (Read-only/Calculated) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Subtotal after Discount
                  </label>
                  <Input
                    type="text"
                    value={calculateSubtotalAfterDiscount().toFixed(2)}
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
                      value={calculateGrandTotal().toFixed(2)}
                      disabled
                      className="bg-blue-50 font-bold text-lg border-2 border-blue-300"
                    />
                  </div>
                </div>
              </div>

              {/* Taxes Section */}
              <div className="border-t pt-4 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Taxes</h4>
                  <Tooltip content={showTaxes ? "Clear Taxes" : "Add Taxes"}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={showTaxes ? handleClearTaxes : handleAddTaxes}
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      {showTaxes ? (
                        <Trash2 className="h-5 w-5 text-red-500" />
                      ) : (
                        <Plus className="h-5 w-5 text-blue-600" />
                      )}
                    </Button>
                  </Tooltip>
                </div>

                {showTaxes && (
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Tax Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Tax Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {taxes.map((row, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2">
                                <Input
                                  type="text"
                                  value={row.label}
                                  onChange={(e) => handleTaxChange(index, 'label', e.target.value)}
                                  placeholder={index === 0 ? "e.g., VAT" : index === 1 ? "e.g., GST" : "e.g., Service Tax"}
                                  className="border-0 focus:ring-0 shadow-none"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={row.value}
                                  onChange={(e) => handleTaxChange(index, 'value', e.target.value)}
                                  placeholder="0.00"
                                  className="border-0 focus:ring-0 shadow-none"
                                  // Remove spinner buttons
                                  style={{ MozAppearance: 'textfield' }}
                                  onWheel={(e) => e.target.blur()}
                                  // Additional CSS to hide spinners in different browsers
                                  onKeyDown={(e) => {
                                    // Prevent scrolling with arrow keys if needed
                                    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                      e.preventDefault();
                                    }
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Other Taxes</label>
                      <Input
                        type="text"
                        value={otherTaxes}
                        onChange={(e) => setOtherTaxes(e.target.value)}
                        placeholder="Enter any additional tax information (optional)"
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div className="border-t pt-4 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Notes</h4>
                  <Tooltip content={showNotes ? "Clear Notes" : "Add Notes"}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={showNotes ? handleClearNotes : handleAddNotes}
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      {showNotes ? (
                        <Trash2 className="h-5 w-5 text-red-500" />
                      ) : (
                        <Plus className="h-5 w-5 text-blue-600" />
                      )}
                    </Button>
                  </Tooltip>
                </div>

                {showNotes && (
                    
                  <div className="space-y-4 grid grid-cols-3 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Note 1
                      </label>
                      <Input
                        type="text"
                        value={notes.note1}
                        onChange={(e) => handleNoteChange("note1", e.target.value)}
                        placeholder="Enter note 1"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Note 2
                      </label>
                      <Input
                        type="text"
                        value={notes.note2}
                        onChange={(e) => handleNoteChange("note2", e.target.value)}
                        placeholder="Enter note 2"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Note 3
                      </label>
                      <Input
                        type="text"
                        value={notes.note3}
                        onChange={(e) => handleNoteChange("note3", e.target.value)}
                        placeholder="Enter note 3"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Terms Section */}
              <div className="border-t pt-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Payment Terms</h4>
                  <Tooltip content={showPaymentTerms ? "Clear Payment Terms" : "Add Payment Terms"}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={showPaymentTerms ? handleClearPaymentTerms : handleAddPaymentTerms}
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      {showPaymentTerms ? (
                        <Trash2 className="h-5 w-5 text-red-500" />
                      ) : (
                        <Plus className="h-5 w-5 text-blue-600" />
                      )}
                    </Button>
                  </Tooltip>
                </div>

                {showPaymentTerms && (
                    
                  <div className="space-y-4 grid grid-cols-3 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Term 1
                      </label>
                      <Input
                        type="text"
                        value={paymentTerms.term1}
                        onChange={(e) => handlePaymentTermChange("term1", e.target.value)}
                        placeholder="Enter payment term 1"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Term 2
                      </label>
                      <Input
                        type="text"
                        value={paymentTerms.term2}
                        onChange={(e) => handlePaymentTermChange("term2", e.target.value)}
                        placeholder="Enter payment term 2"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Term 3
                      </label>
                      <Input
                        type="text"
                        value={paymentTerms.term3}
                        onChange={(e) => handlePaymentTermChange("term3", e.target.value)}
                        placeholder="Enter payment term 3"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Project/Proposal Budget Allocation Section */}
              <div className="border-t pt-4 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Project/Proposal Budget Allocation</h4>
                  <Tooltip content={showBudgetAllocation ? "Clear Budget Allocation" : "Add Project/Proposal Budget Allocation"}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={showBudgetAllocation ? handleClearBudgetAllocation : handleAddBudgetAllocation}
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      {showBudgetAllocation ? (
                        <Trash2 className="h-5 w-5 text-red-500" />
                      ) : (
                        <Plus className="h-5 w-5 text-blue-600" />
                      )}
                    </Button>
                  </Tooltip>
                </div>

                {showBudgetAllocation && (
                  <div className="space-y-4">
                    {budgetAllocationRows.map((row, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                        {/* Group Dropdown */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Group {index + 1}
                          </label>
                          <select
                            value={row.divisionId}
                            onChange={(e) => handleBudgetGroupChange(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white hover:border-gray-400 transition-colors duration-200"
                            disabled={loadingGroups}
                          >
                            <option value="">
                              {loadingGroups ? 'Loading groups...' : 'Select Group'}
                            </option>
                            {groupOptions.map((group) => (
                              <option key={group.id} value={group.id}>
                                {group.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Subgroup Dropdown */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Subgroup {index + 1}
                          </label>
                          <select
                            value={row.subgroupId}
                            onChange={(e) => handleBudgetSubgroupChange(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0152ef] focus:border-blue-500 bg-white hover:border-gray-400 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            disabled={!row.divisionId || loadingSubgroups[index]}
                          >
                            <option value="">
                              {!row.divisionId 
                                ? 'Select Group First' 
                                : loadingSubgroups[index] 
                                ? 'Loading subgroups...' 
                                : 'Select Subgroup'}
                            </option>
                            {subgroupOptions[index]?.map((subgroup) => (
                              <option key={subgroup.id} value={subgroup.id}>
                                {subgroup.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Cost Head Amt. Input */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Cost Head Amt.
                          </label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.costHeadAmount}
                            onChange={(e) => handleBudgetCostHeadAmountChange(index, e.target.value)}
                            placeholder="Enter amount"
                            className="w-full"
                          />
                        </div>
                      </div>
                    ))}

                    {/* Add Row Button - Only show if less than 3 rows */}
                    {budgetAllocationRows.length < 3 && (
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddBudgetRow}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Another Row ({budgetAllocationRows.length}/3)
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Projected Invoice Plan Section */}
              <div className="border-t pt-4 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Projected Invoice Plan</h4>
                  <Tooltip content={showInvoicePlan ? "Clear Invoice Plan" : "Add Invoice Plan"}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={showInvoicePlan ? handleClearInvoicePlan : handleAddInvoicePlan}
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      {showInvoicePlan ? (
                        <Trash2 className="h-5 w-5 text-red-500" />
                      ) : (
                        <Plus className="h-5 w-5 text-blue-600" />
                      )}
                    </Button>
                  </Tooltip>
                </div>

                {showInvoicePlan && (
                  <div className="space-y-4">
                    {invoicePlan.map((row, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Invoice {index + 1} Date
                          </label>
                          <Input
                            type="date"
                            value={row.invoiceDate}
                            onChange={(e) => handleInvoicePlanChange(index, 'invoiceDate', e.target.value)}
                            placeholder="Select date"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Amount
                          </label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.amount}
                            onChange={(e) => handleInvoicePlanChange(index, 'amount', e.target.value)}
                            placeholder="Enter amount"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSave}
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveAndSubmit}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save & Submit
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Quotation Description Modal */}
      {showQuotationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowQuotationModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Quotation Description</h3>
              <button
                onClick={() => setShowQuotationModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="px-6 py-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700 min-w-[60px]">S. No.</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700 min-w-[200px]">Specification</th>
                      {quotationSpecTableData.specifications.length > 0 && 
                        quotationSpecTableData.specifications[0].vendorCells.map((cell, vendorIndex) => (
                          <th 
                            key={vendorIndex} 
                            className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700 min-w-[150px]"
                          >
                            {cell.vendorName || `Vendor ${vendorIndex + 1}`}
                          </th>
                        ))
                      }
                    </tr>
                  </thead>
                  <tbody>
                    {quotationSpecTableData.specifications.length > 0 ? (
                      quotationSpecTableData.specifications.map((spec, rowIndex) => (
                        <tr key={spec.specificationId} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">{rowIndex + 1}.</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900">{spec.specificationName}</td>
                          {spec.vendorCells.map((cell, cellIndex) => (
                            <td key={cellIndex} className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                              {spec.fieldType === 'hyperlink' && cell.fileUrl ? (
                                <a
                                  href={cell.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {cell.value || 'View Document'}
                                </a>
                              ) : spec.fieldType === 'checkbox' ? (
                                <span className={cell.value === 'true' || cell.value === 'Yes' ? 'text-green-600 font-medium' : 'text-gray-600'}>
                                  {cell.value === 'true' || cell.value === 'Yes' ? 'Yes' : 'No'}
                                </span>
                              ) : (
                                cell.value || '-'
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                          No specification data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end">
              <Button
                onClick={() => setShowQuotationModal(false)}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Payment Terms Confirmation Modal */}
      {showClearConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={cancelClearPaymentTerms}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Clear Payment Terms</h3>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-gray-700">Clear entered payment terms? Changes will be lost.</p>
            </div>
            
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <Button
                onClick={cancelClearPaymentTerms}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmClearPaymentTerms}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Notes Confirmation Modal */}
      {showClearNotesConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={cancelClearNotes}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Clear Notes</h3>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-gray-700">Clear entered notes? Changes will be lost.</p>
            </div>
            
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <Button
                onClick={cancelClearNotes}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmClearNotes}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Invoice Plan Confirmation Modal */}
      {showClearInvoicePlanConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={cancelClearInvoicePlan}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Clear Invoice Plan</h3>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-gray-700">Clear invoice plan? Changes will be lost.</p>
            </div>
            
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <Button
                onClick={cancelClearInvoicePlan}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmClearInvoicePlan}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Taxes Confirmation Modal */}
      {showClearTaxesConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={cancelClearTaxes}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Clear Taxes</h3>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-gray-700">Clear tax entries? Changes will be lost.</p>
            </div>
            
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <Button
                onClick={cancelClearTaxes}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmClearTaxes}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Budget Allocation Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showClearBudgetConfirmation}
        title="Clear Budget Allocation"
        message="Clear budget allocation? Changes will be lost."
        onConfirm={confirmClearBudgetAllocation}
        onCancel={cancelClearBudgetAllocation}
        confirmText="Clear"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Delete Item Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={confirmDeleteItem}
        onCancel={cancelDeleteItem}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </MainLayout>
  );
}

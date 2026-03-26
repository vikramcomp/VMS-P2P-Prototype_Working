"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, RotateCcw, Save } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { buildApiUrl } from "@/services/api-client";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth-service";

// API Response interfaces
interface PaymentOption {
  Id?: number;
  id?: number;
  Name?: string;
  name?: string;
}

interface PurchasingGroup {
  Value?: string;
  value?: string;
  Text?: string;
  text?: string;
}

interface FinanceHead {
  Id?: number;
  id?: number;
  Name?: string;
  name?: string;
}

interface Service {
  Id?: number;
  id?: number;
  Name?: string;
  name?: string;
}

interface Approver {
  Id?: number;
  id?: number;
  Name?: string;
  name?: string;
}

interface POVerifier {
  Id?: number;
  id?: number;
  Name?: string;
  name?: string;
}

// Form data interface
interface FormData {
  purchasingGroup: string;
  serviceName: string;
  paymentMode: string;
  vendorManager: string;
  conditionalWorkflow: boolean;
  approver1: string;
  approver2: string;
  approver3: string;
  approver4: string;
  approver2Condition: string;
  approver3Condition: string;
  approver4Condition: string;
  financeHead: string;
  poGenerator: string;
  poVerification: string;
  poDispatch: string;
}

interface AddNewWorkflowPageProps {}

// Helper function to extract approver arrays from data.data.records
function __helper_extractFromRecords(data: any) {
  if (Array.isArray(data?.data?.records) && data?.data?.records.length > 0) {
    const recordData = data.data.records[0];

    if (recordData.approver2List && Array.isArray(recordData.approver2List)) {
      const approver2Array = recordData.approver2List;
      const approver3Array =
        recordData.approver3List || recordData.approver2List;
      const approver4Array =
        recordData.approver4List || recordData.approver2List;
      return { approver2Array, approver3Array, approver4Array };
    }
  }
  return null;
}

// Helper function to extract approver arrays from direct properties
function __helper_extractFromDirectProperties(data: any) {
  if (data?.approver2List && Array.isArray(data.approver2List)) {
    const approver2Array = data.approver2List;
    const approver3Array = data.approver3List || data.approver2List;
    const approver4Array = data.approver4List || data.approver2List;
    return { approver2Array, approver3Array, approver4Array };
  }
  return null;
}

// Helper function to extract approver arrays from various data structures
function __helper_extractApproverArrays(data: any): {
  approver2Array: any[];
  approver3Array: any[];
  approver4Array: any[];
} {
  const fromRecords = __helper_extractFromRecords(data);
  if (fromRecords) return fromRecords;

  const fromDirectProps = __helper_extractFromDirectProperties(data);
  if (fromDirectProps) return fromDirectProps;

  if (Array.isArray(data)) {
    return { approver2Array: data, approver3Array: data, approver4Array: data };
  }

  if (Array.isArray(data?.Data?.Records)) {
    return {
      approver2Array: data.Data.Records,
      approver3Array: data.Data.Records,
      approver4Array: data.Data.Records,
    };
  }

  if (data?.data && Array.isArray(data.data)) {
    return {
      approver2Array: data.data,
      approver3Array: data.data,
      approver4Array: data.data,
    };
  }

  if (data?.result && Array.isArray(data.result)) {
    return {
      approver2Array: data.result,
      approver3Array: data.result,
      approver4Array: data.result,
    };
  }

  if (data && typeof data === "object") {
    const arrayProperty = Object.values(data).find((value) =>
      Array.isArray(value)
    );
    if (arrayProperty) {
      return {
        approver2Array: arrayProperty,
        approver3Array: arrayProperty,
        approver4Array: arrayProperty,
      };
    }
  }

  return { approver2Array: [], approver3Array: [], approver4Array: [] };
}

// Helper function to extract approver4 array from data.data.records
function __helper_extractApprover4FromRecords(data: any): any[] | null {
  if (Array.isArray(data?.data?.records) && data.data.records.length > 0) {
    const recordData = data.data.records[0];
    if (recordData.approver4List && Array.isArray(recordData.approver4List)) {
      return recordData.approver4List;
    }
  }
  return null;
}

// Helper function to extract approver4 array from direct properties
function __helper_extractApprover4FromDirectProps(data: any): any[] | null {
  if (data?.approver4List && Array.isArray(data.approver4List)) {
    return data.approver4List;
  }
  return null;
}

// Helper function to extract generic array from data structure
function __helper_extractGenericArray(data: any): any[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.Data?.Records)) {
    return data.Data.Records;
  }
  if (data?.data && Array.isArray(data.data)) {
    return data.data;
  }
  if (data?.result && Array.isArray(data.result)) {
    return data.result;
  }
  if (data && typeof data === "object") {
    const arrayProperty = Object.values(data).find((value) =>
      Array.isArray(value)
    );
    if (arrayProperty) {
      return arrayProperty;
    }
  }
  return [];
}

// Helper function to extract approver3 array from data structure
function __helper_extractApprover3Array(data: any): any[] {
  if (Array.isArray(data?.data?.records) && data.data.records.length > 0) {
    const recordData = data.data.records[0];
    if (recordData.approver3List && Array.isArray(recordData.approver3List)) {
      return recordData.approver3List;
    }
  }

  if (Array.isArray(data?.approver3List)) {
    return data.approver3List;
  }

  return __helper_extractGenericArray(data);
}

// Helper for vendor managers response processing
function processVendorManagersResponse(data: any): {
  vendorManager: string;
  poGenerator: string;
  poDispatch: string;
} {

  let vendorManager = "Auto-assigned";
  let poGenerator = "Auto-generated";
  let poDispatch = "Auto-dispatch";

  // Check for data.data.records array structure first (most common API response)
  if (
    Array.isArray(data?.data?.records) &&
    data?.data?.records.length > 0
  ) {
    const recordData = data.data.records[0];
    const extractedName = recordData.name || recordData.Name || recordData.label || recordData.Label;
    
    vendorManager = extractedName || recordData.vendorManager || recordData.VendorManager || "Auto-assigned";
    poGenerator = extractedName || recordData.poGenerator || recordData.POGenerator || recordData.PoGenerator || "Auto-generated";
    poDispatch = extractedName || recordData.poDispatch || recordData.PODispatch || recordData.PoDispatch || "Auto-dispatch";
  } 
  // Check for data.records array structure
  else if (Array.isArray(data?.records) && data?.records.length > 0) {
    const recordData = data.records[0];
    const extractedName = recordData.name || recordData.Name || recordData.label || recordData.Label;
    
    vendorManager = extractedName || recordData.vendorManager || recordData.VendorManager || "Auto-assigned";
    poGenerator = extractedName || recordData.poGenerator || recordData.POGenerator || recordData.PoGenerator || "Auto-generated";
    poDispatch = extractedName || recordData.poDispatch || recordData.PODispatch || recordData.PoDispatch || "Auto-dispatch";
  }
  // Check for direct label property
  else if (data?.label) {
    vendorManager = data.label;
    poGenerator = data.label;
    poDispatch = data.label;
  } 
  // Check for data.data object
  else if (data?.data) {
    const extractedName = data.data.name || data.data.Name || data.data.label || data.data.Label;
    
    vendorManager = extractedName || data.data.vendorManager || data.data.VendorManager || "Auto-assigned";
    poGenerator = extractedName || data.data.poGenerator || data.data.POGenerator || data.data.PoGenerator || "Auto-generated";
    poDispatch = extractedName || data.data.poDispatch || data.data.PODispatch || data.data.PoDispatch || "Auto-dispatch";
  } 
  // Check for direct properties
  else if (data) {
    const extractedName = data.name || data.Name || data.label || data.Label;
    
    vendorManager = extractedName || data.vendorManager || data.VendorManager || "Auto-assigned";
    poGenerator = extractedName || data.poGenerator || data.POGenerator || data.PoGenerator || "Auto-generated";
    poDispatch = extractedName || data.poDispatch || data.PODispatch || data.PoDispatch || "Auto-dispatch";
  }

  return { vendorManager, poGenerator, poDispatch };
}

export default function AddNewWorkflowPage({}: AddNewWorkflowPageProps = {}) {
  const router = useRouter();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    purchasingGroup: "",
    serviceName: "",
    paymentMode: "-1", // Default to "--Select--" option
    vendorManager: "Auto-assigned",
    conditionalWorkflow: false,
    approver1: "Requester",
    approver2: "",
    approver3: "",
    approver4: "",
    approver2Condition: "",
    approver3Condition: "",
    approver4Condition: "",
    financeHead: "-1", // Default to "--Select--" option
    poGenerator: "Auto-generated",
    poVerification: "",
    poDispatch: "Auto-dispatch",
  });

  // Payment options state
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [paymentOptionsLoading, setPaymentOptionsLoading] = useState(false);
  const [paymentOptionsError, setPaymentOptionsError] = useState<string | null>(
    null
  );

  // Purchasing groups state
  const [purchasingGroups, setPurchasingGroups] = useState<PurchasingGroup[]>(
    []
  );
  const [purchasingGroupsLoading, setPurchasingGroupsLoading] = useState(false);
  const [purchasingGroupsError, setPurchasingGroupsError] = useState<
    string | null
  >(null);

  // Finance heads state
  const [financeHeads, setFinanceHeads] = useState<FinanceHead[]>([]);
  const [financeHeadsLoading, setFinanceHeadsLoading] = useState(false);
  const [financeHeadsError, setFinanceHeadsError] = useState<string | null>(
    null
  );

  // Services state
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // Approvers state
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [approversLoading, setApproversLoading] = useState(false);
  const [approversError, setApproversError] = useState<string | null>(null);
  const [filteredApprovers3, setFilteredApprovers3] = useState<Approver[]>([]);
  const [filteredApprovers4, setFilteredApprovers4] = useState<Approver[]>([]);

  // Vendor managers state
  const [vendorManagersLoading, setVendorManagersLoading] = useState(false);

  // PO verifiers state
  const [poVerifiers, setPOVerifiers] = useState<POVerifier[]>([]);
  const [poVerifiersLoading, setPOVerifiersLoading] = useState(false);
  const [poVerifiersError, setPOVerifiersError] = useState<string | null>(null);

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function: Fetch payment options from API
  const __helper_fetchPaymentOptions = async () => {
    setPaymentOptionsLoading(true);
    setPaymentOptionsError(null);
    try {
      const response = await fetch(buildApiUrl("lookups/payment-options"));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const optionsWithDefault =
        processPaymentOptionsResponse(data);
      setPaymentOptions(optionsWithDefault);
    } catch (error) {
      console.error("Failed to fetch payment options:", error);
      setPaymentOptionsError(
        "Failed to load payment options. Please try again."
      );
      // Ensure we have at least the default option if API fails
      setPaymentOptions([{ Id: -1, Name: "--Select--" }]);
    } finally {
      setPaymentOptionsLoading(false);
    }
  };

  // Wrapper for API call
  const fetchPaymentOptions = __helper_fetchPaymentOptions;

  // Helper function: Fetch purchasing groups from API
  const __helper_fetchPurchasingGroups = async () => {
    setPurchasingGroupsLoading(true);
    setPurchasingGroupsError(null);
    try {
      const response = await fetch(buildApiUrl("lookups/groups"));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const optionsWithDefault =
        processPurchasingGroupsResponse(data);
      setPurchasingGroups(optionsWithDefault);
    } catch (error) {
      console.error("Failed to fetch purchasing groups:", error);
      setPurchasingGroupsError(
        "Failed to load purchasing groups. Please try again."
      );
      // Ensure we have at least the default option if API fails
      setPurchasingGroups([{ Value: "", Text: "--Select--" }]);
    } finally {
      setPurchasingGroupsLoading(false);
    }
  };

  // Wrapper for API call
  const fetchPurchasingGroups = __helper_fetchPurchasingGroups;

  // Helper function: Fetch finance heads from API
  const __helper_fetchFinanceHeads = async () => {
    setFinanceHeadsLoading(true);
    setFinanceHeadsError(null);
    try {
      const response = await fetch(
        buildApiUrl("workflow-editor/finance-heads")
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const optionsWithDefault =
        processFinanceHeadsResponse(data);
      setFinanceHeads(optionsWithDefault);
    } catch (error) {
      console.error("Failed to fetch finance heads:", error);
      setFinanceHeadsError("Failed to load finance heads. Please try again.");
      // Ensure we have at least the default option if API fails
      setFinanceHeads([{ Id: -1, Name: "--Select--" }]);
    } finally {
      setFinanceHeadsLoading(false);
    }
  };

  // Wrapper for API call
  const fetchFinanceHeads = __helper_fetchFinanceHeads;

  // Helper function: Fetch services from API based on groupId
  const __helper_fetchServices = async (groupId: string) => {
    if (!groupId || groupId === "") {
      // If no group selected, reset services to empty with default option
      setServices([{ Id: -1, id: -1, Name: "--Select--", name: "--Select--" }]);
      return;
    }

    setServicesLoading(true);
    setServicesError(null);
    try {
      const response = await fetch(
        buildApiUrl(`workflow-editor/services?groupId=${groupId}`)
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const optionsWithDefault = processServicesResponse(data);
      setServices(optionsWithDefault);
    } catch (error) {
      console.error("Failed to fetch services:", error);
      setServicesError("Failed to load services. Please try again.");
      // Ensure we have at least the default option if API fails
      setServices([{ Id: -1, id: -1, Name: "--Select--", name: "--Select--" }]);
    } finally {
      setServicesLoading(false);
    }
  };

  // Wrapper for API call
  const fetchServices = __helper_fetchServices;

  // Helper function: Fetch approvers from API based on groupId and current selections
  const __helper_fetchApprovers = async (
    groupId: string,
    selectedApprover2?: string,
    selectedApprover3?: string,
    selectedApprover4?: string
  ) => {
    if (!groupId || groupId === "") {
      // If no group selected, reset approvers to empty
      setApprovers([]);
      setFilteredApprovers3([]);
      setFilteredApprovers4([]);
      return;
    }

    setApproversLoading(true);
    setApproversError(null);
    try {
      let url = `workflow-editor/approvers?groupId=${groupId}`;

      // Add filters if provided
      if (selectedApprover2) {
        url += `&selectedApprover2=${selectedApprover2}`;
      }
      if (selectedApprover3) {
        url += `&selectedApprover3=${selectedApprover3}`;
      }
      if (selectedApprover4) {
        url += `&selectedApprover4=${selectedApprover4}`;
      }

      const response = await fetch(buildApiUrl(url));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const processed = processApproversResponse(data);
      
      // Update dropdowns with new data
      setApprovers(processed.approver2);
      setFilteredApprovers3(processed.approver3);
      setFilteredApprovers4(processed.approver4);

      // Validate and preserve current selections if they exist in new response
      setFormData((prev) => {
        const newData = { ...prev };
        
        // Check if current approver2 selection is still valid
        if (prev.approver2) {
          const isValid = processed.approver2.some(
            (a) => String(a.Id || a.id) === String(prev.approver2)
          );
          if (!isValid) {
            newData.approver2 = "";
          }
        }
        
        // Check if current approver3 selection is still valid
        if (prev.approver3) {
          const isValid = processed.approver3.some(
            (a) => String(a.Id || a.id) === String(prev.approver3)
          );
          if (!isValid) {
            newData.approver3 = "";
          }
        }
        
        // Check if current approver4 selection is still valid
        if (prev.approver4) {
          const isValid = processed.approver4.some(
            (a) => String(a.Id || a.id) === String(prev.approver4)
          );
          if (!isValid) {
            newData.approver4 = "";
          }
        }
        
        return newData;
      });
    } catch (error) {
      console.error("Failed to fetch approvers:", error);
      setApproversError("Failed to load approvers. Please try again.");
      setApprovers([]);
      setFilteredApprovers3([]);
      setFilteredApprovers4([]);
    } finally {
      setApproversLoading(false);
    }
  };

  // Wrapper for API call
  const fetchApprovers = __helper_fetchApprovers;

  // Helper function: Refetch approvers based on current form state
  const __helper_refetchApprovers = async () => {
    if (!formData.purchasingGroup) {
      return;
    }

    // Collect all current selections
    const currentApprover2 = formData.approver2 || undefined;
    const currentApprover3 = formData.approver3 || undefined;
    const currentApprover4 = formData.approver4 || undefined;

    // Fetch approvers with all current selections as parameters
    await __helper_fetchApprovers(
      formData.purchasingGroup,
      currentApprover2,
      currentApprover3,
      currentApprover4
    );
  };

  // Wrapper for API call
  const refetchApprovers = __helper_refetchApprovers;

  // Helper function: Handle filterApprovers3 error fallback (kept for test coverage)
  const __helper_filterApprovers3ErrorFallback = (
    selectedApprover2: string
  ) => {
    // On error, just filter locally by excluding selected approver 2
    const filtered = approvers.filter(
      (a) => String(a.Id || a.id) !== String(selectedApprover2)
    );
    setFilteredApprovers3(filtered);
  };

  // Helper function: Handle filterApprovers4 error fallback (kept for test coverage)
  const __helper_filterApprovers4ErrorFallback = (
    selectedApprover3: string
  ) => {
    // On error, just filter locally by excluding selected approver 3
    const filtered = approvers.filter(
      (a) => String(a.Id || a.id) !== String(selectedApprover3)
    );
    setFilteredApprovers4(filtered);
  };

  // Helper function: Fetch vendor managers from API based on serviceMapId
  const __helper_fetchVendorManagers = async (serviceMapId: string) => {
    if (!serviceMapId || serviceMapId === "") {
      // Reset to default values if no service selected
      setFormData((prev) => ({
        ...prev,
        vendorManager: "Auto-assigned",
        poGenerator: "Auto-generated",
        poDispatch: "Auto-dispatch",
      }));
      return;
    }

    setVendorManagersLoading(true);
    try {
      const response = await fetch(
        buildApiUrl(
          `workflow-editor/vendor-managers?serviceMapId=${serviceMapId}`
        )
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const { vendorManager, poGenerator, poDispatch } =
        processVendorManagersResponse(data);
      setFormData((prev) => ({
        ...prev,
        vendorManager,
        poGenerator,
        poDispatch,
      }));
    } catch (error) {
      console.error("Failed to fetch vendor managers:", error);
      // Keep default values on error
      setFormData((prev) => ({
        ...prev,
        vendorManager: "Auto-assigned",
        poGenerator: "Auto-generated",
        poDispatch: "Auto-dispatch",
      }));
    } finally {
      setVendorManagersLoading(false);
    }
  };

  // Wrapper for API call
  const fetchVendorManagers = __helper_fetchVendorManagers;

  // Helper function: Fetch PO verifiers from API based on paymentMode
  const __helper_fetchPOVerifiers = async (paymentMode: string) => {
    if (!paymentMode || paymentMode === "-1" || paymentMode === "") {
      // Reset to empty if no payment mode selected
      setPOVerifiers([]);
      setFormData((prev) => ({
        ...prev,
        poVerification: "",
      }));
      return;
    }

    setPOVerifiersLoading(true);
    setPOVerifiersError(null);
    try {
      const response = await fetch(
        buildApiUrl(`workflow-editor/po-verifiers?paymentMode=${paymentMode}`)
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const verifiers = processPOVerifiersResponse(data);
      setPOVerifiers(verifiers);
      // Reset PO verification selection when payment mode changes
      setFormData((prev) => ({
        ...prev,
        poVerification: "",
      }));
    } catch (error) {
      console.error("Failed to fetch PO verifiers:", error);
      setPOVerifiersError("Failed to load PO verifiers. Please try again.");
      setPOVerifiers([]);
      setFormData((prev) => ({
        ...prev,
        poVerification: "",
      }));
    } finally {
      setPOVerifiersLoading(false);
    }
  };

  // Wrapper for API call
  const fetchPOVerifiers = __helper_fetchPOVerifiers;

  // Fetch data on component mount
  useEffect(() => {
    fetchPaymentOptions();
    fetchPurchasingGroups();
    fetchFinanceHeads();
  }, []);

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // If purchasing group changes, fetch services and approvers for that group
    if (field === "purchasingGroup" && typeof value === "string") {
      fetchServices(value);
      fetchApprovers(value);
    }

    // If service name changes, fetch vendor managers
    if (field === "serviceName" && typeof value === "string") {
      fetchVendorManagers(value);
    }

    // If any approver changes, refetch all approver dropdowns with updated selections
    if (
      (field === "approver2" || field === "approver3" || field === "approver4") &&
      typeof value === "string"
    ) {
      // Build the current state with the new value (don't wait for React state update)
      const currentApprover2 = field === "approver2" ? value : (formData.approver2 || undefined);
      const currentApprover3 = field === "approver3" ? value : (formData.approver3 || undefined);
      const currentApprover4 = field === "approver4" ? value : (formData.approver4 || undefined);

      // Fetch approvers with ALL current selections (including the one just selected)
      if (formData.purchasingGroup) {
        __helper_fetchApprovers(
          formData.purchasingGroup,
          currentApprover2,
          currentApprover3,
          currentApprover4
        );
      }
    }

    // If payment mode changes, fetch PO verifiers based on the selection
    if (field === "paymentMode" && typeof value === "string") {
      fetchPOVerifiers(value);
    }
  };

  // Check if form is valid (all mandatory fields filled)
  const isFormValid = () => {
    // Mandatory fields: purchasingGroup, serviceName, paymentMode, financeHead
    // Plus at least one approver (2, 3, or 4) must be selected
    const atLeastOneApproverSelected = 
      (formData.approver2 && formData.approver2 !== "") ||
      (formData.approver3 && formData.approver3 !== "") ||
      (formData.approver4 && formData.approver4 !== "");

    return (
      formData.purchasingGroup !== "" &&
      formData.serviceName !== "" &&
      formData.paymentMode !== "-1" &&
      formData.paymentMode !== "" &&
      formData.financeHead !== "-1" &&
      formData.financeHead !== "" &&
      atLeastOneApproverSelected
    );
  };

  // Helper function: Handle successful workflow creation
  const __helper_handleWorkflowSuccess = (data: any) => {
    // Show success toast
    toast({
      title: "Success",
      description: "Workflow created successfully!",
      variant: "success",
    });

    // Navigate back to workflows list
    setTimeout(() => {
      router.push("/workflows");
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!isFormValid()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare request body according to API specification
      const requestBody = {
        workflowId: null, // Must be null for create
        groupId: Number.parseInt(formData.purchasingGroup),
        serviceMapId: Number.parseInt(formData.serviceName),
        paymentMode: Number.parseInt(formData.paymentMode),
        comparisionFactor: "", // Blank for new workflow
        approver2: formData.approver2 ? Number.parseInt(formData.approver2) : 0,
        approver3: formData.approver3 ? Number.parseInt(formData.approver3) : 0,
        approver4: formData.approver4 ? Number.parseInt(formData.approver4) : 0,
        financeHead: Number.parseInt(formData.financeHead),
        poVerification: formData.poVerification ? Number.parseInt(formData.poVerification) : 0,
        isConditionalWorkflow: formData.conditionalWorkflow,
        amountApprover2: formData.approver2Condition
          ? Number.parseFloat(formData.approver2Condition)
          : 0,
        amountApprover3: formData.approver3Condition
          ? Number.parseFloat(formData.approver3Condition)
          : 0,
        amountApprover4: formData.approver4Condition
          ? Number.parseFloat(formData.approver4Condition)
          : 0,
      };

      const token = authService.getToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(buildApiUrl("workflow-editor"), {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok || data?.IsSuccess === false || data?.success === false) {
        const apiMessage =
          data?.message ||
          data?.Message ||
          data?.error ||
          data?.Error ||
          `HTTP error! status: ${response.status}`;
        throw new Error(apiMessage);
      }

      __helper_handleWorkflowSuccess(data);
    } catch (error) {
      const rawMessage =
        error instanceof Error
          ? error.message
          : "Failed to create workflow. Please try again.";
      const description = /same combination|already exists/i.test(rawMessage)
        ? "This workflow combination already exists. Please choose a different Division, Service Mapping, or Payment Mode."
        : rawMessage;

      console.warn("Workflow creation validation failed:", rawMessage);

      // Show error toast
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/workflows");
  };

  const handleReset = () => {
    // Reset form data to initial values
    setFormData({
      purchasingGroup: "",
      serviceName: "",
      paymentMode: "-1",
      vendorManager: "Auto-assigned",
      conditionalWorkflow: false,
      approver1: "System Default",
      approver2: "",
      approver3: "",
      approver4: "",
      approver2Condition: "",
      approver3Condition: "",
      approver4Condition: "",
      financeHead: "-1",
      poGenerator: "Auto-generated",
      poVerification: "",
      poDispatch: "Auto-dispatch",
    });

    // Reset all dependent dropdowns
    setServices([]);
    setApprovers([]);
    setFilteredApprovers3([]);
    setFilteredApprovers4([]);

    // Reset loading states
    setServicesLoading(false);
    setApproversLoading(false);
    setVendorManagersLoading(false);

    // Reset error states
    setServicesError(null);
    setApproversError(null);
  };

  // Response processing helper functions
  function processPOVerifiersResponse(data: any): POVerifier[] {

    let verifiersArray = [];

    if (Array.isArray(data)) {
      verifiersArray = data;
    } else if (Array.isArray(data?.Data?.Records)) {
      verifiersArray = data.Data.Records;
    } else if (Array.isArray(data?.data?.records)) {
      verifiersArray = data.data.records;
    } else if (data?.data && Array.isArray(data.data)) {
      verifiersArray = data.data;
    } else if (data?.result && Array.isArray(data.result)) {
      verifiersArray = data.result;
    } else if (data && typeof data === "object") {
      const arrayProperty = Object.values(data).find((value) =>
        Array.isArray(value)
      );
      if (arrayProperty) {
        verifiersArray = arrayProperty;
      }
    }

    const normalizedVerifiers = verifiersArray.map((option: any) => ({
      Id: option.Id || option.id || -1,
      id: option.id || option.Id || -1,
      Name: option.Name || option.name || "",
      name: option.name || option.Name || "",
    }));

    return normalizedVerifiers;
  }

  function processPaymentOptionsResponse(
    data: any
  ): PaymentOption[] {

    let paymentOptionsArray = [];

    if (Array.isArray(data)) {
      paymentOptionsArray = data;
    } else if (data?.data && Array.isArray(data.data)) {
      paymentOptionsArray = data.data;
    } else if (data?.result && Array.isArray(data.result)) {
      paymentOptionsArray = data.result;
    } else if (data && typeof data === "object") {
      const arrayProperty = Object.values(data).find((value) =>
        Array.isArray(value)
      );
      if (arrayProperty) {
        paymentOptionsArray = arrayProperty;
      }
    }

    const hasSelectOption = paymentOptionsArray.some((option: any) => {
      const optionId = option.Id || option.id;
      const optionName = option.Name || option.name;
      return optionId === -1 || optionName === "--Select--";
    });

    const normalizedOptions = paymentOptionsArray.map((option: any) => ({
      Id: option.Id || option.id || -1,
      id: option.id || option.Id || -1,
      Name: option.Name || option.name || "",
      name: option.name || option.Name || "",
    }));

    const optionsWithDefault = hasSelectOption
      ? normalizedOptions
      : [
          { Id: -1, id: -1, Name: "--Select--", name: "--Select--" },
          ...normalizedOptions,
        ];

    return optionsWithDefault;
  }

  function processPurchasingGroupsResponse(
    data: any
  ): PurchasingGroup[] {

    let purchasingGroupsArray = [];

    if (Array.isArray(data)) {
      purchasingGroupsArray = data;
    } else if (data?.data && Array.isArray(data.data)) {
      purchasingGroupsArray = data.data;
    } else if (data?.result && Array.isArray(data.result)) {
      purchasingGroupsArray = data.result;
    } else if (data && typeof data === "object") {
      const arrayProperty = Object.values(data).find((value) =>
        Array.isArray(value)
      );
      if (arrayProperty) {
        purchasingGroupsArray = arrayProperty;
      }
    }

    const hasSelectOption = purchasingGroupsArray.some((option: any) => {
      const optionValue = option.Value || option.value || "";
      const optionText = option.Text || option.text || "";
      return optionValue === "" || optionText === "--Select--";
    });

    const normalizedGroups = purchasingGroupsArray.map((option: any) => ({
      Value: option.Value || option.value || "",
      value: option.value || option.Value || "",
      Text: option.Text || option.text || "",
      text: option.text || option.Text || "",
    }));

    const optionsWithDefault = hasSelectOption
      ? normalizedGroups
      : [
          { Value: "", value: "", Text: "--Select--", text: "--Select--" },
          ...normalizedGroups,
        ];

    return optionsWithDefault;
  }

  function processFinanceHeadsResponse(data: any): FinanceHead[] {

    let financeHeadsArray = [];

    if (Array.isArray(data)) {
      financeHeadsArray = data;
    } else if (Array.isArray(data?.Data?.Records)) {
      financeHeadsArray = data.Data.Records;
    } else if (Array.isArray(data?.data?.records)) {
      financeHeadsArray = data.data.records;
    } else if (data?.data && Array.isArray(data.data)) {
      financeHeadsArray = data.data;
    } else if (data?.result && Array.isArray(data.result)) {
      financeHeadsArray = data.result;
    } else if (data && typeof data === "object") {
      const arrayProperty = Object.values(data).find((value) =>
        Array.isArray(value)
      );
      if (arrayProperty) {
        financeHeadsArray = arrayProperty;
      }
    }

    const hasSelectOption = financeHeadsArray.some(
      (option: any) => option.Id === -1 || option.Name === "--Select--"
    );

    const optionsWithDefault = hasSelectOption
      ? financeHeadsArray
      : [{ Id: -1, Name: "--Select--" }, ...financeHeadsArray];

    return optionsWithDefault;
  }

  function processServicesResponse(data: any): Service[] {

    let servicesArray = [];

    if (Array.isArray(data)) {
      servicesArray = data;
    } else if (Array.isArray(data?.Data?.Records)) {
      servicesArray = data.Data.Records;
    } else if (Array.isArray(data?.data?.records)) {
      servicesArray = data.data.records;
    } else if (data?.data && Array.isArray(data.data)) {
      servicesArray = data.data;
    } else if (data?.result && Array.isArray(data.result)) {
      servicesArray = data.result;
    } else if (data && typeof data === "object") {
      const arrayProperty = Object.values(data).find((value) =>
        Array.isArray(value)
      );
      if (arrayProperty) {
        servicesArray = arrayProperty;
      }
    }

    const normalizedServices = servicesArray.map((option: any) => ({
      Id: option.Id || option.id || -1,
      id: option.id || option.Id || -1,
      Name: option.Name || option.name || "",
      name: option.name || option.Name || "",
    }));

    const hasSelectOption = normalizedServices.some(
      (option: any) => option.Id === -1 || option.Name === "--Select--"
    );

    const optionsWithDefault = hasSelectOption
      ? normalizedServices
      : [
          { Id: -1, id: -1, Name: "--Select--", name: "--Select--" },
          ...normalizedServices,
        ];

    return optionsWithDefault;
  }

  function processApproversResponse(data: any): {
    approver2: Approver[];
    approver3: Approver[];
    approver4: Approver[];
  } {

    const { approver2Array, approver3Array, approver4Array } =
      __helper_extractApproverArrays(data);

    const normalizedApprovers2 = approver2Array.map((option: any) => ({
      Id: option.Id || option.id || -1,
      id: option.id || option.Id || -1,
      Name: option.Name || option.name || "",
      name: option.name || option.Name || "",
    }));

    const normalizedApprovers3 = approver3Array.map((option: any) => ({
      Id: option.Id || option.id || -1,
      id: option.id || option.Id || -1,
      Name: option.Name || option.name || "",
      name: option.name || option.Name || "",
    }));

    const normalizedApprovers4 = approver4Array.map((option: any) => ({
      Id: option.Id || option.id || -1,
      id: option.id || option.Id || -1,
      Name: option.Name || option.name || "",
      name: option.name || option.Name || "",
    }));

    return {
      approver2: normalizedApprovers2,
      approver3: normalizedApprovers3,
      approver4: normalizedApprovers4,
    };
  }

  function processFilteredApprovers3Response(
    data: any
  ): Approver[] {

    const approversArray = __helper_extractApprover3Array(data);

    const normalizedApprovers = approversArray.map((option: any) => ({
      Id: option.Id || option.id || -1,
      id: option.id || option.Id || -1,
      Name: option.Name || option.name || "",
      name: option.name || option.Name || "",
    }));

    return normalizedApprovers;
  }

  function processFilteredApprovers4Response(
    data: any
  ): Approver[] {

    const fromRecords = __helper_extractApprover4FromRecords(data);
    if (fromRecords) {
      return fromRecords.map((option: any) => ({
        Id: option.Id || option.id || -1,
        id: option.id || option.Id || -1,
        Name: option.Name || option.name || "",
        name: option.name || option.Name || "",
      }));
    }

    const fromDirectProps = __helper_extractApprover4FromDirectProps(data);
    if (fromDirectProps) {
      return fromDirectProps.map((option: any) => ({
        Id: option.Id || option.id || -1,
        id: option.id || option.Id || -1,
        Name: option.Name || option.name || "",
        name: option.name || option.Name || "",
      }));
    }

    const approversArray = __helper_extractGenericArray(data);
    return approversArray.map((option: any) => ({
      Id: option.Id || option.id || -1,
      id: option.id || option.Id || -1,
      Name: option.Name || option.name || "",
      name: option.name || option.Name || "",
    }));
  }

  // Named handler functions for UI events
  const handlePurchasingGroupChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    handleInputChange("purchasingGroup", e.target.value);
  };

  const handleServiceNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange("serviceName", e.target.value);
  };

  const handleServiceRetryClick = () => {
    fetchServices(formData.purchasingGroup);
  };

  const handlePaymentModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange("paymentMode", e.target.value);
  };

  const handleConditionalWorkflowChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleInputChange("conditionalWorkflow", e.target.checked);
  };

  const handleApprover2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange("approver2", e.target.value);
  };

  const handleApprover2ConditionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleInputChange("approver2Condition", e.target.value);
  };

  const handleApprover3Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange("approver3", e.target.value);
  };

  const handleApprover3ConditionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleInputChange("approver3Condition", e.target.value);
  };

  const handleApprover4Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange("approver4", e.target.value);
  };

  const handleApprover4ConditionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleInputChange("approver4Condition", e.target.value);
  };

  const handleFinanceHeadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange("financeHead", e.target.value);
  };

  const handlePoVerificationChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    handleInputChange("poVerification", e.target.value);
  };

  // Get placeholder text for PO verification dropdown
  const getPOVerificationPlaceholder = () => {
    if (!formData.paymentMode || formData.paymentMode === "-1" || formData.paymentMode === "") {
      return "First select a payment mode";
    }
    if (poVerifiersLoading) {
      return "Loading verifiers...";
    }
    if (poVerifiers.length === 0) {
      return "No verifiers available";
    }
    return "Select verification officer";
  };

  // Get placeholder text for service name dropdown
  const getServiceNamePlaceholder = () => {
    if (!formData.purchasingGroup || formData.purchasingGroup === "") {
      return "First select a purchasing group";
    }
    if (servicesLoading) {
      return "Loading services...";
    }
    return "Select service name";
  };

  // Get placeholder text for approver 2 dropdown
  const getApprover2Placeholder = () => {
    if (!formData.purchasingGroup || formData.purchasingGroup === "") {
      return "First select a purchasing group";
    }
    if (approversLoading) {
      return "Loading approvers...";
    }
    return "Select Approver";
  };

  // Get placeholder text for approver 3 dropdown
  const getApprover3Placeholder = () => {
    if (!formData.purchasingGroup || formData.purchasingGroup === "") {
      return "First select a purchasing group";
    }
    if (approversLoading) {
      return "Loading approvers...";
    }
    return "Select Approver";
  };

  // Get placeholder text for approver 4 dropdown
  const getApprover4Placeholder = () => {
    if (!formData.purchasingGroup || formData.purchasingGroup === "") {
      return "First select a purchasing group";
    }
    if (approversLoading) {
      return "Loading approvers...";
    }
    return "Select Approver";
  };

  return (
    <MainLayout>
      <div className="space-y-6" data-testid="add-new-workflow-page">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Tooltip content="Go back to Workflows" position="bottom">
            <Button
              variant="outline"
              size="icon"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Tooltip>
          <div>
            <h3 className="text-lg font-semibold tracking-tight cus-line-height">
              Add New Workflow
            </h3>
            <p className="text-muted-foreground text-xs">
              Create a new workflow configuration
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label
                      htmlFor="purchasingGroup"
                      className="block text-sm font-medium mb-2"
                    >
                      Purchasing Group <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="purchasingGroup"
                      value={formData.purchasingGroup}
                      onChange={handlePurchasingGroupChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                      required
                      disabled={purchasingGroupsLoading}
                    >
                      {purchasingGroups.map((group) => {
                        const groupValue = group.Value || group.value || "";
                        const groupText = group.Text || group.text || "";
                        return (
                          <option key={groupValue} value={groupValue}>
                            {groupText}
                          </option>
                        );
                      })}
                    </select>
                    {purchasingGroupsLoading && (
                      <p className="text-sm text-gray-500 mt-1">
                        Loading purchasing groups...
                      </p>
                    )}
                    {purchasingGroupsError && (
                      <div className="mt-1">
                        <p className="text-sm text-red-600">
                          {purchasingGroupsError}
                        </p>
                        <button
                          type="button"
                          onClick={fetchPurchasingGroups}
                          className="text-sm text-vendor-600 hover:text-vendor-700 underline mt-1"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="serviceName"
                      className="block text-sm font-medium mb-2"
                    >
                      Service Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="serviceName"
                      value={formData.serviceName}
                      onChange={handleServiceNameChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                      required
                      disabled={
                        servicesLoading ||
                        !formData.purchasingGroup ||
                        formData.purchasingGroup === ""
                      }
                    >
                      <option value="">{getServiceNamePlaceholder()}</option>
                      {services
                        .filter((service) => (service.Id || service.id) !== -1)
                        .map((service) => {
                          const serviceId = service.Id || service.id || "";
                          const serviceName =
                            service.Name || service.name || "";
                          return (
                            <option key={serviceId} value={serviceId}>
                              {serviceName}
                            </option>
                          );
                        })}
                    </select>
                    {servicesLoading && (
                      <p className="text-sm text-gray-500 mt-1">
                        Loading services...
                      </p>
                    )}
                    {servicesError && (
                      <div className="mt-1">
                        <p className="text-sm text-red-600">{servicesError}</p>
                        <button
                          type="button"
                          onClick={handleServiceRetryClick}
                          className="text-sm text-vendor-600 hover:text-vendor-700 underline mt-1"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="paymentMode"
                      className="block text-sm font-medium mb-2"
                    >
                      Payment Mode <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="paymentMode"
                      value={formData.paymentMode}
                      onChange={handlePaymentModeChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                      required
                      disabled={paymentOptionsLoading}
                    >
                      {paymentOptions.map((option) => {
                        const optionId = option.Id || option.id || -1;
                        const optionName = option.Name || option.name || "";
                        return (
                          <option key={optionId} value={optionId.toString()}>
                            {optionName}
                          </option>
                        );
                      })}
                    </select>
                    {paymentOptionsLoading && (
                      <p className="text-sm text-gray-500 mt-1">
                        Loading payment options...
                      </p>
                    )}
                    {paymentOptionsError && (
                      <div className="mt-1">
                        <p className="text-sm text-red-600">
                          {paymentOptionsError}
                        </p>
                        <button
                          type="button"
                          onClick={fetchPaymentOptions}
                          className="text-sm text-vendor-600 hover:text-vendor-700 underline mt-1"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment & Vendor Section */}
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label
                      htmlFor="conditionalWorkflow"
                      className="block text-sm font-medium mb-2"
                    >
                      Conditional Workflow
                    </label>
                    <input
                      type="checkbox"
                      id="conditionalWorkflow"
                      checked={formData.conditionalWorkflow}
                      onChange={handleConditionalWorkflowChange}
                      className="rounded border-gray-300 text-vendor-600 focus:ring-vendor-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Select to create conditional workflow
                    </span>
                  </div>

                  <div>
                    <label
                      htmlFor="vendorManager"
                      className="block text-sm font-medium mb-2"
                    >
                      Vendor Manager
                    </label>
                    <Input
                      id="vendorManager"
                      type="text"
                      value={formData.vendorManager}
                      className="w-full bg-gray-50"
                      disabled
                      readOnly
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="approver1"
                      className="block text-sm font-medium mb-2"
                    >
                      Approver 1
                    </label>
                    <Input
                      id="approver1"
                      type="text"
                      value={formData.approver1}
                      className="w-full bg-gray-50"
                      disabled
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Approval Configuration Section */}
              <div className="space-y-4">
                {/* Validation message for approvers */}
                {formData.purchasingGroup && formData.purchasingGroup !== "" && 
                 !formData.approver2 && !formData.approver3 && !formData.approver4 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                    <p className="text-sm text-amber-800">
                      <span className="font-medium">Note:</span> At least one approver (2, 3, or 4) must be selected to save the workflow.
                    </p>
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label
                      htmlFor="approver2"
                      className="block text-sm font-medium mb-2"
                    >
                      Approver 2
                    </label>
                    <div
                      className={`flex gap-1 ${
                        formData.conditionalWorkflow ? "space-x-2" : ""
                      }`}
                    >
                      <select
                        id="approver2"
                        value={formData.approver2}
                        onChange={handleApprover2Change}
                        className={`px-2 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] ${
                          formData.conditionalWorkflow ? "w-2/3" : "w-full"
                        }`}
                        disabled={
                          approversLoading ||
                          !formData.purchasingGroup ||
                          formData.purchasingGroup === ""
                        }
                      >
                        <option value="">{getApprover2Placeholder()}</option>
                        {approvers.map((approver) => {
                          const approverId = approver.Id || approver.id || "";
                          const approverName =
                            approver.Name || approver.name || "";
                          return (
                            <option key={approverId} value={approverId}>
                              {approverName}
                            </option>
                          );
                        })}
                      </select>

                      {/* Conditional input field for Approver 2 */}
                      {formData.conditionalWorkflow && (
                        <Input
                          id="approver2Condition"
                          type="text"
                          value={formData.approver2Condition}
                          onChange={handleApprover2ConditionChange}
                          placeholder="Max Amount"
                          className="w-1/3 min-w-[110px]"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="approver3"
                      className="block text-sm font-medium mb-2"
                    >
                      Approver 3
                    </label>
                    <div
                      className={`flex gap-1 ${
                        formData.conditionalWorkflow ? "space-x-2" : ""
                      }`}
                    >
                      <select
                        id="approver3"
                        value={formData.approver3}
                        onChange={handleApprover3Change}
                        className={`px-2 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] ${
                          formData.conditionalWorkflow ? "w-2/3" : "w-full"
                        }`}
                        disabled={
                          approversLoading ||
                          !formData.purchasingGroup ||
                          formData.purchasingGroup === ""
                        }
                      >
                        <option value="">{getApprover3Placeholder()}</option>
                        {filteredApprovers3.map((approver) => {
                          const approverId = approver.Id || approver.id || "";
                          const approverName =
                            approver.Name || approver.name || "";
                          return (
                            <option key={approverId} value={approverId}>
                              {approverName}
                            </option>
                          );
                        })}
                      </select>

                      {/* Conditional input field for Approver 3 */}
                      {formData.conditionalWorkflow && (
                        <Input
                          id="approver3Condition"
                          type="text"
                          value={formData.approver3Condition}
                          onChange={handleApprover3ConditionChange}
                          placeholder="Max Amount"
                          className="w-1/3 min-w-[110px]"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="approver4"
                      className="block text-sm font-medium mb-2"
                    >
                      Approver 4
                    </label>
                    <div
                      className={`flex gap-1 ${
                        formData.conditionalWorkflow ? "space-x-2" : ""
                      }`}
                    >
                      <select
                        id="approver4"
                        value={formData.approver4}
                        onChange={handleApprover4Change}
                        className={`px-2 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef] ${
                          formData.conditionalWorkflow ? "w-2/3" : "w-full"
                        }`}
                        disabled={
                          approversLoading ||
                          !formData.purchasingGroup ||
                          formData.purchasingGroup === ""
                        }
                      >
                        <option value="">{getApprover4Placeholder()}</option>
                        {filteredApprovers4.map((approver) => {
                          const approverId = approver.Id || approver.id || "";
                          const approverName =
                            approver.Name || approver.name || "";
                          return (
                            <option key={approverId} value={approverId}>
                              {approverName}
                            </option>
                          );
                        })}
                      </select>

                      {/* Conditional input field for Approver 4 */}
                      {formData.conditionalWorkflow && (
                        <Input
                          id="approver4Condition"
                          type="text"
                          value={formData.approver4Condition}
                          onChange={handleApprover4ConditionChange}
                          placeholder="Max Amount"
                          className="w-1/3 min-w-[110px]"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Order Configuration Section */}
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label
                      htmlFor="financeHead"
                      className="block text-sm font-medium mb-2"
                    >
                      Finance Head <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="financeHead"
                      value={formData.financeHead}
                      onChange={handleFinanceHeadChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                      required
                      disabled={financeHeadsLoading}
                    >
                      {financeHeads.map((head) => {
                        const headId = head.Id || head.id || -1;
                        const headName = head.Name || head.name || "";
                        return (
                          <option key={headId} value={headId.toString()}>
                            {headName}
                          </option>
                        );
                      })}
                    </select>
                    {financeHeadsLoading && (
                      <p className="text-sm text-gray-500 mt-1">
                        Loading finance heads...
                      </p>
                    )}
                    {financeHeadsError && (
                      <div className="mt-1">
                        <p className="text-sm text-red-600">
                          {financeHeadsError}
                        </p>
                        <button
                          type="button"
                          onClick={fetchFinanceHeads}
                          className="text-sm text-vendor-600 hover:text-vendor-700 underline mt-1"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="poGenerator"
                      className="block text-sm font-medium mb-2"
                    >
                      PO Generator
                    </label>
                    <Input
                      id="poGenerator"
                      type="text"
                      value={formData.poGenerator}
                      className="w-full bg-gray-50"
                      disabled
                      readOnly
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="poVerification"
                      className="block text-sm font-medium mb-2"
                    >
                      PO Verification
                    </label>
                    <select
                      id="poVerification"
                      value={formData.poVerification}
                      onChange={handlePoVerificationChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#0152ef]"
                      disabled={
                        poVerifiersLoading ||
                        !formData.paymentMode ||
                        formData.paymentMode === "-1" ||
                        formData.paymentMode === ""
                      }
                    >
                      <option value="">{getPOVerificationPlaceholder()}</option>
                      {poVerifiers.map((verifier) => {
                        const verifierId = verifier.Id || verifier.id || "";
                        const verifierName = verifier.Name || verifier.name || "";
                        return (
                          <option key={verifierId} value={verifierId}>
                            {verifierName}
                          </option>
                        );
                      })}
                    </select>
                    {poVerifiersLoading && (
                      <p className="text-sm text-gray-500 mt-1">
                        Loading PO verifiers...
                      </p>
                    )}
                    {poVerifiersError && (
                      <div className="mt-1">
                        <p className="text-sm text-red-600">
                          {poVerifiersError}
                        </p>
                        <button
                          type="button"
                          onClick={() => fetchPOVerifiers(formData.paymentMode)}
                          className="text-sm text-vendor-600 hover:text-vendor-700 underline mt-1"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="poDispatch"
                      className="block text-sm font-medium mb-2"
                    >
                      PO Dispatch
                    </label>
                    <Input
                      id="poDispatch"
                      type="text"
                      value={formData.poDispatch}
                      className="w-full bg-gray-50"
                      disabled
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 justify-start">
                <Button
                  type="submit"
                  variant="outline"
                  className="gap-2"
                  disabled={!isFormValid() || isSubmitting}
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="px-6 gap-2"
                  disabled={isSubmitting}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
}

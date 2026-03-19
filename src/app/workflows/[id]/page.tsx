"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, RotateCcw, AlertCircle } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { buildApiUrl } from "@/services/api-client";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth-service";
import { getWorkflowById } from "@/services/workflow-service";

// API Response interfaces (reuse from new/page.tsx)
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

export default function ViewEditWorkflowPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const workflowId = params.id as string;
  const mode = searchParams.get("mode") || "view"; // 'view' or 'edit'
  const from = searchParams.get("from") || "new"; // 'new' or 'old' - which tab it came from
  const isEditMode = mode === "edit";
  const isFromOldWorkflow = from === "old";
  const [isLoading, setIsLoading] = useState(true);
  const [originalFormData, setOriginalFormData] = useState<FormData | null>(
    null
  );

  // Form state
  const [formData, setFormData] = useState<FormData>({
    purchasingGroup: "",
    serviceName: "",
    paymentMode: "-1",
    vendorManager: "Auto-assigned",
    conditionalWorkflow: false,
    approver1: "Requester",
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

  // Payment options state
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [paymentOptionsLoading, setPaymentOptionsLoading] = useState(false);

  // Purchasing groups state
  const [purchasingGroups, setPurchasingGroups] = useState<PurchasingGroup[]>(
    []
  );
  const [purchasingGroupsLoading, setPurchasingGroupsLoading] = useState(false);

  // Finance heads state
  const [financeHeads, setFinanceHeads] = useState<FinanceHead[]>([]);
  const [financeHeadsLoading, setFinanceHeadsLoading] = useState(false);

  // Services state
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Approvers state
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [approversLoading, setApproversLoading] = useState(false);
  const [filteredApprovers3, setFilteredApprovers3] = useState<Approver[]>([]);
  const [filteredApprovers4, setFilteredApprovers4] = useState<Approver[]>([]);

  // PO Verifiers state
  const [poVerifiers, setPOVerifiers] = useState<POVerifier[]>([]);
  const [poVerifiersLoading, setPOVerifiersLoading] = useState(false);

  // Vendor Managers loading state
  const [vendorManagersLoading, setVendorManagersLoading] = useState(false);

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store workflow data temporarily until dropdowns are loaded
  const [workflowData, setWorkflowData] = useState<any>(null);

  // Track if the form has been populated once to avoid resetting user changes
  const hasPopulatedForm = useRef(false);

  // Fetch workflow data by ID
  useEffect(() => {
    const fetchWorkflowData = async () => {
      if (!workflowId) return;

      hasPopulatedForm.current = false;
      setIsLoading(true);
      try {
        const response = await getWorkflowById(Number.parseInt(workflowId));

        // Extract workflow data from nested structure
        const data =
          response?.records?.[0] || response?.Records?.[0] || response;

        // Store workflow data
        setWorkflowData(data);

        // Fetch dependent data to populate dropdowns
        if (data.groupId || data.GroupId) {
          await fetchServices((data.groupId || data.GroupId).toString());
          
          // Note: The workflow detail API only returns approver IDs, not names
          // We fetch ALL approvers for the group and let the dropdown match by ID
          // This ensures approver names display correctly
          await fetchApprovers((data.groupId || data.GroupId).toString());
        }

        // Fetch PO verifiers based on payment mode
        const paymentMode = getPropHelper(
          data,
          "paymentMode",
          "PaymentMode"
        )?.toString();
        if (paymentMode && paymentMode !== "-1") {
          await fetchPOVerifiers(paymentMode);
        }
      } catch (error) {
        console.error("Failed to fetch workflow:", error);
        toast({
          title: "Error",
          description: "Failed to load workflow data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflowData();
  }, [workflowId]);

  // Populate form data after workflow data and dropdowns are loaded
  useEffect(() => {
    // Only populate form when workflow data is available AND all critical dropdowns are loaded
    const areDropdownsLoaded =
      !purchasingGroupsLoading &&
      !paymentOptionsLoading &&
      !financeHeadsLoading &&
      !servicesLoading &&
      !approversLoading;

    if (hasPopulatedForm.current) return;

    if (workflowData && !isLoading && areDropdownsLoaded) {
      const populatedData = {
        purchasingGroup:
          getPropHelper(
            workflowData,
            "groupId",
            "GroupId"
          )?.toString() || "",
        serviceName:
          getPropHelper(
            workflowData,
            "serviceMapId",
            "ServiceMapId"
          )?.toString() || "",
        paymentMode:
          getPropHelper(
            workflowData,
            "paymentMode",
            "PaymentMode"
          )?.toString() || "-1",
        vendorManager:
          getPropHelper(
            workflowData,
            "vendorManager",
            "VendorManager"
          ) || "Auto-assigned",
        conditionalWorkflow:
          getPropHelper(
            workflowData,
            "isConditionalWorkflow",
            "IsConditionalWorkflow"
          ) || false,
        approver1: "Requester",
        approver2:
          getPropHelper(
            workflowData,
            "approver2",
            "Approver2"
          )?.toString() || "",
        approver3:
          getPropHelper(
            workflowData,
            "approver3",
            "Approver3"
          )?.toString() || "",
        approver4:
          getPropHelper(
            workflowData,
            "approver4",
            "Approver4"
          )?.toString() || "",
        approver2Condition:
          getPropHelper(
            workflowData,
            "amountApprover2",
            "AmountApprover2"
          )?.toString() || "",
        approver3Condition:
          getPropHelper(
            workflowData,
            "amountApprover3",
            "AmountApprover3"
          )?.toString() || "",
        approver4Condition:
          getPropHelper(
            workflowData,
            "amountApprover4",
            "AmountApprover4"
          )?.toString() || "",
        financeHead:
          getPropHelper(
            workflowData,
            "financeHead",
            "FinanceHead"
          )?.toString() || "-1",
        poGenerator:
          getPropHelper(
            workflowData,
            "poGenerator",
            "POGenerator",
            "PoGenerator"
          ) || "Auto-generated",
        poVerification:
          getPropHelper(
            workflowData,
            "poVerification",
            "POVerification",
            "PoVerification",
            "poVerificationId",
            "POVerificationId",
            "PoVerificationId"
          )?.toString() || "",
        poDispatch:
          getPropHelper(
            workflowData,
            "poDespatch",
            "PODespatch",
            "PoDespatch",
            "poDispatch",
            "PODispatch",
            "PoDispatch"
          ) || "Auto-dispatch",
      };
      
      setFormData(populatedData);
      setOriginalFormData(populatedData);
      hasPopulatedForm.current = true;
    }
  }, [
    workflowData,
    isLoading,
    purchasingGroupsLoading,
    paymentOptionsLoading,
    financeHeadsLoading,
    servicesLoading,
    approversLoading,
    purchasingGroups.length,
    paymentOptions.length,
    financeHeads.length,
    services.length,
    approvers.length,
  ]);

  // Note: Removed the automatic refetch of approvers after form population
  // because we now fetch ALL approvers on initial load without filters.
  // This ensures approver IDs are properly mapped to their actual names.
  // The approver lists will be updated when user manually changes selections
  // via the handleInputChange logic.

  // Fetch payment options, groups, and finance heads on mount
  useEffect(() => {
    fetchPaymentOptions();
    fetchPurchasingGroups();
    fetchFinanceHeads();
  }, []);

  const fetchPaymentOptions = async () => {
    setPaymentOptionsLoading(true);
    try {
      const token = authService.getToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(buildApiUrl("lookups/payment-options"), {
        headers,
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      
      // Extract payment options array from various response structures
      let paymentOptionsArray = [];
      if (Array.isArray(data)) {
        paymentOptionsArray = data;
      } else if (data?.items && Array.isArray(data.items)) {
        paymentOptionsArray = data.items;
      } else if (data?.data && Array.isArray(data.data)) {
        paymentOptionsArray = data.data;
      }

      const normalizedOptions = paymentOptionsArray.map((option: any) => ({
        Id: option.Id || option.id || -1,
        id: option.id || option.Id || -1,
        Name: option.Name || option.name || "",
        name: option.name || option.Name || "",
      }));

      const optionsWithDefault = [
        { Id: -1, id: -1, Name: "--Select--", name: "--Select--" },
        ...normalizedOptions,
      ];

      setPaymentOptions(optionsWithDefault);
    } catch (error) {
      console.error("Failed to fetch payment options:", error);
      setPaymentOptions([
        { Id: -1, id: -1, Name: "--Select--", name: "--Select--" },
      ]);
    } finally {
      setPaymentOptionsLoading(false);
    }
  };

  const fetchPurchasingGroups = async () => {
    setPurchasingGroupsLoading(true);
    try {
      const token = authService.getToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(buildApiUrl("lookups/groups"), { headers });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      
      // Extract purchasing groups array from various response structures
      let purchasingGroupsArray = [];
      if (Array.isArray(data)) {
        purchasingGroupsArray = data;
      } else if (data?.items && Array.isArray(data.items)) {
        purchasingGroupsArray = data.items;
      } else if (data?.data && Array.isArray(data.data)) {
        purchasingGroupsArray = data.data;
      }

      const normalizedGroups = purchasingGroupsArray.map((option: any) => ({
        Value: option.Value || option.value || "",
        value: option.value || option.Value || "",
        Text: option.Text || option.text || "",
        text: option.text || option.Text || "",
      }));

      const optionsWithDefault = [
        { Value: "", value: "", Text: "--Select--", text: "--Select--" },
        ...normalizedGroups,
      ];

      setPurchasingGroups(optionsWithDefault);
    } catch (error) {
      console.error("Failed to fetch purchasing groups:", error);
      setPurchasingGroups([
        { Value: "", value: "", Text: "--Select--", text: "--Select--" },
      ]);
    } finally {
      setPurchasingGroupsLoading(false);
    }
  };

  const fetchFinanceHeads = async () => {
    setFinanceHeadsLoading(true);
    try {
      const token = authService.getToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        buildApiUrl("workflow-editor/finance-heads"),
        { headers }
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      
      // Extract finance heads array from various response structures
      let financeHeadsArray = [];
      if (Array.isArray(data)) {
        financeHeadsArray = data;
      } else if (data?.Data?.Records && Array.isArray(data.Data.Records)) {
        financeHeadsArray = data.Data.Records;
      } else if (data?.data?.records && Array.isArray(data.data.records)) {
        financeHeadsArray = data.data.records;
      }

      const optionsWithDefault = [
        { Id: -1, Name: "--Select--" },
        ...financeHeadsArray,
      ];

      setFinanceHeads(optionsWithDefault);
    } catch (error) {
      console.error("Failed to fetch finance heads:", error);
      setFinanceHeads([{ Id: -1, Name: "--Select--" }]);
    } finally {
      setFinanceHeadsLoading(false);
    }
  };

  const fetchServices = async (groupId: string) => {
    if (!groupId || groupId === "") {
      setServices([{ Id: -1, id: -1, Name: "--Select--", name: "--Select--" }]);
      return;
    }

    setServicesLoading(true);
    try {
      const token = authService.getToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        buildApiUrl(`workflow-editor/services?groupId=${groupId}`),
        { headers }
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      
      // Extract services array from various response structures
      let servicesArray = [];
      if (Array.isArray(data)) {
        servicesArray = data;
      } else if (data?.data?.records && Array.isArray(data.data.records)) {
        servicesArray = data.data.records;
      } else if (data?.data?.Records && Array.isArray(data.data.Records)) {
        servicesArray = data.data.Records;
      } else if (data?.Data?.Records && Array.isArray(data.Data.Records)) {
        servicesArray = data.Data.Records;
      }

      const normalizedServices = servicesArray.map((option: any) => ({
        Id: option.Id || option.id || -1,
        id: option.id || option.Id || -1,
        Name: option.Name || option.name || "",
        name: option.name || option.Name || "",
      }));

      const optionsWithDefault = [
        { Id: -1, id: -1, Name: "--Select--", name: "--Select--" },
        ...normalizedServices,
      ];

      setServices(optionsWithDefault);
    } catch (error) {
      console.error("Failed to fetch services:", error);
      setServices([{ Id: -1, id: -1, Name: "--Select--", name: "--Select--" }]);
    } finally {
      setServicesLoading(false);
    }
  };

  const fetchApprovers = async (groupId: string) => {
    if (!groupId || groupId === "") {
      setApprovers([]);
      setFilteredApprovers3([]);
      setFilteredApprovers4([]);
      return;
    }

    setApproversLoading(true);
    try {
      const token = authService.getToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Fetch ALL approvers for the group (without selectedApprover filters)
      // This ensures we get all available approvers including historical ones
      const url = `workflow-editor/approvers?groupId=${groupId}`;

      const response = await fetch(
        buildApiUrl(url),
        { headers }
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      
      // Extract approver arrays - check multiple possible structures
      let approver2Array = [];
      let approver3Array = [];
      let approver4Array = [];
      
      // Try data.data.records[0] structure
      if (data?.data?.records?.[0]) {
        const recordData = data.data.records[0];
        if (recordData.approver2List && Array.isArray(recordData.approver2List)) {
          approver2Array = recordData.approver2List;
          approver3Array = recordData.approver3List || recordData.approver2List;
          approver4Array = recordData.approver4List || recordData.approver2List;
        }
      }
      
      // Try direct properties
      if (approver2Array.length === 0 && data?.approver2List && Array.isArray(data.approver2List)) {
        approver2Array = data.approver2List;
        approver3Array = data.approver3List || data.approver2List;
        approver4Array = data.approver4List || data.approver2List;
      }
      
      // Fallback to data.Data.Records[0]
      if (approver2Array.length === 0 && data?.Data?.Records?.[0]) {
        const recordData = data.Data.Records[0];
        if (recordData.approver2List && Array.isArray(recordData.approver2List)) {
          approver2Array = recordData.approver2List;
          approver3Array = recordData.approver3List || recordData.approver2List;
          approver4Array = recordData.approver4List || recordData.approver2List;
        }
      }
      
      // If still empty, check if data itself is an array
      if (approver2Array.length === 0 && Array.isArray(data)) {
        approver2Array = data;
        approver3Array = data;
        approver4Array = data;
      }

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
      
      // Set all three approver lists (they use the same data for independent selection)
      setApprovers(normalizedApprovers2);
      setFilteredApprovers3(normalizedApprovers3);
      setFilteredApprovers4(normalizedApprovers4);
    } catch (error) {
      console.error("Failed to fetch approvers:", error);
      setApprovers([]);
      setFilteredApprovers3([]);
      setFilteredApprovers4([]);
    } finally {
      setApproversLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    if (!isEditMode) return; // Prevent changes in view mode

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "purchasingGroup" && typeof value === "string") {
      // Reset approver selections when group changes
      setFormData((prev) => ({
        ...prev,
        purchasingGroup: value,
        serviceName: "",
        approver2: "",
        approver3: "",
        approver4: "",
      }));
      fetchServices(value);
      fetchApprovers(value); // Fetch all approvers without filters
    }

    // If service name changes, fetch vendor managers
    if (field === "serviceName" && typeof value === "string") {
      fetchVendorManagers(value);
    }

    // Note: Approver selections are now independent and don't trigger refetch
    // All approvers are loaded when Purchasing Group is selected

    if (field === "paymentMode" && typeof value === "string") {
      setFormData((prev) => ({
        ...prev,
        paymentMode: value,
        poVerification: "",
      }));
      // Fetch PO verifiers when payment mode changes
      fetchPOVerifiers(value);
    }
  };

  const isFormValid = () => {
    // Check if at least one approver (2, 3, or 4) is selected
    const atLeastOneApproverSelected = 
      (formData.approver2 && formData.approver2 !== "") ||
      (formData.approver3 && formData.approver3 !== "") ||
      (formData.approver4 && formData.approver4 !== "");

    return (
      formData.purchasingGroup !== "" &&
      formData.serviceName !== "" &&
      formData.paymentMode !== "-1" &&
      formData.financeHead !== "-1" &&
      atLeastOneApproverSelected
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      // Convert PO verification to number
      const poVerificationValue = formData.poVerification
        ? Number.parseInt(formData.poVerification)
        : 0;

      const requestBody = {
        workflowId: Number.parseInt(workflowId),
        groupId: Number.parseInt(formData.purchasingGroup),
        serviceMapId: Number.parseInt(formData.serviceName),
        paymentMode: Number.parseInt(formData.paymentMode),
        comparisionFactor: "",
        approver2: formData.approver2 ? Number.parseInt(formData.approver2) : 0,
        approver3: formData.approver3 ? Number.parseInt(formData.approver3) : 0,
        approver4: formData.approver4 ? Number.parseInt(formData.approver4) : 0,
        financeHead: Number.parseInt(formData.financeHead),
        poVerification: poVerificationValue,
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

      console.log("Updating workflow:", requestBody);

      const token = authService.getToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        buildApiUrl(`workflow-editor/${workflowId}`),
        {
          method: "PUT",
          headers,
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      toast({
        title: "Success",
        description: "Workflow updated successfully!",
        variant: "success",
      });

      setTimeout(() => {
        router.push("/workflows");
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check for unsaved changes
  const hasUnsavedChanges = () => {
    if (!originalFormData || !isEditMode) return false;

    return (
      formData.purchasingGroup !== originalFormData.purchasingGroup ||
      formData.serviceName !== originalFormData.serviceName ||
      formData.paymentMode !== originalFormData.paymentMode ||
      formData.conditionalWorkflow !== originalFormData.conditionalWorkflow ||
      formData.approver2 !== originalFormData.approver2 ||
      formData.approver3 !== originalFormData.approver3 ||
      formData.approver4 !== originalFormData.approver4 ||
      formData.approver2Condition !== originalFormData.approver2Condition ||
      formData.approver3Condition !== originalFormData.approver3Condition ||
      formData.approver4Condition !== originalFormData.approver4Condition ||
      formData.financeHead !== originalFormData.financeHead ||
      formData.poVerification !== originalFormData.poVerification
    );
  };

  // Handle reset to original values
  const handleReset = () => {
    if (originalFormData) {
      setFormData({ ...originalFormData });
      toast({
        title: "Changes Discarded",
        description: "Form has been reset to original values",
        variant: "default",
      });
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges()) {
      const confirmed = globalThis.confirm(
        "You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
      );
      if (!confirmed) return;
    }
    router.push("/workflows");
  };

  // Fetch PO verifiers from API based on paymentMode
  const fetchPOVerifiers = async (paymentMode: string) => {
    if (!paymentMode || paymentMode === "-1" || paymentMode === "") {
      setPOVerifiers([]);
      return;
    }

    setPOVerifiersLoading(true);
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
    } catch (error) {
      console.error("Failed to fetch PO verifiers:", error);
      setPOVerifiers([]);
    } finally {
      setPOVerifiersLoading(false);
    }
  };

  const verificationOfficers = ["Lalitha Reddy", "Ashok Bagasi"];

  const getFilteredVerificationOfficers = () => {
    if (formData.paymentMode === "-1" || formData.paymentMode === "") {
      return verificationOfficers;
    }
    if (formData.paymentMode === "1") {
      return ["Ashok Bagasi"];
    }
    return ["Lalitha Reddy"];
  };

  const filteredVerificationOfficers = getFilteredVerificationOfficers();

  // Helper for vendor managers response processing
  const processVendorManagersResponse = (data: any): {
    vendorManager: string;
    poGenerator: string;
    poDispatch: string;
  } => {
    let vendorManager = "Auto-assigned";
    let poGenerator = "Auto-generated";
    let poDispatch = "Auto-dispatch";

    // Check for data.data.records array structure first (most common API response)
    if (Array.isArray(data?.data?.records) && data?.data?.records.length > 0) {
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
  };

  // Helper to extract property with fallback for different casing
  const getPropHelper = (obj: any, ...keys: string[]) => {
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return obj[key];
      }
    }
    return undefined;
  };

  // Helper to process PO verifiers API response
  const processPOVerifiersResponse = (data: any): POVerifier[] => {
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

    return verifiersArray.map((option: any) => ({
      Id: option.Id || option.id || -1,
      id: option.id || option.Id || -1,
      Name: option.Name || option.name || "",
      name: option.name || option.Name || "",
    }));
  };

  // Fetch vendor managers from API based on serviceMapId
  const fetchVendorManagers = async (serviceMapId: string) => {
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

  // Named change handlers for JSX
  const handlePurchasingGroupChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    handleInputChange("purchasingGroup", e.target.value);
  };

  const handleServiceNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange("serviceName", e.target.value);
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

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges()) {
      e.preventDefault();
      e.returnValue =
        "You have unsaved changes. Are you sure you want to leave?";
      return e.returnValue;
    }
  };

  // Handle browser back/refresh with unsaved changes
  useEffect(() => {
    globalThis.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      globalThis.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formData, originalFormData]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vendor-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading workflow...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Tooltip content="Go back to Workflows" position="bottom">
              <Button variant="outline" size="icon" onClick={handleCancel}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Tooltip>
            <div>
              <h3 className="text-lg font-semibold tracking-tight cus-line-height">
                {isEditMode ? "Edit Workflow" : "View Workflow"}
              </h3>
              <p className="text-muted-foreground text-xs">
                {isEditMode
                  ? "Update workflow configuration"
                  : "View workflow details"}
              </p>
            </div>
          </div>
        </div>

        {/* Unsaved Changes Indicator */}
        {hasUnsavedChanges() && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs">You have unsaved changes</span>
              </div>
            </CardContent>
          </Card>
        )}

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
                      disabled={!isEditMode || purchasingGroupsLoading}
                    >
                      {purchasingGroups.map((group, index) => (
                        <option
                          key={`group-${group.Value || group.value}-${index}`}
                          value={group.Value || group.value}
                        >
                          {group.Text || group.text}
                        </option>
                      ))}
                    </select>
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
                      disabled={!isEditMode || servicesLoading}
                    >
                      <option value="">Select service</option>
                      {services
                        .filter((service) => (service.Id || service.id) !== -1)
                        .map((service, index) => (
                          <option
                            key={`service-${service.Id || service.id}-${index}`}
                            value={service.Id || service.id}
                          >
                            {service.Name || service.name}
                          </option>
                        ))}
                    </select>
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
                      disabled={!isEditMode || paymentOptionsLoading}
                    >
                      {paymentOptions.map((option, index) => (
                        <option
                          key={`payment-${option.Id || option.id}-${index}`}
                          value={(option.Id || option.id)?.toString()}
                        >
                          {option.Name || option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment & Vendor Section */}
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Only show Conditional Workflow field if NOT from old workflow list */}
                  {!isFromOldWorkflow && (
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
                        disabled={!isEditMode}
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Select to create conditional workflow
                      </span>
                    </div>
                  )}

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
                {/* Validation message for approvers in Edit mode */}
                {isEditMode && formData.purchasingGroup && formData.purchasingGroup !== "" && 
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
                        disabled={!isEditMode || approversLoading || !formData.purchasingGroup}
                      >
                        <option value="">Select approver</option>
                        {approvers.map((approver, index) => (
                          <option
                            key={`approver2-${
                              approver.Id || approver.id
                            }-${index}`}
                            value={(approver.Id || approver.id)?.toString()}
                          >
                            {approver.Name || approver.name}
                          </option>
                        ))}
                      </select>
                      {approversLoading && (
                        <p className="text-sm text-gray-500 mt-1">
                          Loading approvers...
                        </p>
                      )}

                      {formData.conditionalWorkflow && (
                        <Input
                          id="approver2Condition"
                          type="text"
                          value={formData.approver2Condition}
                          onChange={handleApprover2ConditionChange}
                          placeholder="Max Amount"
                          className="w-1/3 min-w-[110px]"
                          disabled={!isEditMode}
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
                        disabled={!isEditMode || approversLoading || !formData.purchasingGroup}
                      >
                        <option value="">Select approver</option>
                        {filteredApprovers3.map((approver, index) => (
                          <option
                            key={`approver3-${
                              approver.Id || approver.id
                            }-${index}`}
                            value={(approver.Id || approver.id)?.toString()}
                          >
                            {approver.Name || approver.name}
                          </option>
                        ))}
                      </select>

                      {formData.conditionalWorkflow && (
                        <Input
                          id="approver3Condition"
                          type="text"
                          value={formData.approver3Condition}
                          onChange={handleApprover3ConditionChange}
                          placeholder="Max Amount"
                          className="w-1/3 min-w-[110px]"
                          disabled={!isEditMode}
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
                        disabled={!isEditMode || approversLoading || !formData.purchasingGroup}
                      >
                        <option value="">Select approver</option>
                        {filteredApprovers4.map((approver, index) => (
                          <option
                            key={`approver4-${
                              approver.Id || approver.id
                            }-${index}`}
                            value={(approver.Id || approver.id)?.toString()}
                          >
                            {approver.Name || approver.name}
                          </option>
                        ))}
                      </select>

                      {formData.conditionalWorkflow && (
                        <Input
                          id="approver4Condition"
                          type="text"
                          value={formData.approver4Condition}
                          onChange={handleApprover4ConditionChange}
                          placeholder="Max Amount"
                          className="w-1/3 min-w-[110px]"
                          disabled={!isEditMode}
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
                      disabled={!isEditMode || financeHeadsLoading}
                    >
                      {financeHeads.map((head, index) => (
                        <option
                          key={`finance-${head.Id || head.id}-${index}`}
                          value={(head.Id || head.id)?.toString()}
                        >
                          {head.Name || head.name}
                        </option>
                      ))}
                    </select>
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
                      disabled={!isEditMode || poVerifiersLoading || !formData.paymentMode || formData.paymentMode === "-1"}
                    >
                      <option value="">Select verification officer</option>
                      {poVerifiers.map((verifier, index) => {
                        const verifierId = verifier.Id || verifier.id || "";
                        const verifierName = verifier.Name || verifier.name || "";
                        return (
                          <option
                            key={`po-verification-${verifierId}-${index}`}
                            value={verifierId}
                          >
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
                {isEditMode ? (
                  <>
                    <Button
                      type="submit"
                      variant="ghost"
                      className="gap-2 px-4 py-2 text-xs"
                      disabled={!isFormValid() || isSubmitting}
                      style={{
                        backgroundColor: "#0152ef",
                        color: "#ffffff",
                        border: "1px solid #0152ef",
                        fontWeight: 400,
                      }}
                    >
                      {/* <Save className="h-4 w-4" /> */}
                      {isSubmitting ? "Saving..." : "Save"}
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleReset}
                      className="text-xs gap-2 cus-secondary-reset-btn"
                      disabled={isSubmitting || !hasUnsavedChanges()}
                    >
                      {/* <RotateCcw className="h-4 w-4" /> */}
                      Reset
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="px-4 py-2"
                  >
                    Back to List
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
}

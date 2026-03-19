import { createAuthHeaders } from "./api-client";

// Proxy URL: browser calls the local Next.js API route which forwards to the external API.
// This avoids browser-level CORS/network restrictions against the external origin.
const EDITOR_CONTEXT_PROXY_URL = '/api/requests/editor-context';

/**
 * Centralized API Service for Add New Request Page
 * Handles all cascading dropdown API calls with proper state management
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface EditorContextResponse {
  success: boolean;
  data: EditorContextData | null;
  message: string;
}

export interface EditorContextData {
  // Request Groups (Divisions)
  divisions: Division[];

  // Dependent on Request Group selection
  subgroups: Subgroup[];
  services: Service[];

  // Dependent on Service selection
  serviceDetails: ServiceDetail[];

  // Independent dropdowns (available on initial load)
  requestTypes: RequestType[];
  projectProposals: ProjectProposal[];
  quotationsOptions: QuotationOption[];
  specificationMaster: Specification[];

  // Dependent on Request Type selection (Billable)
  advanceReceived: AdvanceReceived[];
}

export interface Division {
  divisionId: number | string;
  divisionName: string;
  isActive: boolean;
}

export interface Subgroup {
  subgroupId: number | string;
  subgroupName: string;
  divisionId: number | string;
  isActive: boolean;
}

export interface Service {
  serviceId: number | string;
  serviceName: string;
  subgroupId: number | string;
  isActive: boolean;
}

export interface ServiceDetail {
  serviceDetailId: number | string;
  serviceDetailName: string;
  serviceId: number | string;
  isActive: boolean;
}

export interface RequestType {
  requestTypeId: number | string;
  requestTypeName: string;
  isActive: boolean;
}

export interface ProjectProposal {
  projectProposalId: number | string;
  projectProposalName: string;
  requestTypeId: number | string;
  isActive: boolean;
}

export interface QuotationOption {
  quotationId: number | string;
  quotationValue: string;
  isActive: boolean;
}

export interface Specification {
  specificationId: number | string;
  specificationName: string;
  isActive: boolean;
}

export interface AdvanceReceived {
  advanceReceivedId: number | string;
  advanceReceivedName: string;
  isActive: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalizes field names from API response (handles PascalCase/camelCase)
 */
function normalizeFieldValue(item: any, fieldName: string): any {
  const pascalCase = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  return (
    item[fieldName] ||
    item[pascalCase] ||
    item.Id ||
    item.id ||
    item.Name ||
    item.name
  );
}

/**
 * Normalizes an array of items from API response
 */
function normalizeArray<T>(
  items: any[],
  idField: string,
  nameField: string,
  parentIdField?: string
): T[] {
  if (!Array.isArray(items)) {
    console.warn(
      `normalizeArray: Expected array for ${idField}/${nameField}, got:`,
      typeof items
    );
    return [];
  }

  console.log(
    `📋 [normalizeArray] Processing ${items.length} items for ${idField}/${nameField}`
  );
  if (items.length > 0) {
    console.log(`📋 [normalizeArray] First item:`, items[0]);
  }

  const results = items.map((item) => {
    const pascalCaseId = idField.charAt(0).toUpperCase() + idField.slice(1);
    const pascalCaseName =
      nameField.charAt(0).toUpperCase() + nameField.slice(1);

    const normalized: any = {
      ...item,
      [idField]: item[idField] || item[pascalCaseId] || item.Id || item.id,
      [nameField]:
        item[nameField] ||
        item[pascalCaseName] ||
        item.Name ||
        item.name ||
        item.Value ||
        item.value,
      isActive: item.IsActive ?? item.isActive ?? true,
    };

    // Handle parent ID field if specified
    if (parentIdField) {
      const pascalCaseParent =
        parentIdField.charAt(0).toUpperCase() + parentIdField.slice(1);

      // Special handling for divisionId (might be called groupId in API)
      if (parentIdField === "divisionId") {
        normalized[parentIdField] =
          item.divisionId ||
          item.DivisionId ||
          item.groupId ||
          item.GroupId ||
          item.ParentId ||
          item.parentId;
      }
      // Special handling for subgroupId
      else if (parentIdField === "subgroupId") {
        normalized[parentIdField] =
          item.subgroupId ||
          item.SubgroupId ||
          item.subGroupId ||
          item.SubGroupId ||
          item.ParentId ||
          item.parentId;
      }
      // Generic parent ID handling
      else {
        normalized[parentIdField] =
          item[parentIdField] ||
          item[pascalCaseParent] ||
          item.ParentId ||
          item.parentId;
      }

      console.log(
        `  ➡️ Item normalized: id=${normalized[idField]}, name=${normalized[nameField]}, parent=${normalized[parentIdField]}`
      );
    } else {
      console.log(
        `  ➡️ Item normalized: id=${normalized[idField]}, name=${normalized[nameField]}`
      );
    }

    return normalized as T;
  });

  console.log(
    `✅ [normalizeArray] Completed: ${results.length} items for ${idField}/${nameField}`
  );
  return results;
}

/**
 * Normalizes the complete editor context data
 */
function normalizeEditorContext(apiData: any): EditorContextData {
  console.log("🔍 [normalizeEditorContext] Starting normalization...");
  console.log("🔍 [normalizeEditorContext] Raw API data:", apiData);

  // Helper function to flatten nested arrays (API sometimes returns [[items]] instead of [items])
  const flattenArray = (data: any): any[] => {
    if (!data) return [];
    if (!Array.isArray(data)) return [];

    // If first element is an array, flatten it
    if (data.length > 0 && Array.isArray(data[0])) {
      console.log("⚠️ Detected nested array, flattening:", data);
      return data[0];
    }

    return data;
  };

  const normalized = {
    divisions: normalizeArray<Division>(
      flattenArray(
        apiData.groups ||
          apiData.divisions ||
          apiData.Divisions ||
          apiData.Groups ||
          []
      ),
      "divisionId",
      "divisionName"
    ),
    subgroups: (() => {
      const rawSubgroups = flattenArray(
        apiData.subgroups ||
          apiData.subGroups ||
          apiData.SubGroups ||
          apiData.Subgroups ||
          []
      );
      console.log(
        "🔍 [normalizeEditorContext] RAW SUBGROUPS before normalization:",
        rawSubgroups
      );
      const normalized = normalizeArray<Subgroup>(
        rawSubgroups,
        "subgroupId",
        "subgroupName",
        "divisionId"
      );
      console.log(
        "🔍 [normalizeEditorContext] NORMALIZED SUBGROUPS:",
        normalized
      );
      return normalized;
    })(),
    services: (() => {
      const rawServices = flattenArray(
        apiData.services || apiData.Services || []
      );
      console.log(
        "🔍 [normalizeEditorContext] RAW SERVICES before normalization:",
        rawServices
      );
      const normalized = normalizeArray<Service>(
        rawServices,
        "serviceId",
        "serviceName",
        "subgroupId"
      );
      console.log(
        "🔍 [normalizeEditorContext] NORMALIZED SERVICES:",
        normalized
      );
      return normalized;
    })(),
    serviceDetails: normalizeArray<ServiceDetail>(
      flattenArray(apiData.serviceDetails || apiData.ServiceDetails || []),
      "serviceDetailId",
      "serviceDetailName",
      "serviceId"
    ),
    requestTypes: normalizeArray<RequestType>(
      flattenArray(
        apiData.requestTypes ||
          apiData.RequestTypes ||
          apiData.requestType ||
          apiData.RequestType ||
          []
      ),
      "requestTypeId",
      "requestTypeName"
    ),
    projectProposals: normalizeArray<ProjectProposal>(
      flattenArray(
        apiData.projectProposals ||
          apiData.ProjectProposals ||
          apiData.partnerProjectProposal ||
          apiData.PartnerProjectProposal ||
          []
      ),
      "projectProposalId",
      "projectProposalName",
      "requestTypeId"
    ),
    quotationsOptions: normalizeArray<QuotationOption>(
      flattenArray(
        apiData.quotationsOptions ||
          apiData.QuotationsOptions ||
          apiData.quotationOptions ||
          apiData.QuotationOptions ||
          []
      ),
      "quotationId",
      "quotationValue"
    ),
    specificationMaster: normalizeArray<Specification>(
      flattenArray(
        apiData.specificationMaster ||
          apiData.SpecificationMaster ||
          apiData.specifications ||
          apiData.Specifications ||
          []
      ),
      "specificationId",
      "specificationName"
    ),
    advanceReceived: normalizeArray<AdvanceReceived>(
      flattenArray(
        apiData.advanceReceivedOptions ||
          apiData.AdvanceReceivedOptions ||
          apiData.advanceReceived ||
          apiData.AdvanceReceived ||
          apiData.advancedReceived ||
          apiData.AdvancedReceived ||
          []
      ),
      "advanceReceivedId",
      "advanceReceivedName"
    ),
  };

  console.log("✅ [normalizeEditorContext] Normalization complete!");
  console.log("✅ Counts:", {
    divisions: normalized.divisions.length,
    subgroups: normalized.subgroups.length,
    services: normalized.services.length,
    serviceDetails: normalized.serviceDetails.length,
  });

  return normalized;
}

// ============================================================================
// API SERVICE CLASS
// ============================================================================

class AddRequestService {
  /**
   * Fetches initial editor context data (all dropdown options)
   * Called on page load - no parameters
   */
  async getInitialEditorContext(): Promise<EditorContextResponse> {
    try {
      const url = EDITOR_CONTEXT_PROXY_URL;

      console.log(
        "🔵 [AddRequestService] Fetching initial editor context:",
        url
      );

      const response = await fetch(url, {
        method: "GET",
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.json();
      console.log(
        "📥 [AddRequestService] Initial context raw response:",
        rawData
      );

      // Handle different response structures
      let data = rawData;
      if (rawData && typeof rawData === "object" && "data" in rawData) {
        data = rawData.data;
      }
      if (rawData?.success && rawData?.data) {
        data = rawData.data;
      }

      const normalizedData = normalizeEditorContext(data);

      console.log("✅ [AddRequestService] Initial context normalized:", {
        divisions: normalizedData.divisions.length,
        requestTypes: normalizedData.requestTypes.length,
        quotationsOptions: normalizedData.quotationsOptions.length,
        specificationMaster: normalizedData.specificationMaster.length,
      });

      return {
        success: true,
        data: normalizedData,
        message: "Initial editor context loaded successfully",
      };
    } catch (error) {
      console.error(
        "❌ [AddRequestService] Error fetching initial context:",
        error
      );

      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch initial editor context",
      };
    }
  }

  /**
   * Fetches editor context filtered by Request Group (Division)
   * Called when user selects a Request Group
   * Returns: subgroups and services for the selected group
   */
  async getEditorContextByGroup(
    groupId: string | number
  ): Promise<EditorContextResponse> {
    try {
      const url = `${EDITOR_CONTEXT_PROXY_URL}?groupId=${groupId}`;

      console.log("🔵 [AddRequestService] Fetching context by groupId:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.json();
      console.log(
        "📥 [AddRequestService] Group context raw response:",
        rawData
      );
      console.log("📥 [AddRequestService] Raw subgroups:", rawData.subgroups);
      console.log("📥 [AddRequestService] Raw services:", rawData.services);
      console.log(
        "📥 [AddRequestService] Full JSON:",
        JSON.stringify(rawData, null, 2)
      );

      // Handle different response structures
      let data = rawData;
      if (rawData && typeof rawData === "object" && "data" in rawData) {
        data = rawData.data;
      }
      if (rawData?.success && rawData?.data) {
        data = rawData.data;
      }

      const normalizedData = normalizeEditorContext(data);

      // CRITICAL FIX: The API doesn't return parentId for subgroups/services
      // Since this API was called with groupId, ALL returned subgroups belong to this group
      // We need to manually set the divisionId for all subgroups
      console.log(
        "🔧 [AddRequestService] Setting divisionId for subgroups to:",
        groupId
      );
      normalizedData.subgroups = normalizedData.subgroups.map((subgroup) => ({
        ...subgroup,
        divisionId: groupId.toString(),
      }));

      // Also set divisionId for all services (they also belong to this group)
      console.log(
        "🔧 [AddRequestService] Setting divisionId for services to:",
        groupId
      );
      normalizedData.services = normalizedData.services.map((service) => ({
        ...service,
        divisionId: groupId.toString(),
      }));

      console.log("✅ [AddRequestService] Group context normalized:", {
        subgroups: normalizedData.subgroups.length,
        services: normalizedData.services.length,
        firstSubgroup: normalizedData.subgroups[0],
        firstService: normalizedData.services[0],
      });

      return {
        success: true,
        data: normalizedData,
        message: "Group editor context loaded successfully",
      };
    } catch (error) {
      console.error(
        "❌ [AddRequestService] Error fetching group context:",
        error
      );

      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch group editor context",
      };
    }
  }

  /**
   * Fetches editor context filtered by Service
   * Called when user selects a Service
   * Returns: service details for the selected service
   */
  async getEditorContextByService(
    serviceId: string | number
  ): Promise<EditorContextResponse> {
    try {
      const url = `${EDITOR_CONTEXT_PROXY_URL}?serviceId=${serviceId}`;

      console.log("🔵 [AddRequestService] Fetching context by serviceId:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.json();
      console.log(
        "📥 [AddRequestService] Service context raw response:",
        rawData
      );
      console.log(
        "📥 [AddRequestService] Raw serviceDetails:",
        rawData.serviceDetails
      );
      console.log(
        "📥 [AddRequestService] Full JSON:",
        JSON.stringify(rawData, null, 2)
      );

      // Handle different response structures
      let data = rawData;
      if (rawData && typeof rawData === "object" && "data" in rawData) {
        data = rawData.data;
      }
      if (rawData?.success && rawData?.data) {
        data = rawData.data;
      }

      const normalizedData = normalizeEditorContext(data);

      // CRITICAL FIX: The API doesn't return parentId for serviceDetails
      // Since this API was called with serviceId, ALL returned serviceDetails belong to this service
      console.log(
        "🔧 [AddRequestService] Setting serviceId for serviceDetails to:",
        serviceId
      );
      console.log(
        "🔧 [AddRequestService] ServiceDetails before mapping:",
        normalizedData.serviceDetails
      );
      normalizedData.serviceDetails = normalizedData.serviceDetails.map(
        (detail) => ({
          ...detail,
          serviceId: serviceId.toString(),
        })
      );

      console.log("✅ [AddRequestService] Service context normalized:", {
        serviceDetails: normalizedData.serviceDetails.length,
        firstDetail: normalizedData.serviceDetails[0],
        allDetails: normalizedData.serviceDetails,
      });

      return {
        success: true,
        data: normalizedData,
        message: "Service editor context loaded successfully",
      };
    } catch (error) {
      console.error(
        "❌ [AddRequestService] Error fetching service context:",
        error
      );

      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch service editor context",
      };
    }
  }

  /**
   * Fetches editor context filtered by Request Type Category
   * Called when user selects a Request Type
   * Returns: project proposals for the selected request type
   */
  async getEditorContextByCategory(
    categoryId: string | number
  ): Promise<EditorContextResponse> {
    try {
      const url = `${EDITOR_CONTEXT_PROXY_URL}?categoryId=${categoryId}`;

      console.log(
        "🔵 [AddRequestService] Fetching context by categoryId:",
        url
      );

      const response = await fetch(url, {
        method: "GET",
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.json();
      console.log(
        "📥 [AddRequestService] Category context raw response:",
        rawData
      );

      // Handle different response structures
      let data = rawData;
      if (rawData && typeof rawData === "object" && "data" in rawData) {
        data = rawData.data;
      }
      if (rawData?.success && rawData?.data) {
        data = rawData.data;
      }

      const normalizedData = normalizeEditorContext(data);

      console.log("✅ [AddRequestService] Category context normalized:", {
        projectProposals: normalizedData.projectProposals.length,
      });

      return {
        success: true,
        data: normalizedData,
        message: "Category editor context loaded successfully",
      };
    } catch (error) {
      console.error(
        "❌ [AddRequestService] Error fetching category context:",
        error
      );

      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch category editor context",
      };
    }
  }

  /**
   * Fetches editor context filtered by Request Type (for Billable - ID=2)
   * Called when user selects "Billable" from Request Type dropdown
   * Returns: advance received options for billable requests
   */
  async getEditorContextByRequestType(
    requestType: string | number
  ): Promise<EditorContextResponse> {
    try {
      const url = `${EDITOR_CONTEXT_PROXY_URL}?requestType=${requestType}`;

      console.log(
        "🔵 [AddRequestService] Fetching context by requestType:",
        url
      );

      const response = await fetch(url, {
        method: "GET",
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.json();
      console.log(
        "📥 [AddRequestService] Request Type context raw response:",
        rawData
      );

      // Handle different response structures
      let data = rawData;
      if (rawData && typeof rawData === "object" && "data" in rawData) {
        data = rawData.data;
      }
      if (rawData?.success && rawData?.data) {
        data = rawData.data;
      }

      const normalizedData = normalizeEditorContext(data);

      console.log("✅ [AddRequestService] Request Type context normalized:", {
        advanceReceived: normalizedData.advanceReceived.length,
      });

      return {
        success: true,
        data: normalizedData,
        message: "Request Type editor context loaded successfully",
      };
    } catch (error) {
      console.error(
        "❌ [AddRequestService] Error fetching request type context:",
        error
      );

      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch request type editor context",
      };
    }
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const addRequestService = new AddRequestService();

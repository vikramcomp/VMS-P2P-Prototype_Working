// Request Editor Context Types
export interface Division {
  divisionId: number;
  divisionName: string;
  isActive: boolean;
}

export interface Subgroup {
  subgroupId: number;
  subgroupName: string;
  divisionId: number;
  isActive: boolean;
}

export interface Service {
  serviceId: number;
  serviceName: string;
  divisionId: number;
  subgroupId: number;
  isActive: boolean;
}

export interface ServiceDetail {
  serviceDetailId: number;
  serviceDetailName: string;
  serviceId: number;
  isActive: boolean;
}

export interface RequestType {
  requestTypeId: number;
  requestTypeName: string;
  isActive: boolean;
}

export interface ProjectProposal {
  projectProposalId: number;
  projectProposalName: string;
  requestTypeId: number;
  isActive: boolean;
}

export interface QuotationOption {
  quotationId: number;
  quotationValue: string;
  isActive: boolean;
}

export interface SpecificationMaster {
  specificationId: number;
  specificationName: string;
  specificationOrder: number;
  isActive: boolean;
}

export interface AdvanceReceived {
  advanceReceivedId: number;
  advanceReceivedName: string;
  isActive: boolean;
}

export interface RequestEditorContext {
  divisions: Division[];
  subgroups: Subgroup[];
  services: Service[];
  serviceDetails: ServiceDetail[];
  requestTypes: RequestType[];
  projectProposals: ProjectProposal[];
  quotationsOptions: QuotationOption[];
  specificationMaster: SpecificationMaster[];
  advanceReceived: AdvanceReceived[];
}

export interface RequestEditorContextResponse {
  success: boolean;
  data: RequestEditorContext;
  message?: string;
}

// API parameters for editor context request
export interface EditorContextParams {
  groupId?: string;
  requestId?: string;
  categoryId?: string;
  serviceId?: string;
  serviceDetailMappingId?: string;
  subgroupId?: string;
  requestType?: string;
}

// PR Line Item for the dynamic table
export interface PRLineItem {
  sNo: number;
  productId: string;
  productName: string;
  productDescription: string;
  unitType: string;
  productType: string;
  quantity: number;
  remarks: string;
  attachmentName?: string;
}

// Form Data Types
export interface AddNewRequestFormData {
  requestGroup: string;
  subgroup: string;
  service: string;
  serviceDetails: string;
  request: string;
  requestType: string;
  advanceReceived: string;
  startDate: string;
  endDate: string;
  projectProposalId: string;
  description: string;
  specificationDocument: File | null;
  numberOfQuotations: string;
  specification1: string;
  specification2: string;
  specification3: string;
  specification4: string;
  specification5: string;
  currency: string;
  prType: string;
  // UI-only fields for Business Central integration later
  prId: string;
  location: string;
  address: string;
  items: PRLineItem[];
}

// Dropdown Options for UI
export interface DropdownOption {
  id: string;
  name: string;
  parentId?: string;
}
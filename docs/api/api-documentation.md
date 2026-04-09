# VMS 2.0 - API Documentation

This document lists all APIs used in the VMS 2.0 Frontend application, organized by module.

**Base URL:** `{NEXT_PUBLIC_API_BASE_URL}`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Dashboard](#dashboard)
3. [Manage Groups (Divisions)](#manage-groups-divisions)
4. [Manage Subgroups](#manage-subgroups)
5. [Manage Services](#manage-services)
6. [Manage Service Details](#manage-service-details)
7. [Manage Users](#manage-users)
8. [Manage Vendors](#manage-vendors)
9. [Requests](#requests)
10. [Quotations](#quotations)
11. [Approvals](#approvals)
12. [Purchase Orders](#purchase-orders)
13. [Invoices & Payments](#invoices--payments)
14. [Workflows](#workflows)
15. [Service Mapping](#service-mapping)
16. [Subgroup Mapping](#subgroup-mapping)
17. [Studios](#studios)
18. [Lookups](#lookups)
19. [External Integrations](#external-integrations)

---

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login with credentials |
| POST | `/auth/microsoft-sso` | Microsoft SSO authentication |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/change-password` | Change user password |

### Request/Response Examples

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "IsSuccess": true,
  "Message": "Login successful",
  "Data": {
    "Token": "jwt_token_here",
    "User": {
      "UserId": 1,
      "UserName": "John Doe",
      "Email": "user@example.com",
      "RoleId": 1,
      "RoleName": "Admin"
    }
  }
}
```

---

## Dashboard

The dashboard module does not have dedicated API endpoints. It utilizes data from various other modules (Requests, Approvals, etc.) to display summary information.

---

## Manage Groups (Divisions)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/groups/getgroups` | Get paginated list of groups with filtering |
| POST | `/groups` | Create a new group |
| GET | `/groups/{id}` | Get group by ID |
| PUT | `/groups/{id}` | Update group by ID |
| DELETE | `/groups/{id}` | Delete group by ID |
| POST | `/groups/delete-multiple` | Bulk delete groups |
| POST | `/groups/change-status` | Change status of multiple groups |
| POST | `/groups/export` | Export groups data |
| GET | `/groups/getstudio` | Get studios for dropdown |

### Request Body - Get Groups

```json
{
  "SearchText": "",
  "SearchColumn": "",
  "PageSize": 10,
  "PageNumber": 1,
  "SortColumn": "CategoryName",
  "SortType": "asc",
  "Filter": {}
}
```

### Request Body - Create/Update Group

```json
{
  "CategoryName": "Group Name",
  "Description": "Group Description",
  "StudioId": 1,
  "Status": 1
}
```

### Request Body - Change Status

```json
{
  "CategoryIds": [1, 2, 3],
  "Status": 1
}
```

---

## Manage Subgroups

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/subgroups` | Get paginated list of subgroups / Create subgroup |
| GET | `/subgroups/{id}` | Get subgroup by ID |
| PUT | `/subgroups/{id}` | Update subgroup by ID |
| DELETE | `/subgroups/{id}` | Delete subgroup by ID |
| POST | `/subgroups/change-status` | Change status of multiple subgroups |

### Request Body - Get Subgroups

```json
{
  "SearchText": "",
  "SearchColumn": "",
  "PageSize": 10,
  "PageNumber": 1,
  "SortColumn": "SubgroupName",
  "SortType": "asc"
}
```

### Request Body - Create/Update Subgroup

```json
{
  "SubgroupName": "Subgroup Name",
  "SubgroupDescription": "Description",
  "Status": 1
}
```

### Request Body - Change Status

```json
{
  "SubgroupIds": [1, 2, 3],
  "Status": 1
}
```

---

## Manage Services

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/services/all` | Get all services |
| POST | `/services` | Create a new service |
| GET | `/services/{id}` | Get service by ID |
| PUT | `/services/{id}` | Update service by ID |
| DELETE | `/services/{id}` | Delete service by ID |
| POST | `/services/delete-multiple` | Bulk delete services |

### Request Body - Create/Update Service

```json
{
  "ServiceName": "Service Name",
  "ServiceDescription": "Description",
  "Status": 1
}
```

---

## Manage Service Details

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/service-details/all` | Get all service details |
| POST | `/service-details` | Create a new service detail |
| GET | `/service-details/{id}` | Get service detail by ID |
| PUT | `/service-details/{id}` | Update service detail by ID |
| DELETE | `/service-details/{id}` | Delete service detail by ID |
| POST | `/service-details/delete-multiple` | Bulk delete service details |

---

## Manage Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/getUsers` | Get paginated list of users with filtering |
| POST | `/users` | Create a new user |
| GET | `/users/{id}` | Get user by ID |
| PUT | `/users/{id}` | Update user by ID |
| POST | `/users/delete` | Delete user(s) |
| POST | `/users/change-status` | Change status of users |
| POST | `/users/export` | Export users data |
| GET | `/users/modules-by-role/{roleId}` | Get modules accessible by role |

### Request Body - Get Users

```json
{
  "SearchText": "",
  "SearchColumn": "",
  "PageSize": 10,
  "PageNumber": 1,
  "SortColumn": "UserName",
  "SortType": "asc",
  "Filter": {
    "Status": null,
    "RoleId": null
  }
}
```

### Request Body - Create/Update User

```json
{
  "UserName": "John Doe",
  "Email": "john@example.com",
  "RoleId": 2,
  "CategoryIds": [1, 2],
  "Status": 1
}
```

### Request Body - Change Status

```json
{
  "UserIds": [1, 2, 3],
  "Status": 1
}
```

---

## Manage Vendors

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/vendors/GetAllVendors` | Get paginated list of vendors |
| POST | `/vendors` | Create a new vendor |
| GET | `/vendors/{id}` | Get vendor by ID |
| PUT | `/vendors/{id}` | Update vendor by ID |
| DELETE | `/vendors/{id}` | Delete vendor by ID |
| POST | `/vendors/change-status` | Change status of vendors |
| POST | `/vendors/export` | Export vendors data |

### Request Body - Get Vendors

```json
{
  "SearchText": "",
  "SearchColumn": "",
  "PageSize": 10,
  "PageNumber": 1,
  "SortColumn": "VendorName",
  "SortType": "asc",
  "Filter": {}
}
```

### Request Body - Create/Update Vendor

```json
{
  "VendorName": "Vendor Name",
  "VendorCode": "V001",
  "Email": "vendor@example.com",
  "Phone": "1234567890",
  "Address": "123 Street",
  "Status": 1
}
```

---

## Requests

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/requests/editor-context` | Get context data for request editor (dropdowns) |
| POST | `/requests` | Get paginated list of requests / Create request |
| GET | `/requests/{id}` | Get request by ID |
| PUT | `/requests/{id}` | Update request by ID |
| POST | `/requests/change-status` | Change status of requests |
| POST | `/requests/export` | Export requests data |
| POST | `/requests/save-and-submit` | Save and submit request for approval |

### Request Body - Get Requests

```json
{
  "SearchText": "",
  "SearchColumn": "",
  "PageSize": 10,
  "PageNumber": 1,
  "SortColumn": "RequestId",
  "SortType": "desc",
  "Filter": {
    "Status": null,
    "RequestTypeId": null,
    "CategoryId": null
  }
}
```

### Request Body - Create/Update Request

```json
{
  "RequestTypeId": 1,
  "CategoryId": 2,
  "SubgroupId": 3,
  "ServiceId": 4,
  "ServiceDetailId": 5,
  "ProjectProposalId": "P001",
  "BudgetAmount": 10000,
  "Description": "Request description",
  "DocumentName": "specification.pdf",
  "StartDate": "2024-01-01",
  "EndDate": "2024-12-31",
  "VendorId": 1,
  "Status": 1
}
```

### Editor Context Response

```json
{
  "IsSuccess": true,
  "Data": {
    "RequestTypes": [...],
    "Categories": [...],
    "Subgroups": [...],
    "Services": [...],
    "ServiceDetails": [...],
    "Vendors": [...],
    "Approvers": [...]
  }
}
```

---

## Quotations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/quotations/list` | Get paginated list of quotations |
| GET | `/quotations/{requestId}/context` | Get context for quotation form |
| GET | `/quotations/payment-modes` | Get payment modes lookup |
| GET | `/quotations/billing-types` | Get billing types lookup |
| GET | `/quotations/specification-masters` | Get specification masters |
| POST | `/quotations/{requestId}/add-specifications` | Add specifications to quotation |
| POST | `/quotations/{requestId}/submit` | Submit quotation |
| GET | `/quotations/eligible-vendors` | Get eligible vendors for quotation |
| POST | `/quotations/po-forecast` | Get PO forecast data |

### Request Body - Get Quotations

```json
{
  "SearchText": "",
  "PageSize": 10,
  "PageNumber": 1,
  "SortColumn": "QuotationId",
  "SortType": "desc"
}
```

### Add Specifications Request

```json
{
  "Specifications": [
    {
      "SpecificationMasterId": 1,
      "Description": "Spec description",
      "Quantity": 10,
      "UnitPrice": 100,
      "PaymentModeId": 1,
      "BillingTypeId": 1
    }
  ]
}
```

---

## Approvals

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/approvals/list` | Get paginated list of approvals |
| POST | `/approvals/export` | Export approvals data |
| GET | `/approvals/{requestId}/context` | Get context for approval page |
| POST | `/approvals/{requestId}/po-approval` | Submit PO approval decision |

### Request Body - Get Approvals

```json
{
  "SearchText": "",
  "PageSize": 10,
  "PageNumber": 1,
  "SortColumn": "RequestId",
  "SortType": "desc",
  "Filter": {
    "Status": null
  }
}
```

### PO Approval Request

```json
{
  "RequestId": 1,
  "Action": "approve",
  "Comments": "Approved"
}
```

---

## Purchase Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/purchase-orders/po-types` | Get PO types lookup |
| GET | `/purchase-orders/templates` | Get PO templates |
| GET | `/purchase-orders/{id}/context` | Get context for PO form |
| POST | `/purchase-orders/{id}/generate-number` | Generate PO number |
| GET | `/purchase-orders/{id}/distribution` | Get PO distribution details |

### Generate PO Number Response

```json
{
  "IsSuccess": true,
  "Data": {
    "PONumber": "PO-2024-0001"
  }
}
```

---

## Invoices & Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/invoices` | Get paginated list of invoices |
| POST | `/invoices/export` | Export invoices data |
| GET | `/invoices/details` | Get invoice details |
| POST | `/invoices/status` | Change invoice status |
| GET | `/purchase-orders/{id}/invoices/context` | Get context for invoice creation |
| GET | `/payments/{id}` | Get payment details |

### Request Body - Get Invoices

```json
{
  "SearchText": "",
  "PageSize": 10,
  "PageNumber": 1,
  "SortColumn": "InvoiceId",
  "SortType": "desc",
  "Filter": {
    "Status": null
  }
}
```

### Change Invoice Status

```json
{
  "InvoiceId": 1,
  "Status": 2,
  "Comments": "Invoice approved"
}
```

---

## Workflows

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workflow-editor/list` | Get paginated list of workflows |
| POST | `/workflow-editor` | Create a new workflow |
| GET | `/workflow-editor/{id}` | Get workflow by ID |
| PUT | `/workflow-editor/{id}` | Update workflow by ID |
| POST | `/workflow-editor/change-status` | Change status of workflows |
| POST | `/workflow-editor/export` | Export workflows data |

### Request Body - Get Workflows

```json
{
  "SearchText": "",
  "PageSize": 10,
  "PageNumber": 1,
  "SortColumn": "WorkflowName",
  "SortType": "asc",
  "Filter": {}
}
```

### Request Body - Create/Update Workflow

```json
{
  "WorkflowName": "Approval Workflow",
  "Description": "Multi-level approval workflow",
  "CategoryId": 1,
  "Steps": [
    {
      "StepOrder": 1,
      "ApproverId": 2,
      "ApproverType": "User"
    }
  ],
  "Status": 1
}
```

---

## Service Mapping

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/service-division-mapping/division/{id}` | Get service mappings for a division |
| POST | `/service-division-mapping/division/{id}/update` | Update service mappings for a division |

### Update Service Mapping Request

```json
{
  "DivisionId": 1,
  "ServiceIds": [1, 2, 3, 4]
}
```

---

## Subgroup Mapping

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/group-subgroup-mapping/group/{id}` | Get subgroup mappings for a group |
| POST | `/group-subgroup-mapping/group/{id}/update` | Update subgroup mappings for a group |

### Update Subgroup Mapping Request

```json
{
  "GroupId": 1,
  "SubgroupIds": [1, 2, 3]
}
```

---

## Studios

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/studios` | Get all studios |
| GET | `/groups/getstudio` | Get studios for dropdown (via groups service) |

### Response

```json
{
  "IsSuccess": true,
  "Data": {
    "Records": [
      {
        "StudioId": 1,
        "StudioName": "Studio A"
      }
    ]
  }
}
```

---

## Lookups

Common lookup endpoints used across modules:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/lookups/groups` | Get groups for dropdown |
| GET | `/lookups/roles` | Get roles for dropdown |
| GET | `/lookups/master-modules` | Get modules for dropdown |
| GET | `/lookups/request-types` | Get request types for dropdown |
| GET | `/lookups/request-types?includeAll=false` | Get request types excluding "All" option |

### Lookup Response Format

```json
{
  "IsSuccess": true,
  "Data": {
    "Records": [
      {
        "Id": 1,
        "Name": "Item Name"
      }
    ]
  }
}
```

---

## External Integrations

### Panther SOAP Service

Third-party SOAP integration for Project/Proposal data.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/soap/project-proposals` | Internal API route that calls Panther SOAP service |

**External SOAP Endpoint:** `https://inspireqaservices.compunnel.com/Panther.svc`

**WSDL:** `https://inspireqaservices.compunnel.com/Panther.svc?wsdl`

### Request Body

```json
{
  "requestTypeId": 1
}
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "101",
      "name": "Project Name",
      "requestTypeId": "1"
    }
  ],
  "message": "Project proposals loaded successfully"
}
```

---

## Common Response Format

All APIs follow a standard response format:

### Success Response

```json
{
  "IsSuccess": true,
  "Message": "Operation successful",
  "Data": {
    "Records": [...],
    "TotalRecords": 100,
    "PageNumber": 1,
    "PageSize": 10
  }
}
```

### Error Response

```json
{
  "IsSuccess": false,
  "Message": "Error message here",
  "Data": null
}
```

---

## Authentication Headers

All API requests (except login) require authentication:

```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 0 | In-Active |
| 1 | Active |
| 2 | Pending (context-specific) |

---

## Notes

1. **Pagination**: Most list endpoints support pagination with `PageSize` and `PageNumber` parameters.
2. **Sorting**: Use `SortColumn` and `SortType` (asc/desc) for sorting.
3. **Filtering**: Pass filter criteria in the `Filter` object within the request body.
4. **Search**: Use `SearchText` for text-based searching.
5. **Export**: Export endpoints return file blobs (Excel/CSV).

---

*Last Updated: January 2025*

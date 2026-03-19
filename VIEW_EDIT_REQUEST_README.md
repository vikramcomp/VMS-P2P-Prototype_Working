# View/Edit Request Implementation

## Overview
Implemented View Request and Edit Request functionality on the Manage Request page using a reusable form component pattern. The implementation reuses the existing Add New Request form template with different modes (add/view/edit) for consistency and maintainability.

## Implementation Summary

### 1. **Service Layer - API Integration**
**File:** `src/services/requests-service.ts`

Added new method to fetch individual request data:
```typescript
async getRequestById(id: number): Promise<any>
```
- **Endpoint:** `GET https://vmsqa-ver2.compunnel.com/api/requests/{id}`
- **Purpose:** Retrieves complete request data for view/edit pages
- **Location:** Lines 257-284

### 2. **Reusable Form Component**
**File:** `src/components/requests/request-form.tsx` (NEW)

Created a unified form component that supports three modes:
- `mode: 'add'` - Create new request
- `mode: 'view'` - Read-only view of existing request
- `mode: 'edit'` - Editable view of existing request

**Key Features:**
- **Smart Data Loading:** Automatically fetches and pre-populates data when `initialData` prop is provided
- **Cascading Dropdowns:** Uses `useRequestDropdowns` hook for intelligent dropdown data management
- **Conditional Rendering:** Fields are disabled/read-only in view mode
- **Field Mapping:** Handles both PascalCase and camelCase API responses
- **Dropdown Triggers:** Automatically refetches dependent dropdown data based on selected values

**Props Interface:**
```typescript
interface RequestFormProps {
  mode: 'add' | 'view' | 'edit';
  requestId?: number;
  initialData?: any;
}
```

**Data Mapping:**
The component maps API response fields to form structure:
```typescript
{
  requestGroup: data.groupId,
  subgroup: data.subgroupId,
  service: data.serviceId,
  serviceDetails: data.serviceDetailId,
  request: data.requestName,
  requestType: data.requestTypeId,
  advanceReceived: data.advanceReceived,
  startDate: data.startDate (formatted),
  endDate: data.endDate (formatted),
  projectProposalId: data.pantherProjectProposalId,
  description: data.requestDescription,
  numberOfQuotations: data.noOfQuotations || data.minimumQuotationsRequested
}
```

### 3. **View Request Page**
**File:** `src/app/requests/[id]/page.tsx` (NEW)

Dynamic route page for viewing request details:
- **Route:** `/requests/[id]`
- **Mode:** Read-only (all form fields disabled)
- **Features:**
  - Fetches request data using `requestsService.getRequestById()`
  - Loading state with spinner
  - Error handling with user-friendly messages
  - Wrapped in `ProtectedRoute` and `MainLayout` for authentication and consistent UI
  - Toast notifications for errors

**Flow:**
1. Extract request ID from URL params
2. Fetch request data from API
3. Pass data to `RequestForm` component with `mode="view"`
4. Render form with all fields disabled

### 4. **Edit Request Page**
**File:** `src/app/requests/[id]/edit/page.tsx` (NEW)

Dynamic route page for editing request details:
- **Route:** `/requests/[id]/edit`
- **Mode:** Editable (all form fields enabled)
- **Features:**
  - Same data fetching logic as view page
  - Pre-populated form fields
  - Submit button changes to "Update Request"
  - Form validation same as create mode
  - Toast notifications for success/error

**Flow:**
1. Extract request ID from URL params
2. Fetch existing request data from API
3. Pass data to `RequestForm` component with `mode="edit"`
4. User modifies fields
5. On submit, update request (API integration ready)

### 5. **Updated Add New Request Page**
**File:** `src/app/requests/new/page.tsx` (UPDATED)

Refactored to use the new reusable `RequestForm` component:
```typescript
<RequestForm mode="add" />
```

**Benefits:**
- Consistent UI/UX across all request forms
- Single source of truth for form logic
- Easier maintenance and bug fixes

### 6. **Existing Navigation Integration**
**File:** `src/components/requests/requests-content.tsx` (NO CHANGES NEEDED)

The requests list page already has View and Edit buttons implemented:
- **View Button:** Always visible for all requests
- **Edit Button:** Only visible when `statusText === "Pending Submission"`

**Handler Functions (Already Implemented):**
```typescript
const handleViewRequest = (requestId: number) => {
  router.push(`/requests/${requestId}`);
};

const handleEditRequest = (requestId: number) => {
  router.push(`/requests/${requestId}/edit`);
};
```

## Technical Architecture

### Directory Structure
```
src/app/requests/
├── page.tsx                    # Manage Requests (list view)
├── new/
│   └── page.tsx               # Add New Request
└── [id]/
    ├── page.tsx               # View Request (read-only)
    └── edit/
        └── page.tsx           # Edit Request (editable)
```

### Component Hierarchy
```
ProtectedRoute
└── MainLayout
    └── RequestForm (mode: 'add' | 'view' | 'edit')
        ├── useRequestDropdowns hook
        ├── useToast hook
        └── Form fields with conditional rendering
```

### Data Flow

#### View/Edit Mode:
```
Page Component (View/Edit)
  ↓
Fetch data via requestsService.getRequestById(id)
  ↓
Pass initialData to RequestForm
  ↓
RequestForm maps API response to formData
  ↓
Trigger refetch for dependent dropdowns
  ↓
Render form with pre-populated fields
```

#### Dropdown Dependencies:
```
Request Group selected
  ↓ refetch({ groupId })
Subgroups & Services loaded
  ↓
Service selected
  ↓ refetch({ serviceId })
Service Details loaded
  ↓
Request Type = "2" (Billable)
  ↓ refetch({ requestType: "2" })
Advance Received options loaded
```

## Key Features

### 1. **Mode-Based Behavior**
- **Add Mode:** Empty form, all fields editable
- **View Mode:** Pre-populated form, all fields disabled/read-only
- **Edit Mode:** Pre-populated form, all fields editable

### 2. **Smart Dropdown Management**
- Maintains dropdown dependencies and cascading behavior
- Preserves selected values during dependent API calls
- Handles both PascalCase and camelCase API responses
- Loading indicators during API refetch operations

### 3. **State Preservation**
The `useRequestDropdowns` hook intelligently preserves:
- Service Details when Request Type is selected
- Subgroups/Services when Service or Request Type changes
- Form state during dropdown refetch operations

### 4. **Error Handling**
- API errors displayed via toast notifications
- Loading states with spinners
- Fallback error messages
- Validation on required fields

### 5. **Responsive Design**
- Grid layout: 3 columns on desktop, 1 column on mobile
- Consistent styling with existing pages
- Proper spacing and alignment

## API Integration

### GET Request Data
**Endpoint:** `GET /api/requests/{id}`

**Expected Response Structure:**
```typescript
{
  requestId: number,
  groupId: number,
  subgroupId: number,
  serviceId: number,
  serviceDetailId: number,
  requestTypeId: number,
  advanceReceived: number,
  pantherProjectProposalId: number,
  requestName: string,
  requestDescription: string,
  requestNumber: string,
  startDate: string, // "2025-08-29T00:00:00"
  endDate: string, // "2025-12-31T00:00:00"
  noOfQuotations: number,
  minimumQuotationsRequested: number,
  specifications: string[],
  status: number,
  // ... other fields
}
```

### UPDATE Request (Ready for Implementation)
The edit form is ready for PUT/PATCH API integration:
```typescript
async handleSubmit(e: React.FormEvent) {
  // Validation
  // API call to update request
  // Success/error handling with toast
  // Redirect to requests list
}
```

## Navigation Flow

### User Journey:

1. **View Request:**
   - User clicks "View" button on Manage Requests page
   - Navigates to `/requests/{id}`
   - Sees read-only form with all request details
   - Can click "Close" to return to list

2. **Edit Request:**
   - User clicks "Edit" button on Manage Requests page (only for "Pending Submission" status)
   - Navigates to `/requests/{id}/edit`
   - Sees editable form pre-populated with current values
   - Can modify fields and click "Update Request"
   - On success, redirected to Manage Requests page with success toast

## Testing Checklist

- [ ] View Request page loads correctly
- [ ] Edit Request page loads correctly
- [ ] Data pre-populates from API response
- [ ] All dropdowns cascade properly in edit mode
- [ ] Form validation works in edit mode
- [ ] Read-only fields cannot be edited in view mode
- [ ] Loading states display properly
- [ ] Error states display properly
- [ ] Navigation between pages works
- [ ] Edit button only shows for "Pending Submission" status
- [ ] View button shows for all requests
- [ ] Toast notifications appear on success/error
- [ ] Both PascalCase and camelCase API responses work

## Benefits

1. **Code Reusability:** Single form component for add/view/edit
2. **Consistency:** Same UI/UX across all request operations
3. **Maintainability:** Changes to form logic only need to be made once
4. **DRY Principle:** No code duplication
5. **Type Safety:** TypeScript interfaces for all props and data
6. **Error Resilience:** Handles API field name variations (PascalCase/camelCase)

## Future Enhancements

1. **Update API Integration:** Implement PUT/PATCH endpoint for updating requests
2. **Optimistic Updates:** Update UI before API confirmation for better UX
3. **Field-Level Permissions:** Different users may have different edit permissions
4. **Audit Trail:** Track who edited what and when
5. **Unsaved Changes Warning:** Prompt user before navigating away from edited form
6. **Validation Rules:** More sophisticated field validation based on business rules

## Notes

- The implementation reuses the existing `useRequestDropdowns` hook for consistent dropdown behavior
- All pages are protected with `ProtectedRoute` for authentication
- Toast notifications follow the established pattern used in other pages
- The form component is fully typed with TypeScript for type safety
- Loading states provide good user feedback during API calls
- Error handling prevents broken UI states

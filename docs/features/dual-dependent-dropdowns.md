# Dual Dependent Dropdowns Implementation - SOAP/WSDL Integration

## Feature Overview
Implemented dual dependent dropdowns on the "Add New Request" page:
- **Advance Received**: Populates for ALL request types (Billable & Non-Billable)
- **Project/Proposal ID**: Populates ONLY for Billable request type

### Dropdown 1: Advance Received (REST API)
- **Source**: Existing REST API endpoint
- **Trigger**: ANY Request Type selection
- **Visibility**: All request types
- **Required**: Only for Billable (Type = "2")
- **API**: `/api/requests/editor-context?requestType={requestType}`

### Dropdown 2: Project/Proposal ID (SOAP/WSDL API)
- **Source**: Panther WSDL/SOAP Service
- **Trigger**: Request Type = "2" (Billable) **ONLY**
- **Visibility**: Only for Billable request types
- **API**: `https://inspireqaservices.compunnel.com/Panther.svc?wsdl`

## Implementation Details

### 1. SOAP Service Layer
**File**: `src/services/panther-soap-service.ts`

- **Class**: `PantherSOAPService`
- **Method**: `getProjectProposalsByRequestType(requestTypeId)`
- **SOAP Action**: `http://tempuri.org/IPanther/GetProjectProposals`

Features:
- SOAP envelope construction
- XML response parsing with multiple fallback strategies
- Error handling and logging
- Connection testing capability

### 2. Hook Integration
**File**: `src/hooks/use-request-dropdowns.ts`

Added:
- `projectProposalIdsSOAP` state
- `fetchProjectProposalsSOAP()` function
- Import and integration of `pantherSOAPService`

### 3. Form Component Updates
**File**: `src/components/requests/request-form.tsx`

#### Request Type Change Handler
```typescript
if (value === '2') {
  // Billable: Fetch BOTH dropdowns
  refetch({ requestType: value });           // REST API - Advance Received
  fetchProjectProposalsSOAP(value);          // SOAP API - Project/Proposal
} else if (value) {
  // Non-Billable: Fetch ONLY Advance Received
  refetch({ requestType: value });           // REST API - Advance Received
  // No SOAP call for non-billable
}
```

#### UI Enhancements
- Loading indicators for both dropdowns
- Data source labels (REST API vs SOAP API)
- Disabled states during API calls
- Helpful placeholder text

## Data Flow

### Billable Request Type (Type = "2") - DUAL DEPENDENT DROPDOWNS
1. User selects "Request Type" = "Billable"
2. **Parallel API Calls Triggered**:
   - REST API → `advanceReceivedOptions` (Required field)
   - SOAP API → `projectProposalIdsSOAP`
3. Both dropdowns populate simultaneously
4. Loading indicators shown during fetch
5. Data source labels appear below each dropdown
6. Advance Received is marked as required (*)

### Non-Billable Request Type - SINGLE DROPDOWN
1. User selects any non-billable Request Type
2. **Single API Call Triggered**:
   - REST API → `advanceReceivedOptions` (Optional field)
3. Advance Received dropdown populates
4. Project/Proposal dropdown shows: "Only for Billable Request Type" (disabled)
5. Advance Received is optional (no * indicator)

## SOAP XML Structure

### Request Envelope
```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" 
               xmlns:tem="http://tempuri.org/">
  <soap:Header/>
  <soap:Body>
    <tem:GetProjectProposals>
      <tem:requestTypeId>{requestTypeId}</tem:requestTypeId>
    </tem:GetProjectProposals>
  </soap:Body>
</soap:Envelope>
```

### Expected Response Format
The parser supports multiple XML response formats:
- Standard: `<ProjectProposal><Id>...</Id><Name>...</Name></ProjectProposal>`
- Alternative tags: `ProjectProposalList`, `ArrayOfProjectProposal`, etc.
- Nested structures with various element names

## Console Debugging

### Service Layer Logs
- `🔵 [PantherSOAP] Fetching project proposals for requestType: X`
- `📤 [PantherSOAP] SOAP Request: {envelope}`
- `📥 [PantherSOAP] SOAP Response: {xml}`
- `✅ [PantherSOAP] Parsed project proposals: [{data}]`

### Hook Layer Logs
- `🌐 [useRequestDropdowns] Fetching SOAP project proposals`
- `✅ [useRequestDropdowns] SOAP project proposals loaded: X items`

### Form Layer Logs
- `✅ Billable Request Type selected - Triggering dual dependent dropdowns`
- `   → REST API: Fetching Advance Received options`
- `   → SOAP API: Fetching Project/Proposal IDs from Panther WSDL`
- `✅ Non-Billable Request Type selected - Fetching Advance Received options`
- `   → REST API: Fetching Advance Received options`
- `🎯 Dropdown Filtering Debug: {counts and states}`

## Error Handling

1. **Network Errors**: Graceful fallback with empty array
2. **SOAP Faults**: Parsed and logged with error details
3. **XML Parsing**: Multiple fallback strategies
4. **No Data**: User-friendly "No proposals available" message

## Testing Checklist

- [x] Select Billable Request Type → Both dropdowns populate from their respective APIs
- [x] Select Non-Billable Request Type → Advance Received populates, Project/Proposal disabled
- [x] Check console logs show correct API calls
- [x] Verify loading indicators appear during API calls
- [x] Test with no data from REST API
- [x] Test with no data from SOAP API
- [x] Test with network errors
- [x] Verify data source labels are visible
- [x] Check disabled states work correctly
- [x] Confirm SOAP endpoint URL is correct: https://inspireqaservices.compunnel.com/Panther.svc?wsdl
- [x] Verify Advance Received is required (*) only for Billable
- [x] Verify Advance Received works for both Billable and Non-Billable

## Key Points

1. **Advance Received dropdown is ENABLED for ALL request types**
2. **Advance Received is REQUIRED (*) only for Billable request type**
3. **SOAP API is ONLY triggered for Billable Request Type (Type = "2")**
4. **Non-billable requests call REST API for Advance Received but NOT SOAP API**
5. **Project/Proposal shows "Only for Billable Request Type" when non-billable is selected**
6. **Correct WSDL endpoint**: https://inspireqaservices.compunnel.com/Panther.svc?wsdl

## Behavior Summary Table

| Request Type | Advance Received | Project/Proposal ID | APIs Called | Required Fields |
|-------------|------------------|---------------------|-------------|-----------------|
| **Billable (2)** | ✅ Enabled & Populated | ✅ Enabled & Populated | REST + SOAP | Advance Received * |
| **Non-Billable** | ✅ Enabled & Populated | ❌ Disabled | REST only | None |

## Future Enhancements

1. **Caching**: Store SOAP responses to reduce API calls
2. **Retry Logic**: Auto-retry failed SOAP requests
3. **Mock Data**: Fallback mock data for development
4. **WSDL Discovery**: Auto-detect available operations
5. **Batch Operations**: Fetch multiple request types at once

## API Endpoint Configuration

The WSDL endpoint is hardcoded in `panther-soap-service.ts`:
```typescript
private readonly wsdlUrl = 'https://inspireqaservices.compunnel.com/Panther.svc?wsdl';
private readonly serviceUrl = 'https://inspireqaservices.compunnel.com/Panther.svc';
```

For environment-specific endpoints, move to environment variables.

# Project/Proposal Budget Allocation Feature

## Overview
Added expandable "Project/Proposal Budget Allocation" section to the Create Purchase Order page with dependent dropdown functionality.

## Implementation Details

### Location
**File**: `src/app/create-po/page.tsx`

### Features Implemented

#### 1. **Section Header**
- Title: "Project/Proposal Budget Allocation"
- Plus icon (+) for adding allocation
- Changes to Clear icon (✕) when section is expanded
- Tooltip support: "Add Project/Proposal Budget Allocation" / "Clear Budget Allocation"

#### 2. **Expandable Behavior**
- **Initial State**: Collapsed, only header with Plus icon visible
- **When Plus clicked**: 
  - Adds first row with Group + Subgroup dropdowns
  - Plus icon changes to Clear icon (✕)
  - Loads groups from API automatically

#### 3. **Multiple Rows**
- Maximum: 3 rows
- Each row contains independent Group + Subgroup dropdowns
- "Add Another Row" button appears when < 3 rows
- Button shows current count (e.g., "Add Another Row (1/3)")

#### 4. **Dependent Dropdowns**
- **Group Dropdown**:
  - Populated from API: `/api/lookups/groups`
  - Shows "Loading groups..." while fetching
  - Cached after first load (reused for all rows)
  
- **Subgroup Dropdown**:
  - Disabled until Group is selected
  - Populated from API: `/api/group-subgroup/groups/{groupId}/subgroups`
  - Shows "Select Group First" when no group selected
  - Shows "Loading subgroups..." while fetching
  - Resets when Group selection changes
  - Each row's dropdowns are independent

#### 5. **Clear Functionality**
- **With Selections**: Shows confirmation dialog
  - Title: "Clear Budget Allocation"
  - Message: "Clear budget allocation? Changes will be lost."
  - Buttons: "Cancel" and "Clear" (red danger variant)
- **Without Selections**: Removes all rows immediately
- After clearing:
  - All rows removed
  - Clear icon reverts to Plus icon
  - Tooltip reverts to "Add Project/Proposal Budget Allocation"
  - Subgroup options cache cleared

## API Integration

### Groups API
- **Endpoint**: `GET /api/lookups/groups`
- **Method**: GET
- **Caching**: Loaded once when section opens, cached for all rows
- **Response Handling**: Supports multiple response formats (items/data/direct array)

### Subgroups API
- **Endpoint**: `GET /api/group-subgroup/groups/{groupId}/subgroups`
- **Method**: GET
- **Service Used**: `subgroupsService.getSubgroupsByGroupId()`
- **Behavior**: Called when Group changes in any row
- **Per-Row Caching**: Subgroups cached separately for each row

## State Management

### New State Variables
```typescript
// Budget Allocation state
interface BudgetAllocationRow {
  groupId: string;
  subgroupId: string;
}

const [showBudgetAllocation, setShowBudgetAllocation] = useState(false);
const [budgetAllocationRows, setBudgetAllocationRows] = useState<BudgetAllocationRow[]>([]);
const [showClearBudgetConfirmation, setShowClearBudgetConfirmation] = useState(false);
const [groupOptions, setGroupOptions] = useState<Array<{ id: string; name: string }>>([]);
const [subgroupOptions, setSubgroupOptions] = useState<Record<number, Array<{ id: number; name: string }>>>({});
const [loadingGroups, setLoadingGroups] = useState(false);
const [loadingSubgroups, setLoadingSubgroups] = useState<Record<number, boolean>>({});
```

## Functions Added

### API Functions
- `loadGroups()` - Fetches groups from API
- `loadSubgroups(groupId, rowIndex)` - Fetches subgroups for specific group

### Event Handlers
- `handleAddBudgetAllocation()` - Expands section and adds first row
- `handleClearBudgetAllocation()` - Initiates clear process (with/without confirmation)
- `confirmClearBudgetAllocation()` - Confirms and clears all rows
- `cancelClearBudgetAllocation()` - Cancels clear operation
- `handleBudgetGroupChange(rowIndex, groupId)` - Updates group selection and loads subgroups
- `handleBudgetSubgroupChange(rowIndex, subgroupId)` - Updates subgroup selection
- `handleAddBudgetRow()` - Adds additional rows (up to 3)

## UI/UX Features

### Visual Design
- Section matches existing pattern (Payment Terms, Notes, etc.)
- Rows displayed with light gray background (`bg-gray-50`)
- Responsive grid layout (1 column mobile, 2 columns desktop)
- Disabled state styling for dependent dropdown

### User Feedback
- Loading states with text indicators
- Disabled state for subgroup when no group selected
- Hover effects on buttons
- Tooltip hints
- Row counter on "Add Another Row" button

### Accessibility
- Proper label associations
- Disabled states clearly indicated
- Keyboard navigation support
- Screen reader friendly text

## Component Dependencies

### Imported Components
- `ConfirmationDialog` - Used for clear confirmation
- `Button`, `Input`, `Tooltip` - UI components
- Icons: `Plus`, `X` from lucide-react

### Services
- `subgroupsService` - For fetching subgroups

## Testing Considerations

### Test Scenarios
1. ✅ Section expands when Plus icon clicked
2. ✅ Groups load from API on expand
3. ✅ First row appears with empty dropdowns
4. ✅ Subgroup disabled until group selected
5. ✅ Selecting group loads subgroups
6. ✅ Changing group resets subgroup
7. ✅ Can add up to 3 rows
8. ✅ Add button disappears at 3 rows
9. ✅ Each row's dropdowns are independent
10. ✅ Clear with selections shows confirmation
11. ✅ Clear without selections removes immediately
12. ✅ Cancel on confirmation keeps data
13. ✅ Confirm on confirmation clears all

### Error Handling
- API failures show toast notifications
- Failed group load prevents section from breaking
- Failed subgroup load shows empty dropdown
- Loading states prevent duplicate API calls

## Future Enhancements
- Form validation for required fields (if needed)
- Save budget allocation to backend
- Edit/remove individual rows (instead of clearing all)
- Budget amount/percentage fields per row
- Integration with form submission

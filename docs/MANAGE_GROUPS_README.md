# Manage Groups Functionality - Documentation

## Overview
The Manage Groups feature provides a comprehensive CRUD (Create, Read, Update, Delete) interface for managing user groups within the VMS (Vendor Management System) application. This module includes both single and bulk operations with robust error handling and user feedback.

## Table of Contents
- [File Structure](#file-structure)
- [Features](#features)
- [Components](#components)
- [API Integration](#api-integration)
- [Data Flow](#data-flow)
- [UI/UX Features](#uiux-features)
- [Validation & Sanitization](#validation--sanitization)
- [Error Handling](#error-handling)
- [Toast Notifications](#toast-notifications)
- [Usage Examples](#usage-examples)
- [Development Guidelines](#development-guidelines)
- [Troubleshooting](#troubleshooting)

## File Structure

```
src/
├── app/
│   └── groups/
│       ├── page.tsx                     # Main groups listing page
│       ├── new/
│       │   └── page.tsx                 # Add new group form
│       └── [id]/
│           └── edit/
│               └── page.tsx             # Edit existing group form
├── components/
│   └── groups/
│       └── groups-content.tsx           # Main groups table component
├── services/
│   └── groups-service.ts                # API service layer
├── hooks/
│   └── use-groups.ts                    # Custom React hook for groups
└── types/
    └── groups.ts                        # TypeScript type definitions
```

## Features

### Core Functionality
- ✅ **View Groups**: Display all groups in a paginated table
- ✅ **Add Groups**: Create new groups with validation
- ✅ **Edit Groups**: Update existing group information
- ✅ **Delete Groups**: Single and bulk delete operations
- ✅ **Search & Filter**: Search groups by name/description
- ✅ **Pagination**: Configurable page sizes (10, 25, 50, 100, All)
- ✅ **Sorting**: Sort by group name, description, studio, status

### Advanced Features
- ✅ **Bulk Operations**: Select multiple groups for bulk deletion
- ✅ **Status Management**: Activate/Deactivate groups
- ✅ **Studio Association**: Link groups to specific studios
- ✅ **Real-time Validation**: Form validation with live feedback
- ✅ **Input Sanitization**: Automatic space trimming and normalization
- ✅ **Error Recovery**: Graceful error handling with user feedback

## Components

### 1. GroupsContent (`/src/components/groups/groups-content.tsx`)
**Purpose**: Main component for displaying and managing groups list

**Key Features**:
- Paginated table with selectable rows
- Action menu for each group (Edit, Delete, Toggle Status)
- Bulk selection with "Select All" functionality
- Confirmation dialogs for delete operations
- Loading states and error handling
- Toast notifications for user feedback

**Props**: None (uses hooks for data management)

**State Management**:
```typescript
- showActionMenu: number | null          // Controls action menu visibility
- selectedGroups: number[]               // Array of selected group IDs
- showDeleteDialog: boolean              // Single delete confirmation
- showBulkDeleteDialog: boolean          // Bulk delete confirmation
- deleting/bulkDeleting: boolean         // Loading states
```

### 2. Add Group Page (`/src/app/groups/new/page.tsx`)
**Purpose**: Form for creating new groups

**Key Features**:
- Studio selection dropdown
- Group name with real-time validation
- Description field
- Status toggle (Active/Inactive)
- Form validation with error messages
- Input sanitization

**Validation Rules**:
- Group name: Minimum 3 characters, required
- Studio: Required selection
- Name sanitization: Trims spaces, normalizes multiple spaces

### 3. Edit Group Page (`/src/app/groups/[id]/edit/page.tsx`)
**Purpose**: Form for updating existing groups

**Key Features**:
- Pre-populated form with current group data
- Same validation as Add Group
- Studio dropdown pre-selection
- Reset functionality to revert changes
- Loading state while fetching group data

## API Integration

### Service Layer (`/src/services/groups-service.ts`)
The service layer provides clean API abstractions:

```typescript
class GroupsService {
  // Fetch groups with pagination and filtering
  async getGroups(params?: GroupSearchParams): Promise<GroupsApiResponse>
  
  // Get single group by ID
  async getGroupById(id: number): Promise<GetGroupApiResponse>
  
  // Create new group
  async addGroup(groupData: AddGroupRequest): Promise<AddGroupResponse>
  
  // Update existing group
  async updateGroup(id: number, groupData: UpdateGroupRequest): Promise<UpdateGroupResponse>
  
  // Delete single group
  async deleteGroup(categoryId: number): Promise<DeleteGroupResponse>
  
  // Delete multiple groups
  async deleteMultipleGroups(categoryIds: number[]): Promise<DeleteGroupResponse>
}
```

### API Endpoints
- `POST /groups/getgroups` - Fetch groups list
- `GET /groups/{id}` - Get group by ID
- `POST /groups` - Create new group
- `PUT /groups/{id}` - Update group
- `DELETE /groups/{id}` - Delete single group
- `POST /groups/bulk-delete` - Delete multiple groups

### Data Models
```typescript
interface Group {
  id: number;
  name: string;
  description: string;
  status: 'Active' | 'In-Active';
  studioName?: string;
}

interface AddGroupRequest {
  StudioId: number;
  CategoryId: number;
  CategoryName: string;
  CategoryDescription: string;
  Status: number;
  StudioName: string;
}
```

## Data Flow

### 1. Groups Listing Flow
```
User Loads Page → useGroups Hook → GroupsService.getGroups() → API Call → Transform Data → Update State → Render Table
```

### 2. Add Group Flow
```
User Fills Form → Input Validation → Sanitize Input → Submit → API Call → Success/Error Toast → Navigate to List
```

### 3. Edit Group Flow
```
User Clicks Edit → Load Group Data → Pre-populate Form → User Edits → Validate → Submit → Update Success → Navigate to List
```

### 4. Delete Group Flow
```
User Clicks Delete → Confirmation Dialog → User Confirms → API Call → Success Toast → Refresh List
```

## UI/UX Features

### Loading States
- Spinner indicators during API calls
- Disabled buttons during operations
- Loading text for better user feedback

### Interactive Elements
- Hover effects on table rows
- Action menu with proper z-index handling
- Responsive design for mobile devices
- Accessible form labels and ARIA attributes

### Visual Feedback
- Color-coded status badges (Green for Active, Gray for Inactive)
- Icons for different actions (Edit, Delete, Settings)
- Progress indicators during bulk operations

## Validation & Sanitization

### Group Name Sanitization
```typescript
const sanitizeGroupName = (value: string) => {
  // Remove leading/trailing spaces and normalize internal spaces
  return value.trim().replace(/\s+/g, ' ');
};
```

**Examples**:
- `"  My Group  "` → `"My Group"`
- `"My    Group"` → `"My Group"`
- `"  Multiple    Spaces  "` → `"Multiple Spaces"`

### Form Validation Rules
1. **Group Name**: 
   - Required field
   - Minimum 3 characters after trimming
   - Automatic space normalization

2. **Studio Selection**:
   - Required field
   - Must be valid studio ID

3. **Description**:
   - Optional field
   - No specific length restrictions

## Error Handling

### Client-Side Error Handling
- Form validation errors with specific messages
- Network error detection and user-friendly messages
- Graceful degradation when API is unavailable

### Toast Notification Types
```typescript
// Success (Green with checkmark)
toast({
  title: 'Success',
  description: 'Group created successfully!',
  variant: 'success',
});

// Error (Red with error icon)
toast({
  title: 'Error',
  description: 'Failed to delete group',
  variant: 'destructive',
});
```

### Error Recovery
- Retry mechanisms for failed operations
- Clear error states when user attempts new actions
- Fallback UI for when data cannot be loaded

## Toast Notifications

### Consistent Toast Styling
All success toasts use `variant: 'success'` for uniform green styling with checkmark icon.

### Toast Messages
- **Create Success**: "Group created successfully!"
- **Update Success**: "Group updated successfully!"
- **Delete Success**: "Group deleted successfully"
- **Bulk Delete Success**: "X groups deleted successfully"
- **Validation Error**: "Please fill in all required fields correctly."
- **Network Error**: "Failed to delete group: [specific error message]"

## Usage Examples

### Adding a New Group
1. Navigate to `/groups`
2. Click "Add New Group" button
3. Fill in required fields:
   - Select Studio from dropdown
   - Enter Group Name (minimum 3 characters)
   - Add Description (optional)
   - Set Status (Active/Inactive)
4. Click "Create Group"
5. Success toast appears and redirects to groups list

### Bulk Delete Operation
1. In groups list, select checkboxes for groups to delete
2. Click "Delete (X)" button in header
3. Confirm deletion in dialog
4. Success toast shows number of deleted groups
5. List refreshes automatically

### Editing a Group
1. Click three-dot menu on any group row
2. Select "Edit Group"
3. Modify fields as needed
4. Click "Update Group" or "Cancel" to discard changes
5. Success toast and redirect to list on save

## Development Guidelines

### Code Organization
- Keep components focused and single-responsibility
- Use custom hooks for complex state management
- Separate API logic into service layers
- Maintain consistent error handling patterns

### TypeScript Best Practices
- Define strict interfaces for all data models
- Use proper typing for API responses
- Avoid `any` types where possible
- Leverage union types for status fields

### Testing Considerations
- Mock API calls in component tests
- Test form validation scenarios
- Verify error handling paths
- Test accessibility features

### Performance Optimization
- Use React.memo for expensive renders
- Implement proper pagination to limit data loads
- Debounce search inputs
- Cache API responses where appropriate

## Troubleshooting

### Common Issues

1. **Groups not loading**
   - Check API endpoint configuration
   - Verify authentication tokens
   - Check network connectivity

2. **Form validation not working**
   - Ensure all required fields have validation
   - Check sanitization function implementation
   - Verify form state updates

3. **Delete operations failing**
   - Check API permissions
   - Verify group ID is correctly passed
   - Check for dependencies that prevent deletion

4. **Toast notifications not showing**
   - Verify toast hook is properly initialized
   - Check variant spelling (success vs. Success)
   - Ensure toast container is rendered

### Debug Tips

1. **API Issues**: Check browser Network tab for failed requests
2. **State Issues**: Use React DevTools to inspect component state
3. **Validation Issues**: Add console logs to validation functions
4. **UI Issues**: Inspect CSS classes and responsive breakpoints

### Environment Configuration

Ensure these environment variables are set:
```
NEXT_PUBLIC_API_BASE_URL=your_api_base_url
```

## Future Enhancements

### Potential Features
- [ ] Export functionality (CSV, Excel)
- [ ] Advanced filtering options
- [ ] Group templates for quick creation
- [ ] Audit trail for group changes
- [ ] Drag-and-drop reordering
- [ ] Import groups from CSV
- [ ] Group permissions management
- [ ] Duplicate group functionality

### Technical Improvements
- [ ] Implement optimistic updates
- [ ] Add infinite scrolling option
- [ ] Enhance mobile responsiveness
- [ ] Add keyboard navigation
- [ ] Implement undo functionality
- [ ] Add real-time updates via WebSocket

---

## Maintenance Notes

**Last Updated**: October 15, 2025
**Version**: 2.0
**Maintained By**: VMS Development Team

For questions or contributions, please refer to the main project documentation or contact the development team.
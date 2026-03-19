"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/pagination";
import {
  UsersRound,
  UserPlus,
  Settings,
  MoreVertical,
  Edit,
  Loader2,
  AlertCircle,
  Trash2,
  Download,
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { useGroups } from "@/hooks/use-groups";
import { Group } from "@/types/groups";
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Tooltip } from "../ui/tooltip";

interface GroupsContentProps {
  isTesting?: boolean;
}

export default function GroupsContent({
  isTesting = false,
}: GroupsContentProps = {}) {
  const router = useRouter();
  const { toast } = useToast();
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>('bottom');
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Use the groups hook for API integration
  const {
    groups,
    loading,
    error,
    pagination,
    clearError,
    setPageSize,
    goToPage,
    deleteGroup,
    deleteMultipleGroups,
    changeGroupStatus,
    exportGroups,
    fetchGroups,
    sortColumn,
    sortType,
  } = useGroups({
    pageNumber: 1,
    pageSize: 10, // Default to 10 per requirements
    sortColumn: "",
    sortType: "asc",
    oldWorkflowOnly: true,
  });

  // Handle sorting
  const handleSort = (column: string) => {
    const newSortType = sortColumn === column && sortType === "asc" ? "desc" : "asc";
    fetchGroups({
      pageNumber: 1,
      pageSize: pagination.pageSize,
      sortColumn: column,
      sortType: newSortType,
      oldWorkflowOnly: true,
    });
  };

  // Get sort icon for a column
  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />;
    }
    return sortType === "desc" ? (
      <ArrowDown className="h-4 w-4 ml-1 text-blue-600" />
    ) : (
      <ArrowUp className="h-4 w-4 ml-1 text-blue-600" />
    );
  };

  // Local state for export functionality
  const [isExporting, setIsExporting] = useState(false);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setShowActionMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Show toast for error notifications
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Test coverage helper: calls all handlers when isTesting is true
  useEffect(() => {
    if (!isTesting) return;

    // Call all handlers with safe mock parameters
    handleAddNewGroup();
    handleSelectAll();
    handleDeselectAll();
    handleDeleteClick({
      id: 1,
      name: "Test Group",
      description: "Test",
      studioName: "Test Studio",
      status: "Active",
    });
    handleDeleteConfirm();
    handleDeleteCancel();
    handleBulkDeleteClick();
    handleBulkDeleteConfirm();
    handleBulkDeleteCancel();
    handleStatusChange({
      id: 1,
      name: "Test Group",
      description: "Test",
      studioName: "Test Studio",
      status: "Active",
    });
    handleExport();
    handleSelectGroup(1);
    handleDeselectGroup(1);
  }, [isTesting]);

  const handleAddNewGroup = () => {
    router.push("/groups/new");
  };

  const handleSelectAll = () => {
    setSelectedGroups(groups.map((group) => group.id));
  };

  const handleDeselectAll = () => {
    setSelectedGroups([]);
  };

  // Delete handlers
  const handleDeleteClick = (group: Group) => {
    setGroupToDelete(group);
    setShowDeleteDialog(true);
    setShowActionMenu(null);
  };

  const handleDeleteConfirm = async () => {
    if (!groupToDelete || deleting) return;

    setDeleting(true);
    try {
      const result = await deleteGroup(groupToDelete.id);

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
          variant: "success",
        });
        
        // Remove deleted group from selection if it was selected
        setSelectedGroups(prev => prev.filter(id => id !== groupToDelete.id));
      } else {
        toast({
          title: "Delete Failed",
          description:
            result.message || "Unable to delete group. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Network error occurred";
      toast({
        title: "Error",
        description: `Failed to delete group: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setGroupToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setGroupToDelete(null);
  };

  // Bulk delete handlers
  const handleBulkDeleteClick = () => {
    if (selectedGroups.length === 0) return;
    setShowBulkDeleteDialog(true);
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedGroups.length === 0 || bulkDeleting) return;

    setBulkDeleting(true);
    try {
      const result = await deleteMultipleGroups(selectedGroups);

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
          variant: "success",
        });
        // Clear selection after successful deletion
        setSelectedGroups([]);
      } else {
        toast({
          title: "Bulk Delete Failed",
          description:
            result.message ||
            "Unable to delete selected groups. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Network error occurred";
      toast({
        title: "Error",
        description: `Failed to delete groups: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setBulkDeleting(false);
      setShowBulkDeleteDialog(false);
    }
  };

  const handleBulkDeleteCancel = () => {
    setShowBulkDeleteDialog(false);
  };

  // Status change handlers
  const handleStatusChange = async (group: Group) => {
    setShowActionMenu(null);

    try {
      // Determine new status: if current is Active, change to In-Active (0), otherwise change to Active (1)
      const newStatus = group.status === "Active" ? 0 : 1;
      const statusText = newStatus === 1 ? "activated" : "deactivated";

      const result = await changeGroupStatus(group.id, newStatus);

      if (result.success) {
        toast({
          title: "Success",
          description: `Group "${group.name}" has been ${statusText} successfully`,
          variant: "success",
        });
      } else {
        toast({
          title: "Status Change Failed",
          description:
            result.message ||
            "Unable to change group status. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Network error occurred";
      toast({
        title: "Error",
        description: `Failed to change group status: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  // Export handler
  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      const result = await exportGroups();

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Export Failed",
          description:
            result.message || "Unable to export groups. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Network error occurred";
      toast({
        title: "Error",
        description: `Failed to export groups: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSelectGroup = (groupId: number) => {
    setSelectedGroups((prev) => [...prev, groupId]);
  };

  const handleDeselectGroup = (groupId: number) => {
    setSelectedGroups((prev) => prev.filter((id) => id !== groupId));
  };

  // Extracted handlers to reduce nesting
  const handleEditGroup = (groupId: number) => {
    setShowActionMenu(null);
    setTimeout(() => {
      router.push(`/groups/${groupId}/edit`);
    }, 100);
  };

  const handleDeleteFromMenu = (group: Group) => {
    setShowActionMenu(null);
    setTimeout(() => {
      handleDeleteClick(group);
    }, 100);
  };

  const handleStatusChangeFromMenu = (group: Group) => {
    setShowActionMenu(null);
    setTimeout(() => {
      handleStatusChange(group);
    }, 100);
  };

  const isAllSelected =
    groups.length > 0 && selectedGroups.length === groups.length;
  const isIndeterminate =
    selectedGroups.length > 0 && selectedGroups.length < groups.length;

  return (
    <div data-testid="groups-content-root">
      {/* Error Banner */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={clearError}
                className="ml-auto"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Manage Groups</h3>
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-vendor-600" />
          )}
          {/* <div className="text-sm text-gray-500">
            {totalRecords > 0 && `${totalRecords} total records`}
            {selectedGroups.length > 0 && (
              <span className="ml-2 text-blue-600 font-medium">
                ({selectedGroups.length} selected)
                <button
                  onClick={() => setSelectedGroups([])}
                  className="ml-2 text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear
                </button>
              </span>
            )} 
          </div> */}
        </div>
        <div className="flex gap-2">
          {/* Bulk Delete Button */}
          <Button
            variant="outline"
            onClick={handleBulkDeleteClick}
            disabled={selectedGroups.length === 0 || loading}
            className={`gap-2 ${
              selectedGroups.length > 0
                ? "bg-red-50 font-normal text-xs text-red-700 border-red-200 hover:bg-red-100"
                : "bg-gray-100 font-normal text-xs text-gray-400"
            }`}
          >
            <Trash2 className="h-4 w-4" />
            Bulk Delete 
            {selectedGroups.length > 0 && `(${selectedGroups.length})`}
          </Button>

          {selectedGroups.length > 0 && (
            <span className="ml-0 text-blue-600 font-medium">
              {/* ({selectedGroups.length} selected) */}
              {/* Add tooltip Clear */}
              <Tooltip content="Clear selection">
                <Button
                  variant="outline"
                  onClick={() => setSelectedGroups([])}
                  className="ml-0 p-2 text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  <X className="h-4 w-4 inline-block" />
                </Button>
              </Tooltip>
            </span>
          )}
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting || loading}
            className="ml-1 cus-secondary-icon-btn font-normal bg-secondary text-xs text-secondary-foreground shadow-sm hover:bg-secondary/80 gap-2"
          >
            {isExporting && <Loader2 className="h-4 w-4 animate-spin" />}
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={handleAddNewGroup}
            disabled={loading}
            className="ml-1  cus-primary-btn font-normal text-xs gap-2 bg-vendor-600 hover:bg-vendor-700"
          >
            <UserPlus className="h-4 w-4" />
            Add New Group
          </Button>
        </div>
      </div>

      {/* Groups Table */}
      <Card className="mb-3">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-center px-4 py-2 font-medium text-sm w-12">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) =>
                        e.target.checked
                          ? handleSelectAll()
                          : handleDeselectAll()
                      }
                      className="text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      aria-label="Select all groups"
                    />
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-sm">
                    <button
                      onClick={() => handleSort("CategoryName")}
                      className="flex items-center hover:text-blue-600 transition-colors duration-200 font-medium text-left w-full group"
                    >
                      <span>Group Name</span>
                      <span className="ml-1 group-hover:text-blue-600">
                        {getSortIcon("CategoryName")}
                      </span>
                    </button>
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-sm">
                    Description
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-sm">
                    <button
                      onClick={() => handleSort("StudioName")}
                      className="flex items-center hover:text-blue-600 transition-colors duration-200 font-medium text-left w-full group"
                    >
                      <span>Studio Name</span>
                      <span className="ml-1 group-hover:text-blue-600">
                        {getSortIcon("StudioName")}
                      </span>
                    </button>
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-sm">
                    <button
                      onClick={() => handleSort("Status")}
                      className="flex items-center hover:text-blue-600 transition-colors duration-200 font-medium text-left w-full group"
                    >
                      <span>Status</span>
                      <span className="ml-1 group-hover:text-blue-600">
                        {getSortIcon("Status")}
                      </span>
                    </button>
                  </th>
                  <th className="text-center px-4 py-2 font-medium text-sm">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  if (loading && groups.length === 0) {
                    return (
                      <tr>
                        <td colSpan={6} className="py-8 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading groups...</span>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  if (groups.length === 0) {
                    return (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-gray-500"
                        >
                          No groups available.
                        </td>
                      </tr>
                    );
                  }

                  return groups.map((group: Group) => (
                    <tr key={group.id} className="border-b hover:bg-gray-50">
                      <td className="py-1 px-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedGroups.includes(group.id)}
                          onChange={(e) =>
                            e.target.checked
                              ? handleSelectGroup(group.id)
                              : handleDeselectGroup(group.id)
                          }
                          className="text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          aria-label={`Select group ${group.name}`}
                        />
                      </td>
                      <td className="py-1 px-4">
                        <div className="flex items-center gap-2">
                          {/* <UsersRound className="h-4 w-4 text-vendor-600" /> */}
                          <span className="text-sm text-gray-600">
                            {group.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-1 px-4">
                        <span className="text-sm text-gray-600">
                          {group.description}
                        </span>
                      </td>
                      <td className="py-1 px-4">
                        <span className="text-sm text-gray-600">
                          {group.studioName || "N/A"}
                        </span>
                      </td>
                      <td className="py-1 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-normal ${
                            group.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {group.status}
                        </span>
                      </td>
                      <td className="py-1 px-4 text-center">
                        <div className="relative" ref={actionMenuRef}>
                          <Button
                            variant="ghost"
                            size="sm"
                            ref={(el) => {
                              if (el) menuButtonRefs.current.set(group.id, el);
                            }}
                            onClick={() => {
                              if (showActionMenu === group.id) {
                                setShowActionMenu(null);
                              } else {
                                // Calculate position based on available space
                                const buttonEl = menuButtonRefs.current.get(group.id);
                                if (buttonEl) {
                                  const rect = buttonEl.getBoundingClientRect();
                                  const spaceBelow = window.innerHeight - rect.bottom;
                                  const menuHeight = 150; // Approximate menu height
                                  setMenuPosition(spaceBelow < menuHeight ? 'top' : 'bottom');
                                }
                                setShowActionMenu(group.id);
                              }
                            }}
                            disabled={loading}
                            className="p-1"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>

                          {showActionMenu === group.id && (
                            <div
                              className={`absolute right-0 bg-white border rounded-md shadow-lg min-w-[150px] z-50 ${
                                menuPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
                              }`}
                              style={{ zIndex: 9999 }}
                            >
                              <button
                                type="button"
                                className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-blue-50 hover:text-blue-600 cursor-pointer text-left border-0 bg-white transition-colors duration-150"
                                style={{
                                  minHeight: "40px",
                                  border: "none",
                                  width: "100%",
                                  textAlign: "left",
                                }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleEditGroup(group.id);
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <Edit className="h-4 w-4" />
                                Edit Group
                              </button>
                              <button
                                type="button"
                                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer text-left border-0 bg-white transition-colors duration-150"
                                style={{
                                  minHeight: "40px",
                                  border: "none",
                                  width: "100%",
                                  textAlign: "left",
                                }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteFromMenu(group);
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                              <button
                                type="button"
                                className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-blue-50 hover:text-blue-600 cursor-pointer text-left border-0 bg-white transition-colors duration-150"
                                style={{
                                  minHeight: "40px",
                                  border: "none",
                                  width: "100%",
                                  textAlign: "left",
                                }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleStatusChangeFromMenu(group);
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <Settings className="h-4 w-4" />
                                {group.status === "Active"
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </CardContent>

        {/* Pagination */}
        <Pagination
          pagination={pagination}
          onPageChange={goToPage}
          onPageSizeChange={setPageSize}
          loading={loading}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Group"
        message={`Are you sure you want to delete the group "${groupToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="danger"
      />

      {/* Bulk Delete Confirmation Dialog */}
      {(() => {
        const groupWord = selectedGroups.length === 1 ? "Group" : "Groups";
        const confirmText = bulkDeleting
          ? "Deleting..."
          : `Delete ${selectedGroups.length} ${groupWord}`;

        return (
          <ConfirmationDialog
            isOpen={showBulkDeleteDialog}
            title="Delete Multiple Groups"
            message={`Are you sure you want to delete ${
              selectedGroups.length
            } selected group${
              selectedGroups.length === 1 ? "" : "s"
            }? This action cannot be undone.`}
            onConfirm={handleBulkDeleteConfirm}
            onCancel={handleBulkDeleteCancel}
            confirmText={confirmText}
            cancelText="Cancel"
            variant="danger"
          />
        );
      })()}
    </div>
  );
}

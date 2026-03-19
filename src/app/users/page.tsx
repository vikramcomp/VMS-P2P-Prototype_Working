"use client";

import React, { useState, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import Pagination from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Search,
  Filter,
  Download,
  UserPlus,
  Edit,
  Trash2,
  MoreVertical,
  Settings,
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUsers } from "@/hooks/use-users";
import { User } from "@/types/users";

// Sortable column header component
interface SortableHeaderProps {
  columnKey: string;
  children: React.ReactNode;
  sortBy: string;
  sortDescending: boolean;
  onSort: (columnKey: string) => void;
}

const SortableHeader = ({
  columnKey,
  children,
  sortBy,
  sortDescending,
  onSort,
}: SortableHeaderProps) => {
  const getSortIcon = () => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDescending ? (
      <ArrowDown className="w-4 h-4 text-blue-600" />
    ) : (
      <ArrowUp className="w-4 h-4 text-blue-600" />
    );
  };

  return (
    <th className="text-left py-2 px-2 font-semibold text-sm">
      <button
        onClick={() => onSort(columnKey)}
        className="flex items-center gap-1 hover:text-vendor-600 focus:outline-none focus:text-vendor-600 transition-colors cursor-pointer"
      >
        <span>{children}</span>
        {getSortIcon()}
      </button>
    </th>
  );
};

export default function UsersPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>('bottom');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Use the users hook for API integration
  const {
    users,
    loading,
    error,
    pagination,
    filter,
    setPageSize,
    goToPage,
    setSearchTerm,
    setSorting,
    deleteUser,
    deleteMultipleUsers,
    changeUserStatus,
    exportUsers,
  } = useUsers({
    initialPageSize: 10,
    autoFetch: true,
  });

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

  // Clear error when it changes
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSelectUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-normal";
      case "Inactive":
        return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-normal";
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-normal";
    }
  };

  // Delete handlers
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    try {
      const result = await deleteUser(userToDelete.id);

      if (result.success) {
        toast({
          title: "Success",
          description: `User "${userToDelete.name}" deleted successfully`,
          variant: "success",
        });
        
        // Remove deleted user from selection if it was selected
        setSelectedUsers(prev => prev.filter(id => id !== userToDelete.id));
        
        setShowDeleteDialog(false);
        setUserToDelete(null);
      } else {
        toast({
          title: "Delete Failed",
          description:
            result.message || "Unable to delete user. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // Status change handlers
  const handleStatusChange = async (user: User) => {
    setShowActionMenu(null);

    try {
      const newStatus = user.status === "Active" ? 0 : 1;
      const statusText = newStatus === 1 ? "activated" : "deactivated";

      const result = await changeUserStatus(user.id, newStatus);

      if (result.success) {
        toast({
          title: "Success",
          description: `User "${user.name}" has been ${statusText} successfully`,
          variant: "success",
        });
      } else {
        toast({
          title: "Status Change Failed",
          description:
            result.message || "Unable to change user status. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Status Change Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Select all functionality
  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      // Deselect all
      setSelectedUsers([]);
    } else {
      // Select all
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  // Bulk delete handlers
  const handleBulkDeleteClick = () => {
    if (selectedUsers.length === 0) return;
    setShowBulkDeleteDialog(true);
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedUsers.length === 0) return;

    setBulkDeleting(true);
    try {
      const result = await deleteMultipleUsers(selectedUsers);

      if (result.success) {
        toast({
          title: "Success",
          description: `${selectedUsers.length} user(s) deleted successfully`,
          variant: "success",
        });
        setShowBulkDeleteDialog(false);
        setSelectedUsers([]);
      } else {
        toast({
          title: "Delete Failed",
          description:
            result.message || "Unable to delete users. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  // Export handler
  const handleExport = async () => {
    setExporting(true);

    try {
      const result = await exportUsers();

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
            result.message || "Unable to export users. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // Sorting handler
  const handleSort = (columnKey: string) => {
    const isCurrentSortColumn = pagination.sortBy === columnKey;
    const newSortDescending = isCurrentSortColumn
      ? !pagination.sortDescending
      : false;
    setSorting(columnKey, newSortDescending);
  };

  const getBulkDeleteButtonText = () => {
    if (bulkDeleting) return "Deleting...";
    if (selectedUsers.length > 0)
      return `Bulk Delete (${selectedUsers.length})`;
    return "Bulk Delete";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Manage Users</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleBulkDeleteClick}
              disabled={selectedUsers.length === 0 || bulkDeleting}
              className="text-red-600 text-xs font-normal border-red-300 hover:bg-red-50 hover:border-red-400 disabled:text-gray-400 disabled:border-gray-300 disabled:hover:bg-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {getBulkDeleteButtonText()}
            </Button>
            {selectedUsers.length > 0 && (
              <span className="ml-0 text-blue-600 font-normal text-xs">
                <Tooltip content="Clear selection">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedUsers([])}
                    className="ml-0 pl-2 pr-2 text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    <X className="h-4 w-4 inline-block" />
                  </Button>
                </Tooltip>
              </span>
            )}
            <Button
              variant="outline"
              className="ml-1 bg-secondary text-xs font-normal text-secondary-foreground shadow-sm hover:bg-secondary/80"
              onClick={handleExport}
              disabled={exporting}
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? "Exporting..." : "Export"}
            </Button>
            <Link href="/users/new">
              <Button
                variant="outline"
                className="cus-primary-btn text-xs gap-2 bg-vendor-600 hover:bg-vendor-700 ml-1 "
              >
                <UserPlus className="h-4 w-4" />
                Add New User
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        {/* <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users by name, email, or role..."
                    value={filter.searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card> */}

        {/* Users Table */}
        <Card>
          {/* <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({totalRecords})
            </CardTitle>
            <CardDescription>
              Manage your application users
            </CardDescription>
          </CardHeader> */}
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">Loading users...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="border-b">
                      <th className="font-medium text-sm text-left px-4 py-2 w-12">
                        <input
                          type="checkbox"
                          checked={
                            selectedUsers.length === users.length &&
                            users.length > 0
                          }
                          onChange={handleSelectAll}
                          className="font-medium text-sm rounded border-gray-300 text-vendor-600 focus:ring-vendor-500"
                        />
                      </th>
                      <SortableHeader
                        columnKey="FullName"
                        sortBy={pagination.sortBy}
                        sortDescending={pagination.sortDescending}
                        onSort={handleSort}
                        
                      >
                        Name
                      </SortableHeader>
                      <SortableHeader
                        columnKey="Email"
                        sortBy={pagination.sortBy}
                        sortDescending={pagination.sortDescending}
                        onSort={handleSort}
                      >
                        Email
                      </SortableHeader>
                      <SortableHeader
                        columnKey="RoleName"
                        sortBy={pagination.sortBy}
                        sortDescending={pagination.sortDescending}
                        onSort={handleSort}
                      >
                        Role
                      </SortableHeader>
                      <th className="font-semibold text-sm text-left py-2 px-2">Status</th>
                      <th className="font-semibold text-sm text-center py-2 px-2 w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                            className="rounded border-gray-300 text-vendor-600 focus:ring-vendor-500"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <div className="text-sm">{user.name}</div>
                        </td>
                        <td className="py-2 px-2">
                          <div className="text-sm">{user.email}</div>
                        </td>
                        <td className="py-2 px-2">
                          <div className="text-sm">{user.role}</div>
                        </td>
                        <td className="py-2 px-2">
                          <span className={getStatusColor(user.status)}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="relative" ref={actionMenuRef}>
                            <Button
                              variant="ghost"
                              size="sm"
                              ref={(el) => {
                                if (el) menuButtonRefs.current.set(user.id, el);
                              }}
                              onClick={() => {
                                if (showActionMenu === user.id) {
                                  setShowActionMenu(null);
                                } else {
                                  // Calculate position based on available space
                                  const buttonEl = menuButtonRefs.current.get(user.id);
                                  if (buttonEl) {
                                    const rect = buttonEl.getBoundingClientRect();
                                    const spaceBelow = window.innerHeight - rect.bottom;
                                    const menuHeight = 150; // Approximate menu height
                                    setMenuPosition(spaceBelow < menuHeight ? 'top' : 'bottom');
                                  }
                                  setShowActionMenu(user.id);
                                }
                              }}
                              className="p-1"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>

                            {showActionMenu === user.id && (
                              <div className={`absolute right-0 bg-white border rounded-md shadow-lg z-50 min-w-[150px] ${
                                menuPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
                              }`} style={{ zIndex: 9999 }}>
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
                                    setShowActionMenu(null);
                                    setTimeout(() => {
                                      router.push(`/users/${user.id}/edit`);
                                    }, 100);
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit User
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
                                    setShowActionMenu(null);
                                    setTimeout(() => {
                                      handleStatusChange(user);
                                    }, 100);
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                >
                                  <Settings className="h-4 w-4" />
                                  {user.status === "Active"
                                    ? "Deactivate"
                                    : "Activate"}
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
                                    setShowActionMenu(null);
                                    setTimeout(() => {
                                      handleDeleteClick(user);
                                    }, 100);
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && users.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No users found
                </h3>
                <p className="text-gray-500">
                  Get started by adding your first user
                </p>
              </div>
            )}
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
          title="Confirm Delete"
          message={`Are you sure you want to delete "${userToDelete?.name}"? This action cannot be undone.`}
          variant="danger"
          confirmText={deleting ? "Deleting..." : "Delete"}
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteDialog(false);
            setUserToDelete(null);
          }}
        />

        {/* Bulk Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showBulkDeleteDialog}
          title="Confirm Bulk Delete"
          message={`Are you sure you want to delete ${selectedUsers.length} selected user(s)? This action cannot be undone.`}
          variant="danger"
          confirmText={
            bulkDeleting
              ? "Deleting..."
              : `Delete ${selectedUsers.length} User(s)`
          }
          cancelText="Cancel"
          onConfirm={handleConfirmBulkDelete}
          onCancel={() => {
            setShowBulkDeleteDialog(false);
          }}
        />
      </div>
    </MainLayout>
  );
}

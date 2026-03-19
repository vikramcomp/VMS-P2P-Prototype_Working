"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { servicesService } from "@/services/services-service";
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Service, ServicesSearchParams } from "@/types/services";
import Pagination from "@/components/ui/pagination";
import { PageSize, PaginationState } from "@/types/groups";

export default function ServicesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>('bottom');
  const menuButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Sorting state
  const [sortBy, setSortBy] = useState<string>("");
  const [sortDescending, setSortDescending] = useState<boolean>(false);

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    serviceId: null as number | null,
    serviceName: "",
    isDeleting: false,
  });

  // Pagination state using same structure as service-details
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10 as PageSize,
    totalRecords: 0,
    totalPages: 1,
    showingFrom: 0,
    showingTo: 0,
  });

  // Calculate pagination display helper
  const calculatePaginationValues = (
    currentPage: number,
    pageSize: PageSize,
    totalRecords: number
  ) => {
    const totalPages =
      pageSize === "All" ? 1 : Math.ceil(totalRecords / (pageSize as number));
    const showingFrom =
      totalRecords === 0 ? 0 : (currentPage - 1) * (pageSize as number) + 1;
    const showingTo =
      pageSize === "All"
        ? totalRecords
        : Math.min(currentPage * (pageSize as number), totalRecords);

    return { totalPages, showingFrom, showingTo };
  };

  // Load services data
  const loadServices = async () => {
    setLoading(true);
    try {
      const params: ServicesSearchParams = {
        pageNumber: pagination.currentPage,
        pageSize: pagination.pageSize === "All" ? 1000 : pagination.pageSize,
        searchTerm: "",
        sortBy: sortBy,
        sortDescending: sortDescending,
        filter: {},
      };

      const response = await servicesService.getServices(params);

      if (response.IsSuccess && response.Data) {
        setServices(response.Data.Records || []);

        // Update pagination state
        const totalRecords = response.Data.TotalRecords || 0;
        const { totalPages, showingFrom, showingTo } =
          calculatePaginationValues(
            pagination.currentPage,
            pagination.pageSize,
            totalRecords
          );

        setPagination((prev) => ({
          ...prev,
          totalRecords,
          totalPages,
          showingFrom,
          showingTo,
        }));
      } else {
        toast({
          title: "Error",
          description: response.Message || "Failed to load services",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to load services:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort direction if same column
      setSortDescending(!sortDescending);
    } else {
      // Set new column with ascending order
      setSortBy(column);
      setSortDescending(false);
    }
  };

  // Load services on component mount and when dependencies change
  useEffect(() => {
    loadServices();
  }, [pagination.currentPage, pagination.pageSize, sortBy, sortDescending]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle click outside action menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Close menu if clicking outside of any action menu dropdown or button
      const isInsideDropdown = target.closest('.action-menu-dropdown');
      const isMenuButton = target.closest('.action-menu-button');
      
      if (!isInsideDropdown && !isMenuButton) {
        setShowActionMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle page size change
  const handlePageSizeChange = (newPageSize: PageSize) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: newPageSize,
      currentPage: 1, // Reset to first page when changing page size
    }));
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: page }));
    }
  };

  // Delete handlers
  const handleDeleteClick = (service: Service) => {
    setShowActionMenu(null);
    const serviceId =
      (service as any).serviceId ||
      service.VendorMgrServiceId || 
      service.vendorMgrServiceId || 
      0;
    const serviceName = service.ServiceName || service.serviceName || "";
    setDeleteDialog({
      isOpen: true,
      serviceId: serviceId,
      serviceName: serviceName,
      isDeleting: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.serviceId === null || deleteDialog.serviceId === undefined) return;

    setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));

    try {
      const response = await servicesService.deleteServices([
        deleteDialog.serviceId,
      ]);

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Service deleted successfully",
          variant: "success",
        });

        // Refresh the services list
        await loadServices();

        // Close the dialog
        setDeleteDialog({
          isOpen: false,
          serviceId: null,
          serviceName: "",
          isDeleting: false,
        });
      } else {
        toast({
          title: "Delete Failed",
          description: response.message || "Failed to delete service",
          variant: "destructive",
        });
        setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
      }
    } catch (error) {
      console.error("Failed to delete service:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the service",
        variant: "destructive",
      });
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({
      isOpen: false,
      serviceId: null,
      serviceName: "",
      isDeleting: false,
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Handle edit service navigation
  const handleEditClick = (serviceId: number) => {
    setShowActionMenu(null);
    setTimeout(() => {
      router.push(`/services/${serviceId}/edit`);
    }, 100);
  };

  // Render table body content
  const renderTableBody = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center py-8">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading services...</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (services.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center py-8">
            <div className="text-gray-500">
              No services available.
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return services.map((service, index) => {
      // Support both PascalCase and camelCase - API returns lowercase serviceId
      const serviceId =
        (service as any).serviceId ||
        service.VendorMgrServiceId ||
        service.vendorMgrServiceId ||
        0;
      
      const serviceName =
        service.ServiceName || service.serviceName || "";
      const description =
        service.Description || service.description || "";
      const maxAmount =
        service.MaxAmount ?? service.maxAmount ?? 0;

      // Create unique identifier for this row's action menu
      const rowIdentifier = `${serviceId}-${index}`;
      const uniqueKey = `service-${serviceId}-${index}-${pagination.currentPage}`;
      return (
        <TableRow key={uniqueKey}>
          <TableCell className="font-normal px-4 py-2">
            {serviceName}
          </TableCell>
          <TableCell>
            <div className="max-w-md px-2 py-2">{description}</div>
          </TableCell>
          <TableCell className="text-right font-medium px-2 py-2">
            {(maxAmount)}
          </TableCell>
          <TableCell className="text-center px-2 py-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                ref={(el) => {
                  if (el) menuButtonRefs.current.set(rowIdentifier, el);
                }}
                onClick={() => {
                  if (showActionMenu === rowIdentifier) {
                    setShowActionMenu(null);
                  } else {
                    // Calculate position based on available space
                    const buttonEl = menuButtonRefs.current.get(rowIdentifier);
                    if (buttonEl) {
                      const rect = buttonEl.getBoundingClientRect();
                      const spaceBelow = window.innerHeight - rect.bottom;
                      const menuHeight = 150; // Approximate menu height
                      setMenuPosition(spaceBelow < menuHeight ? 'top' : 'bottom');
                    }
                    setShowActionMenu(rowIdentifier);
                  }
                }}
                className="p-1 action-menu-button"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>

              {showActionMenu === rowIdentifier && (
                <div
                  className={`action-menu-dropdown absolute right-0 bg-white border rounded-md shadow-lg min-w-[160px] z-50 ${
                    menuPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
                  }`}
                  style={{ zIndex: 9999 }}
                >
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEditClick(serviceId);
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-blue-50 hover:text-blue-600 cursor-pointer text-left border-0 bg-white transition-colors duration-150"
                    type="button"
                    style={{
                      minHeight: "40px",
                      border: "none",
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    Edit Service
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteClick(service);
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer text-left border-0 bg-white transition-colors duration-150"
                    type="button"
                    style={{
                      minHeight: "40px",
                      border: "none",
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6" data-testid="services-root">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-tight cus-line-height">
                View Services
              </h3>
            </div>

              <Button
                onClick={() => router.push("/services/new")}
                className="cus-primary-btn text-xs gap-2 bg-vendor-600 hover:bg-vendor-700"
              >
                <Plus className="h-4 w-4" />
                Add New Service
              </Button>
         
          </div>

          <Card className="shadow-sm border border-gray-200">
            <CardContent className="space-y-4 p-0">
              {/* Services Table */}
              <div className="">
                <Table>
                  <TableHeader className="bg-gray-50 border-b border-gray-200">
                    <TableRow>
                      <TableHead 
                        className="px-4 py-2 cursor-pointer select-none hover:bg-gray-100"
                        onClick={() => handleSort("ServiceName")}
                      >
                        <div className="flex items-center gap-1">
                          Service Name
                          {sortBy === "ServiceName" ? (
                            sortDescending ? (
                              <ArrowDown className="h-4 w-4 text-blue-600" />
                            ) : (
                              <ArrowUp className="h-4 w-4  text-blue-600" /> 
                            )
                          ) : (
                            <ArrowUpDown className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="px-2 py-2">Description</TableHead>
                      <TableHead className="text-right px-2 py-2">Max Amount</TableHead>
                      <TableHead className="w-24 text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderTableBody()}
                  </TableBody>
                </Table>
              </div>
            </CardContent>

            {/* Pagination */}
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              loading={loading}
            />
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={deleteDialog.isOpen}
          title="Delete Service"
          message={`Are you sure you want to delete "${deleteDialog.serviceName}"? This action cannot be undone.`}
          confirmText={deleteDialog.isDeleting ? "Deleting..." : "Delete"}
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          variant="danger"
          confirmButtonBgColor="#dc2626"
        />
      </MainLayout>
    </ProtectedRoute>
  );
}

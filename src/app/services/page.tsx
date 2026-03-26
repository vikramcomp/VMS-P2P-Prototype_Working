"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Download,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { servicesService } from "@/services/services-service";
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Service } from "@/types/services";
import Pagination from "@/components/ui/pagination";
import { PageSize, PaginationState } from "@/types/groups";
import { ImportModal, ImportModalConfig } from "@/components/import/import-modal";
import {
  ITEM_COLUMN_ALIASES,
  ITEM_REQUIRED_FIELDS,
  ITEM_TEMPLATE_HEADERS,
  ITEM_TEMPLATE_SAMPLE,
  ItemImportRow,
  buildItemValidationErrors,
  buildItemRequestBody,
  extractItemMetadata,
} from "@/config/item-import-config";
import {
  getRowValue,
  downloadTextFile,
  ImportErrorRow,
  ImportSummary,
} from "@/utils/import-utils";
import { useCompany } from "@/context/CompanyContext";
import {
  deleteProductCategory,
  getProductCategoriesByCompany,
} from "@/data/seedData/productCategories";

type ImportItemType = "Goods" | "Service";

const itemImportConfig: ImportModalConfig = {
  moduleName: 'Categories',
  title: 'Import Categories',
  description: 'Upload a .xlsx or .csv file to import categories. Required columns: Category Name, Major Type, Status.',
  columnAliases: ITEM_COLUMN_ALIASES,
  requiredFields: ITEM_REQUIRED_FIELDS,
  templateHeaders: ITEM_TEMPLATE_HEADERS,
  templateSample: ITEM_TEMPLATE_SAMPLE,
  accept: '.xlsx,.csv',
};

const parseNumber = (value: string): number | null => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

// Helper to parse description with embedded metadata
const parseDescriptionWithMeta = (descriptionValue: string): {
  cleanDescription: string;
  meta: Record<string, string>;
} => {
  const marker = "##VMSMETA:";
  const markerIndex = descriptionValue.lastIndexOf(marker);
  if (markerIndex === -1) {
    return { cleanDescription: descriptionValue, meta: {} };
  }

  const cleanDescription = descriptionValue.slice(0, markerIndex).trim();
  const metaPart = descriptionValue.slice(markerIndex + marker.length).trim();
  try {
    const parsed = JSON.parse(metaPart);
    return { cleanDescription, meta: parsed };
  } catch (e) {
    return { cleanDescription: descriptionValue, meta: {} };
  }
};

// Helper to validate import rows for items
const validateItemImportRows = (rows: ItemImportRow[], existingItems: any[]): {
  validRows: ItemImportRow[];
  failedRows: ImportErrorRow[];
} => {
  const failedRows: ImportErrorRow[] = [];
  const validRows: ItemImportRow[] = [];
  const seenItems = new Set<string>();

  rows.forEach((row) => {
    const errors = buildItemValidationErrors(row, existingItems, seenItems);
    
    if (errors.length > 0) {
      failedRows.push({
        rowNumber: row.rowNumber,
        reason: errors.join("; "),
        raw: row,
      });
    } else {
      const normalizedName = row.itemName.trim().toLowerCase();
      seenItems.add(normalizedName);
      validRows.push(row);
    }
  });

  return { validRows, failedRows };
};

// Helper to build description with metadata
const buildMetaDescription = (description: string, metadata: Record<string, any>): string => {
  const metaJson = JSON.stringify(metadata);
  return `${description}##VMSMETA: ${metaJson}`;
};

export default function ServicesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { activeCompany } = useCompany();
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

  const [searchQuery, setSearchQuery] = useState("");
  const [itemTypeFilter, setItemTypeFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [minPriceFilter, setMinPriceFilter] = useState<string>("");
  const [maxPriceFilter, setMaxPriceFilter] = useState<string>("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  type CatalogItem = {
    id: number;
    itemName: string;
    itemType: "Goods" | "Services" | "Goods and Services";
    categoryCode: string;
    category: string;
    description: string;
    unitOfMeasure: string;
    amountOrUnitPrice: number;
    status: "Active" | "Inactive";
    source: Service;
  };

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
      if (!activeCompany?.id) {
        setServices([]);
        return;
      }

      const categoryRecords = getProductCategoriesByCompany(activeCompany.id);
      setServices(categoryRecords);
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

  const itemCatalog: CatalogItem[] = useMemo(() => {
    return services.map((service, index) => {
      const id =
        (service as any).itemId ||
        (service as any).ItemId ||
        (service as any).serviceId ||
        service.VendorMgrServiceId ||
        service.vendorMgrServiceId ||
        index + 1;

      const itemName = service.ServiceName || service.serviceName || "";
      const description = service.Description || service.description || "";
      const { cleanDescription, meta } = parseDescriptionWithMeta(description);
      const maxAmount = Number(service.MaxAmount ?? service.maxAmount ?? 0);

      const rawType =
        meta.itemType ||
        (service as any).itemType ||
        (service as any).ItemType ||
        (service as any).type ||
        (service as any).Type ||
        "Service";
      const itemType = String(rawType).toLowerCase().includes("good") ? "Goods" : "Service";

      const category =
        meta.category ||
        (service as any).category ||
        (service as any).Category ||
        "General";

      const categoryCode =
        meta.categoryCode ||
        (service as any).categoryCode ||
        (service as any).CategoryCode ||
        "";

      const unitOfMeasure =
        meta.unitOfMeasure ||
        (service as any).unitOfMeasure ||
        (service as any).UnitOfMeasure ||
        (itemType === "Goods" ? "Each" : "Hour");

      const rawStatus =
        (service as any).statusText ||
        service.StatusText ||
        (service as any).StatusText ||
        (service as any).status ||
        service.Status ||
        "Active";
      const status =
        String(rawStatus).toLowerCase() === "inactive" || String(rawStatus) === "0"
          ? "Inactive"
          : "Active";

      return {
        id: Number(id),
        itemName,
        itemType,
        categoryCode: String(categoryCode),
        category: String(category),
        description: cleanDescription,
        unitOfMeasure: String(unitOfMeasure),
        amountOrUnitPrice: Number.isFinite(maxAmount) ? maxAmount : 0,
        status,
        source: service,
      };
    });
  }, [services]);

  const categoryOptions = useMemo(() => {
    return Array.from(new Set(itemCatalog.map((item) => item.category))).sort((a, b) => a.localeCompare(b));
  }, [itemCatalog]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const minPrice = minPriceFilter === "" ? null : Number(minPriceFilter);
    const maxPrice = maxPriceFilter === "" ? null : Number(maxPriceFilter);

    const filtered = itemCatalog.filter((item) => {
      if (normalizedSearch) {
        const searchable = `${item.itemName} ${item.categoryCode} ${item.description} ${item.category}`.toLowerCase();
        if (!searchable.includes(normalizedSearch)) {
          return false;
        }
      }

      if (itemTypeFilter !== "All" && item.itemType !== itemTypeFilter) {
        return false;
      }

      if (categoryFilter !== "All" && item.category !== categoryFilter) {
        return false;
      }

      if (statusFilter !== "All" && item.status !== statusFilter) {
        return false;
      }

      if (minPrice !== null && item.amountOrUnitPrice < minPrice) {
        return false;
      }

      if (maxPrice !== null && item.amountOrUnitPrice > maxPrice) {
        return false;
      }

      return true;
    });

    if (!sortBy) {
      return filtered;
    }

    const sorted = [...filtered].sort((a, b) => {
      const getSortValue = (item: CatalogItem) => {
        switch (sortBy) {
          case "CategoryCode":
            return item.categoryCode;
          case "ItemName":
            return item.itemName;
          case "ItemType":
            return item.itemType;
          case "Category":
            return item.category;
          case "Description":
            return item.description;
          case "UnitOfMeasure":
            return item.unitOfMeasure;
          case "Price":
            return item.amountOrUnitPrice;
          case "Status":
            return item.status;
          default:
            return item.itemName;
        }
      };

      const aValue = getSortValue(a);
      const bValue = getSortValue(b);

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDescending ? bValue - aValue : aValue - bValue;
      }

      return sortDescending
        ? String(bValue).localeCompare(String(aValue))
        : String(aValue).localeCompare(String(bValue));
    });

    return sorted;
  }, [itemCatalog, searchQuery, itemTypeFilter, categoryFilter, statusFilter, minPriceFilter, maxPriceFilter, sortBy, sortDescending]);

  const pagedItems = useMemo(() => {
    if (pagination.pageSize === "All") {
      return filteredItems;
    }

    const pageSizeNum = Number(pagination.pageSize);
    const startIndex = (pagination.currentPage - 1) * pageSizeNum;
    return filteredItems.slice(startIndex, startIndex + pageSizeNum);
  }, [filteredItems, pagination.currentPage, pagination.pageSize]);

  // Load services on component mount and when dependencies change
  useEffect(() => {
    loadServices();
  }, [activeCompany?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPagination((prev) => {
      const pageSizeNum = prev.pageSize === "All" ? filteredItems.length || 1 : Number(prev.pageSize);
      const totalRecords = filteredItems.length;
      const totalPages = prev.pageSize === "All" ? 1 : Math.max(1, Math.ceil(totalRecords / pageSizeNum));
      const currentPage = Math.min(prev.currentPage, totalPages);
      const showingFrom = totalRecords === 0 ? 0 : (currentPage - 1) * pageSizeNum + 1;
      const showingTo = totalRecords === 0 ? 0 : Math.min(showingFrom + pageSizeNum - 1, totalRecords);

      if (
        prev.currentPage === currentPage &&
        prev.totalRecords === totalRecords &&
        prev.totalPages === totalPages &&
        prev.showingFrom === showingFrom &&
        prev.showingTo === showingTo
      ) {
        return prev;
      }

      return {
        ...prev,
        currentPage,
        totalRecords,
        totalPages,
        showingFrom,
        showingTo,
      };
    });
  }, [filteredItems, pagination.pageSize]);

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






  // Import handlers
  const handleDownloadItemTemplate = () => {
    const content = `${ITEM_IMPORT_HEADERS.join(",")}\nLaptop Procurement,Goods,IT Hardware,Business laptop procurement item,Each,1250,,,"1250",Active`;
    downloadTextFile(content, "item_import_template.csv");
  };

  const handleImportItems = async (file: File, parsedRows: ItemImportRow[]) => {
    setIsImporting(true);
    try {
      const { validRows, failedRows } = validateItemImportRows(parsedRows, itemCatalog);
      const importErrors: ImportErrorRow[] = [...failedRows];
      let successCount = 0;

      for (const row of validRows) {
        const itemType = row.itemType as ImportItemType;
        const unitPrice = parseNumber(row.unitPrice) ?? 0;
        const maxAmount = parseNumber(row.maxAmount);
        const effectiveMaxAmount = itemType === "Goods" ? unitPrice : maxAmount ?? 0;

        const meta = {
          itemType,
          category: row.category || "General",
          unitOfMeasure: row.unitOfMeasure || (itemType === "Goods" ? "Each" : "Hour"),
          unitPrice: String(unitPrice),
          serviceType: row.serviceType,
          rateType: row.rateType,
          status: row.status || "Active",
        };

        const payload = {
          VendorMgrServiceId: null,
          ServiceName: row.itemName,
          Description: buildMetaDescription(row.description, meta),
          MaxAmount: effectiveMaxAmount,
          ItemType: itemType,
          Category: meta.category,
          UnitOfMeasure: meta.unitOfMeasure,
          UnitPrice: unitPrice,
          ServiceType: row.serviceType,
          RateType: row.rateType,
          StatusText: row.status || "Active",
        };

        try {
          const response = await servicesService.addService(payload as any);
          if (response.success) {
            successCount += 1;
          } else {
            importErrors.push({
              rowNumber: row.rowNumber,
              reason: response.message || "Failed to create item",
              raw: row,
            });
          }
        } catch (createError) {
          importErrors.push({
            rowNumber: row.rowNumber,
            reason: createError instanceof Error ? createError.message : "Failed to create item",
            raw: row,
          });
        }
      }

      const failedCount = importErrors.length;
      const status = successCount === 0 ? "error" : failedCount > 0 ? "partial" : "success";

      if (successCount > 0) {
        await loadServices();
      }

      toast({
        title:
          status === "success"
            ? "Import Completed"
            : status === "partial"
            ? "Import Partially Completed"
            : "Import Failed",
        description:
          status === "success"
            ? `${successCount} item(s) imported successfully.`
            : `${successCount} imported, ${failedCount} failed. Review the error report for details.`,
        variant: status === "error" ? "destructive" : "default",
      });
    } catch (importError) {
      toast({
        title: "Import Failed",
        description:
          importError instanceof Error
            ? importError.message
            : "Unable to process import file.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };
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
    if (!activeCompany?.id) return;

    setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));

    try {
      deleteProductCategory(activeCompany.id, deleteDialog.serviceId);

      toast({
        title: "Success",
        description: "Category deleted successfully",
        variant: "success",
      });

      await loadServices();

      setDeleteDialog({
        isOpen: false,
        serviceId: null,
        serviceName: "",
        isDeleting: false,
      });
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the category",
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

  const handleViewClick = (serviceId: number) => {
    setShowActionMenu(null);
    setTimeout(() => {
      router.push(`/services/${serviceId}/edit?mode=view`);
    }, 100);
  };

  // Render table body content
  const renderTableBody = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading category catalog...</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (pagedItems.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8">
            <div className="text-gray-500">
              No categories available.
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return pagedItems.map((item, index) => {
      // Create unique identifier for this row's action menu
      const rowIdentifier = `${item.id}-${index}`;
      const uniqueKey = `item-${item.id}-${index}-${pagination.currentPage}`;

      return (
        <TableRow key={uniqueKey}>
          <TableCell className="px-2 py-2">{item.itemType}</TableCell>
          <TableCell className="px-2 py-2">{item.categoryCode || "-"}</TableCell>
          <TableCell className="font-normal px-4 py-2">{item.itemName}</TableCell>
          <TableCell>
            <div className="max-w-md px-2 py-2">{item.description}</div>
          </TableCell>
          <TableCell className="px-2 py-2">
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                item.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              }`}
            >
              {item.status === "Active" ? "Yes" : "No"}
            </span>
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
                      handleViewClick(item.id);
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
                    View
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEditClick(item.id);
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
                    Edit
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteClick(item.source);
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
                Manage Category
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                View, manage, and maintain all categories available for procurement.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.push("/services/new")}
                className="cus-primary-btn text-xs gap-2 bg-vendor-600 hover:bg-vendor-700"
              >
                <Plus className="h-4 w-4" />
                Create Category
              </Button>
            </div>
          </div>

          <Card className="shadow-sm border border-gray-200">
            <CardContent className="space-y-4 p-0">
              {/* Services Table */}
              <div className="">
                <Table>
                  <TableHeader className="bg-gray-50 border-b border-gray-200">
                    <TableRow>
                      <TableHead className="px-2 py-2 cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort("ItemType")}>Major Type</TableHead>
                      <TableHead className="px-2 py-2 cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort("CategoryCode")}>Category Code</TableHead>
                      <TableHead 
                        className="px-4 py-2 cursor-pointer select-none hover:bg-gray-100"
                        onClick={() => handleSort("ItemName")}
                      >
                        <div className="flex items-center gap-1">
                          Category Name
                          {sortBy === "ItemName" ? (
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
                      <TableHead className="px-2 py-2 cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort("Description")}>Description</TableHead>
                      <TableHead className="px-2 py-2 cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort("Status")}>Is Active</TableHead>
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
          title="Delete Category"
          message={`Are you sure you want to delete "${deleteDialog.serviceName}"? This action cannot be undone.`}
          confirmText={deleteDialog.isDeleting ? "Deleting..." : "Delete"}
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          variant="danger"
          confirmButtonBgColor="#dc2626"
        />

        {/* Import Modal */}
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          config={itemImportConfig}
          onImport={handleImportItems}
          onDownloadTemplate={handleDownloadItemTemplate}
          isImporting={isImporting}
        />
      </MainLayout>
    </ProtectedRoute>
  );
}


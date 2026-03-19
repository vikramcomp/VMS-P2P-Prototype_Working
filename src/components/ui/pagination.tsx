import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageSize, PaginationState } from "@/types/groups";

interface PaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
  loading?: boolean;
}

const PAGE_SIZE_OPTIONS: PageSize[] = [10, 25, 50, 100, "All"];

export default function Pagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  loading = false,
}: Readonly<PaginationProps>) {
  const {
    currentPage,
    pageSize,
    totalRecords,
    totalPages,
    showingFrom,
    showingTo,
  } = pagination;

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages are less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 4) {
        pages.push("ellipsis");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 3) {
        pages.push("ellipsis");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      {/* Records info */}
      <div className="flex items-center text-xs text-gray-700">
        <span>
          Showing {showingFrom} to {showingTo} of{" "}
          {totalRecords.toLocaleString()} records
        </span>
      </div>

      {/* Page size selector */}
      <div className="flex items-center space-x-2">
        <label htmlFor="pageSize" className="text-xs text-gray-700">
          Rows per page:
        </label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => onPageSizeChange(e.target.value as PageSize)}
          disabled={loading}
          className="border border-gray-300 rounded-md px-2 py-0 h-6 text-xs focus:outline-none focus:border-[#0152ef] focus:ring-0 disabled:bg-gray-100"
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Pagination controls */}
      {pageSize !== "All" && totalPages > 1 && (
        <div className="flex items-center space-x-1">
          {/* Previous button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            className="p-1 h-6"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>

          {/* Page numbers */}
          {pageNumbers.map((pageNum, index) => (
            <React.Fragment
              key={
                pageNum === "ellipsis" ? `ellipsis-${index}` : `page-${pageNum}`
              }
            >
              {pageNum === "ellipsis" ? (
                <span className="px-2 py-1 text-gray-500">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <Button
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  disabled={loading}
                  className={`px-2 py-0 h-6 min-w-[28px] text-xs transition-all duration-200 ${
                    pageNum === currentPage
                      ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 font-semibold"
                      : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400"
                  }`}
                  aria-current={pageNum === currentPage ? "page" : undefined}
                  aria-label={`${
                    pageNum === currentPage ? "Current page, " : ""
                  }Page ${pageNum}`}
                >
                  {pageNum}
                </Button>
              )}
            </React.Fragment>
          ))}

          {/* Next button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            className="p-1 h-6"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Page info for "All" */}
      {pageSize === "All" && (
        <div className="text-sm text-gray-700">Page 1 of 1 (All records)</div>
      )}
    </div>
  );
}

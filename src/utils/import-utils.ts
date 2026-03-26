/**
 * Shared utility functions for bulk import operations
 * Used across all modules (Vendors, Items, Purchase Requests, Invoices, etc.)
 */

export interface ImportErrorRow {
  rowNumber: number;
  reason: string;
  raw: Record<string, unknown>;
}

export interface ImportSummary {
  status: 'idle' | 'success' | 'partial' | 'error';
  totalRecords: number;
  processedCount: number;
  successCount: number;
  failedCount: number;
  failedRows: ImportErrorRow[];
}

/**
 * Normalize header text for consistent column matching
 * Handles underscores, hyphens, spaces, and case variations
 */
export const normalizeHeader = (header: string): string =>
  header.toLowerCase().trim().replace(/[_\-\s]+/g, ' ');

/**
 * Extract value from a row based on column aliases
 * Supports flexible header naming (e.g., "Vendor Name", "vendor_name", "vendorname")
 */
export const getRowValue = (
  row: Record<string, unknown>,
  aliases: string[]
): string => {
  const entries = Object.entries(row);
  for (const [key, value] of entries) {
    const normalized = normalizeHeader(key);
    if (aliases.some((alias) => normalizeHeader(alias) === normalized)) {
      return String(value ?? '').trim();
    }
  }
  return '';
};

/**
 * Parse .xlsx or .csv file and extract data rows
 * Returns array of raw row objects
 */
export const parseImportFile = async (file: File): Promise<Record<string, unknown>[]> => {
  const xlsx = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const workbook = xlsx.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  
  if (!firstSheetName) {
    throw new Error('The selected file does not contain any worksheet.');
  }
  
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: '',
    raw: false,
    blankrows: false,
  });
  
  return rawRows;
};

/**
 * Build CSV content for error report
 * Includes row number, error reason, and all raw data columns
 */
export const buildErrorFileContent = (errors: ImportErrorRow[]): string => {
  if (errors.length === 0) return '';

  const allColumns = new Set<string>(['RowNumber', 'Reason']);
  errors.forEach((errorRow) => {
    Object.keys(errorRow.raw || {}).forEach((key) => allColumns.add(key));
  });

  const headers = Array.from(allColumns);

  const escapeCsv = (value: unknown): string => {
    const stringValue = String(value ?? '');
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const lines = [headers.join(',')];
  errors.forEach((errorRow) => {
    const rowData: Record<string, unknown> = {
      RowNumber: errorRow.rowNumber,
      Reason: errorRow.reason,
      ...(errorRow.raw || {}),
    };
    lines.push(headers.map((header) => escapeCsv(rowData[header])).join(','));
  });

  return lines.join('\n');
};

/**
 * Download text content as a file
 * Creates temporary blob URL and triggers download
 */
export const downloadTextFile = (
  content: string,
  fileName: string,
  mimeType = 'text/csv;charset=utf-8;'
): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Validate file extension for import
 * Checks if file is .xlsx or .csv
 */
export const isValidImportFile = (file: File): boolean => {
  const lowerName = file.name.toLowerCase();
  const acceptedExtensions = ['.xlsx', '.csv'];
  return acceptedExtensions.some((ext) => lowerName.endsWith(ext));
};

/**
 * Email validation regex pattern
 */
export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Phone number validation regex pattern
 * Supports international formats with optional +, digits, hyphens, and spaces
 */
export const isValidPhone = (phone: string): boolean =>
  /^\+?[0-9\-\s]{7,15}$/.test(phone);

/**
 * PAN (Permanent Account Number in India) validation
 */
export const isValidPAN = (pan: string): boolean =>
  /^[A-Za-z0-9]{8,20}$/.test(pan);

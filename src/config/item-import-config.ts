/**
 * Import configuration for Items module
 * Defines column mappings, validation rules, and API integration
 */

import { ImportErrorRow } from '@/utils/import-utils';

export interface ItemImportRow {
  rowNumber: number;
  raw: Record<string, unknown>;
  itemName: string;
  itemType: string;
  category: string;
  description: string;
  unitOfMeasure: string;
  unitPrice: string;
  serviceType: string;
  rateType: string;
  maxAmount: string;
  status: string;
}

export const ITEM_COLUMN_ALIASES: Record<keyof Omit<ItemImportRow, 'rowNumber' | 'raw'>, string[]> = {
  itemName: ['itemname', 'item name', 'servicename', 'service name', 'name'],
  itemType: ['itemtype', 'item type', 'type'],
  category: ['category'],
  description: ['description', 'desc'],
  unitOfMeasure: ['unitofmeasure', 'unit of measure', 'unit measure', 'uom'],
  unitPrice: ['unitprice', 'unit price', 'price'],
  serviceType: ['servicetype', 'service type'],
  rateType: ['ratetype', 'rate type'],
  maxAmount: ['maxamount', 'max amount', 'maximum amount'],
  status: ['status']
};

export const ITEM_REQUIRED_FIELDS: Array<keyof Omit<ItemImportRow, 'rowNumber' | 'raw'>> = [
  'itemName',
  'itemType',
  'status'
];

export const ITEM_TEMPLATE_HEADERS = [
  'Item Name',
  'Item Type',
  'Category',
  'Description',
  'Unit of Measure',
  'Unit Price',
  'Service Type',
  'Rate Type',
  'Max Amount',
  'Status'
];

export const ITEM_TEMPLATE_SAMPLE = [
  'Office Supplies Set',
  'Goods',
  'Supplies',
  'General office supplies bundle',
  'BOX',
  '99.99',
  '',
  '',
  '',
  'Active'
];

// Helper to build validation error message
export const buildItemValidationErrors = (
  row: ItemImportRow,
  existingItems: any[],
  seenItems: Set<string>
): string[] => {
  const errors: string[] = [];

  // Check required fields
  for (const field of ITEM_REQUIRED_FIELDS) {
    const value = String(row[field] ?? '').trim();
    if (!value) {
      errors.push(`${field} is mandatory`);
    }
  }

  // Validate item type
  const validItemTypes = ['Goods', 'Service'];
  if (row.itemType && !validItemTypes.includes(row.itemType)) {
    errors.push(`ItemType must be one of: ${validItemTypes.join(', ')}`);
  }

  // Validate status
  const validStatuses = ['Active', 'Inactive'];
  if (row.status && !validStatuses.includes(row.status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  // Conditional validations for Goods
  if (row.itemType === 'Goods') {
    if (!row.unitOfMeasure || !row.unitOfMeasure.trim()) {
      errors.push('Unit of Measure is required for Goods');
    }

    if (!row.unitPrice || !row.unitPrice.trim()) {
      errors.push('Unit Price is required for Goods');
    } else {
      const price = Number(row.unitPrice);
      if (!Number.isFinite(price) || price < 0) {
        errors.push('Unit Price must be a valid non-negative number');
      }
    }
  }

  // Conditional validations for Services
  if (row.itemType === 'Service') {
    const hasRateType = row.rateType && row.rateType.trim();
    const hasMaxAmount = row.maxAmount && row.maxAmount.trim();

    if (!hasRateType && !hasMaxAmount) {
      errors.push('Service must have either Rate Type or Max Amount');
    }

    if (hasMaxAmount) {
      const maxAmount = Number(row.maxAmount);
      if (!Number.isFinite(maxAmount) || maxAmount < 0) {
        errors.push('Max Amount must be a valid non-negative number');
      }
    }
  }

  // Check for duplicate item names
  const normalizedName = row.itemName.trim().toLowerCase();
  const existingNames = new Set(
    existingItems
      .map(item => (item.ServiceName || item.serviceName || item.itemName || '').trim().toLowerCase())
      .filter(Boolean)
  );

  if (normalizedName && (existingNames.has(normalizedName) || seenItems.has(normalizedName))) {
    errors.push('Duplicate item name found');
  }

  return errors;
};

// Build API request body from import row
export const buildItemRequestBody = (row: ItemImportRow): Record<string, any> => {
  // Parse description metadata if present (format: ##VMSMETA: {json})
  let metadata: Record<string, any> = {};
  if (row.description && row.description.includes('##VMSMETA:')) {
    try {
      const metaStr = row.description.split('##VMSMETA:')[1].trim();
      metadata = JSON.parse(metaStr);
    } catch (e) {
      // Ignore metadata parsing errors, use empty object
    }
  }

  return {
    VendorMgrServiceId: null,
    ServiceName: row.itemName,
    Description: row.description,
    MaxAmount: row.maxAmount ? Number(row.maxAmount) : 0,
    ItemType: row.itemType,
    Category: row.category,
    UnitOfMeasure: row.unitOfMeasure,
    UnitPrice: row.unitPrice ? Number(row.unitPrice) : 0,
    ServiceType: row.serviceType,
    RateType: row.rateType,
    StatusText: row.status,
    ...metadata,
  };
};

// Extract metadata from description field (if present)
export const extractItemMetadata = (description: string): Record<string, any> => {
  if (!description || !description.includes('##VMSMETA:')) {
    return {};
  }

  try {
    const metaStr = description.split('##VMSMETA:')[1].trim();
    return JSON.parse(metaStr);
  } catch (e) {
    return {};
  }
};

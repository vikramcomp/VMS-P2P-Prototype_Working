/**
 * Import configuration for Vendors module
 * Defines column mappings, validation rules, and API integration
 */

import { ImportErrorRow } from '@/utils/import-utils';

export interface VendorImportRow {
  rowNumber: number;
  raw: Record<string, unknown>;
  vendorName: string;
  vendorCode: string;
  vendorType: string;
  contactFirstName: string;
  contactLastName: string;
  emailId: string;
  officePhone: string;
  mobile: string;
  countryId: string;
  stateId: string;
  city: string;
  zipCode: string;
  address1: string;
  paymentCycle: string;
  pan: string;
  salesTaxNo: string;
  serviceTaxNo: string;
  comments: string;
}

export const VENDOR_COLUMN_ALIASES: Record<keyof Omit<VendorImportRow, 'rowNumber' | 'raw'>, string[]> = {
  vendorName: ['vendorname', 'vendor name'],
  vendorCode: ['vendorcode', 'vendor code'],
  vendorType: ['vendortype', 'vendor type'],
  contactFirstName: ['contactfirstname', 'contact first name', 'contactfname', 'contact fname'],
  contactLastName: ['contactlastname', 'contact last name', 'contactlname', 'contact lname'],
  emailId: ['emailid', 'email id', 'email'],
  officePhone: ['officephone', 'office phone'],
  mobile: ['mobile', 'mobile phone', 'mobilephone'],
  countryId: ['countryid', 'country id'],
  stateId: ['stateid', 'state id'],
  city: ['city'],
  zipCode: ['zipcode', 'zip code', 'postalcode', 'postal code'],
  address1: ['address1', 'address 1', 'address'],
  paymentCycle: ['paymentcycle', 'payment cycle'],
  pan: ['pan'],
  salesTaxNo: ['salestaxno', 'sales tax no', 'sales tax number'],
  serviceTaxNo: ['servicetaxno', 'service tax no', 'service tax number'],
  comments: ['comments', 'comment']
};

export const VENDOR_REQUIRED_FIELDS: Array<keyof Omit<VendorImportRow, 'rowNumber' | 'raw'>> = [
  'vendorName',
  'vendorCode',
  'contactFirstName',
  'emailId',
  'countryId',
  'stateId',
  'city',
  'paymentCycle'
];

export const VENDOR_TEMPLATE_HEADERS = [
  'Vendor Name',
  'Vendor Code',
  'Vendor Type',
  'Contact First Name',
  'Contact Last Name',
  'Email Id',
  'Office Phone',
  'Mobile',
  'Country Id',
  'State Id',
  'City',
  'Zip Code',
  'Address 1',
  'Payment Cycle',
  'PAN',
  'Sales Tax No',
  'Service Tax No',
  'Comments'
];

export const VENDOR_TEMPLATE_SAMPLE = [
  'Acme Supplies Pvt Ltd',
  'VND-1001',
  'Company',
  'John',
  'Doe',
  'john.doe@acme.com',
  '01123456789',
  '9876543210',
  '1',
  '1',
  'New York',
  '10001',
  '123 Main Street',
  '1',
  'ABCDE1234F',
  'TXN12345',
  'STX12345',
  'Preferred vendor'
];

// Audit storage key for vendor imports
export const VENDOR_IMPORT_AUDIT_STORAGE_KEY = 'vms_vendor_import_audit_logs';

// Helper to build validation error message
export const buildVendorValidationErrors = (
  row: VendorImportRow,
  existingVendors: any[],
  seenVendors: Set<string>,
  paymentCycles: any[]
): string[] => {
  const errors: string[] = [];

  // Check required fields
  for (const field of VENDOR_REQUIRED_FIELDS) {
    const value = String(row[field] ?? '').trim();
    if (!value) {
      errors.push(`${field} is mandatory`);
    }
  }

  // Validate email
  if (row.emailId) {
    const { isValidEmail } = require('@/utils/import-utils');
    if (!isValidEmail(row.emailId)) {
      errors.push('Invalid email format');
    }
  }

  // Validate phone numbers
  if (row.mobile) {
    const { isValidPhone } = require('@/utils/import-utils');
    if (!isValidPhone(row.mobile)) {
      errors.push('Invalid mobile format');
    }
  }

  if (row.officePhone) {
    const { isValidPhone } = require('@/utils/import-utils');
    if (!isValidPhone(row.officePhone)) {
      errors.push('Invalid office phone format');
    }
  }

  // Validate PAN
  if (row.pan) {
    const { isValidPAN } = require('@/utils/import-utils');
    if (!isValidPAN(row.pan)) {
      errors.push('Invalid PAN format');
    }
  }

  // Check for duplicate vendor names
  const normalizedName = row.vendorName.trim().toLowerCase();
  const existingNames = new Set(
    existingVendors
      .map(v => (v.vendorName || v.VendorName || '').trim().toLowerCase())
      .filter(Boolean)
  );

  if (normalizedName && (existingNames.has(normalizedName) || seenVendors.has(normalizedName))) {
    errors.push('Duplicate vendor name found');
  }

  // Check for duplicate vendor codes
  const normalizedCode = row.vendorCode.trim().toLowerCase();
  const existingCodes = new Set(
    existingVendors
      .map(v => (v.vendorCode || v.VendorCode || '').trim().toLowerCase())
      .filter(Boolean)
  );

  if (normalizedCode && (existingCodes.has(normalizedCode) || seenVendors.has(normalizedCode))) {
    errors.push('Duplicate vendor code found');
  }

  // Validate payment cycle
  if (row.paymentCycle) {
    const paymentCycleId = getPaymentCycleId(row.paymentCycle, paymentCycles);
    if (paymentCycleId === null) {
      errors.push('Invalid payment cycle value');
    }
  }

  // Validate numeric IDs
  const countryId = Number(row.countryId);
  const stateId = Number(row.stateId);

  if (!Number.isFinite(countryId) || countryId <= 0) {
    errors.push('CountryId must be a valid number');
  }

  if (!Number.isFinite(stateId) || stateId <= 0) {
    errors.push('StateId must be a valid number');
  }

  return errors;
};

// Helper to get payment cycle ID from value or name
export const getPaymentCycleId = (
  paymentCycleValue: string,
  paymentCycles: any[]
): number | null => {
  const trimmed = paymentCycleValue.trim();
  if (!trimmed) return null;

  const numericValue = Number(trimmed);
  if (Number.isFinite(numericValue) && paymentCycles.some(cycle => cycle.id === numericValue)) {
    return numericValue;
  }

  const matchByName = paymentCycles.find(
    cycle => cycle.name.toLowerCase() === trimmed.toLowerCase()
  );
  return matchByName?.id ?? null;
};

// Build API request body from import row
export const buildVendorRequestBody = (
  row: VendorImportRow,
  paymentCycleId: number
): Record<string, any> => {
  return {
    vendorId: null,
    vendorType: row.vendorType.trim().toLowerCase() === 'individual' ? 2 : 1,
    contactFname: row.contactFirstName,
    contactLname: row.contactLastName,
    vendorName: row.vendorName,
    vendorCode: row.vendorCode,
    address1: row.address1,
    city: row.city,
    state: Number(row.stateId),
    country: Number(row.countryId),
    zipCode: row.zipCode,
    emailId: row.emailId,
    officePhone: row.officePhone,
    mobile: row.mobile,
    fax: '',
    pan: row.pan,
    salesTaxNo: row.salesTaxNo,
    serviceTaxNo: row.serviceTaxNo,
    paymentCycle: paymentCycleId,
    comments: row.comments,
    agreementValidityFrom: '',
    agreementValidityTo: '',
    status: 1,
    agreementName: '',
    mappedServiceDetails: [],
    unmappedServiceDetails: [],
  };
};

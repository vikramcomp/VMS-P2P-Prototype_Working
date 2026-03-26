/**
 * Test for isTesting prop coverage
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import VendorsContent from '../vendors-content';

// Mock all dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

jest.mock('@/services/vendors-service', () => ({
  vendorsService: {
    getAllVendors: jest.fn().mockResolvedValue({
      isSuccess: true,
      data: {
        records: [],
        totalRecords: 0,
      },
    }),
    changeVendorStatus: jest.fn().mockResolvedValue({
      isSuccess: true,
      message: 'Success',
    }),
    exportVendors: jest.fn().mockResolvedValue(''),
  },
}));

jest.mock('@/config/env-validation', () => ({
  envConfig: {
    apiBaseUrl: 'http://localhost:3000',
  },
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
) as jest.Mock;

global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('VendorsContent isTesting prop', () => {
  it('renders with isTesting and root test id', () => {
    render(<VendorsContent isTesting={true} />);
    expect(screen.getByTestId('vendors-content-root')).toBeInTheDocument();
  });
});

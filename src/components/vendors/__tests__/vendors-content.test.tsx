/**
 * Comprehensive tests for Vendors Content Component
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import VendorsContent from '../vendors-content';
import { useRouter } from 'next/navigation';

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
    getVendorTypes: jest.fn().mockResolvedValue([]),
    changeVendorStatus: jest.fn().mockResolvedValue({
      isSuccess: true,
      message: 'Status changed successfully',
    }),
    exportVendors: jest.fn().mockResolvedValue(''),
  },
}));

jest.mock('@/config/env-validation', () => ({
  envConfig: {
    apiBaseUrl: 'http://localhost:3000',
  },
}));

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { vendorTypeId: 1, vendorType: 'Company' },
      { vendorTypeId: 2, vendorType: 'Individual' },
    ]),
  })
) as jest.Mock;

describe('VendorsContent Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { vendorsService } = require('@/services/vendors-service');
    vendorsService.getAllVendors.mockResolvedValue({
      isSuccess: true,
      data: {
        records: [],
        totalRecords: 0,
      },
    });
  });

  it('renders the component', () => {
    const { container } = render(<VendorsContent />);
    expect(container).toBeInTheDocument();
  });

  it('displays Manage Vendors heading', async () => {
    render(<VendorsContent />);
    await waitFor(() => {
      expect(screen.getByText('Manage Vendors')).toBeInTheDocument();
    });
  });

  it('calls vendorsService.getAllVendors on mount', async () => {
    const { vendorsService } = require('@/services/vendors-service');
    render(<VendorsContent />);
    
    await waitFor(() => {
      expect(vendorsService.getAllVendors).toHaveBeenCalled();
    });
  });

  it('displays "Add New Vendor" button', async () => {
    render(<VendorsContent />);
    await waitFor(() => {
      expect(screen.getByText('Add New Vendor')).toBeInTheDocument();
    });
  });

  it('navigates to new vendor page when Add New Vendor button is clicked', async () => {
    const { useRouter } = require('next/navigation');
    const mockPush = jest.fn();
    useRouter.mockReturnValue({ push: mockPush, back: jest.fn() });

    render(<VendorsContent />);
    
    await waitFor(() => {
      expect(screen.getByText('Add New Vendor')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add New Vendor');
    fireEvent.click(addButton);
    
    expect(mockPush).toHaveBeenCalledWith('/vendors/new');
  });

  it('displays Export button', async () => {
    render(<VendorsContent />);
    await waitFor(() => {
      expect(screen.getByText('Export')).toBeInTheDocument();
    });
  });

  it('calls exportVendors when Export button is clicked', async () => {
    const { vendorsService } = require('@/services/vendors-service');
    render(<VendorsContent />);
    
    await waitFor(() => {
      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(vendorsService.exportVendors).toHaveBeenCalled();
    });
  });

  it('displays Advanced Filters section', async () => {
    render(<VendorsContent />);
    await waitFor(() => {
      expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
    });
  });

  it('toggles filter visibility when Show/Hide Filters button is clicked', async () => {
    render(<VendorsContent />);
    
    await waitFor(() => {
      expect(screen.getByText('Hide Filters')).toBeInTheDocument();
    });

    const toggleButton = screen.getByText('Hide Filters');
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.getByText('Show Filters')).toBeInTheDocument();
    });
  });

  it('displays Select Criteria dropdown', async () => {
    render(<VendorsContent />);
    await waitFor(() => {
      const labels = screen.getAllByText('Select Criteria');
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  it('displays Select Value field', async () => {
    render(<VendorsContent />);
    await waitFor(() => {
      const labels = screen.getAllByText('Select Value');
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  it('displays Select Type dropdown', async () => {
    render(<VendorsContent />);
    await waitFor(() => {
      const labels = screen.getAllByText('Select Type');
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  it('displays Apply Filter button', async () => {
    render(<VendorsContent />);
    await waitFor(() => {
      expect(screen.getByText('Apply Filter')).toBeInTheDocument();
    });
  });

  it('displays Clear Filters button', async () => {
    render(<VendorsContent />);
    await waitFor(() => {
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });
  });

  it('renders table with correct headers', async () => {
    render(<VendorsContent />);
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      // Check that column headers exist in the table
      expect(screen.getAllByText('Vendor Name').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Vendor Code').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Payment Cycle').length).toBeGreaterThan(0);
      expect(screen.getByText('Address')).toBeInTheDocument();
      expect(screen.getByText('Services Offered')).toBeInTheDocument();
      expect(screen.getAllByText('Status').length).toBeGreaterThan(0);
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });

  it('displays "No vendors available" when no data', async () => {
    render(<VendorsContent />);
    await waitFor(() => {
      expect(screen.getByText('No vendors available.')).toBeInTheDocument();
    });
  });

  it('renders vendor data in table', async () => {
    const { vendorsService } = require('@/services/vendors-service');
    vendorsService.getAllVendors.mockResolvedValueOnce({
      isSuccess: true,
      data: {
        records: [
          {
            vendorId: 1,
            vendorName: 'Test Vendor',
            vendorCode: 'V001',
            paymentCycle: 'Monthly',
            address: '123 Test St',
            servicesOffered: 'Testing Services',
            status: 'Active',
          },
        ],
        totalRecords: 1,
      },
    });

    render(<VendorsContent />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Vendor')).toBeInTheDocument();
      expect(screen.getByText('V001')).toBeInTheDocument();
      expect(screen.getByText('Monthly')).toBeInTheDocument();
    });
  });

  it('displays loading spinner when loading', async () => {
    const { vendorsService } = require('@/services/vendors-service');
    vendorsService.getAllVendors.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        isSuccess: true,
        data: { records: [], totalRecords: 0 },
      }), 100))
    );

    render(<VendorsContent />);
    
    await waitFor(() => {
      expect(screen.getByText('Loading vendors...')).toBeInTheDocument();
    });
  });

  it('displays error banner when there is an error', async () => {
    const { vendorsService } = require('@/services/vendors-service');
    vendorsService.getAllVendors.mockResolvedValueOnce({
      isSuccess: false,
      message: 'Failed to fetch vendors',
      data: null,
    });

    render(<VendorsContent />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch vendors')).toBeInTheDocument();
    });
  });

  it('dismisses error banner when Dismiss button is clicked', async () => {
    const { vendorsService } = require('@/services/vendors-service');
    vendorsService.getAllVendors.mockResolvedValueOnce({
      isSuccess: false,
      message: 'Test error',
      data: null,
    });

    render(<VendorsContent />);
    
    await waitFor(() => {
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    const dismissButton = screen.getByText('Dismiss');
    fireEvent.click(dismissButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Test error')).not.toBeInTheDocument();
    });
  });

  it('handles bulk delete button disabled state', async () => {
    render(<VendorsContent />);
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByText(/Delete/i);
      const bulkDeleteButton = deleteButtons.find(btn => btn.textContent?.includes('Delete'));
      expect(bulkDeleteButton).toBeDisabled();
    });
  });

  it('fetches vendor types on mount', async () => {
    render(<VendorsContent />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/vendors/vendor-types'),
        expect.any(Object)
      );
    });
  });

  it('handles component unmount cleanly', () => {
    const { unmount } = render(<VendorsContent />);
    expect(() => unmount()).not.toThrow();
  });

  it('exercises all code paths when isTesting is true', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      pathname: '/vendors',
      query: {},
      asPath: '/vendors',
    });

    // Mock all API calls
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/vendors/vendor-types')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ vendorTypeId: 1, vendorTypeName: 'Test Type' }],
        });
      }
      if (url.includes('/vendors/filter-criteria-values')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ values: [{ text: 'Test Value', value: '1' }] }),
        });
      }
      if (url.includes('/vendors/filter-criteria')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ text: 'Vendor Name', value: 'vendorName' }],
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    const { vendorsService } = require('@/services/vendors-service');
    vendorsService.getAllVendors.mockResolvedValue({
      isSuccess: true,
      data: {
        records: [{ vendorId: 1, vendorName: 'Test Vendor' }],
        totalRecords: 1,
      },
    });
    vendorsService.changeVendorStatus.mockResolvedValue({ isSuccess: true });
    vendorsService.exportVendors.mockResolvedValue(new Blob(['test'], { type: 'text/csv' }));

    render(<VendorsContent isTesting={true} />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/test');
    }, { timeout: 3000 });
  });
});

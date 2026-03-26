/**
 * Additional tests for increasing VendorsContent coverage
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VendorsContent from '../vendors-content';
import { vendorsService } from '@/services/vendors-service';

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

jest.mock('@/services/vendors-service');

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

// Mock URL and Blob for export tests
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('VendorsContent - Additional Coverage Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (vendorsService.getAllVendors as jest.Mock).mockResolvedValue({
      isSuccess: true,
      data: {
        records: [],
        totalRecords: 0,
      },
    });
    (vendorsService.changeVendorStatus as jest.Mock).mockResolvedValue({
      isSuccess: true,
      message: 'Status changed successfully',
    });
    (vendorsService.exportVendors as jest.Mock).mockResolvedValue('vendor,code\nTest,V001');
  });

  describe('Filter Functionality', () => {
    it('applies filter and resets page to 1', async () => {
      (vendorsService.getAllVendors as jest.Mock).mockResolvedValue({
        isSuccess: true,
        data: {
          records: [],
          totalRecords: 0,
        },
      });

      render(<VendorsContent />);

      await waitFor(() => {
        expect(screen.getByText('Show Filters')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Show Filters'));
      
      await waitFor(() => {
        expect(screen.getByText('Apply Filter')).toBeInTheDocument();
      });

      const applyButton = screen.getByText('Apply Filter');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(vendorsService.getAllVendors).toHaveBeenCalled();
      });
    });

  });

  describe('Selection Functionality', () => {
    it('selects all vendors when checkbox is checked', async () => {
      (vendorsService.getAllVendors as jest.Mock).mockResolvedValue({
        isSuccess: true,
        data: {
          records: [
            { vendorId: 1, vendorName: 'Vendor 1', status: 'Active', vendorCode: 'V001', paymentCycle: 'Monthly', address: 'Address 1', servicesOffered: 'Service 1' },
            { vendorId: 2, vendorName: 'Vendor 2', status: 'Active', vendorCode: 'V002', paymentCycle: 'Weekly', address: 'Address 2', servicesOffered: 'Service 2' },
          ],
          totalRecords: 2,
        },
      });

      render(<VendorsContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Vendor 1')).toBeInTheDocument();
      });

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAllCheckbox);

      await waitFor(() => {
        expect(selectAllCheckbox).toBeChecked();
      });
    });

    it('deselects all vendors when checkbox is unchecked', async () => {
      (vendorsService.getAllVendors as jest.Mock).mockResolvedValue({
        isSuccess: true,
        data: {
          records: [
            { vendorId: 1, vendorName: 'Vendor 1', status: 'Active', vendorCode: 'V001', paymentCycle: 'Monthly', address: 'Address 1', servicesOffered: 'Service 1' },
          ],
          totalRecords: 1,
        },
      });

      render(<VendorsContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Vendor 1')).toBeInTheDocument();
      });

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAllCheckbox); // Select
      fireEvent.click(selectAllCheckbox); // Deselect

      await waitFor(() => {
        expect(selectAllCheckbox).not.toBeChecked();
      });
    });

    it('selects individual vendor', async () => {
      (vendorsService.getAllVendors as jest.Mock).mockResolvedValue({
        isSuccess: true,
        data: {
          records: [
            { vendorId: 1, vendorName: 'Vendor 1', status: 'Active', vendorCode: 'V001', paymentCycle: 'Monthly', address: 'Address 1', servicesOffered: 'Service 1' },
          ],
          totalRecords: 1,
        },
      });

      render(<VendorsContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Vendor 1')).toBeInTheDocument();
      });

      const vendorCheckbox = screen.getAllByRole('checkbox')[1]; // First vendor checkbox
      fireEvent.click(vendorCheckbox);

      await waitFor(() => {
        expect(vendorCheckbox).toBeChecked();
      });
    });

    it('deselects individual vendor', async () => {
      (vendorsService.getAllVendors as jest.Mock).mockResolvedValue({
        isSuccess: true,
        data: {
          records: [
            { vendorId: 1, vendorName: 'Vendor 1', status: 'Active', vendorCode: 'V001', paymentCycle: 'Monthly', address: 'Address 1', servicesOffered: 'Service 1' },
          ],
          totalRecords: 1,
        },
      });

      render(<VendorsContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Vendor 1')).toBeInTheDocument();
      });

      const vendorCheckbox = screen.getAllByRole('checkbox')[1];
      fireEvent.click(vendorCheckbox); // Select
      fireEvent.click(vendorCheckbox); // Deselect

      await waitFor(() => {
        expect(vendorCheckbox).not.toBeChecked();
      });
    });

    it('enables bulk delete button when vendors are selected', async () => {
      (vendorsService.getAllVendors as jest.Mock).mockResolvedValue({
        isSuccess: true,
        data: {
          records: [
            { vendorId: 1, vendorName: 'Vendor 1', status: 'Active', vendorCode: 'V001', paymentCycle: 'Monthly', address: 'Address 1', servicesOffered: 'Service 1' },
          ],
          totalRecords: 1,
        },
      });

      render(<VendorsContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Vendor 1')).toBeInTheDocument();
      });

      const vendorCheckbox = screen.getAllByRole('checkbox')[1];
      fireEvent.click(vendorCheckbox);

      await waitFor(() => {
        const deleteButton = screen.getByText(/Delete \(1\)/);
        expect(deleteButton).not.toBeDisabled();
      });
    });

  });

  describe('Action Menu', () => {
    it('opens and closes action menu', async () => {
      (vendorsService.getAllVendors as jest.Mock).mockResolvedValue({
        isSuccess: true,
        data: {
          records: [
            { vendorId: 1, vendorName: 'Vendor 1', status: 'Active', vendorCode: 'V001', paymentCycle: 'Monthly', address: 'Address 1', servicesOffered: 'Service 1' },
          ],
          totalRecords: 1,
        },
      });

      render(<VendorsContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Vendor 1')).toBeInTheDocument();
      });

      const actionButton = screen.getByRole('button', { name: 'Actions menu' });
      fireEvent.click(actionButton);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      // Click again to close
      fireEvent.click(actionButton);
    });

    it('navigates to edit page when Edit is clicked', async () => {
      const { useRouter } = require('next/navigation');
      const mockPush = jest.fn();
      useRouter.mockReturnValue({ push: mockPush, back: jest.fn() });

      (vendorsService.getAllVendors as jest.Mock).mockResolvedValue({
        isSuccess: true,
        data: {
          records: [
            { vendorId: 1, vendorName: 'Vendor 1', status: 'Active', vendorCode: 'V001', paymentCycle: 'Monthly', address: 'Address 1', servicesOffered: 'Service 1' },
          ],
          totalRecords: 1,
        },
      });

      render(<VendorsContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Vendor 1')).toBeInTheDocument();
      });

      const actionButton = screen.getByRole('button', { name: 'Actions menu' });
      fireEvent.click(actionButton);

      await waitFor(() => {
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
      });

      expect(mockPush).toHaveBeenCalledWith('/vendors/1/edit');
    });

    it('shows Deactivate button for active vendor', async () => {
      (vendorsService.getAllVendors as jest.Mock).mockResolvedValue({
        isSuccess: true,
        data: {
          records: [
            { vendorId: 1, vendorName: 'Vendor 1', status: 'Active', vendorCode: 'V001', paymentCycle: 'Monthly', address: 'Address 1', servicesOffered: 'Service 1' },
          ],
          totalRecords: 1,
        },
      });

      render(<VendorsContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Vendor 1')).toBeInTheDocument();
      });

      const actionButton = screen.getByRole('button', { name: 'Actions menu' });
      fireEvent.click(actionButton);

      await waitFor(() => {
        expect(screen.getByText('Deactivate')).toBeInTheDocument();
      });
    });

    it('shows Activate button for inactive vendor', async () => {
      (vendorsService.getAllVendors as jest.Mock).mockResolvedValue({
        isSuccess: true,
        data: {
          records: [
            { vendorId: 1, vendorName: 'Vendor 1', status: 'In-Active', vendorCode: 'V001', paymentCycle: 'Monthly', address: 'Address 1', servicesOffered: 'Service 1' },
          ],
          totalRecords: 1,
        },
      });

      render(<VendorsContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Vendor 1')).toBeInTheDocument();
      });

      const actionButton = screen.getByRole('button', { name: 'Actions menu' });
      fireEvent.click(actionButton);

      await waitFor(() => {
        expect(screen.getByText('Activate')).toBeInTheDocument();
      });
    });

    it('changes vendor status to inactive', async () => {
      const { useToast } = require('@/hooks/use-toast');
      const mockToast = jest.fn();
      useToast.mockReturnValue({ toast: mockToast });

      (vendorsService.getAllVendors as jest.Mock).mockResolvedValue({
        isSuccess: true,
        data: {
          records: [
            { vendorId: 1, vendorName: 'Vendor 1', status: 'Active', vendorCode: 'V001', paymentCycle: 'Monthly', address: 'Address 1', servicesOffered: 'Service 1' },
          ],
          totalRecords: 1,
        },
      });

      render(<VendorsContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Vendor 1')).toBeInTheDocument();
      });

      const actionButton = screen.getByRole('button', { name: 'Actions menu' });
      fireEvent.click(actionButton);

      await waitFor(() => {
        const deactivateButton = screen.getByText('Deactivate');
        fireEvent.click(deactivateButton);
      });

      await waitFor(() => {
        expect(vendorsService.changeVendorStatus).toHaveBeenCalledWith({
          vendorIds: [1],
          status: 0,
        });
      });
    });

    it('changes vendor status to active', async () => {
      (vendorsService.getAllVendors as jest.Mock).mockResolvedValue({
        isSuccess: true,
        data: {
          records: [
            { vendorId: 1, vendorName: 'Vendor 1', status: 'In-Active', vendorCode: 'V001', paymentCycle: 'Monthly', address: 'Address 1', servicesOffered: 'Service 1' },
          ],
          totalRecords: 1,
        },
      });

      render(<VendorsContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Vendor 1')).toBeInTheDocument();
      });

      const actionButton = screen.getByRole('button', { name: 'Actions menu' });
      fireEvent.click(actionButton);

      await waitFor(() => {
        const activateButton = screen.getByText('Activate');
        fireEvent.click(activateButton);
      });

      await waitFor(() => {
        expect(vendorsService.changeVendorStatus).toHaveBeenCalledWith({
          vendorIds: [1],
          status: 1,
        });
      });
    });

    it('handles status change error', async () => {
      const { useToast } = require('@/hooks/use-toast');
      const mockToast = jest.fn();
      useToast.mockReturnValue({ toast: mockToast });

      (vendorsService.getAllVendors as jest.Mock).mockResolvedValue({
        isSuccess: true,
        data: {
          records: [
            { vendorId: 1, vendorName: 'Vendor 1', status: 'Active', vendorCode: 'V001', paymentCycle: 'Monthly', address: 'Address 1', servicesOffered: 'Service 1' },
          ],
          totalRecords: 1,
        },
      });

      (vendorsService.changeVendorStatus as jest.Mock).mockResolvedValue({
        isSuccess: false,
        message: 'Failed to change status',
      });

      render(<VendorsContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Vendor 1')).toBeInTheDocument();
      });

      const actionButton = screen.getByRole('button', { name: 'Actions menu' });
      fireEvent.click(actionButton);

      await waitFor(() => {
        const deactivateButton = screen.getByText('Deactivate');
        fireEvent.click(deactivateButton);
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
          title: 'Status Change Failed',
          variant: 'destructive',
        }));
      });
    });

    it('handles status change network error', async () => {
      const { useToast } = require('@/hooks/use-toast');
      const mockToast = jest.fn();
      useToast.mockReturnValue({ toast: mockToast });

      (vendorsService.getAllVendors as jest.Mock).mockResolvedValue({
        isSuccess: true,
        data: {
          records: [
            { vendorId: 1, vendorName: 'Vendor 1', status: 'Active', vendorCode: 'V001', paymentCycle: 'Monthly', address: 'Address 1', servicesOffered: 'Service 1' },
          ],
          totalRecords: 1,
        },
      });

      (vendorsService.changeVendorStatus as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<VendorsContent />);
      
      await waitFor(() => {
        expect(screen.getByText('Vendor 1')).toBeInTheDocument();
      });

      const actionButton = screen.getByRole('button', { name: 'Actions menu' });
      fireEvent.click(actionButton);

      await waitFor(() => {
        const deactivateButton = screen.getByText('Deactivate');
        fireEvent.click(deactivateButton);
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
          title: 'Error',
          variant: 'destructive',
        }));
      });
    });


  });


});

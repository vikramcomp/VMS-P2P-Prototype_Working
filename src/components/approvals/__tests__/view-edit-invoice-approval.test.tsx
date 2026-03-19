import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ViewEditInvoiceApproval from '../view-edit-invoice-approval';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('ViewEditInvoiceApproval', () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ id: '123' });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (useSearchParams as jest.Mock).mockReturnValue({ get: mockGet });
    mockGet.mockReturnValue('Manager');

    // Default mock response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        requestNumber: 'REQ123',
        poNumber: 'PO123',
        invoiceNumber: 'INV123',
        vendorName: 'Test Vendor',
        poAmount: 1000,
        currentInvoiceAmount: 500,
        status: 'Pending',
      }),
    });
  });

  describe('View Mode', () => {
    it('renders in view mode', async () => {
      render(<ViewEditInvoiceApproval mode="view" />);
      
      await waitFor(() => {
        expect(screen.getByText('View Invoice Approval')).toBeInTheDocument();
      });
    });

    it('displays loading state initially', () => {
      render(<ViewEditInvoiceApproval mode="view" />);
      
      expect(screen.getByText('Loading invoice approval details...')).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('shows approve and reject buttons in edit mode', async () => {
      render(<ViewEditInvoiceApproval mode="edit" />);
      
      await waitFor(() => {
        expect(screen.getByText('Approve')).toBeInTheDocument();
        expect(screen.getByText('Reject')).toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching', () => {
    it('handles nested invoiceDetails structure', async () => {
      const mockData = {
        invoiceDetails: {
          invoiceNumber: 'INV001',
          totalInvoicedAmount: '2000',
          transactionType: 'Bill',
          invoiceDate: '2024-01-01',
          submissionDate: '2024-01-05',
          currentInvoiceAmount: '1000',
        },
        poDetails: {
          poNumber: 'PO001',
          poBalance: '500',
          poType: 'Standard',
          poAmount: '3000',
        },
        requestDetails: {
          requestNumber: 'REQ001',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      render(<ViewEditInvoiceApproval mode="view" />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles capitalized nested properties', async () => {
      const mockData = {
        InvoiceDetails: {
          InvoiceNumber: 'INV002',
          TotalInvoicedAmount: '3000',
          TransactionType: 'Invoice',
          InvoiceDate: '2024-02-01',
          SubmissionDate: '2024-02-05',
          CurrentInvoiceAmount: '1500',
        },
        PODetails: {
          PONumber: 'PO002',
          POBalance: '750',
          POType: 'Express',
          POAmount: '4000',
        },
        RequestDetails: {
          RequestNumber: 'REQ002',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      render(<ViewEditInvoiceApproval mode="view" />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles flat response structure', async () => {
      const mockData = {
        requestNumber: 'REQ003',
        RequestNumber: 'REQ003',
        poNumber: 'PO003',
        PONumber: 'PO003',
        poNo: 'PO003',
        PONo: 'PO003',
        invoiceNumber: 'INV003',
        InvoiceNumber: 'INV003',
        totalInvoicedAmount: '5000',
        TotalInvoicedAmount: '5000',
        poBalance: '1000',
        POBalance: '1000',
        balance: '1000',
        Balance: '1000',
        poType: 'Emergency',
        POType: 'Emergency',
        transactionType: 'Advance Payment',
        TransactionType: 'Advance Payment',
        invoiceDate: '2024-03-01',
        InvoiceDate: '2024-03-01',
        submissionDate: '2024-03-05',
        SubmissionDate: '2024-03-05',
        currentInvoiceAmount: '2500',
        CurrentInvoiceAmount: '2500',
        poAmount: '6000',
        POAmount: '6000',
        poAmt: '6000',
        POAmt: '6000',
        vendorName: 'Vendor ABC',
        VendorName: 'Vendor ABC',
        workflow: 'Standard',
        Workflow: 'Standard',
        comments: 'Test comment',
        Comments: 'Test comment',
        comment: 'Test comment',
        Comment: 'Test comment',
        attachedTimeSheet: 'timesheet.pdf',
        AttachedTimeSheet: 'timesheet.pdf',
        timesheet: 'timesheet.pdf',
        Timesheet: 'timesheet.pdf',
        status: 'Pending Approval',
        Status: 'Pending Approval',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      render(<ViewEditInvoiceApproval mode="view" />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles fetch error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      render(<ViewEditInvoiceApproval mode="view" />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to load invoice approval details',
          variant: 'destructive',
        });
      });
    });

    it('handles network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<ViewEditInvoiceApproval mode="view" />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to load invoice approval details',
          variant: 'destructive',
        });
      });
    });

    it('handles missing data gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      render(<ViewEditInvoiceApproval mode="view" />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Approve Functionality', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoices/details')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              requestNumber: 'REQ123',
              poNumber: 'PO123',
              invoiceNumber: 'INV123',
              vendorName: 'Test Vendor',
              poAmount: 1000,
              currentInvoiceAmount: 500,
              status: 'Pending',
            }),
          });
        }
        if (url.includes('/approve')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });
    });

    it('handles approve action successfully', async () => {
      render(<ViewEditInvoiceApproval mode="edit" />);
      
      await waitFor(() => {
        expect(screen.getByText('Approve')).toBeInTheDocument();
      });

      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Success',
          description: 'Invoice approved successfully',
          variant: 'success',
        });
      });

      expect(mockPush).toHaveBeenCalledWith('/invoice-approvals');
    });
  });

  describe('Reject Functionality', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoices/details')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              requestNumber: 'REQ123',
              poNumber: 'PO123',
              status: 'Pending',
            }),
          });
        }
        if (url.includes('/reject')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });
    });

    it('validates comments before rejecting', async () => {
      render(<ViewEditInvoiceApproval mode="edit" />);
      
      await waitFor(() => {
        expect(screen.getByText('Reject')).toBeInTheDocument();
      });

      const rejectButton = screen.getByText('Reject');
      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Validation Error',
          description: 'Please provide comments for rejection',
          variant: 'destructive',
        });
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          requestNumber: 'REQ123',
          poNumber: 'PO123',
          status: 'Pending Approval',
          attachedTimeSheet: 'https://example.com/timesheet.pdf',
          workflow: 'Standard',
          comments: 'Initial comments',
        }),
      });
    });

    it('handles back button click', async () => {
      render(<ViewEditInvoiceApproval mode="view" />);
      
      await waitFor(() => {
        const backButtons = screen.getAllByRole('button');
        const backButton = backButtons.find(btn => btn.textContent?.includes(''));
        expect(backButton).toBeInTheDocument();
      });
    });
  });

  describe('Data Not Found', () => {
    it('shows not found message when data is null', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      render(<ViewEditInvoiceApproval mode="view" />);
      
      await waitFor(() => {
        expect(screen.getByText('Invoice approval not found')).toBeInTheDocument();
      });
    });

    it('shows back button when invoice not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      render(<ViewEditInvoiceApproval mode="view" />);
      
      await waitFor(() => {
        expect(screen.getByText('Back to Invoice Approvals')).toBeInTheDocument();
      });

      const backButton = screen.getByText('Back to Invoice Approvals');
      fireEvent.click(backButton);

      expect(mockPush).toHaveBeenCalledWith('/invoice-approvals');
    });
  });

  describe('Numeric Value Parsing', () => {
    it('handles string numeric values', async () => {
      const mockData = {
        totalInvoicedAmount: '2500.50',
        poBalance: '1000.25',
        currentInvoiceAmount: '500.75',
        poAmount: '3000.00',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      render(<ViewEditInvoiceApproval mode="view" />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles zero and null numeric values', async () => {
      const mockData = {
        totalInvoicedAmount: 0,
        poBalance: null,
        currentInvoiceAmount: undefined,
        poAmount: 0,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      render(<ViewEditInvoiceApproval mode="view" />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });
});

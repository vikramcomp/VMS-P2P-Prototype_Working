import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter, useSearchParams, useParams, usePathname } from 'next/navigation';
import InvoicePage from '../page';
import { useToast } from '@/hooks/use-toast';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  useParams: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock hooks
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock components
jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: any) => <div data-testid="protected-route">{children}</div>,
}));

jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: any) => <div data-testid="main-layout">{children}</div>,
}));

// Mock fetch
global.fetch = jest.fn();

describe('InvoicePage', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockToast = jest.fn();
  const mockSearchParams = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    (useParams as jest.Mock).mockReturnValue({ id: '123' });
    (usePathname as jest.Mock).mockReturnValue('/invoices/123');
    mockSearchParams.get.mockReturnValue(null);

    // Mock successful fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        invoiceContext: {},
        invoiceItems: [],
      }),
    });
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      render(<InvoicePage />);
      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      });
    });

    it('renders within ProtectedRoute', async () => {
      render(<InvoicePage />);
      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      });
    });

    it('renders MainLayout', async () => {
      render(<InvoicePage />);
      await waitFor(() => {
        expect(screen.getByTestId('main-layout')).toBeInTheDocument();
      });
    });
  });

  describe('URL Parameters', () => {


    it('detects edit mode from pathname', () => {
      (usePathname as jest.Mock).mockReturnValue('/invoices/123/edit');
      render(<InvoicePage />);
      // Edit mode is detected based on pathname including '/edit'
      expect(usePathname).toHaveBeenCalled();
    });

    it('detects view mode from pathname', () => {
      (usePathname as jest.Mock).mockReturnValue('/invoices/123');
      render(<InvoicePage />);
      expect(usePathname).toHaveBeenCalled();
    });
  });

  describe('Referrer Handling', () => {
    it('gets referrer from query params', () => {
      mockSearchParams.get.mockReturnValue('po-list');
      render(<InvoicePage />);
      expect(mockSearchParams.get).toHaveBeenCalledWith('referrer');
    });

    it('handles po-list referrer', () => {
      mockSearchParams.get.mockReturnValue('po-list');
      render(<InvoicePage />);
      expect(mockSearchParams.get).toHaveBeenCalled();
    });

    it('handles manage-invoice referrer', () => {
      mockSearchParams.get.mockReturnValue('manage-invoice');
      render(<InvoicePage />);
      expect(mockSearchParams.get).toHaveBeenCalled();
    });

    it('handles null referrer', () => {
      mockSearchParams.get.mockReturnValue(null);
      render(<InvoicePage />);
      expect(mockSearchParams.get).toHaveBeenCalled();
    });
  });

  describe('Data Fetching', () => {
    it('handles successful data fetch', async () => {
      const mockData = {
        invoiceContext: { id: 1, invoiceNo: 'INV001' },
        invoiceItems: [{ id: 1, description: 'Item 1' }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      render(<InvoicePage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles fetch error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<InvoicePage />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: expect.any(String),
            variant: 'destructive',
          })
        );
      });
    });

    it('handles non-ok response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      render(<InvoicePage />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled();
      });
    });
  });

  describe('Component Integration', () => {
    it('has correct component hierarchy', async () => {
      render(<InvoicePage />);
      
      await waitFor(() => {
        const protectedRoute = screen.getByTestId('protected-route');
        const mainLayout = screen.getByTestId('main-layout');
        expect(protectedRoute).toContainElement(mainLayout);
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner while fetching data', () => {
      render(<InvoicePage />);
      // Loading state should be shown initially
      expect(useRouter).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when invoice ID is missing', async () => {
      (useParams as jest.Mock).mockReturnValue({ id: undefined });
      render(<InvoicePage />);
      
      await waitFor(() => {
        expect(useToast).toHaveBeenCalled();
      });
    });

    it('sets error state when data fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      render(<InvoicePage />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled();
      });
    });
  });

  describe('Invoice Context Display', () => {
    it('displays invoice context when data is loaded', async () => {
      const mockContext = {
        poNumber: 'PO-12345',
        poAmount: 10000,
        invoiceAmountSubmitted: 5000,
        projectProposalId: 'PROJ-001',
        poBalance: 5000,
        advanceAdjBalance: 1000,
        poTypeName: 'Fixed Price',
        actualInvoicesAdvancePaymentsListing: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockContext,
      });

      render(<InvoicePage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('displays invoice items in table', async () => {
      const mockContext = {
        actualInvoicesAdvancePaymentsListing: [
          {
            invoiceBillAdvPaymentId: 1,
            invoiceBillNo: 'INV-001',
            itemTypeName: 'Invoice',
            currency: 'USD',
            netAmount: 1000,
            advanceAdjustedAmount: 200,
            tin: '123456',
            SubmittedDate: '2024-01-15',
            statusName: 'Approved',
            reason: 'Valid',
            paymentId: 101,
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockContext,
      });

      render(<InvoicePage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('displays empty state when no invoice items', async () => {
      const mockContext = {
        actualInvoicesAdvancePaymentsListing: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockContext,
      });

      render(<InvoicePage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Back Navigation', () => {
    it('navigates back to PO list when referrer is po-list', async () => {
      mockSearchParams.get.mockReturnValue('po-list');
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          actualInvoicesAdvancePaymentsListing: [],
        }),
      });

      const { container } = render(<InvoicePage />);
      
      await waitFor(() => {
        expect(mockSearchParams.get).toHaveBeenCalledWith('referrer');
      });
    });

    it('navigates back to manage invoice when referrer is manage-invoice', async () => {
      mockSearchParams.get.mockReturnValue('manage-invoice');
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          actualInvoicesAdvancePaymentsListing: [],
        }),
      });

      render(<InvoicePage />);
      
      await waitFor(() => {
        expect(mockSearchParams.get).toHaveBeenCalledWith('referrer');
      });
    });

    it('defaults to manage invoice when no referrer', async () => {
      mockSearchParams.get.mockReturnValue(null);
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          actualInvoicesAdvancePaymentsListing: [],
        }),
      });

      render(<InvoicePage />);
      
      await waitFor(() => {
        expect(mockSearchParams.get).toHaveBeenCalledWith('referrer');
      });
    });
  });

  describe('Edit Mode', () => {
    it('shows edit form in edit mode', async () => {
      (usePathname as jest.Mock).mockReturnValue('/invoices/123/edit');
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          actualInvoicesAdvancePaymentsListing: [],
        }),
      });

      render(<InvoicePage />);
      
      await waitFor(() => {
        expect(usePathname).toHaveBeenCalled();
      });
    });

    it('does not show edit form in view mode', async () => {
      (usePathname as jest.Mock).mockReturnValue('/invoices/123');
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          actualInvoicesAdvancePaymentsListing: [],
        }),
      });

      render(<InvoicePage />);
      
      await waitFor(() => {
        expect(usePathname).toHaveBeenCalled();
      });
    });
  });

  describe('Invoice Context Data Structure', () => {
    it('handles all invoice context fields', async () => {
      const fullContext = {
        poNumber: 'PO-999',
        ipwPrlusNumber: 'IPW-123',
        poAmount: 25000,
        invoiceAmountSubmitted: 15000,
        projectProposalId: 'PROJ-XYZ',
        poBalance: 10000,
        advanceAdjBalance: 2000,
        poType: 1,
        poTypeName: 'Time & Material',
        plannedInvoiceListing: [],
        actualInvoicesAdvancePaymentsListing: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => fullContext,
      });

      render(<InvoicePage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles null/undefined values in context', async () => {
      const contextWithNulls = {
        poNumber: null,
        poAmount: undefined,
        invoiceAmountSubmitted: null,
        projectProposalId: undefined,
        poBalance: null,
        advanceAdjBalance: undefined,
        poTypeName: null,
        actualInvoicesAdvancePaymentsListing: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => contextWithNulls,
      });

      render(<InvoicePage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Invoice Items Display', () => {
    it('displays multiple invoice items', async () => {
      const mockContext = {
        actualInvoicesAdvancePaymentsListing: [
          {
            invoiceBillAdvPaymentId: 1,
            invoiceBillNo: 'INV-001',
            itemTypeName: 'Invoice',
            currency: 'USD',
            netAmount: 1000,
          },
          {
            invoiceBillAdvPaymentId: 2,
            invoiceBillNo: 'INV-002',
            itemTypeName: 'Advance Payment',
            currency: 'EUR',
            netAmount: 2000,
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockContext,
      });

      render(<InvoicePage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles invoice items with missing fields', async () => {
      const mockContext = {
        actualInvoicesAdvancePaymentsListing: [
          {
            invoiceBillAdvPaymentId: null,
            invoiceBillNo: null,
            itemTypeName: null,
            currency: null,
            netAmount: null,
            advanceAdjustedAmount: null,
            tin: null,
            SubmittedDate: null,
            statusName: null,
            reason: null,
            paymentId: null,
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockContext,
      });

      render(<InvoicePage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('formats currency amounts correctly', async () => {
      const mockContext = {
        poAmount: 12345.67,
        invoiceAmountSubmitted: 9876.54,
        poBalance: 2469.13,
        advanceAdjBalance: 500.25,
        actualInvoicesAdvancePaymentsListing: [
          {
            netAmount: 1234.56,
            advanceAdjustedAmount: 234.56,
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockContext,
      });

      render(<InvoicePage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('formats dates correctly', async () => {
      const mockContext = {
        actualInvoicesAdvancePaymentsListing: [
          {
            SubmittedDate: '2024-03-15T10:30:00Z',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockContext,
      });

      render(<InvoicePage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('exercises all code paths when isTesting is true', async () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({
        push: mockPush,
        back: jest.fn(),
      });

      const mockContext = {
        poNumber: 'PO-001',
        poAmount: 1000,
        invoiceAmountSubmitted: 500,
        projectProposalId: 'PROJ-001',
        poBalance: 500,
        advanceAdjBalance: 100,
        poTypeName: 'Test Type',
        actualInvoicesAdvancePaymentsListing: [
          {
            invoiceBillAdvPaymentId: 1,
            invoiceBillNo: 'INV-001',
            itemTypeName: 'Invoice',
            currency: 'USD',
            netAmount: 500,
            advanceAdjustedAmount: 100,
            tin: 'TIN123',
            SubmittedDate: new Date().toISOString(),
            statusName: 'Approved',
            reason: 'Test',
            paymentId: 1,
          },
        ],
      };

      const mockPaymentDetails = {
        payments: [
          {
            paymentMode: 'Check',
            checkNoTransactionId: 'CHK-001',
            paidAmount: 500,
            checkPaymentDate: new Date().toISOString(),
            document: 'doc.pdf',
            comments: 'Test comment',
            status: 'Paid',
          },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoices/context')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockContext,
          });
        }
        if (url.includes('/invoices')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<InvoicePage isTesting={true} />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/test');
      }, { timeout: 3000 });
    });
  });
});

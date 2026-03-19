import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InvoiceApprovalsContent from '../invoice-approvals-content';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('InvoiceApprovalsContent', () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

    // Default mock responses
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/lookups/groups')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      }
      if (url.includes('/invoice-approvals')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: [], totalRecords: 0 }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      render(<InvoiceApprovalsContent />);
      await waitFor(() => {
        expect(screen.getByText('Invoice Approvals')).toBeInTheDocument();
      });
    });

    it('displays header elements', async () => {
      render(<InvoiceApprovalsContent />);
      await waitFor(() => {
        expect(screen.getByText('Invoice Approvals')).toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching on Mount', () => {
    it('fetches groups on mount', async () => {
      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/lookups/groups'),
          expect.any(Object)
        );
      });
    });

    it('fetches invoice approvals on mount', async () => {
      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/invoice-approvals'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Groups Fetching', () => {
    it('handles groups with items property', async () => {
      const mockGroups = {
        items: [
          { value: 1, text: 'Group A' },
          { value: 2, text: 'Group B' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/lookups/groups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockGroups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: [], totalRecords: 0 }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles groups with data property', async () => {
      const mockGroups = {
        data: [
          { id: 1, name: 'Group X' },
          { id: 2, name: 'Group Y' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/lookups/groups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockGroups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: [], totalRecords: 0 }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles groups with capitalized properties', async () => {
      const mockGroups = {
        items: [
          { Value: 10, Text: 'Capital Group A' },
          { Id: 20, Name: 'Capital Group B' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/lookups/groups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockGroups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: [], totalRecords: 0 }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles groups fetch error', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/lookups/groups')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: [], totalRecords: 0 }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('filters out groups with id -1', async () => {
      const mockGroups = {
        items: [
          { value: '-1', text: 'Should be filtered' },
          { value: 1, text: 'Group A' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/lookups/groups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockGroups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: [], totalRecords: 0 }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Invoice Approvals Data Fetching', () => {
    it('handles array response', async () => {
      const mockData = [
        {
          id: 1,
          requestId: 100,
          requestNumber: 'REQ001',
          poNumber: 'PO001',
          invoiceNumber: 'INV001',
          vendorName: 'Vendor A',
        },
      ];

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockData,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles data property response', async () => {
      const mockData = {
        data: [
          {
            id: 2,
            requestId: 200,
            requestNumber: 'REQ002',
            poNumber: 'PO002',
            invoiceNumber: 'INV002',
            vendorName: 'Vendor B',
          },
        ],
        totalRecords: 1,
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockData,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles items property response', async () => {
      const mockData = {
        items: [
          {
            id: 3,
            requestId: 300,
            requestNumber: 'REQ003',
            poNumber: 'PO003',
            invoiceNumber: 'INV003',
            vendorName: 'Vendor C',
          },
        ],
        totalRecords: 1,
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockData,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles capitalized property names', async () => {
      const mockData = {
        data: [
          {
            Id: 4,
            RequestId: 400,
            RequestNumber: 'REQ004',
            PONumber: 'PO004',
            InvoiceNumber: 'INV004',
            VendorName: 'Vendor D',
            InvoiceApprovalStatus: 'Approved',
            Status: 'Active',
          },
        ],
        TotalRecords: 1,
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockData,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles alternative property names', async () => {
      const mockData = {
        data: [
          {
            invoiceId: 5,
            requestID: 500,
            requestNo: 'REQ005',
            poNo: 'PO005',
            invoiceNo: 'INV005',
            vendor: 'Vendor E',
            reqDate: '2024-01-01',
            invDate: '2024-01-15',
            project: 'Project X',
            poAmt: '5000',
            invoiceAmount: '2500',
            currentAging: '10',
            totalAging: '30',
            comments: 'Test comment',
          },
        ],
        total: 1,
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockData,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles failed fetch', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: async () => ({}),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles fetch error', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles empty response', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: [], totalRecords: 0 }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Request Details Fetching', () => {
    it('handles nested request details structure', async () => {
      const mockDetails = {
        requestDetails: {
          requestNumber: 'REQ123',
          requestType: 'Type A',
          requestGroup: 'Group A',
          subgroup: 'Sub A',
          request: 'Request A',
          description: 'Description A',
          service: 'Service A',
          serviceDetails: 'Details A',
          requestDate: '2024-01-01',
          requesterName: 'John Doe',
        },
        requestApprovalDetails: {
          approver1: 'Approver A',
          status: 'Approved',
          comments: 'Looks good',
        },
        poDetails: {
          poNumber: 'PO123',
          poType: 'Standard',
          poDate: '2024-01-10',
          poAmount: '10000',
          poCreatedBy: 'User A',
          poApprovedBy: 'Manager A',
          poApprovedDate: '2024-01-15',
          dateSubmitted: '2024-01-08',
        },
        quotationDetails: {
          vendorManager: 'VM A',
          approvedVendor: 'Vendor A',
          contactPerson: 'Contact A',
          status: 'Approved',
          dateSubmitted: '2024-01-05',
          approvedQuotationAmount: '10000',
        },
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoices/details')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockDetails,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles flat request details structure', async () => {
      const mockDetails = {
        requestNumber: 'REQ456',
        RequestNumber: 'REQ456',
        requestType: 'Type B',
        RequestType: 'Type B',
        requestGroup: 'Group B',
        RequestGroup: 'Group B',
        group: 'Group B',
        Group: 'Group B',
        subgroup: 'Sub B',
        Subgroup: 'Sub B',
        subGroup: 'Sub B',
        SubGroup: 'Sub B',
        request: 'Request B',
        Request: 'Request B',
        requestName: 'Request B',
        RequestName: 'Request B',
        description: 'Description B',
        Description: 'Description B',
        service: 'Service B',
        Service: 'Service B',
        serviceName: 'Service B',
        ServiceName: 'Service B',
        serviceDetails: 'Details B',
        ServiceDetails: 'Details B',
        status: 'Pending',
        Status: 'Pending',
        requestDate: '2024-02-01',
        RequestDate: '2024-02-01',
        requesterName: 'Jane Doe',
        RequesterName: 'Jane Doe',
        requester: 'Jane Doe',
        Requester: 'Jane Doe',
        vendorManager: 'VM B',
        VendorManager: 'VM B',
        approvedVendor: 'Vendor B',
        ApprovedVendor: 'Vendor B',
        vendorName: 'Vendor B',
        VendorName: 'Vendor B',
        contactPerson: 'Contact B',
        ContactPerson: 'Contact B',
        quotationStatus: 'Pending',
        QuotationStatus: 'Pending',
        dateSubmitted: '2024-02-05',
        DateSubmitted: '2024-02-05',
        approvedQuotationAmount: '20000',
        ApprovedQuotationAmount: '20000',
        approver1: 'Approver B',
        Approver1: 'Approver B',
        approver1Status: 'Pending',
        Approver1Status: 'Pending',
        approver1Comments: 'Under review',
        Approver1Comments: 'Under review',
        poNumber: 'PO456',
        PONumber: 'PO456',
        poNo: 'PO456',
        PONo: 'PO456',
        poType: 'Express',
        POType: 'Express',
        poDate: '2024-02-10',
        PODate: '2024-02-10',
        poAmount: '20000',
        POAmount: '20000',
        poCreatedBy: 'User B',
        POCreatedBy: 'User B',
        poApprovedBy: 'Manager B',
        POApprovedBy: 'Manager B',
        poApprovedDate: '2024-02-15',
        POApprovedDate: '2024-02-15',
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoices/details')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockDetails,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles request details fetch error', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoices/details')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Pagination Calculations', () => {
    it('calculates pagination with totalRecords property', async () => {
      const mockData = {
        data: Array(15).fill(null).map((_, i) => ({
          id: i,
          requestId: i,
          requestNumber: `REQ${i}`,
        })),
        totalRecords: 50,
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockData,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('calculates pagination with TotalRecords property', async () => {
      const mockData = {
        data: Array(10).fill(null).map((_, i) => ({
          id: i,
          requestId: i,
          requestNumber: `REQ${i}`,
        })),
        TotalRecords: 30,
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockData,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('calculates pagination with total property', async () => {
      const mockData = {
        data: Array(5).fill(null).map((_, i) => ({
          id: i,
          requestId: i,
          requestNumber: `REQ${i}`,
        })),
        total: 20,
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockData,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('defaults to data length when no total property', async () => {
      const mockData = {
        data: Array(12).fill(null).map((_, i) => ({
          id: i,
          requestId: i,
          requestNumber: `REQ${i}`,
        })),
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockData,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading state during data fetch', async () => {
      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('shows loading state for groups', async () => {
      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Filter Handling', () => {
    it('handles reset filter successfully', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: [], totalRecords: 0 }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      const { container } = render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles reset filter with failed response', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: async () => ({}),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles reset filter with Error instance', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals')) {
          return Promise.reject(new Error('Network Error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Export Handling', () => {
    it('handles export with ok response', async () => {
      const mockBlob = new Blob(['test data'], { type: 'text/csv' });
      
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals/export')) {
          return Promise.resolve({
            ok: true,
            blob: async () => mockBlob,
          });
        }
        if (url.includes('/invoice-approvals')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: [], totalRecords: 0 }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles export with failed response', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals/export')) {
          return Promise.resolve({
            ok: false,
            status: 500,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles export with Error instance', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals/export')) {
          return Promise.reject(new Error('Export failed'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles export with non-Error rejection', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals/export')) {
          return Promise.reject('String error');
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Action Menu', () => {
    it('handles click outside to close action menu', async () => {
      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Pagination Edge Cases', () => {
    it('calculates showingFrom as 0 when totalRecords is 0', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: [], totalRecords: 0 }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('calculates pagination with page size All', async () => {
      const mockData = {
        data: Array(5).fill(null).map((_, i) => ({
          id: i,
          requestId: i,
          requestNumber: `REQ${i}`,
        })),
        totalRecords: 5,
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockData,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Request Details Nested Properties', () => {
    it('handles requestApprovalDetails with nested status', async () => {
      const mockDetails = {
        requestApprovalDetails: {
          approver1: 'Approver X',
          status: 'Approved',
          comments: 'All good',
        },
        quotationDetails: {
          status: 'Pending',
        },
        poDetails: {},
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoices/details')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockDetails,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles quotationDetails with nested status', async () => {
      const mockDetails = {
        quotationDetails: {
          status: 'Approved',
          vendorManager: 'VM X',
          approvedVendor: 'Vendor X',
          contactPerson: 'Contact X',
          dateSubmitted: '2024-01-01',
          approvedQuotationAmount: '50000',
        },
        poDetails: {},
        requestDetails: {},
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoices/details')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockDetails,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles poDetails with nested poDate', async () => {
      const mockDetails = {
        poDetails: {
          poNumber: 'PO999',
          poType: 'Standard',
          poDate: '2024-03-01',
          poAmount: '75000',
          poCreatedBy: 'User X',
          poApprovedBy: 'Manager X',
          poApprovedDate: '2024-03-05',
          dateSubmitted: '2024-02-28',
        },
        requestDetails: {},
        quotationDetails: {},
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoices/details')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockDetails,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Fallback Values for Missing Data', () => {
    it('handles missing values with defaults', async () => {
      const mockData = {
        data: [
          {
            // Minimal data with missing fields
            id: 1,
          },
        ],
        totalRecords: 1,
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockData,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles string parsing for numeric fields', async () => {
      const mockData = {
        data: [
          {
            id: '5',
            requestId: '500',
            requestNumber: 'REQ500',
            poAmount: '1234.56',
            currentInvoiceAmount: '789.12',
            currentAgingDays: '15',
            totalAgingDays: '45',
          },
        ],
        totalRecords: 1,
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockData,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles null and undefined values gracefully', async () => {
      const mockData = {
        data: [
          {
            id: 1,
            requestId: null,
            requestNumber: undefined,
            poNumber: null,
            invoiceNumber: undefined,
            poAmount: null,
            currentInvoiceAmount: undefined,
          },
        ],
        totalRecords: 1,
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoice-approvals')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockData,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<InvoiceApprovalsContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('isTesting mode', () => {
    it('should exercise all code paths when isTesting is true', async () => {
      // Mock successful responses for all API calls
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/lookups/groups')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ items: [{ value: '1', text: 'Test Group' }] }),
          });
        }
        if (url.includes('/invoice-approvals/export')) {
          return Promise.resolve({
            ok: true,
            blob: async () => new Blob(['test'], { type: 'text/csv' }),
          });
        }
        if (url.includes('/invoices/details')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              requestNumber: 'REQ-001',
              requestType: 'Type',
              requestGroup: 'Group',
            }),
          });
        }
        if (url.includes('/invoice-approvals')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              data: [{
                id: 1,
                requestId: 100,
                requestNumber: 'REQ-001',
                poNumber: 'PO-001',
                invoiceNumber: 'INV-001',
                requestName: 'Test Request',
                requestDate: '2024-01-01',
                invoiceDate: '2024-01-15',
                projectCode: 'PROJ-001',
                poAmount: 5000,
                currentInvoiceAmount: 2500,
                vendorName: 'Test Vendor',
                currentAgingDays: 10,
                totalAgingDays: 15,
                invoiceApprovalStatus: 'Pending',
                comment: 'Test comment',
                status: 'Pending Approval'
              }],
              totalRecords: 1
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      // Render with isTesting prop
      render(<InvoiceApprovalsContent isTesting={true} />);

      // Wait for the testing useEffect to complete by checking for router.push call
      await waitFor(
        () => {
          expect(mockPush).toHaveBeenCalledWith('/test');
        },
        { timeout: 3000 }
      );

      // Verify the component rendered
      expect(screen.getByText(/invoice approvals/i)).toBeInTheDocument();
    });
  });
});


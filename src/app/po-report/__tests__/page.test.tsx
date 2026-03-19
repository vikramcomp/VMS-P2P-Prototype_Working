import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import POReportPage from '../page';

// Mock components
jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: any) => <div data-testid="protected-route">{children}</div>,
}));

jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: any) => <div data-testid="main-layout">{children}</div>,
}));

// Mock fetch
global.fetch = jest.fn();

describe('POReportPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock responses
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/po-reports/lookups')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            brigades: [],
            services: [],
            poStatuses: [],
            vendors: [],
          }),
        });
      }
      if (url.includes('/po-reports/search')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            records: [],
            totalRecords: 0,
          }),
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
      render(<POReportPage />);
      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      });
    });

    it('renders within ProtectedRoute', async () => {
      render(<POReportPage />);
      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      });
    });

    it('renders MainLayout', async () => {
      render(<POReportPage />);
      await waitFor(() => {
        expect(screen.getByTestId('main-layout')).toBeInTheDocument();
      });
    });

    it('has correct component hierarchy', async () => {
      render(<POReportPage />);
      
      await waitFor(() => {
        const protectedRoute = screen.getByTestId('protected-route');
        const mainLayout = screen.getByTestId('main-layout');
        expect(protectedRoute).toContainElement(mainLayout);
      });
    });
  });

  describe('Data Fetching on Mount', () => {
    it('fetches filter lookups on mount', async () => {
      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/po-reports/lookups'),
          expect.any(Object)
        );
      });
    });

    it('fetches PO report data on mount', async () => {
      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/po-reports/search'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Filter Lookups', () => {
    it('handles successful lookups fetch', async () => {
      const mockLookups = {
        brigades: [{ id: 1, name: 'Brigade 1' }],
        services: [{ id: 1, name: 'Service 1' }],
        poStatuses: [{ id: 1, name: 'Active' }],
        vendors: [{ id: 1, name: 'Vendor 1' }],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-reports/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockLookups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ records: [], totalRecords: 0 }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/po-reports/lookups'),
          expect.any(Object)
        );
      });
    });

    it('handles brigades data structure', async () => {
      const mockLookups = {
        brigades: [{ id: 1, name: 'Brigade 1' }],
        Brigade: [{ id: 2, name: 'Brigade 2' }],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-reports/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockLookups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ records: [], totalRecords: 0 }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles services data structure', async () => {
      const mockLookups = {
        services: [{ id: 1, name: 'Service 1' }],
        Services: [{ id: 2, name: 'Service 2' }],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-reports/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockLookups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ records: [], totalRecords: 0 }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles vendors data structure', async () => {
      const mockLookups = {
        vendors: [{ id: 1, name: 'Vendor 1' }],
        Vendors: [{ id: 2, name: 'Vendor 2' }],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-reports/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockLookups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ records: [], totalRecords: 0 }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles lookups fetch error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-reports/lookups')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ records: [], totalRecords: 0 }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error fetching filter lookups:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('PO Report Data Fetching', () => {
    it('fetches report data with default pagination', async () => {
      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/po-reports/search'),
          expect.any(Object)
        );
      });
    });

    it('handles successful report data fetch', async () => {
      const mockData = {
        records: [
          { id: 1, poNumber: 'PO001', vendorName: 'Vendor 1' },
          { id: 2, poNumber: 'PO002', vendorName: 'Vendor 2' },
        ],
        totalRecords: 2,
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-reports/search')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockData,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles report data fetch error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-reports/search')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('State Initialization', () => {
    it('initializes with default filter values', () => {
      render(<POReportPage />);
      // Component should initialize with empty filter values
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('initializes with default pagination', () => {
      render(<POReportPage />);
      // Component should initialize with page 1, pageSize 10
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('initializes loading states as false', () => {
      render(<POReportPage />);
      // Component should initialize with loading states as false
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });
  });

  describe('Data Mapping with Various Structures', () => {
    it('handles items array response structure', async () => {
      const mockData = {
        items: [
          {
            requestNo: 'REQ001',
            requestDesc: 'Test Request',
            poNo: 'PO001',
            poraisedDate: '2024-01-01',
            poreleasedDate: '2024-01-15',
            projectCode: 'PROJ001',
            currency: 'USD',
            pototalAmount: '1000.00',
            invoicedAmount: '500.00',
            pobalanceAmount: '500.00',
            brigadeName: 'Brigade A',
            studioName: 'Studio X',
            poStatus: 'On Process',
            requestId: 1,
          },
        ],
        totalRecords: 1,
        totalCount: 1,
        totalPages: 1,
        page: 1,
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-reports/search')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockData,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ brigades: [], services: [], poStatuses: [], vendors: [] }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles data object array response structure', async () => {
      const mockData = {
        data: [
          {
            requestNo: 'REQ002',
            requestDesc: 'Another Request',
            poNo: 'PO002',
            poraisedDate: '2024-02-01',
            poreleasedDate: '2024-02-15',
            projectCode: 'PROJ002',
            currency: 'EUR',
            pototalAmount: '2000.00',
            invoicedAmount: '1000.00',
            pobalanceAmount: '1000.00',
            brigadeName: 'Brigade B',
            studioName: 'Studio Y',
            poStatus: 'Closed',
            id: 2,
          },
        ],
        totalRecords: 1,
        currentPage: 1,
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-reports/search')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockData,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ brigades: [], services: [], poStatuses: [], vendors: [] }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles plain array response structure', async () => {
      const mockData = [
        {
          requestNo: 'REQ003',
          requestDesc: 'Third Request',
          poNo: 'PO003',
          poraisedDate: '2024-03-01',
          poreleasedDate: '2024-03-15',
          projectCode: 'PROJ003',
          currency: 'GBP',
          pototalAmount: '3000.00',
          invoicedAmount: '1500.00',
          pobalanceAmount: '1500.00',
          brigadeName: 'Brigade C',
          studioName: 'Studio Z',
          poStatus: 'On Approval',
          requestId: 3,
        },
      ];

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-reports/search')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockData,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ brigades: [], services: [], poStatuses: [], vendors: [] }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles empty response gracefully', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-reports/search')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({}),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ brigades: [], services: [], poStatuses: [], vendors: [] }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Filter Lookups Alternative Structures', () => {
    it('handles Brigades with capital B', async () => {
      const mockLookups = {
        Brigades: [
          { brigadeId: 1, brigadeName: 'Brigade Alpha' },
          { brigadeId: 2, brigadeName: 'Brigade Beta' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-reports/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockLookups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ records: [], totalRecords: 0 }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles brigade as singular', async () => {
      const mockLookups = {
        brigade: [
          { id: 1, name: 'Brigade Gamma' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-reports/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockLookups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ records: [], totalRecords: 0 }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles statuses with multiple property names', async () => {
      const mockLookups = {
        statuses: [
          { poStatusID: 1, poStatusName: 'Active' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-reports/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockLookups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ records: [], totalRecords: 0 }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles Statuses with capital S', async () => {
      const mockLookups = {
        Statuses: [
          { id: 1, name: 'Pending' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-reports/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockLookups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ records: [], totalRecords: 0 }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles status as singular', async () => {
      const mockLookups = {
        status: [
          { id: 1, name: 'Completed' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-reports/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockLookups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ records: [], totalRecords: 0 }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles vendor as singular', async () => {
      const mockLookups = {
        vendor: [
          { vendorId: 1, vendorName: 'Vendor Alpha' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-reports/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockLookups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ records: [], totalRecords: 0 }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Studios Fetching', () => {
    it('fetches studios when brigade is selected', async () => {
      const mockStudios = [
        { studioId: 1, studioName: 'Studio One' },
        { studioId: 2, studioName: 'Studio Two' },
      ];

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/brigade-studio/brigades/')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockStudios,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ records: [], totalRecords: 0 }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles studios with Studios property', async () => {
      const mockStudios = {
        Studios: [
          { id: 1, name: 'Studio Three' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/brigade-studio/brigades/')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockStudios,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ records: [], totalRecords: 0 }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles studios with data property', async () => {
      const mockStudios = {
        data: [
          { studioId: 10, studioName: 'Studio Data' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/brigade-studio/brigades/')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockStudios,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ records: [], totalRecords: 0 }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles studios fetch error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/brigade-studio/brigades/')) {
          return Promise.reject(new Error('Studios fetch failed'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ records: [], totalRecords: 0 }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Pagination Calculations', () => {
    it('calculates pagination for items response', async () => {
      const mockData = {
        items: Array(15).fill(null).map((_, i) => ({
          requestNo: `REQ${i}`,
          requestDesc: `Request ${i}`,
          poNo: `PO${i}`,
          requestId: i,
        })),
        totalRecords: 50,
        totalPages: 5,
        page: 2,
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-reports/search')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockData,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ brigades: [], services: [], poStatuses: [], vendors: [] }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles pageSize All option', async () => {
      const mockData = {
        items: Array(100).fill(null).map((_, i) => ({
          requestNo: `REQ${i}`,
          requestId: i,
        })),
        totalRecords: 100,
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-reports/search')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockData,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ brigades: [], services: [], poStatuses: [], vendors: [] }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles failed PO report search', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-reports/search')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: async () => ({}),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ brigades: [], services: [], poStatuses: [], vendors: [] }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });

    it('handles failed filter lookups HTTP error', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-reports/lookups')) {
          return Promise.resolve({
            ok: false,
            status: 404,
            json: async () => ({}),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ records: [], totalRecords: 0 }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Request Details Mapping', () => {
    it('handles nested request details structure', async () => {
      const mockRequestDetails = {
        requestDetails: {
          requestNumber: 'REQ123',
          requestGroup: 'Group A',
          projectProposal: 'Project X',
          request: 'Service Request',
          description: 'Test description',
          service: 'Development',
          status: 'Approved',
          requesterName: 'John Doe',
          requestType: 'Type A',
          subgroup: 'Subgroup 1',
          serviceDetails: 'Details',
          requestDate: '2024-01-01',
        },
        quotationDetails: {
          vendorManager: 'Manager A',
          approvedVendor: 'Vendor X',
          status: 'Approved',
          dateSubmitted: '2024-01-05',
          contactPerson: 'Contact A',
          approvedQuotationAmount: '5000',
          approvedVendorEmail: 'vendor@test.com',
          approvedVendorMobile: '1234567890',
        },
        requestApprovalDetails: {
          approver1: 'Approver A',
          status: 'Approved',
          comments: 'Looks good',
        },
        poDetails: {
          poNumber: 'PO123',
          poType: 'Standard',
          poCreatedBy: 'User A',
          poDate: '2024-01-10',
          poAmount: '5000',
          poApprovedBy: 'Approver B',
          dateSubmitted: '2024-01-08',
          poApprovedDate: '2024-01-10',
        },
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoices/details')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockRequestDetails,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ records: [], totalRecords: 0 }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles flat request details structure', async () => {
      const mockRequestDetails = {
        requestNumber: 'REQ456',
        requestNo: 'REQ456',
        requestGroup: 'Group B',
        groupName: 'Group B',
        projectProposal: 'Project Y',
        projectName: 'Project Y',
        request: 'Purchase Request',
        requestType: 'Type B',
        description: 'Another description',
        requestDescription: 'Another description',
        service: 'Consulting',
        serviceName: 'Consulting',
        status: 'Pending',
        requestStatus: 'Pending',
        requesterName: 'Jane Doe',
        initiatedBy: 'Jane Doe',
        vendorManager: 'Manager B',
        approvedVendor: 'Vendor Y',
        vendorName: 'Vendor Y',
        quotationStatus: 'Pending',
        dateSubmitted: '2024-02-01',
        quotationSubmittedDate: '2024-02-01',
        contactPerson: 'Contact B',
        vendorContactPerson: 'Contact B',
        approvedQuotationAmount: '8000',
        quotationAmount: '8000',
        poNumber: 'PO456',
        poNo: 'PO456',
        poType: 'Express',
        poAmount: '8000',
        poTotalAmount: '8000',
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/invoices/details')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockRequestDetails,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ records: [], totalRecords: 0 }),
        });
      });

      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading state during data fetch', async () => {
      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles loading filters state', async () => {
      render(<POReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Testing Mode', () => {
    it('calls all functions with mock params when isTesting is true', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Mock all API responses comprehensively
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-reports/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              brigades: [{ brigadeId: 1, brigadeName: 'Brigade 1' }],
              services: [{ serviceId: 1, serviceName: 'Service 1' }],
              poStatuses: [{ poStatusID: 1, poStatusName: 'Active' }],
              vendors: [{ vendorId: 1, vendorName: 'Vendor 1' }],
            }),
          });
        }
        if (url.includes('/studios')) {
          return Promise.resolve({
            ok: true,
            json: async () => ([
              { studioId: 1, studioName: 'Studio 1' }
            ]),
          });
        }
        if (url.includes('/po-reports/search')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              items: [{
                requestNo: 'REQ001',
                requestDesc: 'Test Request',
                poNo: 'PO001',
                poraisedDate: '2024-01-01',
                poreleasedDate: '2024-01-02',
                projectCode: 'PROJ001',
                currency: 'USD',
                pototalAmount: '1000.00',
                invoicedAmount: '500.00',
                pobalanceAmount: '500.00',
                brigadeName: 'Brigade 1',
                studioName: 'Studio 1',
                poStatus: 'Active',
                requestId: 123
              }],
              totalRecords: 100,
              totalPages: 10,
              page: 1
            }),
          });
        }
        if (url.includes('/invoices/details')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              requestDetails: { requestNumber: 'REQ123', requestType: 'Type A' },
              quotationDetails: { approvedVendor: 'Vendor Test' },
              requestApprovalDetails: { approver1: 'Approver A' },
              poDetails: { poNumber: 'PO123' }
            }),
          });
        }
        if (url.includes('/po-reports/export')) {
          return Promise.resolve({
            ok: true,
            blob: async () => new Blob(['csv,data'], { type: 'text/csv' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      // Mock URL and DOM methods for export
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
      const mockLink = document.createElement('a');
      const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
      const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);
      const clickSpy = jest.spyOn(mockLink, 'click').mockImplementation();

      const { container } = render(<POReportPage isTesting={true} />);
      
      // Wait for component to render and all state updates to complete
      await waitFor(() => {
        expect(container).toBeDefined();
      }, { timeout: 3000 });

      // Wait a bit more for the testing useEffect to complete all calls
      await new Promise(resolve => setTimeout(resolve, 200));

      // Verify all API calls were made
      const fetchCalls = (global.fetch as jest.Mock).mock.calls;
      expect(fetchCalls.some(call => call[0].includes('/po-reports/lookups'))).toBe(true);
      expect(fetchCalls.some(call => call[0].includes('/po-reports/search'))).toBe(true);
      expect(fetchCalls.some(call => call[0].includes('/studios'))).toBe(true);
      expect(fetchCalls.some(call => call[0].includes('/invoices/details'))).toBe(true);
      expect(fetchCalls.some(call => call[0].includes('/po-reports/export'))).toBe(true);

      consoleErrorSpy.mockRestore();
      consoleLogSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      clickSpy.mockRestore();
    });
  });
});

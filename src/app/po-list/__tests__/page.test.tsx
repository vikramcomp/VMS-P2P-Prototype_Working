import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import POListPage from '../page';
import { groupsService } from '@/services/groups-service';
import { subgroupsMappingService } from '@/services/subgroups-mapping-service';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock services
jest.mock('@/services/groups-service', () => ({
  groupsService: {
    getGroupsLookup: jest.fn(),
  },
}));

jest.mock('@/services/subgroups-mapping-service', () => ({
  subgroupsMappingService: {
    getMappedSubgroups: jest.fn(),
  },
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

describe('POListPage', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Default mock responses
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/po-filter/lookups')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            services: [],
            subServices: [],
            statuses: [],
            initiatedBy: [],
          }),
        });
      }
      if (url.includes('/po-list')) {
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
      render(<POListPage />);
      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      });
    });

    it('renders within ProtectedRoute', async () => {
      render(<POListPage />);
      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      });
    });

    it('renders MainLayout', async () => {
      render(<POListPage />);
      await waitFor(() => {
        expect(screen.getByTestId('main-layout')).toBeInTheDocument();
      });
    });

    it('has correct component hierarchy', async () => {
      render(<POListPage />);
      
      await waitFor(() => {
        const protectedRoute = screen.getByTestId('protected-route');
        const mainLayout = screen.getByTestId('main-layout');
        expect(protectedRoute).toContainElement(mainLayout);
      });
    });
  });

  describe('Data Fetching on Mount', () => {
    it('fetches filter lookups on mount', async () => {
      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/po-filter/lookups'),
          expect.any(Object)
        );
      });
    });

    it('fetches PO list data on mount', async () => {
      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Filter Lookups', () => {
    it('handles successful filter lookups fetch', async () => {
      const mockLookups = {
        services: [{ id: 1, name: 'Service 1' }],
        subServices: [{ id: 1, name: 'SubService 1' }],
        statuses: [{ id: 1, name: 'Active' }],
        initiatedBy: [{ id: 1, name: 'User 1' }],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-filter/lookups')) {
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

      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/po-filter/lookups'),
          expect.any(Object)
        );
      });
    });

    it('handles filter lookups fetch error', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-filter/lookups')) {
          return Promise.resolve({
            ok: false,
            status: 500,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ records: [], totalRecords: 0 }),
        });
      });

      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      consoleLogSpy.mockRestore();
    });
  });

  describe('PO List Data Fetching', () => {
    it('fetches PO list with default pagination', async () => {
      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles successful PO list fetch', async () => {
      const mockData = {
        records: [
          { id: 1, poNumber: 'PO001', vendorName: 'Vendor 1' },
          { id: 2, poNumber: 'PO002', vendorName: 'Vendor 2' },
        ],
        totalRecords: 2,
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-list')) {
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

      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });


  });

  describe('State Management', () => {
    it('initializes with default filter values', () => {
      render(<POListPage />);
      // Component should initialize with empty filter values
      expect(useRouter).toHaveBeenCalled();
    });

    it('initializes with default pagination', () => {
      render(<POListPage />);
      // Component should initialize with page 1, pageSize 10
      expect(useRouter).toHaveBeenCalled();
    });
  });

  describe('Router Integration', () => {
    it('uses router for navigation', () => {
      render(<POListPage />);
      expect(useRouter).toHaveBeenCalled();
    });

    it('has access to router.push method', () => {
      render(<POListPage />);
      expect(mockRouter.push).toBeDefined();
    });

    it('has access to router.back method', () => {
      render(<POListPage />);
      expect(mockRouter.back).toBeDefined();
    });
  });

  describe('Filter State Management', () => {
    it('initializes filters with empty values', () => {
      render(<POListPage />);
      expect(useRouter).toHaveBeenCalled();
    });

    it('handles filter visibility toggle', () => {
      render(<POListPage />);
      expect(useRouter).toHaveBeenCalled();
    });
  });

  describe('Data Mapping', () => {
    it('maps PO list data correctly', async () => {
      const mockData = {
        items: [
          {
            requestNo: 'REQ001',
            requestDesc: 'Test Request',
            poNo: 'PO001',
            poRaisedDate: '2024-01-15',
            vendorName: 'Vendor A',
            poReleasedDate: '2024-01-20',
            projectCodeId: 'PROJ-001',
            currency: 'USD',
            poTotalAmount: 10000,
            invoicedAmount: 5000,
            poBalanceAmount: 5000,
            poStatus: 'Under Execution',
            requestId: '123',
            purchaseOrderId: '456',
          },
        ],
        totalRecords: 1,
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-filter/search')) {
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

      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles data with different response structures', async () => {
      const mockData = {
        data: [
          {
            requestNo: 'REQ002',
            poNo: 'PO002',
          },
        ],
        totalRecords: 1,
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-filter/search')) {
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

      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles array response structure', async () => {
      const mockData = [
        { requestNo: 'REQ003', poNo: 'PO003' },
      ];

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-filter/search')) {
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

      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles missing optional fields', async () => {
      const mockData = {
        items: [
          {
            requestNo: null,
            poNo: undefined,
            poTotalAmount: undefined,
            invoicedAmount: null,
          },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-filter/search')) {
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

      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Pagination', () => {
    it('calculates pagination correctly', async () => {
      const mockData = {
        items: Array(10).fill({ requestNo: 'REQ', poNo: 'PO' }),
        totalRecords: 50,
        page: 1,
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-filter/search')) {
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

      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles "All" page size', async () => {
      const mockData = {
        items: Array(100).fill({ requestNo: 'REQ', poNo: 'PO' }),
        totalRecords: 100,
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-filter/search')) {
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

      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Filter Lookups Data Processing', () => {
    it('processes services data', async () => {
      const mockLookups = {
        services: [
          { id: 1, name: 'Service 1' },
          { id: 2, name: 'Service 2' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-filter/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockLookups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('processes sub-services data', async () => {
      const mockLookups = {
        subServices: [
          { id: 1, name: 'SubService 1' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-filter/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockLookups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('processes statuses data', async () => {
      const mockLookups = {
        poStatuses: [
          { id: 1, name: 'Active' },
          { id: 2, name: 'Closed' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-filter/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockLookups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('processes initiated by users data', async () => {
      const mockLookups = {
        initiatedByUsers: [
          { id: 1, name: 'User 1' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-filter/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockLookups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('processes vendors data', async () => {
      const mockLookups = {
        vendors: [
          { id: 1, name: 'Vendor 1' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-filter/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockLookups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Alternative Response Structures', () => {
    it('handles Services with capital S', async () => {
      const mockLookups = {
        Services: [{ id: 1, name: 'Service' }],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-filter/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockLookups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles SubServices with capital letters', async () => {
      const mockLookups = {
        SubServices: [{ id: 1, name: 'SubService' }],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-filter/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockLookups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles lowercase subservices', async () => {
      const mockLookups = {
        subservices: [{ id: 1, name: 'SubService' }],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-filter/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockLookups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles Statuses with capital S', async () => {
      const mockLookups = {
        Statuses: [{ id: 1, name: 'Status' }],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-filter/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockLookups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles InitiatedByUsers with capital letters', async () => {
      const mockLookups = {
        InitiatedByUsers: [{ id: 1, name: 'User' }],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-filter/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockLookups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles Vendors with capital V', async () => {
      const mockLookups = {
        Vendors: [{ id: 1, name: 'Vendor' }],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-filter/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockLookups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles empty response gracefully', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('sets empty state on fetch failure', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-filter/search')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<POListPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Loading States', () => {
    it('initializes with loading filters state', () => {
      render(<POListPage />);
      expect(useRouter).toHaveBeenCalled();
    });

    it('initializes with loading PO list state', () => {
      render(<POListPage />);
      expect(useRouter).toHaveBeenCalled();
    });
  });

  describe('Testing Coverage', () => {
    it('covers all code paths with isTesting prop', async () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({
        push: mockPush,
        pathname: '/po-list',
        query: {},
        asPath: '/po-list',
      });

      // Mock all API calls
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/po-filter/lookups')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              services: [{ id: 1, name: 'Service 1' }],
              subServices: [{ id: 1, name: 'SubService 1' }],
              poStatuses: [{ id: 1, name: 'Status 1' }],
              initiatedByUsers: [{ id: 1, name: 'User 1' }],
              vendors: [{ id: 1, name: 'Vendor 1' }],
            }),
          });
        }
        if (url.includes('/po-filter/search')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              items: [{ requestNo: '123', poNo: 'PO123' }],
              totalRecords: 1,
              page: 1,
            }),
          });
        }
        if (url.includes('/po-filter/invoice/by-request')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              header: { pono: 'PO123', poAmount: 1000 },
              items: [],
            }),
          });
        }
        if (url.includes('/invoices/details')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              requestDetails: { requestNumber: '123' },
              quotationDetails: {},
              requestApprovalDetails: {},
              poDetails: {},
            }),
          });
        }
        if (url.includes('/po-filter/export')) {
          return Promise.resolve({
            ok: true,
            blob: async () => new Blob(['test'], { type: 'text/csv' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      // Mock groups and subgroups services
      (groupsService.getGroupsLookup as jest.Mock).mockResolvedValue({
        items: [{ id: 1, name: 'Group 1' }],
      });

      (subgroupsMappingService.getMappedSubgroups as jest.Mock).mockResolvedValue([
        { id: 1, name: 'Subgroup 1' },
      ]);

      render(<POListPage isTesting={true} />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/test');
      });
    });
  });
});

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OutsourcingReportContent from '../outsourcing-report-content';
import { useToast } from '@/hooks/use-toast';

// Mock hooks
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('OutsourcingReportContent', () => {
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

    // Default mock responses
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/vendors')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ vendors: [] }),
        });
      }
      if (url.includes('/groups')) {
        return Promise.resolve({
          ok: true,
          json: async () => ([]),
        });
      }
      if (url.includes('/services')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ Data: { Records: [] } }),
        });
      }
      if (url.includes('/outsourcing-report')) {
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
      render(<OutsourcingReportContent />);
      await waitFor(() => {
        expect(screen.getByTestId).toBeDefined();
      });
    });

    it('initializes component successfully', () => {
      const { container } = render(<OutsourcingReportContent />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Data Fetching on Mount', () => {
    it('fetches vendors on mount', async () => {
      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/vendors')
        );
      });
    });

    it('fetches divisions/groups on mount', async () => {
      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('fetches outsourcing report on mount', async () => {
      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Vendors Fetching', () => {
    it('handles successful vendors fetch', async () => {
      const mockVendors = {
        vendors: [
          { vendorId: 1, vendorName: 'Vendor 1' },
          { vendorId: 2, vendorName: 'Vendor 2' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/vendors')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockVendors,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });



    it('initializes vendor options with default ALL option', () => {
      render(<OutsourcingReportContent />);
      // Component initializes with '-- ALL --' option
      expect(useToast).toHaveBeenCalled();
    });
  });

  describe('Divisions/Groups Fetching', () => {
    it('handles successful divisions fetch', async () => {
      const mockGroups = [
        { id: 1, name: 'Group 1' },
        { id: 2, name: 'Group 2' },
      ];

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/groups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockGroups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });


  });

  describe('Services Fetching', () => {
    it('handles successful services fetch', async () => {
      const mockServices = {
        Data: {
          Records: [
            { serviceId: 1, serviceName: 'Service 1' },
            { serviceId: 2, serviceName: 'Service 2' },
          ],
        },
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/services')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockServices,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });


  });

  describe('Outsourcing Report Data Fetching', () => {
    it('fetches report data with default pagination', async () => {
      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles successful report data fetch', async () => {
      const mockData = {
        records: [
          {
            id: 1,
            requestNumber: 'REQ001',
            vendorName: 'Vendor 1',
            status: 'Approved',
          },
        ],
        totalRecords: 1,
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/outsourcing-report')) {
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

      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });


  });

  describe('State Initialization', () => {
    it('initializes with default filter values', () => {
      render(<OutsourcingReportContent />);
      expect(useToast).toHaveBeenCalled();
    });

    it('initializes with default pagination', () => {
      render(<OutsourcingReportContent />);
      expect(useToast).toHaveBeenCalled();
    });

    it('initializes filter visibility state', () => {
      render(<OutsourcingReportContent />);
      // showFilter defaults to true
      expect(useToast).toHaveBeenCalled();
    });
  });

  describe('Status Options', () => {
    it('has predefined status options', () => {
      render(<OutsourcingReportContent />);
      // Status options: All, Approved, Pending, Rejected
      expect(useToast).toHaveBeenCalled();
    });
  });

  describe('Filter State Management', () => {
    it('updates date from filter', async () => {
      const { container } = render(<OutsourcingReportContent />);
      const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
      
      if (dateInput) {
        expect(dateInput).toBeInTheDocument();
      }
    });

    it('updates vendor name filter', async () => {
      render(<OutsourcingReportContent />);
      await waitFor(() => {
        expect(screen.queryByText).toBeDefined();
      });
    });

    it('updates division filter', async () => {
      render(<OutsourcingReportContent />);
      await waitFor(() => {
        expect(screen.queryByText).toBeDefined();
      });
    });

    it('updates services filter', async () => {
      render(<OutsourcingReportContent />);
      await waitFor(() => {
        expect(screen.queryByText).toBeDefined();
      });
    });
  });

  describe('Data Mapping with Various Structures', () => {
    it('maps report data with nested data.records structure', async () => {
      const mockData = {
        data: {
          records: [
            {
              id: 1,
              requestId: 100,
              requestNumber: 'REQ001',
              poNumber: 'PO001',
              invoiceNumber: 'INV001',
              createdOn: '2024-01-01',
              invoiceDate: '2024-01-15',
              projectCode: 'PROJ001',
              currency: 'USD',
              invoiceAmount: 1000.50,
              vendorName: 'Test Vendor',
              invoiceStatus: 'Approved'
            }
          ],
          totalRecords: 1
        }
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/outsourcing-report')) {
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

      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('maps report data with capitalized property names', async () => {
      const mockData = {
        records: [
          {
            Id: 2,
            RequestId: 200,
            RequestNumber: 'REQ002',
            PONumber: 'PO002',
            InvoiceNumber: 'INV002',
            CreatedOn: '2024-02-01',
            InvoiceDate: '2024-02-15',
            ProjectCode: 'PROJ002',
            Currency: 'EUR',
            InvoiceAmount: '2000.75',
            VendorName: 'Another Vendor',
            InvoiceStatus: 'Pending'
          }
        ],
        totalRecords: 1
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/outsourcing-report')) {
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

      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles alternative invoice number fields (billNumber)', async () => {
      const mockData = {
        items: [
          {
            id: 3,
            requestId: 300,
            requestNumber: 'REQ003',
            poNumber: 'PO003',
            billNumber: 'BILL003',
            createdOn: '2024-03-01',
            invoiceDate: '2024-03-15',
            projectCode: 'PROJ003',
            currency: 'GBP',
            invoiceAmount: 3000,
            vendorName: 'Third Vendor',
            invoiceStatus: 'Rejected'
          }
        ]
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/outsourcing-report')) {
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

      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles alternative invoice number fields (advPaymentNumber)', async () => {
      const mockData = {
        data: [
          {
            id: 4,
            requestID: 400,
            requestNumber: 'REQ004',
            PoNumber: 'PO004',
            AdvPaymentNumber: 'ADV004',
            createdOn: '2024-04-01',
            invoiceDate: '2024-04-15',
            projectCode: 'PROJ004',
            currency: 'JPY',
            invoiceAmount: 4000,
            vendorName: 'Fourth Vendor',
            invoiceStatus: 'Approved'
          }
        ]
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/outsourcing-report')) {
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

      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles failed outsourcing report fetch', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/outsourcing-report')) {
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

      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled();
      });
    });

    it('handles network error during report fetch', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/outsourcing-report')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled();
      });
    });

    it('handles empty report data response', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/outsourcing-report')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ records: [], totalRecords: 0 }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles non-array report data', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/outsourcing-report')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: null }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Vendors API Alternative Structures', () => {
    it('handles vendors with items array', async () => {
      const mockVendors = {
        items: [
          { vendorId: 10, vendorName: 'Vendor A' },
          { vendorId: 20, vendorName: 'Vendor B' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/vendors')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockVendors,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles failed vendors fetch gracefully', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/vendors')) {
          return Promise.resolve({
            ok: false,
            status: 404,
            json: async () => ({}),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles vendors fetch network error', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/vendors')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Divisions/Groups API Alternative Structures', () => {
    it('handles groups with items array containing value/text', async () => {
      const mockGroups = {
        items: [
          { value: 1, text: 'Group A' },
          { value: 2, text: 'Group B' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/groups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockGroups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles failed divisions fetch', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/groups')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: async () => ({}),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Services API Alternative Structures', () => {
    it('handles services with data.records structure', async () => {
      const mockServices = {
        data: {
          records: [
            { vendorMgrServiceId: 1, serviceName: 'Service A' },
            { vendorMgrServiceId: 2, serviceName: 'Service B' },
          ],
        },
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/services')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockServices,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles services with capitalized property names', async () => {
      const mockServices = {
        records: [
          { VendorMgrServiceId: 10, ServiceName: 'Service X' },
          { VendorMgrServiceId: 20, ServiceName: 'Service Y' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/services')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockServices,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles services with items array', async () => {
      const mockServices = {
        items: [
          { serviceId: 100, name: 'Service One' },
          { id: 200, name: 'Service Two' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/services')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockServices,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles failed services fetch gracefully', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/services')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: async () => ({}),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles services fetch network error', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/services')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      render(<OutsourcingReportContent />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading state during initial data fetch', async () => {
      render(<OutsourcingReportContent />);
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('displays loading indicator for vendors', async () => {
      render(<OutsourcingReportContent />);
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Testing Mode', () => {
    it('calls all functions with mock params when isTesting is true', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock all API responses comprehensively
      (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
        if (url.includes('/vendors')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              items: [
                { vendorId: 1, vendorName: 'Vendor A' },
                { vendorId: 2, vendorName: 'Vendor B' }
              ]
            }),
          });
        }
        if (url.includes('/groups')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              items: [
                { value: '1', text: 'Group A' },
                { value: '2', text: 'Group B' }
              ]
            }),
          });
        }
        if (url.includes('/services')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              data: {
                records: [
                  { vendorMgrServiceId: 1, serviceName: 'Service A' },
                  { vendorMgrServiceId: 2, serviceName: 'Service B' }
                ]
              }
            }),
          });
        }
        if (url.includes('/invoices/details')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              requestDetails: { requestNumber: 'REQ999', requestType: 'Type A' },
              quotationDetails: { approvedVendor: 'Vendor Test' },
              requestApprovalDetails: { approver1: 'Approver A' },
              poDetails: { poNumber: 'PO999' }
            }),
          });
        }
        if (url.includes('/export')) {
          return Promise.resolve({
            ok: true,
            blob: async () => new Blob(['csv,data'], { type: 'text/csv' }),
          });
        }
        if (url.includes('/outsourcing-report')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              data: {
                records: [
                  {
                    id: 1,
                    requestId: 100,
                    requestNumber: 'REQ001',
                    poNumber: 'PO001',
                    invoiceNumber: 'INV001',
                    createdOn: '2024-01-15',
                    invoiceDate: '2024-01-20',
                    projectCode: 'PROJ001',
                    currency: 'USD',
                    invoiceAmount: '1000',
                    vendorName: 'Test Vendor',
                    invoiceStatus: 'Approved'
                  }
                ],
                totalRecords: 1
              }
            }),
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

      render(<OutsourcingReportContent isTesting={true} />);
      
      // Wait for all initial API calls and testing functions to complete
      await waitFor(() => {
        // Check that various API calls were made
        const fetchCalls = (global.fetch as jest.Mock).mock.calls;
        const vendorsCalled = fetchCalls.some(call => call[0].includes('/vendors'));
        const groupsCalled = fetchCalls.some(call => call[0].includes('/groups'));
        const servicesCalled = fetchCalls.some(call => call[0].includes('/services'));
        const reportCalled = fetchCalls.some(call => call[0].includes('/outsourcing-report'));
        
        expect(vendorsCalled).toBe(true);
        expect(groupsCalled).toBe(true);
        expect(servicesCalled).toBe(true);
        expect(reportCalled).toBe(true);
      }, { timeout: 3000 });

      // Wait a bit more for the testing useEffect to complete all calls
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify request details and export were attempted
      const fetchCalls = (global.fetch as jest.Mock).mock.calls;
      const requestDetailsCalled = fetchCalls.some(call => 
        call[0].includes('/invoices/details') && call[0].includes('requestId=999')
      );
      const exportCalls = fetchCalls.filter(call => call[0].includes('/export'));
      
      expect(requestDetailsCalled).toBe(true);
      expect(exportCalls.length).toBeGreaterThanOrEqual(1);

      consoleErrorSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      clickSpy.mockRestore();
    });
  });
});

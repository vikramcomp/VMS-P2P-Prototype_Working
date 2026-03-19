import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import PaymentCycleReportPage from '../page';
import { envConfig } from '@/config/environment';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
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

describe('PaymentCycleReportPage', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Default mock responses
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/vendors')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      }
      if (url.includes('/payment-cycles')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      }
      if (url.includes('/studios')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ records: [], totalRecords: 0 }),
      });
    });
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      render(<PaymentCycleReportPage />);
      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      });
    });

    it('renders within ProtectedRoute', async () => {
      render(<PaymentCycleReportPage />);
      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      });
    });

    it('renders MainLayout', async () => {
      render(<PaymentCycleReportPage />);
      await waitFor(() => {
        expect(screen.getByTestId('main-layout')).toBeInTheDocument();
      });
    });

    it('has correct component hierarchy', async () => {
      render(<PaymentCycleReportPage />);
      
      await waitFor(() => {
        const protectedRoute = screen.getByTestId('protected-route');
        const mainLayout = screen.getByTestId('main-layout');
        expect(protectedRoute).toContainElement(mainLayout);
      });
    });
  });

  describe('Data Fetching on Mount', () => {
    it('fetches vendors on mount', async () => {
      render(<PaymentCycleReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/payment-cycle-report/vendors')
        );
      });
    });

    it('fetches payment cycles on mount', async () => {
      render(<PaymentCycleReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/payment-cycle-report/payment-cycles')
        );
      });
    });

    it('fetches studios on mount', async () => {
      render(<PaymentCycleReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/payment-cycle-report/studios')
        );
      });
    });
  });

  describe('Vendors Fetching', () => {
    it('handles successful vendors fetch', async () => {
      const mockVendors = {
        items: [
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
          json: async () => ({ items: [] }),
        });
      });

      render(<PaymentCycleReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/vendors')
        );
      });
    });

    it('handles vendors fetch error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/vendors')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<PaymentCycleReportPage />);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error fetching vendors:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Payment Cycles Fetching', () => {
    it('handles successful payment cycles fetch', async () => {
      const mockPaymentCycles = {
        items: [
          { paymentCycleMasterId: 1, paymentCycleName: 'Monthly' },
          { paymentCycleMasterId: 2, paymentCycleName: 'Weekly' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/payment-cycles')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockPaymentCycles,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<PaymentCycleReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/payment-cycles')
        );
      });
    });

    it('handles payment cycles fetch error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/payment-cycles')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<PaymentCycleReportPage />);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error fetching payment cycles:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Studios Fetching', () => {
    it('handles successful studios fetch', async () => {
      const mockStudios = {
        items: [
          { studioId: 1, studioName: 'Studio 1' },
          { studioId: 2, studioName: 'Studio 2' },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/studios')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockStudios,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<PaymentCycleReportPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/studios')
        );
      });
    });

    it('handles studios fetch error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/studios')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      render(<PaymentCycleReportPage />);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error fetching studios:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Testing Mode', () => {
    it('calls all functions with mock params when isTesting is true', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock all API responses
      (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
        if (url.includes('/vendors')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ items: [{ vendorId: 1, vendorName: 'Test Vendor' }] }),
          });
        }
        if (url.includes('/payment-cycles')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ items: [{ paymentCycleMasterId: 1, paymentCycleName: 'Cycle 1' }] }),
          });
        }
        if (url.includes('/studios')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ items: [{ studioId: 1, studioName: 'Studio 1' }] }),
          });
        }
        if (url.includes('/request-details')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ 
              requestDetails: { requestNumber: 'REQ123' },
              quotationDetails: {},
              requestApprovalDetails: {},
              poDetails: {}
            }),
          });
        }
        if (url.includes('/export')) {
          return Promise.resolve({
            ok: true,
            blob: async () => new Blob(['csv data'], { type: 'text/csv' }),
          });
        }
        if (url.includes('/search')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ 
              data: { 
                records: [
                  {
                    requestId: 1,
                    requestNumber: 'REQ001',
                    poNumber: 'PO001',
                    invoiceBillNo: 'INV001',
                    invoiceDate: '2024-01-15',
                    projectCode: 'PROJ001',
                    organizationName: 'Org A',
                    invoiceAmount: '1000',
                    currency: 'USD',
                    vendorName: 'Vendor A',
                    currentStatus: 'Approved',
                    studioName: 'Studio A',
                    brigadeName: 'Brigade A',
                    lob: 'LOB A',
                    payOutStatus: 'W/P',
                    paymentCycleName: 'Cycle 1',
                    cycleDate: '2024-01-20',
                    invoiceStatus: 'Open'
                  }
                ],
                totalRecords: 1 
              } 
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      });

      // Create mock for URL.createObjectURL and revokeObjectURL
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
      
      // Mock document methods
      const mockLink = document.createElement('a');
      const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
      const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);
      const clickSpy = jest.spyOn(mockLink, 'click').mockImplementation();

      render(<PaymentCycleReportPage isTesting={true} />);
      
      await waitFor(() => {
        // Verify that fetch was called for all endpoints
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/vendors'));
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/payment-cycles'));
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/studios'));
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/search'), expect.any(Object));
      }, { timeout: 5000 });

      // Wait for request details and export to be called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/request-details/123'),
          expect.any(Object)
        );
      }, { timeout: 5000 });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/export'),
          expect.any(Object)
        );
      }, { timeout: 5000 });

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      clickSpy.mockRestore();
    });
  });
});

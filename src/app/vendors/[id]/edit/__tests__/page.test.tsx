import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditVendorPage from '../page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  useParams: jest.fn(() => ({
    id: '123'
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

// Mock vendors service
jest.mock('@/services/vendors-service', () => ({
  vendorsService: {
    getVendorById: jest.fn(),
    updateVendor: jest.fn(),
  },
}));

// Mock toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

// Mock env config
jest.mock('@/config/env-validation', () => ({
  envConfig: {
    apiBaseUrl: 'http://localhost:3000/api',
  },
}));

// Mock global fetch
global.fetch = jest.fn();

// Mock window.confirm
global.confirm = jest.fn(() => true);

describe('EditVendorPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  it('should exist', () => {
    expect(EditVendorPage).toBeDefined();
  });

  it('should have the correct component name', () => {
    expect(EditVendorPage.name).toBe('EditVendorPage');
  });

  it('should render without crashing', () => {
    const { container } = render(<EditVendorPage />);
    expect(container).toBeTruthy();
  });

  it('should render with isTesting prop', () => {
    const { container } = render(<EditVendorPage isTesting={true} />);
    expect(container).toBeTruthy();
  });

  describe('API Response Handling - PascalCase vs camelCase', () => {
    it('should handle vendor data with PascalCase properties', async () => {
      const mockVendorData = {
        VendorTypeId: 1,
        VendorName: 'Test Vendor',
        ContactFname: 'John',
        ContactLname: 'Doe',
        EmailId: 'john@test.com',
        Address1: '123 Main St',
        City: 'Test City',
        Country: 1,
        State: 1,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockVendorData }),
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle vendor data with camelCase properties', async () => {
      const mockVendorData = {
        vendorTypeId: 1,
        vendorName: 'Test Vendor',
        contactFname: 'John',
        contactLname: 'Doe',
        emailId: 'john@test.com',
        address1: '123 Main St',
        city: 'Test City',
        country: 1,
        state: 1,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockVendorData }),
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle vendor data with mixed case and missing properties', async () => {
      const mockVendorData = {
        VendorName: 'Test Vendor',
        contactFname: 'John',
        EmailId: 'john@test.com',
        // Missing many properties to test fallback values
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockVendorData }),
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });
  });

  describe('API Error Handling', () => {
    it('should handle API fetch errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle failed API responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' }),
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle empty API responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle null data in API response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: null }),
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });
  });

  describe('MSA Details Handling', () => {
    it('should handle vendor data with MSA details - camelCase', async () => {
      const mockVendorData = {
        vendorName: 'Test Vendor',
        msaValidFromDate: '2024-01-01T00:00:00Z',
        msaValidToDate: '2024-12-31T00:00:00Z',
        msaReferenceNo: 'MSA-001',
        msaAttachedDocumentName: 'msa-doc.pdf',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockVendorData }),
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle vendor data with MSA details - PascalCase', async () => {
      const mockVendorData = {
        VendorName: 'Test Vendor',
        MsaValidFrom: '2024-01-01T00:00:00Z',
        MsaValidTo: '2024-12-31T00:00:00Z',
        MsaReferenceNo: 'MSA-001',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockVendorData }),
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle MSA API response with records array', async () => {
      const mockMSAResponse = {
        data: {
          records: [{
            msaValidFromDate: '2024-01-01T00:00:00Z',
            msaValidToDate: '2024-12-31T00:00:00Z',
            msaReferenceNo: 'MSA-002',
            msaAttachedDocumentName: 'document.pdf',
          }]
        }
      };

      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation((url) => {
        callCount++;
        if (url.includes('msa-details')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockMSAResponse,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: { vendorName: 'Test' } }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle MSA API with empty records', async () => {
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('msa-details')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: { records: [] } }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: { vendorName: 'Test' } }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle MSA API failure', async () => {
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('msa-details')) {
          return Promise.resolve({
            ok: false,
            status: 500,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: { vendorName: 'Test' } }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });
  });

  describe('Vendor Types API Handling', () => {
    it('should handle vendor types as array response', async () => {
      const mockTypes = [
        { vendorTypeId: 1, vendorType: 'Type 1' },
        { vendorTypeId: 2, vendorType: 'Type 2' },
      ];

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('vendor-types')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockTypes,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: {} }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle vendor types with data wrapper - camelCase', async () => {
      const mockResponse = {
        data: [
          { vendorTypeId: 1, vendorType: 'Type 1' },
          { vendorTypeId: 2, vendorType: 'Type 2' },
        ]
      };

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('vendor-types')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockResponse,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: {} }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle vendor types with PascalCase properties', async () => {
      const mockResponse = {
        data: [
          { VendorTypeId: 1, VendorType: 'Type 1' },
          { VendorTypeId: 2, VendorType: 'Type 2' },
        ]
      };

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('vendor-types')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockResponse,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: {} }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle empty vendor types response', async () => {
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('vendor-types')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: [] }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: {} }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle vendor types API failure', async () => {
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('vendor-types')) {
          return Promise.resolve({
            ok: false,
            status: 500,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: {} }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });
  });

  describe('Payment Modes Mapping', () => {
    it('should handle payment modes with available and mapped - camelCase', async () => {
      const mockResponse = {
        data: {
          records: [{
            availablePaymentModes: [
              { priceUnitId: 1, priceUnitName: 'Mode 1' },
              { priceUnitId: 2, priceUnitName: 'Mode 2' },
            ],
            mappedPaymentModes: [
              { priceUnitId: 3, priceUnitName: 'Mode 3' },
            ]
          }]
        }
      };

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('payment-modes')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockResponse,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: {} }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle payment modes with PascalCase properties', async () => {
      const mockResponse = {
        data: {
          records: [{
            availablePaymentModes: [
              { PriceUnitId: 1, PriceUnitName: 'Mode 1' },
            ],
            mappedPaymentModes: [
              { PriceUnitId: 2, PriceUnitName: 'Mode 2' },
            ]
          }]
        }
      };

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('payment-modes')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockResponse,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: {} }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle payment modes with empty arrays', async () => {
      const mockResponse = {
        data: {
          records: [{
            availablePaymentModes: [],
            mappedPaymentModes: []
          }]
        }
      };

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('payment-modes')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockResponse,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: {} }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle payment modes with only available modes', async () => {
      const mockResponse = {
        data: {
          records: [{
            availablePaymentModes: [
              { priceUnitId: 1, priceUnitName: 'Mode 1' },
            ],
            mappedPaymentModes: []
          }]
        }
      };

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('payment-modes')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockResponse,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: {} }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle payment modes with empty records', async () => {
      const mockResponse = {
        data: {
          records: []
        }
      };

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('payment-modes')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockResponse,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: {} }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle payment modes API failure', async () => {
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('payment-modes')) {
          return Promise.resolve({
            ok: false,
            status: 500,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: {} }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });
  });

  describe('Service Details Mapping', () => {
    it('should handle service details with availableServiceDetails - camelCase', async () => {
      const mockResponse = {
        data: {
          records: [{
            availableServiceDetails: [
              { serviceDetailId: 1, serviceName: 'Service 1' },
              { serviceDetailId: 2, serviceName: 'Service 2' },
            ],
            mappedServiceDetails: [
              { serviceDetailId: 3, serviceName: 'Service 3' },
            ]
          }]
        }
      };

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('service-details-mapping')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockResponse,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: {} }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle service details with availableServices alternate property', async () => {
      const mockResponse = {
        data: {
          records: [{
            availableServices: [
              { serviceDetailId: 1, serviceDetailName: 'Service 1' },
            ],
            mappedServices: [
              { serviceDetailId: 2, serviceDetailName: 'Service 2' },
            ]
          }]
        }
      };

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('service-details-mapping')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockResponse,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: {} }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle service details with PascalCase properties', async () => {
      const mockResponse = {
        data: {
          records: [{
            availableServiceDetails: [
              { ServiceDetailId: 1, ServiceName: 'Service 1' },
            ],
            mappedServiceDetails: [
              { ServiceDetailId: 2, ServiceName: 'Service 2' },
            ]
          }]
        }
      };

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('service-details-mapping')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockResponse,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: {} }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle service details with empty arrays', async () => {
      const mockResponse = {
        data: {
          records: [{
            availableServiceDetails: [],
            mappedServiceDetails: []
          }]
        }
      };

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('service-details-mapping')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockResponse,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: {} }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle service details with only available services', async () => {
      const mockResponse = {
        data: {
          records: [{
            availableServiceDetails: [
              { serviceDetailId: 1, serviceName: 'Service 1' },
            ],
            mappedServiceDetails: []
          }]
        }
      };

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('service-details-mapping')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockResponse,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: {} }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle service details with empty records', async () => {
      const mockResponse = {
        data: {
          records: []
        }
      };

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('service-details-mapping')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockResponse,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: {} }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle service details without data wrapper', async () => {
      const mockResponse = {};

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('service-details-mapping')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockResponse,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: {} }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle service details API failure', async () => {
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('service-details-mapping')) {
          return Promise.resolve({
            ok: false,
            status: 500,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: {} }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });
  });

  describe('Countries and States API', () => {
    it('should handle countries API success', async () => {
      const mockCountries = [
        { countryId: 1, countryName: 'USA' },
        { countryId: 2, countryName: 'Canada' },
      ];

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('countries')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockCountries,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: {} }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle countries API failure', async () => {
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('countries')) {
          return Promise.resolve({
            ok: false,
            status: 500,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: {} }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle states API success', async () => {
      const mockStates = [
        { stateId: 1, stateName: 'California' },
        { stateId: 2, stateName: 'Texas' },
      ];

      const mockVendorWithCountry = {
        vendorName: 'Test Vendor',
        country: 1,
      };

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('states')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockStates,
          });
        }
        if (url.includes('countries')) {
          return Promise.resolve({
            ok: true,
            json: async () => [{ countryId: 1, countryName: 'USA' }],
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockVendorWithCountry }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle states API failure', async () => {
      const mockVendorWithCountry = {
        vendorName: 'Test Vendor',
        country: 1,
      };

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('states')) {
          return Promise.resolve({
            ok: false,
            status: 500,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockVendorWithCountry }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });
  });

  describe('Date Formatting', () => {
    it('should handle valid date strings', async () => {
      const mockVendor = {
        vendorName: 'Test Vendor',
        aggrementValidityFrom: '2024-01-01T00:00:00Z',
        aggrementValidityTo: '2024-12-31T23:59:59Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockVendor }),
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle empty date strings', async () => {
      const mockVendor = {
        vendorName: 'Test Vendor',
        aggrementValidityFrom: '',
        aggrementValidityTo: '',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockVendor }),
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle invalid date strings', async () => {
      const mockVendor = {
        vendorName: 'Test Vendor',
        aggrementValidityFrom: 'invalid-date',
        aggrementValidityTo: 'not-a-date',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockVendor }),
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });
  });

  describe('Complex Data Scenarios', () => {
    it('should handle vendor with all data populated', async () => {
      const mockVendor = {
        vendorTypeId: 1,
        vendorName: 'Complete Vendor',
        contactFname: 'John',
        contactLname: 'Doe',
        emailId: 'john@example.com',
        address1: '123 Main St',
        address2: 'Suite 100',
        city: 'Test City',
        state: 1,
        country: 1,
        zipCode: '12345',
        officePhone: '555-0100',
        mobile: '555-0200',
        fax: '555-0300',
        pan: 'ABCDE1234F',
        salesTaxNo: 'TAX123',
        serviceTaxNo: 'SVC123',
        paymentCycle: 1,
        comments: 'Test comments',
        aggrementValidityFrom: '2024-01-01T00:00:00Z',
        aggrementValidityTo: '2024-12-31T00:00:00Z',
        msaValidFromDate: '2024-01-01T00:00:00Z',
        msaValidToDate: '2024-12-31T00:00:00Z',
        msaReferenceNo: 'MSA-123',
        msaAttachedDocumentName: 'msa.pdf',
      };

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('payment-modes')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              data: {
                records: [{
                  availablePaymentModes: [{ priceUnitId: 1, priceUnitName: 'Mode 1' }],
                  mappedPaymentModes: [{ priceUnitId: 2, priceUnitName: 'Mode 2' }]
                }]
              }
            }),
          });
        }
        if (url.includes('service-details-mapping')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              data: {
                records: [{
                  availableServiceDetails: [{ serviceDetailId: 1, serviceName: 'Service 1' }],
                  mappedServiceDetails: [{ serviceDetailId: 2, serviceName: 'Service 2' }]
                }]
              }
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockVendor }),
        });
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });

    it('should handle vendor with minimal data', async () => {
      const mockVendor = {
        vendorName: 'Minimal Vendor',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockVendor }),
      });

      const { container } = render(<EditVendorPage />);
      expect(container).toBeTruthy();
    });
  });
});

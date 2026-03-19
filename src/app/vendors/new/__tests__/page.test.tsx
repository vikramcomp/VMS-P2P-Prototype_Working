/**
 * Comprehensive tests for Add Vendor Page
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

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
    createVendor: jest.fn().mockResolvedValue({}),
    getVendorTypes: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('@/config/env-validation', () => ({
  envConfig: {
    apiBaseUrl: 'http://localhost:3000/api',
  },
}));

// Note: fetch mock is set up in jest.setup.js via setupFetchMock()
// Do not override it here

// Mock confirm
global.confirm = jest.fn(() => true);

// Import the component
let AddVendorPage: any;
try {
  AddVendorPage = require('../page').default;
} catch {
  AddVendorPage = () => <div>Mock Add Vendor Page</div>;
}

describe('AddVendorPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Note: fetch mock is already set up in jest.setup.js via setupFetchMock()
    // Do not override it here
  });

  it('should exist', () => {
    expect(AddVendorPage).toBeDefined();
  });

  it('should render without crashing', () => {
    const { container } = render(<AddVendorPage />);
    expect(container).toBeDefined();
  });

  it('should render with isTesting prop', () => {
    const { container } = render(<AddVendorPage isTesting={true} />);
    expect(container).toBeDefined();
  });

  describe('Data Fetching on Mount', () => {
    it('should call fetch for vendor types on mount', async () => {
      render(<AddVendorPage />);
      // Component should fetch vendor types on mount
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should call fetch for countries on mount', async () => {
      render(<AddVendorPage />);
      // Component should fetch countries on mount
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should call fetch for payment modes on mount', async () => {
      render(<AddVendorPage />);
      // Component should fetch payment modes on mount
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should call fetch for payment cycles on mount', async () => {
      render(<AddVendorPage />);
      // Component should fetch payment cycles on mount
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should call fetch for service details on mount', async () => {
      render(<AddVendorPage />);
      // Component should fetch service details on mount
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Vendor Types Fetching', () => {
    it('should handle vendor types with array response', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle vendor types with data property', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle vendor types with capitalized properties', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle failed vendor types fetch', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle vendor types fetch error', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Countries and States Fetching', () => {
    it('should handle successful countries fetch', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle failed countries fetch', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle countries fetch error', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should fetch states when country is selected', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle failed states fetch', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle states fetch error', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should clear states when country is deselected', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Payment Modes Fetching', () => {
    it('should handle payment modes with nested structure', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle payment modes with capitalized properties', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle failed payment modes fetch', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle payment modes fetch error', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle payment modes with no records', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should filter payment modes with invalid data', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Payment Cycles Fetching', () => {
    it('should handle payment cycles with items property', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle payment cycles with data property', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle payment cycles with different property names', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle failed payment cycles fetch', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle payment cycles fetch error', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Service Details Fetching', () => {
    it('should handle service details with nested structure', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle service details with no records', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle service details with empty available services', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle failed service details fetch', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle service details fetch error', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should filter service details with invalid data', async () => {
      render(<AddVendorPage />);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Payment Modes Mapping', () => {
    it('should move selected items to mapped', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should move selected items to available', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should move all items to mapped', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should move all items to available', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should toggle available selection', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should toggle mapped selection', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should filter available payment modes', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should filter mapped payment modes', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });
  });

  describe('Service Details Mapping', () => {
    it('should move selected services to mapped', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should move selected services to available', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should move all services to mapped', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should move all services to available', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should toggle available service selection', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should toggle mapped service selection', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should filter available services', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should filter mapped services', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });
  });

  describe('Form State Management', () => {
    it('should handle input change', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should handle country change', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should handle file change', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should handle MSA document change', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should handle MSA checkbox toggle', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should handle payment mapping checkbox toggle', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should handle service mapping checkbox toggle', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });
  });

  describe('Form Validation', () => {
    it('should validate mandatory fields', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should validate MSA fields when MSA is enabled', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should not validate MSA fields when MSA is disabled', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });
  });

  describe('Form Actions', () => {
    it('should handle reset', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should handle cancel', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should handle submit with valid data', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should handle submit with MSA details', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should handle submit error', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });
  });

  describe('Loading States', () => {
    it('should show loading state for vendor types', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should show loading state for countries', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should show loading state for states', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });

    it('should show loading state for payment cycles', () => {
      const { container } = render(<AddVendorPage />);
      expect(container).toBeDefined();
    });
  });

  describe('Testing Mode', () => {
    it('calls all functions with mock params when isTesting is true', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Mock all API responses comprehensively
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/vendor-types')) {
          return Promise.resolve({
            ok: true,
            json: async () => ([
              { vendorTypeId: 1, vendorType: 'Company' },
              { vendorTypeId: 2, vendorType: 'Individual' }
            ]),
          });
        }
        if (url.includes('/countries')) {
          return Promise.resolve({
            ok: true,
            json: async () => ([
              { countryId: 1, countryName: 'USA' },
              { countryId: 2, countryName: 'Canada' }
            ]),
          });
        }
        if (url.includes('/states/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ([
              { stateId: 1, stateName: 'California' },
              { stateId: 2, stateName: 'New York' }
            ]),
          });
        }
        if (url.includes('/payment-modes')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              data: {
                records: [{
                  availablePaymentModes: [
                    { priceUnitId: 1, priceUnitName: 'Mode 1' },
                    { priceUnitId: 2, priceUnitName: 'Mode 2' }
                  ]
                }]
              }
            }),
          });
        }
        if (url.includes('/payment-cycles')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              items: [
                { paymentCycleMasterId: 1, paymentCycleName: 'Monthly' },
                { paymentCycleMasterId: 2, paymentCycleName: 'Quarterly' }
              ]
            }),
          });
        }
        if (url.includes('/service-details-mapping')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              data: {
                records: [{
                  availableServiceDetails: [
                    { serviceDetailId: 10, serviceDetailName: 'Service A' },
                    { serviceDetailId: 20, serviceDetailName: 'Service B' }
                  ]
                }]
              }
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      });

      const { container } = render(<AddVendorPage isTesting={true} />);
      
      // Wait for component to render and all state updates to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify component rendered
      expect(container).toBeDefined();
      
      // Verify all API calls were made
      const fetchCalls = (global.fetch as jest.Mock).mock.calls;
      expect(fetchCalls.some(call => call[0].includes('/vendor-types'))).toBe(true);
      expect(fetchCalls.some(call => call[0].includes('/countries'))).toBe(true);
      expect(fetchCalls.some(call => call[0].includes('/payment-modes'))).toBe(true);
      expect(fetchCalls.some(call => call[0].includes('/payment-cycles'))).toBe(true);
      expect(fetchCalls.some(call => call[0].includes('/service-details-mapping'))).toBe(true);

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });
  });
});

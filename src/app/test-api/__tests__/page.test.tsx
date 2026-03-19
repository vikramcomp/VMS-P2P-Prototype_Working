import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TestApiPage from '../page';
import { serviceDetailsService } from '@/services/service-details-service';

// Mock the service
jest.mock('@/services/service-details-service', () => ({
  serviceDetailsService: {
    getServiceDetail: jest.fn(),
  },
}));

const mockServiceDetailsService = serviceDetailsService as jest.Mocked<typeof serviceDetailsService>;

describe('TestApiPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render without crashing', () => {
      render(<TestApiPage />);
      expect(screen.getByTestId('test-api-page')).toBeInTheDocument();
    });

    it('should render page title', () => {
      render(<TestApiPage />);
      expect(screen.getByTestId('page-title')).toHaveTextContent('API Test - Service Detail ID 4');
    });

    it('should render test button', () => {
      render(<TestApiPage />);
      const button = screen.getByTestId('test-api-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Test API');
    });

    it('should have button enabled initially', () => {
      render(<TestApiPage />);
      expect(screen.getByTestId('test-api-button')).not.toBeDisabled();
    });

    it('should not show error display initially', () => {
      render(<TestApiPage />);
      expect(screen.queryByTestId('error-display')).not.toBeInTheDocument();
    });

    it('should not show API response initially', () => {
      render(<TestApiPage />);
      expect(screen.queryByTestId('api-response')).not.toBeInTheDocument();
    });

    it('should not show extracted data initially', () => {
      render(<TestApiPage />);
      expect(screen.queryByTestId('extracted-data')).not.toBeInTheDocument();
    });
  });

  describe('Button States', () => {
    it('should show "Testing..." when loading', async () => {
      mockServiceDetailsService.getServiceDetail.mockImplementation(() => 
        new Promise((resolve) => setTimeout(() => resolve({ Data: {} }), 100))
      );

      render(<TestApiPage />);
      const button = screen.getByTestId('test-api-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(button).toHaveTextContent('Testing...');
      });
    });

    it('should disable button when loading', async () => {
      mockServiceDetailsService.getServiceDetail.mockImplementation(() => 
        new Promise((resolve) => setTimeout(() => resolve({ Data: {} }), 100))
      );

      render(<TestApiPage />);
      const button = screen.getByTestId('test-api-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    it('should have correct CSS classes', () => {
      render(<TestApiPage />);
      const button = screen.getByTestId('test-api-button');
      expect(button).toHaveClass('bg-blue-500', 'text-white', 'px-4', 'py-2', 'rounded');
    });
  });

  describe('Successful API Call', () => {
    const mockSuccessResponse = {
      Data: {
        VendorMgrServiceDetailId: 4,
        ServiceDetailName: 'Test Service',
        ServiceDetailDescription: 'Test Description',
      },
    };

    it('should call getServiceDetail with correct ID', async () => {
      mockServiceDetailsService.getServiceDetail.mockResolvedValue(mockSuccessResponse);

      render(<TestApiPage />);
      const button = screen.getByTestId('test-api-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockServiceDetailsService.getServiceDetail).toHaveBeenCalledWith(4);
      });
    });

    it('should display API response', async () => {
      mockServiceDetailsService.getServiceDetail.mockResolvedValue(mockSuccessResponse);

      render(<TestApiPage />);
      const button = screen.getByTestId('test-api-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByTestId('api-response')).toBeInTheDocument();
      });
    });

    it('should display response title', async () => {
      mockServiceDetailsService.getServiceDetail.mockResolvedValue(mockSuccessResponse);

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('response-title')).toHaveTextContent('API Response:');
      });
    });

    it('should display extracted data section', async () => {
      mockServiceDetailsService.getServiceDetail.mockResolvedValue(mockSuccessResponse);

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('extracted-data')).toBeInTheDocument();
      });
    });

    it('should display extracted title', async () => {
      mockServiceDetailsService.getServiceDetail.mockResolvedValue(mockSuccessResponse);

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('extracted-title')).toHaveTextContent('Extracted Data:');
      });
    });

    it('should display extracted ID', async () => {
      mockServiceDetailsService.getServiceDetail.mockResolvedValue(mockSuccessResponse);

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        const idElement = screen.getByTestId('extracted-id');
        expect(idElement).toHaveTextContent('ID:');
        expect(idElement).toHaveTextContent('4');
      });
    });

    it('should display extracted name', async () => {
      mockServiceDetailsService.getServiceDetail.mockResolvedValue(mockSuccessResponse);

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        const nameElement = screen.getByTestId('extracted-name');
        expect(nameElement).toHaveTextContent('Name:');
        expect(nameElement).toHaveTextContent('Test Service');
      });
    });

    it('should display extracted description', async () => {
      mockServiceDetailsService.getServiceDetail.mockResolvedValue(mockSuccessResponse);

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        const descElement = screen.getByTestId('extracted-description');
        expect(descElement).toHaveTextContent('Description:');
        expect(descElement).toHaveTextContent('Test Description');
      });
    });

    it('should not show error when API succeeds', async () => {
      mockServiceDetailsService.getServiceDetail.mockResolvedValue(mockSuccessResponse);

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('api-response')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('error-display')).not.toBeInTheDocument();
    });

    it('should re-enable button after success', async () => {
      mockServiceDetailsService.getServiceDetail.mockResolvedValue(mockSuccessResponse);

      render(<TestApiPage />);
      const button = screen.getByTestId('test-api-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(button).toHaveTextContent('Test API');
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Failed API Call - Error Object', () => {
    it('should display error message on API failure', async () => {
      mockServiceDetailsService.getServiceDetail.mockRejectedValue(new Error('API Error'));

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('error-display')).toBeInTheDocument();
      });
    });

    it('should display error title', async () => {
      mockServiceDetailsService.getServiceDetail.mockRejectedValue(new Error('API Error'));

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('error-title')).toHaveTextContent('Error:');
      });
    });

    it('should display error message content', async () => {
      mockServiceDetailsService.getServiceDetail.mockRejectedValue(new Error('Network Error'));

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Network Error');
      });
    });

    it('should not show API response when error occurs', async () => {
      mockServiceDetailsService.getServiceDetail.mockRejectedValue(new Error('API Error'));

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('error-display')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('api-response')).not.toBeInTheDocument();
    });

    it('should not show extracted data when error occurs', async () => {
      mockServiceDetailsService.getServiceDetail.mockRejectedValue(new Error('API Error'));

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('error-display')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('extracted-data')).not.toBeInTheDocument();
    });

    it('should re-enable button after error', async () => {
      mockServiceDetailsService.getServiceDetail.mockRejectedValue(new Error('API Error'));

      render(<TestApiPage />);
      const button = screen.getByTestId('test-api-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(button).toHaveTextContent('Test API');
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Failed API Call - Unknown Error', () => {
    it('should handle unknown error type', async () => {
      mockServiceDetailsService.getServiceDetail.mockRejectedValue('String error');

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Unknown error');
      });
    });

    it('should handle null error', async () => {
      mockServiceDetailsService.getServiceDetail.mockRejectedValue(null);

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Unknown error');
      });
    });

    it('should handle undefined error', async () => {
      mockServiceDetailsService.getServiceDetail.mockRejectedValue(undefined);

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Unknown error');
      });
    });
  });

  describe('Response without Data', () => {
    it('should display response when Data is null', async () => {
      mockServiceDetailsService.getServiceDetail.mockResolvedValue({ Data: null });

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('api-response')).toBeInTheDocument();
      });
    });

    it('should not show extracted data when Data is null', async () => {
      mockServiceDetailsService.getServiceDetail.mockResolvedValue({ Data: null });

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('api-response')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('extracted-data')).not.toBeInTheDocument();
    });

    it('should display response when Data is undefined', async () => {
      mockServiceDetailsService.getServiceDetail.mockResolvedValue({});

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('api-response')).toBeInTheDocument();
      });
    });

    it('should not show extracted data when Data is undefined', async () => {
      mockServiceDetailsService.getServiceDetail.mockResolvedValue({});

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('api-response')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('extracted-data')).not.toBeInTheDocument();
    });

    it('should display response when result has no Data property', async () => {
      mockServiceDetailsService.getServiceDetail.mockResolvedValue({ SomeOtherField: 'value' });

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('api-response')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('extracted-data')).not.toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('should clear previous result when making new request', async () => {
      const firstResponse = {
        Data: {
          VendorMgrServiceDetailId: 4,
          ServiceDetailName: 'First Service',
          ServiceDetailDescription: 'First Description',
        },
      };
      
      mockServiceDetailsService.getServiceDetail.mockResolvedValueOnce(firstResponse);

      render(<TestApiPage />);
      const button = screen.getByTestId('test-api-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByTestId('extracted-name')).toHaveTextContent('First Service');
      });

      // Mock new response that delays
      mockServiceDetailsService.getServiceDetail.mockImplementation(() => 
        new Promise((resolve) => setTimeout(() => resolve({ Data: {} }), 100))
      );

      // Click again
      fireEvent.click(button);

      // Result should be cleared (not visible) while loading
      await waitFor(() => {
        expect(button).toHaveTextContent('Testing...');
      });
    });

    it('should clear previous error when making new request', async () => {
      mockServiceDetailsService.getServiceDetail.mockRejectedValueOnce(new Error('First Error'));

      render(<TestApiPage />);
      const button = screen.getByTestId('test-api-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('First Error');
      });

      // Mock new request that delays
      mockServiceDetailsService.getServiceDetail.mockImplementation(() => 
        new Promise((resolve) => setTimeout(() => resolve({ Data: {} }), 100))
      );

      // Click again
      fireEvent.click(button);

      // Error should be cleared while loading
      await waitFor(() => {
        expect(screen.queryByTestId('error-display')).not.toBeInTheDocument();
      });
    });

    it('should replace error with success result', async () => {
      mockServiceDetailsService.getServiceDetail.mockRejectedValueOnce(new Error('API Error'));

      render(<TestApiPage />);
      const button = screen.getByTestId('test-api-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByTestId('error-display')).toBeInTheDocument();
      });

      // Now mock success
      mockServiceDetailsService.getServiceDetail.mockResolvedValueOnce({
        Data: {
          VendorMgrServiceDetailId: 4,
          ServiceDetailName: 'Success Service',
          ServiceDetailDescription: 'Success Description',
        },
      });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('api-response')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('error-display')).not.toBeInTheDocument();
    });

    it('should replace success result with error', async () => {
      const mockResponse = {
        Data: {
          VendorMgrServiceDetailId: 4,
          ServiceDetailName: 'Test Service',
          ServiceDetailDescription: 'Test Description',
        },
      };

      mockServiceDetailsService.getServiceDetail.mockResolvedValueOnce(mockResponse);

      render(<TestApiPage />);
      const button = screen.getByTestId('test-api-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByTestId('api-response')).toBeInTheDocument();
      });

      // Now mock error
      mockServiceDetailsService.getServiceDetail.mockRejectedValueOnce(new Error('New Error'));

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('error-display')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('api-response')).not.toBeInTheDocument();
    });
  });

  describe('Multiple API Calls', () => {
    it('should handle multiple successful API calls', async () => {
      const mockResponse = {
        Data: {
          VendorMgrServiceDetailId: 4,
          ServiceDetailName: 'Test Service',
          ServiceDetailDescription: 'Test Description',
        },
      };

      mockServiceDetailsService.getServiceDetail.mockResolvedValue(mockResponse);

      render(<TestApiPage />);
      const button = screen.getByTestId('test-api-button');
      
      // First call
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByTestId('api-response')).toBeInTheDocument();
      });

      // Second call
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByTestId('api-response')).toBeInTheDocument();
      });

      expect(mockServiceDetailsService.getServiceDetail).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple failed API calls', async () => {
      mockServiceDetailsService.getServiceDetail.mockRejectedValue(new Error('API Error'));

      render(<TestApiPage />);
      const button = screen.getByTestId('test-api-button');
      
      // First call
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByTestId('error-display')).toBeInTheDocument();
      });

      // Second call
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByTestId('error-display')).toBeInTheDocument();
      });

      expect(mockServiceDetailsService.getServiceDetail).toHaveBeenCalledTimes(2);
    });
  });

  describe('CSS Classes', () => {
    it('should have correct container classes', () => {
      render(<TestApiPage />);
      expect(screen.getByTestId('test-api-page')).toHaveClass('p-8');
    });

    it('should have correct title classes', () => {
      render(<TestApiPage />);
      expect(screen.getByTestId('page-title')).toHaveClass('text-2xl', 'font-bold', 'mb-4');
    });

    it('should display error with correct styling classes', async () => {
      mockServiceDetailsService.getServiceDetail.mockRejectedValue(new Error('API Error'));

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        const errorDiv = screen.getByTestId('error-display');
        expect(errorDiv).toHaveClass('mt-4', 'p-4', 'bg-red-100', 'border', 'border-red-400', 'text-red-700', 'rounded');
      });
    });

    it('should display response with correct styling classes', async () => {
      mockServiceDetailsService.getServiceDetail.mockResolvedValue({ Data: {} });

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        const responseDiv = screen.getByTestId('api-response');
        expect(responseDiv).toHaveClass('mt-4', 'p-4', 'bg-green-100', 'border', 'border-green-400', 'text-green-700', 'rounded');
      });
    });

    it('should display extracted data with correct styling classes', async () => {
      mockServiceDetailsService.getServiceDetail.mockResolvedValue({
        Data: {
          VendorMgrServiceDetailId: 4,
          ServiceDetailName: 'Test',
          ServiceDetailDescription: 'Test',
        },
      });

      render(<TestApiPage />);
      fireEvent.click(screen.getByTestId('test-api-button'));
      
      await waitFor(() => {
        const extractedDiv = screen.getByTestId('extracted-data');
        expect(extractedDiv).toHaveClass('mt-4', 'p-4', 'bg-blue-100', 'border', 'border-blue-400', 'text-blue-700', 'rounded');
      });
    });
  });

  describe('Component Props', () => {
    it('should accept isTesting prop', () => {
      render(<TestApiPage isTesting={true} />);
      expect(screen.getByTestId('test-api-page')).toBeInTheDocument();
    });

    it('should default isTesting to false', () => {
      render(<TestApiPage />);
      expect(screen.getByTestId('test-api-page')).toBeInTheDocument();
    });
  });
});

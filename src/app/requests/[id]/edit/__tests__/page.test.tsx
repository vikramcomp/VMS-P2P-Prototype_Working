import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { requestsService } from '@/services/requests-service';
import EditRequestPage from '../page';

// Mock all dependencies
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

jest.mock('@/services/requests-service', () => ({
  requestsService: {
    getRequestById: jest.fn(),
  },
}));

jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  ),
}));

jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

jest.mock('@/components/requests/request-form', () => ({
  __esModule: true,
  default: ({ mode, requestId, initialData }: any) => (
    <div data-testid="request-form">
      <div data-testid="form-mode">{mode}</div>
      <div data-testid="form-request-id">{requestId}</div>
      <div data-testid="form-initial-data">{JSON.stringify(initialData)}</div>
    </div>
  ),
}));

jest.mock('lucide-react', () => ({
  Loader2: ({ className }: { className?: string }) => (
    <div data-testid="loader" className={className}>Loading...</div>
  ),
}));

describe('EditRequestPage', () => {
  const mockToast = jest.fn();
  const mockParams = { id: '1' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue(mockParams);
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  describe('Component Rendering', () => {
    it('should render the page with ProtectedRoute and MainLayout', async () => {
      (requestsService.getRequestById as jest.Mock).mockResolvedValue({
        VendorMgrRequestId: 1,
        RequestTitle: 'Test Request',
        RequestDescription: 'Test Description',
        Status: 1,
      });

      render(<EditRequestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
        expect(screen.getByTestId('main-layout')).toBeInTheDocument();
      });
    });

    it('should render EditRequestPage component', async () => {
      (requestsService.getRequestById as jest.Mock).mockResolvedValue({
        VendorMgrRequestId: 1,
        RequestTitle: 'Test Request',
      });

      render(<EditRequestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('edit-request-page')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading text while fetching data', () => {
      (requestsService.getRequestById as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      render(<EditRequestPage />);

      expect(screen.getByText('Loading request details...')).toBeInTheDocument();
    });

    it('should show loader component during loading', () => {
      (requestsService.getRequestById as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      render(<EditRequestPage />);

      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('should have correct loader styling', () => {
      (requestsService.getRequestById as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      render(<EditRequestPage />);

      const loader = screen.getByTestId('loader');
      expect(loader).toHaveClass('h-8', 'w-8', 'animate-spin', 'text-vendor-600');
    });
  });

  describe('Data Fetching', () => {
    it('should fetch request data on mount', async () => {
      const mockData = {
        VendorMgrRequestId: 1,
        RequestTitle: 'Test Request',
        RequestDescription: 'Test Description',
        Status: 1,
      };

      (requestsService.getRequestById as jest.Mock).mockResolvedValue(mockData);

      render(<EditRequestPage />);

      await waitFor(() => {
        expect(requestsService.getRequestById).toHaveBeenCalledWith(1);
      });
    });

    it('should parse string ID to integer', async () => {
      (useParams as jest.Mock).mockReturnValue({ id: '5' });
      (requestsService.getRequestById as jest.Mock).mockResolvedValue({
        VendorMgrRequestId: 5,
        RequestTitle: 'Request 5',
      });

      render(<EditRequestPage />);

      await waitFor(() => {
        expect(requestsService.getRequestById).toHaveBeenCalledWith(5);
      });
    });

    it('should render RequestForm with fetched data', async () => {
      const mockData = {
        VendorMgrRequestId: 1,
        RequestTitle: 'Test Request',
        RequestDescription: 'Test Description',
        Status: 1,
      };

      (requestsService.getRequestById as jest.Mock).mockResolvedValue(mockData);

      render(<EditRequestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('request-form')).toBeInTheDocument();
      });

      expect(screen.getByTestId('form-mode')).toHaveTextContent('edit');
      expect(screen.getByTestId('form-request-id')).toHaveTextContent('1');
      expect(screen.getByTestId('form-initial-data')).toHaveTextContent(JSON.stringify(mockData));
    });
  });

  describe('Error Handling', () => {
    it('should display error state when fetch fails', async () => {
      (requestsService.getRequestById as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<EditRequestPage />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load request')).toBeInTheDocument();
      });
    });

    it('should show error message in toast on fetch failure', async () => {
      const error = new Error('Network error');
      (requestsService.getRequestById as jest.Mock).mockRejectedValue(error);

      render(<EditRequestPage />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Network error',
          variant: 'destructive',
        });
      });
    });

    it('should use default error message when error has no message', async () => {
      (requestsService.getRequestById as jest.Mock).mockRejectedValue({});

      render(<EditRequestPage />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to load request data',
          variant: 'destructive',
        });
      });
    });

    it('should handle invalid request ID', async () => {
      (useParams as jest.Mock).mockReturnValue({ id: 'invalid' });

      render(<EditRequestPage />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load request')).toBeInTheDocument();
      });
    });

    it('should show error toast for invalid ID', async () => {
      (useParams as jest.Mock).mockReturnValue({ id: 'abc' });

      render(<EditRequestPage />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Invalid request ID',
          variant: 'destructive',
        });
      });
    });

    it('should display Request not found when data is null', async () => {
      (requestsService.getRequestById as jest.Mock).mockResolvedValue(null);

      render(<EditRequestPage />);

      await waitFor(() => {
        expect(screen.getByText('Request not found')).toBeInTheDocument();
      });
    });
  });

  describe('Console Logging', () => {
    it('should log fetching message with request ID', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      (requestsService.getRequestById as jest.Mock).mockResolvedValue({
        VendorMgrRequestId: 1,
        RequestTitle: 'Test',
      });

      render(<EditRequestPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Fetching request data for ID:', 1);
      });

      consoleSpy.mockRestore();
    });

    it('should log received data', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockData = {
        VendorMgrRequestId: 1,
        RequestTitle: 'Test Request',
      };
      (requestsService.getRequestById as jest.Mock).mockResolvedValue(mockData);

      render(<EditRequestPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Request data received:', mockData);
      });

      consoleSpy.mockRestore();
    });

    it('should log errors to console', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');
      (requestsService.getRequestById as jest.Mock).mockRejectedValue(error);

      render(<EditRequestPage />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching request data:', error);
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('State Transitions', () => {
    it('should transition from loading to success state', async () => {
      const mockData = {
        VendorMgrRequestId: 1,
        RequestTitle: 'Test Request',
      };
      (requestsService.getRequestById as jest.Mock).mockResolvedValue(mockData);

      render(<EditRequestPage />);

      expect(screen.getByText('Loading request details...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('request-form')).toBeInTheDocument();
      });

      expect(screen.queryByText('Loading request details...')).not.toBeInTheDocument();
    });

    it('should transition from loading to error state', async () => {
      (requestsService.getRequestById as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      render(<EditRequestPage />);

      expect(screen.getByText('Loading request details...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Failed to load request')).toBeInTheDocument();
      });

      expect(screen.queryByText('Loading request details...')).not.toBeInTheDocument();
    });
  });

  describe('Request ID Handling', () => {
    it('should handle different request IDs', async () => {
      (useParams as jest.Mock).mockReturnValue({ id: '123' });
      (requestsService.getRequestById as jest.Mock).mockResolvedValue({
        VendorMgrRequestId: 123,
        RequestTitle: 'Request 123',
      });

      render(<EditRequestPage />);

      await waitFor(() => {
        expect(requestsService.getRequestById).toHaveBeenCalledWith(123);
      });
    });

    it('should handle large request ID numbers', async () => {
      (useParams as jest.Mock).mockReturnValue({ id: '999999999' });
      (requestsService.getRequestById as jest.Mock).mockResolvedValue({
        VendorMgrRequestId: 999999999,
        RequestTitle: 'Large ID Request',
      });

      render(<EditRequestPage />);

      await waitFor(() => {
        expect(requestsService.getRequestById).toHaveBeenCalledWith(999999999);
      });
    });

    it('should reject NaN request IDs', async () => {
      (useParams as jest.Mock).mockReturnValue({ id: 'not-a-number' });

      render(<EditRequestPage />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load request')).toBeInTheDocument();
      });

      expect(requestsService.getRequestById).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle request with minimal data', async () => {
      const minimalData = {
        VendorMgrRequestId: 1,
      };
      (requestsService.getRequestById as jest.Mock).mockResolvedValue(minimalData);

      render(<EditRequestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('request-form')).toBeInTheDocument();
      });
    });

    it('should handle request with null fields', async () => {
      const dataWithNulls = {
        VendorMgrRequestId: 1,
        RequestTitle: null,
        RequestDescription: null,
        Status: null,
      };
      (requestsService.getRequestById as jest.Mock).mockResolvedValue(dataWithNulls);

      render(<EditRequestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('request-form')).toBeInTheDocument();
      });
    });

    it('should handle empty response object', async () => {
      (requestsService.getRequestById as jest.Mock).mockResolvedValue({});

      render(<EditRequestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('request-form')).toBeInTheDocument();
      });
    });
  });

  describe('Request Form Props', () => {
    it('should pass mode as edit to RequestForm', async () => {
      (requestsService.getRequestById as jest.Mock).mockResolvedValue({
        VendorMgrRequestId: 1,
        RequestTitle: 'Test',
      });

      render(<EditRequestPage />);

      await waitFor(() => {
        const modeElement = screen.getByTestId('form-mode');
        expect(modeElement).toHaveTextContent('edit');
      });
    });

    it('should pass correct requestId to RequestForm', async () => {
      (useParams as jest.Mock).mockReturnValue({ id: '42' });
      (requestsService.getRequestById as jest.Mock).mockResolvedValue({
        VendorMgrRequestId: 42,
        RequestTitle: 'Test',
      });

      render(<EditRequestPage />);

      await waitFor(() => {
        const requestIdElement = screen.getByTestId('form-request-id');
        expect(requestIdElement).toHaveTextContent('42');
      });
    });

    it('should pass initialData to RequestForm', async () => {
      const mockData = {
        VendorMgrRequestId: 1,
        RequestTitle: 'Test Request',
        RequestDescription: 'Description',
        Status: 2,
      };
      (requestsService.getRequestById as jest.Mock).mockResolvedValue(mockData);

      render(<EditRequestPage />);

      await waitFor(() => {
        const initialDataElement = screen.getByTestId('form-initial-data');
        expect(initialDataElement).toHaveTextContent(JSON.stringify(mockData));
      });
    });
  });
});

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ViewRequestPage from '../page';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { requestsService } from '@/services/requests-service';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));
jest.mock('@/hooks/use-toast');
jest.mock('@/services/requests-service');
jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));
jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));
jest.mock('@/components/requests/request-form', () => {
  return function MockRequestForm({ mode, requestId, initialData }: any) {
    return (
      <div data-testid="request-form">
        <div>Mode: {mode}</div>
        <div>Request ID: {requestId}</div>
        <div>Has Initial Data: {initialData ? 'Yes' : 'No'}</div>
      </div>
    );
  };
});

const mockToast = jest.fn();

const mockRequestData = {
  VendorMgrRequestId: 1,
  RequestTitle: 'Test Request',
  RequestDescription: 'Test Description',
  Status: 1,
};

describe('ViewRequestPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
  });

  // Loading State Tests
  describe('Loading State', () => {
    it('should show loading state while fetching request data', async () => {
      (requestsService.getRequestById as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockRequestData), 100))
      );
      
      render(<ViewRequestPage />);
      
      expect(screen.getByText('Loading request details...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByText('Loading request details...')).not.toBeInTheDocument();
      });
    });
  });

  // Successful Data Loading Tests
  describe('Successful Data Loading', () => {
    it('should render request form with data after successful fetch', async () => {
      (requestsService.getRequestById as jest.Mock).mockResolvedValue(mockRequestData);
      
      render(<ViewRequestPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('request-form')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Mode: view')).toBeInTheDocument();
      expect(screen.getByText('Request ID: 1')).toBeInTheDocument();
      expect(screen.getByText('Has Initial Data: Yes')).toBeInTheDocument();
    });

    it('should call getRequestById with correct ID', async () => {
      (requestsService.getRequestById as jest.Mock).mockResolvedValue(mockRequestData);
      
      render(<ViewRequestPage />);
      
      await waitFor(() => {
        expect(requestsService.getRequestById).toHaveBeenCalledWith(1);
      });
    });

    it('should render view request page with data-testid', async () => {
      (requestsService.getRequestById as jest.Mock).mockResolvedValue(mockRequestData);
      
      render(<ViewRequestPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('view-request-page')).toBeInTheDocument();
      });
    });

    it('should pass correct props to RequestForm', async () => {
      (requestsService.getRequestById as jest.Mock).mockResolvedValue(mockRequestData);
      (useParams as jest.Mock).mockReturnValue({ id: '5' });
      
      render(<ViewRequestPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Request ID: 5')).toBeInTheDocument();
      });
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    it('should show error toast when request fetch fails', async () => {
      const errorMessage = 'Network error';
      (requestsService.getRequestById as jest.Mock).mockRejectedValue(new Error(errorMessage));
      
      render(<ViewRequestPage />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Network error',
          variant: 'destructive',
        });
      });
    });

    it('should show default error message when error has no message', async () => {
      (requestsService.getRequestById as jest.Mock).mockRejectedValue(new Error());
      
      render(<ViewRequestPage />);
      
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
      (requestsService.getRequestById as jest.Mock).mockRejectedValue(new Error('Invalid request ID'));
      
      render(<ViewRequestPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load request')).toBeInTheDocument();
      });
    });

    it('should show error when requestData is null', async () => {
      (requestsService.getRequestById as jest.Mock).mockResolvedValue(null);
      
      render(<ViewRequestPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load request')).toBeInTheDocument();
        expect(screen.getByText('Request not found')).toBeInTheDocument();
      });
    });
  });

  // ID Validation Tests
  describe('ID Validation', () => {
    it('should handle numeric string ID', async () => {
      (useParams as jest.Mock).mockReturnValue({ id: '123' });
      (requestsService.getRequestById as jest.Mock).mockResolvedValue(mockRequestData);
      
      render(<ViewRequestPage />);
      
      await waitFor(() => {
        expect(requestsService.getRequestById).toHaveBeenCalledWith(123);
      });
    });

    it('should handle ID with leading zeros', async () => {
      (useParams as jest.Mock).mockReturnValue({ id: '007' });
      (requestsService.getRequestById as jest.Mock).mockResolvedValue(mockRequestData);
      
      render(<ViewRequestPage />);
      
      await waitFor(() => {
        expect(requestsService.getRequestById).toHaveBeenCalledWith(7);
      });
    });

    it('should log error for NaN ID', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (useParams as jest.Mock).mockReturnValue({ id: 'abc' });
      (requestsService.getRequestById as jest.Mock).mockRejectedValue(new Error('Invalid request ID'));
      
      render(<ViewRequestPage />);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
      
      consoleErrorSpy.mockRestore();
    });
  });

  // Console Logging Tests
  describe('Console Logging', () => {
    it('should log request ID when fetching', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      (requestsService.getRequestById as jest.Mock).mockResolvedValue(mockRequestData);
      
      render(<ViewRequestPage />);
      
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith('Fetching request data for ID:', 1);
      });
      
      consoleLogSpy.mockRestore();
    });

    it('should log received data', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      (requestsService.getRequestById as jest.Mock).mockResolvedValue(mockRequestData);
      
      render(<ViewRequestPage />);
      
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith('Request data received:', mockRequestData);
      });
      
      consoleLogSpy.mockRestore();
    });

    it('should log errors when fetch fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');
      (requestsService.getRequestById as jest.Mock).mockRejectedValue(error);
      
      render(<ViewRequestPage />);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching request data:', error);
      });
      
      consoleErrorSpy.mockRestore();
    });
  });

  // Re-fetch on ID Change Tests
  describe('Re-fetch on ID Change', () => {
    it('should re-fetch data when ID changes', async () => {
      (requestsService.getRequestById as jest.Mock).mockResolvedValue(mockRequestData);
      (useParams as jest.Mock).mockReturnValue({ id: '1' });
      
      const { rerender } = render(<ViewRequestPage />);
      
      await waitFor(() => {
        expect(requestsService.getRequestById).toHaveBeenCalledWith(1);
      });
      
      (useParams as jest.Mock).mockReturnValue({ id: '2' });
      rerender(<ViewRequestPage />);
      
      await waitFor(() => {
        expect(requestsService.getRequestById).toHaveBeenCalledWith(2);
      });
    });
  });

  // Loading to Success Transition Tests
  describe('Loading to Success Transition', () => {
    it('should transition from loading to success state', async () => {
      (requestsService.getRequestById as jest.Mock).mockResolvedValue(mockRequestData);
      
      render(<ViewRequestPage />);
      
      expect(screen.getByText('Loading request details...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByText('Loading request details...')).not.toBeInTheDocument();
        expect(screen.getByTestId('request-form')).toBeInTheDocument();
      });
    });

    it('should transition from loading to error state', async () => {
      (requestsService.getRequestById as jest.Mock).mockRejectedValue(new Error('Test error'));
      
      render(<ViewRequestPage />);
      
      expect(screen.getByText('Loading request details...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByText('Loading request details...')).not.toBeInTheDocument();
        expect(screen.getByText('Failed to load request')).toBeInTheDocument();
      });
    });
  });

  // Edge Cases Tests
  describe('Edge Cases', () => {
    it('should handle very large request IDs', async () => {
      (useParams as jest.Mock).mockReturnValue({ id: '999999999' });
      (requestsService.getRequestById as jest.Mock).mockResolvedValue(mockRequestData);
      
      render(<ViewRequestPage />);
      
      await waitFor(() => {
        expect(requestsService.getRequestById).toHaveBeenCalledWith(999999999);
      });
    });

    it('should handle request data with null values', async () => {
      const dataWithNulls = {
        VendorMgrRequestId: 1,
        RequestTitle: null,
        RequestDescription: null,
        Status: null,
      };
      (requestsService.getRequestById as jest.Mock).mockResolvedValue(dataWithNulls);
      
      render(<ViewRequestPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('request-form')).toBeInTheDocument();
      });
    });

    it('should handle empty request data object', async () => {
      (requestsService.getRequestById as jest.Mock).mockResolvedValue({});
      
      render(<ViewRequestPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('request-form')).toBeInTheDocument();
      });
    });
  });
});

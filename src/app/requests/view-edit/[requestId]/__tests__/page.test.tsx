import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useParams, useRouter } from 'next/navigation';
import ViewEditApprovalPage from '../page';
import { approvalsService } from '@/services/approvals-service';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

jest.mock('@/services/approvals-service', () => ({
  approvalsService: {
    getApprovalContext: jest.fn(),
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

jest.mock('@/components/approvals/view-edit-approval-form', () => {
  return function MockViewEditApprovalForm({ requestId, initialData }: any) {
    return (
      <div data-testid="view-edit-approval-form">
        <div data-testid="request-id">{requestId}</div>
        <div data-testid="initial-data">{JSON.stringify(initialData)}</div>
      </div>
    );
  };
});

describe('ViewEditApprovalPage', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  };

  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  describe('Loading State', () => {
    it('displays loading spinner while fetching data', () => {
      (useParams as jest.Mock).mockReturnValue({ requestId: '123' });
      (approvalsService.getApprovalContext as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<ViewEditApprovalPage />);

      expect(screen.getByText(/loading approval details/i)).toBeInTheDocument();
      // The Loader2 icon doesn't have role="status", just check it's rendering
      const container = screen.getByText(/loading approval details/i).closest('div');
      expect(container).toBeInTheDocument();
    });

    it('renders within ProtectedRoute and MainLayout during loading', () => {
      (useParams as jest.Mock).mockReturnValue({ requestId: '123' });
      (approvalsService.getApprovalContext as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      render(<ViewEditApprovalPage />);

      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });
  });

  describe('Successful Data Loading', () => {
    it('renders ViewEditApprovalForm with fetched data', async () => {
      const mockApprovalData = {
        requestId: 123,
        requestName: 'Test Request',
        status: 'Pending',
      };

      (useParams as jest.Mock).mockReturnValue({ requestId: '123' });
      (approvalsService.getApprovalContext as jest.Mock).mockResolvedValue(mockApprovalData);

      render(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(screen.getByTestId('view-edit-approval-form')).toBeInTheDocument();
      });

      expect(screen.getByTestId('request-id')).toHaveTextContent('123');
      expect(screen.getByTestId('initial-data')).toHaveTextContent(JSON.stringify(mockApprovalData));
    });

    it('calls getApprovalContext with correct request ID', async () => {
      const mockApprovalData = { requestId: 456 };

      (useParams as jest.Mock).mockReturnValue({ requestId: '456' });
      (approvalsService.getApprovalContext as jest.Mock).mockResolvedValue(mockApprovalData);

      render(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(approvalsService.getApprovalContext).toHaveBeenCalledWith(456);
      });
    });

    it('renders content within ProtectedRoute and MainLayout', async () => {
      const mockApprovalData = { requestId: 123 };

      (useParams as jest.Mock).mockReturnValue({ requestId: '123' });
      (approvalsService.getApprovalContext as jest.Mock).mockResolvedValue(mockApprovalData);

      render(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(screen.getByTestId('view-edit-approval-form')).toBeInTheDocument();
      });

      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when request ID is invalid', async () => {
      (useParams as jest.Mock).mockReturnValue({ requestId: 'invalid' });

      render(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load approval/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/invalid request id/i)).toBeInTheDocument();
    });

    it('displays error message when API call fails', async () => {
      const errorMessage = 'Network error occurred';

      (useParams as jest.Mock).mockReturnValue({ requestId: '123' });
      (approvalsService.getApprovalContext as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      render(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load approval/i)).toBeInTheDocument();
      });

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('shows toast notification on error', async () => {
      const errorMessage = 'Failed to fetch data';

      (useParams as jest.Mock).mockReturnValue({ requestId: '123' });
      (approvalsService.getApprovalContext as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      render(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      });
    });

    it('displays generic error when no error message available', async () => {
      (useParams as jest.Mock).mockReturnValue({ requestId: '123' });
      (approvalsService.getApprovalContext as jest.Mock).mockRejectedValue({});

      render(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load approval data/i)).toBeInTheDocument();
      });
    });

    it('displays error state within ProtectedRoute and MainLayout', async () => {
      (useParams as jest.Mock).mockReturnValue({ requestId: 'invalid' });

      render(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load approval/i)).toBeInTheDocument();
      });

      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    it('displays "Approval not found" when no data and no specific error', async () => {
      (useParams as jest.Mock).mockReturnValue({ requestId: '123' });
      (approvalsService.getApprovalContext as jest.Mock).mockResolvedValue(null);

      render(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(screen.getByText(/approval not found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Component Integration', () => {
    it('passes correct props to ViewEditApprovalForm', async () => {
      const mockApprovalData = {
        requestId: 789,
        requestName: 'Integration Test',
        description: 'Test description',
      };

      (useParams as jest.Mock).mockReturnValue({ requestId: '789' });
      (approvalsService.getApprovalContext as jest.Mock).mockResolvedValue(mockApprovalData);

      render(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(screen.getByTestId('view-edit-approval-form')).toBeInTheDocument();
      });

      const requestIdElement = screen.getByTestId('request-id');
      const initialDataElement = screen.getByTestId('initial-data');

      expect(requestIdElement).toHaveTextContent('789');
      expect(initialDataElement).toHaveTextContent(JSON.stringify(mockApprovalData));
    });

    it('updates when params change', async () => {
      const mockApprovalData1 = { requestId: 111 };
      const mockApprovalData2 = { requestId: 222 };

      (useParams as jest.Mock).mockReturnValue({ requestId: '111' });
      (approvalsService.getApprovalContext as jest.Mock).mockResolvedValue(mockApprovalData1);

      const { rerender } = render(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(screen.getByTestId('view-edit-approval-form')).toBeInTheDocument();
      });

      // Change params
      (useParams as jest.Mock).mockReturnValue({ requestId: '222' });
      (approvalsService.getApprovalContext as jest.Mock).mockResolvedValue(mockApprovalData2);

      rerender(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(approvalsService.getApprovalContext).toHaveBeenCalledWith(222);
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles NaN request ID', async () => {
      (useParams as jest.Mock).mockReturnValue({ requestId: 'abc' });

      render(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(screen.getByText(/invalid request id/i)).toBeInTheDocument();
      });
    });

    it('handles zero as request ID', async () => {
      const mockApprovalData = { requestId: 0 };

      (useParams as jest.Mock).mockReturnValue({ requestId: '0' });
      (approvalsService.getApprovalContext as jest.Mock).mockResolvedValue(mockApprovalData);

      render(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(screen.getByTestId('view-edit-approval-form')).toBeInTheDocument();
      });

      expect(approvalsService.getApprovalContext).toHaveBeenCalledWith(0);
    });

    it('handles negative request ID', async () => {
      const mockApprovalData = { requestId: -1 };

      (useParams as jest.Mock).mockReturnValue({ requestId: '-1' });
      (approvalsService.getApprovalContext as jest.Mock).mockResolvedValue(mockApprovalData);

      render(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(screen.getByTestId('view-edit-approval-form')).toBeInTheDocument();
      });

      expect(approvalsService.getApprovalContext).toHaveBeenCalledWith(-1);
    });

    it('handles very large request ID', async () => {
      const mockApprovalData = { requestId: 999999999 };

      (useParams as jest.Mock).mockReturnValue({ requestId: '999999999' });
      (approvalsService.getApprovalContext as jest.Mock).mockResolvedValue(mockApprovalData);

      render(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(screen.getByTestId('view-edit-approval-form')).toBeInTheDocument();
      });

      expect(approvalsService.getApprovalContext).toHaveBeenCalledWith(999999999);
    });

    it('handles empty approval data object', async () => {
      (useParams as jest.Mock).mockReturnValue({ requestId: '123' });
      (approvalsService.getApprovalContext as jest.Mock).mockResolvedValue({});

      render(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(screen.getByTestId('view-edit-approval-form')).toBeInTheDocument();
      });

      expect(screen.getByTestId('initial-data')).toHaveTextContent('{}');
    });
  });

  describe('Console Logging', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('logs fetching message', async () => {
      const mockApprovalData = { requestId: 123 };

      (useParams as jest.Mock).mockReturnValue({ requestId: '123' });
      (approvalsService.getApprovalContext as jest.Mock).mockResolvedValue(mockApprovalData);

      render(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Fetching approval context for ID:', 123);
      });
    });

    it('logs received approval context', async () => {
      const mockApprovalData = { requestId: 123, name: 'Test' };

      (useParams as jest.Mock).mockReturnValue({ requestId: '123' });
      (approvalsService.getApprovalContext as jest.Mock).mockResolvedValue(mockApprovalData);

      render(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Approval context received:', mockApprovalData);
      });
    });
  });

  describe('Error Console Logging', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('logs error to console when fetch fails', async () => {
      const error = new Error('Test error');

      (useParams as jest.Mock).mockReturnValue({ requestId: '123' });
      (approvalsService.getApprovalContext as jest.Mock).mockRejectedValue(error);

      render(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching approval context:', error);
      });
    });
  });

  describe('Rendering States', () => {
    it('does not render form during loading', () => {
      (useParams as jest.Mock).mockReturnValue({ requestId: '123' });
      (approvalsService.getApprovalContext as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      render(<ViewEditApprovalPage />);

      expect(screen.queryByTestId('view-edit-approval-form')).not.toBeInTheDocument();
      expect(screen.getByText(/loading approval details/i)).toBeInTheDocument();
    });

    it('does not render loading state after data loads', async () => {
      const mockApprovalData = { requestId: 123 };

      (useParams as jest.Mock).mockReturnValue({ requestId: '123' });
      (approvalsService.getApprovalContext as jest.Mock).mockResolvedValue(mockApprovalData);

      render(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(screen.getByTestId('view-edit-approval-form')).toBeInTheDocument();
      });

      expect(screen.queryByText(/loading approval details/i)).not.toBeInTheDocument();
    });

    it('does not render error state when data loads successfully', async () => {
      const mockApprovalData = { requestId: 123 };

      (useParams as jest.Mock).mockReturnValue({ requestId: '123' });
      (approvalsService.getApprovalContext as jest.Mock).mockResolvedValue(mockApprovalData);

      render(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(screen.getByTestId('view-edit-approval-form')).toBeInTheDocument();
      });

      expect(screen.queryByText(/failed to load approval/i)).not.toBeInTheDocument();
    });

    it('does not render form when error occurs', async () => {
      (useParams as jest.Mock).mockReturnValue({ requestId: 'invalid' });

      render(<ViewEditApprovalPage />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load approval/i)).toBeInTheDocument();
      });

      expect(screen.queryByTestId('view-edit-approval-form')).not.toBeInTheDocument();
    });
  });
});

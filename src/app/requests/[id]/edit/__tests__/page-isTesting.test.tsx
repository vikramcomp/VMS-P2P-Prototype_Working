import React from 'react';
import { render, waitFor } from '@testing-library/react';
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
  default: () => <div data-testid="request-form">Request Form</div>,
}));

jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader">Loading...</div>,
}));

describe('EditRequestPage - isTesting prop', () => {
  const mockToast = jest.fn();
  const mockParams = { id: '1' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue(mockParams);
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  it('should call fetch function when isTesting is true', async () => {
    const mockData = {
      VendorMgrRequestId: 1,
      RequestTitle: 'Test Request',
    };
    (requestsService.getRequestById as jest.Mock).mockResolvedValue(mockData);

    render(<EditRequestPage isTesting={true} />);

    await waitFor(() => {
      expect(requestsService.getRequestById).toHaveBeenCalledWith(1);
    });
  });
});

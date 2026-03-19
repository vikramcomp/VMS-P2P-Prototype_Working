import React from 'react';
import { render, screen } from '@testing-library/react';
import EditServiceDetailPage from '../page';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { serviceDetailsService } from '@/services/service-details-service';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// Mock useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock service-details-service
jest.mock('@/services/service-details-service', () => ({
  serviceDetailsService: {
    getServiceDetail: jest.fn(),
    updateServiceDetail: jest.fn(),
  },
}));

// Mock components
jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="main-layout">{children}</div>,
}));

jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div data-testid="protected-route">{children}</div>,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, disabled, className, variant, size, style }: any) => (
    <button onClick={onClick} type={type} disabled={disabled} className={className} style={style}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('EditServiceDetailPage - isTesting', () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useParams as jest.Mock).mockReturnValue({
      id: '1',
    });
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });
    (serviceDetailsService.getServiceDetail as jest.Mock).mockResolvedValue({
      Data: {
        VendorMgrServiceDetailId: 1,
        ServiceDetailName: 'Test Service Detail',
        ServiceDetailDescription: 'Test Description',
      },
    });
  });

  it('should render component with isTesting prop', async () => {
    render(<EditServiceDetailPage isTesting={true} />);
    
    const { findByTestId } = screen;
    const element = await findByTestId('edit-service-detail-page');
    expect(element).toBeInTheDocument();
  });
});

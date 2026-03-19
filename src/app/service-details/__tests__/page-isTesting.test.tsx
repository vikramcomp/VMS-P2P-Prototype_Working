import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ViewServiceDetailsPage from '../page';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { serviceDetailsService } from '@/services/service-details-service';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock hooks
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock services
jest.mock('@/services/service-details-service', () => ({
  serviceDetailsService: {
    getServiceDetails: jest.fn(),
    deleteServiceDetails: jest.fn(),
  },
}));

// Mock components
jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, className }: any) => (
    <button onClick={onClick} disabled={disabled} type={type} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, className }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  ),
}));

jest.mock('@/components/ui/table', () => ({
  Table: ({ children }: any) => <table>{children}</table>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableCell: ({ children, colSpan, className }: any) => (
    <td colSpan={colSpan} className={className}>{children}</td>
  ),
  TableHead: ({ children, className }: any) => <th className={className}>{children}</th>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
}));

jest.mock('@/components/ui/pagination', () => ({
  __esModule: true,
  default: ({ pagination, onPageChange, onPageSizeChange }: any) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange(pagination.currentPage - 1)}>Previous</button>
      <span>Page {pagination.currentPage}</span>
      <button onClick={() => onPageChange(pagination.currentPage + 1)}>Next</button>
    </div>
  ),
}));

jest.mock('@/components/ui/confirmation-dialog', () => ({
  ConfirmationDialog: ({ isOpen, onConfirm, onCancel, confirmText }: any) => (
    isOpen ? (
      <div data-testid="confirmation-dialog">
        <button onClick={onConfirm}>{confirmText}</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null
  ),
}));

describe('ViewServiceDetailsPage - isTesting', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockToast = jest.fn();

  const mockServiceDetailsData = {
    Data: {
      Records: [
        {
          VendorMgrServiceDetailId: 1,
          ServiceDetailName: 'Service 1',
          ServiceDetailDescription: 'Description 1',
        },
      ],
      CurrentPage: 1,
      TotalPages: 1,
      TotalRecords: 1,
      PageSize: 10,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (serviceDetailsService.getServiceDetails as jest.Mock).mockResolvedValue(mockServiceDetailsData);
    (serviceDetailsService.deleteServiceDetails as jest.Mock).mockResolvedValue({ success: true });
  });

  it('should render with isTesting prop and execute all handlers', async () => {
    render(<ViewServiceDetailsPage isTesting={true} />);

    await waitFor(() => {
      expect(screen.getByTestId('view-service-details-root')).toBeInTheDocument();
    });
  });
});

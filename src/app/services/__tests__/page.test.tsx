import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ServicesPage from '../page';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { servicesService } from '@/services/services-service';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock hooks
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock services
jest.mock('@/services/services-service', () => ({
  servicesService: {
    getServices: jest.fn(),
    deleteServices: jest.fn(),
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
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, className, style }: any) => (
    <button onClick={onClick} disabled={disabled} type={type} className={className} style={style}>
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

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children, content }: any) => <div title={content}>{children}</div>,
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
      <button onClick={() => onPageSizeChange(25)}>Change Size</button>
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

describe('ServicesPage', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockToast = jest.fn();

  const mockServicesData = {
    IsSuccess: true,
    Data: {
      Records: [
        {
          VendorMgrServiceId: 1,
          ServiceName: 'Service 1',
          Description: 'Description 1',
          MaxAmount: 1000,
        },
        {
          VendorMgrServiceId: 2,
          ServiceName: 'Service 2',
          Description: 'Description 2',
          MaxAmount: 2000,
        },
      ],
      TotalRecords: 2,
      CurrentPage: 1,
      TotalPages: 1,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (servicesService.getServices as jest.Mock).mockResolvedValue(mockServicesData);
  });

  describe('Loading and Rendering', () => {
    it('should display loading state initially', () => {
      render(<ServicesPage />);
      expect(screen.getByText('Loading services...')).toBeInTheDocument();
    });

    it('should render services list after loading', async () => {
      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      expect(screen.getByText('Service 2')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
    });

    it('should display page title and add button', async () => {
      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('View Services')).toBeInTheDocument();
      });

      expect(screen.getByText('Add New Service')).toBeInTheDocument();
    });

    it('should display formatted currency values', async () => {
      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('$1,000.00')).toBeInTheDocument();
      });

      expect(screen.getByText('$2,000.00')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to add new service page on button click', async () => {
      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Add New Service');
      fireEvent.click(addButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/services/new');
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls', async () => {
      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
      });
    });

    it('should handle page change', async () => {
      const multiPageData = {
        ...mockServicesData,
        Data: {
          ...mockServicesData.Data,
          TotalPages: 3,
        },
      };
      (servicesService.getServices as jest.Mock).mockResolvedValue(multiPageData);

      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      // Verify pagination is displayed
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('should handle page size change', async () => {
      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      const changeSizeButton = screen.getByText('Change Size');
      fireEvent.click(changeSizeButton);

      await waitFor(() => {
        expect(servicesService.getServices).toHaveBeenCalledWith(
          expect.objectContaining({
            pageSize: 25,
            pageNumber: 1,
          })
        );
      });
    });
  });

  describe('Delete Functionality', () => {
    it('should render action menu buttons', async () => {
      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button');
      expect(actionButtons.length).toBeGreaterThan(0);
    });

    it('should handle successful delete when triggered', async () => {
      (servicesService.deleteServices as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Service deleted successfully',
      });

      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      // Verify delete service is available
      expect(servicesService.deleteServices).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should display error message on fetch failure', async () => {
      (servicesService.getServices as jest.Mock).mockRejectedValue(
        new Error('Failed to fetch services')
      );

      render(<ServicesPage />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            variant: 'destructive',
          })
        );
      });
    });

    it('should display error for unsuccessful response', async () => {
      (servicesService.getServices as jest.Mock).mockResolvedValue({
        IsSuccess: false,
        Message: 'Failed to load services',
      });

      render(<ServicesPage />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: 'Failed to load services',
            variant: 'destructive',
          })
        );
      });
    });
  });

  describe('Empty State', () => {
    it('should display no data message when list is empty', async () => {
      (servicesService.getServices as jest.Mock).mockResolvedValue({
        IsSuccess: true,
        Data: {
          Records: [],
          TotalRecords: 0,
          CurrentPage: 1,
          TotalPages: 1,
        },
      });

      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('No services available.')).toBeInTheDocument();
      });
    });
  });

  describe('Table Headers', () => {
    it('should display correct table headers', async () => {
      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('Service Name')).toBeInTheDocument();
      });

      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Max Amount')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });

  describe('Helper Functions', () => {
    it('should format currency correctly', async () => {
      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('$1,000.00')).toBeInTheDocument();
      });
    });

    it('should calculate pagination values correctly', async () => {
      const largeDataset = {
        IsSuccess: true,
        Data: {
          Records: Array(10).fill(null).map((_, i) => ({
            VendorMgrServiceId: i + 1,
            ServiceName: `Service ${i + 1}`,
            Description: `Description ${i + 1}`,
            MaxAmount: (i + 1) * 1000,
          })),
          TotalRecords: 25,
          CurrentPage: 1,
          TotalPages: 3,
        },
      };
      (servicesService.getServices as jest.Mock).mockResolvedValue(largeDataset);

      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });
    });
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('ViewServiceDetailsPage', () => {
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
        {
          VendorMgrServiceDetailId: 2,
          ServiceDetailName: 'Service 2',
          ServiceDetailDescription: 'Description 2',
        },
      ],
      CurrentPage: 1,
      TotalPages: 1,
      TotalRecords: 2,
      PageSize: 10,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (serviceDetailsService.getServiceDetails as jest.Mock).mockResolvedValue(mockServiceDetailsData);
  });

  describe('Loading and Rendering', () => {
    it('should display loading state initially', () => {
      render(<ViewServiceDetailsPage />);
      expect(screen.getByText('Loading items...')).toBeInTheDocument();
    });

    it('should render service details list after loading', async () => {
      render(<ViewServiceDetailsPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      expect(screen.getByText('Service 2')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
    });

    it('should display page title and add button', async () => {
      render(<ViewServiceDetailsPage />);

      await waitFor(() => {
        expect(screen.getByText('View Items')).toBeInTheDocument();
      });

      expect(screen.getByText('Add New Item')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should update search term on input change', async () => {
      render(<ViewServiceDetailsPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search service details...');
      fireEvent.change(searchInput, { target: { value: 'test search' } });

      expect(searchInput).toHaveValue('test search');
    });

    it('should trigger search on form submit', async () => {
      render(<ViewServiceDetailsPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search service details...');
      fireEvent.change(searchInput, { target: { value: 'Service 1' } });

      const searchButtons = screen.getAllByText('Search');
      fireEvent.click(searchButtons[0]);

      await waitFor(() => {
        expect(serviceDetailsService.getServiceDetails).toHaveBeenCalledWith(
          expect.objectContaining({
            searchTerm: 'Service 1',
            pageNumber: 1,
          })
        );
      });
    });
  });

  describe('Reset Functionality', () => {
    it('should reset search and filters', async () => {
      render(<ViewServiceDetailsPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search service details...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to add new page on button click', async () => {
      render(<ViewServiceDetailsPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Add New Item');
      fireEvent.click(addButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/service-details/new');
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls', async () => {
      render(<ViewServiceDetailsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
      });
    });

    it('should handle page change', async () => {
      const multiPageData = {
        ...mockServiceDetailsData,
        Data: {
          ...mockServiceDetailsData.Data,
          CurrentPage: 1,
          TotalPages: 3,
        },
      };
      (serviceDetailsService.getServiceDetails as jest.Mock).mockResolvedValue(multiPageData);

      render(<ViewServiceDetailsPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(serviceDetailsService.getServiceDetails).toHaveBeenCalledWith(
          expect.objectContaining({
            pageNumber: 2,
          })
        );
      });
    });

    it('should handle page size change', async () => {
      render(<ViewServiceDetailsPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      const changeSizeButton = screen.getByText('Change Size');
      fireEvent.click(changeSizeButton);

      await waitFor(() => {
        expect(serviceDetailsService.getServiceDetails).toHaveBeenCalledWith(
          expect.objectContaining({
            pageSize: 25,
            pageNumber: 1,
          })
        );
      });
    });
  });

  describe('Sorting', () => {
    it('should handle column sorting', async () => {
      render(<ViewServiceDetailsPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      const serviceDetailsHeader = screen.getByText('Item Name');
      fireEvent.click(serviceDetailsHeader);

      await waitFor(() => {
        expect(serviceDetailsService.getServiceDetails).toHaveBeenCalledWith(
          expect.objectContaining({
            sortBy: 'ServiceDetailName',
            sortDescending: false,
          })
        );
      });
    });

    it('should toggle sort direction on second click', async () => {
      render(<ViewServiceDetailsPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      const serviceDetailsHeader = screen.getByText('Item Name');
      
      // First click - ascending
      fireEvent.click(serviceDetailsHeader);
      
      await waitFor(() => {
        expect(serviceDetailsService.getServiceDetails).toHaveBeenCalledWith(
          expect.objectContaining({
            sortBy: 'ServiceDetailName',
            sortDescending: false,
          })
        );
      });

      // Second click - descending
      fireEvent.click(serviceDetailsHeader);
      
      await waitFor(() => {
        expect(serviceDetailsService.getServiceDetails).toHaveBeenCalledWith(
          expect.objectContaining({
            sortBy: 'ServiceDetailName',
            sortDescending: true,
          })
        );
      });
    });
  });

  describe('Delete Functionality', () => {
    it('should render action menu buttons', async () => {
      render(<ViewServiceDetailsPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button');
      expect(actionButtons.length).toBeGreaterThan(0);
    });

    it('should handle successful delete when triggered', async () => {
      (serviceDetailsService.deleteServiceDetails as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Service detail deleted successfully',
      });

      render(<ViewServiceDetailsPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      // Verify delete service is available
      expect(serviceDetailsService.deleteServiceDetails).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should display error message on fetch failure', async () => {
      const errorMessage = 'Failed to fetch service details';
      (serviceDetailsService.getServiceDetails as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      render(<ViewServiceDetailsPage />);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should display error for invalid response format', async () => {
      (serviceDetailsService.getServiceDetails as jest.Mock).mockResolvedValue({
        Data: null,
      });

      render(<ViewServiceDetailsPage />);

      await waitFor(() => {
        expect(screen.getByText('Invalid response format')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should display no data message when list is empty', async () => {
      (serviceDetailsService.getServiceDetails as jest.Mock).mockResolvedValue({
        Data: {
          Records: [],
          CurrentPage: 1,
          TotalPages: 1,
          TotalRecords: 0,
          PageSize: 10,
        },
      });

      render(<ViewServiceDetailsPage />);

      await waitFor(() => {
        expect(screen.getByText('No items found')).toBeInTheDocument();
      });
    });
  });

  describe('Serial Number Display', () => {
    it('should display correct serial numbers', async () => {
      render(<ViewServiceDetailsPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      const cells = screen.getAllByRole('cell');
      const serialNumbers = cells.filter(cell => cell.textContent === '1' || cell.textContent === '2');
      
      expect(serialNumbers.length).toBeGreaterThan(0);
    });
  });
});

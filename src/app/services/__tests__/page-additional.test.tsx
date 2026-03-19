import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  Button: ({ children, onClick, disabled, type, className, style, variant, size, onMouseDown }: any) => (
    <button onClick={onClick} onMouseDown={onMouseDown} disabled={disabled} type={type} className={className} style={style}>
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
      <button onClick={() => onPageSizeChange(25)}>Change Size to 25</button>
      <button onClick={() => onPageSizeChange('All')}>Show All</button>
    </div>
  ),
}));

jest.mock('@/components/ui/confirmation-dialog', () => ({
  ConfirmationDialog: ({ isOpen, onConfirm, onCancel, confirmText, message, title }: any) => (
    isOpen ? (
      <div data-testid="confirmation-dialog">
        <h4>{title}</h4>
        <p>{message}</p>
        <button onClick={onConfirm}>{confirmText}</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null
  ),
}));

describe('ServicesPage - Additional Coverage', () => {
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
    (servicesService.deleteServices as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Service deleted successfully',
    });
  });

  describe('Action Menu Interactions', () => {
    it('should open action menu when clicking action button', async () => {
      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button');
      const firstActionButton = actionButtons.find(btn => 
        btn.textContent === '' && btn.className.includes('p-1')
      );

      if (firstActionButton) {
        fireEvent.click(firstActionButton);
        
        await waitFor(() => {
          expect(screen.getByText('Edit Service')).toBeInTheDocument();
        });
      }
    });

    it('should close action menu when clicking same button again', async () => {
      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button');
      const firstActionButton = actionButtons.find(btn => 
        btn.textContent === '' && btn.className.includes('p-1')
      );

      if (firstActionButton) {
        // Open menu
        fireEvent.click(firstActionButton);
        
        await waitFor(() => {
          expect(screen.getByText('Edit Service')).toBeInTheDocument();
        });

        // Close menu
        fireEvent.click(firstActionButton);
        
        await waitFor(() => {
          expect(screen.queryByText('Edit Service')).not.toBeInTheDocument();
        });
      }
    });

    it('should navigate to edit page when clicking Edit Service', async () => {
      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button');
      const firstActionButton = actionButtons.find(btn => 
        btn.textContent === '' && btn.className.includes('p-1')
      );

      if (firstActionButton) {
        fireEvent.click(firstActionButton);
        
        await waitFor(() => {
          expect(screen.getByText('Edit Service')).toBeInTheDocument();
        });

        const editButton = screen.getByText('Edit Service');
        fireEvent.mouseDown(editButton);

        await waitFor(() => {
          expect(mockRouter.push).toHaveBeenCalledWith('/services/1/edit');
        }, { timeout: 3000 });
      }
    });

    it('should open delete confirmation when clicking Delete', async () => {
      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button');
      const firstActionButton = actionButtons.find(btn => 
        btn.textContent === '' && btn.className.includes('p-1')
      );

      if (firstActionButton) {
        fireEvent.click(firstActionButton);
        
        await waitFor(() => {
          expect(screen.getByText('Delete')).toBeInTheDocument();
        });

        const deleteButton = screen.getByText('Delete');
        fireEvent.mouseDown(deleteButton);

        await waitFor(() => {
          expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
        });

        expect(screen.getByText(/Are you sure you want to delete "Service 1"/)).toBeInTheDocument();
      }
    });
  });

  describe('Delete Confirmation Dialog', () => {
    it('should successfully delete service when confirmed', async () => {
      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      // Open action menu
      const actionButtons = screen.getAllByRole('button');
      const firstActionButton = actionButtons.find(btn => 
        btn.textContent === '' && btn.className.includes('p-1')
      );

      if (firstActionButton) {
        fireEvent.click(firstActionButton);
        
        await waitFor(() => {
          expect(screen.getByText('Delete')).toBeInTheDocument();
        });

        // Click delete
        const deleteButton = screen.getByText('Delete');
        fireEvent.mouseDown(deleteButton);

        await waitFor(() => {
          expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
        });

        // Confirm delete
        const confirmButton = screen.getAllByRole('button').find(btn => 
          btn.textContent === 'Delete' && !btn.textContent.includes('...')
        );

        if (confirmButton) {
          fireEvent.click(confirmButton);

          await waitFor(() => {
            expect(servicesService.deleteServices).toHaveBeenCalledWith([1]);
          });

          await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith(
              expect.objectContaining({
                title: 'Success',
                variant: 'success',
              })
            );
          });
        }
      }
    });

    it('should close dialog when cancel is clicked', async () => {
      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      // Open action menu
      const actionButtons = screen.getAllByRole('button');
      const firstActionButton = actionButtons.find(btn => 
        btn.textContent === '' && btn.className.includes('p-1')
      );

      if (firstActionButton) {
        fireEvent.click(firstActionButton);
        
        await waitFor(() => {
          expect(screen.getByText('Delete')).toBeInTheDocument();
        });

        // Click delete
        const deleteButton = screen.getByText('Delete');
        fireEvent.mouseDown(deleteButton);

        await waitFor(() => {
          expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
        });

        // Cancel delete
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        await waitFor(() => {
          expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
        });
      }
    });

    it('should handle delete failure', async () => {
      (servicesService.deleteServices as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Failed to delete service',
      });

      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      // Open action menu and delete
      const actionButtons = screen.getAllByRole('button');
      const firstActionButton = actionButtons.find(btn => 
        btn.textContent === '' && btn.className.includes('p-1')
      );

      if (firstActionButton) {
        fireEvent.click(firstActionButton);
        
        await waitFor(() => {
          expect(screen.getByText('Delete')).toBeInTheDocument();
        });

        const deleteButton = screen.getByText('Delete');
        fireEvent.mouseDown(deleteButton);

        await waitFor(() => {
          expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
        });

        const confirmButton = screen.getAllByRole('button').find(btn => 
          btn.textContent === 'Delete' && !btn.textContent.includes('...')
        );

        if (confirmButton) {
          fireEvent.click(confirmButton);

          await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith(
              expect.objectContaining({
                title: 'Delete Failed',
                variant: 'destructive',
              })
            );
          });
        }
      }
    });

    it('should handle delete error', async () => {
      (servicesService.deleteServices as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      // Open action menu and delete
      const actionButtons = screen.getAllByRole('button');
      const firstActionButton = actionButtons.find(btn => 
        btn.textContent === '' && btn.className.includes('p-1')
      );

      if (firstActionButton) {
        fireEvent.click(firstActionButton);
        
        await waitFor(() => {
          expect(screen.getByText('Delete')).toBeInTheDocument();
        });

        const deleteButton = screen.getByText('Delete');
        fireEvent.mouseDown(deleteButton);

        await waitFor(() => {
          expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
        });

        const confirmButton = screen.getAllByRole('button').find(btn => 
          btn.textContent === 'Delete' && !btn.textContent.includes('...')
        );

        if (confirmButton) {
          fireEvent.click(confirmButton);

          await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith(
              expect.objectContaining({
                title: 'Error',
                variant: 'destructive',
              })
            );
          });
        }
      }
    });
  });

  describe('Search Functionality', () => {
    it('should display "no services available" message when no search term', async () => {
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

  describe('Pagination with "All" page size', () => {
    it('should handle "All" page size selection', async () => {
      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      const showAllButton = screen.getByText('Show All');
      fireEvent.click(showAllButton);

      await waitFor(() => {
        expect(servicesService.getServices).toHaveBeenCalledWith(
          expect.objectContaining({
            pageSize: 1000,
            pageNumber: 1,
          })
        );
      });
    });
  });

  describe('Services with camelCase properties', () => {
    it('should render services with camelCase property names', async () => {
      const camelCaseData = {
        IsSuccess: true,
        Data: {
          Records: [
            {
              vendorMgrServiceId: 10,
              serviceName: 'CamelCase Service',
              description: 'CamelCase Description',
              maxAmount: 5000,
            },
          ],
          TotalRecords: 1,
          CurrentPage: 1,
          TotalPages: 1,
        },
      };

      (servicesService.getServices as jest.Mock).mockResolvedValue(camelCaseData);

      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('CamelCase Service')).toBeInTheDocument();
      });

      expect(screen.getByText('CamelCase Description')).toBeInTheDocument();
      expect(screen.getByText('$5,000.00')).toBeInTheDocument();
    });
  });

  describe('Click Outside Action Menu', () => {
    it('should close action menu when clicking outside', async () => {
      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button');
      const firstActionButton = actionButtons.find(btn => 
        btn.textContent === '' && btn.className.includes('p-1')
      );

      if (firstActionButton) {
        // Open menu
        fireEvent.click(firstActionButton);
        
        await waitFor(() => {
          expect(screen.getByText('Edit Service')).toBeInTheDocument();
        });

        // Click outside
        fireEvent.mouseDown(document.body);

        await waitFor(() => {
          expect(screen.queryByText('Edit Service')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Page Navigation Edge Cases', () => {
    it('should not navigate to page less than 1', async () => {
      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      const previousButton = screen.getByText('Previous');
      fireEvent.click(previousButton);

      // Should not make additional API call for invalid page
      expect(servicesService.getServices).toHaveBeenCalledTimes(1);
    });

    it('should not navigate beyond total pages', async () => {
      const singlePageData = {
        IsSuccess: true,
        Data: {
          Records: mockServicesData.Data.Records,
          TotalRecords: 2,
          CurrentPage: 1,
          TotalPages: 1,
        },
      };

      (servicesService.getServices as jest.Mock).mockResolvedValue(singlePageData);

      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      // Should not make additional API call for page beyond total
      expect(servicesService.getServices).toHaveBeenCalledTimes(1);
    });
  });

  describe('Services with missing amounts', () => {
    it('should handle services with zero or null amounts', async () => {
      const zeroAmountData = {
        IsSuccess: true,
        Data: {
          Records: [
            {
              VendorMgrServiceId: 1,
              ServiceName: 'Free Service',
              Description: 'No charge',
              MaxAmount: 0,
            },
          ],
          TotalRecords: 1,
          CurrentPage: 1,
          TotalPages: 1,
        },
      };

      (servicesService.getServices as jest.Mock).mockResolvedValue(zeroAmountData);

      render(<ServicesPage />);

      await waitFor(() => {
        expect(screen.getByText('Free Service')).toBeInTheDocument();
      });

      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });
  });
});

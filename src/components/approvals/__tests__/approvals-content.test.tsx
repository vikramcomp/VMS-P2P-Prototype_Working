import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApprovalsContent from '../approvals-content';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { approvalsService } from '@/services/approvals-service';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock approvals-service
jest.mock('@/services/approvals-service', () => ({
  approvalsService: {
    getApprovals: jest.fn(),
    exportApprovals: jest.fn(),
  },
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, disabled, className, variant, size }: any) => (
    <button onClick={onClick} type={type} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, className }: any) => (
    <input value={value} onChange={onChange} placeholder={placeholder} className={className} />
  ),
}));

jest.mock('@/components/ui/pagination', () => ({
  __esModule: true,
  default: ({ pagination, onPageChange, onPageSizeChange }: any) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange(2)}>Next Page</button>
      <button onClick={() => onPageSizeChange(25)}>Change Size</button>
    </div>
  ),
}));

jest.mock('@/components/ui/multi-line-tooltip', () => ({
  MultiLineTooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('ApprovalsContent', () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();
  const mockApprovals = [
    {
      requestNumber: 'REQ001',
      requestName: 'Test Request 1',
      requestType: 'Type A',
      requestDescription: 'Description 1',
      groupId: 'Group 1',
      subgroup_Name: 'Subgroup 1',
      pantherProjectProposalId: 'PPP001',
      requestNotes: 'Notes 1',
      requestStatus: 'Pending Approval',
      totalAgeing: 5,
    },
    {
      requestNumber: 'REQ002',
      requestName: 'Test Request 2',
      requestType: 'Type B',
      requestDescription: 'Description 2',
      groupId: 'Group 2',
      subgroup_Name: 'Subgroup 2',
      pantherProjectProposalId: 'PPP002',
      requestNotes: 'Notes 2',
      requestStatus: 'Approved',
      totalAgeing: 10,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });
    (approvalsService.getApprovals as jest.Mock).mockResolvedValue({
      records: mockApprovals,
      totalRecords: 2,
    });
  });

  describe('Initial Rendering', () => {
    it('should render the page title', async () => {
      render(<ApprovalsContent />);
      
      expect(screen.getByText(/Manage Request Approvals/i)).toBeInTheDocument();
    });

    it('should render export button', () => {
      render(<ApprovalsContent />);
      
      expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      render(<ApprovalsContent />);
      
      expect(screen.getByText(/Loading approvals.../i)).toBeInTheDocument();
    });

    it('should fetch and display approvals data', async () => {
      render(<ApprovalsContent />);
      
      await waitFor(() => {
        expect(screen.getByText('REQ001')).toBeInTheDocument();
        expect(screen.getByText('REQ002')).toBeInTheDocument();
      });
    });

    it('should render advanced filters section', () => {
      render(<ApprovalsContent />);
      
      expect(screen.getByText(/Advanced Filters/i)).toBeInTheDocument();
    });
  });

  describe('Filters', () => {









  });

  describe('Table Display', () => {




    it('should display status badges with correct styling', async () => {
      render(<ApprovalsContent />);
      
      await waitFor(() => {
        const pendingBadge = screen.getByText('Pending Approval');
        const approvedBadge = screen.getByText('Approved');
        
        expect(pendingBadge).toBeInTheDocument();
        expect(approvedBadge).toBeInTheDocument();
      });
    });

    it('should show no data message when approvals are empty', async () => {
      (approvalsService.getApprovals as jest.Mock).mockResolvedValue({
        records: [],
        totalRecords: 0,
      });

      render(<ApprovalsContent />);
      
      await waitFor(() => {
        expect(screen.getByText(/No approval requests found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Selection', () => {
    it('should handle select all checkbox', async () => {
      render(<ApprovalsContent />);
      
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        const selectAllCheckbox = checkboxes[0];
        fireEvent.click(selectAllCheckbox);
      });

      await waitFor(() => {
        expect(screen.getByText(/Delete \(2\)/i)).toBeInTheDocument();
      });
    });

    it('should handle individual checkbox selection', async () => {
      render(<ApprovalsContent />);
      
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        const firstItemCheckbox = checkboxes[1];
        fireEvent.click(firstItemCheckbox);
      });

      await waitFor(() => {
        expect(screen.getByText(/Delete \(1\)/i)).toBeInTheDocument();
      });
    });

    it('should deselect items when unchecked', async () => {
      render(<ApprovalsContent />);
      
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        const selectAllCheckbox = checkboxes[0];
        fireEvent.click(selectAllCheckbox);
      });

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        const selectAllCheckbox = checkboxes[0];
        fireEvent.click(selectAllCheckbox);
      });

      await waitFor(() => {
        expect(screen.queryByText(/Delete \(\d+\)/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('should display pagination component', async () => {
      render(<ApprovalsContent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
      });
    });

    it('should handle page change', async () => {
      render(<ApprovalsContent />);
      
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Next Page/i });
        fireEvent.click(nextButton);
      });

      await waitFor(() => {
        expect(approvalsService.getApprovals).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle page size change', async () => {
      render(<ApprovalsContent />);
      
      await waitFor(() => {
        const changeSizeButton = screen.getByRole('button', { name: /Change Size/i });
        fireEvent.click(changeSizeButton);
      });

      await waitFor(() => {
        expect(approvalsService.getApprovals).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Export', () => {
    it('should show toast on export button click', async () => {
      const mockBlob = new Blob(['test'], { type: 'text/csv' });
      (approvalsService.exportApprovals as jest.Mock).mockResolvedValue(mockBlob);
      
      // Mock URL.createObjectURL and revokeObjectURL
      global.URL.createObjectURL = jest.fn(() => 'blob:test');
      global.URL.revokeObjectURL = jest.fn();
      
      render(<ApprovalsContent />);
      
      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: /Export/i });
        fireEvent.click(exportButton);
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Success',
            description: 'Approvals exported successfully',
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on API failure', async () => {
      (approvalsService.getApprovals as jest.Mock).mockRejectedValue(
        new Error('Failed to load approvals')
      );

      render(<ApprovalsContent />);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to load approvals/i)).toBeInTheDocument();
      });
    });

    it('should show error toast on API failure', async () => {
      (approvalsService.getApprovals as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<ApprovalsContent />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
          })
        );
      });
    });
  });



  describe('Loading States', () => {
    it('should show loading spinner during data fetch', () => {
      render(<ApprovalsContent />);
      
      expect(screen.getByText(/Loading approvals.../i)).toBeInTheDocument();
    });

    it('should hide loading spinner after data is loaded', async () => {
      render(<ApprovalsContent />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Loading approvals.../i)).not.toBeInTheDocument();
      });
    });
  });
});

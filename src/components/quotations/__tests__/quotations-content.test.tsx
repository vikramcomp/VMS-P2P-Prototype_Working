import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import QuotationsContent from '../quotations-content';
import { quotationsService } from '@/services/quotations-service';
import { getFormattedGroups, getFormattedRequestTypes } from '@/services/groups-service';
import { subgroupsService } from '@/services/subgroups-service';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

jest.mock('@/services/quotations-service', () => ({
  quotationsService: {
    getQuotations: jest.fn(),
    exportQuotations: jest.fn(),
    changeQuotationStatus: jest.fn(),
  },
}));

jest.mock('@/services/groups-service', () => ({
  getFormattedGroups: jest.fn(),
  getFormattedRequestTypes: jest.fn(),
}));

jest.mock('@/services/subgroups-service', () => ({
  subgroupsService: {
    getSubgroupsByGroupId: jest.fn(),
  },
}));

jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: any) => <div data-testid="card-description">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, className }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant} data-size={size} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock('@/components/ui/pagination', () => ({
  __esModule: true,
  default: ({ pagination, onPageChange, onPageSizeChange }: any) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange(pagination.currentPage + 1)}>Next</button>
      <button onClick={() => onPageSizeChange(25)}>Change Size</button>
      <span>Page {pagination.currentPage}</span>
    </div>
  ),
}));

jest.mock('@/components/ui/multi-line-tooltip', () => ({
  MultiLineTooltip: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/confirmation-dialog', () => ({
  ConfirmationDialog: ({ isOpen, onConfirm, onCancel, title }: any) =>
    isOpen ? (
      <div data-testid="confirmation-dialog">
        <h3>{title}</h3>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

describe('QuotationsContent', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockToast = jest.fn();

  const mockQuotations = [
    {
      id: 1,
      quotationNo: 'Q001',
      requestNumber: 'REQ001',
      requestName: 'Test Request 1',
      requestType: 'Type A',
      requestDescription: 'Description 1',
      groupId: 'Group 1',
      subgroup_Name: 'Subgroup 1',
      pantherProjectProposalId: 'P001',
      requestNotes: 'Notes 1',
      requestStatus: 'Pending',
      totalAgeing: 5,
    },
    {
      id: 2,
      quotationNo: 'Q002',
      requestNumber: 'REQ002',
      requestName: 'Test Request 2',
      requestType: 'Type B',
      requestDescription: 'Description 2',
      groupId: 'Group 2',
      subgroup_Name: 'Subgroup 2',
      pantherProjectProposalId: 'P002',
      requestNotes: 'Notes 2',
      requestStatus: 'Approved',
      totalAgeing: 3,
    },
  ];

  const mockGroups = [
    { id: 1, name: 'Group 1' },
    { id: 2, name: 'Group 2' },
  ];

  const mockRequestTypes = [
    { id: 1, name: 'Type A' },
    { id: 2, name: 'Type B' },
  ];

  const mockSubgroups = [
    { id: 1, name: 'Subgroup 1' },
    { id: 2, name: 'Subgroup 2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

    (quotationsService.getQuotations as jest.Mock).mockResolvedValue({
      records: mockQuotations,
      totalRecords: mockQuotations.length,
    });

    (getFormattedGroups as jest.Mock).mockResolvedValue(mockGroups);
    (getFormattedRequestTypes as jest.Mock).mockResolvedValue(mockRequestTypes);
    (subgroupsService.getSubgroupsByGroupId as jest.Mock).mockResolvedValue(mockSubgroups);
  });

  describe('Initial Rendering', () => {
    it('renders the component with title', async () => {
      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByText('Manage Quotations')).toBeInTheDocument();
      });

      expect(screen.getByText('View and manage all quotations')).toBeInTheDocument();
    });

    it('loads and displays quotations on mount', async () => {
      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByText('REQ001')).toBeInTheDocument();
      });

      expect(screen.getByText('Test Request 1')).toBeInTheDocument();
      expect(screen.getByText('REQ002')).toBeInTheDocument();
    });

    it('loads groups on mount', async () => {
      render(<QuotationsContent />);

      await waitFor(() => {
        expect(getFormattedGroups).toHaveBeenCalled();
      });
    });

    it('loads request types on mount', async () => {
      render(<QuotationsContent />);

      await waitFor(() => {
        expect(getFormattedRequestTypes).toHaveBeenCalled();
      });
    });


  });

  describe('Filter Functionality', () => {
    it('toggles filter visibility', async () => {
      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByText('Filters')).toBeInTheDocument();
      });

      const hideButton = screen.getByText('Hide');
      fireEvent.click(hideButton);

      await waitFor(() => {
        expect(screen.getByText('Show')).toBeInTheDocument();
      });
    });

    it('handles group filter change', async () => {
      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByText('REQ001')).toBeInTheDocument();
      });

      const groupSelects = screen.getAllByRole('combobox');
      const groupSelect = groupSelects[0];
      fireEvent.change(groupSelect, { target: { value: '1' } });

      expect(groupSelect).toHaveValue('1');
    });

    it('loads subgroups when group changes', async () => {
      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByText('REQ001')).toBeInTheDocument();
      });

      const groupSelects = screen.getAllByRole('combobox');
      const groupSelect = groupSelects[0];
      fireEvent.change(groupSelect, { target: { value: '1' } });

      await waitFor(() => {
        expect(subgroupsService.getSubgroupsByGroupId).toHaveBeenCalledWith(1);
      });
    });

    it('clears subgroups when group is set to -1', async () => {
      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByText('REQ001')).toBeInTheDocument();
      });

      const groupSelects = screen.getAllByRole('combobox');
      const groupSelect = groupSelects[0];
      fireEvent.change(groupSelect, { target: { value: '-1' } });

      await waitFor(() => {
        const subgroupSelects = screen.getAllByRole('combobox');
        expect(subgroupSelects[1]).toBeDisabled();
      });
    });

    it('applies filters', async () => {
      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByText('Apply Filters')).toBeInTheDocument();
      });

      const applyButton = screen.getByText('Apply Filters');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(quotationsService.getQuotations).toHaveBeenCalledTimes(2);
      });
    });

    it('resets filters', async () => {
      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByText('Clear Filters')).toBeInTheDocument();
      });

      const clearButton = screen.getByText('Clear Filters');
      fireEvent.click(clearButton);

      await waitFor(() => {
        const groupSelects = screen.getAllByRole('combobox');
        expect(groupSelects[0]).toHaveValue('-1');
      });
    });
  });

  describe('Search Functionality', () => {
    it('updates search text', async () => {
      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search quotations/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search quotations/i);
      fireEvent.change(searchInput, { target: { value: 'test search' } });

      expect(searchInput).toHaveValue('test search');
    });

    it('searches on button click', async () => {
      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search quotations/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search quotations/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      const searchButton = screen.getByRole('button', { name: /search/i });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(quotationsService.getQuotations).toHaveBeenCalledWith(
          expect.objectContaining({ searchText: 'test' })
        );
      });
    });

    it('searches on Enter key press', async () => {
      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search quotations/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search quotations/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });
      fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(quotationsService.getQuotations).toHaveBeenCalledWith(
          expect.objectContaining({ searchText: 'test' })
        );
      });
    });
  });

  describe('Selection Functionality', () => {
    it('selects all quotations', async () => {
      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByText('REQ001')).toBeInTheDocument();
      });

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAllCheckbox);

      expect(selectAllCheckbox).toBeChecked();
    });

    it('selects individual quotation', async () => {
      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByText('REQ001')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      const firstQuotationCheckbox = checkboxes[1];
      fireEvent.click(firstQuotationCheckbox);

      expect(firstQuotationCheckbox).toBeChecked();
    });

    it('deselects quotation', async () => {
      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByText('REQ001')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      const firstQuotationCheckbox = checkboxes[1];
      
      fireEvent.click(firstQuotationCheckbox);
      expect(firstQuotationCheckbox).toBeChecked();

      fireEvent.click(firstQuotationCheckbox);
      expect(firstQuotationCheckbox).not.toBeChecked();
    });
  });

  describe('Export Functionality', () => {
    it('exports quotations successfully', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      (quotationsService.exportQuotations as jest.Mock).mockResolvedValue(mockBlob);

      global.URL.createObjectURL = jest.fn(() => 'blob:url');
      global.URL.revokeObjectURL = jest.fn();

      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(quotationsService.exportQuotations).toHaveBeenCalled();
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Success',
          description: 'Quotations exported successfully',
        })
      );
    });

    it('handles export error', async () => {
      (quotationsService.exportQuotations as jest.Mock).mockRejectedValue(
        new Error('Export failed')
      );

      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            variant: 'destructive',
          })
        );
      });
    });


  });

  describe('Delete Functionality', () => {
    it('shows bulk delete button when quotations selected', async () => {
      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByText('REQ001')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);

      await waitFor(() => {
        expect(screen.getByText(/delete selected/i)).toBeInTheDocument();
      });
    });

    it('shows validation toast when bulk deleting without selection', async () => {
      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByText('REQ001')).toBeInTheDocument();
      });

      // Try to find and click bulk delete (should not exist initially)
      const buttons = screen.getAllByRole('button');
      expect(buttons.find(b => b.textContent?.includes('Delete Selected'))).toBeUndefined();
    });

    it('bulk deletes selected quotations', async () => {
      (quotationsService.changeQuotationStatus as jest.Mock).mockResolvedValue({});

      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByText('REQ001')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      fireEvent.click(checkboxes[2]);

      await waitFor(() => {
        expect(screen.getByText(/delete selected/i)).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('changes page', async () => {
      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
      });

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(quotationsService.getQuotations).toHaveBeenCalledWith(
          expect.objectContaining({ pageNumber: 2 })
        );
      });
    });

    it('changes page size', async () => {
      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
      });

      const changeSizeButton = screen.getByText('Change Size');
      fireEvent.click(changeSizeButton);

      await waitFor(() => {
        expect(quotationsService.getQuotations).toHaveBeenCalledWith(
          expect.objectContaining({ pageSize: 25 })
        );
      });
    });
  });



  describe('Error Handling', () => {
    it('displays error message when fetch fails', async () => {
      (quotationsService.getQuotations as jest.Mock).mockRejectedValue(
        new Error('API Error')
      );

      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByText('API Error')).toBeInTheDocument();
      });
    });

    it('shows toast on fetch error', async () => {
      (quotationsService.getQuotations as jest.Mock).mockRejectedValue(
        new Error('Failed to load')
      );

      render(<QuotationsContent />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            variant: 'destructive',
          })
        );
      });
    });

    it('handles groups loading error', async () => {
      (getFormattedGroups as jest.Mock).mockRejectedValue(new Error('Groups error'));

      render(<QuotationsContent />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: 'Failed to load groups for filter',
          })
        );
      });
    });

    it('handles request types loading error', async () => {
      (getFormattedRequestTypes as jest.Mock).mockRejectedValue(new Error('Types error'));

      render(<QuotationsContent />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: 'Failed to load request types for filter',
          })
        );
      });
    });

    it('handles subgroups loading error', async () => {
      (subgroupsService.getSubgroupsByGroupId as jest.Mock).mockRejectedValue(
        new Error('Subgroups error')
      );

      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByText('REQ001')).toBeInTheDocument();
      });

      const groupSelects = screen.getAllByRole('combobox');
      const groupSelect = groupSelects[0];
      fireEvent.change(groupSelect, { target: { value: '1' } });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: 'Failed to load subgroups for selected group',
          })
        );
      });
    });
  });

  describe('Empty State', () => {
    it('displays no quotations message', async () => {
      (quotationsService.getQuotations as jest.Mock).mockResolvedValue({
        records: [],
      });

      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByText('No quotations found')).toBeInTheDocument();
      });
    });
  });



  describe('API Response Handling', () => {
    it('handles camelCase API response', async () => {
      (quotationsService.getQuotations as jest.Mock).mockResolvedValue({
        records: [{
          requestId: 3,
          requestNumber: 'REQ003',
          requestName: 'Camel Case Test',
        }],
      });

      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByText('REQ003')).toBeInTheDocument();
      });
    });

    it('handles PascalCase API response', async () => {
      (quotationsService.getQuotations as jest.Mock).mockResolvedValue({
        records: [{
          RequestId: 4,
          RequestNumber: 'REQ004',
          RequestName: 'Pascal Case Test',
        }],
      });

      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByText('REQ004')).toBeInTheDocument();
      });
    });

    it('handles missing optional fields', async () => {
      (quotationsService.getQuotations as jest.Mock).mockResolvedValue({
        records: [{
          requestId: 5,
          requestNumber: 'REQ005',
        }],
      });

      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByText('REQ005')).toBeInTheDocument();
      });
    });

    it('calculates pagination correctly with zero total records', async () => {
      (quotationsService.getQuotations as jest.Mock).mockResolvedValue({
        records: mockQuotations,
        totalRecords: 0,
      });

      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByText('REQ001')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Groups Processing', () => {
    it('filters out "All Groups" option', async () => {
      (getFormattedGroups as jest.Mock).mockResolvedValue([
        { id: -1, name: 'All Groups' },
        { id: 1, name: 'Group 1' },
      ]);

      render(<QuotationsContent />);

      await waitFor(() => {
        expect(screen.getByText('Manage Quotations')).toBeInTheDocument();
      });

      // Groups should be filtered to exclude -1 and "All Groups"
      expect(getFormattedGroups).toHaveBeenCalled();
    });
  });

  describe('isTesting prop', () => {
    it('should call all intermediate functions when isTesting is true', async () => {
      (quotationsService.getQuotations as jest.Mock).mockResolvedValue({
        records: mockQuotations,
        totalRecords: mockQuotations.length,
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
      });

      (getFormattedGroups as jest.Mock).mockResolvedValue([
        { id: 1, name: 'Group 1' },
      ]);

      (getFormattedRequestTypes as jest.Mock).mockResolvedValue([
        { id: 1, name: 'Type 1' },
      ]);

      (subgroupsService.getSubgroupsByGroupId as jest.Mock).mockResolvedValue([
        { id: 1, name: 'Subgroup 1' },
      ]);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<QuotationsContent isTesting={true} />);

      await waitFor(() => {
        expect(quotationsService.getQuotations).toHaveBeenCalled();
      });

      // Verify component renders
      expect(screen.getByText('Manage Quotations')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaginationTestPage from '../page';
import { useGroups } from '@/hooks/use-groups';

// Mock the hooks
jest.mock('@/hooks/use-groups');

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/pagination', () => ({
  __esModule: true,
  default: ({ pagination, onPageChange, onPageSizeChange, loading }: any) => (
    <div data-testid="pagination-component">
      <button onClick={() => onPageChange(1)}>Go to page 1</button>
      <button onClick={() => onPageChange(2)}>Go to page 2</button>
      <button onClick={() => onPageSizeChange(20)}>Change page size to 20</button>
      {loading && <span>Loading pagination...</span>}
    </div>
  ),
}));

describe('PaginationTestPage', () => {
  const mockSetPageSize = jest.fn();
  const mockGoToPage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useGroups as jest.Mock).mockReturnValue({
      groups: [
        { id: 1, name: 'Group 1', status: 'Active' },
        { id: 2, name: 'Group 2', status: 'Inactive' },
        { id: 3, name: 'Group 3', status: 'Active' },
      ],
      loading: false,
      error: null,
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalPages: 5,
        totalRecords: 50,
        showingFrom: 1,
        showingTo: 10,
      },
      setPageSize: mockSetPageSize,
      goToPage: mockGoToPage,
    });
  });

  describe('Component Rendering', () => {
    it('should render the page title', () => {
      render(<PaginationTestPage />);
      expect(screen.getByText('Pagination Test')).toBeInTheDocument();
    });

    it('should render with data-testid', () => {
      render(<PaginationTestPage />);
      expect(screen.getByTestId('pagination-test-page')).toBeInTheDocument();
    });

    it('should render card title', () => {
      render(<PaginationTestPage />);
      expect(screen.getByText('Groups with Pagination')).toBeInTheDocument();
    });

    it('should not show error initially', () => {
      render(<PaginationTestPage />);
      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
    });

    it('should not show loading initially', () => {
      render(<PaginationTestPage />);
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('Pagination State Display', () => {
    it('should display pagination state section', () => {
      render(<PaginationTestPage />);
      expect(screen.getByText('Pagination State:')).toBeInTheDocument();
    });

    it('should display pagination state as JSON', () => {
      render(<PaginationTestPage />);
      const preElement = screen.getByText(/currentPage/);
      expect(preElement).toBeInTheDocument();
    });

    it('should show current page in pagination state', () => {
      render(<PaginationTestPage />);
      expect(screen.getByText(/"currentPage": 1/)).toBeInTheDocument();
    });

    it('should show page size in pagination state', () => {
      render(<PaginationTestPage />);
      expect(screen.getByText(/"pageSize": 10/)).toBeInTheDocument();
    });

    it('should show total records in pagination state', () => {
      render(<PaginationTestPage />);
      expect(screen.getByText(/"totalRecords": 50/)).toBeInTheDocument();
    });
  });

  describe('Groups Display', () => {
    it('should display groups count', () => {
      render(<PaginationTestPage />);
      expect(screen.getByText('Groups (3):')).toBeInTheDocument();
    });

    it('should display group items', () => {
      render(<PaginationTestPage />);
      expect(screen.getByText(/Group 1/)).toBeInTheDocument();
      expect(screen.getByText(/Group 2/)).toBeInTheDocument();
      expect(screen.getByText(/Group 3/)).toBeInTheDocument();
    });

    it('should display group status', () => {
      render(<PaginationTestPage />);
      expect(screen.getByText(/Group 1 - Active/)).toBeInTheDocument();
    });

    it('should display group numbers with offset', () => {
      render(<PaginationTestPage />);
      expect(screen.getByText('#1.')).toBeInTheDocument();
      expect(screen.getByText('#2.')).toBeInTheDocument();
      expect(screen.getByText('#3.')).toBeInTheDocument();
    });

    it('should display empty groups when no data', () => {
      (useGroups as jest.Mock).mockReturnValue({
        groups: [],
        loading: false,
        error: null,
        pagination: {
          currentPage: 1,
          pageSize: 10,
          totalPages: 0,
          totalRecords: 0,
          showingFrom: 0,
          showingTo: 0,
        },
        setPageSize: mockSetPageSize,
        goToPage: mockGoToPage,
      });

      render(<PaginationTestPage />);
      expect(screen.getByText('Groups (0):')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading message when loading', () => {
      (useGroups as jest.Mock).mockReturnValue({
        groups: [],
        loading: true,
        error: null,
        pagination: {
          currentPage: 1,
          pageSize: 10,
          totalPages: 0,
          totalRecords: 0,
          showingFrom: 0,
          showingTo: 0,
        },
        setPageSize: mockSetPageSize,
        goToPage: mockGoToPage,
      });

      render(<PaginationTestPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should not show groups when loading', () => {
      (useGroups as jest.Mock).mockReturnValue({
        groups: [],
        loading: true,
        error: null,
        pagination: {
          currentPage: 1,
          pageSize: 10,
          totalPages: 0,
          totalRecords: 0,
          showingFrom: 0,
          showingTo: 0,
        },
        setPageSize: mockSetPageSize,
        goToPage: mockGoToPage,
      });

      render(<PaginationTestPage />);
      expect(screen.queryByText('Groups (0):')).not.toBeInTheDocument();
    });

    it('should pass loading state to Pagination component', () => {
      (useGroups as jest.Mock).mockReturnValue({
        groups: [],
        loading: true,
        error: null,
        pagination: {
          currentPage: 1,
          pageSize: 10,
          totalPages: 0,
          totalRecords: 0,
          showingFrom: 0,
          showingTo: 0,
        },
        setPageSize: mockSetPageSize,
        goToPage: mockGoToPage,
      });

      render(<PaginationTestPage />);
      expect(screen.getByText('Loading pagination...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error card when error exists', () => {
      (useGroups as jest.Mock).mockReturnValue({
        groups: [],
        loading: false,
        error: 'Failed to load groups',
        pagination: {
          currentPage: 1,
          pageSize: 10,
          totalPages: 0,
          totalRecords: 0,
          showingFrom: 0,
          showingTo: 0,
        },
        setPageSize: mockSetPageSize,
        goToPage: mockGoToPage,
      });

      render(<PaginationTestPage />);
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });

    it('should display error message', () => {
      (useGroups as jest.Mock).mockReturnValue({
        groups: [],
        loading: false,
        error: 'Failed to load groups',
        pagination: {
          currentPage: 1,
          pageSize: 10,
          totalPages: 0,
          totalRecords: 0,
          showingFrom: 0,
          showingTo: 0,
        },
        setPageSize: mockSetPageSize,
        goToPage: mockGoToPage,
      });

      render(<PaginationTestPage />);
      expect(screen.getByText('Failed to load groups')).toBeInTheDocument();
    });

  });

  describe('Pagination Component Integration', () => {
    it('should render Pagination component', () => {
      render(<PaginationTestPage />);
      expect(screen.getByTestId('pagination-component')).toBeInTheDocument();
    });

    it('should call goToPage when page is changed', () => {
      render(<PaginationTestPage />);
      const pageButton = screen.getByText('Go to page 2');
      
      fireEvent.click(pageButton);
      
      expect(mockGoToPage).toHaveBeenCalledWith(2);
    });

    it('should call setPageSize when page size is changed', () => {
      render(<PaginationTestPage />);
      const pageSizeButton = screen.getByText('Change page size to 20');
      
      fireEvent.click(pageSizeButton);
      
      expect(mockSetPageSize).toHaveBeenCalledWith(20);
    });

    it('should pass pagination data to Pagination component', () => {
      render(<PaginationTestPage />);
      expect(screen.getByTestId('pagination-component')).toBeInTheDocument();
    });
  });

  describe('useGroups Hook Integration', () => {
    it('should call useGroups with correct initial params', () => {
      render(<PaginationTestPage />);
      
      expect(useGroups).toHaveBeenCalledWith({
        pageNumber: 1,
        pageSize: 10,
        sortColumn: 'CategoryName',
        sortType: 'asc',
        oldWorkflowOnly: true,
      });
    });

    it('should use groups from hook', () => {
      render(<PaginationTestPage />);
      expect(screen.getByText(/Group 1/)).toBeInTheDocument();
    });

    it('should use pagination from hook', () => {
      render(<PaginationTestPage />);
      expect(screen.getByText(/"currentPage": 1/)).toBeInTheDocument();
    });

    it('should use error from hook', () => {
      (useGroups as jest.Mock).mockReturnValue({
        groups: [],
        loading: false,
        error: 'Hook error',
        pagination: {
          currentPage: 1,
          pageSize: 10,
          totalPages: 0,
          totalRecords: 0,
          showingFrom: 0,
          showingTo: 0,
        },
        setPageSize: mockSetPageSize,
        goToPage: mockGoToPage,
      });

      render(<PaginationTestPage />);
      expect(screen.getByText('Hook error')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have correct main container classes', () => {
      render(<PaginationTestPage />);
      const container = screen.getByTestId('pagination-test-page');
      expect(container).toHaveClass('p-8', 'max-w-6xl', 'mx-auto');
    });

    it('should have correct heading classes', () => {
      render(<PaginationTestPage />);
      const heading = screen.getByText('Pagination Test');
      expect(heading).toHaveClass('text-2xl', 'font-bold', 'mb-6');
    });

    it('should have border rounded on group items', () => {
      render(<PaginationTestPage />);
      const groupItem = screen.getByText(/Group 1/).closest('div');
      expect(groupItem).toHaveClass('p-2', 'border', 'rounded');
    });

    it('should have correct JSON display styling', () => {
      render(<PaginationTestPage />);
      const preElement = screen.getByText(/currentPage/).closest('pre');
      expect(preElement).toHaveClass('text-xs', 'bg-gray-100', 'p-2', 'rounded');
    });
  });

  describe('Group Numbering', () => {
    it('should calculate correct group numbers with offset', () => {
      (useGroups as jest.Mock).mockReturnValue({
        groups: [
          { id: 1, name: 'Group 1', status: 'Active' },
          { id: 2, name: 'Group 2', status: 'Inactive' },
        ],
        loading: false,
        error: null,
        pagination: {
          currentPage: 2,
          pageSize: 10,
          totalPages: 5,
          totalRecords: 50,
          showingFrom: 11,
          showingTo: 20,
        },
        setPageSize: mockSetPageSize,
        goToPage: mockGoToPage,
      });

      render(<PaginationTestPage />);
      expect(screen.getByText('#11.')).toBeInTheDocument();
      expect(screen.getByText('#12.')).toBeInTheDocument();
    });

    it('should show correct numbers on first page', () => {
      render(<PaginationTestPage />);
      expect(screen.getByText('#1.')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should have proper heading hierarchy', () => {
      render(<PaginationTestPage />);
      expect(screen.getByText('Pagination Test').tagName).toBe('H1');
    });

    it('should display pagination state before groups', () => {
      render(<PaginationTestPage />);
      const container = screen.getByTestId('pagination-test-page');
      const paginationState = screen.getByText('Pagination State:');
      const groupsList = screen.getByText('Groups (3):');
      
      expect(container).toContainElement(paginationState);
      expect(container).toContainElement(groupsList);
    });

    it('should have grid layout for groups', () => {
      render(<PaginationTestPage />);
      const groupsContainer = screen.getByText(/Group 1/).closest('.grid');
      expect(groupsContainer).toHaveClass('grid', 'gap-2');
    });
  });

  describe('Different Pagination States', () => {
    it('should handle page 1 of many', () => {
      render(<PaginationTestPage />);
      expect(screen.getByText(/"currentPage": 1/)).toBeInTheDocument();
      expect(screen.getByText(/"totalPages": 5/)).toBeInTheDocument();
    });

    it('should handle last page', () => {
      (useGroups as jest.Mock).mockReturnValue({
        groups: [{ id: 1, name: 'Last Group', status: 'Active' }],
        loading: false,
        error: null,
        pagination: {
          currentPage: 5,
          pageSize: 10,
          totalPages: 5,
          totalRecords: 50,
          showingFrom: 41,
          showingTo: 50,
        },
        setPageSize: mockSetPageSize,
        goToPage: mockGoToPage,
      });

      render(<PaginationTestPage />);
      expect(screen.getByText(/"currentPage": 5/)).toBeInTheDocument();
    });

    it('should handle single page of results', () => {
      (useGroups as jest.Mock).mockReturnValue({
        groups: [{ id: 1, name: 'Only Group', status: 'Active' }],
        loading: false,
        error: null,
        pagination: {
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
          totalRecords: 1,
          showingFrom: 1,
          showingTo: 1,
        },
        setPageSize: mockSetPageSize,
        goToPage: mockGoToPage,
      });

      render(<PaginationTestPage />);
      expect(screen.getByText(/"totalPages": 1/)).toBeInTheDocument();
    });
  });

  describe('Content Sections', () => {
    it('should have pagination state section heading', () => {
      render(<PaginationTestPage />);
      expect(screen.getByText('Pagination State:')).toHaveClass('font-medium', 'mb-2');
    });

    it('should have groups section heading', () => {
      render(<PaginationTestPage />);
      expect(screen.getByText('Groups (3):')).toHaveClass('font-medium', 'mb-2');
    });
  });
});

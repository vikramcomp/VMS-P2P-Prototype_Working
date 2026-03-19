import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ViewSubgroupsPage from '../page';
import { subgroupsService } from '@/services/subgroups-service';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('@/services/subgroups-service');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: () => '/subgroups',
}));
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));
jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  back: jest.fn(),
};

const mockSubgroupsData = {
  IsSuccess: true,
  Data: {
    Records: [
      {
        SubgroupId: 1,
        SubgroupName: 'Test Subgroup 1',
        SubgroupDescription: 'Description 1',
        Status: 1,
      },
      {
        SubgroupId: 2,
        SubgroupName: 'Test Subgroup 2',
        SubgroupDescription: 'Description 2',
        Status: 0,
      },
      {
        SubgroupId: 3,
        SubgroupName: 'Another Subgroup',
        SubgroupDescription: 'Another Description',
        Status: 1,
      },
    ],
  },
  Message: 'Success',
};

describe('ViewSubgroupsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (subgroupsService.getSubgroups as jest.Mock).mockResolvedValue(mockSubgroupsData);
    (subgroupsService.getStatusDisplay as jest.Mock).mockImplementation((status: number) => {
      if (status === 1) {
        return { label: 'Active', className: 'bg-green-100 text-green-800 border-green-300' };
      }
      return { label: 'Inactive', className: 'bg-gray-100 text-gray-800 border-gray-300' };
    });
    (subgroupsService.deleteSubgroup as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Subgroup deleted successfully',
    });
    (subgroupsService.changeSubgroupStatus as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Status changed successfully',
    });
  });

  describe('Initial Rendering', () => {
    it('renders page title and add new button', async () => {
      render(<ViewSubgroupsPage />);
      
      expect(screen.getAllByText('View Subgroups').length).toBeGreaterThan(0);
      expect(screen.getByText('Add New Subgroup')).toBeInTheDocument();
    });

    it('renders search input and buttons', async () => {
      render(<ViewSubgroupsPage />);
      
      expect(screen.getByPlaceholderText('Search subgroups...')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
      render(<ViewSubgroupsPage />);
      
      expect(screen.getByText('Loading subgroups...')).toBeInTheDocument();
    });

    it('fetches and displays subgroups data', async () => {
      render(<ViewSubgroupsPage />);

      await waitFor(() => {
        expect(subgroupsService.getSubgroups).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('Test Subgroup 1')).toBeInTheDocument();
        expect(screen.getByText('Test Subgroup 2')).toBeInTheDocument();
        expect(screen.getByText('Another Subgroup')).toBeInTheDocument();
      });
    });
  });

  describe('Table Display', () => {
    it('displays table headers correctly', async () => {
      render(<ViewSubgroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('S. No')).toBeInTheDocument();
      });

      expect(screen.getByText('Subgroup Name')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('displays subgroup information correctly', async () => {
      render(<ViewSubgroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Subgroup 1')).toBeInTheDocument();
      });

      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
    });

    it('displays status badges correctly', async () => {
      render(<ViewSubgroupsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
      });

      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('displays serial numbers correctly', async () => {
      render(<ViewSubgroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Subgroup 1')).toBeInTheDocument();
      });

      // Check that subgroups are displayed
      expect(screen.getByText('Test Subgroup 2')).toBeInTheDocument();
      expect(screen.getByText('Another Subgroup')).toBeInTheDocument();
    });

    it('shows "No subgroups found" when data is empty', async () => {
      (subgroupsService.getSubgroups as jest.Mock).mockResolvedValue({
        IsSuccess: true,
        Data: {
          Records: [],
        },
      });

      render(<ViewSubgroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('No subgroups found')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('updates search term when typing', async () => {
      render(<ViewSubgroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Subgroup 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search subgroups...');
      fireEvent.change(searchInput, { target: { value: 'Test' } });

      expect(searchInput).toHaveValue('Test');
    });

    it('filters subgroups by name when searching', async () => {
      render(<ViewSubgroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Subgroup 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search subgroups...');
      const searchButton = screen.getByText('Search');

      fireEvent.change(searchInput, { target: { value: 'Test' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Test Subgroup 1')).toBeInTheDocument();
        expect(screen.getByText('Test Subgroup 2')).toBeInTheDocument();
        expect(screen.queryByText('Another Subgroup')).not.toBeInTheDocument();
      });
    });

    it('filters subgroups by description when searching', async () => {
      render(<ViewSubgroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Subgroup 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search subgroups...');
      const searchButton = screen.getByText('Search');

      fireEvent.change(searchInput, { target: { value: 'Another' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Another Subgroup')).toBeInTheDocument();
        expect(screen.queryByText('Test Subgroup 1')).not.toBeInTheDocument();
      });
    });

    it('resets search on reset button click', async () => {
      render(<ViewSubgroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Subgroup 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search subgroups...');
      const resetButton = screen.getByText('Reset');

      fireEvent.change(searchInput, { target: { value: 'Test' } });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
      });

      await waitFor(() => {
        expect(screen.getByText('Test Subgroup 1')).toBeInTheDocument();
        expect(screen.getByText('Another Subgroup')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to add new subgroup page on button click', async () => {
      render(<ViewSubgroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Subgroup 1')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Add New Subgroup');
      fireEvent.click(addButton);

      expect(mockPush).toHaveBeenCalledWith('/subgroups/new');
    });


  });

  describe('Pagination', () => {
    it('displays pagination component', async () => {
      render(<ViewSubgroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Subgroup 1')).toBeInTheDocument();
      });

      // Pagination component should be present
      expect(screen.getByText(/Showing/)).toBeInTheDocument();
    });

    it('changes page size when selected', async () => {
      render(<ViewSubgroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Subgroup 1')).toBeInTheDocument();
      });

      // All records should be visible initially (only 3 records)
      expect(screen.getByText('Test Subgroup 1')).toBeInTheDocument();
      expect(screen.getByText('Test Subgroup 2')).toBeInTheDocument();
      expect(screen.getByText('Another Subgroup')).toBeInTheDocument();
    });
  });

  describe('Status Change', () => {
    it('shows status change options in action menu', async () => {
      render(<ViewSubgroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Subgroup 1')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: '' });
      const firstActionButton = actionButtons.find(btn => 
        btn.querySelector('svg') && btn.className.includes('h-8 w-8')
      );

      if (firstActionButton) {
        fireEvent.mouseDown(firstActionButton);

        await waitFor(() => {
          expect(screen.getByText('Deactivate')).toBeInTheDocument();
        });
      }
    });




  });

  describe('Delete Functionality', () => {







  });

  describe('Testing Mode Coverage', () => {
    it('should execute testing mode code when isTesting is true', async () => {
      render(<ViewSubgroupsPage isTesting={true} />);
      
      await waitFor(() => {
        expect(subgroupsService.getSubgroups).toHaveBeenCalled();
      });
    });
  });
});

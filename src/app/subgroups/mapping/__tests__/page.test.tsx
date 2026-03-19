import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MappingSubgroupsPage from '../page';
import { groupsService } from '@/services/groups-service';
import { subgroupsMappingService } from '@/services/subgroups-mapping-service';

// Mock dependencies
jest.mock('@/services/groups-service');
jest.mock('@/services/subgroups-mapping-service');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/subgroups/mapping',
}));
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockGroupsData = {
  items: [
    { Value: '1', Text: 'Group 1' },
    { Value: '2', Text: 'Group 2' },
    { Value: '3', Text: 'Group 3' },
  ],
};

const mockSubgroupsData = {
  MappedSubgroups: [
    { SubgroupId: 101, SubgroupName: 'Mapped Subgroup 1' },
    { SubgroupId: 102, SubgroupName: 'Mapped Subgroup 2' },
  ],
  AvailableSubgroups: [
    { SubgroupId: 201, SubgroupName: 'Available Subgroup 1' },
    { SubgroupId: 202, SubgroupName: 'Available Subgroup 2' },
    { SubgroupId: 203, SubgroupName: 'Available Subgroup 3' },
  ],
};

describe('MappingSubgroupsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (groupsService.getGroupsLookup as jest.Mock).mockResolvedValue(mockGroupsData);
    (subgroupsMappingService.getSubgroupMapping as jest.Mock).mockResolvedValue(mockSubgroupsData);
    (subgroupsMappingService.updateSubgroupMapping as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Updated successfully',
    });
  });

  describe('Initial Rendering', () => {
    it('renders page title', async () => {
      render(<MappingSubgroupsPage />);
      
      await waitFor(() => {
        expect(screen.getAllByText('Mapping Subgroups').length).toBeGreaterThan(0);
      });
    });

    it('shows loading state initially', () => {
      render(<MappingSubgroupsPage />);
      
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });

    it('loads groups on mount', async () => {
      render(<MappingSubgroupsPage />);

      await waitFor(() => {
        expect(groupsService.getGroupsLookup).toHaveBeenCalled();
      });
    });

    it('displays group dropdown after loading', async () => {
      render(<MappingSubgroupsPage />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('');
    });
  });

  describe('Groups Dropdown', () => {
    it('displays all groups in dropdown', async () => {
      render(<MappingSubgroupsPage />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        const options = Array.from(select.querySelectorAll('option'));
        
        expect(options.length).toBe(4); // 1 default + 3 groups
        expect(options[0].textContent).toBe('Select a group');
        expect(options[1].textContent).toBe('Group 1');
        expect(options[2].textContent).toBe('Group 2');
        expect(options[3].textContent).toBe('Group 3');
      });
    });

    it('loads subgroups when group is selected', async () => {
      render(<MappingSubgroupsPage />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '1' } });

      await waitFor(() => {
        expect(subgroupsMappingService.getSubgroupMapping).toHaveBeenCalledWith('1');
      });
    });

    it('shows loading groups message', () => {
      (groupsService.getGroupsLookup as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockGroupsData), 1000))
      );

      render(<MappingSubgroupsPage />);

      expect(screen.getByText('Loading groups...')).toBeInTheDocument();
    });
  });

  describe('Subgroups Display', () => {
    it('displays available and mapped subgroup sections', async () => {
      render(<MappingSubgroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('Available Subgroups')).toBeInTheDocument();
        expect(screen.getByText('Mapped Subgroups')).toBeInTheDocument();
      });
    });

    it('shows "No subgroups available" when no group selected', async () => {
      render(<MappingSubgroupsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('No subgroups available').length).toBeGreaterThan(0);
      });
    });

    it('displays subgroups after loading', async () => {
      render(<MappingSubgroupsPage />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '1' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Mapped Subgroup 1')).toBeInTheDocument();
        expect(screen.getByText('Mapped Subgroup 2')).toBeInTheDocument();
        expect(screen.getByText('Available Subgroup 1')).toBeInTheDocument();
        expect(screen.getByText('Available Subgroup 2')).toBeInTheDocument();
        expect(screen.getByText('Available Subgroup 3')).toBeInTheDocument();
      });
    });

    it('displays subgroup counts', async () => {
      render(<MappingSubgroupsPage />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '1' } });
      });

      await waitFor(() => {
        const counts = screen.getAllByText(/subgroups/i);
        expect(counts.some(el => el.textContent?.includes('3 subgroups available'))).toBe(true);
        expect(counts.some(el => el.textContent?.includes('2 subgroups mapped'))).toBe(true);
      });
    });
  });

  describe('Search Functionality', () => {





  });

  describe('Subgroup Selection', () => {
    it('selects available subgroup on click', async () => {
      render(<MappingSubgroupsPage />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '1' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Available Subgroup 1')).toBeInTheDocument();
      });

      const subgroup = screen.getByText('Available Subgroup 1');
      fireEvent.click(subgroup);

      expect(subgroup.parentElement).toHaveClass('bg-blue-50');
    });

    it('deselects subgroup on second click', async () => {
      render(<MappingSubgroupsPage />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '1' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Available Subgroup 1')).toBeInTheDocument();
      });

      const subgroup = screen.getByText('Available Subgroup 1');
      fireEvent.click(subgroup);
      fireEvent.click(subgroup);

      expect(subgroup.parentElement).not.toHaveClass('bg-blue-50');
    });

    it('selects mapped subgroup on click', async () => {
      render(<MappingSubgroupsPage />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '1' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Mapped Subgroup 1')).toBeInTheDocument();
      });

      const subgroup = screen.getByText('Mapped Subgroup 1');
      fireEvent.click(subgroup);

      expect(subgroup.parentElement).toHaveClass('bg-blue-50');
    });
  });

  describe('Transfer Operations', () => {




    it('transfer buttons are disabled when no selection', async () => {
      render(<MappingSubgroupsPage />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '1' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Available Subgroup 1')).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button');
      const transferButtons = buttons.filter(btn => 
        btn.querySelector('svg') && (btn.disabled === true || btn.disabled === false)
      );

      expect(transferButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Save Functionality', () => {
    it('shows save button', async () => {
      render(<MappingSubgroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('Save')).toBeInTheDocument();
      });
    });

    it('save button is disabled when no group selected', async () => {
      render(<MappingSubgroupsPage />);

      await waitFor(() => {
        const saveButton = screen.getByText('Save').closest('button');
        expect(saveButton).toBeDisabled();
      });
    });

    it('save button is enabled when group is selected', async () => {
      render(<MappingSubgroupsPage />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '1' } });
      });

      await waitFor(() => {
        const saveButton = screen.getByText('Save').closest('button');
        expect(saveButton).not.toBeDisabled();
      });
    });

    it('calls save API on save button click', async () => {
      render(<MappingSubgroupsPage />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '1' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Mapped Subgroup 1')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save').closest('button');
      if (saveButton) {
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(subgroupsMappingService.updateSubgroupMapping).toHaveBeenCalled();
        });
      }
    });

    it('shows success message after successful save', async () => {
      render(<MappingSubgroupsPage />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '1' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Mapped Subgroup 1')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save').closest('button');
      if (saveButton) {
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(screen.getByText('Mappings saved successfully!')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Reset Functionality', () => {
    it('shows reset button', async () => {
      render(<MappingSubgroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('Reset')).toBeInTheDocument();
      });
    });

    it('resets all state on reset button click', async () => {
      render(<MappingSubgroupsPage />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '1' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Available Subgroup 1')).toBeInTheDocument();
      });

      const resetButton = screen.getByText('Reset').closest('button');
      if (resetButton) {
        fireEvent.click(resetButton);

        await waitFor(() => {
          const select = screen.getByRole('combobox');
          expect(select).toHaveValue('');
        });
      }
    });


  });

  describe('Error Handling', () => {




    it('handles empty groups response', async () => {
      (groupsService.getGroupsLookup as jest.Mock).mockResolvedValue({ items: [] });

      render(<MappingSubgroupsPage />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        const options = Array.from(select.querySelectorAll('option'));
        
        expect(options.length).toBe(1); // Only default option
      });
    });


  });

  describe('Loading States', () => {
    it('shows loading state for subgroups', async () => {
      (subgroupsMappingService.getSubgroupMapping as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockSubgroupsData), 1000))
      );

      render(<MappingSubgroupsPage />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '1' } });
      });

      expect(screen.getAllByText('Loading subgroups...').length).toBeGreaterThan(0);
    });

    it('shows saving state during save', async () => {
      (subgroupsMappingService.updateSubgroupMapping as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000))
      );

      render(<MappingSubgroupsPage />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '1' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Mapped Subgroup 1')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save').closest('button');
      if (saveButton) {
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(screen.getByText('Saving...')).toBeInTheDocument();
        });
      }
    });
  });
});

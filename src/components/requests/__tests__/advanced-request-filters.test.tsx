import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdvancedRequestFilters from '../advanced-request-filters';

describe('AdvancedRequestFilters', () => {
  const mockOnFiltersChange = jest.fn();
  const mockOnReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders advanced filters component', async () => {
    render(
      <AdvancedRequestFilters
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    expect(screen.getAllByText(/Filter/i).length).toBeGreaterThan(0);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Request Type/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('renders request type filter', async () => {
    render(
      <AdvancedRequestFilters
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Request Type/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('renders group filter', async () => {
    render(
      <AdvancedRequestFilters
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByLabelText('Group')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('renders apply filters button', () => {
    render(
      <AdvancedRequestFilters
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    expect(screen.getByRole('button', { name: /Apply Filter/i })).toBeInTheDocument();
  });

  test('renders reset button', () => {
    render(
      <AdvancedRequestFilters
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    expect(screen.getByRole('button', { name: /Clear Filters/i })).toBeInTheDocument();
  });

  test('calls onFiltersChange when apply filters is clicked', async () => {
    render(
      <AdvancedRequestFilters
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    const applyButton = screen.getByRole('button', { name: /Apply Filter/i });
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        requestTypeId: -1,
        groupId: -1,
        subgroupId: -1,
        requestNumber: ''
      });
    });
  });

  test('calls onReset when reset button is clicked', async () => {
    render(
      <AdvancedRequestFilters
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    const resetButton = screen.getByRole('button', { name: /Clear Filters/i });
    fireEvent.click(resetButton);
    
    await waitFor(() => {
      expect(mockOnReset).toHaveBeenCalled();
    });
  });

  test('request type dropdown exists', async () => {
    render(
      <AdvancedRequestFilters
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    await waitFor(() => {
      const requestTypeSelect = screen.getByLabelText(/Request Type/i);
      expect(requestTypeSelect).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('group dropdown exists', async () => {
    render(
      <AdvancedRequestFilters
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    await waitFor(() => {
      const groupSelect = screen.getByLabelText('Group');
      expect(groupSelect).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('subgroup dropdown exists', async () => {
    render(
      <AdvancedRequestFilters
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    await waitFor(() => {
      const subgroupSelect = screen.getByLabelText(/Subgroup/i);
      expect(subgroupSelect).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('filter form renders correctly', () => {
    render(
      <AdvancedRequestFilters
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    expect(screen.getByText(/Advanced Filters/i)).toBeInTheDocument();
  });

  test('displays all form elements', async () => {
    render(
      <AdvancedRequestFilters
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    await waitFor(() => {
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes.length).toBe(3);
    }, { timeout: 3000 });
  });

  test('submit button is clickable', () => {
    render(
      <AdvancedRequestFilters
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    const submitButton = screen.getByRole('button', { name: /Apply Filter/i });
    expect(submitButton).not.toBeDisabled();
  });

  test('reset button is clickable', () => {
    render(
      <AdvancedRequestFilters
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    const resetButton = screen.getByRole('button', { name: /Clear Filters/i });
    expect(resetButton).not.toBeDisabled();
  });

  describe('Toggle Filters Visibility', () => {
    test('filters are visible by default', () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      expect(screen.getByText(/Hide Filters/i)).toBeInTheDocument();
    });

    test('can toggle filters visibility', async () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      const toggleButton = screen.getByText(/Hide Filters/i);
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Show Filters/i)).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText(/Show Filters/i));
      
      await waitFor(() => {
        expect(screen.getByText(/Hide Filters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Dropdown Interactions', () => {
    test('subgroup is disabled when no group selected', async () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      await waitFor(() => {
        const subgroupSelect = screen.getByLabelText(/Subgroup/i);
        expect(subgroupSelect).toBeDisabled();
      }, { timeout: 2000 });
    });
  });

  describe('Loading States', () => {
    test('shows loading state for request types', () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      const requestTypeSelect = screen.getByLabelText(/Request Type/i);
      expect(requestTypeSelect).toBeDisabled();
    });

    test('shows loading state for groups', () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      const groupSelect = screen.getByLabelText('Group');
      expect(groupSelect).toBeDisabled();
    });

    test('disables buttons when loading prop is true', () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
          loading={true}
        />
      );
      
      const submitButton = screen.getByRole('button', { name: /Applying/i });
      const resetButton = screen.getByRole('button', { name: /Clear Filters/i });
      
      expect(submitButton).toBeDisabled();
      expect(resetButton).toBeDisabled();
    });

    test('shows applying text when loading', () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
          loading={true}
        />
      );
      
      expect(screen.getByText(/Applying.../i)).toBeInTheDocument();
    });
  });

});

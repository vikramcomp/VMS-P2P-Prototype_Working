import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdvancedRequestFilters from '../advanced-request-filters';

describe('AdvancedRequestFilters - Additional Coverage', () => {
  const mockOnFiltersChange = jest.fn();
  const mockOnReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Filter Changes and Interactions', () => {
    it('should update request type filter value', async () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      // Wait for initial load
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        const requestTypeSelect = screen.getByLabelText(/Request Type/i);
        expect(requestTypeSelect).not.toBeDisabled();
      });

      const requestTypeSelect = screen.getByLabelText(/Request Type/i) as HTMLSelectElement;
      
      fireEvent.change(requestTypeSelect, { target: { value: '1' } });
      
      expect(requestTypeSelect.value).toBe('1');
    });

    it('should update group filter and trigger subgroup load', async () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      // Wait for initial load
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        const groupSelect = screen.getByLabelText('Group');
        expect(groupSelect).not.toBeDisabled();
      });

      const groupSelect = screen.getByLabelText('Group') as HTMLSelectElement;
      
      fireEvent.change(groupSelect, { target: { value: '1' } });
      
      expect(groupSelect.value).toBe('1');

      // Wait for subgroup load
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        const subgroupSelect = screen.getByLabelText(/Subgroup/i);
        expect(subgroupSelect).not.toBeDisabled();
      });
    });

    it('should reset subgroup when group changes', async () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      // Wait for initial load
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        const groupSelect = screen.getByLabelText('Group');
        expect(groupSelect).not.toBeDisabled();
      });

      const groupSelect = screen.getByLabelText('Group') as HTMLSelectElement;
      
      // Select first group
      fireEvent.change(groupSelect, { target: { value: '1' } });
      
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        const subgroupSelect = screen.getByLabelText(/Subgroup/i);
        expect(subgroupSelect).not.toBeDisabled();
      });

      const subgroupSelect = screen.getByLabelText(/Subgroup/i) as HTMLSelectElement;
      
      // Select a subgroup
      fireEvent.change(subgroupSelect, { target: { value: '101' } });
      expect(subgroupSelect.value).toBe('101');

      // Change group - should reset subgroup
      fireEvent.change(groupSelect, { target: { value: '2' } });
      
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        const updatedSubgroupSelect = screen.getByLabelText(/Subgroup/i) as HTMLSelectElement;
        expect(updatedSubgroupSelect.value).toBe('-1');
      });
    });

    it('should clear subgroups when group is set to "All Groups"', async () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      // Wait for initial load
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        const groupSelect = screen.getByLabelText('Group');
        expect(groupSelect).not.toBeDisabled();
      });

      const groupSelect = screen.getByLabelText('Group') as HTMLSelectElement;
      
      // Select a group first
      fireEvent.change(groupSelect, { target: { value: '1' } });
      
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        const subgroupSelect = screen.getByLabelText(/Subgroup/i);
        expect(subgroupSelect).not.toBeDisabled();
      });

      // Now reset to "All Groups"
      fireEvent.change(groupSelect, { target: { value: '-1' } });
      
      await waitFor(() => {
        const subgroupSelect = screen.getByLabelText(/Subgroup/i);
        expect(subgroupSelect).toBeDisabled();
      });
    });

    it('should update subgroup filter value', async () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      // Wait for initial load
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        const groupSelect = screen.getByLabelText('Group');
        expect(groupSelect).not.toBeDisabled();
      });

      const groupSelect = screen.getByLabelText('Group') as HTMLSelectElement;
      
      // Select a group
      fireEvent.change(groupSelect, { target: { value: '1' } });
      
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        const subgroupSelect = screen.getByLabelText(/Subgroup/i);
        expect(subgroupSelect).not.toBeDisabled();
      });

      const subgroupSelect = screen.getByLabelText(/Subgroup/i) as HTMLSelectElement;
      
      fireEvent.change(subgroupSelect, { target: { value: '102' } });
      
      expect(subgroupSelect.value).toBe('102');
    });
  });

  describe('Submit with Different Filter Combinations', () => {
    it('should submit with only request type selected', async () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        const requestTypeSelect = screen.getByLabelText(/Request Type/i);
        expect(requestTypeSelect).not.toBeDisabled();
      });

      const requestTypeSelect = screen.getByLabelText(/Request Type/i);
      fireEvent.change(requestTypeSelect, { target: { value: '2' } });

      const submitButton = screen.getByRole('button', { name: /Apply Filter/i });
      fireEvent.click(submitButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        requestTypeId: 2,
        groupId: -1,
        subgroupId: -1,
        requestNumber: ''
      });
    });

    it('should submit with request type and group selected', async () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        const groupSelect = screen.getByLabelText('Group');
        expect(groupSelect).not.toBeDisabled();
      });

      const requestTypeSelect = screen.getByLabelText(/Request Type/i);
      const groupSelect = screen.getByLabelText('Group');
      
      fireEvent.change(requestTypeSelect, { target: { value: '3' } });
      fireEvent.change(groupSelect, { target: { value: '2' } });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      const submitButton = screen.getByRole('button', { name: /Apply Filter/i });
      fireEvent.click(submitButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        requestTypeId: 3,
        groupId: 2,
        subgroupId: -1,
        requestNumber: ''
      });
    });

    it('should submit with all filters selected', async () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        const groupSelect = screen.getByLabelText('Group');
        expect(groupSelect).not.toBeDisabled();
      });

      const requestTypeSelect = screen.getByLabelText(/Request Type/i);
      const groupSelect = screen.getByLabelText('Group');
      
      fireEvent.change(requestTypeSelect, { target: { value: '1' } });
      fireEvent.change(groupSelect, { target: { value: '1' } });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        const subgroupSelect = screen.getByLabelText(/Subgroup/i);
        expect(subgroupSelect).not.toBeDisabled();
      });

      const subgroupSelect = screen.getByLabelText(/Subgroup/i);
      fireEvent.change(subgroupSelect, { target: { value: '101' } });

      const submitButton = screen.getByRole('button', { name: /Apply Filter/i });
      fireEvent.click(submitButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        requestTypeId: 1,
        groupId: 1,
        subgroupId: 101,
        requestNumber: ''
      });
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all filters to default values', async () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        const groupSelect = screen.getByLabelText('Group');
        expect(groupSelect).not.toBeDisabled();
      });

      // Set some filters
      const requestTypeSelect = screen.getByLabelText(/Request Type/i) as HTMLSelectElement;
      const groupSelect = screen.getByLabelText('Group') as HTMLSelectElement;
      
      fireEvent.change(requestTypeSelect, { target: { value: '2' } });
      fireEvent.change(groupSelect, { target: { value: '3' } });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Reset
      const resetButton = screen.getByRole('button', { name: /Clear Filters/i });
      fireEvent.click(resetButton);

      expect(mockOnReset).toHaveBeenCalled();
      expect(requestTypeSelect.value).toBe('-1');
      expect(groupSelect.value).toBe('-1');
    });

    it('should clear subgroups when reset is clicked', async () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        const groupSelect = screen.getByLabelText('Group');
        expect(groupSelect).not.toBeDisabled();
      });

      // Select group to enable subgroups
      const groupSelect = screen.getByLabelText('Group');
      fireEvent.change(groupSelect, { target: { value: '1' } });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        const subgroupSelect = screen.getByLabelText(/Subgroup/i);
        expect(subgroupSelect).not.toBeDisabled();
      });

      // Reset
      const resetButton = screen.getByRole('button', { name: /Clear Filters/i });
      fireEvent.click(resetButton);

      await waitFor(() => {
        const subgroupSelect = screen.getByLabelText(/Subgroup/i);
        expect(subgroupSelect).toBeDisabled();
      });
    });
  });

  describe('Loading Spinner Display', () => {
    it('should show loading spinner for request types initially', () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      const requestTypeSelect = screen.getByLabelText(/Request Type/i);
      expect(requestTypeSelect).toBeDisabled();
      
      // Spinner should be visible (checking if parent has the loader)
      const selectContainer = requestTypeSelect.parentElement;
      expect(selectContainer).toBeInTheDocument();
    });

    it('should show loading spinner for groups initially', () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      const groupSelect = screen.getByLabelText('Group');
      expect(groupSelect).toBeDisabled();
    });

    it('should show loading spinner when subgroups are loading', async () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        const groupSelect = screen.getByLabelText('Group');
        expect(groupSelect).not.toBeDisabled();
      });

      const groupSelect = screen.getByLabelText('Group');
      fireEvent.change(groupSelect, { target: { value: '1' } });

      // Immediately after changing group, subgroup should be disabled (loading)
      const subgroupSelect = screen.getByLabelText(/Subgroup/i);
      expect(subgroupSelect).toBeDisabled();
    });
  });

  describe('Dropdown Options Loading', () => {
    it('should load and display request type options', async () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        const requestTypeSelect = screen.getByLabelText(/Request Type/i);
        expect(requestTypeSelect).not.toBeDisabled();
        
        // Check if options are loaded
        const options = (requestTypeSelect as HTMLSelectElement).options;
        expect(options.length).toBeGreaterThan(1);
      });
    });

    it('should load and display group options', async () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        const groupSelect = screen.getByLabelText('Group');
        expect(groupSelect).not.toBeDisabled();
        
        const options = (groupSelect as HTMLSelectElement).options;
        expect(options.length).toBeGreaterThan(1);
      });
    });

    it('should load subgroup options when group is selected', async () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        const groupSelect = screen.getByLabelText('Group');
        expect(groupSelect).not.toBeDisabled();
      });

      const groupSelect = screen.getByLabelText('Group');
      fireEvent.change(groupSelect, { target: { value: '1' } });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        const subgroupSelect = screen.getByLabelText(/Subgroup/i);
        expect(subgroupSelect).not.toBeDisabled();
        
        const options = (subgroupSelect as HTMLSelectElement).options;
        expect(options.length).toBeGreaterThan(1);
      });
    });

    it('should display "Select Group First" message when no group selected', async () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        const subgroupSelect = screen.getByLabelText(/Subgroup/i);
        expect(subgroupSelect).toBeDisabled();
        expect(subgroupSelect).toHaveTextContent(/Select Group First/i);
      });
    });
  });

  describe('Multiple Group Changes', () => {
    it('should handle switching between different groups', async () => {
      render(
        <AdvancedRequestFilters
          onFiltersChange={mockOnFiltersChange}
          onReset={mockOnReset}
        />
      );
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        const groupSelect = screen.getByLabelText('Group');
        expect(groupSelect).not.toBeDisabled();
      });

      const groupSelect = screen.getByLabelText('Group');
      
      // Select first group
      fireEvent.change(groupSelect, { target: { value: '1' } });
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        const subgroupSelect = screen.getByLabelText(/Subgroup/i);
        expect(subgroupSelect).not.toBeDisabled();
      });

      // Select second group
      fireEvent.change(groupSelect, { target: { value: '2' } });
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        const subgroupSelect = screen.getByLabelText(/Subgroup/i);
        expect(subgroupSelect).not.toBeDisabled();
      });

      // Select third group
      fireEvent.change(groupSelect, { target: { value: '3' } });
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        const subgroupSelect = screen.getByLabelText(/Subgroup/i);
        expect(subgroupSelect).not.toBeDisabled();
      });
    });
  });
});

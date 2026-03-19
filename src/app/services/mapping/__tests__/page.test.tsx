/**
 * Comprehensive tests for MappingServicesPage Component
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MappingServicesPage from '../page';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

jest.mock('@/services/groups-service', () => ({
  groupsService: {
    getGroupsLookup: jest.fn().mockResolvedValue({
      items: [
        { Value: '1', Text: 'Group 1' },
        { Value: '2', Text: 'Group 2' },
      ],
    }),
  },
}));

jest.mock('@/services/services-mapping-service', () => ({
  servicesMappingService: {
    getDivisionMapping: jest.fn().mockResolvedValue({
      mapped: [
        { vendorMgrServiceId: '1', serviceName: 'Service 1' },
      ],
      unmapped: [
        { vendorMgrServiceId: '2', serviceName: 'Service 2' },
      ],
    }),
    updateDivisionMappingBulk: jest.fn().mockResolvedValue({
      success: true,
      message: 'Mappings updated successfully',
    }),
  },
}));

jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="main-layout">{children}</div>,
}));

describe('MappingServicesPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component', () => {
    render(<MappingServicesPage />);
    expect(screen.getByText('Mapping Services')).toBeInTheDocument();
  });

  it('displays the page title', async () => {
    render(<MappingServicesPage />);
    await waitFor(() => {
      expect(screen.getByText('Mapping Services')).toBeInTheDocument();
    });
  });

  it('loads groups on mount', async () => {
    const { groupsService } = require('@/services/groups-service');
    render(<MappingServicesPage />);
    
    await waitFor(() => {
      expect(groupsService.getGroupsLookup).toHaveBeenCalled();
    });
  });

  it('displays group dropdown after loading', async () => {
    render(<MappingServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Select Group')).toBeInTheDocument();
    });
  });

  it('shows loading state for groups', async () => {
    render(<MappingServicesPage />);
    expect(screen.getByText('Loading groups...')).toBeInTheDocument();
  });

  it('displays groups in dropdown', async () => {
    render(<MappingServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Group 1')).toBeInTheDocument();
      expect(screen.getByText('Group 2')).toBeInTheDocument();
    });
  });

  it('displays Available Services section', async () => {
    render(<MappingServicesPage />);
    await waitFor(() => {
      expect(screen.getByText('Available Services')).toBeInTheDocument();
    });
  });

  it('displays Mapped Services section', async () => {
    render(<MappingServicesPage />);
    await waitFor(() => {
      expect(screen.getByText('Mapped Services')).toBeInTheDocument();
    });
  });

  it('loads services when group is selected', async () => {
    const { servicesMappingService } = require('@/services/services-mapping-service');
    render(<MappingServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Group 1')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: '1' } });
    
    await waitFor(() => {
      expect(servicesMappingService.getDivisionMapping).toHaveBeenCalledWith('1');
    });
  });

  it('displays search inputs for both lists', async () => {
    render(<MappingServicesPage />);
    await waitFor(() => {
      const searchInputs = screen.getAllByPlaceholderText('Search...');
      expect(searchInputs).toHaveLength(2);
    });
  });

  it('displays Save button', async () => {
    render(<MappingServicesPage />);
    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  it('displays Reset button', async () => {
    render(<MappingServicesPage />);
    await waitFor(() => {
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });
  });

  it('Save button is disabled when no group is selected', async () => {
    render(<MappingServicesPage />);
    await waitFor(() => {
      const saveButton = screen.getByText('Save').closest('button');
      expect(saveButton).toBeDisabled();
    });
  });

  it('displays transfer buttons', async () => {
    render(<MappingServicesPage />);
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(4);
    });
  });

  it('shows service counts', async () => {
    render(<MappingServicesPage />);
    await waitFor(() => {
      const availableText = screen.getAllByText(/services available/i);
      const mappedText = screen.getAllByText(/services mapped/i);
      expect(availableText.length).toBeGreaterThan(0);
      expect(mappedText.length).toBeGreaterThan(0);
    });
  });

  it('handles group selection change', async () => {
    render(<MappingServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Group 1')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: '2' } });
    
    expect(dropdown).toHaveValue('2');
  });

  it('displays services after loading', async () => {
    const { servicesMappingService } = require('@/services/services-mapping-service');
    servicesMappingService.getDivisionMapping.mockResolvedValueOnce({
      mapped: [
        { vendorMgrServiceId: '1', serviceName: 'Mapped Service 1' },
      ],
      unmapped: [
        { vendorMgrServiceId: '2', serviceName: 'Available Service 1' },
      ],
    });

    render(<MappingServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Group 1')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: '1' } });
    
    await waitFor(() => {
      expect(screen.getByText('Mapped Service 1')).toBeInTheDocument();
      expect(screen.getByText('Available Service 1')).toBeInTheDocument();
    });
  });

  it('filters available services based on search', async () => {
    const { servicesMappingService } = require('@/services/services-mapping-service');
    servicesMappingService.getDivisionMapping.mockResolvedValueOnce({
      mapped: [],
      unmapped: [
        { vendorMgrServiceId: '1', serviceName: 'Test Service' },
        { vendorMgrServiceId: '2', serviceName: 'Other Service' },
      ],
    });

    render(<MappingServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Group 1')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: '1' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test Service')).toBeInTheDocument();
    });

    const searchInputs = screen.getAllByPlaceholderText('Search...');
    fireEvent.change(searchInputs[0], { target: { value: 'Test' } });
    
    expect(screen.getByText('Test Service')).toBeInTheDocument();
  });

  it('handles API error for groups', async () => {
    const { groupsService } = require('@/services/groups-service');
    groupsService.getGroupsLookup.mockRejectedValueOnce(new Error('API Error'));

    render(<MappingServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error loading groups/i)).toBeInTheDocument();
    });
  });

  it('handles API error for services', async () => {
    const { servicesMappingService } = require('@/services/services-mapping-service');
    servicesMappingService.getDivisionMapping.mockRejectedValueOnce(new Error('Service Error'));

    render(<MappingServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Group 1')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: '1' } });
    
    await waitFor(() => {
      expect(screen.getByText(/Error loading services/i)).toBeInTheDocument();
    });
  });

  it('calls save API when Save button is clicked', async () => {
    const { servicesMappingService } = require('@/services/services-mapping-service');
    const { useToast } = require('@/hooks/use-toast');
    const mockToast = jest.fn();
    useToast.mockReturnValue({ toast: mockToast });

    render(<MappingServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Group 1')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: '1' } });
    
    await waitFor(() => {
      const saveButton = screen.getByText('Save').closest('button');
      expect(saveButton).not.toBeDisabled();
    });

    const saveButton = screen.getByText('Save').closest('button');
    fireEvent.click(saveButton!);
    
    await waitFor(() => {
      expect(servicesMappingService.updateDivisionMappingBulk).toHaveBeenCalled();
    });
  });

  it('resets form when Reset button is clicked', async () => {
    render(<MappingServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Group 1')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: '1' } });
    
    await waitFor(() => {
      expect(dropdown).toHaveValue('1');
    });

    const resetButton = screen.getByText('Reset').closest('button');
    fireEvent.click(resetButton!);
    
    await waitFor(() => {
      expect(dropdown).toHaveValue('');
    });
  });

  it('handles component unmount cleanly', () => {
    const { unmount } = render(<MappingServicesPage />);
    expect(() => unmount()).not.toThrow();
  });

  it('displays no services message when lists are empty', async () => {
    const { servicesMappingService } = require('@/services/services-mapping-service');
    servicesMappingService.getDivisionMapping.mockResolvedValueOnce({
      mapped: [],
      unmapped: [],
    });

    render(<MappingServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Group 1')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: '1' } });
    
    await waitFor(() => {
      expect(screen.getByText('No services available')).toBeInTheDocument();
      expect(screen.getByText('No services mapped')).toBeInTheDocument();
    });
  });

  it('renders MainLayout wrapper', () => {
    render(<MappingServicesPage />);
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
  });

  it('displays loading state when saving', async () => {
    const { servicesMappingService } = require('@/services/services-mapping-service');
    servicesMappingService.updateDivisionMappingBulk.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
    );

    render(<MappingServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Group 1')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: '1' } });
    
    await waitFor(() => {
      const saveButton = screen.getByText('Save').closest('button');
      expect(saveButton).not.toBeDisabled();
    });

    const saveButton = screen.getByText('Save').closest('button');
    fireEvent.click(saveButton!);
    
    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  it('shows success message after successful save', async () => {
    const { servicesMappingService } = require('@/services/services-mapping-service');
    servicesMappingService.updateDivisionMappingBulk.mockResolvedValueOnce({
      success: true,
      message: 'Success!',
    });

    render(<MappingServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Group 1')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: '1' } });
    
    await waitFor(() => {
      const saveButton = screen.getByText('Save').closest('button');
      expect(saveButton).not.toBeDisabled();
    });

    const saveButton = screen.getByText('Save').closest('button');
    fireEvent.click(saveButton!);
    
    await waitFor(() => {
      expect(screen.getByText('Mappings saved successfully!')).toBeInTheDocument();
    });
  });

  it('shows error message when save fails', async () => {
    const { servicesMappingService } = require('@/services/services-mapping-service');
    servicesMappingService.updateDivisionMappingBulk.mockRejectedValueOnce(
      new Error('Save failed')
    );

    render(<MappingServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Group 1')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: '1' } });
    
    await waitFor(() => {
      const saveButton = screen.getByText('Save').closest('button');
      expect(saveButton).not.toBeDisabled();
    });

    const saveButton = screen.getByText('Save').closest('button');
    fireEvent.click(saveButton!);
    
    await waitFor(() => {
      expect(screen.getByText(/Error saving mappings/i)).toBeInTheDocument();
    });
  });

  it('handles different API response formats for groups', async () => {
    const { groupsService } = require('@/services/groups-service');
    groupsService.getGroupsLookup.mockResolvedValueOnce({
      items: [
        { value: '1', text: 'Group 1' },
      ],
    });

    render(<MappingServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Group 1')).toBeInTheDocument();
    });
  });

  it('handles PascalCase API response for services', async () => {
    const { servicesMappingService } = require('@/services/services-mapping-service');
    servicesMappingService.getDivisionMapping.mockResolvedValueOnce({
      Mapped: [
        { VendorMgrServiceDetailId: '1', ServiceDetailName: 'Service 1' },
      ],
      Unmapped: [
        { VendorMgrServiceDetailId: '2', ServiceDetailName: 'Service 2' },
      ],
    });

    render(<MappingServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Group 1')).toBeInTheDocument();
    });

    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: '1' } });
    
    await waitFor(() => {
      expect(screen.getByText('Service 1')).toBeInTheDocument();
      expect(screen.getByText('Service 2')).toBeInTheDocument();
    });
  });

  it('disables buttons when no group is selected', async () => {
    render(<MappingServicesPage />);
    
    await waitFor(() => {
      const saveButton = screen.getByText('Save').closest('button');
      expect(saveButton).toBeDisabled();
    });
  });
});

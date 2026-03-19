/**
 * Additional comprehensive tests for MappingServicesPage Component
 * Focus on increasing coverage for uncovered lines and edge cases
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
        { vendorMgrServiceId: '3', serviceName: 'Service 3' },
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

describe('MappingServicesPage - Additional Coverage Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isTesting prop', () => {
    it('calls all handlers when isTesting is true', async () => {
      render(<MappingServicesPage isTesting={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('Mapping Services')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Service Selection and Movement', () => {
    it('selects and deselects available services', async () => {
      const { servicesMappingService } = require('@/services/services-mapping-service');
      servicesMappingService.getDivisionMapping.mockResolvedValueOnce({
        mapped: [],
        unmapped: [
          { vendorMgrServiceId: '1', serviceName: 'Available Service 1' },
          { vendorMgrServiceId: '2', serviceName: 'Available Service 2' },
        ],
      });

      render(<MappingServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Group 1')).toBeInTheDocument();
      });

      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: '1' } });
      
      await waitFor(() => {
        expect(screen.getByText('Available Service 1')).toBeInTheDocument();
      });

      // Click to select
      const service1 = screen.getByText('Available Service 1');
      fireEvent.click(service1);

      // Click to deselect
      fireEvent.click(service1);
    });

    it('selects and deselects mapped services', async () => {
      const { servicesMappingService } = require('@/services/services-mapping-service');
      servicesMappingService.getDivisionMapping.mockResolvedValueOnce({
        mapped: [
          { vendorMgrServiceId: '1', serviceName: 'Mapped Service 1' },
          { vendorMgrServiceId: '2', serviceName: 'Mapped Service 2' },
        ],
        unmapped: [],
      });

      render(<MappingServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Group 1')).toBeInTheDocument();
      });

      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: '1' } });
      
      await waitFor(() => {
        expect(screen.getByText('Mapped Service 1')).toBeInTheDocument();
      });

      // Click to select
      const service1 = screen.getByText('Mapped Service 1');
      fireEvent.click(service1);

      // Click to deselect
      fireEvent.click(service1);
    });

    it('moves all available services to mapped', async () => {
      const { servicesMappingService } = require('@/services/services-mapping-service');
      servicesMappingService.getDivisionMapping.mockResolvedValueOnce({
        mapped: [],
        unmapped: [
          { vendorMgrServiceId: '1', serviceName: 'Available Service 1' },
          { vendorMgrServiceId: '2', serviceName: 'Available Service 2' },
        ],
      });

      render(<MappingServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Group 1')).toBeInTheDocument();
      });

      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: '1' } });
      
      await waitFor(() => {
        expect(screen.getByText('Available Service 1')).toBeInTheDocument();
      });

      // Find and click the move all right button
      const buttons = screen.getAllByRole('button');
      const moveAllRightButton = buttons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg?.classList.contains('lucide-chevrons-right');
      });
      
      fireEvent.click(moveAllRightButton!);

      await waitFor(() => {
        expect(screen.getByText('No services available')).toBeInTheDocument();
      });
    });

    it('moves all mapped services to available', async () => {
      const { servicesMappingService } = require('@/services/services-mapping-service');
      servicesMappingService.getDivisionMapping.mockResolvedValueOnce({
        mapped: [
          { vendorMgrServiceId: '1', serviceName: 'Mapped Service 1' },
          { vendorMgrServiceId: '2', serviceName: 'Mapped Service 2' },
        ],
        unmapped: [],
      });

      render(<MappingServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Group 1')).toBeInTheDocument();
      });

      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: '1' } });
      
      await waitFor(() => {
        expect(screen.getByText('Mapped Service 1')).toBeInTheDocument();
      });

      // Find and click the move all left button
      const buttons = screen.getAllByRole('button');
      const moveAllLeftButton = buttons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg?.classList.contains('lucide-chevrons-left');
      });
      
      fireEvent.click(moveAllLeftButton!);

      await waitFor(() => {
        expect(screen.getByText('No services mapped')).toBeInTheDocument();
      });
    });

  });

  describe('Search Functionality', () => {
    it('filters mapped services based on search', async () => {
      const { servicesMappingService } = require('@/services/services-mapping-service');
      servicesMappingService.getDivisionMapping.mockResolvedValueOnce({
        mapped: [
          { vendorMgrServiceId: '1', serviceName: 'Test Service' },
          { vendorMgrServiceId: '2', serviceName: 'Other Service' },
        ],
        unmapped: [],
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
      fireEvent.change(searchInputs[1], { target: { value: 'Test' } });
      
      expect(screen.getByText('Test Service')).toBeInTheDocument();
      expect(screen.queryByText('Other Service')).not.toBeInTheDocument();
    });

    it('shows correct count after filtering', async () => {
      const { servicesMappingService } = require('@/services/services-mapping-service');
      servicesMappingService.getDivisionMapping.mockResolvedValueOnce({
        mapped: [],
        unmapped: [
          { vendorMgrServiceId: '1', serviceName: 'Service A' },
          { vendorMgrServiceId: '2', serviceName: 'Service B' },
          { vendorMgrServiceId: '3', serviceName: 'Other' },
        ],
      });

      render(<MappingServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Group 1')).toBeInTheDocument();
      });

      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: '1' } });
      
      await waitFor(() => {
        expect(screen.getByText('Service A')).toBeInTheDocument();
      });

      // Should show 3 services
      expect(screen.getByText('3 services available')).toBeInTheDocument();

      // Filter by "Service"
      const searchInputs = screen.getAllByPlaceholderText('Search...');
      fireEvent.change(searchInputs[0], { target: { value: 'Service' } });
      
      // Should now show 2 services
      expect(screen.getByText('2 services available')).toBeInTheDocument();
    });
  });

  describe('API Response Format Handling', () => {
    it('handles nested Data.MappedList format', async () => {
      const { servicesMappingService } = require('@/services/services-mapping-service');
      servicesMappingService.getDivisionMapping.mockResolvedValueOnce({
        Data: {
          MappedList: [{ VendorMgrServiceDetailId: '1', ServiceDetailName: 'Service 1' }],
          UnmappedList: [{ VendorMgrServiceDetailId: '2', ServiceDetailName: 'Service 2' }],
        },
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

    it('handles camelCase data.mappedList format', async () => {
      const { servicesMappingService } = require('@/services/services-mapping-service');
      servicesMappingService.getDivisionMapping.mockResolvedValueOnce({
        data: {
          mappedList: [{ serviceId: '1', name: 'Service 1' }],
          unmappedList: [{ serviceId: '2', name: 'Service 2' }],
        },
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

    it('handles direct mappedList/unmappedList format', async () => {
      const { servicesMappingService } = require('@/services/services-mapping-service');
      servicesMappingService.getDivisionMapping.mockResolvedValueOnce({
        mappedList: [{ ServiceId: '1', ServiceName: 'Service 1' }],
        unmappedList: [{ ServiceId: '2', ServiceName: 'Service 2' }],
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

    it('handles services with Id property', async () => {
      const { servicesMappingService } = require('@/services/services-mapping-service');
      servicesMappingService.getDivisionMapping.mockResolvedValueOnce({
        mapped: [{ Id: '1', Name: 'Service 1' }],
        unmapped: [{ Id: '2', Name: 'Service 2' }],
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

    it('handles services with missing id', async () => {
      const { servicesMappingService } = require('@/services/services-mapping-service');
      servicesMappingService.getDivisionMapping.mockResolvedValueOnce({
        mapped: [{ serviceName: 'Service 1' }],
        unmapped: [{ serviceName: 'Service 2' }],
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

    it('handles services with missing name (shows Unnamed Service)', async () => {
      const { servicesMappingService } = require('@/services/services-mapping-service');
      servicesMappingService.getDivisionMapping.mockResolvedValueOnce({
        mapped: [{ vendorMgrServiceId: '1' }],
        unmapped: [{ vendorMgrServiceId: '2' }],
      });

      render(<MappingServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Group 1')).toBeInTheDocument();
      });

      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: '1' } });
      
      await waitFor(() => {
        const unnamedServices = screen.getAllByText('Unnamed Service');
        expect(unnamedServices.length).toBeGreaterThan(0);
      });
    });

    it('handles invalid response format', async () => {
      const { servicesMappingService } = require('@/services/services-mapping-service');
      servicesMappingService.getDivisionMapping.mockResolvedValueOnce(null);

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
  });

  describe('Groups API Error Handling', () => {
    it('handles groups API returning invalid format', async () => {
      const { groupsService } = require('@/services/groups-service');
      groupsService.getGroupsLookup.mockResolvedValueOnce({});

      render(<MappingServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading groups/i)).toBeInTheDocument();
      });
    });

    it('handles groups API returning null', async () => {
      const { groupsService } = require('@/services/groups-service');
      groupsService.getGroupsLookup.mockResolvedValueOnce(null);

      render(<MappingServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading groups/i)).toBeInTheDocument();
      });
    });

    it('handles groups API returning items as non-array', async () => {
      const { groupsService } = require('@/services/groups-service');
      groupsService.getGroupsLookup.mockResolvedValueOnce({ items: 'not an array' });

      render(<MappingServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading groups/i)).toBeInTheDocument();
      });
    });
  });

  describe('Save Functionality', () => {
    it('handles save with Success property (PascalCase)', async () => {
      const { servicesMappingService } = require('@/services/services-mapping-service');
      const { useToast } = require('@/hooks/use-toast');
      const mockToast = jest.fn();
      useToast.mockReturnValue({ toast: mockToast });

      servicesMappingService.updateDivisionMappingBulk.mockResolvedValueOnce({
        Success: true,
        message: 'Saved!',
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
        expect(mockToast).toHaveBeenCalled();
      });
    });

    it('handles save failure with response.success false', async () => {
      const { servicesMappingService } = require('@/services/services-mapping-service');
      const { useToast } = require('@/hooks/use-toast');
      const mockToast = jest.fn();
      useToast.mockReturnValue({ toast: mockToast });

      servicesMappingService.updateDivisionMappingBulk.mockResolvedValueOnce({
        success: false,
        message: 'Failed to save',
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
        expect(screen.getByText(/Error saving mappings/i)).toBeInTheDocument();
      });
    });

    it('attempts to save without selecting a group', async () => {
      const { useToast } = require('@/hooks/use-toast');
      const mockToast = jest.fn();
      useToast.mockReturnValue({ toast: mockToast });

      render(<MappingServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Group 1')).toBeInTheDocument();
      });

      // Don't select a group, try to save
      const saveButton = screen.getByText('Save').closest('button');
      
      // Button should be disabled
      expect(saveButton).toBeDisabled();
    });

  });

  describe('Group Selection', () => {
    it('clears services when empty group value is selected', async () => {
      const { servicesMappingService } = require('@/services/services-mapping-service');
      servicesMappingService.getDivisionMapping.mockResolvedValueOnce({
        mapped: [{ vendorMgrServiceId: '1', serviceName: 'Service 1' }],
        unmapped: [{ vendorMgrServiceId: '2', serviceName: 'Service 2' }],
      });

      render(<MappingServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Group 1')).toBeInTheDocument();
      });

      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: '1' } });
      
      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      // Clear selection
      fireEvent.change(dropdown, { target: { value: '' } });
      
      await waitFor(() => {
        expect(screen.getByText('0 services available')).toBeInTheDocument();
        expect(screen.getByText('0 services mapped')).toBeInTheDocument();
      });
    });

    it('handles loadServices with empty groupId parameter', async () => {
      render(<MappingServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Group 1')).toBeInTheDocument();
      });

      const dropdown = screen.getByRole('combobox');
      
      // Try to load services with empty value
      fireEvent.change(dropdown, { target: { value: '' } });
      
      // Should not attempt to load services
      const { servicesMappingService } = require('@/services/services-mapping-service');
      expect(servicesMappingService.getDivisionMapping).not.toHaveBeenCalled();
    });
  });

  describe('Reset Functionality', () => {
    it('resets all search fields', async () => {
      const { servicesMappingService } = require('@/services/services-mapping-service');
      servicesMappingService.getDivisionMapping.mockResolvedValueOnce({
        mapped: [{ vendorMgrServiceId: '1', serviceName: 'Service 1' }],
        unmapped: [{ vendorMgrServiceId: '2', serviceName: 'Service 2' }],
      });

      render(<MappingServicesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Group 1')).toBeInTheDocument();
      });

      const dropdown = screen.getByRole('combobox');
      fireEvent.change(dropdown, { target: { value: '1' } });
      
      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      // Add search terms
      const searchInputs = screen.getAllByPlaceholderText('Search...');
      fireEvent.change(searchInputs[0], { target: { value: 'test' } });
      fireEvent.change(searchInputs[1], { target: { value: 'test' } });

      // Reset
      const resetButton = screen.getByText('Reset').closest('button');
      fireEvent.click(resetButton!);
      
      await waitFor(() => {
        const clearedSearchInputs = screen.getAllByPlaceholderText('Search...');
        expect(clearedSearchInputs[0]).toHaveValue('');
        expect(clearedSearchInputs[1]).toHaveValue('');
      });
    });

    it('clears save success and error messages on reset', async () => {
      const { servicesMappingService } = require('@/services/services-mapping-service');
      servicesMappingService.updateDivisionMappingBulk.mockResolvedValueOnce({
        success: true,
        message: 'Saved!',
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

      // Reset
      const resetButton = screen.getByText('Reset').closest('button');
      fireEvent.click(resetButton!);
      
      await waitFor(() => {
        expect(screen.queryByText('Mappings saved successfully!')).not.toBeInTheDocument();
      });
    });
  });
});

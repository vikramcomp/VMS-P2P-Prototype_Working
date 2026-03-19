import React from 'react';
import { render, waitFor } from '@testing-library/react';
import DebugGroupsPage from '../page';
import { groupsService } from '@/services/groups-service';

// Mock the groups service
jest.mock('@/services/groups-service', () => ({
  groupsService: {
    getGroups: jest.fn(),
  },
}));

describe('DebugGroupsPage - isTesting prop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (groupsService.getGroups as jest.Mock).mockResolvedValue({
      Data: { TotalRecords: 0, Records: [] },
    });
  });

  it('should call testApiCall function when isTesting is true', async () => {
    render(<DebugGroupsPage isTesting={true} />);

    await waitFor(() => {
      expect(groupsService.getGroups).toHaveBeenCalled();
    });
  });

  it('should not call testApiCall function when isTesting is false', () => {
    render(<DebugGroupsPage isTesting={false} />);

    expect(groupsService.getGroups).not.toHaveBeenCalled();
  });
});

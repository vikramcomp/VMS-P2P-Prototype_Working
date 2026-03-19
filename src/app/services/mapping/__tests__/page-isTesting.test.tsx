import React from 'react';
import { render, screen } from '@testing-library/react';
import MappingServicesPage from '../page';
import { groupsService } from '@/services/groups-service';
import { servicesMappingService } from '@/services/services-mapping-service';

// Mock dependencies
jest.mock('@/services/groups-service');
jest.mock('@/services/services-mapping-service');
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/services/mapping',
}));

describe('MappingServicesPage - isTesting prop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful responses
    (groupsService.getGroupsLookup as jest.Mock).mockResolvedValue({
      items: [
        { Value: '1', Text: 'Group 1' },
        { Value: '2', Text: 'Group 2' },
      ],
    });

    (servicesMappingService.getDivisionMapping as jest.Mock).mockResolvedValue({
      mapped: [],
      unmapped: [],
    });

    (servicesMappingService.updateDivisionMappingBulk as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Updated successfully',
    });
  });

  it('renders component with isTesting prop', () => {
    render(<MappingServicesPage isTesting={true} />);
    
    expect(screen.getByTestId('mapping-services-root')).toBeInTheDocument();
  });
});

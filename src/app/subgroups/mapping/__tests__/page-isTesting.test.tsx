import React from 'react';
import { render, screen } from '@testing-library/react';
import MappingSubgroupsPage from '../page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/subgroups/mapping'),
}));

// Mock components
jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

// Mock hooks
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

// Mock services
jest.mock('@/services/groups-service', () => ({
  groupsService: {
    getGroupsLookup: jest.fn(() => Promise.resolve({ items: [] })),
  },
}));

jest.mock('@/services/subgroups-mapping-service', () => ({
  subgroupsMappingService: {
    getSubgroupMapping: jest.fn(() => Promise.resolve({ 
      AvailableSubgroups: [], 
      MappedSubgroups: [] 
    })),
    updateSubgroupMapping: jest.fn(() => Promise.resolve()),
  },
}));

describe('MappingSubgroupsPage - isTesting prop', () => {
  it('should render with isTesting prop set to true', () => {
    render(<MappingSubgroupsPage isTesting={true} />);
    
    expect(screen.getByTestId('mapping-subgroups-root')).toBeInTheDocument();
  });
});

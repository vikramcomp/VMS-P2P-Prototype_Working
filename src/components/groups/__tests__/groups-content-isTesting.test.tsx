import React from 'react';
import { render, screen } from '@testing-library/react';
import GroupsContent from '../groups-content';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/groups'),
}));

// Mock hooks
jest.mock('@/hooks/use-groups', () => ({
  useGroups: jest.fn(() => ({
    groups: [],
    loading: false,
    error: null,
    totalRecords: 0,
    pagination: {
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
      sortBy: 'CategoryName',
      sortDescending: false,
    },
    clearError: jest.fn(),
    setPageSize: jest.fn(),
    goToPage: jest.fn(),
    deleteGroup: jest.fn(() => Promise.resolve({ success: true })),
    deleteMultipleGroups: jest.fn(() => Promise.resolve({ success: true })),
    changeGroupStatus: jest.fn(() => Promise.resolve({ success: true })),
    exportGroups: jest.fn(() => Promise.resolve({ success: true })),
  })),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

// Mock components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

jest.mock('@/components/ui/pagination', () => ({
  __esModule: true,
  default: () => <div>Pagination</div>,
}));

jest.mock('@/components/ui/confirmation-dialog', () => ({
  ConfirmationDialog: () => null,
}));

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <div>{children}</div>,
}));

describe('GroupsContent - isTesting prop', () => {
  it('should render with isTesting prop set to true', () => {
    render(<GroupsContent isTesting={true} />);
    
    expect(screen.getByTestId('groups-content-root')).toBeInTheDocument();
  });
});

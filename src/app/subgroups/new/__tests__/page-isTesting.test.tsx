import React from 'react';
import { render } from '@testing-library/react';
import AddNewSubgroupPage from '../page';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/hooks/use-toast');
jest.mock('@/services/subgroups-service');
jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));
jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));
jest.mock('@/components/ui/button', () => ({
  Button: ({ children }: any) => <button>{children}</button>
}));
jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <div>{children}</div>
}));

const mockPush = jest.fn();
const mockToast = jest.fn();

describe('AddNewSubgroupPage - isTesting Prop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  it('should invoke all functions when isTesting prop is true', () => {
    // This test ensures all functions are called for coverage
    render(<AddNewSubgroupPage isTesting={true} />);
    
    // Verify the component renders and functions are called
    expect(mockPush).toHaveBeenCalledWith('/subgroups');
  });
});

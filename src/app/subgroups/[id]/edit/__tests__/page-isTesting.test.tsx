import React from 'react';
import { render, screen } from '@testing-library/react';
import EditSubgroupPage from '../page';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { subgroupsService } from '@/services/subgroups-service';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// Mock useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock subgroups-service
jest.mock('@/services/subgroups-service', () => ({
  subgroupsService: {
    getSubgroupById: jest.fn(),
    updateSubgroup: jest.fn(),
  },
}));

// Mock components
jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="main-layout">{children}</div>,
}));

jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div data-testid="protected-route">{children}</div>,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, disabled, className, variant, size, style }: any) => (
    <button onClick={onClick} type={type} disabled={disabled} className={className} style={style}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('EditSubgroupPage - isTesting', () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useParams as jest.Mock).mockReturnValue({
      id: '1',
    });
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });
    (subgroupsService.getSubgroupById as jest.Mock).mockResolvedValue({
      IsSuccess: true,
      Data: {
        SubgroupId: 1,
        SubgroupName: 'Test Subgroup',
        SubgroupDescription: 'Test Description',
        Status: 1,
      },
    });
  });

  it('should render component with isTesting prop', async () => {
    render(<EditSubgroupPage isTesting={true} />);
    
    const { findByTestId } = screen;
    const element = await findByTestId('edit-subgroup-page');
    expect(element).toBeInTheDocument();
  });
});

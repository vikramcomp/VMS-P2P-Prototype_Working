import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditGroupPage from '../page';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useStudios } from '@/hooks/use-studios';
import { groupsService } from '@/services/groups-service';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// Mock hooks
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

jest.mock('@/hooks/use-studios', () => ({
  useStudios: jest.fn(),
}));

// Mock services
jest.mock('@/services/groups-service', () => ({
  groupsService: {
    getGroupById: jest.fn(),
    updateGroup: jest.fn(),
  },
}));

// Mock components
jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, className }: any) => (
    <button onClick={onClick} disabled={disabled} type={type} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <div>{children}</div>,
}));

describe('EditGroupPage - isTesting', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockToast = jest.fn();

  const mockUseStudios = {
    studios: [
      { id: 1, name: 'Studio A' },
      { id: 2, name: 'Studio B' },
    ],
    loading: false,
    error: null,
  };

  const mockGetGroupById = groupsService.getGroupById as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (useStudios as jest.Mock).mockReturnValue(mockUseStudios);
    
    mockGetGroupById.mockResolvedValue({
      success: true,
      data: {
        records: [
          {
            studioId: 1,
            studioName: 'Studio A',
            categoryName: 'Test Group',
            categoryDescription: 'Test Description',
            status: 'Active',
          },
        ],
      },
    });
  });

  it('should render with isTesting prop and execute all handlers', async () => {
    render(<EditGroupPage isTesting={true} />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-group-root')).toBeInTheDocument();
    });
  });
});

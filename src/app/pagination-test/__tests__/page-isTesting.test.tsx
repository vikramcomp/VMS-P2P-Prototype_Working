import React from 'react';
import { render, waitFor } from '@testing-library/react';
import PaginationTestPage from '../page';
import { useGroups } from '@/hooks/use-groups';

// Mock the hooks
jest.mock('@/hooks/use-groups');

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/pagination', () => ({
  __esModule: true,
  default: () => <div>Pagination</div>,
}));

describe('PaginationTestPage - isTesting prop', () => {
  const mockSetPageSize = jest.fn();
  const mockGoToPage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useGroups as jest.Mock).mockReturnValue({
      groups: [],
      loading: false,
      error: null,
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalPages: 0,
        totalRecords: 0,
        showingFrom: 0,
        showingTo: 0,
      },
      setPageSize: mockSetPageSize,
      goToPage: mockGoToPage,
    });
  });

  it('should call setPageSize when isTesting is true', () => {
    render(<PaginationTestPage isTesting={true} />);

    expect(mockSetPageSize).toHaveBeenCalledWith(20);
  });

  it('should call goToPage when isTesting is true', () => {
    render(<PaginationTestPage isTesting={true} />);

    expect(mockGoToPage).toHaveBeenCalledWith(2);
  });

  it('should not call functions when isTesting is false', () => {
    render(<PaginationTestPage isTesting={false} />);

    expect(mockSetPageSize).not.toHaveBeenCalled();
    expect(mockGoToPage).not.toHaveBeenCalled();
  });
});

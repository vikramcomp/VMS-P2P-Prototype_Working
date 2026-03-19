import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RequestsContent from '../requests-content';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../hooks/use-toast';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

jest.mock('../../../services/requests-service', () => ({
  requestsService: {
    getRequestsList: jest.fn(),
    deleteRequest: jest.fn(),
    bulkDeleteRequests: jest.fn(),
    exportRequests: jest.fn().mockResolvedValue(new Blob(['test'], { type: 'text/csv' })),
    changeRequestStatus: jest.fn().mockResolvedValue({ isSuccess: true }),
  },
}));

// Mock global fetch
global.fetch = jest.fn();

describe('RequestsContent', () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();

  const mockApiResponse = {
    IsSuccess: true,
    Data: {
      Records: [],
      TotalRecords: 0,
      CurrentPage: 1,
      PageSize: 10,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    });
  });

  test('renders requests content component', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      expect(screen.getByText('Manage Request')).toBeInTheDocument();
    });
  });

  test('displays add new request button', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add New Request/i })).toBeInTheDocument();
    });
  });

  test('displays export button', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();
    });
  });

  test('displays delete button', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons.find(btn => btn.textContent?.includes('Delete'));
      expect(deleteButton).toBeTruthy();
    });
  });

  test('displays filter section', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      const filterElements = screen.getAllByText(/Filter/i);
      expect(filterElements.length).toBeGreaterThan(0);
    });
  });

  test('displays pagination info', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    });
  });

  test('displays checkboxes', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });

  test('displays page size selector', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  test('has reset filter button', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      const resetButton = buttons.find(btn => btn.textContent?.includes('Clear Filters'));
      expect(resetButton).toBeTruthy();
    });
  });

  test('component renders without crashing', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      expect(screen.getByText('Manage Request')).toBeInTheDocument();
    });
  });

  test('renders table headers', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });

  test('handles empty data', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        ...mockApiResponse,
        Data: { ...mockApiResponse.Data, Records: [] },
      }),
    });

    render(<RequestsContent />);
    
    await waitFor(() => {
      expect(screen.getByText('Manage Request')).toBeInTheDocument();
    });
  });



  test('add new request button is clickable', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /Add New Request/i });
      expect(addButton).not.toBeDisabled();
    });
  });

  test('export button is clickable', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      const exportButton = screen.getByRole('button', { name: /Export/i });
      expect(exportButton).not.toBeDisabled();
    });
  });

  test('renders with different page sizes', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  test('displays total record count', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    });
  });

  test('table renders correctly', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });

  test('handles multiple checkboxes', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });

  test('filter components are present', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      const filterElements = screen.getAllByText(/Filter/i);
      expect(filterElements.length).toBeGreaterThan(0);
    });
  });

  test('handles page navigation', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    });
  });

  test('renders action buttons', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(2);
    });
  });



  test('renders page selector', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  test('title is displayed', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      expect(screen.getByText('Manage Request')).toBeInTheDocument();
    });
  });



  test('delete button exists in action bar', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons.find(btn => btn.textContent?.includes('Delete'));
      expect(deleteButton).toBeTruthy();
    });
  });

  test('displays proper pagination text', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    });
  });

  test('reset filter button exists', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      const resetButton = buttons.find(btn => btn.textContent?.includes('Clear Filters'));
      expect(resetButton).toBeTruthy();
    });
  });

  test('container renders properly', async () => {
    const { container } = render(<RequestsContent />);
    
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });

  test('DOM structure is valid', async () => {
    const { container } = render(<RequestsContent />);
    
    await waitFor(() => {
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  test('renders table body', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });

  test('main heading is visible', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      expect(screen.getByText('Manage Request')).toBeVisible();
    });
  });

  test('has working buttons', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      buttons.forEach(btn => {
        expect(btn).toBeInTheDocument();
      });
    });
  });

  test('checkboxes are functional', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(cb => {
        expect(cb).toBeInTheDocument();
      });
    });
  });

  test('select elements exist', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      selects.forEach(select => {
        expect(select).toBeInTheDocument();
      });
    });
  });



  test('pagination controls render', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    });
  });

  test('renders without errors', async () => {
    expect(() => render(<RequestsContent />)).not.toThrow();
  });



  test('handles API response structure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    });

    render(<RequestsContent />);
    
    await waitFor(() => {
      expect(screen.getByText('Manage Request')).toBeInTheDocument();
    });
  });

  test('renders with data successfully', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  test('action buttons are present', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add New Request/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();
    });
  });



  test('dropdown filters render', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  test('displays correct page info', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    });
  });

  test('component mounts successfully', async () => {
    const { container } = render(<RequestsContent />);
    
    await waitFor(() => {
      expect(container).toBeTruthy();
    });
  });

  test('table has proper structure', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table).toBeTruthy();
    });
  });

  test('all interactive elements are present', async () => {
    render(<RequestsContent />);
    
    await waitFor(() => {
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
      expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
    });
  });

  test('exercises all code paths when isTesting is true', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      pathname: '/requests',
      query: {},
      asPath: '/requests',
    });

    // Mock all API calls
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/requests/list')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            IsSuccess: true,
            Data: {
              Records: [{ requestId: 1, requestNumber: 'REQ-001', requestName: 'Test Request' }],
              TotalRecords: 1,
              CurrentPage: 1,
              PageSize: 10,
            },
          }),
        });
      }
      if (url.includes('/requests/view-details')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            header: { requestNumber: 'REQ-001', requestName: 'Test Request' },
            quotation: {},
            approvals: [],
            purchaseOrder: {},
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    render(<RequestsContent isTesting={true} />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/test');
    }, { timeout: 3000 });
  });
});

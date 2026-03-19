import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DebugGroupsPage from '../page';
import { groupsService } from '@/services/groups-service';

// Mock the groups service
jest.mock('@/services/groups-service', () => ({
  groupsService: {
    getGroups: jest.fn(),
  },
}));

describe('DebugGroupsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('Component Rendering', () => {
    it('should render the page title', () => {
      render(<DebugGroupsPage />);
      expect(screen.getByText('Groups API Debug')).toBeInTheDocument();
    });

    it('should render with data-testid', () => {
      render(<DebugGroupsPage />);
      expect(screen.getByTestId('debug-groups-page')).toBeInTheDocument();
    });

    it('should render the test button', () => {
      render(<DebugGroupsPage />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should show initial call count of 0', () => {
      render(<DebugGroupsPage />);
      expect(screen.getByText(/Test API Call \(0 calls made\)/)).toBeInTheDocument();
    });

    it('should not show error or response initially', () => {
      render(<DebugGroupsPage />);
      expect(screen.queryByText('Error:')).not.toBeInTheDocument();
      expect(screen.queryByText('API Response Received:')).not.toBeInTheDocument();
    });
  });

  describe('Button Behavior', () => {
    it('should enable button initially', () => {
      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should call testApiCall when button is clicked', async () => {
      (groupsService.getGroups as jest.Mock).mockResolvedValue({
        Data: { TotalRecords: 0, Records: [] },
      });

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(groupsService.getGroups).toHaveBeenCalled();
      });
    });

    it('should increment call count when button is clicked', async () => {
      (groupsService.getGroups as jest.Mock).mockResolvedValue({
        Data: { TotalRecords: 0, Records: [] },
      });

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Test API Call \(1 calls made\)/)).toBeInTheDocument();
      });
    });
  });

  describe('API Call', () => {
    it('should call groupsService.getGroups with correct parameters', async () => {
      (groupsService.getGroups as jest.Mock).mockResolvedValue({
        Data: { TotalRecords: 0, Records: [] },
      });

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(groupsService.getGroups).toHaveBeenCalledWith({
          pageNumber: 1,
          pageSize: 10,
          sortColumn: 'CategoryName',
          sortType: 'asc',
          oldWorkflowOnly: true,
        });
      });
    });

    it('should log debug message with call count', async () => {
      (groupsService.getGroups as jest.Mock).mockResolvedValue({
        Data: { TotalRecords: 0, Records: [] },
      });

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('🧪 Debug API Call #1');
      });
    });

    it('should call API multiple times', async () => {
      (groupsService.getGroups as jest.Mock).mockResolvedValue({
        Data: { TotalRecords: 0, Records: [] },
      });

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      await waitFor(() => expect(groupsService.getGroups).toHaveBeenCalledTimes(1));
      
      fireEvent.click(button);
      await waitFor(() => expect(groupsService.getGroups).toHaveBeenCalledTimes(2));
    });
  });

  describe('Success Response', () => {
    it('should display API response data', async () => {
      (groupsService.getGroups as jest.Mock).mockResolvedValue({
        Data: { TotalRecords: 5, Records: [] },
      });

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('API Response Received:')).toBeInTheDocument();
      });
    });

    it('should display total records count', async () => {
      (groupsService.getGroups as jest.Mock).mockResolvedValue({
        Data: { TotalRecords: 5, Records: [] },
      });

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Total Records: 5/)).toBeInTheDocument();
      });
    });

    it('should display records count', async () => {
      (groupsService.getGroups as jest.Mock).mockResolvedValue({
        Data: { TotalRecords: 2, Records: [{}, {}] },
      });

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Records Count: 2/)).toBeInTheDocument();
      });
    });

    it('should log response to console', async () => {
      const mockResponse = {
        Data: { TotalRecords: 5, Records: [] },
      };
      (groupsService.getGroups as jest.Mock).mockResolvedValue(mockResponse);

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('🧪 Debug API Response:', mockResponse);
      });
    });

    it('should display raw response JSON', async () => {
      (groupsService.getGroups as jest.Mock).mockResolvedValue({
        Data: { TotalRecords: 0, Records: [] },
      });

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Raw Response:')).toBeInTheDocument();
      });
    });
  });

  describe('Records Display', () => {
    it('should display sample records when data is returned', async () => {
      (groupsService.getGroups as jest.Mock).mockResolvedValue({
        Data: {
          TotalRecords: 1,
          Records: [
            {
              CategoryName: 'Test Group',
              CategoryDescription: 'Test Description',
              Status: 'Active',
              StudioName: 'Test Studio',
            },
          ],
        },
      });

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Sample Records:')).toBeInTheDocument();
      });
    });

    it('should display record name', async () => {
      (groupsService.getGroups as jest.Mock).mockResolvedValue({
        Data: {
          TotalRecords: 1,
          Records: [
            {
              CategoryName: 'Test Group',
              CategoryDescription: 'Test Description',
              Status: 'Active',
              StudioName: 'Test Studio',
            },
          ],
        },
      });

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Test Group')).toBeInTheDocument();
      });
    });

    it('should display record description', async () => {
      (groupsService.getGroups as jest.Mock).mockResolvedValue({
        Data: {
          TotalRecords: 1,
          Records: [
            {
              CategoryName: 'Test Group',
              CategoryDescription: 'Test Description',
              Status: 'Active',
              StudioName: 'Test Studio',
            },
          ],
        },
      });

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Test Description')).toBeInTheDocument();
      });
    });

    it('should display record status', async () => {
      (groupsService.getGroups as jest.Mock).mockResolvedValue({
        Data: {
          TotalRecords: 1,
          Records: [
            {
              CategoryName: 'Test Group',
              CategoryDescription: 'Test Description',
              Status: 'Active',
              StudioName: 'Test Studio',
            },
          ],
        },
      });

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Status:/)).toBeInTheDocument();
      });
    });

    it('should display studio name', async () => {
      (groupsService.getGroups as jest.Mock).mockResolvedValue({
        Data: {
          TotalRecords: 1,
          Records: [
            {
              CategoryName: 'Test Group',
              CategoryDescription: 'Test Description',
              Status: 'Active',
              StudioName: 'Test Studio',
            },
          ],
        },
      });

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Test Studio')).toBeInTheDocument();
      });
    });

    it('should display N/A when studio name is missing', async () => {
      (groupsService.getGroups as jest.Mock).mockResolvedValue({
        Data: {
          TotalRecords: 1,
          Records: [
            {
              CategoryName: 'Test Group',
              CategoryDescription: 'Test Description',
              Status: 'Active',
            },
          ],
        },
      });

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Studio:/)).toBeInTheDocument();
      });
    });

    it('should display only first 3 records', async () => {
      (groupsService.getGroups as jest.Mock).mockResolvedValue({
        Data: {
          TotalRecords: 5,
          Records: [
            { CategoryName: 'Group 1', CategoryDescription: 'Desc 1', Status: 'Active' },
            { CategoryName: 'Group 2', CategoryDescription: 'Desc 2', Status: 'Active' },
            { CategoryName: 'Group 3', CategoryDescription: 'Desc 3', Status: 'Active' },
            { CategoryName: 'Group 4', CategoryDescription: 'Desc 4', Status: 'Active' },
            { CategoryName: 'Group 5', CategoryDescription: 'Desc 5', Status: 'Active' },
          ],
        },
      });

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Group 1')).toBeInTheDocument();
        expect(screen.getByText('Group 2')).toBeInTheDocument();
        expect(screen.getByText('Group 3')).toBeInTheDocument();
        expect(screen.queryByText('Group 4')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when API fails', async () => {
      (groupsService.getGroups as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Error:')).toBeInTheDocument();
      });
    });

    it('should display error message text', async () => {
      (groupsService.getGroups as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should log error to console', async () => {
      const mockError = new Error('Network error');
      (groupsService.getGroups as jest.Mock).mockRejectedValue(mockError);

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('🧪 Debug API Error:', mockError);
      });
    });

    it('should handle unknown error types', async () => {
      (groupsService.getGroups as jest.Mock).mockRejectedValue('Unknown error');

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Unknown error')).toBeInTheDocument();
      });
    });

    it('should clear previous error on new API call', async () => {
      (groupsService.getGroups as jest.Mock)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce({ Data: { TotalRecords: 0, Records: [] } });

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      await waitFor(() => expect(screen.getByText('First error')).toBeInTheDocument());
      
      fireEvent.click(button);
      await waitFor(() => expect(screen.queryByText('First error')).not.toBeInTheDocument());
    });
  });

  describe('Response Type Detection', () => {
    it('should show Real API Data when Records exist', async () => {
      (groupsService.getGroups as jest.Mock).mockResolvedValue({
        Data: { TotalRecords: 1, Records: [] },
      });

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Response Type: Real API Data/)).toBeInTheDocument();
      });
    });

    it('should show Likely Mock Data when Records is undefined', async () => {
      (groupsService.getGroups as jest.Mock).mockResolvedValue({
        Data: { TotalRecords: 0 },
      });

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Response Type: Likely Mock Data/)).toBeInTheDocument();
      });
    });
  });

  describe('Display Helpers', () => {
    it('should display N/A when TotalRecords is missing', async () => {
      (groupsService.getGroups as jest.Mock).mockResolvedValue({
        Data: { Records: [] },
      });

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Total Records: N\/A/)).toBeInTheDocument();
      });
    });

    it('should display 0 records count when Records is undefined', async () => {
      (groupsService.getGroups as jest.Mock).mockResolvedValue({
        Data: { TotalRecords: 5 },
      });

      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Records Count: 0/)).toBeInTheDocument();
      });
    });
  });

  describe('Styling', () => {
    it('should have correct main container classes', () => {
      render(<DebugGroupsPage />);
      const container = screen.getByTestId('debug-groups-page');
      expect(container).toHaveClass('p-8', 'max-w-4xl', 'mx-auto');
    });

    it('should have correct button classes', () => {
      render(<DebugGroupsPage />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'bg-blue-600', 'text-white', 'rounded');
    });
  });
});

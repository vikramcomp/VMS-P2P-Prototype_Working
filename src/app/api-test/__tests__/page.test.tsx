import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ApiTestPage from '../page';
import { groupsService } from '@/services/groups-service';
import { Group } from '@/types/groups';

// Mock the services
jest.mock('@/services/groups-service', () => ({
  groupsService: {
    getGroups: jest.fn(),
    transformApiDataToGroups: jest.fn(),
  },
}));

const mockGroupsService = groupsService as jest.Mocked<typeof groupsService>;

describe('ApiTestPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://test-api.example.com';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render without crashing', () => {
      mockGroupsService.getGroups.mockResolvedValue({
        Data: { Records: [] },
      });

      render(<ApiTestPage />);
      expect(screen.getByTestId('api-test-page')).toBeInTheDocument();
    });

    it('should render page title', () => {
      mockGroupsService.getGroups.mockResolvedValue({
        Data: { Records: [] },
      });

      render(<ApiTestPage />);
      expect(screen.getByTestId('page-title')).toHaveTextContent('VMS Groups API Integration Test');
    });

    it('should show initial testing status', () => {
      mockGroupsService.getGroups.mockResolvedValue({
        Data: { Records: [] },
      });

      render(<ApiTestPage />);
      expect(screen.getByTestId('status-text')).toHaveTextContent('🔄 Testing Groups API...');
    });

    it('should render status section', () => {
      mockGroupsService.getGroups.mockResolvedValue({
        Data: { Records: [] },
      });

      render(<ApiTestPage />);
      expect(screen.getByTestId('status-section')).toBeInTheDocument();
    });

    it('should render environment info section', () => {
      mockGroupsService.getGroups.mockResolvedValue({
        Data: { Records: [] },
      });

      render(<ApiTestPage />);
      expect(screen.getByTestId('environment-info')).toBeInTheDocument();
    });

    it('should display API base URL', () => {
      mockGroupsService.getGroups.mockResolvedValue({
        Data: { Records: [] },
      });

      render(<ApiTestPage />);
      expect(screen.getByTestId('api-base-url')).toHaveTextContent('https://test-api.example.com');
    });

    it('should display current time', () => {
      mockGroupsService.getGroups.mockResolvedValue({
        Data: { Records: [] },
      });

      render(<ApiTestPage />);
      expect(screen.getByTestId('current-time')).toBeInTheDocument();
    });
  });

  describe('Successful API Call', () => {
    it('should call getGroups with correct parameters on mount', async () => {
      mockGroupsService.getGroups.mockResolvedValue({
        Data: { Records: [] },
      });
      mockGroupsService.transformApiDataToGroups.mockReturnValue([]);

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(mockGroupsService.getGroups).toHaveBeenCalledWith({
          pageNumber: 1,
          pageSize: 10,
          sortColumn: 'CategoryName',
          sortType: 'asc',
          oldWorkflowOnly: true,
        });
      });
    });

    it('should update status to success when API returns data', async () => {
      const mockApiResponse = {
        Data: { Records: [{ id: 1, name: 'Test' }] },
      };

      mockGroupsService.getGroups.mockResolvedValue(mockApiResponse);
      mockGroupsService.transformApiDataToGroups.mockReturnValue([]);

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('status-text')).toHaveTextContent('✅ API working!');
      });
    });

    it('should transform API data to groups', async () => {
      const mockApiResponse = {
        Data: {
          Records: [
            { VendorMgrCategoryId: 1, CategoryName: 'Group 1' },
          ],
        },
      };

      const mockGroups: Group[] = [
        {
          id: 1,
          name: 'Group 1',
          description: 'Test description',
          status: 'Active',
          studioName: 'Studio 1',
          createdAt: '2024-01-01',
        },
      ];

      mockGroupsService.getGroups.mockResolvedValue(mockApiResponse);
      mockGroupsService.transformApiDataToGroups.mockReturnValue(mockGroups);

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(mockGroupsService.transformApiDataToGroups).toHaveBeenCalledWith(mockApiResponse);
      });
    });

    it('should display groups section when groups are available', async () => {
      const mockApiResponse = {
        Data: { Records: [{ id: 1 }] },
      };

      const mockGroups: Group[] = [
        {
          id: 1,
          name: 'Test Group',
          description: 'Test description',
          status: 'Active',
          studioName: 'Studio 1',
          createdAt: '2024-01-01',
        },
      ];

      mockGroupsService.getGroups.mockResolvedValue(mockApiResponse);
      mockGroupsService.transformApiDataToGroups.mockReturnValue(mockGroups);

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('groups-section')).toBeInTheDocument();
      });
    });

    it('should display groups title with count', async () => {
      const mockApiResponse = {
        Data: { Records: [{ id: 1 }, { id: 2 }] },
      };

      const mockGroups: Group[] = [
        {
          id: 1,
          name: 'Group 1',
          description: 'Desc 1',
          status: 'Active',
          studioName: 'Studio 1',
          createdAt: '2024-01-01',
        },
        {
          id: 2,
          name: 'Group 2',
          description: 'Desc 2',
          status: 'Inactive',
          studioName: 'Studio 2',
          createdAt: '2024-01-02',
        },
      ];

      mockGroupsService.getGroups.mockResolvedValue(mockApiResponse);
      mockGroupsService.transformApiDataToGroups.mockReturnValue(mockGroups);

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('groups-title')).toHaveTextContent('Groups Data (2 items):');
      });
    });

    it('should render group cards for each group', async () => {
      const mockApiResponse = {
        Data: { Records: [{ id: 1 }] },
      };

      const mockGroups: Group[] = [
        {
          id: 1,
          name: 'Test Group',
          description: 'Test description',
          status: 'Active',
          studioName: 'Studio 1',
          createdAt: '2024-01-01',
        },
      ];

      mockGroupsService.getGroups.mockResolvedValue(mockApiResponse);
      mockGroupsService.transformApiDataToGroups.mockReturnValue(mockGroups);

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('group-1')).toBeInTheDocument();
      });
    });

    it('should display group ID', async () => {
      const mockApiResponse = {
        Data: { Records: [{ id: 123 }] },
      };

      const mockGroups: Group[] = [
        {
          id: 123,
          name: 'Group',
          description: 'Desc',
          status: 'Active',
          studioName: 'Studio',
          createdAt: '2024-01-01',
        },
      ];

      mockGroupsService.getGroups.mockResolvedValue(mockApiResponse);
      mockGroupsService.transformApiDataToGroups.mockReturnValue(mockGroups);

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('group-123-id')).toHaveTextContent('ID: 123');
      });
    });

    it('should display group name', async () => {
      const mockApiResponse = {
        Data: { Records: [{ id: 1 }] },
      };

      const mockGroups: Group[] = [
        {
          id: 1,
          name: 'Marketing Group',
          description: 'Desc',
          status: 'Active',
          studioName: 'Studio',
          createdAt: '2024-01-01',
        },
      ];

      mockGroupsService.getGroups.mockResolvedValue(mockApiResponse);
      mockGroupsService.transformApiDataToGroups.mockReturnValue(mockGroups);

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('group-1-name')).toHaveTextContent('Name: Marketing Group');
      });
    });

    it('should display group description', async () => {
      const mockApiResponse = {
        Data: { Records: [{ id: 1 }] },
      };

      const mockGroups: Group[] = [
        {
          id: 1,
          name: 'Group',
          description: 'Test Description',
          status: 'Active',
          studioName: 'Studio',
          createdAt: '2024-01-01',
        },
      ];

      mockGroupsService.getGroups.mockResolvedValue(mockApiResponse);
      mockGroupsService.transformApiDataToGroups.mockReturnValue(mockGroups);

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('group-1-description')).toHaveTextContent('Description: Test Description');
      });
    });

    it('should display group studio name', async () => {
      const mockApiResponse = {
        Data: { Records: [{ id: 1 }] },
      };

      const mockGroups: Group[] = [
        {
          id: 1,
          name: 'Group',
          description: 'Desc',
          status: 'Active',
          studioName: 'Warner Bros',
          createdAt: '2024-01-01',
        },
      ];

      mockGroupsService.getGroups.mockResolvedValue(mockApiResponse);
      mockGroupsService.transformApiDataToGroups.mockReturnValue(mockGroups);

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('group-1-studio')).toHaveTextContent('Studio: Warner Bros');
      });
    });

    it('should display N/A when studio name is not provided', async () => {
      const mockApiResponse = {
        Data: { Records: [{ id: 1 }] },
      };

      const mockGroups: Group[] = [
        {
          id: 1,
          name: 'Group',
          description: 'Desc',
          status: 'Active',
          studioName: '',
          createdAt: '2024-01-01',
        },
      ];

      mockGroupsService.getGroups.mockResolvedValue(mockApiResponse);
      mockGroupsService.transformApiDataToGroups.mockReturnValue(mockGroups);

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('group-1-studio')).toHaveTextContent('Studio: N/A');
      });
    });

    it('should display group status', async () => {
      const mockApiResponse = {
        Data: { Records: [{ id: 1 }] },
      };

      const mockGroups: Group[] = [
        {
          id: 1,
          name: 'Group',
          description: 'Desc',
          status: 'Inactive',
          studioName: 'Studio',
          createdAt: '2024-01-01',
        },
      ];

      mockGroupsService.getGroups.mockResolvedValue(mockApiResponse);
      mockGroupsService.transformApiDataToGroups.mockReturnValue(mockGroups);

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('group-1-status')).toHaveTextContent('Status: Inactive');
      });
    });

    it('should display raw API response section', async () => {
      const mockApiResponse = {
        Data: { Records: [{ id: 1 }] },
      };

      mockGroupsService.getGroups.mockResolvedValue(mockApiResponse);
      mockGroupsService.transformApiDataToGroups.mockReturnValue([]);

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('api-response-section')).toBeInTheDocument();
      });
    });

    it('should display raw API response data', async () => {
      const mockApiResponse = {
        Data: { Records: [{ id: 1, name: 'Test' }] },
      };

      mockGroupsService.getGroups.mockResolvedValue(mockApiResponse);
      mockGroupsService.transformApiDataToGroups.mockReturnValue([]);

      render(<ApiTestPage />);

      await waitFor(() => {
        const responseData = screen.getByTestId('api-response-data');
        expect(responseData).toHaveTextContent('"Records"');
      });
    });

    it('should log API test start', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockGroupsService.getGroups.mockResolvedValue({
        Data: { Records: [] },
      });

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Starting API test...');
      });
    });

    it('should log API response', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const mockApiResponse = {
        Data: { Records: [{ id: 1 }] },
      };

      mockGroupsService.getGroups.mockResolvedValue(mockApiResponse);
      mockGroupsService.transformApiDataToGroups.mockReturnValue([]);

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('API Test Response:', mockApiResponse);
      });
    });

    it('should render multiple groups', async () => {
      const mockApiResponse = {
        Data: { Records: [{ id: 1 }, { id: 2 }, { id: 3 }] },
      };

      const mockGroups: Group[] = [
        {
          id: 1,
          name: 'Group 1',
          description: 'Desc 1',
          status: 'Active',
          studioName: 'Studio 1',
          createdAt: '2024-01-01',
        },
        {
          id: 2,
          name: 'Group 2',
          description: 'Desc 2',
          status: 'Active',
          studioName: 'Studio 2',
          createdAt: '2024-01-02',
        },
        {
          id: 3,
          name: 'Group 3',
          description: 'Desc 3',
          status: 'Inactive',
          studioName: 'Studio 3',
          createdAt: '2024-01-03',
        },
      ];

      mockGroupsService.getGroups.mockResolvedValue(mockApiResponse);
      mockGroupsService.transformApiDataToGroups.mockReturnValue(mockGroups);

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('group-1')).toBeInTheDocument();
        expect(screen.getByTestId('group-2')).toBeInTheDocument();
        expect(screen.getByTestId('group-3')).toBeInTheDocument();
      });
    });

    it('should clear error when API succeeds', async () => {
      const mockApiResponse = {
        Data: { Records: [{ id: 1 }] },
      };

      mockGroupsService.getGroups.mockResolvedValue(mockApiResponse);
      mockGroupsService.transformApiDataToGroups.mockReturnValue([]);

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('error-text')).not.toBeInTheDocument();
      });
    });
  });

  describe('API Errors', () => {
    it('should display error status when API fails', async () => {
      mockGroupsService.getGroups.mockRejectedValue(new Error('Network error'));

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('status-text')).toHaveTextContent('❌ API test failed');
      });
    });

    it('should display error message when API fails', async () => {
      mockGroupsService.getGroups.mockRejectedValue(new Error('Connection timeout'));

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('error-text')).toHaveTextContent('Error: Connection timeout');
      });
    });

    it('should log API error', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      const error = new Error('API Error');
      mockGroupsService.getGroups.mockRejectedValue(error);

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('API Test Error:', error);
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockGroupsService.getGroups.mockRejectedValue('String error');

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('error-text')).toHaveTextContent('Error: Unknown error');
      });
    });

    it('should not display groups section on error', async () => {
      mockGroupsService.getGroups.mockRejectedValue(new Error('Test error'));

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('status-text')).toHaveTextContent('❌ API test failed');
      });

      expect(screen.queryByTestId('groups-section')).not.toBeInTheDocument();
    });

    it('should not display API response section on error', async () => {
      mockGroupsService.getGroups.mockRejectedValue(new Error('Test error'));

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('status-text')).toHaveTextContent('❌ API test failed');
      });

      expect(screen.queryByTestId('api-response-section')).not.toBeInTheDocument();
    });
  });

  describe('Invalid Response Format', () => {
    it('should handle response without Data field', async () => {
      mockGroupsService.getGroups.mockResolvedValue({});

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('status-text')).toHaveTextContent('❌ API returned unexpected format');
      });
    });

    it('should handle response without Records field', async () => {
      mockGroupsService.getGroups.mockResolvedValue({
        Data: {},
      });

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('status-text')).toHaveTextContent('❌ API returned unexpected format');
      });
    });

    it('should display error for invalid structure', async () => {
      mockGroupsService.getGroups.mockResolvedValue({
        Data: null,
      });

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('error-text')).toHaveTextContent('Error: Invalid response structure');
      });
    });

    it('should not call transformApiDataToGroups for invalid response', async () => {
      mockGroupsService.getGroups.mockResolvedValue({});

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('status-text')).toHaveTextContent('❌ API returned unexpected format');
      });

      expect(mockGroupsService.transformApiDataToGroups).not.toHaveBeenCalled();
    });
  });

  describe('Component Props', () => {
    it('should accept isTesting prop', () => {
      mockGroupsService.getGroups.mockResolvedValue({
        Data: { Records: [] },
      });

      render(<ApiTestPage isTesting={true} />);
      expect(screen.getByTestId('api-test-page')).toBeInTheDocument();
    });

    it('should default isTesting to false', () => {
      mockGroupsService.getGroups.mockResolvedValue({
        Data: { Records: [] },
      });

      render(<ApiTestPage />);
      expect(screen.getByTestId('api-test-page')).toBeInTheDocument();
    });
  });

  describe('Status Updates', () => {
    it('should show testing status initially', () => {
      mockGroupsService.getGroups.mockResolvedValue({
        Data: { Records: [] },
      });

      render(<ApiTestPage />);
      expect(screen.getByTestId('status-text')).toHaveTextContent('🔄 Testing Groups API...');
    });

    it('should update to testing in progress', async () => {
      mockGroupsService.getGroups.mockImplementation(() => 
        new Promise((resolve) => setTimeout(() => resolve({ Data: { Records: [] } }), 100))
      );

      render(<ApiTestPage />);

      // Initial state shows testing in progress
      expect(screen.getByTestId('status-text')).toHaveTextContent('🔄 Testing Groups API...');
    });
  });

  describe('CSS Classes', () => {
    it('should have correct container classes', () => {
      mockGroupsService.getGroups.mockResolvedValue({
        Data: { Records: [] },
      });

      render(<ApiTestPage />);
      expect(screen.getByTestId('api-test-page')).toHaveClass('p-8');
    });

    it('should have correct title classes', () => {
      mockGroupsService.getGroups.mockResolvedValue({
        Data: { Records: [] },
      });

      render(<ApiTestPage />);
      expect(screen.getByTestId('page-title')).toHaveClass('text-2xl', 'font-bold', 'mb-4');
    });

    it('should display error with red text', async () => {
      mockGroupsService.getGroups.mockRejectedValue(new Error('Test error'));

      render(<ApiTestPage />);

      await waitFor(() => {
        const errorElement = screen.getByTestId('error-text');
        expect(errorElement).toHaveClass('text-red-600');
      });
    });

    it('should have correct environment info classes', () => {
      mockGroupsService.getGroups.mockResolvedValue({
        Data: { Records: [] },
      });

      render(<ApiTestPage />);
      expect(screen.getByTestId('environment-info')).toHaveClass('mt-6', 'p-4', 'bg-blue-50', 'rounded');
    });
  });

  describe('Environment Variables', () => {
    it('should display environment API base URL', () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://custom-api.example.com';
      mockGroupsService.getGroups.mockResolvedValue({
        Data: { Records: [] },
      });

      render(<ApiTestPage />);
      expect(screen.getByTestId('api-base-url')).toHaveTextContent('https://custom-api.example.com');
    });

    it('should handle missing API base URL', () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      mockGroupsService.getGroups.mockResolvedValue({
        Data: { Records: [] },
      });

      render(<ApiTestPage />);
      expect(screen.getByTestId('environment-info')).toBeInTheDocument();
    });
  });

  describe('Empty Groups', () => {
    it('should not display groups section when groups array is empty', async () => {
      mockGroupsService.getGroups.mockResolvedValue({
        Data: { Records: [] },
      });
      mockGroupsService.transformApiDataToGroups.mockReturnValue([]);

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('status-text')).toHaveTextContent('✅ API working!');
      });

      expect(screen.queryByTestId('groups-section')).not.toBeInTheDocument();
    });

    it('should still show API response section when groups are empty', async () => {
      mockGroupsService.getGroups.mockResolvedValue({
        Data: { Records: [] },
      });
      mockGroupsService.transformApiDataToGroups.mockReturnValue([]);

      render(<ApiTestPage />);

      await waitFor(() => {
        expect(screen.getByTestId('api-response-section')).toBeInTheDocument();
      });
    });
  });
});

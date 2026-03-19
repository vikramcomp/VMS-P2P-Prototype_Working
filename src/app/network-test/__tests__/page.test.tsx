import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import NetworkTestPage from '../page';

// Mock fetch globally
global.fetch = jest.fn();

describe('NetworkTestPage', () => {
  const mockSuccessResponse = {
    Data: {
      TotalRecords: 250,
      Records: [
        {
          CategoryId: 1,
          CategoryName: 'Group 1',
          CategoryDescription: 'Description 1',
          Status: 1,
          StudioName: 'Studio A',
        },
        {
          CategoryId: 2,
          CategoryName: 'Group 2',
          CategoryDescription: 'Description 2',
          Status: 1,
          StudioName: 'Studio B',
        },
        {
          CategoryId: 3,
          CategoryName: 'Group 3',
          CategoryDescription: 'Description 3',
          Status: 0,
          StudioName: null,
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockSuccessResponse,
      text: async () => JSON.stringify(mockSuccessResponse),
    });
  });

  describe('Component Rendering', () => {
    it('should render the page title', async () => {
      render(<NetworkTestPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Network API Test')).toBeInTheDocument();
      });
    });

    it('should render with data-testid', async () => {
      render(<NetworkTestPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('network-test-page')).toBeInTheDocument();
      });
    });

    it('should have correct page structure', async () => {
      const { container } = render(<NetworkTestPage />);
      
      await waitFor(() => {
        expect(container.querySelector('.p-8.max-w-6xl.mx-auto')).toBeInTheDocument();
      });
    });
  });

  describe('API Call on Mount', () => {
    it('should automatically call API on page load', async () => {
      render(<NetworkTestPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should make POST request to correct endpoint', async () => {
      render(<NetworkTestPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/groups/getgroups'),
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });

    it('should include correct headers in request', async () => {
      render(<NetworkTestPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: {
              'Content-Type': 'application/json',
            },
          })
        );
      });
    });

    it('should send correct request body', async () => {
      render(<NetworkTestPage />);

      await waitFor(() => {
        const callArgs = (global.fetch as jest.Mock).mock.calls[0];
        const requestBody = JSON.parse(callArgs[1].body);
        expect(requestBody).toEqual({
          SearchText: '',
          SearchColumn: '',
          PageSize: 10,
          PageNumber: 1,
          IgnorePaging: false,
          SortColumn: 'CategoryName',
          SortType: 'asc',
          Filter: {
            OldWorkflowOnly: true,
          },
        });
      });
    });
  });

  describe('Button Interaction', () => {
    it('should re-enable button after API call completes', async () => {
      render(<NetworkTestPage />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Success Response Handling', () => {
    it('should display success message on successful API call', async () => {
      render(<NetworkTestPage />);

      await waitFor(() => {
        expect(screen.getByText('✅ API Call Successful!')).toBeInTheDocument();
      });
    });

    it('should identify real API data when total records > 200', async () => {
      render(<NetworkTestPage />);

      await waitFor(() => {
        expect(screen.getByText(/REAL API DATA/)).toBeInTheDocument();
      });
    });

    it('should identify possible mock data when total records <= 200', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({
          Data: {
            TotalRecords: 50,
            Records: [],
          },
        }),
        text: async () => '{}',
      });

      render(<NetworkTestPage />);

      await waitFor(() => {
        expect(screen.getByText(/Possible Mock Data/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on API failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<NetworkTestPage />);

      await waitFor(() => {
        expect(screen.getByText('❌ API Call Failed')).toBeInTheDocument();
      });
    });



  });

  describe('Raw Response Display', () => {
    it('should display raw response data section', async () => {
      render(<NetworkTestPage />);

      await waitFor(() => {
        expect(screen.getByText('Raw Response Data:')).toBeInTheDocument();
      });
    });
  });

  describe('Sample Records Display', () => {
    it('should display sample records section on success', async () => {
      render(<NetworkTestPage />);

      await waitFor(() => {
        expect(screen.getByText('Sample Records (First 3):')).toBeInTheDocument();
      });
    });



    it('should not display sample records on error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Error'));

      render(<NetworkTestPage />);

      await waitFor(() => {
        expect(screen.queryByText('Sample Records (First 3):')).not.toBeInTheDocument();
      });
    });
  });

  describe('Console Logging', () => {
    it('should log API call URL', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(<NetworkTestPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Making API call to:'),
          expect.any(String)
        );
      });

      consoleSpy.mockRestore();
    });

    it('should log request body', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(<NetworkTestPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Request body:'),
          expect.any(Object)
        );
      });

      consoleSpy.mockRestore();
    });

    it('should log response status', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(<NetworkTestPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Response status:'),
          200
        );
      });

      consoleSpy.mockRestore();
    });

    it('should log response data', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(<NetworkTestPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Response data:'),
          expect.any(Object)
        );
      });

      consoleSpy.mockRestore();
    });

    it('should log errors to console', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Test error'));

      render(<NetworkTestPage />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Error:'),
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('State Management', () => {
    it('should update to testing status during API call', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<NetworkTestPage />);

      await waitFor(() => {
        expect(screen.getByText('Testing...')).toBeInTheDocument();
      });
    });

    it('should update to success status after successful call', async () => {
      render(<NetworkTestPage />);

      await waitFor(() => {
        expect(screen.getByText('✅ API Call Successful!')).toBeInTheDocument();
      });
    });

    it('should update to error status after failed call', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Error'));

      render(<NetworkTestPage />);

      await waitFor(() => {
        expect(screen.getByText('❌ API Call Failed')).toBeInTheDocument();
      });
    });

    it('should preserve networkInfo between re-renders', async () => {
      const { rerender } = render(<NetworkTestPage />);

      await waitFor(() => {
        expect(screen.getByText('✅ API Call Successful!')).toBeInTheDocument();
      });

      rerender(<NetworkTestPage />);

      expect(screen.getByText('✅ API Call Successful!')).toBeInTheDocument();
    });
  });

  describe('Response Data Handling', () => {
    it('should handle response with empty records', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({
          Data: {
            TotalRecords: 0,
            Records: [],
          },
        }),
        text: async () => '{}',
      });

      render(<NetworkTestPage />);

      await waitFor(() => {
        expect(screen.getByText('✅ API Call Successful!')).toBeInTheDocument();
      });
    });
  });

  describe('Styling and Classes', () => {
    it('should apply success styling to success message', async () => {
      render(<NetworkTestPage />);

      await waitFor(() => {
        const successDiv = screen.getByText('✅ API Call Successful!').closest('div');
        expect(successDiv).toHaveClass('bg-green-100', 'border-green-400', 'text-green-700');
      });
    });

    it('should apply error styling to error message', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Error'));

      render(<NetworkTestPage />);

      await waitFor(() => {
        const errorDiv = screen.getByText('❌ API Call Failed').closest('div');
        expect(errorDiv).toHaveClass('bg-red-100', 'border-red-400', 'text-red-700');
      });
    });
  });
});

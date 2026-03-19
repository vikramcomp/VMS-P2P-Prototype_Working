import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AuthTestPage from '../page';

// Mock fetch globally
global.fetch = jest.fn();

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} data-testid="test-button">
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, type, placeholder }: any) => (
    <input
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      data-testid={`input-${type}`}
    />
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
}));

describe('AuthTestPage', () => {
  const mockSuccessResponse = {
    token: 'mock-token-123',
    user: {
      id: 1,
      email: 'admin@vms.com',
      name: 'Admin User',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify(mockSuccessResponse),
    });
  });

  describe('Component Rendering', () => {
    it('should render the page title', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('VMS Auth API Test')).toBeInTheDocument();
    });

    it('should render with data-testid', () => {
      render(<AuthTestPage />);
      expect(screen.getByTestId('auth-test-page')).toBeInTheDocument();
    });

    it('should render test login card', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('Test Login API')).toBeInTheDocument();
    });

    it('should render API response card', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('API Response')).toBeInTheDocument();
    });

    it('should render both cards', () => {
      render(<AuthTestPage />);
      const cards = screen.getAllByTestId('card');
      expect(cards).toHaveLength(2);
    });
  });

  describe('Form Inputs', () => {
    it('should render email input with default value', () => {
      render(<AuthTestPage />);
      const emailInput = screen.getByTestId('input-email') as HTMLInputElement;
      expect(emailInput).toBeInTheDocument();
      expect(emailInput.value).toBe('admin@vms.com');
    });

    it('should render password input with default value', () => {
      render(<AuthTestPage />);
      const passwordInput = screen.getByTestId('input-password') as HTMLInputElement;
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput.value).toBe('admin123');
    });

    it('should update email value on change', () => {
      render(<AuthTestPage />);
      const emailInput = screen.getByTestId('input-email') as HTMLInputElement;
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      expect(emailInput.value).toBe('test@example.com');
    });

    it('should update password value on change', () => {
      render(<AuthTestPage />);
      const passwordInput = screen.getByTestId('input-password') as HTMLInputElement;
      
      fireEvent.change(passwordInput, { target: { value: 'newpassword' } });
      
      expect(passwordInput.value).toBe('newpassword');
    });

    it('should render email label', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('Email:')).toBeInTheDocument();
    });

    it('should render password label', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('Password:')).toBeInTheDocument();
    });
  });

  describe('Test Button', () => {
    it('should render test button with correct text', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('Test API')).toBeInTheDocument();
    });

    it('should be enabled when email and password are provided', () => {
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      expect(button).not.toBeDisabled();
    });

    it('should be disabled when email is empty', () => {
      render(<AuthTestPage />);
      const emailInput = screen.getByTestId('input-email') as HTMLInputElement;
      
      fireEvent.change(emailInput, { target: { value: '' } });
      
      const button = screen.getByTestId('test-button');
      expect(button).toBeDisabled();
    });

    it('should be disabled when password is empty', () => {
      render(<AuthTestPage />);
      const passwordInput = screen.getByTestId('input-password') as HTMLInputElement;
      
      fireEvent.change(passwordInput, { target: { value: '' } });
      
      const button = screen.getByTestId('test-button');
      expect(button).toBeDisabled();
    });

    it('should trigger login on click', async () => {
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('API Call', () => {
    it('should call fetch with correct URL', async () => {
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/login'),
          expect.any(Object)
        );
      });
    });

    it('should send POST request', async () => {
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });

    it('should include correct headers', async () => {
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      
      fireEvent.click(button);
      
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
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        const callArgs = (global.fetch as jest.Mock).mock.calls[0];
        const requestBody = JSON.parse(callArgs[1].body);
        expect(requestBody).toEqual({
          UserName: 'admin@vms.com',
          Password: 'admin123',
        });
      });
    });

    it('should send updated credentials when inputs change', async () => {
      render(<AuthTestPage />);
      
      const emailInput = screen.getByTestId('input-email') as HTMLInputElement;
      const passwordInput = screen.getByTestId('input-password') as HTMLInputElement;
      
      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'pass456' } });
      
      const button = screen.getByTestId('test-button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const callArgs = (global.fetch as jest.Mock).mock.calls[0];
        const requestBody = JSON.parse(callArgs[1].body);
        expect(requestBody.UserName).toBe('user@test.com');
        expect(requestBody.Password).toBe('pass456');
      });
    });
  });

  describe('Success Response', () => {
    it('should display success response', async () => {
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/"status": 200/)).toBeInTheDocument();
      });
    });

    it('should display ok status', async () => {
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/"ok": true/)).toBeInTheDocument();
      });
    });

    it('should parse and display JSON response', async () => {
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/mock-token-123/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/Error: Network error/)).toBeInTheDocument();
      });
    });

    it('should handle JSON parse errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: async () => 'Invalid JSON',
      });
      
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to parse JSON/)).toBeInTheDocument();
      });
    });

    it('should display raw response when JSON parsing fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: async () => 'Invalid JSON Response',
      });
      
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/Invalid JSON Response/)).toBeInTheDocument();
      });
    });

    it('should handle unknown errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue('Unknown error');
      
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/Error: Unknown error/)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should re-enable button after API call', async () => {
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Console Logging', () => {
    it('should log API test start', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Testing login API with:'),
          expect.any(Object)
        );
      });
      
      consoleSpy.mockRestore();
    });

    it('should log response status', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Response status:'),
          200
        );
      });
      
      consoleSpy.mockRestore();
    });

    it('should log response headers', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Response headers:'),
          expect.any(Object)
        );
      });
      
      consoleSpy.mockRestore();
    });

    it('should log raw response', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Raw response:'),
          expect.any(String)
        );
      });
      
      consoleSpy.mockRestore();
    });

    it('should log errors to console', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Test error'));
      
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('API test error:'),
          expect.any(Error)
        );
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should hide password in logs', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        const logCalls = consoleSpy.mock.calls.filter(call =>
          call[0].includes('Testing login API with:')
        );
        expect(logCalls[0][1].password).toBe('[HIDDEN]');
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('API Endpoint Display', () => {
    it('should display API endpoint label', () => {
      render(<AuthTestPage />);
      expect(screen.getByText('API Endpoint:')).toBeInTheDocument();
    });

    it('should display POST method', () => {
      render(<AuthTestPage />);
      expect(screen.getByText(/POST/)).toBeInTheDocument();
    });

    it('should display auth login endpoint', () => {
      render(<AuthTestPage />);
      expect(screen.getByText(/\/auth\/login/)).toBeInTheDocument();
    });
  });

  describe('Result Display', () => {
    it('should show placeholder message initially', () => {
      render(<AuthTestPage />);
      expect(screen.getByText("Click 'Test API' to see results")).toBeInTheDocument();
    });

    it('should display results in pre tag', async () => {
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        const preElement = screen.getByText(/"status": 200/).closest('pre');
        expect(preElement).toBeInTheDocument();
      });
    });
  });

  describe('HTTP Status Codes', () => {
    it('should handle 401 unauthorized', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers(),
        text: async () => JSON.stringify({ error: 'Unauthorized' }),
      });
      
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/"status": 401/)).toBeInTheDocument();
      });
    });

    it('should handle 500 server error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers(),
        text: async () => JSON.stringify({ error: 'Server error' }),
      });
      
      render(<AuthTestPage />);
      const button = screen.getByTestId('test-button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/"status": 500/)).toBeInTheDocument();
      });
    });
  });

  describe('Styling', () => {
    it('should have correct page background', () => {
      const { container } = render(<AuthTestPage />);
      const mainDiv = container.querySelector('.min-h-screen.bg-gray-50.p-8');
      expect(mainDiv).toBeInTheDocument();
    });

    it('should have centered container', () => {
      const { container } = render(<AuthTestPage />);
      const centerDiv = container.querySelector('.max-w-4xl.mx-auto');
      expect(centerDiv).toBeInTheDocument();
    });
  });
});

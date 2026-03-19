import React from 'react';
import { render, waitFor } from '@testing-library/react';
import AuthTestPage from '../page';

// Mock fetch globally
global.fetch = jest.fn();

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children }: any) => <button>{children}</button>,
}));

jest.mock('@/components/ui/input', () => ({
  Input: () => <input />,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <div>{children}</div>,
}));

describe('AuthTestPage - isTesting prop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify({ token: 'test-token' }),
    });
  });

  it('should call testLogin function when isTesting is true', async () => {
    render(<AuthTestPage isTesting={true} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});

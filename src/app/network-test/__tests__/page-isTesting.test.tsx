import React from 'react';
import { render, waitFor } from '@testing-library/react';
import NetworkTestPage from '../page';

// Mock fetch globally
global.fetch = jest.fn();

describe('NetworkTestPage - isTesting prop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({
        Data: {
          TotalRecords: 100,
          Records: [],
        },
      }),
      text: async () => '{}',
    });
  });

  it('should call testApiDirect function when isTesting is true', async () => {
    render(<NetworkTestPage isTesting={true} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});

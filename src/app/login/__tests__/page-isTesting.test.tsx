import React from 'react';
import { render, screen } from '@testing-library/react';
import Login from '../page';

// Mock LoginPage component
jest.mock('@/components/auth/login-page', () => ({
  __esModule: true,
  default: () => <div data-testid="login-page-component">Login Page Component</div>,
}));

describe('Login - isTesting prop', () => {
  it('should handle isTesting prop set to true', () => {
    render(<Login isTesting={true} />);
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('should handle isTesting prop set to false', () => {
    render(<Login isTesting={false} />);
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('should handle missing isTesting prop', () => {
    render(<Login />);
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });
});

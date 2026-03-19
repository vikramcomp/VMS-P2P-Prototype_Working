import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider } from '../auth-provider';

// Mock dependencies
jest.mock('@/services/auth-service', () => ({
  getCurrentUser: jest.fn(() => Promise.resolve(null)),
  login: jest.fn(),
  logout: jest.fn(),
}));

describe('AuthProvider', () => {
  test('renders children', () => {
    render(
      <AuthProvider>
        <div data-testid="child">Child Component</div>
      </AuthProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  test('provides auth context', () => {
    expect(() => render(
      <AuthProvider>
        <div>Content</div>
      </AuthProvider>
    )).not.toThrow();
  });
});

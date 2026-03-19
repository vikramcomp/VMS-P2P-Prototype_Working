import React from 'react';
import { render, screen } from '@testing-library/react';
import AddNewRequestPage from '../page';

// Mock MainLayout
jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  ),
}));

// Mock ProtectedRoute
jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

// Mock RequestForm
jest.mock('@/components/requests/request-form', () => ({
  __esModule: true,
  default: ({ mode }: { mode: string }) => (
    <div data-testid="request-form" data-mode={mode}>Request Form - {mode} mode</div>
  ),
}));

describe('AddNewRequestPage - isTesting prop', () => {
  it('should handle isTesting prop set to true', () => {
    render(<AddNewRequestPage isTesting={true} />);
    expect(screen.getByTestId('add-new-request-page')).toBeInTheDocument();
  });

  it('should handle isTesting prop set to false', () => {
    render(<AddNewRequestPage isTesting={false} />);
    expect(screen.getByTestId('add-new-request-page')).toBeInTheDocument();
  });

  it('should handle missing isTesting prop', () => {
    render(<AddNewRequestPage />);
    expect(screen.getByTestId('add-new-request-page')).toBeInTheDocument();
  });
});

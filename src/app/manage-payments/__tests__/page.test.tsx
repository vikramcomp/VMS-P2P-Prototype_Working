/**
 * Tests for Manage Payments Page
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ManagePaymentsPage from '../page';

// Mock dependencies
jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div data-testid="protected-route">{children}</div>,
}));

jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="main-layout">{children}</div>,
}));

jest.mock('@/components/payments/manage-payments-content', () => {
  return function ManagePaymentsContent() {
    return <div data-testid="manage-payments-content">Manage Payments Content</div>;
  };
});

describe('ManagePaymentsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the page', () => {
    render(<ManagePaymentsPage />);
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
  });

  it('should wrap content in ProtectedRoute', () => {
    render(<ManagePaymentsPage />);
    const protectedRoute = screen.getByTestId('protected-route');
    expect(protectedRoute).toBeInTheDocument();
  });

  it('should wrap content in MainLayout', () => {
    render(<ManagePaymentsPage />);
    const mainLayout = screen.getByTestId('main-layout');
    expect(mainLayout).toBeInTheDocument();
  });

  it('should render ManagePaymentsContent component', () => {
    render(<ManagePaymentsPage />);
    const content = screen.getByTestId('manage-payments-content');
    expect(content).toBeInTheDocument();
  });

  it('should have correct component hierarchy', () => {
    const { container } = render(<ManagePaymentsPage />);
    const protectedRoute = container.querySelector('[data-testid="protected-route"]');
    const mainLayout = protectedRoute?.querySelector('[data-testid="main-layout"]');
    const content = mainLayout?.querySelector('[data-testid="manage-payments-content"]');
    
    expect(protectedRoute).toBeInTheDocument();
    expect(mainLayout).toBeInTheDocument();
    expect(content).toBeInTheDocument();
  });
});

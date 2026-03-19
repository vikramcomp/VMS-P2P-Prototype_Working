import React from 'react';
import { render, screen } from '@testing-library/react';
import InvoicesPage from '../page';

// Mock next/dynamic
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (loader: any, options: any) => {
    const DynamicComponent = () => {
      if (options?.loading) {
        return options.loading();
      }
      return <div>Mocked Dynamic Component</div>;
    };
    DynamicComponent.displayName = 'DynamicComponent';
    return DynamicComponent;
  },
}));

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

describe('InvoicesPage - isTesting prop', () => {
  it('should handle isTesting prop set to true', () => {
    render(<InvoicesPage isTesting={true} />);
    expect(screen.getByTestId('invoices-page')).toBeInTheDocument();
  });

  it('should handle isTesting prop set to false', () => {
    render(<InvoicesPage isTesting={false} />);
    expect(screen.getByTestId('invoices-page')).toBeInTheDocument();
  });

  it('should handle missing isTesting prop', () => {
    render(<InvoicesPage />);
    expect(screen.getByTestId('invoices-page')).toBeInTheDocument();
  });
});

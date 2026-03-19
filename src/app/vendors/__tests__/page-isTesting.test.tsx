import React from 'react';
import { render, screen } from '@testing-library/react';
import VendorsPage from '../page';

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

describe('VendorsPage - isTesting prop', () => {
  it('should handle isTesting prop set to true', () => {
    render(<VendorsPage isTesting={true} />);
    expect(screen.getByTestId('vendors-page')).toBeInTheDocument();
  });

  it('should handle isTesting prop set to false', () => {
    render(<VendorsPage isTesting={false} />);
    expect(screen.getByTestId('vendors-page')).toBeInTheDocument();
  });

  it('should handle missing isTesting prop', () => {
    render(<VendorsPage />);
    expect(screen.getByTestId('vendors-page')).toBeInTheDocument();
  });
});

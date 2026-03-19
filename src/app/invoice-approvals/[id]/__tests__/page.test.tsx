import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import InvoiceApprovalPage from '../page';

// Mock the components
jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: any) => <div data-testid="main-layout">{children}</div>,
}));

jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: any) => <div data-testid="protected-route">{children}</div>,
}));

jest.mock('@/components/approvals/view-edit-invoice-approval', () => {
  return function ViewEditInvoiceApproval({ mode }: { mode: string }) {
    return <div data-testid="view-edit-invoice-approval" data-mode={mode}>View Edit Invoice Approval - Mode: {mode}</div>;
  };
});

describe('InvoiceApprovalPage (View Mode)', () => {
  it('renders without crashing', () => {
    render(<InvoiceApprovalPage />);
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
  });

  it('renders within ProtectedRoute', () => {
    render(<InvoiceApprovalPage />);
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
  });

  it('renders MainLayout', () => {
    render(<InvoiceApprovalPage />);
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
  });

  it('renders ViewEditInvoiceApproval component', () => {
    render(<InvoiceApprovalPage />);
    expect(screen.getByTestId('view-edit-invoice-approval')).toBeInTheDocument();
  });

  it('passes view mode to ViewEditInvoiceApproval component', () => {
    render(<InvoiceApprovalPage />);
    const component = screen.getByTestId('view-edit-invoice-approval');
    expect(component).toHaveAttribute('data-mode', 'view');
  });

  it('displays correct mode text', () => {
    render(<InvoiceApprovalPage />);
    expect(screen.getByText(/Mode: view/i)).toBeInTheDocument();
  });

  it('has correct component hierarchy', () => {
    const { container } = render(<InvoiceApprovalPage />);
    const protectedRoute = screen.getByTestId('protected-route');
    const mainLayout = screen.getByTestId('main-layout');
    const content = screen.getByTestId('view-edit-invoice-approval');

    expect(protectedRoute).toContainElement(mainLayout);
    expect(mainLayout).toContainElement(content);
  });
});

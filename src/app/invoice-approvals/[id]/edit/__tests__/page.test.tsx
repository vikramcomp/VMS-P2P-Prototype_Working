import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditInvoiceApprovalPage from '../page';

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

describe('EditInvoiceApprovalPage (Edit Mode)', () => {
  it('renders without crashing', () => {
    render(<EditInvoiceApprovalPage />);
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
  });

  it('renders within ProtectedRoute', () => {
    render(<EditInvoiceApprovalPage />);
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
  });

  it('renders MainLayout', () => {
    render(<EditInvoiceApprovalPage />);
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
  });

  it('renders ViewEditInvoiceApproval component', () => {
    render(<EditInvoiceApprovalPage />);
    expect(screen.getByTestId('view-edit-invoice-approval')).toBeInTheDocument();
  });

  it('passes edit mode to ViewEditInvoiceApproval component', () => {
    render(<EditInvoiceApprovalPage />);
    const component = screen.getByTestId('view-edit-invoice-approval');
    expect(component).toHaveAttribute('data-mode', 'edit');
  });

  it('displays correct mode text', () => {
    render(<EditInvoiceApprovalPage />);
    expect(screen.getByText(/Mode: edit/i)).toBeInTheDocument();
  });

  it('has correct component hierarchy', () => {
    const { container } = render(<EditInvoiceApprovalPage />);
    const protectedRoute = screen.getByTestId('protected-route');
    const mainLayout = screen.getByTestId('main-layout');
    const content = screen.getByTestId('view-edit-invoice-approval');

    expect(protectedRoute).toContainElement(mainLayout);
    expect(mainLayout).toContainElement(content);
  });
});

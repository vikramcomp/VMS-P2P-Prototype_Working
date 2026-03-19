import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import InvoiceApprovalsPage from '../page';

// Mock the components
jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: any) => <div data-testid="main-layout">{children}</div>,
}));

jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: any) => <div data-testid="protected-route">{children}</div>,
}));

jest.mock('@/components/approvals/invoice-approvals-content', () => {
  return function InvoiceApprovalsContent() {
    return <div data-testid="invoice-approvals-content">Invoice Approvals Content</div>;
  };
});

describe('InvoiceApprovalsPage', () => {
  it('renders without crashing', () => {
    render(<InvoiceApprovalsPage />);
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
  });

  it('renders within ProtectedRoute', () => {
    render(<InvoiceApprovalsPage />);
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
  });

  it('renders MainLayout', () => {
    render(<InvoiceApprovalsPage />);
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
  });

  it('renders InvoiceApprovalsContent component', () => {
    render(<InvoiceApprovalsPage />);
    expect(screen.getByTestId('invoice-approvals-content')).toBeInTheDocument();
  });

  it('has correct component hierarchy', () => {
    const { container } = render(<InvoiceApprovalsPage />);
    const protectedRoute = screen.getByTestId('protected-route');
    const mainLayout = screen.getByTestId('main-layout');
    const content = screen.getByTestId('invoice-approvals-content');

    expect(protectedRoute).toContainElement(mainLayout);
    expect(mainLayout).toContainElement(content);
  });

  it('displays invoice approvals content text', () => {
    render(<InvoiceApprovalsPage />);
    expect(screen.getByText('Invoice Approvals Content')).toBeInTheDocument();
  });
});

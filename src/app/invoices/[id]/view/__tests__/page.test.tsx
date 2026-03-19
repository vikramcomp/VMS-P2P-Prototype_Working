import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ViewInvoicePage from '../page';

// Mock InvoicePage
jest.mock('../../page', () => {
  return function InvoicePage() {
    return <div data-testid="invoice-page">Invoice Page</div>;
  };
});

describe('ViewInvoicePage', () => {
  it('renders without crashing', () => {
    render(<ViewInvoicePage />);
    expect(screen.getByTestId('invoice-page')).toBeInTheDocument();
  });

  it('renders InvoicePage component', () => {
    render(<ViewInvoicePage />);
    expect(screen.getByTestId('invoice-page')).toBeInTheDocument();
  });

  it('displays invoice page content', () => {
    render(<ViewInvoicePage />);
    expect(screen.getByText('Invoice Page')).toBeInTheDocument();
  });

  it('re-exports InvoicePage correctly', () => {
    const { container } = render(<ViewInvoicePage />);
    expect(container.firstChild).toHaveAttribute('data-testid', 'invoice-page');
  });
});

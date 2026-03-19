import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditInvoicePage from '../page';

// Mock InvoicePage
jest.mock('../../page', () => {
  return function InvoicePage() {
    return <div data-testid="invoice-page">Invoice Page</div>;
  };
});

describe('EditInvoicePage', () => {
  it('renders without crashing', () => {
    render(<EditInvoicePage />);
    expect(screen.getByTestId('invoice-page')).toBeInTheDocument();
  });

  it('renders InvoicePage component', () => {
    render(<EditInvoicePage />);
    expect(screen.getByTestId('invoice-page')).toBeInTheDocument();
  });

  it('displays invoice page content', () => {
    render(<EditInvoicePage />);
    expect(screen.getByText('Invoice Page')).toBeInTheDocument();
  });

  it('re-exports InvoicePage correctly', () => {
    const { container } = render(<EditInvoicePage />);
    expect(container.firstChild).toHaveAttribute('data-testid', 'invoice-page');
  });
});

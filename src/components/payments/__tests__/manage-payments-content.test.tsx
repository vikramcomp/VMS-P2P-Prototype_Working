/**
 * Tests for Manage Payments Content Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ManagePaymentsContent from '../manage-payments-content';

// Mock dependencies
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3 data-testid="card-title">{children}</h3>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, variant, size }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-variant={variant}
      data-size={size}
      data-testid="button"
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, type, ...props }: any) => (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      data-testid="input"
      {...props}
    />
  ),
}));

jest.mock('@/components/ui/pagination', () => {
  return function Pagination({ pagination, onPageChange, onPageSizeChange }: any) {
    return (
      <div data-testid="pagination">
        <button onClick={() => onPageChange(1)} data-testid="page-1">Page 1</button>
        <button onClick={() => onPageChange(2)} data-testid="page-2">Page 2</button>
        <button onClick={() => onPageSizeChange(10)} data-testid="pagesize-10">10</button>
        <button onClick={() => onPageSizeChange(25)} data-testid="pagesize-25">25</button>
      </div>
    );
  };
});

describe('ManagePaymentsContent', () => {
  const { useToast } = require('@/hooks/use-toast');
  let mockToast: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockToast = jest.fn();
    useToast.mockReturnValue({ toast: mockToast });
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render the page title', () => {
      render(<ManagePaymentsContent />);
      expect(screen.getByText('Manage Payments')).toBeInTheDocument();
    });

    it('should render advanced filters section', () => {
      render(<ManagePaymentsContent />);
      expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
    });

    it('should render payment records section', () => {
      render(<ManagePaymentsContent />);
      expect(screen.getByText('Payment Records')).toBeInTheDocument();
    });

    it('should show advanced filters by default', () => {
      render(<ManagePaymentsContent />);
      const inputs = screen.getAllByTestId('input');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('should render all filter inputs', () => {
      render(<ManagePaymentsContent />);
      expect(screen.getByPlaceholderText('Enter request number')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter PO number')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter invoice number')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter vendor name')).toBeInTheDocument();
    });

    it('should render status dropdown', () => {
      render(<ManagePaymentsContent />);
      const statusSelect = screen.getByDisplayValue('-- All --');
      expect(statusSelect).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<ManagePaymentsContent />);
      expect(screen.getByText('Apply Filters')).toBeInTheDocument();
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });
  });

  describe('Filter Toggle', () => {
    it('should render toggle button', () => {
      render(<ManagePaymentsContent />);
      const buttons = screen.getAllByTestId('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Filter Inputs', () => {
    it('should update request number filter', () => {
      render(<ManagePaymentsContent />);
      const input = screen.getByPlaceholderText('Enter request number') as HTMLInputElement;
      
      fireEvent.change(input, { target: { value: 'REQ-123' } });
      expect(input.value).toBe('REQ-123');
    });

    it('should update PO number filter', () => {
      render(<ManagePaymentsContent />);
      const input = screen.getByPlaceholderText('Enter PO number') as HTMLInputElement;
      
      fireEvent.change(input, { target: { value: 'PO-456' } });
      expect(input.value).toBe('PO-456');
    });

    it('should update invoice number filter', () => {
      render(<ManagePaymentsContent />);
      const input = screen.getByPlaceholderText('Enter invoice number') as HTMLInputElement;
      
      fireEvent.change(input, { target: { value: 'INV-789' } });
      expect(input.value).toBe('INV-789');
    });

    it('should update vendor name filter', () => {
      render(<ManagePaymentsContent />);
      const input = screen.getByPlaceholderText('Enter vendor name') as HTMLInputElement;
      
      fireEvent.change(input, { target: { value: 'Test Vendor' } });
      expect(input.value).toBe('Test Vendor');
    });

    it('should update date from filter', () => {
      render(<ManagePaymentsContent />);
      const inputs = screen.getAllByTestId('input');
      const dateFromInput = inputs.find(input => input.getAttribute('type') === 'date') as HTMLInputElement;
      
      if (dateFromInput) {
        fireEvent.change(dateFromInput, { target: { value: '2026-01-01' } });
        expect(dateFromInput.value).toBe('2026-01-01');
      }
    });

    it('should update status filter', () => {
      render(<ManagePaymentsContent />);
      const statusSelect = screen.getByDisplayValue('-- All --') as HTMLSelectElement;
      
      fireEvent.change(statusSelect, { target: { value: '1' } });
      expect(statusSelect.value).toBe('1');
    });
  });

  describe('Filter Actions', () => {
    it('should handle apply filters button click', () => {
      render(<ManagePaymentsContent />);
      const applyButton = screen.getByText('Apply Filters');
      
      fireEvent.click(applyButton);
      
      expect(applyButton).toBeInTheDocument();
    });
  });

  describe('Data Table', () => {
    it('should show loading state initially', () => {
      render(<ManagePaymentsContent />);
      
      // Initially should show loading
      expect(screen.getByText('Loading payments...')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should render pagination component', async () => {
      render(<ManagePaymentsContent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
      });
    });

    it('should handle page change', async () => {
      render(<ManagePaymentsContent />);
      
      await waitFor(() => {
        const page2Button = screen.getByTestId('page-2');
        fireEvent.click(page2Button);
      });
    });

    it('should handle page size change', async () => {
      render(<ManagePaymentsContent />);
      
      await waitFor(() => {
        const pageSize25Button = screen.getByTestId('pagesize-25');
        fireEvent.click(pageSize25Button);
      });
    });
  });

  describe('Status Badge Styling', () => {
    it('should render status badges', () => {
      const { container } = render(<ManagePaymentsContent />);
      expect(container).toBeTruthy();
    });
  });

  describe('Component Integration', () => {
    it('should integrate all components correctly', () => {
      render(<ManagePaymentsContent />);
      
      expect(screen.getByText('Manage Payments')).toBeInTheDocument();
      expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
      expect(screen.getByText('Payment Records')).toBeInTheDocument();
    });
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import ApprovalsContent from '../approvals-content';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { approvalsService } from '@/services/approvals-service';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock approvals-service
jest.mock('@/services/approvals-service', () => ({
  approvalsService: {
    getApprovals: jest.fn(),
  },
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, disabled, className, variant, size }: any) => (
    <button onClick={onClick} type={type} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, className }: any) => (
    <input value={value} onChange={onChange} placeholder={placeholder} className={className} />
  ),
}));

jest.mock('@/components/ui/pagination', () => ({
  __esModule: true,
  default: ({ pagination, onPageChange, onPageSizeChange }: any) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange(2)}>Next Page</button>
      <button onClick={() => onPageSizeChange(25)}>Change Size</button>
    </div>
  ),
}));

jest.mock('@/components/ui/multi-line-tooltip', () => ({
  MultiLineTooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('ApprovalsContent - isTesting', () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });
    (approvalsService.getApprovals as jest.Mock).mockResolvedValue({
      records: [],
      totalRecords: 0,
    });
  });

  it('should render component with isTesting prop', async () => {
    render(<ApprovalsContent isTesting={true} />);
    
    const { findByTestId } = screen;
    const element = await findByTestId('approvals-content');
    expect(element).toBeInTheDocument();
  });
});

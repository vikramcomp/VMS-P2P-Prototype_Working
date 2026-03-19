import React from 'react';
import { render, screen } from '@testing-library/react';
import ApprovalsPage from '../page';

// Mock Next.js dynamic
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (importFn: any, options: any) => {
    const DynamicComponent = () => <div data-testid="approvals-content">ApprovalsContent</div>;
    DynamicComponent.displayName = 'DynamicApprovalsContent';
    return DynamicComponent;
  },
}));

// Mock MainLayout
jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: any) => <div data-testid="main-layout">{children}</div>,
}));

// Mock ProtectedRoute
jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: any) => <div data-testid="protected-route">{children}</div>,
}));

describe('ApprovalsPage - isTesting prop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when isTesting is true', () => {
    render(<ApprovalsPage isTesting={true} />);
    
    expect(screen.getByTestId('approvals-page')).toBeInTheDocument();
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
  });

  it('should render when isTesting is false', () => {
    render(<ApprovalsPage isTesting={false} />);
    
    expect(screen.getByTestId('approvals-page')).toBeInTheDocument();
  });

  it('should render without isTesting prop', () => {
    render(<ApprovalsPage />);
    
    expect(screen.getByTestId('approvals-page')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import GroupsPage from '../page';

// Mock Next.js dynamic
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (importFn: any, options: any) => {
    const DynamicComponent = () => <div data-testid="groups-content">GroupsContent</div>;
    DynamicComponent.displayName = 'DynamicGroupsContent';
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

describe('GroupsPage - isTesting prop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when isTesting is true', () => {
    render(<GroupsPage isTesting={true} />);
    
    expect(screen.getByTestId('groups-page')).toBeInTheDocument();
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
  });

  it('should render when isTesting is false', () => {
    render(<GroupsPage isTesting={false} />);
    
    expect(screen.getByTestId('groups-page')).toBeInTheDocument();
  });

  it('should render without isTesting prop', () => {
    render(<GroupsPage />);
    
    expect(screen.getByTestId('groups-page')).toBeInTheDocument();
  });
});

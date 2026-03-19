import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Dashboard from '../page';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: any) => <div data-testid="main-layout">{children}</div>,
}));

jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

jest.mock('@/components/common/welcome-popup', () => ({
  WelcomePopup: () => <div data-testid="welcome-popup">Welcome</div>,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardDescription: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('lucide-react', () => ({
  Users: () => <div>Users</div>,
  FileText: () => <div>FileText</div>,
  BarChart3: () => <div>BarChart3</div>,
  UserCheck: () => <div>UserCheck</div>,
  DollarSign: () => <div>DollarSign</div>,
  Clock: () => <div>Clock</div>,
  AlertCircle: () => <div>AlertCircle</div>,
  Building2: () => <div>Building2</div>,
  ClipboardList: () => <div>ClipboardList</div>,
  FileCheck: () => <div>FileCheck</div>,
  TrendingUp: () => <div>TrendingUp</div>,
}));

describe('Dashboard - isTesting prop', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('should call navigation and popup functions when isTesting is true', async () => {
    sessionStorage.setItem('justLoggedIn', 'true');
    
    // We need to render the DashboardContent component directly with isTesting prop
    // Since Dashboard wraps DashboardContent, we'll import and test the internal component
    const { DashboardContent } = require('../page');
    
    render(<DashboardContent isTesting={true} />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/users');
    });
  });
});

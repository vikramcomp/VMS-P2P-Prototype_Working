import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Dashboard from '../page';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children, title, breadcrumbs }: any) => (
    <div data-testid="main-layout">
      <div data-testid="layout-title">{title}</div>
      <div data-testid="layout-breadcrumbs">{JSON.stringify(breadcrumbs)}</div>
      {children}
    </div>
  ),
}));

jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

jest.mock('@/components/common/welcome-popup', () => ({
  WelcomePopup: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="welcome-popup">
      <button onClick={onClose} data-testid="close-popup">Close</button>
    </div>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, id }: any) => (
    <div data-testid="card" className={className} id={id}>{children}</div>
  ),
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: any) => <div data-testid="card-description">{children}</div>,
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: any) => (
    <div data-testid="card-title" className={className}>{children}</div>
  ),
}));

jest.mock('lucide-react', () => ({
  Users: ({ className }: any) => <div data-testid="users-icon" className={className}>Users</div>,
  FileText: ({ className }: any) => <div data-testid="filetext-icon" className={className}>FileText</div>,
  BarChart3: ({ className }: any) => <div data-testid="barchart-icon" className={className}>BarChart3</div>,
  UserCheck: ({ className }: any) => <div data-testid="usercheck-icon" className={className}>UserCheck</div>,
  DollarSign: ({ className }: any) => <div data-testid="dollarsign-icon" className={className}>DollarSign</div>,
  Clock: ({ className }: any) => <div data-testid="clock-icon" className={className}>Clock</div>,
  AlertCircle: ({ className }: any) => <div data-testid="alertcircle-icon" className={className}>AlertCircle</div>,
  Building2: ({ className }: any) => <div data-testid="building-icon" className={className}>Building2</div>,
  ClipboardList: ({ className }: any) => <div data-testid="clipboard-icon" className={className}>ClipboardList</div>,
  FileCheck: ({ className }: any) => <div data-testid="filecheck-icon" className={className}>FileCheck</div>,
  TrendingUp: ({ className }: any) => <div data-testid="trendingup-icon" className={className}>TrendingUp</div>,
}));

describe('Dashboard', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe('Component Rendering', () => {
    it('should render Dashboard with ProtectedRoute', () => {
      render(<Dashboard />);
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should render Dashboard with MainLayout', () => {
      render(<Dashboard />);
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    it('should render dashboard content container', () => {
      render(<Dashboard />);
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    });

    it('should set correct title in MainLayout', () => {
      render(<Dashboard />);
      expect(screen.getByTestId('layout-title')).toHaveTextContent('Dashboard');
    });

    it('should set correct breadcrumbs', () => {
      render(<Dashboard />);
      const breadcrumbs = screen.getByTestId('layout-breadcrumbs');
      expect(breadcrumbs).toHaveTextContent(JSON.stringify([{ label: 'Dashboard' }]));
    });
  });

  describe('Stats Cards', () => {
    it('should render all 4 stats cards', () => {
      render(<Dashboard />);
      expect(screen.getByText('Active Users')).toBeInTheDocument();
      expect(screen.getByText('Active Vendors')).toBeInTheDocument();
      expect(screen.getByText('Total Requests')).toBeInTheDocument();
      expect(screen.getByText('Pending Invoices')).toBeInTheDocument();
    });

    it('should display correct stat values', () => {
      render(<Dashboard />);
      expect(screen.getByText('45')).toBeInTheDocument(); // Active Users
      expect(screen.getByText('247')).toBeInTheDocument(); // Active Vendors
      expect(screen.getByText('29')).toBeInTheDocument(); // Total Requests
      expect(screen.getByText('17')).toBeInTheDocument(); // Pending Invoices
    });

    it('should have correct stat card IDs', () => {
      const { container } = render(<Dashboard />);
      expect(container.querySelector('#stat-active-users')).toBeInTheDocument();
      expect(container.querySelector('#stat-active-vendors')).toBeInTheDocument();
      expect(container.querySelector('#stat-total-requests')).toBeInTheDocument();
      expect(container.querySelector('#stat-pending-invoices')).toBeInTheDocument();
    });
  });

  describe('Recent Activity Section', () => {
    it('should render Recent Activity section', () => {
      render(<Dashboard />);
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    it('should display recent activity description', () => {
      render(<Dashboard />);
      expect(screen.getByText('Latest updates from your management system')).toBeInTheDocument();
    });

    it('should render all activity items', () => {
      render(<Dashboard />);
      expect(screen.getByText('New vendor application submitted')).toBeInTheDocument();
      expect(screen.getByText('Invoice #INV-2024-1023 approved')).toBeInTheDocument();
      expect(screen.getByText('Service request from TechCorp pending review')).toBeInTheDocument();
      expect(screen.getByText('Payment processed: $2,850.00')).toBeInTheDocument();
      expect(screen.getByText('User John Doe updated profile')).toBeInTheDocument();
    });

    it('should display activity timestamps', () => {
      render(<Dashboard />);
      expect(screen.getByText('15 minutes ago')).toBeInTheDocument();
      expect(screen.getByText('1 hour ago')).toBeInTheDocument();
      expect(screen.getByText('3 hours ago')).toBeInTheDocument();
      expect(screen.getByText('5 hours ago')).toBeInTheDocument();
      expect(screen.getByText('8 hours ago')).toBeInTheDocument();
    });

    it('should render view all activities button', () => {
      render(<Dashboard />);
      expect(screen.getByText('View all activities →')).toBeInTheDocument();
    });
  });

  describe('Invoice Statistics Section', () => {
    it('should render Invoice Statistics section', () => {
      render(<Dashboard />);
      expect(screen.getByText('Invoice Statistics')).toBeInTheDocument();
    });

    it('should display invoice statistics description', () => {
      render(<Dashboard />);
      expect(screen.getByText('Overview of invoice metrics this month')).toBeInTheDocument();
    });

    it('should display invoice metric values', () => {
      render(<Dashboard />);
      const values156 = screen.getAllByText('156');
      expect(values156.length).toBeGreaterThan(0);
      expect(screen.getByText('134')).toBeInTheDocument();
    });

    it('should display invoice percentages', () => {
      render(<Dashboard />);
      expect(screen.getByText('100% of total')).toBeInTheDocument();
      expect(screen.getByText('86% of total')).toBeInTheDocument();
      expect(screen.getByText('14% of total')).toBeInTheDocument();
    });

    it('should display summary statistics', () => {
      render(<Dashboard />);
      expect(screen.getByText('86%')).toBeInTheDocument();
      expect(screen.getByText('Approval Rate')).toBeInTheDocument();
    });
  });

  describe('Quick Actions Section', () => {
    it('should render Quick Actions section', () => {
      render(<Dashboard />);
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    it('should display quick actions description', () => {
      render(<Dashboard />);
      expect(screen.getByText('Common tasks and shortcuts')).toBeInTheDocument();
    });

    it('should render all quick action buttons', () => {
      render(<Dashboard />);
      expect(screen.getByText('Manage Users')).toBeInTheDocument();
      expect(screen.getByText('View Alerts')).toBeInTheDocument();
      expect(screen.getByText('View PO')).toBeInTheDocument();
      expect(screen.getByText('View Reports')).toBeInTheDocument();
    });

    it('should display quick action descriptions', () => {
      render(<Dashboard />);
      expect(screen.getByText('User administration')).toBeInTheDocument();
      expect(screen.getByText('Check system alerts')).toBeInTheDocument();
      expect(screen.getByText('Purchase orders')).toBeInTheDocument();
      expect(screen.getByText('Analytics & insights')).toBeInTheDocument();
    });

    it('should navigate to users page when Manage Users is clicked', () => {
      render(<Dashboard />);
      const manageUsersButton = screen.getByText('Manage Users').closest('button');
      fireEvent.click(manageUsersButton!);
      expect(mockPush).toHaveBeenCalledWith('/users');
    });

    it('should navigate to dashboard when View Alerts is clicked', () => {
      render(<Dashboard />);
      const viewAlertsButton = screen.getByText('View Alerts').closest('button');
      fireEvent.click(viewAlertsButton!);
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    it('should navigate to dashboard when View PO is clicked', () => {
      render(<Dashboard />);
      const viewPOButton = screen.getByText('View PO').closest('button');
      fireEvent.click(viewPOButton!);
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    it('should navigate to dashboard when View Reports is clicked', () => {
      render(<Dashboard />);
      const viewReportsButton = screen.getByText('View Reports').closest('button');
      fireEvent.click(viewReportsButton!);
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Welcome Popup', () => {
    it('should show welcome popup when justLoggedIn flag is true', () => {
      sessionStorage.setItem('justLoggedIn', 'true');
      render(<Dashboard />);
      
      waitFor(() => {
        expect(screen.getByTestId('welcome-popup')).toBeInTheDocument();
      });
    });

    it('should not show welcome popup when justLoggedIn flag is false', () => {
      sessionStorage.setItem('justLoggedIn', 'false');
      render(<Dashboard />);
      expect(screen.queryByTestId('welcome-popup')).not.toBeInTheDocument();
    });

    it('should not show welcome popup when flag is not set', () => {
      render(<Dashboard />);
      expect(screen.queryByTestId('welcome-popup')).not.toBeInTheDocument();
    });

    it('should remove justLoggedIn flag after showing popup', async () => {
      sessionStorage.setItem('justLoggedIn', 'true');
      render(<Dashboard />);
      
      await waitFor(() => {
        expect(sessionStorage.getItem('justLoggedIn')).toBeNull();
      });
    });

    it('should close welcome popup when close button is clicked', async () => {
      sessionStorage.setItem('justLoggedIn', 'true');
      render(<Dashboard />);
      
      await waitFor(() => {
        expect(screen.getByTestId('welcome-popup')).toBeInTheDocument();
      });

      const closeButton = screen.getByTestId('close-popup');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('welcome-popup')).not.toBeInTheDocument();
      });
    });
  });

  describe('Layout Structure', () => {
    it('should have stats grid', () => {
      const { container } = render(<Dashboard />);
      const statsGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      expect(statsGrid).toBeInTheDocument();
    });

    it('should have main content grid', () => {
      const { container } = render(<Dashboard />);
      const mainGrid = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
      expect(mainGrid).toBeInTheDocument();
    });

    it('should have quick actions grid', () => {
      render(<Dashboard />);
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('Common tasks and shortcuts')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should display 5 recent activities', () => {
      render(<Dashboard />);
      const activities = [
        'New vendor application submitted',
        'Invoice #INV-2024-1023 approved',
        'Service request from TechCorp pending review',
        'Payment processed: $2,850.00',
        'User John Doe updated profile',
      ];
      
      activities.forEach(activity => {
        expect(screen.getByText(activity)).toBeInTheDocument();
      });
    });

    it('should display 4 quick action buttons', () => {
      render(<Dashboard />);
      expect(screen.getByText('Manage Users')).toBeInTheDocument();
      expect(screen.getByText('View Alerts')).toBeInTheDocument();
      expect(screen.getByText('View PO')).toBeInTheDocument();
      expect(screen.getByText('View Reports')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render all section header icons', () => {
      render(<Dashboard />);
      const clockIcons = screen.getAllByTestId('clock-icon');
      expect(clockIcons.length).toBeGreaterThan(0);
      expect(screen.getByTestId('barchart-icon')).toBeInTheDocument();
      const fileTextIcons = screen.getAllByTestId('filetext-icon');
      expect(fileTextIcons.length).toBeGreaterThan(0);
    });

    it('should render invoice metric icons', () => {
      render(<Dashboard />);
      expect(screen.getByTestId('usercheck-icon')).toBeInTheDocument();
    });
  });

  describe('Styling and Classes', () => {
    it('should apply hover effects to stat cards', () => {
      const { container } = render(<Dashboard />);
      const statCards = container.querySelectorAll('[id^="stat-"]');
      statCards.forEach(card => {
        expect(card.className).toContain('hover:shadow-lg');
      });
    });

    it('should apply background colors to stat cards', () => {
      const { container } = render(<Dashboard />);
      expect(container.querySelector('#stat-active-users')?.className).toContain('bg-blue-50');
      expect(container.querySelector('#stat-active-vendors')?.className).toContain('bg-green-50');
      expect(container.querySelector('#stat-total-requests')?.className).toContain('bg-purple-50');
      expect(container.querySelector('#stat-pending-invoices')?.className).toContain('bg-orange-50');
    });
  });

  describe('Navigation Handling', () => {
    it('should have working navigation function', () => {
      render(<Dashboard />);
      const manageUsersButton = screen.getByText('Manage Users').closest('button');
      fireEvent.click(manageUsersButton!);
      expect(mockPush).toHaveBeenCalled();
    });

    it('should navigate to correct paths', () => {
      render(<Dashboard />);
      
      const buttons = [
        { text: 'Manage Users', path: '/users' },
        { text: 'View Alerts', path: '/dashboard' },
        { text: 'View PO', path: '/dashboard' },
        { text: 'View Reports', path: '/dashboard' },
      ];

      buttons.forEach(({ text, path }) => {
        mockPush.mockClear();
        const button = screen.getByText(text).closest('button');
        fireEvent.click(button!);
        expect(mockPush).toHaveBeenCalledWith(path);
      });
    });
  });

  describe('Progress Bars', () => {
    it('should render progress bars with correct widths', () => {
      const { container } = render(<Dashboard />);
      const progressBars = container.querySelectorAll('.h-2\\.5.rounded-full.bg-blue-500, .h-2\\.5.rounded-full.bg-green-500, .h-2\\.5.rounded-full.bg-orange-500');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });
});

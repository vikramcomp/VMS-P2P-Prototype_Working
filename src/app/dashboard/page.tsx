'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, BarChart3, UserCheck, Clock, AlertCircle, Building2, ClipboardList, FileCheck, TrendingUp } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { buildApiUrl } from '@/services/api-client';
import { authService } from '@/services/auth-service';

// Color palette for activity items
const activityColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-purple-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-red-500',
  'bg-yellow-500',
];

// Helper function to format relative time
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else {
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }
};

const isNetworkFetchError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes('failed to fetch') || message.includes('networkerror');
};

interface RecentActivityItem {
  id: string;
  description: string;
  activityDate: string;
  color: string;
}

interface InvoiceSummary {
  total: number;
  approved: number;
  pending: number;
}

interface DashboardMetrics {
  activeUsers: number;
  activeVendors: number;
  totalPos: number;
  submitRequests: number;
}

interface DashboardContentProps {
  isTesting?: boolean;
}

export function DashboardContent({ isTesting = false }: DashboardContentProps = {}) {
  const router = useRouter();
  const hasLoggedNetworkIssueRef = React.useRef(false);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    activeUsers: 0,
    activeVendors: 0,
    totalPos: 0,
    submitRequests: 0,
  });
  const [dashboardMetricsLoading, setDashboardMetricsLoading] = useState(true);
  const [invoiceSummary, setInvoiceSummary] = useState<InvoiceSummary>({
    total: 0,
    approved: 0,
    pending: 0,
  });
  const [invoiceSummaryLoading, setInvoiceSummaryLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);
  const [recentActivitiesLoading, setRecentActivitiesLoading] = useState(true);

  const logDashboardFetchError = (context: string, error: unknown) => {
    if (isNetworkFetchError(error)) {
      if (!hasLoggedNetworkIssueRef.current) {
        console.warn(`${context}: API is unreachable. Showing fallback dashboard data.`);
        hasLoggedNetworkIssueRef.current = true;
      }
      return;
    }

    console.error(context, error);
  };

  React.useEffect(() => {
    if (isTesting) {
      handleNavigation('/users');
    }
  }, [isTesting]);

  useEffect(() => {
    if (isTesting) return;

    const extractNumber = (source: any, ...keys: string[]) => {
      for (const key of keys) {
        const value = source?.[key];
        if (value !== undefined && value !== null && value !== '') {
          const num = typeof value === 'number' ? value : Number.parseFloat(value);
          if (!Number.isNaN(num)) return num;
        }
      }
      return 0;
    };

    const normalizeMetrics = (raw: any): DashboardMetrics => {
      const source =
        raw?.data?.records?.[0] ||
        raw?.data?.Records?.[0] ||
        raw?.records?.[0] ||
        raw?.Records?.[0] ||
        raw?.data ||
        raw;

      const activeUsers = extractNumber(
        source,
        'activeUsers',
        'ActiveUsers',
        'activeUserCount',
        'ActiveUserCount'
      );

      const activeVendors = extractNumber(
        source,
        'activeVendors',
        'ActiveVendors',
        'activeVendorCount',
        'ActiveVendorCount'
      );

      const totalPos = extractNumber(
        source,
        'activePOs',
        'ActivePOs',
        'totalPos',
        'TotalPos',
        'totalPOs',
        'TotalPOs',
        'totalPoCount',
        'TotalPoCount'
      );

      const submitRequests = extractNumber(
        source,
        'submittedTotalRequests',
        'SubmittedTotalRequests',
        'submitRequests',
        'SubmitRequests',
        'totalRequests',
        'TotalRequests',
        'submittedRequests',
        'SubmittedRequests'
      );

      return {
        activeUsers: Math.max(0, activeUsers),
        activeVendors: Math.max(0, activeVendors),
        totalPos: Math.max(0, totalPos),
        submitRequests: Math.max(0, submitRequests),
      };
    };

    const fetchDashboardMetrics = async () => {
      setDashboardMetricsLoading(true);
      try {
        const token = authService.getToken();
        const headers: HeadersInit = {
          Accept: 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(buildApiUrl('dashboard/metrics'), { headers });
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || errorData?.title || 'Failed to fetch dashboard metrics');
        }

        const data = await response.json();
        setDashboardMetrics(normalizeMetrics(data));
      } catch (error) {
        logDashboardFetchError('Failed to fetch dashboard metrics', error);
        setDashboardMetrics({
          activeUsers: 0,
          activeVendors: 0,
          totalPos: 0,
          submitRequests: 0,
        });
      } finally {
        setDashboardMetricsLoading(false);
      }
    };

    fetchDashboardMetrics();
    const intervalId = globalThis.setInterval(fetchDashboardMetrics, 300000);
    return () => globalThis.clearInterval(intervalId);
  }, [isTesting]);

  useEffect(() => {
    if (isTesting) return;

    const extractNumber = (source: any, ...keys: string[]) => {
      for (const key of keys) {
        const value = source?.[key];
        if (value !== undefined && value !== null && value !== '') {
          const num = typeof value === 'number' ? value : Number.parseFloat(value);
          if (!Number.isNaN(num)) return num;
        }
      }
      return 0;
    };

    const normalizeSummary = (raw: any): InvoiceSummary => {
      const source =
        raw?.data?.records?.[0] ||
        raw?.data?.Records?.[0] ||
        raw?.records?.[0] ||
        raw?.Records?.[0] ||
        raw?.data ||
        raw;

      const total = extractNumber(
        source,
        'totalInvoices',
        'TotalInvoices',
        'totalInvoiceCount',
        'TotalInvoiceCount',
        'total',
        'Total',
        'totalCount',
        'TotalCount',
        'invoiceCount',
        'InvoiceCount'
      );

      const approved = extractNumber(
        source,
        'approvedInvoices',
        'ApprovedInvoices',
        'approvedCount',
        'ApprovedCount',
        'approved',
        'Approved'
      );

      const pending = extractNumber(
        source,
        'pendingReviewInvoices',
        'PendingReviewInvoices',
        'pendingReview',
        'PendingReview',
        'pendingInvoices',
        'PendingInvoices',
        'pendingCount',
        'PendingCount',
        'pending',
        'Pending'
      );

      return {
        total: Math.max(0, total),
        approved: Math.max(0, approved),
        pending: Math.max(0, pending),
      };
    };

    const fetchInvoiceSummary = async () => {
      setInvoiceSummaryLoading(true);
      try {
        const token = authService.getToken();
        const headers: HeadersInit = {
          Accept: 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(buildApiUrl('invoices/summary'), { headers });
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || errorData?.title || 'Failed to fetch invoice summary');
        }

        const data = await response.json();
        setInvoiceSummary(normalizeSummary(data));
      } catch (error) {
        logDashboardFetchError('Failed to fetch invoice summary', error);
        setInvoiceSummary({ total: 0, approved: 0, pending: 0 });
      } finally {
        setInvoiceSummaryLoading(false);
      }
    };

    fetchInvoiceSummary();
    const intervalId = globalThis.setInterval(fetchInvoiceSummary, 300000);
    return () => globalThis.clearInterval(intervalId);
  }, [isTesting]);

  // Fetch Recent Activities
  useEffect(() => {
    if (isTesting) return;

    const fetchRecentActivities = async () => {
      setRecentActivitiesLoading(true);
      try {
        const token = authService.getToken();
        const headers: HeadersInit = {
          Accept: 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
          buildApiUrl('dashboard/recent-activity?timePeriod=4&pageSize=10&pageNumber=1'),
          { headers }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || errorData?.title || 'Failed to fetch recent activities');
        }

        const data = await response.json();
        
        // Normalize the response data
        const records = data?.data?.records || data?.data?.Records || data?.records || data?.Records || data?.data || [];
        const activitiesArray = Array.isArray(records) ? records : [];
        
        const formattedActivities: RecentActivityItem[] = activitiesArray.map((item: any, index: number) => ({
          id: item.id || item.Id || `activity-${index}`,
          description: item.description || item.Description || '',
          activityDate: item.activityDate || item.ActivityDate || '',
          color: activityColors[index % activityColors.length],
        }));

        setRecentActivities(formattedActivities);
      } catch (error) {
        logDashboardFetchError('Failed to fetch recent activities', error);
        setRecentActivities([]);
      } finally {
        setRecentActivitiesLoading(false);
      }
    };

    fetchRecentActivities();
    const intervalId = globalThis.setInterval(fetchRecentActivities, 300000);
    return () => globalThis.clearInterval(intervalId);
  }, [isTesting]);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const stats = [
    {
      title: 'Active Users',
      value: dashboardMetricsLoading ? '—' : String(dashboardMetrics.activeUsers),
      description: 'as of now',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total POs',
      value: dashboardMetricsLoading ? '—' : String(dashboardMetrics.totalPos),
      description: 'from start to present',
      icon: ClipboardList,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Active Vendors',
      value: dashboardMetricsLoading ? '—' : String(dashboardMetrics.activeVendors),
      description: 'as of now',
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Submit Requests',
      value: dashboardMetricsLoading ? '—' : String(dashboardMetrics.submitRequests),
      description: 'from start to present',
      icon: FileText,
      color: 'text-amber-600',
      bgColor: 'bg-gray-50',
    },
  ];


  const totalInvoices = invoiceSummary.total;
  const approvedInvoices = invoiceSummary.approved;
  const pendingInvoices = invoiceSummary.pending;
  const approvedPercentage = totalInvoices > 0 ? Math.round((approvedInvoices / totalInvoices) * 100) : 0;
  const pendingPercentage = totalInvoices > 0 ? Math.round((pendingInvoices / totalInvoices) * 100) : 0;

  const invoiceMetrics = [
    {
      label: 'Total Invoices',
      value: totalInvoices,
      percentage: 100,
      color: 'bg-blue-500',
      icon: FileText,
    },
    {
      label: 'Approved Invoices',
      value: approvedInvoices,
      percentage: approvedPercentage,
      color: 'bg-green-500',
      icon: UserCheck,
    },
    {
      label: 'Pending Review',
      value: pendingInvoices,
      percentage: pendingPercentage,
      color: 'bg-orange-500',
      icon: Clock,
    },
  ];

  return (
    <>
      <MainLayout title="Dashboard" breadcrumbs={[{ label: 'Dashboard' }]}>
        <div className="space-y-6" data-testid="dashboard-content">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {stats.map((stat) => (
            <Card id={`stat-${stat.title.replaceAll(/\s+/g, '-').toLowerCase()}`} key={stat.title} className={`hover:shadow-lg transition-shadow ${stat.bgColor}`}>
              <CardHeader className="flex flex-row items-center justify-between p-4 space-y-0 pb-2">
                <CardTitle className="text-sm font-normal">
                  {stat.title}
                </CardTitle>
                
              </CardHeader>
              <CardContent className='p-4 pt-0'>
                <div className='flex items-center gap-2'>
                  <div>
                    <stat.icon className={`h-10 w-10 ${stat.color}`} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Recent Activity */}
          <Card>
            <CardHeader  className='p-4 pb-2'>
              <CardTitle className="flex items-center gap-2 mb-0">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                <span className="text-xs text-muted-foreground cus-border"> Latest updates from your management system </span>
              </CardDescription>
            </CardHeader>
            <CardContent className='p-4 pt-0'>
              <div className="space-y-2">
                <div className="h-[280px] overflow-y-auto pr-2">
                  {recentActivitiesLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <span className="text-sm text-muted-foreground">Loading activities...</span>
                    </div>
                  ) : recentActivities.length === 0 ? (
                    <div className="flex items-center justify-center py-4">
                      <span className="text-sm text-muted-foreground">No recent activities</span>
                    </div>
                  ) : (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-2 p-1 rounded-lg hover:bg-gray-50 transition-colors mb-0">
                        <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-normal text-gray-900 truncate">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-0">{formatTimeAgo(activity.activityDate)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {/* <div className="pt-3 border-t">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-normal">
                    View all activities →
                  </button>
                </div>*/}
              </div> 
            </CardContent>
          </Card>

          {/* Invoice Statistics */}
          <Card>
            <CardHeader className='p-4 pb-2'>
              <CardTitle className="flex items-center gap-2 mb-0">
                <BarChart3 className="h-5 w-5" />
                Invoice Statistics
              </CardTitle>
              <CardDescription>
                <span className="text-xs text-muted-foreground">Overview of invoice metrics since last 1 year</span>
              </CardDescription>
            </CardHeader>
            <CardContent className='p-4 pt-0'>
              <div className="space-y-4">
                {invoiceMetrics.map((metric) => {
                  const IconComponent = metric.icon;
                  return (
                    <div key={metric.label} className="space-y-2 p-2 mb-2 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className={`p-1 pt-0 pb-0 rounded-full ${metric.color.replace('bg-', 'bg-opacity-10 text-')}`}>
                            <IconComponent className="h-4 w-4" strokeWidth={1.5} />
                          </div>
                          <span className="text-sm font-normal">{metric.label}</span>
                        </div>
                        <span className="text-sm font-bold">{metric.value}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mb-1">
                        <div 
                          className={`h-1 rounded-full ${metric.color} transition-all duration-500 ease-out`}
                          style={{ width: `${metric.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{metric.percentage}% of total</span>
                        <span className="font-normal">{metric.value} invoices</span>
                      </div>
                    </div>
                  );
                })}
                
                {/* Summary */}
                <div className="mt-3 pt-2 border-t bg-gray-50 rounded-lg p-2">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <span className="text-sm font-bold text-blue-600">
                        {invoiceSummaryLoading ? '—' : totalInvoices}
                      </span>
                      <p className="text-xs text-muted-foreground">Total Invoices</p>
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-bold text-green-600">
                        {invoiceSummaryLoading ? '—' : `${approvedPercentage}%`}
                      </span>
                      <p className="text-xs text-muted-foreground">Approval Rate</p>
                    </div>


                  <div className="text-center">
                      <span className="text-sm font-bold text-orange-600">
                        {invoiceSummaryLoading ? 'Loading invoice summary...' : `${pendingInvoices}`}
                      </span>
                      <p className="text-xs text-muted-foreground">invoices pending review</p>
{/* 
                    <span className="text-xs text-orange-600 font-medium">
                      {invoiceSummaryLoading ? 'Loading invoice summary...' : `${pendingInvoices} invoices pending review`}
                    </span> */}
                  </div>

                  </div>

                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className='p-4'>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quick Actions - Common tasks and shortcuts
            </CardTitle>

          </CardHeader>
          <CardContent className='p-4 pt-0'>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/users"
                className="p-4 border rounded-lg bg-gray-50 text-left transition-all duration-200 hover:bg-white hover:shadow-lg hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vendor-500 focus-visible:ring-offset-2 flex items-center gap-3"
              >
                <Users className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-normal">Manage Users</p>
                  <p className="text-xs text-muted-foreground">User administration</p>
                </div>
              </Link>
              <button
                type="button"
                aria-disabled="true"
                title="Coming soon"
                className="p-4 border rounded-lg bg-gray-50 text-left transition-all duration-200 hover:bg-white hover:shadow-lg hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vendor-500 focus-visible:ring-offset-2 cursor-pointer flex items-center gap-3"
              >
                <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0" />
                <div>
                  <p className="font-normal">View Alerts</p>
                  <p className="text-xs text-muted-foreground">Check system alerts</p>
                </div>
              </button>
              <Link
                href="/po-list"
                className="p-4 border rounded-lg bg-gray-50 text-left transition-all duration-200 hover:bg-white hover:shadow-lg hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vendor-500 focus-visible:ring-offset-2 flex items-center gap-3"
              >
                <FileCheck className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-normal">View PO</p>
                  <p className="text-xs text-muted-foreground">Purchase orders</p>
                </div>
              </Link>
              <Link
                href="/po-report"
                className="p-4 border rounded-lg bg-gray-50 text-left transition-all duration-200 hover:bg-white hover:shadow-lg hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vendor-500 focus-visible:ring-offset-2 flex items-center gap-3"
              >
                <TrendingUp className="h-6 w-6 text-purple-600 flex-shrink-0" />
                <div>
                  <p className="font-normal">View Reports</p>
                  <p className="text-xs text-muted-foreground">Analytics & insights</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      </MainLayout>
    </>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute> 
      <DashboardContent />
    </ProtectedRoute>
  );
}
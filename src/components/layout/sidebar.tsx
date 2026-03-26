'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';
import { DESIGN_SYSTEM } from '@/utils/design-system';
import { authService } from '@/services/auth-service';
import { useSidebar } from './sidebar-context';
import { Tooltip } from '@/components/ui/tooltip';
import { useCompany } from '@/context/CompanyContext';
import { useToast } from '@/hooks/use-toast';
import { 
  LayoutDashboard, 
  Users, 
  Menu,
  X,
  Power,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  UsersRound,
  UserPlus,
  Workflow,
  Plus,
  Settings,
  ListTree,
  Eye,
  Share2,
  FileText,
  Receipt,
  Building2,
  CheckSquare,
  FileCheck,
  BarChart,
  DollarSign,
  ClipboardList,
  FileSpreadsheet,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  ScrollText,
  Building,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  readonly className?: string;
}

// PROTOTYPE: reordered for Setup → Transaction → Reports flow
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, moduleId: 0 },

  // ── Organisation Setup ───────────────────────────────────────────────────
  { type: 'section' as const, label: 'Organisation Setup' },

  {
    name: 'Company Master',
    icon: ShieldCheck,
    hasDropdown: true,
    moduleId: 0,
    // PROTOTYPE: visible to all for demo
    // superAdminOnly: true,
    children: [
      { name: 'Company Accounts',    href: '/super-admin/companies',        icon: Building2 },
      { name: 'Onboard New Company', href: '/super-admin/companies/create', icon: Plus      },
      // PROTOTYPE: hidden until pages are fully built
      // { name: 'System Users',    href: '/super-admin/system-users',    icon: Users      },
      // { name: 'Global Settings', href: '/super-admin/global-settings', icon: Settings   },
      // { name: 'Audit Logs',      href: '/super-admin/audit-logs',      icon: ScrollText },
    ],
  },
  {
    name: 'Branches',
    icon: UsersRound,
    hasDropdown: true,
    moduleId: 1,
    children: [
      { name: 'Manage Branches',    href: '/groups',     icon: UsersRound },
      { name: 'Add New Branch',     href: '/groups/new', icon: UserPlus   },
    ],
  },
  {
    name: 'Departments',
    icon: Building,
    hasDropdown: true,
    moduleId: 0,
    children: [
      { name: 'Manage Departments', href: '/departments', icon: Eye },
      { name: 'Add New Department', href: '/departments/new', icon: Plus },
    ],
  },

  // ── Masters ───────────────────────────────────────────────────────────────
  { type: 'section' as const, label: 'Masters' },

  {
    name: 'Product Categories',
    icon: Settings,
    hasDropdown: true,
    moduleId: 4,
    children: [
      { name: 'View Categories',  href: '/services',         icon: Eye    },
      { name: 'Add New Category', href: '/services/new',     icon: Plus   },
    ],
  },
  {
    name: 'Sub-Categories',
    icon: Tag,
    hasDropdown: true,
    moduleId: 0,
    children: [
      { name: 'Manage Sub-Categories', href: '/subgroups', icon: Eye },
      { name: 'Sub-Category Mapping', href: '/services/mapping', icon: Share2 },
    ],
  },
  {
    name: 'Product Items',
    icon: ListTree,
    hasDropdown: true,
    moduleId: 5,
    children: [
      { name: 'View Items',   href: '/service-details',         icon: Eye    },
      { name: 'Add New Item', href: '/service-details/new',     icon: Plus   },
      { name: 'Item Mapping', href: '/service-details/mapping', icon: Share2 },
    ],
  },
  {
    name: 'Vendor Master',
    icon: Building2,
    hasDropdown: true,
    moduleId: 6,
    children: [
      { name: 'Manage Vendors', href: '/vendors',     icon: Eye  },
      { name: 'Add New Vendor', href: '/vendors/new', icon: Plus },
    ],
  },

  // ── Users ─────────────────────────────────────────────────────────────────
  { type: 'section' as const, label: 'Users' },

  {
    name: 'Users',
    icon: Users,
    hasDropdown: true,
    moduleId: 2,
    children: [
      { name: 'View Users',   href: '/users',     icon: Users    },
      { name: 'Add New User', href: '/users/new', icon: UserPlus },
    ],
  },

  // ── Workflows ───────────────────────────────────────────────────────────
  { type: 'section' as const, label: 'Workflows' },

  {
    name: 'Workflows',
    icon: Workflow,
    hasDropdown: true,
    moduleId: 3,
    children: [
      { name: 'View Workflows',   href: '/workflows',     icon: Workflow },
      { name: 'Add New Workflow', href: '/workflows/new', icon: Plus     },
    ],
  },

  // ── Procurement ───────────────────────────────────────────────────────────
  { type: 'section' as const, label: 'Procurement' },

  {
    name: 'Purchase Request',
    icon: FileText,
    hasDropdown: true,
    moduleId: 7,
    children: [
      { name: 'Manage Requests',      href: '/requests',     icon: Eye  },
      { name: 'Add Purchase Request', href: '/requests/new', icon: Plus },
    ],
  },
  { name: 'Quotations',        href: '/manage-quotations', icon: FileSpreadsheet, moduleId: 8  },
  { name: 'Request Approvals', href: '/approvals',         icon: CheckSquare,     moduleId: 9  },
  {
    name: 'Purchase Orders',
    icon: ClipboardList,
    hasDropdown: true,
    moduleId: 14,
    children: [
      { name: 'View Purchase Orders', href: '/po-list',     icon: Eye  },
      { name: 'Add Purchase Order',   href: '/po-list/new', icon: Plus },
    ],
  },
  { name: 'Invoices',          href: '/invoices',          icon: Receipt,    moduleId: 10 },
  { name: 'Invoice Approvals', href: '/invoice-approvals', icon: FileCheck,  moduleId: 12 },
  { name: 'Payments',          href: '/manage-payments',   icon: DollarSign, moduleId: 11 },

  // ── Reports ───────────────────────────────────────────────────────────────
  { type: 'section' as const, label: 'Reports' },

  { name: 'PO Report', href: '/po-report', icon: BarChart, moduleId: 15 },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleCollapse } = useSidebar();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [manualOpenDropdowns, setManualOpenDropdowns] = useState<string[]>([]);
  const [hasUserToggledDropdown, setHasUserToggledDropdown] = useState(false);
  const [collapsedFlyout, setCollapsedFlyout] = useState<string | null>(null);
  const [flyoutPosition, setFlyoutPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const flyoutRef = React.useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<{name?: string, loginId?: string, email?: string, role?: string} | null>(null);
  const [accessibleModuleIds, setAccessibleModuleIds] = useState<number[]>([]);
  const { activeCompany } = useCompany();
  const { toast } = useToast();

  // Close flyout when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (flyoutRef.current && !flyoutRef.current.contains(event.target as Node)) {
        setCollapsedFlyout(null);
      }
    };

    if (collapsedFlyout) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [collapsedFlyout]);

  // Close flyout when sidebar expands
  useEffect(() => {
    if (!isCollapsed) {
      setCollapsedFlyout(null);
    }
  }, [isCollapsed]);

  useEffect(() => {
    // Get user data from auth service
    const userData = authService.getUser();
    setUser(userData);
    
    // Get user's accessible modules and extract module IDs
    const userModules = authService.getUserModules();
    
    // Handle both array and object formats
    // The menus object may contain allModulesFlattened or userMenus arrays
    let modulesArray: any[] = [];
    if (Array.isArray(userModules)) {
      modulesArray = userModules;
    } else if (userModules && typeof userModules === 'object') {
      // If it's an object with nested arrays, extract them
      const menus = userModules as any;
      modulesArray = menus.allModulesFlattened || menus.AllModulesFlattened || 
      menus.userMenus || menus.UserMenus ||
      menus.items || menus.data || menus.records || [];
    }
    
    const moduleIds = modulesArray.map((m: any) => m.moduleId || m.ModuleId || m.menuId || m.MenuId);
    // Always include Dashboard (moduleId: 0)
    setAccessibleModuleIds([0, ...moduleIds.filter((id: any) => id !== undefined)]);
  }, []);

  // Super admin check — any role containing 'admin' (case-insensitive)
  const isSuperAdmin = !!(user?.role?.toLowerCase().includes('admin'));

  const canAccessHref = (href?: string) => {
    if (!href) return false;
    if (activeCompany) return true;
    return href === '/super-admin/companies';
  };

  const showCompanyRequiredMessage = () => {
    toast({
      title: 'Company Required',
      description: 'Please select a company first',
    });
  };

  // Filter navigation based on accessible modules
  // superAdminOnly items are shown only for admins; all others filtered by accessible module IDs.
  // Section dividers always pass through (no moduleId).
  const filteredNavigation = navigation.filter((item: any) =>
    item.type === 'section' ||
    (item.superAdminOnly
      ? isSuperAdmin
      : accessibleModuleIds.includes(item.moduleId))
  );

  // Get display name from user data
  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.loginId) return user.loginId;
    if (user?.email) return user.email.split('@')[0]; // Use email username part
    return 'User';
  };

  // Get user role
  const getUserRole = () => {
    return user?.role || 'User';
  };

  const toggleDropdown = (itemName: string) => {
    setHasUserToggledDropdown(true);
    setManualOpenDropdowns(prev => 
      prev.includes(itemName) 
        ? [] // Close the current dropdown (and any others)
        : [itemName] // Open only this dropdown (close all others)
    );
  };

  const handleCollapsedMenuClick = (event: React.MouseEvent<HTMLButtonElement>, itemName: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setFlyoutPosition({
      top: rect.top,
      left: rect.right + 8, // 8px gap from the sidebar
    });
    setCollapsedFlyout(prev => prev === itemName ? null : itemName);
  };

  const SidebarSection = ({ label }: { label: string }) => (
    <div style={{
      fontSize: '10px',
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
      color: 'var(--muted-foreground, #9ca3af)',
      padding: '20px 16px 6px 16px',
      borderTop: '1px solid var(--border, #e5e7eb)',
      marginTop: '8px',
      userSelect: 'none' as const,
    }}>
      {label}
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="vms-button"
        >
          {isMobileMenuOpen ? 
            <X className="h-4 w-4" style={{ color: '#0152ef' }} /> : 
            <Menu className="h-4 w-4" style={{ color: '#0152ef' }} />
          }
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen transform bg-background border-r transition-all duration-300 ease-in-out md:translate-x-0',
          'vms-animate-slide-in',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
        style={{ width: isCollapsed ? DESIGN_SYSTEM.vmsConstants.sidebarCollapsedWidth : DESIGN_SYSTEM.vmsConstants.sidebarWidth }}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div 
            className="flex items-center justify-center border-b vms-component relative"
            style={{ height: DESIGN_SYSTEM.vmsConstants.headerHeight }}
          >
            <Link href="/dashboard" className="flex items-center">
              {isCollapsed ? (
                <Image
                  src="/images/logos/mini-logo.png"
                  alt="VMS"
                  width={50}
                  height={20}
                  className="object-contain"
                  style={{ minWidth: '50px', minHeight: '20px' }}
                  priority
                />
              ) : (
                <Image
                  src="/images/logos/logo.png"
                  alt="VMS 2.0 Logo"
                  width={160}
                  height={63}
                  className="object-contain"
                  priority
                />
              )}
            </Link>

            {/* Collapse Toggle Button */}
            <div className="cus-exp-coll-btn flex justify-end">
              <Tooltip content={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} position="right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleCollapse}
                  className="h-8 w-8 hover:bg-gray-100"
                >
                  {isCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4" style={{ color: '#0152ef' }} />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" style={{ color: '#0152ef' }} />
                  )}
                </Button>
              </Tooltip>
            </div>

          </div>

          {/* Navigation */}
          <nav className={cn("flex-1 space-y-1 py-6 overflow-y-auto", isCollapsed ? "px-2" : "px-4")}>
            {filteredNavigation.map((item) => {
              if ((item as any).type === 'section') {
                return isCollapsed ? null : <SidebarSection key={`section-${(item as any).label}`} label={(item as any).label} />;
              }
              if ((item as any).hasDropdown && (item as any).children) {
                const isParentDisabled = !activeCompany && item.name !== 'Company Master';
                const isChildActive = item.children.some(child => 
                  pathname === child.href || pathname.startsWith(child.href + '/')
                );
                // Keep active menu open by default, but allow manual collapse/expand after first click.
                const isDropdownOpen = !isCollapsed && (
                  manualOpenDropdowns.includes(item.name) ||
                  (!hasUserToggledDropdown && isChildActive)
                );
                
                // Collapsed view - show icon with flyout menu
                if (isCollapsed) {
                  const isFlyoutOpen = collapsedFlyout === item.name;
                  return (
                    <div key={item.name} className="relative">
                      <Tooltip content={item.name} position="right">
                        <button
                          onClick={(e) => {
                            if (isParentDisabled) {
                              showCompanyRequiredMessage();
                              return;
                            }
                            handleCollapsedMenuClick(e, item.name);
                          }}
                          className={cn(
                            'group flex items-center justify-center w-full rounded-md p-2 text-sm font-normal transition-colors',
                            'hover:bg-gray-100',
                            isParentDisabled ? 'opacity-50 cursor-not-allowed' : '',
                            isChildActive || isFlyoutOpen
                              ? 'bg-vendor-500 text-gray-900 shadow-sm'
                              : 'text-gray-900 bg-transparent'
                          )}
                          style={{
                            borderRadius: DESIGN_SYSTEM.borderRadius.button,
                            transition: DESIGN_SYSTEM.transitions.fast,
                          }}
                        >
                          <item.icon
                            className="h-5 w-5 flex-shrink-0"
                            style={{ color: '#0152ef' }}
                          />
                        </button>
                      </Tooltip>
                    </div>
                  );
                }
                
                return (
                  <div key={item.name}>
                    {/* Parent dropdown item */}
                    <button
                      onClick={() => {
                        if (isParentDisabled) {
                          showCompanyRequiredMessage();
                          return;
                        }
                        toggleDropdown(item.name);
                      }}
                      className={cn(
                        'group flex items-center justify-between w-full rounded-md px-3 py-2 text-sm font-normal transition-colors',
                        'hover:bg-gray-100',
                        isParentDisabled ? 'opacity-50 cursor-not-allowed' : '',
                        isChildActive
                          ? 'bg-vendor-500 text-gray-900 shadow-sm'
                          : 'text-gray-900 bg-transparent'
                      )}
                      style={{
                        borderRadius: DESIGN_SYSTEM.borderRadius.button,
                        transition: DESIGN_SYSTEM.transitions.fast,
                        color: isChildActive ? '#0152ef' : '#111827',
                        display: 'flex',
                      }}
                    >
                      <div className="flex items-center">
                        <item.icon
                          className="mr-3 h-5 w-5 flex-shrink-0"
                          style={{ color: '#0152ef' }}
                        />
                        {item.name}
                      </div>
                      {isDropdownOpen ? (
                        <ChevronDown className="h-4 w-4" style={{ color: '#0152ef' }} />
                      ) : (
                        <ChevronRight className="h-4 w-4" style={{ color: '#0152ef' }} />
                      )}
                    </button>
                    
                    {/* Dropdown menu items */}
                    {isDropdownOpen && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => {
                          const isChildDisabled = !canAccessHref(child.href);
                          const isActive = pathname === child.href;

                          if (isChildDisabled) {
                            return (
                              <Tooltip key={child.name} content="Please select a company first" position="right">
                                <button
                                  type="button"
                                  className={cn(
                                    'group flex w-full items-center rounded-md px-3 py-2 text-sm font-normal transition-colors',
                                    'opacity-50 cursor-not-allowed'
                                  )}
                                  onClick={showCompanyRequiredMessage}
                                >
                                  <child.icon
                                    className="mr-3 h-4 w-4 flex-shrink-0"
                                    style={{ color: '#111827' }}
                                  />
                                  {child.name}
                                </button>
                              </Tooltip>
                            );
                          }

                          return (
                            <Link
                              key={child.name}
                              href={child.href}
                              className={cn(
                                'group flex items-center rounded-md px-3 py-2 text-sm font-normal transition-colors',
                                'hover:bg-gray-100',
                                isActive
                                  ? 'bg-vendor-400 text-gray-900'
                                  : 'bg-vendor-400 text-gray-900 bg-transparent'
                              )}
                              style={{
                                borderRadius: DESIGN_SYSTEM.borderRadius.button,
                                transition: DESIGN_SYSTEM.transitions.fast,
                                color: isActive ? '#0152ef' : '#111827',
                                display: 'flex',
                              }}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <child.icon
                                className="mr-3 h-4 w-4 flex-shrink-0"
                                style={{ color: isActive ? '#0152ef' : '#111827' }}
                              />
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              } else {
                // Regular navigation item without dropdown
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                
                // Collapsed view - show only icon with tooltip
                if (isCollapsed) {
                  const isDisabled = !canAccessHref(item.href);
                  return (
                    <Tooltip key={item.name} content={item.name} position="right">
                      <button
                        type="button"
                        onClick={() => {
                          if (isDisabled) {
                            showCompanyRequiredMessage();
                            return;
                          }
                          router.push(item.href!);
                          setIsMobileMenuOpen(false);
                        }}
                        className={cn(
                          'group flex items-center justify-center rounded-md p-2 text-sm font-normal transition-colors',
                          'hover:bg-gray-100',
                          isDisabled ? 'opacity-50 cursor-not-allowed' : '',
                          isActive
                            ? 'bg-vendor-500 text-gray-900 shadow-sm'
                            : 'text-gray-900 bg-transparent'
                        )}
                        style={{
                          borderRadius: DESIGN_SYSTEM.borderRadius.button,
                          transition: DESIGN_SYSTEM.transitions.fast,
                        }}
                      >
                        <item.icon
                          className="h-5 w-5 flex-shrink-0"
                          style={{ color: '#0152ef' }}
                        />
                      </button>
                    </Tooltip>
                  );
                }
                const isDisabled = !canAccessHref(item.href);

                if (isDisabled) {
                  return (
                    <Tooltip key={item.name} content="Please select a company first" position="right">
                      <button
                        type="button"
                        className={cn(
                          'group flex w-full items-center rounded-md px-3 py-2 text-sm font-normal transition-colors',
                          'opacity-50 cursor-not-allowed',
                          'text-gray-900 bg-transparent'
                        )}
                        style={{
                          borderRadius: DESIGN_SYSTEM.borderRadius.button,
                          transition: DESIGN_SYSTEM.transitions.fast,
                          color: '#111827',
                        }}
                        onClick={showCompanyRequiredMessage}
                      >
                        <item.icon
                          className="mr-3 h-5 w-5 flex-shrink-0"
                          style={{ color: '#0152ef' }}
                        />
                        {item.name}
                      </button>
                    </Tooltip>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    className={cn(
                      'group flex items-center rounded-md px-3 py-2 text-sm font-normal transition-colors',
                      'hover:bg-gray-100',
                      isActive
                        ? 'bg-vendor-500 text-gray-900 shadow-sm'
                        : 'text-gray-900 bg-transparent'
                    )}
                    style={{
                      borderRadius: DESIGN_SYSTEM.borderRadius.button,
                      transition: DESIGN_SYSTEM.transitions.fast,
                      color: isActive ? '#0152ef' : '#111827',
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon
                      className="mr-3 h-5 w-5 flex-shrink-0"
                      style={{ color: '#0152ef' }}
                    />
                    {item.name}
                  </Link>
                );
              }
            })}
          </nav>

          {/* User menu */}
          <div className={cn("border-t", isCollapsed ? "p-2" : "p-4")}>
            {isCollapsed ? (
              <Tooltip content="Sign Out" position="right">
                <button
                  className="group flex items-center justify-center w-full rounded-md p-2 text-sm font-normal transition-colors hover:bg-gray-100 bg-transparent"
                  style={{
                    borderRadius: DESIGN_SYSTEM.borderRadius.button,
                    transition: DESIGN_SYSTEM.transitions.fast,
                  }}
                  onClick={() => {
                    authService.logout();
                  }}
                >
                  <Power className="h-5 w-5 flex-shrink-0" style={{ color: '#0152ef' }} />
                </button>
              </Tooltip>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-center vms-button bg-gray-100 hover:bg-gray-200 hover:shadow-sm transition-all"
                onClick={() => {
                  authService.logout();
                }}
              >
                <Power className="mr-3 h-4 w-4" style={{ color: '#0152ef' }} />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Collapsed Sidebar Flyout Menu */}
      {isCollapsed && collapsedFlyout && (
        <div
          ref={flyoutRef}
          className="fixed z-50 bg-white border rounded-lg shadow-lg py-2 min-w-[200px]"
          style={{
            top: flyoutPosition.top,
            left: flyoutPosition.left,
          }}
        >
          {/* Find the parent menu item and render its children */}
          {filteredNavigation.map((item) => {
            if ((item as any).name === collapsedFlyout && (item as any).hasDropdown && (item as any).children) {
              return (
                <div key={item.name}>
                  {/* Header */}
                  <div className="px-3 py-2 text-sm font-medium text-gray-500 border-b mb-1">
                    {item.name}
                  </div>
                  {/* Child items */}
                  {item.children.map((child) => {
                    const isDisabled = !canAccessHref(child.href);
                    const isActive = pathname === child.href;
                    if (isDisabled) {
                      return (
                        <Tooltip key={child.name} content="Please select a company first" position="right">
                          <button
                            type="button"
                            className="flex w-full items-center px-3 py-2 text-sm text-gray-700 opacity-50 cursor-not-allowed"
                            onClick={showCompanyRequiredMessage}
                          >
                            <child.icon className="mr-3 h-4 w-4 flex-shrink-0" style={{ color: '#111827' }} />
                            {child.name}
                          </button>
                        </Tooltip>
                      );
                    }
                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          'flex items-center px-3 py-2 text-sm transition-colors',
                          'hover:bg-gray-100',
                          isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700'
                        )}
                        onClick={() => {
                          setCollapsedFlyout(null);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <child.icon
                          className="mr-3 h-4 w-4 flex-shrink-0"
                          style={{ color: isActive ? '#0152ef' : '#111827' }}
                        />
                        {child.name}
                      </Link>
                    );
                  })}
                </div>
              );
            }
            return null;
          })}
        </div>
      )}

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
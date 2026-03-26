"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { User, Bell, HelpCircle, LogOut, Power, FileQuestion, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth-service";
import { CompanySelector } from "@/components/layout/company-selector";

interface HeaderProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  onFlowDiagramClick?: () => void;
}

export function Header({ title, breadcrumbs, onFlowDiagramClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isDashboard = pathname === "/dashboard";
  const [user, setUser] = useState<{name?: string, loginId?: string, email?: string, role?: string} | null>(null);
  const [notificationCount, setNotificationCount] = useState(3);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const profileCardRef = useRef<HTMLDivElement>(null);
  const helpMenuRef = useRef<HTMLDivElement>(null);
  // TODO: read super-admin access from auth context when context wiring is available.
  const isSuperAdmin = !!user?.role?.toLowerCase().includes('admin');

  useEffect(() => {
    // Get user data from auth service
    const userData = authService.getUser();
    setUser(userData);
  }, []);

  // Close profile card when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileCardRef.current && !profileCardRef.current.contains(event.target as Node)) {
        setShowProfileCard(false);
      }
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target as Node)) {
        setShowHelpMenu(false);
      }
    };

    if (showProfileCard || showHelpMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileCard, showHelpMenu]);

  // Handle notification click
  const handleNotificationClick = () => {
    // Here you can add logic to show notifications panel or navigate to notifications page
    // For demo purposes, let's reduce the count when clicked
    if (notificationCount > 0) {
      setNotificationCount(prev => Math.max(0, prev - 1));
    }
  };

  // Get display name from user data
  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.loginId) return user.loginId;
    if (user?.email) return user.email.split('@')[0]; // Use email username part
    return 'User';
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex flex-col md:flex-column md:space-x-4">
          {/* Display welcome message only on dashboard */}
          {isDashboard && (
            <>
              <h3 className="cus-welcome-sec text-lg font-semibold" style={{ lineHeight: 1, fontSize: '1.2rem' }}>
                Welcome {getUserDisplayName()}!
              </h3>
              <p style={{ fontSize: '0.8rem', lineHeight: '1.3rem' }}>Here's what's happening with your business today.</p>
            </>
          )}
        </div>

        {/* Title and Breadcrumbs */}
        {/* <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          {title && (
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          )}
          {breadcrumbs && (
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span>/</span>}
                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-foreground">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
        </div> */}

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <CompanySelector variant="header" isSuperAdmin={isSuperAdmin} />

          {/* Help */}
          <div 
            className="relative flex-shrink-0" 
            ref={helpMenuRef}
            onMouseEnter={() => setShowHelpMenu(true)}
            onMouseLeave={() => setShowHelpMenu(false)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-gray-100 transition-colors"
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
            {/* Help Menu Dropdown */}
            {showHelpMenu && (
              <div className="absolute top-full right-0 mt-0 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-[100] overflow-hidden">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowHelpMenu(false);
                      router.push('/faq');
                    }}
                    className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-3 text-left"
                  >
                    <FileQuestion className="h-5 w-5" style={{ color: '#0152ef' }} />
                    <span>Frequently Asked Questions</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowHelpMenu(false);
                      onFlowDiagramClick?.();
                    }}
                    className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-3 text-left"
                  >
                    <GitBranch className="h-5 w-5" style={{ color: '#0152ef' }} />
                    <span>Application Flow Diagram</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative flex-shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-gray-100 transition-colors"
              onClick={handleNotificationClick}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Bell className="h-5 w-5" />
              {/* Notification badge - only show if there are notifications */}
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center animate-pulse">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Button>
            {/* Simple tooltip */}
            {showTooltip && (
              <div className="absolute top-full right-0 mt-2 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg whitespace-nowrap z-[100]">
                {`${notificationCount} unread notification${notificationCount !== 1 ? 's' : ''}`}
                <div className="absolute bottom-full right-2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900"></div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div 
            className="relative flex-shrink-0" 
            ref={profileCardRef}
            onMouseEnter={() => setShowProfileCard(true)}
            onMouseLeave={() => setShowProfileCard(false)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-gray-100 transition-colors"
              aria-label="Profile"
            >
              <User className="h-5 w-5" />
            </Button>
            {/* Profile Card */}
            {showProfileCard && (
              <div className="absolute top-full right-0 mt-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-[100] overflow-hidden">
                <div className="flex flex-col items-center p-4 border-b border-gray-100">
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-medium mb-2">
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-medium text-gray-900">Hi, {getUserDisplayName()}!</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowProfileCard(false);
                      router.push('/profile');
                    }}
                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-full border border-gray-300 transition-colors"
                  >
                    Manage your VMS Account
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileCard(false);
                      authService.logout();
                    }}
                    className="w-full mt-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-full border border-gray-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <Power className="h-4 w-4" style={{ color: '#0152ef' }} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

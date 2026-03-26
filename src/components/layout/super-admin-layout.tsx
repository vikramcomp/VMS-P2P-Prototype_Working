'use client';

import React from 'react';
import { SuperAdminSidebar, SIDEBAR_WIDTH, TOP_BAR_HEIGHT } from './super-admin-sidebar';
import { Shield } from 'lucide-react';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function SuperAdminLayout({ children, title }: SuperAdminLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <SuperAdminSidebar />

      {/* Content area offset by sidebar */}
      <div
        className="flex flex-1 flex-col overflow-hidden"
        style={{ marginLeft: SIDEBAR_WIDTH, width: `calc(100% - ${SIDEBAR_WIDTH})` }}
      >
        {/* Top bar */}
        <header
          className="shrink-0 flex items-center gap-3 px-6 shadow-sm z-30"
          style={{ height: TOP_BAR_HEIGHT, background: '#0A1628' }}
        >
          <Shield className="h-5 w-5 text-white/80" />
          <span className="text-white font-semibold text-base tracking-wide">
            Super Admin Panel
          </span>
          {title && (
            <>
              <span className="text-white/40 mx-1">/</span>
              <span className="text-white/80 text-sm">{title}</span>
            </>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { WelcomePopup } from '@/components/common/welcome-popup';
import { SidebarProvider, useSidebar } from './sidebar-context';
import { DESIGN_SYSTEM } from '@/utils/design-system';
import { useCompany } from '@/context/CompanyContext';
import { Building2 } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

function MainLayoutContent({ children, title, breadcrumbs }: MainLayoutProps) {
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const { isCollapsed } = useSidebar();
  const { activeCompany } = useCompany();

  const handleOpenFlowDiagram = () => {
    setShowWelcomePopup(true);
  };

  const handleCloseWelcomePopup = () => {
    setShowWelcomePopup(false);
  };

  const sidebarWidth = isCollapsed 
    ? DESIGN_SYSTEM.vmsConstants.sidebarCollapsedWidth 
    : DESIGN_SYSTEM.vmsConstants.sidebarWidth;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      {/* Add css like width: calc(100% - sidebarWidth); for removing window horizontal scrollbar */}
      <div 
        className="flex flex-1 flex-col cus-class-main-layout transition-all duration-300"
        style={{ 
          marginLeft: sidebarWidth,
          width: `calc(100% - ${sidebarWidth})` 
        }}
      >
        <Header title={title} breadcrumbs={breadcrumbs} onFlowDiagramClick={handleOpenFlowDiagram} />

        {activeCompany && (
          <div className="border-b border-border bg-muted/30 px-6 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 text-vendor-600" />
                <span className="font-medium text-foreground">{activeCompany.shortName}</span>
                <span>{activeCompany.code}</span>
              </div>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-xs text-vendor-600 hover:text-vendor-700 hover:underline"
              >
                {'\u21bb'} Refresh for {activeCompany.shortName} data
              </button>
            </div>
          </div>
        )}
        
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>

      {showWelcomePopup && <WelcomePopup onClose={handleCloseWelcomePopup} />}
    </div>
  );
}

export function MainLayout({ children, title, breadcrumbs }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <MainLayoutContent title={title} breadcrumbs={breadcrumbs}>
        {children}
      </MainLayoutContent>
    </SidebarProvider>
  );
}
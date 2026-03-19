'use client';

import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { WelcomePopup } from '@/components/common/welcome-popup';
import { SidebarProvider, useSidebar } from './sidebar-context';
import { DESIGN_SYSTEM } from '@/utils/design-system';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

function MainLayoutContent({ children, title, breadcrumbs }: MainLayoutProps) {
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const { isCollapsed } = useSidebar();

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
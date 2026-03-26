'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import {
  Building2,
  Users,
  Settings,
  ScrollText,
  ArrowLeft,
} from 'lucide-react';

const SIDEBAR_WIDTH = '240px';
const TOP_BAR_HEIGHT = '64px';

const superAdminNav = [
  { name: 'Companies', href: '/super-admin/companies', icon: Building2 },
  { name: 'System Users', href: '/super-admin/system-users', icon: Users },
  { name: 'Global Settings', href: '/super-admin/global-settings', icon: Settings },
  { name: 'Audit Logs', href: '/super-admin/audit-logs', icon: ScrollText },
];

export { SIDEBAR_WIDTH, TOP_BAR_HEIGHT };

export function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen flex flex-col"
      style={{ width: SIDEBAR_WIDTH, background: '#0A1628' }}
    >
      {/* Logo area */}
      <div
        className="flex items-center justify-center border-b border-white/10 shrink-0"
        style={{ height: TOP_BAR_HEIGHT }}
      >
        <Link href="/super-admin/companies" className="flex items-center gap-2">
          <Image
            src="/images/logos/mini-logo.png"
            alt="VMS"
            width={40}
            height={16}
            className="object-contain brightness-0 invert"
            priority
          />
          <span className="text-white text-sm font-semibold tracking-wide">
            Super Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
        {superAdminNav.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-normal transition-colors',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Back to main app */}
      <div className="shrink-0 px-3 py-4 border-t border-white/10">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Main App
        </Link>
      </div>
    </aside>
  );
}

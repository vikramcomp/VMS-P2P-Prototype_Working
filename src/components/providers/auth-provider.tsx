'use client';

import { ToastProvider } from '@/components/providers/toast-provider';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <>
      <ToastProvider />
      {children}
    </>
  );
}
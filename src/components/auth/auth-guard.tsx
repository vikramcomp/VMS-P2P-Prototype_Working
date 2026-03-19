'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/auth-service';

interface AuthGuardProps {
  children: React.ReactNode;
  isTesting?: boolean;
}

const publicRoutes = new Set(['/login', '/register', '/forgot-password', '/toast-demo', '/validation-demo', '/auth-test', '/auth-debug']);

export function AuthGuard({ children, isTesting = false }: Readonly<AuthGuardProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Allow access to public routes
      if (publicRoutes.has(pathname)) {
        setIsLoading(false);
        return;
      }

      const token = authService.getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Validate token with backend
      const isValid = await authService.validateToken();
      
      if (isValid) {
        setIsAuthenticated(true);
      } else {
        router.push('/login');
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100" data-testid="auth-guard-loading">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" data-testid="loading-spinner"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // For public routes, always render children
  if (publicRoutes.has(pathname)) {
    return <div data-testid="auth-guard-public">{children}</div>;
  }

  // For protected routes, only render if authenticated
  if (isAuthenticated) {
    return <div data-testid="auth-guard-authenticated">{children}</div>;
  }

  // This should not be reached due to redirects, but just in case
  return null;
}
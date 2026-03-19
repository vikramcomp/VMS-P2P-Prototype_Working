'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth-service';

interface HomeProps {
  isTesting?: boolean;
}

export default function Home({ isTesting = false }: HomeProps = {}) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (authService.isAuthenticated()) {
      // If authenticated, redirect to dashboard
      router.push('/dashboard');
    } else {
      // If not authenticated, redirect to login
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100" data-testid="home-page">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" data-testid="loading-spinner"></div>
        <h1 className="text-2xl font-bold text-gray-800">Loading VMS...</h1>
        <p className="text-gray-600 mt-2">Checking authentication status</p>
      </div>
    </div>
  );
}

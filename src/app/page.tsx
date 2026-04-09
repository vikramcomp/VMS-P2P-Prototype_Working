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
    console.log('Home: Checking authentication status...');
    
    // Set a maximum timeout of 3 seconds to force redirection
    const timeoutId = setTimeout(() => {
      console.warn('Home: Auth check timed out, redirecting to login as fallback');
      router.push('/login');
    }, 3000);

    try {
      // Check if user is authenticated
      if (authService.isAuthenticated()) {
        console.log('Home: User is authenticated, redirecting to dashboard');
        clearTimeout(timeoutId);
        router.push('/dashboard');
      } else {
        console.log('Home: User is not authenticated, redirecting to login');
        clearTimeout(timeoutId);
        router.push('/login');
      }
    } catch (error) {
      console.error('Home: Error checking authentication', error);
      clearTimeout(timeoutId);
      router.push('/login');
    }

    return () => clearTimeout(timeoutId);
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

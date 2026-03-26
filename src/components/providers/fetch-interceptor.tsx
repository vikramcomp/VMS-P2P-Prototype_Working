'use client';

import { useEffect } from 'react';

// Known external domains to exclude from auth token injection
const EXCLUDED_DOMAINS = [
  'cdn.',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'unpkg.com',
  'cdnjs.cloudflare.com',
  'google.com',
  'googleapis.com',
  'gstatic.com',
  'facebook.com',
  'twitter.com',
  'linkedin.com',
];

/**
 * Check if a URL should receive auth token
 * Uses an inclusive approach: inject auth for all API-like requests
 */
const shouldInjectAuth = (url: string): boolean => {
  // Skip data URLs, blob URLs, etc.
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('javascript:')) {
    return false;
  }

  // Skip static assets
  const staticExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.css', '.woff', '.woff2', '.ttf', '.eot'];
  const urlLower = url.toLowerCase();
  for (const ext of staticExtensions) {
    if (urlLower.includes(ext)) {
      return false;
    }
  }

  // Check if URL is from excluded external domains
  for (const domain of EXCLUDED_DOMAINS) {
    if (url.includes(domain)) {
      return false;
    }
  }

  // Get the API base URL
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  
  // Always inject for URLs starting with API base URL
  if (apiBaseUrl && url.startsWith(apiBaseUrl)) {
    return true;
  }

  // For relative URLs or same-origin requests, inject auth
  // Check if it's a relative URL (starts with /)
  if (url.startsWith('/')) {
    return true;
  }

  // Check if it's same origin
  if (typeof window !== 'undefined') {
    try {
      const urlObj = new URL(url);
      const currentOrigin = window.location.origin;
      
      // Same origin - inject auth
      if (urlObj.origin === currentOrigin) {
        return true;
      }
      
      // Check if URL hostname matches API base URL hostname
      if (apiBaseUrl) {
        const apiUrlObj = new URL(apiBaseUrl);
        if (urlObj.hostname === apiUrlObj.hostname) {
          return true;
        }
      }
    } catch {
      // If URL parsing fails, it might be a relative URL - inject auth
      return true;
    }
  }

  return false;
};

// Auth token key - must match authService.TOKEN_KEY
const AUTH_TOKEN_KEY = 'vms_auth_token';

/**
 * Global fetch interceptor that automatically adds authentication token
 * to all API requests without requiring code changes from fetch to authFetch
 */
export function FetchInterceptorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Store the original fetch
    const originalFetch = window.fetch;

    // Override global fetch
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      
      if (shouldInjectAuth(url)) {
        // Get auth token
        const token = localStorage.getItem(AUTH_TOKEN_KEY);

        // Merge headers
        const headers = new Headers(init?.headers);

        const method = (init?.method || (typeof input !== 'string' && !(input instanceof URL) ? input.method : 'GET')).toUpperCase();
        const hasBody = init?.body !== undefined && init?.body !== null;
        const isMethodWithBody = method !== 'GET' && method !== 'HEAD';

        // Only set Content-Type when a request can contain a body.
        // Adding it to GET requests can trigger unnecessary preflight checks.
        const isFormData = init?.body instanceof FormData;
        if (!headers.has('Content-Type') && hasBody && isMethodWithBody && !isFormData) {
          headers.set('Content-Type', 'application/json');
        }

        // Set accept header if not provided
        if (!headers.has('Accept')) {
          headers.set('Accept', 'application/json');
        }

        // Add auth token if available
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }

        // Call original fetch with modified headers
        const response = await originalFetch(input, {
          ...init,
          headers,
        });

        // Handle 401 unauthorized - redirect to login
        if (response.status === 401) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          window.location.href = '/login';
        }

        return response;
      }

      // For non-API calls, use original fetch
      return originalFetch(input, init);
    };

    // Cleanup: restore original fetch on unmount
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <>{children}</>;
}

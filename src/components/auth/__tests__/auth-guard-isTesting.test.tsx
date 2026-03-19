import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthGuard } from '../auth-guard';

// Mock next/navigation
const mockPush = jest.fn();
const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockUsePathname(),
}));

// Mock authService
const mockGetToken = jest.fn();
const mockValidateToken = jest.fn();
jest.mock('@/services/auth-service', () => ({
  authService: {
    getToken: () => mockGetToken(),
    validateToken: () => mockValidateToken(),
  },
}));

describe('AuthGuard - isTesting prop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isTesting=true', () => {
    it('should render with isTesting=true on public route', async () => {
      mockUsePathname.mockReturnValue('/login');
      
      render(
        <AuthGuard isTesting={true}>
          <div data-testid="child-content">Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-guard-public')).toBeInTheDocument();
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
      });
    });

    it('should render with isTesting=true on protected route with valid token', async () => {
      mockUsePathname.mockReturnValue('/dashboard');
      mockGetToken.mockReturnValue('valid-token');
      mockValidateToken.mockResolvedValue(true);
      
      render(
        <AuthGuard isTesting={true}>
          <div data-testid="child-content">Dashboard</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-guard-authenticated')).toBeInTheDocument();
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
      });
    });
  });

  describe('isTesting=false', () => {
    it('should render with isTesting=false on public route', async () => {
      mockUsePathname.mockReturnValue('/login');
      
      render(
        <AuthGuard isTesting={false}>
          <div data-testid="child-content">Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-guard-public')).toBeInTheDocument();
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
      });
    });

    it('should render with isTesting=false on protected route with valid token', async () => {
      mockUsePathname.mockReturnValue('/dashboard');
      mockGetToken.mockReturnValue('valid-token');
      mockValidateToken.mockResolvedValue(true);
      
      render(
        <AuthGuard isTesting={false}>
          <div data-testid="child-content">Dashboard</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-guard-authenticated')).toBeInTheDocument();
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
      });
    });
  });

  describe('Default behavior', () => {
    it('should render without isTesting prop on public route', async () => {
      mockUsePathname.mockReturnValue('/login');
      
      render(
        <AuthGuard>
          <div data-testid="child-content">Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-guard-public')).toBeInTheDocument();
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
      });
    });

    it('should render without isTesting prop on protected route with valid token', async () => {
      mockUsePathname.mockReturnValue('/dashboard');
      mockGetToken.mockReturnValue('valid-token');
      mockValidateToken.mockResolvedValue(true);
      
      render(
        <AuthGuard>
          <div data-testid="child-content">Dashboard</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-guard-authenticated')).toBeInTheDocument();
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
      });
    });
  });
});

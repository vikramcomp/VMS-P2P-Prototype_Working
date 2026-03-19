import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../page';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock authService
const mockIsAuthenticated = jest.fn();
jest.mock('@/services/auth-service', () => ({
  authService: {
    isAuthenticated: () => mockIsAuthenticated(),
  },
}));

describe('Home Page - isTesting prop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isTesting=true', () => {
    it('should render with isTesting=true', () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Home isTesting={true} />);
      
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
      expect(screen.getByText('Loading VMS...')).toBeInTheDocument();
    });

    it('should render loading spinner with isTesting=true', () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Home isTesting={true} />);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should render all text elements with isTesting=true', () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Home isTesting={true} />);
      
      expect(screen.getByText('Loading VMS...')).toBeInTheDocument();
      expect(screen.getByText('Checking authentication status')).toBeInTheDocument();
    });
  });

  describe('isTesting=false', () => {
    it('should render with isTesting=false', () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Home isTesting={false} />);
      
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
      expect(screen.getByText('Loading VMS...')).toBeInTheDocument();
    });

    it('should render loading spinner with isTesting=false', () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Home isTesting={false} />);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should render all text elements with isTesting=false', () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Home isTesting={false} />);
      
      expect(screen.getByText('Loading VMS...')).toBeInTheDocument();
      expect(screen.getByText('Checking authentication status')).toBeInTheDocument();
    });
  });

  describe('Default behavior', () => {
    it('should render without isTesting prop', () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Home />);
      
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
      expect(screen.getByText('Loading VMS...')).toBeInTheDocument();
    });

    it('should render loading spinner without isTesting prop', () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Home />);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should render all text elements without isTesting prop', () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Home />);
      
      expect(screen.getByText('Loading VMS...')).toBeInTheDocument();
      expect(screen.getByText('Checking authentication status')).toBeInTheDocument();
    });
  });
});

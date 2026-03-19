import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the dependencies
jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="main-layout">{children}</div>
}));

jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div data-testid="protected-route">{children}</div>
}));

jest.mock('@/components/quotations', () => {
  const MockQuotationsContent = () => <div data-testid="quotations-content">Quotations Content</div>;
  return MockQuotationsContent;
});

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    const Component = () => <div data-testid="quotations-content">Quotations Content</div>;
    return Component;
  },
}));

// Import after mocks
import ManageQuotationsPage from '../page';

describe('ManageQuotationsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page component', () => {
    render(<ManageQuotationsPage />);
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
  });

  it('wraps content in ProtectedRoute', () => {
    render(<ManageQuotationsPage />);
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
  });

  it('wraps content in MainLayout', () => {
    render(<ManageQuotationsPage />);
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
  });

  it('renders QuotationsContent component', async () => {
    render(<ManageQuotationsPage />);
    await waitFor(() => {
      expect(screen.getByTestId('quotations-content')).toBeInTheDocument();
    });
  });

  it('has correct component structure', () => {
    const { container } = render(<ManageQuotationsPage />);
    const protectedRoute = container.querySelector('[data-testid="protected-route"]');
    const mainLayout = container.querySelector('[data-testid="main-layout"]');
    const quotationsContent = container.querySelector('[data-testid="quotations-content"]');
    
    expect(protectedRoute).toBeInTheDocument();
    expect(mainLayout).toBeInTheDocument();
    expect(quotationsContent).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    expect(() => render(<ManageQuotationsPage />)).not.toThrow();
  });

  it('page component is defined', () => {
    expect(ManageQuotationsPage).toBeDefined();
  });

  it('renders all nested components', () => {
    render(<ManageQuotationsPage />);
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    expect(screen.getByTestId('quotations-content')).toBeInTheDocument();
  });

  it('should have correct component hierarchy', () => {
    const { container } = render(<ManageQuotationsPage />);
    const protectedRoute = container.firstChild;
    expect(protectedRoute).toHaveAttribute('data-testid', 'protected-route');
  });

  it('component structure is valid', () => {
    expect(() => {
      const { unmount } = render(<ManageQuotationsPage />);
      unmount();
    }).not.toThrow();
  });

  it('renders with proper nesting order', () => {
    const { container } = render(<ManageQuotationsPage />);
    const protectedRoute = screen.getByTestId('protected-route');
    const mainLayout = screen.getByTestId('main-layout');
    
    expect(protectedRoute).toContainElement(mainLayout);
    expect(mainLayout).toContainElement(screen.getByTestId('quotations-content'));
  });
});

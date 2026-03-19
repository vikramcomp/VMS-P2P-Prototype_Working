import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import OutsourcingReportPage from '../page';

// Mock next/dynamic
jest.mock('next/dynamic', () => {
  return (importFn: any, options: any) => {
    const DynamicComponent = ({ ...props }: any) => {
      return <div data-testid="outsourcing-report-content">Outsourcing Report Content</div>;
    };
    DynamicComponent.displayName = 'OutsourcingReportContent';
    return DynamicComponent;
  };
});

// Mock the components
jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: any) => <div data-testid="main-layout">{children}</div>,
}));

jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: any) => <div data-testid="protected-route">{children}</div>,
}));

describe('OutsourcingReportPage', () => {
  it('renders without crashing', () => {
    render(<OutsourcingReportPage />);
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
  });

  it('renders within ProtectedRoute', () => {
    render(<OutsourcingReportPage />);
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
  });

  it('renders MainLayout', () => {
    render(<OutsourcingReportPage />);
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
  });

  it('renders OutsourcingReportContent component', () => {
    render(<OutsourcingReportPage />);
    expect(screen.getByTestId('outsourcing-report-content')).toBeInTheDocument();
  });

  it('has correct component hierarchy', () => {
    const { container } = render(<OutsourcingReportPage />);
    const protectedRoute = screen.getByTestId('protected-route');
    const mainLayout = screen.getByTestId('main-layout');
    const content = screen.getByTestId('outsourcing-report-content');

    expect(protectedRoute).toContainElement(mainLayout);
    expect(mainLayout).toContainElement(content);
  });

  it('displays outsourcing report content', () => {
    render(<OutsourcingReportPage />);
    expect(screen.getByText('Outsourcing Report Content')).toBeInTheDocument();
  });

  it('loads content dynamically', () => {
    // The component uses next/dynamic with ssr: false
    render(<OutsourcingReportPage />);
    // Verify the dynamic component is rendered
    expect(screen.getByTestId('outsourcing-report-content')).toBeInTheDocument();
  });
});

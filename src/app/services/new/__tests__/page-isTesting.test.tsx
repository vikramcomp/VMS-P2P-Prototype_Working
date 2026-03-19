import React from 'react';
import { render, screen } from '@testing-library/react';
import AddNewServicePage from '../page';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock useToast
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock servicesService
const mockAddService = jest.fn();
jest.mock('@/services/services-service', () => ({
  servicesService: {
    addService: (...args: any[]) => mockAddService(...args),
  },
}));

// Mock components
jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: any) => <div data-testid="protected-route">{children}</div>,
}));

jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: any) => <div data-testid="main-layout">{children}</div>,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardTitle: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardDescription: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, disabled, className, style, ...props }: any) => (
    <button 
      onClick={onClick} 
      type={type} 
      disabled={disabled} 
      className={className}
      style={style}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children, content }: any) => <div title={content}>{children}</div>,
}));

jest.mock('lucide-react', () => ({
  ArrowLeft: () => <svg data-testid="arrow-left-icon" />,
  Save: () => <svg data-testid="save-icon" />,
  RotateCcw: () => <svg data-testid="rotate-icon" />,
  Loader2: ({ className }: any) => <svg data-testid="loader-icon" className={className} />,
}));

describe('AddNewServicePage - isTesting prop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isTesting=true', () => {
    it('should render with isTesting=true', () => {
      render(<AddNewServicePage isTesting={true} />);
      expect(screen.getByTestId('add-new-service-page')).toBeInTheDocument();
      expect(screen.getByTestId('add-service-form')).toBeInTheDocument();
    });

    it('should render all form inputs with isTesting=true', () => {
      render(<AddNewServicePage isTesting={true} />);
      expect(screen.getByTestId('service-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('max-amount-input')).toBeInTheDocument();
      expect(screen.getByTestId('description-input')).toBeInTheDocument();
    });

    it('should render all buttons with isTesting=true', () => {
      render(<AddNewServicePage isTesting={true} />);
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
      expect(screen.getByTestId('reset-button')).toBeInTheDocument();
    });
  });

  describe('isTesting=false', () => {
    it('should render with isTesting=false', () => {
      render(<AddNewServicePage isTesting={false} />);
      expect(screen.getByTestId('add-new-service-page')).toBeInTheDocument();
      expect(screen.getByTestId('add-service-form')).toBeInTheDocument();
    });

    it('should render all form inputs with isTesting=false', () => {
      render(<AddNewServicePage isTesting={false} />);
      expect(screen.getByTestId('service-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('max-amount-input')).toBeInTheDocument();
      expect(screen.getByTestId('description-input')).toBeInTheDocument();
    });

    it('should render all buttons with isTesting=false', () => {
      render(<AddNewServicePage isTesting={false} />);
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
      expect(screen.getByTestId('reset-button')).toBeInTheDocument();
    });
  });

  describe('Default behavior', () => {
    it('should render without isTesting prop', () => {
      render(<AddNewServicePage />);
      expect(screen.getByTestId('add-new-service-page')).toBeInTheDocument();
      expect(screen.getByTestId('add-service-form')).toBeInTheDocument();
    });

    it('should render all form inputs without isTesting prop', () => {
      render(<AddNewServicePage />);
      expect(screen.getByTestId('service-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('max-amount-input')).toBeInTheDocument();
      expect(screen.getByTestId('description-input')).toBeInTheDocument();
    });

    it('should render all buttons without isTesting prop', () => {
      render(<AddNewServicePage />);
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
      expect(screen.getByTestId('reset-button')).toBeInTheDocument();
    });
  });
});

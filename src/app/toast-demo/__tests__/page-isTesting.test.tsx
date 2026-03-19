import React from 'react';
import { render, screen } from '@testing-library/react';
import ToastDemoPage from '../page';

// Mock useToast hook
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant, ...props }: any) => (
    <button onClick={onClick} className={className} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}));

describe('ToastDemoPage - isTesting prop', () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  it('should handle isTesting prop set to true and call all toast functions', () => {
    render(<ToastDemoPage isTesting={true} />);
    expect(screen.getByTestId('toast-demo-page')).toBeInTheDocument();
    
    // Should call toast 4 times (success, error, warning, info)
    expect(mockToast).toHaveBeenCalledTimes(4);
    
    // Check all toast variants were called
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'success' }));
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' }));
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'warning' }));
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'default' }));
  });

  it('should handle isTesting prop set to false', () => {
    render(<ToastDemoPage isTesting={false} />);
    expect(screen.getByTestId('toast-demo-page')).toBeInTheDocument();
    
    // Should not call toast when isTesting is false
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should handle missing isTesting prop', () => {
    render(<ToastDemoPage />);
    expect(screen.getByTestId('toast-demo-page')).toBeInTheDocument();
    
    // Should not call toast when isTesting is undefined
    expect(mockToast).not.toHaveBeenCalled();
  });
});

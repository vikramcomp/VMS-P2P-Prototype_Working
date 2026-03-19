import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('AddNewServicePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<AddNewServicePage />);
      expect(screen.getByTestId('add-new-service-page')).toBeInTheDocument();
    });

    it('should render within ProtectedRoute', () => {
      render(<AddNewServicePage />);
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should render within MainLayout', () => {
      render(<AddNewServicePage />);
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    it('should render page title', () => {
      render(<AddNewServicePage />);
      expect(screen.getByText('Add New Service')).toBeInTheDocument();
    });

    it('should render page description', () => {
      render(<AddNewServicePage />);
      expect(screen.getByText('Create a new service in your system')).toBeInTheDocument();
    });

    it('should render back button', () => {
      render(<AddNewServicePage />);
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });

    it('should render form', () => {
      render(<AddNewServicePage />);
      expect(screen.getByTestId('add-service-form')).toBeInTheDocument();
    });

    it('should render service name input', () => {
      render(<AddNewServicePage />);
      expect(screen.getByTestId('service-name-input')).toBeInTheDocument();
    });

    it('should render max amount input', () => {
      render(<AddNewServicePage />);
      expect(screen.getByTestId('max-amount-input')).toBeInTheDocument();
    });

    it('should render description input', () => {
      render(<AddNewServicePage />);
      expect(screen.getByTestId('description-input')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<AddNewServicePage />);
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('should render reset button', () => {
      render(<AddNewServicePage />);
      expect(screen.getByTestId('reset-button')).toBeInTheDocument();
    });
  });

  describe('Form Input', () => {
    it('should update service name on input change', () => {
      render(<AddNewServicePage />);
      const input = screen.getByTestId('service-name-input') as HTMLInputElement;
      
      fireEvent.change(input, { target: { value: 'Test Service' } });
      
      expect(input.value).toBe('Test Service');
    });

    it('should update max amount on input change', () => {
      render(<AddNewServicePage />);
      const input = screen.getByTestId('max-amount-input') as HTMLInputElement;
      
      fireEvent.change(input, { target: { value: '1000' } });
      
      expect(input.value).toBe('1000');
    });

    it('should update description on input change', () => {
      render(<AddNewServicePage />);
      const input = screen.getByTestId('description-input') as HTMLTextAreaElement;
      
      fireEvent.change(input, { target: { value: 'Test Description' } });
      
      expect(input.value).toBe('Test Description');
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when form is invalid', () => {
      render(<AddNewServicePage />);
      const submitButton = screen.getByTestId('submit-button');
      
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when form is valid', () => {
      render(<AddNewServicePage />);
      
      fireEvent.change(screen.getByTestId('service-name-input'), { target: { value: 'Test Service' } });
      fireEvent.change(screen.getByTestId('max-amount-input'), { target: { value: '1000' } });
      fireEvent.change(screen.getByTestId('description-input'), { target: { value: 'Test Description' } });
      
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).not.toBeDisabled();
    });

    it('should show validation error on blur for empty service name', () => {
      render(<AddNewServicePage />);
      const input = screen.getByTestId('service-name-input');
      
      fireEvent.blur(input);
      
      expect(screen.getByText('Service name is required')).toBeInTheDocument();
    });

    it('should show validation error on blur for empty max amount', () => {
      render(<AddNewServicePage />);
      const input = screen.getByTestId('max-amount-input');
      
      fireEvent.blur(input);
      
      expect(screen.getByText('Valid max amount is required')).toBeInTheDocument();
    });

    it('should show validation error on blur for empty description', () => {
      render(<AddNewServicePage />);
      const input = screen.getByTestId('description-input');
      
      fireEvent.blur(input);
      
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });

    it('should show success indicator for valid service name', () => {
      render(<AddNewServicePage />);
      const input = screen.getByTestId('service-name-input');
      
      fireEvent.change(input, { target: { value: 'Valid Service' } });
      
      expect(screen.getByText('✓ Valid service name')).toBeInTheDocument();
    });

    it('should show success indicator for valid max amount', () => {
      render(<AddNewServicePage />);
      const input = screen.getByTestId('max-amount-input');
      
      fireEvent.change(input, { target: { value: '500' } });
      
      expect(screen.getByText('✓ Valid amount')).toBeInTheDocument();
    });

    it('should show success indicator for valid description', () => {
      render(<AddNewServicePage />);
      const input = screen.getByTestId('description-input');
      
      fireEvent.change(input, { target: { value: 'Valid Description' } });
      
      expect(screen.getByText('✓ Valid description')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call addService with correct data on submit', async () => {
      mockAddService.mockResolvedValue({ success: true });
      
      render(<AddNewServicePage />);
      
      fireEvent.change(screen.getByTestId('service-name-input'), { target: { value: 'Test Service' } });
      fireEvent.change(screen.getByTestId('max-amount-input'), { target: { value: '1000' } });
      fireEvent.change(screen.getByTestId('description-input'), { target: { value: 'Test Description' } });
      
      fireEvent.submit(screen.getByTestId('add-service-form'));
      
      await waitFor(() => {
        expect(mockAddService).toHaveBeenCalledWith({
          VendorMgrServiceId: null,
          ServiceName: 'Test Service',
          Description: 'Test Description',
          MaxAmount: 1000,
        });
      });
    });

    it('should show success toast on successful submission', async () => {
      mockAddService.mockResolvedValue({ success: true });
      
      render(<AddNewServicePage />);
      
      fireEvent.change(screen.getByTestId('service-name-input'), { target: { value: 'Test Service' } });
      fireEvent.change(screen.getByTestId('max-amount-input'), { target: { value: '1000' } });
      fireEvent.change(screen.getByTestId('description-input'), { target: { value: 'Test Description' } });
      
      fireEvent.submit(screen.getByTestId('add-service-form'));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Success',
            description: 'Service created successfully!',
            variant: 'success',
          })
        );
      });
    });

    it('should redirect to services page on success', async () => {
      mockAddService.mockResolvedValue({ success: true });
      
      render(<AddNewServicePage />);
      
      fireEvent.change(screen.getByTestId('service-name-input'), { target: { value: 'Test Service' } });
      fireEvent.change(screen.getByTestId('max-amount-input'), { target: { value: '1000' } });
      fireEvent.change(screen.getByTestId('description-input'), { target: { value: 'Test Description' } });
      
      fireEvent.submit(screen.getByTestId('add-service-form'));
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/services');
      });
    });

    it('should show error toast on API failure', async () => {
      mockAddService.mockResolvedValue({ success: false, message: 'Failed to create service' });
      
      render(<AddNewServicePage />);
      
      fireEvent.change(screen.getByTestId('service-name-input'), { target: { value: 'Test Service' } });
      fireEvent.change(screen.getByTestId('max-amount-input'), { target: { value: '1000' } });
      fireEvent.change(screen.getByTestId('description-input'), { target: { value: 'Test Description' } });
      
      fireEvent.submit(screen.getByTestId('add-service-form'));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: 'Failed to create service',
            variant: 'destructive',
          })
        );
      });
    });

    it('should show error toast on network error', async () => {
      mockAddService.mockRejectedValue(new Error('Network error'));
      
      render(<AddNewServicePage />);
      
      fireEvent.change(screen.getByTestId('service-name-input'), { target: { value: 'Test Service' } });
      fireEvent.change(screen.getByTestId('max-amount-input'), { target: { value: '1000' } });
      fireEvent.change(screen.getByTestId('description-input'), { target: { value: 'Test Description' } });
      
      fireEvent.submit(screen.getByTestId('add-service-form'));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: 'An unexpected error occurred. Please try again.',
            variant: 'destructive',
          })
        );
      });
    });

    it('should show validation error toast when submitting invalid form', async () => {
      render(<AddNewServicePage />);
      
      fireEvent.submit(screen.getByTestId('add-service-form'));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Validation Error',
            description: 'Please fill in all required fields correctly.',
            variant: 'destructive',
          })
        );
      });
    });
  });

  describe('Reset Functionality', () => {
    it('should reset form on reset button click', () => {
      render(<AddNewServicePage />);
      
      fireEvent.change(screen.getByTestId('service-name-input'), { target: { value: 'Test Service' } });
      fireEvent.change(screen.getByTestId('max-amount-input'), { target: { value: '1000' } });
      fireEvent.change(screen.getByTestId('description-input'), { target: { value: 'Test Description' } });
      
      fireEvent.click(screen.getByTestId('reset-button'));
      
      expect((screen.getByTestId('service-name-input') as HTMLInputElement).value).toBe('');
      expect((screen.getByTestId('max-amount-input') as HTMLInputElement).value).toBe('');
      expect((screen.getByTestId('description-input') as HTMLTextAreaElement).value).toBe('');
    });

    it('should show toast on reset', () => {
      render(<AddNewServicePage />);
      
      fireEvent.click(screen.getByTestId('reset-button'));
      
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Form Reset',
          description: 'All fields have been cleared',
          variant: 'default',
        })
      );
    });
  });

  describe('Cancel Functionality', () => {
    it('should navigate to services page on back button click', () => {
      render(<AddNewServicePage />);
      
      fireEvent.click(screen.getByTestId('back-button'));
      
      expect(mockPush).toHaveBeenCalledWith('/services');
    });
  });

  describe('Props Handling', () => {
    it('should accept isTesting prop as false', () => {
      render(<AddNewServicePage isTesting={false} />);
      expect(screen.getByTestId('add-new-service-page')).toBeInTheDocument();
    });

    it('should accept isTesting prop as true', () => {
      render(<AddNewServicePage isTesting={true} />);
      expect(screen.getByTestId('add-new-service-page')).toBeInTheDocument();
    });

    it('should work without isTesting prop', () => {
      render(<AddNewServicePage />);
      expect(screen.getByTestId('add-new-service-page')).toBeInTheDocument();
    });
  });

  describe('Existence Tests', () => {
    it('should be defined', () => {
      expect(AddNewServicePage).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof AddNewServicePage).toBe('function');
    });
  });
});

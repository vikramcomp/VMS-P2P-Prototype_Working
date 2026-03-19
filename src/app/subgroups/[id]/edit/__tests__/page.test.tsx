import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditSubgroupPage from '../page';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { subgroupsService } from '@/services/subgroups-service';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// Mock useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock subgroups-service
jest.mock('@/services/subgroups-service', () => ({
  subgroupsService: {
    getSubgroupById: jest.fn(),
    updateSubgroup: jest.fn(),
  },
}));

// Mock components
jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="main-layout">{children}</div>,
}));

jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div data-testid="protected-route">{children}</div>,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, disabled, className, variant, size, style }: any) => (
    <button onClick={onClick} type={type} disabled={disabled} className={className} style={style}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('EditSubgroupPage', () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();
  const mockSubgroup = {
    SubgroupId: 1,
    SubgroupName: 'Test Subgroup',
    SubgroupDescription: 'Test Description',
    Status: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useParams as jest.Mock).mockReturnValue({
      id: '1',
    });
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });
    (subgroupsService.getSubgroupById as jest.Mock).mockResolvedValue({
      IsSuccess: true,
      Data: mockSubgroup,
    });
  });

  describe('Loading and Rendering', () => {
    it('should display loading state initially', () => {
      render(<EditSubgroupPage />);
      
      expect(screen.getByText(/Loading subgroup data.../i)).toBeInTheDocument();
    });

    it('should load and display subgroup data', async () => {
      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Subgroup')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
      });
    });

    it('should render all form fields', async () => {
      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter subgroup name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter subgroup description/i)).toBeInTheDocument();
      });
    });

    it('should render action buttons', async () => {
      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Update Subgroup/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Discard Changes/i })).toBeInTheDocument();
      });
    });

    it('should render status dropdown with options', async () => {
      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        const statusSelect = screen.getByDisplayValue(/Active/i);
        expect(statusSelect).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when no changes are made', async () => {
      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Update Subgroup/i });
        expect(submitButton).toBeDisabled();
      });
    });

    it('should enable submit button when valid changes are made', async () => {
      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter subgroup name/i);
        fireEvent.change(nameInput, { target: { value: 'Updated Subgroup' } });
      });

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Update Subgroup/i });
        expect(submitButton).toBeEnabled();
      });
    });

    it('should show validation error for empty subgroup name', async () => {
      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter subgroup name/i);
        fireEvent.change(nameInput, { target: { value: '' } });
        fireEvent.blur(nameInput);
      });

      await waitFor(() => {
        expect(screen.getByText(/Subgroup name is required/i)).toBeInTheDocument();
      });
    });

    it('should show success indicator for valid subgroup name', async () => {
      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/✓ Valid subgroup name/i)).toBeInTheDocument();
      });
    });
  });

  describe('Change Detection', () => {
    it('should show unsaved changes indicator when form is modified', async () => {
      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter subgroup name/i);
        fireEvent.change(nameInput, { target: { value: 'Modified Subgroup' } });
      });

      await waitFor(() => {
        expect(screen.getByText(/You have unsaved changes/i)).toBeInTheDocument();
      });
    });

    it('should not show unsaved changes indicator initially', async () => {
      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        expect(screen.queryByText(/You have unsaved changes/i)).not.toBeInTheDocument();
      });
    });

    it('should enable discard button when changes are made', async () => {
      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter subgroup name/i);
        fireEvent.change(nameInput, { target: { value: 'Modified Subgroup' } });
      });

      await waitFor(() => {
        const discardButton = screen.getByRole('button', { name: /Discard Changes/i });
        expect(discardButton).toBeEnabled();
      });
    });
  });

  describe('Form Submission', () => {
    it('should prevent submission without changes', async () => {
      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter subgroup name/i)).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /Update Subgroup/i });
      fireEvent.click(submitButton);

      expect(subgroupsService.updateSubgroup).not.toHaveBeenCalled();
    });
  });

  describe('Discard Functionality', () => {
    it('should reset form to original values', async () => {
      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter subgroup name/i);
        fireEvent.change(nameInput, { target: { value: 'Modified Subgroup' } });
      });

      const discardButton = screen.getByRole('button', { name: /Discard Changes/i });
      fireEvent.click(discardButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Subgroup')).toBeInTheDocument();
      });
    });

    it('should show discard confirmation toast', async () => {
      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter subgroup name/i);
        fireEvent.change(nameInput, { target: { value: 'Modified Subgroup' } });
      });

      const discardButton = screen.getByRole('button', { name: /Discard Changes/i });
      fireEvent.click(discardButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Changes Discarded",
          description: "All changes have been reverted to original values",
          variant: "default",
        });
      });
    });

    it('should disable discard button when no changes', async () => {
      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        const discardButton = screen.getByRole('button', { name: /Discard Changes/i });
        expect(discardButton).toBeDisabled();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back to subgroups page on cancel', async () => {
      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const backButton = buttons[0]; // First button is the back button
        fireEvent.click(backButton);
      });

      expect(mockPush).toHaveBeenCalledWith('/subgroups');
    });
  });

  describe('Error Handling', () => {
    it('should handle API error when loading subgroup', async () => {
      (subgroupsService.getSubgroupById as jest.Mock).mockResolvedValue({
        IsSuccess: false,
        Message: 'Subgroup not found',
      });

      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Warning",
            variant: "destructive",
          })
        );
      });
    });

    it('should handle exception when loading subgroup', async () => {
      (subgroupsService.getSubgroupById as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Warning",
            variant: "destructive",
          })
        );
      });
    });



    it('should handle missing subgroup ID', async () => {
      (useParams as jest.Mock).mockReturnValue({
        id: undefined,
      });

      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        expect(subgroupsService.getSubgroupById).not.toHaveBeenCalled();
      });
    });

    it('should handle invalid subgroup ID', async () => {
      (useParams as jest.Mock).mockReturnValue({
        id: 'invalid',
      });

      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        expect(subgroupsService.getSubgroupById).not.toHaveBeenCalled();
      });
    });
  });

  describe('Input Handling', () => {
    it('should update form data when inputs change', async () => {
      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter subgroup name/i);
        const descInput = screen.getByPlaceholderText(/Enter subgroup description/i);

        fireEvent.change(nameInput, { target: { value: 'New Name' } });
        fireEvent.change(descInput, { target: { value: 'New Description' } });
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('New Name')).toBeInTheDocument();
        expect(screen.getByDisplayValue('New Description')).toBeInTheDocument();
      });
    });


  });



  describe('Touch State', () => {
    it('should mark field as touched on blur', async () => {
      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter subgroup name/i);
        fireEvent.change(nameInput, { target: { value: '' } });
        fireEvent.blur(nameInput);
      });

      await waitFor(() => {
        expect(screen.getByText(/Subgroup name is required/i)).toBeInTheDocument();
      });
    });

    it('should not show validation errors before field is touched', async () => {
      render(<EditSubgroupPage />);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Enter subgroup name/i);
        fireEvent.change(nameInput, { target: { value: '' } });
      });

      expect(screen.queryByText(/Subgroup name is required/i)).not.toBeInTheDocument();
    });
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfilePage from '../page';
import { authService } from '@/services/auth-service';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('@/services/auth-service');
jest.mock('@/hooks/use-toast');
jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));
jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
  )
}));
jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />
}));
jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>
}));
jest.mock('@/components/ui/confirmation-dialog', () => ({
  ConfirmationDialog: ({ isOpen, onConfirm, onCancel, title, message }: any) => 
    isOpen ? (
      <div data-testid="confirmation-dialog">
        <h3>{title}</h3>
        <p>{message}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null
}));

const mockToast = jest.fn();

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (authService.getUser as jest.Mock).mockReturnValue({
      name: 'John Doe',
      loginId: 'john.doe',
      email: 'john@test.com',
      role: 'Administrator'
    });
  });

  // Loading and Rendering Tests
  describe('Loading and Rendering', () => {
    it('should render profile page with user data', () => {
      render(<ProfilePage />);
      
      expect(screen.getByTestId('profile-content')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Administrator')).toBeInTheDocument();
    });

    it('should parse user name into first and last name', () => {
      render(<ProfilePage />);
      
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Doe')).toBeInTheDocument();
    });

    it('should render with default values when no user data available', () => {
      (authService.getUser as jest.Mock).mockReturnValue(null);
      
      render(<ProfilePage />);
      
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    it('should display all personal information fields', () => {
      render(<ProfilePage />);
      
      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Last Name')).toBeInTheDocument();
      expect(screen.getByText('Email Address')).toBeInTheDocument();
      expect(screen.getByText('Phone Number')).toBeInTheDocument();
      expect(screen.getByText('Department')).toBeInTheDocument();
    });
  });

  // Password Change Tests
  describe('Password Change', () => {
    it('should enable password editing after confirming dialog', () => {
      render(<ProfilePage />);
      
      const editButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Edit'));
      fireEvent.click(editButton!);
      
      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);
      
      expect(screen.getByPlaceholderText('Enter current password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter new password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm new password')).toBeInTheDocument();
    });

    it('should cancel password editing when clicking cancel in dialog', () => {
      render(<ProfilePage />);
      
      const editButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Edit'));
      fireEvent.click(editButton!);
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Enter current password')).not.toBeInTheDocument();
    });

    it('should handle password input changes', () => {
      render(<ProfilePage />);
      
      const editButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Edit'));
      fireEvent.click(editButton!);
      fireEvent.click(screen.getByText('Confirm'));
      
      const currentPasswordInput = screen.getByPlaceholderText('Enter current password');
      fireEvent.change(currentPasswordInput, { target: { value: 'oldpass123' } });
      
      expect(currentPasswordInput).toHaveValue('oldpass123');
    });

    it('should toggle password visibility for current password', () => {
      render(<ProfilePage />);
      
      const editButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Edit'));
      fireEvent.click(editButton!);
      fireEvent.click(screen.getByText('Confirm'));
      
      const currentPasswordInput = screen.getByPlaceholderText('Enter current password');
      expect(currentPasswordInput).toHaveAttribute('type', 'password');
      
      // Find and click the eye icon button for current password
      const eyeButtons = screen.getAllByRole('button').filter(btn => 
        btn.querySelector('svg')
      );
      fireEvent.click(eyeButtons[0]);
      
      expect(currentPasswordInput).toHaveAttribute('type', 'text');
    });

    it('should discard password changes and exit edit mode', () => {
      render(<ProfilePage />);
      
      const editButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Edit'));
      fireEvent.click(editButton!);
      fireEvent.click(screen.getByText('Confirm'));
      
      const currentPasswordInput = screen.getByPlaceholderText('Enter current password');
      fireEvent.change(currentPasswordInput, { target: { value: 'test' } });
      
      const discardButton = screen.getByText('Discard');
      fireEvent.click(discardButton);
      
      expect(screen.queryByPlaceholderText('Enter current password')).not.toBeInTheDocument();
    });
  });

  // Password Validation Tests
  describe('Password Validation', () => {
    it('should show error when passwords do not match', async () => {
      render(<ProfilePage />);
      
      const editButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Edit'));
      fireEvent.click(editButton!);
      fireEvent.click(screen.getByText('Confirm'));
      
      const currentPasswordInput = screen.getByPlaceholderText('Enter current password');
      const newPasswordInput = screen.getByPlaceholderText('Enter new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm new password');
      
      fireEvent.change(currentPasswordInput, { target: { value: 'oldpass123' } });
      fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'differentpass' } });
      
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Validation Error",
          description: "New passwords do not match",
          variant: "destructive",
        });
      });
    });

    it('should show error when password fields are empty', async () => {
      render(<ProfilePage />);
      
      const editButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Edit'));
      fireEvent.click(editButton!);
      fireEvent.click(screen.getByText('Confirm'));
      
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Validation Error",
          description: "Please fill in all password fields",
          variant: "destructive",
        });
      });
    });
  });

  // Password Change Success Tests
  describe('Password Change Success', () => {
    it('should successfully change password with valid data', async () => {
      (authService.changePassword as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Password changed successfully'
      });
      
      render(<ProfilePage />);
      
      const editButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Edit'));
      fireEvent.click(editButton!);
      fireEvent.click(screen.getByText('Confirm'));
      
      const currentPasswordInput = screen.getByPlaceholderText('Enter current password');
      const newPasswordInput = screen.getByPlaceholderText('Enter new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm new password');
      
      fireEvent.change(currentPasswordInput, { target: { value: 'oldpass123' } });
      fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpass123' } });
      
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Password Changed",
          description: "Password changed successfully",
          variant: "success",
        });
      });
    });

    it('should reset form and exit edit mode after successful password change', async () => {
      (authService.changePassword as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Password changed successfully'
      });
      
      render(<ProfilePage />);
      
      const editButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Edit'));
      fireEvent.click(editButton!);
      fireEvent.click(screen.getByText('Confirm'));
      
      fireEvent.change(screen.getByPlaceholderText('Enter current password'), { target: { value: 'oldpass123' } });
      fireEvent.change(screen.getByPlaceholderText('Enter new password'), { target: { value: 'newpass123' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'newpass123' } });
      
      fireEvent.click(screen.getByText('Save'));
      
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Enter current password')).not.toBeInTheDocument();
      });
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    it('should handle API error when changing password', async () => {
      (authService.changePassword as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Current password is incorrect'
      });
      
      render(<ProfilePage />);
      
      const editButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Edit'));
      fireEvent.click(editButton!);
      fireEvent.click(screen.getByText('Confirm'));
      
      fireEvent.change(screen.getByPlaceholderText('Enter current password'), { target: { value: 'wrongpass' } });
      fireEvent.change(screen.getByPlaceholderText('Enter new password'), { target: { value: 'newpass123' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'newpass123' } });
      
      fireEvent.click(screen.getByText('Save'));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Error",
          description: "Current password is incorrect",
          variant: "destructive",
        });
      });
    });

    it('should handle network error when changing password', async () => {
      (authService.changePassword as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      render(<ProfilePage />);
      
      const editButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Edit'));
      fireEvent.click(editButton!);
      fireEvent.click(screen.getByText('Confirm'));
      
      fireEvent.change(screen.getByPlaceholderText('Enter current password'), { target: { value: 'oldpass123' } });
      fireEvent.change(screen.getByPlaceholderText('Enter new password'), { target: { value: 'newpass123' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'newpass123' } });
      
      fireEvent.click(screen.getByText('Save'));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Error",
          description: "Failed to change password. Please try again.",
          variant: "destructive",
        });
      });
    });
  });

  // User Display Tests
  describe('User Display', () => {
    it('should display default role when role is not available', () => {
      (authService.getUser as jest.Mock).mockReturnValue({
        name: 'Test User'
      });
      
      render(<ProfilePage />);
      
      expect(screen.getByText('Administrator')).toBeInTheDocument();
    });

    it('should parse loginId into first and last name when name is not available', () => {
      (authService.getUser as jest.Mock).mockReturnValue({
        loginId: 'Jane Smith',
        email: 'jane@test.com'
      });
      
      render(<ProfilePage />);
      
      expect(screen.getByText('Jane')).toBeInTheDocument();
      expect(screen.getByText('Smith')).toBeInTheDocument();
    });
  });

  // UI State Tests
  describe('UI State', () => {
    it('should disable inputs when password is being changed', async () => {
      (authService.changePassword as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Success' }), 100))
      );
      
      render(<ProfilePage />);
      
      const editButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Edit'));
      fireEvent.click(editButton!);
      fireEvent.click(screen.getByText('Confirm'));
      
      fireEvent.change(screen.getByPlaceholderText('Enter current password'), { target: { value: 'oldpass123' } });
      fireEvent.change(screen.getByPlaceholderText('Enter new password'), { target: { value: 'newpass123' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'newpass123' } });
      
      fireEvent.click(screen.getByText('Save'));
      
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
      });
    });

    it('should hide edit button when in password change mode', () => {
      render(<ProfilePage />);
      
      const editButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Edit'));
      fireEvent.click(editButton!);
      fireEvent.click(screen.getByText('Confirm'));
      
      const remainingButtons = screen.getAllByRole('button');
      const hasEditButton = remainingButtons.some(btn => btn.textContent?.includes('Edit'));
      expect(hasEditButton).toBe(false);
    });
  });
});

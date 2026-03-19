'use client';

import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth-service';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
  isTesting?: boolean;
}

export function LogoutButton({ 
  variant = 'outline', 
  size = 'default', 
  className = '',
  showIcon = true,
  children,
  isTesting = false
}: Readonly<LogoutButtonProps>) {
  const handleLogout = () => {
    authService.logout();
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={className}
      data-testid="logout-button"
    >
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      {children || 'Logout'}
    </Button>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/services/auth-service';
import { User, Mail, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserInfoProps {
  isTesting?: boolean;
}

export function UserInfo({ isTesting = false }: UserInfoProps = {}) {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    const userData = authService.getUser();
    
    setIsAuthenticated(authenticated);
    setUser(userData);
  }, []);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Card data-testid="user-info-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          User Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2" data-testid="user-name">
          <User className="w-4 h-4 text-gray-500" />
          <span className="font-medium">Name:</span>
          <span>{user.name}</span>
        </div>
        <div className="flex items-center gap-2" data-testid="user-email">
          <Mail className="w-4 h-4 text-gray-500" />
          <span className="font-medium">Email:</span>
          <span>{user.email}</span>
        </div>
        <div className="flex items-center gap-2" data-testid="user-role">
          <Shield className="w-4 h-4 text-gray-500" />
          <span className="font-medium">Role:</span>
          <span className="capitalize">{user.role}</span>
        </div>
        <div className="flex items-center gap-2" data-testid="user-login-id">
          <span className="font-medium">Login ID:</span>
          <span>{user.loginId}</span>
        </div>
      </CardContent>
    </Card>
  );
}
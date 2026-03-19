"use client";

import React, { useEffect } from "react";
import { authService } from "@/services/auth-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Shield, Key } from "lucide-react";

interface AuthTestPageProps {
  isTesting?: boolean;
}

export default function AuthTestPage({ isTesting = false }: AuthTestPageProps = {}) {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();
  const token = authService.getToken();

  const handleLogout = () => {
    authService.logout();
  };

  useEffect(() => {
    if (isTesting) {
      handleLogout();
    }
  }, [isTesting]);

  return (
    <div className="min-h-screen bg-gray-50 p-8" data-testid="auth-test-page">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <Shield className="mr-3 h-8 w-8 text-blue-600" />
          Authentication Status Test
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Authentication Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {isAuthenticated ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                    Authenticated
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-5 w-5 text-red-600" />
                    Not Authenticated
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Login Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    isAuthenticated 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isAuthenticated ? 'Logged In' : 'Logged Out'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Token Present:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    token 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {token ? 'Yes' : 'No'}
                  </span>
                </div>

                {isAuthenticated && (
                  <Button 
                    onClick={handleLogout}
                    variant="destructive"
                    size="sm"
                    className="w-full mt-4"
                    data-testid="logout-button"
                  >
                    Logout
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="mr-2 h-5 w-5 text-blue-600" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">User ID:</span>
                    <p className="text-sm">{user.id || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <p className="text-sm">{user.email || user.loginId || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <p className="text-sm">{user.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Role:</span>
                    <p className="text-sm">{user.role || 'N/A'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No user data available</p>
              )}
            </CardContent>
          </Card>

          {/* Token Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Token Information</CardTitle>
            </CardHeader>
            <CardContent>
              {token ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Token (truncated):</span>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
                      {token.substring(0, 50)}...
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    * Token is stored in localStorage and used for authentication
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No authentication token found</p>
              )}
            </CardContent>
          </Card>

          {/* Navigation Test */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Test Protected Routes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <a href="/dashboard">
                  <Button variant="outline" size="sm" className="w-full">
                    Dashboard
                  </Button>
                </a>
                <a href="/groups">
                  <Button variant="outline" size="sm" className="w-full">
                    Groups
                  </Button>
                </a>
                <a href="/users">
                  <Button variant="outline" size="sm" className="w-full">
                    Users
                  </Button>
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                * If not authenticated, clicking these links should redirect to login page
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
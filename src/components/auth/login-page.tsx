"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  EyeOff,
  Lock,
  Loader2,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService, type LoginCredentials, type ForgotPasswordRequest } from "@/services/auth-service";

interface LoginPageProps {
  isTesting?: boolean;
}

export default function LoginPage({ isTesting = false }: LoginPageProps = {}) {
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  const [loginData, setLoginData] = useState<LoginCredentials>({
    UserName: "",
    Password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isMSSOLoading, setIsMSSOLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [hasAuthError, setHasAuthError] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load saved email if Remember Me was previously checked
    const savedEmail = localStorage.getItem('rememberedEmail');
    const isRemembered = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && isRemembered) {
      setLoginData((prev) => ({
        ...prev,
        UserName: savedEmail,
      }));
      setRememberMe(true);
    }
  }, []);

  // Check if both username and password are filled
  const isFormValid = loginData.UserName.trim() !== "" && loginData.Password.trim() !== "";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear auth error when user starts typing
    if (hasAuthError) {
      setHasAuthError(false);
    }
  };

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    
    if (checked && loginData.UserName.trim()) {
      // Save login ID to localStorage when Remember Me is checked
      localStorage.setItem('rememberedEmail', loginData.UserName);
      localStorage.setItem('rememberMe', 'true');
    } else {
      // Remove saved login ID when Remember Me is unchecked
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberMe');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginData.UserName.trim() || !loginData.Password.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter both login ID/email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login(loginData);

      if (response.success) {
        // Handle Remember Me functionality
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', loginData.UserName);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberMe');
        }
console.log("responseeeeee", response);
        // Set flag to show welcome popup on dashboard
        sessionStorage.setItem('justLoggedIn', 'true');

        toast({
          title: "Login Successful",
          description: "Welcome back! Redirecting to dashboard...",
          variant: "success",
        });

        // Small delay to show success message
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setHasAuthError(true);
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setHasAuthError(true);
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: "Unable to connect to the server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftSSO = async () => {
    setIsMSSOLoading(true);
    try {
      toast({
        title: "Microsoft SSO",
        description: "Microsoft login integration coming soon",
        variant: "default",
      });
    } catch (error) {
      console.error("Microsoft SSO error:", error);
      toast({
        title: "SSO Error",
        description: "Microsoft login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMSSOLoading(false);
    }
  };

  const handleForgotPasswordClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowForgotPassword(true);
      setIsAnimating(false);
    }, 600);
  };

  const handleBackToLogin = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowForgotPassword(false);
      setIsAnimating(false);
      setForgotPasswordEmail("");
    }, 600);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotPasswordEmail.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your login ID or email address.",
        variant: "destructive",
      });
      return;
    }

    setIsForgotPasswordLoading(true);

    try {
      const request: ForgotPasswordRequest = {
        LoginId: forgotPasswordEmail.trim()
      };

      const response = await authService.forgotPassword(request);

      if (response.success) {
        toast({
          title: "Reset Link Sent",
          description: response.message,
          variant: "success",
        });

        // Redirect back to login after success
        setTimeout(() => {
          handleBackToLogin();
        }, 2000);
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast({
        title: "Error",
        description: "Failed to send reset link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 relative" data-testid="login-page">
      {/* Background Image at Bottom */}
      <div className="absolute inset-0 bg-no-repeat bg-bottom bg-contain opacity-20 login-bg"></div>

      {/* Content Container */}
      <div className="w-full max-w-md relative z-10 perspective-1000">
        {/* Login Card */}
        <Card
          className={`shadow-2xl border-0 cus-login-pg absolute inset-0 transition-[transform,width,height,opacity] duration-[600ms] ease-in-out ${
            showForgotPassword ? "card-slide-up" : "card-slide-center"
          }`}
        >
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center">
              <div className="flex items-center justify-center">
                <Image
                  src="/images/logos/logo.png"
                  alt="VMS Logo"
                  width={120}
                  height={70}
                  className="object-contain"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-6 pb-6 mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleMicrosoftSSO}
              className="cus-sso-btn vms-button w-full h-10 border-neutral-300 hover:bg-neutral-50"
              disabled={isLoading || isMSSOLoading}
              data-testid="sso-button"
            >
              {isMSSOLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <div className="mr-2 flex h-4 w-4 items-center justify-center">
                    <svg viewBox="0 0 23 23" className="h-4 w-4">
                      <path fill="#f35325" d="M1 1h10v10H1z" />
                      <path fill="#81bc06" d="M12 1h10v10H12z" />
                      <path fill="#05a6f0" d="M1 12h10v10H1z" />
                      <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                  </div>
                  Continue with Microsoft
                </>
              )}
            </Button>
            <div className="relative">
              <div className="relative flex justify-center text-xs uppercase separator">
                <span className="bg-white px-2 text-neutral-500 cus-or-cls">
                  OR
                </span>
              </div>
            </div>

            <form
              onSubmit={handleLogin}
              className="space-y-3"
              autoComplete="new-password"
            >
              <div className="space-y-1">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="loginId"
                    name="UserName"
                    type="text"
                    placeholder="Enter login ID or email address"
                    value={loginData.UserName}
                    onChange={handleInputChange}
                    className={`pl-10 ${
                      hasAuthError 
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                        : ""
                    }`}
                    disabled={isLoading}
                    required
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-testid="username-input"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={loginData.Password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${
                      hasAuthError 
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                        : ""
                    }`}
                    disabled={isLoading}
                    required
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-testid="password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                    data-testid="toggle-password-button"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => handleRememberMeChange(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={isLoading}
                    data-testid="remember-me-checkbox"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-600">
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleForgotPasswordClick}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  disabled={isLoading || isAnimating}
                  data-testid="forgot-password-link"
                >
                  Forgot Password?
                </button>
              </div>

              <Button
                type="submit"
                className={`w-full h-10 transition-all duration-200 ${
                  isFormValid && !isLoading
                    ? "bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={isLoading || !isFormValid}
                title={isFormValid ? "" : "Please enter both login ID/email and password"}
                data-testid="login-submit-button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Forgot Password Card */}
        <Card
          className={`shadow-2xl border-0 cus-login-pg absolute inset-0 transition-[transform,width,height,opacity] duration-[600ms] ease-in-out ${
            showForgotPassword ? "card-slide-center" : "card-slide-down"
          }`}
        >
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center">
              <div className="flex items-center justify-center">
                <Image
                  src="/images/logos/logo.png"
                  alt="VMS Logo"
                  width={120}
                  height={70}
                  className="object-contain"
                />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Reset Password
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Enter your login ID or email address and we'll send you a link to reset your
                password.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-6 pb-6">
            <form
              onSubmit={handleForgotPasswordSubmit}
              className="space-y-4"
              autoComplete="off"
            >
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="forgotEmail"
                    name="forgotEmail"
                    type="text"
                    placeholder="Enter your login ID or email address"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="pl-10"
                    disabled={isForgotPasswordLoading}
                    required
                    autoComplete="new-password"
                    data-testid="forgot-email-input"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="cus-primary-btn w-full hover:bg-blue-700 h-10"
                disabled={
                  isForgotPasswordLoading || !forgotPasswordEmail.trim()
                }
                data-testid="forgot-password-submit-button"
              >
                {isForgotPasswordLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 hover:underline"
                disabled={isForgotPasswordLoading || isAnimating}
                data-testid="back-to-login-button"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Add copyright text */}
      <div className="text-center text-sm text-gray-500 cus-copy-right-sec">
        &copy; {new Date().getFullYear()} Compunnel, Inc.
      </div>
    </div>
  );
}
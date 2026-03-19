import { apiClient, buildApiUrl } from "./api-client";
import { logger } from "@/utils/logger";

export interface LoginCredentials {
  UserName: string;
  Password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    loginId: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface MicrosoftSSOResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface ForgotPasswordRequest {
  LoginId?: string;
  loginId?: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ChangePasswordRequest {
  OldPassword?: string;
  oldPassword?: string;
  NewPassword?: string;
  newPassword?: string;
  ConfirmPassword?: string;
  confirmPassword?: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export class AuthService {
  private readonly TOKEN_KEY = "vms_auth_token";
  private readonly USER_KEY = "vms_user_data";
  private readonly MODULES_KEY = "vms_user_modules";

  private async parseLoginResponse(response: Response): Promise<any> {
    let responseText = "";
    try {
      responseText = await response.text();
      logger.debug("Raw response text received", {
        responseLength: responseText.length,
        responseText,
      });

      if (responseText) {
        const data = JSON.parse(responseText);
        logger.debug("Response data parsed successfully", { data });
        return data;
      }

      logger.warn("Empty response received from login API", {
        status: response.status,
      });
      return response.ok ? { success: true } : null;
    } catch (parseError) {
      logger.error("Failed to parse login response", parseError, {
        responseText,
      });
      return response.ok ? { success: true } : { message: "Invalid response format from server" };
    }
  }

  private extractUserData(data: any) {
    return {
      userId: data?.userId || data?.UserId || data?.data?.userId || data?.data?.UserId || data?.data?.records?.[0]?.userId || data?.data?.records?.[0]?.UserId,
      userName: data?.userName || data?.UserName || data?.data?.userName || data?.data?.UserName || data?.data?.records?.[0]?.userName || data?.data?.records?.[0]?.UserName,
      roleName: data?.roleName || data?.RoleName || data?.data?.roleName || data?.data?.RoleName || data?.data?.records?.[0]?.roleName || data?.data?.records?.[0]?.RoleName,
      message: data?.message || data?.Message || data?.data?.message || data?.data?.Message,
    };
  }

  private createDefaultUser(credentials: LoginCredentials): AuthResponse {
    logger.info("Login successful but no user data returned (204 No Content), creating default user");
    
    const user = {
      id: Date.now().toString(),
      loginId: credentials.UserName,
      name: credentials.UserName.split("@")[0],
      email: credentials.UserName,
      role: "User",
    };

    const sessionToken = `vms_session_${Date.now()}_${user.id}`;
    this.setToken(sessionToken);
    this.setUser(user);

    return {
      success: true,
      message: "Login successful",
      token: sessionToken,
      user: user,
    };
  }

  private createAuthenticatedUser(userId: string, userName: string, roleName: string, credentials: LoginCredentials, data: any): AuthResponse {
    logger.info("Login successful, storing user data", { userId, userName, roleName });

    const user = {
      id: userId.toString(),
      loginId: userName,
      name: userName,
      email: credentials.UserName,
      role: roleName || "User",
    };

    const sessionToken = data.token || data.Token || data.data?.token || data.data?.Token;
    this.setToken(sessionToken);
    this.setUser(user);
    
    // Store user modules for sidebar menu access control
    // The menus object contains allModulesFlattened array
    const menusData = data.menus || data.Menus || data.data?.menus || data.data?.Menus;
    const modules = 
      menusData?.allModulesFlattened ||
      menusData?.AllModulesFlattened ||
      menusData?.userMenus ||
      menusData?.UserMenus ||
      data.allModulesFlattened || 
      data.AllModulesFlattened || 
      data.data?.allModulesFlattened || 
      data.data?.AllModulesFlattened ||
      [];
    
    this.setUserModules(modules);

    return {
      success: true,
      message: "Login successful",
      token: sessionToken,
      user: user,
    };
  }

  private getLoginErrorMessage(response: Response, message?: string): string {
    if (message) return message;

    const errorMap: Record<number, string> = {
      401: "Invalid email or password. Please try again.",
      400: "Please check your login credentials.",
      500: "Server error. Please try again later.",
    };

    return errorMap[response.status] || "Login failed. Please try again.";
  }

  private async parseForgotPasswordResponse(response: Response): Promise<any> {
    try {
      const responseText = await response.text();
      logger.debug("Raw forgot password response received", {
        responseLength: responseText.length,
      });

      if (responseText) {
        const data = JSON.parse(responseText);
        logger.debug("Forgot password data parsed successfully");
        return data;
      }
      return null;
    } catch (parseError) {
      logger.error("Failed to parse forgot password response", parseError);
      return { message: "Invalid response format from server" };
    }
  }

  private getForgotPasswordErrorMessage(response: Response, data: any): string {
    if (data?.message) {
      return data.message;
    }

    const errorMap: Record<number, string> = {
      404: "Account not found with this login ID.",
      400: "Please enter a valid login ID.",
      500: "Server error. Please try again later.",
    };

    return errorMap[response.status] || "Failed to send reset link. Please try again.";
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      logger.apiRequest("POST", "auth/login", {
        UserName: credentials.UserName,
        Password: "[HIDDEN]",
      });

      const response = await fetch(buildApiUrl("auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      logger.debug("Login response received", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      const data = await this.parseLoginResponse(response);
      const { userId, userName, roleName, message } = this.extractUserData(data);

      logger.info("Login response analysis:", {
        responseOk: response.ok,
        status: response.status,
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        userId,
        userName,
        roleName,
        message,
        fullData: data,
      });

      if (response.ok && (!data || !userId)) {
        return this.createDefaultUser(credentials);
      }

      if (response.ok && data && userId) {
        return this.createAuthenticatedUser(userId, userName, roleName, credentials, data);
      }

      logger.warn("Login failed - detailed analysis:", {
        responseOk: response.ok,
        hasData: !!data,
        hasUserId: !!userId,
        status: response.status,
        responseData: data,
      });

      const errorMessage = this.getLoginErrorMessage(response, message);
      logger.info("Using error message for login failure", { errorMessage });

      return {
        success: false,
        message: errorMessage,
      };
    } catch (error: any) {
      logger.error("Login error occurred", error, {
        userName: credentials.UserName,
      });

      // Handle different types of errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        return {
          success: false,
          message:
            "Network error. Please check your internet connection and try again.",
        };
      } else if (error.name === "AbortError") {
        return {
          success: false,
          message: "Request timeout. Please try again.",
        };
      } else {
        return {
          success: false,
          message: "An unexpected error occurred. Please try again.",
        };
      }
    }
  }

  async loginWithMicrosoft(accessToken: string): Promise<MicrosoftSSOResponse> {
    try {
      const response = await apiClient.post<MicrosoftSSOResponse>(
        "/auth/microsoft-sso",
        {
          accessToken,
        }
      );

      if (response.data.success && response.data.token) {
        this.setToken(response.data.token);
        if (response.data.user) {
          this.setUser(response.data.user);
        }
      }

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Microsoft SSO login failed. Please try again.",
      };
    }
  }

  async forgotPassword(
    request: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    try {
      const loginId = request.loginId || request.LoginId || "";
      logger.apiRequest("POST", "auth/forgot-password", { loginId });

      const payload = {
        loginId: loginId,
        LoginId: loginId,
      };

      const response = await fetch(buildApiUrl("auth/forgot-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      logger.debug("Forgot password response received", {
        status: response.status,
      });

      const data = await this.parseForgotPasswordResponse(response);

      if (response.ok) {
        logger.info("Forgot password request successful");
        return {
          success: true,
          message:
            data?.message ||
            "If an account with this login ID exists, you will receive a password reset link.",
        };
      }

      logger.warn("Forgot password request failed", {
        status: response.status,
      });

      return {
        success: false,
        message: this.getForgotPasswordErrorMessage(response, data),
      };
    } catch (error: any) {
      logger.error("Forgot password error occurred", error, {
        loginId: request.LoginId,
      });

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        return {
          success: false,
          message:
            "Network error. Please check your internet connection and try again.",
        };
      } else if (error.name === "AbortError") {
        return {
          success: false,
          message: "Request timeout. Please try again.",
        };
      } else {
        return {
          success: false,
          message: "An unexpected error occurred. Please try again.",
        };
      }
    }
  }

  private buildChangePasswordPayload(request: ChangePasswordRequest) {
    return {
      oldPassword: request.oldPassword || request.OldPassword || "",
      OldPassword: request.oldPassword || request.OldPassword || "",
      newPassword: request.newPassword || request.NewPassword || "",
      NewPassword: request.newPassword || request.NewPassword || "",
      confirmPassword: request.confirmPassword || request.ConfirmPassword || "",
      ConfirmPassword: request.confirmPassword || request.ConfirmPassword || "",
    };
  }

  private async parseChangePasswordResponse(response: Response): Promise<any> {
    try {
      const responseText = await response.text();

      if (responseText) {
        const data = JSON.parse(responseText);
        return data;
      }
      return null;
    } catch (parseError) {
      return { message: "Invalid response format from server" };
    }
  }

  private getChangePasswordErrorMessage(response: Response, data: any): string {
    if (data?.message) {
      return data.message;
    }

    const errorMap: Record<number, string> = {
      400: "Invalid password. Please check your current password.",
      401: "Current password is incorrect.",
      422: "Password validation failed. Please check password requirements.",
      500: "Server error. Please try again later.",
    };

    return errorMap[response.status] || "Failed to change password. Please try again.";
  }

  async changePassword(
    request: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> {
    try {
      const user = this.getUser();
      if (!user?.id) {
        return {
          success: false,
          message: "User not authenticated. Please log in again.",
        };
      }

      const payload = this.buildChangePasswordPayload(request);

      const response = await fetch(
        buildApiUrl(`auth/change-password/${user.id}`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getToken()}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await this.parseChangePasswordResponse(response);

      if (response.ok) {
        return {
          success: true,
          message: data?.message || "Password changed successfully.",
        };
      }

      return {
        success: false,
        message: this.getChangePasswordErrorMessage(response, data),
      };
    } catch (error: any) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        return {
          success: false,
          message:
            "Network error. Please check your internet connection and try again.",
        };
      } else if (error.name === "AbortError") {
        return {
          success: false,
          message: "Request timeout. Please try again.",
        };
      } else {
        return {
          success: false,
          message: "An unexpected error occurred. Please try again.",
        };
      }
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.MODULES_KEY);
    globalThis.location.href = "/login";
  }

  getToken(): string | null {
    if (globalThis.window === undefined) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser() {
    if (globalThis.window === undefined) return null;
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    if (globalThis.window === undefined) return false;
    const token = this.getToken();
    return !!token;
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private setUserModules(modules: any[]): void {
    localStorage.setItem(this.MODULES_KEY, JSON.stringify(modules));
  }

  /**
   * Get user's accessible modules from storage
   * @returns Array of module objects with moduleId and moduleName
   */
  getUserModules(): any[] {
    if (globalThis.window === undefined) return [];
    const modulesData = localStorage.getItem(this.MODULES_KEY);
    return modulesData ? JSON.parse(modulesData) : [];
  }

  /**
   * Check if user has access to a specific module by moduleId
   * @param moduleId - The module ID to check
   * @returns true if user has access, false otherwise
   */
  hasModuleAccess(moduleId: number): boolean {
    if (moduleId === 0) return true; // Dashboard is always accessible
    const modules = this.getUserModules();
    return modules.some((m: any) => m.moduleId === moduleId || m.ModuleId === moduleId);
  }

  async validateToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    return true;
  }
}

export const authService = new AuthService();

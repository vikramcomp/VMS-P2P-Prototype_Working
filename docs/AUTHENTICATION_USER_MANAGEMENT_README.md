# Authentication & User Management - Documentation

## Overview
The Authentication and User Management module provides secure user authentication, profile management, and session handling for the VMS (Vendor Management System) application. This includes login/logout functionality, password management, user profile operations, and security features.

## Table of Contents
- [File Structure](#file-structure)
- [Features](#features)
- [Authentication Flow](#authentication-flow)
- [Components](#components)
- [API Integration](#api-integration)
- [Security Implementation](#security-implementation)
- [User Interface](#user-interface)
- [Session Management](#session-management)
- [Password Security](#password-security)
- [Error Handling](#error-handling)
- [Validation & Sanitization](#validation--sanitization)
- [Usage Examples](#usage-examples)
- [Development Guidelines](#development-guidelines)
- [Troubleshooting](#troubleshooting)

## File Structure

```
src/
├── app/
│   ├── login/
│   │   └── page.tsx                     # Login page
│   ├── forgot-password/
│   │   └── page.tsx                     # Forgot password form
│   ├── reset-password/
│   │   └── page.tsx                     # Password reset form
│   ├── profile/
│   │   └── page.tsx                     # User profile page
│   └── change-password/
│       └── page.tsx                     # Change password form
├── components/
│   ├── auth/
│   │   ├── login-form.tsx               # Login form component
│   │   ├── forgot-password-form.tsx     # Forgot password component
│   │   ├── protected-route.tsx          # Route protection wrapper
│   │   └── auth-guard.tsx               # Authentication guard
│   ├── profile/
│   │   ├── profile-form.tsx             # User profile editor
│   │   ├── profile-avatar.tsx           # Avatar upload component
│   │   └── profile-settings.tsx         # User settings component
│   └── ui/
│       ├── password-input.tsx           # Password input with visibility toggle
│       └── form-validation.tsx          # Form validation helpers
├── services/
│   ├── auth-service.ts                  # Authentication API service
│   ├── user-service.ts                  # User profile API service
│   └── password-service.ts              # Password management service
├── hooks/
│   ├── use-auth.ts                      # Authentication state hook
│   ├── use-user-profile.ts              # User profile management hook
│   └── use-password-validation.ts       # Password validation hook
├── stores/
│   ├── auth-store.ts                    # Authentication state store
│   └── user-store.ts                    # User data store
├── types/
│   ├── auth.ts                          # Authentication type definitions
│   └── user.ts                          # User profile type definitions
└── utils/
    ├── auth-utils.ts                    # Authentication utilities
    ├── password-utils.ts                # Password validation utilities
    └── session-utils.ts                 # Session management utilities
```

## Features

### Authentication Features
- ✅ **User Login**: Secure email/password authentication
- ✅ **Remember Me**: Persistent login sessions
- ✅ **Logout**: Secure session termination
- ✅ **Session Management**: Auto-logout on expiry
- ✅ **Route Protection**: Authenticated route guards

### Password Management
- ✅ **Forgot Password**: Email-based password reset
- ✅ **Password Reset**: Secure token-based reset
- ✅ **Change Password**: In-app password updates
- ✅ **Password Validation**: Strength requirements
- ✅ **Password Visibility**: Toggle show/hide password

### User Profile Management
- ✅ **View Profile**: Display user information
- ✅ **Edit Profile**: Update personal details
- ✅ **Avatar Upload**: Profile picture management
- ✅ **Settings Management**: User preferences
- ✅ **Account Information**: Role and permissions display

### Security Features
- ✅ **Token Management**: JWT token handling
- ✅ **Auto-refresh**: Automatic token renewal
- ✅ **CSRF Protection**: Cross-site request forgery prevention
- ✅ **Input Sanitization**: XSS prevention
- ✅ **Rate Limiting**: Brute force protection

## Authentication Flow

### 1. Login Process
```
User Enters Credentials → Validation → API Authentication → Token Storage → Redirect to Dashboard
```

### 2. Protected Route Access
```
Route Request → Check Auth Token → Valid? → Allow Access | Invalid? → Redirect to Login
```

### 3. Password Reset Flow
```
Forgot Password → Email Validation → Send Reset Email → Click Reset Link → New Password → Confirmation
```

### 4. Logout Process
```
User Clicks Logout → Clear Tokens → Clear Session Storage → Redirect to Login → API Logout Notification
```

## Components

### 1. Login Form (`/src/components/auth/login-form.tsx`)
**Purpose**: Main login interface with credential validation

**Key Features**:
- Email/password input fields
- "Remember Me" checkbox
- Form validation with real-time feedback
- Loading states during authentication
- Error handling and display
- Forgot password link

**Props**:
```typescript
interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  showRememberMe?: boolean;
}
```

**State Management**:
```typescript
- email: string                    // User email input
- password: string                 // User password input
- rememberMe: boolean              // Remember me checkbox state
- isLoading: boolean               // Loading state during login
- errors: LoginErrors              // Form validation errors
```

### 2. Forgot Password Form (`/src/components/auth/forgot-password-form.tsx`)
**Purpose**: Email-based password reset initiation

**Key Features**:
- Email input with validation
- Send reset email functionality
- Success/error feedback
- Resend email option with cooldown
- Back to login navigation

### 3. User Profile Form (`/src/components/profile/profile-form.tsx`)
**Purpose**: User profile information management

**Key Features**:
- Personal information fields (name, email, phone)
- Avatar upload with preview
- Form validation
- Save/cancel functionality
- Change password navigation

**Validation Rules**:
- Email format validation
- Phone number format validation
- Required field validation
- File size limits for avatar upload

### 4. Change Password Form (`/src/components/profile/change-password-form.tsx`)
**Purpose**: Secure password update functionality

**Key Features**:
- Current password verification
- New password with confirmation
- Password strength indicator
- Real-time validation
- Security requirements display

## API Integration

### Authentication Service (`/src/services/auth-service.ts`)
```typescript
class AuthService {
  // User authentication
  async login(credentials: LoginRequest): Promise<LoginResponse>
  
  // Refresh authentication token
  async refreshToken(): Promise<RefreshTokenResponse>
  
  // User logout
  async logout(): Promise<void>
  
  // Password reset request
  async forgotPassword(email: string): Promise<ForgotPasswordResponse>
  
  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse>
  
  // Verify reset token
  async verifyResetToken(token: string): Promise<TokenVerificationResponse>
}
```

### User Service (`/src/services/user-service.ts`)
```typescript
class UserService {
  // Get user profile
  async getUserProfile(): Promise<UserProfileResponse>
  
  // Update user profile
  async updateProfile(profileData: UpdateProfileRequest): Promise<UpdateProfileResponse>
  
  // Upload user avatar
  async uploadAvatar(file: File): Promise<UploadAvatarResponse>
  
  // Change user password
  async changePassword(passwordData: ChangePasswordRequest): Promise<ChangePasswordResponse>
  
  // Get user preferences
  async getUserPreferences(): Promise<UserPreferencesResponse>
  
  // Update user preferences
  async updatePreferences(preferences: UpdatePreferencesRequest): Promise<UpdatePreferencesResponse>
}
```

### API Endpoints
- `POST /auth/login` - User authentication
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset
- `GET /auth/verify-token` - Token verification
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `POST /user/avatar` - Upload avatar
- `PUT /user/change-password` - Change password

### Data Models
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  lastLogin?: Date;
  isActive: boolean;
}

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  success: boolean;
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```

## Security Implementation

### Token Management
```typescript
// JWT token storage and management
class TokenManager {
  setTokens(accessToken: string, refreshToken: string): void
  getAccessToken(): string | null
  getRefreshToken(): string | null
  clearTokens(): void
  isTokenExpired(token: string): boolean
  refreshAccessToken(): Promise<string>
}
```

### Password Security
- **Minimum Requirements**: 8 characters, uppercase, lowercase, number, special character
- **Strength Validation**: Real-time password strength assessment
- **Hash Comparison**: Server-side password verification
- **History Prevention**: Prevent reuse of recent passwords

### Input Sanitization
```typescript
// XSS prevention and input cleaning
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>'"]/g, '') // Remove potential XSS characters
    .slice(0, 255); // Limit input length
};
```

### Route Protection
```typescript
// Protected route wrapper
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermissions }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredPermissions && !hasPermissions(user, requiredPermissions)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
};
```

## User Interface

### Form Design Patterns
- Consistent input styling across all forms
- Clear error messaging with specific validation feedback
- Loading states with disabled inputs during API calls
- Success confirmations with appropriate actions

### Accessibility Features
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management for form flows
- High contrast mode compatibility

### Responsive Design
- Mobile-first approach for authentication forms
- Touch-friendly input fields and buttons
- Proper spacing for mobile interactions
- Landscape/portrait orientation support

## Session Management

### Session Storage
```typescript
interface SessionData {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  rememberMe: boolean;
}
```

### Auto-logout Features
- Token expiration detection
- Inactivity timeout
- Warning notifications before logout
- Graceful session cleanup

### Persistent Login
- "Remember Me" functionality
- Secure token storage
- Automatic login on app restart
- Session restoration

## Password Security

### Validation Rules
```typescript
interface PasswordRequirements {
  minLength: number;           // Minimum 8 characters
  requireUppercase: boolean;   // At least one uppercase letter
  requireLowercase: boolean;   // At least one lowercase letter
  requireNumbers: boolean;     // At least one number
  requireSpecialChars: boolean; // At least one special character
  maxLength: number;           // Maximum 128 characters
}
```

### Password Strength Indicator
- Visual strength meter (Weak/Fair/Good/Strong)
- Real-time feedback during typing
- Specific requirement checklist
- Security tips and recommendations

### Reset Token Security
- Time-limited reset tokens (15 minutes)
- Single-use token validation
- Secure token generation
- Email verification requirement

## Error Handling

### Authentication Errors
```typescript
enum AuthErrorTypes {
  INVALID_CREDENTIALS = 'Invalid email or password',
  ACCOUNT_LOCKED = 'Account temporarily locked due to multiple failed attempts',
  EMAIL_NOT_VERIFIED = 'Please verify your email address',
  TOKEN_EXPIRED = 'Session expired. Please login again',
  NETWORK_ERROR = 'Unable to connect. Please check your internet connection'
}
```

### User-Friendly Error Messages
- Clear, non-technical language
- Actionable guidance for resolution
- Appropriate error severity levels
- Contextual help links where applicable

### Error Recovery
- Automatic retry mechanisms for network errors
- Clear paths to resolve authentication issues
- Support contact information for account problems
- Progressive error disclosure

## Validation & Sanitization

### Email Validation
```typescript
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
};
```

### Password Validation
```typescript
const validatePassword = (password: string): PasswordValidation => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    specialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    isValid: // All requirements met
  };
};
```

### Form Sanitization
- Trim whitespace from all inputs
- Remove potentially harmful characters
- Validate input length limits
- Escape special characters for display

## Usage Examples

### User Login Flow
1. User navigates to `/login`
2. Enters email and password
3. Optionally checks "Remember Me"
4. Clicks "Sign In" button
5. System validates credentials
6. On success: Redirect to dashboard with welcome message
7. On failure: Display specific error message

### Password Reset Flow
1. User clicks "Forgot Password" on login page
2. Enters email address
3. Clicks "Send Reset Email"
4. Receives email with reset link
5. Clicks link, redirected to reset form
6. Enters new password (with confirmation)
7. Submits form and gets confirmation
8. Redirected to login with success message

### Profile Update Flow
1. User navigates to profile page
2. Views current profile information
3. Clicks "Edit Profile" button
4. Updates desired fields
5. Optionally uploads new avatar
6. Clicks "Save Changes"
7. System validates and saves changes
8. Shows success confirmation

### Change Password Flow
1. User goes to profile or settings
2. Clicks "Change Password"
3. Enters current password
4. Enters new password (with strength indicator)
5. Confirms new password
6. Submits form with validation
7. Receives confirmation of successful change
8. Optionally forced to re-login for security

## Development Guidelines

### Authentication State Management
```typescript
// Use centralized auth store
const useAuth = () => {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  
  const handleLogin = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      login(response.user, response.accessToken);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  return { user, isAuthenticated, handleLogin, logout };
};
```

### Form Validation Patterns
- Use real-time validation for immediate feedback
- Validate on blur for required fields
- Show success states for valid inputs
- Provide specific error messages for each validation rule

### Security Best Practices
- Never store passwords in plain text
- Use HTTPS for all authentication endpoints
- Implement proper CORS policies
- Sanitize all user inputs
- Use secure, httpOnly cookies for tokens where possible

### Testing Considerations
- Mock authentication services in tests
- Test various error scenarios
- Verify form validation logic
- Test session timeout handling
- Validate accessibility features

## Troubleshooting

### Common Issues

1. **Login fails with valid credentials**
   - Check API endpoint configuration
   - Verify CORS settings
   - Check network connectivity
   - Validate token handling

2. **Session expires too quickly**
   - Check token expiration settings
   - Verify refresh token implementation
   - Review inactivity timeout configuration

3. **Password reset emails not received**
   - Check email service configuration
   - Verify email address format
   - Check spam folder
   - Confirm SMTP settings

4. **Profile updates not saving**
   - Check form validation
   - Verify API permissions
   - Check file upload limits (for avatars)
   - Review network requests

### Debug Tips

1. **Authentication Issues**:
   - Check browser console for API errors
   - Verify token storage in localStorage/sessionStorage
   - Use browser dev tools Network tab
   - Check for CORS errors

2. **Form Validation Issues**:
   - Add console logs to validation functions
   - Test edge cases with various inputs
   - Verify regex patterns
   - Check error state management

3. **Session Management Issues**:
   - Monitor token expiration times
   - Check refresh token logic
   - Verify logout cleanup
   - Test browser tab scenarios

### Environment Configuration

Required environment variables:
```
NEXT_PUBLIC_API_BASE_URL=your_api_base_url
NEXT_PUBLIC_TOKEN_STORAGE_KEY=auth_tokens
NEXT_PUBLIC_SESSION_TIMEOUT=3600000
NEXT_PUBLIC_REMEMBER_ME_DURATION=2592000000
```

## Future Enhancements

### Planned Features
- [ ] Two-factor authentication (2FA)
- [ ] Social login integration (Google, Microsoft)
- [ ] Biometric authentication support
- [ ] Single Sign-On (SSO) integration
- [ ] Account recovery questions
- [ ] Login history tracking
- [ ] Device management
- [ ] Advanced security notifications

### Security Improvements
- [ ] Account lockout policies
- [ ] Suspicious activity detection
- [ ] IP whitelisting/blacklisting
- [ ] Advanced password policies
- [ ] Session monitoring
- [ ] Security audit logs

### User Experience Enhancements
- [ ] Progressive web app (PWA) support
- [ ] Offline authentication capability
- [ ] Dark mode for auth pages
- [ ] Multiple language support
- [ ] Advanced profile customization
- [ ] Notification preferences

---

## Maintenance Notes

**Last Updated**: October 15, 2025
**Version**: 2.0
**Maintained By**: VMS Development Team
**Security Review**: Quarterly

### Security Checklist
- [ ] Regular security dependency updates
- [ ] Token expiration policy review
- [ ] Password policy effectiveness assessment
- [ ] Authentication flow security audit
- [ ] Error message security review

For security concerns or authentication issues, please contact the security team immediately.

For questions or contributions, please refer to the main project documentation or contact the development team.
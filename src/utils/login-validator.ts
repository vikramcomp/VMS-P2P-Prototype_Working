/**
 * Simplified Login Form Validation
 * Covers basic and intermediate validation scenarios
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  strength?: "weak" | "medium" | "strong";
}

export class LoginValidator {
  /**
   * Basic Email Validation
   */
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];

    // Required check
    if (!email || email.trim() === "") {
      errors.push("Email is required");
      return { isValid: false, errors };
    }

    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push("Please enter a valid email address");
    }

    // Length validation
    if (email.length > 254) {
      errors.push("Email address is too long");
    }

    // Advanced email format validation
    const advancedEmailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (email && !advancedEmailRegex.test(email)) {
      errors.push("Email contains invalid characters");
    }

    // Check for consecutive dots
    if (email.includes("..")) {
      errors.push("Email cannot contain consecutive dots");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Password Validation with Strength Assessment
   */
  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    // Required check
    if (!password || password.trim() === "") {
      errors.push("Password is required");
      return { isValid: false, errors };
    }

    // Length validation (7-30 characters)
    if (password.length < 7) {
      errors.push("Password must be at least 7 characters long");
    }

    if (password.length > 30) {
      errors.push("Password must not exceed 30 characters");
    }

    // Character variety checks for strength assessment
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
      password
    );

    // Calculate strength score
    let strengthScore = 0;
    if (hasLowercase) strengthScore += 1;
    if (hasNumbers) strengthScore += 1;
    if (hasSpecialChars) strengthScore += 1;
    if (password.length >= 12) strengthScore += 1;

    // Determine strength
    let strength: "weak" | "medium" | "strong" = "weak";
    if (strengthScore >= 3) {
      strength = "strong";
    } else if (strengthScore >= 2) {
      strength = "medium";
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength,
    };
  }

  /**
   * Combined form validation
   */
  static validateLoginForm(
    email: string,
    password: string
  ): {
    email: ValidationResult;
    password: ValidationResult;
    overall: { isValid: boolean };
  } {
    const emailResult = this.validateEmail(email);
    const passwordResult = this.validatePassword(password);

    return {
      email: emailResult,
      password: passwordResult,
      overall: {
        isValid: emailResult.isValid && passwordResult.isValid,
      },
    };
  }
}

/**
 * Debounced validation hook for onBlur validation
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

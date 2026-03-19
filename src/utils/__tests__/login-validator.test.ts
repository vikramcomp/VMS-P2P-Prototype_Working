/**
 * Tests for Login Validator
 */

import { LoginValidator, debounce } from '../login-validator';

describe('LoginValidator', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      const result = LoginValidator.validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty email', () => {
      const result = LoginValidator.validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required');
    });

    it('should reject email without @', () => {
      const result = LoginValidator.validateEmail('testexample.com');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject email without domain', () => {
      const result = LoginValidator.validateEmail('test@');
      expect(result.isValid).toBe(false);
    });

    it('should reject too long email', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = LoginValidator.validateEmail(longEmail);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email address is too long');
    });

    it('should reject email with consecutive dots', () => {
      const result = LoginValidator.validateEmail('test..user@example.com');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email cannot contain consecutive dots');
    });

    it('should accept valid email with subdomain', () => {
      const result = LoginValidator.validateEmail('test@mail.example.com');
      expect(result.isValid).toBe(true);
    });

    it('should accept email with plus sign', () => {
      const result = LoginValidator.validateEmail('test+tag@example.com');
      expect(result.isValid).toBe(true);
    });

    it('should accept email with numbers', () => {
      const result = LoginValidator.validateEmail('user123@example.com');
      expect(result.isValid).toBe(true);
    });

    it('should accept email with dots', () => {
      const result = LoginValidator.validateEmail('first.last@example.com');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('should validate correct password', () => {
      const result = LoginValidator.validatePassword('password123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.strength).toBeDefined();
    });

    it('should reject empty password', () => {
      const result = LoginValidator.validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });

    it('should reject password too short', () => {
      const result = LoginValidator.validatePassword('abc12');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 7 characters long');
    });

    it('should reject password too long', () => {
      const result = LoginValidator.validatePassword('a'.repeat(31));
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must not exceed 30 characters');
    });

    it('should assess weak password', () => {
      const result = LoginValidator.validatePassword('password');
      expect(result.strength).toBe('weak');
    });

    it('should assess medium password', () => {
      const result = LoginValidator.validatePassword('password123');
      expect(result.strength).toBe('medium');
    });

    it('should assess strong password', () => {
      const result = LoginValidator.validatePassword('Password123!@#');
      expect(result.strength).toBe('strong');
    });

    it('should accept password with lowercase and numbers', () => {
      const result = LoginValidator.validatePassword('password123');
      expect(result.isValid).toBe(true);
    });

    it('should accept password with special characters', () => {
      const result = LoginValidator.validatePassword('pass@123');
      expect(result.isValid).toBe(true);
    });

    it('should give higher strength to long passwords', () => {
      const result = LoginValidator.validatePassword('averylongpassword123!');
      expect(result.strength).toBe('strong');
    });
  });

  describe('validateLoginForm', () => {
    it('should validate correct login form', () => {
      const result = LoginValidator.validateLoginForm('test@example.com', 'password123');
      expect(result.overall.isValid).toBe(true);
      expect(result.email.isValid).toBe(true);
      expect(result.password.isValid).toBe(true);
    });

    it('should reject form with invalid email', () => {
      const result = LoginValidator.validateLoginForm('invalid-email', 'password123');
      expect(result.overall.isValid).toBe(false);
      expect(result.email.isValid).toBe(false);
      expect(result.password.isValid).toBe(true);
    });

    it('should reject form with invalid password', () => {
      const result = LoginValidator.validateLoginForm('test@example.com', 'short');
      expect(result.overall.isValid).toBe(false);
      expect(result.email.isValid).toBe(true);
      expect(result.password.isValid).toBe(false);
    });

    it('should reject form with both invalid', () => {
      const result = LoginValidator.validateLoginForm('', '');
      expect(result.overall.isValid).toBe(false);
      expect(result.email.isValid).toBe(false);
      expect(result.password.isValid).toBe(false);
    });

    it('should return all validation results', () => {
      const result = LoginValidator.validateLoginForm('test@example.com', 'password123');
      expect(result.email).toBeDefined();
      expect(result.password).toBeDefined();
      expect(result.overall).toBeDefined();
      expect(result.password.strength).toBeDefined();
    });
  });
});

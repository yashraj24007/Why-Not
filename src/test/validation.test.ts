import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateCGPA,
  validateYear,
  validateRequired,
  validateURL,
  validateLoginForm,
  validateSignupForm,
} from '../utils/validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should return null for valid email', () => {
      expect(validateEmail('test@example.com')).toBeNull();
      expect(validateEmail('user.name+tag@example.co.uk')).toBeNull();
    });

    it('should return error for empty email', () => {
      const result = validateEmail('');
      expect(result).not.toBeNull();
      expect(result?.message).toBe('Email is required');
    });

    it('should return error for invalid email format', () => {
      const result = validateEmail('invalid-email');
      expect(result).not.toBeNull();
      expect(result?.message).toContain('valid email');
    });

    it('should return error for email without domain', () => {
      const result = validateEmail('test@');
      expect(result).not.toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('should return null for valid password', () => {
      expect(validatePassword('StrongPass123')).toBeNull();
      expect(validatePassword('MyP@ssw0rd!')).toBeNull();
    });

    it('should return error for empty password', () => {
      const result = validatePassword('');
      expect(result).not.toBeNull();
      expect(result?.message).toBe('Password is required');
    });

    it('should return error for short password', () => {
      const result = validatePassword('Short1');
      expect(result).not.toBeNull();
      expect(result?.message).toContain('8 characters');
    });

    it('should return error for password without uppercase', () => {
      const result = validatePassword('lowercase123');
      expect(result).not.toBeNull();
      expect(result?.message).toContain('uppercase');
    });

    it('should return error for password without lowercase', () => {
      const result = validatePassword('UPPERCASE123');
      expect(result).not.toBeNull();
      expect(result?.message).toContain('lowercase');
    });

    it('should return error for password without number', () => {
      const result = validatePassword('NoNumbers');
      expect(result).not.toBeNull();
      expect(result?.message).toContain('number');
    });
  });

  describe('validateName', () => {
    it('should return null for valid name', () => {
      expect(validateName('John Doe')).toBeNull();
      expect(validateName('Mary Jane Watson')).toBeNull();
    });

    it('should return error for empty name', () => {
      const result = validateName('');
      expect(result).not.toBeNull();
      expect(result?.message).toBe('Name is required');
    });

    it('should return error for name with only whitespace', () => {
      const result = validateName('   ');
      expect(result).not.toBeNull();
    });

    it('should return error for short name', () => {
      const result = validateName('A');
      expect(result).not.toBeNull();
      expect(result?.message).toContain('2 characters');
    });

    it('should return error for name with numbers', () => {
      const result = validateName('John123');
      expect(result).not.toBeNull();
      expect(result?.message).toContain('letters and spaces');
    });

    it('should return error for name with special characters', () => {
      const result = validateName('John@Doe');
      expect(result).not.toBeNull();
    });
  });

  describe('validatePhone', () => {
    it('should return null for valid phone numbers', () => {
      expect(validatePhone('1234567890')).toBeNull();
      expect(validatePhone('+1-234-567-8900')).toBeNull();
      expect(validatePhone('(123) 456-7890')).toBeNull();
    });

    it('should return null for empty phone (optional field)', () => {
      expect(validatePhone('')).toBeNull();
    });

    it('should return error for invalid phone format', () => {
      const result = validatePhone('abc');
      expect(result).not.toBeNull();
      expect(result?.message).toContain('valid phone number');
    });

    it('should return error for too short phone', () => {
      const result = validatePhone('123');
      expect(result).not.toBeNull();
    });
  });

  describe('validateCGPA', () => {
    it('should return null for valid CGPA', () => {
      expect(validateCGPA(7.5)).toBeNull();
      expect(validateCGPA('8.9')).toBeNull();
      expect(validateCGPA(10)).toBeNull();
      expect(validateCGPA(0)).toBeNull();
    });

    it('should return error for empty CGPA', () => {
      const result = validateCGPA('');
      expect(result).not.toBeNull();
      expect(result?.message).toBe('CGPA is required');
    });

    it('should return error for invalid CGPA', () => {
      const result = validateCGPA('abc');
      expect(result).not.toBeNull();
      expect(result?.message).toContain('valid number');
    });

    it('should return error for CGPA below 0', () => {
      const result = validateCGPA(-1);
      expect(result).not.toBeNull();
      expect(result?.message).toContain('between 0 and 10');
    });

    it('should return error for CGPA above 10', () => {
      const result = validateCGPA(11);
      expect(result).not.toBeNull();
      expect(result?.message).toContain('between 0 and 10');
    });
  });

  describe('validateYear', () => {
    it('should return null for valid year', () => {
      expect(validateYear(1)).toBeNull();
      expect(validateYear('3')).toBeNull();
      expect(validateYear(5)).toBeNull();
    });

    it('should return error for empty year', () => {
      const result = validateYear('');
      expect(result).not.toBeNull();
      expect(result?.message).toBe('Year is required');
    });

    it('should return error for year below 1', () => {
      const result = validateYear(0);
      expect(result).not.toBeNull();
      expect(result?.message).toContain('between 1 and 5');
    });

    it('should return error for year above 5', () => {
      const result = validateYear(6);
      expect(result).not.toBeNull();
      expect(result?.message).toContain('between 1 and 5');
    });
  });

  describe('validateRequired', () => {
    it('should return null for non-empty values', () => {
      expect(validateRequired('text', 'field')).toBeNull();
      expect(validateRequired(123, 'field')).toBeNull();
      expect(validateRequired(true, 'field')).toBeNull();
    });

    it('should return error for empty string', () => {
      const result = validateRequired('', 'username');
      expect(result).not.toBeNull();
      expect(result?.message).toContain('username');
    });

    it('should return error for null', () => {
      const result = validateRequired(null, 'field');
      expect(result).not.toBeNull();
    });

    it('should use display name in error message', () => {
      const result = validateRequired('', 'email', 'Email Address');
      expect(result?.message).toBe('Email Address is required');
    });
  });

  describe('validateURL', () => {
    it('should return null for valid URLs', () => {
      expect(validateURL('https://example.com')).toBeNull();
      expect(validateURL('http://test.org/path')).toBeNull();
    });

    it('should return null for empty URL (optional)', () => {
      expect(validateURL('')).toBeNull();
    });

    it('should return error for invalid URL', () => {
      const result = validateURL('not-a-url');
      expect(result).not.toBeNull();
      expect(result?.message).toContain('valid URL');
    });
  });

  describe('validateLoginForm', () => {
    it('should return valid for correct credentials', () => {
      const result = validateLoginForm('test@example.com', 'password123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for empty email', () => {
      const result = validateLoginForm('', 'password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('email');
    });

    it('should return errors for empty password', () => {
      const result = validateLoginForm('test@example.com', '');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('password');
    });

    it('should return multiple errors for invalid inputs', () => {
      const result = validateLoginForm('invalid-email', '');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('validateSignupForm', () => {
    it('should return valid for correct signup data', () => {
      const result = validateSignupForm(
        'John Doe',
        'john@example.com',
        'StrongPass123',
        'StrongPass123',
        'STUDENT'
      );
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for password mismatch', () => {
      const result = validateSignupForm(
        'John Doe',
        'john@example.com',
        'Password123',
        'DifferentPass123',
        'STUDENT'
      );
      expect(result.isValid).toBe(false);
      const passwordError = result.errors.find(e => e.field === 'confirmPassword');
      expect(passwordError?.message).toContain('do not match');
    });

    it('should return error for empty role', () => {
      const result = validateSignupForm(
        'John Doe',
        'john@example.com',
        'Password123',
        'Password123',
        ''
      );
      expect(result.isValid).toBe(false);
      const roleError = result.errors.find(e => e.field === 'role');
      expect(roleError).toBeDefined();
    });

    it('should return multiple errors for invalid data', () => {
      const result = validateSignupForm('', 'invalid-email', 'weak', 'weak', '');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(2);
    });
  });
});

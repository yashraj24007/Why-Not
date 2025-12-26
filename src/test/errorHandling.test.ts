import { describe, it, expect } from 'vitest';
import {
  AppError,
  parseError,
  getUserFriendlyMessage,
  isNetworkError,
  isAuthError,
  formatErrorForDisplay,
} from '../utils/errorHandling';

describe('Error Handling Utilities', () => {
  describe('AppError', () => {
    it('should create error with all properties', () => {
      const error = new AppError('Test error', 'TEST_CODE', 400, { extra: 'data' });
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ extra: 'data' });
      expect(error.name).toBe('AppError');
    });

    it('should work with partial properties', () => {
      const error = new AppError('Simple error');
      expect(error.message).toBe('Simple error');
      expect(error.code).toBeUndefined();
      expect(error.statusCode).toBeUndefined();
    });
  });

  describe('parseError', () => {
    it('should parse AppError instances', () => {
      const error = new AppError('Custom error', 'ERR_001', 500);
      const parsed = parseError(error);
      expect(parsed.message).toBe('Custom error');
      expect(parsed.code).toBe('ERR_001');
      expect(parsed.statusCode).toBe(500);
    });

    it('should parse standard Error instances', () => {
      const error = new Error('Standard error');
      const parsed = parseError(error);
      expect(parsed.message).toBe('Standard error');
    });

    it('should parse Supabase-like errors', () => {
      const error = {
        message: 'Database error',
        code: '23505',
        status: 409,
        details: 'Duplicate key',
      };
      const parsed = parseError(error);
      expect(parsed.message).toBe('Database error');
      expect(parsed.code).toBe('23505');
      expect(parsed.statusCode).toBe(409);
      expect(parsed.details).toBe('Duplicate key');
    });

    it('should parse string errors', () => {
      const parsed = parseError('Simple error string');
      expect(parsed.message).toBe('Simple error string');
    });

    it('should handle unknown errors', () => {
      const parsed = parseError({ unknown: 'format' });
      expect(parsed.message).toContain('unexpected error');
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return network error message', () => {
      const message = getUserFriendlyMessage({ message: 'Network request failed' });
      expect(message).toContain('Network error');
      expect(message).toContain('internet connection');
    });

    it('should return auth error for 401', () => {
      const message = getUserFriendlyMessage({ message: 'Auth failed', statusCode: 401 });
      expect(message).toContain('Session expired');
    });

    it('should return permission error for 403', () => {
      const message = getUserFriendlyMessage({ message: 'Forbidden', statusCode: 403 });
      expect(message).toContain('permission');
    });

    it('should return not found error for 404', () => {
      const message = getUserFriendlyMessage({ message: 'Not found', statusCode: 404 });
      expect(message).toContain('not found');
    });

    it('should return server error for 500', () => {
      const message = getUserFriendlyMessage({ message: 'Server error', statusCode: 500 });
      expect(message).toContain('Server error');
    });

    it('should return duplicate error for constraint violation', () => {
      const message = getUserFriendlyMessage({ message: 'Error', code: '23505' });
      expect(message).toContain('already exists');
    });

    it('should return validation error for invalid input', () => {
      const message = getUserFriendlyMessage({ message: 'Invalid email format' });
      expect(message).toContain('Invalid input');
    });

    it('should return original message if no match', () => {
      const message = getUserFriendlyMessage({ message: 'Specific error message' });
      expect(message).toBe('Specific error message');
    });
  });

  describe('isNetworkError', () => {
    it('should detect network errors', () => {
      expect(isNetworkError(new Error('Network request failed'))).toBe(true);
      expect(isNetworkError(new Error('fetch failed'))).toBe(true);
      expect(isNetworkError(new Error('connection timeout'))).toBe(true);
    });

    it('should return false for non-network errors', () => {
      expect(isNetworkError(new Error('Database error'))).toBe(false);
      expect(isNetworkError(new Error('Validation failed'))).toBe(false);
    });
  });

  describe('isAuthError', () => {
    it('should detect auth errors by status code', () => {
      const error = new AppError('Unauthorized', undefined, 401);
      expect(isAuthError(error)).toBe(true);
    });

    it('should detect auth errors by code', () => {
      const error = { message: 'Auth failed', code: 'PGRST301' };
      expect(isAuthError(error)).toBe(true);
    });

    it('should detect auth errors by message', () => {
      expect(isAuthError(new Error('Unauthorized access'))).toBe(true);
    });

    it('should return false for non-auth errors', () => {
      expect(isAuthError(new Error('Database error'))).toBe(false);
    });
  });

  describe('formatErrorForDisplay', () => {
    it('should format network errors', () => {
      const formatted = formatErrorForDisplay(new Error('Network failed'));
      expect(formatted.title).toBe('Connection Error');
      expect(formatted.action).toContain('internet connection');
    });

    it('should format auth errors', () => {
      const error = new AppError('Unauthorized', undefined, 401);
      const formatted = formatErrorForDisplay(error);
      expect(formatted.title).toBe('Authentication Required');
      expect(formatted.action).toContain('sign in');
    });

    it('should format server errors', () => {
      const error = new AppError('Server error', undefined, 500);
      const formatted = formatErrorForDisplay(error);
      expect(formatted.title).toBe('Server Error');
      expect(formatted.action).toContain('later');
    });

    it('should format generic errors', () => {
      const formatted = formatErrorForDisplay(new Error('Generic error'));
      expect(formatted.title).toBe('Error');
      expect(formatted.message).toBeDefined();
      expect(formatted.action).toBe('Please try again');
    });
  });
});

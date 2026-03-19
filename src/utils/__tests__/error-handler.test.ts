import { errorHandler, APIError } from '../error-handler';
import { logger } from '../logger';
import { envConfig } from '@/config/env-validation';

// Mock logger
jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Mock env config
jest.mock('@/config/env-validation', () => ({
  envConfig: {
    isDevelopment: false,
  },
}));

describe('Error Handler Utility', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    // Default to production mode
    (envConfig as any).isDevelopment = false;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('sanitizeErrorMessage', () => {
    describe('Production Mode', () => {
      beforeEach(() => {
        (envConfig as any).isDevelopment = false;
      });

      it('should return generic message for 400 status', () => {
        const error = errorHandler.createAPIError(400, 'Bad request');
        const message = errorHandler.sanitizeErrorMessage(error);
        
        expect(message).toBe('Invalid request. Please check your input and try again.');
      });

      it('should return generic message for 401 status', () => {
        const error = errorHandler.createAPIError(401, 'Unauthorized');
        const message = errorHandler.sanitizeErrorMessage(error);
        
        expect(message).toBe('You are not authorized to perform this action.');
      });

      it('should return generic message for 403 status', () => {
        const error = errorHandler.createAPIError(403, 'Forbidden');
        const message = errorHandler.sanitizeErrorMessage(error);
        
        expect(message).toBe('Access denied. Please contact your administrator.');
      });

      it('should return generic message for 404 status', () => {
        const error = errorHandler.createAPIError(404, 'Not found');
        const message = errorHandler.sanitizeErrorMessage(error);
        
        expect(message).toBe('The requested resource was not found.');
      });

      it('should return generic message for 500 status', () => {
        const error = errorHandler.createAPIError(500, 'Server error');
        const message = errorHandler.sanitizeErrorMessage(error);
        
        expect(message).toBe('A server error occurred. Please try again later.');
      });

      it('should return generic message for 503 status', () => {
        const error = errorHandler.createAPIError(503, 'Service unavailable');
        const message = errorHandler.sanitizeErrorMessage(error);
        
        expect(message).toBe('Service is temporarily unavailable. Please try again later.');
      });

      it('should return generic message for other status codes', () => {
        const error = errorHandler.createAPIError(502, 'Bad gateway');
        const message = errorHandler.sanitizeErrorMessage(error);
        
        expect(message).toBe('An unexpected error occurred. Please try again.');
      });

      it('should handle network fetch errors', () => {
        const error = new Error('fetch failed: network error');
        const message = errorHandler.sanitizeErrorMessage(error);
        
        expect(message).toBe('Network connection error. Please check your internet connection.');
      });

      it('should handle network connection errors', () => {
        const error = new Error('network connection failed');
        const message = errorHandler.sanitizeErrorMessage(error);
        
        expect(message).toBe('Network connection error. Please check your internet connection.');
      });

      it('should return generic fallback for non-API errors', () => {
        const error = new Error('Some random error');
        const message = errorHandler.sanitizeErrorMessage(error);
        
        expect(message).toBe('An error occurred. Please try again later.');
      });

      it('should handle non-Error objects', () => {
        const error = { message: 'object error' };
        const message = errorHandler.sanitizeErrorMessage(error);
        
        expect(message).toBe('An error occurred. Please try again later.');
      });
    });

    describe('Development Mode', () => {
      beforeEach(() => {
        (envConfig as any).isDevelopment = true;
      });

      it('should return detailed error message for Error objects', () => {
        const error = new Error('Detailed error message');
        const message = errorHandler.sanitizeErrorMessage(error);
        
        expect(message).toBe('Detailed error message');
      });

      it('should convert non-Error to string', () => {
        const error = { code: 'ERROR_CODE', message: 'Error occurred' };
        const message = errorHandler.sanitizeErrorMessage(error);
        
        expect(message).toBe('[object Object]');
      });

      it('should handle string errors', () => {
        const error = 'String error';
        const message = errorHandler.sanitizeErrorMessage(error);
        
        expect(message).toBe('String error');
      });

      it('should handle number errors', () => {
        const error = 404;
        const message = errorHandler.sanitizeErrorMessage(error);
        
        expect(message).toBe('404');
      });
    });
  });

  describe('createAPIError', () => {
    it('should create APIError with all properties', () => {
      const error = errorHandler.createAPIError(404, 'Not found', { resource: 'user' });
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('APIError');
      expect(error.status).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error.details).toEqual({ resource: 'user' });
    });

    it('should create APIError without details', () => {
      const error = errorHandler.createAPIError(500, 'Server error');
      
      expect(error.name).toBe('APIError');
      expect(error.status).toBe(500);
      expect(error.message).toBe('Server error');
      expect(error.details).toBeUndefined();
    });

    it('should create APIError with different status codes', () => {
      const error = errorHandler.createAPIError(401, 'Unauthorized');
      
      expect(error.status).toBe(401);
      expect(error.message).toBe('Unauthorized');
    });
  });

  describe('handleError', () => {
    beforeEach(() => {
      (envConfig as any).isDevelopment = false;
    });

    it('should handle Error objects and log them', () => {
      const error = new Error('Test error');
      const result = errorHandler.handleError(error);

      expect(result).toBeInstanceOf(Error);
      expect(logger.error).toHaveBeenCalledWith(
        'Error occurred',
        error,
        expect.objectContaining({
          stack: error.stack,
        })
      );
    });

    it('should handle Error with context', () => {
      const error = new Error('Test error');
      const result = errorHandler.handleError(error, 'API Call');

      expect(logger.error).toHaveBeenCalledWith(
        '[API Call] Error occurred',
        error,
        expect.objectContaining({
          stack: error.stack,
          context: 'API Call',
        })
      );
    });

    it('should return existing APIError without conversion', () => {
      const apiError = errorHandler.createAPIError(404, 'Not found');
      const result = errorHandler.handleError(apiError);

      expect(result).toBe(apiError);
      expect(result.name).toBe('APIError');
      expect(result.status).toBe(404);
    });

    it('should convert generic errors to APIError', () => {
      const error = new Error('Generic error');
      const result = errorHandler.handleError(error);

      expect(result.name).toBe('APIError');
      expect(result.status).toBe(500);
      expect(result.message).toBe('An error occurred. Please try again later.');
    });

    it('should handle string errors', () => {
      const error = 'String error message';
      const result = errorHandler.handleError(error);

      expect(result).toBeInstanceOf(Error);
      expect(result.name).toBe('APIError');
      expect(result.status).toBe(500);
    });

    it('should handle unknown error types', () => {
      const error = { unknown: 'error' };
      const result = errorHandler.handleError(error);

      expect(result).toBeInstanceOf(Error);
      expect(result.name).toBe('APIError');
    });

    it('should include error details in development mode', () => {
      (envConfig as any).isDevelopment = true;
      const error = new Error('Dev error');
      const result = errorHandler.handleError(error);

      expect(result.details).toBeDefined();
      expect(result.details).toBe(error);
    });

    it('should not include error details in production mode', () => {
      (envConfig as any).isDevelopment = false;
      const error = new Error('Prod error');
      const result = errorHandler.handleError(error);

      expect(result.details).toBeUndefined();
    });
  });

  describe('handleAPIResponse', () => {
    beforeEach(() => {
      (envConfig as any).isDevelopment = false;
    });

    it('should not throw for successful responses', async () => {
      const response = {
        ok: true,
        status: 200,
      } as Response;

      await expect(errorHandler.handleAPIResponse(response)).resolves.not.toThrow();
    });

    it('should throw APIError for failed responses', async () => {
      const response = {
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('Not found'),
      } as any;

      await expect(errorHandler.handleAPIResponse(response)).rejects.toThrow();
    });

    it('should include error details in development mode', async () => {
      (envConfig as any).isDevelopment = true;
      const response = {
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Server error details'),
      } as any;

      try {
        await errorHandler.handleAPIResponse(response);
      } catch (error: any) {
        expect(error.status).toBe(500);
        expect(error.details).toBe('Server error details');
        expect(error.message).toContain('Server error details');
      }
    });

    it('should not include error details in production mode', async () => {
      (envConfig as any).isDevelopment = false;
      const response = {
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Server error details'),
      } as any;

      try {
        await errorHandler.handleAPIResponse(response);
      } catch (error: any) {
        expect(error.status).toBe(500);
        expect(error.details).toBeUndefined();
      }
    });

    it('should handle errors when parsing response text', async () => {
      const response = {
        ok: false,
        status: 500,
        text: jest.fn().mockRejectedValue(new Error('Parse error')),
      } as any;

      try {
        await errorHandler.handleAPIResponse(response);
      } catch (error: any) {
        expect(error.status).toBe(500);
        expect(error.message).toContain('HTTP 500');
      }
    });

    it('should include context in error handling', async () => {
      const response = {
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue('Unauthorized'),
      } as any;

      try {
        await errorHandler.handleAPIResponse(response, 'User Login');
      } catch (error: any) {
        expect(logger.error).toHaveBeenCalledWith(
          expect.stringContaining('[User Login]'),
          expect.any(Error),
          expect.any(Object)
        );
      }
    });

    it('should handle different HTTP status codes', async () => {
      const statuses = [400, 401, 403, 404, 500, 503];

      for (const status of statuses) {
        const response = {
          ok: false,
          status,
          text: jest.fn().mockResolvedValue(`Error ${status}`),
        } as any;

        try {
          await errorHandler.handleAPIResponse(response);
        } catch (error: any) {
          expect(error.status).toBe(status);
        }
      }
    });

    it('should create proper error message format', async () => {
      const response = {
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Bad request'),
      } as any;

      try {
        await errorHandler.handleAPIResponse(response);
      } catch (error: any) {
        expect(error.message).toContain('HTTP 400');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string error', () => {
      const result = errorHandler.handleError('');
      
      expect(result).toBeInstanceOf(Error);
      expect(result.name).toBe('APIError');
    });

    it('should handle error without stack', () => {
      const error = new Error('No stack');
      delete error.stack;
      
      const result = errorHandler.handleError(error);
      
      expect(result).toBeInstanceOf(Error);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle APIError with no status', () => {
      const error = new Error('Test') as APIError;
      error.name = 'APIError';
      
      const message = errorHandler.sanitizeErrorMessage(error);
      
      expect(message).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle objects with no message property', () => {
      const error = { code: 'ERR_001' };
      const result = errorHandler.handleError(error);
      
      expect(result).toBeInstanceOf(Error);
      expect(result.name).toBe('APIError');
    });

    it('should handle numeric errors', () => {
      const error = 404;
      const result = errorHandler.handleError(error);
      
      expect(result).toBeInstanceOf(Error);
      expect(result.name).toBe('APIError');
    });
  });

  describe('Type Checking', () => {
    it('should create proper APIError type', () => {
      const error = errorHandler.createAPIError(404, 'Not found');
      
      const typedError: APIError = error;
      expect(typedError.status).toBe(404);
      expect(typedError.name).toBe('APIError');
    });

    it('should handle APIError interface properly', () => {
      const error: APIError = {
        name: 'APIError',
        message: 'Test',
        status: 500,
        code: 'ERR_500',
        details: { info: 'details' },
      };
      
      expect(error.status).toBe(500);
      expect(error.code).toBe('ERR_500');
      expect(error.details).toEqual({ info: 'details' });
    });
  });
});

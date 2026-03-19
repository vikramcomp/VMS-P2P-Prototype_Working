import { logger } from './logger';
import { envConfig } from '@/config/env-validation';

export interface APIError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

class ErrorHandler {
  /**
   * Sanitize error messages for production
   */
  sanitizeErrorMessage(error: any): string {
    if (envConfig.isDevelopment) {
      // In development, show detailed error messages
      if (error instanceof Error) {
        return error.message;
      }
      return String(error);
    }

    // In production, show generic user-friendly messages
    if (error instanceof Error && error.name === 'APIError') {
      const apiError = error as APIError;
      
      switch (apiError.status) {
        case 400:
          return 'Invalid request. Please check your input and try again.';
        case 401:
          return 'You are not authorized to perform this action.';
        case 403:
          return 'Access denied. Please contact your administrator.';
        case 404:
          return 'The requested resource was not found.';
        case 500:
          return 'A server error occurred. Please try again later.';
        case 503:
          return 'Service is temporarily unavailable. Please try again later.';
        default:
          return 'An unexpected error occurred. Please try again.';
      }
    }

    // Network errors
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return 'Network connection error. Please check your internet connection.';
    }

    // Generic fallback
    return 'An error occurred. Please try again later.';
  }

  /**
   * Create a standardized API error
   */
  createAPIError(status: number, message: string, details?: any): APIError {
    const error = new Error(message) as APIError;
    error.name = 'APIError';
    error.status = status;
    error.details = details;
    return error;
  }

  /**
   * Handle and log errors appropriately
   */
  handleError(error: any, context?: string): APIError {
    const contextMessage = context ? `[${context}] ` : '';
    
    // Log the full error details for debugging
    logger.error(`${contextMessage}Error occurred`, error, {
      stack: error.stack,
      context
    });

    // Return a sanitized error
    if (error instanceof Error && error.name === 'APIError') {
      return error as APIError;
    }

    // Convert generic errors to APIError
    return this.createAPIError(
      500,
      this.sanitizeErrorMessage(error),
      envConfig.isDevelopment ? error : undefined
    );
  }

  /**
   * Handle API response errors
   */
  async handleAPIResponse(response: Response, context?: string): Promise<void> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      let errorDetails: any = undefined;

      try {
        const errorData = await response.text();
        if (envConfig.isDevelopment) {
          errorDetails = errorData;
          errorMessage += `: ${errorData}`;
        }
      } catch {
        // If we can't parse the error response, use generic message
      }

      const apiError = this.createAPIError(response.status, errorMessage, errorDetails);
      throw this.handleError(apiError, context);
    }
  }
}

export const errorHandler = new ErrorHandler();
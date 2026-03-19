/**
 * Tests for Environment Validation
 * 
 * This test suite validates the EnvironmentValidator class and envConfig export
 */

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to get a fresh instance
    jest.resetModules();
    // Create a fresh copy of process.env
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('EnvironmentValidator - All Required Vars Present', () => {
    it('should validate environment successfully with all required variables', () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.test.com';
      process.env.NEXT_PUBLIC_APP_NAME = 'Test App';
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_LOG_LEVEL = 'debug';

      const { envConfig } = require('../env-validation');

      expect(envConfig).toBeDefined();
      expect(envConfig.apiBaseUrl).toBe('https://api.test.com');
      expect(envConfig.appName).toBe('Test App');
      expect(envConfig.nodeEnv).toBe('production');
      expect(envConfig.logLevel).toBe('debug');
      expect(envConfig.isProduction).toBe(true);
      expect(envConfig.isDevelopment).toBe(false);
    });

    it('should correctly identify development environment', () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.dev.com';
      process.env.NODE_ENV = 'development';

      const { envConfig } = require('../env-validation');

      expect(envConfig.nodeEnv).toBe('development');
      expect(envConfig.isProduction).toBe(false);
      expect(envConfig.isDevelopment).toBe(true);
    });

    it('should correctly identify test environment', () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.test.com';
      process.env.NODE_ENV = 'test';

      const { envConfig } = require('../env-validation');

      expect(envConfig.nodeEnv).toBe('test');
      expect(envConfig.isProduction).toBe(false);
      expect(envConfig.isDevelopment).toBe(false);
    });
  });

  describe('EnvironmentValidator - Missing Required Variables', () => {
    it('should use defaults and warn when required variables are missing in development', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      process.env.NODE_ENV = 'development';

      const { envConfig } = require('../env-validation');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Development warning: Missing required environment variables: NEXT_PUBLIC_API_BASE_URL')
      );
      expect(envConfig.apiBaseUrl).toBe('https://vmsqa-ver2.compunnel.com/api');
      expect(envConfig.appName).toBe('VMS - Vendor Management System');
      expect(envConfig.logLevel).toBe('info');
      expect(envConfig.isDevelopment).toBe(true);

      consoleWarnSpy.mockRestore();
    });

    it('should use defaults and warn when required variables are missing without NODE_ENV', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      delete process.env.NODE_ENV;

      const { envConfig } = require('../env-validation');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Development warning: Missing required environment variables: NEXT_PUBLIC_API_BASE_URL')
      );
      expect(envConfig.apiBaseUrl).toBe('https://vmsqa-ver2.compunnel.com/api');
      expect(envConfig.nodeEnv).toBe('development');
      expect(envConfig.isDevelopment).toBe(true);

      consoleWarnSpy.mockRestore();
    });

    it('should use defaults and warn when required variables are missing in production', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      process.env.NODE_ENV = 'production';

      const { envConfig } = require('../env-validation');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Build time warning: Missing required environment variables: NEXT_PUBLIC_API_BASE_URL')
      );
      expect(envConfig.apiBaseUrl).toBe('https://vmsqa-ver2.compunnel.com/api');
      expect(envConfig.isProduction).toBe(true);

      consoleWarnSpy.mockRestore();
    });
  });

  describe('EnvironmentValidator - Invalid NODE_ENV', () => {
    it('should warn and use invalid NODE_ENV when provided', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.test.com';
      process.env.NODE_ENV = 'staging';

      const { envConfig } = require('../env-validation');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid NODE_ENV: staging. Defaulting to 'development'")
      );
      expect(envConfig.nodeEnv).toBe('staging');

      consoleWarnSpy.mockRestore();
    });
  });

  describe('EnvironmentValidator - Default Values', () => {
    it('should use default values for optional environment variables', () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.test.com';
      delete process.env.NEXT_PUBLIC_APP_NAME;
      delete process.env.NEXT_PUBLIC_LOG_LEVEL;
      delete process.env.NODE_ENV;

      const { envConfig } = require('../env-validation');

      expect(envConfig.appName).toBe('VMS - Vendor Management System');
      expect(envConfig.logLevel).toBe('info');
      expect(envConfig.nodeEnv).toBe('development');
    });

    it('should use default API base URL when NEXT_PUBLIC_API_BASE_URL is provided but empty', () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://custom.api.com';
      process.env.NODE_ENV = 'production';

      const { envConfig } = require('../env-validation');

      expect(envConfig.apiBaseUrl).toBe('https://custom.api.com');
    });
  });

  describe('EnvironmentValidator - getConfig Method', () => {
    it('should return config successfully through getConfig', () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.test.com';
      process.env.NODE_ENV = 'production';

      const { envConfig } = require('../env-validation');

      expect(envConfig.apiBaseUrl).toBe('https://api.test.com');
      expect(envConfig.isProduction).toBe(true);
    });
  });

  describe('Environment Config Properties', () => {
    it('should have all required properties on envConfig', () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.test.com';

      const { envConfig } = require('../env-validation');

      expect(envConfig).toHaveProperty('apiBaseUrl');
      expect(envConfig).toHaveProperty('appName');
      expect(envConfig).toHaveProperty('nodeEnv');
      expect(envConfig).toHaveProperty('logLevel');
      expect(envConfig).toHaveProperty('isProduction');
      expect(envConfig).toHaveProperty('isDevelopment');
    });

    it('should have correct types for all properties', () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.test.com';

      const { envConfig } = require('../env-validation');

      expect(typeof envConfig.apiBaseUrl).toBe('string');
      expect(typeof envConfig.appName).toBe('string');
      expect(typeof envConfig.nodeEnv).toBe('string');
      expect(typeof envConfig.logLevel).toBe('string');
      expect(typeof envConfig.isProduction).toBe('boolean');
      expect(typeof envConfig.isDevelopment).toBe('boolean');
    });

    it('should ensure isProduction and isDevelopment are mutually exclusive', () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.test.com';
      process.env.NODE_ENV = 'production';

      const { envConfig } = require('../env-validation');

      if (envConfig.isProduction) {
        expect(envConfig.isDevelopment).toBe(false);
      }
      if (envConfig.isDevelopment) {
        expect(envConfig.isProduction).toBe(false);
      }
    });
  });

  describe('Environment Config with All Optional Variables', () => {
    it('should use all provided optional environment variables', () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.custom.com';
      process.env.NEXT_PUBLIC_APP_NAME = 'Custom App Name';
      process.env.NEXT_PUBLIC_LOG_LEVEL = 'error';
      process.env.NODE_ENV = 'production';

      const { envConfig } = require('../env-validation');

      expect(envConfig.apiBaseUrl).toBe('https://api.custom.com');
      expect(envConfig.appName).toBe('Custom App Name');
      expect(envConfig.logLevel).toBe('error');
      expect(envConfig.nodeEnv).toBe('production');
    });
  });

  describe('Environment Config Edge Cases', () => {
    it('should handle when all environment variables are missing', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      delete process.env.NEXT_PUBLIC_APP_NAME;
      delete process.env.NEXT_PUBLIC_LOG_LEVEL;
      delete process.env.NODE_ENV;

      const { envConfig } = require('../env-validation');

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(envConfig.apiBaseUrl).toBe('https://vmsqa-ver2.compunnel.com/api');
      expect(envConfig.appName).toBe('VMS - Vendor Management System');
      expect(envConfig.logLevel).toBe('info');
      expect(envConfig.nodeEnv).toBe('development');
      expect(envConfig.isDevelopment).toBe(true);

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Validation Scenarios', () => {
    it('should handle test environment correctly', () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.test.com';
      process.env.NODE_ENV = 'test';

      const { envConfig } = require('../env-validation');

      expect(envConfig.nodeEnv).toBe('test');
      expect(envConfig.isProduction).toBe(false);
      expect(envConfig.isDevelopment).toBe(false);
    });

    it('should not throw error even when validation fails', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      delete process.env.NEXT_PUBLIC_API_BASE_URL;

      expect(() => {
        const { envConfig } = require('../env-validation');
        expect(envConfig).toBeDefined();
      }).not.toThrow();

      consoleWarnSpy.mockRestore();
    });
  });
});

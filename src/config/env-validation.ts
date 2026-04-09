interface EnvironmentConfig {
  apiBaseUrl: string;
  appName: string;
  nodeEnv: string;
  logLevel: string;
  isProduction: boolean;
  isDevelopment: boolean;
}

class EnvironmentValidator {
  private readonly requiredEnvVars = [
    'NEXT_PUBLIC_API_BASE_URL'
  ];

  private readonly optionalEnvVars = [
    'NEXT_PUBLIC_APP_NAME',
    'NEXT_PUBLIC_LOG_LEVEL',
    'NODE_ENV'
  ];

  validateEnvironment(): EnvironmentConfig {
    const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    
    // Check required environment variables
    const missingVars = this.requiredEnvVars.filter(
      varName => !process.env[varName]
    );

    if (missingVars.length > 0 && !isDev) {
      console.warn(`Build time warning: Missing environment variables: ${missingVars.join(', ')}. Using defaults.`);
    }

    const nodeEnv = process.env.NODE_ENV || 'development';

    return {
      apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vmsqa-ver2.compunnel.com/api',
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'VMS - Vendor Management System',
      nodeEnv,
      logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
      isProduction: nodeEnv === 'production',
      isDevelopment: nodeEnv === 'development'
    };
  }

  getConfig(): EnvironmentConfig {
    try {
      return this.validateEnvironment();
    } catch (error) {
      // In production, we might want to use fallback values
      if (process.env.NODE_ENV === 'production') {
        console.error('Environment validation failed in production:', error);
        // You might want to use fallback configuration here
      }
      throw error;
    }
  }
}

const envValidator = new EnvironmentValidator();

export const envConfig = envValidator.getConfig();
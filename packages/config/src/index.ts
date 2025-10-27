export interface AppConfig {
  apiUrl: string;
  mockMode: boolean;
  environment: 'development' | 'staging' | 'production';
  version: string;
}

export interface ApiEndpoints {
  health: string;
  cms: string;
  auth: string;
  users: string;
  agents: string;
  products: string;
  requests: string;
}

// Runtime environment detection compatible with RN and Node
const IS_DEV = (typeof __DEV__ !== 'undefined' && __DEV__) ||
  (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production');

// Clerk keys (do not use SDK client-side; export for backend/use-in-services only)
export const clerkPublishableKey = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) || '';
export const clerkSecretKey = (typeof process !== 'undefined' && process.env && process.env.CLERK_SECRET_KEY) || '';

// Default configuration
const defaultConfig: AppConfig = {
  apiUrl: 'http://localhost:3000',
  mockMode: __DEV__ || false,
  environment: __DEV__ ? 'development' : 'production',
  version: '1.0.0',
};

// API endpoints configuration
export const apiEndpoints: ApiEndpoints = {
  health: '/healthz',
  cms: '/cms',
  auth: '/auth',
  users: '/users',
  agents: '/agents',
  products: '/products',
  requests: '/requests',
};

// Environment-specific configurations
const configs = {
  development: {
    ...defaultConfig,
    apiUrl: 'http://localhost:8080',
    mockMode: false,
  },
  staging: {
    ...defaultConfig,
    apiUrl: 'https://staging-api.iconcomputer.com',
    mockMode: false,
    environment: 'staging' as const,
  },
  production: {
    ...defaultConfig,
    apiUrl: 'https://api.iconcomputer.com',
    mockMode: false,
    environment: 'production' as const,
  },
};

// Get configuration based on environment
export const getConfig = (env?: string): AppConfig => {
  const environment = env || (__DEV__ ? 'development' : 'production');
  return configs[environment as keyof typeof configs] || configs.development;
};

// Export default config
export const config = getConfig();

// Utility functions
export const isProduction = () => config.environment === 'production';
export const isDevelopment = () => config.environment === 'development';
export const isMockMode = () => config.mockMode;

// API URL builder
export const buildApiUrl = (endpoint: keyof ApiEndpoints): string => {
  return `${config.apiUrl}${apiEndpoints[endpoint]}`;
};

// Re-export all types
export * from './types';

export default config;
/**
 * Global environment utilities
 * Available anywhere in the codebase for environment checks
 */

/**
 * Check if the application is running in production mode
 * @returns {boolean} True if NODE_ENV is 'production'
 */
export const inProduction = () => {
  return process.env.NODE_ENV === 'production'
}

/**
 * Check if the application is running in development mode
 * @returns {boolean} True if NODE_ENV is not 'production'
 */
export const isDevelopment = () => {
  return !inProduction()
}

/**
 * Get the current environment name
 * @returns {string} The current NODE_ENV value
 */
export const getEnvironment = () => {
  return process.env.NODE_ENV || 'development'
}

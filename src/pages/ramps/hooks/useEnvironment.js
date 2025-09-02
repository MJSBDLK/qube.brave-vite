// app/ramps/hooks/useEnvironment.js

/**
 * Simple environment and testing utilities
 * Can be used across all components without provider setup
 */

import { inProduction, isDevelopment } from '../../../utils/environment'

// Global testing mode - change this to toggle testing features site-wide
const TESTING_MODE_ENABLED = false

/**
 * Hook for environment and testing state
 * @returns {Object} Environment utilities
 */
export const useEnvironment = () => {
  const isProduction = inProduction()
  const testingMode = !isProduction && TESTING_MODE_ENABLED
  
  return {
    isProduction,
    isDevelopment: !isProduction,
    testingMode,
    inProduction, // Export the function too for direct use
  }
}

// Export individual utilities for direct import if preferred
export { inProduction, isDevelopment }
export const getTestingMode = () => !inProduction() && TESTING_MODE_ENABLED

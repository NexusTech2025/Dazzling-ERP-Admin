/**
 * Global API Configuration Hub
 * Change the VITE_API_BASE_URL in the .env file to update endpoints.
 */

const API_CONFIG = {
  // Base URL from environment variables (Vite requires VITE_ prefix)
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  
  // Always run in REAL mode
  MODE: import.meta.env.VITE_API_MODE || 'REAL',

  // Global Endpoints
  ENDPOINTS: {
    COURSES: '/courses',
    TEACHERS: '/teachers',
    STUDENTS: '/students',
    BATCHES: '/batches',
    FINANCE: '/finance',
    AUTH: '/auth'
  },

  // Default Request Options
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

/**
 * Utility to construct full URLs
 * @param {string} endpointKey - The specific endpoint key from API_CONFIG.ENDPOINTS
 * @returns {string} The full concatenated URL
 */
export const getFullUrl = (endpointKey) => {
  const path = API_CONFIG.ENDPOINTS[endpointKey] || '';
  return `${API_CONFIG.BASE_URL}${path}`;
};

export default API_CONFIG;

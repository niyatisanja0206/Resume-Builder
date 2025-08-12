// Auth utility functions

/**
 * Check if a JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true; // If we can't parse the token, consider it expired
  }
};

/**
 * Get the token from localStorage and check if it's valid
 */
export const getValidToken = (): string | null => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
  }
  
  if (isTokenExpired(token)) {
    // Remove expired token
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
  
  return token;
};

/**
 * Make an authenticated API request
 */
export const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const token = getValidToken();
  
  if (!token) {
    throw new Error('No valid authentication token available. Please log in again.');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
};

// Utility functions for JWT token handling

export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    
    // JWT tokens have 3 parts separated by dots
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    // Error decoding JWT token
    return null;
  }
};

export const getUserIdFromToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  
  const decoded = decodeJWT(token);
  return decoded?.sub || decoded?.userId || decoded?.id || null;
};

export const isTokenExpired = (token) => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Centralized API configuration
// This file handles the API base URL configuration for the entire application

/**
 * Get the API base URL
 * Priority order:
 * 1. Environment variable REACT_APP_API_BASE_URL
 * 2. Check if accessing from external device (use network IP)
 * 3. Fallback to localhost for local development
 */
const getApiBaseUrl = () => {
  // Force production API URL when deployed
  if (window.location.hostname === '98.86.48.169') {
    return 'http://98.86.48.169:8091/api';
  }
  
  // Check for environment variable first
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // If accessing from external device (not localhost), use network IP
  const hostname = window.location.hostname;
  
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    // Use the same IP that the frontend is accessed from
    return `http://${hostname}:8091/api`;
  }
  
  // Default to localhost for local development
  return 'http://localhost:8091/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Export for use in components
const apiConfig = {
  baseURL: API_BASE_URL,
  
  // Utility methods for common endpoints
  auth: {
    signin: `${API_BASE_URL}/auth/signin`,
    signup: `${API_BASE_URL}/auth/signup`,
    verifyEmail: `${API_BASE_URL}/auth/verify-email`,
    resendVerification: `${API_BASE_URL}/auth/resend-verification`,
    verificationStatus: `${API_BASE_URL}/auth/verification-status`
  },
  
  upload: {
    photo: `${API_BASE_URL}/upload/photo`
  },
  
  users: {
    matches: `${API_BASE_URL}/users/matches`,
    profilePicture: `${API_BASE_URL}/users/profile-picture`,
    profile: `${API_BASE_URL}/users/profile`,
    stats: `${API_BASE_URL}/users/stats`
  },
  
  matching: {
    matches: `${API_BASE_URL}/matching/matches`,
    suggestions: `${API_BASE_URL}/matching/suggestions`,
    action: (action, userId) => `${API_BASE_URL}/matching/${action}/${userId}`
  },
  
  messages: {
    conversation: (userId) => `${API_BASE_URL}/messages/conversation/${userId}`,
    send: `${API_BASE_URL}/messages/send`,
    unlock: `${API_BASE_URL}/messages/unlock`
  },
  
  payment: {
    coins: `${API_BASE_URL}/payment/coins`,
    packages: `${API_BASE_URL}/payment/packages`,
    purchase: `${API_BASE_URL}/payment/purchase`
  },
  
  photos: {
    user: (userId) => `${API_BASE_URL}/photos/user/${userId}`,
    myPhotos: `${API_BASE_URL}/photos/my-photos`,
    add: `${API_BASE_URL}/photos/add`,
    delete: (photoId) => `${API_BASE_URL}/photos/${photoId}`,
    setPrimary: (photoId) => `${API_BASE_URL}/photos/primary/${photoId}`,
    count: `${API_BASE_URL}/photos/count`
  }
};

export default apiConfig;

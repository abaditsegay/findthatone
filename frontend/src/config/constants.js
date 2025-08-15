/**
 * Frontend application constants
 */
export const APP_CONSTANTS = {
  // UI Constants
  MAX_PHOTOS_PER_USER: 6,
  PLACEHOLDER_AVATAR: '/placeholder-avatar.svg',
  DEFAULT_AVATAR: '/avatars/avatar1.svg',
  
  // Validation
  MIN_AGE: 18,
  MAX_AGE: 100,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_BIO_LENGTH: 10,
  MAX_BIO_LENGTH: 500,
  MIN_LOCATION_LENGTH: 2,
  MAX_LOCATION_LENGTH: 100,
  MIN_INTERESTS: 1,
  MAX_INTERESTS: 10,

  // Timing
  SWIPE_ANIMATION_DURATION: 300,
  IMAGE_LOAD_TIMEOUT: 5000,
  DEBOUNCE_DELAY: 300,

  // Messages
  LOADING_MATCHES: 'Loading potential matches...',
  NO_MATCHES: 'No more potential matches!',
  ERROR_LOADING: 'Failed to load data',
  AUTH_REQUIRED: 'Authentication required',
  PHOTO_LIMIT_MESSAGE: 'You can upload up to 6 photos',

  // Gender Options
  GENDER_OPTIONS: [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' },
    { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' }
  ],

  // Interest Categories (for suggestion)
  SUGGESTED_INTERESTS: [
    'Travel', 'Music', 'Movies', 'Sports', 'Reading', 'Cooking',
    'Photography', 'Art', 'Technology', 'Fitness', 'Dancing',
    'Hiking', 'Gaming', 'Fashion', 'Food', 'Animals', 'Nature',
    'Politics', 'Science', 'History', 'Literature', 'Yoga'
  ],

  // API Endpoints (base paths)
  API_ENDPOINTS: {
    AUTH: '/api/auth',
    USERS: '/api/users',
    PHOTOS: '/api/photos',
    MATCHING: '/api/matching',
    ADMIN: '/api/admin'
  }
};

/**
 * Responsive breakpoints
 */
export const BREAKPOINTS = {
  MOBILE: '768px',
  TABLET: '1024px',
  DESKTOP: '1200px'
};

/**
 * Theme colors (can be moved to CSS variables)
 */
export const COLORS = {
  PRIMARY: '#667eea',
  SECONDARY: '#764ba2',
  SUCCESS: '#4CAF50',
  ERROR: '#f44336',
  WARNING: '#ff9800',
  INFO: '#2196f3',
  LIGHT: '#f5f5f5',
  DARK: '#333333'
};

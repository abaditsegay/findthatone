/**
 * Validation utilities for form inputs and data
 */

export const ValidationUtils = {
  /**
   * Validate email format
   */
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate password strength
   */
  isValidPassword: (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  /**
   * Validate age range
   */
  isValidAge: (age) => {
    const ageNum = parseInt(age);
    return !isNaN(ageNum) && ageNum >= 18 && ageNum <= 100;
  },

  /**
   * Validate bio length
   */
  isValidBio: (bio) => {
    return bio && bio.trim().length >= 10 && bio.trim().length <= 500;
  },

  /**
   * Validate name format
   */
  isValidName: (name) => {
    return name && name.trim().length >= 2 && name.trim().length <= 50;
  },

  /**
   * Validate location format
   */
  isValidLocation: (location) => {
    return location && location.trim().length >= 2 && location.trim().length <= 100;
  },

  /**
   * Validate interests
   */
  isValidInterests: (interests) => {
    if (!interests) return false;
    const interestList = interests.split(',').map(i => i.trim()).filter(i => i.length > 0);
    return interestList.length >= 1 && interestList.length <= 10;
  },

  /**
   * Get validation errors for user profile
   */
  getProfileValidationErrors: (profile) => {
    const errors = {};

    if (!ValidationUtils.isValidName(profile.name)) {
      errors.name = 'Name must be between 2 and 50 characters';
    }

    if (!ValidationUtils.isValidAge(profile.age)) {
      errors.age = 'Age must be between 18 and 100';
    }

    if (!ValidationUtils.isValidLocation(profile.location)) {
      errors.location = 'Location must be between 2 and 100 characters';
    }

    if (profile.bio && !ValidationUtils.isValidBio(profile.bio)) {
      errors.bio = 'Bio must be between 10 and 500 characters';
    }

    if (profile.interests && !ValidationUtils.isValidInterests(profile.interests)) {
      errors.interests = 'Please add 1-10 interests, separated by commas';
    }

    return errors;
  },

  /**
   * Check if profile is complete for matching
   */
  isProfileComplete: (profile) => {
    return profile.name && 
           profile.age && 
           profile.location && 
           profile.bio && 
           profile.interests &&
           Object.keys(ValidationUtils.getProfileValidationErrors(profile)).length === 0;
  }
};

/**
 * Form state management utilities
 */
export const FormUtils = {
  /**
   * Create initial form state with validation
   */
  createFormState: (initialData = {}) => {
    return {
      data: { ...initialData },
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true
    };
  },

  /**
   * Update form field with validation
   */
  updateField: (formState, fieldName, value, validator) => {
    const newData = { ...formState.data, [fieldName]: value };
    const newTouched = { ...formState.touched, [fieldName]: true };
    
    let newErrors = { ...formState.errors };
    if (validator) {
      const error = validator(value);
      if (error) {
        newErrors[fieldName] = error;
      } else {
        delete newErrors[fieldName];
      }
    }

    return {
      ...formState,
      data: newData,
      touched: newTouched,
      errors: newErrors,
      isValid: Object.keys(newErrors).length === 0
    };
  },

  /**
   * Validate entire form
   */
  validateForm: (formState, validators) => {
    const newErrors = {};
    const newTouched = {};

    Object.keys(validators).forEach(fieldName => {
      newTouched[fieldName] = true;
      const value = formState.data[fieldName];
      const error = validators[fieldName](value);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    return {
      ...formState,
      errors: newErrors,
      touched: newTouched,
      isValid: Object.keys(newErrors).length === 0
    };
  }
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Dialog from './Dialog';
import { useDialog } from '../hooks/useDialog';
import apiConfig from '../config/api';
import './Auth.css';

function Register({ onRegister }) {
  const {
    dialogState,
    hideDialog,
    showSuccess,
    showError
  } = useDialog();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    location: '',
    bio: '',
    interests: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (profilePhotoPreview) {
        URL.revokeObjectURL(profilePhotoPreview);
      }
    };
  }, [profilePhotoPreview]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    
    // Clean up previous preview URL to prevent memory leaks
    if (profilePhotoPreview) {
      URL.revokeObjectURL(profilePhotoPreview);
    }
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      setProfilePhoto(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfilePhotoPreview(previewUrl);
    } else {
      setProfilePhoto(null);
      setProfilePhotoPreview(null);
    }
  };

  const uploadPhoto = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setPhotoUploading(true);
      
      const response = await axios.post(apiConfig.upload.photo, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.url;
    } catch (error) {
      // More specific error messages
      if (error.response?.status === 413) {
        throw new Error('File is too large. Please choose a smaller image (max 10MB).');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.error || 'Invalid file format. Please use JPG, PNG, or WEBP.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error during upload. Please try again.');
      } else {
        throw new Error(error.response?.data?.error || 'Failed to upload photo. Please try again.');
      }
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.age < 18) {
      setError('You must be at least 18 years old');
      return;
    }

    if (!profilePhoto) {
      setError('Please upload a profile picture');
      return;
    }

    setLoading(true);

    try {
      // First upload the profile photo
      const profilePhotoUrl = await uploadPhoto(profilePhoto);

      const registerData = {
        ...formData,
        age: parseInt(formData.age),
        profilePhotoUrl: profilePhotoUrl
      };
      delete registerData.confirmPassword;

      const response = await axios.post(apiConfig.auth.signup, registerData);
      
      // Registration successful, show message and redirect to email verification
      if (response.status === 200) {
        const responseData = response.data;
        
        if (responseData.requiresVerification) {
          showSuccess(
            'Registration Successful!', 
            'Please check your email for verification instructions. You\'ll need to verify your email before you can sign in.',
            () => {
              window.location.href = `/verify-email?email=${encodeURIComponent(formData.email)}`;
            }
          );
        } else {
          // Fallback for older registration flow
          showSuccess(
            'Registration Successful!', 
            'Please login with your credentials to start discovering your matches.',
            () => {
              window.location.href = '/login';
            }
          );
        }
      }
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.message === 'Failed to upload photo') {
        errorMessage = 'Failed to upload profile picture. Please try again with a different image.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data;
      }
      
      showError('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <h1>Join FindThatOne</h1>
          <p>Create your profile and start finding meaningful connections.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="18"
                max="100"
                placeholder="Age"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                placeholder="Create password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm password"
              />
            </div>
          </div>

          {/* Profile Photo Upload Section */}
          <div className="form-group photo-upload-section">
            <label htmlFor="profilePhoto">Profile Picture *</label>
            <div className="photo-upload-container">
              {profilePhotoPreview ? (
                <div className="photo-preview">
                  <img 
                    src={profilePhotoPreview} 
                    alt="Profile preview" 
                    className="preview-image"
                  />
                  <button 
                    type="button" 
                    className="change-photo-btn"
                    onClick={() => document.getElementById('profilePhoto').click()}
                    disabled={photoUploading}
                  >
                    {photoUploading ? 'Uploading...' : 'Change Photo'}
                  </button>
                </div>
              ) : (
                <div className="photo-upload-placeholder">
                  <div className="upload-icon">📷</div>
                  <p>Upload your profile picture</p>
                  <button 
                    type="button" 
                    className="upload-btn"
                    onClick={() => document.getElementById('profilePhoto').click()}
                  >
                    Choose Photo
                  </button>
                </div>
              )}
              <input
                type="file"
                id="profilePhoto"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
                key={profilePhoto ? profilePhoto.name : 'empty'} // Force re-render if needed
              />
            </div>
            <p className="photo-help-text">
              Choose a clear photo that shows your face. This helps others recognize you.
            </p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="City, State"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="interests">Interests</label>
            <input
              type="text"
              id="interests"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              required
              placeholder="e.g. hiking, reading, cooking, music"
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? 
            <Link to="/login" className="auth-link">Sign in here</Link>
          </p>
        </div>
      </div>
      
      <Dialog
        isOpen={dialogState.isOpen}
        type={dialogState.type}
        title={dialogState.title}
        message={dialogState.message}
        onConfirm={dialogState.onConfirm}
        onClose={hideDialog}
        onCancel={hideDialog}
      />
    </div>
  );
}

export default Register;

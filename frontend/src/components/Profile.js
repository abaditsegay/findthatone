import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PhotoGallery from './PhotoGallery';
import { resolveProfilePictureUrl } from '../utils/imageUtils';
import apiConfig from '../config/api';
import './Profile.css';

function Profile({ user, setUser, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bio: '',
    location: '',
    interests: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [userStats, setUserStats] = useState({
    matchesCount: 0,
    likesGivenCount: 0,
    likesReceivedCount: 0,
    isEmailVerified: false
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // Email verification states
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationError, setVerificationError] = useState('');

  // Add a state to track if we've fetched user info
  const [currentUserId, setCurrentUserId] = useState(null);

  // Function to fetch current user info if user ID is missing
  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(apiConfig.users.profile, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setFormData({
          name: userData.name || '',
          age: userData.age || '',
          bio: userData.bio || '',
          location: userData.location || '',
          interests: userData.interests || ''
        });
        setUser(userData);
        return userData.id;
      }
    } catch (error) {
      // Error fetching current user - fail silently for UX
    }
    return null;
  }, [setUser]);

  // Function to fetch user statistics
  const fetchUserStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(apiConfig.users.stats, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const stats = await response.json();
        setUserStats(stats);
      }
    } catch (error) {
      // Error fetching user stats - fail silently for UX
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Email verification functions
  const handleVerifyEmail = useCallback(async (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setVerificationError('Please enter the verification code');
      return;
    }

    setVerificationLoading(true);
    setVerificationError('');
    setVerificationMessage('');

    try {
      const response = await axios.post(apiConfig.auth.verifyEmail, {
        email: user.email,
        code: verificationCode.trim()
      });

      setVerificationMessage(response.data.message);
      setVerificationCode('');
      
      // Update user stats to reflect verification
      await fetchUserStats();
      
      // Update the user object if setUser is available
      if (setUser && user) {
        setUser({
          ...user,
          isEmailVerified: true
        });
      }
    } catch (error) {
      setVerificationError(
        error.response?.data?.error || 
        'Failed to verify email. Please try again.'
      );
    } finally {
      setVerificationLoading(false);
    }
  }, [verificationCode, user, fetchUserStats, setUser]);

  const handleResendVerification = useCallback(async () => {
    setVerificationLoading(true);
    setVerificationError('');
    setVerificationMessage('');

    try {
      const response = await axios.post(apiConfig.auth.resendVerification, {
        email: user.email
      });

      setVerificationMessage(response.data.message);
    } catch (error) {
      setVerificationError(
        error.response?.data?.error || 
        'Failed to resend verification code. Please try again.'
      );
    } finally {
      setVerificationLoading(false);
    }
  }, [user]);

  // Use current user ID if user prop doesn't have an ID
  const effectiveUserId = user?.id || currentUserId;

  // Fetch user data if we don't have complete profile info
  useEffect(() => {
    // Check if we need to fetch complete user data
    const needsCompleteData = !user?.age || !user?.gender || user.bio === undefined;
    
    if ((!user?.id && !currentUserId) || needsCompleteData) {
      fetchCurrentUser();
    }
  }, [user?.id, user?.age, user?.gender, user?.bio, currentUserId, fetchCurrentUser]);

  // Fetch user stats when component mounts or user changes
  useEffect(() => {
    if (user?.id || currentUserId) {
      fetchUserStats();
    }
  }, [user?.id, currentUserId, fetchUserStats]);

  // Initialize form data only when user ID changes to prevent re-renders
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        age: user.age || '',
        bio: user.bio || '',
        location: user.location || '',
        interests: user.interests || ''
      });
      setProfilePictureUrl(user.profilePhotoUrl || '');
    }
  }, [user]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setMessage('');
    setError('');
  }, []);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    if (user) {
      setFormData({
        name: user.name || '',
        age: user.age || '',
        bio: user.bio || '',
        location: user.location || '',
        interests: user.interests || ''
      });
    }
    setMessage('');
    setError('');
  }, [user]);

  const handleImageError = useCallback((e) => {
    e.target.src = '/placeholder-avatar.svg';
  }, []);

  const handleProfilePictureUpdate = useCallback((newPhotoUrl) => {
    setProfilePictureUrl(newPhotoUrl);
    // Update the user object if setUser is available
    if (setUser && user) {
      setUser({
        ...user,
        profilePhotoUrl: newPhotoUrl
      });
    }
  }, [user, setUser]);

  const handlePhotoUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setSelectedFileName('');
      return;
    }
    
    // Set the selected file name for visual feedback
    setSelectedFileName(file.name);
    setUploadingPhoto(true);
    setError('');
    setMessage('');

    try {
      // First, check if user has reached the photo limit
      const token = localStorage.getItem('authToken');
      const photoCountResponse = await fetch(apiConfig.photos.count, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (photoCountResponse.ok) {
        const countData = await photoCountResponse.json();
        if (countData.count >= 6) {
          throw new Error('You have reached the maximum limit of 6 photos. Please delete a photo before uploading a new one.');
        }
      }

      // Upload the file
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(apiConfig.upload.photo, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload photo');
      }

      const uploadResult = await uploadResponse.json();
      const photoUrl = uploadResult.url;

      // Add the photo to user's gallery
      const addPhotoResponse = await fetch(apiConfig.photos.add, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          photoUrl: photoUrl,
          caption: "Profile Picture"
        }),
      });

      if (!addPhotoResponse.ok) {
        const errorData = await addPhotoResponse.json();
        throw new Error(errorData.error || 'Failed to add photo to gallery');
      }

      // Set as profile picture
      const profileResponse = await fetch(apiConfig.users.profilePicture, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          photoUrl: photoUrl
        }),
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.error || 'Failed to set as profile picture');
      }

      // Update local state
      handleProfilePictureUpdate(photoUrl);
      setMessage('Profile picture updated successfully!');

      // Refresh photo gallery if available
      if (typeof window !== 'undefined' && window.location.reload) {
        // Optional: refresh the page to reload the photo gallery
        // You might want to implement a more elegant state update instead
      }

    } catch (err) {
      setError('Failed to upload photo: ' + err.message);
    } finally {
      setUploadingPhoto(false);
      setSelectedFileName('');
      // Clear the file input
      event.target.value = '';
    }
  }, [handleProfilePictureUpdate]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const updateData = {
        ...formData,
        age: parseInt(formData.age)
      };

      const response = await axios.put(
        apiConfig.users.profile,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, setUser]);

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-nav">
        <div className="nav-brand">
          <h2>FindTheOne</h2>
        </div>
        <div className="nav-links">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>
      
      <div className="profile-content">
        <div className="profile-card">
        <div className="profile-header">
          <div className="profile-picture-wrapper">
            <img
              src={resolveProfilePictureUrl(profilePictureUrl)}
              alt="Profile"
              className="profile-picture"
              onError={handleImageError}
            />
            <div className="profile-picture-overlay">
              <label className="change-photo-btn" htmlFor="photo-upload">
                {uploadingPhoto ? 'Uploading...' : 
                 selectedFileName ? `Selected: ${selectedFileName}` : 
                 'Change Photo'}
              </label>
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          <div className="profile-info">
            <h2>{user?.name || 'User'}</h2>
            <p>{user?.age || 'Age not set'} • {user?.gender || 'Gender not set'}</p>
            <p>{user?.bio || 'No bio available'}</p>
          </div>
        </div>          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          {!isEditing ? (
            <div className="profile-view">
              <form className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={user.name || 'Not specified'} disabled />
                  </div>
                  <div className="form-group">
                    <label>Age</label>
                    <input type="text" value={user.age || 'Not specified'} disabled />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    <input type="text" value={user.location || 'Not specified'} disabled />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <input type="text" value={user.gender || 'Not specified'} disabled />
                  </div>
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea 
                    value={user.bio || 'No bio added yet'} 
                    disabled 
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label>Interests</label>
                  <input type="text" value={user.interests || 'No interests listed'} disabled />
                </div>
              </form>
              
              <div className="form-actions">
                <button onClick={handleEdit} className="edit-btn">✏️ Edit Profile</button>
                <button onClick={fetchUserStats} className="edit-btn">🔄 Refresh Stats</button>
              </div>

              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-number">{userStats.matchesCount || 0}</span>
                  <span className="stat-label">Matches</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{userStats.likesGivenCount || 0}</span>
                  <span className="stat-label">Likes Given</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{userStats.likesReceivedCount || 0}</span>
                  <span className="stat-label">Likes Received</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{userStats.isEmailVerified ? 'Verified' : 'Pending'}</span>
                  <span className="stat-label">Email Status</span>
                </div>
              </div>

              {/* Email Verification Section */}
              {!userStats.isEmailVerified && (
                <div className="email-verification-section">
                  <h3>📧 Email Verification Required</h3>
                  <p>Your email address needs to be verified to access all features.</p>
                  
                  {verificationMessage && (
                    <div className="success-message">{verificationMessage}</div>
                  )}
                  {verificationError && (
                    <div className="error-message">{verificationError}</div>
                  )}
                  
                  <form onSubmit={handleVerifyEmail} className="verification-form">
                    <div className="form-group">
                      <label htmlFor="verificationCode">Enter Verification Code</label>
                      <input
                        type="text"
                        id="verificationCode"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength="6"
                        disabled={verificationLoading}
                      />
                    </div>
                    <div className="verification-actions">
                      <button 
                        type="submit" 
                        className="verify-btn"
                        disabled={verificationLoading || !verificationCode.trim()}
                      >
                        {verificationLoading ? 'Verifying...' : 'Verify Email'}
                      </button>
                      <button 
                        type="button" 
                        className="resend-btn"
                        onClick={handleResendVerification}
                        disabled={verificationLoading}
                      >
                        {verificationLoading ? 'Sending...' : 'Resend Code'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={`profile-form ${loading ? 'loading' : ''}`}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="age">Age *</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="18"
                    max="100"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  placeholder="City, Country"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  disabled={loading}
                  placeholder="Tell others about yourself, your hobbies, what you're looking for..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="interests">Interests</label>
                <input
                  type="text"
                  id="interests"
                  name="interests"
                  value={formData.interests}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="e.g., hiking, reading, cooking, travel, music"
                />
              </div>

              <div className="form-actions">
                <div className="edit-actions">
                  <button type="button" onClick={handleCancel} className="cancel-btn" disabled={loading}>
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="save-btn">
                    {loading ? '💾 Saving...' : '💾 Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
        
        {/* Photo Gallery Section */}
        <div className="profile-section">
          <PhotoGallery userId={effectiveUserId} onProfilePictureUpdate={handleProfilePictureUpdate} />
        </div>
      </div>
    </div>
  );
}

export default Profile;

import React, { useState, useEffect, useCallback } from 'react';
import Dialog from './Dialog';
import { useDialog } from '../hooks/useDialog';
import { resolveProfilePictureUrl } from '../utils/imageUtils';
import { getUserIdFromToken } from '../utils/jwtUtils';
import apiConfig from '../config/api';
import './PhotoGallery.css';

const PhotoGallery = ({ userId, onProfilePictureUpdate }) => {
  // Fallback to get userId from JWT token if not provided via props
  const effectiveUserId = userId || getUserIdFromToken();
  
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(''); // Local preview URL

  // Maximum number of photos allowed
  const MAX_PHOTOS = 6;

  // Dialog management
  const { 
    dialogState, 
    hideDialog, 
    showError, 
    showSuccess, 
    showConfirm 
  } = useDialog();

  const availableAvatars = [
    '/avatars/avatar1.svg',
    '/avatars/avatar2.svg', 
    '/avatars/avatar3.svg',
    '/avatars/avatar4.svg',
    '/avatars/avatar5.svg',
    '/avatars/avatar6.svg',
    '/avatars/avatar7.svg',
    '/avatars/avatar8.svg',
    '/avatars/avatar9.svg',
    '/avatars/avatar10.svg',
    '/avatars/lifestyle1.svg',
    '/avatars/lifestyle2.svg',
    '/avatars/lifestyle3.svg',
    '/avatars/lifestyle4.svg',
    '/avatars/lifestyle5.svg',
    '/avatars/lifestyle6.svg',
    '/avatars/lifestyle7.svg',
    '/avatars/lifestyle8.svg'
  ];

  const fetchPhotos = async () => {
    if (!effectiveUserId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const token = localStorage.getItem('authToken');
      
      // Use the my-photos endpoint for the current user, or user/{userId} for others
      let apiUrl;
      if (userId && userId !== effectiveUserId) {
        // Viewing someone else's photos
        apiUrl = apiConfig.photos.user(userId);
      } else {
        // Viewing own photos - use the authenticated endpoint
        apiUrl = apiConfig.photos.myPhotos;
      }
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
        setError(null);
      } else {
        const errorText = await response.text();
        setError(`Failed to fetch photos. Status: ${response.status}`);
      }
    } catch (err) {
      setError('Error fetching photos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (effectiveUserId) {
      fetchPhotos();
    } else {
      setLoading(false);
    }
  }, [fetchPhotos, effectiveUserId, userId]);

  const addPhoto = async () => {
    if (!newPhotoUrl) {
      showError('Photo Required', 'Please select a photo');
      return;
    }

    // Check if we've reached the maximum limit before making the API call
    if (photos.length >= MAX_PHOTOS) {
      showError('Photo Limit Reached', `You can only have up to ${MAX_PHOTOS} photos. Delete a photo to add a new one.`);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(apiConfig.photos.add, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId,
          photoUrl: newPhotoUrl,
          caption: newCaption
        }),
      });

      if (response.ok) {
        const newPhoto = await response.json();
        setPhotos([...photos, newPhoto]);
        setNewPhotoUrl('');
        setPreviewUrl('');
        setNewCaption('');
        setIsAddingPhoto(false);
      } else {
        const errorData = await response.json();
        showError('Upload Failed', errorData.error || 'Failed to add photo. Please try again.');
      }
    } catch (err) {
      showError('Network Error', 'Error adding photo. Please check your connection.');
    }
  };

  const deletePhoto = async (photoId) => {
    if (photos.length <= 1) {
      showError('Cannot Delete', 'You must have at least one photo');
      return;
    }

    showConfirm(
      'Delete Photo',
      'Are you sure you want to delete this photo? This action cannot be undone.',
      async () => {
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch(apiConfig.photos.delete(photoId), {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            },
          });

        if (response.ok) {
          setPhotos(photos.filter(photo => photo.id !== photoId));
        } else {
          showError('Delete Failed', 'Failed to delete photo. Please try again.');
        }
      } catch (err) {
        showError('Network Error', 'Failed to delete photo. Please check your connection.');
      }
    });
  };

  const setPrimaryPhoto = async (photoId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(apiConfig.photos.setPrimary(photoId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        fetchPhotos(); // Refresh to get updated order
      } else {
        showError('Update Failed', 'Failed to set primary photo. Please try again.');
      }
    } catch (err) {
      setError('Error setting primary photo: ' + err.message);
    }
  };

  const setAsProfilePicture = async (photoUrl) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(apiConfig.users.profilePicture, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          photoUrl: photoUrl
        }),
      });

      if (response.ok) {
        showSuccess('Success', 'Profile picture updated successfully!');
        if (onProfilePictureUpdate) {
          onProfilePictureUpdate(photoUrl);
        }
      } else {
        const errorData = await response.json();
        showError('Update Failed', errorData.error || 'Failed to set profile picture. Please try again.');
      }
    } catch (err) {
      setError('Error setting profile picture: ' + err.message);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setPreviewUrl('');
      return;
    }

    // Create local preview URL immediately
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('authToken');
      const response = await fetch(apiConfig.upload.photo, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setNewPhotoUrl(result.url);
      } else {
        const errorData = await response.json();
        showError('Upload Failed', errorData.error || 'Failed to upload file. Please try again.');
      }
    } catch (err) {
      showError('Network Error', 'Error uploading file. Please check your connection.');
    } finally {
      setUploadingFile(false);
      // Clean up the local preview URL after upload attempt
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    }
  };

  if (loading) return <div className="loading">Loading photos...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="photo-gallery">
      <h3>Photo Gallery ({photos.length}/{MAX_PHOTOS} photos)</h3>
      
      <div className="photos-grid">
        {photos.map((photo) => (
          <div key={photo.id} className="photo-item">
            <img 
              src={resolveProfilePictureUrl(photo.photoUrl)}
              alt={photo.caption || 'User photo'} 
            />
            <div className="photo-overlay">
              <div className="photo-info">
                {photo.photoOrder === 1 && <span className="primary-badge">Primary</span>}
                {photo.caption && <p className="caption">{photo.caption}</p>}
              </div>
              <div className="photo-actions">
                {photo.photoOrder !== 1 && (
                  <button 
                    onClick={() => setPrimaryPhoto(photo.id)}
                    className="action-btn primary-btn"
                    title="Set as primary photo"
                  >
                    ⭐
                  </button>
                )}
                <button 
                  onClick={() => setAsProfilePicture(photo.photoUrl)}
                  className="action-btn profile-btn"
                  title="Set as profile picture"
                >
                  👤
                </button>
                <button 
                  onClick={() => deletePhoto(photo.id)}
                  className="action-btn delete-btn"
                  title="Delete photo"
                  disabled={photos.length <= 1}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {photos.length >= MAX_PHOTOS ? (
        <div className="photo-limit-message">
          <p>You've reached the maximum limit of {MAX_PHOTOS} photos. Delete a photo to add a new one.</p>
        </div>
      ) : !isAddingPhoto ? (
        <button 
          onClick={() => setIsAddingPhoto(true)}
          className="add-photo-btn"
        >
          + Add Photo
        </button>
      ) : (
        <div className="add-photo-form">
          <h4>Add New Photo</h4>
          
          <div className="photo-source-tabs">
            <button 
              className={`tab-btn ${!newPhotoUrl.startsWith('/uploads/') ? 'active' : ''}`}
              onClick={() => setNewPhotoUrl('')}
            >
              Choose Avatar
            </button>
            <button 
              className={`tab-btn ${newPhotoUrl.startsWith('/uploads/') ? 'active' : ''}`}
              onClick={() => setNewPhotoUrl('/uploads/')}
            >
              Upload Photo
            </button>
          </div>

          {!newPhotoUrl.startsWith('/uploads/') ? (
            <div className="avatar-selector">
              <label>Select Avatar:</label>
              <div className="avatar-grid">
                {availableAvatars.map((avatar) => (
                  <img
                    key={avatar}
                    src={avatar}
                    alt="Avatar option"
                    className={`avatar-option ${newPhotoUrl === avatar ? 'selected' : ''}`}
                    onClick={() => setNewPhotoUrl(avatar)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="file-upload-section">
              <label>Upload Your Photo:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="file-input"
                disabled={uploadingFile}
              />
              {uploadingFile && <p className="upload-status">Uploading...</p>}
              {(previewUrl || newPhotoUrl) && (
                <div className="uploaded-preview">
                  <img 
                    src={previewUrl || resolveProfilePictureUrl(newPhotoUrl)} 
                    alt="Preview" 
                    className="preview-image"
                  />
                  <p>Photo ready to add!</p>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    {previewUrl && <div>Local Preview: {previewUrl.substring(0, 50)}...</div>}
                    {newPhotoUrl && <div>Server URL: {newPhotoUrl}</div>}
                    {newPhotoUrl && <div>Resolved URL: {resolveProfilePictureUrl(newPhotoUrl)}</div>}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="form-group">
            <label>Caption (optional):</label>
            <input
              type="text"
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              placeholder="Add a caption for this photo"
              maxLength={255}
            />
          </div>

          <div className="form-actions">
            <button onClick={addPhoto} className="save-btn" disabled={!newPhotoUrl}>
              {uploadingFile ? 'Uploading...' : 'Add Photo'}
            </button>
            <button 
              onClick={() => {
                setIsAddingPhoto(false);
                setNewPhotoUrl('');
                setNewCaption('');
              }}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
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
};

export default PhotoGallery;

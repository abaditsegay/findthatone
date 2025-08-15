import React, { useState, useMemo } from 'react';
import './MatchCard.css';

/**
 * Reusable MatchCard component for displaying user profiles
 * Handles loading states, placeholder images, and user interactions
 */
const MatchCard = React.memo(function MatchCard({
  matchName,
  matchAge,
  matchLocation,
  matchBio,
  matchInterests,
  matchPhotoUrl,
  swipeDirection = '',
  onImageLoad,
  onImageError,
  className = ''
}) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Split interests safely to prevent re-computation
  const interestList = useMemo(() => {
    return matchInterests ? matchInterests.split(',') : [];
  }, [matchInterests]);

  // Check if the photo URL is already a placeholder
  const isPlaceholder = useMemo(() => {
    return matchPhotoUrl === '/placeholder-avatar.svg' || 
           matchPhotoUrl?.includes('/avatars/') ||
           matchPhotoUrl?.includes('placeholder-avatar') ||
           !matchPhotoUrl;
  }, [matchPhotoUrl]);

  // Remove network pre-check to avoid CORS issues - let the img tag handle loading

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageLoadError(false);
    if (onImageLoad) onImageLoad();
  };

  const handleImageError = (e) => {
    // Prevent infinite loops with placeholder image
    if (e.target.src.includes('placeholder-avatar')) {
      e.target.style.display = 'none';
      return;
    }
    
    setImageLoading(false);
    setImageLoadError(true);
    
    // Set fallback image only once
    e.target.src = '/placeholder-avatar.svg';
    
    if (onImageError) onImageError(e);
  };

  // Don't show loading for placeholder images
  const shouldShowLoading = imageLoading && !isPlaceholder && !imageLoadError;

  return (
    <div className={`match-profile-card ${swipeDirection} ${className}`}>
      <div className="card-image">
        {shouldShowLoading && (
          <div className="image-placeholder">
            <div className="loading-placeholder"></div>
          </div>
        )}
        <img
          src={matchPhotoUrl || '/placeholder-avatar.svg'}
          alt={matchName}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ opacity: shouldShowLoading ? 0 : 1 }}
          loading="lazy"
        />
      </div>
      <div className="card-info">
        <div className="card-header">
          <h3>{matchName}, {matchAge}</h3>
          <p className="location">📍 {matchLocation}</p>
        </div>
        <p className="bio">{matchBio}</p>
        <div className="interests">
          {interestList.map((interest, index) => (
            <span key={index} className="interest-tag">
              {interest.trim()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

export default MatchCard;

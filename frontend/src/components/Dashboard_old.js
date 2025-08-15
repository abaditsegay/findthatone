import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { resolveProfilePictureUrl } from '../utils/imageUtils';
import apiConfig from '../config/api';
import MatchCard from './MatchCard';
import { useSwipeHandler } from '../hooks/useImageLoad';
import './Dashboard.css';

const Dashboard = React.memo(function Dashboard({ user, onLogout }) {
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Use the custom swipe handler hook
  const { handleSwipe, isProcessing, swipeDirection } = useSwipeHandler(async (action) => {
    if (currentCardIndex >= potentialMatches.length) return;

    const currentMatch = potentialMatches[currentCardIndex];
    const token = localStorage.getItem('authToken');
    
    await axios.post(
      apiConfig.matching.action(action, currentMatch.id),
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setCurrentCardIndex(prev => prev + 1);
  });

  const fetchPotentialMatches = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(apiConfig.users.matches, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPotentialMatches(response.data);
      setCurrentCardIndex(0); // Reset to first card when new matches are loaded
    } catch (error) {
      setError('Failed to load potential matches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPotentialMatches();
  }, [fetchPotentialMatches]);

  // Memoize the current match to prevent flickering
  const currentMatch = useMemo(() => {
    if (potentialMatches.length === 0 || currentCardIndex >= potentialMatches.length) {
      return null;
    }
    return potentialMatches[currentCardIndex];
  }, [potentialMatches, currentCardIndex]);

  // Memoize match properties with null checks
  const matchData = useMemo(() => {
    if (!currentMatch) {
      return {
        name: '',
        age: '',
        location: '',
        bio: '',
        interests: '',
        photoUrl: '/placeholder-avatar.png',
        id: 0
      };
    }
    
    // Get the resolved photo URL, fallback to placeholder if empty/null
    let photoUrl = currentMatch.profilePhotoUrl;
    if (!photoUrl || photoUrl.trim() === '') {
      photoUrl = '/placeholder-avatar.png';
    } else {
      photoUrl = resolveProfilePictureUrl(photoUrl);
    }
    
    return {
      name: currentMatch.name || '',
      age: currentMatch.age || '',
      location: currentMatch.location || '',
      bio: currentMatch.bio || '',
      interests: currentMatch.interests || '',
      photoUrl: photoUrl,
      id: currentMatch.id || 0
    };
  }, [currentMatch]);

  // Reset image loading when current match changes
  useEffect(() => {
    if (matchData.id) {
      // Don't show loading spinner for placeholder images
      const isPlaceholder = matchData.photoUrl === '/placeholder-avatar.png';
      setImageLoading(!isPlaceholder);
      
      if (!isPlaceholder) {
        // Set a timeout to prevent infinite loading if image never loads
        const timeout = setTimeout(() => {
          // Image loading timeout - handle silently
        }, 5000); // 5 second timeout
        
        return () => clearTimeout(timeout);
      }
    }
  }, [matchData.id, matchData.photoUrl]);

  const handleImageLoad = useCallback(() => {
    // Image loaded successfully - handle silently
  }, []);

  const handleImageError = useCallback((e) => {
    // Image failed to load, use placeholder
    e.target.src = '/placeholder-avatar.png';
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading potential matches...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>FindThatOne</h2>
        </div>
        <div className="nav-links">
          <Link to="/profile" className="nav-link">Profile</Link>
          <Link to="/chat" className="nav-link">Matches</Link>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        {error && <div className="error-message">{error}</div>}
        
        {currentCardIndex >= potentialMatches.length ? (
          <div className="no-more-cards">
            <h3>🎉 You've seen everyone!</h3>
            <p>Check back later for new potential matches.</p>
            <button onClick={fetchPotentialMatches} className="refresh-btn">
              Refresh
            </button>
          </div>
        ) : (
          <div className="cards-container">
            <MatchCard
              key={matchData.id}
              matchName={matchData.name}
              matchAge={matchData.age}
              matchLocation={matchData.location}
              matchBio={matchData.bio}
              matchInterests={matchData.interests}
              matchPhotoUrl={matchData.photoUrl}
              swipeDirection={swipeDirection}
              onImageLoad={handleImageLoad}
              onImageError={handleImageError}
            />

            <div className="swipe-buttons">
              <button 
                className="swipe-btn dislike-btn"
                onClick={() => handleSwipe('dislike')}
                title="Pass"
              >
                ❌
              </button>
              <button 
                className="swipe-btn like-btn"
                onClick={() => handleSwipe('like')}
                title="Like"
              >
                ❤️
              </button>
            </div>

            <div className="card-counter">
              {currentCardIndex + 1} of {potentialMatches.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default Dashboard;

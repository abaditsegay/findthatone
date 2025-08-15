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
  const { handleSwipe, swipeDirection } = useSwipeHandler(async (action) => {
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
      name: currentMatch.name || 'Unknown',
      age: currentMatch.age || 'N/A',
      location: currentMatch.location || 'Unknown Location',
      bio: currentMatch.bio || 'No bio available',
      interests: currentMatch.interests || '',
      photoUrl: photoUrl,
      id: currentMatch.id
    };
  }, [currentMatch]);

  if (loading) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>FindTheOne</h1>
            <div className="user-info">
              <span>Welcome, {user.name}</span>
              <Link to="/profile" className="profile-link">Profile</Link>
              <button onClick={onLogout} className="logout-button">Logout</button>
            </div>
          </div>
        </header>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading potential matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>FindTheOne</h1>
            <div className="user-info">
              <span>Welcome, {user.name}</span>
              <Link to="/profile" className="profile-link">Profile</Link>
              <button onClick={onLogout} className="logout-button">Logout</button>
            </div>
          </div>
        </header>
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchPotentialMatches} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (currentCardIndex >= potentialMatches.length) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>FindTheOne</h1>
            <div className="user-info">
              <span>Welcome, {user.name}</span>
              <Link to="/profile" className="profile-link">Profile</Link>
              <button onClick={onLogout} className="logout-button">Logout</button>
            </div>
          </div>
        </header>
        <div className="no-matches-container">
          <h2>No more potential matches!</h2>
          <p>Check back later for new profiles or update your preferences.</p>
          <button onClick={fetchPotentialMatches} className="refresh-button">
            Refresh Matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>FindTheOne</h1>
          <div className="user-info">
            <span>Welcome, {user.name}</span>
            <Link to="/profile" className="profile-link">Profile</Link>
            <button onClick={onLogout} className="logout-button">Logout</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="match-container">
          <MatchCard
            matchName={matchData.name}
            matchAge={matchData.age}
            matchLocation={matchData.location}
            matchBio={matchData.bio}
            matchInterests={matchData.interests}
            matchPhotoUrl={matchData.photoUrl}
            swipeDirection={swipeDirection}
          />
          
          <div className="action-buttons">
            <button 
              className="action-button reject-button" 
              onClick={() => handleSwipe('pass')}
              aria-label="Pass on this match"
            >
              ❌
            </button>
            <button 
              className="action-button like-button" 
              onClick={() => handleSwipe('like')}
              aria-label="Like this match"
            >
              ❤️
            </button>
          </div>
        </div>
      </main>
    </div>
  );
});

export default Dashboard;

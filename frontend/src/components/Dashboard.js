import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { resolveProfilePictureUrl } from '../utils/imageUtils';
import apiConfig from '../config/api';
import MatchCard from './MatchCard';
import CoinStore from './CoinStore';
import { useSwipeHandler } from '../hooks/useImageLoad';
import './Dashboard.css';

const Dashboard = React.memo(function Dashboard({ user, onLogout }) {
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCoinStore, setShowCoinStore] = useState(false);
  const [userCoins, setUserCoins] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Use the custom swipe handler hook
  const { handleSwipe, swipeDirection } = useSwipeHandler(async (action) => {
    if (currentCardIndex >= potentialMatches.length) return;

    const currentMatch = potentialMatches[currentCardIndex];
    const token = localStorage.getItem('authToken');
    
    // Map frontend actions to backend endpoints
    const actionMap = {
      'like': 'like',
      'pass': 'dislike'  // Map 'pass' to 'dislike' endpoint
    };
    
    const backendAction = actionMap[action] || action;
    
    try {
      await axios.post(
        apiConfig.matching.action(backendAction, currentMatch.id),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentCardIndex(prev => prev + 1);
    } catch (error) {
      // Error handling for swipe action - fail silently for UX
    }
  });

  const fetchPotentialMatches = useCallback(async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(apiConfig.matching.suggestions, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPotentialMatches(response.data);
      setCurrentCardIndex(0); // Reset to first card when new matches are loaded
    } catch (error) {
      setError('Failed to load potential matches');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchUserCoins = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(apiConfig.payment.coins, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserCoins(response.data.coins || 0);
    } catch (error) {
      setUserCoins(0);
    }
  }, []);

  useEffect(() => {
    fetchPotentialMatches();
    fetchUserCoins();
  }, [fetchPotentialMatches, fetchUserCoins]);

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
        photoUrl: '/placeholder-avatar.svg',
        id: 0
      };
    }
    
    // Get the resolved photo URL, fallback to placeholder if empty/null
    let photoUrl = currentMatch.profilePhotoUrl;
    if (!photoUrl || photoUrl.trim() === '') {
      photoUrl = '/placeholder-avatar.svg';
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
            <nav className="main-nav">
              <Link to="/dashboard" className="nav-link active">Discover</Link>
              <Link to="/matches" className="nav-link">Matches</Link>
              <Link to="/chat" className="nav-link">Chat</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
            </nav>
            <div className="user-info">
              <div className="coin-display">
                <span className="coin-icon">🪙</span>
                <span className="coin-count">{userCoins}</span>
                <button 
                  className="coin-store-btn"
                  onClick={() => setShowCoinStore(true)}
                  title="Buy more coins"
                >
                  +
                </button>
              </div>
              <span>Welcome, {user.name}</span>
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
            <nav className="main-nav">
              <Link to="/dashboard" className="nav-link active">Discover</Link>
              <Link to="/matches" className="nav-link">Matches</Link>
              <Link to="/chat" className="nav-link">Chat</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
            </nav>
            <div className="user-info">
              <div className="coin-display">
                <span className="coin-icon">🪙</span>
                <span className="coin-count">{userCoins}</span>
                <button 
                  className="coin-store-btn"
                  onClick={() => setShowCoinStore(true)}
                  title="Buy more coins"
                >
                  +
                </button>
              </div>
              <span>Welcome, {user.name}</span>
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
    // Simply fetch more matches automatically or show refresh on main page
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>FindTheOne</h1>
            <nav className="main-nav">
              <Link to="/dashboard" className="nav-link active">Discover</Link>
              <Link to="/matches" className="nav-link">Matches</Link>
              <Link to="/chat" className="nav-link">Chat</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
            </nav>
            <div className="user-info">
              <div className="coin-display">
                <span className="coin-icon">🪙</span>
                <span className="coin-count">{userCoins}</span>
                <button 
                  className="coin-store-btn"
                  onClick={() => setShowCoinStore(true)}
                  title="Buy more coins"
                >
                  +
                </button>
              </div>
              <span>Welcome, {user.name}</span>
              <button onClick={onLogout} className="logout-button">Logout</button>
            </div>
          </div>
        </header>

        <main className="dashboard-main">
          <div className="dashboard-center">
            <div className="refresh-matches-center">
              <button 
                onClick={fetchPotentialMatches} 
                className={`refresh-button-main ${refreshing ? 'refreshing' : ''}`}
                disabled={refreshing}
              >
                <span className="refresh-icon">
                  {refreshing ? (
                    <div className="refresh-spinner"></div>
                  ) : (
                    '🔄'
                  )}
                </span>
                <span className="refresh-text">
                  {refreshing ? 'Finding new matches...' : 'Find New Matches'}
                </span>
              </button>
              <p className="refresh-hint-main">
                💡 Update your preferences for better matches
              </p>
            </div>
          </div>
        </main>

        {showCoinStore && (
          <CoinStore 
            user={user} 
            onClose={() => setShowCoinStore(false)}
            onCoinsUpdated={(newCoinCount) => setUserCoins(newCoinCount)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>FindTheOne</h1>
          <nav className="main-nav">
            <Link to="/dashboard" className="nav-link active">Discover</Link>
            <Link to="/matches" className="nav-link">Matches</Link>
            <Link to="/chat" className="nav-link">Chat</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
          </nav>
          <div className="user-info">
            <div className="coin-display">
              <span className="coin-icon">🪙</span>
              <span className="coin-count">{userCoins}</span>
              <button 
                className="coin-store-btn"
                onClick={() => setShowCoinStore(true)}
                title="Buy more coins"
              >
                +
              </button>
            </div>
            <span>Welcome, {user.name}</span>
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

      {showCoinStore && (
        <CoinStore 
          user={user}
          onClose={() => setShowCoinStore(false)}
          onCoinsUpdated={(newBalance) => {
            setUserCoins(newBalance);
            setShowCoinStore(false);
          }}
        />
      )}
    </div>
  );
});

export default Dashboard;

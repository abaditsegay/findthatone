import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import apiConfig from '../config/api';
import './Matches.css';

const Matches = ({ user, onLogout }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      // Don't fetch matches if user is not available yet
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await axios.get(apiConfig.matching.matches, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // The backend returns MatchDTO objects with both matchId and user info
        // Each MatchDTO represents the other user in the match plus the match ID
        const matchesData = response.data.map(matchDto => ({
          id: matchDto.matchId,        // Use the actual match ID for navigation
          matchedUser: {
            id: matchDto.userId,       // Use the matched user's ID
            name: matchDto.name,
            age: matchDto.age,
            bio: matchDto.bio,
            location: matchDto.location,
            profilePhotoUrl: matchDto.profilePhotoUrl,
            gender: matchDto.gender,
            interests: matchDto.interests
          },
          matchedAt: matchDto.matchedAt
        }));
        
        setMatches(matchesData);
        setError('');
      } catch (error) {
        setError('Failed to load matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [user?.id]);

  const refetchMatches = async () => {
    // Don't fetch matches if user is not available yet
    if (!user?.id) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(apiConfig.matching.matches, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // The backend returns MatchDTO objects with both matchId and user info
      // Each MatchDTO represents the other user in the match plus the match ID
      const matchesData = response.data.map(matchDto => ({
        id: matchDto.matchId,        // Use the actual match ID for navigation
        matchedUser: {
          id: matchDto.userId,       // Use the matched user's ID
          name: matchDto.name,
          age: matchDto.age,
          bio: matchDto.bio,
          location: matchDto.location,
          profilePhotoUrl: matchDto.profilePhotoUrl,
          gender: matchDto.gender,
          interests: matchDto.interests
        },
        matchedAt: matchDto.matchedAt
      }));
      
      setMatches(matchesData);
      setError('');
    } catch (error) {
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (match) => {
    navigate(`/chat/${match.id}`);
  };

  const getTimeSinceMatch = (matchedAt) => {
    const now = new Date();
    const matchDate = new Date(matchedAt);
    const diffInHours = Math.floor((now - matchDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return (
      <div className="matches-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="matches-container">
      <nav className="matches-nav">
        <div className="nav-brand">
          <h2>FindThatOne</h2>
        </div>
        <div className="nav-links">
          <Link to="/dashboard" className="nav-link">Discover</Link>
          <Link to="/matches" className="nav-link active">Matches</Link>
          <Link to="/chat" className="nav-link">Chat</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="matches-content">
        <div className="matches-header">
          <h1>Your Matches</h1>
          <p>People who liked you back</p>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={refetchMatches} className="retry-btn">Try Again</button>
          </div>
        )}

        {matches.length === 0 && !loading ? (
          <div className="no-matches-container">
            <div className="no-matches-content">
              <div className="no-matches-icon">💝</div>
              <h2>No matches yet!</h2>
              <p>Don't worry, your perfect match is out there waiting to be discovered.</p>
              <div className="no-matches-tips">
                <h3>Tips to get more matches:</h3>
                <ul>
                  <li>Upload high-quality photos</li>
                  <li>Write an engaging bio</li>
                  <li>Be active and keep swiping</li>
                  <li>Update your interests regularly</li>
                </ul>
              </div>
              <Link to="/dashboard" className="discover-btn">
                Start Discovering
              </Link>
            </div>
          </div>
        ) : (
          <div className="matches-grid">
            {matches.map((match) => (
              <div key={match.id} className="match-card">
                <div className="match-card-image">
                  <img 
                    src={match.matchedUser.profilePhotoUrl || '/placeholder-avatar.svg'} 
                    alt={match.matchedUser.name}
                    onError={(e) => {
                      e.target.src = '/placeholder-avatar.svg';
                    }}
                  />
                  <div className="match-overlay">
                    <button 
                      className="chat-btn"
                      onClick={() => handleChatClick(match)}
                    >
                      💬 Chat
                    </button>
                  </div>
                </div>
                
                <div className="match-card-content">
                  <div className="match-info">
                    <h3>{match.matchedUser.name}</h3>
                    <p className="match-age-location">
                      {match.matchedUser.age && `${match.matchedUser.age}, `}
                      {match.matchedUser.location}
                    </p>
                    {match.matchedUser.bio && (
                      <p className="match-bio">{match.matchedUser.bio}</p>
                    )}
                    {match.matchedUser.interests && (
                      <div className="match-interests">
                        {match.matchedUser.interests.split(',').slice(0, 3).map((interest, index) => (
                          <span key={index} className="interest-tag">
                            {interest.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="match-footer">
                    <p className="match-time">
                      Matched {getTimeSinceMatch(match.matchedAt)}
                    </p>
                    <div className="match-actions">
                      <button 
                        className="message-btn"
                        onClick={() => handleChatClick(match)}
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {matches.length > 0 && (
          <div className="matches-summary">
            <p>
              You have {matches.length} match{matches.length !== 1 ? 'es' : ''}. 
              Keep discovering to find more connections!
            </p>
            <Link to="/dashboard" className="keep-discovering-btn">
              Keep Discovering
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import CoinStore from './CoinStore';
import apiConfig from '../config/api';
import './Chat.css';

const Chat = React.memo(function Chat({ user, onLogout }) {
  const { matchId } = useParams();
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userCoins, setUserCoins] = useState(0);
  const [showCoinStore, setShowCoinStore] = useState(false);
  const [unlockingMessages, setUnlockingMessages] = useState(new Set());

  const fetchMatches = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(apiConfig.matching.matches, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Process matches to use the new MatchDTO structure
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
      
      // Fetch user coins
      const coinsResponse = await axios.get(apiConfig.payment.coins, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserCoins(coinsResponse.data.coins);
    } catch (error) {
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (matchUserId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        apiConfig.messages.conversation(matchUserId),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data);
    } catch (error) {
      // Error fetching messages - fail silently for UX
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  useEffect(() => {
    if (matchId && matches.length > 0) {
      const match = matches.find(m => m.id === parseInt(matchId));
      if (match) {
        setSelectedMatch(match);
        fetchMessages(match.matchedUser.id); // Use the matched user's ID for messages
      }
    }
  }, [matchId, matches, fetchMessages]);

  const sendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMatch) return;

    try {
      const token = localStorage.getItem('authToken');
      const messageData = {
        receiverId: selectedMatch.matchedUser.id, // Use the matched user's ID
        content: newMessage.trim(),
        type: 'TEXT'
      };

      await axios.post(apiConfig.messages.send, messageData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewMessage('');
      fetchMessages(selectedMatch.matchedUser.id); // Use the matched user's ID
    } catch (error) {
      // Error sending message - fail silently for UX
    }
  }, [newMessage, selectedMatch, fetchMessages]);

  const unlockMessage = async (messageId) => {
    // Prevent double-clicking
    if (unlockingMessages.has(messageId)) {
      return;
    }

    try {
      // Add message to unlocking set
      setUnlockingMessages(prev => new Set([...prev, messageId]));
      
      const token = localStorage.getItem('authToken');
      const response = await axios.post(apiConfig.messages.unlock, 
        { messageId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Check if message was already unlocked
      if (response.data.alreadyUnlocked) {
        // Message was already unlocked, refreshing messages
      }
      
      // Refresh messages and coins
      fetchMessages(selectedMatch.matchedUser.id);
      fetchUserCoins();
    } catch (error) {
      
      // Check the specific error type from the response
      const errorData = error.response?.data;
      
      if (errorData?.error === 'insufficient coins') {
        setShowCoinStore(true);
      } else if (errorData?.error === 'invalid request') {
        // Message might not exist or user doesn't have access
        fetchMessages(selectedMatch.matchedUser.id);
      }
      // For other errors, fail silently for UX
    } finally {
      // Remove message from unlocking set
      setUnlockingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

  const fetchUserCoins = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(apiConfig.payment.coins, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserCoins(response.data.coins);
    } catch (error) {
      // Error fetching coins - fail silently for UX
    }
  };

  const isMessageUnlocked = (message) => {
    // Messages sent by current user are always visible
    if (message.sender?.id === user.id) {
      return true;
    }
    // Received messages need to be unlocked
    return message.isUnlocked || false;
  };

  const selectMatch = useCallback((match) => {
    setSelectedMatch(match);
    fetchMessages(match.id);
  }, [fetchMessages]);

  // Memoize the matches list to prevent flickering
  const memoizedMatches = useMemo(() => matches, [matches]);
  const memoizedSelectedMatch = useMemo(() => selectedMatch, [selectedMatch]);

  if (loading) {
    return (
      <div className="chat-container">
        <div className="loading-spinner">Loading matches...</div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <nav className="chat-nav">
        <div className="nav-brand">
          <h2>FindThatOne</h2>
        </div>
        <div className="nav-links">
          <Link to="/dashboard" className="nav-link">Discover</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="chat-content">
        {error && <div className="error-message">{error}</div>}
        
        <div className="chat-layout">
          {/* Matches Sidebar */}
          <div className="matches-sidebar">
            <h3>Your Matches</h3>
            {memoizedMatches.length === 0 ? (
              <div className="no-matches">
                <p>No matches yet! Keep swiping to find connections.</p>
                <Link to="/dashboard" className="discover-btn">
                  Start Discovering
                </Link>
              </div>
            ) : (
              <div className="matches-list">
                {memoizedMatches.map((match) => (
                  <div
                    key={match.id}
                    className={`match-item ${memoizedSelectedMatch?.id === match.id ? 'active' : ''}`}
                    onClick={() => selectMatch(match)}
                  >
                    <div className="match-avatar">
                      <img 
                        src={match.matchedUser.profilePhotoUrl || '/placeholder-avatar.svg'} 
                        alt={match.matchedUser.name}
                        onError={(e) => {
                          e.target.src = '/placeholder-avatar.svg';
                        }}
                      />
                    </div>
                    <div className="match-info">
                      <h4>{match.matchedUser.name}</h4>
                      <p>{match.matchedUser.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="chat-area">
            {memoizedSelectedMatch ? (
              <>
                <div className="chat-header">
                  <div className="chat-user-info">
                    <img 
                      src={memoizedSelectedMatch.matchedUser.profilePhotoUrl || '/placeholder-avatar.svg'} 
                      alt={memoizedSelectedMatch.matchedUser.name}
                      onError={(e) => {
                        e.target.src = '/placeholder-avatar.svg';
                      }}
                    />
                    <div>
                      <h3>{memoizedSelectedMatch.matchedUser.name}</h3>
                      <p>{memoizedSelectedMatch.matchedUser.location}</p>
                    </div>
                  </div>
                  <div className="coin-info">
                    <span className="coin-display">🪙 {userCoins}</span>
                    <button 
                      className="buy-coins-btn"
                      onClick={() => setShowCoinStore(true)}
                      title="Buy Coins"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="messages-container">
                  {messages.length === 0 ? (
                    <div className="no-messages">
                      <p>Start a conversation with {memoizedSelectedMatch.matchedUser.name}!</p>
                      <p>Say hello and break the ice 👋</p>
                    </div>
                  ) : (
                    <div className="messages-list">
                      {messages.map((message) => {
                        const isSent = message.sender?.id === user.id;
                        const isUnlocked = isMessageUnlocked(message);
                        const isUnlocking = unlockingMessages.has(message.id);
                        
                        return (
                          <div
                            key={message.id}
                            className={`message ${isSent ? 'sent' : 'received'} ${!isUnlocked ? 'locked' : ''}`}
                          >
                            <div className="message-content">
                              {isSent || isUnlocked ? (
                                message.content
                              ) : (
                                <div className="locked-message">
                                  <div className="lock-icon">🔒</div>
                                  <div className="lock-text">
                                    <p>Message locked</p>
                                    <p>Use 1 coin to read</p>
                                  </div>
                                  <button 
                                    className="unlock-btn"
                                    onClick={() => unlockMessage(message.id)}
                                    disabled={userCoins < 1 || isUnlocking}
                                  >
                                    {isUnlocking ? '⏳ Unlocking...' : userCoins >= 1 ? '🪙 Unlock (1 coin)' : 'Need more coins'}
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="message-time">
                              {new Date(message.sentAt).toLocaleString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <form onSubmit={sendMessage} className="message-input-container">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message ${memoizedSelectedMatch.matchedUser.name}...`}
                    className="message-input"
                  />
                  <button type="submit" className="send-button" disabled={!newMessage.trim()}>
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="no-chat-selected">
                <h3>Select a match to start chatting</h3>
                <p>Choose someone from your matches to begin a conversation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Coin Store Modal */}
      {showCoinStore && (
        <CoinStore 
          user={user}
          onClose={() => setShowCoinStore(false)}
          onCoinsUpdated={(newCoins) => {
            setUserCoins(newCoins);
            setShowCoinStore(false);
          }}
        />
      )}
    </div>
  );
});

export default Chat;

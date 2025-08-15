import React, { useState, useEffect } from 'react';
import './SpeedDating.css';

const SpeedDating = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [joinedEvent, setJoinedEvent] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);

  const speedDatingEvents = [
    {
      id: 1,
      title: "💕 Singles in their 20s",
      time: "8:00 PM EST",
      date: "Tonight",
      participants: 24,
      maxParticipants: 30,
      ageRange: "22-29",
      description: "Meet young professionals in a fun, low-pressure environment"
    },
    {
      id: 2,
      title: "🌟 Creative Professionals",
      time: "7:30 PM EST", 
      date: "Tomorrow",
      participants: 18,
      maxParticipants: 24,
      interests: "Art, Design, Music",
      description: "Connect with fellow creatives and artists"
    },
    {
      id: 3,
      title: "🏃‍♀️ Fitness Enthusiasts",
      time: "6:00 PM EST",
      date: "Friday",
      participants: 16,
      maxParticipants: 20,
      interests: "Fitness, Outdoor Activities",
      description: "Find your workout partner and more!"
    }
  ];

  const joinEvent = (eventId) => {
    setSelectedEvent(eventId);
  };

  const nextMatch = () => {
    setIsMatching(true);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (joinedEvent) {
    return (
      <div className="speed-dating-room">
        <div className="room-header">
          <h3>💕 Speed Dating in Progress</h3>
          <div className="timer">
            <span className="time-left">{formatTime(timeLeft)}</span>
            <span className="timer-label">Time Left</span>
          </div>
        </div>

        <div className="video-chat-area">
          <div className="video-grid">
            <div className="video-participant">
              <video className="participant-video" autoPlay muted />
              <div className="participant-info">
                <span className="participant-name">You</span>
              </div>
            </div>
            <div className="video-participant">
              <video className="participant-video" autoPlay />
              <div className="participant-info">
                <span className="participant-name">Sarah, 26</span>
                <span className="participant-location">📍 New York</span>
              </div>
            </div>
          </div>
          
          <div className="chat-controls">
            <button className="control-btn mute-btn">🎤</button>
            <button className="control-btn video-btn">📹</button>
            <button className="control-btn interest-btn">💝 Interested</button>
            <button className="control-btn pass-btn">👋 Next</button>
          </div>
        </div>

        <div className="conversation-starters">
          <h4>💬 Conversation Starters</h4>
          <div className="starter-chips">
            <span className="starter-chip">What's your favorite weekend activity?</span>
            <span className="starter-chip">Any exciting travel plans?</span>
            <span className="starter-chip">What's your hidden talent?</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="speed-dating">
      <div className="speed-dating-header">
        <h2>⚡ Live Speed Dating Events</h2>
        <p>Meet multiple people in one night with our virtual speed dating rooms!</p>
      </div>

      <div className="events-grid">
        {speedDatingEvents.map((event) => (
          <div key={event.id} className="event-card">
            <div className="event-header">
              <h3>{event.title}</h3>
              <div className="event-time">
                <span className="date">{event.date}</span>
                <span className="time">{event.time}</span>
              </div>
            </div>

            <div className="event-details">
              <p className="description">{event.description}</p>
              
              <div className="event-meta">
                {event.ageRange && (
                  <span className="meta-item">🎂 {event.ageRange}</span>
                )}
                {event.interests && (
                  <span className="meta-item">💫 {event.interests}</span>
                )}
              </div>

              <div className="participants-count">
                <span className="count">{event.participants}/{event.maxParticipants}</span>
                <span className="label">participants</span>
              </div>
            </div>

            <button 
              onClick={() => joinEvent(event.id)}
              className="join-event-btn"
              disabled={event.participants >= event.maxParticipants}
            >
              {event.participants >= event.maxParticipants ? '🔒 Full' : '🎯 Join Event'}
            </button>
          </div>
        ))}
      </div>

      <div className="how-it-works">
        <h3>How Speed Dating Works</h3>
        <div className="steps">
          <div className="step">
            <span className="step-number">1</span>
            <span className="step-text">Join an event that matches your interests</span>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <span className="step-text">Get matched with 8-12 people for 5-minute video chats</span>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <span className="step-text">Mark who you're interested in</span>
          </div>
          <div className="step">
            <span className="step-number">4</span>
            <span className="step-text">Get notified of mutual matches after the event!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedDating;

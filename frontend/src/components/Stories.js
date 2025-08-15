import React, { useState, useEffect } from 'react';
import './Stories.css';

const Stories = ({ user, onStoryCreate }) => {
  const [stories, setStories] = useState([]);
  const [viewingStory, setViewingStory] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Sample stories data
  const sampleStories = [
    {
      id: 1,
      userId: user.id,
      userName: user.name,
      userPhoto: user.profilePhotoUrl,
      content: {
        type: 'photo',
        url: '/placeholder-avatar.svg',
        text: 'Beautiful sunset today! 🌅'
      },
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      views: 12,
      isViewed: false
    },
    {
      id: 2,
      userId: 2,
      userName: 'Sarah',
      userPhoto: '/placeholder-avatar.svg',
      content: {
        type: 'text',
        text: 'Just finished an amazing workout! 💪 Who wants to be my gym buddy?',
        backgroundColor: '#FF6B6B'
      },
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      views: 8,
      isViewed: false
    },
    {
      id: 3,
      userId: 3,
      userName: 'Mike',
      userPhoto: '/placeholder-avatar.svg',
      content: {
        type: 'photo',
        url: '/placeholder-avatar.svg',
        text: 'Coffee and coding ☕️💻'
      },
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      views: 15,
      isViewed: true
    }
  ];

  const storyTemplates = [
    {
      id: 'question',
      name: 'Ask a Question',
      icon: '❓',
      background: '#4ECDC4',
      prompt: 'Ask your matches something...'
    },
    {
      id: 'mood',
      name: 'Share Your Mood',
      icon: '😊',
      background: '#45B7D1',
      prompt: 'How are you feeling today?'
    },
    {
      id: 'activity',
      name: 'What I\'m Doing',
      icon: '🎯',
      background: '#96CEB4',
      prompt: 'Share what you\'re up to...'
    },
    {
      id: 'location',
      name: 'Where I Am',
      icon: '📍',
      background: '#FFEAA7',
      prompt: 'Share your location or activity...'
    }
  ];

  useEffect(() => {
    setStories(sampleStories);
  }, []);

  useEffect(() => {
    let interval;
    if (viewingStory) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            // Move to next story
            const nextIndex = currentStoryIndex + 1;
            if (nextIndex < viewingStory.stories.length) {
              setCurrentStoryIndex(nextIndex);
              return 0;
            } else {
              // End of stories
              setViewingStory(null);
              setCurrentStoryIndex(0);
              return 0;
            }
          }
          return prev + 2; // 5 second duration (100% / 50 intervals)
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [viewingStory, currentStoryIndex]);

  const groupStoriesByUser = (stories) => {
    const grouped = {};
    stories.forEach(story => {
      if (!grouped[story.userId]) {
        grouped[story.userId] = {
          userId: story.userId,
          userName: story.userName,
          userPhoto: story.userPhoto,
          stories: [],
          hasUnviewed: false
        };
      }
      grouped[story.userId].stories.push(story);
      if (!story.isViewed) {
        grouped[story.userId].hasUnviewed = true;
      }
    });
    return Object.values(grouped);
  };

  const viewStory = (userStories) => {
    setViewingStory(userStories);
    setCurrentStoryIndex(0);
    setProgress(0);
  };

  const closeStoryViewer = () => {
    setViewingStory(null);
    setCurrentStoryIndex(0);
    setProgress(0);
  };

  const createTextStory = (text, template) => {
    const newStory = {
      id: Date.now(),
      userId: user.id,
      userName: user.name,
      userPhoto: user.profilePhotoUrl,
      content: {
        type: 'text',
        text: text,
        backgroundColor: template.background
      },
      timestamp: new Date(),
      views: 0,
      isViewed: false
    };

    setStories(prev => [newStory, ...prev]);
    setShowCreateModal(false);
    onStoryCreate && onStoryCreate(newStory);
  };

  const groupedStories = groupStoriesByUser(stories);

  return (
    <div className="stories-container">
      {/* Stories Ring */}
      <div className="stories-ring">
        {/* Add Story Button */}
        <div className="story-item add-story" onClick={() => setShowCreateModal(true)}>
          <div className="story-avatar add-avatar">
            <img src={user.profilePhotoUrl || '/placeholder-avatar.svg'} alt="Your story" />
            <div className="add-icon">+</div>
          </div>
          <span className="story-name">Your Story</span>
        </div>

        {/* User Stories */}
        {groupedStories.map(userStories => (
          <div 
            key={userStories.userId} 
            className="story-item"
            onClick={() => viewStory(userStories)}
          >
            <div className={`story-avatar ${userStories.hasUnviewed ? 'unviewed' : 'viewed'}`}>
              <img src={userStories.userPhoto || '/placeholder-avatar.svg'} alt={userStories.userName} />
            </div>
            <span className="story-name">{userStories.userName}</span>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {viewingStory && (
        <div className="story-viewer">
          <div className="story-header">
            <div className="progress-bars">
              {viewingStory.stories.map((_, index) => (
                <div key={index} className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{
                      width: index < currentStoryIndex ? '100%' : 
                             index === currentStoryIndex ? `${progress}%` : '0%'
                    }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="story-user-info">
              <img src={viewingStory.userPhoto || '/placeholder-avatar.svg'} alt={viewingStory.userName} />
              <span className="user-name">{viewingStory.userName}</span>
              <span className="story-time">
                {Math.floor((Date.now() - viewingStory.stories[currentStoryIndex]?.timestamp) / 3600000)}h ago
              </span>
            </div>
            <button className="close-story" onClick={closeStoryViewer}>×</button>
          </div>

          <div className="story-content">
            {viewingStory.stories[currentStoryIndex]?.content.type === 'photo' ? (
              <div className="photo-story">
                <img 
                  src={viewingStory.stories[currentStoryIndex].content.url} 
                  alt="Story content" 
                />
                {viewingStory.stories[currentStoryIndex].content.text && (
                  <div className="story-text-overlay">
                    {viewingStory.stories[currentStoryIndex].content.text}
                  </div>
                )}
              </div>
            ) : (
              <div 
                className="text-story"
                style={{ backgroundColor: viewingStory.stories[currentStoryIndex]?.content.backgroundColor }}
              >
                <p>{viewingStory.stories[currentStoryIndex]?.content.text}</p>
              </div>
            )}
          </div>

          <div className="story-actions">
            <div className="story-views">
              👁 {viewingStory.stories[currentStoryIndex]?.views} views
            </div>
            {viewingStory.userId !== user.id && (
              <button className="reply-story">💬 Reply</button>
            )}
          </div>
        </div>
      )}

      {/* Create Story Modal */}
      {showCreateModal && (
        <div className="create-story-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Share a Moment</h3>
              <button onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <div className="story-templates">
              {storyTemplates.map(template => (
                <div 
                  key={template.id}
                  className="template-card"
                  style={{ backgroundColor: template.background }}
                  onClick={() => {
                    const text = prompt(template.prompt);
                    if (text) {
                      createTextStory(text, template);
                    }
                  }}
                >
                  <span className="template-icon">{template.icon}</span>
                  <span className="template-name">{template.name}</span>
                </div>
              ))}
            </div>

            <div className="custom-story">
              <h4>Or create a custom story</h4>
              <button className="photo-story-btn">📷 Photo Story</button>
              <button className="text-story-btn">📝 Text Story</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;

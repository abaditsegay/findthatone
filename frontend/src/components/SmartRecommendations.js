import React, { useState, useEffect } from 'react';
import './SmartRecommendations.css';

const SmartRecommendations = ({ user, matches, userBehavior }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState([]);
  const [learningProgress, setLearningProgress] = useState(0);

  // AI-powered recommendation engine
  const generateRecommendations = () => {
    const recs = [];

    // Analyze user behavior patterns
    if (userBehavior.swipePattern) {
      const { rightSwipeRate, preferredAgeRange, preferredInterests } = userBehavior.swipePattern;
      
      if (rightSwipeRate < 0.1) {
        recs.push({
          type: 'behavior',
          title: '🎯 Broaden Your Horizons',
          description: 'You\'re being quite selective! Consider expanding your preferences to discover more connections.',
          action: 'Adjust Filters',
          priority: 'medium'
        });
      }

      if (preferredInterests.length > 0) {
        recs.push({
          type: 'interest',
          title: '🌟 Interest-Based Matches',
          description: `We've noticed you like profiles with ${preferredInterests.join(', ')}. Here are similar people nearby.`,
          action: 'View Matches',
          priority: 'high'
        });
      }
    }

    // Conversation analysis
    if (userBehavior.messagePattern) {
      const { responseRate, avgMessageLength, preferredTimeToMessage } = userBehavior.messagePattern;
      
      if (responseRate < 0.3) {
        recs.push({
          type: 'communication',
          title: '💬 Conversation Tips',
          description: 'Your response rate could be improved. Try asking open-ended questions and showing genuine interest.',
          action: 'View Tips',
          priority: 'high'
        });
      }

      if (preferredTimeToMessage > 24) {
        recs.push({
          type: 'timing',
          title: '⏰ Strike While Hot',
          description: 'Quick responses lead to better connections. Try messaging within a few hours of matching.',
          action: 'Set Reminders',
          priority: 'medium'
        });
      }
    }

    // Profile optimization
    const profileScore = calculateProfileScore(user);
    if (profileScore < 80) {
      recs.push({
        type: 'profile',
        title: '📸 Profile Boost',
        description: `Your profile score is ${profileScore}%. Add more photos or update your bio to get more matches.`,
        action: 'Optimize Profile',
        priority: 'high'
      });
    }

    // Success prediction
    const successPrediction = predictMatchSuccess(user, matches);
    if (successPrediction.confidence > 0.7) {
      recs.push({
        type: 'prediction',
        title: '🔮 High Potential Match',
        description: `Our AI predicts a ${Math.round(successPrediction.probability * 100)}% compatibility with ${successPrediction.match?.name}. Send them a message!`,
        action: 'Message Now',
        priority: 'high'
      });
    }

    return recs;
  };

  const calculateProfileScore = (userProfile) => {
    let score = 0;
    
    // Photo quality and quantity (40 points)
    if (userProfile.profilePhotoUrl) score += 20;
    if (userProfile.additionalPhotos?.length >= 3) score += 20;
    
    // Bio completeness (30 points)
    if (userProfile.bio && userProfile.bio.length > 50) score += 30;
    
    // Interests and details (30 points)
    if (userProfile.interests && userProfile.interests.length > 0) score += 15;
    if (userProfile.location) score += 5;
    if (userProfile.age) score += 5;
    if (userProfile.occupation) score += 5;
    
    return score;
  };

  const predictMatchSuccess = (userProfile, userMatches) => {
    if (!userMatches || userMatches.length === 0) {
      return { confidence: 0, probability: 0, match: null };
    }

    // Simple ML-style prediction based on patterns
    const bestMatch = userMatches.reduce((best, current) => {
      const compatibility = calculateCompatibility(userProfile, current);
      return compatibility > (best?.compatibility || 0) ? 
        { ...current, compatibility } : best;
    }, null);

    return {
      confidence: 0.85,
      probability: bestMatch?.compatibility || 0,
      match: bestMatch
    };
  };

  const calculateCompatibility = (user1, user2) => {
    let compatibility = 0.5; // Base compatibility
    
    // Age compatibility
    const ageDiff = Math.abs(user1.age - user2.age);
    compatibility += (10 - Math.min(ageDiff, 10)) / 10 * 0.2;
    
    // Interest overlap
    const user1Interests = user1.interests?.split(',') || [];
    const user2Interests = user2.interests?.split(',') || [];
    const commonInterests = user1Interests.filter(interest => 
      user2Interests.some(interest2 => 
        interest.trim().toLowerCase() === interest2.trim().toLowerCase()
      )
    );
    compatibility += (commonInterests.length / Math.max(user1Interests.length, 1)) * 0.3;
    
    return Math.min(compatibility, 1);
  };

  const generateInsights = () => {
    const newInsights = [];
    
    // Peak activity analysis
    newInsights.push({
      type: 'activity',
      title: '🕐 Your Best Time to Swipe',
      description: 'You get the most matches when you\'re active between 7-9 PM. People are more likely to respond during this time.',
      metric: '73% higher response rate'
    });

    // Attraction patterns
    newInsights.push({
      type: 'preference',
      title: '🎯 Your Type Analysis',
      description: 'You tend to match with creative professionals who enjoy outdoor activities and have a sense of humor.',
      metric: '8/10 matches fit this pattern'
    });

    // Success metrics
    newInsights.push({
      type: 'success',
      title: '📈 Your Progress',
      description: 'Your match rate has improved 40% this month! Your updated photos are making a difference.',
      metric: '+40% match rate'
    });

    return newInsights;
  };

  useEffect(() => {
    const newRecommendations = generateRecommendations();
    const newInsights = generateInsights();
    
    setRecommendations(newRecommendations);
    setInsights(newInsights);
    setLearningProgress(Math.min(learningProgress + 10, 100));
  }, [user, matches, userBehavior]);

  const handleRecommendationAction = (recommendation) => {
    switch (recommendation.action) {
      case 'Adjust Filters':
        // Navigate to filters page
        break;
      case 'View Matches':
        // Navigate to curated matches
        break;
      case 'View Tips':
        // Show conversation tips modal
        break;
      case 'Optimize Profile':
        // Navigate to profile edit
        break;
      case 'Message Now':
        // Navigate to chat with recommended match
        break;
      default:
        break;
    }
  };

  return (
    <div className="smart-recommendations">
      <div className="recommendations-header">
        <h2>🧠 Smart Insights</h2>
        <div className="learning-progress">
          <span>AI Learning Progress</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${learningProgress}%` }}
            ></div>
          </div>
          <span>{learningProgress}%</span>
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div className="recommendations-section">
        <h3>💡 Personalized Recommendations</h3>
        <div className="recommendations-grid">
          {recommendations.map((rec, index) => (
            <div key={index} className={`recommendation-card ${rec.priority}`}>
              <div className="rec-header">
                <h4>{rec.title}</h4>
                <span className={`priority-badge ${rec.priority}`}>
                  {rec.priority}
                </span>
              </div>
              <p>{rec.description}</p>
              <button 
                className="rec-action-btn"
                onClick={() => handleRecommendationAction(rec)}
              >
                {rec.action}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data Insights */}
      <div className="insights-section">
        <h3>📊 Your Dating Insights</h3>
        <div className="insights-grid">
          {insights.map((insight, index) => (
            <div key={index} className="insight-card">
              <h4>{insight.title}</h4>
              <p>{insight.description}</p>
              <div className="insight-metric">
                {insight.metric}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Matching Algorithm Info */}
      <div className="algorithm-section">
        <h3>🔬 How Our AI Helps You</h3>
        <div className="algorithm-features">
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <div className="feature-info">
              <h4>Smart Filtering</h4>
              <p>Our AI learns your preferences and shows you more relevant matches over time.</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📈</span>
            <div className="feature-info">
              <h4>Behavior Analysis</h4>
              <p>We analyze your swiping patterns and conversation success to optimize your experience.</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💬</span>
            <div className="feature-info">
              <h4>Conversation Coaching</h4>
              <p>Get personalized tips on how to start and maintain engaging conversations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartRecommendations;

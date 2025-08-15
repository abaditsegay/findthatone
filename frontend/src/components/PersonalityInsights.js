import React, { useState, useEffect } from 'react';
import './PersonalityInsights.css';

const PersonalityInsights = ({ user, potentialMatch }) => {
  const [personalityData, setPersonalityData] = useState(null);
  const [compatibilityScore, setCompatibilityScore] = useState(null);
  const [insights, setInsights] = useState([]);

  // Simulated personality analysis based on user data
  const analyzePersonality = (userData) => {
    // In real implementation, this would call an AI service
    const traits = {
      openness: Math.floor(Math.random() * 100),
      conscientiousness: Math.floor(Math.random() * 100),
      extraversion: Math.floor(Math.random() * 100),
      agreeableness: Math.floor(Math.random() * 100),
      neuroticism: Math.floor(Math.random() * 100)
    };

    const personalityType = determinePersonalityType(traits);
    
    return {
      traits,
      personalityType,
      strengths: getStrengths(traits),
      communicationStyle: getCommunicationStyle(traits)
    };
  };

  const determinePersonalityType = (traits) => {
    if (traits.extraversion > 60 && traits.openness > 60) return "The Explorer";
    if (traits.conscientiousness > 70) return "The Achiever";
    if (traits.agreeableness > 70) return "The Harmonizer";
    if (traits.openness > 70) return "The Creative";
    return "The Balanced";
  };

  const getStrengths = (traits) => {
    const strengths = [];
    if (traits.openness > 60) strengths.push("Creative & Open-minded");
    if (traits.conscientiousness > 60) strengths.push("Reliable & Organized");
    if (traits.extraversion > 60) strengths.push("Social & Energetic");
    if (traits.agreeableness > 60) strengths.push("Empathetic & Cooperative");
    return strengths;
  };

  const getCommunicationStyle = (traits) => {
    if (traits.extraversion > 60) return "Direct & Expressive";
    if (traits.agreeableness > 60) return "Supportive & Understanding";
    if (traits.conscientiousness > 60) return "Clear & Structured";
    return "Thoughtful & Reflective";
  };

  const calculateCompatibility = (user1Traits, user2Traits) => {
    // Compatibility algorithm
    let score = 0;
    const weights = {
      openness: 0.2,
      conscientiousness: 0.15,
      extraversion: 0.25,
      agreeableness: 0.3,
      neuroticism: 0.1
    };

    // Similar extraversion levels work well
    const extraversionDiff = Math.abs(user1Traits.extraversion - user2Traits.extraversion);
    score += (100 - extraversionDiff) * weights.extraversion;

    // High agreeableness in both is good
    score += Math.min(user1Traits.agreeableness, user2Traits.agreeableness) * weights.agreeableness;

    // Complementary openness (one high, one moderate is good)
    const opennessDiff = Math.abs(user1Traits.openness - user2Traits.openness);
    score += (opennessDiff < 30 ? 80 : 60) * weights.openness;

    // Similar conscientiousness helps
    const conscientiousnessDiff = Math.abs(user1Traits.conscientiousness - user2Traits.conscientiousness);
    score += (100 - conscientiousnessDiff) * weights.conscientiousness;

    // Lower neuroticism in both is better
    score += (200 - user1Traits.neuroticism - user2Traits.neuroticism) * weights.neuroticism;

    return Math.min(Math.round(score), 98); // Cap at 98% to seem realistic
  };

  const getCompatibilityInsights = (score, user1Personality, user2Personality) => {
    const insights = [];
    
    if (score >= 85) {
      insights.push({
        type: 'strength',
        text: "🌟 Excellent compatibility! You share similar values and communication styles."
      });
    } else if (score >= 70) {
      insights.push({
        type: 'good',
        text: "💫 Strong potential! Your personalities complement each other well."
      });
    }

    if (user1Personality.communicationStyle === user2Personality.communicationStyle) {
      insights.push({
        type: 'strength',
        text: "💬 You both have similar communication styles, which reduces misunderstandings."
      });
    }

    insights.push({
      type: 'tip',
      text: `💡 Conversation starter: Ask about their experience with ${user2Personality.strengths[0]?.toLowerCase()}`
    });

    return insights;
  };

  useEffect(() => {
    if (user) {
      const analysis = analyzePersonality(user);
      setPersonalityData(analysis);

      if (potentialMatch) {
        const matchAnalysis = analyzePersonality(potentialMatch);
        const compatibility = calculateCompatibility(analysis.traits, matchAnalysis.traits);
        setCompatibilityScore(compatibility);
        setInsights(getCompatibilityInsights(compatibility, analysis, matchAnalysis));
      }
    }
  }, [user, potentialMatch]);

  if (!personalityData) {
    return (
      <div className="personality-insights loading">
        <div className="loading-spinner"></div>
        <p>Analyzing personality insights...</p>
      </div>
    );
  }

  return (
    <div className="personality-insights">
      {compatibilityScore && (
        <div className="compatibility-section">
          <div className="compatibility-header">
            <h3>🧠 AI Compatibility Analysis</h3>
            <div className="compatibility-score">
              <div className={`score-circle ${compatibilityScore >= 80 ? 'high' : compatibilityScore >= 60 ? 'medium' : 'low'}`}>
                <span className="score-number">{compatibilityScore}%</span>
                <span className="score-label">Match</span>
              </div>
            </div>
          </div>

          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={index} className={`insight-item ${insight.type}`}>
                <p>{insight.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="personality-overview">
        <h3>🎭 Your Personality Profile</h3>
        <div className="personality-type">
          <h4>{personalityData.personalityType}</h4>
          <p>Communication Style: {personalityData.communicationStyle}</p>
        </div>

        <div className="traits-chart">
          <h4>Personality Traits</h4>
          {Object.entries(personalityData.traits).map(([trait, value]) => (
            <div key={trait} className="trait-bar">
              <div className="trait-info">
                <span className="trait-name">{trait.charAt(0).toUpperCase() + trait.slice(1)}</span>
                <span className="trait-value">{value}%</span>
              </div>
              <div className="trait-progress">
                <div 
                  className="trait-fill" 
                  style={{ width: `${value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="strengths-section">
          <h4>💪 Your Strengths</h4>
          <div className="strengths-grid">
            {personalityData.strengths.map((strength, index) => (
              <div key={index} className="strength-tag">
                {strength}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="personality-tips">
        <h4>💡 Dating Tips Based on Your Personality</h4>
        <div className="tips-list">
          <div className="tip-item">
            <span className="tip-icon">🗣️</span>
            <p>Your {personalityData.communicationStyle.toLowerCase()} communication style works best in relaxed settings.</p>
          </div>
          <div className="tip-item">
            <span className="tip-icon">🎯</span>
            <p>Focus on activities that align with your {personalityData.personalityType.toLowerCase()} nature.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalityInsights;

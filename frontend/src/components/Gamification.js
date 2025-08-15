import React, { useState, useEffect } from 'react';
import './Gamification.css';

const Gamification = ({ user, onRewardClaim }) => {
  const [achievements, setAchievements] = useState([]);
  const [dailyQuests, setDailyQuests] = useState([]);
  const [userStats, setUserStats] = useState({
    level: 1,
    xp: 0,
    totalMatches: 0,
    conversationsStarted: 0,
    profileViews: 0,
    streak: 0
  });

  const achievementDefinitions = [
    {
      id: 'first_match',
      title: '💕 First Match',
      description: 'Get your first mutual match',
      reward: { coins: 50, xp: 100 },
      icon: '🎯',
      rarity: 'common'
    },
    {
      id: 'conversation_starter',
      title: '💬 Conversation Starter',
      description: 'Send your first message',
      reward: { coins: 25, xp: 50 },
      icon: '📝',
      rarity: 'common'
    },
    {
      id: 'profile_complete',
      title: '📸 Profile Perfect',
      description: 'Complete your profile with photos and bio',
      reward: { coins: 100, xp: 150 },
      icon: '✨',
      rarity: 'common'
    },
    {
      id: 'weekly_active',
      title: '🔥 Week Warrior',
      description: 'Be active for 7 consecutive days',
      reward: { coins: 200, xp: 300 },
      icon: '🏆',
      rarity: 'rare'
    },
    {
      id: 'social_butterfly',
      title: '🦋 Social Butterfly',
      description: 'Start conversations with 10 different people',
      reward: { coins: 300, xp: 400 },
      icon: '🌟',
      rarity: 'epic'
    },
    {
      id: 'matchmaker',
      title: '💘 Matchmaker',
      description: 'Get 25 mutual matches',
      reward: { coins: 500, xp: 750 },
      icon: '👑',
      rarity: 'legendary'
    }
  ];

  const questDefinitions = [
    {
      id: 'daily_swipe',
      title: 'Daily Discovery',
      description: 'Swipe on 20 profiles',
      progress: 0,
      target: 20,
      reward: { coins: 30, xp: 50 },
      icon: '👀'
    },
    {
      id: 'send_message',
      title: 'Start a Conversation',
      description: 'Send a message to a match',
      progress: 0,
      target: 1,
      reward: { coins: 40, xp: 60 },
      icon: '💌'
    },
    {
      id: 'update_profile',
      title: 'Fresh Look',
      description: 'Update your bio or add a new photo',
      progress: 0,
      target: 1,
      reward: { coins: 25, xp: 40 },
      icon: '📱'
    }
  ];

  const calculateLevel = (xp) => {
    return Math.floor(xp / 1000) + 1;
  };

  const getXpForNextLevel = (currentXp) => {
    const currentLevel = calculateLevel(currentXp);
    return currentLevel * 1000;
  };

  const checkAchievements = () => {
    const newAchievements = [];
    
    achievementDefinitions.forEach(achievement => {
      const isUnlocked = achievements.some(a => a.id === achievement.id);
      if (!isUnlocked) {
        let shouldUnlock = false;
        
        switch (achievement.id) {
          case 'first_match':
            shouldUnlock = userStats.totalMatches >= 1;
            break;
          case 'conversation_starter':
            shouldUnlock = userStats.conversationsStarted >= 1;
            break;
          case 'profile_complete':
            shouldUnlock = user.bio && user.profilePhotoUrl;
            break;
          case 'weekly_active':
            shouldUnlock = userStats.streak >= 7;
            break;
          case 'social_butterfly':
            shouldUnlock = userStats.conversationsStarted >= 10;
            break;
          case 'matchmaker':
            shouldUnlock = userStats.totalMatches >= 25;
            break;
          default:
            break;
        }
        
        if (shouldUnlock) {
          newAchievements.push({
            ...achievement,
            unlockedAt: new Date(),
            claimed: false
          });
        }
      }
    });
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  };

  const claimReward = (achievementId) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.claimed) {
      setAchievements(prev => 
        prev.map(a => 
          a.id === achievementId ? { ...a, claimed: true } : a
        )
      );
      
      setUserStats(prev => ({
        ...prev,
        xp: prev.xp + achievement.reward.xp
      }));
      
      onRewardClaim && onRewardClaim(achievement.reward);
    }
  };

  const updateQuestProgress = (questId, progress) => {
    setDailyQuests(prev =>
      prev.map(quest =>
        quest.id === questId
          ? { ...quest, progress: Math.min(progress, quest.target) }
          : quest
      )
    );
  };

  useEffect(() => {
    // Initialize daily quests
    setDailyQuests(questDefinitions.map(quest => ({ ...quest })));
    
    // Simulate user stats (in real app, fetch from backend)
    setUserStats({
      level: calculateLevel(user.xp || 0),
      xp: user.xp || 0,
      totalMatches: user.totalMatches || 0,
      conversationsStarted: user.conversationsStarted || 0,
      profileViews: user.profileViews || 0,
      streak: user.streak || 0
    });
  }, [user]);

  useEffect(() => {
    checkAchievements();
  }, [userStats, user]);

  const currentLevel = userStats.level;
  const xpProgress = userStats.xp % 1000;
  const xpForNextLevel = 1000;

  return (
    <div className="gamification">
      {/* Level Progress */}
      <div className="level-section">
        <div className="level-header">
          <div className="level-info">
            <h2>Level {currentLevel}</h2>
            <p>{xpProgress}/{xpForNextLevel} XP</p>
          </div>
          <div className="level-badge">
            🏆
          </div>
        </div>
        <div className="xp-bar">
          <div 
            className="xp-fill" 
            style={{ width: `${(xpProgress / xpForNextLevel) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Daily Quests */}
      <div className="quests-section">
        <h3>🎯 Daily Quests</h3>
        <div className="quests-grid">
          {dailyQuests.map(quest => (
            <div key={quest.id} className="quest-card">
              <div className="quest-icon">{quest.icon}</div>
              <div className="quest-info">
                <h4>{quest.title}</h4>
                <p>{quest.description}</p>
                <div className="quest-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(quest.progress / quest.target) * 100}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {quest.progress}/{quest.target}
                  </span>
                </div>
              </div>
              <div className="quest-reward">
                <span className="reward-coins">🪙 {quest.reward.coins}</span>
                <span className="reward-xp">✨ {quest.reward.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="achievements-section">
        <h3>🏅 Achievements</h3>
        <div className="achievements-grid">
          {achievementDefinitions.map(achievement => {
            const userAchievement = achievements.find(a => a.id === achievement.id);
            const isUnlocked = !!userAchievement;
            const isClaimed = userAchievement?.claimed || false;
            
            return (
              <div 
                key={achievement.id} 
                className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'} ${isClaimed ? 'claimed' : ''}`}
              >
                <div className="achievement-icon">
                  {isUnlocked ? achievement.icon : '🔒'}
                </div>
                <div className="achievement-info">
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
                  <div className="achievement-reward">
                    <span className="reward-coins">🪙 {achievement.reward.coins}</span>
                    <span className="reward-xp">✨ {achievement.reward.xp} XP</span>
                  </div>
                </div>
                <div className={`rarity-badge ${achievement.rarity}`}>
                  {achievement.rarity}
                </div>
                {isUnlocked && !isClaimed && (
                  <button 
                    className="claim-btn"
                    onClick={() => claimReward(achievement.id)}
                  >
                    Claim Reward
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-section">
        <h3>📊 Your Stats</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-icon">💕</span>
            <span className="stat-value">{userStats.totalMatches}</span>
            <span className="stat-label">Total Matches</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">💬</span>
            <span className="stat-value">{userStats.conversationsStarted}</span>
            <span className="stat-label">Conversations</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">👀</span>
            <span className="stat-value">{userStats.profileViews}</span>
            <span className="stat-label">Profile Views</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🔥</span>
            <span className="stat-value">{userStats.streak}</span>
            <span className="stat-label">Day Streak</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gamification;

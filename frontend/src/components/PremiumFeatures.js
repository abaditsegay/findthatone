import React, { useState } from 'react';
import './PremiumFeatures.css';

const PremiumFeatures = ({ user, onUpgrade }) => {
  const [selectedPlan, setSelectedPlan] = useState('plus');

  const premiumFeatures = {
    basic: {
      name: 'FindTheOne Basic',
      price: 'Free',
      features: [
        '5 likes per day',
        'Basic matching',
        'Limited messaging',
        'Standard support'
      ],
      current: !user.isPremium
    },
    plus: {
      name: 'FindTheOne Plus',
      price: '$19.99/month',
      popular: true,
      features: [
        '🔥 Unlimited likes',
        '💫 See who liked you',
        '🎯 Advanced filters',
        '📍 Passport (match anywhere)',
        '⚡ 5 Super Likes per day',
        '🔄 Unlimited rewinds',
        '💬 Read receipts',
        '🎭 Incognito mode'
      ],
      color: '#FF6B6B'
    },
    premium: {
      name: 'FindTheOne Premium',
      price: '$39.99/month',
      features: [
        '✨ Everything in Plus',
        '🧠 AI personality insights',
        '🎥 Video profile priority',
        '💎 Priority in recommendations',
        '🎪 Access to exclusive events',
        '📊 Advanced analytics',
        '🤖 Personal dating coach',
        '👑 VIP badge on profile',
        '🔮 Compatibility predictions'
      ],
      color: '#8B5CF6'
    }
  };

  const superBoosts = [
    {
      name: 'Super Boost',
      description: 'Be the top profile in your area for 30 minutes',
      price: '$4.99',
      icon: '🚀',
      benefits: ['10x more profile views', 'Priority in swipe deck']
    },
    {
      name: 'Read Receipts',
      description: 'See when someone reads your messages',
      price: '$2.99',
      icon: '👁️',
      benefits: ['Know when messages are read', 'Better conversation timing']
    },
    {
      name: 'Super Like Pack',
      description: '5 Super Likes to make a stronger impression',
      price: '$3.99',
      icon: '⭐',
      benefits: ['Stand out from the crowd', '3x higher match rate']
    }
  ];

  const exclusiveFeatures = [
    {
      title: '🎭 Incognito Mode',
      description: 'Browse profiles without being seen. Only people you like can see your profile.',
      tier: 'plus'
    },
    {
      title: '🎪 VIP Events',
      description: 'Get invited to exclusive virtual and in-person dating events for premium members.',
      tier: 'premium'
    },
    {
      title: '🤖 AI Dating Coach',
      description: 'Get personalized advice on your profile, photos, and conversation starters.',
      tier: 'premium'
    },
    {
      title: '📊 Profile Analytics',
      description: 'See detailed stats on your profile performance and match quality.',
      tier: 'premium'
    },
    {
      title: '🔮 Compatibility Oracle',
      description: 'Advanced AI predicts your long-term compatibility with potential matches.',
      tier: 'premium'
    }
  ];

  const handleUpgrade = (plan) => {
    // In real implementation, this would integrate with payment processing
    onUpgrade && onUpgrade(plan);
  };

  return (
    <div className="premium-features">
      <div className="premium-header">
        <h1>✨ Unlock Your Dating Potential</h1>
        <p>Get more matches, better connections, and find love faster with premium features</p>
      </div>

      {/* Success Stories */}
      <div className="success-section">
        <h2>💕 Premium Members Find Love 3x Faster</h2>
        <div className="testimonials">
          <div className="testimonial">
            <div className="testimonial-content">
              <p>"I found my soulmate within 2 weeks of upgrading to Premium. The AI insights were incredible!"</p>
              <div className="testimonial-author">
                <img src="/placeholder-avatar.svg" alt="Sarah" />
                <div>
                  <h4>Sarah & Mike</h4>
                  <span>Premium Members</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="pricing-section">
        <h2>Choose Your Plan</h2>
        <div className="pricing-grid">
          {Object.entries(premiumFeatures).map(([key, plan]) => (
            <div 
              key={key} 
              className={`pricing-card ${plan.popular ? 'popular' : ''} ${plan.current ? 'current' : ''}`}
              onClick={() => setSelectedPlan(key)}
            >
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              {plan.current && <div className="current-badge">Current Plan</div>}
              
              <div className="plan-header">
                <h3>{plan.name}</h3>
                <div className="plan-price">{plan.price}</div>
              </div>

              <div className="plan-features">
                {plan.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <span className="check-icon">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {!plan.current && (
                <button 
                  className={`upgrade-btn ${selectedPlan === key ? 'selected' : ''}`}
                  onClick={() => handleUpgrade(key)}
                  style={{ backgroundColor: plan.color }}
                >
                  {key === 'basic' ? 'Current Plan' : 'Upgrade Now'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Exclusive Features Showcase */}
      <div className="exclusive-section">
        <h2>🌟 Exclusive Premium Features</h2>
        <div className="features-showcase">
          {exclusiveFeatures.map((feature, index) => (
            <div key={index} className="showcase-item">
              <div className="feature-visual">
                <span className="feature-emoji">{feature.title.split(' ')[0]}</span>
              </div>
              <div className="feature-details">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className={`tier-badge ${feature.tier}`}>
                  {feature.tier === 'plus' ? 'Plus' : 'Premium'} Feature
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Super Boosts */}
      <div className="boosts-section">
        <h2>🚀 Super Boosts</h2>
        <p>Give your profile an instant boost with these powerful features</p>
        <div className="boosts-grid">
          {superBoosts.map((boost, index) => (
            <div key={index} className="boost-card">
              <div className="boost-icon">{boost.icon}</div>
              <h3>{boost.name}</h3>
              <p>{boost.description}</p>
              <div className="boost-benefits">
                {boost.benefits.map((benefit, i) => (
                  <div key={i} className="benefit-item">
                    <span>✨</span>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="boost-price">{boost.price}</div>
              <button className="boost-btn">Get Boost</button>
            </div>
          ))}
        </div>
      </div>

      {/* Value Proposition */}
      <div className="value-section">
        <h2>Why Choose Premium?</h2>
        <div className="value-grid">
          <div className="value-item">
            <span className="value-icon">📈</span>
            <h3>3x More Matches</h3>
            <p>Premium members get significantly more likes and matches than free users</p>
          </div>
          <div className="value-item">
            <span className="value-icon">⚡</span>
            <h3>Faster Connections</h3>
            <p>Advanced features help you connect with the right people quickly</p>
          </div>
          <div className="value-item">
            <span className="value-icon">🎯</span>
            <h3>Better Quality Matches</h3>
            <p>AI-powered matching finds people who are truly compatible with you</p>
          </div>
        </div>
      </div>

      {/* Limited Time Offer */}
      <div className="offer-section">
        <div className="offer-card">
          <h2>🎉 Limited Time Offer</h2>
          <p>Get your first month of Premium for just $19.99 (normally $39.99)</p>
          <div className="offer-timer">
            <span>Offer expires in: 2 days, 14 hours, 32 minutes</span>
          </div>
          <button className="offer-btn">Claim Offer Now</button>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeatures;

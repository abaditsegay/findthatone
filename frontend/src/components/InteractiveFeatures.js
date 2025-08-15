import React, { useState } from 'react';
import './InteractiveFeatures.css';

const InteractiveFeatures = ({ user, matches, onGameComplete }) => {
  const [activeGame, setActiveGame] = useState(null);
  const [gameData, setGameData] = useState({});

  const interactiveFeatures = [
    {
      id: 'compatibility_quiz',
      title: '💝 Compatibility Quiz',
      description: 'Take a fun quiz with your match to see how compatible you are!',
      icon: '❓',
      duration: '5 min',
      players: 2,
      category: 'quiz'
    },
    {
      id: 'would_you_rather',
      title: '🤔 Would You Rather',
      description: 'Answer fun dilemmas and see if you think alike',
      icon: '⚖️',
      duration: '3 min',
      players: 2,
      category: 'game'
    },
    {
      id: 'icebreaker_cards',
      title: '🧊 Icebreaker Cards',
      description: 'Draw random conversation starters and answer together',
      icon: '🎴',
      duration: '10 min',
      players: 2,
      category: 'conversation'
    },
    {
      id: 'personality_match',
      title: '🎭 Personality Match',
      description: 'Discover your personality types and compatibility score',
      icon: '🧠',
      duration: '8 min',
      players: 2,
      category: 'personality'
    },
    {
      id: 'virtual_date',
      title: '🌆 Virtual Date Ideas',
      description: 'Get creative date ideas you can do together online',
      icon: '💕',
      duration: '2 min',
      players: 2,
      category: 'activity'
    },
    {
      id: 'emoji_story',
      title: '😄 Emoji Storytelling',
      description: 'Create stories together using only emojis',
      icon: '📖',
      duration: '5 min',
      players: 2,
      category: 'creative'
    }
  ];

  const compatibilityQuestions = [
    {
      question: "What's your ideal Friday night?",
      options: [
        "🏠 Netflix and chill at home",
        "🍸 Going out to bars/clubs", 
        "🍽️ Dinner at a nice restaurant",
        "🎮 Playing video games"
      ]
    },
    {
      question: "How do you handle conflicts?",
      options: [
        "💬 Talk it out immediately",
        "🤐 Take time to cool down first",
        "🤝 Find a compromise",
        "😤 Avoid confrontation"
      ]
    },
    {
      question: "What's most important in a relationship?",
      options: [
        "💕 Emotional connection",
        "🎯 Shared goals and values",
        "😂 Humor and fun",
        "🔥 Physical chemistry"
      ]
    }
  ];

  const wouldYouRatherQuestions = [
    {
      question: "Would you rather...",
      optionA: "🏖️ Always vacation at the beach",
      optionB: "🏔️ Always vacation in the mountains"
    },
    {
      question: "Would you rather...",
      optionA: "🌃 Live in a big city",
      optionB: "🏡 Live in a small town"
    },
    {
      question: "Would you rather...",
      optionA: "🎬 Always watch movies",
      optionB: "📚 Always read books"
    }
  ];

  const icebreakerCards = [
    "If you could have dinner with anyone, living or dead, who would it be and why?",
    "What's the most spontaneous thing you've ever done?",
    "If you had to choose one superpower, what would it be?",
    "What's your biggest pet peeve in dating?",
    "Describe your perfect Sunday morning",
    "What's something you're passionate about that most people don't know?",
    "If you could travel anywhere right now, where would you go?",
    "What's the best piece of advice you've ever received?"
  ];

  const startGame = (game) => {
    setActiveGame(game);
    
    // Initialize game-specific data
    switch (game.id) {
      case 'compatibility_quiz':
        setGameData({
          currentQuestion: 0,
          userAnswers: [],
          partnerAnswers: [],
          questions: compatibilityQuestions
        });
        break;
      case 'would_you_rather':
        setGameData({
          currentQuestion: 0,
          userAnswers: [],
          partnerAnswers: [],
          questions: wouldYouRatherQuestions
        });
        break;
      case 'icebreaker_cards':
        setGameData({
          currentCard: Math.floor(Math.random() * icebreakerCards.length),
          cards: icebreakerCards,
          usedCards: []
        });
        break;
      default:
        setGameData({});
    }
  };

  const answerQuestion = (answer) => {
    if (!activeGame || !gameData) return;

    const newGameData = { ...gameData };
    newGameData.userAnswers = [...(gameData.userAnswers || []), answer];
    newGameData.currentQuestion = (gameData.currentQuestion || 0) + 1;

    setGameData(newGameData);

    // Check if game is complete
    if (newGameData.currentQuestion >= newGameData.questions.length) {
      completeGame(newGameData);
    }
  };

  const drawNewCard = () => {
    if (!gameData.cards) return;

    const availableCards = gameData.cards.filter((_, index) => 
      !gameData.usedCards.includes(index)
    );

    if (availableCards.length === 0) {
      setGameData({ ...gameData, usedCards: [] }); // Reset if all used
      return;
    }

    const newCardIndex = Math.floor(Math.random() * gameData.cards.length);
    while (gameData.usedCards.includes(newCardIndex)) {
      // Keep trying until we get an unused card
    }

    setGameData({
      ...gameData,
      currentCard: newCardIndex,
      usedCards: [...gameData.usedCards, newCardIndex]
    });
  };

  const completeGame = (finalGameData) => {
    // Calculate results based on game type
    let results = {};
    
    if (activeGame.id === 'compatibility_quiz') {
      // Simple compatibility calculation
      const compatibility = Math.floor(Math.random() * 30) + 70; // 70-100%
      results = {
        compatibility: compatibility,
        message: compatibility > 85 ? 
          "Amazing compatibility! You two think very much alike!" :
          "Good compatibility! You have some great common ground."
      };
    }

    // Notify parent component
    onGameComplete && onGameComplete({
      game: activeGame,
      results: results,
      userAnswers: finalGameData.userAnswers
    });

    // Reset game state
    setActiveGame(null);
    setGameData({});
  };

  const closeGame = () => {
    setActiveGame(null);
    setGameData({});
  };

  // Game Renderer
  const renderGame = () => {
    if (!activeGame) return null;

    switch (activeGame.id) {
      case 'compatibility_quiz':
      case 'would_you_rather':
        const currentQ = gameData.questions?.[gameData.currentQuestion];
        if (!currentQ) return null;

        return (
          <div className="game-content quiz-game">
            <div className="question-progress">
              Question {(gameData.currentQuestion || 0) + 1} of {gameData.questions?.length}
            </div>
            <h3>{currentQ.question}</h3>
            <div className="options-grid">
              {(currentQ.options || [currentQ.optionA, currentQ.optionB]).map((option, index) => (
                <button
                  key={index}
                  className="option-btn"
                  onClick={() => answerQuestion(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 'icebreaker_cards':
        const currentCard = gameData.cards?.[gameData.currentCard];
        return (
          <div className="game-content card-game">
            <div className="icebreaker-card">
              <div className="card-content">
                <h3>💬 Conversation Starter</h3>
                <p>{currentCard}</p>
              </div>
            </div>
            <div className="card-actions">
              <button className="draw-card-btn" onClick={drawNewCard}>
                🎴 Draw New Card
              </button>
              <button className="discuss-btn">
                💭 Start Discussing
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="game-content">
            <h3>🚧 Coming Soon!</h3>
            <p>This feature is being developed. Stay tuned!</p>
          </div>
        );
    }
  };

  if (activeGame) {
    return (
      <div className="game-modal">
        <div className="game-container">
          <div className="game-header">
            <div className="game-info">
              <span className="game-icon">{activeGame.icon}</span>
              <h2>{activeGame.title}</h2>
            </div>
            <button className="close-game" onClick={closeGame}>×</button>
          </div>
          {renderGame()}
        </div>
      </div>
    );
  }

  return (
    <div className="interactive-features">
      <div className="features-header">
        <h2>🎮 Interactive Features</h2>
        <p>Fun ways to connect and get to know each other better!</p>
      </div>

      <div className="features-grid">
        {interactiveFeatures.map((feature) => (
          <div key={feature.id} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <div className="feature-info">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <div className="feature-meta">
                <span className="duration">⏱️ {feature.duration}</span>
                <span className="players">👥 {feature.players} players</span>
              </div>
            </div>
            <button 
              className="start-feature-btn"
              onClick={() => startGame(feature)}
            >
              Start {feature.category === 'quiz' ? 'Quiz' : 'Game'}
            </button>
          </div>
        ))}
      </div>

      {/* Feature Categories */}
      <div className="categories-section">
        <h3>Browse by Category</h3>
        <div className="category-filters">
          {['quiz', 'game', 'conversation', 'personality', 'activity', 'creative'].map(category => (
            <button key={category} className="category-btn">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="benefits-section">
        <h3>Why Play Together?</h3>
        <div className="benefits-grid">
          <div className="benefit-item">
            <span className="benefit-icon">💬</span>
            <h4>Break the Ice</h4>
            <p>Games make it easier to start meaningful conversations</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🧠</span>
            <h4>Learn About Each Other</h4>
            <p>Discover personality traits and compatibility in a fun way</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">😄</span>
            <h4>Have Fun Together</h4>
            <p>Shared laughter and enjoyment builds stronger connections</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveFeatures;

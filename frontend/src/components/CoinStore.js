import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiConfig from '../config/api';
import './CoinStore.css';

function CoinStore({ user, onClose, onCoinsUpdated }) {
  const [packages, setPackages] = useState({});
  const [userCoins, setUserCoins] = useState(0);
  const [purchaseLoading, setPurchaseLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPackages();
    fetchUserCoins();
  }, []);

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(apiConfig.payment.packages, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPackages(response.data);
    } catch (error) {
      setError('Failed to load coin packages');
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
      // Silently handle error
    }
  };

  const handlePurchase = async (packageType) => {
    setPurchaseLoading(packageType);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        apiConfig.payment.purchase,
        { package: packageType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        setUserCoins(response.data.newCoinBalance);
        if (onCoinsUpdated) {
          onCoinsUpdated(response.data.newCoinBalance);
        }
        
        // Auto-close after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError('Purchase failed');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Purchase failed');
    } finally {
      setPurchaseLoading(null);
    }
  };

  const getPackageArray = () => {
    return Object.entries(packages).map(([key, pkg]) => ({
      id: key,
      ...pkg
    }));
  };

  return (
    <div className="coin-store-overlay">
      <div className="coin-store-modal">
        <div className="coin-store-header">
          <h2>🪙 Coin Store</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="current-balance">
          <div className="balance-info">
            <span className="coin-icon">🪙</span>
            <span className="balance-text">Current Balance: <strong>{userCoins} coins</strong></span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="packages-grid">
          {getPackageArray().map((pkg) => (
            <div key={pkg.id} className={`package-card ${pkg.popular ? 'popular' : ''}`}>
              {pkg.popular && <div className="popular-badge">Most Popular</div>}
              
              <div className="package-header">
                <h3>{pkg.id.charAt(0).toUpperCase() + pkg.id.slice(1)}</h3>
                <div className="coin-amount">
                  <span className="coins">{pkg.coins}</span>
                  <span className="coin-label">coins</span>
                  {pkg.bonus > 0 && (
                    <span className="bonus">+{pkg.bonus} bonus</span>
                  )}
                </div>
              </div>

              <div className="package-price">
                <span className="price">${pkg.price}</span>
              </div>

              <div className="package-value">
                <span className="value-text">
                  ${(pkg.price / (pkg.coins + pkg.bonus)).toFixed(3)} per coin
                </span>
              </div>

              <button
                className="purchase-btn"
                onClick={() => handlePurchase(pkg.id)}
                disabled={purchaseLoading === pkg.id}
              >
                {purchaseLoading === pkg.id ? (
                  <span>💳 Processing...</span>
                ) : (
                  <span>💳 Buy Now</span>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="store-info">
          <h4>ℹ️ How Coins Work</h4>
          <ul>
            <li>💌 Use 1 coin to read each message sent to you</li>
            <li>📤 Messages you send are always free to read</li>
            <li>🎁 New users get 10 free coins to start</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CoinStore;

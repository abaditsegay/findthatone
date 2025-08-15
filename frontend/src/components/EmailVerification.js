import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import apiConfig from '../config/api';
import './Auth.css';

function EmailVerification() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    code: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const checkVerificationStatus = useCallback(async () => {
    if (!formData.email) return;
    
    try {
      const response = await axios.get(apiConfig.auth.verificationStatus, {
        params: { email: formData.email }
      });
      
      if (response.data.verified) {
        setVerified(true);
        setMessage('Your email is already verified! You can now sign in.');
      }
    } catch (error) {
      // Silently handle error
    }
  }, [formData.email]);

  useEffect(() => {
    // Check verification status if email is provided
    checkVerificationStatus();
  }, [checkVerificationStatus]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post(apiConfig.auth.verifyEmail, formData);
      
      if (response.data.verified) {
        setVerified(true);
        setMessage('Email verified successfully! You can now sign in to your account.');
      }
    } catch (error) {
      setError(
        error.response?.data?.error || 
        'Verification failed. Please check your code and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }

    setResendLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post(apiConfig.auth.resendVerification, {
        email: formData.email
      });
      
      if (response.data.sent) {
        setMessage('New verification code sent! Please check your email.');
      }
    } catch (error) {
      setError(
        error.response?.data?.error || 
        'Failed to resend verification code. Please try again.'
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Verify Your Email</h1>
          <p>Please enter the verification code sent to your email address.</p>
        </div>

        {verified ? (
          <div className="verification-success">
            <div className="success-icon">✅</div>
            <h2>Email Verified Successfully!</h2>
            <p>Your account is now active and ready to use.</p>
            <Link to="/login" className="auth-button">
              Sign In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="code">Verification Code</label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="Enter 6-digit code"
                maxLength="6"
                pattern="[0-9]{6}"
                disabled={loading}
              />
              <small className="form-help">
                Enter the 6-digit code sent to your email
              </small>
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
        )}

        {!verified && (
          <div className="verification-actions">
            <p>Didn't receive the code?</p>
            <button 
              type="button"
              className="resend-button"
              onClick={handleResendCode}
              disabled={resendLoading || !formData.email}
            >
              {resendLoading ? 'Sending...' : 'Resend Code'}
            </button>
          </div>
        )}

        <div className="auth-footer">
          <p>
            Want to sign in with a different account? 
            <Link to="/login" className="auth-link">Go to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmailVerification;

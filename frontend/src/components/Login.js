import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import apiConfig from '../config/api';
import { createLogger } from '../utils/fileLogger';
import './Auth.css';

function Login({ onLogin }) {
  const logger = createLogger('Login');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Log component mount
  useEffect(() => {
    logger.logUserAction('PAGE_VIEW', { 
      page: 'login',
      timestamp: new Date().toISOString()
    });
  }, [logger]);

  const handleChange = (e) => {
    // Log form interactions (without sensitive data)
    logger.logUserAction('FORM_INPUT', {
      field: e.target.name,
      hasValue: !!e.target.value,
      fieldType: e.target.type
    });
    
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const startTime = Date.now();
    
    // Log login attempt
    logger.logAuth('LOGIN_ATTEMPT', formData.email, {
      hasEmail: !!formData.email,
      hasPassword: !!formData.password
    });

    try {
      // Validate form
      if (!formData.email || !formData.password) {
        logger.logFormValidation('login', 'email_password', 'Missing required fields');
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      const response = await axios.post(apiConfig.auth.signin, formData);
      const authResponse = response.data;
      
      // Extract token and create user object from the response
      const token = authResponse.token;
      const user = {
        id: authResponse.id,
        email: authResponse.email,
        name: authResponse.name
      };
      
      // Log successful login
      const duration = Date.now() - startTime;
      logger.logAuth('LOGIN_SUCCESS', formData.email, {
        userId: user.id,
        duration
      });
      
      logger.logPerformance('user_login', duration, {
        success: true,
        userId: user.id
      });
      
      onLogin(token, user);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Check if this is an email verification error
      if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
        setError(
          <div>
            <p>{error.response.data.message}</p>
            <p>
              <Link to="/verify-email" className="auth-link">
                Click here to verify your email
              </Link>
            </p>
          </div>
        );
      } else {
        // Log login failure
        logger.logAuth('LOGIN_FAILURE', formData.email, {
          error: error.message,
          status: error.response?.status,
          duration
        });
        
        logger.logError(error, 'user_login', {
          email: formData.email,
          status: error.response?.status,
          duration
        });

        setError(
          error.response?.data?.message || 
          error.message || 
          'Login failed. Please check your credentials.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTestUserLogin = (email, name) => {
    // Use different password for test user vs sample users
    const password = email === 'test@example.com' ? 'password' : 'password123';
    
    // Populate the form fields with test user credentials
    setFormData({
      email: email,
      password: password
    });
    setError('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>FindThatOne</h1>
          <p>Welcome back! Sign in to find your perfect match.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? 
            <Link to="/register" className="auth-link">Sign up here</Link>
          </p>
        </div>

        <div className="demo-credentials">
          <h4>Test Users - Click to Fill Form</h4>
          <div className="test-users-grid">
            <button 
              type="button" 
              className="test-user-btn"
              onClick={() => handleTestUserLogin('test@example.com', 'Test User')}
            >
              <span className="user-icon">🧪</span>
              <span>Test User</span>
            </button>
            <button 
              type="button" 
              className="test-user-btn"
              onClick={() => handleTestUserLogin('emma.garcia@gmail.com', 'Emma Garcia')}
            >
              <span className="user-icon">👩‍💼</span>
              <span>Emma Garcia</span>
            </button>
            <button 
              type="button" 
              className="test-user-btn"
              onClick={() => handleTestUserLogin('james.thompson@outlook.com', 'James Thompson')}
            >
              <span className="user-icon">👨‍💻</span>
              <span>James Thompson</span>
            </button>
            <button 
              type="button" 
              className="test-user-btn"
              onClick={() => handleTestUserLogin('sophia.chen@yahoo.com', 'Sophia Chen')}
            >
              <span className="user-icon">🧘‍♀️</span>
              <span>Sophia Chen</span>
            </button>
            <button 
              type="button" 
              className="test-user-btn"
              onClick={() => handleTestUserLogin('miguel.rodriguez@gmail.com', 'Miguel Rodriguez')}
            >
              <span className="user-icon">🏖️</span>
              <span>Miguel Rodriguez</span>
            </button>
          </div>
          <p className="demo-note">Click a user to fill the form, then click "Sign In" to login</p>
        </div>
      </div>
    </div>
  );
}

export default Login;

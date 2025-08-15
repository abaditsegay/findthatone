import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoVerification from '../components/VideoVerification';
import VerificationStatus from '../components/VerificationStatus';
import './VerificationPage.css';

const VerificationPage = () => {
    const [user, setUser] = useState(null);
    const [verificationData, setVerificationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('status');
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        fetchVerificationStatus(parsedUser.id);
    }, [navigate]);

    const fetchVerificationStatus = async (userId) => {
        try {
            const response = await fetch(`/api/verification/status/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setVerificationData(data);
                
                // Auto-switch to submit tab if not submitted yet
                if (data.status === 'NOT_SUBMITTED') {
                    setActiveTab('submit');
                }
            }
        } catch (error) {
            console.error('Error fetching verification status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerificationComplete = (data) => {
        // Refresh verification status
        fetchVerificationStatus(user.id);
        setActiveTab('status');
    };

    const canSubmitVideo = () => {
        if (!verificationData) return true;
        return ['NOT_SUBMITTED', 'REJECTED', 'RESUBMIT_REQUIRED'].includes(verificationData.status);
    };

    if (loading) {
        return (
            <div className="verification-page loading">
                <div className="spinner"></div>
                <h3>Loading verification information...</h3>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="verification-page">
            <div className="verification-container">
                <header className="verification-header">
                    <h1>Identity Verification</h1>
                    <p>Verify your identity to unlock all features and build trust in the community.</p>
                </header>

                <div className="verification-tabs">
                    <button 
                        className={`tab-button ${activeTab === 'status' ? 'active' : ''}`}
                        onClick={() => setActiveTab('status')}
                    >
                        <span className="tab-icon">📋</span>
                        Verification Status
                    </button>
                    {canSubmitVideo() && (
                        <button 
                            className={`tab-button ${activeTab === 'submit' ? 'active' : ''}`}
                            onClick={() => setActiveTab('submit')}
                        >
                            <span className="tab-icon">📹</span>
                            Submit Video
                        </button>
                    )}
                </div>

                <div className="verification-content">
                    {activeTab === 'status' && (
                        <div className="status-tab">
                            <h2>Current Status</h2>
                            <VerificationStatus userId={user.id} showDetails={true} />
                            
                            {verificationData && (
                                <div className="verification-benefits">
                                    <h3>Benefits of Verification</h3>
                                    <div className="benefits-grid">
                                        <div className="benefit-item">
                                            <div className="benefit-icon">🛡️</div>
                                            <h4>Increased Trust</h4>
                                            <p>Verified users are more trustworthy and get better matches.</p>
                                        </div>
                                        <div className="benefit-item">
                                            <div className="benefit-icon">⭐</div>
                                            <h4>Priority Matching</h4>
                                            <p>Your profile gets higher priority in search results.</p>
                                        </div>
                                        <div className="benefit-item">
                                            <div className="benefit-icon">💬</div>
                                            <h4>Enhanced Features</h4>
                                            <p>Access to premium communication features.</p>
                                        </div>
                                        <div className="benefit-item">
                                            <div className="benefit-icon">🔒</div>
                                            <h4>Safety Badge</h4>
                                            <p>Display a verification badge on your profile.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {canSubmitVideo() && (
                                <div className="action-prompt">
                                    <h3>Ready to Get Verified?</h3>
                                    <p>Complete your verification to unlock all features.</p>
                                    <button 
                                        className="btn btn-primary btn-lg"
                                        onClick={() => setActiveTab('submit')}
                                    >
                                        Start Verification
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'submit' && canSubmitVideo() && (
                        <div className="submit-tab">
                            <h2>Submit Verification Video</h2>
                            <VideoVerification 
                                userId={user.id} 
                                onVerificationComplete={handleVerificationComplete}
                            />
                        </div>
                    )}
                </div>

                <div className="verification-footer">
                    <div className="security-notice">
                        <h4>🔒 Your Privacy & Security</h4>
                        <ul>
                            <li>Videos are encrypted and stored securely</li>
                            <li>Only used for verification purposes</li>
                            <li>Automatically deleted after verification</li>
                            <li>Never shared with other users</li>
                            <li>Reviewed by trained verification specialists</li>
                        </ul>
                    </div>

                    <div className="help-section">
                        <h4>Need Help?</h4>
                        <p>
                            If you're having trouble with verification or have questions about the process, 
                            please contact our support team.
                        </p>
                        <button className="btn btn-outline">Contact Support</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationPage;

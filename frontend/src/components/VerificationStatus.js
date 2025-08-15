import React, { useState, useEffect } from 'react';
import './VerificationStatus.css';

const VerificationStatus = ({ userId, showDetails = true }) => {
    const [verificationData, setVerificationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchVerificationStatus();
    }, [userId]);

    const fetchVerificationStatus = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/verification/status/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setVerificationData(data);
                setError(null);
            } else {
                setError(data.message || 'Failed to fetch verification status');
            }
        } catch (err) {
            console.error('Error fetching verification status:', err);
            setError('Failed to fetch verification status');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED':
                return '#28a745';
            case 'REJECTED':
                return '#dc3545';
            case 'PENDING':
            case 'UNDER_REVIEW':
                return '#ffc107';
            case 'RESUBMIT_REQUIRED':
                return '#fd7e14';
            case 'NOT_SUBMITTED':
            default:
                return '#6c757d';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED':
                return '✓';
            case 'REJECTED':
                return '✗';
            case 'PENDING':
                return '⏳';
            case 'UNDER_REVIEW':
                return '👁️';
            case 'RESUBMIT_REQUIRED':
                return '↻';
            case 'NOT_SUBMITTED':
            default:
                return '📋';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'APPROVED':
                return 'Verified';
            case 'REJECTED':
                return 'Rejected';
            case 'PENDING':
                return 'Pending Review';
            case 'UNDER_REVIEW':
                return 'Under Review';
            case 'RESUBMIT_REQUIRED':
                return 'Resubmission Required';
            case 'NOT_SUBMITTED':
                return 'Not Submitted';
            default:
                return 'Unknown';
        }
    };

    const getStatusDescription = (status) => {
        switch (status) {
            case 'APPROVED':
                return 'Your identity has been verified successfully.';
            case 'REJECTED':
                return 'Your verification was rejected. Please submit a new video.';
            case 'PENDING':
                return 'Your verification video is waiting to be reviewed.';
            case 'UNDER_REVIEW':
                return 'Our team is currently reviewing your verification video.';
            case 'RESUBMIT_REQUIRED':
                return 'Please submit a new verification video with the required corrections.';
            case 'NOT_SUBMITTED':
                return 'You haven\'t submitted a verification video yet.';
            default:
                return 'Status unknown.';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="verification-status loading">
                <div className="spinner"></div>
                <span>Loading verification status...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="verification-status error">
                <div className="status-icon">⚠️</div>
                <div className="status-content">
                    <h4>Error</h4>
                    <p>{error}</p>
                    <button onClick={fetchVerificationStatus} className="btn btn-primary btn-sm">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!verificationData) {
        return null;
    }

    const { status, isVerified, submittedAt, verifiedAt, rejectionReason } = verificationData;

    return (
        <div className={`verification-status ${status.toLowerCase()}`}>
            <div 
                className="status-icon"
                style={{ color: getStatusColor(status) }}
            >
                {getStatusIcon(status)}
            </div>
            
            <div className="status-content">
                <div className="status-header">
                    <h4 style={{ color: getStatusColor(status) }}>
                        {getStatusText(status)}
                    </h4>
                    {isVerified && (
                        <span className="verified-badge">
                            <span className="badge-icon">✓</span>
                            Verified User
                        </span>
                    )}
                </div>
                
                {showDetails && (
                    <div className="status-details">
                        <p className="status-description">
                            {getStatusDescription(status)}
                        </p>
                        
                        {submittedAt && (
                            <div className="status-info">
                                <small className="text-muted">
                                    Submitted: {formatDate(submittedAt)}
                                </small>
                            </div>
                        )}
                        
                        {verifiedAt && (
                            <div className="status-info">
                                <small className="text-muted">
                                    Verified: {formatDate(verifiedAt)}
                                </small>
                            </div>
                        )}
                        
                        {rejectionReason && (
                            <div className="rejection-reason">
                                <strong>Reason for rejection:</strong>
                                <p>{rejectionReason}</p>
                            </div>
                        )}
                        
                        {(status === 'REJECTED' || status === 'RESUBMIT_REQUIRED') && (
                            <div className="action-suggestion">
                                <p className="text-muted">
                                    <small>
                                        You can submit a new verification video to get verified.
                                    </small>
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerificationStatus;

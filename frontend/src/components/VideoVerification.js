import React, { useState, useRef, useCallback } from 'react';
import './VideoVerification.css';

const VideoVerification = ({ userId, onVerificationComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedVideo, setRecordedVideo] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [stream, setStream] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const videoRef = useRef(null);
    const recordedVideoRef = useRef(null);

    // Start camera
    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: true
            });
            
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access camera. Please check permissions.');
        }
    }, []);

    // Stop camera
    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    // Start recording
    const startRecording = useCallback(async () => {
        if (!stream) {
            await startCamera();
            return;
        }

        try {
            const recorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9'
            });
            
            const chunks = [];
            
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };
            
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                setRecordedVideo(blob);
                
                // Create preview URL
                const videoUrl = URL.createObjectURL(blob);
                if (recordedVideoRef.current) {
                    recordedVideoRef.current.src = videoUrl;
                }
            };
            
            setMediaRecorder(recorder);
            recorder.start();
            setIsRecording(true);
            
            // Auto-stop after 30 seconds
            setTimeout(() => {
                if (recorder.state === 'recording') {
                    stopRecording();
                }
            }, 30000);
            
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Error starting recording. Please try again.');
        }
    }, [stream, startCamera]);

    // Stop recording
    const stopRecording = useCallback(() => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    }, [mediaRecorder]);

    // Submit verification video
    const submitVerification = async () => {
        if (!recordedVideo) {
            alert('Please record a video first');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('video', recordedVideo, 'verification.webm');
            formData.append('userId', userId);

            const response = await fetch('/api/verification/submit', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setVerificationStatus('submitted');
                stopCamera();
                if (onVerificationComplete) {
                    onVerificationComplete(data);
                }
                alert('Video verification submitted successfully! We will review it within 24 hours.');
            } else {
                alert(data.message || 'Error submitting verification');
            }
        } catch (error) {
            console.error('Error submitting verification:', error);
            alert('Error submitting verification. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    // Reset recording
    const resetRecording = () => {
        setRecordedVideo(null);
        if (recordedVideoRef.current) {
            recordedVideoRef.current.src = '';
        }
    };

    return (
        <div className="video-verification">
            <div className="verification-header">
                <h3>Video Verification</h3>
                <p>Please record a short video of yourself to verify your identity. This helps keep our community safe.</p>
            </div>

            <div className="verification-instructions">
                <h4>Instructions:</h4>
                <ul>
                    <li>Look directly at the camera</li>
                    <li>Say your name clearly</li>
                    <li>Hold up a government-issued ID (optional but recommended)</li>
                    <li>Keep the video between 5-30 seconds</li>
                    <li>Ensure good lighting and clear audio</li>
                </ul>
            </div>

            {verificationStatus === 'submitted' ? (
                <div className="verification-success">
                    <div className="success-icon">✓</div>
                    <h4>Verification Submitted!</h4>
                    <p>Thank you for submitting your verification video. Our team will review it within 24 hours and you'll be notified of the result.</p>
                </div>
            ) : (
                <div className="verification-content">
                    {!recordedVideo ? (
                        <div className="camera-section">
                            <div className="camera-container">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="camera-preview"
                                />
                                {isRecording && (
                                    <div className="recording-indicator">
                                        <span className="recording-dot"></span>
                                        Recording...
                                    </div>
                                )}
                            </div>
                            
                            <div className="camera-controls">
                                {!stream ? (
                                    <button onClick={startCamera} className="btn btn-primary">
                                        Start Camera
                                    </button>
                                ) : !isRecording ? (
                                    <button onClick={startRecording} className="btn btn-danger">
                                        Start Recording
                                    </button>
                                ) : (
                                    <button onClick={stopRecording} className="btn btn-secondary">
                                        Stop Recording
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="preview-section">
                            <div className="video-preview">
                                <video
                                    ref={recordedVideoRef}
                                    controls
                                    className="recorded-video"
                                />
                            </div>
                            
                            <div className="preview-controls">
                                <button onClick={resetRecording} className="btn btn-secondary">
                                    Record Again
                                </button>
                                <button 
                                    onClick={submitVerification} 
                                    className="btn btn-success"
                                    disabled={uploading}
                                >
                                    {uploading ? 'Submitting...' : 'Submit Verification'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="verification-footer">
                <p className="text-muted">
                    <small>
                        Your video will be securely stored and only used for verification purposes. 
                        It will be deleted after verification is complete.
                    </small>
                </p>
            </div>
        </div>
    );
};

export default VideoVerification;

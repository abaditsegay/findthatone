import React, { useState, useRef } from 'react';
import './VideoProfile.css';

const VideoProfile = ({ user, onVideoUpload }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 720, height: 1280 }, // Portrait mode
        audio: true 
      });
      
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setVideoBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 30000);
      
    } catch (error) {
      alert('Camera access denied. Please enable camera permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadVideo = async () => {
    if (!videoBlob) return;
    
    const formData = new FormData();
    formData.append('video', videoBlob, 'profile-video.webm');
    
    try {
      await onVideoUpload(formData);
      setVideoBlob(null);
      setPreviewUrl(null);
    } catch (error) {
      // Video upload failed - handle silently
    }
  };

  return (
    <div className="video-profile">
      <h3>📹 Add a Video Introduction</h3>
      <p className="video-hint">Record a 30-second video to show your personality!</p>
      
      <div className="video-container">
        {!previewUrl ? (
          <video 
            ref={videoRef} 
            className="video-preview"
            muted
            playsInline
          />
        ) : (
          <video 
            src={previewUrl}
            className="video-preview"
            controls
            playsInline
          />
        )}
        
        <div className="video-controls">
          {!isRecording && !previewUrl && (
            <button onClick={startRecording} className="record-btn">
              🎬 Start Recording
            </button>
          )}
          
          {isRecording && (
            <button onClick={stopRecording} className="stop-btn">
              ⏹️ Stop Recording
            </button>
          )}
          
          {previewUrl && (
            <div className="preview-actions">
              <button onClick={uploadVideo} className="upload-btn">
                ✅ Upload Video
              </button>
              <button 
                onClick={() => {
                  setVideoBlob(null);
                  setPreviewUrl(null);
                }} 
                className="retake-btn"
              >
                🔄 Retake
              </button>
            </div>
          )}
        </div>
      </div>
      
      {user.profileVideoUrl && (
        <div className="current-video">
          <h4>Your Current Video</h4>
          <video 
            src={user.profileVideoUrl}
            className="current-video-preview"
            controls
            playsInline
          />
        </div>
      )}
    </div>
  );
};

export default VideoProfile;

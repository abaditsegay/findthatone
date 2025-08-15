import React from 'react';
import './Dialog.css';

function Dialog({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'info', 'success', 'error', 'warning', 'confirm'
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'confirm':
        return '❓';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`dialog-header ${type}`}>
          <div className="dialog-icon">{getIcon()}</div>
          <h3 className="dialog-title">{title}</h3>
          <button className="dialog-close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="dialog-content">
          <p className="dialog-message">{message}</p>
        </div>
        
        <div className="dialog-footer">
          {showCancel && (
            <button className="dialog-btn dialog-btn-cancel" onClick={handleCancel}>
              {cancelText}
            </button>
          )}
          <button 
            className={`dialog-btn dialog-btn-confirm ${type}`} 
            onClick={handleConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dialog;

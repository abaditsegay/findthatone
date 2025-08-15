import { useState, useCallback } from 'react';

export const useDialog = () => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false
  });

  const showDialog = useCallback((options) => {
    setDialogState({
      isOpen: true,
      title: options.title || 'Notification',
      message: options.message || '',
      type: options.type || 'info',
      onConfirm: options.onConfirm || null,
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      showCancel: options.showCancel || false
    });
  }, []);

  const hideDialog = useCallback(() => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Convenience methods
  const showInfo = useCallback((title, message, onConfirm = null, confirmText = 'OK') => {
    showDialog({ title, message, type: 'info', onConfirm, confirmText });
  }, [showDialog]);

  const showSuccess = useCallback((title, message, onConfirm = null, confirmText = 'OK') => {
    showDialog({ title, message, type: 'success', onConfirm, confirmText });
  }, [showDialog]);

  const showError = useCallback((title, message, onConfirm = null, confirmText = 'OK') => {
    showDialog({ title, message, type: 'error', onConfirm, confirmText });
  }, [showDialog]);

  const showWarning = useCallback((title, message, onConfirm = null, confirmText = 'OK') => {
    showDialog({ title, message, type: 'warning', onConfirm, confirmText });
  }, [showDialog]);

  const showConfirm = useCallback((title, message, onConfirm, confirmText = 'Yes', cancelText = 'No') => {
    showDialog({ 
      title, 
      message, 
      type: 'confirm', 
      onConfirm, 
      confirmText, 
      cancelText, 
      showCancel: true 
    });
  }, [showDialog]);

  return {
    dialogState,
    showDialog,
    hideDialog,
    showInfo,
    showSuccess,
    showError,
    showWarning,
    showConfirm
  };
};

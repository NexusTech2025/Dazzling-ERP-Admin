import React from 'react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Delete", 
  cancelText = "Cancel",
  isProcessing = false,
  status = 'idle', // 'idle', 'processing', 'success', 'error'
  resultMessage = null
}) => {
  if (!isOpen) return null;

  const isIdle = status === 'idle';
  const isSuccess = status === 'success';
  const isError = status === 'error';
  const processing = status === 'processing' || isProcessing;

  const getIcon = () => {
    if (isSuccess) return { name: 'check_circle', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' };
    if (isError) return { name: 'error', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
    return { name: 'warning', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
  };

  const icon = getIcon();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl border border-border-light dark:border-border-dark w-full max-w-md overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`size-10 rounded-full ${icon.bg} flex items-center justify-center shrink-0 transition-colors`}>
              <span className={`material-symbols-outlined ${icon.color}`}>{icon.name}</span>
            </div>
            <div className="pt-1 flex-1">
              <h3 className="text-lg font-bold text-text-main dark:text-white leading-none">
                {isSuccess ? 'Success' : isError ? 'Error' : title}
              </h3>
              <p className="mt-2 text-sm text-text-secondary whitespace-pre-wrap">
                {resultMessage || (isSuccess ? 'Action completed successfully.' : isError ? 'An error occurred.' : message)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-background-light dark:bg-background-dark/50 px-6 py-4 flex items-center justify-end gap-3 border-t border-border-light dark:border-border-dark">
          {!isSuccess && !isError && (
            <button 
              type="button" 
              onClick={onClose}
              disabled={processing}
              className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-main dark:hover:text-white transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
          )}
          
          {isIdle && (
            <button 
              type="button" 
              onClick={onConfirm}
              disabled={processing}
              className="px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm shadow-red-500/30 transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {confirmText}
            </button>
          )}

          {processing && (
            <div className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary">
              <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              Processing...
            </div>
          )}

          {(isSuccess || isError) && (
            <button 
              type="button" 
              onClick={onClose}
              className={`px-6 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-colors ${
                isSuccess ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30' : 'bg-red-600 hover:bg-red-700 shadow-red-500/30'
              }`}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

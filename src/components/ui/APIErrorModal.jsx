import React, { useState } from 'react';

/**
 * APIErrorModal: Premium error modal dialog component.
 * Replaces browser-default alerts with an interactive, copyable, and collapsible technical detail layout.
 */
const APIErrorModal = ({
  isOpen,
  onClose,
  title = "API Execution Error",
  error = null,
  onRetry = null,
  retryText = "Try Again"
}) => {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen) return null;

  // Resolve error details defensively
  const errorType = error?.type || error?.name || "RequestError";
  const errorMessage = error?.message || (typeof error === 'string' ? error : "An unexpected server error occurred. Please try again.");
  const errorDetails = error?.details || error?.stack || (error ? JSON.stringify(error, null, 2) : null);

  const handleCopyDetails = () => {
    const textToCopy = `Title: ${title}\nType: ${errorType}\nMessage: ${errorMessage}${errorDetails ? `\nDetails: ${errorDetails}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-rose-500/20 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Warning Pulsing Icon */}
            <div className="size-12 rounded-full bg-rose-50/50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center shrink-0 animate-pulse text-rose-500">
              <span className="material-symbols-outlined text-2xl font-bold">error</span>
            </div>
            
            {/* Error Content */}
            <div className="pt-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <h3 className="text-lg font-black text-slate-950 dark:text-white leading-none">
                  {title}
                </h3>
                <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 text-[9px] font-mono text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">
                  {errorType}
                </span>
              </div>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 break-words font-semibold leading-relaxed">
                {errorMessage}
              </p>

              {/* Collapsible Details */}
              {errorDetails && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <span>{showDetails ? 'Hide' : 'Show'} Technical Details</span>
                    <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  
                  {showDetails && (
                    <pre className="mt-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-mono text-slate-600 dark:text-slate-400 overflow-x-auto max-h-[150px] whitespace-pre-wrap leading-relaxed">
                      {errorDetails}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-950/40 px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyDetails}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
          >
            <span className="material-symbols-outlined text-sm">content_copy</span>
            <span>{copied ? 'Copied!' : 'Copy logs'}</span>
          </button>

          {/* Close/Retry Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all"
            >
              Dismiss
            </button>
            {onRetry && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRetry();
                }}
                className="px-4 py-2 text-xs font-black bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md shadow-rose-500/10 transition-all"
              >
                {retryText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIErrorModal;

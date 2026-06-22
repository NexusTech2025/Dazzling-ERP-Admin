import React, { useState } from 'react';

const AlertItem = ({ alert, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { variant = 'info', title, description } = alert;

  console.log("alert from alertItem", alert);
  const themeMap = {
    info: {
      border: 'border-blue-500/30 dark:border-blue-400/30',
      bg: 'bg-blue-50/95 dark:bg-slate-900/95 backdrop-blur-md',
      text: 'text-slate-900 dark:text-slate-100',
      barColor: 'bg-blue-500',
      svgIcon: (
        <svg className="size-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    warning: {
      border: 'border-amber-500/30 dark:border-amber-400/30',
      bg: 'bg-amber-50/95 dark:bg-slate-900/95 backdrop-blur-md',
      text: 'text-slate-900 dark:text-slate-100',
      barColor: 'bg-amber-500',
      svgIcon: (
        <svg className="size-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    danger: {
      border: 'border-red-500/30 dark:border-red-400/30',
      bg: 'bg-red-50/95 dark:bg-slate-900/95 backdrop-blur-md',
      text: 'text-slate-900 dark:text-slate-100',
      barColor: 'bg-red-500',
      svgIcon: (
        <svg className="size-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    error: {
      border: 'border-red-500/30 dark:border-red-400/30',
      bg: 'bg-red-50/95 dark:bg-slate-900/95 backdrop-blur-md',
      text: 'text-slate-900 dark:text-slate-100',
      barColor: 'bg-red-500',
      svgIcon: (
        <svg className="size-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    success: {
      border: 'border-emerald-500/30 dark:border-emerald-400/30',
      bg: 'bg-emerald-50/95 dark:bg-slate-900/95 backdrop-blur-md',
      text: 'text-slate-900 dark:text-slate-100',
      barColor: 'bg-emerald-500',
      svgIcon: (
        <svg className="size-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const theme = themeMap[variant] || themeMap.info;

  return (
    <div
      className={`shrink-0 pointer-events-auto w-full rounded-xl border ${theme.border} ${theme.bg} shadow-lg dark:shadow-2xl overflow-hidden transition-all duration-300`}
    >
      <div className={`h-1 w-full ${theme.barColor}`} />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* SVG Icon fallback */}
          {theme.svgIcon}

          <div className="flex-1 min-w-0">
            <h4 className={`font-bold text-xs sm:text-sm ${theme.text} leading-tight ${isExpanded ? '' : 'line-clamp-1'}`}>
              {title}
            </h4>
          </div>

          <div className="flex items-center gap-1 shrink-0 -mt-1">
            {description && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="size-7 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-600 dark:hover:text-white transition-all"
                title={isExpanded ? "Hide Details" : "Show Details"}
              >
                <svg className={`size-4 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            <button
              onClick={onClose}
              className="size-7 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-600 dark:hover:text-white transition-all"
              title="Dismiss"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {description && (
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[200px] mt-2.5 opacity-100' : 'max-h-0 opacity-0'}`}>
            <pre className="text-[11px] font-mono bg-slate-100/60 dark:bg-slate-950/60 p-2.5 rounded-lg text-slate-600 dark:text-slate-300 overflow-y-auto whitespace-pre-wrap max-h-[140px]">
              {description}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertItem;

import React, { useState, useEffect, useRef } from 'react';
import { useAlerts } from '../../lib/react-query/alertStore';
import AlertItem from './AlertItem';

const AlertContainer = () => {
  const { alerts, removeAlert } = useAlerts();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHidden, setIsHidden] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(64); // Fallback height
  const prevAlertsCount = useRef(alerts.length);

  // Read actual header element height dynamically
  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerEl = document.querySelector('header');
      if (headerEl) {
        setHeaderHeight(headerEl.offsetHeight);
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  // Auto-reveal the panel when a new alert occurs
  useEffect(() => {
    if (alerts.length > prevAlertsCount.current) {
      setIsHidden(false);
    }
    prevAlertsCount.current = alerts.length;
  }, [alerts.length]);

  if (alerts.length === 0) return null;

  return (
    <>
      {/* Main Alert Stack Container */}
      <div
        className={`fixed right-6 z-[9999] w-[90vw] sm:w-[400px] pointer-events-none flex flex-col px-4 sm:px-0 transition-all duration-500 ease-in-out transform ${isHidden ? 'translate-x-[125%] opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
          }`}
        style={{
          top: `${headerHeight + 2}px`,
          maxHeight: `calc(100vh - ${headerHeight + 32}px)`
        }}
      >
        <div
          className="pointer-events-auto flex flex-col rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/50 backdrop-blur-md shadow-xl overflow-hidden"
          style={{ maxHeight: '100%' }}
        >
          {/* Header Panel with Collapse State Toggle */}
          <div className="shrink-0 flex items-center justify-between p-3 bg-slate-900/95 dark:bg-slate-950/95 text-white border-b border-slate-200/10 dark:border-slate-800/50 transition-all duration-300">
            <div className="flex items-center gap-2 px-2">
              <svg className="size-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-slate-100 font-bold text-xs">{alerts.length} System Warnings</span>
              {isCollapsed && (
                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">({alerts[0].title})</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="px-2.5 py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 hover:text-white rounded-lg transition-all flex items-center gap-1 border border-slate-700/30 cursor-pointer"
                title={isCollapsed ? "Expand alert stack" : "Minimize alert stack"}
              >
                {isCollapsed ? 'Expand' : 'Collapse'}
                <svg
                  className={`size-3 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <button
                onClick={() => setIsHidden(true)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all border border-transparent hover:border-slate-700/50 cursor-pointer flex items-center justify-center"
                title="Hide warnings panel"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Stack List */}
          {!isCollapsed && (
            <div
              className="flex flex-col gap-3 overflow-y-auto p-3 pr-2"
              style={{ maxHeight: `calc(100vh - ${headerHeight + 80}px)` }}
            >
              {alerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onClose={() => removeAlert(alert.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Peeking Warning Button when hidden */}
      {isHidden && (
        <button
          onClick={() => setIsHidden(false)}
          className="fixed right-0 z-[9999] pointer-events-auto flex items-center justify-center w-12 h-12 rounded-l-full rounded-r-none bg-slate-900/95 dark:bg-slate-950/95 text-white border-y border-l border-slate-700/50 shadow-2xl hover:w-14 pl-2 hover:pl-3 transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-right-4"
          style={{ top: `${headerHeight + 2}px` }}
          title="Show system warnings"
        >
          <div className="relative">
            <svg className="size-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white font-black text-[9px] size-4 rounded-full flex items-center justify-center border border-slate-900 shadow-sm">
              {alerts.length}
            </span>
          </div>
        </button>
      )}
    </>
  );
};

export default AlertContainer;

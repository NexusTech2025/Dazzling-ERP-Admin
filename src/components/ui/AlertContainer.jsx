import React, { useState } from 'react';
import { useAlerts } from '../../lib/react-query/alertStore';
import AlertItem from './AlertItem';

const AlertContainer = () => {
  const { alerts, removeAlert } = useAlerts();
  const [isCollapsed, setIsCollapsed] = useState(false);

  console.log("all alerts from alertStore", alerts)

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] w-[90vw] sm:w-[400px] pointer-events-none flex flex-col px-4 sm:px-0" style={{ maxHeight: '80vh' }}>
      <div
        className="pointer-events-auto flex flex-col gap-3 p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/50 backdrop-blur-md shadow-xl overflow-hidden"
        style={{ maxHeight: '80vh' }}
      >
        {/* Header Panel with Collapse State Toggle */}
        <div className="shrink-0 flex items-center justify-between p-2.5 rounded-xl bg-slate-900/95 dark:bg-slate-950/95 text-white border border-slate-700/50 shadow-md transition-all duration-300">
          <div className="flex items-center gap-2 px-2">
            <svg className="size-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-slate-100 font-bold text-xs">{alerts.length} System Warnings</span>
            {isCollapsed && (
              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">({alerts[0].title})</span>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-2.5 py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 hover:text-white rounded-lg transition-all flex items-center gap-1 border border-slate-700/30"
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
        </div>

        {/* Stack List */}
        {!isCollapsed && (
          <div
            className="flex flex-col gap-3 overflow-y-auto pr-1"
            style={{ maxHeight: 'calc(95vh - 85px)' }}
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
  );
};

export default AlertContainer;

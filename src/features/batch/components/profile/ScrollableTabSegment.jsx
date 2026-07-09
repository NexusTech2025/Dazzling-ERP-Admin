import React from 'react';

/**
 * ScrollableTabSegment renders a sticky horizontal tab selector track
 * for the mobile BatchDetailedView/BatchProfile layout.
 *
 * Tab items are rendered in a single overflow-x-auto row with no scrollbar
 * visible (scrollbar-hide utility). Active tab is highlighted with a bottom
 * border indicator and brand color text.
 *
 * @param {Object} props
 * @param {string} props.activeTab - Currently active tab key.
 * @param {function} props.onTabChange - Tab selection callback: (tabKey: string) => void.
 * @param {Array} props.tabs - Tab configuration array:
 *   [{ key: string, label: string, icon: string }]
 * @returns {React.ReactElement} Sticky scrollable tab track.
 */
const ScrollableTabSegment = React.memo(function ScrollableTabSegment({
  activeTab,
  onTabChange,
  tabs = [],
}) {
  return (
    <div className="sticky top-0 z-40 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark w-full">
      <div className="flex gap-6 overflow-x-auto scrollbar-hide px-4">
        {tabs.map((tab) => {
          const isActive = activeTab.toLowerCase() === tab.key.toLowerCase();
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex items-center gap-2 border-b-[3px] pb-3 pt-3 transition-all ${
                isActive
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-text-secondary hover:text-text-main dark:hover:text-white font-semibold'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {tab.icon}
              </span>
              <span className="text-xs uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default ScrollableTabSegment;

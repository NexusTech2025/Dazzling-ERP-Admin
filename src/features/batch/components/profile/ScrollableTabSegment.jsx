import React from 'react';

/**
 * ScrollableTabSegment renders a sticky horizontal tab selector track
 * for the mobile BatchDetailedView/BatchProfile layout.
 *
 * Automatically fits up to 4 tabs on small screens (grid grid-cols-4)
 * while supporting smooth horizontal scrolling when tab count > 4.
 *
 * @param {Object} props
 * @param {string} props.activeTab - Currently active tab key.
 * @param {function} props.onTabChange - Tab selection callback: (tabKey: string) => void.
 * @param {Array} props.tabs - Tab configuration array:
 *   [{ key: string, label: string, icon: string }]
 * @returns {React.ReactElement} Sticky tab track.
 */
const ScrollableTabSegment = React.memo(function ScrollableTabSegment({
  activeTab,
  onTabChange,
  tabs = [],
}) {
  const isFourOrLess = tabs.length <= 4;

  return (
    <div className="sticky top-0 z-40 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark w-full">
      <div className={`px-2 sm:px-4 ${
        isFourOrLess
          ? 'grid grid-cols-4 gap-1 items-center text-center'
          : 'flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide'
      }`}>
        {tabs.map((tab) => {
          const isActive = activeTab.toLowerCase() === tab.key.toLowerCase();
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 border-b-[3px] py-2.5 transition-all min-w-0 ${
                isActive
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-text-secondary hover:text-text-main dark:hover:text-white font-semibold'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] sm:text-[20px] shrink-0">
                {tab.icon}
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default ScrollableTabSegment;

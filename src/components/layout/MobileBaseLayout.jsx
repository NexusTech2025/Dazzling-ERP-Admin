import React from 'react';

/**
 * MobileBaseLayout: Macro layout container that enforces scroll encapsulation,
 * preventing layout shifting on mobile viewports (< 768px).
 *
 * @param {Object} props - React props.
 * @param {React.ReactNode} props.children - Layout slot nodes.
 * @returns {React.ReactElement} The full-height non-scrollable viewport boundary wrapper.
 */
export default function MobileBaseLayout({ children }) {
  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden select-none">
      {children}
    </div>
  );
}

/**
 * MobileBaseLayout.Header: Sticky navigation title slot.
 *
 * @param {Object} props - Header props.
 * @param {React.ReactNode} [props.renderLeft] - Custom left button (e.g., back arrow).
 * @param {string} props.title - Title text label.
 * @param {React.ReactNode} [props.renderRight] - Custom right action button (e.g. "+ New").
 * @returns {React.ReactElement} Sticky header segment.
 */
MobileBaseLayout.Header = function({ renderLeft, title, renderRight }) {
  return (
    <header className="flex items-center justify-between h-14 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shrink-0">
      <div className="flex items-center space-x-3 truncate">
        {renderLeft && <div className="flex items-center shrink-0">{renderLeft}</div>}
        <h1 className="text-base font-black text-slate-800 dark:text-white truncate">{title}</h1>
      </div>
      {renderRight && <div className="flex items-center space-x-2 shrink-0">{renderRight}</div>}
    </header>
  );
};

/**
 * MobileBaseLayout.FilterSlot: Horizontal filter and search slot.
 *
 * @param {Object} props - Filter slot props.
 * @param {React.ReactNode} props.children - Child filters/inputs.
 * @returns {React.ReactElement} Horizontal scrollable filter container.
 */
MobileBaseLayout.FilterSlot = function({ children }) {
  return (
    <div className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
      {children}
    </div>
  );
};

/**
 * MobileBaseLayout.TabsSlot: Segmented tab belt slot.
 *
 * @param {Object} props - Tabs props.
 * @param {React.ReactNode} props.children - Navigational tab elements.
 * @returns {React.ReactElement} Horizontal scrollable tab selection belt.
 */
MobileBaseLayout.TabsSlot = function({ children }) {
  return (
    <div className="w-full px-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-4 overflow-x-auto scrollbar-none shrink-0">
      {children}
    </div>
  );
};

/**
 * MobileBaseLayout.HeroSlot: Detailed profile summary header slot.
 *
 * @param {Object} props - Hero props.
 * @param {React.ReactNode} props.children - Personal details and quick action buttons.
 * @returns {React.ReactElement} Sticky profile summary banner.
 */
MobileBaseLayout.HeroSlot = function({ children }) {
  return (
    <div className="w-full px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
      {children}
    </div>
  );
};

/**
 * MobileBaseLayout.RibbonSlot: Swipeable metrics scroller slot.
 *
 * @param {Object} props - Ribbon props.
 * @param {React.ReactNode} props.children - Horizontal KPI cards.
 * @returns {React.ReactElement} Horizontal scrollable metrics container.
 */
MobileBaseLayout.RibbonSlot = function({ children }) {
  return (
    <div className="w-full py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-3 overflow-x-auto px-4 scrollbar-none shrink-0">
      {children}
    </div>
  );
};

/**
 * MobileBaseLayout.StatsSlot: Horizontal stats scroller slot.
 *
 * @param {Object} props - Stats slot props.
 * @param {React.ReactNode} props.children - Stats components.
 * @returns {React.ReactElement} Horizontal scrollable stats container.
 */
MobileBaseLayout.StatsSlot = function({ children }) {
  return (
    <div className="w-full py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-3 overflow-x-auto px-4 scrollbar-none shrink-0">
      {children}
    </div>
  );
};

/**
 * MobileBaseLayout.ListSlot: Scrollable body area slot.
 *
 * @param {Object} props - List slot props.
 * @param {React.ReactNode} props.children - Content cells or list rows.
 * @param {boolean} [props.isEmpty=false] - Injected empty check.
 * @param {React.ReactNode} [props.renderEmptyState] - Injected empty message node.
 * @returns {React.ReactElement} Main vertical scroll container.
 */
MobileBaseLayout.ListSlot = function({ children, isEmpty = false, renderEmptyState }) {
  return (
    <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 mobile-layout-scroll-region">
      {isEmpty ? renderEmptyState : children}
    </main>
  );
};

/**
 * MobileBaseLayout.ActionBarSlot: Sticky bottom actions panel slot.
 *
 * @param {Object} props - Action bar props.
 * @param {React.ReactNode} props.children - Sticky selection action bars.
 * @returns {React.ReactElement} Sticky bottom container.
 */
MobileBaseLayout.ActionBarSlot = function({ children }) {
  return (
    <div className="w-full shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0 z-10">
      {children}
    </div>
  );
};

/**
 * MobileBaseLayout.FloatingActionSlot: Floating Action Button (FAB) or action menu slot.
 *
 * @param {Object} props - FAB props.
 * @param {React.ReactNode} props.children - Floating elements.
 * @returns {React.ReactElement} Absolute positioned floating action zone container.
 */
MobileBaseLayout.FloatingActionSlot = function({ children }) {
  return (
    <div className="absolute bottom-6 right-6 z-20">
      {children}
    </div>
  );
};

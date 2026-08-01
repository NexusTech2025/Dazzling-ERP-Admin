import React, { createContext, useContext, useMemo } from 'react';
import MobileBaseLayout from '../../layout/MobileBaseLayout';

const MobileListViewContext = createContext(null);

/**
 * Custom React hook to access state and metadata from the parent MobileListView.
 * 
 * @returns {Object} Active list context containing isLoading, error, isEmpty, selectedIds, isSelectionMode, onClearSelection.
 * @throws {Error} If invoked outside of a <MobileListView> component tree.
 */
export function useMobileListViewContext() {
  const context = useContext(MobileListViewContext);
  if (!context) {
    throw new Error('useMobileListViewContext must be used within <MobileListView>');
  }
  return context;
}

/**
 * Recursively flattens React children arrays, unwrapping <React.Fragment> nodes.
 * 
 * @param {React.ReactNode} children - Raw children prop.
 * @returns {Array<React.ReactElement>} Flattened array of React element nodes.
 */
function flattenChildren(children) {
  const result = [];
  React.Children.forEach(children, (child) => {
    if (child == null || typeof child === 'boolean') return;
    if (child.type === React.Fragment) {
      result.push(...flattenChildren(child.props.children));
    } else {
      result.push(child);
    }
  });
  return result;
}

/**
 * Production-grade Headless MobileListView Compound Component Shell.
 * Acts as a data lifecycle controller and slot dispatcher delegating directly to MobileBaseLayout.
 * 
 * @component
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Slotted compound sub-components (Header, Hero, Filter, List, Footer, ActionBar, FAB).
 * @param {boolean} [props.isLoading=false] - Loading status indicator.
 * @param {Error|Object|null} [props.error=null] - Query error object.
 * @param {boolean} [props.isEmpty=false] - Evaluated empty list state indicator.
 * @param {Array<string|number>} [props.selectedIds=[]] - Managed multi-select active row IDs.
 * @param {Function} [props.onClearSelection] - Callback to reset selection state.
 * @returns {React.JSX.Element} Headless list view provider wrapping MobileBaseLayout.
 */
export function MobileListView({
  children,
  isLoading = false,
  error = null,
  isEmpty = false,
  selectedIds = [],
  onClearSelection
}) {
  // Single O(N) pass slot hash map extraction
  const slotMap = useMemo(() => {
    const map = new Map();
    flattenChildren(children).forEach(child => {
      if (child && child.type) {
        map.set(child.type, child);
      }
    });
    return map;
  }, [children]);

  const header = slotMap.get(MobileListView.Header);
  const hero = slotMap.get(MobileListView.Hero);
  const filter = slotMap.get(MobileListView.Filter);
  const list = slotMap.get(MobileListView.List);
  const footer = slotMap.get(MobileListView.Footer);
  const actionBar = slotMap.get(MobileListView.ActionBar);
  const fab = slotMap.get(MobileListView.FAB);

  const selectedCount = selectedIds.length;
  const isSelectionMode = selectedCount > 0;

  const contextValue = useMemo(() => ({
    isLoading,
    error,
    isEmpty,
    selectedIds,
    selectedCount,
    isSelectionMode,
    onClearSelection
  }), [isLoading, error, isEmpty, selectedIds, selectedCount, isSelectionMode, onClearSelection]);

  return (
    <MobileListViewContext.Provider value={contextValue}>
      <MobileBaseLayout>
        {header}
        {hero}
        {filter}
        {list}
        {footer}
        {actionBar}
        {fab}
      </MobileBaseLayout>
    </MobileListViewContext.Provider>
  );
}

/* ==========================================================================
   DELEGATED SLOT SUB-COMPONENTS (DELEGATING DIRECTLY TO MobileBaseLayout)
   ========================================================================== */

/**
 * MobileListView.Header Sub-Component
 * Delegates directly to MobileBaseLayout.Header.
 */
MobileListView.Header = function Header({ title, renderLeft, renderRight, children }) {
  return (
    <MobileBaseLayout.Header
      title={title}
      renderLeft={renderLeft}
      renderRight={renderRight}
    >
      {children}
    </MobileBaseLayout.Header>
  );
};

/**
 * MobileListView.Hero Sub-Component
 * Delegates directly to MobileBaseLayout.HeroSlot for KPI ribbons or hero cards.
 */
MobileListView.Hero = function Hero({ children }) {
  return <MobileBaseLayout.HeroSlot>{children}</MobileBaseLayout.HeroSlot>;
};

/**
 * MobileListView.Filter Sub-Component
 * Delegates directly to MobileBaseLayout.FilterSlot for search and dropdown filters.
 */
MobileListView.Filter = function Filter({ children }) {
  return <MobileBaseLayout.FilterSlot>{children}</MobileBaseLayout.FilterSlot>;
};

/**
 * MobileListView.List Sub-Component
 * Handles lifecycle state boundaries (isLoading, error, isEmpty) and renders inside MobileBaseLayout.ListSlot.
 */
MobileListView.List = function List({
  children,
  renderLoading,
  renderError,
  renderEmptyState,
  emptyMessage = "No items found matching your filters."
}) {
  const { isLoading, error, isEmpty } = useMobileListViewContext();

  // 1. Loading State Guard
  if (isLoading) {
    return (
      <MobileBaseLayout.ListSlot>
        {renderLoading || (
          <div className="py-20 text-center">
            <span className="size-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin inline-block font-bold"></span>
            <p className="text-xs text-text-secondary mt-2">Loading directory...</p>
          </div>
        )}
      </MobileBaseLayout.ListSlot>
    );
  }

  // 2. Error State Guard
  if (error) {
    return (
      <MobileBaseLayout.ListSlot>
        {renderError || (
          <div className="py-10 text-center bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/20 text-rose-600">
            <p className="text-sm font-bold">{error.message || 'Failed to load records'}</p>
          </div>
        )}
      </MobileBaseLayout.ListSlot>
    );
  }

  // 3. Empty State Guard & Children Render
  const emptyNode = renderEmptyState || (
    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
      <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">folder_off</span>
      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{emptyMessage}</p>
    </div>
  );

  return (
    <MobileBaseLayout.ListSlot isEmpty={isEmpty} renderEmptyState={emptyNode}>
      {children}
    </MobileBaseLayout.ListSlot>
  );
};

/**
 * MobileListView.ActionBar Sub-Component
 * Delegates directly to MobileBaseLayout.ActionBarSlot when selection mode is active.
 */
MobileListView.ActionBar = function ActionBar({ children }) {
  const { isSelectionMode } = useMobileListViewContext();
  if (!isSelectionMode && !children) return null;
  return <MobileBaseLayout.ActionBarSlot>{children}</MobileBaseLayout.ActionBarSlot>;
};

/**
 * MobileListView.FAB Sub-Component
 * Delegates directly to MobileBaseLayout.FloatingActionSlot for floating action buttons.
 */
MobileListView.FAB = function FAB({ children }) {
  return <MobileBaseLayout.FloatingActionSlot>{children}</MobileBaseLayout.FloatingActionSlot>;
};

export default MobileListView;

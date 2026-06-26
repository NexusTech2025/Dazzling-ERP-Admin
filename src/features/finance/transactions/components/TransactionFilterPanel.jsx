import React, { useState } from 'react';
import TextInput from '../../../../components/ui/v2/TextInput';
import Button from '../../../../components/ui/v2/Button';

/**
 * TransactionFilterPanel renders a responsive filter panel with desktop inline grid and mobile togglable dropdown.
 * 
 * @param {Object} props - Filter configuration and state handlers.
 * @param {string} props.searchQuery - Current query filter text.
 * @param {Function} props.onSearchChange - Callback triggered on search text updates.
 * @param {string} props.flowType - Transaction direction type filter ('all', 'in', 'out').
 * @param {Function} props.onFlowTypeChange - Direction switcher callback.
 * @param {string} props.selectedCategory - Category ID filter.
 * @param {Function} props.onCategoryChange - Category select handler.
 * @param {Array<Object>} props.categories - Array of active transaction category configurations.
 * @param {string} props.reconciliationFilter - Status validation check ('all', 'matched', etc.).
 * @param {Function} props.onReconciliationChange - Status selector toggle handler.
 * @param {string} props.startDate - Lower-bound date range string (YYYY-MM-DD).
 * @param {Function} props.onStartDateChange - Start date selector callback.
 * @param {string} props.endDate - Upper-bound date range string (YYYY-MM-DD).
 * @param {Function} props.onEndDateChange - End date selector callback.
 * @param {Function} props.onClearFilters - Action to reset all parameters to defaults.
 * @param {boolean} props.isMobile - Responsive viewport indicator flag.
 * @returns {React.JSX.Element} Theme-integrated modular filter panel.
 */
export const TransactionFilterPanel = ({
  searchQuery,
  onSearchChange,
  flowType,
  onFlowTypeChange,
  selectedCategory,
  onCategoryChange,
  categories = [],
  reconciliationFilter,
  onReconciliationChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onClearFilters,
  isMobile
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = !!(
    searchQuery ||
    flowType !== 'all' ||
    selectedCategory !== 'all' ||
    reconciliationFilter !== 'all' ||
    startDate ||
    endDate
  );

  // Shared drop-down clear/reset action
  const handleClear = () => {
    onClearFilters();
  };

  if (isMobile) {
    return (
      <div className="space-y-3">
        {/* Mobile Header: Search Bar + Filter Toggle */}
        <div className="flex items-center gap-2">
          <TextInput
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by ID, Counterparty, Reference..."
            leftIcon="search"
            containerClassName="flex-1"
          />
          <Button
            variant={isExpanded ? "contained" : "outlined"}
            onClick={() => setIsExpanded(!isExpanded)}
            startIcon="filter_list"
            className="h-[38px] flex-shrink-0"
          >
            Filters
          </Button>
        </div>

        {/* Expandable Mobile Panel */}
        {isExpanded && (
          <div className="bg-surface-light/95 dark:bg-surface-dark/95 border border-border-light dark:border-border-dark p-4 rounded-xl space-y-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Row 1: Flow Type + Date Filter (3 inputs distributed evenly) */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block mb-1">Flow Type</label>
                <select
                  value={flowType}
                  onChange={(e) => onFlowTypeChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-[10px] px-2 py-1.5 outline-none text-text-main dark:text-white focus:border-primary h-[38px]"
                >
                  <option value="all">All Flows</option>
                  <option value="in">Received</option>
                  <option value="out">Sent</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block mb-1">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-[10px] px-2 outline-none text-text-main dark:text-white focus:border-primary h-[38px]"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block mb-1">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-[10px] px-2 outline-none text-text-main dark:text-white focus:border-primary h-[38px]"
                />
              </div>
            </div>

            {/* Row 2: Category + Reconciliation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-xs px-3 py-1.5 outline-none text-text-main dark:text-white focus:border-primary h-[38px]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block mb-1">Reconciliation</label>
                <select
                  value={reconciliationFilter}
                  onChange={(e) => onReconciliationChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-xs px-3 py-1.5 outline-none text-text-main dark:text-white focus:border-primary h-[38px]"
                >
                  <option value="all">All Statuses</option>
                  <option value="unreconciled">Unreconciled</option>
                  <option value="matched">Matched</option>
                  <option value="discrepancy">Discrepancy</option>
                </select>
              </div>
            </div>

            {/* Row 3: Action Buttons */}
            {hasActiveFilters && (
              <div className="flex justify-end pt-2 border-t border-border-light/40 dark:border-border-dark/40">
                <button
                  onClick={handleClear}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop inline filter panel
  return (
    <div className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border border-border-light dark:border-border-dark p-4 rounded-xl flex flex-wrap items-center gap-4 shadow-sm">
      {/* Search */}
      <TextInput
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by ID, Counterparty, Reference, notes..."
        leftIcon="search"
        containerClassName="min-w-[240px] flex-1"
      />

      {/* Direction filter */}
      <select
        value={flowType}
        onChange={(e) => onFlowTypeChange(e.target.value)}
        className="bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-sm px-4 py-2 outline-none text-text-main dark:text-white focus:border-primary min-w-[140px] h-[38px]"
      >
        <option value="all">Flow Type: All</option>
        <option value="in">Received</option>
        <option value="out">Sent</option>
      </select>

      {/* Category filter */}
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-sm px-4 py-2 outline-none text-text-main dark:text-white focus:border-primary min-w-[160px] h-[38px]"
      >
        <option value="all">Category: All</option>
        {categories.map((cat) => (
          <option key={cat.category_id} value={cat.category_id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Reconciliation filter */}
      <select
        value={reconciliationFilter}
        onChange={(e) => onReconciliationChange(e.target.value)}
        className="bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-sm px-4 py-2 outline-none text-text-main dark:text-white focus:border-primary min-w-[170px] h-[38px]"
      >
        <option value="all">Reconciliation: All</option>
        <option value="unreconciled">Unreconciled</option>
        <option value="matched">Matched</option>
        <option value="discrepancy">Discrepancy</option>
      </select>

      {/* Date Range inputs */}
      <div className="flex items-center gap-2 h-[38px]">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-xs px-3 h-full outline-none text-text-main dark:text-white focus:border-primary"
        />
        <span className="text-text-secondary font-bold text-xs">—</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-xs px-3 h-full outline-none text-text-main dark:text-white focus:border-primary"
        />
      </div>

      {/* Reset Action */}
      {hasActiveFilters && (
        <button
          onClick={handleClear}
          className="text-xs font-bold text-primary hover:underline ml-auto"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

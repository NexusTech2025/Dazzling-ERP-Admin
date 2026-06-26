import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  useMoneyTransactionsQuery, 
  useExpenseCategoriesQuery,
  useDeleteMoneyTransactionMutation,
  useDeleteManyMoneyTransactionsMutation
} from '../hooks/useFinanceQueries';
import { LoadingState, ErrorState } from '../../../components/ui/QueryStatus';
import CategoryManagerModal from './components/CategoryManagerModal';
import MoneyTransactionForm from './components/MoneyTransactionForm';
import { TransactionDetailsDrawer } from './components/TransactionDetailsDrawer';
import SelectionActionBar from '../../../components/ui/v2/SelectionActionBar';
import Button from '../../../components/ui/v2/Button';

/**
 * Processes list sorting for money transaction records.
 * @param {Array<Object>} transactions - The flat transaction array to sort.
 * @param {string} key - Target column attribute (amount, transaction_date, transaction_id).
 * @param {'asc'|'desc'} direction - Sorting order.
 * @returns {Array<Object>} Sorted transaction list.
 */
const sortTransactions = (transactions, key, direction) => {
  return [...transactions].sort((a, b) => {
    let valA = a[key];
    let valB = b[key];
    
    if (key === 'amount') {
      return direction === 'asc' ? valA - valB : valB - valA;
    }
    if (key === 'transaction_date') {
      return direction === 'asc' 
        ? new Date(valA) - new Date(valB) 
        : new Date(valB) - new Date(valA);
    }
    // String comparisons
    valA = (valA || '').toString().toLowerCase();
    valB = (valB || '').toString().toLowerCase();
    return direction === 'asc' 
      ? valA.localeCompare(valB) 
      : valB.localeCompare(valA);
  });
};

const MoneyTransactions = () => {
  const { data: transactions = [], isLoading: isTxLoading, error: txError } = useMoneyTransactionsQuery();
  const { data: categories = [] } = useExpenseCategoriesQuery();
  
  const deleteMutation = useDeleteMoneyTransactionMutation();
  const deleteManyMutation = useDeleteManyMoneyTransactionsMutation();

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [activeDetailTx, setActiveDetailTx] = useState(null);

  const [searchParams] = useSearchParams();

  // Filters state
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');

  // Synchronize searchQuery with search query param changes
  useEffect(() => {
    const s = searchParams.get('search');
    if (s !== null) {
      setSearchQuery(s);
    }
  }, [searchParams]);

  const [flowType, setFlowType] = useState('all'); // 'all', 'in', 'out'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [reconciliationFilter, setReconciliationFilter] = useState('all'); // 'all', 'unreconciled', 'matched', 'discrepancy'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'transaction_date', direction: 'desc' });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (isTxLoading) return <LoadingState message="Fetching money transaction ledger..." />;
  if (txError) return <ErrorState message={txError.message} />;

  // Start performance profiling (Rule N5)
  console.time('[Finance Ledger] Filter and Sort Processing');

  // Filter application
  const filteredTransactions = transactions.filter(tx => {
    // 1. Flow Type filter
    if (flowType !== 'all' && tx.type !== flowType) return false;

    // 2. Category filter
    if (selectedCategory !== 'all' && tx.category_id !== selectedCategory) return false;

    // 3. Reconciliation Status filter
    if (reconciliationFilter !== 'all' && tx.reconciliation_status !== reconciliationFilter) return false;

    // 4. Date Range filter
    if (startDate && new Date(tx.transaction_date) < new Date(startDate)) return false;
    if (endDate && new Date(tx.transaction_date) > new Date(endDate)) return false;

    // 5. Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchId = (tx.transaction_id || '').toLowerCase().includes(query);
      const matchParty = (tx.party_name || '').toLowerCase().includes(query);
      const matchFromTo = (tx.from_to || '').toLowerCase().includes(query);
      const matchBy = (tx.by || '').toLowerCase().includes(query);
      const matchRef = (tx.payment_reference || '').toLowerCase().includes(query);
      const matchNotes = (tx.notes || '').toLowerCase().includes(query);
      return matchId || matchParty || matchFromTo || matchBy || matchRef || matchNotes;
    }

    return true;
  });

  // Sort application
  const sortedTransactions = sortTransactions(filteredTransactions, sortConfig.key, sortConfig.direction);

  console.timeEnd('[Finance Ledger] Filter and Sort Processing');

  // KPI Calculations (based on filtered list)
  const totalReceived = filteredTransactions
    .filter(tx => tx.type === 'in')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const totalSent = filteredTransactions
    .filter(tx => tx.type === 'out')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const netBalance = totalReceived - totalSent;
  const totalLogs = filteredTransactions.length;

  // Pagination calculation
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenForm = (tx = null) => {
    setSelectedTx(tx);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedTx(null);
    setIsFormOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete transaction ${id}?`)) {
      await deleteMutation.mutateAsync(id);
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      if (activeDetailTx?.transaction_id === id) {
        setActiveDetailTx(null);
      }
    }
  };

  // Bulk Operations
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedTransactions.map(t => t.transaction_id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected transactions?`)) {
      const res = await deleteManyMutation.mutateAsync({ ids: selectedIds });
      if (res.success) {
        setSelectedIds([]);
        setActiveDetailTx(null);
      }
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFlowType('all');
    setSelectedCategory('all');
    setReconciliationFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Helper mapping category IDs to names
  const getCategoryName = (id) => {
    const category = categories.find(c => c.category_id === id);
    return category ? category.name : 'Uncategorized';
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <span className="material-symbols-outlined text-[12px] ml-0.5 opacity-30">unfold_more</span>;
    }
    return sortConfig.direction === 'asc' 
      ? <span className="material-symbols-outlined text-[12px] ml-0.5 text-primary">arrow_upward</span>
      : <span className="material-symbols-outlined text-[12px] ml-0.5 text-primary">arrow_downward</span>;
  };

  return (
    <div className="space-y-6">
      
      {/* Header and top controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main dark:text-white tracking-tight">Money Transactions</h1>
          <p className="text-text-secondary mt-1">Consolidated institutional ledger and cash flow monitoring.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsCategoryOpen(true)}
            variant="outlined" 
            startIcon="category"
          >
            Manage Categories
          </Button>
          <Button 
            onClick={() => handleOpenForm(null)}
            variant="contained" 
            startIcon="post_add"
          >
            Log Transaction
          </Button>
        </div>
      </div>

      {/* KPI stats section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI: Received */}
        <div className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border border-border-light dark:border-border-dark p-6 rounded-2xl flex flex-col justify-between h-32 hover:border-emerald-500/30 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Received</span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg material-symbols-outlined text-base">
              call_received
            </span>
          </div>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>

        {/* KPI: Sent */}
        <div className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border border-border-light dark:border-border-dark p-6 rounded-2xl flex flex-col justify-between h-32 hover:border-red-500/30 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Sent</span>
            <span className="p-1.5 bg-red-500/10 text-red-500 rounded-lg material-symbols-outlined text-base">
              call_made
            </span>
          </div>
          <h3 className="text-2xl font-black text-red-500 dark:text-red-400">
            ₹{totalSent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>

        {/* KPI: Net Balance */}
        <div className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border border-border-light dark:border-border-dark p-6 rounded-2xl flex flex-col justify-between h-32 hover:border-primary/30 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Net Balance</span>
            <span className={`p-1.5 rounded-lg material-symbols-outlined text-base ${
              netBalance >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
            }`}>
              account_balance
            </span>
          </div>
          <h3 className={`text-2xl font-black ${
            netBalance >= 0 ? 'text-text-main dark:text-white' : 'text-red-500'
          }`}>
            {netBalance < 0 ? '-' : ''}₹{Math.abs(netBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>

        {/* KPI: Count */}
        <div className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border border-border-light dark:border-border-dark p-6 rounded-2xl flex flex-col justify-between h-32 hover:border-primary/30 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Logs</span>
            <span className="p-1.5 bg-primary/10 text-primary rounded-lg material-symbols-outlined text-base">
              history
            </span>
          </div>
          <h3 className="text-2xl font-black text-text-main dark:text-white">
            {totalLogs.toLocaleString()}
          </h3>
        </div>
      </div>

      {/* Filters block */}
      <div className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border border-border-light dark:border-border-dark p-4 rounded-xl flex flex-wrap items-center gap-4 shadow-sm">
        
        {/* Search */}
        <div className="relative min-w-[240px] flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">
            search
          </span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by ID, Counterparty, Reference, notes, or handler..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg py-2 pl-10 pr-4 text-sm outline-none focus:border-primary text-text-main dark:text-white"
          />
        </div>

        {/* Direction filter */}
        <select 
          value={flowType}
          onChange={(e) => { setFlowType(e.target.value); setCurrentPage(1); }}
          className="bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-sm px-4 py-2 outline-none text-text-main dark:text-white focus:border-primary min-w-[140px]"
        >
          <option value="all">Flow Type: All</option>
          <option value="in">Received</option>
          <option value="out">Sent</option>
        </select>

        {/* Category filter */}
        <select 
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
          className="bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-sm px-4 py-2 outline-none text-text-main dark:text-white focus:border-primary min-w-[160px]"
        >
          <option value="all">Category: All</option>
          {categories.map(cat => (
            <option key={cat.category_id} value={cat.category_id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Reconciliation filter */}
        <select 
          value={reconciliationFilter}
          onChange={(e) => { setReconciliationFilter(e.target.value); setCurrentPage(1); }}
          className="bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-sm px-4 py-2 outline-none text-text-main dark:text-white focus:border-primary min-w-[170px]"
        >
          <option value="all">Reconciliation: All</option>
          <option value="unreconciled">Unreconciled</option>
          <option value="matched">Matched</option>
          <option value="discrepancy">Discrepancy</option>
        </select>

        {/* Dates */}
        <div className="flex items-center gap-2">
          <input 
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
            className="bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-xs px-3 py-2 outline-none text-text-main dark:text-white focus:border-primary"
            placeholder="Start Date"
          />
          <span className="text-text-secondary font-bold text-xs">—</span>
          <input 
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
            className="bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-xs px-3 py-2 outline-none text-text-main dark:text-white focus:border-primary"
            placeholder="End Date"
          />
        </div>

        {/* Reset */}
        {(searchQuery || flowType !== 'all' || selectedCategory !== 'all' || reconciliationFilter !== 'all' || startDate || endDate) && (
          <button 
            onClick={handleClearFilters}
            className="text-xs font-bold text-primary hover:underline ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table grid */}
      <div className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border border-border-light dark:border-border-dark rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-border-light dark:border-border-dark text-[9px] font-black text-text-secondary uppercase tracking-wider">
                <th className="px-4 py-3 w-10 text-center">
                  <input 
                    type="checkbox"
                    checked={paginatedTransactions.length > 0 && selectedIds.length === paginatedTransactions.length}
                    onChange={handleSelectAll}
                    className="rounded border-border-light dark:border-border-dark text-primary focus:ring-primary w-3.5 h-3.5"
                  />
                </th>
                <th className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors" onClick={() => requestSort('transaction_id')}>
                  <div className="flex items-center">
                    Identifier {getSortIcon('transaction_id')}
                  </div>
                </th>
                <th className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors" onClick={() => requestSort('transaction_date')}>
                  <div className="flex items-center">
                    Date {getSortIcon('transaction_date')}
                  </div>
                </th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Sent From/To</th>
                <th className="px-4 py-3">Received/Sent By</th>
                <th className="px-4 py-3">Payment Info</th>
                <th className="px-4 py-3">Audit & Status</th>
                <th className="px-4 py-3 text-right cursor-pointer select-none hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors" onClick={() => requestSort('amount')}>
                  <div className="flex items-center justify-end">
                    Amount {getSortIcon('amount')}
                  </div>
                </th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark text-[10.5px]">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((tx) => (
                  <tr 
                    key={tx.transaction_id}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/10 cursor-pointer transition-colors group ${
                      selectedIds.includes(tx.transaction_id) ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => setActiveDetailTx(tx)}
                  >
                    <td className="px-4 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox"
                        checked={selectedIds.includes(tx.transaction_id)}
                        onChange={() => handleSelectRow(tx.transaction_id)}
                        className="rounded border-border-light dark:border-border-dark text-primary focus:ring-primary w-3.5 h-3.5"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-between gap-3 min-w-[130px]">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono font-bold text-primary text-[11px]">#{tx.transaction_id}</span>
                          <span className={`text-[7.5px] font-black uppercase tracking-wider px-1 py-0.2 rounded w-fit border ${
                            tx.party_type === 'student' ? 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30' :
                            tx.party_type === 'teacher' ? 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/30' :
                            tx.party_type === 'staff' ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30' :
                            'bg-slate-100 dark:bg-slate-800 text-text-secondary dark:text-on-surface-variant border-border-light dark:border-border-dark'
                          }`}>
                            {tx.party_type}
                          </span>
                        </div>
                        <div className="flex items-center justify-center pr-2">
                          {tx.type === 'in' ? (
                            <span className="material-symbols-outlined text-emerald-500 font-black text-sm" title="Received (In)">arrow_downward</span>
                          ) : (
                            <span className="material-symbols-outlined text-red-500 font-black text-sm" title="Sent (Out)">arrow_upward</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-text-secondary dark:text-on-surface-variant">
                      {new Date(tx.transaction_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-text-main dark:text-white">
                      {getCategoryName(tx.category_id)}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-text-main dark:text-white">{tx.from_to || tx.party_name}</span>
                        {tx.party_id && (
                          <span className="text-[9px] text-text-secondary dark:text-on-surface-variant font-mono">
                            ID: {tx.party_id}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-text-secondary dark:text-on-surface-variant">
                      {tx.by || tx.created_by || '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col">
                        <span className="capitalize font-semibold text-text-main dark:text-white">
                          {tx.payment_method}
                        </span>
                        {tx.payment_reference && (
                          <span className="text-[9px] text-text-secondary dark:text-on-surface-variant font-mono">
                            REF: {tx.payment_reference}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {tx.reconciliation_status === 'matched' ? (
                          <span className="px-1.5 py-0.2 rounded text-[7.5px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
                            Matched
                          </span>
                        ) : tx.reconciliation_status === 'discrepancy' ? (
                          <span className="px-1.5 py-0.2 rounded text-[7.5px] font-black uppercase bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/30">
                            Discrepancy
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[7.5px] font-black uppercase bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30">
                            Unreconciled
                          </span>
                        )}
                        {tx.attachment_drive_id && (
                          <a 
                            href={`https://drive.google.com/open?id=${tx.attachment_drive_id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-text-secondary hover:text-primary transition-all flex items-center"
                            title="View Receipt Attachment"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="material-symbols-outlined text-[13px]">attachment</span>
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-[11px]">
                      <span className={tx.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}>
                        {tx.type === 'in' ? '+' : '-'}₹{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenForm(tx)}
                          className="p-1 hover:bg-primary/10 rounded-md text-text-secondary hover:text-primary transition-all"
                          title="Edit transaction"
                        >
                          <span className="material-symbols-outlined text-xs">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(tx.transaction_id)}
                          className="p-1 hover:bg-red-500/10 rounded-md text-text-secondary hover:text-red-500 transition-all"
                          title="Delete transaction"
                        >
                          <span className="material-symbols-outlined text-xs">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-12 text-text-secondary text-sm">
                    No transactions registered matching active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-border-light dark:border-border-dark flex items-center justify-between bg-slate-50 dark:bg-slate-900/10 text-[9px] font-bold">
            <p className="text-[9px] text-text-secondary uppercase tracking-wider">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, sortedTransactions.length)} of {sortedTransactions.length} results
            </p>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-xs">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold border transition-all ${
                    currentPage === page
                      ? 'bg-primary border-primary text-white'
                      : 'bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark text-text-main dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-xs">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Delete Bar */}
      <SelectionActionBar 
        selectedCount={selectedIds.length} 
        onClear={() => setSelectedIds([])}
        onDeleteSelected={handleBulkDelete}
        itemName="transaction"
      />

      {/* Modal and Drawer Components */}
      <CategoryManagerModal 
        isOpen={isCategoryOpen} 
        onClose={() => setIsCategoryOpen(false)} 
      />

      <MoneyTransactionForm 
        isOpen={isFormOpen} 
        onClose={handleCloseForm} 
        initialData={selectedTx} 
      />

      <TransactionDetailsDrawer 
        transaction={activeDetailTx} 
        isOpen={activeDetailTx !== null} 
        onClose={() => setActiveDetailTx(null)} 
        onEdit={(tx) => {
          setActiveDetailTx(null);
          handleOpenForm(tx);
        }}
        getCategoryName={getCategoryName}
      />

    </div>
  );
};

export default MoneyTransactions;

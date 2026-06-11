import React, { useState } from 'react';
import { 
  useMoneyTransactionsQuery, 
  useExpenseCategoriesQuery,
  useDeleteMoneyTransactionMutation,
  useDeleteManyMoneyTransactionsMutation
} from '../hooks/useFinanceQueries';
import { LoadingState, ErrorState } from '../../../components/ui/QueryStatus';
import CategoryManagerModal from './components/CategoryManagerModal';
import MoneyTransactionForm from './components/MoneyTransactionForm';
import SelectionActionBar from '../../../components/ui/v2/SelectionActionBar';
import Button from '../../../components/ui/v2/Button';

const MoneyTransactions = () => {
  const { data: transactions = [], isLoading: isTxLoading, error: txError } = useMoneyTransactionsQuery();
  const { data: categories = [] } = useExpenseCategoriesQuery();
  
  const deleteMutation = useDeleteMoneyTransactionMutation();
  const deleteManyMutation = useDeleteManyMoneyTransactionsMutation();

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [flowType, setFlowType] = useState('all'); // 'all', 'in', 'out'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (isTxLoading) return <LoadingState message="Fetching money transaction ledger..." />;
  if (txError) return <ErrorState message={txError.message} />;

  // Filter application
  const filteredTransactions = transactions.filter(tx => {
    // 1. Flow Type filter
    if (flowType !== 'all' && tx.type !== flowType) return false;

    // 2. Category filter
    if (selectedCategory !== 'all' && tx.category_id !== selectedCategory) return false;

    // 3. Date Range filter
    if (startDate && new Date(tx.transaction_date) < new Date(startDate)) return false;
    if (endDate && new Date(tx.transaction_date) > new Date(endDate)) return false;

    // 4. Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchId = (tx.transaction_id || '').toLowerCase().includes(query);
      const matchParty = (tx.party_name || '').toLowerCase().includes(query);
      const matchRef = (tx.payment_reference || '').toLowerCase().includes(query);
      const matchNotes = (tx.notes || '').toLowerCase().includes(query);
      return matchId || matchParty || matchRef || matchNotes;
    }

    return true;
  });

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
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
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
      }
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFlowType('all');
    setSelectedCategory('all');
    setStartDate('');
    setEndDate('');
  };

  // Helper mapping category IDs to names
  const getCategoryName = (id) => {
    const category = categories.find(c => c.category_id === id);
    return category ? category.name : 'Uncategorized';
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
            ${totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            ${totalSent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            {netBalance < 0 ? '-' : ''}${Math.abs(netBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            placeholder="Search by ID, Counterparty, Reference, or Notes..."
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
        {(searchQuery || flowType !== 'all' || selectedCategory !== 'all' || startDate || endDate) && (
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
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-border-light dark:border-border-dark text-[10px] font-black text-text-secondary uppercase tracking-widest">
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox"
                    checked={paginatedTransactions.length > 0 && selectedIds.length === paginatedTransactions.length}
                    onChange={handleSelectAll}
                    className="rounded border-border-light dark:border-border-dark text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-6 py-4">TXN ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Direction</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Related Party</th>
                <th className="px-6 py-4">Payment Info</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark text-xs">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((tx) => (
                  <tr 
                    key={tx.transaction_id}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors group ${
                      selectedIds.includes(tx.transaction_id) ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox"
                        checked={selectedIds.includes(tx.transaction_id)}
                        onChange={() => handleSelectRow(tx.transaction_id)}
                        className="rounded border-border-light dark:border-border-dark text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-primary">
                      #{tx.transaction_id}
                    </td>
                    <td className="px-6 py-4 text-text-secondary dark:text-on-surface-variant">
                      {new Date(tx.transaction_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      {tx.type === 'in' ? (
                        <span className="px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 font-bold tracking-wider text-[9px] uppercase border border-emerald-200 dark:border-emerald-900/30">
                          Received
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400 font-bold tracking-wider text-[9px] uppercase border border-red-200 dark:border-red-900/30">
                          Sent
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-text-main dark:text-white">
                      {getCategoryName(tx.category_id)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-text-main dark:text-white">{tx.party_name}</span>
                        {tx.party_type && (
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                              tx.party_type === 'student' ? 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400' :
                              tx.party_type === 'teacher' ? 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400' :
                              tx.party_type === 'staff' ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400' :
                              'bg-slate-100 dark:bg-slate-800 text-text-secondary dark:text-on-surface-variant'
                            }`}>
                              {tx.party_type}
                            </span>
                            {tx.party_id && (
                              <span className="text-[10px] text-text-secondary dark:text-on-surface-variant font-mono">
                                ID: {tx.party_id}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="capitalize font-semibold text-text-main dark:text-white">
                          {tx.payment_method}
                        </span>
                        {tx.payment_reference && (
                          <span className="text-[10px] text-text-secondary dark:text-on-surface-variant font-mono">
                            REF: {tx.payment_reference}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-sm">
                      <span className={tx.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}>
                        {tx.type === 'in' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenForm(tx)}
                          className="p-1.5 hover:bg-primary/10 rounded-md text-text-secondary hover:text-primary transition-all"
                          title="Edit transaction"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(tx.transaction_id)}
                          className="p-1.5 hover:bg-red-500/10 rounded-md text-text-secondary hover:text-red-500 transition-all"
                          title="Delete transaction"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-text-secondary text-sm">
                    No transactions registered matching active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border-light dark:border-border-dark flex items-center justify-between bg-slate-50 dark:bg-slate-900/10">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} results
            </p>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold border transition-all ${
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
                <span className="material-symbols-outlined text-base">chevron_right</span>
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

    </div>
  );
};

export default MoneyTransactions;

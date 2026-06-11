import React, { useState, useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import ButtonGroupFilter from '../../../components/ui/filters/ButtonGroupFilter';
import SelectGroupFilter from '../../../components/ui/filters/SelectGroupFilter';
import BatchCard from './BatchCard';

/**
 * BatchSelectionModal - A high-fidelity premium modal for selecting academic batches.
 * Features a split-pane layout with a vertical filter sidebar.
 * Integrates branch filters and batch type filters to align with V2 UI aesthetics.
 */
const BatchSelectionModal = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  selectedBatchId = null, 
  availableBatches = [],
  isLoading = false
}) => {
  const [tempSelectedBatch, setTempSelectedBatch] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [batchTypeFilter, setBatchTypeFilter] = useState('');

  const queryClient = useQueryClient();

  // Retrieve cached data populated during ERP hydration
  const courses = queryClient.getQueryData(queryKeys.course.list(EMPTY_FILTER)) || [];
  const teachers = queryClient.getQueryData(queryKeys.teacher.list(EMPTY_FILTER)) || [];
  const branches = queryClient.getQueryData(queryKeys.branch.list(EMPTY_FILTER)) || [];

  // Sync temp state when modal opens
  useEffect(() => {
    if (isOpen) {
      const initial = availableBatches.find(b => b.batch_id === selectedBatchId);
      setTempSelectedBatch(initial || null);
    }
  }, [isOpen, selectedBatchId, availableBatches]);

  // --- Filter Options ---
  const batchTypeOptions = [
    { label: 'All', value: '', icon: 'apps' },
    { label: 'Academy', value: 'Academy', icon: 'school' },
    { label: 'Computer', value: 'Computer', icon: 'computer' },
    { label: 'Foundation', value: 'Foundation', icon: 'foundation' },
    { label: 'Competitive', value: 'Competitive', icon: 'star' }
  ];

  const branchOptions = useMemo(() => {
    return branches.map(b => ({
      label: b.name || b.branch_name,
      value: b.branch_id
    }));
  }, [branches]);

  // --- Filter Logic ---
  const filteredBatches = useMemo(() => {
    return availableBatches.filter(batch => {
      // Resolve details for searching
      const course = courses.find(c => c.course_id === batch.course_id);
      const teacher = teachers.find(t => t.teacher_id === batch.teacher_id || t.id === batch.teacher_id);
      const branch = branches.find(b => b.branch_id === batch.branch_id);

      const batchName = batch.batch_name || '';
      const courseName = course?.name || batch.course_name || '';
      const teacherName = teacher?.full_name || teacher?.teacher_name || batch.teacher_name || '';
      const branchName = branch?.name || branch?.branch_name || '';

      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        batchName.toLowerCase().includes(query) ||
        courseName.toLowerCase().includes(query) ||
        teacherName.toLowerCase().includes(query) ||
        branchName.toLowerCase().includes(query) ||
        (batch.batch_id || '').toLowerCase().includes(query);

      const matchesBranch = !branchFilter || batch.branch_id === branchFilter;
      const matchesBatchType = !batchTypeFilter || batch.batch_type === batchTypeFilter;

      return matchesSearch && matchesBranch && matchesBatchType;
    });
  }, [availableBatches, searchQuery, branchFilter, batchTypeFilter, courses, teachers, branches]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (tempSelectedBatch) {
      onSelect(tempSelectedBatch);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-[calc(100%-4rem)] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              Select Academic Batch
            </h3>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-2">
              Browse, filter and assign active class schedules for enrollment
            </p>
          </div>
          <button onClick={onClose} className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Main Body - Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Sidebar: 25% Filters */}
          <aside className="w-1/4 border-r border-slate-100 dark:border-slate-800 p-6 space-y-8 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">
            
            {/* Search Section */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Search</h4>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-lg">search</span>
                <input 
                  type="text"
                  placeholder="Batch Name, Course, Faculty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Branch Filter Section */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Branch Center</h4>
              <SelectGroupFilter 
                options={branchOptions} 
                value={branchFilter} 
                onChange={setBranchFilter} 
                defaultLabel="All Branches" 
              />
            </div>

            {/* Batch Type Segment */}
            <ButtonGroupFilter 
              label="Batch Category"
              options={batchTypeOptions} 
              value={batchTypeFilter} 
              onChange={setBatchTypeFilter} 
              size="sm" 
              variant="secondary" 
            />

            {/* Clear All Button */}
            <button 
              onClick={() => { setSearchQuery(''); setBranchFilter(''); setBatchTypeFilter(''); }}
              className="w-full py-3 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">filter_alt_off</span>
              Reset Filters
            </button>
          </aside>

          {/* Right Content: 75% Batch Grid */}
          <main className="w-3/4 overflow-y-auto p-8 bg-white dark:bg-slate-900 custom-scrollbar">
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredBatches.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBatches.map((batch) => {
                  const isSelected = tempSelectedBatch?.batch_id === batch.batch_id;
                  return (
                    <BatchCard
                      key={batch.batch_id}
                      batch={batch}
                      isSelected={isSelected}
                      onSelect={() => setTempSelectedBatch(batch)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="size-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-5xl text-slate-200">search_off</span>
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">No batches found</h4>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">
                  We couldn't find any active schedules matching your filter parameters. Try adjusting the branch or category filters.
                </p>
              </div>
            )}
          </main>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            {tempSelectedBatch ? (
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs border border-primary/20 shadow-sm">
                  {tempSelectedBatch.batch_name?.substring(0, 2).toUpperCase() || 'B'}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                    Selection Confirmed
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {tempSelectedBatch.batch_name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                  Selection Pending
                </span>
                <p className="text-sm font-bold text-slate-400">
                  Please choose an active batch schedule to proceed
                </p>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
              Cancel
            </button>
            <button 
              disabled={!tempSelectedBatch}
              onClick={handleConfirm}
              className="px-10 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined text-lg">check_circle</span>
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchSelectionModal;

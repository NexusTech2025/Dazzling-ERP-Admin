import React, { useState, useMemo, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContextCore';
import { apiClient } from '../../services/apiClient';
import { API_REGISTRY } from '../../services/apiRegistry';
import ConfirmModal from './ConfirmModal';

// Dictionary to map database tables to humanized labels
const tableLabels = {
  Student: { singular: 'Student Profile', plural: 'Student Profiles' },
  Enrollment: { singular: 'Course Enrollment', plural: 'Course Enrollments', btnText: 'View Enrollment', table: 'Enrollment' },
  StudentFeeAccount: { singular: 'Fee Account Ledger', plural: 'Fee Account Ledgers', btnText: 'View Ledger', table: 'StudentFeeAccount' },
  Installment: { singular: 'Installment Due', plural: 'Installment Dues', btnText: 'View Ledger', table: 'Installment' },
  Payment: { singular: 'Cash/UPI Payment', plural: 'Cash/UPI Payments', btnText: 'View Transaction', table: 'Payment' },
  Batch: { singular: 'Subject Batch Section', plural: 'Subject Batch Sections', btnText: 'View Batch', table: 'Batch' },
  Course: { singular: 'Subject Course', plural: 'Subject Courses', btnText: 'View Course', table: 'Course' },
  Package: { singular: 'Academic Program Package', plural: 'Academic Program Packages', btnText: 'View Package', table: 'Package' },
  CourseType: { singular: 'Course Category', plural: 'Course Categories', btnText: 'View Category', table: 'CourseType' }
};

const getTablePluralLabel = (tableName) => {
  return tableLabels[tableName]?.plural || `${tableName}s`;
};

const getTableSingularLabel = (tableName) => {
  return tableLabels[tableName]?.singular || tableName;
};

/**
 * ResolveDeleteConflict - An abstract component to group referential delete blockers in accordions,
 * displaying Entity names above IDs, and providing individual and bulk inline deletion triggers.
 *
 * @component
 * @param {Object} props
 * @param {Array<Object>} props.blockers - Blocker items returned by parseDeleteBlockers.
 * @param {string} props.parentType - The type of parent record (e.g. 'Course').
 * @param {Function} props.onItemDeleted - Callback triggered after successful inline deletion.
 */
export const ResolveDeleteConflict = ({
  blockers = [],
  parentType,
  onItemDeleted
}) => {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  useEffect(() => {
    if (!parentType) {
      console.warn('[ResolveDeleteConflict] Warning: parentType prop is missing in the conflict resolver.');
    }
  }, [parentType]);

  // Accordion collapsed state: keys are table names, values are boolean (true = expanded)
  const [expandedGroups, setExpandedGroups] = useState({});
  // Selected blocker checkbox mappings: keys are group names, values are arrays of blocker IDs
  const [selectedInGroup, setSelectedInGroup] = useState({});
  // Search text mapping: keys are group names, values are strings
  const [searchQueries, setSearchQueries] = useState({});

  // Local state to manage nested deletion confirmation modal
  const [localConfirm, setLocalConfirm] = useState({
    isOpen: false,
    title: 'Confirm Dependency Deletion',
    message: '',
    onConfirm: null,
    status: 'idle',
    resultMessage: null
  });

  // Group blockers by their database table
  const groupedBlockers = useMemo(() => {
    const groups = {};
    blockers.forEach((blocker, index) => {
      const table = blocker.blockerTable;
      if (!groups[table]) {
        groups[table] = [];
      }
      groups[table].push({ ...blocker, originalIndex: index });
    });
    return groups;
  }, [blockers]);

  // Dynamic helper to resolve display name using queryClient cache lookup
  const getBlockerDetailName = (blocker) => {
    if (blocker.detailLabel) return blocker.detailLabel;
    
    const table = blocker.blockerTable;
    const id = blocker.blockerId;

    try {
      if (table === 'Enrollment') {
        const enrollments = queryClient.getQueryData(['enrollment', 'list']) || [];
        const item = enrollments.find(e => e.enrollment_id === id);
        if (item) return item.student_name ? `Enrollment: ${item.student_name}` : item.course_name || 'Active Enrollment';
      }
      if (table === 'Batch') {
        const batches = queryClient.getQueryData(['batch', 'list']) || [];
        const item = batches.find(b => b.batch_id === id);
        if (item) return item.batch_name || 'Class Section';
      }
      if (table === 'Course') {
        const courses = queryClient.getQueryData(['course', 'list']) || [];
        const item = courses.find(c => c.course_id === id);
        if (item) return item.name || 'Subject Course';
      }
      if (table === 'Package') {
        const packages = queryClient.getQueryData(['packages', 'list']) || [];
        const item = packages.find(p => p.package_id === id);
        if (item) return item.name || 'Program Package';
      }
      if (table === 'Payment') {
        return `Payment Transaction`;
      }
      if (table === 'StudentFeeAccount') {
        return `Student Fee Account`;
      }
      if (table === 'Installment') {
        return `Fee Installment`;
      }
    } catch (err) {
      console.warn('[ResolveDeleteConflict] Failed to resolve name from cache:', err);
    }
    return getTableSingularLabel(table);
  };

  // Dynamic status tag helper based on entity state
  const getBlockerStatus = (blocker) => {
    const table = blocker.blockerTable;
    const id = blocker.blockerId;

    if (table === 'Payment') {
      return { text: 'VERIFIED', type: 'success' };
    }
    if (table === 'Installment') {
      return { text: 'UNPAID', type: 'warning' };
    }
    if (table === 'Enrollment') {
      return { text: 'ACTIVE', type: 'info' };
    }
    return { text: 'ACTIVE', type: 'secondary' };
  };

  const toggleGroup = (table) => {
    setExpandedGroups(prev => ({ ...prev, [table]: !prev[table] }));
  };

  const handleSelectCard = (table, blockerId) => {
    setSelectedInGroup(prev => {
      const current = prev[table] || [];
      const updated = current.includes(blockerId)
        ? current.filter(id => id !== blockerId)
        : [...current, blockerId];
      return { ...prev, [table]: updated };
    });
  };

  const handleSelectAllGroup = (table, filteredItems) => {
    const allFilteredIds = filteredItems.map(item => item.blockerId);
    setSelectedInGroup(prev => {
      const current = prev[table] || [];
      const isAllFilteredSelected = allFilteredIds.every(id => current.includes(id));
      
      let updated;
      if (isAllFilteredSelected) {
        // Deselect all filtered items
        updated = current.filter(id => !allFilteredIds.includes(id));
      } else {
        // Select all filtered items (keeping others that might be selected but not visible)
        updated = Array.from(new Set([...current, ...allFilteredIds]));
      }
      return { ...prev, [table]: updated };
    });
  };

  const handleSearchChange = (table, val) => {
    setSearchQueries(prev => ({ ...prev, [table]: val }));
  };

  // Mutation to delete dynamic records
  const deleteMutation = useMutation({
    mutationFn: async ({ table, ids }) => {
      let action = API_REGISTRY.DATA.DELETE_MANY;
      if (table === 'Enrollment') action = API_REGISTRY.STUDENT.DELETE_MANY;
      if (table === 'Batch') action = API_REGISTRY.BATCH.DELETE;
      if (table === 'Course') action = API_REGISTRY.ACADEMIC.DELETE_MANY_COURSES;
      if (table === 'Package') action = API_REGISTRY.ACADEMIC.DELETE_MANY_PACKAGES;
      if (table === 'CourseType') action = API_REGISTRY.ACADEMIC.DELETE_MANY_COURSE_TYPES;
      if (table === 'Teacher') action = API_REGISTRY.STAFF.DELETE_MANY;

      if (ids.length === 1 && table !== 'Enrollment' && table !== 'Course' && table !== 'Package' && table !== 'CourseType' && table !== 'Teacher') {
        return await apiClient.executeAction(API_REGISTRY.DATA.DELETE, { table, id: ids[0] }, token);
      } else {
        return await apiClient.executeAction(action, { table, ids }, token);
      }
    }
  });

  const triggerIndividualDelete = (blocker) => {
    const table = blocker.blockerTable;
    const id = blocker.blockerId;
    const displayName = getBlockerDetailName(blocker);

    setLocalConfirm({
      isOpen: true,
      title: `Delete ${getTableSingularLabel(table)}`,
      message: `Are you sure you want to permanently delete "${displayName}" (${id})? This action cannot be undone.`,
      status: 'idle',
      resultMessage: null,
      onConfirm: () => executeDeletion(table, [id])
    });
  };

  const triggerBulkDelete = (table, groupItems) => {
    const selectedIds = selectedInGroup[table] || [];
    if (selectedIds.length === 0) return;

    setLocalConfirm({
      isOpen: true,
      title: `Delete ${selectedIds.length} ${getTablePluralLabel(table)}`,
      message: `Are you sure you want to permanently delete the ${selectedIds.length} selected dependencies? This action is irreversible.`,
      status: 'idle',
      resultMessage: null,
      onConfirm: () => executeDeletion(table, selectedIds)
    });
  };

  const executeDeletion = (table, ids) => {
    setLocalConfirm(prev => ({ ...prev, status: 'processing' }));
    deleteMutation.mutate({ table, ids }, {
      onSuccess: (res) => {
        if (res.success) {
          setLocalConfirm(prev => ({
            ...prev,
            status: 'success',
            resultMessage: `Successfully deleted selected dependency item(s).`
          }));
          // Invalidate key query cache
          queryClient.invalidateQueries();
          // Clear selections
          setSelectedInGroup(prev => ({ ...prev, [table]: [] }));
          // Notify parent to refetch/inspect dependencies again
          if (onItemDeleted) onItemDeleted();
        } else {
          setLocalConfirm(prev => ({
            ...prev,
            status: 'error',
            resultMessage: res.message || 'Deletion failed.'
          }));
        }
      },
      onError: (err) => {
        setLocalConfirm(prev => ({
          ...prev,
          status: 'error',
          resultMessage: err.message || 'Server error occurred during deletion.'
        }));
      }
    });
  };

  return (
    <div className="space-y-4">
      {Object.keys(groupedBlockers).map(table => {
        const groupItems = groupedBlockers[table];
        const isExpanded = expandedGroups[table] ?? true; // Default expanded
        
        // Filter search logic
        const query = (searchQueries[table] || '').toLowerCase();
        const filteredItems = groupItems.filter(item => {
          const name = getBlockerDetailName(item).toLowerCase();
          const id = item.blockerId.toLowerCase();
          return name.includes(query) || id.includes(query);
        });

        const selected = selectedInGroup[table] || [];
        const visibleSelected = selected.filter(id => filteredItems.some(item => item.blockerId === id));
        const isAllSelected = filteredItems.length > 0 && visibleSelected.length === filteredItems.length;
        const isSomeSelected = visibleSelected.length > 0 && visibleSelected.length < filteredItems.length;

        // Custom finance warning check
        const isFinanceGroup = table === 'Payment' || table === 'Installment' || table === 'StudentFeeAccount';

        return (
          <div 
            key={table}
            className="border border-border-light dark:border-slate-800/80 rounded-xl overflow-hidden bg-background-light/20 dark:bg-slate-900/10 transition-all duration-300"
          >
            {/* Accordion Header */}
            <div 
              className="flex items-center justify-between p-4 bg-slate-100/50 dark:bg-slate-900/40 border-b border-border-light dark:border-slate-800/60 cursor-pointer select-none"
              onClick={() => toggleGroup(table)}
            >
              <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                <input
                  type="checkbox"
                  className="size-4 rounded border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary/20 cursor-pointer transition-all"
                  checked={isAllSelected}
                  ref={el => { if (el) el.indeterminate = isSomeSelected; }}
                  onChange={() => handleSelectAllGroup(table, filteredItems)}
                  disabled={filteredItems.length === 0}
                />
                <span 
                  className="font-bold text-sm text-text-main dark:text-white flex items-center gap-2"
                  onClick={() => toggleGroup(table)}
                >
                  {getTablePluralLabel(table)}
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-mono">
                    {groupItems.length}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                {selected.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerBulkDelete(table, groupItems);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Delete Selected ({selected.length})
                  </button>
                )}
                <span className="material-symbols-outlined text-text-secondary transition-transform duration-300 transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  expand_more
                </span>
              </div>
            </div>

            {/* Accordion Content Panel */}
            {isExpanded && (
              <div className="p-4 space-y-3 bg-white/40 dark:bg-slate-950/20 animate-in slide-in-from-top-2 duration-200">
                {/* Search Bar inside accordion */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-secondary text-sm">search</span>
                  <input
                    type="text"
                    value={searchQueries[table] || ''}
                    onChange={(e) => handleSearchChange(table, e.target.value)}
                    placeholder={`Search ${getTablePluralLabel(table).toLowerCase()}...`}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100/50 dark:bg-slate-900/50 border border-border-light dark:border-slate-800 rounded-lg text-text-main dark:text-slate-100 focus:outline-none focus:border-primary/50 transition-all font-medium"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Finance Warning Alert */}
                {isFinanceGroup && (
                  <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg p-3 flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">warning</span>
                    <div className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed font-semibold">
                      Outstanding Balance Detected. Deleting these financial ledgers may alter historical accounts.
                    </div>
                  </div>
                )}

                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pt-1">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-4 text-xs text-text-secondary italic">
                      No matching records found.
                    </div>
                  ) : (
                    filteredItems.map((blocker) => {
                      const detailName = getBlockerDetailName(blocker);
                      const isChecked = selected.includes(blocker.blockerId);
                      const status = getBlockerStatus(blocker);

                      return (
                        <div 
                          key={blocker.blockerId}
                          className={`flex items-center justify-between gap-4 p-3 border rounded-lg transition-all duration-205 bg-background-light/50 dark:bg-slate-900/30 ${
                            isChecked 
                              ? 'border-primary/50 bg-primary/[0.02] dark:bg-primary/[0.01]' 
                              : 'border-border-light dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700/80'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              className="size-4 rounded border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary/20 cursor-pointer transition-all"
                              checked={isChecked}
                              onChange={() => handleSelectCard(table, blocker.blockerId)}
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-text-main dark:text-slate-100 truncate">
                                {detailName}
                              </p>
                              <p className="text-[10px] text-text-secondary mt-0.5 font-mono flex items-center gap-2">
                                ID: {blocker.blockerId}
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                  status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                                  status.type === 'warning' ? 'bg-amber-500/10 text-amber-550 dark:text-amber-400' :
                                  status.type === 'info' ? 'bg-blue-500/10 text-blue-500' :
                                  'bg-slate-500/10 text-slate-450 dark:text-slate-400'
                                }`}>
                                  {status.text}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => triggerIndividualDelete(blocker)}
                              className="p-1.5 text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                              title="Delete Dependency"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Local Confirmation Modal for Dependency Deletion */}
      <ConfirmModal
        isOpen={localConfirm.isOpen}
        title={localConfirm.title}
        message={localConfirm.message}
        status={localConfirm.status}
        resultMessage={localConfirm.resultMessage}
        onConfirm={localConfirm.onConfirm}
        onClose={() => setLocalConfirm(prev => ({ ...prev, isOpen: false }))}
        isProcessing={localConfirm.status === 'processing'}
      />
    </div>
  );
};

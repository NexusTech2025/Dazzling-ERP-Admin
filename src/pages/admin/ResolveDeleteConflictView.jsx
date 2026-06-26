import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContextCore';
import { apiClient } from '../../services/apiClient';
import { API_REGISTRY } from '../../services/apiRegistry';
import MainLayout from '../../components/layout/MainLayout';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { ResolveDeleteConflict } from '../../components/ui/ResolveDeleteConflict';
import ConfirmModal from '../../components/ui/ConfirmModal';

// Full Abstract parentType entityConfig Registry
const entityConfig = {
  Student: {
    primaryKey: 'student_id',
    nameKey: 'student_name',
    icon: 'person',
    label: 'Student Profile',
    deleteAction: API_REGISTRY.STUDENT.DELETE_MANY,
    getMetaChips: (record) => [
      `Gender: ${record.gender || 'N/A'}`,
      `Status: ${record.status || 'Active'}`,
      `DOB: ${record.dob || 'N/A'}`
    ]
  },
  Course: {
    primaryKey: 'course_id',
    nameKey: 'name',
    icon: 'book',
    label: 'Subject Course',
    deleteAction: API_REGISTRY.ACADEMIC.DELETE_MANY_COURSES,
    getMetaChips: (record) => [
      `Medium: ${record.language_medium || 'N/A'}`,
      `Base Fee: ₹${record.base_fee || 0}`,
      `Installments: ${record.default_installment_count || 1}`
    ]
  },
  Batch: {
    primaryKey: 'batch_id',
    nameKey: 'batch_name',
    icon: 'groups',
    label: 'Batch Section',
    deleteAction: API_REGISTRY.BATCH.DELETE,
    getMetaChips: (record) => [
      `Status: ${record.status || 'Active'}`,
      `Teacher: ${record.teacher_id || 'N/A'}`
    ]
  },
  CourseType: {
    primaryKey: 'segment_id',
    nameKey: 'segment_name',
    icon: 'category',
    label: 'Course Category',
    deleteAction: API_REGISTRY.ACADEMIC.DELETE_MANY_COURSE_TYPES,
    getMetaChips: (record) => [
      `Status: ${record.status || 'Active'}`,
      `Desc: ${record.description || 'No Description'}`
    ]
  },
  Package: {
    primaryKey: 'package_id',
    nameKey: 'name',
    icon: 'package',
    label: 'Program Package',
    deleteAction: API_REGISTRY.ACADEMIC.DELETE_MANY_PACKAGES,
    getMetaChips: (record) => [
      `Board: ${record.board || 'N/A'}`,
      `Fee: ₹${record.package_fee || 0}`,
      `Months: ${record.month || 0}`
    ]
  },
  Teacher: {
    primaryKey: 'teacher_id',
    nameKey: 'full_name',
    icon: 'badge',
    label: 'Teacher Profile',
    deleteAction: API_REGISTRY.STAFF.DELETE_MANY,
    getMetaChips: (record) => [
      `Type: ${record.teacher_type || 'N/A'}`,
      `Joining: ${record.joining_date || 'N/A'}`,
      `Status: ${record.status || 'Active'}`
    ]
  },
  Branch: {
    primaryKey: 'branch_id',
    nameKey: 'branch_name',
    icon: 'storefront',
    label: 'Branch Location',
    deleteAction: API_REGISTRY.DATA.DELETE,
    getMetaChips: (record) => [
      `Location: ${record.location || 'N/A'}`,
      `Status: ${record.status || 'Active'}`
    ]
  }
};

const ResolveDeleteConflictView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token } = useAuth();

  // Unpack state
  const { blockers: initialBlockers = [], parentId = '', parentName = '', parentType = 'Student' } = location.state || {};
  const [activeBlockers, setActiveBlockers] = useState(initialBlockers);

  useEffect(() => {
    if (!location.state) {
      console.warn('[ResolveDeleteConflictView] Warning: Accessed Resolve Conflict view without navigation state.');
    } else if (!parentType) {
      console.warn('[ResolveDeleteConflictView] Warning: parentType is missing in the conflict navigation state.');
    }
  }, [location.state, parentType]);

  const [isSticky, setIsSticky] = useState(false);
  const handleBodyScroll = (e) => {
    setIsSticky(e.currentTarget.scrollTop > 80);
  };

  // State triggers
  const [acknowledged, setAcknowledged] = useState(false);
  const [activeParentIds, setActiveParentIds] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  // Global Delete Confirmation Modal state
  const [globalConfirm, setGlobalConfirm] = useState({
    isOpen: false,
    title: 'Finalize Deletion',
    message: '',
    status: 'idle',
    resultMessage: null,
    onConfirm: null
  });

  // Query cache crawler to look up entity name by primary key
  const getParentNameFromCache = (type, id) => {
    try {
      if (type === 'Student') {
        const cache = queryClient.getQueriesData({ queryKey: ['student', 'list'] });
        for (const [key, list] of cache) {
          if (Array.isArray(list)) {
            const match = list.find(item => item.student_id === id);
            if (match) return match.student_name;
          }
        }
      }
      if (type === 'Course') {
        const cache = queryClient.getQueriesData({ queryKey: ['course', 'list'] });
        for (const [key, list] of cache) {
          if (Array.isArray(list)) {
            const match = list.find(item => item.course_id === id);
            if (match) return match.name;
          }
        }
      }
      if (type === 'Batch') {
        const cache = queryClient.getQueriesData({ queryKey: ['batch', 'list'] });
        for (const [key, list] of cache) {
          if (Array.isArray(list)) {
            const match = list.find(item => item.batch_id === id);
            if (match) return match.batch_name;
          }
        }
      }
      if (type === 'CourseType') {
        const cache = queryClient.getQueriesData({ queryKey: ['course-type', 'list'] });
        for (const [key, list] of cache) {
          if (Array.isArray(list)) {
            const match = list.find(item => item.segment_id === id);
            if (match) return match.segment_name;
          }
        }
      }
      if (type === 'Package') {
        const cache = queryClient.getQueriesData({ queryKey: ['package', 'list'] });
        for (const [key, list] of cache) {
          if (Array.isArray(list)) {
            const match = list.find(item => item.package_id === id);
            if (match) return match.name;
          }
        }
      }
      if (type === 'Teacher') {
        const cache = queryClient.getQueriesData({ queryKey: ['teacher', 'list'] });
        for (const [key, list] of cache) {
          if (Array.isArray(list)) {
            const match = list.find(item => item.teacher_id === id);
            if (match) return match.full_name;
          }
        }
      }
      if (type === 'Branch') {
        const cache = queryClient.getQueriesData({ queryKey: ['branch', 'list'] });
        for (const [key, list] of cache) {
          if (Array.isArray(list)) {
            const match = list.find(item => item.branch_id === id);
            if (match) return match.branch_name;
          }
        }
      }
    } catch (err) {
      console.warn('[ResolveDeleteConflictView] Cache lookup error:', err);
    }
    return '';
  };

  // Derive unique parent target records from blockers
  const uniqueParents = useMemo(() => {
    const ids = Array.from(new Set(activeBlockers.map(b => b.targetId)));
    return ids.map(id => {
      const match = activeBlockers.find(b => b.targetId === id);
      const type = match ? match.targetTable : parentType;
      const cachedName = getParentNameFromCache(type, id);
      return {
        id,
        type,
        name: cachedName || (id === parentId ? parentName : `Target ID: ${id}`)
      };
    });
  }, [activeBlockers, parentType, parentId, parentName]);

  // Set initial selected parent IDs
  useEffect(() => {
    if (uniqueParents.length > 0 && activeParentIds.length === 0) {
      setActiveParentIds(uniqueParents.map(p => p.id));
    }
  }, [uniqueParents]);

  // Filter blockers based on target parent filter checklist selection
  const filteredBlockers = useMemo(() => {
    return activeBlockers.filter(b => activeParentIds.includes(b.targetId));
  }, [activeBlockers, activeParentIds]);

  // Dynamic entity configuration for the hero representation
  const activeHeroConfig = useMemo(() => {
    const config = entityConfig[parentType];
    return config || {
      icon: 'gavel',
      label: parentType || 'Database Entity',
      deleteAction: API_REGISTRY.DATA.DELETE,
      getMetaChips: () => [`ID: ${parentId}`]
    };
  }, [parentType, parentId]);

  // Retrieve details for a single selected parent entity
  const singleParentRecord = useMemo(() => {
    if (activeParentIds.length !== 1) return null;
    const targetId = activeParentIds[0];
    const targetParent = uniqueParents.find(p => p.id === targetId);
    if (!targetParent) return null;

    try {
      const cacheKey = parentType === 'CourseType' ? 'course-type' : parentType.toLowerCase();
      const cache = queryClient.getQueriesData({ queryKey: [cacheKey, 'list'] });
      const pkName = activeHeroConfig.primaryKey || 'id';

      for (const [key, list] of cache) {
        if (Array.isArray(list)) {
          const match = list.find(item => item[pkName] === targetId);
          if (match) return match;
        }
      }
    } catch (e) {
      console.warn('[ResolveDeleteConflictView] Failed to pull parent attributes:', e);
    }
    return null;
  }, [activeParentIds, parentType, uniqueParents, activeHeroConfig]);

  // Meta chips computed dynamically
  const metaChips = useMemo(() => {
    if (activeParentIds.length !== 1) {
      return [`Selected Targets: ${activeParentIds.length}`, `Total Active Blockers: ${activeBlockers.length}`];
    }
    if (singleParentRecord) {
      return activeHeroConfig.getMetaChips(singleParentRecord);
    }
    return [`ID: ${activeParentIds[0]}`];
  }, [activeParentIds, singleParentRecord, activeHeroConfig, activeBlockers]);

  // Dynamic Impact metrics calculations
  const impactSummary = useMemo(() => {
    const counts = {};
    filteredBlockers.forEach(b => {
      const table = b.blockerTable;
      counts[table] = (counts[table] || 0) + 1;
    });
    return counts;
  }, [filteredBlockers]);

  // Mutation to delete the parent records
  const executeParentDeleteMutation = useMutation({
    mutationFn: async ({ type, ids }) => {
      const config = entityConfig[type] || { deleteAction: API_REGISTRY.DATA.DELETE_MANY };
      let action = config.deleteAction;
      
      const payload = { ids };
      if (type === 'Student') {
        payload.student_ids = ids;
      }
      
      if (ids.length === 1 && action !== API_REGISTRY.STUDENT.DELETE_MANY && action !== API_REGISTRY.ACADEMIC.DELETE_MANY_COURSES && action !== API_REGISTRY.ACADEMIC.DELETE_MANY_PACKAGES && action !== API_REGISTRY.ACADEMIC.DELETE_MANY_COURSE_TYPES) {
        // Fallback to single delete
        let table = type;
        if (type === 'CourseType') table = 'CourseType';
        return await apiClient.executeAction(API_REGISTRY.DATA.DELETE, { table, id: ids[0] }, token);
      } else {
        return await apiClient.executeAction(action, payload, token);
      }
    }
  });

  const handleParentSelectToggle = (id) => {
    setActiveParentIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAllParents = () => {
    if (activeParentIds.length === uniqueParents.length) {
      setActiveParentIds([]);
    } else {
      setActiveParentIds(uniqueParents.map(p => p.id));
    }
  };

  const handleExportConflictLog = () => {
    setIsExporting(true);
    try {
      const payloadString = JSON.stringify({
        session: '#DEL-9082-SFT',
        date: new Date().toISOString(),
        parentType,
        targets: uniqueParents,
        blockers: activeBlockers
      }, null, 2);

      const blob = new Blob([payloadString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conflict-log-DEL-9082.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const triggerFinalizeDeletion = () => {
    if (!acknowledged) return;
    
    // Check if any selected parents still have unresolved blockers
    const parentsWithBlockers = activeParentIds.filter(pid => 
      activeBlockers.some(b => b.targetId === pid)
    );

    let warningText = '';
    if (parentsWithBlockers.length > 0) {
      warningText = ` WARNING: ${parentsWithBlockers.length} of the selected parent targets still have active referential blockers. The server will reject this deletion.`;
    }

    setGlobalConfirm({
      isOpen: true,
      title: `Finalize Deletion of ${activeParentIds.length} Target(s)`,
      message: `Are you sure you want to permanently delete the ${activeParentIds.length} selected ${parentType}(s)? This action will purge all related metadata and cannot be undone.${warningText}`,
      status: 'idle',
      resultMessage: null,
      onConfirm: executeFinalDeletion
    });
  };

  const executeFinalDeletion = () => {
    setGlobalConfirm(prev => ({ ...prev, status: 'processing' }));
    executeParentDeleteMutation.mutate({ type: parentType, ids: activeParentIds }, {
      onSuccess: (res) => {
        if (res.success) {
          setGlobalConfirm(prev => ({
            ...prev,
            status: 'success',
            resultMessage: `Successfully deleted target ${parentType}(s).`
          }));
          queryClient.invalidateQueries();
          setTimeout(() => {
            navigate(-1);
          }, 1500);
        } else {
          setGlobalConfirm(prev => ({
            ...prev,
            status: 'error',
            resultMessage: res.message || 'Deletion failed.'
          }));
        }
      },
      onError: (err) => {
        setGlobalConfirm(prev => ({
          ...prev,
          status: 'error',
          resultMessage: err.message || 'Network error occurred.'
        }));
      }
    });
  };

  const crumbs = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Resolve Conflict' }
  ];

  if (activeBlockers.length === 0) {
    return (
      <MainLayout
        onBodyScroll={handleBodyScroll}
        body={
          <div className="pt-10 pb-6 max-w-xl mx-auto space-y-6">
            <Breadcrumbs items={crumbs} className="mb-4" />
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-8 rounded-2xl text-center space-y-4 shadow-xl">
              <div className="size-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-500 text-3xl">check_circle</span>
              </div>
              <h2 className="text-xl font-bold text-text-main dark:text-white">No Deletion Conflicts Detected</h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                There are no active referential locks or dependencies blocking any deletions. You may safely return.
              </p>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Go Back
              </button>
            </div>
          </div>
        }
      />
    );
  }

  return (
    <MainLayout
      onBodyScroll={handleBodyScroll}
      body={
        <div className="pt-6 lg:pt-8 pb-20 max-w-7xl mx-auto space-y-6 px-4">
          <Breadcrumbs items={crumbs} className="mb-2" />

          {/* Page Header */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Resolve Dependency Conflicts
                </h1>
                <span className="bg-rose-500/10 text-rose-500 text-xs font-extrabold px-3 py-1 rounded-full border border-rose-500/20">
                  {activeBlockers.length} Conflicts
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                Active session ID: #DEL-9082-SFT
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 border border-border-light dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 px-4 py-2 rounded-xl text-xs font-bold text-text-secondary hover:text-text-main dark:text-slate-350 dark:hover:text-white transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Cancel and Return
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Dependency Management (7/12) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Entity Hero Profile Card */}
              <div className="bg-surface-light dark:bg-slate-900/60 border border-border-light dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex items-center justify-between gap-6 transition-all duration-300">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="size-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-3xl">{activeHeroConfig.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary block">
                      PRIMARY ENTITY ({activeHeroConfig.label})
                    </span>
                    <h2 className="text-xl font-black text-text-main dark:text-white truncate mt-0.5">
                      {activeParentIds.length === 1 
                        ? (uniqueParents.find(p => p.id === activeParentIds[0])?.name || parentName)
                        : `Batch Target: ${activeParentIds.length} ${parentType}s`
                      }
                    </h2>
                    <p className="text-xs text-text-secondary font-mono mt-0.5">
                      {activeParentIds.length === 1 
                        ? `UID: ${activeParentIds[0]}` 
                        : `UIDs: ${activeParentIds.join(', ')}`
                      }
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                  <span className="bg-rose-500/10 text-rose-500 text-[10px] font-black tracking-widest uppercase border border-rose-500/20 px-3 py-1 rounded-lg">
                    PENDING DELETION
                  </span>
                  
                  {/* Quick Metadata Chips */}
                  <div className="flex items-center gap-2 mt-auto">
                    {metaChips.map((chip, idx) => (
                      <span 
                        key={idx} 
                        className="bg-slate-100 dark:bg-slate-800 text-text-secondary dark:text-slate-350 text-[10px] font-bold px-2 py-0.5 rounded border border-border-light dark:border-slate-700/60"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Blocker Accordion System */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary dark:text-slate-400">
                  Referential Blocker Accordions
                </h3>
                <ResolveDeleteConflict
                  blockers={filteredBlockers}
                  parentType={parentType}
                  onItemDeleted={() => {
                    // Refetch triggers inside component
                    queryClient.invalidateQueries();
                  }}
                />
              </div>
            </div>

            {/* Right Column: Impact & Targets Selection (5/12) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Conflict Targets Selection Widget */}
              <div className="bg-surface-light dark:bg-slate-900/60 border border-border-light dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-100/50 dark:bg-slate-900/40 border-b border-border-light dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">filter_list</span>
                    <span className="font-bold text-xs text-text-main dark:text-white uppercase tracking-wider">
                      Conflict Targets ({uniqueParents.length})
                    </span>
                  </div>
                  <button
                    onClick={handleSelectAllParents}
                    className="text-[10px] text-primary hover:underline font-extrabold uppercase tracking-wide"
                  >
                    {activeParentIds.length === uniqueParents.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="p-4 space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                  {uniqueParents.map(parent => {
                    const isChecked = activeParentIds.includes(parent.id);
                    const blockersCount = activeBlockers.filter(b => b.targetId === parent.id).length;
                    return (
                      <div 
                        key={parent.id}
                        onClick={() => handleParentSelectToggle(parent.id)}
                        className={`flex items-center justify-between p-2.5 border rounded-xl cursor-pointer select-none transition-all duration-150 ${
                          isChecked 
                            ? 'border-primary/50 bg-primary/[0.02] dark:bg-primary/[0.01]' 
                            : 'border-border-light dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/20'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input 
                            type="checkbox"
                            className="size-4 rounded border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary/20 pointer-events-none"
                            checked={isChecked}
                            readOnly
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-text-main dark:text-slate-100 block truncate">
                              {parent.name}
                            </span>
                            <span className="text-[10px] text-text-secondary font-mono">
                              ID: {parent.id}
                            </span>
                          </div>
                        </div>
                        <span className="bg-rose-500/10 text-rose-500 font-mono text-[10px] font-black px-2 py-0.5 rounded border border-rose-500/10 shrink-0">
                          {blockersCount}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Impact Summary Card */}
              <div className="bg-surface-light dark:bg-slate-900/60 border border-border-light dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-100/50 dark:bg-slate-900/40 border-b border-border-light dark:border-slate-800/80 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">assessment</span>
                  <span className="font-bold text-xs text-text-main dark:text-white uppercase tracking-wider">
                    Impact Summary
                  </span>
                </div>
                <div className="p-5 space-y-3.5">
                  {Object.keys(impactSummary).length === 0 ? (
                    <div className="text-xs text-text-secondary italic text-center py-2">
                      No active blockers in view.
                    </div>
                  ) : (
                    Object.keys(impactSummary).map(table => (
                      <div key={table} className="flex justify-between items-center text-xs">
                        <span className="text-text-secondary font-semibold">
                          Dependencies in {table}
                        </span>
                        <span className="font-bold font-mono text-text-main dark:text-white bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded">
                          {impactSummary[table]}
                        </span>
                      </div>
                    ))
                  )}
                  <div className="pt-3 border-t border-border-light dark:border-slate-800 flex justify-between items-center text-xs font-bold">
                    <span className="text-text-main dark:text-slate-200">Total Dependencies Affected</span>
                    <span className="text-rose-500 font-mono">{filteredBlockers.length}</span>
                  </div>
                </div>
              </div>

              {/* Risk Acknowledgement Card */}
              <div className="bg-rose-50 dark:bg-rose-950/10 border border-rose-150 dark:border-rose-900/40 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <span className="material-symbols-outlined text-lg">report</span>
                  <h3 className="font-extrabold text-xs uppercase tracking-wider">Permanent Action Warning</h3>
                </div>
                <p className="text-xs text-rose-700 dark:text-rose-250/90 leading-relaxed font-medium">
                  This administrative operation **cannot be undone**. Deleting this {parentType.toLowerCase()} will result in permanent removal from historical records.
                </p>

                <div 
                  onClick={() => setAcknowledged(!acknowledged)}
                  className="flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    className="size-4 rounded border-rose-500 bg-white dark:bg-rose-900 text-rose-600 focus:ring-rose-500/20 cursor-pointer"
                    checked={acknowledged}
                    onChange={() => {}}
                  />
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">
                    I ACKNOWLEDGE THE DATA LOSS
                  </span>
                </div>

                <button
                  type="button"
                  disabled={!acknowledged}
                  onClick={triggerFinalizeDeletion}
                  className={`w-full py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md ${
                    acknowledged 
                      ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-rose-600/20' 
                      : 'bg-slate-200 dark:bg-slate-800 text-text-secondary dark:text-slate-600 cursor-not-allowed shadow-none'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">delete_forever</span>
                  Finalize Deletion
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      header={
        <div
          className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
            isSticky
              ? 'opacity-100 translate-y-0 shadow-md pointer-events-auto'
              : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 lg:px-6 py-3 flex items-center justify-between rounded-b-xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-500 text-lg">warning</span>
              <span className="text-sm font-bold text-text-main dark:text-white">
                Resolve Dependency Conflict
              </span>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="text-xs font-bold text-text-secondary hover:text-text-main dark:hover:text-white flex items-center gap-1 transition-all"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back
            </button>
          </div>
        </div>
      }
      footer={
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-light/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-border-light dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-secondary text-xs font-medium">
            <span className="size-2 rounded-full bg-indigo-500 animate-pulse"></span>
            System: Integrity validated. Awaiting final authorization.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportConflictLog}
              disabled={isExporting}
              className="px-4 py-2 border border-border-light dark:border-slate-800 hover:border-slate-355 bg-white dark:bg-slate-950 text-text-secondary hover:text-text-main dark:text-slate-300 dark:hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Export Conflict Log
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-border-light dark:border-slate-800 hover:border-slate-355 bg-white dark:bg-slate-950 text-text-secondary hover:text-text-main dark:text-slate-300 dark:hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Close
            </button>
            <button
              onClick={triggerFinalizeDeletion}
              disabled={!acknowledged}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
                acknowledged 
                  ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-rose-600/20' 
                  : 'bg-slate-200 dark:bg-slate-800 text-text-secondary dark:text-slate-650 cursor-not-allowed shadow-none'
              }`}
            >
              Execute Deletion
            </button>
          </div>
        </div>
      }
    />
  );
};

export default ResolveDeleteConflictView;

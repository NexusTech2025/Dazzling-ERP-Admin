import React, { useState, useMemo } from 'react';
import TeacherCard from './TeacherCard';
import { Badge } from '../../../components/ui/v2/indicators';

/**
 * TeacherSelectionModal - Premium modal for selecting faculty members.
 * Cards use MediumDensityCard with profile photo (or initials fallback),
 * experience, qualification, specialization, and teacher_type.
 * No entity IDs displayed on cards.
 */
const TeacherSelectionModal = ({
  isOpen,
  onClose,
  onSelect,
  selectedTeacher = null,
  availableTeachers = [],
  singleSelect = true
}) => {
  const [tempSelected, setTempSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Sync temp state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const initial = Array.isArray(selectedTeacher)
        ? selectedTeacher
        : (selectedTeacher ? [selectedTeacher] : []);
      setTempSelected(initial);
    }
  }, [isOpen, selectedTeacher]);

  // Compute initials from a name string
  const getInitials = (name) =>
    (name || '')
      .split(' ')
      .map(w => w[0])
      .filter(Boolean)
      .join('')
      .substring(0, 2)
      .toUpperCase();

  // Format teacher_type for display (full_time → Full-Time)
  const formatType = (type) => {
    if (!type) return null;
    return type.replace(/_/g, '-').replace(/\b\w/g, l => l.toUpperCase());
  };

  // --- Filter Options ---
  const statusOptions = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  const typeOptions = [
    { label: 'All', value: '' },
    { label: 'Full-Time', value: 'full_time' },
    { label: 'Part-Time', value: 'part_time' },
    { label: 'Guest', value: 'guest' }
  ];

  // Dynamically extract unique specializations from data
  const specializationOptions = useMemo(() => {
    const specs = new Set();
    availableTeachers.forEach(t => { if (t.specialization) specs.add(t.specialization); });
    return [
      { label: 'All Subjects', value: '' },
      ...Array.from(specs).sort().map(s => ({ label: s, value: s }))
    ];
  }, [availableTeachers]);

  // --- Filter Logic ---
  const filteredTeachers = useMemo(() => {
    return availableTeachers.filter(t => {
      const name = t.full_name || t.teacher_name || t.name || '';
      const email = t.email || '';
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || t.status === statusFilter;
      const matchesSpec = !specializationFilter || t.specialization === specializationFilter;
      const matchesType = !typeFilter || t.teacher_type === typeFilter;
      return matchesSearch && matchesStatus && matchesSpec && matchesType;
    });
  }, [availableTeachers, searchQuery, statusFilter, specializationFilter, typeFilter]);

  if (!isOpen) return null;

  const toggleTeacher = (teacher) => {
    if (singleSelect) {
      setTempSelected([teacher]);
      return;
    }
    const isAlreadySelected = tempSelected.find(st => st.teacher_id === teacher.teacher_id);
    if (isAlreadySelected) {
      setTempSelected(prev => prev.filter(st => st.teacher_id !== teacher.teacher_id));
    } else {
      setTempSelected(prev => [...prev, teacher]);
    }
  };

  const handleConfirm = () => {
    onSelect(singleSelect ? (tempSelected[0] || null) : tempSelected);
    onClose();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setSpecializationFilter('');
    setTypeFilter('');
  };

  // Reusable filter pill button class (design system tokens)
  const filterBtnClass = (isActive) =>
    `rounded-xl font-black text-xs py-1.5 px-3 flex items-center gap-1.5 transition-all duration-200 active:scale-95 ${
      isActive
        ? 'bg-primary text-white shadow-md shadow-primary/25'
        : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
    }`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-[calc(100%-4rem)] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none">
              {singleSelect ? 'Assign Teacher' : 'Faculty Directory'}
            </h3>
            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-1.5">
              {singleSelect
                ? 'Search and select an instructor for this batch'
                : 'Browse and select multiple faculty members'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="size-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-text-secondary transition-colors"
          >
            <span className="material-symbols-outlined text-lg leading-none">close</span>
          </button>
        </div>

        {/* Main Body - Split Layout */}
        <div className="flex-1 flex overflow-hidden">

          {/* Left Sidebar: Filters */}
          <aside className="w-64 shrink-0 border-r border-slate-100 dark:border-slate-800 p-5 space-y-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">

            {/* Search */}
            <div className="space-y-2">
              <h4 className="text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-widest pl-0.5">Search Faculty</h4>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary dark:text-slate-500 group-focus-within:text-primary transition-colors text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-slate-900 dark:text-white placeholder:text-text-secondary"
                />
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <h4 className="text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-widest pl-0.5">Availability</h4>
              <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60">
                {statusOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatusFilter(opt.value)}
                    className={filterBtnClass(statusFilter === opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Expertise */}
            <div className="space-y-2">
              <h4 className="text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-widest pl-0.5">Subject Expertise</h4>
              <div className="relative">
                <select
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl py-2.5 px-4 text-sm focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-slate-900 dark:text-white appearance-none cursor-pointer"
                >
                  {specializationOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-[18px]">unfold_more</span>
              </div>
            </div>

            {/* Contract Type */}
            <div className="space-y-2">
              <h4 className="text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-widest pl-0.5">Contract Type</h4>
              <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60">
                {typeOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTypeFilter(opt.value)}
                    className={filterBtnClass(typeFilter === opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={handleResetFilters}
              className="w-full py-2.5 border border-border-light dark:border-border-dark rounded-xl text-[9px] font-black uppercase tracking-[0.18em] text-text-secondary hover:text-rose-500 hover:border-rose-300 dark:hover:border-rose-800 transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[14px] leading-none">filter_alt_off</span>
              Reset Filters
            </button>
          </aside>

          {/* Right Content: Teacher Cards Grid */}
          <main className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900 custom-scrollbar">
            {filteredTeachers.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTeachers.map((teacher) => {
                  const isSelected = tempSelected.some(st => st.teacher_id === teacher.teacher_id);

                  return (
                    <div
                      key={teacher.teacher_id}
                      className={`relative rounded-2xl cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'ring-2 ring-primary shadow-lg shadow-primary/15'
                          : 'ring-1 ring-transparent hover:ring-primary/30 hover:shadow-md'
                      }`}
                      onClick={() => toggleTeacher(teacher)}
                    >
                      {/* Read-only TeacherCard */}
                      <TeacherCard
                        teacher={teacher}
                        density="medium"
                        className="pointer-events-none"
                      />

                      {/* Selection indicator overlay */}
                      <div className={`absolute top-3 right-3 size-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 z-10 ${
                        isSelected
                          ? 'bg-primary border-primary shadow-md shadow-primary/30 scale-110'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[13px] text-white leading-none">check</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-5 border border-border-light dark:border-border-dark">
                  <span className="material-symbols-outlined text-4xl text-text-secondary dark:text-slate-500">person_off</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">No teachers found</h4>
                <p className="text-sm text-text-secondary max-w-xs mx-auto mt-2">
                  Nothing matches your search or active filters. Try resetting.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 text-xs font-bold text-primary hover:underline"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </main>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between z-10 shrink-0">
          {/* Left: selected stack + count */}
          <div className="flex items-center gap-4">
            {tempSelected.length > 0 && (
              <div className="flex -space-x-3 overflow-hidden">
                {tempSelected.slice(0, 5).map((t, i) => {
                  const displayName = t.full_name || t.teacher_name || t.name || 'Faculty';
                  return (
                    <div
                      key={i}
                      className="inline-flex size-9 rounded-full ring-2 ring-white dark:ring-slate-900 bg-primary/10 text-primary items-center justify-center font-black text-[9px] border border-primary/20 shadow-sm shrink-0"
                      title={displayName}
                    >
                      {getInitials(displayName)}
                    </div>
                  );
                })}
                {tempSelected.length > 5 && (
                  <div className="inline-flex size-9 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-100 dark:bg-slate-800 text-text-secondary items-center justify-center font-black text-[9px] border border-border-light dark:border-border-dark shrink-0">
                    +{tempSelected.length - 5}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col">
              <span className="text-[9px] font-black text-text-secondary dark:text-slate-500 uppercase tracking-widest leading-none mb-1">
                {singleSelect ? 'Assignment' : 'Faculty Selection'}
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Badge
                  variant="count"
                  color={tempSelected.length > 0 ? 'success' : 'neutral'}
                  content={tempSelected.length}
                  size="sm"
                />
                {tempSelected.length === 1 ? 'Teacher' : 'Teachers'} Selected
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 items-center">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-text-secondary dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-8 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-primary/25 active:scale-95 transition-all duration-200 flex items-center gap-2 border border-primary-dark/20"
            >
              <span className="material-symbols-outlined text-base leading-none">
                {singleSelect ? 'person_add' : 'group_add'}
              </span>
              {singleSelect ? 'Confirm Assignment' : 'Update Selection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSelectionModal;

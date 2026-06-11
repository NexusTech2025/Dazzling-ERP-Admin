import React, { useState, useMemo, useEffect } from 'react';
import SegmentedControl from '../../../../components/ui/v2/SegmentedControl';
import TextInput from '../../../../components/ui/v2/TextInput';
import SelectInput from '../../../../components/ui/v2/SelectInput';

/**
 * ProgramSelectionModal - A unified selection modal for packages, courses, and subjects.
 * Inspired by CourseSelectionModal, utilizing standard V2 inputs and dark-mode aesthetics.
 */
const ProgramSelectionModal = ({
  isOpen,
  onClose,
  onSelect,
  selectedItems = [],
  availableItems = []
}) => {
  const [tempSelected, setTempSelected] = useState([]);
  const [activeTab, setActiveTab] = useState('package');
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Sync tempSelected state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedItems || []);
    }
  }, [isOpen, selectedItems]);

  const selectionTypeOptions = [
    { label: 'Packages', value: 'package', icon: 'inventory' },
    { label: 'Courses', value: 'course', icon: 'school' },
    { label: 'Subjects', value: 'subject', icon: 'book' }
  ];

  const classOptions = [
    { label: 'All Classes', value: '' },
    ...[...Array(12)].map((_, i) => ({
      label: `Class ${i + 1}`,
      value: String(i + 1)
    }))
  ];

  // Filtering Logic
  const filteredItems = useMemo(() => {
    return availableItems.filter(item => {
      // 1. Filter by active selection tab (type)
      if (item.type !== activeTab) return false;

      // 2. Filter by search query (ID or Name)
      const name = item.name || '';
      const id = item.id || '';
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            id.toLowerCase().includes(searchQuery.toLowerCase());

      // 3. Filter by Class
      const matchesClass = !classFilter || String(item.target_class) === classFilter;

      return matchesSearch && matchesClass;
    });
  }, [availableItems, activeTab, searchQuery, classFilter]);

  if (!isOpen) return null;

  const toggleItem = (item) => {
    const isAlreadySelected = tempSelected.some(si => si.id === item.id);
    if (isAlreadySelected) {
      setTempSelected(prev => prev.filter(si => si.id !== item.id));
    } else {
      setTempSelected(prev => [...prev, item]);
    }
  };

  const handleConfirm = () => {
    onSelect(tempSelected);
    onClose();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setClassFilter('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-[calc(100%-4rem)] xl:max-w-6xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              Program Selection Catalog
            </h3>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-2">
              Select packages, standalone courses, or individual subjects to enroll the student
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Main Body - Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Sidebar: 25% Filters */}
          <aside className="w-1/4 border-r border-slate-100 dark:border-slate-800 p-6 space-y-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">
            {/* Search Section */}
            <div className="space-y-2">
              <TextInput 
                label="Search catalog"
                placeholder="ID or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon="search"
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* Class Section */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary pl-1">Grade Level</span>
              <SelectInput 
                options={classOptions} 
                value={classFilter} 
                onChange={setClassFilter} 
                placeholder="All Classes"
                variant="default"
              />
            </div>

            {/* Clear All Button */}
            <button 
              onClick={handleResetFilters}
              className="w-full py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">filter_alt_off</span>
              Reset Filters
            </button>
          </aside>

          {/* Right Content: 75% Items Grid */}
          <main className="w-3/4 overflow-y-auto p-8 bg-white dark:bg-slate-900 custom-scrollbar flex flex-col gap-6">
            {/* Tab Switched Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <SegmentedControl 
                options={selectionTypeOptions}
                value={activeTab}
                onChange={setActiveTab}
                className="w-fit"
              />
              <span className="text-xs font-bold text-slate-400">
                Showing {filteredItems.length} {activeTab === 'package' ? 'packages' : activeTab === 'course' ? 'courses' : 'subjects'}
              </span>
            </div>

            {/* Catalog Grid */}
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => {
                  const isSelected = tempSelected.some(si => si.id === item.id);
                  
                  // Color Themes based on Item Type
                  const colors = {
                    package: {
                      badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
                      iconBg: isSelected ? 'bg-purple-500 text-white' : 'bg-purple-500/10 text-purple-500',
                      icon: 'inventory_2'
                    },
                    course: {
                      badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                      iconBg: isSelected ? 'bg-blue-500 text-white' : 'bg-blue-500/10 text-blue-500',
                      icon: 'school'
                    },
                    subject: {
                      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                      iconBg: isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-500',
                      icon: 'book'
                    }
                  }[item.type];

                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item)}
                      className={`p-5 rounded-3xl border text-left transition-all flex flex-col gap-4 relative overflow-hidden group ${
                        isSelected 
                          ? 'bg-primary/5 border-primary shadow-lg ring-1 ring-primary/20' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/40 shadow-sm'
                      }`}
                    >
                      {/* Top row badge and selector */}
                      <div className="flex items-start justify-between w-full">
                        <div className={`size-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-colors ${colors.iconBg}`}>
                          <span className="material-symbols-outlined">{colors.icon}</span>
                        </div>
                        <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'bg-primary border-primary' : 'border-slate-200 dark:border-slate-700 group-hover:border-primary/50'
                        }`}>
                          {isSelected && <span className="material-symbols-outlined text-[14px] text-white font-black">check</span>}
                        </div>
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${colors.badge}`}>
                            {item.type}
                          </span>
                          {item.target_class && (
                            <span className="text-[10px] text-slate-500 font-bold">Class {item.target_class}</span>
                          )}
                        </div>
                        <p className={`text-sm font-black transition-colors leading-tight ${isSelected ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                          {item.name}
                        </p>
                        
                        {/* Description / stream */}
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 pt-1 font-medium">
                          {item.type === 'package' ? (
                            <span>Includes {(item.courses || []).length} courses: {(item.courses || []).map(c => c.name).join(', ')}</span>
                          ) : (
                            <span>{item.description}</span>
                          )}
                        </div>
                      </div>

                      {/* Pricing row */}
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto w-full">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Fee Schedule</span>
                        <p className="text-sm font-black text-slate-900 dark:text-white">₹{item.fee?.toLocaleString()}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">No items found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2">
                  We couldn't find any {activeTab}s matching your query or class filters. Try adjusting your sidebar parameters.
                </p>
              </div>
            )}
          </main>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3 overflow-hidden">
              {tempSelected.slice(0, 5).map((item, i) => (
                <div 
                  key={i} 
                  className="inline-block size-10 rounded-full ring-4 ring-white dark:ring-slate-900 bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] border border-primary/20 shadow-sm"
                  title={item.name}
                >
                  {item.name ? item.name.substring(0, 2).toUpperCase() : '??'}
                </div>
              ))}
              {tempSelected.length > 5 && (
                <div className="inline-block size-10 rounded-full ring-4 ring-white dark:ring-slate-900 bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-black text-[10px]">
                  +{tempSelected.length - 5}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                Cart Preview
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                <span className="text-primary font-black">{tempSelected.length}</span> program{tempSelected.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose} 
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              Confirm Enrollment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramSelectionModal;

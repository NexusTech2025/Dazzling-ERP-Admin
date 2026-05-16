import React, { useState, useMemo } from 'react';
import ButtonGroupFilter from '../../../components/ui/filters/ButtonGroupFilter';
import SelectGroupFilter from '../../../components/ui/filters/SelectGroupFilter';

/**
 * CourseSelectionModal - A high-fidelity modal for selecting multiple courses.
 * Features a split-pane layout with a vertical filter sidebar.
 */
const CourseSelectionModal = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  selectedCourses = [], 
  availableCourses = [] 
}) => {
  const [tempSelected, setTempSelected] = useState(selectedCourses);
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [boardFilter, setBoardFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Sync temp state when modal opens
  React.useEffect(() => {
    if (isOpen) setTempSelected(selectedCourses);
  }, [isOpen, selectedCourses]);

  // --- Filter Options ---
  const segmentOptions = [
    { label: 'All', value: '', icon: 'apps' },
    { label: 'Academic', value: 'SEG-ACA', icon: 'menu_book' },
    { label: 'Computer', value: 'SEG-CMP', icon: 'computer' },
    { label: 'Foundation', value: 'SEG-FND', icon: 'foundation' }
  ];

  const languageOptions = [
    { label: 'ALL', value: '' },
    { label: 'HINDI', value: 'Hindi' },
    { label: 'ENGLISH', value: 'English' }
  ];

  const boardOptions = [
    { label: 'ALL', value: '' },
    { label: 'CBSE', value: 'CBSE' },
    { label: 'RBSE', value: 'RBSE' },
    { label: 'ICSE', value: 'ICSE' }
  ];

  const classOptions = [...Array(12)].map((_, i) => ({
    label: `Class ${i + 1}`,
    value: String(i + 1)
  }));

  // --- Filter Logic ---
  const filteredCourses = useMemo(() => {
    return availableCourses.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.course_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSegment = !segmentFilter || c.segment_id === segmentFilter;
      const matchesBoard = !boardFilter || c.metadata?.board === boardFilter;
      const matchesClass = !classFilter || String(c.metadata?.class) === classFilter;
      const matchesLanguage = !languageFilter || c.language_medium === languageFilter;
      
      return matchesSearch && matchesSegment && matchesBoard && matchesClass && matchesLanguage;
    });
  }, [availableCourses, searchQuery, segmentFilter, boardFilter, classFilter, languageFilter]);

  if (!isOpen) return null;

  const toggleCourse = (course) => {
    const isAlreadySelected = tempSelected.find(sc => sc.course_id === course.course_id);
    if (isAlreadySelected) {
      setTempSelected(prev => prev.filter(sc => sc.course_id !== course.course_id));
    } else {
      setTempSelected(prev => [...prev, course]);
    }
  };

  const handleConfirm = () => {
    onSelect(tempSelected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-[calc(100%-4rem)] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">Course Catalog</h3>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-2">Build your package by selecting items below</p>
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
                  placeholder="ID or Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Segment Section */}
            <ButtonGroupFilter 
              label="Category"
              options={segmentOptions} 
              value={segmentFilter} 
              onChange={setSegmentFilter} 
              size="sm" 
              variant="secondary" 
            />

            {/* Medium Section */}
            <ButtonGroupFilter 
              label="Instruction Medium" 
              options={languageOptions} 
              value={languageFilter} 
              onChange={setLanguageFilter} 
              size="sm" 
              variant="secondary" 
            />

            {/* Board Section */}
            <ButtonGroupFilter 
              label="Educational Board" 
              options={boardOptions} 
              value={boardFilter} 
              onChange={setBoardFilter} 
              size="sm" 
              variant="secondary" 
            />

            {/* Class Section */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Grade Level</h4>
              <SelectGroupFilter 
                options={classOptions} 
                value={classFilter} 
                onChange={setClassFilter} 
                defaultLabel="All Classes" 
              />
            </div>

            {/* Clear All Button */}
            <button 
              onClick={() => { setSearchQuery(''); setSegmentFilter(''); setLanguageFilter(''); setBoardFilter(''); setClassFilter(''); }}
              className="w-full py-3 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">filter_alt_off</span>
              Reset Filters
            </button>
          </aside>

          {/* Right Content: 75% Course List */}
          <main className="w-3/4 overflow-y-auto p-8 bg-white dark:bg-slate-900 custom-scrollbar">
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course) => {
                  const isSelected = tempSelected.find(sc => sc.course_id === course.course_id);
                  return (
                    <button
                      key={course.course_id}
                      onClick={() => toggleCourse(course)}
                      className={`p-5 rounded-3xl border text-left transition-all flex flex-col gap-4 relative overflow-hidden group ${
                        isSelected 
                          ? 'bg-primary/5 border-primary shadow-lg ring-1 ring-primary/20' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/40 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`size-12 rounded-2xl flex flex-col items-center justify-center font-black text-[10px] transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:text-primary'}`}>
                          {course.short_code || course.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'bg-primary border-primary' : 'border-slate-200 dark:border-slate-700 group-hover:border-primary/50'
                        }`}>
                          {isSelected && <span className="material-symbols-outlined text-[14px] text-white font-black">check</span>}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <p className={`text-sm font-black transition-colors ${isSelected ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                          {course.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{course.course_id}</span>
                          <span className="size-1 rounded-full bg-slate-300"></span>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{course.language_medium}</span>
                          {course.metadata?.board && (
                            <>
                              <span className="size-1 rounded-full bg-slate-300"></span>
                              <span className="text-[9px] font-black text-primary uppercase tracking-tighter">{course.metadata.board}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing</span>
                        <p className="text-sm font-black text-slate-900 dark:text-white">${course.base_fee?.toLocaleString()}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="size-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-5xl text-slate-200">search_off</span>
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">No courses found</h4>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">We couldn't find anything matching your search query or active filters. Try resetting the sidebar.</p>
              </div>
            )}
          </main>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3 overflow-hidden">
              {tempSelected.slice(0, 5).map((c, i) => (
                <div key={i} className="inline-block size-10 rounded-full ring-4 ring-white dark:ring-slate-900 bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] border border-primary/20 shadow-sm">
                  {c.short_code?.substring(0, 2) || '??'}
                </div>
              ))}
              {tempSelected.length > 5 && (
                <div className="inline-block size-10 rounded-full ring-4 ring-white dark:ring-slate-900 bg-slate-100 text-slate-500 flex items-center justify-center font-black text-[10px]">
                  +{tempSelected.length - 5}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Bundle Configuration</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                <span className="text-primary">{tempSelected.length}</span> Courses Selected
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
            <button 
              onClick={handleConfirm}
              className="px-10 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-lg">auto_awesome_motion</span>
              Update Package Bundle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseSelectionModal;

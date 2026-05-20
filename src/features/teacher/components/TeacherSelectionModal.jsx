import React, { useState, useMemo } from 'react';
import ButtonGroupFilter from '../../../components/ui/filters/ButtonGroupFilter';
import SelectGroupFilter from '../../../components/ui/filters/SelectGroupFilter';
import Avatar from '../../../components/ui/v2/Avatar';

/**
 * TeacherSelectionModal - A high-fidelity modal for selecting faculty members.
 * Features a split-pane layout with a vertical filter sidebar.
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

  // --- Filter Options ---
  const statusOptions = [
    { label: 'All', value: '', icon: 'group' },
    { label: 'Active', value: 'active', icon: 'check_circle' },
    { label: 'Inactive', value: 'inactive', icon: 'cancel' }
  ];

  const typeOptions = [
    { label: 'All', value: '' },
    { label: 'Full-time', value: 'Full-time' },
    { label: 'Part-time', value: 'Part-time' },
    { label: 'Guest', value: 'Guest' }
  ];

  // Dynamically extract specializations
  const specializationOptions = useMemo(() => {
    const specs = new Set();
    availableTeachers.forEach(t => {
      if (t.specialization) specs.add(t.specialization);
    });
    return [
      { label: 'All Subjects', value: '' },
      ...Array.from(specs).map(s => ({ label: s, value: s }))
    ];
  }, [availableTeachers]);

  // --- Filter Logic ---
  const filteredTeachers = useMemo(() => {
    return availableTeachers.filter(t => {
      const name = t.teacher_name || '';
      const id = t.teacher_id || '';
      const email = t.email || '';
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          id.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-[calc(100%-4rem)] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {singleSelect ? 'Assign Teacher' : 'Faculty Directory'}
            </h3>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-2">
              {singleSelect ? 'Search and select an instructor for this batch' : 'Browse and select multiple faculty members'}
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
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Search Faculty</h4>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-lg">search</span>
                <input 
                  type="text"
                  placeholder="Name, ID or Email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Status Section */}
            <ButtonGroupFilter 
              label="Availability"
              options={statusOptions} 
              value={statusFilter} 
              onChange={setStatusFilter} 
              size="sm" 
              variant="secondary" 
            />

            {/* Specialization Section */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Subject Expertise</h4>
              <SelectGroupFilter 
                options={specializationOptions} 
                value={specializationFilter} 
                onChange={setSpecializationFilter} 
                defaultLabel="All Specializations" 
              />
            </div>

            {/* Teacher Type Section */}
            <ButtonGroupFilter 
              label="Contract Type" 
              options={typeOptions} 
              value={typeFilter} 
              onChange={setTypeFilter} 
              size="sm" 
              variant="secondary" 
            />

            {/* Reset Button */}
            <button 
              onClick={() => { setSearchQuery(''); setStatusFilter(''); setSpecializationFilter(''); setTypeFilter(''); }}
              className="w-full py-3 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">filter_alt_off</span>
              Reset Filters
            </button>
          </aside>

          {/* Right Content: 75% Teacher List */}
          <main className="w-3/4 overflow-y-auto p-8 bg-white dark:bg-slate-900 custom-scrollbar">
            {filteredTeachers.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTeachers.map((teacher) => {
                  const isSelected = tempSelected.find(st => st.teacher_id === teacher.teacher_id);
                  return (
                    <button
                      key={teacher.teacher_id}
                      onClick={() => toggleTeacher(teacher)}
                      className={`p-5 rounded-3xl border text-left transition-all flex flex-col gap-4 relative overflow-hidden group ${
                        isSelected 
                          ? 'bg-primary/5 border-primary shadow-lg ring-1 ring-primary/20' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/40 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <Avatar 
                          name={teacher.teacher_name} 
                          size="lg" 
                          variant={isSelected ? 'primary' : 'secondary'}
                          className="rounded-2xl"
                        />
                        <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'bg-primary border-primary' : 'border-slate-200 dark:border-slate-700 group-hover:border-primary/50'
                        }`}>
                          {isSelected && <span className="material-symbols-outlined text-[14px] text-white font-black">check</span>}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <p className={`text-sm font-black transition-colors ${isSelected ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                          {teacher.teacher_name}
                        </p>
                        <p className="text-xs text-primary font-bold mt-0.5">{teacher.specialization || 'General'}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{teacher.teacher_id}</span>
                          <span className="size-1 rounded-full bg-slate-300"></span>
                          <span className={`text-[9px] font-black uppercase tracking-tighter ${teacher.status === 'active' ? 'text-green-500' : 'text-slate-400'}`}>
                            {teacher.status}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Experience</span>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{teacher.experience_years || '0'} Years</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Designation</span>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{teacher.designation || 'Faculty'}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="size-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-5xl text-slate-200">person_off</span>
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">No teachers found</h4>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">We couldn't find any faculty members matching your search or filters.</p>
              </div>
            )}
          </main>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3 overflow-hidden">
              {tempSelected.slice(0, 5).map((t, i) => (
                <Avatar 
                  key={i} 
                  name={t.teacher_name} 
                  size="sm" 
                  className="ring-4 ring-white dark:ring-slate-900"
                />
              ))}
              {tempSelected.length > 5 && (
                <div className="inline-block size-10 rounded-full ring-4 ring-white dark:ring-slate-900 bg-slate-100 text-slate-500 flex items-center justify-center font-black text-[10px]">
                  +{tempSelected.length - 5}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                {singleSelect ? 'Assignment Confirmed' : 'Faculty Selection'}
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                <span className="text-primary">{tempSelected.length}</span> {tempSelected.length === 1 ? 'Teacher' : 'Teachers'} Selected
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
            <button 
              onClick={handleConfirm}
              className="px-10 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-lg">
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

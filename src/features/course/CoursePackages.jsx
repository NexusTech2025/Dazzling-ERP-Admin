import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCoursesQuery, useCreatePackageMutation } from './hooks/useCourseQueries';

/**
 * Create Course Package Page
 * Handles bundling multiple courses into packages with custom pricing.
 */
const CoursePackages = () => {
  const navigate = useNavigate();
  const { data: courses = [], isLoading: coursesLoading } = useCoursesQuery();
  const createMutation = useCreatePackageMutation();
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    packageId: `PKG-${Date.now().toString().slice(-6)}`,
    name: '',
    description: '',
    targetClass: 'Grade 11',
    board: 'International Baccalaureate (IB)',
    month: 12,
    packageFee: '0.00',
    recurringBilling: false
  });

  const [selectedCourses, setSelectedCourses] = useState([]);
  const [courseSearch, setCourseSearch] = useState('');
  const [showCourseDropdown, setShowDropdown] = useState(false);

  const [perks, setPerks] = useState([
    'Complementary Study Guides (PDF)',
    '2 Bonus 1-on-1 Mentorship Sessions',
    'Lifetime Access to Course Forum'
  ]);

  // Filter available courses for the dropdown
  const searchableCourses = useMemo(() => {
    if (!courseSearch) return [];
    return courses.filter(c => 
      !selectedCourses.find(sc => sc.course_id === c.course_id) &&
      (c.name.toLowerCase().includes(courseSearch.toLowerCase()) || 
       c.course_id.toLowerCase().includes(courseSearch.toLowerCase()))
    );
  }, [courses, courseSearch, selectedCourses]);

  const aggregateValue = useMemo(() => {
    return selectedCourses.reduce((sum, c) => sum + (c.base_fee || 0), 0);
  }, [selectedCourses]);

  const savingsPercent = useMemo(() => {
    const fee = parseFloat(formData.packageFee) || 0;
    if (aggregateValue === 0 || fee === 0) return 0;
    return Math.round(((aggregateValue - fee) / aggregateValue) * 100);
  }, [aggregateValue, formData.packageFee]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addCourse = (course) => {
    setSelectedCourses(prev => [...prev, course]);
    setCourseSearch('');
    setShowDropdown(false);
  };

  const removeCourse = (id) => {
    setSelectedCourses(prev => prev.filter(c => c.course_id !== id));
  };

  const handleSave = () => {
    setError(null);
    
    // Basic validation
    if (!formData.name) {
      setError('Package Name is required.');
      return;
    }
    if (selectedCourses.length === 0) {
      setError('Please select at least one course to include in the package.');
      return;
    }
    
    const packageData = { 
      ...formData,
      package_id: formData.packageId, // Map state to schema key
      package_fee: Number(formData.packageFee), // Map state to schema key
      base_fee: Number(formData.packageFee), // Fallback for UI if it expects base_fee
      discount_percent: savingsPercent,
      included_courses: selectedCourses.map(c => c.name),
      perks,
      status: 'active'
    };

    createMutation.mutate({ data: packageData }, {
      onSuccess: (res) => {
        if (res.success) {
          navigate('/admin/courses');
        } else {
          setError(res.error?.message || res.message || 'Failed to create package.');
        }
      },
      onError: (err) => {
        setError(err.message || 'An unexpected error occurred.');
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm font-medium text-text-secondary">
        <Link to="/admin/dashboard" className="hover:text-primary flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">home</span> Home
        </Link>
        <span className="text-slate-400 material-symbols-outlined text-xs">chevron_right</span>
        <Link to="/admin/courses" className="hover:text-primary">Course Management</Link>
        <span className="text-slate-400 material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-primary font-bold">Create Package</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-text-main dark:text-white tracking-tight leading-tight">Create Course Package</h1>
          <p className="text-text-secondary mt-1 font-medium italic">Bundle multiple courses together with specific pricing and duration rules.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => navigate('/admin/courses')}
            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-border-light dark:border-border-dark font-bold text-text-secondary hover:text-text-main hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={selectedCourses.length === 0 || !formData.name || createMutation.isPending}
            className="flex-1 md:flex-none px-8 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {createMutation.isPending ? (
              <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
            ) : (
              <><span className="material-symbols-outlined text-lg">save</span> Save Package</>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-2xl border border-red-100 dark:border-red-800 flex items-center gap-3 animate-in slide-in-from-top-2">
          <span className="material-symbols-outlined">error</span>
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <section className="bg-surface-light dark:bg-surface-dark p-8 rounded-2xl shadow-sm border border-border-light dark:border-border-dark relative overflow-hidden">
            {savingsPercent > 0 && (
              <div className="absolute top-0 right-0">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white rounded-bl-2xl text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                  <span className="material-symbols-outlined text-sm">timer</span> Limited Time Offer: {savingsPercent}% OFF
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2 mb-8">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">info</span>
              </div>
              <h3 className="text-lg font-bold text-text-main dark:text-white">Basic Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main dark:text-white">Package ID <span className="text-red-500">*</span></label>
                <input 
                  name="packageId"
                  value={formData.packageId}
                  onChange={handleChange}
                  readOnly
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono opacity-70" 
                  placeholder="PKG-2024-001" 
                  type="text"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main dark:text-white">Package Name <span className="text-red-500">*</span></label>
                <input 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                  placeholder="e.g. Science & Math Excellence Pack" 
                  type="text"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-bold text-text-main dark:text-white">Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none" 
                  placeholder="Enter package details and learning objectives..." 
                  rows="3"
                ></textarea>
              </div>
            </div>
          </section>

          {/* Included Courses Card */}
          <section className="bg-surface-light dark:bg-surface-dark p-8 rounded-2xl shadow-sm border border-border-light dark:border-border-dark">
            <div className="flex items-center gap-2 mb-8">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">library_books</span>
              </div>
              <h3 className="text-lg font-bold text-text-main dark:text-white">Included Courses</h3>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-text-secondary material-symbols-outlined">search</span>
                <input 
                  value={courseSearch}
                  onChange={(e) => {
                    setCourseSearch(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark/50 focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all" 
                  placeholder="Search and select existing courses..." 
                  type="text"
                />
                
                {showCourseDropdown && courseSearch && (
                  <div className="absolute z-20 top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-xl shadow-2xl max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {searchableCourses.length > 0 ? searchableCourses.map(course => (
                      <button
                        key={course.course_id}
                        onClick={() => addCourse(course)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-between border-b border-border-light last:border-0 dark:border-border-dark transition-colors"
                      >
                        <div>
                          <p className="text-sm font-bold text-text-main dark:text-white">{course.name}</p>
                          <p className="text-[10px] text-text-secondary font-black uppercase">{course.course_id} • ${course.base_fee}</p>
                        </div>
                        <span className="material-symbols-outlined text-primary text-lg">add_circle</span>
                      </button>
                    )) : (
                      <div className="p-4 text-center text-sm text-text-secondary italic">No matching courses found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Courses Tags */}
              <div className="flex flex-wrap gap-3">
                {selectedCourses.length > 0 ? selectedCourses.map(course => (
                  <span key={course.course_id} className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-xl text-sm font-bold border border-primary/10 transition-all hover:bg-primary/10 animate-in zoom-in duration-200">
                    {course.name}
                    <button 
                      onClick={() => removeCourse(course.course_id)}
                      className="material-symbols-outlined text-sm hover:text-red-500 transition-colors"
                    >
                      close
                    </button>
                  </span>
                )) : (
                  <div className="w-full py-4 text-center border border-dashed border-border-light dark:border-border-dark rounded-xl text-xs text-text-secondary italic">
                    No courses selected yet.
                  </div>
                )}
              </div>

              <div className="bg-background-light dark:bg-background-dark/50 rounded-2xl p-6 border-2 border-dashed border-border-light dark:border-border-dark text-center">
                <p className="text-sm text-text-secondary font-medium">
                  <span className="font-black text-text-main dark:text-white">{selectedCourses.length}</span> courses currently selected. Total aggregate value: <span className="font-black text-primary">${aggregateValue.toLocaleString()}</span>
                </p>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-border-light dark:border-border-dark">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-xl">featured_play_list</span>
                <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary">Package Perks & Features</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {perks.map((perk, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-background-light dark:bg-background-dark/50 border border-border-light dark:border-border-dark group transition-all hover:border-primary/20">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                      <span className="text-sm font-medium text-text-main dark:text-white">{perk}</span>
                    </div>
                    <button 
                      onClick={() => setPerks(prev => prev.filter((_, i) => i !== index))}
                      className="material-symbols-outlined text-text-secondary text-sm opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                    >
                      delete
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    const newPerk = prompt('Enter new perk title:');
                    if (newPerk) setPerks(prev => [...prev, newPerk]);
                  }}
                  className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-primary/20 text-primary text-sm font-bold hover:bg-primary/5 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">add</span> Add Perk
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Metadata & Pricing */}
        <div className="space-y-6">
          {/* Metadata & Classification */}
          <section className="bg-surface-light dark:bg-surface-dark p-8 rounded-2xl shadow-sm border border-border-light dark:border-border-dark">
            <div className="flex items-center gap-2 mb-8">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">label</span>
              </div>
              <h3 className="text-lg font-bold text-text-main dark:text-white">Classification</h3>
            </div>
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main dark:text-white">Target Class</label>
                <select 
                  name="targetClass"
                  value={formData.targetClass}
                  onChange={handleChange}
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option>Select Class</option>
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>Grade 12</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main dark:text-white">Education Board</label>
                <select 
                  name="board"
                  value={formData.board}
                  onChange={handleChange}
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option>Select Board</option>
                  <option>International Baccalaureate (IB)</option>
                  <option>Cambridge IGCSE</option>
                  <option>National Board</option>
                  <option>NCERT/CBSE/RBSE</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main dark:text-white">Duration (Months)</label>
                <input 
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                  type="number" 
                />
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="bg-primary/5 dark:bg-primary/10 p-8 rounded-2xl shadow-sm border border-primary/20">
            <div className="flex items-center gap-2 mb-8">
              <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <h3 className="text-lg font-bold text-text-main dark:text-white">Package Pricing</h3>
            </div>
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Individual Total:</span>
                  <span className="text-sm text-text-secondary line-through font-medium">${aggregateValue.toLocaleString()}</span>
                  {savingsPercent > 0 && (
                    <span className="text-[10px] font-black text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">SAVE {savingsPercent}%</span>
                  )}
                </div>
                <label className="text-sm font-bold text-text-main dark:text-white">Total Package Fee ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-primary font-black">$</span>
                  <input 
                    name="packageFee"
                    value={formData.packageFee}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark focus:ring-2 focus:ring-primary/20 outline-none text-xl font-black text-primary transition-all" 
                    placeholder="0.00" 
                    type="number" 
                    step="0.01"
                  />
                </div>
                <p className="text-[10px] text-text-secondary font-medium mt-1">Suggested discount: 15% off individual total (${(aggregateValue * 0.85).toFixed(2)})</p>
                
                <div className="mt-8 pt-8 border-t border-primary/10">
                  <label className="text-xs font-black text-text-secondary uppercase tracking-widest mb-4 block">Applicable Promo Codes</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-2.5 text-text-secondary material-symbols-outlined text-lg">confirmation_number</span>
                      <input 
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all" 
                        placeholder="e.g. EARLYBIRD20" 
                        type="text" 
                      />
                    </div>
                    <button className="px-5 py-2 bg-text-main dark:bg-slate-700 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-all active:scale-95">Add</button>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-primary/10 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-text-main dark:text-white">Recurring Billing</span>
                  <span className="text-[10px] text-text-secondary font-medium">Auto-renew package every cycle</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="recurringBilling"
                    checked={formData.recurringBilling}
                    onChange={handleChange}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Status Box */}
          <section className="bg-surface-light dark:bg-surface-dark p-8 rounded-2xl shadow-sm border border-border-light dark:border-border-dark">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-text-main dark:text-white">Publication Status</span>
                <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-lg uppercase tracking-widest border border-amber-100">Draft</span>
              </div>
              <button className="w-full py-3 bg-background-light dark:bg-background-dark/50 text-text-secondary font-bold rounded-xl text-sm hover:text-text-main hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-border-light dark:border-border-dark active:scale-95">
                Schedule Publication
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CoursePackages;

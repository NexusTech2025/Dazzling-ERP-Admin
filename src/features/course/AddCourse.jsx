import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateCourseMutation, useCourseTypesQuery, useCreateCourseTypeMutation } from './hooks/useCourseQueries';

/**
 * Add Course Page
 * Handles the registration of new subjects or skill-based courses with medium and board support.
 */
const AddCourse = () => {
  const navigate = useNavigate();
  const createMutation = useCreateCourseMutation();
  const { data: courseTypes = [], isLoading: isLoadingTypes } = useCourseTypesQuery();
  const createTypeMutation = useCreateCourseTypeMutation();
  
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    short_code: '',
    entity_type: 'subject', // 'subject' or 'course'
    language_medium: 'English',
    description: '',
    segment_id: '',
    duration_value: 12,
    duration_unit: 'months',
    class_level: '',
    min_class: '',
    max_class: '',
    board: '',
    base_fee: '',
    default_installment_count: 1,
    is_active: true
  });

  const [isCreatingType, setIsCreatingType] = useState(false);
  const [newTypeData, setNewTypeData] = useState({
    segment_name: '',
    entity_label: 'Course',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleInstallmentChange = (delta) => {
    setFormData(prev => ({
      ...prev,
      default_installment_count: Math.max(1, Math.min(12, Number(prev.default_installment_count) + delta))
    }));
  };

  const handleCreateType = async () => {
    if (!newTypeData.segment_name) return;
    
    createTypeMutation.mutate({ data: newTypeData }, {
      onSuccess: (res) => {
        if (res.success) {
          setFormData(prev => ({ ...prev, segment_id: res.data.segment_id }));
          setIsCreatingType(false);
          setNewTypeData({ segment_name: '', entity_label: 'Course', description: '' });
        }
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.name || !formData.base_fee || !formData.segment_id || !formData.short_code) {
      setError('Please fill in all required fields, including the Short Code and Category.');
      return;
    }

    if (formData.entity_type === 'subject' && !formData.board) {
      setError('Please select an Educational Board for academic subjects.');
      return;
    }

    const metadata = formData.entity_type === 'subject' 
      ? { class: formData.class_level, board: formData.board }
      : { min_class: formData.min_class, max_class: formData.max_class };

    const payload = {
      ...formData,
      course_id: `CRS-${Date.now().toString().slice(-6)}`,
      base_fee: Number(formData.base_fee),
      default_installment_count: Number(formData.default_installment_count),
      duration_value: Number(formData.duration_value),
      metadata: metadata
    };

    // Clean up temporary UI fields not in schema
    const fieldsToRemove = ['class_level', 'min_class', 'max_class', 'board'];
    fieldsToRemove.forEach(f => delete payload[f]);

    createMutation.mutate({
      data: payload
    }, {
      onSuccess: (res) => {
        if (res.success) {
          navigate('/admin/courses');
        } else {
          setError(res.error?.message || res.message || 'Failed to create item.');
        }
      },
      onError: (err) => {
        setError(err.message || 'An unexpected error occurred.');
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm font-medium text-text-secondary">
        <Link to="/admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
        <span className="mx-2 text-xs">/</span>
        <Link to="/admin/courses" className="hover:text-primary transition-colors">Courses</Link>
        <span className="mx-2 text-xs">/</span>
        <span className="text-text-main dark:text-white">Add Course</span>
      </nav>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-text-main dark:text-white tracking-tight leading-tight">
          Create New {formData.entity_type === 'subject' ? 'Academic Subject' : 'Skill Course'}
        </h1>
        <p className="text-text-secondary text-base">Define a new offering with specific board, medium, and fee structure.</p>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 p-4 rounded-2xl border border-rose-100 dark:border-rose-800 flex items-center gap-3 animate-in slide-in-from-top-2">
          <span className="material-symbols-outlined">error</span>
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
        <div className="p-8 space-y-10">
          
          {/* Entity Type & Medium Toggle Row */}
          <div className="flex flex-wrap items-end gap-8">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-text-secondary">Entity Type</label>
              <div className="flex items-center gap-2 p-1.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-2xl w-fit shadow-inner">
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, entity_type: 'subject'}))}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${formData.entity_type === 'subject' ? 'bg-white dark:bg-slate-700 text-primary shadow-md ring-1 ring-slate-200 dark:ring-slate-600' : 'text-text-secondary hover:text-text-main'}`}
                >
                  <span className="material-symbols-outlined text-lg">menu_book</span>
                  Subject
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, entity_type: 'course'}))}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${formData.entity_type === 'course' ? 'bg-white dark:bg-slate-700 text-primary shadow-md ring-1 ring-slate-200 dark:ring-slate-600' : 'text-text-secondary hover:text-text-main'}`}
                >
                  <span className="material-symbols-outlined text-lg">psychology</span>
                  Course
                </button>
              </div>
            </div>

            <div className="space-y-4 flex-1 max-w-xs">
              <label className="text-xs font-black uppercase tracking-widest text-text-secondary">Language Medium</label>
              <select 
                name="language_medium"
                value={formData.language_medium}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer font-bold"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Urdu">Urdu</option>
              </select>
            </div>
          </div>

          {/* Identity Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-3 border-b border-border-light dark:border-border-dark pb-2">
              <h3 className="text-lg font-bold text-text-main dark:text-white">Basic Information</h3>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-text-main dark:text-white">Name <span className="text-red-500">*</span></label>
              <input 
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                placeholder={formData.entity_type === 'subject' ? "e.g. Mathematics 10 (CBSE)" : "e.g. Graphic Design Basics"}
              />
            </div>

            <div className="md:col-span-1 space-y-2">
              <label className="text-sm font-bold text-text-main dark:text-white">Short Code <span className="text-red-500">*</span></label>
              <input 
                required
                name="short_code"
                value={formData.short_code}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono uppercase"
                placeholder="e.g. MAT10-C"
              />
            </div>

            <div className="md:col-span-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-text-main dark:text-white">Segment / Category <span className="text-red-500">*</span></label>
                <button 
                  type="button" 
                  onClick={() => setIsCreatingType(!isCreatingType)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">{isCreatingType ? 'list' : 'add'}</span>
                  {isCreatingType ? 'Select Existing' : 'Create New'}
                </button>
              </div>

              {isCreatingType ? (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-black text-text-secondary uppercase">Category Name</label>
                      <input 
                        value={newTypeData.segment_name}
                        onChange={(e) => setNewTypeData({...newTypeData, segment_name: e.target.value})}
                        className="w-full bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg py-2 px-3 text-sm outline-none"
                        placeholder="e.g. Summer Special"
                      />
                    </div>
                    <div className="w-1/3 space-y-1">
                      <label className="text-[10px] font-black text-text-secondary uppercase">Label</label>
                      <select 
                        value={newTypeData.entity_label}
                        onChange={(e) => setNewTypeData({...newTypeData, entity_label: e.target.value})}
                        className="w-full bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg py-2 px-3 text-sm outline-none"
                      >
                        <option value="Course">Course</option>
                        <option value="Subject">Subject</option>
                        <option value="Program">Program</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="button"
                      onClick={handleCreateType}
                      disabled={createTypeMutation.isPending || !newTypeData.segment_name}
                      className="px-4 py-2 bg-text-main dark:bg-white text-white dark:text-text-main text-xs font-bold rounded-lg shadow-sm flex items-center gap-2"
                    >
                      {createTypeMutation.isPending ? 'Creating...' : 'Save & Select'}
                    </button>
                  </div>
                </div>
              ) : (
                <select 
                  required
                  name="segment_id"
                  value={formData.segment_id}
                  onChange={handleChange}
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-sm outline-none cursor-pointer"
                >
                  <option value="">{isLoadingTypes ? 'Loading...' : 'Select a Category'}</option>
                  {courseTypes.map(type => (
                    <option key={type.segment_id} value={type.segment_id}>
                      {type.segment_name} ({type.entity_label})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Dynamic Classification Section */}
          <div className="pt-8 border-t border-border-light dark:border-border-dark grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold text-text-main dark:text-white mb-1">
                {formData.entity_type === 'subject' ? 'Board & Class Mapping' : 'Eligibility & Range'}
              </h3>
              <p className="text-sm text-text-secondary">Define target audience and fee discriminator.</p>
            </div>

            {formData.entity_type === 'subject' ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-main dark:text-white">Educational Board <span className="text-red-500">*</span></label>
                  <select 
                    required
                    name="board"
                    value={formData.board}
                    onChange={handleChange}
                    className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-sm outline-none font-bold"
                  >
                    <option value="">Select Board</option>
                    <option value="CBSE">CBSE</option>
                    <option value="RBSE">RBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="IB">IB</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-main dark:text-white">Target Class</label>
                  <select 
                    name="class_level"
                    value={formData.class_level}
                    onChange={handleChange}
                    className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-sm outline-none"
                  >
                    <option value="">Select Class</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>Class {i+1}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-main dark:text-white">Min Class Eligibility</label>
                  <select 
                    name="min_class"
                    value={formData.min_class}
                    onChange={handleChange}
                    className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-sm outline-none"
                  >
                    <option value="">No Minimum</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>Class {i+1}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-main dark:text-white">Max Class Eligibility</label>
                  <select 
                    name="max_class"
                    value={formData.max_class}
                    onChange={handleChange}
                    className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-sm outline-none"
                  >
                    <option value="">No Maximum</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>Class {i+1}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Duration & Pricing */}
          <div className="pt-8 border-t border-border-light dark:border-border-dark grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold text-text-main dark:text-white mb-1">Duration & Pricing</h3>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main dark:text-white">Duration</label>
              <div className="flex items-center bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all h-12">
                <input 
                  type="number"
                  name="duration_value"
                  value={formData.duration_value}
                  onChange={handleChange}
                  className="flex-1 bg-transparent border-none py-3 px-4 text-sm outline-none"
                />
                <div className="w-px h-6 bg-border-light dark:bg-border-dark"></div>
                <select 
                  name="duration_unit"
                  value={formData.duration_unit}
                  onChange={handleChange}
                  className="w-32 bg-transparent border-none py-3 px-2 text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="months">Months</option>
                  <option value="weeks">Weeks</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main dark:text-white">Base Fee ($) <span className="text-red-500">*</span></label>
              <input 
                required
                type="number"
                name="base_fee"
                value={formData.base_fee}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-sm outline-none font-black text-primary h-12"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3 border-t border-border-light dark:border-border-dark">
          <button 
            type="button"
            onClick={() => navigate('/admin/courses')}
            className="px-6 py-2.5 text-sm font-bold text-text-secondary hover:text-text-main transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={createMutation.isPending}
            className="px-8 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
          >
            {createMutation.isPending ? (
              <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
            ) : 'Save Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCourse;

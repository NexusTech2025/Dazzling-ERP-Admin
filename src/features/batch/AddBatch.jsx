import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useCreateBatchMutation, useUpdateBatchMutation, useBatchDetailQuery } from './hooks/useBatchQueries';
import { useCoursesQuery } from '../course/hooks/useCourseQueries';
import { useTeachersQuery } from '../teacher/hooks/useTeacherQueries';

const AddBatch = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  const createMutation = useCreateBatchMutation();
  const updateMutation = useUpdateBatchMutation();
  const { data: batchToEdit, isLoading: isBatchLoading } = useBatchDetailQuery(id);
  const { data: courses = [] } = useCoursesQuery({ status: 'Active' });
  const { data: teachers = [] } = useTeachersQuery({ status: 'active' });

  const [formData, setFormData] = useState({
    batch_name: '',
    branch_id: 'BR-001', // Default
    item_id: '',
    teacher_id: '',
    capacity: 30,
    start_date: '',
    end_date: '',
    schedule_json: {
      days_of_week: ['Mon', 'Wed', 'Fri'],
      start_time: '09:00',
      end_time: '11:00'
    }
  });

  useEffect(() => {
    if (isEditMode && batchToEdit) {
      setFormData({
        batch_name: batchToEdit.batch_name || '',
        branch_id: batchToEdit.branch_id || 'BR-001',
        item_id: batchToEdit.item_id || '',
        teacher_id: batchToEdit.teacher_id || '',
        capacity: batchToEdit.capacity || 30,
        start_date: batchToEdit.start_date || '',
        end_date: batchToEdit.end_date || '',
        schedule_json: batchToEdit.schedule_json || {
          days_of_week: ['Mon', 'Wed', 'Fri'],
          start_time: '09:00',
          end_time: '11:00'
        }
      });
    }
  }, [isEditMode, batchToEdit]);

  const handleDayToggle = (day) => {
    setFormData(prev => {
      const days = [...prev.schedule_json.days_of_week];
      if (days.includes(day)) {
        return { ...prev, schedule_json: { ...prev.schedule_json, days_of_week: days.filter(d => d !== day) } };
      } else {
        return { ...prev, schedule_json: { ...prev.schedule_json, days_of_week: [...days, day] } };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      updateMutation.mutate({ id, data: formData }, {
        onSuccess: () => navigate('/admin/batches')
      });
    } else {
      createMutation.mutate({ data: formData }, {
        onSuccess: () => navigate('/admin/batches')
      });
    }
  };

  if (isEditMode && isBatchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-text-secondary font-medium mb-2">
          <Link to="/admin/batches" className="hover:text-primary transition-colors">Batches</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-text-main dark:text-white">{isEditMode ? 'Edit Batch' : 'New Batch'}</span>
        </nav>
        <h2 className="text-3xl font-bold text-text-main dark:text-white">{isEditMode ? 'Update Batch' : 'Create Batch'}</h2>
        <p className="text-text-secondary mt-1">Configure {isEditMode ? 'existing' : 'a new'} batch for your institute</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
        <div className="p-8 space-y-8">
          
          {/* Basic Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-border-light dark:border-border-dark pb-2">
              <span className="material-symbols-outlined text-primary">info</span>
              <h3 className="text-lg font-semibold text-text-main dark:text-white">Basic Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">Course <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={formData.item_id}
                  onChange={e => setFormData({...formData, item_id: e.target.value})}
                  className="w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary h-12 px-4 transition-colors"
                >
                  <option value="" disabled>Select Course</option>
                  {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.item_name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">Batch Name <span className="text-red-500">*</span></label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. JEE Alpha 2024"
                  value={formData.batch_name}
                  onChange={e => setFormData({...formData, batch_name: e.target.value})}
                  className="w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary h-12 px-4 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-text-secondary">Primary Teacher</label>
                <select 
                  value={formData.teacher_id}
                  onChange={e => setFormData({...formData, teacher_id: e.target.value})}
                  className="w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary h-12 px-4 transition-colors"
                >
                  <option value="">Assign Teacher</option>
                  {teachers.map(t => <option key={t.teacher_id} value={t.teacher_id}>{t.teacher_name} ({t.specialization})</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-border-light dark:border-border-dark pb-2">
              <span className="material-symbols-outlined text-primary">calendar_month</span>
              <h3 className="text-lg font-semibold text-text-main dark:text-white">Schedule & Capacity</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">Student Capacity</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">group</span>
                  <input 
                    type="number"
                    min="1" max="500"
                    value={formData.capacity}
                    onChange={e => setFormData({...formData, capacity: Number(e.target.value)})}
                    className="w-full pl-10 pr-4 rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary h-12 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">Start Date</label>
                <input 
                  type="date"
                  value={formData.start_date}
                  onChange={e => setFormData({...formData, start_date: e.target.value})}
                  className="w-full px-4 rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary h-12 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">End Date</label>
                <input 
                  type="date"
                  value={formData.end_date}
                  onChange={e => setFormData({...formData, end_date: e.target.value})}
                  className="w-full px-4 rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary h-12 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <label className="text-sm font-medium text-text-secondary">Batch Schedule (Days)</label>
              <div className="flex flex-wrap gap-3">
                {daysOfWeek.map(day => {
                  const isSelected = formData.schedule_json.days_of_week.includes(day);
                  return (
                    <label key={day} className="cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={isSelected}
                        onChange={() => handleDayToggle(day)}
                      />
                      <div className={`px-4 py-2 rounded-full border text-sm font-medium transition-all shadow-sm ${
                        isSelected 
                          ? 'bg-primary/10 text-primary border-primary' 
                          : 'border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-secondary hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}>
                        {day}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">Start Time</label>
                <input 
                  type="time"
                  value={formData.schedule_json.start_time}
                  onChange={e => setFormData({...formData, schedule_json: {...formData.schedule_json, start_time: e.target.value}})}
                  className="w-full px-4 rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary h-12 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">End Time</label>
                <input 
                  type="time"
                  value={formData.schedule_json.end_time}
                  onChange={e => setFormData({...formData, schedule_json: {...formData.schedule_json, end_time: e.target.value}})}
                  className="w-full px-4 rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary h-12 transition-colors"
                />
              </div>
            </div>

          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-border-light dark:border-border-dark flex justify-end gap-3">
          <button 
            type="button" 
            onClick={() => navigate('/admin/batches')}
            className="px-5 py-2.5 rounded-lg border border-border-light dark:border-border-dark text-text-secondary font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {(createMutation.isPending || updateMutation.isPending) ? (
              <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <span className="material-symbols-outlined text-sm">save</span>
            )}
            {isEditMode ? 'Update Batch' : 'Save Batch'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBatch;

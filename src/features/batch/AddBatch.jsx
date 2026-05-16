import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useCreateBatchMutation, useUpdateBatchMutation, useBatchDetailQuery } from './hooks/useBatchQueries';
import { useCoursesQuery } from '../course/hooks/useCourseQueries';
import { useTeachersQuery } from '../teacher/hooks/useTeacherQueries';
import ButtonGroupFilter from '../../components/ui/filters/ButtonGroupFilter';
import FormSection from '../../components/ui/v2/FormSection';
import FormField from '../../components/ui/v2/FormField';
import SelectInput from '../../components/ui/v2/SelectInput';
import TextInput from '../../components/ui/v2/TextInput';
import DateInput from '../../components/ui/v2/DateInput';
import BaseInput from '../../components/ui/v2/BaseInput';

const AddBatch = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  const createMutation = useCreateBatchMutation();
  const updateMutation = useUpdateBatchMutation();
  const { data: batchToEdit, isLoading: isBatchLoading } = useBatchDetailQuery(id);
  
  // Fetch unfiltered lists to leverage the instant hydration cache, then filter locally
  const { data: allCourses = [] } = useCoursesQuery();
  const { data: allTeachers = [] } = useTeachersQuery();

  const courses = allCourses.filter(c => c.status?.toLowerCase() === 'active');
  const teachers = allTeachers.filter(t => t.status?.toLowerCase() === 'active');

  const [formData, setFormData] = useState({
    batch_name: '',
    branch_id: 'BR-001', // Default
    course_id: '',
    teacher_id: '',
    batch_type: 'Academy',
    status: 'active',
    capacity: 30,
    start_date: '',
    end_date: '',
    schedule: {
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
        course_id: batchToEdit.course_id || '',
        teacher_id: batchToEdit.teacher_id || '',
        batch_type: batchToEdit.batch_type || 'Academy',
        status: batchToEdit.status || 'active',
        capacity: batchToEdit.capacity || 30,
        start_date: batchToEdit.start_date || '',
        end_date: batchToEdit.end_date || '',
        schedule: batchToEdit.schedule
      });
    }
  }, [isEditMode, batchToEdit]);

  const handleDayToggle = (day) => {
    setFormData(prev => {
      const days = [...prev.schedule.days_of_week];
      if (days.includes(day)) {
        return { ...prev, schedule: { ...prev.schedule, days_of_week: days.filter(d => d !== day) } };
      } else {
        return { ...prev, schedule: { ...prev.schedule, days_of_week: [...days, day] } };
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
          <FormSection title="Basic Details" icon="info">
            <FormField label="Course" required>
              <SelectInput
                value={formData.course_id}
                onChange={val => setFormData({...formData, course_id: val})}
                options={courses.map(c => ({ label: c.name, value: c.course_id }))}
                placeholder="Select Course"
              />
            </FormField>

            <TextInput
              label="Batch Name"
              required
              placeholder="e.g. JEE Alpha 2024"
              value={formData.batch_name}
              onChange={e => setFormData({...formData, batch_name: e.target.value})}
            />

            <FormField label="Batch Type" className="md:col-span-2">
              <ButtonGroupFilter
                options={[
                  { label: 'Academy', value: 'Academy' },
                  { label: 'Computer', value: 'Computer' },
                  { label: 'Foundation', value: 'Foundation' },
                  { label: 'Competitive', value: 'Competitive' },
                ]}
                value={formData.batch_type}
                onChange={(val) => setFormData(prev => ({ ...prev, batch_type: val }))}
                size="md"
                variant="secondary"
              />
            </FormField>

            <SelectInput
              label="Primary Teacher"
              value={formData.teacher_id}
              onChange={val => setFormData({...formData, teacher_id: val})}
              options={teachers.map(t => ({ label: `${t.teacher_name} (${t.specialization})`, value: t.teacher_id }))}
              placeholder="Assign Teacher"
            />

            <SelectInput
              label="Status"
              value={formData.status}
              onChange={val => setFormData({...formData, status: val})}
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Completed', value: 'completed' },
                { label: 'Cancelled', value: 'cancelled' }
              ]}
            />
          </FormSection>

          {/* Schedule Section */}
          <FormSection title="Schedule & Capacity" icon="calendar_month">
            <BaseInput
              label="Student Capacity"
              leftIcon="group"
              type="number"
              min="1" max="500"
              value={formData.capacity}
              onChange={e => setFormData({...formData, capacity: Number(e.target.value)})}
            />

            <DateInput
              label="Start Date"
              value={formData.start_date}
              onChange={e => setFormData({...formData, start_date: e.target.value})}
            />

            <DateInput
              label="End Date"
              value={formData.end_date}
              onChange={e => setFormData({...formData, end_date: e.target.value})}
            />

            <FormField label="Batch Schedule (Days)" className="md:col-span-2">
              <div className="flex flex-wrap gap-3">
                {daysOfWeek.map(day => {
                  const isSelected = formData.schedule.days_of_week.includes(day);
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
            </FormField>

            <BaseInput
              label="Start Time"
              type="time"
              value={formData.schedule.start_time}
              onChange={e => setFormData({...formData, schedule: {...formData.schedule, start_time: e.target.value}})}
            />
            <BaseInput
              label="End Time"
              type="time"
              value={formData.schedule.end_time}
              onChange={e => setFormData({...formData, schedule: {...formData.schedule, end_time: e.target.value}})}
            />
          </FormSection>
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

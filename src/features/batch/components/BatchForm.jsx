import React, { useState, useEffect } from 'react';
import { useCoursesQuery } from '../../course/hooks/useCourseQueries';
import { useTeachersQuery } from '../../teacher/hooks/useTeacherQueries';
import { useBranchesQuery } from '../../core/hooks/useBranchQueries';
import CourseSelectionModal from '../../course/components/CourseSelectionModal';
import TeacherSelectionModal from '../../teacher/components/TeacherSelectionModal';
import ButtonGroupFilter from '../../../components/ui/filters/ButtonGroupFilter';
import FormSection from '../../../components/ui/v2/FormSection';
import FormField from '../../../components/ui/v2/FormField';
import SelectInput from '../../../components/ui/v2/SelectInput';
import TextInput from '../../../components/ui/v2/TextInput';
import DateInput from '../../../components/ui/v2/DateInput';
import BaseInput from '../../../components/ui/v2/BaseInput';
import Avatar from '../../../components/ui/v2/Avatar';

const DEFAULT_FORM_DATA = {
  batch_name: '',
  branch_id: '', // Default empty to force user selection
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
};

const formatToInputDate = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
};

const BatchForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  isSubmitting = false, 
  error = null 
}) => {
  // Fetch unfiltered lists to leverage the instant hydration cache
  const { data: allCourses = [] } = useCoursesQuery();
  const { data: allTeachers = [] } = useTeachersQuery();
  const { data: branches = [] } = useBranchesQuery();

  const activeBranches = React.useMemo(() => {
    return branches.filter(b => b.status === 'active');
  }, [branches]);

  const branchOptions = React.useMemo(() => {
    return activeBranches.map(b => ({
      label: b.branch_name,
      value: b.branch_id
    }));
  }, [activeBranches]);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [localError, setLocalError] = useState(null);

  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

  // Initialize and synchronize initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData({
        batch_name: initialData.batch_name || '',
        branch_id: initialData.branch_id || '',
        course_id: initialData.course_id || '',
        teacher_id: initialData.teacher_id || '',
        batch_type: initialData.batch_type || 'Academy',
        status: initialData.status || 'active',
        capacity: initialData.capacity || 30,
        start_date: formatToInputDate(initialData.start_date),
        end_date: formatToInputDate(initialData.end_date),
        schedule: {
          days_of_week: Array.isArray(initialData.schedule?.days_of_week) 
            ? initialData.schedule.days_of_week 
            : ['Mon', 'Wed', 'Fri'],
          start_time: initialData.schedule?.start_time || '09:00',
          end_time: initialData.schedule?.end_time || '11:00'
        }
      });
    } else {
      setFormData(DEFAULT_FORM_DATA);
    }
  }, [initialData]);

  // Resolve current selection names for UI
  const selectedCourse = allCourses.find(c => c.course_id === formData.course_id);
  const selectedTeacher = allTeachers.find(t => t.teacher_id === formData.teacher_id);

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

  const validateForm = () => {
    if (!formData.course_id) return "Course selection is required.";
    if (!formData.branch_id) return "Branch selection is required.";
    if (!formData.batch_name.trim()) return "Batch name is required.";
    if (formData.batch_name.length > 255) {
      return "Batch name cannot exceed 255 characters.";
    }
    if (!formData.start_date) return "Start date is required.";
    if (!formData.end_date) return "End date is required.";
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      return "Start date cannot be after end date.";
    }
    if (!formData.schedule?.days_of_week || formData.schedule.days_of_week.length === 0) {
      return "Please select at least one day for the batch schedule.";
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);

    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    onSubmit(formData);
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const displayError = error || localError;

  return (
    <div className="max-w-7xl mx-auto pb-10">
      {displayError && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-lg border border-red-100 dark:border-red-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined">error</span>
          <span className="text-sm font-bold">{displayError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark">
        <div className="p-6 md:p-8 grid grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Basic Details */}
          <FormSection title="Basic Details" icon="info" className="col-span-12 lg:col-span-7">
            <FormField label="Course Selection" required className="md:col-span-2">
              <button 
                type="button"
                onClick={() => setIsCourseModalOpen(true)}
                className="w-full text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/50 transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`size-12 rounded-xl flex items-center justify-center font-black text-xs ${selectedCourse ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                    {selectedCourse?.short_code || (selectedCourse?.name ? selectedCourse.name.substring(0,2).toUpperCase() : <span className="material-symbols-outlined">menu_book</span>)}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${selectedCourse ? 'text-text-main dark:text-white' : 'text-text-secondary'}`}>
                      {selectedCourse?.name || 'Assign Course to Batch'}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                      {selectedCourse ? `ID: ${selectedCourse.course_id} • ${selectedCourse.language_medium}` : 'Click to browse course catalog'}
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">edit_square</span>
              </button>
            </FormField>

            <TextInput
              label="Batch Name"
              required
              maxLength={255}
              placeholder="e.g. JEE Alpha 2024"
              value={formData.batch_name}
              onChange={e => setFormData({...formData, batch_name: e.target.value})}
            />

            <SelectInput
              label={<>Assigned Branch <span className="text-red-500 ml-0.5">*</span></>}
              placeholder="Select branch..."
              value={formData.branch_id}
              onChange={val => setFormData({...formData, branch_id: val})}
              options={branchOptions}
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

            <FormField label="Faculty Assignment" className="md:col-span-2">
              <button 
                type="button"
                onClick={() => setIsTeacherModalOpen(true)}
                className="w-full text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/50 transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {selectedTeacher ? (
                    <Avatar name={selectedTeacher.teacher_name} size="md" className="rounded-xl" />
                  ) : (
                    <div className="size-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined">person_add</span>
                    </div>
                  )}
                  <div>
                    <p className={`text-sm font-bold ${selectedTeacher ? 'text-text-main dark:text-white' : 'text-text-secondary'}`}>
                      {selectedTeacher?.teacher_name || 'Assign Primary Instructor'}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                      {selectedTeacher ? `${selectedTeacher.specialization || 'General Faculty'} • ID: ${selectedTeacher.teacher_id}` : 'Click to select from faculty directory'}
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">person_search</span>
              </button>
            </FormField>
          </FormSection>

          {/* Schedule Section */}
          <FormSection title="Schedule & Capacity" icon="calendar_month" className="col-span-12 lg:col-span-5">
            <BaseInput
              label="Student Capacity"
              leftIcon="group"
              type="number"
              min="1" max="500"
              value={formData.capacity}
              onChange={e => setFormData({...formData, capacity: Number(e.target.value)})}
            />

            <SelectInput
              label="Operational Status"
              value={formData.status}
              onChange={val => setFormData({...formData, status: val})}
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Completed', value: 'completed' },
                { label: 'Cancelled', value: 'cancelled' }
              ]}
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
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border border-border-light dark:border-border-dark text-text-secondary font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <span className="material-symbols-outlined text-sm">save</span>
            )}
            Save Batch
          </button>
        </div>
      </form>

      {/* Modals */}
      <CourseSelectionModal 
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        availableCourses={allCourses}
        selectedCourses={selectedCourse ? [selectedCourse] : []}
        onSelect={(course) => setFormData(prev => ({ ...prev, course_id: course?.course_id || '' }))}
        singleSelect={true}
      />

      <TeacherSelectionModal 
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        availableTeachers={allTeachers}
        selectedTeacher={selectedTeacher}
        onSelect={(teacher) => setFormData(prev => ({ ...prev, teacher_id: teacher?.teacher_id || '' }))}
        singleSelect={true}
      />
    </div>
  );
};

export default BatchForm;

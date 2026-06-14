import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { LowDensityCard } from '../../../components/ui/v2/cards';
import { Tag } from '../../../components/ui/v2/indicators';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import MainLayout from '../../../components/layout/MainLayout';

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

  const isEditMode = !!initialData;
  const [isSticky, setIsSticky] = useState(false);

  const handleBodyScroll = (e) => {
    const shouldBeSticky = e.currentTarget.scrollTop > 80;
    setIsSticky(prev => {
      if (prev !== shouldBeSticky) return shouldBeSticky;
      return prev;
    });
  };

  const crumbs = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'home' },
    { label: 'Batches', path: '/admin/batches' },
    { label: isEditMode ? 'Edit Batch' : 'New Batch' }
  ];

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
    <MainLayout
      onBodyScroll={handleBodyScroll}
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
              <span className="material-symbols-outlined text-primary text-lg">calendar_month</span>
              <span className="text-sm font-bold text-text-main dark:text-white">
                {isEditMode ? 'Update Batch' : 'Create Batch'}
              </span>
              {formData.batch_name && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-xs text-text-secondary dark:text-slate-400 font-semibold truncate max-w-[200px]">
                    {formData.batch_name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      }
      body={
        <div className="pt-6 lg:pt-10 pb-6">
          {/* Dynamic Breadcrumbs */}
          <Breadcrumbs items={crumbs} className="mb-4" />

          <div className="flex flex-col gap-1 mb-8">
            <h1 className="text-3xl font-black text-text-main dark:text-white tracking-tight leading-tight">
              {isEditMode ? 'Update Batch' : 'Create Batch'}
            </h1>
            <p className="text-text-secondary text-base">
              {isEditMode 
                ? 'Configure existing batch details and scheduling parameters.' 
                : 'Configure a new batch for your institute, assign branches, faculty and define scheduling.'
              }
            </p>
          </div>

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
                  <LowDensityCard
                    icon={selectedCourse ? undefined : 'menu_book'}
                    avatarText={
                      selectedCourse
                        ? (selectedCourse.short_code || selectedCourse.name?.substring(0, 2).toUpperCase())
                        : undefined
                    }
                    title={selectedCourse?.name || 'Assign Course to Batch'}
                    subtitle1={
                      selectedCourse
                        ? selectedCourse.course_id
                        : 'No course selected — click Change to browse'
                    }
                    subtitle2={
                      selectedCourse
                        ? [selectedCourse.language_medium, selectedCourse.segment_name].filter(Boolean).join(' • ')
                        : undefined
                    }
                    bodyText={
                      selectedCourse && (selectedCourse.metadata?.class || selectedCourse.metadata?.board)
                        ? (
                            <div className="flex flex-wrap gap-1">
                              {selectedCourse.metadata?.class && (
                                <Tag label={`Class ${selectedCourse.metadata.class}`} variant="subtle" color="primary" size="sm" />
                              )}
                              {selectedCourse.metadata?.board && (
                                <Tag label={selectedCourse.metadata.board} variant="subtle" color="warning" size="sm" />
                              )}
                            </div>
                          )
                        : undefined
                    }
                    actions={[{
                      label: selectedCourse ? 'Change' : 'Browse Catalog',
                      icon: 'edit_square',
                      priority: 'primary',
                      onClick: () => setIsCourseModalOpen(true)
                    }]}
                  />
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
                  <LowDensityCard
                    avatar={selectedTeacher?.profile_photo_url || undefined}
                    icon={selectedTeacher ? undefined : 'person'}
                    avatarText={
                      selectedTeacher
                        ? (selectedTeacher.full_name || selectedTeacher.teacher_name || selectedTeacher.name)
                            ?.split(' ')
                            .map(w => w[0])
                            .join('')
                            .substring(0, 2)
                            .toUpperCase()
                        : undefined
                    }
                    title={selectedTeacher ? (selectedTeacher.full_name || selectedTeacher.teacher_name || selectedTeacher.name) : 'Assign Primary Instructor'}
                    subtitle1={
                      selectedTeacher
                        ? (selectedTeacher.experience_years
                            ? `${selectedTeacher.experience_years} yrs experience`
                            : 'General Faculty')
                        : 'No teacher selected \u2014 click Change to browse'
                    }
                    subtitle2={
                      selectedTeacher
                        ? (selectedTeacher.qualification || undefined)
                        : undefined
                    }
                    bodyText={
                      selectedTeacher && (selectedTeacher.specialization || selectedTeacher.qualification)
                        ? (
                            <div className="flex flex-wrap gap-1">
                              {selectedTeacher.specialization && (
                                <Tag label={selectedTeacher.specialization} variant="subtle" color="primary" size="sm" />
                              )}
                              {selectedTeacher.qualification && (
                                <Tag label={selectedTeacher.qualification} variant="subtle" color="warning" size="sm" />
                              )}
                            </div>
                          )
                        : undefined
                    }
                    actions={[{
                      label: selectedTeacher ? 'Change' : 'Browse Faculty',
                      icon: 'person_search',
                      priority: 'primary',
                      onClick: () => setIsTeacherModalOpen(true)
                    }]}
                  />
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
      }
      footer={
        <footer className="border border-border-light dark:border-border-dark bg-white dark:bg-slate-900 shadow-lg px-4 lg:px-6 py-3 flex items-center justify-between gap-4 rounded-xl w-full">
          <div className="flex items-center justify-start w-1/2 md:w-auto">
            <button 
              type="button" 
              onClick={onCancel}
              className="px-5 py-2.5 rounded-lg border border-border-light dark:border-border-dark text-text-secondary font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              Cancel
            </button>
          </div>
          <div className="flex justify-end w-1/2 md:w-auto ml-auto">
            <button 
              type="submit" 
              disabled={isSubmitting}
              onClick={handleSubmit}
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
        </footer>
      }
    />
  );
};

export default BatchForm;

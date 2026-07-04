import React, { useState, useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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
  branch_id: '', 
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

// Yup Schema Validation Contract
const batchFormSchema = yup.object().shape({
  batch_name: yup.string().trim().required("Batch name is required.").max(255, "Batch name cannot exceed 255 characters."),
  branch_id: yup.string().required("Branch selection is required."),
  course_id: yup.string().required("Course selection is required."),
  teacher_id: yup.string().nullable(),
  batch_type: yup.string().required(),
  status: yup.string().required(),
  capacity: yup.number().typeError("Capacity must be a number").min(1, "Capacity must be at least 1").required("Capacity is required."),
  start_date: yup.string().required("Start date is required."),
  end_date: yup.string().required("End date is required.")
    .test('date-compare', 'Start date cannot be after end date.', function(end_date) {
      const { start_date } = this.parent;
      if (!start_date || !end_date) return true;
      return new Date(start_date) <= new Date(end_date);
    }),
  schedule: yup.object().shape({
    days_of_week: yup.array().of(yup.string()).min(1, "Please select at least one day for the batch schedule."),
    start_time: yup.string().required("Start time is required."),
    end_time: yup.string().required("End time is required.")
  })
});

// Isolated sub-component to prevent parent re-renders on every batch name keystroke
const HeaderBatchName = ({ control }) => {
  const batchName = useWatch({
    control,
    name: 'batch_name',
    defaultValue: ''
  });
  if (!batchName) return null;
  return (
    <>
      <span className="text-slate-300 dark:text-slate-700">•</span>
      <span className="text-xs text-text-secondary dark:text-slate-400 font-semibold truncate max-w-[200px]">
        {batchName}
      </span>
    </>
  );
};

const BatchForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  isSubmitting = false, 
  error = null 
}) => {
  // Fetch lists from cache
  const { data: allCourses = [] } = useCoursesQuery();
  const { data: allTeachers = [] } = useTeachersQuery();
  const { data: branches = [] } = useBranchesQuery();

  // Initialize React Hook Form with Yup resolver
  const {
    control,
    register,
    handleSubmit: handleFormSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(batchFormSchema),
    defaultValues: DEFAULT_FORM_DATA,
    mode: 'onTouched'
  });

  // Watch selection variables to dynamically render low density cards when selected
  const watchedCourseId = watch('course_id');
  const watchedTeacherId = watch('teacher_id');

  // Optimized memoized transformations
  const branchOptions = React.useMemo(() => {
    return branches
      .filter(b => b.status === 'active')
      .map(b => ({
        label: b.branch_name,
        value: b.branch_id
      }));
  }, [branches]);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const isEditMode = !!initialData;

  const handleBodyScroll = (e) => {
    const shouldBeSticky = e.currentTarget.scrollTop > 80;
    setIsSticky(prev => (prev !== shouldBeSticky ? shouldBeSticky : prev));
  };

  const crumbs = React.useMemo(() => [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'home' },
    { label: 'Batches', path: '/admin/batches' },
    { label: isEditMode ? 'Edit Batch' : 'New Batch' }
  ], [isEditMode]);

  // Synchronize and initialize form data on initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
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
      reset(DEFAULT_FORM_DATA);
    }
  }, [initialData, reset]);

  // Resolve selection data mappings
  const selectedCourse = React.useMemo(() => 
    allCourses.find(c => c.course_id === watchedCourseId), 
    [allCourses, watchedCourseId]
  );

  const selectedTeacher = React.useMemo(() => 
    allTeachers.find(t => t.teacher_id === watchedTeacherId), 
    [allTeachers, watchedTeacherId]
  );

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <MainLayout
      onBodyScroll={handleBodyScroll}
      header={
        <div className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${isSticky ? 'opacity-100 translate-y-0 shadow-md pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          <div className="bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 lg:px-6 py-3 flex items-center justify-between rounded-b-xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">calendar_month</span>
              <span className="text-sm font-bold text-text-main dark:text-white">{isEditMode ? 'Update Batch' : 'Create Batch'}</span>
              <HeaderBatchName control={control} />
            </div>
          </div>
        </div>
      }
      body={
        <div className="pt-6 lg:pt-10 pb-6">
          <Breadcrumbs items={crumbs} className="mb-4" />

          <div className="flex flex-col gap-1 mb-8">
            <h1 className="text-3xl font-black text-text-main dark:text-white tracking-tight leading-tight">{isEditMode ? 'Update Batch' : 'Create Batch'}</h1>
            <p className="text-text-secondary text-base">{isEditMode ? 'Configure existing batch details and scheduling parameters.' : 'Configure a new batch for your institute, assign branches, faculty and define scheduling.'}</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-lg border border-red-100 dark:border-red-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <span className="material-symbols-outlined">error</span>
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit(onSubmit)} className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark">
            <div className="p-6 md:p-8 grid grid-cols-12 gap-6 lg:gap-8 items-start">
              
              {/* Basic Details */}
              <FormSection title="Basic Details" icon="info" className="col-span-12 lg:col-span-7">
                <FormField label="Course Selection" required className="md:col-span-2" error={errors.course_id?.message}>
                  <LowDensityCard
                    icon={selectedCourse ? undefined : 'menu_book'}
                    avatarText={selectedCourse ? (selectedCourse.short_code || selectedCourse.name?.substring(0, 2).toUpperCase()) : undefined}
                    title={selectedCourse?.name || 'Assign Course to Batch'}
                    subtitle1={selectedCourse ? selectedCourse.course_id : 'No course selected — click Change to browse'}
                    subtitle2={selectedCourse ? [selectedCourse.language_medium, selectedCourse.segment_name].filter(Boolean).join(' • ') : undefined}
                    bodyText={selectedCourse && (selectedCourse.metadata?.class || selectedCourse.metadata?.board) ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedCourse.metadata?.class && <Tag label={`Class ${selectedCourse.metadata.class}`} variant="subtle" color="primary" size="sm" />}
                        {selectedCourse.metadata?.board && <Tag label={selectedCourse.metadata.board} variant="subtle" color="warning" size="sm" />}
                      </div>
                    ) : undefined}
                    actions={[{
                      label: selectedCourse ? 'Change' : 'Browse Catalog',
                      icon: 'edit_square',
                      priority: 'primary',
                      onClick: () => setIsCourseModalOpen(true)
                    }]}
                  />
                </FormField>

                <TextInput
                  {...register('batch_name')}
                  label="Batch Name"
                  required
                  maxLength={255}
                  placeholder="e.g. JEE Alpha 2024"
                  error={errors.batch_name?.message}
                />

                <Controller
                  name="branch_id"
                  control={control}
                  render={({ field }) => (
                    <SelectInput
                      label={<>Assigned Branch <span className="text-red-500 ml-0.5">*</span></>}
                      placeholder="Select branch..."
                      value={field.value}
                      onChange={field.onChange}
                      options={branchOptions}
                      error={errors.branch_id?.message}
                    />
                  )}
                />

                <Controller
                  name="batch_type"
                  control={control}
                  render={({ field }) => (
                    <FormField label="Batch Type" className="md:col-span-2" error={errors.batch_type?.message}>
                      <ButtonGroupFilter
                        options={[
                          { label: 'Academy', value: 'Academy' },
                          { label: 'Computer', value: 'Computer' },
                          { label: 'Foundation', value: 'Foundation' },
                          { label: 'Competitive', value: 'Competitive' },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                        size="md"
                        variant="secondary"
                      />
                    </FormField>
                  )}
                />

                <FormField label="Faculty Assignment" className="md:col-span-2" error={errors.teacher_id?.message}>
                  <LowDensityCard
                    avatar={selectedTeacher?.profile_photo_url || undefined}
                    icon={selectedTeacher ? undefined : 'person'}
                    avatarText={selectedTeacher ? (selectedTeacher.full_name || selectedTeacher.teacher_name || selectedTeacher.name)?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : undefined}
                    title={selectedTeacher ? (selectedTeacher.full_name || selectedTeacher.teacher_name || selectedTeacher.name) : 'Assign Primary Instructor'}
                    subtitle1={selectedTeacher ? (selectedTeacher.experience_years ? `${selectedTeacher.experience_years} yrs experience` : 'General Faculty') : 'No teacher selected \u2014 click Change to browse'}
                    subtitle2={selectedTeacher ? (selectedTeacher.qualification || undefined) : undefined}
                    bodyText={selectedTeacher && (selectedTeacher.specialization || selectedTeacher.qualification) ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedTeacher.specialization && <Tag label={selectedTeacher.specialization} variant="subtle" color="primary" size="sm" />}
                        {selectedTeacher.qualification && <Tag label={selectedTeacher.qualification} variant="subtle" color="warning" size="sm" />}
                      </div>
                    ) : undefined}
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
                  {...register('capacity', { valueAsNumber: true })}
                  label="Student Capacity"
                  leftIcon="group"
                  type="number"
                  min="1" max="500"
                  error={errors.capacity?.message}
                />

                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <SelectInput
                      label="Operational Status"
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { label: 'Active', value: 'active' },
                        { label: 'Completed', value: 'completed' },
                        { label: 'Cancelled', value: 'cancelled' }
                      ]}
                      error={errors.status?.message}
                    />
                  )}
                />

                <DateInput
                  {...register('start_date')}
                  label="Start Date"
                  error={errors.start_date?.message}
                />

                <DateInput
                  {...register('end_date')}
                  label="End Date"
                  error={errors.end_date?.message}
                />

                <Controller
                  name="schedule.days_of_week"
                  control={control}
                  render={({ field }) => (
                    <FormField label="Batch Schedule (Days)" className="md:col-span-2" error={errors.schedule?.days_of_week?.message}>
                      <div className="flex flex-wrap gap-3">
                        {daysOfWeek.map(day => {
                          const isSelected = field.value?.includes(day);
                          return (
                            <label key={day} className="cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only" 
                                checked={isSelected}
                                onChange={() => {
                                  const currentDays = field.value || [];
                                  const nextDays = isSelected 
                                    ? currentDays.filter(d => d !== day) 
                                    : [...currentDays, day];
                                  field.onChange(nextDays);
                                }}
                              />
                              <div className={`px-4 py-2 rounded-full border text-sm font-medium transition-all shadow-sm ${isSelected ? 'bg-primary/10 text-primary border-primary' : 'border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-secondary hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                {day}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </FormField>
                  )}
                />

                <BaseInput
                  {...register('schedule.start_time')}
                  label="Start Time"
                  type="time"
                  error={errors.schedule?.start_time?.message}
                />
                <BaseInput
                  {...register('schedule.end_time')}
                  label="End Time"
                  type="time"
                  error={errors.schedule?.end_time?.message}
                />
              </FormSection>
            </div>
          </form>

          {/* Optimized Portals: Lazy-evaluated via short-circuit evaluations */}
          {isCourseModalOpen && (
            <CourseSelectionModal 
              isOpen={isCourseModalOpen}
              onClose={() => setIsCourseModalOpen(false)}
              availableCourses={allCourses}
              selectedCourses={selectedCourse ? [selectedCourse] : []}
              onSelect={(course) => {
                setValue('course_id', course?.course_id || '', { shouldValidate: true });
                setIsCourseModalOpen(false);
              }}
              singleSelect={true}
            />
          )}

          {isTeacherModalOpen && (
            <TeacherSelectionModal 
              isOpen={isTeacherModalOpen}
              onClose={() => setIsTeacherModalOpen(false)}
              availableTeachers={allTeachers}
              selectedTeacher={selectedTeacher}
              onSelect={(teacher) => {
                setValue('teacher_id', teacher?.teacher_id || '', { shouldValidate: true });
                setIsTeacherModalOpen(false);
              }}
              singleSelect={true}
            />
          )}
        </div>
      }
      footer={
        <footer className="border border-border-light dark:border-border-dark bg-white dark:bg-slate-900 shadow-lg px-4 lg:px-6 py-3 flex items-center justify-between gap-4 rounded-xl w-full">
          <div className="flex items-center justify-start w-1/2 md:w-auto">
            <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-lg border border-border-light dark:border-border-dark text-text-secondary font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm">Cancel</button>
          </div>
          <div className="flex justify-end w-1/2 md:w-auto ml-auto">
            <button type="submit" disabled={isSubmitting} onClick={handleFormSubmit(onSubmit)} className="px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50">
              {isSubmitting ? <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <span className="material-symbols-outlined text-sm">save</span>}
              Save Batch
            </button>
          </div>
        </footer>
      }
    />
  );
};

export default BatchForm;

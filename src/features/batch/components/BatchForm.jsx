import React from 'react';
import { Controller, useWatch } from 'react-hook-form';
import useBatchForm from '../hooks/useBatchForm';

// Design System Core UI imports
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
import { Tag, Chip } from '../../../components/ui/v2/indicators';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import MainLayout from '../../../components/layout/MainLayout';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Isolated sub-component to prevent parent re-renders on every batch name keystroke
const HeaderBatchName = ({ control }) => {
  const batchName = useWatch({ control, name: 'batch_name', defaultValue: '' });
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

const BatchForm = ({ initialData = null, onSubmit, onCancel, isSubmitting = false, error = null }) => {
  // Bind form state and logic to the headless hook
  const {
    formInstance,
    allCourses,
    allTeachers,
    branchOptions,
    selectedCourse,
    selectedTeacher,
    isCourseModalOpen,
    setIsCourseModalOpen,
    isTeacherModalOpen,
    setIsTeacherModalOpen,
    isSticky,
    handleBodyScroll,
    handleCourseSelection,
    handleTeacherSelection,
    onSubmitForm,
    isEditMode
  } = useBatchForm({ initialData, onSubmit });

  const { register, control, formState: { errors } } = formInstance;

  const crumbs = React.useMemo(() => [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'home' },
    { label: 'Batches', path: '/admin/batches' },
    { label: isEditMode ? 'Edit Batch' : 'New Batch' }
  ], [isEditMode]);

  // Extract flat collection of validation error strings for the diagnostic banner
  const validationErrorMessages = React.useMemo(() => {
    const list = [];
    const extract = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      if (obj.message) list.push(obj.message);
      Object.values(obj).forEach(extract);
    };
    extract(errors);
    return list;
  }, [errors]);

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

          {/* Combined Server-Side Error & Client Validation Diagnostics Banner */}
          {(error || validationErrorMessages.length > 0) && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-lg border border-red-100 dark:border-red-800 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined font-bold">error</span>
                <span className="text-sm font-bold">{error || "Please clear validation errors before saving updates:"}</span>
              </div>
              {validationErrorMessages.length > 0 && (
                <ul className="list-disc pl-9 text-xs font-semibold flex flex-col gap-1">
                  {validationErrorMessages.map((msg, i) => <li key={i}>{msg}</li>)}
                </ul>
              )}
            </div>
          )}

          <form onSubmit={onSubmitForm} className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark">
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
                    subtitle1={selectedTeacher ? (selectedTeacher.experience_years ? `${selectedTeacher.experience_years} yrs experience` : 'General Faculty') : 'No teacher selected — click Change to browse'}
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
                      <div className="flex flex-wrap gap-2 pt-1">
                        {daysOfWeek.map(day => {
                          const currentDays = field.value || [];
                          const isSelected = currentDays.includes(day);
                          return (
                            <Chip
                              key={day}
                              label={day}
                              variant={isSelected ? 'filled' : 'outlined'}
                              color={isSelected ? 'primary' : 'neutral'}
                              active={isSelected}
                              clickable={true}
                              size="md"
                              onClick={() => {
                                const nextDays = isSelected 
                                  ? currentDays.filter(d => d !== day) 
                                  : [...currentDays, day];
                                field.onChange(nextDays);
                              }}
                            />
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
              onSelect={handleCourseSelection}
              singleSelect={true}
            />
          )}

          {isTeacherModalOpen && (
            <TeacherSelectionModal 
              isOpen={isTeacherModalOpen}
              onClose={() => setIsTeacherModalOpen(false)}
              availableTeachers={allTeachers}
              selectedTeacher={selectedTeacher}
              onSelect={handleTeacherSelection}
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
            <button type="submit" disabled={isSubmitting} onClick={onSubmitForm} className="px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50">
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

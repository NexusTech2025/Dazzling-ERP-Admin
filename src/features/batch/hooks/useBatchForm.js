import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { parseISO, format, formatDate } from 'date-fns';

// Ingest and Caching Optimization Channels
import { useCoursesQuery } from '../../course/hooks/useCourseQueries';
import { useTeachersQuery } from '../../teacher/hooks/useTeacherQueries';
import { useBranchesQuery } from '../../core/hooks/useBranchQueries';

const default_days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
    days_of_week: default_days,
    start_time: '09:00',
    end_time: '11:00'
  }
};

/**
 * Converts ISO timestamp strings to timezone-safe yyyy-MM-dd date input format.
 * @param {string|null|undefined} dateStr - Target ISO datetime string.
 * @returns {string} Formatted date string or empty string if invalid.
 */
const formatToInputDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), 'yyyy-MM-dd');
  } catch (e) {
    return '';
  }
};

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
    .test('date-compare', 'Start date cannot be after end date.', function (end_date) {
      const { start_date } = this.parent;
      if (!start_date || !end_date) return true;
      return new Date(start_date) <= new Date(end_date);
    }),
  schedule: yup.object().shape({
    days_of_week: yup.array().of(
      yup.string().oneOf(default_days, "The value '${value}' is invalid. Allowed options are: ${values}.")
    ).min(1, "Please select at least one day for the batch schedule."),
    start_time: yup.string().matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Invalid start time format (HH:mm).").required("Start time is required."),
    end_time: yup.string().matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Invalid end time format (HH:mm).").required("End time is required.")
  })
});

export const useBatchForm = ({ initialData, onSubmit }) => {
  // 1. Fetch data lists from global cache boundary
  const { data: allCourses = [] } = useCoursesQuery();
  const { data: allTeachers = [] } = useTeachersQuery();
  const { data: branches = [] } = useBranchesQuery();

  // 2. Local interactive presentation states
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // 3. Isolated Local Snapshot Generation (Runs once per data hydration lifecycle)
  const localFormSnapshot = useMemo(() => {
    if (!initialData) return DEFAULT_FORM_DATA;
    return {
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
          : default_days,
        start_time: initialData.schedule?.start_time || '09:00',
        end_time: initialData.schedule?.end_time || '11:00'
      }
    };
  }, [initialData]);

  // 4. Instantiate Form Context Core
  const formInstance = useForm({
    resolver: yupResolver(batchFormSchema),
    defaultValues: DEFAULT_FORM_DATA,
    // Inject values only during the initial async load to prevent background cache overwrites
    values: hasInitialized ? undefined : localFormSnapshot,
    mode: 'onTouched'
  });

  // Track initialization event to disconnect background sync overrides
  useEffect(() => {
    if (initialData && !hasInitialized) {
      setHasInitialized(true);
    }
  }, [initialData, hasInitialized]);

  const { watch, setValue, handleSubmit: handleRHFSubmit } = formInstance;

  // 5. Watch variables to update information display elements
  const watchedCourseId = watch('course_id');
  const watchedTeacherId = watch('teacher_id');

  // 6. Memoized UI Options Transformations
  const branchOptions = useMemo(() => {
    return branches
      .filter(b => b.status === 'active')
      .map(b => ({ label: b.branch_name, value: b.branch_id }));
  }, [branches]);

  const selectedCourse = useMemo(() =>
    allCourses.find(c => c.course_id === watchedCourseId || c.id === watchedCourseId),
    [allCourses, watchedCourseId]
  );

  const selectedTeacher = useMemo(() =>
    allTeachers.find(t => t.teacher_id === watchedTeacherId || t.id === watchedTeacherId),
    [allTeachers, watchedTeacherId]
  );

  // 7. Event Handler Operations
  const handleBodyScroll = (e) => {
    const shouldBeSticky = e.currentTarget.scrollTop > 80;
    setIsSticky(prev => (prev !== shouldBeSticky ? shouldBeSticky : prev));
  };

  const handleCourseSelection = (course) => {
    setValue('course_id', course?.course_id || '', { shouldValidate: true });
    setIsCourseModalOpen(false);
  };

  const handleTeacherSelection = (teacher) => {
    setValue('teacher_id', teacher?.teacher_id || '', { shouldValidate: true });
    setIsTeacherModalOpen(false);
  };

  const onSubmitForm = handleRHFSubmit(
    (formData) => {
      onSubmit(formData)
    },
    (errors) => {

      console.warn("Form validation tracking exceptions:", errors)
    }
  );

  return {
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
    isEditMode: !!initialData
  };
};

export default useBatchForm;

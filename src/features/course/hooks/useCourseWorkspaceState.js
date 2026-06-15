import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCoursesQuery, useDeleteCourseMutation, useCourseTypesQuery } from './useCourseQueries';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import useSelection from '../../../hooks/useSelection';
import useDeleteManyMutation from '../../../hooks/useDeleteManyMutation';

/**
 * @file useCourseWorkspaceState.js
 * @module CourseWorkspaceStateHook
 * @description React custom hook that encapsulates all state, query orchestration, 
 * filtering calculations, selection indexes, and delete actions for the Course/Subject Workspace.
 *
 * ### States & Logic managed:
 * - Search query inputs matching course names or course IDs.
 * - Tab grid/list view mode parameters.
 * - Academic segment filter indicators (enabling specialized class/board/medium options).
 * - Referential-safety delete mutation confirmation states.
 *
 * @function useCourseWorkspaceState
 * @returns {object} Workspace state variables, query results, mutation handlers, and queryClient.
 */
export const useCourseWorkspaceState = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [boardFilter, setBoardFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    name: '',
    type: 'course',
    status: 'idle',
    resultMessage: null
  });

  const { data: courses = [], isLoading: isLoadingCourses, isFetching: isFetchingCourses, error: coursesError } = useCoursesQuery();
  const { data: courseTypes = [], error: typesError } = useCourseTypesQuery();
  const deleteMutation = useDeleteCourseMutation();

  const selection = useSelection();

  const deleteManyCoursesMutation = useDeleteManyMutation(
    'Course',
    [queryKeys.course.all]
  );

  const selectedType = useMemo(() => {
    return courseTypes.find(t => t.segment_id === segmentFilter);
  }, [courseTypes, segmentFilter]);

  const isAcademicFilterActive = useMemo(() => {
    if (!segmentFilter) return false;
    return selectedType 
      ? (selectedType.entity_label === 'Subject' || selectedType.segment_name?.toLowerCase().includes('academic'))
      : false;
  }, [selectedType, segmentFilter]);

  // Filter Logic - Courses
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.course_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSegment = !segmentFilter || c.segment_id === segmentFilter;
      const matchesBoard = !boardFilter || c.metadata?.board === boardFilter;
      const matchesClass = !classFilter || String(c.metadata?.class) === classFilter;
      const matchesLanguage = !languageFilter || c.language_medium === languageFilter;

      return matchesSearch && matchesSegment && matchesBoard && matchesClass && matchesLanguage;
    });
  }, [courses, searchQuery, segmentFilter, boardFilter, classFilter, languageFilter]);

  const availableSegments = useMemo(() => {
    const segments = courses.map(c => c.segment_id);
    return [...new Set(segments)];
  }, [courses]);

  const segmentOptions = useMemo(() => {
    const typesList = Array.isArray(courseTypes) ? courseTypes : [];
    return [
      { label: 'All', value: '', icon: 'apps' },
      ...typesList.map(type => {
        let icon = 'school';
        const nameLower = type.segment_name?.toLowerCase() || '';
        if (nameLower.includes('computer')) icon = 'computer';
        else if (nameLower.includes('foundation')) icon = 'star';
        else if (nameLower.includes('academic') || type.entity_label === 'Subject') icon = 'menu_book';
        
        return {
          label: type.segment_name,
          value: type.segment_id,
          icon: icon
        };
      })
    ];
  }, [courseTypes]);

  /**
   * Triggers the display of the confirmation modal for single or bulk course archiving.
   * 
   * @function handleOpenDelete
   * @param {string|Array<string>} id - The target course ID or array of course IDs for bulk operations.
   * @param {string} name - The display descriptor name of the course or bulk items.
   * @param {string} [type='course'] - The target action signature ('course' | 'bulk_course').
   * @returns {void}
   */
  const handleOpenDelete = (id, name, type = 'course') => {
    setDeleteModal({ isOpen: true, id, name, type, status: 'idle', resultMessage: null });
  };

  /**
   * Resets the delete confirmation modal variables, closing the popup drawer.
   * 
   * @function handleCloseDelete
   * @returns {void}
   */
  const handleCloseDelete = () => {
    setDeleteModal({ isOpen: false, id: null, name: '', type: 'course', status: 'idle', resultMessage: null });
  };

  return {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    segmentFilter,
    setSegmentFilter,
    boardFilter,
    setBoardFilter,
    classFilter,
    setClassFilter,
    languageFilter,
    setLanguageFilter,
    deleteModal,
    setDeleteModal,
    handleOpenDelete,
    handleCloseDelete,
    isLoading: isLoadingCourses,
    isFetching: isFetchingCourses,
    error: coursesError || typesError,
    filteredCourses,
    availableSegments,
    segmentOptions,
    isAcademicFilterActive,
    selection,
    deleteMutation,
    deleteManyCoursesMutation,
    queryClient
  };
};

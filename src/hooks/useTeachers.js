import { useTeachersQuery } from '../features/teacher/hooks/useTeacherQueries';

/**
 * Custom hook to manage teacher data fetching using React Query (Delegates to canonical useTeachersQuery).
 */
export const useTeachers = (filter = {}) => {
  return useTeachersQuery(filter);
};

import { useStudentsQuery } from '../features/student/hooks/useStudentQueries';

/**
 * Custom hook to manage student data fetching using React Query (Delegates to canonical useStudentsQuery).
 */
export const useStudents = (filter = {}) => {
  return useStudentsQuery(filter);
};

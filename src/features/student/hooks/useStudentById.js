import { useMemo } from 'react';
import { useStudentsQuery } from './useStudentQueries';
import { useProfileDetailsQuery } from '../../profile/hooks/useProfileDetailsQuery';

/**
 * Composite hook to fetch all information for a specific student.
 * Combines basic student data with extended profile (address, contact, education).
 */
export const useStudentById = (studentId) => {
  // 1. Fetch main student record (using list query with filter)
  const { 
    data: students = [], 
    isLoading: isBasicLoading, 
    error: studentError,
    isFetching: isBasicFetching
  } = useStudentsQuery({ student_id: studentId });

  // 2. Fetch extended profile (address, contact, education)
  const { 
    data: profileData, 
    isLoading: isProfileLoading, 
    error: profileError,
    isFetching: isProfileFetching
  } = useProfileDetailsQuery(studentId);

  // Find the specific student from the list
  const student = useMemo(() => {
    return students.find(s => s.student_id === studentId);
  }, [students, studentId]);

  return {
    student,
    profileData,
    isLoading: isBasicLoading || isProfileLoading,
    isFetching: isBasicFetching || isProfileFetching,
    error: studentError || profileError,
    exists: !!student
  };
};

export default useStudentById;

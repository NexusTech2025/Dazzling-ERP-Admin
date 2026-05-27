import { useStudentDetailQuery } from './useStudentQueries';
import { useProfileDetailsQuery } from '../../profile/hooks/useProfileDetailsQuery';

/**
 * Composite hook to fetch all information for a specific student.
 * Combines basic student data with extended profile (address, contact, education).
 */
export const useStudentById = (studentId) => {
  // 1. Fetch main student record directly from the detail cache
  const { 
    data: student = null, 
    isLoading: isBasicLoading, 
    error: studentError,
    isFetching: isBasicFetching
  } = useStudentDetailQuery(studentId);

  // 2. Fetch extended profile (address, contact, education)
  const { 
    data: profileData, 
    isLoading: isProfileLoading, 
    error: profileError,
    isFetching: isProfileFetching
  } = useProfileDetailsQuery(studentId);

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

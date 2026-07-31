import { useMemo, useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { hydrateStudentProfile } from '../../../lib/react-query/hydrate';
import { useStudentsQuery } from './useStudentQueries';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';

/**
 * Composite hook to resolve all information for a specific student.
 * Resolves 100% in-memory from RAM cache when warm (0ms latency, 0 HTTP calls),
 * and automatically triggers a single forced refetch when hydrated data is incomplete.
 *
 * @param {string} studentId - Target student identifier (STU- prefix).
 * @returns {Object} Hydrated student record, profileData, and state flags.
 */
export const useStudentById = (studentId) => {
  const queryClient = useQueryClient();
  const [needsRefetch, setNeedsRefetch] = useState(false);
  const hasRefetchedRef = useRef(false);

  // 1. Bind useStudentsQuery with conditional forceRefetch
  const {
    isLoading: isListLoading,
    isFetching: isListFetching,
    refetch
  } = useStudentsQuery(undefined, { forceRefetch: needsRefetch });

  // 2. Resolve complete profile from RAM query store
  const hydrated = useMemo(() => {
    return hydrateStudentProfile(queryClient, studentId);
  }, [queryClient, studentId, isListLoading, isListFetching]);

  console.groupCollapsed(`🧩 [useStudentById] Render cycle for: ${studentId}`);
  console.log('📊 isListLoading:', isListLoading, '| isListFetching:', isListFetching);
  console.log('📊 needsRefetch:', needsRefetch, '| hasRefetchedRef:', hasRefetchedRef.current);
  console.log('📊 hydrated student:', hydrated?.student ? 'present' : 'null');
  console.log('📊 hydrated profileData:', hydrated?.profileData ? Object.keys(hydrated.profileData) : 'null');
  if (hydrated?.profileData) {
    const pd = hydrated.profileData;
    console.log('📊 allocations:', pd.allocations?.length, '| enrollments:', pd.enrollments?.length);
    console.log('📊 batches:', pd.batches?.length, '| courses:', pd.courses?.length);
    console.log('📊 address:', pd.address ? 'present' : 'null', '| contact:', pd.contact ? 'present' : 'null');
  }
  console.groupEnd();

  // 3. Detect incomplete hydration and trigger exactly ONE imperative refetch
  useEffect(() => {
    if (hasRefetchedRef.current || needsRefetch || isListFetching) return;
    if (!hydrated?.student) return;

    const pd = hydrated.profileData;
    const isIncomplete = (
      !pd ||
      !Array.isArray(pd.allocations) ||
      (pd.allocations.length === 0 && pd.enrollments.length === 0)
    );

    if (isIncomplete) {
      console.log('🔄 [useStudentById] Incomplete hydration detected — invalidating cache and setting forceRefetch = true');
      hasRefetchedRef.current = true;
      queryClient.invalidateQueries({ queryKey: queryKeys.student.list(EMPTY_FILTER) });
      setNeedsRefetch(true);
    }
  }, [hydrated, needsRefetch, isListFetching, refetch]);

  const wasFetchingRef = useRef(false);

  // 4. Reset refetch flag only AFTER network fetch has actually started and completed
  useEffect(() => {
    if (isListFetching) {
      wasFetchingRef.current = true;
    } else if (needsRefetch && wasFetchingRef.current) {
      console.log('✅ [useStudentById] Network refetch completed — resetting needsRefetch');
      setNeedsRefetch(false);
      wasFetchingRef.current = false;
    }
  }, [needsRefetch, isListFetching]);

  return {
    student: hydrated?.student || null,
    profileData: hydrated?.profileData || null,
    isLoading: (isListLoading || (needsRefetch && isListFetching)) && !hydrated?.student,
    isFetching: isListFetching,
    isRefetching: needsRefetch && isListFetching,
    error: null,
    exists: !!hydrated?.student
  };
};

export default useStudentById;


import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContextCore';
import { queryKeys } from '../../../lib/react-query/queryKeys';
import { fetchProfileDetails } from '../api/profile.api';

/**
 * Hook for fetching profile details
 */
export const useProfileDetailsQuery = (studentId) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.student.profile(studentId),
    queryFn: async ({ signal }) => {
      const response = await fetchProfileDetails(token, studentId, { signal });
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch profile details');
      }
      return response.data?.data || null;
    },
    enabled: !!token && !!studentId,
  });
};

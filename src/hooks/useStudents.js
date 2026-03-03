import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContextCore';
import { query } from '../services/api';

/**
 * Custom hook to manage student data fetching using React Query
 */
export const useStudents = (filter = {}) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['students', filter],
    queryFn: async () => {
      const response = await query(token, 'Student', filter);
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch students');
      }
      // Based on API reference: data.data contains the actual array
      return response.data?.data || [];
    },
    enabled: !!token, // Only fetch if we have a token
  });
};

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContextCore';
import { query } from '../services/api';

/**
 * Custom hook to manage teacher data fetching using React Query
 */
export const useTeachers = (filter = {}) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['teachers', filter],
    queryFn: async () => {
      const response = await query(token, 'Teacher', filter);
      if (!response.success) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch teachers');
      }
      // Based on API reference: data.data contains the actual array
      return response.data?.data || [];
    },
    enabled: !!token,
  });
};

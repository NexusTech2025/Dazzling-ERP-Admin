import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContextCore';
import { apiClient } from '../services/apiClient';
import { API_REGISTRY } from '../services/apiRegistry';

/**
 * Custom hook to manage teacher data fetching using React Query
 */
export const useTeachers = (filter = {}) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['teachers', filter],
    queryFn: async () => {
      const response = await apiClient.executeAction(
        API_REGISTRY.DATA.QUERY,
        { target: 'Teacher', where: filter },
        token
      );
      return response.data?.data || [];
    },
    enabled: !!token,
  });
};

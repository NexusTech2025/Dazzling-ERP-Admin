import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContextCore';
import { apiClient } from '../services/apiClient';
import { API_REGISTRY } from '../services/apiRegistry';

/**
 * Custom hook to manage student data fetching using React Query
 */
export const useStudents = (filter = {}) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['students', filter],
    queryFn: async () => {
      const response = await apiClient.executeAction(
        API_REGISTRY.DATA.QUERY,
        { target: 'Student', where: filter },
        token
      );
      return response.data?.data || [];
    },
    enabled: !!token,
  });
};

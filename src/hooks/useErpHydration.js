import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContextCore';
import { apiClient } from '../services/apiClient';
import { API_REGISTRY } from '../services/apiRegistry';
import { queryKeys, EMPTY_FILTER } from '../lib/react-query/queryKeys';

/**
 * useErpHydration: Strategy 1 - App Initialization Guard
 * Fetches initial ERP data and populates the React Query cache.
 */
export const useErpHydration = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // 📋 Hydration Configuration Mapping: 
  // Maps API target names (singular schema names for request) 
  // to their pluralized response keys and Query Key factories.
  const HYDRATION_CONFIG = {
    'Course': { query_key: queryKeys.course, response_key: 'courses' },
    'Teacher': { query_key: queryKeys.teacher, response_key: 'teachers' },
    'Student': { query_key: queryKeys.student, response_key: 'students' },
    'Batch': { query_key: queryKeys.batch, response_key: 'batches' },
  };

  const HYDRATION_TARGETS = Object.keys(HYDRATION_CONFIG);

  return useQuery({
    queryKey: ['init_erp', { targets: HYDRATION_TARGETS }],
    queryFn: async () => {
      console.log('🚀 Starting ERP Hydration with targets:', HYDRATION_TARGETS);

      const response = await apiClient.executeAction(
        API_REGISTRY.ADMIN.INIT_ERP, 
        { targets: HYDRATION_TARGETS }, 
        token
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to initialize ERP data');
      }

      const data = response.data || {};
      const now = Date.now();

      // 🛡️ Dynamic Cache Injection
      HYDRATION_TARGETS.forEach(targetName => {
        const config = HYDRATION_CONFIG[targetName];
        if (!config) return;

        const responseKey = config.response_key;
        const result = data[responseKey];

        console.log(`🔍 Inspecting hydration for ${targetName} (Response Key: ${responseKey})...`);

        if (result && Array.isArray(result.data)) {
          const records = result.data;
          
          console.log(`💧 Hydrating ${targetName}: ${records.length} records found.`);
          console.log(`📦 Cache Key:`, JSON.stringify(config.query_key.list(EMPTY_FILTER)));

          queryClient.setQueryData(
            config.query_key.list(EMPTY_FILTER), 
            records, 
            { updatedAt: now }
          );
        } else {
          console.warn(`⚠️ No records found in response for key: ${responseKey}. Data structure:`, result);
        }
      });

      return data;
    },
    enabled: !!token,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

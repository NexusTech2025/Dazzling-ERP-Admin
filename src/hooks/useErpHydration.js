import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContextCore';
import { apiClient } from '../services/apiClient';
import { API_REGISTRY } from '../services/apiRegistry';
import { queryKeys, EMPTY_FILTER } from '../lib/react-query/queryKeys';
import { hasSchema } from '../lib/react-query/schemaRegistry.js';
import { validateRecordSchema } from '../lib/react-query/validationEngine.js';
import { normalizeRecord } from '../lib/react-query/hydrate.js';

// 🎯 Hydration Strategies Registry
// Encapsulates normalizations and validation keys for each entity type.
const HYDRATION_STRATEGIES = {
  'Course': {
    entityName: 'course',
    normalize: (records) => normalizeRecord('course', records),
  },
  'Batch': {
    entityName: 'batch',
    normalize: (records) => normalizeRecord('batch', records),
  },
  'Package': {
    entityName: 'package',
    normalize: (records) => normalizeRecord('package', records),
  }
};

const getStrategy = (targetName) => {
  const defaultStrategy = {
    entityName: targetName.toLowerCase(),
    normalize: (records) => normalizeRecord(targetName.toLowerCase(), records),
  };
  const strategy = HYDRATION_STRATEGIES[targetName] || {};
  return { ...defaultStrategy, ...strategy };
};

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
    'Branch': { query_key: queryKeys.branch, response_key: 'branchs' },
    'Package': { query_key: queryKeys.course.package, response_key: 'packages' },
    'PackageItem': { query_key: queryKeys.course.packageItem, response_key: 'packageitems' },
    'PackagePerk': { query_key: queryKeys.course.packagePerk, response_key: 'packageperks' },
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
          const strategy = getStrategy(targetName);
          const records = strategy.normalize(result.data, queryClient);

          console.log(`💧 Hydrating ${targetName}: ${records.length} records found.`);

          if (hasSchema(strategy.entityName)) {
            console.log(`🛡️ Validating hydration records for: ${targetName}`);
            records.forEach(record => {
              validateRecordSchema(strategy.entityName, record, { failMode: 'lazy', context: 'read' });
            });
          }

          const listKey = config.query_key.list(EMPTY_FILTER);
          console.log(`📦 Cache Key:`, JSON.stringify(listKey));

          // Mirror the resolveList pattern in cacheHelper.js (setQueryData + setQueryDefaults)
          // so the seeded entry is treated as fresh by any hook with staleTime: Infinity.
          // Without setQueryDefaults, the entry has no staleTime and is considered stale
          // immediately, triggering an unnecessary network refetch on first mount.
          queryClient.setQueryData(listKey, records, { updatedAt: now });
          queryClient.setQueryDefaults(listKey, { staleTime: Infinity, gcTime: Infinity });
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

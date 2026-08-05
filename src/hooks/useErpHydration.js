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
  // to their cache Query Key factories, spreadsheet category, and sheet name.
  const HYDRATION_CONFIG = {
    'Course': { query_key: queryKeys.course, category: 'Academic', sheet: 'Course' },
    'CourseType': { query_key: queryKeys.course.type, category: 'Academic', sheet: 'CourseType' },
    'Teacher': { query_key: queryKeys.teacher, category: 'Staff', sheet: 'Teacher' },
    'Student': { query_key: queryKeys.student, category: 'Students', sheet: 'Student' },
    'Batch': { query_key: queryKeys.batch, category: 'Academic', sheet: 'Batch' },
    'Branch': { query_key: queryKeys.branch, category: 'Core', sheet: 'Branch' },
    'Package': { query_key: queryKeys.course.package, category: 'Academic', sheet: 'Package' },
    'PackageItem': { query_key: queryKeys.course.packageItem, category: 'Academic', sheet: 'PackageItem' },
    'PackagePerk': { query_key: queryKeys.course.packagePerk, category: 'Academic', sheet: 'PackagePerk' },
    'BatchAllocation': { query_key: queryKeys.batch_allocation, category: 'Academic', sheet: 'BatchAllocation' },
    'StaffMember': { query_key: queryKeys.staff, category: 'Staff', sheet: 'StaffMember' },
    'TeacherSubject': { query_key: { list: (filter = EMPTY_FILTER) => ['teacher-subject', 'list', { filter }] }, category: 'Staff', sheet: 'TeacherSubject' },
    'StudentLead': { query_key: queryKeys.lead, category: 'Students', sheet: 'StudentLead' },
    'ExpenseCategory': { query_key: queryKeys.finance.category, category: 'Finance', sheet: 'ExpenseCategory' },
    'User': { query_key: queryKeys.user, category: 'Auth', sheet: 'User' },
  };

  const HYDRATION_TARGETS = Object.keys(HYDRATION_CONFIG);

  return useQuery({
    queryKey: ['sheet_batch_read', { targets: HYDRATION_TARGETS }],
    queryFn: async () => {
      console.log('🚀 Starting ERP Hydration via sheet_batch_read with targets:', HYDRATION_TARGETS);

      const payload = [
        {
          spreadsheetId: 'Students',
          sheets: ['Student', 'StudentLead']
        },
        {
          spreadsheetId: 'Academic',
          sheets: ['Course', 'Batch', 'Package', 'PackageItem', 'PackagePerk', 'CourseType', 'BatchAllocation']
        },
        {
          spreadsheetId: 'Staff',
          sheets: ['Teacher', 'StaffMember', 'TeacherSubject']
        },
        {
          spreadsheetId: 'Core',
          sheets: ['Branch']
        },
        {
          spreadsheetId: 'Finance',
          sheets: ['ExpenseCategory']
        },
        {
          spreadsheetId: 'Auth',
          sheets: ['User']
        }
      ];

      const response = await apiClient.executeAction(
        API_REGISTRY.ADMIN.SHEET_BATCH_READ,
        payload,
        token,
        {
          timeout: 'SHEET_BATCH', // 45s semantic timeout profile for startup batch hydration
          actionOptions: {
            responseKey: 'NAME',
            driverType: 'ADVANCED'
          }
        }
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to initialize ERP data via sheet_batch_read');
      }

      const data = response.data || {};
      const now = Date.now();

      // 🛡️ Dynamic Cache Injection
      HYDRATION_TARGETS.forEach(targetName => {
        const config = HYDRATION_CONFIG[targetName];
        if (!config) return;

        const { category, sheet } = config;
        const result = data[category]?.[sheet];

        console.log(`🔍 Inspecting hydration for ${targetName} (Category: ${category}, Sheet: ${sheet})...`);

        if (result && Array.isArray(result)) {
          const strategy = getStrategy(targetName);
          const records = strategy.normalize(result, queryClient);

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
          queryClient.setQueryData(listKey, records, { updatedAt: now });
          queryClient.setQueryDefaults(listKey, { staleTime: Infinity, gcTime: Infinity });
        } else {
          console.warn(`⚠️ No records found in response for Category: ${category}, Sheet: ${sheet}. Data structure:`, result);
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

---
Date: 2026-05-28T19:40:00+05:30
Status: Approved-Completed
---

# Course Hydration Normalization Plan

## 1. Root Cause & Technical Analysis

### The Problem
When navigating to `/admin/courses/edit/:id`, the edit form fields for **Class** and **Board** (for academic subjects) or **Min Class** and **Max Class** (for vocational courses) are displayed as blank/empty. This occurs despite these fields being present in the remote database payload.

### The Technical Mechanics (How it Breaks)
1. **Google Sheets Storage limitation**: Google Sheets (DazzlingDB backend) cannot natively store nested structures, so it serializes JSON columns (like `metadata` and `schedule`) as stringified JSON values:
   ```json
   "metadata": "{\"class\":\"Class 10\",\"board\":\"CBSE\"}"
   ```
2. **Bulk Hydration (`init_erp`)**: During app initialization, the custom React Query hydration guard (`useErpHydration.js`) fetches all initial data using the `init_erp` action. For the `'Course'` target, it injects these raw API records directly into the React Query cache:
   ```javascript
   queryClient.setQueryData(
     queryKeys.course.list(EMPTY_FILTER),
     records // <-- Raw database records containing unparsed stringified metadata
   );
   ```
3. **TanStack Query `select` Caveat**: In `useCourseQueries.js`, the list hook `useCoursesQuery` is configured with a select transformer (`select: normalizeCourseList`). In React Query, **`select` only transforms data when it is read by a hook caller**—it does *not* alter the raw cache. The cache under the list key remains populated with the raw, stringified metadata.
4. **Broken Cache Fallback (Cache-First strategy)**: When loading `AddCourse.jsx` (the edit offering page), the component queries course details via the `useCourseDetailQuery(id)` hook. To make transitions instantaneous, the hook runs a fallback strategy to search the active course list cache:
   ```javascript
   initialData: () => {
     // ... checks list queries ...
     const item = listData.find(c => c.course_id === id);
     if (item) return item; // 🚨 BUG: Returns raw item with stringified metadata directly!
   }
   ```
   Because `item` is retrieved directly from the list cache and **never parsed/normalized**, the component receives a course object where `metadata` is a raw string. 
5. **UI Extraction Failure**: Inside `CourseForm.jsx`, the fields are prefilled using:
   ```javascript
   class_level: initialData.metadata?.class || ''
   ```
   Since `metadata` is a string, `metadata.class` returns `undefined`, leaving the Grade and Board inputs empty.

---

## 2. Proposed Solution (Solution A: Root Normalization)

To permanently resolve this, we will align the `Course` module with the established pattern used for the `Batch` module:
*   Extract course parsing logic from the hook file into a dedicated **Course Mapper** utility file.
*   Import this utility inside `useErpHydration.js` and normalize the course records *before* injecting them into the cache during initial hydration.
*   Fix the `initialData` cache fallback in `useCourseDetailQuery(id)` to explicitly run the normalizer.
*   Integrate a self-healing metadata parser inside `CourseForm.jsx` as a secondary line of defense.

---

## 3. Detailed Step-by-Step Implementation

### Step 3.1: Create Course Mappers Utility
Create a new file [courseMappers.js](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/utils/courseMappers.js) to centralize serialization/normalization logic:

```javascript
/**
 * src/features/course/utils/courseMappers.js
 * Centralized serialization and normalizers for course/offering entities.
 */

/**
 * Safely parses serialized course JSON metadata fields.
 * 
 * @param {string|object} metadata - Stringified JSON or parsed metadata object.
 * @returns {object} Parsed metadata dictionary, fallback to empty object.
 */
export const safeParseMetadata = (metadata) => {
  if (!metadata) return {};
  if (typeof metadata === 'object') return metadata;
  try {
    return JSON.parse(metadata);
  } catch (e) {
    console.error('Failed to parse course metadata JSON:', metadata, e);
    return {};
  }
};

/**
 * Normalizes a raw Course record.
 * 
 * @param {object} course - Raw database record.
 * @returns {object|null} Normalized course record with parsed metadata.
 */
export const normalizeCourse = (course) => {
  if (!course) return null;
  return {
    ...course,
    metadata: safeParseMetadata(course.metadata)
  };
};

/**
 * Normalizes an array of raw Course records.
 * 
 * @param {Array<object>} list - Array of raw course records.
 * @returns {Array<object>} Normalized course records.
 */
export const normalizeCourseList = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeCourse);
};
```

### Step 3.2: Refactor `useCourseQueries.js`
Modify [useCourseQueries.js](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js) to import and utilize the new utility, and fix the `initialData` normalization:

```diff
+ import { normalizeCourse, normalizeCourseList } from '../utils/courseMappers';

- // --- METADATA PARSING UTILITIES ---
- const safeParseMetadata = ...
- const normalizeCourse = ...
- const normalizeCourseList = ...

  export const useCourseDetailQuery = (id) => {
    ...
    return useQuery({
      queryKey: queryKeys.course.detail(id),
      queryFn: async ({ signal }) => { ... },
      enabled: !!token && !!id,
      initialData: () => {
        if (!id) return undefined;
        const cachedDetail = queryClient.getQueryData(queryKeys.course.detail(id));
        if (cachedDetail) return cachedDetail;

        const listQueries = queryClient.getQueriesData({ queryKey: queryKeys.course.lists() });
        for (const [key, listData] of listQueries) {
          if (Array.isArray(listData)) {
            const item = listData.find(c => c.course_id === id || c.id === id);
-           if (item) return item;
+           if (item) return normalizeCourse(item);
          }
        }
        return undefined;
      },
      ...
    });
  };
```

### Step 3.3: Refactor `useErpHydration.js`
Modify [useErpHydration.js](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/hooks/useErpHydration.js) to normalize course records during initial application hydration:

```diff
  import { normalizeBatchList } from '../features/batch/utils/batchMappers';
+ import { normalizeCourseList } from '../features/course/utils/courseMappers';

  // ... inside hydration queryFn ...
        if (result && Array.isArray(result.data)) {
          let records = result.data;

          if (targetName === 'Batch') {
            records = normalizeBatchList(records);
+         } else if (targetName === 'Course') {
+           records = normalizeCourseList(records);
          }

          console.log(`💧 Hydrating ${targetName}: ${records.length} records found.`);
```

### Step 3.4: Add Self-Healing Prefill to `CourseForm.jsx`
Modify [CourseForm.jsx](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/components/CourseForm.jsx) to safely parse metadata locally inside the prefill `useEffect` for absolute resilience:

```javascript
  useEffect(() => {
    if (initialData) {
      // Self-healing parsing fallback in case of cache-bypass
      const rawMeta = initialData.metadata;
      let parsedMeta = {};
      if (rawMeta) {
        if (typeof rawMeta === 'object') {
          parsedMeta = rawMeta;
        } else if (typeof rawMeta === 'string') {
          try {
            parsedMeta = JSON.parse(rawMeta);
          } catch (e) {
            console.error('Failed to parse metadata in CourseForm component:', e);
          }
        }
      }

      setFormData({
        course_id: initialData.course_id || '',
        name: initialData.name || '',
        short_code: initialData.short_code || '',
        entity_type: initialData.entity_type || 'subject',
        language_medium: initialData.language_medium || 'English',
        description: initialData.description || '',
        segment_id: initialData.segment_id || '',
        duration_value: initialData.duration_value || 12,
        duration_unit: initialData.duration_unit || 'months',
        class_level: parsedMeta.class || '',
        min_class: parsedMeta.min_class || '',
        max_class: parsedMeta.max_class || '',
        board: parsedMeta.board || '',
        base_fee: initialData.base_fee || '',
        default_installment_count: initialData.default_installment_count || 1,
        is_active: initialData.is_active ?? (initialData.status === 'active')
      });
    }
  }, [initialData]);
```

---

## 4. Verification & Testing Plan
1. **Console Verification**: Check browser console logs during startup hydration. Verify `Inspecting hydration for Course (Response Key: courses)...` is followed by successful hydration logs.
2. **Cache Inspection**:
   * Open React Query Devtools.
   * Locate the cache entry `['course', 'list', { filter: {} }]`.
   * Verify that each item in the list contains a parsed `metadata` object (e.g. `{ class: "Class 10", board: "CBSE" }`) rather than a JSON string.
3. **Form Prepopulation Verification**:
   * Navigate to the Course Directory.
   * Click **Edit** on an academic subject course (e.g. `CRS-87206D7D`).
   * Confirm the **Grade/Class** select and **Board** select fields are pre-populated instantly with correct values without any delay or blank state.

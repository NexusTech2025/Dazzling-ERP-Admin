---
Date: 2026-06-12T17:58:00+05:30
Status: Proposed
---

# Redesign Data Fetch Pipeline to a Reusable Cache-First Strategy

This plan outlines the architecture for a robust, reusable caching and resolution pipeline using React Query. It is designed to maximize local cache reuse, minimize network requests, and prevent background fetching when data exists in either list or detailed caches.

## User Review Required

> [!IMPORTANT]
> **Centralized key mapping & Callback Pipeline**:
> - We will map the entities (`student`, `teacher`, `batch`, `course`, `package`) directly to their keys inside [queryKeys.js](file:///e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/queryKeys.js) inside the helper file.
> - **Production-Grade Exception Handling**:
>   - We wrap the asynchronous pipeline in `try/catch` blocks.
>   - We implement optional `onSuccess(data)` and `onFailure(error)` handlers inside the pipeline settings so components or hooks can register callbacks.
>   - Thrown exceptions will be logged and re-thrown to let React Query transition the query status to `error` state.

## Proposed Changes

### Core React Query Layer

#### [NEW] [cacheHelper.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js)
- Import `queryKeys` and `EMPTY_FILTER` from `queryKeys.js`.
- Define `ENTITY_CONFIGS` mapping domains to their exact key builders and unique column identifiers.
- Export `getCachedRecord(queryClient, entity, id)` for synchronous initial data resolution.
- Export `resolveRecord(queryClient, entity, id, fetchFn, options)` for asynchronous cached retrieval with error safety.
  - Options will accept: `{ strategy, onSuccess, onFailure }`.

### Domain Query Hooks

#### [MODIFY] [useStudentQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/hooks/useStudentQueries.js)
- Import `getCachedRecord` and `resolveRecord` from `cacheHelper.js`.
- Refactor `useStudentDetailQuery`'s `queryFn` and `initialData` to use the helpers.

#### [MODIFY] [useTeacherQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js)
- Import `getCachedRecord` and `resolveRecord` from `cacheHelper.js`.
- Refactor `useTeacherDetailQuery`'s `queryFn` and `initialData` to use the helpers.

#### [MODIFY] [useCourseQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js)
- Import `getCachedRecord` and `resolveRecord` from `cacheHelper.js`.
- Refactor `useCourseDetailQuery` and `usePackageDetailQuery` to use the helpers.

#### [MODIFY] [useBatchQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/hooks/useBatchQueries.js)
- Import `getCachedRecord` and `resolveRecord` from `cacheHelper.js`.
- Refactor `useBatchDetailQuery` to use the helpers.

## Verification Plan

### Automated/Syntax Verification
- Ensure code compiles with no syntax errors.

### Manual Verification
- Test student/teacher/course registration flows.
- Monitor browser Network tab to ensure navigate actions do not trigger duplicate queries or redundant API calls.

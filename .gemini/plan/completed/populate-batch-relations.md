---
Date: 2026-05-28T17:05:00+05:30
Status: Approved-Completed
---

# Implementation Plan: Decouple Batch Relations Hydration

This plan outlines the decoupled implementation to fetch and hydrate course, teacher, and branch relations for batch queries without cluttering the hooks.

---

## User Review Required

> [!IMPORTANT]
> - **Helper Functions**: We will introduce `ensureBatchRelations` and `hydrateBatchRelations` as standalone utilities inside `useBatchQueries.js` (or imported).
> - **Clean Hooks**: `useBatchesQuery` and `useBatchDetailQuery` will call these helpers, maintaining clean and readable react-query code.

---

## Proposed Changes

### Batch Feature Layer

#### [MODIFY] [useBatchQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchQueries.js)
- Define `ensureBatchRelations(queryClient, token)` helper to prefetch course, teacher, and branch data into the react-query cache.
- Define `hydrateBatchRelations(batch, queryClient)` helper to map batch properties and append full `course`, `teacher`, and `branch` objects.
- Simplify `useBatchesQuery` and `useBatchDetailQuery` to use these helper functions inside their `queryFn` and `select` fields.

---

## Verification Plan

### Automated Verification (Manual Execution)
> [!NOTE]
> Run compilation checks:
```bash
npm run build
```

### Manual Verification
- Verify that batch listings and detail views resolve relations properly.

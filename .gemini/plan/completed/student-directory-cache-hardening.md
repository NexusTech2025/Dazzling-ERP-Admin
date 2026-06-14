---
Date: 2026-05-27T20:52:00+05:30
Status: Approved-Completed
---

# Implementation Plan: Student Directory Cache & Deletion Hardening

This plan outlines the changes required to fix the Student Directory (`/admin/students`) page query cache configurations, manual refresh query keys, ReferenceErrors in deletion, and parameter mismatches.

## User Review Required

> [!IMPORTANT]
> - **Query Cache Settings**: Changing `staleTime` from `Infinity` to `5 minutes` and enabling `refetchOnMount` on the primary student query (`useStudentsQuery`) to ensure fresh database records are fetched automatically on navigation.
> - **Centralized Invalidation**: Aligning refresh/delete actions with the centralized query key factories to maintain cache consistency across components.
> - **Authentication Retention**: Retaining the `useAuth` hook inside `Students.jsx` so that the component retains access to the user's token and active session context.

## Proposed Changes

### Student Query Hook Configurations

#### [MODIFY] [useStudentQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/hooks/useStudentQueries.js)
- Modify the `useStudentsQuery` query configuration to set `staleTime: 1000 * 60 * 5` (5 minutes) and `refetchOnMount: true`.
- This ensures navigating back to the Student Directory refetches real database records rather than locking the user to static/dummy cache.

### Student Directory Component

#### [MODIFY] [Students.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/Students.jsx)
- **Imports**: Remove unused `useMutation` import from `@tanstack/react-query`, but **retain** `useAuth` from `../../context/AuthContextCore` and import `queryKeys`.
- **Component Body**: Ensure `const { token } = useAuth();` is declared to preserve active session access.
- **Cache Invalidation Mismatches**:
  - Replace `queryClient.invalidateQueries({ queryKey: ['students'] })` with `queryClient.invalidateQueries({ queryKey: queryKeys.student.all })` in the Refresh button and DataTable `onRetry` callback.
- **Optimized Deletion Flow**:
  - Replace the ad-hoc `useMutation` with the centralized `useDeleteStudentMutation` custom hook.
  - Consolidate confirmation handling under a single `handleConfirmDelete` function that calls `deleteMutation.mutate({ id: deleteModal.id })`.
  - Pass `handleConfirmDelete` directly to the `ConfirmModal`'s `onConfirm` prop.
  - Reset modal state and selection states (`selectedStudentForView`, `selectedStudentForEdit`) in the deletion success callback if the deleted ID matches the active modals' student target.

---

## Verification Plan

### Automated/Compilation Verification
- Ensure project compiles successfully with no ESLint or Vite build errors.

### Manual Verification
1. **Mount & Navigation Test**: Navigate to Students, check the network tab to verify a database query request triggers on mounting.
2. **Refresh Action Test**: Click the "Refresh" button and check if a database query is successfully sent to the server.
3. **Delete Flow Test**:
   - Open a student detail view or edit modal.
   - Trigger the deletion dialog, click "Confirm Delete", and verify the deletion is processed without runtime errors.
   - Verify the detail or edit modal automatically closes upon successful deletion.
   - Verify the DataTable refetches and lists the updated student records.

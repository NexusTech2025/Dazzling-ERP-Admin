---
Date: 2026-05-24T12:45:00+05:30
Status: Approved-Completed
---

# Refactoring StudentEditModal & Adding Local Cache Resolver

Refactor `StudentEditModal.jsx` to use atomic UI components (`FormField`, `TextInput`, `SelectInput`, `DateInput`) from `src/components/ui/v2/`. Additionally, optimize `useStudentDetailQuery` in `useStudentQueries.js` by adding an `initialData` fallback function that checks direct and list queries cache first.

## Proposed Changes

### Student Feature

#### [MODIFY] [StudentEditModal.jsx](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/StudentEditModal.jsx)
- Import V2 Atomic UI components: `FormField`, `TextInput`, `SelectInput`, `DateInput`.
- Replace raw HTML `<input>` and `<select>` fields with corresponding atomic UI components wrapped in `FormField` to ensure clean labels, icons, errors, and dark mode theme alignment.
- Implement a streamlined `handleFieldChange(name, value)` handler to update student profile fields cleanly.

#### [MODIFY] [useStudentQueries.js](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/hooks/useStudentQueries.js)
- Modify `useStudentDetailQuery` to retrieve the `queryClient` using `useQueryClient()`.
- Add an `initialData` fallback function that first checks for a direct details cache (`queryKeys.student.detail(studentId)`), and then walks all active list caches (`queryKeys.student.lists()`) to find the matching student record.
- Add `initialDataUpdatedAt` matching the query state's data update timestamp.

---

## Verification Plan

### Manual Verification
- Verify that student profiles edit correctly within `StudentEditModal` and the fields render with the polished V2 styling.
- Check query caches in developer console/React Query devtools (if present) or monitor network requests to confirm `useStudentDetailQuery` resolves details instantly from local cache without triggering immediate blank screens or redundant network loads when navigating from list views.

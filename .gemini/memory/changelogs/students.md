# Student Module Changelog

This document tracks all recent modifications, feature enhancements, and bug fixes related to the Student Directory and associated registration wizards.

---

## Recent Changes

### [2026-05-27T23:41:00+05:30] - Created Section Architecture Reference Guide
- **Feature**: Developer Knowledge Base (`.gemini/memory/knowledge/`)
- **Impact**: Provides clear architectural and testing instructions to preserve styling and data logic consistency.
- **Detailed changes**:
  - Wrote the master [how_to_add_new_section.md](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.gemini/memory/knowledge/how_to_add_new_section.md) template manual.

### [2026-05-27T21:52:00+05:30] - Aligned BatchCard Schema details from Cache
- **Feature**: Student Registration Wizard (`/admin/students/add`)
- **Impact**: Guarantees matching course, teacher, and branch descriptions are displayed regardless of missing properties on raw batch objects.
- **Detailed changes**:
  - Refactored [BatchCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/BatchCard.jsx) to pull data elements dynamically from Query Client cache and render location, schedules, and capacities.

### [2026-05-27T21:48:00+05:30] - Decoupled Batch Selection Card Component
- **Feature**: Student Registration Wizard (`/admin/students/add`)
- **Impact**: Improves maintainability and code readability by moving batch UI cards to a reusable component.
- **Detailed changes**:
  - Created [BatchCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/BatchCard.jsx) in `src/features/batch/components/`.
  - Refactored [AcademicEnrollmentStep.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/steps/AcademicEnrollmentStep.jsx) to import and render `BatchCard`.

### [2026-05-27T20:57:00+05:30] - Enhanced Student Deletion Mutation Robustness
- **Feature**: Student Directory (`/admin/students`)
- **Impact**: Prevents silent failure, provides precise user feedback on database error vs. network/connection error.
- **Detailed changes**:
  - Hardened `useDeleteStudentMutation` in [useStudentQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/hooks/useStudentQueries.js#L151-L191) to validate `id` parameter.
  - Added `try/catch` wrapping around database fetch request, parsing Axios error responses and falling back to descriptive messages.
  - Updated fallback error messaging inside [Students.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/Students.jsx#L100-L107) to use `'Connection error. Please check your network.'`.

### [2026-05-27T20:54:00+05:30] - Hardened Student Directory Deletion & Caching
- **Feature**: Student Directory (`/admin/students`)
- **Impact**: Resolves page crashes, broken refresh buttons, and stale state problems when navigating back to the Student list.
- **Detailed changes**:
  - Replaced the ad-hoc `useMutation` in [Students.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/Students.jsx) with centralized [useDeleteStudentMutation](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/hooks/useStudentQueries.js#L151) hook.
  - Fixed query key invalidation mismatch where manual refresh buttons and retry blocks targeted the wrong query key strings (replaced `['students']` with `queryKeys.student.all`).
  - Added state cleanup logic that closes detail views and edit forms if the student targets are deleted.
  - Configured `staleTime: 1000 * 60 * 5` (5 minutes) and `refetchOnMount: true` in `useStudentsQuery` to guarantee fresh data reload on navigation.

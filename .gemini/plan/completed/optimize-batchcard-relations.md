---
Date: 2026-05-28T17:21:00+05:30
Status: Approved-Completed
---

# Implementation Plan: Optimize BatchCard Relations Usage

This plan outlines the steps to optimize `BatchCard.jsx` by removing redundant query client accesses and utilizing the pre-hydrated relational properties directly.

---

## User Review Required

> [!IMPORTANT]
> - **Redundancy Removal**: We will remove `useQueryClient` and the three `getQueryData` calls from `BatchCard.jsx`.
> - **Direct Prop Read**: The component will read `course`, `teacher`, and `branch` details directly from the pre-hydrated `batch` prop.

---

## Proposed Changes

### Batch Feature Layer

#### [MODIFY] [BatchCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/BatchCard.jsx)
- Remove `useQueryClient` and `queryKeys` imports.
- Delete cache retrieving and `.find()` resolver statements (Lines 17-27).
- Update name resolvers to read directly from props:
  - `courseName` from `batch.course?.name || batch.course_name`.
  - `teacherName` from `batch.teacher?.full_name || batch.teacher?.teacher_name || batch.instructor_name`.
  - `branchName` from `batch.branch?.branch_name || batch.branch?.name || batch.branch_name`.

---

## Verification Plan

### Automated Verification (Manual Execution)
> [!NOTE]
> Run the compilation build manually:
```bash
npm run build
```

### Manual Verification
- Render any views containing `BatchCard` (e.g. batch selectors or lists) and verify details (course, teacher, location) map correctly without errors.

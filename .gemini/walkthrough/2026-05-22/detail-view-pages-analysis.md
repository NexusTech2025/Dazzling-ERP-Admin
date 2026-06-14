---
date: 2026-05-22T19:53:15+05:30
status: Completed
---

# Walkthrough: Detail View Pages Architectural & Schema Analysis

This walkthrough summarizes the findings and results of our comprehensive diagnostic analysis of the 6 detail view pages in the ERP Admin app.

---

## 1. Summary of Accomplishments

We completed diagnostic analysis for all 6 target pages, producing detailed markdown reports under `dazzling-erp-admin/.gemini/docs/reports/`:
1. **Student Profile**: [student-profile.md](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.gemini/docs/reports/student-profile.md)
2. **Batch Profile**: [batch-profile.md](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.gemini/docs/reports/batch-profile.md)
3. **Teacher Profile**: [teacher-profile.md](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.gemini/docs/reports/teacher-profile.md)
4. **Course Details**: [course-details.md](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.gemini/docs/reports/course-details.md)
5. **Package Details**: [package-details.md](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.gemini/docs/reports/package-details.md)
6. **Student Fee Overview**: [student-fee-overview.md](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.gemini/docs/reports/student-fee-overview.md)

---

## 2. Key Findings & Architectural Gaps

### A. React Query Cache Issues
- **Lookup Bugs**:
  - **Batch Mappers**: `resolveBatchRelations` uses `getQueryData(['course', 'list'])`. However, courses list cache keys contain a filter object (e.g. `['course', 'list', { filter: {} }]`). Due to strict exact matching in `getQueryData`, this lookup returns `undefined`. It must be migrated to `getQueriesData` (as done correctly in the teacher and course hooks) or use `queryKeys.course.lists()` prefix.
  - **Student Profile**: Bypasses the cache by using a custom filter query key (`['students', 'list', { student_id: '...' }]`) instead of retrieving from the pre-existing general students list query cache.
  - **Package & Finance Details**: Both `usePackageDetailQuery` and `useStudentFeeOverviewQuery` completely lack `initialData` configuration, forcing a network fetch even if the corresponding lists are already loaded.

### B. Refetch on Mount Redundancies
- Profile queries for **Teacher Attendance**, **Batch Weekly Schedule**, **Student Fee Installments**, and **Package Details** do not define a `staleTime`. Consequently, they default to `0` and trigger redundant server refetches every time these tabs/components mount.

### C. Database Schema & Choice Mismatches
We identified several critical schema field name, format, and choice mismatches compared to the database schema in `full_schemav3.json`:

| File/Component | UI Field Reference | Database Schema Equivalent | Issue Description |
| :--- | :--- | :--- | :--- |
| `StudentProfile` | `student.date_of_birth` | `dob` | Column name mismatch |
| `StudentProfile` | `student.avatar` | `avatarUrl` | Column name mismatch |
| `BatchProfile` | `batch.enrolled_students` | *None* | Property doesn't exist on the Batch table schema |
| `TeacherProfile` | `teacher.teacher_name` | `full_name` | Column name mismatch |
| `TeacherProfile` | `teacher.mobile` | `mobile_number` | Column name mismatch |
| `TeacherProfile` | `teacher.avatar` | `profile_photo_url` | Column name mismatch |
| `TeacherProfile` | `teacher.designation` | `qualification` | Maps designation to qualification |
| `TeacherProfile` | `teacher.department` | *None* | Column doesn't exist on the Teacher schema |
| `TeachersAttendance` | `check_in_time: "09:00:00"` | `datetime` | Sends time-only string instead of full ISO datetime |
| `CourseDetails` | `course.is_active` | `status: "active"` | Checks boolean `is_active` instead of string `status` |
| `PackageDetails` | `pkg.courses` | `packagecourses` | Multi-layered join schema (`Package` -> `PackageCourse` -> `Course`) referenced as flat array |
| `PackageDetails` | `pkg.perks` | `packageperks` | Relation name mismatch |
| `StudentFeeOverview` | `inst.amount` | `due_amount` | Column name mismatch |
| `StudentFeeOverview` | `inst.status === 'Paid'` | `status: "paid"` / `status: "overdue"` | Case-sensitive uppercase checks fail on lowercase schema choices |
| `RecordPaymentModal` | `payment_mode` | `payment_method` | Column name mismatch |
| `RecordPaymentModal` | `payment_mode: "card"` | *None* | Choice `card` is not in the schema choices |
| `RecordPaymentModal` | `transaction_ref` | `transaction_reference` | Column name mismatch |
| `RecordPaymentModal` | `student_fee_id` | `student_fee_id` | Required column missing from mutation payload |

---

## 3. Verification Plan & Compliance
- **Verification**: Evaluated frontend components against the latest JSON schema `full_schemav3.json` and hook implementations.

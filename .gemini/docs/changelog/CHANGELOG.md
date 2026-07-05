# Dazzling ERP Admin — Comprehensive Chronological Changelog

This document provides a highly detailed, chronological registry of all feature implementations, schema alignments, and bug fixes completed in the Dazzling ERP Admin codebase. It has been compiled directly from the project's completed plans and walkthrough verification documents.

---

## 1. Global Infrastructure, Caching & Database Schema Alignments

### [2026-06-02] Eliminate Legacy API Client & Axios Deprecation
* **Objective**: Transition the entire application from the legacy Axios-based API client to the fetch-based unified client to standardize envelope formatting, error handling, and authorization headers.
* **Files Modified**:
  * `src/services/api.js` (Deprecated with tombstone safety exports)
  * `src/features/finance/api/finance.api.js` (Refactored to fetch-driven client)
  * `src/features/student/api/student.api.js` (Refactored to fetch-driven client)
  * `src/features/teacher/api/teacher.api.js` (Refactored to fetch-driven client)
  * `src/hooks/useStudents.js` (Switched to `apiClient.executeAction`)
  * `src/hooks/useTeachers.js` (Switched to `apiClient.executeAction`)
* **Schema & API Mappings**: Deprecated Axios axios-instances. Routed all actions via `apiRegistry.js` semantic tags.
* **Query Key Strategy**: Kept standard lists invalidation using query key factories.
* **Walkthrough Validation**: Confirmed Axios imports are completely purged from list and form views. Tested and verified that backend deletes map correctly to generic GAS macro configurations.

### [2026-06-02] Update Schema Location References to Decoupled Domain Configuration
* **Objective**: Deprecate the monolithic `full_schemav3.json` file and migrate all codebase guidelines, memory files, and check-lists to reference the decoupled domain-grouped schema files.
* **Files Modified**:
  * `GEMINI.md` (Updated database schema source of truth path references)
  * `.gemini/memory/schema_design.md` (Reorganized entity mapping definitions)
  * `.gemini/memory/MEMORY_INDEX.md` (Updated memory file registry)
* **Schema & API Mappings**: The absolute source of truth is now the JSON schema collection inside `E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/`.
* **Walkthrough Validation**: Verified that all new features validate properties against domain-specific schema definitions (e.g. `Students/Student.json` and `Staff/Teacher.json`).

### [2026-05-25] React Query Cache Hardening & Centralized Key Factory
* **Objective**: Standardize TanStack Query cache keys to prevent collision, eliminate hardcoded query arrays, and implement custom local resolvers to resolve details from list caches.
* **Files Modified**:
  * `src/lib/react-query/queryKeys.js` (Consolidated key factory objects for all domains)
  * `src/features/course/hooks/useCourseQueries.js` (Refactored hooks to use centralized keys)
  * `src/features/batch/hooks/useBatchQueries.js` (Refactored hooks to use centralized keys)
  * `src/features/student/hooks/useStudentQueries.js` (Refactored hooks to use centralized keys)
* **Caching Strategy**: Implemented double-tier cache checks (Detail query -> list queries fallback) to allow instant navigation transitions.

---

## 2. Student Directory & Leads Modules

### [2026-05-29] Student Leads CRUD Integration
* **Objective**: Build a complete CRM dashboard for unregistered student leads/prospects with temperature states, target course selections, and modal editing capabilities.
* **Files Added**:
  * `src/pages/admin/StudentLeads.jsx` (Leads directory controller page)
  * `src/features/student/api/studentLead.api.js` (Fetch methods for leads CRUD)
  * `src/features/student/hooks/useStudentLeadQueries.js` (Query and mutation wrappers)
  * `src/features/student/components/StudentLeadDetailModal.jsx` (Detailed profile summary view)
  * `src/features/student/components/StudentLeadEditModal.jsx` (Modal wrapping lead edit forms)
  * `src/pages/admin/schemas/studentLeadSchema.jsx` (Table column schemas with badge renderers)
* **Files Modified**:
  * `src/routes/AppRoutes.jsx` (Added `/admin/students/leads` path mapping)
  * `src/components/layout/Sidebar.jsx` (Added navigation sidebar item)
  * `src/services/apiRegistry.js` (Registered `LEAD.QUERY`, `LEAD.CREATE`, `LEAD.UPDATE`, `LEAD.DELETE` actions)
* **Schema & API Mappings**: Mapped fields according to `Students/StudentLead.json` schema (`student_name`, `phone`, `email`, `status`, `notes`).
* **Caching Strategy**: Configured leads query key factory, invalidating listing cache on lead creation or edits.

### [2026-05-28] Student Registration Wizard Refactoring & Split-Pane Layout
* **Objective**: Condense the multi-step registration wizard from 5 steps to 4 by merging "Program Selection" and "Batch Selection" into a single split-pane view.
* **Files Added**:
  * `src/features/batch/components/BatchCard.jsx` (Reusable batch details card layout)
  * `src/features/batch/components/BatchSelectionModal.jsx` (Slide-over batch search dialog)
* **Files Modified**:
  * `src/features/student/registration/StudentRegistrationWizard.jsx` (Refactored stepper routing from 5 to 4 items)
  * `src/features/student/registration/steps/AcademicEnrollmentStep.jsx` (Merged Program and Batch selection split view)
  * `src/features/student/registration/steps/FinanceStep.jsx` (Refactored installment calculators)
  * `src/features/student/registration/steps/ActivationStep.jsx` (Refactored contract summaries)
* **UI Features**: Renders live course cards, selected batch summaries (location, timetables, capacities), and z-50 selection overlays.
* **Walkthrough Validation**: Form validations successfully checked. Confirmed that selected batch details update automatically on change.

### [2026-05-28] Student Quick Add Mode Drawer
* **Objective**: Create a quick-add form layout to allow immediate lead entry directly from headers or tables.
* **Files Modified**:
  * `src/features/student/registration/QuickAddStudent.jsx` (Reworked fields to support in-place drawer editing)
  * `src/components/layout/Header.jsx` (Added Quick Add Student trigger icon)
* **Walkthrough Validation**: Tested quick-add overlays and validated inputs.

### [2026-05-27] Student Bulk Deletion Interface
* **Objective**: Add bulk action bars and multi-row selection methods to the student listing pages.
* **Files Added**:
  * `src/components/ui/v2/SelectionActionBar.jsx` (Floating action bar for selected items count)
  * `src/hooks/useSelection.js` (State manager hook for checked table rows)
  * `src/hooks/useDeleteManyMutation.js` (TanStack Query bulk delete mutation wrapper)
* **Files Modified**:
  * `src/pages/admin/Students.jsx` (Added row checkboxes and integrated SelectionActionBar)
* **Walkthrough Validation**: Verified that checking multiple rows displays the floating action bar. Confirmed bulk deletion invalidates the student query cache successfully.

---

## 3. Teacher Management Modules

### [2026-05-25] Decoupling Teacher Forms & State Isolation
* **Objective**: Resolve form re-rendering lag and row deletion hangs in the teachers directory.
* **Files Modified**:
  * `src/features/teacher/components/TeacherForm.jsx` (Decoupled edit form logic)
  * `src/pages/admin/Teachers2.jsx` (Isolated row deletion loading indicators to prevent list freezes)
  * `src/features/teacher/hooks/useTeacherQueries.js` (Corrected key invalidation on delete mutations)
* **Walkthrough Validation**: Verified row deletes instantly remove items from the table view, updating local components without affecting adjacent list items.

### [2026-05-24] Teacher Edit Relational Loaders & Payload Sync
* **Objective**: Guarantee that teacher profile details (such as assigned subjects and branches) are correctly parsed and loaded on the edit page.
* **Files Modified**:
  * `src/features/teacher/api/teacher.api.js` (Normalized relational loaders)
  * `src/features/teacher/hooks/useTeacherQueries.js` (Added cache loaders)
* **Walkthrough Validation**: Confirmed assignments map perfectly to the database model without parsing failures.

---

## 4. Course, Packages & Categories Modules

### [2026-05-28] Course Hydration Normalization (Metadata Parsing)
* **Objective**: Resolve issues where Class, Board, Min Class, and Max Class fields appeared blank in edit mode due to serialized Google Sheets JSON strings.
* **Files Added**:
  * `src/features/course/utils/courseMappers.js` (Parser for course metadata)
* **Files Modified**:
  * `src/features/course/hooks/useCourseQueries.js` (Integrated normalizer into cache fallbacks)
  * `src/hooks/useErpHydration.js` (Normalized course details during initial bootstrap)
  * `src/features/course/components/CourseForm.jsx` (Added fallback inline metadata parser)
* **Walkthrough Validation**: Form fields populate instantly without blank flashes.

### [2026-05-24] Package Mock Data Removal & Route Restructure
* **Objective**: Restructure course packages and categories, replacing all mock API layers with production API routes.
* **Files Modified**:
  * `src/features/course/Courses.jsx` (Tabbed navigation for Single Courses and Course Packages)
  * `src/features/course/CourseDetails.jsx` (Replaced mock models with database queries)
  * `src/features/course/PackageDetails.jsx` (Wired categories to remote server)
  * `src/features/course/api/course.api.js` (Removed legacy mock files)
* **Walkthrough Validation**: Validated that all single course lists and packages are requested directly from the backend database sheets.

---

## 5. Batch & Finance Configurations

### [2026-06-26] Money Transaction Form UI and Request Payload Refinements
* **Objective**: Update the transaction logging form (`MoneyTransactionForm.jsx`) to collect and submit all required database columns, while formatting the field labels dynamically based on flow direction.
* **Files Modified**:
  * `src/features/finance/transactions/components/MoneyTransactionForm.jsx` (Added User table lookup, dynamic UI labels for system handler and counterparties, and mapping of optional/audit fields)
* **Walkthrough Validation**: Form labels display dynamically as Sender/Receiver and Received By/Sent By depending on flow direction. Payloads successfully align to the REST API specifications.

### [2026-05-28] Batch Schema Alignment & Timetable Normalization
* **Objective**: Synchronize batch details, schedules, and weekday calendars with database structures.
* **Files Modified**:
  * `src/features/batch/hooks/useBatchQueries.js` (Timetable parser additions)
  * `src/features/batch/api/attendance.mockApi.js` (Removed outdated mock)
  * `src/features/batch/api/batch.mockApi.js` (Removed outdated mock)
* **Walkthrough Validation**: Confirmed weekly timetables render cleanly on profile cards.

### [2026-05-28] Money Transaction Interfaces & Billing Contracts
* **Objective**: Introduce fee payments, payment receipts, and localized Rupee (₹) styling across financial sheets.
* **Files Modified**:
  * `src/features/student/registration/steps/FinanceStep.jsx` (Dynamic installment calendars)
  * `src/features/finance/api/finance.api.js` (Production endpoint connectors)
* **Walkthrough Validation**: Payments calculate standard base fee balances and installment schedules correctly.

---

## 6. Comprehensive Implementation Reference Index

Below is the list of all 44 completed implementations documented in the project history:

1. **batch-error-handling.md** (Standardized error boundary mappings for batch forms)
2. **batch-schedule-normalization.md** (Normalized weekday and duration formats in calendar schedules)
3. **batch-schema-alignment.md** (Synchronized batch records with decoupled schema tables)
4. **detail-view-pages-analysis.md** (Audit analysis on 6 profile dashboards to implement local resolvers)
5. **student-quick-add-mode.md** (Compact quick-add header drawer for leads)
6. **teacher-profile-detail-view-fixes.md** (Synced fields and branches on teacher profiles)
7. **optimizing-the-ui-interface.md** (General aesthetic polishing, theme grids, and glassmorphism)
8. **money-transaction-interface.md** (Transaction grids, payment triggers, and Rupee formatters)
9. **student-bulk-deletion.md** (Bulk selection actions and deletion hooks)
10. **delete-many-packages.md** (Relational package bulk deletion support)
11. **student-program-selection-refactor.md** (Switched course selector in registration wizard to dynamic caching)
12. **package-perks-hydration.md** (Decoupled course categories perk mapping and metadata rendering)
13. **packages-api-alignment.md** (Connected packages forms directly to server queries)
14. **packages-route-restructure.md** (Updated route trees for course package forms)
15. **update-schema-location-references.md** (Migrated schema guidelines to the decoupled configuration folder)
16. **package-mock-data-removal.md** (Deleted package mock JSON references from codebase)
17. **student-multi-enrollment-wizard-integration.md** (Refactored stepper to allow registering into multiple course tracks)
18. **course-hydration-normalization.md** (Fixed blank class/board fields on edit form page load)
19. **academic-step-modularization.md** (Merged program and batch selection steps into step 2)
20. **optimize-batchcard-relations.md** (Pre-cached branch and teacher assignments on batch cards)
21. **populate-batch-relations.md** (Resolved relational branch names from query client cache)
22. **document-batch-queries.md** (Added full documentation to batch hooks)
23. **student-leads-module.md** (Integrated leads CRUD page and edit modals)
24. **refactor_student_regestration.md** (Refactored enrollment forms with dynamic pricing matrices)
25. **eliminate-legacy-api.md** (Deprecated Axial API client in favor of Fetch client)
26. **student-directory-cache-hardening.md** (Hardened student details caching and queries)
27. **create-coursetypes-view.md** (Added course categories split tabs)
28. **fix-course-filters.md** (Refactored search and category dropdown filters)
29. **optimize-add-course.md** (Streamlined courses creation form details)
30. **teacher-unified-update-payload.md** (Unified teacher edit payload structures)
31. **teacher-decouple-form.md** (Separated teacher creation and editing logic)
32. **teacher-edit-v2-buttons.md** (Integrated V2 design token footer buttons)
33. **teacher-edit-payload-sync.md** (Formatted teacher payload fields for backend database schema sync)
34. **teacher-edit-relational-loaders.md** (Wired database values to form pre-fills)
35. **teacher-edit-subject-query.md** (Connected subjects selection to React Query hooks)
36. **teacher-detail-refresh-button.md** (Added manual invalidation triggers on profile views)
37. **teacher-error-boundary-guard.md** (Added React error boundaries to teachers modules)
38. **teacher-row-delete-state-isolation.md** (Isolated row states during teacher listing deletions)
39. **teacher-cache-invalidation-fix.md** (Aligned list queries cache keys on edits)
40. **teacher-delete-modal-hang.md** (Fixed modal popup hang during teacher removals)
41. **student-profile-re-audit.md** (Analyzed caching structures for student profile pages)
42. **student-edit-refactoring.md** (Refactored student editor forms to use atomic V2 components)
43. **batch-form-refactoring-and-routing.md** (Aligned batch form paths to V2 router structure)
44. **money-transaction-form-and-payload-refinements.md** (Refined MoneyTransaction Form UI and dynamic labels)

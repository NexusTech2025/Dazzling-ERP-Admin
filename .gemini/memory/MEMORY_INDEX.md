# Project Memory Index

This file serves as the central directory map for the project's architectural memory stored in `.gemini/memory/`.

## Core Memory Files

| File | Description | Last Updated |
|---|---|---|
| `architecture.md` | System-wide design patterns (V2, Hydration, Mappers). | 2026-05-18 |
| `schema_design.md` | Database entity standards and field alignment rules. | 2026-05-18 |
| `components.md` | Catalog of structural and compound UI components. | 2026-05-18 |
| `anti_patterns.md` | Ledger of failed approaches and critical bug fixes. | 2026-05-18 |
| `query_dsl.md` | TanStack Query implementation and DSL rules. | 2026-05-14 |
| `api_design.md` | API Client, Registry, and Envelope standards. | 2026-05-14 |
| `course_api_specs.md` | Specific API specifications for courses. | 2026-05-14 |
| `ui_component/` | Directory for atomic UI primitives and specialized inputs. | 2026-05-14 |

## Recent Session Updates

### Session: `chat.detail_view_pages_analysis.md` (2026-05-22)
- **Feature**: Diagnostic Analysis of 6 Detail View Pages (`StudentProfile`, `BatchProfile`, `TeacherProfile`, `CourseDetails`, `PackageDetails`, `StudentFeeOverview`).
- **Architectural Shift**: Identified critical cache lookup issues where exact query key lookups (`getQueryData`) fail on dynamic filter parameters, suggesting migration to prefix-based custom select mappings.
- **UI Pattern**: Mapped UI state components to proper API response schemas to prevent hydration mismatches and eliminate unnecessary client-side mappers.
- **Schema Alignment**: Documented extensive list of schema/naming mismatches (e.g. `is_active` vs `status`, `teacher_name` vs `full_name`, lowercase enum value casing checks) to be synchronized in execution.

### Session: `chat.updateing_add_student.md` (2026-05-20)
- **Feature**: `StudentRegistrationWizard.jsx` Consolidation & Optimization.
- **Architectural Shift**: Merged "Program Selection" (Step 2) and "Batch Selection" (Step 3) into a single 2-column "Academic Enrollment" step (`AcademicEnrollmentStep.jsx`), reducing the wizard from 5 steps to 4.
- **UI Pattern**: Designed a compact 2-column Split-Panel layout to minimize vertical scrolling. Integrated `ToggleSwitch` for optional benefits visibility.
- **Centralized Caching**: Wired live batch retrieval using the TanStack Query `useBatchesQuery` hook for cache-first resolution.

### Session: `chat.refactory_teachers_add_page.md` (2026-05-18)
- **Feature**: `AddTeacher.jsx` Refactoring.
- **Architectural Shift**: Transitioned from static hardcoded options to dynamic React Query resolution for Branches and Courses.
- **UI Pattern**: Introduced `CourseSelectionModal` as the standard for multi-pane, filterable entity assignment.
- **Schema Alignment**: Enforced strict field naming (`full_name`, `mobile_number`) and ID-based selection (`course_id`) across the Teacher registration flow.
- **Bug Fix**: Documented the "Initialization Dependency" anti-pattern resolved during the session.

---
*Created by Autonomous Memory Builder Agent.*

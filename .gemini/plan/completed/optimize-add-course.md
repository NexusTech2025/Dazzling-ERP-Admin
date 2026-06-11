---
Date: 2026-05-27T17:36:00+05:30
Status: Approved-Completed
---

# Optimize Course Form UI & Separate List/Grid View Components

This plan refactors [AddCourse.jsx](file:///e:/NAST\Dazzling\ERP System\dazzling-erp-admin/src/features/course/AddCourse.jsx) and [Courses.jsx](file:///e:/NAST\Dazzling\ERP System\dazzling-erp-admin/src/features/course/Courses.jsx) to utilize the project's standard V2 Atomic UI components and separate presentation components.

## User Review Required

> [!IMPORTANT]
> - **Component Extraction**:
>   - Extracted **CourseForm.jsx** to encapsulate course registration form state and UI (including Category selector toggle logic).
>   - Extracted **CourseListView.jsx** to isolate the course DataTable definition and column schema.
>   - Extracted **CourseGridView.jsx** to isolate the grid logic mapping `CourseCard` components.
> - **Exposing Hidden Fields**: Exposing `default_installment_count` and `is_active` (status toggle) inside `CourseForm.jsx` UI.
> - **Aesthetics**: Using Slate-800 background cards (`FormSection`) on Slate-900 canvas, with compact padding (`py-2`) and precise border radii (`rounded-lg`) matching the system's design guidelines.

## Open Questions

- *None.*

## Proposed Changes

### Course Feature Components

#### [NEW] [CourseForm.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/components/CourseForm.jsx)
- Form layout utilizing V2 components: `FormSection`, `FormField`, `TextInput`, `SelectInput`, `SegmentedControl`, `ToggleSwitch`, `Button`.
- Manage localized form values, validation, and dynamic inline creation panel for Category types.
- Receive `formData`, `handleChange`, `setFormData`, `courseTypes`, `isLoadingTypes`, `onSubmit`, `isSaving`, `error`, `setError`, and `newTypeData`/`setNewTypeData`/`isCreatingType`/`setIsCreatingType`/`handleCreateType` or encapsulate them inside the form.
- For maximum independence and clarity, `CourseForm` can receive initial state/values and return the aligned payload on successful validate & submit to its parent, or directly receive mutation callbacks. We will design it to receive:
  - `initialData` (for editing course)
  - `courseTypes` and `isLoadingTypes` (for categories dropdown)
  - `onSubmit` (handles aligned payload submittal)
  - `isSaving` (saving indicator state)
  - `createTypeMutation` (for handling inline category type creation)

#### [NEW] [CourseListView.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/components/CourseListView.jsx)
- A dedicated list view component for courses that renders `<DataTable>` with the defined `courseColumns`.
- Receives `courses` (filtered courses array) and `onDelete` (handler for archiving/deleting courses).

#### [NEW] [CourseGridView.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/components/CourseGridView.jsx)
- A dedicated grid view component for courses that maps through `courses` and renders `<CourseCard>`.
- Receives `courses` and `onDelete`.

#### [MODIFY] [AddCourse.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/AddCourse.jsx)
- Refactor to act as the page container: handles URL params (`id`), fetches `existingCourse` and `courseTypes`, and passes handlers/data down to `<CourseForm>`.
- Use the standard `<Breadcrumbs>` component at the top of the container page.

#### [MODIFY] [Courses.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/Courses.jsx)
- Clean up the file by removing inline `courseColumns` declaration and grid mapping loops.
- Import and render `<CourseListView>` and `<CourseGridView>` in place of raw lists/tables.

---

## Verification Plan

### Manual Verification
> [!NOTE]
> The user requested to verify form submission, page navigation, and view switching manually.

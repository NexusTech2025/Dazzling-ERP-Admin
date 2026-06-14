---
Date: 2026-06-12T00:25:00+05:30
Status: Approved-Completed
---

# Quick Build Form Enhancements (Spinners, Dialogs & Existing Course Selection)

This plan outlines additional improvements to the Quick Build Package form (`src/features/course/InlineCoursePackagesForm.jsx`). The modifications add a submission spinner, success and failure overlay dialog boxes using standard system components, and support for adding pre-existing courses/subjects alongside dynamically created inline courses.

## User Review Required

> [!IMPORTANT]
> - **Standardized Dialog Modals**: We will use the system's shared UI modals documented in [models.md](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.gemini/memory/models.md):
>   - **Success State**: Handled by [ConfirmModal.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/ConfirmModal.jsx) with `status="success"` and custom `resultMessage`.
>   - **Failure State**: Handled by [APIErrorModal.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/APIErrorModal.jsx) to display structured backend error codes and collapsible logs.
> - **Hybrid Payload (Inline + Existing)**: Existing courses selected via the catalog will be sent without the `"on_demand": true` flag and will only map the `"entity_type"` and `"entity_id"` properties. Inline courses will retain `"on_demand": true` and all schema properties.
> - **Read-Only Rows**: Row inputs representing pre-existing courses will be locked and disabled in the UI to prevent administrators from modifying existing catalog structures.

## Proposed Changes

### Course Packages Inline Creator Form

#### [MODIFY] [InlineCoursePackagesForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/InlineCoursePackagesForm.jsx)
- **Imports**:
  - Import `useCoursesQuery` from `src/features/course/hooks/useCourseQueries` to load existing catalog items.
  - Import `CourseSelectionModal` from `src/features/course/components/CourseSelectionModal`.
  - Import `APIErrorModal` from `src/components/ui/APIErrorModal`.
  - Import `ConfirmModal` from `src/components/ui/ConfirmModal`.
- **State Additions**:
  - `isSelectionModalOpen`: Boolean to toggle the course selection modal.
  - `modalState`: Object `{ isOpen: false, status: 'idle' | 'success' | 'error', error: null, resultMessage: '' }` to control the success/failure overlays.
- **Save Button**:
  - Render a loading spinner inline when the mutation is pending.
- **Result Dialogs**:
  - Render `ConfirmModal` for the **Success State** when `modalState.status === 'success'`. The `onClose` callback navigates to `/admin/packages`.
  - Render `APIErrorModal` for the **Failure State** when `modalState.status === 'error'`, displaying the details and options to retry.
- **Select Existing Course Option**:
  - Render a secondary outlined button `+ Select Existing Course` next to `+ Add Course Row`.
  - When clicked, open `CourseSelectionModal`.
  - On select, append the selected course(s) to `inlineCourses` with an added flag `isExisting: true`.
  - In the table rows render, if `course.isExisting` is true:
    - Disable all inline input fields (`name`, `short_code`, `entity_type`, `segment_id`, `language_medium`, `duration_value`, `duration_unit`, `base_fee`, `default_installment_count`, `status`).
    - Change their background to slate-50/gray to visually denote their read-only state.
- **Save Payload Mapping**:
  - Update payload builder to map existing rows:
    ```javascript
    const coursesPayload = inlineCourses.map(c => {
      if (c.isExisting) {
        return {
          entity_type: c.entity_type,
          entity_id: c.course_id // uses actual database ID (e.g. CRS-...)
        };
      }
      return {
        entity_type: c.entity_type,
        on_demand: true,
        name: c.name.trim(),
        short_code: c.short_code.trim().toUpperCase(),
        // ... all fields
      };
    });
    ```

## Verification Plan

### Manual Verification
- Navigate to the **Quick Build Package** form.
- Click **+ Select Existing Course**. Use the modal to select an existing course.
- Verify that the course is appended to the table with all fields disabled/grayed out.
- Verify that the total fee sum and savings badge calculations include the fee of the selected existing course.
- Enter a duplicate short code for an on-demand course. Submit and verify that the `APIErrorModal` is displayed with the exact message.
- Fix the duplicate error and submit. Verify that the `ConfirmModal` (in success state) is displayed showing the created package details.

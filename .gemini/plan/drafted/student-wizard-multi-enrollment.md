---
Date: 2026-05-29T07:54:00+05:30
Status: Proposed
---

# Student Registration Wizard Step 2 Multi-Enrollment Integration Plan

This plan details how to integrate the dynamic, multi-select Packages vs Batches selection modal and the multi-program ledger layout from the validated `TestPrototype` component into the production student registration wizard without disrupting the existing wizard steps.

## User Review Required

> [!IMPORTANT]
> **Relational Database Payload Ambiguity (GAS Backend)**
> The production Apps Script backend `student_register` action currently expects a single `"enrollment"` object containing one `item_id` and one `batch_id`.
> 
> To support enrolling a student in **multiple programs/batches simultaneously** without modifying the Apps Script backend transactional boundary:
> 
> * **Proposed Client-Side Solution**: 
>   1. The wizard submits the first selected program/batch inside the standard `student_register` payload.
>   2. On successful registration, the mutation callback will execute the subsequent enrollments sequentially (using the `'academic_enroll_student'` action endpoint) in the background before routing back to the directory.
> * **Alternative**: If the backend is modified to support an array of enrollments directly, we will structure the payload as an array of enrollments.
> 
> *We recommend the Client-Side Solution (Approach B) to ensure backward compatibility with the existing backend sheet triggers.*

---

## Proposed Changes

### 1. Wizard State Management & API Client

#### [MODIFY] [StudentRegistrationWizard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/StudentRegistrationWizard.jsx)
* Add `selectedItems` array to `formData` initialized as `[]`.
* Map the final transaction payload on submit. If multiple items are selected:
  * Extract the first item as the primary `"enrollment"` inside the `student_register` payload.
  * Pass the remaining items in an array for subsequent dispatch in the success callback.

#### [MODIFY] [useStudentQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/hooks/useStudentQueries.js)
* Refactor the `useRegisterStudentMutation` success handler:
  * Check if there are secondary enrollments. If yes, map over them and trigger the `academic_enroll_student` action sequentially in the background.
  * Invalidate query cache keys for student lists once all actions resolve.

---

### 2. Step 2 UI Components (Academic Enrollment)

#### [NEW] [AcademicEnrollmentSelectionModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/components/AcademicEnrollmentSelectionModal.jsx)
* Extract the selection modal from the prototype into a standalone, modular component:
  * Connect to cached database values by calling `useBatchesQuery` and `usePackagesQuery`.
  * Support the packages vs batches toggle and category filters (`Academic`, `Computer`, `Competitive`, `Foundation`).
  * Implement active list item toggles (add/remove from `selectedItems` state array).

#### [MODIFY] [AcademicEnrollmentStep.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/steps/AcademicEnrollmentStep.jsx)
* Replace the `BatchSelectionModal` import with the new `AcademicEnrollmentSelectionModal`.
* Replace `ProgramSelectionCard` with a simplified `AdmissionSettingsCard` (removing the primary program type toggle).
* Remove the `Include Standalone Skill Courses` card.
* Display the list of selected packages/batches from `formData.selectedItems` as glassmorphic cards with delete actions.
* Update step navigation disabled check to require `formData.selectedItems.length > 0`.

---

### 3. Step 3 & Step 4 Financial Adjustments

#### [MODIFY] [FinanceStep.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/steps/FinanceStep.jsx)
* Modify the `baseFee` calculation to sum up all tuition fees of items in `formData.selectedItems`.
* Determine `installmentCount` based on the maximum `default_installment_count` among all selected courses/packages.
* Recompute installment splits and totals dynamically.

#### [MODIFY] [ActivationStep.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/steps/ActivationStep.jsx)
* Replace the single academic program card layout with a map listing all selected items (name, type, category, fee) from `formData.selectedItems`.

---

## Verification Plan

### Automated / Integration Checks
* Compile the bundle and verify there are no syntax or reference errors in step rendering.

### Manual Verification
* Go through the 4-step wizard:
  1. Profile step: Fill details.
  2. Academic step: Open the new modal, switch between packages and batches, filter by computer/academic, toggle multiple items, and verify they appear in the selected list.
  3. Finance step: Confirm the Tuition Base Fee equals the sum of the selected items.
  4. Activation step: Review that all items are listed and proceed to submit. Check network payloads in devtools.

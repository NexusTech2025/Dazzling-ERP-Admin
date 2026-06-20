# Walkthrough - Add Student Layout Protocol Alignment
Date: 2026-06-17T01:10:00+05:30
Status: Completed, Verified

We have successfully refactored the Add Student page and its sub-tabs (`Quick Student Lead` and `Full Student Registration`) to align with repository-wide page layout and scroll lock protocols.

## Changes Implemented

### 1. Add Student Layout Protocol Alignment
* **[AddStudent.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/pages/admin/AddStudent.jsx)**:
  - Simplified this parent page view to act as a layout switcher, passing shared toggles (`modeToggle`) and navigation paths (`crumbs`) to children.
* **[QuickAddStudent.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/QuickAddStudent.jsx)**:
  - If `isEdit` is true (edit lead modal), preserved original structure.
  - If `isEdit` is false (page tab view):
    - Wrapped the layout in `MainLayout` with scroll monitoring (`isSticky` state).
    - Rendered the shared toggle, breadcrumbs, and form inside the body slot.
    - Moved the "Cancel" and "Save Student Lead" buttons into the sticky footer slot. The save button submits the form via the `form="quick-student-form"` attribute.
* **[StudentRegistrationWizard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/StudentRegistrationWizard.jsx)**:
  - Wrapped the wizard in `MainLayout`.
  - Placed the progress indicator stepper in the sticky `header` slot so it remains pinned at the top of the viewport during vertical scrolling.
  - Lifted step-specific actions (Cancel, Back, Save & Continue, and Complete & Activate) into the sticky footer slot.
  - Calculated profile validation, batch selection, and manual checksum validation at the wizard level to dynamically control button disable/enable states in the footer.
* **[ProfileStep.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/steps/ProfileStep.jsx)**, **[AcademicEnrollmentStep.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/steps/AcademicEnrollmentStep.jsx)**, and **[ActivationStep.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/steps/ActivationStep.jsx)**:
  - Removed their local navigation buttons.
  - Lifted the `immediatePayment` toggle state from `ActivationStep` to the wizard parent.

### 2. Sticky Footer Buttons & Roundness Customizations
* **[QuickAddStudent.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/QuickAddStudent.jsx)** & **[StudentRegistrationWizard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/StudentRegistrationWizard.jsx)**:
  - Used custom V2 `Button` components styled in medium size (`size="md"` / `h-10 px-5 text-xs uppercase`).
  - Restored footer vertical padding to `py-3` to provide high usability on desktop and mobile viewports.
  - Overrode default roundness classes: applied `!rounded-md` class to the action buttons and `rounded-lg` (previously `rounded-xl`) to the outer footer block to achieve a cleaner, less-rounded rectangular aesthetic.

### 3. Save Button Disable & Carry-Over Bugfixes
* **[StudentRegistrationWizard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/StudentRegistrationWizard.jsx)**:
  - Updated `isProfileStepDisabled` to allow 10-digit mobile numbers as well as 12-digit mobile numbers (containing standard `91` country code prefix). This prevents pre-populated lead data with country codes from locking the user out of the wizard step.
* **[AcademicEnrollmentStep.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/steps/AcademicEnrollmentStep.jsx)**:
  - Added a `useEffect` synchronization hook that auto-populates the enrollment basket and physical batch selections using `courseId` and `batchId` pre-populated from lead upgrades. This prevents the cart from loading empty and permanently blocking step 2 validation.

### 4. React Hook Form & Yup Validation Integration
* **[schemas.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/utils/schemas.js)**: Created step-by-step Yup validation schemas to validate the fields for profile information, enrollment checklists, batch assignments, and payment transaction details.
* **[StudentRegistrationWizard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/StudentRegistrationWizard.jsx)**: Integrated RHF `useForm` hooks, wrapped step components in `<FormProvider>`, and routed step state updates through RHF parameters. Navigation footer buttons are kept enabled, and clicking them triggers step validation via `methods.trigger()`.
* **[ProfileStep.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/steps/ProfileStep.jsx)**, **[AcademicEnrollmentStep.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/steps/AcademicEnrollmentStep.jsx)**, and **[ActivationStep.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/steps/ActivationStep.jsx)**: Linked step inputs to display RHF `errors` dynamically. Custom input value setters were wrapped in a RHF updater utility that calls `setValue(..., { shouldValidate: true })` to instantly clear active validation errors on value change.

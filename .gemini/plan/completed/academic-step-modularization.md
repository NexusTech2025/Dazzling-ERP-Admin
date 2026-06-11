---
Date: 2026-05-28T18:07:00+05:30
Status: Approved-Completed
---

# Implementation Plan - Modularizing AcademicEnrollmentStep

This plan details the extraction of sub-components from `AcademicEnrollmentStep.jsx` into the `src/features/student/registration/components` directory to improve codebase modularity, reuse, and maintainability.

## Proposed Changes

We will create six new modular components and refactor the main enrollment step component.

### [NEW] [ProgramSelectionCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/components/ProgramSelectionCard.jsx)
Extracts the program selection segmented controls and the admission type select inputs.

### [NEW] [ScholarshipEligibilityCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/components/ScholarshipEligibilityCard.jsx)
Extracts the entrance score numeric inputs and the dynamic scholarship percent display panel.

### [NEW] [BenefitsCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/components/BenefitsCard.jsx)
Extracts the coupon code and referral ID inputs, managed by an internal toggle state for benefits visibility.

### [NEW] [SelectedBatchCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/components/SelectedBatchCard.jsx)
Renders the details of the selected batch, including branch center, teacher name, schedule time, and capacity.

### [NEW] [BatchPlaceholderCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/components/BatchPlaceholderCard.jsx)
Renders the empty selection placeholder state when no batch has been selected.

### [NEW] [StepNavigation.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/components/StepNavigation.jsx)
Renders the back and next button controls at the bottom of the registration step.

---

### [MODIFY] [AcademicEnrollmentStep.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/steps/AcademicEnrollmentStep.jsx)
Refactor to import and use the extracted components, passing the appropriate props and maintaining state.

## Verification Plan

### Manual Verification
- Render `/admin/students/add` and proceed to Step 2.
- Verify that Program Selection, Scholarship inputs (when "Entrance Exam" mode is chosen), and Benefits input blocks render exactly as before.
- Open batch selector modal, pick a batch, verify the selected batch card updates with real data, and verify that navigating to Step 3 and back maintains state properly.

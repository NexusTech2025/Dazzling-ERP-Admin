# Entity Forms Catalog

This document registers all the interactive forms and wizards within the Dazzling ERP Admin codebase.

## 1. Student & Leads Forms
*   **Registration Wizard**: [StudentRegistrationWizard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/StudentRegistrationWizard.jsx)
    *   *Purpose*: Orchestrates the multi-step registration flow.
    *   *Steps*:
        1.  [ProfileStep.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/steps/ProfileStep.jsx): Collects personal data, emergency contacts, and education background.
        2.  [AcademicEnrollmentStep.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/steps/AcademicEnrollmentStep.jsx): Handles course/package selections and batch assignments.
        3.  [ActivationStep.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/registration/steps/ActivationStep.jsx): Handles financial setup, billing schedules, and initial payments.
*   **Student Edit**: [StudentEditModal.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/components/StudentEditModal.jsx)
    *   *Purpose*: Modal form to edit existing student profiles.
*   **Student Leads**: [StudentLeadEditModal.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/student/components/StudentLeadEditModal.jsx)
    *   *Purpose*: Modal form to onboard and modify unregistered student leads.

## 2. Faculty & Teacher Forms
*   **Teacher/Faculty Form**: [TeacherForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/TeacherForm.jsx)
    *   *Purpose*: Form for full faculty onboarding and profile updates (personal details, credentials, branches, payroll configuration, time-slots, and credentials).

## 3. Course & Package Forms
*   **Course Form**: [CourseForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/components/CourseForm.jsx)
    *   *Purpose*: Form to add/edit single academic courses.
*   **Course Categories**: [CreateCourseTypeModal.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/components/CreateCourseTypeModal.jsx)
    *   *Purpose*: Modal form for adding course classification types.
*   **Packages Builders**:
    *   [CoursePackagesForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/CoursePackagesForm.jsx)
    *   [InlineCoursePackagesForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/InlineCoursePackagesForm.jsx)
    *   *Purpose*: Bundles courses into promotional packages, configuring fees and perks.

## 4. Batch Forms
*   **Batch Form**: [BatchForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/BatchForm.jsx)
    *   *Purpose*: Form to create/edit batches, defining schedules, assigning instructors, and specifying locations.

## 5. Finance Forms
*   **Fee Templates**: [FeePlanWizard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/FeePlanWizard.jsx)
    *   *Purpose*: Configuration wizard for defining billing template plans.
*   **Record Payment**: [RecordPaymentModal.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/RecordPaymentModal.jsx)
    *   *Purpose*: Modal form to collect single installment/ledger payments.

# Student Data Profile Architecture & Knowledge Graph

An architectural analysis of the **Student Data Profile Subsystem** within the Dazzling ERP Admin platform. The subsystem coordinates core student demographics, academic background, multi-course enrollments, attendance tracking, and financial fee accounts.

---

## 🏗️ Domain Component Index & Layer Breakdown

### 1. Root Page & Viewport Controller
* **`StudentProfile.jsx`** (`src/pages/admin/StudentProfile.jsx`): Main viewport and controller page orchestrating tab navigation (`Overview`, `Attendance`, `Fees`, `Performance`, `Documents`), desktop vs. mobile responsive viewports, parallel DOM tab state retention, breadcrumb trails, and edit modal lifecycle triggers.

### 2. Profile Overview & Demographic Subcomponents (`src/features/student/components/profile/`)
* **`ProfileHeader.jsx`**: Composite desktop hero header rendering student identity, status pill, avatar, quick actions, and active tab selector ribbon.
* **`PersonalDetails.jsx`**: Domain presentation card displaying core demographic parameters (DOB, Gender, Email, Phone, Address) with inline edit trigger.
* **`GuardianInfo.jsx`**: Domain presentation card displaying parent and emergency contact details (Father's Name, Mother's Name, Guardian Phone).
* **`AcademicBackground.jsx`**: Domain presentation card listing prior academic background, school, board, passing year, and percentage/CGPA metrics.
* **`EnrollmentDetails.jsx`**: Domain presentation card rendering active course/package enrollments, package bundles, enrollment dates, and status badges.
* **`FeeSchedule.jsx`**: Domain presentation component rendering high-level fee schedule summary and payment plan highlights.
* **`ProfileSidebar.jsx`**: Domain sidebar card governing student quick stats, tag management, key contacts, and fast administrative triggers.

### 3. Attendance Subsystem Domain Components (`src/features/student/components/profile/` & `src/features/student/components/`)
* **`AttendanceHeatmap.jsx`**: Student profile domain component rendering monthly attendance calendar grid, attendance percentage KPI, present/absent/late visual indicators, and month navigation.
* **`StudentAttendanceManager.jsx`**: Domain feature controller orchestrating student daily register check-ins, batch-filtered student lists, status staging, and bulk punch updates.

### 4. Financial & Fee Subsystem Domain Components (`src/features/student/components/profile/fee/` & `src/features/finance/`)
* **`StudentFeeTab.jsx`**: Top-level domain controller for student financial profile, fetching hydrated enrollments and rendering fee accounts list, top action bar (Record Payment, Reschedule Installments, Export Statement).
* **`FeeAccountCard.jsx`**: High-density domain summary card rendering fee totals (Total Fee, Total Paid, Pending Balance, Discount), status badge, and embedding the interactive installment stepper timeline and detail panel.
* **`InstallmentStepperTimeline.jsx`**: Domain stepper timeline component rendering chronological installments with status badges (Paid, Pending, Overdue, Partial) and interactive installment selection.
* **`InstallmentDetailPanel.jsx`**: Domain detail panel presenting selected installment breakdown (tuition fee, admission fee, discount), due date, payment mode, and nested transaction receipt cards.
* **`PaymentReceiptCard.jsx`**: Domain receipt card rendering individual payment transactions, receipt number, payment date, payment mode (UPI, Cash, Bank Transfer), reference ID, and print/download receipt triggers.

### 5. Shared Domain Layouts & Action Modals (`src/components/domain/`, `src/features/student/components/`, `src/features/finance/`)
* **`ProfileHero.jsx`**: Reusable 3-tier mobile profile hero layout component (Header, Logistics, Actions slots) for mobile viewports.
* **`StudentEditModal.jsx`**: Domain modal wizard for updating student profile parameters, contact details, address, and status.
* **`RecordPaymentModal.jsx`**: Domain modal for recording student fee payments, processing payment modes, reference numbers, and executing payment mutations.
* **`RescheduleInstallmentsView.jsx`**: Domain modal page for restructuring student installment schedules and recalculating installment due dates and split amounts.

### 6. Data & Hook Infrastructure (`src/features/student/hooks/`, `src/features/student/api/`, `src/features/finance/hooks/`)
* **`student.api.js`**: API module wrapping backend REST API endpoints (`student_get_by_id`, `student_update`, `student_add_lead`, `student_query`) via `apiClient` & `API_REGISTRY`.
* **`useStudentById.js`**: Custom hook fetching student core data and hydrating profile details (`contact`, `address`, `guardian`, `enrollments`, `education`).
* **`useStudentQueries.js`**: TanStack Query hooks managing student queries, update mutations, lead queries, and cache invalidation trees.
* **`useEnrollmentQueries.js`**: TanStack Query hooks fetching student course/package enrollments and fee account data.
* **`useFinanceQueries.js`**: TanStack Query hooks managing student fee accounts, installment schedules, payment mutations, and reschedule triggers.

---

## 🕸️ Knowledge Graph (JSON Representation)

```json
{
  "subsystem": "Student Data Profile Architecture",
  "nodes": [
    {
      "id": "student.api.js",
      "type": "API Layer Module",
      "purpose": "Provides REST API abstraction wrappers over central system registers (API_REGISTRY.STUDENT), handling payload normalization and error enfolding.",
      "references": [
        "../../../services/apiClient",
        "../../../services/apiRegistry"
      ]
    },
    {
      "id": "useStudentById.js",
      "type": "Data Hydration Hook",
      "purpose": "Fetches student core record by ID and hydrates relational sub-entities (address, contact, guardian, enrollments, education).",
      "references": [
        "./useStudentQueries",
        "../../course/hooks/useEnrollmentQueries",
        "../../../lib/react-query/hydrate"
      ]
    },
    {
      "id": "useStudentQueries.js",
      "type": "State & Mutation Hook Layer",
      "purpose": "Manages student query cache, update mutations, lead queries, and cache invalidation triggers across React Query keys.",
      "references": [
        "@tanstack/react-query",
        "../api/student.api",
        "../../../lib/react-query/queryKeys",
        "../../../lib/react-query/cacheHelper"
      ]
    },
    {
      "id": "useEnrollmentQueries.js",
      "type": "State & Fetch Hook Layer",
      "purpose": "Queries hydrated student course/package enrollments and attached student fee account entities.",
      "references": [
        "@tanstack/react-query",
        "../../../lib/react-query/queryKeys",
        "../../../services/apiClient"
      ]
    },
    {
      "id": "useFinanceQueries.js",
      "type": "Financial Query Hook Layer",
      "purpose": "Manages fee accounts overview queries, installment payment recording mutations, and fee schedule restructuring.",
      "references": [
        "@tanstack/react-query",
        "../../../lib/react-query/queryKeys",
        "../../../services/apiClient"
      ]
    },
    {
      "id": "StudentProfile.jsx",
      "type": "Root Page Controller",
      "purpose": "Orchestrates URL tab state, desktop/mobile responsive views, parallel DOM tab registry, breadcrumbs, and edit modal lifecycle.",
      "references": [
        "react-router-dom",
        "../../features/student/hooks/useStudentById",
        "../../features/student/hooks/useStudentQueries",
        "../../features/finance/hooks/useFinanceQueries",
        "../../hooks/useIsMobile",
        "../../components/domain/ProfileHero",
        "../../features/student/components/profile/ProfileHeader",
        "../../features/student/components/profile/PersonalDetails",
        "../../features/student/components/profile/GuardianInfo",
        "../../features/student/components/profile/AcademicBackground",
        "../../features/student/components/profile/EnrollmentDetails",
        "../../features/student/components/profile/FeeSchedule",
        "../../features/student/components/profile/StudentFeeTab",
        "../../features/student/components/profile/ProfileSidebar",
        "../../features/student/components/profile/AttendanceHeatmap",
        "../../features/student/components/StudentEditModal"
      ]
    },
    {
      "id": "ProfileHeader.jsx",
      "type": "Profile Presentation Component",
      "purpose": "Desktop hero header component displaying identity title, status badge, avatar, navigation tabs ribbon, and edit trigger.",
      "references": [
        "react-router-dom",
        "../../../../components/ui/Badge",
        "../../../../components/ui/v2/Avatar",
        "../../../../components/ui/v2/Button"
      ]
    },
    {
      "id": "PersonalDetails.jsx",
      "type": "Profile Presentation Subcard",
      "purpose": "Renders student core demographic properties (DOB, Gender, Email, Phone, Address) with inline edit trigger.",
      "references": [
        "../../../../components/ui/Card",
        "../../../../components/ui/v2/KeyValuePair",
        "../../../../components/ui/v2/DescriptionSection"
      ]
    },
    {
      "id": "GuardianInfo.jsx",
      "type": "Profile Presentation Subcard",
      "purpose": "Renders parent/guardian contacts (Father's Name, Mother's Name, Contact Number, Emergency Contact).",
      "references": [
        "../../../../components/ui/Card",
        "../../../../components/ui/v2/KeyValuePair",
        "../../../../components/ui/v2/DescriptionSection"
      ]
    },
    {
      "id": "AcademicBackground.jsx",
      "type": "Profile Presentation Subcard",
      "purpose": "Renders prior education background, school name, board, passing year, and percentage/CGPA metrics.",
      "references": [
        "../../../../components/ui/Card",
        "../../../../components/ui/v2/KeyValuePair"
      ]
    },
    {
      "id": "EnrollmentDetails.jsx",
      "type": "Profile Presentation Subcard",
      "purpose": "Renders active course/package enrollments, package names, admission dates, and status badges.",
      "references": [
        "../../../../components/ui/Card",
        "../../../../components/ui/Badge"
      ]
    },
    {
      "id": "FeeSchedule.jsx",
      "type": "Profile Summary Subcard",
      "purpose": "Renders high-level summary of fee schedule overview, payment plan highlights, and upcoming installment totals.",
      "references": [
        "../../../../components/ui/Card",
        "../../../../components/ui/Badge"
      ]
    },
    {
      "id": "ProfileSidebar.jsx",
      "type": "Profile Controller Subcard",
      "purpose": "Governs student quick stats, tag assignments, key contacts, and fast administrative triggers.",
      "references": [
        "../../../../components/ui/Card",
        "../../../../components/ui/Badge",
        "../../../../components/ui/v2/Button"
      ]
    },
    {
      "id": "AttendanceHeatmap.jsx",
      "type": "Attendance Domain Component",
      "purpose": "Renders monthly attendance calendar grid, attendance percentage KPI, present/absent/late visual indicators, and month navigation.",
      "references": [
        "../../../../components/ui/Card",
        "../../../../components/ui/v2/KpiCard",
        "../../../../lib/dateUtils"
      ]
    },
    {
      "id": "StudentFeeTab.jsx",
      "type": "Financial Domain Controller",
      "purpose": "Top-level domain view for student fee account details, installment timeline, payment receipts, fee adjustment history, and payment modal triggers.",
      "references": [
        "react-router-dom",
        "../../hooks/useEnrollmentQueries",
        "./fee/FeeAccountCard",
        "../../../finance/RecordPaymentModal",
        "../../../../components/ui/v2/Button"
      ]
    },
    {
      "id": "FeeAccountCard.jsx",
      "type": "Financial Summary Subcard",
      "purpose": "High-density domain summary card rendering total fee, total paid, pending balance, discount summary, fee account status, and action buttons.",
      "references": [
        "./InstallmentStepperTimeline",
        "./InstallmentDetailPanel",
        "../../../../../components/ui/Card",
        "../../../../../components/ui/Badge",
        "../../../../../components/ui/v2/Button"
      ]
    },
    {
      "id": "InstallmentStepperTimeline.jsx",
      "type": "Interactive Timeline Subcomponent",
      "purpose": "Master-detail interactive stepper timeline visualizing chronological installments, due dates, amount, status badges, and installment selection.",
      "references": [
        "../../../../../components/ui/v2/Timeline",
        "../../../../../components/ui/Badge"
      ]
    },
    {
      "id": "InstallmentDetailPanel.jsx",
      "type": "Financial Detail Subpanel",
      "purpose": "Detail domain panel displaying installment breakdown (tuition fee, admission fee, discount), due date, status, payment transaction receipts, and payment method details.",
      "references": [
        "./PaymentReceiptCard",
        "../../../../../components/ui/Card",
        "../../../../../components/ui/Badge",
        "../../../../../components/ui/v2/KeyValuePair"
      ]
    },
    {
      "id": "PaymentReceiptCard.jsx",
      "type": "Receipt Presentation Subcard",
      "purpose": "Renders individual payment transactions, receipt number, payment date, payment mode (UPI, Cash, Bank Transfer), reference ID, and print/download triggers.",
      "references": [
        "../../../../../components/ui/Card",
        "../../../../../components/ui/v2/Button"
      ]
    },
    {
      "id": "ProfileHero.jsx",
      "type": "Mobile Layout Domain Primitive",
      "purpose": "Reusable 3-tier mobile profile hero layout (Header tier, Logistics tier, Actions tier) for small screen viewports.",
      "references": [
        "../ui/v2/Avatar",
        "../ui/v2/Button"
      ]
    },
    {
      "id": "StudentEditModal.jsx",
      "type": "Domain Action Modal",
      "purpose": "Full-featured edit modal for updating student profile info, contact details, guardian info, address, and status.",
      "references": [
        "react",
        "../hooks/useStudentQueries",
        "../../../components/ui/v2/TextInput",
        "../../../components/ui/v2/Button"
      ]
    },
    {
      "id": "RecordPaymentModal.jsx",
      "type": "Domain Action Modal",
      "purpose": "Modal for recording student fee payments against specific installments, calculating balance, payment mode, reference ID, and submitting payment mutation.",
      "references": [
        "react",
        "../finance/hooks/useFinanceQueries",
        "../../components/ui/v2/TextInput",
        "../../components/ui/v2/SelectInput",
        "../../components/ui/v2/Button"
      ]
    },
    {
      "id": "RescheduleInstallmentsView.jsx",
      "type": "Domain Restructuring View",
      "purpose": "Interactive view for restructuring student fee installment schedules, recalculating due dates and installment split amounts.",
      "references": [
        "react-router-dom",
        "../hooks/useFinanceQueries",
        "../../../components/ui/v2/Button",
        "../../../components/ui/v2/DateInput"
      ]
    }
  ],
  "edges": [
    { "source": "useStudentById.js", "target": "useStudentQueries.js", "relation": "fetches_core_student_record" },
    { "source": "useStudentById.js", "target": "useEnrollmentQueries.js", "relation": "hydrates_relational_enrollments" },
    { "source": "useStudentQueries.js", "target": "student.api.js", "relation": "wraps_and_caches_asynchronous_requests" },
    { "source": "StudentProfile.jsx", "target": "useStudentById.js", "relation": "consumes_hydrated_student_profile_data" },
    { "source": "StudentProfile.jsx", "target": "ProfileHeader.jsx", "relation": "renders_desktop_hero_header" },
    { "source": "StudentProfile.jsx", "target": "ProfileHero.jsx", "relation": "renders_mobile_hero_header" },
    { "source": "StudentProfile.jsx", "target": "PersonalDetails.jsx", "relation": "renders_overview_personal_info" },
    { "source": "StudentProfile.jsx", "target": "GuardianInfo.jsx", "relation": "renders_overview_guardian_info" },
    { "source": "StudentProfile.jsx", "target": "AcademicBackground.jsx", "relation": "renders_overview_academic_background" },
    { "source": "StudentProfile.jsx", "target": "EnrollmentDetails.jsx", "relation": "renders_overview_enrollment_details" },
    { "source": "StudentProfile.jsx", "target": "ProfileSidebar.jsx", "relation": "renders_overview_sidebar" },
    { "source": "StudentProfile.jsx", "target": "AttendanceHeatmap.jsx", "relation": "renders_attendance_tab_calendar" },
    { "source": "StudentProfile.jsx", "target": "StudentFeeTab.jsx", "relation": "renders_fees_tab_controller" },
    { "source": "StudentProfile.jsx", "target": "StudentEditModal.jsx", "relation": "mounts_profile_edit_modal" },
    { "source": "StudentFeeTab.jsx", "target": "useEnrollmentQueries.js", "relation": "queries_hydrated_fee_accounts" },
    { "source": "StudentFeeTab.jsx", "target": "FeeAccountCard.jsx", "relation": "maps_and_renders_enrollment_fee_cards" },
    { "source": "StudentFeeTab.jsx", "target": "RecordPaymentModal.jsx", "relation": "triggers_payment_recording_modal" },
    { "source": "StudentFeeTab.jsx", "target": "RescheduleInstallmentsView.jsx", "relation": "navigates_to_schedule_restructuring_view" },
    { "source": "FeeAccountCard.jsx", "target": "InstallmentStepperTimeline.jsx", "relation": "renders_interactive_installment_timeline" },
    { "source": "FeeAccountCard.jsx", "target": "InstallmentDetailPanel.jsx", "relation": "renders_selected_installment_breakdown" },
    { "source": "InstallmentDetailPanel.jsx", "target": "PaymentReceiptCard.jsx", "relation": "renders_payment_transaction_receipts" },
    { "source": "RecordPaymentModal.jsx", "target": "useFinanceQueries.js", "relation": "submits_payment_recording_mutation" },
    { "source": "RescheduleInstallmentsView.jsx", "target": "useFinanceQueries.js", "relation": "submits_reschedule_installment_mutation" }
  ]
}
```

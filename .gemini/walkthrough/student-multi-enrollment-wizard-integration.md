# Student Registration Multi-Enrollment & API Error Popup Walkthrough

This document records the updates and integrations made to support multiple program enrollments (packages, courses, subjects), custom batch configurations, discount overrides, custom installment schedules, and a premium diagnostic error popup modal.

## 🛠️ Changes Made

### 1. Wizard Controller: `StudentRegistrationWizard.jsx`
* Merged the 4-step wizard into a more efficient **3-step** process by integrating installment planning directly inside the cart selection interface (Step 2).
* Configured `ProgressStepper` dynamically with `totalSteps={3}` and labels `['Profile', 'Enrollment & Fees', 'Activation']`.
* Added new state properties: `enrollmentBasket`, `selectedBatches`, `installments`, `isManualPlan`, `discountVal`, and `discountReason`.
* Handled the nested JSON transaction payload mapping inside `handleFinish` exactly as specified by `student_registration_api_payload.md`.
* Integrated the custom `<APIErrorModal>` component at the bottom of the template and replaced browser default alerts in success/failure mutation hooks with specific modal triggers.
* Aligned `total_fee` to equal `baseFee` exactly to prevent proportional split accounting drifts.

### 2. Enrollment & Finance Selection: `AcademicEnrollmentStep.jsx` (Step 2)
* Added hooks `useCoursesQuery`, `usePackagesQuery`, and `useBatchesQuery` to load active offerings dynamically.
* Implemented the search catalog and shopping basket interface.
* Rendered nested batches for packages and direct batches for standalone items, tracking seat capacities.
* Configured manual discount values and reasons.
* Implemented the interactive installment timeline (edit amounts/dates, add new lines, delete lines, auto-split evenly, and Checksum matching guard).
* **New Validation Guard**: Added a cart check (`isBasketValidationValid`) that forces the "Next" button to remain disabled until every course in every selected package and every standalone course in the basket has an active batch selection assigned.
* **Discrepancy Resolution**: Removed the ad-hoc `₹500` registration fee from calculations to ensure the sum of enrollment item fees matches the parent `total_fee` exactly.

### 3. Review & Payment Activation: `ActivationStep.jsx` (Step 3)
* Updated the academic check-sheet to list all items in the enrollment basket along with their assigned scheduled batches.
* Configured the financial review summary sheet to list tuition subtotal, registration fees, manual discount adjustments, and the custom installment schedule timeline.
* Updated back navigation mapping to return directly to the new Step 2.

### 4. API Error Modal: `APIErrorModal.jsx` [NEW]
* Created a premium diagnostic modal that replaces native window alert popups with rich glassmorphism styling.
* Displays error title, type badge (e.g. `ORMError`, `NetworkError`), and messages.
* Includes a collapsible details drawer to display stack traces, validation logs, or detailed JSON payloads.
* Features a "Copy logs" action with dynamic inline confirmation ("Copied!") for quick copy-pasting.

### 5. Route Cleanup: `AppRoutes.jsx`
* Removed development showcase route `/admin/test-pages/registration-step2` and its import since it is now natively integrated in production.

---

## 🔍 Code Self-Assessment & Diagnostic Summary

We have assessed the registration wizard payload against the active schemas defined in `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema`:

### 🚨 Blocker: Polymorphic ID Mismatch on `PKG-09-RBSE-H`
* **Root Cause**: The client-side wizard uses mock packages loaded from `packages.json` (mock IDs like `PKG-09-RBSE-H`), but this package ID is absent from the live backend sheet database's `Package` table. In DazzlingDB's polymorphic relational validation system, the backend ORM checks if `item_id` exists in the `Package` table when `enrollment_type` is `"package"`. Since it is missing, validation fails.
* **Resolution**: Standardize packages retrieval in production to fetch real packages from the database. Create the packages in the spreadsheet database first (via the Course Packages view) before attempting to register students to those packages.
* **UI Prevention**: The wizard now strictly validates that every item added to the basket has a valid batch assignment selected before allowing step progression.

### 🚨 Accounting Drift: $500 Discrepancy
* **Root Cause**: The wizard added an ad-hoc `₹500` registration fee to `total_fee`, but since there is no matching registration fee enrollment item, the sum of individual enrollments ($25,500) drifted from `total_fee` ($26,005). The backend ORM's proportional payment splitter dropped the $500 remainder.
* **Resolution**: Removed the ad-hoc `₹500` registration fee from calculations. The `total_fee` now matches the exact sum of individual enrollments, ensuring proportional splits sum perfectly.

### 🚨 Data Integrity: line2 & Swapped Names
* **Assessment**: The wizard maps Mother's Name, Father's Name, and Address Line 2 to the correct form inputs and JSON properties (`mother_name`, `father_name`, `line2`). The swapped names and the email address in `line2` are not caused by code typos in the wizard, but rather by manual inputs or dummy lead data templates. No code modifications are needed.

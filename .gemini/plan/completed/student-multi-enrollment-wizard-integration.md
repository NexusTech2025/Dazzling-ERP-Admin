---
Date: 2026-06-01T21:10:00+05:30
Status: Approved-Completed
---

# Student Registration Multi-Enrollment Integration Plan

This plan outlines the integration of the dynamic "Enrollment Basket/Cart" interface and "Installment Schedule Editor" (developed and tested in `TestRegistrationStep2.jsx`) directly into the production Student Registration Wizard.

## User Review Required

> [!IMPORTANT]
> **Wizard Step Simplification (4 Steps to 3 Steps)**
> * By merging the academic enrollment basket and the custom installment schedule editor into a single step, the registration wizard transitions from **4 steps** to **3 steps**:
>   1. **Profile Step**: Basic personal details, emergency contact, and education history.
>   2. **Enrollment & Fees Step** (Step 2 & 3 merged): Cart item catalog search/addition, batch selection, discount overrides, and installment schedule customizer.
>   3. **Review & Payment Step** (Step 4 renamed): Summary validation, payment options, and submission of the structured transaction payload.
> * We will configure `ProgressStepper` dynamically with `totalSteps={3}` and `steps={['Profile', 'Enrollment & Fees', 'Activation']}`.
> * The file `FinanceStep.jsx` (old Step 3) becomes redundant and will no longer be utilized in the wizard flow.

## Proposed Changes

---

### Student Registration Wizard Container

#### [MODIFY] [StudentRegistrationWizard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/StudentRegistrationWizard.jsx)
* **State Updates**:
  - Add `enrollmentBasket` array to the master `formData` state (initialized as `[]`).
  - Add `selectedBatches` object to the master `formData` state (mapping `courseId`/`subjectId` to `batchId`).
  - Add `installments` array to `formData`.
  - Add `isManualPlan`, `discountVal` (number), and `discountReason` (string) to `formData`.
* **Step Configuration**:
  - Update `currentStep` max boundary to `3`.
  - Pass `totalSteps={3}` and `steps={['Profile', 'Enrollment & Fees', 'Activation']}` to the `ProgressStepper`.
  - Simplify step switcher:
    - Step 1: `ProfileStep`
    - Step 2: `AcademicEnrollmentStep` (Merged cart & installments editor)
    - Step 3: `ActivationStep` (Review & Payment capture)
* **Submission Mapping**:
  - Transform `formData` into the strict nested JSON transaction payload expected by `StudentService.registerStudent`:
    - `profile`: student name, email, phone, gender, dob, mother/father names.
    - `address`: line1, line2, city, state, pin_code, country.
    - `contact`: email, mobile_number, emergency contact info.
    - `education`: qualification array.
    - `enrollments`: array containing mapped packages (with `package_batches`) and standalone courses/subjects (with `batch_id`).
    - `feeAccount`: base subtotal, manual discount override, final fee, paid amount, balance due, and mapped installments array.
    - `payment` (optional): payment method, receipt date, transaction reference, amount.

---

### Step 2: Enrollment & Fees Customization

#### [MODIFY] [AcademicEnrollmentStep.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/steps/AcademicEnrollmentStep.jsx)
* **Dynamic Catalog Retrieval**:
  - Query active courses using `useCoursesQuery()`.
  - Query active packages using `usePackagesQuery()`.
  - Query active batches using `useBatchesQuery()`.
* **Dynamic Catalog Processing**:
  - Build the catalog selector list dynamically from courses and packages.
  - Exclude catalog items already added to the cart.
  - Map package course requirements to physical batches based on course IDs.
  - Track `seatsLeft` for each batch using `capacity - enrolled_students` with visual state indicators (emerald, amber, rose).
* **Consolidated Calculations**:
  - Subtotal equals sum of fees of all items in the basket.
  - Registration fee equals `₹500` if the basket is not empty.
  - Discount is bound to `formData.discountVal` and `formData.discountReason`.
  - Total tuition fee equals `subtotal + registrationFee - discountVal`.
* **Installment Schedule Customizer**:
  - Default plan: Auto-generate a two-step 50/50 installment split.
  - Edit mode: Toggle custom dates, custom amounts, adding new cycles, and deleting cycles.
  - Auto-split: Distribute the current total fee evenly among the configured installment cycles.
  - Checksum validation: Block step progression if the manual installments sum does not match the final total amount.

---

### Step 3: Final Review & Payment Activation

#### [MODIFY] [ActivationStep.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/steps/ActivationStep.jsx)
* **Academic Review**:
  - Display list of selected packages/courses in the basket along with their assigned batches (instead of the single course/batch view).
* **Finance Review**:
  - Show Tuition base subtotal, registration fee, applied manual discounts with reason, and the final net fee.
  - Display the custom installment schedule timeline.
* **Navigation & Complete**:
  - Ensure the "Back" button routes to Step 2 (Enrollment & Fees).

---

## Verification Plan

### Automated Verification
* Verify compiling and JSX structure by ensuring there are no React runtime crashes.

### Manual Verification
* Navigate to the Student Registration Wizard in the admin portal.
* Step 1: Enter dummy profile, address, emergency contact, and education. Next.
* Step 2:
  - Select "Class 10 CBSE (English Medium)" package. Select batches for Math, Science, SST, English.
  - Select "Full Stack Web Development" standalone course and select its batch.
  - Verify that the subtotal is calculated as package fee + course fee.
  - Add a manual discount of `₹2,000` with reason "Academic Scholarship".
  - Edit the installment schedule: add a 3rd cycle, enter manual amounts, verify the checksum warning, click "Auto-Split" to re-balance, and verify checksum success. Next.
* Step 3:
  - Review the basket list and batches.
  - Review the contract pricing and installment due dates.
  - Configure payment: select cash, enter receipt, click Complete.
  - Verify the JSON payload sent in network request console log matches the API specifications.

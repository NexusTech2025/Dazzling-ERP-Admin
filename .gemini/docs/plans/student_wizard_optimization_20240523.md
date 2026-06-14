# Optimization Plan: Student Registration Wizard

**Timestamp:** 2024-05-23 14:45:00 (UTC)
**Status:** DRAFT / PROPOSED
**Target File:** `src/features/student/registration/StudentRegistrationWizard.jsx`

## 1. Executive Summary
This plan outlines a series of optimizations for the 5-step Student Registration Wizard to reduce user friction, improve data integrity, and align the UI with the backend V2 architecture.

---

## 2. Step-by-Step Analysis & Weaknesses

### Step 1: Profile (Information Overload)
- **Weakness:** Single massive page causes "form fatigue". No inline validation for critical contact fields.
- **Optimization:** Split into sub-sections or implement progressive disclosure. Add Pincode auto-fill for Address.

### Step 2: Program (Functional Dead-ends)
- **Weakness:** "Apply" button for coupons has no logic. Scholarship calculation is non-interactive.
- **Optimization:** Connect coupon logic to the API and implement real-time scholarship calculation based on entrance scores.

### Step 3: Batch (Contextual Blindness)
- **Weakness:** Shows all batches regardless of the Program Type or Course selected in previous steps.
- **Optimization:** Implement contextual filtering to only show batches relevant to the selected Program/Course.

### Step 4: Finance (Data Hardcoding)
- **Weakness:** Base fee is hardcoded ($12,000). Installment schedule is static and non-editable.
- **Optimization:** Derive `baseFee` from selected course metadata. Allow authorized users to adjust installment dates.

### Step 5: Activate (Verification Gaps)
- **Weakness:** Small payment UI hidden at bottom. Allows activation with zero/missing initial payment.
- **Optimization:** Elevate Payment Method selection. Add a "Verify & Submit" confirmation modal.

---

## 3. Implementation Roadmap

### Phase 1: Data Integrity (High Priority)
- [ ] Replace hardcoded fees with dynamic course-based pricing.
- [ ] Implement field validation for Email/Mobile in `ProfileStep`.
- [ ] Add `course_id` and `program_type` filtering to the Batch query.

### Phase 2: UX Refinement (Medium Priority)
- [ ] Implement Pincode-to-Address lookup.
- [ ] Add "Auto-scroll to Top" on step transition.
- [ ] Enhance "Apply Coupon" UI with success/error states.

### Phase 3: Advanced Features (Low Priority)
- [ ] Enable installment customization in `FinanceStep`.
- [ ] Add Profile Photo preview and compression before upload.

---

## 4. Technical Constraints
- Must adhere to **TanStack Query** cache-first patterns.
- Payload must remain compatible with `registerStudentTransaction` in `student.mockApi.js`.
- All UI components must use existing `src/components/ui/v2/` primitives.

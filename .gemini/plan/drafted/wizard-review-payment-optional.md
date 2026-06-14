---
Date: 2026-05-28T17:31:00+05:30
Status: Proposed
---

# Implementation Plan: Optional Payment & Review in Registration Wizard

This plan outlines the enhancements to Step 4 of the Student Registration Wizard to review gathered inputs and allow optional immediate payments via a toggle button.

---

## User Review Required

> [!IMPORTANT]
> - **Input Verification**: Step 4 (`ActivationStep.jsx`) will now act as a comprehensive "Review & Verify" dashboard showing Profile details, Academic selections, and the Fee plan before submission.
> - **Optional Payment**: We will add an "Immediate Payment" toggle. When turned off, the payment fields are hidden, and registration is submitted with zero initial payment (remaining balance is deferred to the student's ledger).

---

## Proposed Changes

### Student Registration Wizard Layer

#### [MODIFY] [ActivationStep.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/steps/ActivationStep.jsx)
- Add state hook `immediatePayment` (default: `true`).
- **Profile Review Section**: Render card displaying name, email, phone, gender, date of birth, emergency contacts, and education details.
- **Academic & Financial Review Section**: Render card displaying course name, target batch, referral ID, base fee, scholarship discount, and total calculated fee.
- **Payment & Activation Toggle Section**:
  - Implement a toggle switch/segmented button for "Immediate Payment".
  - If toggle is **ON**: Render input controls for Amount, Payment Method (Cash, UPI, Bank), Date, and Transaction Reference.
  - If toggle is **OFF**: Hide payment controls, set `initialPaymentAmount` to `0`, and display the warning notice: *'Registration will be completed without recording an immediate payment. Balance will be updated to student account ledger.'*
- Adapt final completion handler to clean up payment payload if `immediatePayment` is disabled.

---

## Verification Plan

### Automated Verification (Manual Execution)
> [!NOTE]
> Run the compilation build manually:
```bash
npm run build
```

### Manual Verification
1. Open **New Registration** in the sidebar.
2. Complete Step 1 (Profile), Step 2 (Academic), and Step 3 (Finance).
3. On Step 4, verify that all details (personal info, batch, tuition fee summaries) match previous inputs.
4. Toggle **Immediate Payment** to OFF. Verify that payment fields disappear and the balance warning notice is shown.
5. Complete the registration and ensure success behavior without immediate transactions.

---
Date: 2026-05-25T22:08:57+05:30
Status: Approved-Completed
---

# Plan: Refactor Footer Buttons to V2 Design Tokens

## Goal Description
Sync the onboarding and edit footer buttons in `AddTeacher.jsx` with the Core V2 Design System. Replace raw HTML `<button>` elements with the unified `Button` component from `src/components/ui/v2/Button.jsx`.

## Proposed Changes

### Pages (Admin)

#### [MODIFY] [AddTeacher.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/AddTeacher.jsx)
- Import `Button` from `../../components/ui/v2/Button` at the top of the file.
- Update the sticky bottom footer action buttons to consume `<Button>`:
  - **Cancel/Discard Button**: Refactor to `<Button variant="text" startIcon="close">`.
  - **Save & Create Another Button**: Refactor to `<Button variant="outlined" size="md">`.
  - **Complete Registration / Update Profile Button**: Refactor to `<Button variant="contained" endIcon="arrow_forward" loading={...}>`.

---

## Verification Plan

### Manual Verification
1. Open the Faculty Registration form (`/admin/teachers/add`) or Edit Profile view (`/admin/teachers/edit/TCH-001`).
2. Scroll to the sticky bottom footer.
3. Verify that all three buttons render correctly and match V2 design styles (including micro-interactions, active scaling, and correct spacing).
4. Verify that clicking **Cancel** navigates back, and submitting executes validation as expected.

---
Date: 2026-06-12T01:54:00+05:30
Status: Approved-Completed
---

# Restructure TeacherForm layout to use desktop 7:5 two-column grid

Restructure the `/admin/teachers/add` (and edit) form view to optimize workspace space usage. The form will be split into a desktop 7:5 two-column layout (collapsing gracefully to a compact vertical stack on mobile devices).

## Analysis of Redesign Assets
After analyzing the downloaded prototype files in `C:\Users\manis\Downloads\Optimize UI (1)\stitch_dazzling_course_package_inline_editor`:
- The mobile design prototype (`faculty_onboarding_mobile/code.html`) implements a vertical stack container structure.
- The desktop configuration utilizes a 12-column template layout with high data density.
- We will map this structure to our React implementation, adapting the 7:5 grid layout while strictly preserving the app's original dark-mode slate theme rather than introducing color/font deviations from the download.

## Self-Review & Refinements (Hidden Bug Fixes)

1. **Status & Internal Notes Grid Collapse**:
   - *Bug/Risk*: In the original code, the "Status & Internal Notes" inputs were placed inside a `grid-cols-3` layout with a child spanning `col-span-3`. When this section is moved to the narrower right column (`lg:col-span-5`), a complex grid layout will look highly squeezed and misaligned.
   - *Refinement*: Re-structure the inputs inside this card to stack vertically (using standard `col-span-2` structure).
2. **Height Alignment (38px Standard)**:
   - *Bug*: The custom containers for the "Generated Password" display, "System Role" badge, and "Subjects/Courses" tag wrapper are hardcoded to `h-[42px]` or `min-h-[42px]`. This clashes with the global standard compact height of `38px`.
   - *Refinement*: Update these custom indicators to use `h-[38px]` and `min-h-[38px]`.
3. **Sticky Action Bar Mobile Optimization**:
   - *Refinement*: Update bottom action bar padding from `px-8 py-4` to `px-4 md:px-8 py-3 md:py-4` to provide more breathing room for buttons on narrow mobile devices.

## User Review Required

> [!IMPORTANT]
> **Layout Partitioning**:
> We will partition the existing sections of [TeacherForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/TeacherForm.jsx) as follows:
> - **Left Column (width: `col-span-12 lg:col-span-7`)**:
>   - **Basic Information** (Full Name, Mobile, Email, Gender, DOB, Address, Photo Upload)
>   - **Professional Details** (Subjects, Experience, Qualification, Specialization, Previous Institute)
>   - **Account Setup** (Toggle Create Login, Username, Password, System Role)
> - **Right Column (width: `col-span-12 lg:col-span-5`)**:
>   - **Assignment Details** (Branch, Teacher Type, Joining Date, Preferred Time Slot)
>   - **Salary Configuration** (Salary Type, Base Salary)
>   - **Documents** (ID Proof, Resume)
>   - **Status & Internal Notes** (Onboarding Status, Internal Notes)
>
> **Theme Preservation**:
> - We will strictly maintain the app's original slate-dark theme. All form elements will continue to use the established atomic input components (`TextInput`, `SelectInput`, etc.) that support the compact standard height.

## Proposed Changes

### Teacher Module

#### [MODIFY] [TeacherForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/TeacherForm.jsx)
- **Outer Wrapper**:
  - Restrict the max-width: `<div className="pb-32 max-w-7xl mx-auto px-4 lg:px-0">`.
- **Form Layout**:
  - Update the parent `<form>` layout tag:
    - From: `<form className="space-y-6 px-4 lg:px-0" onSubmit={handleSubmit}>`
    - To: `<form className="grid grid-cols-12 gap-6 items-start" onSubmit={handleSubmit}>`
- **Left Column Container**:
  - Render a container `<div className="col-span-12 lg:col-span-7 space-y-6">` hosting:
    - Basic Information
    - Professional Details
    - Account Setup
- **Right Column Container**:
  - Render a container `<div className="col-span-12 lg:col-span-5 space-y-6">` hosting:
    - Assignment Details
    - Salary Configuration
    - Documents
    - Status & Internal Notes
- **Layout & Spans Inside Cards**:
  - Update Account Setup custom items to `h-[38px]`.
  - Update Subjects/Courses tags container to `min-h-[38px]`.
  - Simplify Status & Notes layout to stack vertically as two distinct rows instead of side-by-side inside `col-span-3`.

## Verification Plan

### Automated/Syntax Verification
- Verify that the React components compile correctly with no syntax or JSX tag matching errors.

### Manual Verification
- Render `/admin/teachers/add` on a desktop screen. Verify that it splits into the 7:5 two-column grid.
- Verify that on smaller screen widths (under `1024px`), the form stacks into a clean, compact single column.
- Verify that the footer action bar is visible and aligned.

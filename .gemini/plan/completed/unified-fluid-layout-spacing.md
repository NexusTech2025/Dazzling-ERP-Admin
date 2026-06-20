---
Date: 2026-06-14T13:05:00+05:30
Status: Approved-Completed
---

# Unified Fluid Layout & Consistent Spacing Standard

This plan establishes a fluid, percentage-based sizing strategy for page views using `<MainLayout>` instead of fixed pixel breakpoints. This addresses mobile spacing margins and desktop screen sizes, capping the maximum content width on ultra-wide monitors.

## User Review Required

> [!IMPORTANT]
> We will adopt a unified fluid container style across all directory (list) and form pages:
> `w-full lg:w-[90%] lg:mx-auto xl:w-[85%] max-w-[1440px]`
>
> **Breakpoint Behaviors:**
> 1. **Mobile / Tablet (<1024px):** Container is `w-full`. The spacing relies entirely on the global `<main>` element's `px-4` padding (minimum gutter). No extra margins or `mx-auto` are applied.
> 2. **Desktop (>=1024px, Standard Laptops):** Container scales to `w-[90%]` and centers with `lg:mx-auto` (narrow padding/margin gutter).
> 3. **Large Monitors (>=1280px):** Container scales to `w-[85%]` and centers with `xl:mx-auto`.
> 4. **Widescreen Cap:** The maximum width is bounded at `max-w-[1440px]`.

---

## Proposed Changes

### Core Layouts & Components

#### [page_layout_protocol.md](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.gemini/memory/knowledge/page_layout_protocol.md)
- Update the page layout standards documentation to formalize this fluid responsive container strategy.

### Feature Page Container Refactoring

The standardized class string `w-full lg:w-[90%] lg:mx-auto xl:w-[85%] max-w-[1440px]` will be applied to the `slotClasses.container` property of `<MainLayout>` in the following files:

#### [MODIFY] [Batches.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/Batches.jsx)
#### [MODIFY] [BatchForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/BatchForm.jsx)
#### [MODIFY] [Courses.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/Courses.jsx)
#### [MODIFY] [CourseTypes.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/CourseTypes.jsx)
#### [MODIFY] [CourseForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/components/CourseForm.jsx)
#### [MODIFY] [CoursePackagesForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/CoursePackagesForm.jsx)
#### [MODIFY] [CourseDetails.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/CourseDetails.jsx)
#### [MODIFY] [TeacherForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/TeacherForm.jsx)

---

### UI Consistency Alignment

#### [MODIFY] [Branches.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/pages/admin/Branches.jsx)
- Wrap layout in `<MainLayout>` to match the navigation and layout of the other directories (`Batches.jsx`, `Courses.jsx`).
- Apply the unified container class list: `w-full lg:w-[90%] lg:mx-auto xl:w-[85%] max-w-[1440px]`.
- Implement dynamic breadcrumbs and top header scroll trigger matching the other lists.

---

## Verification Plan

### Manual Verification
- Resize the browser viewport across mobile, tablet, standard desktop (`1320px`/`1366px`), and ultra-wide scales to ensure:
  - Mobile has minimal, flush padding on both sides (`16px`).
  - Standard laptop sizes maintain a centered alignment with `90%` width.
  - Large monitors scale smoothly to `85%` width, capping at `1440px`.
- Verify list rendering and modal behaviors on the refactored **Branches** page.

---
Date: 2026-06-14T13:15:00+05:30
Status: Approved-Completed
---

# Centralized Fluid Layout & MainLayout Spacing Defaults

This plan establishes central default styling classes inside `MainLayout.jsx` to reduce layout duplication across the codebase, while widening the content margins on desktop screens for high-density space usage.

## User Review Required

> [!IMPORTANT]
> **Layout Defaults Integration:**
> We will centralize layout styling inside [MainLayout.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/layout/MainLayout.jsx) by providing defaults.
>
> **The New Standard Space Width:**
> `relative w-full lg:w-[98%] lg:mx-auto xl:w-[95%] max-w-[1440px]`
> This replaces the previous `lg:w-[90%]` / `xl:w-[85%]` gutters, providing wider screen usage.
>
> **Fallback Mechanics:**
> - If `slotClasses.container` is omitted, it defaults to:
>   `relative w-full lg:w-[98%] lg:mx-auto xl:w-[95%] max-w-[1440px]`
> - If `slotClasses.body` is omitted, it defaults to:
>   `py-0 px-0`
> - Overrides can still be supplied explicitly by child views when smaller sizes (like standard forms) are desired.

---

## Proposed Changes

### Core Spacing System

#### [MODIFY] [MainLayout.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/layout/MainLayout.jsx)
- Define standard default classes inside a `DEFAULT_LAYOUT_CLASSES` constant.
- Merge the incoming `slotClasses` object with the defaults programmatically so that omitted slots fall back to standard margins.

#### [MODIFY] [page_layout_protocol.md](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.gemini/memory/knowledge/page_layout_protocol.md)
- Update guidelines to reflect the centralized defaults and the wider `lg:w-[98%]`/`xl:w-[95%]` dimensions.

### Feature View Cleanup

Remove redundant custom `slotClasses` assignments from the page components so they automatically inherit the defaults from `MainLayout.jsx`:

#### [MODIFY] [Batches.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/Batches.jsx)
#### [MODIFY] [BatchForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/BatchForm.jsx)
#### [MODIFY] [Courses.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/Courses.jsx)
#### [MODIFY] [CourseTypes.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/CourseTypes.jsx)
#### [MODIFY] [CourseForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/components/CourseForm.jsx)
#### [MODIFY] [CoursePackagesForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/CoursePackagesForm.jsx)
#### [MODIFY] [CourseDetails.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/CourseDetails.jsx)
#### [MODIFY] [TeacherForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/TeacherForm.jsx)
#### [MODIFY] [Branches.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/pages/admin/Branches.jsx)

---

## Verification Plan

### Manual Verification
- Verify that directory pages compile and render at the wider `lg:w-[98%]` and `xl:w-[95%]` constraints automatically.
- Verify that standard pages have zero visual layout shift or regression due to the centralized defaults.

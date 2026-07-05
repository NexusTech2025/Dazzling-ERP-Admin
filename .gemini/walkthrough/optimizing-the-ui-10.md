---
Date: 2026-07-05T18:49:00+05:30
Status: Verified
---

# Walkthrough - Profile UI Mobile Redesign & Desktop Refactoring

We have optimized the detailed views for Students and Teachers, successfully redesigned the Student Profile and Teacher Profile views for mobile, and refactored the Teacher Profile desktop view into a high-density dashboard.

## Changes Made

### 1. Reusable Layout Components
* **`ProfileHero.jsx`** in [ProfileHero.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/ProfileHero.jsx): Reusable card displaying avatars, titles, clipboard copy IDs, metadata line items, and dynamic quick actions.
* **`ScrollableRibbon.jsx`** in [ScrollableRibbon.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/ScrollableRibbon.jsx): Horizontal touch-swipe container that hides ugly browser scroll bars on mobile viewports.
* **`DescriptionSection.jsx`** in [DescriptionSection.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/DescriptionSection.jsx): Groups multiple read-only details (`KeyValuePair`) into clean cards with optional edit triggers. Refactored to support a high-density 2-column baseline on mobile and a 4-column matrix on desktop with word wrapping safety.
* **`SlottedEntityCard.jsx`** in [SlottedEntityCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/cards/SlottedEntityCard.jsx): Navigational redirect card displaying titles, subtitles, badges, and chevron icons.

### 2. Student & Teacher Layout Integration
* **Mobile Layouts:** Replaced original cards structures with responsive mobile views utilizing `ProfileHero`, scrolling metrics and tab ribbons, `DescriptionSection` grids, and custom lists.
* **Teacher Desktop Refactoring:**
  * Refactored [TeacherProfileHeader.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/TeacherProfileHeader.jsx) to wrap inside a clean `<Card>` primitive and support a teacher ID copy clipboard handler.
  * Derived active tabs directly from URL query parameters (`?tab=overview`) in [TeacherProfile.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/TeacherProfile.jsx) using `useSearchParams`.
  * Restructured the `Overview` tab into a non-symmetric 12-column dashboard: main details (Personal/Contact) stacked on the left (`lg:col-span-2`), and context widgets (Salary Snapshot, Timeline logs, Badge tags, Quick actions) grouped on the right (`lg:col-span-1`).

### 3. Gender-Aware Avatar Placeholders
* **Student Profile (Mobile & Desktop):** Integrates automated fallbacks when `avatarUrl` is empty:
  * Female: `https://avatar.iran.liara.run/public/girl`
  * Male: `https://avatar.iran.liara.run/public/boy`
* **Teacher Profile (Mobile & Desktop):** Integrates automated fallbacks when `profile_photo_url` is empty:
  * Female: `https://avatar.iran.liara.run/public/80` (Woman avatar)
  * Male: `https://avatar.iran.liara.run/public/30` (Man avatar)

### 4. Reusable StatusButton Component
* **`StatusButton.jsx`** in [StatusButton.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/StatusButton.jsx): Reusable component mapping enums to V2 button variants (`success` when active, `danger` when inactive). Integrates user prompt gates inside an encapsulated `<ConfirmModal>` component. Updated to handle and map backend success/failure envelopes (`success`, `data._presentation.toast_message`, `error.message`) to transition through `processing`, `success`, and `error` states in the modal UI.
* **Integrated status toggles:**
  * **Course details:** Integrated `useUpdateCourseMutation` and `<StatusButton />` in [CourseDetails.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/CourseDetails.jsx) returning the mutation promise.
  * **Package details:** Integrated `useUpdatePackageMutation` and `<StatusButton />` in [PackageDetails.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/PackageDetails.jsx) returning the mutation promise.
  * **Batch details:** Integrated `useUpdateBatchMutation` and `<StatusButton />` in [BatchProfile.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/BatchProfile.jsx) and [BatchProfileHeader.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/BatchProfileHeader.jsx) returning the mutation promise.

## Verification Results
* Fixed a `TypeError: aq.from is not a function` in [TeacherProfile.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/TeacherProfile.jsx#L70) by invoking `aq` as a function (`aq(attendance)`) directly.
* Toggled responsive mode and verified that desktop and mobile layouts load efficiently and preserve workspace tab states correctly without layout padding issues.
* Verified that copy buttons work and place the correct text in the system clipboard.
* Verified that removing avatars falls back to boy/girl/man/woman placeholder images dynamically based on gender values.
* Verified that `StatusButton` renders size="sm" success/danger states based on active status flags and intercepts confirmation flows securely.
* Verified Course, Package, and Batch detail views react correctly to status toggle confirmations and refresh data dynamically on mutation completion.
* Verified that when a toggle mutation completes, the modal displays the human-readable toast message or error messages returned from the standardized envelope.

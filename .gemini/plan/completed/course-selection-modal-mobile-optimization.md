---
Date: 2026-06-17T00:05:00+05:30
Status: Approved-Completed
---

# Implementation Plan - Responsive Mobile Course Selection Modal

This plan details the modular refactoring and mobile-first enhancements for `CourseSelectionModal` using two sub-components: `CourseDesktopView` and `CourseMobileView`.

## Proposed Changes

### Course Feature Component

#### [MODIFY] [CourseSelectionModal.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/components/CourseSelectionModal.jsx)

##### 1. Define Sub-Components for Desktop and Mobile Views
- Create `CourseDesktopView` to encapsulate the sidebar filters and medium-density grid layout:
  - Takes filters state, course lists, active search logic, and `toggleCourse`/`filterBtnClass` helpers as props.
  - Renders the existing 2-column sidebar-grid layout.
- Create `CourseMobileView` to encapsulate the mobile-first vertical layout:
  - Handles the search field, horizontally scrollable category segment pills, and a collapsible advanced filters accordion panel (containing medium, board, grade level selects, and the reset button).
  - Renders a vertical layout stack of low-density row cards using `CourseCardV2` with `density="low"` and a left-aligned checkbox/radio button.
  - Takes necessary states and control handlers as props.

##### 2. Keep main `CourseSelectionModal` Clean
- In the main `CourseSelectionModal`, render the shared Header and the responsive viewport switcher:
  - Desktop View container: `<div className="hidden md:flex flex-1 overflow-hidden">` rendering `<CourseDesktopView ... />`.
  - Mobile View container: `<div className="flex md:hidden flex-col flex-1 overflow-y-auto bg-white dark:bg-slate-900 custom-scrollbar p-4 space-y-4">` rendering `<CourseMobileView ... />`.
- Maintain the sticky bulk action footer as a shared, responsive component at the bottom of the modal.

---

## Verification Plan

### Manual Verification
1. **Viewport Responsiveness**: Verify that shrinking the viewport below `md` transitions display seamlessly to `CourseMobileView` and hides `CourseDesktopView`.
2. **Modular Interaction**: Verify filter actions (search, category, grade, board) synchronize correctly across both desktop and mobile viewports.
3. **Advanced Mobile Accordion**: Expand/collapse mobile filters, verify category swipe-scrolling pills, and reset behavior.
4. **Card Formats**: Verify desktop displays medium-density cards in grid format and mobile displays low-density single rows.

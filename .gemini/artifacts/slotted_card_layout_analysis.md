# Diagnostic Report: Slotted Card Layout Patterns (List vs. Detail Views)

This diagnostic report analyzes the component configurations in [views_components.md](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/temp/views_components.md) and details the additional slots required to implement the **Slotted Entity Card Pattern** for both List Views and Detail Views across the mobile ERP client.

---

## 🔍 Context and Current Code Analysis

Currently, [SlottedEntityCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/cards/SlottedEntityCard.jsx) uses static props (`icon`, `title`, `subtitle`, `metaText`, `badge`) rather than true composition. 

Because of this rigid prop-heavy interface:
1. **RecentActivityRow** ([RecentActivityRow.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/RecentActivityRow.jsx)) had to abandon `SlottedEntityCard` and rewrite raw flex columns to inject custom background tints.
2. **UpcomingScheduleRow** ([UpcomingScheduleRow.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/UpcomingScheduleRow.jsx)) had to rewrite custom timing pills and navigation chevrons by hand to support its layout.

---

## 🏛️ Macro Layout Slotted API Blueprint (`BaseLayout`)

To support the varying layouts between List Directories and Detail Profiles, the core `<BaseLayout>` component must expose the following structured layout slots:

* **`BaseLayout.Header`**: sticky top navigation bar (renders title, back trigger, page count, and primary actions).
* **`BaseLayout.FilterSlot`**: horizontal sticky bar for search inputs and inline dropdown filter selectors.
* **`BaseLayout.TabsSlot`**: sticky bar for page tabs (e.g. Courses vs Packages) sitting directly below the filters.
* **`BaseLayout.HeroSlot`**: dedicated banner space for profile headers (avatar, names, and contact quick actions) on detailed profile views.
* **`BaseLayout.RibbonSlot`**: horizontal, swipeable ribbon container for rendering analytics KPIs and metrics.
* **`BaseLayout.ListSlot`**: main scrollable list container representing the viewport body.
* **`BaseLayout.ActionBarSlot`**: sticky bottom action shelf containing selection counts and bulk buttons (e.g., Delete selected).

---

## 🎛️ Proposed Card Layout Slotted APIs

To establish Inversion of Control (IoC) and prevent layout duplication, we must introduce two distinct slotted card types:

### 1. List View Card Pattern (`ListSlottedCard`)
* **Target Views:** Students, StudentLeads, Batches, Teachers, Branches, Courses, Installments, Transactions.
* **Layout Grid:** 3-column body grid (`grid-cols-[auto_1fr_auto]`) + full-width footer actions.

#### Required Slots:
* **`ListSlottedCard.Left`**: handles avatars, book icons, status indicators, and multi-select checkboxes.
* **`ListSlottedCard.Center`**: primary text area. Renders title (bold), unique codes, sub-labels (e.g. teachers), and horizontal schedule strings.
* **`ListSlottedCard.Right`**: renders status badges (e.g., `ACTIVE` / `INACTIVE`), student volume counts, transaction price indicators, and the options trigger (`⋮`).
* **`ListSlottedCard.Footer`**: full-width action container holding segmented 3-column button bar grids (View, Edit, Attendance) separated by thin borders.

### 2. Detail View Card Pattern (`DetailSlottedCard`)
* **Target Views:** StudentProfile, BatchProfile, TeacherProfile, CourseDetails, PackageDetails, FinanceDashboard.
* **Layout Grid:** Header slot + Multi-column metrics body + Collapsible details tray.

#### Required Slots:
* **`DetailSlottedCard.Header`**: pinned header zone for icons, section title, and custom utility triggers (e.g. "Edit", "Add Dues").
* **`DetailSlottedCard.Metrics`**: grid layout specifically styled to render high-density `KeyValuePair` blocks (date of birth, blood groups, emails, salaries, credentials).
* **`DetailSlottedCard.Visuals`**: container for graphs, progress tracking dials, or timelines.
* **`DetailSlottedCard.Drawer`**: expandable slot container displaying collapsible lists, checklist items, or detailed installment fee schedule tables.

---
Date: 2026-06-03T11:45:00+05:30
Status: Approved-Completed
---

# Student Program Selection Refactor (Step 2)

Refactor Step 2 of the student registration wizard (`AcademicEnrollmentStep.jsx`) to replace the legacy catalog dropdown selection box with a high-fidelity popup modal `ProgramSelectionModal` matching the design system catalog selectors (similar to `CourseSelectionModal.jsx`).

## User Review Required

> [!IMPORTANT]
> **ProgramSelectionModal Features & Layout**
> * **Tab Switcher**: Uses `SegmentedControl` at the top of the content pane to select between `Packages`, `Courses`, and `Subjects`.
> * **Filters Sidebar**: A left sidebar containing a text search input box and a Class/Grade filter dropdown (supporting Class 1 to Class 12).
> * **Catalog Card Grid**: A grid of cards rendering packages, courses, or subjects depending on the active tab. Each card displays names, codes, price, and class details.
> * **Multi-Selection Checkboxes**: Direct toggling of items with checked visual states, updating a temporary selection list.
> * **Footer summary**: Shows an avatar bubble representation of selected programs and a confirm button to commit selections.

> [!WARNING]
> **Discount Override Bugfix**
> * We will also fix the missing handlers `setOverrideAmount` and `setOverrideReason` inside [AcademicEnrollmentStep.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/steps/AcademicEnrollmentStep.jsx) which currently throw errors when the user tries to type manual discounts.

## Proposed Changes

### 1. Program Selection Modal
#### [NEW] [ProgramSelectionModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/components/ProgramSelectionModal.jsx)
* Build a new React component matching `CourseSelectionModal`'s layout.
* Expose prop signature:
  ```typescript
  interface ProgramSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (selected: Array<Object>) => void;
    selectedItems?: Array<Object>;
    availableItems?: Array<Object>; // Already mapped catalog containing packages/courses/subjects
  }
  ```
* Inside the component, maintain state for:
  * `tempSelected`: local array synchronizing with `selectedItems` when modal opens.
  * `activeTab`: `'package' | 'course' | 'subject'` managed via `SegmentedControl`.
  * `searchQuery`: string for filtering items by name or ID.
  * `classFilter`: string for filtering items by grade level.
* Filtering Logic:
  * Filter `availableItems` based on `activeTab` (`item.type === activeTab`).
  * Apply `searchQuery` and `classFilter` matching `item.target_class`.
* Layout:
  * **Header**: Title, close button, subtitle.
  * **Sidebar**: Search input, Grade Level (Class 1-12) select filter, and "Reset Filters" button.
  * **Main Content Grid**: Scrollable catalog cards showing badges (Package/Course/Subject), short_code, name, fee, target class or stream, and checked/selection outline indicator.
  * **Footer**: Selection summary indicators with mini badges, and action buttons (`Cancel` and `Confirm Selections`).

---

### 2. Academic Enrollment Step 2 Refactor
#### [MODIFY] [AcademicEnrollmentStep.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/steps/AcademicEnrollmentStep.jsx)
* Import `ProgramSelectionModal` from `../components/ProgramSelectionModal`.
* Remove the obsolete `selectedItemIdToAdd` state and related code.
* Define `isSelectionModalOpen` state.
* Update `catalog` `useMemo` to ensure every item gets mapped with `target_class`:
  * Package: `target_class: pkg.target_class || pkg.class || ''`
  * Course/Subject: `target_class: course.metadata?.class || ''`
* Define missing `setOverrideAmount` and `setOverrideReason` helper functions to safely update `discountVal` and `discountReason` in `formData` via `setFormData`.
* Replace `Add Catalog Item Box` block (lines 311–365) with:
  * A premium glassmorphism configurator card.
  * Displays current catalog enrollment summary.
  * Features a prominent `+ Select Programs` button that opens `ProgramSelectionModal`.
* Render `ProgramSelectionModal` with inputs synced to the wizard state.

---

## Verification Plan

### Automated Tests
* None.

### Manual Verification
* **Step 2 Integration Check**:
  * Open `/admin/students/add` and click through to Step 2.
  * Verify the button `Select Programs` is visible and styled correctly.
  * Click it to open `ProgramSelectionModal`.
* **Modal Filtering & Tab switching**:
  * Toggle between Packages, Courses, and Subjects using `SegmentedControl` tabs.
  * Search by text and class filters to confirm matching results appear.
* **Selection Flow**:
  * Check/uncheck multiple packages and courses.
  * Click `Confirm Selections` and verify they are correctly populated in the cart basket list in Step 2.
  * Verify that batch selection, pricing details, and discount overrides work without errors.

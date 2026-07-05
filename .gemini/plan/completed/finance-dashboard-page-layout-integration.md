---
Date: 2026-06-22T21:43:00+05:30
Status: Approved-Completed
---

# Technical Implementation Plan: Finance Dashboard Page Layout Integration

This plan details integrating the standard `MainLayout` wrapper at the `/admin/finance` view, following the repository layout protocols.

---

## **1. Background Context & Design Rules**

According to the rules defined in `page_layout_protocol.md` and `main_layout_integration_guide.md`:
* **Viewport Scrolling**: Vertical scroll behavior is local to the page content container, locked by setting the outer `<main>` scroll context to hidden while the view is mounted.
* **Layout Structure**:
  - **Header Slot**: Holds a compact sticky header that appears when the user scrolls the body container.
  - **Body Slot**: Holds the static dashboard title, global KPI grid, filtering panel, and core table grids.
  - **Fluid Sizing constraints**: Utilizes `max-w-7xl mx-auto` or `relative w-full lg:w-[98%] lg:mx-auto xl:w-[95%] max-w-[1440px]`.

---

## **2. Proposed Changes**

### **A. Finance Feature Dashboard**

#### [MODIFY] [FinanceDashboard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/FinanceDashboard.jsx)

1. **Import `MainLayout`**:
   `import MainLayout from '../../components/layout/MainLayout';`

2. **Scroll Tracking State & Event Handler**:
   ```javascript
   const [isSticky, setIsSticky] = useState(false);

   const handleBodyScroll = (e) => {
     const shouldBeSticky = e.currentTarget.scrollTop > 80;
     setIsSticky(prev => (prev !== shouldBeSticky ? shouldBeSticky : prev));
   };
   ```

3. **Wrap Render with `MainLayout`**:
   Refactor the return block to wrap inside `<MainLayout>` as follows:
   * **`header`**: A floating compact bar with a title and action button (`Generate Fee Plan`).
   * **`body`**: Contains the main static header, KPI grid, filter row, student/program table grid, and selected student details panel.
   * **`slotClasses`**:
     ```javascript
     slotClasses={{
       container: "relative w-full lg:w-[98%] lg:mx-auto xl:w-[95%] max-w-[1440px]",
       body: "py-0 px-2 text-slate-800"
     }}
     ```

---

## **3. Verification Plan**

### **Manual Verification**
1. Load `/admin/finance` in the browser.
2. Verify that the global page scrollbar is locked and only the body of the dashboard scrolls.
3. Verify that scrolling down shows the sticky compact header floating cleanly at the top of the viewport.
4. Verify layout responsiveness and margins on desktop and mobile screens.

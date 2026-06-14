# Architectural Protocol: Page Layout & Spacing Standards

This document establishes the repository-wide architectural standards and styling protocols for page layouts, scrolling behavior, and horizontal/vertical spacing inside the Dazzling ERP Admin dashboard. Adhering to these rules guarantees visual consistency across all feature modules.

---

## 1. Global Viewport & Scrollport Hierarchy

The layout is divided into a static sidebar/app-header wrapper and a main content slot.

```
+-----------------------------------------------------------+
| App Header (Fixed)                                        |
+-----------------------------------------------------------+
| Sidebar | Main Scrollport (AdminLayout <main>)            |
| (Fixed) | - Horizontal Padding: px-6 lg:px-10             |
|         | - Vertical Padding: Removed (0px)               |
|         | - Scroll Lock: Controlled dynamically by views   |
+---------+-------------------------------------------------+
```

### The Role of `<main>` in [AdminLayout.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/layout/AdminLayout.jsx)
1. **Vertical Bounds**: `<main>` stretches to occupy the full remaining vertical viewport height.
2. **Horizontal Padding**: Enforces a standard gutter of `px-6` (24px) on mobile and `lg:px-10` (40px) on desktop.
3. **No Vertical Padding**: Vertical padding must remain `0` on `<main>`. Page containers are responsible for setting their own vertical margins so sticky footers can sit flush at the screen bottom.

---

## 2. Standard Width Constraints (`max-w`)

To prevent forms and dashboards from stretching awkwardly on ultra-wide monitors, page views must choose one of three standardized width classes:

| Page Category | Max Width Class | Target Width | Example Views |
| :--- | :--- | :--- | :--- |
| **Directory / List Views** | `max-w-7xl mx-auto` or `w-full` | 1280px or Full | `Students.jsx`, `Teachers.jsx` |
| **Complex Multi-Column Forms** | `max-w-7xl mx-auto` | 1280px | `TeacherForm.jsx` (2 columns) |
| **Standard / Narrow Forms** | `max-w-4xl mx-auto` | 896px | `CourseForm.jsx` (1 column) |

*Always pair width constraints with `mx-auto` to center the page container horizontally within the viewport.*

---

## 3. Padding & Spacing Protocols

To avoid "double padding" visual bugs where layout spaces accumulate, components must respect padding boundaries:

### A. Horizontal Spacing
* The global `<main>` container provides the primary horizontal boundary (`px-6 lg:px-10`).
* Layout containers (like `MainLayout`) should not declare extra horizontal margins. Set `slotClasses.body` or parent wrappers to `px-4 lg:px-0` so that text elements align flush with desktop bounds but stay padded on mobile screens.

### B. Vertical Spacing
* **Page-Level Top Margin**: Pages must set a top padding of `pt-6 lg:pt-10` on their main content headers.
* **Sticky Compact Header**: Compact headers must float at `absolute top-0` overlaying the top margin area so they remain flush with the app bar when active.
* **Footer Spacing**: viewports with fixed action bars must not declare vertical bottom margins on `<main>`. The footer slots sit at `bottom-0` flush, while form inputs end with `pb-6` internally.

---

## 4. Implementation Protocol for New Pages

When introducing a new form or detail page, implement the layout using this blueprint:

```jsx
import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Breadcrumbs from '../components/ui/Breadcrumbs';

const EntityForm = ({ initialData, onCancel, onSubmit }) => {
  const isEditMode = !!initialData;
  const [isSticky, setIsSticky] = useState(false);

  const handleBodyScroll = (e) => {
    // 80px scroll trigger for sticky compact header
    setIsSticky(e.currentTarget.scrollTop > 80);
  };

  return (
    <MainLayout
      onBodyScroll={handleBodyScroll}
      slotClasses={{
        container: "relative max-w-4xl mx-auto", // Choose width constraint
        body: "py-0 px-0"                        // Zero out padding conflicts
      }}
      header={
        /* Compact Header Slot */
        <div className={`absolute top-0 left-0 right-0 z-50 transition-all ${isSticky ? 'block shadow-md' : 'hidden'}`}>
          {/* Header Content */}
        </div>
      }
      body={
        /* Scrollable Body Slot */
        <div className="px-4 lg:px-0 pt-6 lg:pt-10 pb-6">
          <Breadcrumbs items={crumbs} className="mb-4" />
          <h1 className="text-3xl font-black mb-8">Page Title</h1>
          <form className="space-y-6">{/* Form fields */}</form>
        </div>
      }
      footer={
        /* Sticky Footer Slot */
        <footer className="border bg-white dark:bg-slate-900 shadow-lg px-4 lg:px-6 py-3 flex items-center justify-between rounded-xl w-full">
          {/* Actions */}
        </footer>
      }
    />
  );
};
```

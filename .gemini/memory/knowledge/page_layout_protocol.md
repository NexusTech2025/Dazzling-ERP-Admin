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
| (Fixed) | - Horizontal Padding: px-4 lg:px-6             |
|         | - Vertical Padding: Removed (0px)               |
|         | - Scroll Lock: Controlled dynamically by views   |
+---------+-------------------------------------------------+
```

### The Role of `<main>` in [AdminLayout.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/layout/AdminLayout.jsx)
1. **Vertical Bounds**: `<main>` stretches to occupy the full remaining vertical viewport height.
2. **Horizontal Padding**: Enforces a standard gutter of `px-4` (16px) on mobile and `lg:px-6` (24px) on desktop.
3. **No Vertical Padding**: Vertical padding must remain `0` on `<main>`. Page containers are responsible for setting their own vertical margins so sticky footers can sit flush at the screen bottom.

---

## 2. Standard Width Constraints (`max-w`)

To prevent pages and dashboards from stretching awkwardly on ultra-wide monitors while keeping them responsive on standard laptops and mobile screens, we enforce a fluid, percentage-based sizing strategy:

| Screen Viewport | Width Class | Centering Behavior | Visual Purpose |
| :--- | :--- | :--- | :--- |
| **Mobile / Tablet (<1024px)** | `w-full` | Sit flush | Minimal padding and margin |
| **Desktop (>=1024px)** | `lg:w-[98%]` | `lg:mx-auto` (Centered) | Narrower spacing gutter |
| **Large Monitors (>=1280px)** | `xl:w-[95%]` | `xl:mx-auto` (Centered) | Comfortable reading span |
| **Widescreen Ceilings** | `max-w-[1440px]` | Centered | Caps maximum layout stretch |

*By default, MainLayout applies this fluid relative class list (`relative w-full lg:w-[98%] lg:mx-auto xl:w-[95%] max-w-[1440px]`) automatically. Child views can omit slotClasses settings to inherit these standard dimensions.*

---

## 3. Padding & Spacing Protocols

To avoid "double padding" visual bugs where layout spaces accumulate, components must respect padding boundaries:

### A. Horizontal Spacing
* The global `<main>` container provides the primary horizontal boundary (`px-4 lg:px-6`).
* Layout containers and page body slots (like `MainLayout` body slots) should not declare horizontal padding (e.g. omit `px-4` or set to `px-0`) because the global `<main>` wrapper handles it automatically. This prevents nested "double padding" bugs on mobile devices.

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
      // Omit slotClasses to automatically inherit default layout width and zero body padding
      header={
        /* Compact Header Slot */
        <div className={`absolute top-0 left-0 right-0 z-50 transition-all ${isSticky ? 'block shadow-md' : 'hidden'}`}>
          {/* Header Content */}
        </div>
      }
      body={
        /* Scrollable Body Slot */
        <div className="pt-6 lg:pt-10 pb-6 space-y-6">
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

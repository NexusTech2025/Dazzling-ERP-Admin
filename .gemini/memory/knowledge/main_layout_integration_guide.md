# Form Design Conventions: Viewport-Sticky Layouts with `<MainLayout>`

This guide establishes the architectural standard for implementing three-segment layouts (fixed Header, scrollable Body, and fixed Actions Footer) across all form and detail views in the Dazzling ERP Admin dashboard.

---

## 1. Architectural Concept

To prevent visual layout shifts, negative margin calculations, and floating gaps underneath footer bars on tall viewports, layouts must confine scrolling **locally** rather than utilizing global viewport scrollbars.

```
+------------------------------------------+  <- Main App Top Header
| MainLayout Header Slot                   |
| (Floating compact header on scroll)      |
+------------------------------------------+
|                                          |
| MainLayout Body Slot (Scroll Container)  |
| - Large Static Header / Breadcrumbs      |
| - Scrollable Form Content / Inputs       |
|                                          |
+------------------------------------------+
| MainLayout Footer Slot                   |
| (Sticky actions bar flush to screen)     |
+------------------------------------------+
```

To support this local scrolling context, the global scroll container [AdminLayout.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/layout/AdminLayout.jsx) has its vertical paddings removed, and height propagation is fully enabled down to the rendered outlet views.

---

## 2. Scroll Lock Integration

Because the global `<main>` container has `overflow-y-auto` enabled by default for simple content pages, `<MainLayout>` takes over the scroll behavior by dynamically applying `overflowY = 'hidden'` to the global container during mount, and restoring it on unmount. This guarantees a single, isolated scroll area inside the layout's scrollable body.

---

## 3. Step-by-Step Implementation Guide

Follow these steps when converting or creating any form view:

### Step 1: Import the Layout Component
Import `MainLayout` into your feature component:
```javascript
import MainLayout from '../../../components/layout/MainLayout';
```

### Step 2: Establish Scroll State & Event Handler
Define state to track whether the form has been scrolled past the main header (typically `80px` offset) to toggle the compact header layout:
```javascript
const [isSticky, setIsSticky] = useState(false);

const handleBodyScroll = (e) => {
  const shouldBeSticky = e.currentTarget.scrollTop > 80;
  setIsSticky(prev => {
    if (prev !== shouldBeSticky) return shouldBeSticky;
    return prev;
  });
};
```

### Step 3: Implement Slots inside `<MainLayout>`

Wrap the component markup inside `<MainLayout>`:

```jsx
return (
  <MainLayout
    onBodyScroll={handleBodyScroll}
    slotClasses={{
      container: "relative max-w-7xl mx-auto", // Centers layout grid
      body: "py-0"                            // Custom vertical overrides
    }}
    header={
      /* 1. Compact Header Slot: floats absolutely at top on active scroll */
      <div
        className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
          isSticky ? 'opacity-100 translate-y-0 shadow-md pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 lg:px-6 py-3 flex items-center justify-between rounded-b-xl">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">edit_note</span>
            <span className="text-sm font-bold text-text-main dark:text-white">Form Title</span>
          </div>
        </div>
      </div>
    }
    body={
      /* 2. Scrollable Body Slot: holds static header and inputs */
      <div className="px-4 lg:px-0 pt-6 lg:pt-10 pb-6">
        <header className="mb-8">
          <nav className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2">
            Breadcrumb > Path
          </nav>
          <h1 className="text-3xl font-black tracking-tight text-text-main dark:text-white">Form Title</h1>
        </header>

        <form className="grid grid-cols-12 gap-6 items-start" onSubmit={handleSubmit}>
          {/* Form Content Fields */}
        </form>
      </div>
    }
    footer={
      /* 3. Footer Slot: Fixed actions bar docked flush to screen bottom */
      <footer className="border border-border-light dark:border-border-dark bg-white dark:bg-slate-900 shadow-lg px-4 lg:px-6 py-3 flex items-center justify-between rounded-xl w-full">
        {/* Buttons / Actions Layout */}
      </footer>
    }
  />
);
```

---

## 4. Design & Layout Rules

1. **Responsive Button Labels**:
   * Text labels must be hidden on mobile viewports using `hidden md:inline` and icons displayed in their place.
   * Actions must span equal columns or flex boundaries to avoid overflow on small viewports.
2. **Page Margin Alignments**:
   * Layouts must have a maximum constraint of `max-w-7xl mx-auto` to keep fields and action footers aligned horizontally on ultra-wide screens.
3. **No Viewport Positioning Hacks**:
   * Do not use `position: fixed` on footers or negative bottom margins like `bottom-[-40px]`. `MainLayout` handles scroll bounding natively, so simple relative layout positioning is sufficient.

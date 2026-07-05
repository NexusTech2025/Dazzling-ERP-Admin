---
Date: 2026-06-21T15:45:00+05:30
Status: Completed
---

# Walkthrough - Non-Blocking Toast/Alert System for Validation Mismatch

We created a non-blocking toast/alert notification system to handle schema mismatches and data errors gracefully without crashing the UI render tree.

## **Changes Made**

### **Vanilla JavaScript State Store**

#### [src/lib/react-query/alertStore.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/alertStore.js)
- Implemented a lightweight pub-sub observer store (`alertStore`) to accumulate notifications and trigger callbacks.
- Added a `useAlerts` hook to let React components reactive-subscribe to the store state.
- Set a capacity limit of `50` alerts max to prevent memory leaks and added safe key checks.

### **Validation Engine Integration**

#### [src/lib/react-query/validationEngine.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/validationEngine.js)
- Imported `alertStore` and updated the error collection logic in `validateRecordSchema`.
- When schema violations occur (e.g. unknown fields like `__tx_id`), it constructs a warning alert item with detailed bullet points and JSON record data and calls `alertStore.addAlert` to post it.

### **Hydration Engine Adjustment**

#### [src/lib/react-query/hydrate.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/hydrate.js)
- Changed read-time hydration validation from `'fast'` (which threw blocking exceptions that crashed the component render loop) to `'lazy'` failMode (non-throwing).
- Integrated `WeakSet` validation caching to ensure each unique record object reference is validated exactly once, removing redundant CPU render loop overhead.

### **UI Components**

#### [src/components/ui/AlertItem.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/AlertItem.jsx)
- Implemented a card layout mapping variant configurations (`info`, `warning`, `error`/`danger`, `success`) to specific icons and curated slate glassmorphic styles.
- Replaced Google Font icon reliance with bulletproof inline SVGs (resolving rendering issues where icons or buttons appeared blank/invisible).
- Added a collapsible detail panel toggled by a chevron trigger, formatting detailed description strings inside code blocks.
- Set a compact visual height when collapsed by applying `line-clamp-1` to the header title text, expanding the title only when the item is expanded.
- Limited the expanded details pre block to `max-h-[140px] overflow-y-auto` to prevent excessive vertical height expansion.

#### [src/components/ui/AlertContainer.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/AlertContainer.jsx)
- Renders the floating stack of alerts in the top-right overlay.
- Configured a fixed width of `w-[400px]` (falling back to responsive `90vw` on mobile screens) for design consistency.
- Configured `pointer-events-auto` on the list wrapper to capture mouse-scrolling and clicks, enabling independent scrolling for stacked alerts.
- Features a header panel containing a **Collapse/Expand Toggle Button** to collapse all alerts into a minimal summary pill at once, keeping the desktop uncluttered.

### **Layout Integration**

#### [src/App.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/App.jsx)
- Mounted `<AlertContainer />` inside the root providers to make the toast overlay available globally across all routes.

---

## **Verification Results**
- Confirmed that schema validation errors are caught, posted as floating warnings on the right-side stack, and do not crash the layout, allowing normal administration views to render successfully.

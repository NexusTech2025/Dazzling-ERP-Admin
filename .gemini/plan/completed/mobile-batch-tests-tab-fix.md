---
Title: Implementation Plan: Mobile Batch Profile "Tests" Tab Visibility & Layout Fix
Date: 2026-07-27T16:06:00+05:30
Status: Approved-Completed
---

# Implementation Plan: Mobile Batch Profile "Tests" Tab Visibility & Layout Fix

This document outlines the technical plan to ensure the **Tests** tab is 100% visible, accessible, and fully wired on the Mobile Batch Profile view.

---

## **1. Background Knowledge & Traceability (Rule N2)**

* **Referenced Mobile View Components:**
  * `src/pages/admin/components/MobileBatchProfile.jsx`
  * `src/features/batch/components/profile/ScrollableTabSegment.jsx`
  * `src/features/batch/hooks/useBatchProfile.js`
* **Referenced Tab Content Module:**
  * `src/features/batch/components/profile/BatchTestsTab.jsx`
* **Design Runbooks:**
  * `.agents/rules/plan-drafting-rule.md`
  * `.agents/rules/zero-new-ui-components-policy.md`

---

## **2. Fact vs. Assumption Boundary Declaration (Rule N3)**

### Actual Verified Facts
1. In `ScrollableTabSegment.jsx`, tab buttons are laid out inside a fixed `flex gap-6 overflow-x-auto` container. On narrower mobile viewports ($\le 390\text{px}$), the cumulative width of *Overview*, *Roster*, and *Attendance* exceeds screen width, pushing the 4th tab (*Tests*) off the right edge of the screen into hidden horizontal overflow without visual scroll indicators.
2. In `useBatchProfile.js`, `handleViewPerformanceLink` was set to a stub (`console.log('Navigate to Academic Metrics')`) instead of updating state (`setActiveTab('Tests')`).

### System Assumptions
1. Standardizing `ScrollableTabSegment.jsx` with responsive grid/flex auto-fitting (`grid grid-cols-4 sm:flex gap-2 sm:gap-6`) will ensure all 4 tabs (*Overview*, *Roster*, *Attendance*, *Tests*) fit comfortably on screen simultaneously across all mobile screen sizes.

---

## **3. Technical Legacy Caution Isolation (Rule N6)**

> [!CAUTION]
> **LEGACY MAINTENANCE IDENTIFIED:**
>
> * **Technical Path Endpoint:** [ScrollableTabSegment.jsx:L25](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/ScrollableTabSegment.jsx#L25)
> * **Core Technical Debt Risk:** `flex gap-6` causes horizontal overflow on 4-tab tracks on mobile screens, making the right-most tab (*Tests*) invisible unless manually scrolled.
> * **Remediation Option:** Update `ScrollableTabSegment.jsx` to use an adaptive layout grid that fits 4 tabs proportionally across mobile viewports.

---

## **4. GAS Execution Boundary & Round-Trip Safeguards (Rule N4)**

* **Pure UI Layout Adjustment:** 100% client-side DOM layout styling update; zero API round-trips.

---

## **5. Performance Benchmarks & Assertions (Rule N5)**

* **Render Performance:** $< 1\text{ ms}$ layout paint time.

---

## **6. Positional Signatures & Execution Blueprints (Rule N1)**

### A. Responsive Auto-Fit Tab Track ([ScrollableTabSegment.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/ScrollableTabSegment.jsx))

```javascript
import React from 'react';

/**
 * ScrollableTabSegment renders a sticky horizontal tab selector track
 * for the mobile BatchProfile layout.
 *
 * Automatically fits up to 4 tabs on small screens (grid grid-cols-4)
 * while supporting smooth horizontal scrolling when tab count > 4.
 */
const ScrollableTabSegment = React.memo(function ScrollableTabSegment({
  activeTab,
  onTabChange,
  tabs = [],
}) {
  const isFourOrLess = tabs.length <= 4;

  return (
    <div className="sticky top-0 z-40 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark w-full">
      <div className={`px-2 sm:px-4 ${
        isFourOrLess
          ? 'grid grid-cols-4 gap-1 items-center text-center'
          : 'flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide'
      }`}>
        {tabs.map((tab) => {
          const isActive = activeTab.toLowerCase() === tab.key.toLowerCase();
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 border-b-[3px] py-2.5 transition-all min-w-0 ${
                isActive
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-text-secondary hover:text-text-main dark:hover:text-white font-semibold'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] sm:text-[20px] shrink-0">
                {tab.icon}
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default ScrollableTabSegment;
```

### B. Mobile Navigation Link ([useBatchProfile.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchProfile.js))

```javascript
// Wire handleViewPerformanceLink to switch active tab to 'Tests'
const handleViewPerformanceLink = useCallback(() => {
  setActiveTab('Tests');
}, []);
```

---

## 7. Mandatory UI Component Catalog Mapping

| UI Feature | Target Primitive Component | Source Location |
| :--- | :--- | :--- |
| Mobile Tab Segment | `ScrollableTabSegment` | `src/features/batch/components/profile/ScrollableTabSegment.jsx` |
| Mobile Profile Shell | `MobileBatchProfile` | `src/pages/admin/components/MobileBatchProfile.jsx` |

---

## User Review Required

> [!NOTE]
> Please review the proposed Mobile Batch Profile Tests tab layout fix.

---

## Open Questions

None at this time.

---

## Proposed Changes

#### [MODIFY] [ScrollableTabSegment.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/ScrollableTabSegment.jsx)
- Adapt tab layout container to use proportional 4-column grid on mobile (`grid grid-cols-4 gap-1`), ensuring *Overview*, *Roster*, *Attendance*, and *Tests* are all 100% visible on screen without horizontal clipping.

#### [MODIFY] [useBatchProfile.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/hooks/useBatchProfile.js)
- Update `handleViewPerformanceLink` to execute `setActiveTab('Tests')`.

---

## Verification Plan

### Manual Verification
1. Open Batch Details in mobile viewport resolution ($\le 390\text{px}$).
2. Inspect sticky tab bar below the Hero card.
3. Verify all 4 tab buttons (**OVERVIEW**, **ROSTER**, **ATTENDANCE**, **TESTS**) are clearly visible and formatted side-by-side.
4. Tap the **TESTS** tab button -> Verify mobile view renders `<BatchTestsTab />` displaying test cards.
5. Tap **OVERVIEW** -> Click **View Test Performance** button on the Academic Progress card -> Verify it immediately switches active tab to **TESTS**.

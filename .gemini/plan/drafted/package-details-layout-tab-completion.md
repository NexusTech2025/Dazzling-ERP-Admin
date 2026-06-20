---
Date: 2026-06-15T01:42:29+05:30
Status: Proposed
---

# Implementation Plan - Package Details: Layout Restructuring & Tab Completion

Bring `PackageDetails.jsx` into full compliance with the [page_layout_protocol.md](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.gemini/memory/knowledge/page_layout_protocol.md), implement the two missing tabs (`Enrollments`, `Revenue`) with live data, and add the supporting query hooks.

The `PackageItem`/`PackagePerk` hydration migration and standalone key cleanup are **deferred** to a separate session. Those keys and functions remain intact.

---

## Diagnosis Summary (from [package_details_layout_diagnosis.md](C:/Users/manis/.gemini/antigravity-ide/brain/1a5d240d-1295-4a33-b21a-fcea61d3809c/package_details_layout_diagnosis.md))

| # | Issue | Severity | Current Code |
|---|-------|----------|--------------|
| 1 | Missing `MainLayout` wrapper | **HIGH** | Root `<div className="max-w-7xl mx-auto ...">` (line 24) |
| 2 | No `onBodyScroll` / sticky header | **MEDIUM** | No `isSticky` state or `handleBodyScroll` handler |
| 3 | Inline hardcoded `<nav>` breadcrumbs | **LOW** | Lines 27–33 — bypasses unified `<Breadcrumbs>` |
| 4 | Double-padding risk | **MEDIUM** | Container declares `max-w-7xl mx-auto` on top of `<main>`'s gutter |
| 5 | `Enrollments` tab — blank pane | **CRITICAL** | No JSX render block for this tab |
| 6 | `Revenue` tab — blank pane | **CRITICAL** | No JSX render block for this tab |

---

## Proposed Changes

### Phase 1 — New Query Hooks

#### [MODIFY] [usePackageQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/hooks/usePackageQueries.js)

Add and export two new hooks at the bottom of the file:

**`usePackageEnrollmentsQuery(packageId)`**
- Queries `Enrollment` filtered by `{ enrollment_type: 'package', item_id: packageId }` with `include: { student: {} }`.
- Query key: `[...queryKeys.course.package.detail(packageId), 'enrollments']`.
- Enabled only when `packageId` is truthy.

**`usePackageFeeAccountsQuery(packageId)`**
- Queries `StudentFeeAccount` records associated with the package with `include: { installments: {} }`.
- Query key: `[...queryKeys.course.package.detail(packageId), 'fee-accounts']`.
- Enabled only when `packageId` is truthy.

> [!NOTE]
> Both hooks must follow the existing `hydrateRecord` / `cacheHelper.resolveList` pattern used by other hooks in the same file. Check the REST API doc to confirm the filter shape for `Enrollment` before implementing.

---

### Phase 2 — Layout Restructuring (`PackageDetails.jsx`)

#### [MODIFY] [PackageDetails.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/PackageDetails.jsx)

**2a. Add imports**
```jsx
import MainLayout from '../../components/layout/MainLayout';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { usePackageEnrollmentsQuery, usePackageFeeAccountsQuery } from './hooks/usePackageQueries';
```

**2b. Add state + scroll handler** (mirrors [CourseDetails.jsx L30–38](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/CourseDetails.jsx))
```jsx
const [isSticky, setIsSticky] = useState(false);

const handleBodyScroll = (e) => {
  const shouldBeSticky = e.currentTarget.scrollTop > 80;
  setIsSticky(prev => prev !== shouldBeSticky ? shouldBeSticky : prev);
};
```

**2c. Define breadcrumb items** (per protocol)
```jsx
const crumbs = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'home' },
  { label: 'Courses', path: '/admin/courses' },
  { label: 'Packages', path: '/admin/packages' },
  { label: pkg.name },
];
```

**2d. Wire new queries**
```jsx
const { data: enrollments = [], isLoading: isEnrollmentsLoading } = usePackageEnrollmentsQuery(id);
const { data: feeAccounts = [], isLoading: isFeeLoading } = usePackageFeeAccountsQuery(id);
```

**2e. Replace root container with `<MainLayout>`** — eliminate `<div className="max-w-7xl mx-auto ...">` and adopt the protocol wrapper pattern:
```jsx
return (
  <MainLayout
    onBodyScroll={handleBodyScroll}
    header={
      <div className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
        isSticky
          ? 'opacity-100 translate-y-0 shadow-md pointer-events-auto'
          : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        <div className="bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 lg:px-6 py-3 flex items-center gap-2 rounded-b-xl">
          <span className="material-symbols-outlined text-primary text-lg">inventory_2</span>
          <span className="text-sm font-bold text-text-main dark:text-white">{pkg.name}</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-xs text-text-secondary font-semibold uppercase">{pkg.package_id}</span>
        </div>
      </div>
    }
    body={
      <div className="pt-6 lg:pt-10 pb-6 space-y-8 animate-in fade-in duration-500">
        {/* Breadcrumbs + header actions + bento stats + tab body */}
      </div>
    }
  />
);
```

**2f. Replace inline `<nav>` breadcrumb** (lines 27–33) with:
```jsx
<Breadcrumbs items={crumbs} className="mb-1" />
```

> [!IMPORTANT]
> Per protocol §3A, the `body` div **must not** declare horizontal padding (`px-*`). The global `<main>` gutter (`px-4 lg:px-6`) already handles it. Only vertical padding (`pt-6 lg:pt-10 pb-6`) is needed inside the body slot.

---

### Phase 3 — Implement Missing Tabs

#### [MODIFY] [PackageDetails.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/course/PackageDetails.jsx)

**3a. `Enrollments` tab** — Add after the `Included Courses` render block (currently ends at line 271):

- Show a **loading skeleton** while `isEnrollmentsLoading`.
- Show an **empty-state** panel (icon + message) when `enrollments.length === 0`.
- Render a **2-column responsive grid** of student cards when enrollments exist. Each card shows:
  - Student name + avatar initials chip
  - Email address
  - Enrollment date (formatted)
  - Status badge (using the existing `<Badge>` component)

**3b. `Revenue` tab** — Add after the `Enrollments` block:

- Compute aggregates from `feeAccounts`:
  ```js
  const totalFee   = feeAccounts.reduce((s, a) => s + (a.total_fee || 0), 0);
  const collected  = feeAccounts.reduce((s, a) => s + (a.amount_paid || 0), 0);
  const pending    = totalFee - collected;
  ```
- Show a **loading skeleton** while `isFeeLoading`.
- Render **three KPI cards** (Total Revenue / Collected / Pending) styled to match the existing bento stat cards (lines 69–88).
- Render a **sortable installment ledger table** with columns: Student Name · Due Amount · Paid · Due Date · Status badge.
- Show an **empty-state** if no fee accounts exist.

---

## Deferred Work (separate session)

- Migrate `useErpHydration.js` to use `include: { packageitems: {}, packageperks: {} }` on the `Package` target.
- Remove standalone `PackageItem` and `PackagePerk` entries from `HYDRATION_CONFIG`.
- Remove `packageItem` and `packagePerk` namespaces from `queryKeys.js`.
- Delete `fetchPackageItems` and `fetchPackagePerks` from `course.api.js`.
- Remove `packageItem`/`packagePerk` invalidations from `usePackageQueries.js`, `Courses.jsx`, and `usePackageWorkspaceState.js`.

---

## Verification Plan

### Manual Verification
1. **Layout**: Navigate to `/admin/packages/:id`. Scroll down past 80px — confirm the compact sticky header fades in with the package name and ID. Scroll back — confirm it fades out.
2. **Breadcrumbs**: Confirm the breadcrumb trail renders (Dashboard → Courses → Packages → `<pkg.name>`) and links are navigable.
3. **No double-padding**: Verify no visible horizontal gutter mismatch versus `CourseDetails.jsx` on both mobile and desktop viewports.
4. **Enrollments tab**: Click the tab. With zero data: confirm the empty-state panel renders. With data: confirm student cards show name, email, date, and status badge correctly.
5. **Revenue tab**: Click the tab. With zero data: confirm empty-state. With data: confirm KPI cards show correct totals and the installment ledger renders accurate rows.
6. **Other tabs unaffected**: Confirm `Overview` and `Included Courses` tabs continue to function without regression.

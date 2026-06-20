# Synchronization Issues: Package Caching and Hydration

This document records the synchronization and query structure issues found in the caching layer for **Packages**, **PackageItems**, and **PackagePerks**.

---

## 📊 Summary of Caching Mismatches

The current implementation splits package data fetching into two competing architectures:
1. **Flat preloading** during application boot (`useErpHydration.js`).
2. **Nested relational inclusion** during package query requests (`usePackageQueries.js` / `course.api.js`).

This split results in redundant data payloads, orphaned query cache keys, and cache desynchronization when packages are created, updated, or deleted.

---

## 🔍 Query Reference Table

Below is the registry of all query functions, keys, data sources, and hydration methods utilized for packages, items, and perks.

| Query Hook / Function | Query Key | API / Action Target | Cache Location & Shape | Hydration / Mapping Logic |
| :--- | :--- | :--- | :--- | :--- |
| **`useErpHydration`** (Initialization) | `['init_erp', { targets: [...] }]` | `INIT_ERP` | Populates:<br>1. `['package', 'list', { filter: {} }]`<br>2. `['package-item', 'list']`<br>3. `['package-perk', 'list']` | Injects raw rows directly into respective flat query keys via `queryClient.setQueryData`. |
| **`usePackagesQuery`** | `['package', 'list', { filter }]` | `DATA.QUERY` (`target: 'Package'`) | Cached as array of packages under target filter key. | Calls `ensurePackageRelations` to preload courses, then maps packages using `hydratePackageRelations` (resolves course objects). |
| **`usePackageDetailQuery`** | `['package', 'detail', id]` | `DATA.QUERY` (`target: 'Package'`, `id`) | Cached as single package object under detail key. | Uses `hydratePackageRelations` in the `select` callback to map nested subjects and perks. |
| **`ensurePackageRelations`** | N/A | `DATA.QUERY` (`target: 'Course'`) | Preloads courses under `['course', 'list', { filter: {} }]` | Runs `resolveList` to verify course data is in query cache before package hydration occurs. |

---

## ⚠️ Synchronization and Structural Mismatches

### 1. Divergent Sources of Truth (Nested vs. Flat Cache)
* **The Problem:** 
  * `useErpHydration.js` queries `PackageItem` and `PackagePerk` records as flat lists, caching them under `['package-item', 'list']` and `['package-perk', 'list']`.
  * `fetchPackages` and `fetchPackageDetail` inside `course.api.js` request nested joins directly from the database using:
    ```javascript
    include: {
      packageitems: {},
      packageperks: {}
    }
    ```
  * The hydration mapper `hydratePackageRelations` uses the nested `pkg.packageitems` and `pkg.packageperks` arrays directly from the package query payload, completely ignoring the flat preloaded caches.
* **The Impact:**
  * **Network Waste:** The database returns `PackageItem` and `PackagePerk` records twice (once in `INIT_ERP` and again inside the nested packages query).
  * **Stale Flat Caches:** When a package is mutated (created, updated, or deleted), the mutations invalidate `queryKeys.course.packageItem.all` and `queryKeys.course.packagePerk.all`. However, because no active component registers query hooks for these flat lists, they are never refetched. Any component attempting to query the flat cache directly will read stale, invalidated data.

### 2. Parameter Mismatch in Key Resolution
* **The Problem:** 
  * In `useErpHydration.js`, the loop sets preloaded query data using `config.query_key.list(EMPTY_FILTER)`.
  * For `PackageItem` and `PackagePerk`, their factory methods in `queryKeys.js` do not accept parameters:
    * `list: () => [...queryKeys.course.packageItem.all, 'list']`
  * Although JavaScript ignores the extra `EMPTY_FILTER` argument, it creates a mismatch with the query key structure and introduces bugs if pagination or dynamic filtering is ever added to package items.

### 3. Orphaned Cache Keys (Deleted Hooks)
* **The Problem:**
  * The frontend hook `usePackageItemsQuery` was completely removed from the query hooks module. There are now **zero** active consumer queries watching `['package-item', 'list']` or `['package-perk', 'list']`.
* **The Impact:**
  * Keeping these targets in `useErpHydration` preloads data that is never read via standard React Query subscriptions, cluttering the garbage collector memory.

---

## 🛠️ Recommended Action Plan

1. **Unify the Hydration Pipeline:**
   * Transition `hydratePackageRelations` to rely exclusively on nested package records.
   * Remove `PackageItem` and `PackagePerk` from the `HYDRATION_CONFIG` in `useErpHydration.js` to save boot time and eliminate redundant payloads.
2. **Clean Up Query Key Factory:**
   * If flat listings for package items or perks are not needed, deprecate `queryKeys.course.packageItem` and `queryKeys.course.packagePerk`.
3. **Refine Mutation Invalidations:**
   * Focus mutation onSuccess invalidations on `queryKeys.course.package.all` and cross-referenced course keys, reducing redundant calls to deprecated table keys.

# Dazzling ERP Admin Project Rules

This file documents the workspace rules and guidelines to be adhered to during feature design, components refactoring, and integrations.

## Frontend Import and Layout Structure Rules

1. **Strict Relative Path Imports:**
   - Always verify path alias configurations in `vite.config.js` and `jsconfig.json` before importing files using prefix characters like `@/`. 
   - Since `dazzling-erp-admin` does not configure path resolution aliases, you must strictly use relative imports (e.g. `../../../../components/ui/Card`).

2. **Feature Folder Tab Conventions:**
   - Adhere strictly to the flat directory structure in `src/features/[feature_name]/components/profile/` for profile-related tabs.
   - If subcomponents or timelines inside a profile tab panel need extraction, group them in a nested subfolder within `profile/` (e.g. `src/features/teacher/components/profile/[tab_name]/components/`). Do not introduce generic views/tabs hierarchies unless requested.

3. **Data Source Verification Rules:**
   - Deprecate mock arrays or fallback mock datasets immediately. 
   - Proactively map all query lookups to schemas under `E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/`. 
   - Define custom query hooks in your feature's query file (e.g. `useTeacherQueries.js`) calling `API_REGISTRY.DATA.QUERY` for generic lookups, and register the entity configuration inside `src/lib/react-query/cacheHelper.js` under `ENTITY_CONFIGS` so the progressive cache is hydrated correctly.

4. **UI Components & Slot System Architecture Rules:**
   - Refer to [component_rules.md](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.agents/component_rules.md) for standard guidelines governing atomic input fields, layout compound slots, overlay portal classes, and custom display badge components.

5. **UI & Data Consistency Standards:**
   - Refer to [ui_data_consistency.md](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.agents/ui_data_consistency.md) for responsive mobile transposition, dynamic database defaults, date-fns parsing, and form controllers synchronization.

6. **Attendance Management Design Patterns:**
   - Refer to [attendance_management.md](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.agents/attendance_management.md) for daily register sheet rules covering client-side batch caching, NR status validation, P/A/L selector typography, staged record snapshots, and mobile punch editor standards.

7. **Client-Side Data Wrangling Standards:**
   - Refer to [data_wrangling.md](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.agents/data_wrangling.md) for fluent `queryEngine.js` aggregation patterns and timezone-safe `date-fns` date operation standards.

8. **React Bug Report Formatting:**
   - Refer to [react-issue-format.md](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.agents/react-issue-format.md) for the standardized YAML-frontmatter bug report template used when documenting React lifecycle anomalies, state inconsistencies, or rendering flaws.

9. **React Design Patterns & Architecture:**
   - Refer to [react_design_pattern.md](e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.agents/react_design_pattern.md) for established React architectural patterns including headless hook separation, compound component structures, parallel DOM retention, and viewport-router page conventions.

10. **Frontend Performance, Validation & Data Optimization Standards:**
    - **Persistent Primary-Key Validation Caching**: Never use `WeakSet` or object-reference equality to track processed or validated states of hydrated records. Because hydrators map over records and produce new object literals on every read, object-identity checks fail. Always use persistent composite string ID sets (`Set<string>` formatted as `"${entityName}:${recordId}"`).
    - **Schema Contract Completeness**: All synthetic properties or relational entities attached during client-side hydration (e.g. `item_name`, `item_type`, `item_code`, `item`, `allocations`) must be explicitly declared in the entity's schema definition to prevent `ValidationEngine` schema violation warnings.
    - **Zero Logging in Render Paths & Hot Loops**: Top-level hook function bodies and record iteration utilities must remain completely silent. Synchronous `console.log` or `console.debug` statements in render paths cause main-thread serialization pauses during user keystrokes. Logging is strictly restricted to mutation callbacks (`mutationFn`, `onSuccess`, `onError`) or exceptional error boundaries.
    - **Keystroke State Isolation**: Search inputs must encapsulate immediate input state (`localValue`) at the component boundary and debounce parent notifications (default 300ms) to prevent cascading re-renders across parent pages during active typing.
    - **Pre-Computed KPI & Search Indexing**: Heavy calculations (fee aggregates, attendance scores, string `.toLowerCase()` conversions) must execute once during dataset enrichment (`student._kpi`, `student._searchIndex`). Filter passes and mobile card renders must strictly evaluate pre-computed boolean flags and substring indexes in $O(1)$ time.
    - **Single-Pass Dataset Enrichment**: Consolidate dataset normalization, metric enrichment, search indexing, and dropdown options extraction into a single-pass $O(N)$ traversal rather than multiple separate `useMemo` loops.


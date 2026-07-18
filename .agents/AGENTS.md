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

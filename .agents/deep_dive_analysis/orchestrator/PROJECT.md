# Project: Canonical Query Keys & RAM Filtering Audit

## Architecture
- Target Codebase: `dazzling-erp-admin` (`src/` directory)
- Target Guide: `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\.gemini\docs\canonical_querykeys_and_ram_filtering_guide.md`
- Target Infrastructure Files: `src/lib/react-query/cacheHelper.js`, `src/lib/react-query/queryKeys.js`, `src/lib/queryEngine.js`, `src/lib/react-query/hydrate.js`

## Feature Inventory
| # | Audit Requirement | Description | Milestone | Source |
|---|-------------------|-------------|-----------|--------|
| 1 | Rule 1 - Dynamic Filter Objects in Query Keys | Check if non-empty filter objects are passed into queryKeys instead of queryKeys.[entity].list(EMPTY_FILTER) | M1, M2, M3 | Architectural Guide § Dynamic Filters in Query Keys |
| 2 | Rule 2 - Missing Query Hook Flags | Check if query hooks miss `refetchOnMount: false` or 60-min `staleTime` | M1, M2, M3 | Architectural Guide § Stale Time & Refetch Flags |
| 3 | Rule 3 - Raw Inline useQuery Hooks | Check if views or modals use raw `useQuery` bypassing feature query hooks and `resolveList` | M2, M3 | Architectural Guide § Encapsulation & resolveList |
| 4 | Rule 4 - Missing ENTITY_CONFIGS Entities | Check if entities used across features are missing in `ENTITY_CONFIGS` in `cacheHelper.js` | M1 | Architectural Guide § ENTITY_CONFIGS Registry |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Core Infrastructure Audit | Audit `src/lib/react-query/`, `cacheHelper.js`, `queryKeys.js`, and identify all missing ENTITY_CONFIGS & key patterns | none | IN_PROGRESS |
| M2 | Feature Query Hooks Audit | Audit all files in `src/features/**/hooks/` and `src/features/**/` for query hook configurations and query keys | M1 | IN_PROGRESS |
| M3 | UI Views, Pages & Modals Audit | Audit all files in `src/pages/`, `src/components/`, and feature components for inline `useQuery` usage & query key patterns | M1 | IN_PROGRESS |

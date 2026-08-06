# Plan — Repository Audit for Canonical Query Keys & RAM Filtering Architecture

## Objective
Perform a read-only codebase audit of all UI components, feature query hooks, and cache configurations across the repository against the architectural guidelines in `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\.gemini\docs\canonical_querykeys_and_ram_filtering_guide.md`.

## Audit Criteria (4 Mandatory Rules)
1. **Rule 1 - Canonical Query Keys**: Identify every instance where dynamic filter objects are passed into `queryKeys` instead of `queryKeys.[entity].list(EMPTY_FILTER)`.
2. **Rule 2 - Query Hook Configuration**: Identify every query hook missing `refetchOnMount: false` or 60-minute `staleTime` (`1000 * 60 * 60` or `STALE_TIME` constant).
3. **Rule 3 - Feature Hook & resolveList Encapsulation**: Identify every view or modal using raw inline `useQuery` hooks bypassing feature hooks and `resolveList`.
4. **Rule 4 - Centralized ENTITY_CONFIGS**: Identify every entity missing in `ENTITY_CONFIGS` in `cacheHelper.js` (or schema/query definitions not properly registered in `ENTITY_CONFIGS`).

## Phased Approach
1. **Phase 1: Setup & Guide Verification**: Initialize orchestrator workspace, review guidelines, and decompose codebase into manageable exploration sub-domains.
2. **Phase 2: Explorer Dispatch**:
   - Sub-domain 1: `cacheHelper.js`, `queryKeys.js`, `queryEngine.js`, and `hydrate.js` (Core cache & query infra vs ENTITY_CONFIGS).
   - Sub-domain 2: `src/features/` (Feature custom query hooks, e.g. `useStudentQueries.js`, `useTeacherQueries.js`, `useAcademicQueries.js`, `useFinanceQueries.js`, etc.).
   - Sub-domain 3: `src/pages/` and `src/components/` (Views, pages, components, and modals using query hooks or raw `useQuery`).
3. **Phase 3: Synthesis & Verification**: Reconcile findings, verify file paths, line numbers, and specific rule/law violations.
4. **Phase 4: Final Report**: Generate complete, structured audit report and notify parent/user.

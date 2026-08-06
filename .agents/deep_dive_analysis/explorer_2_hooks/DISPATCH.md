# DISPATCH — 2026-08-06T02:43:00+05:30

## Audit Subagent 2: Feature Query Hooks Audit

### Assignment
Audit all query hook files in `src/features/` (e.g., `src/features/*/hooks/*.js`, `useStudentQueries.js`, `useTeacherQueries.js`, `useAcademicQueries.js`, `useFinanceQueries.js`, `useAttendanceQueries.js`, `useBatchQueries.js`, etc.) against `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\.gemini\docs\canonical_querykeys_and_ram_filtering_guide.md`.

### Requirements
1. Identify every instance where dynamic filter objects are passed into `queryKeys` instead of `queryKeys.[entity].list(EMPTY_FILTER)` (Rule 1).
2. Identify every query hook missing `refetchOnMount: false` or 60-minute `staleTime` (`1000 * 60 * 60` or `STALE_TIME` constant) (Rule 2).
3. Identify every query hook or feature call bypassing `resolveList` or proper caching encapsulation (Rule 3).
4. Identify entities fetched by hooks that are missing in `ENTITY_CONFIGS` (Rule 4).
5. Include exact file paths, line numbers, code snippets, and law/rule citations.
6. Output your analysis in `.agents/explorer_2_hooks/handoff.md`.

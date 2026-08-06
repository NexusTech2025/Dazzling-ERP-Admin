# DISPATCH — 2026-08-06T02:43:00+05:30

## Audit Subagent 3: UI Views, Pages & Modals Audit

### Assignment
Audit all page files in `src/pages/`, UI components in `src/components/`, and component files inside `src/features/` against `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\.gemini\docs\canonical_querykeys_and_ram_filtering_guide.md`.

### Requirements
1. Identify every view, page, or modal using raw inline `useQuery` hooks (imported directly from `@tanstack/react-query`) bypassing feature hooks and `resolveList` (Rule 3).
2. Identify every view, page, or modal passing dynamic filter objects into `queryKeys` or invalidating dynamic query key arrays inline (Rule 1).
3. Identify any inline `useQuery` calls missing `refetchOnMount: false` or 60-minute `staleTime` (Rule 2).
4. Include exact file paths, line numbers, code snippets, and law/rule citations.
5. Output your analysis in `.agents/explorer_3_views/handoff.md`.

# DISPATCH — 2026-08-06T02:43:00+05:30

## Audit Subagent 1: Core Infra & ENTITY_CONFIGS

### Assignment
Audit `src/lib/react-query/cacheHelper.js`, `src/lib/react-query/queryKeys.js`, `src/lib/react-query/hydrate.js`, `src/lib/queryEngine.js`, and related core files against `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\.gemini\docs\canonical_querykeys_and_ram_filtering_guide.md`.

### Requirements
1. Identify all entities used in the application that are missing from `ENTITY_CONFIGS` in `cacheHelper.js` (Rule 4).
2. Check for any violations of Rule 1 (dynamic filter objects in query keys), Rule 2 (`refetchOnMount: false` and 60-min `staleTime`), and Rule 3 in core infra.
3. Include exact file paths, line numbers, code snippets, and law/rule citations.
4. Output your analysis in `.agents/explorer_1_infra/handoff.md`.

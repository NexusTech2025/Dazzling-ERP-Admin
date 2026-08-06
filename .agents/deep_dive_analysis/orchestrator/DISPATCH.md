# DISPATCH — 2026-08-06T02:42:41+05:30

## 2026-08-06T02:42:41+05:30

Audit all UI components and feature query hooks across the repository against the architectural guidelines in e:\NAST\Dazzling\ERP System\dazzling-erp-admin\.gemini\docs\canonical_querykeys_and_ram_filtering_guide.md. Identify every instance where:
1. Dynamic filter objects are passed into queryKeys instead of queryKeys.[entity].list(EMPTY_FILTER).
2. Query hooks miss refetchOnMount: false or 60-minute staleTime.
3. Views or modals use raw inline useQuery hooks bypassing feature hooks and resolveList.
4. Entities are missing in ENTITY_CONFIGS in cacheHelper.js.

DO NOT perform any file edits or write operations on project source files. Report all findings with file paths, line numbers, and specific Law violations.

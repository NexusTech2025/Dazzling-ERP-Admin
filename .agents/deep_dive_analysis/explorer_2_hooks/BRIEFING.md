# BRIEFING — 2026-08-06T02:47:00+05:30

## Mission
Audit all feature query hooks in `src/features/` against the 5 Immutable Canonical Query Laws and report findings.

## 🔒 My Identity
- Archetype: explorer_2_hooks
- Roles: Read-only exploration agent
- Working directory: e:\NAST\Dazzling\ERP System\dazzling-erp-admin\.agents\explorer_2_hooks
- Original parent: 379dce6e-282c-459c-8dcd-fa04bf6881bc
- Milestone: Feature Query Hooks Audit

## 🔒 Key Constraints
- Read-only investigation — do NOT modify any source code files
- Report findings with exact file paths, line numbers, code snippets, and Law violations
- Deliver final report in handoff.md and notify parent

## Current Parent
- Conversation ID: 379dce6e-282c-459c-8dcd-fa04bf6881bc
- Updated: 2026-08-06T02:47:00+05:30

## Investigation State
- **Explored paths**: All hook files in `src/features/*/hooks/*.js`, `src/hooks/*.js`, and `cacheHelper.js`
- **Key findings**: Identified 27 specific rule violations across 14 query hook files:
  - Rule 1 (Dynamic query keys): 11 instances
  - Rule 2 (Missing refetchOnMount: false / staleTime): 18 instances
  - Rule 3 (Bypassing resolveList/resolveRecord): 14 instances
  - Rule 4 (Missing in ENTITY_CONFIGS): 4 entities (`TeacherSubject`, `TeacherDocument`, `PackageFeeAccount`, `AccountingData`), plus 5 invalid `listKey` configs in `ENTITY_CONFIGS`.
- **Unexplored areas**: None — exhaustive audit completed.

## Key Decisions Made
- Audited all 18 feature hook files + 3 standalone hook files.
- Compiled complete breakdown into handoff.md.

## Artifact Index
- `.agents/explorer_2_hooks/BRIEFING.md` — Agent briefing & state
- `.agents/explorer_2_hooks/progress.md` — Liveness heartbeat & task progress
- `.agents/explorer_2_hooks/handoff.md` — Final audit report

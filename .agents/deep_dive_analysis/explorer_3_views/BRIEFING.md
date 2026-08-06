# BRIEFING — 2026-08-06T02:49:00Z

## Mission
Audit all UI views, pages, and modals in src/pages/, src/components/, and src/features/**/components/ for query law violations.

## 🔒 My Identity
- Archetype: explorer
- Roles: read-only exploration agent for UI views, pages & modals
- Working directory: e:\NAST\Dazzling\ERP System\dazzling-erp-admin\.agents\explorer_3_views
- Original parent: 379dce6e-282c-459c-8dcd-fa04bf6881bc
- Milestone: UI Views, Pages & Modals Audit

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or modify source files
- Full audit covering Rule 1 (dynamic filter in queryKeys/invalidation), Rule 2 (missing refetchOnMount: false or 60m staleTime), Rule 3 (raw inline useQuery hooks bypassing feature hooks / resolveList)
- Output analysis report to handoff.md

## Current Parent
- Conversation ID: 379dce6e-282c-459c-8dcd-fa04bf6881bc
- Updated: 2026-08-06T02:49:00Z

## Investigation State
- **Explored paths**: `src/pages/`, `src/components/`, `src/features/`, `src/hooks/`
- **Key findings**:
  - Found 4 UI files containing inline `useQuery` calls or custom query wrappers (`FinanceDashboard.jsx`, `Installments.jsx`, `Students2.jsx`/`useStudents.js`, `Teachers2.jsx`/`useTeachers.js`) bypassing feature hooks & `resolveList`.
  - Found 10 UI components/pages passing dynamic filters into query hooks or invalidating/reading cache with non-canonical string arrays (`MoneyTransactionForm.jsx`, `CourseDetails.jsx`, `StudentFeeTab.jsx`, `TeacherAssignedClasses.jsx`, `BatchStudentRoster.jsx`, `Branches.jsx`, `Students2.jsx`, `Teachers2.jsx`, `ResolveDeleteConflictView.jsx`, `ResolveDeleteConflict.jsx`).
  - Found 4 inline query instances missing `staleTime: 60m` & `refetchOnMount: false`.
- **Unexplored areas**: None within scope. Audit complete.

## Key Decisions Made
- Performed read-only audit across all UI components and generated comprehensive 5-component handoff report.

## Artifact Index
- handoff.md — Complete Audit Report (e:\NAST\Dazzling\ERP System\dazzling-erp-admin\.agents\explorer_3_views\handoff.md)
- progress.md — Liveness heartbeat log

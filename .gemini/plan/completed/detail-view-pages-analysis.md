---
date: 2026-05-22T19:53:15+05:30
status: Approved
---

# Plan: Detail View Pages Architectural & Data Analysis

Systematically analyze the frontend code, data flows, query strategies, and schema mappings of the six detail view pages in the Dazzling ERP Admin system, saving a comprehensive report for each under `.gemini/docs/reports/`.

---

## Specific Diagnostic Criteria for Each Page

For every detail view page, the analysis report will diagnose:
1. **React Query Cache Usage**: Are we correctly retrieving cached data first (e.g. using `initialData` or localized relation resolvers) before querying the server?
2. **Refetch on Mount**: Are we preventing unnecessary refetches on mount (e.g. setting `staleTime: Infinity` or `refetchOnMount: false` where appropriate)?
3. **Form Submission Alignment**: Do component action mutations (updates, status toggles, inline actions) align with established React Query patterns (e.g. invalidating query keys on success, optimistic updates)?
4. **Schema Field Alignment**: Do the properties used in components and payloads map perfectly to the fields defined in the database schema: `full_schemav3.json`?

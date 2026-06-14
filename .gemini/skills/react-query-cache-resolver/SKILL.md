---
name: react-query-cache-resolver
description: Diagnoses and implements a Cache-First local relation resolver strategy for React Query to optimize detail/edit views by falling back to list caches.
---

# React Query Cache Resolver Strategy

This skill guides you in diagnosing and implementing a robust "Cache-First" data fetching strategy. When navigating from a list view to a detail/edit view, components should not immediately hit the server if the necessary data is already present in the React Query cache.

## Diagnosis Workflow

When asked to optimize or diagnose a React Query setup for a specific feature, follow these steps:

1. **Locate Queries**: Find the target feature's query hooks (e.g., `src/features/*/hooks/use*Queries.js`).
2. **Analyze List Queries**: Ensure a list query exists and its query key factory supports `.lists()` to retrieve all variants.
3. **Analyze Detail Queries**: Check the detail query (e.g., `useBatchDetailQuery`, `useStudentDetailQuery`).
4. **Identify Missing Cache Fallbacks**: If the detail query directly hits `queryFn` without an `initialData` configuration, it needs optimization.

## Implementation Strategy: Local Relation Resolver

To resolve relations locally, we implement a two-tier cache lookup mechanism using `initialData`.

### The Pattern

When rewriting the detail query, apply this exact pattern:

1. **Specific Cache**: Check if the exact detail item is cached.
2. **List Cache Fallback**: Iterate through all list caches to find the item.
3. **Timing/Staleness**: Set `initialDataUpdatedAt` to inherit the list's staleness, and provide a reasonable `staleTime` (e.g., 5 minutes) to prevent instant background refetches.

### Code Template

Refer to the logic in `assets/cache-first-template.js` for the structural implementation.

## Execution Rules
- Always import `useQueryClient` from `@tanstack/react-query`.
- Do not mutate the `queryFn`; only add `initialData`, `initialDataUpdatedAt`, and `staleTime` to the configuration object.
- Ensure the fallback condition precisely matches the entity ID against the list items (e.g., `item.id === id` or `item.entity_id === id`).

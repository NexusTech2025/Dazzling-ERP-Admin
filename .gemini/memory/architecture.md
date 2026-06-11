# V2 Architecture & Design Patterns

The Dazzling ERP system has migrated to a **V2 Architecture** designed for high modularity, schema-driven data flows, and strict UI consistency.

## 1. Core Structural Pattern: Feature-Based Modularity

The project follows a "Feature Slice" inspired pattern located in `src/features/`. Each domain (e.g., `batch`, `course`, `teacher`, `student`) is self-contained.

### Feature Directory Structure
```
src/features/[domain]/
├── api/             # Data fetching logic & mock data (never use mock APIs)
├── components/      # Feature-specific UI
│   ├── profile/     # Deep-dive dashboard components
│   └── forms/       # Creation/Edit forms
├── hooks/           # TanStack Query wrappers
├── utils/           # Mappers and domain-specific logic
└── constants/       # Feature-specific constants
```

## 2. The Data Flow Chain

Business logic is decoupled from UI via custom hooks, and data definitions are decoupled from implementations via a registry.

**The Chain**: `UI Component` → `Query Hook` (use*Queries.js) → `api.js` → `apiClient.executeAction` → `API_REGISTRY`.

### API Registry & Client
- **`apiClient.js`**: A centralized engine that wraps all requests in a unified envelope, manages error mapping, and enforces security headers.
- **`API_REGISTRY.js`**: A lookup table mapping frontend semantic paths to backend action strings. This allows the backend to change its endpoint structure without breaking the frontend.

## 3. State Management & Initialization

- **Server State**: Primary state management is handled by **TanStack Query**.
- **Hydration Guard**: The `HydrationGuard` and `useErpHydration` hook ensure that critical data (Courses, Teachers, Batches, Branches) is pre-cached before the main UI renders, preventing "flash of empty content."

## 4. UI Strategy: Atomic & Compound Components

- **Atomic Primitives**: Found in `src/components/ui/v2/` (e.g., `BaseInput`, `Button`).
- **Compound Components**: Structural components like `FormField` and `FormSection` provide consistency (labels, error states, layout) across all forms.
- **Semantic UI**: Prefer semantic wrapper components over raw HTML elements to reduce DOM depth and improve maintainability.

## 5. React Query "Cache-First" Strategy

A "Cache-First" data retrieval strategy is implemented for detail and edit views to reduce unnecessary server requests.

### Local Relation Resolver Pattern
When navigating from a list to a detail view:
1.  **Tier 1**: Check the specific detail cache (e.g., `queryKeys.batch.detail(id)`).
2.  **Tier 2**: Search across all cached list data (e.g., `queryKeys.batch.lists()`).
3.  **Tier 3**: Fallback to server fetch only if Tier 1 & 2 are empty.

> **Rationale**: This provides an instantaneous UI experience and significantly reduces API token usage.

## 6. Dynamic Form Orchestration

Modern forms in the ERP (e.g., `AddTeacher.jsx`) have moved from static hardcoded arrays to **Live API Resolution**.

### Key Rules for Dynamic Forms:
- **Zero Static Options**: Selection options for Branches, Courses, and Groups **MUST** be fetched via React Query hooks (e.g., `useBranchesQuery`).
- **Loading & Disabled States**: Form inputs dependent on external data **MUST** implement `isLoading` indicators and be `disabled` until data is ready.
- **Mapping Strategy**: Data from the API should be mapped to the UI components' `options` format (label/value) directly within the component or via a dedicated selector hook.

## 7. Schema-UI Synchronization (The Source of Truth)

All UI field names and data payloads **MUST** align perfectly with the backend decoupled JSON schemas located in the new schema directory under `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema`.

### Standards:
- **Field Naming**: Replace legacy UI-centric names with database-accurate names (e.g., `course_name` -> `name` in Course model).
- **ID-Based Selection**: Forms should store and transmit unique identifiers (e.g., `course_id`) rather than semantic strings (names) to maintain database integrity.
- **Derived Labels**: Use `useMemo` hooks to resolve display names/labels from IDs for UI rendering (e.g., finding the `name` of a selected `course_id` from the cached `coursesData`).

## 8. Development Workflow: Schema-Driven

- **Source of Truth**: The decoupled domain-grouped files inside `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema` define all data structures.
- **Mock Data Engine**: Every feature is driven by mock data. To ensure reliability and client-server consistency, the system **never uses any mock APIs**; instead, it consumes structured local mock data based directly on these domain-grouped JSON schema structures.

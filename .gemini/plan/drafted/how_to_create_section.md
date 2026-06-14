# Draft Plan: Section Architecture & Documentation Initiative

This document outlines the blueprint for creating `how_to_add_new_section.md`—a production-grade manual to guide developers and agent sub-modules when adding a new database-backed UI module.

---

## 1. Objectives

- **Developer Onboarding**: Serve as an architectural blueprint for onboarding frontend engineers.
- **Agent Executable**: Maintain a predictable step-by-step logic that AI agents can execute safely.
- **Architectural Reference**: Ensure consistent application of atomic V2 components, React Query factories, and standard API wrappers.

---

## 2. Document Sections & Topics

### A. Section Architecture Overview
- Page, feature folder, component container, and presentation layer boundaries.
- Data flow lifecycles (Request ➔ Action Registry ➔ API Client ➔ GAS Backend ➔ Cache Sync ➔ Component Render).
- Mermaid sequence diagrams detailing query invalidation and mutation side effects.

### B. Directory Structure Standards
- Standard organization under `src/features/[feature]/`:
  - `api/` (Pure execution queries using `apiClient.js`)
  - `hooks/` (Encapsulated React Query list and detail hooks)
  - `components/` (Modals, cards, list elements)
- Page controller mappings under `src/pages/[role]/`.

### C. API Integration Standards
- Requirements for pure functions using `executeAction(ActionKey, payload, token, options)`.
- Enforcing JSDoc typings for input variables, payload boundaries, and abort controller settings.
- Standard signatures for list, create, detail, update, and delete actions.

### D. TanStack Query Standards
- Standard staleTime (5 mins) and mount refetching settings.
- Custom query keys factory prefix configuration (e.g. `queryKeys.feature.all`).
- Mutation workflows: Close modal operations ➔ Invalidate parent query lists on success.

### E. Custom Hook Encapsulations
- Custom list queries (e.g., `use[Entity]Query`).
- Custom detail queries (e.g., `use[Entity]DetailQuery`).
- Custom mutation queries (e.g., `useCreate[Entity]Mutation`).

### F. Smart vs. Dumb Presentation Layers
- Page controllers manage state queries, mutations, and permissions.
- Children elements handle visual layouts, tables, and pagination events.
- Implementation of standardized empty, error, and dynamic skeletons.

### G. Form Composition & Validation
- Standard validation schemas (e.g., Zod or manual boundary models).
- Unified V2 inputs (`FormField`, `TextInput`, `SelectInput`, `PhoneInput`).
- Differentiating Create vs. Edit form layouts.

### H. Core Design Patterns
- Query Key Factories (centralized cache keys).
- Container/Presenter separation.
- Component Composition (children props instead of prop-drilling).
- Adapter pattern mapping raw database properties to descriptive UI fields.

### I. State Allocation Matrix
- **React state**: Local UI flags (e.g., modal isOpen state).
- **Query cache**: Relational tables, catalog lists, active filters.
- **URL params**: Selected page numbers, search queries, active detail IDs.

### J. Code Quality & Performance
- Memoizing computed filters (via `useMemo`).
- Standard retry intervals and Axios/network timeout handlers.
- Descriptive error wrappers and fallback toaster overlays.

---

## 3. Reference Implementation Checklist

A final checklist verifying structural completeness:

- [ ] Action mapped inside [apiRegistry.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/services/apiRegistry.js)
- [ ] API service endpoints created under `src/features/[feature]/api/`
- [ ] Query keys factory registered inside [queryKeys.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/queryKeys.js)
- [ ] Encapsulated query/mutation hooks exported under `src/features/[feature]/hooks/`
- [ ] Form layout validation schema declared
- [ ] UI lists bind to the custom query hook
- [ ] Mutations invalidate correct cache query keys
- [ ] Compiles successfully without linter warnings
# React Rendering & Performance Design Patterns

This document outlines key performance design patterns that must be followed during React component creation and data integration to ensure high-performance rendering.

---

## 1. Render Minimization & Memoization

*   **Lifting Stateful Popover/Form Overlays to Parent Context**:
    Do not nest stateful overlay/popover panels inside components that are rendered inside maps or lists (e.g. daily grid cells). This pollutes the DOM and forces all list elements to re-render when the overlay state changes. Instead, lift the editing day/record state to the parent component, render a single modal overlay conditionally at the parent level, and pass a stateless trigger callback to the child list items. Keep the form's internal input states localized to the modal to avoid triggering parent renders on every keystroke.

*   **Client-Side Filtering and Memoization (`useMemo`):**
    To eliminate redundant network calls and server overhead, avoid re-fetching data every time user filters change. Fetch global or date-bounded datasets at once, cache them, and filter them dynamically in-memory. Use `useMemo` to cache filter executions, search filtering, and KPI summary calculations on the client side. This ensures instantaneous UI updates with zero latency and prevents repetitive database queries.

*   **Stable Function References (`useCallback`):**
    To prevent infinite rendering loops (especially when components mount inside parent forms or view transitions), wrap function properties and updaters (e.g. `setFormData`, `resolver`, `setImmediatePayment`) in `useCallback` hooks before passing them to child components or listing them in `useEffect` dependency arrays.

*   **Selective State Updates (Keystroke Throttling):**
    When handling real-time data inputs, perform key-by-key comparison checkups before updating the state (e.g. only calling React Hook Form's `setValue` for properties that actually changed). This avoids recursive validation runs and re-renders on every keystroke.

*   **Decoupled Pub-Sub Stores for Secondary UI States:**
    For secondary or global UI systems that do not affect core page flow (e.g., validation alerts, error notifications), avoid coupling state directly to the main React page layout trees. Implement a lightweight, vanilla JavaScript observer/store (pub-sub) model. Cap the maximum store elements size (e.g. `slice(-50)`) to prevent memory leaks and eliminate unnecessary render iterations on the main layout.

*   **JS-Conditional Responsive Viewports (`useIsMobile`)**:
    Always split device-specific layout frameworks (desktop layouts vs. mobile layouts) at the JavaScript level using a media-query state hook (`useIsMobile`) to prevent mounting redundant sub-trees and triggering unnecessary child hooks or queries. Keep sub-tab components responsive, accepting an `isMobile` prop to adapt internal templates instead of duplicating files.

*   **Tab View State Retention via Parallel Rendering & CSS Toggles**:
    When building tabbed interfaces where user inputs, ephemeral state, or scroll context must persist, render all tabs concurrently in a lookup registry (`tabRegistry`) and configure visual toggles (`hidden` vs. `block`) to swap them, rather than conditionally mounting them in JS. Combine this with `React.memo` on the child tabs to skip unneeded render passes.

*   **Headless Hook Domain Separation (Read vs Write):**
    When a presentational component accumulates business logic exceeding ~150 lines of non-JSX code (queries, staging buffers, mutations, and KPI calculations), decouple the logic into two domain-specific headless hooks:
    1. **Read Domain Hook** (e.g. `useAttendanceRegistryData`): Manages data fetching, calendar coordinates, and baseline record merging. Returns read-only derived state.
    2. **Write Domain Hook** (e.g. `useAttendanceTransactionState`): Accepts baseline data from the Read hook, manages staging buffers, delta pruning, payload formatting, and mutation commit handlers. Returns mutable state and action handlers.
    The presentational component consumes both hooks and focuses exclusively on layout, column definitions, and conditional rendering.

*   **DataTable Cell Wrapper Memoization:**
    Never pass inline arrow function callbacks inside DataTable column `render` properties. Instead, extract interactive cells (status toggles, time inputs, action buttons) into dedicated memoized wrapper components (e.g. `StatusCell`, `TimeCell`, `ActionCell`) that:
    1. Accept stable prop references (`studentId`, `updateStageField`).
    2. Bind the row-specific handler inside `useCallback` within the wrapper.
    3. Are wrapped in `React.memo` to skip re-renders when their specific row data is unchanged.
    This guarantees O(1) cell rendering — only the modified row's cells re-render.

*   **Static Config Array Hoisting:**
    Static configuration arrays (e.g. status option lists, column header definitions, variant maps) that do not depend on component state or props must be declared at the **file module level**, outside the component function body. This ensures a stable reference identity across renders and prevents unnecessary child re-renders.

*   **Callback Dependency Decoupling (Pass Object, Not ID):**
    When a mutation callback needs to access data from a specific row (e.g. to build a save payload), pass the entire row object to the callback at invocation time instead of passing an ID and having the callback search through a derived list. This eliminates the derived list from the callback's `useCallback` dependency array, keeping the callback reference stable across renders.
    ```javascript
    // ❌ BAD: commitIndividualRow depends on studentsList (changes every keystroke)
    const commitIndividualRow = useCallback(async (studentId) => {
      const row = studentsList.find(s => s.student_id === studentId);
      // ...
    }, [studentsList, ...]);

    // ✅ GOOD: commitIndividualRow is stable (no derived list dependency)
    const commitIndividualRow = useCallback(async (row) => {
      const payload = buildPayload(row.student_id, row);
      // ...
    }, [batchId, selectedDate, buildPayloadStructureItem, optimizedMutation]);
    ```

---

## 2. Ingest & Caching Optimization

*   **Round-Trip Consolidation (Batch Ingestion):**
    Avoid sequential endpoint requests for page hydration. Consolidate read operations into a single manifest-driven batch API endpoint (e.g. `SHEET_BATCH_READ`) to query multiple sheets or collections in a single round-trip, eliminating request waterfailing.

*   **O(1) Validation Caching (`WeakSet`):**
    To fix render-time CPU lag and UI jank caused by validating records repeatedly on every React render loop pass, implement an in-memory `WeakSet` validation reference cache. This tracks unique object references so that each record is validated exactly once upon ingestion, completely eliminating redundant validation calls during component re-renders.

*   **Lazy Mode Hydration:**
    Switch validation checks from a "fast" mode (which throws hard exceptions and crashes rendering) to a "lazy" (non-throwing) mode, cleanly decoupling schema validation from the React UI render lifecycle.

*   **Local Skeleton Loaders and Decoupled Loading States:**
    Avoid prop-drilling loading state properties (like `isContentPending`) from parents down to child components. Let child workspaces internally call their own state hooks to check `isLoading` or background fetches. Use localized skeleton loaders instead of global blockers to prevent full-screen layout shifts.

*   **Stale-While-Revalidate (SWR) Pattern:**
    Rely heavily on React Query's SWR caching settings (e.g., a `staleTime` of 2-5 minutes and `refetchOnMount: true`). This guarantees that when a user switches tabs, layouts populate instantly from cache without any "flash-of-empty" UI while data silently validates in the background.

*   **Centralized Query Key Reference**:
    Never hardcode raw array query keys inside component hooks or mutations (e.g., `['finance', 'accounting-data']`). Always reference keys from the centralized query key factory (`queryKeys.js`) to guarantee invalidation consistency and prevent cache collision anomalies.
    
*   **Debounced Breakpoint Listeners**:
    When registering window resizing hooks or scroll listeners dynamically to switch layout views (e.g. switching between desktop table and mobile card lists), always debounce or throttle the window resize handler to minimize recalculations and prevent browser rendering lag.

---

## 3. React Anti-Patterns

*   **Never Trigger `setState` Inside `useEffect` for Synced States:**
    Avoid using `useEffect` to synchronize props or other state values back into a local React state variable (e.g., staging registry options from an API query or filtering parameters). This creates a laggy UI, duplicate render cycles, and introduces high risk of infinite recursive loops ("Maximum update depth exceeded") when the dependency reference changes on every render.
    
    *   **The Remediation**: Compute values dynamically during the render phase or use `useMemo` to derive values from upstream variables/props. If state must be cloned or initialized from props (such as form edit worksheets), initialize it directly in `useState` (e.g., `useState(() => initialVal)`) or track modifications differentially based on user interactions instead of listening to upstream updates in `useEffect`.

---

## 4. Mobile Layout Slotted Composition (`MobileBaseLayout`)

*   **Rule**: When building or refactoring list/detail views on mobile screens (< 768px), always use `<MobileBaseLayout>` compound slots instead of custom nested layouts.
*   **Layout Structure**:
    ```jsx
    <MobileBaseLayout>
      <MobileBaseLayout.Header title="Title" renderLeft={...} renderRight={...} />
      <MobileBaseLayout.FilterSlot>...</MobileBaseLayout.FilterSlot>
      <MobileBaseLayout.ListSlot isEmpty={...} renderEmptyState={...}>...</MobileBaseLayout.ListSlot>
      <MobileBaseLayout.FloatingActionSlot>...</MobileBaseLayout.FloatingActionSlot>
    </MobileBaseLayout>
    ```

---

## 5. Dynamic Time & Class Filter Normalization

*   **Rule**: Standardize schedule filters on list screens to use these computed ranges:
    - `Early Morning`: Before 08:00
    - `Morning`: 08:00 – 12:00
    - `Noon`: 12:00 – 14:00
    - `Afternoon`: 14:00 – 16:00
    - `Evening`: 16:00 onwards
*   **Academic Class Filters (Deprecate Regex Guessing)**: Do not use regular expressions or text matching to extract class grades or boards from batch or course names. Instead, fetch related Course records, build lookup Maps (`new Map(courses.map(c => [c.course_id, c]))`), and read metadata properties directly (`course.metadata.class` and `course.metadata.board`) to construct filter selector lists.

---

## 6. Robust Single-Pass Block Editing

*   **Rule**: When performing source code edits using file replacing tools, avoid tiny edits that can corrupt surrounding tags. Read a broad block of context (approx. 100 lines) and replace the entire logical node (block, statement, or function) in one single pass.

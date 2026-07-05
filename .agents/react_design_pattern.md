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

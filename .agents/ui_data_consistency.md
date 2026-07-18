# UI & Data Consistency Standards

This document establishes UI rendering, layout alignment, and database persistence constraints to ensure consistency across all features in Dazzling ERP.

---

## 1. UI & Layout Consistency

*   **Split Responsive Layouts vs. Unified Layout Hacks**:
    When designing complex responsive grids (like calendar grids) that differ completely between desktop (horizontal header columns) and mobile (transposed vertical weekday rows + horizontal week columns), avoid cramming both behaviors into a single component using conditional Tailwind utility classes. Instead, split them into separate presentation components (e.g. `DesktopCalendarGrid` and `MobileTransposedCalendarGrid`) to isolate structural calculations, simplify rendering paths, and optimize mobile layouts.

*   **Mobile Grid Transposition**:
    When 7-column calendar grids are squashed on mobile screens, transpose the grid layout so that days are listed vertically (in a frozen left column: `sticky left-0 z-20 bg-...`) and weeks are laid out horizontally. Use horizontal scrolling `overflow-x-auto pb-4 select-none scrollbar-thin` and widen day cells to `w-32` (`min-w-[8rem]`) so check-in/out timestamps and remarks fit legibly without text overflows or tap-target collisions.

*   **Tailwind & JS Breakpoint Alignment:**
    When managing layout states via JavaScript media listeners (e.g. `isMobile` checks) alongside Tailwind CSS responsive utilities (e.g. `md:hidden`), always synchronize the JS breakpoints exactly with Tailwind's standard config thresholds (e.g., check `window.innerWidth < 768` to align with `md:` class properties).

*   **Hidden Wrapper Safety (Zero-Width States):**
    When components measure dimensions dynamically (e.g. using `clientWidth` or `getBoundingClientRect()`), do not return early on `width === 0` without initializing state. Initialize a safe fallback state (e.g., rendering all options visible) so that when the hidden wrapper (accordion, tab panel, or transition sheet) is subsequently revealed, the component layout displays correctly.

*   **Non-Intrusive Dropdown Interactions:**
    To close dropdown menus or overlays on click-away, avoid rendering full-screen transparent backdrop blockages (e.g. `fixed inset-0 z-40`). This captures and swallows user events, forcing them to double-click elements on the rest of the page. Instead, wrap the dropdown in a component reference and add a document `mousedown` event listener to close the state on click-outside.

*   **Performance & Viewport Isolation (JS vs. CSS Toggles)**:
    Always split layout components (desktop vs. mobile shells) at the JavaScript level using conditional viewport state checks (e.g. `useIsMobile`) instead of using CSS hide/show utility classes. This prevents duplicate DOM mounting, reducing hook allocations, queries execution, and rendering overhead.

*   **Tab Scroll & Input Persistence**:
    When managing active tab views on detail views, render all tab panels in parallel in a layout registry (using `tabRegistry` configurations) and toggle visibility using Tailwind `block` or `hidden` classes. This preserves user inputs, scroll contexts, and validation states during tab navigation.

*   **Zero-Component Waste & Abstract Layout Patterns**:
    Always reuse predefined UI modules (like `<Button>` and `<MainLayout>`) and consolidate actions on mobile using a sticky `<ActionFooter>` mapped with clean config objects. For illustration graphics, use direct inline SVG elements to avoid network resource lag and ensure dark-mode styling compatibility.

*   **Mobile State Architecture & Component Composition**:
    *   **State Lifting**: Lift custom workspace hooks to page orchestrator levels whenever layout structures require rendering states across multiple viewport layouts (desktop vs mobile slots).
    *   **Prop Injection Fallback**: Workspace modules MUST accept `workspaceState` as an optional prop and fallback to local hook instantiation.
    *   **Conditional Mounting**: Prefer JSX conditional mounting over CSS display toggles (`hidden` / `block`) when states are lifted to parent orchestrators.
    *   **Decoupled Mobile Layouts**: Each sub-workspace is independently responsible for managing its own viewport rendering via its respective `Mobile*ListView` component (or `Mobile*ListView` wrapper). Do not combine multiple domains into monolithic mobile lists.

*   **Parallel DOM Retention Map (Tab State Anti-Pattern)**:
    When managing active tab views on profile detail pages, **never** use conditional `switch` or ternary statements to mount/unmount tab content panels. This destroys component scroll positions, input focus states, ephemeral React state (like staged form data), and causes unnecessary re-mount query triggers. Instead, render **all** tab panels simultaneously and toggle visibility using Tailwind `block` / `hidden` classes:
    ```jsx
    const tabRegistry = { Overview: <OverviewTab />, Students: <RosterTab /> };
    {Object.entries(tabRegistry).map(([key, component]) => (
      <div key={key} className={activeTab === key ? 'block' : 'hidden'}>
        {component}
      </div>
    ))}
    ```
    This ensures child components maintain their entire lifecycle, cached query data, and DOM scroll offsets.

*   **Headless Logic Hook + Pure Presentational Shell Separation**:
    Complex profile pages must decouple business logic (queries, mutations, cache lookups, memoized derivations, and navigation callbacks) into a dedicated headless custom hook (e.g. `useBatchProfile`) located in `src/features/[domain]/hooks/`. The page-level component becomes a thin viewport router that instantiates the hook and delegates to `React.memo`-wrapped layout shells (`DesktopProfile` / `MobileProfile`). This achieves:
    - Zero logic duplication between viewport variants.
    - Isolated re-render boundaries via `React.memo`.
    - Clean testability of business logic independent of UI.

*   **Three-Tier Viewport Router Page Pattern**:
    Page-level components (`src/pages/admin/`) should follow a strict three-tier execution model:
    1. **Hook Layer**: Call the headless domain hook to obtain all data and callbacks.
    2. **Guard Layer**: Render loading spinners and error boundaries as early returns.
    3. **Router Layer**: Conditionally render `<MobileLayout>` or `<DesktopLayout>` based on `useIsMobile()`, passing all hook outputs as spread props.
    ```jsx
    const ProfilePage = () => {
      const { isMobile, isLoading, error, ...props } = useDomainProfile();
      if (isLoading) return <Spinner />;
      if (error) return <ErrorView />;
      return isMobile ? <MobileProfile {...props} /> : <DesktopProfile {...props} />;
    };
    ```

---

## 2. Database ID Persistence Policy

*   **Primary Key Generation Restrictions:**
    Do not construct or transmit primary key values (e.g. segment IDs, course IDs) on the client side during entity creation. Delegate all ID generation sequences exclusively to the backend database schema layers. Only include primary key fields in payloads when editing existing records (i.e. `isEditMode === true`).

*   **Decoupled Card Slotted Interfaces**:
    When list items on mobile require expandable inline detail sheets (e.g. mobile directory lists), use `<ExpandableLowDensityCard>` with dedicated slot markers (`leftHeader`, `rightHeader`, `expandedContent`). Never build ad-hoc flex-box card wrappers inside domain page loops.
    
*   **Double Padding Mitigation & Page Layout Guttering**:
    To prevent layout spacing bugs on mobile screens, content headers and main page wrappers must inherit standard horizontal paddings from `<main>` (`px-4 lg:px-6`). Individual page content elements should omit horizontal padding settings (`px-0` or left unconfigured) and enforce vertical margins (`pt-6 lg:pt-10 pb-6`) only.
    
*   **Strict Date Processing**:
    Always parse ISO date strings utilizing `date-fns` parsing routines (`parseISO`) rather than instantiating native JS `new Date(...)` parsed properties. Perform client-side formatting consistently using `format(parsedDate, 'MMM d, yyyy')` to prevent local browser timezone shift variations.

---

## 3. Data Synchronization & Form Validation

### Category A: API & Data Synchronization Patterns
*   **Fetch-Boundary Data Normalization**: When database properties represent stringified JSON structures (such as weight distributions or scope configurations):
    *   Always normalize and parse them into standard JavaScript objects at the **query resolution/fetch layer** (e.g., inside TanStack Query `queryFn` handlers).
    *   This prevents duplicate parsing logic, keeps downstream selectors clean, and ensures views receive ready-to-use typed states.
*   **Graceful Typechecking during Edit Initialization**: When binding database payloads to edit states, support polymorphic representations (both raw string and parsed object formats):
    *   Perform safe typechecking (e.g., `typeof config.scope_id === 'object'`) before parsing, preventing runtime deserialization crashes when editing.

### Category B: Form Validation & UI Robustness
*   **Unified Validation Error Fallbacks**: Layout wrappers (such as `FormField.jsx`) must inspect their wrapped children.
    *   If validation errors are present, but the child is a React Hook Form `<Controller>`, custom sub-component, or standard container `<div>` (which cannot natively output helper text), the layout wrapper must render the error message fallback element automatically.
    *   This guarantees validation messages are visible to administrators, preventing silent form submission blocks.
*   **React Hook Form Reset Normalization**: When initializing forms via `reset()` inside edit dialogs, ensure any complex object/array structures are stringified if the underlying validation schema (e.g. Yup) expects string inputs. This prevents validation mismatches during the submission handshake.
*   **Database-Driven Defaults & Shared Time Utilities**:
    *   Decouple time segment parsing, keyboard formatting, and boundary validation from React hooks/components into static helper services under `src/lib/` (e.g. `normalizeTime.js`, `formatTime.js`, `timeSegmentUtils.js`).
    *   Never hardcode default shift/session times (e.g. `'08:00'`, `'16:00'`) in client-side state hooks. Always extract defaults from database-fetched relationship fields (e.g. `batch.schedule.start_time` and `batch.schedule.end_time`) with standard presets acting only as defensive fallbacks.

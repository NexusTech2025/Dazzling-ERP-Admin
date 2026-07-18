# Component Development Rules & UI Primitives

This document establishes UI standards, atomic reusable components rules, and custom layout primitives composition within the Dazzling ERP Admin workspace.

---

## 1. Atomic UI Component Reuse & Policy

*   **Zero Custom Primitive Elements**:
    You are strictly prohibited from writing raw HTML or ad-hoc custom styled inputs/buttons if a standard component exists under `src/components/ui/v2/`.
    *   **Buttons**: Always use `<Button>` (`src/components/ui/v2/Button.jsx`). Map options using `variant` (`contained`, `outlined`, `text`, `danger`, `success`) and standard icon tags (`startIcon`, `endIcon`).
    *   **Inputs**: Use `<TextInput>`, `<PhoneInput>`, `<SelectInput>`, `<RadioGroup>`, all wrapped in `<FormField>` to handle error helper labels, descriptions, and structural padding.
    *   **Metric Tiles**: Overview KPI aggregates must use `<KpiCard>` (`src/components/ui/v2/KpiCard.jsx`) to automate currency symbols and coordinate layout grids.

---

## 2. Compound Slot Architecture & Layout Primitives

*   **Compound Dot-Notation Slots**:
    Always build and wrap viewport-locked layout shells (like mobile dashboards) utilizing static compound properties on the layout wrapper (e.g., `MobileBaseLayout`).
    *   *Design Principle*: The parent wrapper defines global viewport scroll boxes (`h-screen overflow-hidden`) and flex boundaries. Subcomponents mount directly into specific slots:
        *   `MobileBaseLayout.Header` (Sticky top bar navigation)
        *   `MobileBaseLayout.TabsSlot` (Segmented tab selector rows)
        *   `MobileBaseLayout.StatsSlot` (Horizontal KPI metrics scroller)
        *   `MobileBaseLayout.FilterSlot` (Scrolling filter selector belt)
        *   `MobileBaseLayout.ListSlot` (Independently scrollable card feed)
        *   `MobileBaseLayout.ActionBarSlot` (Sticky bottom confirmation/bulk action tray)

---

## 3. Element Class Customizations & Merging

*   **Component Class Customization Rules**:
    Primitive components must support target styling extensions by appending custom classes from the consumer:
    *   *Element target selects*: For items inside loop renderers (like `HorizontalStatMetrics`), pass `item.className` down to the sub-primitive `<KeyValuePair>`:
        ```javascript
        className={`items-center text-center ${item.className || ''}`}
        ```
    *   This permits styling target elements (such as targeting icons with custom background colors and text states) directly via class wrappers:
        ```javascript
        className: '[&_span.material-symbols-outlined]:bg-blue-500/10 [&_span.material-symbols-outlined]:text-blue-500'
        ```

---

## 4. Mobile Directory Filters Layout

*   **Horizontal Filter Dropdowns**:
    Consolidate mobile select option elements as scrollable horizontal rows of rounded-full selector badges:
    *   *Style Token*: `appearance-none pr-8 pl-4 py-2 rounded-full border border-border-light dark:border-white/8 bg-white dark:bg-black/20 text-[11px] font-bold text-text-main dark:text-white outline-none cursor-pointer focus:border-primary transition-all`
    *   *Arrow Indicators*: Always place a pointer-events-disabled `keyboard_arrow_down` icon absolute positioned on the right boundary of the select box to ensure visual dropdown indicators are present.

---

## 5. Overlay Modals & Portals

*   **Portal Viewport Overlays**:
    Centered modal dialogs (like `ConfirmModal` or form overlays) must render inside Portals and utilize standard backdrop class combinations to guarantee layout priority:
    *   *Overlay Base*: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm`
    *   *Entry Animation*: Add entry fade-in classes to prevent jarring mounting flickers on mobile screens (`animate-in fade-in zoom-in-95 duration-150`).

---

## 6. Compound Dropdown & Selection Standards

*   **Compound Dropdown Components**:
    When creating dropdown menus or combo-boxes, do not write monolithic wrappers that consume layout templates via render callbacks. Instead, export compound primitives (`Dropdown`, `Dropdown.Trigger`, `Dropdown.Menu`, `Dropdown.Search`, `Dropdown.Items`, `Dropdown.Item`, `Dropdown.HiddenSelect`).
*   **Decoupled Children List Rendering**:
    Use a render-prop child function on list containers (`Dropdown.Items`) to map over options implicitly, keeping context references out of page layouts:
    ```jsx
    <Dropdown.Items>
      {(item, index, { setIsOpen, selectedId }) => (
        <Dropdown.Item key={item.id} item={item} index={index}>
          {item.name}
        </Dropdown.Item>
      )}
    </Dropdown.Items>
    ```
*   **Compile-Safe Dynamic CSS variables**:
    Never concatenate dynamic pixels or rem heights directly into Tailwind class names. Use standard inline style bindings linked to compile-safe arbitrary class selectors:
    ```jsx
    style={{ '--dropdown-max-height': computedMaxHeight }}
    className="max-h-[var(--dropdown-max-height)]"
    ```
*   **Mobile Focus Guards**:
    To prevent virtual keyboard popups from disrupting viewport layouts on coarse-touch/mobile screens, always guard text input `.focus()` calls with device detection checks:
    ```javascript
    const isMobileDevice = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    if (!isMobileDevice) inputRef.current.focus();
    ```

---

## 7. Atomic Filter Component Modularity

*   **Named Export Decomposed Filters**:
    When building register toolbar filters, avoid grouping all filter dropdowns into a single heavy panel. Split search inputs, status buttons, segments, class levels, boards, and batch selectors into individual named controlled components co-located in a domain module (e.g., `BatchFilters.jsx`). This allows pages to selectively import and render only what they require.

---

## 8. Reusable Time Display Badges & Components

*   **Standardized Time Display**:
    Always wrap time strings in standardized presentational badges like `<TimePill />` and `<Time />` (`src/components/ui/v2/TimePill.jsx` and `src/components/ui/v2/Time.jsx`) rather than implementing ad-hoc inline Tailwind flex containers or custom colored spans. Use variant classes (`success`, `info`, `warning`, `danger`, `default`) to set background and border styles consistently.

---

## 9. Compound Component Architecture for Domain Layouts

*   **Compound Slot Components (Inversion of Control)**:
    When a component suffers from "prop explosion" (managing arrays of metadata, action configurations, and display variants through a single flat props surface), refactor it into a **Compound Component Architecture** using static sub-component assignment:
    ```jsx
    function ProfileHero({ children, className }) {
      return <div className={`... ${className}`}>{children}</div>;
    }
    function Header({ children }) { return <div>...</div>; }
    function Title({ children }) { return <h2>...</h2>; }
    ProfileHero.Header = Header;
    ProfileHero.Title = Title;
    ```
    The parent controls spacing and theming. The consumer controls content sequencing via clean JSX tags. This eliminates config arrays and gives consumers full layout control.

*   **Stateful Sub-Component Isolation**:
    When a sub-component manages ephemeral local state (like clipboard copy timers, toggle animations, or hover counters), encapsulate that state strictly inside the sub-component (e.g. `ProfileHero.Identity` contains `const [copied, setCopied] = useState(false)`). This prevents state refreshes from triggering layout recalculations across the entire parent container boundary.

---

## 10. Domain Component Classification (`src/components/domain/`)

*   **Domain vs. Generic Component Placement**:
    - Components that are reusable across **all** feature domains without modification belong in `src/components/ui/` (e.g. `Button`, `Badge`, `TextInput`, `Card`).
    - Components that serve a **specific domain purpose** (like profile hero layouts, entity cards, or admission forms) but are shared across multiple entities within that domain, belong in `src/components/domain/` (e.g. `ProfileHero.jsx` used by Batch, Student, and Teacher profiles).
    - Never place domain-specific compound layouts inside the generic `ui/v2/` directory.

---

## 11. Presentational Presets (`src/components/ui/presets/`)

*   **Range Display Presets**:
    When displaying paired start/end values (dates, times), always use the standardized preset components from `src/components/ui/presets/`:
    - `<DateRange start={...} end={...} />` — for date pair display.
    - `<TimeRange start={...} end={...} />` — for time pair display.
    - Both support `layout="vertical"` for stacked layouts and `useBadge={true}` for badge-wrapped presentation.
    Never construct inline range formatting with manual template strings or `{start} - {end}` concatenation.

*   **Single Value Primitives**:
    For single date/time displays, use `<DateDisplay>` and `<Time>` components respectively. These components encapsulate date-fns parsing and locale-consistent formatting.

---

## 12. Colorful Icon Semantic Palette

*   **Metadata Icon Color Convention**:
    Profile detail views and mobile cards must use **distinct, semantically-mapped** colors for metadata icon containers instead of a monochrome `text-primary` or `text-indigo` palette. The established color vocabulary is:

    | Data Category       | Icon Name        | Background                                      | Text Color                                           |
    |---------------------|------------------|--------------------------------------------------|------------------------------------------------------|
    | **Dates/Courses**   | `calendar_today` / `menu_book` | `bg-emerald-50 dark:bg-emerald-950/20` | `text-emerald-600 dark:text-emerald-400`             |
    | **Timings**         | `schedule`       | `bg-blue-50 dark:bg-blue-950/20`                 | `text-blue-600 dark:text-blue-400`                   |
    | **People**          | `person`         | `bg-amber-50 dark:bg-amber-950/20`               | `text-amber-600 dark:text-amber-400`                 |
    | **Locations**       | `location_on`    | `bg-rose-50 dark:bg-rose-950/20`                  | `text-rose-600 dark:text-rose-400`                   |
    | **Weekday Schedule**| `calendar_month` | `bg-violet-50 dark:bg-violet-950/20`              | `text-violet-600 dark:text-violet-400`               |

    Each icon container follows the standard sizing: `size-10 rounded-xl flex items-center justify-center shrink-0`.

*   **KeyValuePairIcon Color Override Mechanism**:
    The `<KeyValuePairIcon>` component detects whether a custom Tailwind text-color class has been passed via `className.includes('text-')`. If present, it skips the default `text-text-secondary` fallback, allowing parent containers to inject custom semantic colors without fighting default specificity.

---

## 13. DataTable Row-Level Memoization Guard

*   **Custom Equality Comparator for `<DataTableRow>`:**
    The `<DataTableRow>` component in `src/components/ui/DataTable.jsx` uses a custom `React.memo` comparator function that checks row-level data fields (e.g. `student_id`, `status`, `entry_time`, `exit_time`, `remarks`, `isRowDirty`) instead of relying on shallow reference comparison of `row` and `columns` props. This makes rows immune to parent-level `columns` array reference shifts caused by callback dependency chains.

*   **When Adding New Editable Fields to DataTable Rows:**
    If a new editable field is added to a row object that should trigger re-rendering (e.g. a new `priority` selector), the field must be explicitly added to the custom comparator check inside `DataTableRow`'s `React.memo` second argument.

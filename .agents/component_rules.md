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

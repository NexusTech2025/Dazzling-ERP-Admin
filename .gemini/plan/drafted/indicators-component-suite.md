---
Date: 2026-06-13T15:02:00+05:30
Status: Proposed
---

# Restructuring Low Density Card: Indicators Component Suite Design

Design and implement a unified, robust, and consistent component suite for **Badges, Tags, and Chips** under `src/components/ui/v2/indicators/`. This will encapsulate styling definitions, HSL theme colors, padding rules, sizes, shapes, and interactive behaviors (such as close triggers) to eliminate raw CSS/Tailwind boilerplate in entity card adapters and layout sheets.

## User Review Required

> [!IMPORTANT]
> **Indicators Component Architecture**:
> - We will create a new directory: `src/components/ui/v2/indicators/` containing:
>   - `Badge.jsx`: Standard notification indicator, active dot indicator, or simple status pill.
>   - `Tag.jsx`: Metadata categorization label (non-interactive).
>   - `Chip.jsx`: Actionable, selectable, or deletable (closeable) pill component.
>   - `index.js`: Exports index.
> - Indicators will natively integrate with our CSS HSL variables (`primary`, `secondary`, `success`, `warning`, `error`, `neutral`) for full bi-modal (light/dark) theme compatibility.

---

## Proposed Directory Hierarchy

```
src/
└── components/
    └── ui/
        └── v2/
            └── indicators/
                ├── index.js      # Module exports
                ├── Badge.jsx     # Notifications, status dots, and status pills
                ├── Tag.jsx       # Static metadata labels (size, color variant configs)
                └── Chip.jsx      # Interactive, filter, and removable select items
```

---

## Component Specifications & Docstrings

### 1. Badge Component (`Badge.jsx`)

```javascript
/**
 * @component Badge
 * @description A status or achievement indicator used to show counts, states, overlays, or progress signals.
 * 
 * DESIGN VARIANTS:
 * 1. Numeric Badges: Displays counts/metrics (e.g. notifications 🔔 5).
 * 2. Status Badges: Displays active/inactive states (e.g. "Online", "Draft").
 * 3. Achievement Badges: Gamified status highlights (e.g. "Level 10", "PRO").
 * 4. Icon Badges: Small overlay dots positioned relative to a parent container (e.g., green dot on Avatar).
 * 5. Progress Badges: Displays completion percentages or milestones.
 * 
 * @param {Object} props
 * @param {React.ReactNode} [props.children] - Target element to attach the badge to as an overlay.
 * @param {'dot'|'count'|'status'|'achievement'} [props.variant='status'] - Visual layout style.
 * @param {'primary'|'secondary'|'success'|'warning'|'error'|'neutral'} [props.color='neutral'] - Theme color mapping.
 * @param {string|number} [props.content] - Numeric count or status text to render.
 * @param {boolean} [props.pulsing=false] - If true, adds a glowing pulsing animation.
 * @param {'top-right'|'top-left'|'inline'} [props.placement='inline'] - Relative positioning of the badge.
 * @param {string} [props.className] - Extended CSS classes.
 */
```

---

### 2. Tag Component (`Tag.jsx`)

```javascript
/**
 * @component Tag
 * @description A static or clickable categorization label used to organize or label content.
 * 
 * DESIGN VARIANTS:
 * 1. Static Tags: Purely informational, non-clickable categorization.
 * 2. Clickable Tags: Handles filters or routing on click.
 * 3. Colored Tags: Color-coded categories (e.g., "Urgent" in rose, "Completed" in emerald).
 * 4. Outlined vs. Filled: Light border emphasis vs bold background fill.
 * 5. Icon Tags: Prefixes text with a visual symbol for instant recognition.
 * 
 * @param {Object} props
 * @param {string} props.label - Text content of the tag.
 * @param {'filled'|'outlined'|'subtle'} [props.variant='subtle'] - Border/Background combination format.
 * @param {'primary'|'secondary'|'success'|'warning'|'error'|'neutral'|'amber'|'emerald'|'rose'} [props.color='neutral'] - HSL color code.
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Dimensions and font scale.
 * @param {string|React.ReactNode} [props.icon] - Icon symbol name or JSX node.
 * @param {Function} [props.onClick] - Optional click handler (enables hover scaling and interactive pointer if passed).
 * @param {string} [props.className] - Custom styling injection.
 */
```

---

### 3. Chip Component (`Chip.jsx`)

```javascript
/**
 * @component Chip
 * @description An interactive, compact element representing choice inputs, filters, or active selections.
 * 
 * DESIGN VARIANTS:
 * 1. Action Chips: Triggers a contextual action on click (e.g., "Add filter").
 * 2. Choice Chips: Represents single/multiple toggle selections (e.g. selecting categories).
 * 3. Filter Chips: Represents active filter tags, removable via a close button.
 * 4. Input Chips: Displays entity inputs (e.g., tokenized email addresses).
 * 5. Icon/Text Chips: Combines left-aligned icons/avatars with label text.
 * 
 * @param {Object} props
 * @param {string} props.label - Text descriptor inside the chip.
 * @param {'filled'|'outlined'|'subtle'} [props.variant='subtle'] - Outline/Fill format.
 * @param {'primary'|'secondary'|'success'|'warning'|'error'|'neutral'} [props.color='neutral'] - Base HSL color scheme.
 * @param {boolean} [props.active=false] - If true, applies active state border and background.
 * @param {boolean} [props.clickable=true] - If true, adds pointer cursors and scale transitions.
 * @param {string|React.ReactNode} [props.avatar] - Initials text, image URL, or React node.
 * @param {Function} [props.onClick] - Click trigger callback.
 * @param {Function} [props.onDelete] - Close callback. Renders an interactive 'close' icon on the right if passed.
 * @param {string} [props.className] - Extended CSS rules.
 */
```

---

## Verification Plan

### Automated Tests / Showcase
*   We will add a dedicated indicators section to the showroom catalog ([TestCardsCatalog.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/pages/admin/TestCardsCatalog.jsx)) to verify:
    *   Light & Dark theme color consistency.
    *   Different sizes (`sm`, `md`, `lg`) and variant combinations.
    *   Interactivity on `Chip` click and delete actions.

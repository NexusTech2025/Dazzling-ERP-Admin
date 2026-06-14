# Azure Meridian ERP Design System & Styling Experience

This document captures the architectural strategies, styling conventions, and UI/UX principles established during the V2 component refactoring and theme integration session.

## 1. Architectural Strategy: The 3-Tier Hierarchy
We moved away from monolithic, repetitive HTML blocks to a modular, composition-based architecture:

1.  **Atomic/Field Layer (`BaseInput`)**: Pure input primitives handling only styling and variants.
2.  **Backbone Layer (`FormField`)**: The "intelligent" wrapper that manages accessibility (`aria-` attributes), labels, required markers, and layout orientation (Horizontal/Vertical).
3.  **Surface Layer (`FormSection`)**: Card-based containers that group related fields with headers and icons, managing the internal grid layout.

**Key Insight**: Logic (selection, debouncing) is abstracted into **Headless Hooks** (`useSelect`, `useDebounce`), allowing the UI to remain thin and swappable.

## 2. Layout & Grid Conventions
To maintain a professional "Enterprise Admin" look, we established strict layout rules:

*   **Page Layout**: Registration forms use a dual-column section grid (`lg:grid-cols-2`) to maximize screen usage without overwhelming the user.
*   **Section Internal Grid**: Limited to a **Maximum 2-column grid** (`md:grid-cols-2`). High-importance fields (Full Name, Specialization) should use `col-span-2` to span the full section width.
*   **Horizontal Layout**: For wide admin screens, `FormField` supports a horizontal layout where labels and inputs sit side-by-side (standard for ERP dashboards).

## 3. Styling & Aesthetic "Sweet Spot"
Through iterative refinement, we arrived at a compact, modern aesthetic:

*   **Compactness**: Standard inputs use `py-2` (vertical padding) instead of the default `py-3`. This reduces the "scroll fatigue" common in long ERP forms.
*   **Border Radius**: To complement the compact padding, we downgraded from `rounded-xl` to **`rounded-lg`**. This creates a sharper, more precise look that fits data-heavy interfaces.
*   **Typography**:
    *   **Labels**: Small (`text-xs`), bold/black font weight, uppercase, with increased tracking (`tracking-wider`). This distinguishes labels clearly from user data.
    *   **Input Text**: Standard `text-sm` for readability.
*   **Focus States**: Use a soft glow (`ring-2 ring-primary/10`) rather than a harsh border change to maintain a high-end feel.

## 4. Theming Engine (Tailwind v4)
We implemented a robust Light/Dark mode system:

*   **Class-Based Toggle**: Instructed Tailwind v4 to ignore system preferences and rely strictly on the `.dark` class using:
    `@custom-variant dark (&:is(.dark *));`
*   **Persistence**: Theme state is managed via `ThemeContext` and persisted in `localStorage`.
*   **Anti-Flicker**: A small blocking script in the `<head>` of `index.html` prevents the "white flash" during dark mode page loads.
*   **Surface Tokens**:
    *   `surface-light`: Pure white (#FFFFFF)
    *   `surface-dark`: Slate-800 (#1e293b)
    *   `background-light`: Slate-50 (#f6f7f8)
    *   `background-dark`: Dark Navy (#101922)

## 5. Component "Golden Rules"
*   **Child Injection**: `FormField` must always use `React.cloneElement` to inject `id`, `name`, and `error` into its child. This ensures the input is always accessible without manual prop-drilling.
*   **Ref Forwarding**: All input primitives must use `forwardRef` to ensure compatibility with form libraries like React Hook Form.
*   **Schema Ready**: Components are designed to be "Config-Driven," allowing them to be rendered via a JSON schema in the future.

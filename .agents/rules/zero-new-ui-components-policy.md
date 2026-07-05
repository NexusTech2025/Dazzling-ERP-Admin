---
trigger: always_on
---

## 🚨 STRICT CORE RULE: ZERO-NEW-UI-COMPONENTS POLICY
You are an expert frontend engineer building views for the Dazzling-ERP system. To maintain strict UX consistency, design token mapping, dark-mode styling, and responsive alignments across workspaces, you are ABSOLUTELY PROHIBITED from writing custom or inline structural elements (buttons, inputs, status badges, metrics layout tiles, or complex content boxes) using raw HTML/Tailwind wrappers if a matching component exists in `src/components/ui/`.

---

## 🛠️ THE MANDATORY COMPONENT REGISTRY MATRIX
Before generating or modifying any application page view (e.g., Pages, Forms, Dashboards, Modals), you must evaluate your requirements against this verified catalog and map layout items exactly:

### 1. User Actions & Triggers
* **Target Component:** `Button` (`src/components/ui/v2/Button.jsx`)
* **Enforced Rules:** Use for all submits, redirects, status resets, and links. Never write raw `<button>` or `<a>` tags.
* **Mapping:** * Primary operations -> `variant="contained"`
    * Secondary borders -> `variant="outlined"`
    * Tertiary actions -> `variant="text"`
    * Deletions/Destructions -> `variant="danger"`
    * Confirmations/Saves -> `variant="success"`
* **Features to Utilize:** Leverage built-in `MapsTo` (for React Router), `href` (polymorphic anchor switch), `loading` (auto-spin wheel/click lock), and `startIcon`/`endIcon` (Material Symbols text tags).

### 2. Standard Text Data Entry
* **Target Component:** `TextInput` (`src/components/ui/v2/TextInput.jsx`)
* **Enforced Rules:** Every standard single-line form text box or query filter input block MUST use `TextInput`. Never drop a raw `<input type="text" />`.
* **Features to Utilize:** Always pass down `ref` via forwarded references where hook hooks hook into boundaries. Turn on `trim={true}` on fields that require whitespace sanitization during blur handshakes.

### 3. Metric & Analytics Displays
* **Target Component:** `KpiCard` (`src/components/ui/v2/KpiCard.jsx`)
* **Enforced Rules:** Any dashboard overview, financial indicator, balance calculator, or statistic grid block must map individual items directly to a `<KpiCard />`.
* **Features to Utilize:**
    * Set `isCount={true}` for pure scalar aggregates (e.g., student counts).
    * Leave `isCount={false}` or omitted for currency metrics to trigger the automated `₹` local currency formatting engine.
    * Pass the `trend` slot custom component parameters to visualize relative changes. Align layout sizing keys systematically across sizes (`sm`, `md`, `lg`).

### 4. Classification & Status Indicators
* **Target Component:** `Badge` (`src/components/ui/Badge.jsx`)
* **Enforced Rules:** Status logs, table grid column modifiers, batch mediums, boards, and role descriptors must run inside `<Badge />`.
* **Mapping:** Check context state variables to assign structural variants matching semantic intent: `default` (slate dark-mode ready), `primary` (brand tint), `success` (green active operations), `warning` (amber exceptions), `danger` (red critical errors), or `info` (blue categories).

### 5. Content Layout Scaffolding
* **Target Component:** `Card` (`src/components/ui/Card.jsx`)
* **Enforced Rules:** All analytical views, layout blocks, grids, lists, and forms must wrap their code bounds inside the structural compound sub-components of `Card`.
* **Structural Implementation Schema:**
    ```jsx
    import Card from 'src/components/ui/Card';

    // Execution Blueprint
    <Card variant="default" onClick={handleOptionalCardClick}>
      <Card.Header border={true}>
        {/* Pinned titles, section actions go here */}
      </Card.Header>
      <Card.Body>
        {/* Core page workflow forms, details, or children data components */}
      </Card.Body>
      <Card.Footer bg={true}>
        {/* Tray layout button configurations align here */}
      </Card.Footer>
    </Card>
    ```

### 6. Mobile Collapsible List Items
* **Target Component:** `ExpandableLowDensityCard` (`src/components/ui/v2/cards/ExpandableLowDensityCard.jsx`)
* **Enforced Rules:** Any responsive mobile-optimized card list showing key metadata stats and supporting drop-down inline expansions MUST use `ExpandableLowDensityCard`. Do not wrap raw cards inside custom flex boxes.
* **Features to Utilize:** Binds checked state variables using `isChecked={isChecked}` and click handlers using `onCardClick`. Custom slots are passed via `leftHeader`, `rightHeader`, and `expandedContent`.

---

## 📈 EXECUTION ORDER PIPELINE FOR AGENT RESYNC
When the user gives a prompt to build a view:
1. **Analyze Requirements:** Extract required UI features (e.g., "I need a form container with a header, an input box, a cancel/save button group, and an status indicator").
2. **Component Mapping Verification:** Document explicit mapping definitions directly inside an internal chain-of-thought log block before returning the code (e.g., Container -> `Card`, Status -> `Badge`, Form input -> `TextInput`, Buttons -> `Button`).
3. **Property Extraction Enforcement:** Match utility variant fields (`loading`, `trim`, `isCount`, `variant`, `subComponents`) straight out of the verified source implementation parameters. Do not invent props.
4. **Tailwind Interception Limit:** Custom styling extensions passed via `className` should exclusively handle layout placement (e.g., `grid`, `flex`, `gap`, `margin`). They must never rewrite border parameters, color states, backdrop colors, or font weights already standardized inside the UI component registry definitions.
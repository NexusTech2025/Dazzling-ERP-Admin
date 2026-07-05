---
Date: 2026-06-22T20:42:00+05:30
Status: Approved-Completed
---

# Technical Implementation Plan: Reusable KpiCard & KpiGrid Component System

This plan details the design and implementation of a reusable, highly responsive, size-controlled KPI Card and Grid system for the Dazzling ERP Admin UI.

---

## **1. Background Knowledge & Predefined Components Verification (Rule N2)**

* **Verification Results**:
  - We inspected `src/components/ui/Card.jsx` (generic header/body/footer container).
  - We inspected `src/components/ui/v2/cards/` (`LowDensityCard`, `MediumDensityCard`, `HighDensityCard` layouts for list rows and complex profiles).
  - We inspected `src/components/ui/v2/HighlightBox.jsx` (metric callout with divider line and trailing controls).
  - **Conclusion**: There is **no** predefined, reusable component system dedicated to rendering micro-KPI metrics with size scales (`small`, `medium`, `large`) and responsive grid layouts. The dashboard currently hardcodes KPI cards.

* **Traceability References:**
  - [FinanceDashboard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/FinanceDashboard.jsx#L360-L380)

---

## **2. User Review Required**

> [!IMPORTANT]
> **AESTHETIC & DENSITY SPECIFICATIONS:**
>
> 1. **Large Size Cap:** The current KPI card styling in the dashboard (height `h-24`, padding `p-3.5`, currency value text `text-lg`) serves as the maximum cap (the `large` size).
> 2. **Responsive Adaptation:** We will allow size properties to be controlled dynamically or set via breakpoints to guarantee proper layouts across viewport boundaries.

---

## **3. Proposed Changes & Method Signatures (Rule N1)**

### **A. UI Components**

#### [NEW] [KpiCard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/v2/KpiCard.jsx)
A reusable component displaying a single key metric.

```javascript
/**
 * A highly-dense KPI metric display card supporting color themes, icon indicators, 
 * size variations (small, medium, large), and micro-animations.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.label - Uppercase metric identifier (e.g. "TOTAL COLLECTED").
 * @param {string|number} props.value - The primary bold display metric.
 * @param {string} [props.icon] - Optional Material Symbol name.
 * @param {string} [props.size='lg'] - Sizing: 'sm' (compact), 'md' (standard), or 'lg' (current dashboard).
 * @param {string} [props.variant='neutral'] - Color variant: 'neutral', 'success', 'warning', 'danger', 'info'.
 * @param {React.ReactNode} [props.trend] - Optional trend indicator node (e.g. green/red percentage label).
 * @param {boolean} [props.isCount=false] - If true, formats the value as a raw number rather than currency.
 * @returns {React.ReactElement}
 */
export default function KpiCard({
  label,
  value,
  icon,
  size = 'lg',
  variant = 'neutral',
  trend,
  isCount = false
}) {
  // Sizing definitions:
  // - sm: h-16, p-2, label text-[8px], value text-sm, icon text-[12px]
  // - md: h-20, p-2.5, label text-[9px], value text-base, icon text-[14px]
  // - lg: h-24, p-3.5, label text-[10px], value text-lg, icon text-[16px] (current default)
}
```

#### [NEW] [KpiGrid.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/v2/KpiGrid.jsx)
A responsive grid wrapper utilizing configurable breakpoints.

```javascript
/**
 * A responsive grid container mapping children or card configs into columns.
 * 
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - KPI Card components to wrap.
 * @param {number} [props.cols=1] - Base columns on mobile.
 * @param {number} [props.smCols=2] - Columns on sm breakpoint.
 * @param {number} [props.mdCols=3] - Columns on md breakpoint.
 * @param {number} [props.lgCols=5] - Columns on lg breakpoint.
 * @param {number} [props.gap=3] - Tailwind gap sizing scale.
 * @returns {React.ReactElement}
 */
export default function KpiGrid({
  children,
  cols = 1,
  smCols = 2,
  mdCols = 3,
  lgCols = 5,
  gap = 3
}) {
  // Renders responsive class strings: grid grid-cols-${cols} sm:grid-cols-${smCols} etc.
}
```

---

## **4. Integration & Migration**

#### [MODIFY] [FinanceDashboard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/FinanceDashboard.jsx)
Replace the inline KPI layout with:
```jsx
<KpiGrid cols={1} smCols={2} lgCols={5} gap={3}>
  {kpis.map((kpi, idx) => (
    <KpiCard
      key={idx}
      label={kpi.label}
      value={kpi.value}
      icon={kpi.icon}
      isCount={kpi.isCount}
      variant={
        kpi.color.includes('emerald') ? 'success' :
        kpi.color.includes('rose') ? 'danger' :
        kpi.color.includes('amber') ? 'warning' :
        kpi.color.includes('blue') ? 'info' : 'neutral'
      }
      size="lg"
    />
  ))}
</KpiGrid>
```

---

## **5. Verification Plan**

### **Manual Verification**
1. Run application UI to ensure the Finance Dashboard KPI cards render visually identical to the current design when using `size="lg"`.
2. Test responsiveness by resizing the browser.
3. Verify custom layout options (`size="sm"`, `size="md"`) in story components or test sheets.

---
Date: 2026-07-07T11:17:00+05:30
Status: Approved-Completed
---

# Implementation Plan - SalaryConfigModal Refactoring

Refactor the `SalaryConfigModal` component to fix timezone date math issues, remove redundant component-level de-serialization, eliminate reactive sync loops (`useEffect`), ensure correct close button type attributes, and introduce a reusable `IconButton` V2 component. The modal uses `react-hook-form` and Yup validation schema with complete integration.

## Traceability & References (Rule N2)
* **Referenced Core Modules:**
  * [SalaryConfigModal.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/profile/SalaryConfigModal.jsx)
  * [useTeacherQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js)
  * [salaryConfigValidation.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/utils/salaryConfigValidation.js)
* **Design Runbooks:**
  * [BUG-0005-salary-config-modal-analysis.md](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.gemini/issues/BUG-0005-salary-config-modal-analysis.md)
  * [salary_config_model_analysis.md](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/temp/teachers/salary_config_model_analysis.md)

## Boundary Declaration: Facts vs. Assumptions (Rule N3)
* **Actual Verified Facts:**
  * The date manipulation functions (`calculateEffectiveTo`, `calculateYearlyEffectiveTo`) currently instantiate mutable JS `Date` objects which are subject to timezone drift.
  * Form field calculations (`baseValue` from `totalContractValue` and `effectiveTo` from `effectiveFrom` & `durationMonths`) are handled inside reactive `useEffect` wrappers watching form values, causing multiple render passes.
  * The close icon button does not have `type="button"`.
  * We use `react-hook-form` and Yup validation schema `salaryConfigSchema` already in `salaryConfigValidation.js`.
* **System Assumptions:**
  * Modifying `scope_id` parsing in `useTeacherQueries.js` does not disrupt any list rendering that depends on raw string `scope_id` because downstream consumers are prepared to receive the object layout.

## Proposed Changes

### UI Core Component Layer

#### [NEW] [IconButton.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/v2/IconButton.jsx)
A reusable, lightweight round button component for icon elements.

##### Method Signatures & JSDoc (Rule N1)
```javascript
/**
 * A standard, reusable round icon button for modern V2 aesthetics.
 * 
 * @param {Object} props - React props.
 * @param {string} props.icon - Material Symbols icon name.
 * @param {function} props.onClick - Click event callback.
 * @param {string} [props.type="button"] - Button element type.
 * @param {string} [props.className=""] - Optional custom styles.
 * @param {boolean} [props.disabled=false] - Disabled state constraint.
 * @param {string} [props.title] - Optional accessibility/hover tooltip.
 * @returns {React.ReactElement} Rounded button container element.
 */
const IconButton = ({ icon, onClick, type = 'button', className = '', disabled = false, title, ...props }) => {
  // component implementation...
}
```

---

### Feature: Teacher Profile Salary Configurations

#### [MODIFY] [SalaryConfigModal.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/profile/SalaryConfigModal.jsx)

* **Refactor date calculations**: Use pure `date-fns` operations (`addMonths`, `addYears`, `subDays`, `differenceInDays`, `parseISO`, `format`).
* **Interactive change triggers**: Remove all `useEffect` hooks that watch form values and update dependent inputs using `setValue`. Compute and update values directly inside the `onChange` callback of `rateType`, `totalContractValue`, `effectiveFrom`, and `durationMonths` inputs.
* **Integrate `IconButton`**: Use the new `IconButton` component for header close actions.

##### Execution Blueprint & Positional Signatures (Rule N1)

```javascript
/**
 * Timezone-safe helper to calculate contract expiration.
 * 
 * @param {string} effectiveFrom - The starting YYYY-MM-DD date.
 * @param {number|string} durationMonths - The duration in months.
 * @returns {string} The computed expiration date in YYYY-MM-DD.
 */
export const calculateEffectiveTo = (effectiveFrom, durationMonths) => {
  // Logic using parseISO, addMonths, subDays, format...
};

/**
 * Timezone-safe helper to calculate yearly contract expiration.
 * 
 * @param {string} effectiveFrom - The starting YYYY-MM-DD date.
 * @returns {string} The computed expiration date in YYYY-MM-DD.
 */
export const calculateYearlyEffectiveTo = (effectiveFrom) => {
  // Logic using parseISO, addYears, subDays, format...
};
```

##### Step-by-Step Technical Execution Workflow:
1. **Initialize Form**: Form hooks hook into Yup validation resolver with `salaryConfigSchema`.
2. **Explicit Event Updates**: When `totalContractValue` changes, calculate and set `baseValue` in `react-hook-form` state.
3. **Date Formulations**: When `effectiveFrom` or `durationMonths` updates, execute `calculateEffectiveTo` and set `effectiveTo` in `react-hook-form` state.
4. **Rate Type Selection**: When `rateType` updates, determine appropriate base values/effective dates based on strategies and perform updates.
5. **Render Modals**: Short-circuit mount logic of Success and Error modals.

---

## Performance Regression & Benchmark Assertions (Rule N5)
* **Latency Check**: Assert that editing input fields triggers exactly `1` synchronous React render loop path instead of multiple updates.
* **Date Consistency**: Verify timezone offsets do not cause a date shift by comparing generated payload fields to input values.

## Legacy Maintenance Mitigation (Rule N6)
> [!NOTE]
> **LEGACY MAINTENANCE IDENTIFIED:**
> * **Technical Path Endpoint**: [SalaryConfigModal.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/profile/SalaryConfigModal.jsx#L236-L249)
> * **Core Technical Debt Risk**: Recalculating initial duration months using approximate length math `(1000 * 60 * 60 * 24 * 30.4375)`.
> * **Remediation**: Use standard `differenceInDays` from `date-fns` to determine dates difference accurately and divide by `30.4375`.

---

## Verification Plan

### Automated Checks
* Execute `npm run build` to confirm compiler validations.

### Manual Verification
1. Navigate to Teacher Profile, click "Update Salary Config" or "Create Salary Config".
2. Change "Rate Type" to Yearly, enter "Total Contract Value", and check if "Base Value" updates dynamically without lag.
3. Verify close button behaves correctly.

---
Date: 2026-08-16T23:53:00+05:30
Status: Approved-Completed
---

# Refactoring Plan: Teacher Salary Configuration - Revenue Percentage & Dynamic Batch Groups

## 1. Overview & Context

In the Dazzling ERP Admin system, the **Teacher Salary & Payroll** tab allows administrators to create and manage contractual salary configurations (`TeacherSalaryConfig`). 

When configuring a compensation model based on **Revenue Percentage** (`rate_type: 'revenue_percentage'`), compensation is calculated dynamically as a percentage of verified student tuition collections attributed to specific course batches (`StaffService_TeacherSalaryCalculationEngine.js`).

Because tuition revenues depend on future student enrollments and ongoing installment collections:
1. A predefined **Total Contract Value (₹)** cannot be set upfront and must be omitted from the UI and made optional in schema validation.
2. The macro budget type must automatically map to **Fixed Duration Pool** (`salary_config_type: 'fixed_duration_pool'`).
3. Compensation must be bound to batch schedules:
   - **Single Batch (`single_batch`)**: Stores the percentage rate (0% – 100%) in `base_value` and target batch ID in `scope_id`.
   - **Batch Group (`batch_group`)**: Stores a JSON map of independent individual batch percentage rates (e.g. `{"BTC-101": 25, "BTC-102": 20}`) in `scope_id`, where each rate operates independently between 0% and 100% without a 100% summation constraint. Global scope is disallowed.

---

## 2. Non-Domain Driven Infrastructure Traceability

* **Referenced Schemas**: `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\Staff\TeacherSalaryConfig.json`
* **Referenced Core Engine**: `E:\NAST\Dazzling\GAS\DazzlingDB\DBServices\StaffService_TeacherSalaryCalculationEngine.js`
* **UI Component Registry**: `.gemini/memory/ui_component/components.index.json`

---

## 3. Fact vs. Assumption Boundary Declaration

### Verified Facts
1. **Database Schema Contract**: In `TeacherSalaryConfig.json`, `total_contract_value` is `required: false`. `scope_id` for `batch_group` holds a JSON string mapping batch IDs to percentage rates (e.g. `'{"BTC-101":25,"BTC-102":20}'`).
2. **Backend Engine**: `StaffService_TeacherSalaryCalculationEngine.js` lines 222–257 parses `base_value` for `single_batch` and parses `scope_id` JSON for `batch_group` without expecting a 100% weight sum, rejecting `global` scope.
3. **Current Frontend Bug**: Currently, `salaryConfigValidation.js` enforces that all `batch_group` entries sum up to 1.0 (100%), which breaks `revenue_percentage` multi-batch setups. Additionally, selecting `fixed_duration_pool` forces `totalContractValue` to be required even for `revenue_percentage`.

### System Assumptions
1. When switching `rateType` to `revenue_percentage`, defaulting `scopeType` to `single_batch` (if previously `global`) provides the smoothest onboarding flow.
2. In `batch_group` mode with `revenue_percentage`, the form sets `baseValue` to `0` (or the primary batch rate) upon submission to satisfy schema non-null constraints while storing all exact batch rates inside `scopeId`.

---

## 4. Proposed File Changes

```
dazzling-erp-admin/
├── src/features/teacher/
│   ├── utils/
│   │   ├── salaryConfigValidation.js      # [MODIFY] Conditional validation for revenue_percentage
│   │   └── teacher.utils.js              # [MODIFY] Exclude revenue_percentage from fiat totals & format displays
│   └── components/profile/
│       ├── SalaryConfigModal.jsx         # [MODIFY] Form triggers, dynamic scope rendering, rate inputs
│       └── payroll/
│           └── SalaryConfigsCard.jsx     # [MODIFY] Render % format for baseValue in revenue_percentage rows
```

---

### Component Breakdown & Implementation Details

#### 1. `src/features/teacher/utils/salaryConfigValidation.js`
* **Update `totalContractValue`**: Only required when `rateType !== 'revenue_percentage' && (salaryConfigType === 'fixed_duration_pool' || rateType === 'yearly')`.
* **Update `baseValue`**:
  * For `rateType === 'revenue_percentage'` and `scopeType === 'single_batch'`: positive number $\le 100$.
  * For `rateType === 'revenue_percentage'` and `scopeType === 'batch_group'`: number $\ge 0$ (optional / auto-filled).
  * For `monthly` / `yearly`: positive number $> 0$.
* **Update `scopeType`**: Disallow `global` when `rateType === 'revenue_percentage'` (must be `single_batch` or `batch_group`).
* **Update `scopeId`**:
  * For `batch_group` with `revenue_percentage`: Validate that `scopeId` is valid JSON and every batch rate is a number between $0$ and $100$ (no sum check).
  * For `batch_group` with `monthly` / `yearly`: Enforce sum of weights equals $1.0$ ($100\%$).

#### 2. `src/features/teacher/components/profile/SalaryConfigModal.jsx`
* **Strategy & Trigger Handling**:
  * Update `RateTypeStrategies.revenue_percentage` to handle batch percentage allocations.
  * When `rateType` changes to `'revenue_percentage'`:
    * Auto-set `salaryConfigType` to `'fixed_duration_pool'`.
    * Auto-set `scopeType` to `'single_batch'` if currently `'global'`.
    * Clear `totalContractValue` to `''`.
* **Conditional Field Rendering**:
  * **Hide `Total Contract Value`**: Only show when `rateType !== 'revenue_percentage' && (salaryConfigType === 'fixed_duration_pool' || strategy.requiresContractValue)`.
  * **Dynamic Scope Options**: Filter out `'global'` option from `Scope Type` dropdown when `rateType === 'revenue_percentage'`.
  * **Dynamic Base Value Field**:
    * If `rateType === 'revenue_percentage'` and `scopeType === 'single_batch'`: Label as `Revenue Share (%)`, placeholder `e.g. 25.0`.
    * If `rateType === 'revenue_percentage'` and `scopeType === 'batch_group'`: Auto-set `baseValue` to `0` or disable/hide singular base input since rates are configured per batch in the group list.
  * **Batch Group Item Editor**:
    * If `rateType === 'revenue_percentage'`: Render individual percentage input (`step="0.5"`, `min="0"`, `max="100"`, `placeholder="25"`, with `%` suffix).
    * Show summary badge *"Independent Batch Revenue Rates"* instead of 100% allocation warning.
    * If `rateType !== 'revenue_percentage'`: Maintain fraction/weight inputs (`0.00 - 1.00`) and total 100% sum meter.

#### 3. `src/features/teacher/components/profile/payroll/SalaryConfigsCard.jsx`
* Update Base Value cell display:
  ```jsx
  <TableCell className="font-mono font-bold">
    {config.rate_type === 'revenue_percentage' 
      ? (config.scope_type === 'batch_group' ? 'Multi-Rate %' : `${config.base_value || 0}%`)
      : `₹${(config.base_value || config.base_amount || 0).toLocaleString()}`}
  </TableCell>
  ```

#### 4. `src/features/teacher/utils/teacher.utils.js`
* In `calculateTotalAmountToPay` and `calculateActiveBaseRate`, exclude configs where `rate_type === 'revenue_percentage'` so percentage numbers are not added directly to rupee budget aggregates.
* In `parseScopeDisplay`, format batch group labels clearly when rates are percentage-based.

---

## 5. Verification Plan

### Automated / Code Quality Verification
* Run build & lint checks using `npm run build` or Vite build validation.

### Manual Verification Flow
1. **Single Batch Revenue Percentage**:
   - Open Teacher Profile $\rightarrow$ Salary & Payroll tab $\rightarrow$ "Add Configuration".
   - Select **Rate Type: Revenue Percentage**.
   - Verify `Salary Config Type` is automatically set to `Fixed Duration Pool`.
   - Verify `Total Contract Value` field disappears.
   - Verify `Scope Type` only offers `Single Batch` and `Batch Group`.
   - Input `25` as Base Value (%) and select a single batch.
   - Save configuration and verify successful creation without validation errors.
2. **Multi-Batch Group Revenue Percentage**:
   - Create another configuration with **Rate Type: Revenue Percentage** and **Scope Type: Batch Group**.
   - Select 2 or 3 batches (e.g. Batch A and Batch B).
   - Enter `25%` for Batch A and `20%` for Batch B (total $45\% \neq 100\%$).
   - Verify no sum error is thrown and configuration saves payload `{"BTC-101": 25, "BTC-102": 20}` into `scope_id`.
3. **Monthly / Yearly Backward Compatibility**:
   - Select **Rate Type: Monthly** or **Yearly** with **Batch Group**.
   - Verify weight sum checking ($1.0 / 100\%$) and `Total Contract Value` requirements still function as expected.

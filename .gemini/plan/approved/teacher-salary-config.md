---
Date: 2026-07-10T11:45:00+05:30
Status: Approved-Completed
---

# Refactoring Implementation Plan - Teacher Salary & Payroll

This document details the refactoring of the Teacher Salary Configurations and Payroll Ledger tab interface in `dazzling-erp-admin`. The refactoring aims to decouple domain calculations, state coordination, and presentational cards, while replacing hardcoded transaction mocks with live database query hooks.

---

## 1. Architectural Foundation & Background

### Traceability References (Rule N2)
* **Referenced Schemas:**
  - `TeacherPaymentTransaction`: [`TeacherPaymentTransaction.json`](file:///E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Staff/TeacherPaymentTransaction.json) (Defines transaction fields: `transaction_date`, `amount`, `payment_method`, `payment_type`, `salary_month`)
  - `TeacherSalaryConfig`: [`TeacherSalaryConfig.json`](file:///E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Staff/TeacherSalaryConfig.json) (Defines salary configs: `base_value`, `total_contract_value`, `contract_status`)
* **Referenced Core Modules:**
  - Cache Registry: [`cacheHelper.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js)
  - Query Client Factory: [`queryKeys.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/queryKeys.js)
  - Teacher Action Endpoint Registry: [`useTeacherQueries.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js)
  - Dynamic Aggregation Module: [`queryEngine.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/queryEngine.js)

---

## 2. Fact vs. Assumption Boundaries (Rule N3)

### Confirmed Facts:
1. **No Absolute Alias Paths:** The codebase does not use Vite `@/` alias resolution. Everything relies on standard relative imports (e.g. `../../../../lib/queryEngine`).
2. **Tab Organization:** Tabs are stored in a flat component tree structure under `src/features/teacher/components/profile/` rather than the proposed nested `views/TeacherProfile/tabs` folders. Adhering to conventions means keeping them in a subfolder like `components/profile/payroll/`.
3. **Database Presence:** A real `TeacherPaymentTransaction` sheet exists with an active action endpoint key (`API_REGISTRY.DATA.QUERY` / `data_query`) and a dedicated payout record action (`API_REGISTRY.STAFF.RECORD_PAYMENT` / `staff_record_payment`).

### System Assumptions:
1. **Endpoint Compatibility:** We assume that generic query `API_REGISTRY.DATA.QUERY` with `{ target: 'TeacherPaymentTransaction', where: { teacher_id: ... } }` is fully supported by the Apps Script server handler.
2. **Access Token Availability:** The component runs in an authenticated administrator dashboard container where `token` is continuously valid and propagated.

---

## 3. Legacy Mitigation & Technical Debt Red Flags (Rule N6)

> [!CAUTION]
> **LEGACY MAINTENANCE IDENTIFIED: Hardcoded Payout Mocks**
>
> * **Technical Path Endpoint:** [`TeacherSalaryPayroll.jsx` lines 667-681](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/TeacherSalaryPayroll.jsx#L667-L681)
> * **Core Technical Debt Risk:** The UI renders an immutable set of 13 mock entries. This blocks actual financial ledger balancing, budget tracking, and real-time payment reconciliation inside production.
> * **Remediation Option:** Deprecate the mock list entirely. Declare a TanStack Query hook `useTeacherPaymentTransactionsQuery` that retrieves live payment records dynamically from the GAS sheet ledger database.

---

## 4. Proposed Infrastructure & File Changes

### Component Registry & Layout Plan (Zero-New-UI-Components-Policy)
We will leverage atomic design variables matching the **V2 Design Palette**:
* `KpiCard` & `KpiGrid` -> For budget obligation metrics (total allocations, base rates, ratios).
* `Badge` -> For contract status (`active` / `expired`) and reconciliation state (`reconciled` / `pending`).
* `Button` -> For modal actions (reconciling ledger, disbursing salary, adding configs).
* `Card` -> Layout scaffolding for sub-grids.

---

### [MODIFY] Cache Configuration - [`cacheHelper.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/cacheHelper.js)

We register the new `teacherPaymentTransaction` entity definition into `ENTITY_CONFIGS`.

```javascript
  teacherPaymentTransaction: {
    primaryKey: 'transaction_id',
    listKey: (filter) => [...queryKeys.teacher.detail(filter.teacherId), 'paymentTransactions'],
    listsKey: () => ['teacher', 'detail'],
    detailKey: (id) => ['teacher', 'paymentTransaction', id],
    isValidDetail: (data) => data && typeof data === 'object' && 'transaction_id' in data
  }
```

---

### [MODIFY] Queries Layer - [`useTeacherQueries.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherQueries.js)

We introduce query hooks to fetch and write live payments.

#### Positional Signature & Blueprint (Rule N1)

```javascript
/**
 * Hook for querying payment transactions for a given teacher.
 * Resolves cached records automatically or fetches fresh logs via the generic data query action.
 * @param {string} teacherId - The target faculty member's system identifier.
 * @param {Object} [options={}] - Standard TanStack Query parameter overrides.
 * @returns {QueryResult} The standard React Query fetch state containing an array of transaction records.
 */
export const useTeacherPaymentTransactionsQuery = (teacherId, options = {}) => {
  // Query resolution logic...
};

/**
 * Mutation hook for recording a new payment transaction entry to the ledger.
 * Invalidates the payments lists queries upon successful commitment to sheets.
 * @returns {MutationResult} React Query mutation trigger function.
 */
export const useRecordTeacherPaymentMutation = () => {
  // Mutation logic...
};
```

#### Detailed Execution Workflow:
1. `useTeacherPaymentTransactionsQuery` fetches records using `API_REGISTRY.DATA.QUERY` with `target: 'TeacherPaymentTransaction'` and `where: { teacher_id }`.
2. Integrates with `resolveList` in `cacheHelper.js` using key `['teacher', 'detail', teacherId, 'paymentTransactions']`.
3. `useRecordTeacherPaymentMutation` invokes `API_REGISTRY.STAFF.RECORD_PAYMENT` with payload details (`teacher_id`, `payment_type`, `amount`, `payment_method`, `transaction_date`, `salary_month`). On success, it invalidates query keys for `'paymentTransactions'` to refresh the tables.

---

### [NEW] Stateless Domain Utilities - [`teacher.utils.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/utils/teacher.utils.js)

Extracts stateless, pure data transformation filters.

#### Positional Signature & Blueprint (Rule N1)

```javascript
/**
 * Resolves active salary configuration records from a list.
 * @param {Array<Object>} [configs=[]] - Raw list of salary configurations.
 * @returns {Array<Object>} Filtered list of active configurations.
 */
export const getActiveConfigs = (configs = []) => { ... };

/**
 * Calculates total obligation values based on active contract durations.
 * @param {Array<Object>} [configs=[]] - List of configurations.
 * @returns {number} The aggregated currency value in INR.
 */
export const calculateTotalAmountToPay = (configs = []) => { ... };

/**
 * Computes base payment rates for active configurations.
 * @param {Array<Object>} [configs=[]] - List of configurations.
 * @returns {number} The base rate sum.
 */
export const calculateActiveBaseRate = (configs = []) => { ... };

/**
 * Calculates expected average monthly pay based on rate types.
 * @param {Array<Object>} [configs=[]] - List of configurations.
 * @returns {number} Average payment amount.
 */
export const calculateAverageMonthlyPay = (configs = []) => { ... };

/**
 * Decodes raw scope configurations into readable labels.
 * @param {string} [scopeType='global'] - Scope configuration type.
 * @param {string|null} [scopeId=null] - Identifier or serialized JSON weights.
 * @returns {string} Human readable label.
 */
export const parseScopeDisplay = (scopeType, scopeId) => { ... };

/**
 * Formats standard numbers into localized INR Lakh formats.
 * @param {number} num - Numeric value.
 * @returns {string} Formatted label (e.g. "₹2.50L").
 */
export const formatFinancialLakh = (num) => { ... };
```

#### Detailed Execution Workflow:
* Calculations process in RAM. No external APIs or database dependencies.
* Safe date bounds checking is done using `parseISO` and `differenceInMonths` from `date-fns` to ensure timezone-invariant operations.

---

### [NEW] State Coordinator Hook - [`useTeacherPayroll.js`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/hooks/useTeacherPayroll.js)

Coordinates data layers, visibility flags, and memory-safe computations.

#### Positional Signature & Blueprint (Rule N1)

```javascript
/**
 * Custom React state coordinator hook for managing Teacher Salary and Ledger processes.
 * Integrates configs queries, payment queries, deletion mutations, and Arquero computations.
 * @param {string} teacherId - The target teacher ID.
 * @returns {Object} Hash object containing `state` object and `actions` callback handlers.
 */
export const useTeacherPayroll = (teacherId) => {
  // Hook execution details...
};
```

#### Detailed Execution Workflow:
1. Triggers both `useTeacherSalaryConfigsQuery(teacherId)` and `useTeacherPaymentTransactionsQuery(teacherId)`.
2. Computes sorted lists (`sortedConfigs`) and selects `activeConfig` inside `useMemo` blocks.
3. Computes the summary using a memory-safe `Arquero` data engine workflow:
   * Aggregates `paidAmount` using standard array reduces.
   * Leverages `aq(transactions)` to filter `payment_type === 'ADVANCE'` and rolls up their sum.
   * Groups transactions by `payment_method` to break down digital wallets (UPI, CASH, BANK).
4. Exposes interactive action handlers (`handleOpenEdit`, `handleOpenDelete`, etc.).

---

### [NEW] Specialized Presentational Components (UI Layer)

To maintain single-responsibility standards, we extract cards into clean presentational views under a dedicated subfolder: [`src/features/teacher/components/profile/payroll/`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/payroll/).

#### 1. [`SalaryConfigsCard.jsx`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/payroll/SalaryConfigsCard.jsx)
Renders salary configurations in a tabular list with accessibility `aria-label` descriptors on actions.

#### 2. [`FacultyLedgerAuditCard.jsx`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/payroll/FacultyLedgerAuditCard.jsx)
Renders metric summaries (Budgetary Allocation, Transaction Reconciliation, actions for Reconcile and Disburse).

#### 3. [`TeacherPaymentTransactionsCard.jsx`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/payroll/TeacherPaymentTransactionsCard.jsx)
Renders payment transactions history log table.

#### 4. [`ConfigHistoryTimelineCard.jsx`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/payroll/ConfigHistoryTimelineCard.jsx)
Renders history cards in an elegant timeline layout.

---

### [MODIFY] Orchestrator Node - [`TeacherSalaryPayroll.jsx`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/TeacherSalaryPayroll.jsx)

Simplified shell loading the orchestrator hook and mounting child elements.

```jsx
import React from 'react';
import { useTeacherPayroll } from '../../hooks/useTeacherPayroll';
import SalaryConfigsCard from './payroll/SalaryConfigsCard';
import FacultyLedgerAuditCard from './payroll/FacultyLedgerAuditCard';
import TeacherPaymentTransactionsCard from './payroll/TeacherPaymentTransactionsCard';
import ConfigHistoryTimelineCard from './payroll/ConfigHistoryTimelineCard';
import SalaryConfigModal from './SalaryConfigModal';
import ConfirmModal from '../../../../components/ui/ConfirmModal';

const TeacherSalaryPayroll = ({ teacherId }) => {
  const { state, actions } = useTeacherPayroll(teacherId);

  if (state.isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <SalaryConfigsCard
            salaryConfigs={state.salaryConfigs}
            activeConfig={state.activeConfig}
            onEdit={actions.handleOpenEdit}
            onDelete={actions.handleOpenDelete}
            onCreate={actions.handleOpenCreate}
          />
        </div>
        <div className="lg:col-span-4">
          <FacultyLedgerAuditCard
            calculations={state.ledgerAuditMetrics}
            onReconcile={() => console.log('Reconcile ledger')}
            onDisburse={() => console.log('Disburse salary')}
            onIssueAdvance={() => console.log('Issue advance')}
            onViewLogs={() => console.log('View logs')}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <TeacherPaymentTransactionsCard transactions={state.transactions} />
        </div>
        <div className="lg:col-span-4">
          <ConfigHistoryTimelineCard
            sortedHistory={state.sortedConfigs}
            activeConfig={state.activeConfig}
            onEdit={actions.handleOpenEdit}
            onDelete={actions.handleOpenDelete}
          />
        </div>
      </div>

      {state.isFormOpen && (
        <SalaryConfigModal
          isOpen={state.isFormOpen}
          onClose={() => actions.setIsFormOpen(false)}
          teacherId={teacherId}
          config={state.editingConfig}
        />
      )}

      {state.isDeleteOpen && (
        <ConfirmModal
          isOpen={state.isDeleteOpen}
          onClose={() => actions.setIsDeleteOpen(false)}
          onConfirm={actions.handleDeleteConfirm}
          title="Delete Salary Configuration"
          message="Are you sure you want to permanently delete this salary configuration? This action cannot be undone."
          confirmText="Confirm Delete"
          isProcessing={state.isMutationProcessing}
        />
      )}
    </div>
  );
};

export default TeacherSalaryPayroll;
```

---

## 5. Performance Constraints & Execution Safety (Rule N4 & N5)

### GAS Execution Boundary (Rule N4)
All financial aggregates (`paidAmount`, sums, percentage balances) are calculated in-memory in the client browser inside `useMemo` hooks using `Arquero` query expressions. Zero redundant endpoint requests are issued.

### Performance Benchmarks (Rule N5)
* **Time Complexity:** $T(n) = O(n)$ array operations in RAM (with $n$ representing configs/transactions count, typically $< 100$).
* **API Calls:** At most 2 initial read operations upon loading the profile panel (`GET_SALARY_CONFIGS` and `DATA.QUERY` on `TeacherPaymentTransaction`).
* **Harness Trace:** We will place performance hooks measuring resolution timing:
  ```javascript
  console.log(`[useTeacherPayroll] Calculations complete in ${performance.now() - startTime}ms`);
  ```
  Target resolution should consistently remain below **15ms**.

---

## 6. Verification Plan

### Automated Tests
Currently, the frontend is validated by launching local server testing:
* Command: `npm run dev` to ensure no lint, compilation, or layout path aliasing errors block packaging.

### Manual Verification
1. Open a teacher's profile workspace inside the ERP UI.
2. Select the `Salary & Payroll` tab.
3. Confirm that the configurations render and that the calculations correctly show Gross Paid vs Net Owed balances.
4. Try creating or editing a configuration; verify the modal operates and saves, updating the UI cache correctly.

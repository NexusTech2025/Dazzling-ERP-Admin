# Walkthrough: Integrate Money Transactions Interface

Here is a summary of the files created and modified to support the **Money Transactions** ledger, transaction creation form drawer, and category manager inside the **Dazzling ERP Admin** React application. All components are built with adaptive light and dark theme capabilities.

## Changes Made

### 1. Database Queries & Cache Keys
* **[queryKeys.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/queryKeys.js)**: Added sub-keys for transaction lists and categories under the central `finance` block, and registered a root `staff` key for polymorphic related-party queries.

### 2. API Service Layer
* **[finance.api.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/api/finance.api.js)**: Appended generic CRUD methods utilizing the centralized `executeAction` client and `API_REGISTRY.DATA` endpoints:
  * `fetchMoneyTransactions` (target: `'MoneyTransaction'`)
  * `createMoneyTransaction` (table: `'MoneyTransaction'`)
  * `updateMoneyTransaction` (table: `'MoneyTransaction'`)
  * `deleteMoneyTransaction` (table: `'MoneyTransaction'`)
  * `fetchExpenseCategories` (target: `'ExpenseCategory'`)
  * `createExpenseCategory` (table: `'ExpenseCategory'`)
  * `updateExpenseCategory` (table: `'ExpenseCategory'`)
  * `deleteExpenseCategory` (table: `'ExpenseCategory'`)
  * `fetchStaffMembers` (target: `'StaffMember'`)

### 3. React Query Hooks
* **[useFinanceQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/hooks/useFinanceQueries.js)**: Declared and exported query hooks mapping to endpoints:
  * `useMoneyTransactionsQuery`
  * `useCreateMoneyTransactionMutation`
  * `useUpdateMoneyTransactionMutation`
  * `useDeleteMoneyTransactionMutation`
  * `useDeleteManyMoneyTransactionsMutation` (calls the generic bulk delete helper)
  * `useExpenseCategoriesQuery`
  * `useCreateExpenseCategoryMutation`
  * `useUpdateExpenseCategoryMutation`
  * `useDeleteExpenseCategoryMutation`
  * `useStaffMembersQuery`

### 4. UI Components (Adaptive Dark/Light Variants)
* **[MoneyTransactions.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/transactions/MoneyTransactions.jsx)**: Main dashboard ledger layout. Calculates metrics locally, filters by search strings, transaction directions, categories, and date ranges. Adapts card layouts and buttons cleanly across dark/light mode toggles.
* **[MoneyTransactionForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/transactions/components/MoneyTransactionForm.jsx)**: Input drawer supporting:
  * Segmented flow type selector.
  * Searchable counterparty lists (Student, Teacher, Support Staff) and plain text inputs (External vendor/payee name).
  * Category option filtering restricted by transaction flow type.
* **[CategoryManagerModal.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/transactions/components/CategoryManagerModal.jsx)**: Double-column category modal. Handles name validation and displays backend warning alerts for safe deletions (relational checks).

### 5. Routing & Navigation Links
* **[AppRoutes.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/routes/AppRoutes.jsx)**: Declared `/admin/finance/transactions` mapping to the new `<MoneyTransactions />` component.
* **[Sidebar.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/layout/Sidebar.jsx)**: Added a "Transactions" navigation menu item under the Finance submenu.

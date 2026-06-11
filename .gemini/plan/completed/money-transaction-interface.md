---
Date: 2026-06-09T20:53:00+05:30
Status: Approved-Completed
---

# Implementation Plan: Integrate Money Transactions Interface

This plan details the integration of the **Money Transactions** ledger, transaction creation form drawer, and category manager dialog inside the **Dazzling ERP Admin** React application. The layout and visual details are derived from the StitchMCP Slate Dark Financial designs located at `C:/Users/manis/Downloads/stitch_dazzling_erp_course_management_v2/stitch_dazzling_erp_course_management_v2`.

## User Review Required

> [!IMPORTANT]
> **Polymorphic Related Party Picker**:
> We will implement a tabbed related party selector in the Transaction Form matching the design:
> - **Student**: Search input that filters active students from `useStudentsQuery`.
> - **Teacher**: Search input that filters active teachers from `useTeachersQuery`.
> - **Staff**: Search input that filters active support staff from a new `useStaffMembersQuery` (backed by the `StaffMember` table).
> - **External**: Simple text input to enter a custom payee/payer name (for vendors, utility providers, etc.).
> On submission, the selected party's ID is stored as `party_id` (null for external) and their name as `party_name`.

> [!NOTE]
> **Category Direction Restrictions**:
> Categories have a `type` choice: `in` (Received), `out` (Sent), or `both`. The transaction form category dropdown will dynamically filter available options depending on whether "Received" (direction `in`) or "Sent" (direction `out`) is active.

---

## Proposed Changes

### 1. Database Queries & Keys

#### [MODIFY] [queryKeys.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/lib/react-query/queryKeys.js)
* Extend the centralized `queryKeys.finance` sub-structure to include:
  * `transactions`: Query key list and detail factory functions.
  * `categories`: Query key list factory functions.
* Add a `staff` query key factory to prevent cache collisions during non-faculty staff queries.

---

### 2. API Service Layer

#### [MODIFY] [finance.api.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/api/finance.api.js)
* Implement the following generic CRUD wrappers using `executeAction` and `API_REGISTRY.DATA` action keys:
  * `fetchMoneyTransactions(token, filter, options)`: Queries `MoneyTransaction` records using `DATA.QUERY`.
  * `createMoneyTransaction(token, data, options)`: Creates a `MoneyTransaction` record using `DATA.CREATE`.
  * `updateMoneyTransaction(token, id, data, options)`: Updates a `MoneyTransaction` record using `DATA.UPDATE` (matching key fields).
  * `deleteMoneyTransaction(token, id, options)`: Deletes a `MoneyTransaction` record using `DATA.DELETE`.
  * `deleteManyMoneyTransactions(token, ids, options)`: Performs bulk deletion using `DATA.DELETE_MANY`.
  * `fetchExpenseCategories(token, filter, options)`: Queries `ExpenseCategory` records using `DATA.QUERY`.
  * `createExpenseCategory(token, data, options)`: Creates an `ExpenseCategory` record using `DATA.CREATE`.
  * `updateExpenseCategory(token, id, data, options)`: Updates an `ExpenseCategory` record using `DATA.UPDATE`.
  * `deleteExpenseCategory(token, id, options)`: Deletes an `ExpenseCategory` record using `DATA.DELETE`.
  * `fetchStaffMembers(token, filter, options)`: Queries `StaffMember` records using `DATA.QUERY` to populate the polymorphic Staff picker dropdown.

---

### 3. TanStack Query Hooks

#### [MODIFY] [useFinanceQueries.js](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/hooks/useFinanceQueries.js)
* Implement query hooks linked to our centralized query key factory:
  * `useMoneyTransactionsQuery(filter)`
  * `useCreateMoneyTransactionMutation()`
  * `useUpdateMoneyTransactionMutation()`
  * `useDeleteMoneyTransactionMutation()`
  * `useDeleteManyMoneyTransactionsMutation()`
  * `useExpenseCategoriesQuery(filter)`
  * `useCreateExpenseCategoryMutation()`
  * `useUpdateExpenseCategoryMutation()`
  * `useDeleteExpenseCategoryMutation()`
  * `useStaffMembersQuery(filter)`

---

### 4. UI Components

#### [NEW] [MoneyTransactions.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/transactions/MoneyTransactions.jsx)
* Build the primary general ledger dashboard with rich visual styling:
  * **KPI Summary Grid**: Top metric tiles computing sums of active list items:
    * Total Received (emerald color, showing transaction type `'in'`)
    * Total Sent (rose color, showing transaction type `'out'`)
    * Net Balance (Received minus Sent, displaying green or red balance badge)
    * Total Logs Count
  * **Filter Controls**: Integrated search input, flow direction dropdown (`All`, `Received`, `Sent`), category dropdown, and clear filters option.
  * **DataTable Integration**: Columns:
    * `TXN ID`: bold, e.g., `#MTX-XXXX`
    * `DATE`: formatted transaction date
    * `DIRECTION`: Received (emerald badge) or Sent (rose badge)
    * `CATEGORY`: Expense Category name
    * `RELATED PARTY`: displaying name (`party_name`) and ID (`party_id`) with corresponding type indicator badge (Student, Teacher, Staff, External)
    * `PAYMENT INFO`: method + optional payment reference number
    * `AMOUNT`: bold numerical value with flow indicator prefix (`+` or `-`)
    * `ACTIONS`: Edit and Delete buttons (appearing on row hover)
  * **Selection Control & Action Bar**: Checkbox select columns, triggering a floating action bar at the bottom for bulk deletions.
  * **Drawer & Dialog triggers**: Action triggers to open the form drawer and category manager modal.

#### [NEW] [MoneyTransactionForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/transactions/components/MoneyTransactionForm.jsx)
* Form drawer sheet matching the design aesthetics:
  * Segmented radio buttons for Received vs Sent.
  * Inputs for Amount (with prefix `$`), Transaction Date, Category select (direction-filtered), and Payment Method select.
  * Tabbed Counterparty picker:
    * Tabs: Student, Teacher, Staff, External.
    * Uses a custom searchable selector for Student, Teacher, and Staff lists.
    * Text field input for External custom party names.
  * Reference # and Remarks fields.
  * Handles both Create and Edit states seamlessly.

#### [NEW] [CategoryManagerModal.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/finance/transactions/components/CategoryManagerModal.jsx)
* Modal containing:
  * Left: Form to create a new category (Name, Type selection (`in`/`out`/`both`), Description).
  * Right: Scrollable list of existing categories with Edit/Delete buttons.
  * Safe error-handling alert box for delete actions blocked by active transactions (`onDelete: "protect"`).

---

### 5. Routes & Navigation

#### [MODIFY] [AppRoutes.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/routes/AppRoutes.jsx)
* Register route path `/admin/finance/transactions` mapped to `<MoneyTransactions />`.

#### [MODIFY] [Sidebar.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/layout/Sidebar.jsx)
* Add a sub-menu item under the **Finance** heading:
  * `{ name: 'Transactions', path: '/admin/finance/transactions' }`

---

## Verification Plan

### Automated / Build Verification
* Run the Vite build command locally using command-prompt executor to verify imports, React Router structures, and React Query typing compile successfully:
  * Command: `cmd /c npm run build`

### Manual Verification
1. Open dashboard, navigate to **Finance** -> **Transactions**.
2. Verify visual appearance: KPI calculations, glass-panel cards with borders, and font sizing.
3. Test **Log Transaction**:
   * Select Received -> Student -> search and select an active student -> verify correct `party_name` and `party_id` are saved.
   * Select Sent -> Teacher -> select a teacher.
   * Select Sent -> External -> write "Electric Board Ltd" -> verify transaction logs successfully.
4. Verify category filtering: selecting `in` only shows income categories, `out` only shows expense categories.
5. Open **Manage Categories**, create a new category, verify it immediately displays on the list, and check that deleting a category linked to a transaction displays a validation warning alert.

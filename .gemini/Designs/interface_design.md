# Interface Design: Money Transactions Management

This document defines the high-fidelity UI layout, state orchestration, and component interaction blueprint for the Money Transactions interface.

---

## 1. Page Architecture & Layout Grid

The interface is accessible via the path `/admin/finance/transactions`. It consists of a top header bar, a KPI metrics row, a unified action and filter bar, a data table, and contextual sliding panels/modals.

```
+-------------------------------------------------------------------------+
|  Home > Finance > Money Transactions (Breadcrumbs)                     |
|  [ Money Transactions ]                   [ Manage Categories ] [ Log ] |
+-------------------------------------------------------------------------+
|  +----------------+ +----------------+ +----------------+ +-----------+  |
|  | Total Received | | Total Sent     | | Net Balance    | | Logs      |  |
|  | $124,500       | | $34,800        | | +$89,700       | | 128       |  |
|  +----------------+ +----------------+ +----------------+ +-----------+  |
+-------------------------------------------------------------------------+
|  [ Search party or ID... ]   [Type: All] [Category: All] [Method: All]  |
+-------------------------------------------------------------------------+
|  [x] ID       Date        Type      Category    Party      Amount  Actions|
|  [ ] MTX-001  2026-06-09  Received  Tuition     John Doe   $1,200  [Edit] |
|  [ ] MTX-002  2026-06-08  Sent      Salary      Jane Smith   $800  [Edit] |
+-------------------------------------------------------------------------+
```

---

## 2. Core Components

### A. Main View (`MoneyTransactions.jsx`)

*   **Location**: `src/features/finance/transactions/MoneyTransactions.jsx`
*   **Breadcrumbs**:
    *   Dashboard (`/admin/dashboard`, icon: `home`)
    *   Finance (`/admin/finance`)
    *   Money Transactions
*   **Page Header**:
    *   Title: `Money Transactions`
    *   Subtitle: `Consolidated institutional general ledger and cash flow register.`
    *   Actions:
        *   `<Button>`: `Manage Categories` (variant: `'secondary'`, leftIcon: `'folder_open'`) -> Opens `CategoryManagerModal`.
        *   `<Button>`: `Log Transaction` (variant: `'primary'`, leftIcon: `'add_circle'`) -> Opens `MoneyTransactionForm` in creation mode.
*   **KPI Metrics Row**:
    *   Vibrant, glassmorphic dark-mode slate theme container: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`.
    *   *Card 1: Total Received* -> Green trend indicator (`text-emerald-500 bg-emerald-500/10`), Material Symbol `payments`.
    *   *Card 2: Total Sent* -> Red trend indicator (`text-rose-500 bg-rose-500/10`), Material Symbol `shopping_cart`.
    *   *Card 3: Net Cash Balance* -> Highlighted active balance color (Green if `>= 0`, Red if `< 0`), Material Symbol `account_balance_wallet`.
    *   *Card 4: Total Logs* -> Neutral status, count of database records matching current query, Material Symbol `history`.
*   **Filters Panel**:
    *   Standard grid container: `grid grid-cols-1 md:grid-cols-12 gap-4 bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark`.
    *   `SearchInput` (spans 4 columns): search target is `party_name`, `notes`, `payment_reference`, `transaction_id`.
    *   `SelectFilter` dropdowns (spans 8 columns in a flex row):
        *   **Flow Direction**: `Type: All`, `Received (in)`, `Sent (out)`.
        *   **Accounting Category**: `Category: All` + options loaded dynamically from `ExpenseCategory` records.
        *   **Payment Method**: `Method: All`, `Cash (cash)`, `Paytm (paytm)`, `PhonePe (phonepe)`, `Bank (bank)`, `Other (other)`.
        *   **Party Type**: `Party: All`, `Student (student)`, `Teacher (teacher)`, `Staff (staff)`, `External (external)`.
*   **DataTable**:
    *   Uses `<DataTable>` wrapper supporting:
        *   `rowSelection`: checkboxes on left of rows.
        *   `isFetching`: active spinner overlay.
    *   Columns Mapping:
        *   `Transaction ID`: accessor `transaction_id`, bold font, link triggers Edit Mode.
        *   `Date`: accessor `transaction_date`, formatted date string.
        *   `Direction`: accessor `type`, colored badge:
            *   `in`: Emerald text/background (`bg-emerald-500/10 text-emerald-500`), displays "Received".
            *   `out`: Rose text/background (`bg-rose-500/10 text-rose-500`), displays "Sent".
        *   `Category`: accessor `category_id`, displays `category_name` mapped from categories cache.
        *   `Related Party`: composite accessor, resolves and formats:
            *   If `party_type` is `student`/`teacher`/`staff`: renders entity profile link with icon representing role/type.
            *   If `party_type` is `external`: renders `party_name` with an `"External"` badge.
        *   `Payment Details`: displays `payment_method` (capitalized) + `payment_reference` as sub-text.
        *   `Amount`: accessor `amount`, aligned right, bold format: `$1,200.00`.
        *   `Actions`: Edit button (Material Symbol `edit`), Delete button (Material Symbol `delete`).
*   **SelectionActionBar**:
    *   Floating toolbar active when items are checked in the table list.
    *   Triggers bulk deletion via `deleteManyMoneyTransactions` mutation.

---

### B. Transaction Entry Sheet (`MoneyTransactionForm.jsx`)

*   **Location**: `src/features/finance/transactions/components/MoneyTransactionForm.jsx`
*   **Container**: Standard slide-out side drawer or centered responsive modal (`max-w-2xl`).
*   **State Schema**:
    ```javascript
    const [formData, setFormData] = useState({
      amount: '',
      type: 'in', // 'in' | 'out'
      category_id: '',
      payment_method: 'cash', // 'cash' | 'paytm' | 'phonepe' | 'bank' | 'other'
      payment_reference: '',
      party_type: 'external', // 'student' | 'teacher' | 'staff' | 'external'
      party_id: '',
      party_name: '',
      transaction_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      notes: '',
      remarks: ''
    });
    ```
*   **Field Validations**:
    *   `amount` must be a positive number greater than or equal to 0.
    *   `category_id` is required.
    *   `transaction_date` is required.
    *   If `party_type === 'external'`, `party_name` is required.
    *   If `party_type !== 'external'`, `party_id` is required.
*   **Dynamic Inputs / UX Logic**:
    *   **Category List Inversion**:
        *   When `type` is set to `'in'`, category select dropdown filters choices to show only categories with `type === 'in'` or `type === 'both'`.
        *   When `type` is set to `'out'`, category select dropdown filters choices to show only categories with `type === 'out'` or `type === 'both'`.
    *   **Polymorphic Related Party Selector**:
        *   Render a `<RadioGroup>` selecting `'party_type'`.
        *   Conditional Search Input:
            *   If `student`: Show a searchable `<SelectInput>` fetching students (`useStudentsQuery`). On choice, store selected `student_id` in `party_id` and selected `student_name` in `party_name`.
            *   If `teacher`: Show a searchable `<SelectInput>` fetching teachers (`useTeachersQuery`). On choice, store selected `teacher_id` in `party_id` and selected `full_name` in `party_name`.
            *   If `staff`: Show a searchable `<SelectInput>` fetching staff profiles (`useStaffMembersQuery`). On choice, store selected `staff_id` in `party_id` and selected `name` in `party_name`.
            *   If `external`: Hide select list. Render a standard `<TextInput>` for `party_name` (e.g. vendor or corporate name). Set `party_id` to `null` on submit.

---

### C. Expense Category Manager (`CategoryManagerModal.jsx`)

*   **Location**: `src/features/finance/transactions/components/CategoryManagerModal.jsx`
*   **Layout**: Centered modal (`max-w-md`) split into two panes:
    *   **Left Pane / Top Row**: Add/Edit category form.
        *   `<TextInput>`: `Category Name` (Required, unique).
        *   `<SelectInput>`: `Direction Type` (Options: `Inflow Only (in)`, `Outflow Only (out)`, `Both (both)`).
        *   `<TextInput>`: `Description`.
        *   `<Button>`: `Save Category`.
    *   **Right Pane / Bottom List**: Scrolling lists of current categories:
        *   Renders list item row showing name, badge (In/Out/Both), and a delete icon.
        *   Clicking delete triggers `useDeleteExpenseCategoryMutation`. If the category has transactions linked, the backend will reject deletion due to `onDelete: "protect"` and return an integrity error, which is caught and displayed to the user via a red warning alert banner inside the modal.

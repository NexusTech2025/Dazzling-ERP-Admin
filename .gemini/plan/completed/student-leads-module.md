---
Date: 2026-05-28T07:31:00+05:30
Status: Approved-Completed
---

# Implementation Plan: Student Leads Section

This plan outlines the architecture and steps required to create a new `Student Leads` section in the admin dashboard, providing a complete CRUD workflow (List, Detail, Edit, and Create views) backed by the `StudentLead` database table schema.

---

## User Review Required

> [!IMPORTANT]
> - **Navigation Route**: We propose routing this section under `/admin/leads` (or `/admin/students/leads`). Please confirm if you want a dedicated sidebar option or a tab interface inside the Student Directory.
> - **Form Reuse**: Instead of creating a duplicate form component, we will refactor `QuickAddStudent.jsx` to support an **edit mode**. This keeps validation, layouts, and CRM sidebars unified.
> - **Schema Integration**: The section aligns directly with the `StudentLead` table structure defined in [full_schemav3.json](file:///E:/NAST/Dazzling/GAS/DazzlingDB/full_schemav3.json#L1266-L1387).

---

## Open Questions

> [!WARNING]
> - **Conversion Flow**: When a lead status transitions to `'converted'`, should they automatically be redirected to the **Full Registration Wizard** to enroll them as a student, or is conversion handled implicitly?
> - **Direct Deletion**: Confirm if administrators are permitted to delete lead records, or if we should support archiving/marking status as `'lost'` instead of physical deletion.

---

## Proposed Changes

### 1. API & Registry Layer

#### [MODIFY] [apiRegistry.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/services/apiRegistry.js)
- Add new registry keys for query, update, and deletion actions mapped to the `StudentLead` table schema:
```javascript
  LEAD: {
    QUERY: 'data_query',
    CREATE: 'student_add_lead',
    UPDATE: 'data_update',
    DELETE: 'data_delete'
  }
```

#### [MODIFY] [queryKeys.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/queryKeys.js)
- Register query key factories for lead listings and detail cache segments:
```javascript
  lead: {
    all: ['lead'],
    list: (filter = EMPTY_FILTER) => [...queryKeys.lead.all, 'list', { filter }],
    detail: (id) => [...queryKeys.lead.all, 'detail', id],
  }
```

#### [NEW] [studentLead.api.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/api/studentLead.api.js)
- Implement pure API fetch interface functions:
  - `fetchStudentLeads(token, filter, options)` ➔ queries `StudentLead` table.
  - `fetchStudentLeadDetail(token, id, options)` ➔ queries single lead record.
  - `updateStudentLead(token, id, data, options)` ➔ performs differential column update.
  - `deleteStudentLead(token, id, options)` ➔ deletes lead record from DB.

---

### 2. Query Hooks Layer

#### [NEW] [useStudentLeadQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/hooks/useStudentLeadQueries.js)
- Encapsulate TanStack queries and mutations using query keys:
  - `useStudentLeadsQuery(filter)`: fetches leads, sets staleTime.
  - `useStudentLeadDetailQuery(id)`: fetches single lead, implements **Cache Detail Fallback** (checks detail key, scans list key cache, prefetches if missing).
  - `useUpdateStudentLeadMutation()`: invalidates `queryKeys.lead.all` and specific detail query keys.
  - `useDeleteStudentLeadMutation()`: invalidates `queryKeys.lead.all` on success.

---

### 3. Component & UI Presentation Layer

#### [MODIFY] [QuickAddStudent.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/QuickAddStudent.jsx)
- Refactor the component to support an optional edit mode:
  - Props: Add `initialData` (object), `isEdit` (boolean), `onSubmitSuccess` (function), and `onCancel` (function).
  - **Form State**: Pre-populate values from `initialData` (mapping `student_name` to `fullName`, `phone` to `mobile`, etc.).
  - **CRM Panel**: Add `status` field to form inputs (visible/editable only in `isEdit` mode, options: `'prospect' | 'contacted' | 'converted' | 'lost'`).
  - **Workflow Actions**: Hide the "Submit Action" selection panel during editing since the workflow options are only relevant for creation.
  - **Submit Handlers**: If `isEdit` is true, trigger the update mutation (`useUpdateStudentLeadMutation`) instead of the create mutation. Upon success, invoke `onSubmitSuccess()`.
  - **Adaptive Styling**: Adjust root padding/borders when rendered in a modal view context.

#### [NEW] [StudentLeadDetailModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/StudentLeadDetailModal.jsx)
- An atomic V2 overlay modal displaying detailed lead properties (notes, batch name resolved from cache, priority status with priority-colored badges, creation date).

#### [NEW] [StudentLeadEditModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/StudentLeadEditModal.jsx)
- A modal dialog wrapper.
- Renders the adapted `<QuickAddStudent isEdit={true} initialData={lead} onSubmitSuccess={onClose} onCancel={onClose} />`.

#### [NEW] [StudentLeads.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/StudentLeads.jsx)
- The routed page controller.
- Orchestrates `useStudentLeadsQuery`, modal toggles, search states, and deletion error confirmations (using `ConfirmModal` with connection-error fallbacks).

---

### 4. Routing & Sidebar Navigation

#### [MODIFY] [AppRoutes.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/routes/AppRoutes.jsx)
- Register route: `<Route path="students/leads" element={<StudentLeads />} />`.

#### [MODIFY] [Sidebar.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/layout/Sidebar.jsx)
- Add "Student Leads" sub-menu item under the main "Students" navigation section.

---

## Verification Plan

### Automated / Compilation Verification (Manual Execution)
> [!NOTE]
> Run the following build and lint checks manually in your local terminal to verify there are no compilation errors:
```bash
npm run build
```

### Manual Verification
1. **List View Test**: Navigate to `/admin/students/leads`, confirm the Leads list table queries the server and displays data correctly.
2. **Details View Test**: Click a lead card/row to open `StudentLeadDetailModal`, verifying batch name and branch location hydrate from client query caches.
3. **Edit View Test**: Edit lead status to `'contacted'`, save, and confirm that the table invalidates and updates immediately.
4. **Delete View Test**: Trigger the delete option on a lead, verify the confirm modal displays success/error states correctly, and verify selection states clean up on deletion.

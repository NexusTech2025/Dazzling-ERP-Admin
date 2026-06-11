# Walkthrough: Student Leads CRUD Integration

This walkthrough details the changes made to introduce the fully functional **Student Leads CRUD** features into the dashboard.

---

## Changes Implemented

### 1. API & Cache Layer
*   **[apiRegistry.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/services/apiRegistry.js)**: Integrated central actions `LEAD.QUERY`, `LEAD.CREATE`, `LEAD.UPDATE`, and `LEAD.DELETE`.
*   **[queryKeys.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/queryKeys.js)**: Configured query key factories for lead listing and detail cache keys.
*   **[studentLead.api.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/api/studentLead.api.js)**: Implemented interface calls for fetching, updating, and deleting records.
*   **[useStudentLeadQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/hooks/useStudentLeadQueries.js)**: Added hooks `useStudentLeadsQuery`, `useStudentLeadDetailQuery` (with cache fallback support), `useUpdateStudentLeadMutation`, and `useDeleteStudentLeadMutation`.

### 2. Adaptive Form & Modals
*   **[QuickAddStudent.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/QuickAddStudent.jsx)**: Refactored to accept editing props (`isEdit`, `initialData`, etc.) to run update mutations, conditionally render status dropdown, and adjust styling for modal wrapping.
*   **[StudentLeadEditModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/StudentLeadEditModal.jsx)**: Lightweight modal dialog displaying the adapted `QuickAddStudent` component in edit mode.
*   **[StudentLeadDetailModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/components/StudentLeadDetailModal.jsx)**: Premium dark-slate detail modal showing resolved target batch, notes, and temperature/status badges.

### 3. List Views & Navigation
*   **[studentLeadSchema.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/schemas/studentLeadSchema.jsx)**: Column definitions with dynamic color cells for temperature and status.
*   **[StudentLeads.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/pages/admin/StudentLeads.jsx)**: Routed page controller managing states for filtering, view/edit/delete modals.
*   **[AppRoutes.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/routes/AppRoutes.jsx)**: Mapped route `students/leads` to the `StudentLeads` component.
*   **[Sidebar.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/layout/Sidebar.jsx)**: Rendered "Student Leads" sub-menu item under "Students".

---

## Verification & Manual Build Checks

### Verification Command (Run manually)
```bash
npm run build
```

### Manual Action List
1. Navigate to **Students -> Student Leads** in the sidebar.
2. Verify the list view loads leads correctly.
3. Open a details overlay by clicking a row action, and verify formatting.
4. Edit the lead's temperature and status in the edit modal, and verify instant listing invalidation.
5. Trigger deletion and verify safety confirm behavior.

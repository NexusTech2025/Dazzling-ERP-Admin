---
Date: 2026-08-16T17:57:00+05:30
Status: Approved-Completed
---

# ERP-Student Deletion Feature & `StudentDeleteModal` Implementation Plan

---

## 1. Traceability & Architectural Axioms

* **Referenced Schemas**:
  * `E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Students/Student.json`
  * `E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Academic/Enrollment.json`
  * `E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Academic/BatchAllocation.json`
  * `E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Finance/StudentFeeAccount.json`
  * `E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/Finance/Installment.json`
* **Referenced API Documentation**:
  * `E:/NAST/Dazzling/GAS/docs/api_docs/student_delete_api_doc.md` (`v2.2.0`)
* **Referenced Core Service Files**:
  * `E:/NAST/Dazzling/GAS/DazzlingDB/DBServices/StudentService.js`
  * `E:/NAST/Dazzling/GAS/DazzlingDB/DBServices/ConcreteActions.js` (`DeleteStudentAction`, `DeleteUntouchedStudentAction`)
  * `E:/NAST/Dazzling/GAS/DazzlingDB/Validate/StudentSoftDeleteValidationPipeline.js`
  * `E:/NAST/Dazzling/GAS/DazzlingDB/Validate/StudentHardDeleteValidationPipeline.js`
* **Referenced UI Catalog**:
  * `E:/NAST/Dazzling/ERP System/dazzling-erp-admin/.gemini/memory/ui_component/components.index.json`
  * `E:/NAST/Dazzling/ERP System/dazzling-erp-admin/.gemini/memory/ui_component/components.md`

---

## 2. Fact vs. Assumption Boundaries

### Verified Facts
1. **API Action Keys**: `API_REGISTRY.STUDENT.DELETE` maps to `'student_delete'`. The endpoint accepts `payload: { student_id, mode, force, reason, financial_settlement }`.
2. **Three Deletion Modes**:
   - `mode: "soft"` (Default): Sets `Student.status = 'deleted'`, cascades `Enrollment.status = 'discarded'` and `academic_status = 'withdrawn'`, sets `BatchAllocation.status = 'dropped'`, balances fee accounts via `financial_settlement` policy (default: `waive_unpaid`), preserves audit records.
   - `mode: "hard"` (with `force: false`): Physically purges across 10 tables leaf-first. Blocked with `422 FINANCIAL_INTEGRITY_BREACH` if student has `amount_paid > 0`.
   - `mode: "hard"` (with `force: true`): Permanent physical purge of all records including payments. Strictly requires `superadmin` role (non-superadmin receives `403 FORBIDDEN_ACCESS`).
3. **Current Frontend Gap**:
   - `removeStudent` in `student.api.js` only sends `{ student_id: id, dryRun }`.
   - `useDeleteStudentMutation` receives only `{ id, options }`.
   - `useStudentListView.js` uses generic `ConfirmModal` without mode selection, financial settlement policy, or superadmin guard.
   - `StudentProfile.jsx` / `ProfileHeader.jsx` has no deletion entry point.

### Assumptions
* For bulk deletion (`SelectionActionBar`), multi-student deletion will default to cascading `mode: "soft"` with `waive_unpaid` settlement policy for safety unless single-item granular modal is opened.

---

## 3. Execution Blueprints & Positional Signatures (Rule N1)

### 3.1 API Service Update (`src/features/student/api/student.api.js`)

```javascript
/**
 * Deletes a student via the unified student_delete backend endpoint.
 * Supports soft-delete with financial settlement, untouched clean purge, or superadmin force purge.
 * 
 * @async
 * @function removeStudent
 * @param {string} token - Active user session token.
 * @param {string|Object} payloadOrId - Target student ID string or composite payload object.
 * @param {string} payloadOrId.student_id - Target student ID ("STU-xxx").
 * @param {string} [payloadOrId.mode="soft"] - Deletion mode: "soft" | "hard" | "untouched".
 * @param {boolean} [payloadOrId.force=false] - Force purge switch (superadmin only).
 * @param {string} [payloadOrId.reason] - Administrative reason for soft delete.
 * @param {Object} [payloadOrId.financial_settlement] - Financial settlement configuration.
 * @param {Object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<Object>} Standard response envelope with deletion manifest.
 */
export const removeStudent = (token, payloadOrId, options = {}) => {
  const payload = typeof payloadOrId === 'string'
    ? { student_id: payloadOrId, mode: 'soft' }
    : {
        student_id: payloadOrId.student_id || payloadOrId.id,
        mode: payloadOrId.mode || 'soft',
        force: Boolean(payloadOrId.force),
        reason: payloadOrId.reason || undefined,
        financial_settlement: payloadOrId.financial_settlement || undefined
      };

  return executeAction(
    API_REGISTRY.STUDENT.DELETE,
    payload,
    token,
    { timeout: 'DATA_MUTATION', ...options }
  );
};
```

---

### 3.2 Mutation Hook Enhancement (`src/features/student/hooks/useStudentQueries.js`)

```javascript
/**
 * TanStack Query mutation hook for executing student deletion.
 * Invalidate student directory, enrollment, and finance caches upon successful deletion.
 * 
 * @function useDeleteStudentMutation
 * @returns {Object} React Query mutation result object.
 */
export const useDeleteStudentMutation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payloadOrId) => {
      const studentId = typeof payloadOrId === 'string' ? payloadOrId : (payloadOrId.student_id || payloadOrId.id);
      if (!studentId) {
        throw new Error('Student ID is required for deletion.');
      }
      return removeStudent(token, payloadOrId);
    },
    onSuccess: (response, variables) => {
      const studentId = typeof variables === 'string' ? variables : (variables.student_id || variables.id);
      console.log(`[useDeleteStudentMutation] Student ${studentId} deleted successfully:`, response);
      
      // Invalidate relevant query keys
      queryClient.invalidateQueries({ queryKey: queryKeys.student.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollment.list(EMPTY_FILTER) });
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
    onError: (err, variables) => {
      console.error('[useDeleteStudentMutation] Error during student deletion:', err);
    }
  });
};
```

---

### 3.3 Dedicated `StudentDeleteModal` Component Architecture

File: `src/features/student/components/StudentDeleteModal.jsx`

#### Key Capabilities:
1. **Smart Context Detection**:
   - Determines if the student is **Untouched** (no active enrollments, no payments) $\to$ Defaults to **Clean Purge (`hard`)**.
   - Determines if the student has **Active History / Dues / Payments** $\to$ Defaults to **Soft Delete (`soft`)** with Financial Settlement options.
2. **Interactive Strategy Modes**:
   - **Mode 1: Soft Delete & Archive (`mode: "soft"`)**:
     - Form field for `reason` (optional).
     - Financial settlement policy radio group:
       - `waive_unpaid` (Default): Waives future dues, finalizes fee to amount paid.
       - `settle_liability`: Requires `required_amount` input.
       - `refund`: Requires `refund_amount` input.
       - `retain_ledger`: Preserves fee ledger as-is.
     - Live impact checklist: *Status $\to$ Deleted • Enrollments $\to$ Discarded • Batch Seats $\to$ Dropped • Audit Records $\to$ Preserved*.
   - **Mode 2: Untouched / Clean Purge (`mode: "hard"`, `force: false`)**:
     - Permanent physical removal of zero-activity records.
     - If `amount_paid > 0`, displays a warning banner and disables hard delete unless user switches to Soft Delete or Superadmin Force.
   - **Mode 3: Superadmin Force Purge (`mode: "hard"`, `force: true`)**:
     - Visible only if `user.role === 'superadmin'`.
     - Highlights severe data destruction risks.
     - Requires checking an explicit acknowledgment checkbox (*"I understand this permanently deletes all 10 downstream tables and payment records"*) before confirming.
3. **Consistent Modal Shell**:
   - Reuses the look, feel, animations, and status handling (`idle`, `processing`, `success`, `error`) established in `ConfirmModal`.

---

## 4. UI Component Catalog Reuse Matrix

| Requirement | Catalog Component | Location |
| :--- | :--- | :--- |
| Action Buttons | `Button` (`variant="danger"`, `variant="outlined"`) | `src/components/ui/v2/Button.jsx` |
| Mode Selector | `RadioGroup` / `SegmentedControl` | `src/components/ui/v2/RadioGroup.jsx` |
| Text / Reason Input | `TextInput` | `src/components/ui/v2/TextInput.jsx` |
| Form Wrap & Labels | `FormField` | `src/components/ui/v2/FormField.jsx` |
| Status / Indicators | `Badge` | `src/components/ui/Badge.jsx` |
| Content Containers | `Card` (`Card.Body`) | `src/components/ui/Card.jsx` |
| Alerts & Warnings | `AlertCard` / Custom Alert Box | `src/components/ui/v2/AlertCard.jsx` |

---

## 5. Step-by-Step Implementation Workflow

### Phase 1: API & Hook Integration
- [MODIFY] `src/features/student/api/student.api.js`: Update `removeStudent` to accept object payload with `student_id`, `mode`, `force`, `reason`, and `financial_settlement`.
- [MODIFY] `src/features/student/hooks/useStudentQueries.js`: Update `useDeleteStudentMutation` to handle composite payload and invalidate student, enrollment, and finance caches.

### Phase 2: `StudentDeleteModal` Component Creation
- [NEW] `src/features/student/components/StudentDeleteModal.jsx`: Implement the dedicated deletion modal with smart mode detection, soft-delete settlement policies, financial integrity safeguards, and superadmin force purge support.

### Phase 3: Wiring into Directory & Profile Views
- [MODIFY] `src/features/student/hooks/useStudentListView.js`: Update state to pass target student object/metrics to `StudentDeleteModal`.
- [MODIFY] `src/pages/admin/Students.jsx`: Replace generic `ConfirmModal` with `StudentDeleteModal`.
- [MODIFY] `src/features/student/components/profile/ProfileHeader.jsx` & `src/pages/admin/StudentProfile.jsx`: Add "Delete / Withdraw" action trigger in the profile header, opening `StudentDeleteModal` and redirecting to `/admin/students` upon successful deletion.

---

## 6. Verification Plan

### Automated / Syntax Verification
- Run project build or verify JSX syntax for modified files.

### Manual Verification Matrix
1. **Zero-Activity Student Deletion**:
   - Open Student Directory $\to$ Click Delete on an untouched student $\to$ Confirm `StudentDeleteModal` auto-selects Clean Hard Delete $\to$ Execute and verify student is purged.
2. **Active Enrolled Student Soft Deletion**:
   - Open Student Directory or Student Profile $\to$ Click Delete on a student with active enrollments $\to$ Verify modal defaults to Soft Delete $\to$ Select `waive_unpaid` $\to$ Execute and verify status updates to `deleted`, seats freed, dues waived.
3. **Financial Protection Guard**:
   - Attempt Hard Delete on a student with `amount_paid > 0` $\to$ Verify UI flags financial integrity guard and prevents standard hard delete.
4. **Superadmin Force Purge**:
   - With `superadmin` role, toggle Force Purge $\to$ Acknowledge safety checkbox $\to$ Verify payload passes `mode: "hard", force: true`.
5. **Profile Header Deletion**:
   - Navigate to `/admin/students/STU-xxxx` $\to$ Click Delete in Profile Header $\to$ Complete deletion $\to$ Verify toast/modal feedback and smooth redirect back to `/admin/students`.

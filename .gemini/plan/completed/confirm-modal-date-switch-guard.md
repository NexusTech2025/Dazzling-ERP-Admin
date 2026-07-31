---
Title: **ConfirmModal Date-Switching Guard Implementation Plan**
Date: 2026-07-29T00:37:00+05:30
Status: Approved-Completed
---

# **ConfirmModal Date-Switching Guard Implementation Plan**

This document details the technical implementation plan to replace native browser `window.confirm` alerts with the design system's atomic [`ConfirmModal`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/ConfirmModal.jsx) when a user switches attendance register dates while unsaved edits exist in `draftDeltas` (`isDirty === true`).

---

## **User Review Required**

> [!IMPORTANT]
> **MODAL SELECTION & UX BEHAVIOR:**
> 1. We will import and render [`ConfirmModal`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/ConfirmModal.jsx) inside [`AttendanceRegisterView.jsx`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/AttendanceRegisterView.jsx).
> 2. When a user picks a new date in the date picker while `isDirty` is `true`:
>    * The app intercepts the selection, stores the targeted date string as `pendingDate`, and opens `ConfirmModal`.
>    * **Confirm Action ("Discard & Switch Date")**: Wipes workspace drafts via `handleReset()`, sets `selectedDate(pendingDate)`, and closes the modal.
>    * **Cancel Action ("Keep Editing")**: Cancels date switching, closes the modal, and retains the date picker on the current active date so the user can save their edits.

---

## **Open Questions**

> [!NOTE]
> No unresolved open questions. `ConfirmModal.jsx` API and props have been verified against source code.

---

## **Non-Domain Driven Infrastructure Rules (N1–N6)**

### **Rule N1: Explicit Positional Signatures & Execution Blueprints**

#### `AttendanceRegisterView` Date Change & Modal State Machine Blueprint

```javascript
/**
 * Date Switching State Machine inside AttendanceRegisterView.jsx
 */
const [pendingDate, setPendingDate] = useState(null);
const [showDateConfirmModal, setShowDateConfirmModal] = useState(false);

/**
 * Intercepts date picker changes. Opens ConfirmModal if isDirty is true.
 * @param {string} newDateStr - Target date string in YYYY-MM-DD format
 */
const handleDateChange = useCallback((newDateStr) => {
  if (isDirty) {
    setPendingDate(newDateStr);
    setShowDateConfirmModal(true);
    return;
  }
  handleReset();
  setSelectedDate(newDateStr);
}, [isDirty, handleReset, setSelectedDate]);

/**
 * Confirms date switch: wipes draft workspace, updates selected date, and closes modal.
 */
const handleConfirmDateSwitch = useCallback(() => {
  if (pendingDate) {
    handleReset();
    setSelectedDate(pendingDate);
  }
  setShowDateConfirmModal(false);
  setPendingDate(null);
}, [pendingDate, handleReset, setSelectedDate]);

/**
 * Cancels date switch: closes modal and resets pending date.
 */
const handleCancelDateSwitch = useCallback(() => {
  setShowDateConfirmModal(false);
  setPendingDate(null);
}, []);
```

---

### **Rule N2: Absolute Background Base Knowledge Traceability**

* **Referenced Design System Modal Component:** [`src/components/ui/ConfirmModal.jsx`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/ConfirmModal.jsx)
* **Referenced Modal Catalog Reference:** [`.gemini/memory/models.md`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.gemini/memory/models.md#L9)
* **Target Feature View Component:** [`src/features/batch/components/profile/AttendanceRegisterView.jsx`](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/AttendanceRegisterView.jsx)

---

### **Rule N3: Explicit Fact vs. Assumption Boundary Declaration**

1. **Actual Verified Facts:**
   * `ConfirmModal.jsx` exists under `src/components/ui/ConfirmModal.jsx` accepting `isOpen`, `onClose`, `onConfirm`, `title`, `message`, `confirmText`, and `cancelText`.
   * `AttendanceRegisterView.jsx` currently uses inline `window.confirm`.
2. **System Assumptions:**
   * Replacing `window.confirm` with `ConfirmModal.jsx` improves visual design compliance with dark-mode slate theme tokens.

---

### **Rule N4: GAS Execution Boundary & Round-Trip Round Up**

* Modal state transitions operate purely in client RAM without triggering network requests.

---

### **Rule N5: Performance Regression & Benchmark Assertions**

* Render isolated state hooks prevent re-rendering underlying `DataTable` rows during modal open/close transitions.

---

### **Rule N6: Legacy Maintenance Mitigation & Red Flag Isolation**

> [!CAUTION]
> **LEGACY MAINTENANCE ISOLATED:**
> * Replaces browser native `window.confirm` with standard atomic `ConfirmModal` UI component.

---

## **Proposed Changes**

---

### **Component 1: Presentation UI Component (`AttendanceRegisterView.jsx`)**

#### [MODIFY] [AttendanceRegisterView.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/AttendanceRegisterView.jsx)

* Import `ConfirmModal` from `../../../../components/ui/ConfirmModal`.
* Add state `pendingDate` and `showDateConfirmModal`.
* Refactor `handleDateChange`, `handleConfirmDateSwitch`, `handleCancelDateSwitch`.
* Render `<ConfirmModal />` at the bottom of the component tree:
  ```jsx
  <ConfirmModal
    isOpen={showDateConfirmModal}
    onClose={handleCancelDateSwitch}
    onConfirm={handleConfirmDateSwitch}
    title="Unsaved Staged Edits"
    message="You have unsaved attendance edits in your workspace for this date. Switching dates will discard all uncommitted changes. Do you want to proceed?"
    confirmText="Discard & Switch Date"
    cancelText="Keep Editing"
  />
  ```

---

## **Verification Plan**

### **Manual Verification**
1. Open attendance register for a batch.
2. Toggle status or edit remarks for any student (`isDirty` becomes `true`).
3. Change the date picker value.
4. Verify `ConfirmModal` opens with dark-mode glassmorphism theme, showing title *"Unsaved Staged Edits"*.
5. Click **"Keep Editing"**: Verify modal closes, workspace edits remain intact, and date picker stays on current date.
6. Pick new date again, click **"Discard & Switch Date"**: Verify workspace is reset and the page loads records for the new date.

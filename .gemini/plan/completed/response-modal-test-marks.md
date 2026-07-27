---
Date: 2026-07-27T14:54:00+05:30
Status: Proposed
---

# Implementation Plan: Integrated `ResponseModal` Feedback for Test Creation & Bulk Marks Entry

This document outlines the technical plan to integrate the standardized [ResponseModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/ResponseModal.jsx) dialog into [BatchTestsTab.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/BatchTestsTab.jsx) to present decorated success metrics and error feedback when creating/editing tests and saving student marks.

---

## **1. Background Knowledge & Traceability (Rule N2)**

* **Referenced Core Primitives:**
  * `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\components\ui\ResponseModal.jsx`
  * `.gemini/memory/models.md` (`ResponseModal` API contract)
* **Referenced Component Container:**
  * `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\features\batch\components\profile\BatchTestsTab.jsx`
* **Design Guidelines:**
  * `.agents/rules/plan-drafting-rule.md`
  * `.agents/rules/zero-new-ui-components-policy.md`

---

## **2. Fact vs. Assumption Boundary Declaration (Rule N3)**

### Actual Verified Facts
1. `ResponseModal` is a standardized atomic overlay component (`src/components/ui/ResponseModal.jsx`) supporting `variant="success"|"error"`, `title`, `subtitle`, `items` (2-column metric cards), `errorObj` (`{ code, message, details }`), and `onRetry` callback.
2. Currently, `BatchTestsTab.jsx` handles test creation and bulk marks submission asynchronously, but only logs errors to console (`console.error('[BatchTestsTab] Save marks failure:', err)`) without showing visual feedback.

### System Assumptions
1. Errors returned by `createTestMutation`, `updateTestMutation`, and `saveBulkMarksMutation` expose standard `.message` or `.code` properties.

---

## **3. Technical Legacy Caution Isolation (Rule N6)**

> [!CAUTION]
> **LEGACY MAINTENANCE IDENTIFIED:**
>
> * **Technical Path Endpoint:** [BatchTestsTab.jsx:L190-L208](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/BatchTestsTab.jsx#L190-L208)
> * **Core Technical Debt Risk:** Silent error catching (`console.error`) leaves the user unaware of API mutation failures or transaction timeouts.
> * **Remediation Option:** Intercept all mutation results in `handleModalSubmit` and `handleSaveAllMarks`, open `ResponseModal` with formatted items or `errorObj`, and provide a `Retry Action` trigger on failure.

---

## **4. GAS Execution Boundary & Round-Trip Safeguards (Rule N4)**

* **UX Feedback Boundary:** `ResponseModal` displays decorated transaction metrics (`processedCount`, `totalMarks`, `studentsEvaluated`, ISO timestamps) immediately after mutation promises resolve, without making additional network calls.

---

## **5. Performance Benchmarks & Assertions (Rule N5)**

* **Modal Trigger Overhead:** $< 2\text{ ms}$ state update latency upon mutation completion.

---

## **6. Positional Signatures & Execution Blueprints (Rule N1)**

### A. Integrated `ResponseModal` in `BatchTestsTab.jsx` ([BatchTestsTab.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/BatchTestsTab.jsx))

```javascript
// State configuration
const [responseModalConfig, setResponseModalConfig] = useState({
  isOpen: false,
  variant: 'success',
  title: '',
  subtitle: '',
  items: [],
  errorObj: null,
  onRetry: null
});

// Closing helper
const handleResponseModalClose = () => {
  setResponseModalConfig(prev => ({ ...prev, isOpen: false }));
};

// 1. Test Creation / Update Handler
const handleModalSubmit = async (formData) => {
  try {
    if (editingTest) {
      await updateTestMutation.mutateAsync({
        id: editingTest.id,
        batch_id: currentBatchId,
        ...formData
      });

      setResponseModalConfig({
        isOpen: true,
        variant: 'success',
        title: 'Test Updated Successfully',
        subtitle: `Changes to test "${formData.title}" have been saved.`,
        items: [
          { label: 'Test Title', value: formData.title },
          { label: 'Total Marks', value: `${formData.total_marks}` },
          { label: 'Passing Marks', value: `${formData.passing_marks}` },
          { label: 'Status', value: formData.status || 'Draft', isHighlight: true }
        ],
        errorObj: null
      });
    } else {
      await createTestMutation.mutateAsync({
        ...formData,
        batch_id: currentBatchId
      });

      setResponseModalConfig({
        isOpen: true,
        variant: 'success',
        title: 'Test Created Successfully',
        subtitle: `New test "${formData.title}" has been added to this batch.`,
        items: [
          { label: 'Test Title', value: formData.title },
          { label: 'Total Marks', value: `${formData.total_marks}` },
          { label: 'Passing Marks', value: `${formData.passing_marks}` },
          { label: 'Status', value: formData.status || 'Draft', isHighlight: true }
        ],
        errorObj: null
      });
    }

    setIsModalOpen(false);
    setEditingTest(null);
  } catch (err) {
    setResponseModalConfig({
      isOpen: true,
      variant: 'error',
      title: editingTest ? 'Failed to Update Test' : 'Failed to Create Test',
      subtitle: 'An error occurred while communicating with the backend database.',
      errorObj: {
        code: err.code || 'TEST_MUTATION_ERROR',
        message: err.message || 'Unable to save test configuration.'
      },
      items: [],
      onRetry: () => handleModalSubmit(formData)
    });
  }
};

// 2. Bulk Save Marks Handler
const handleSaveAllMarks = async () => {
  if (!selectedTest) return;

  const recordsToSave = Object.values(marksState);

  try {
    await saveBulkMarksMutation.mutateAsync({
      test_id: selectedTest.id,
      marksRecords: recordsToSave
    });

    setResponseModalConfig({
      isOpen: true,
      variant: 'success',
      title: 'Student Marks Saved Successfully',
      subtitle: `Marks records for test "${selectedTest.title}" have been committed to the database.`,
      items: [
        { label: 'Test Title', value: selectedTest.title },
        { label: 'Students Evaluated', value: `${recordsToSave.length}`, isHighlight: true },
        { label: 'Batch ID', value: currentBatchId, isMono: true },
        { label: 'Saved At', value: new Date().toLocaleTimeString(), fullWidth: true }
      ],
      errorObj: null
    });

    setActiveStage('list');
    setSelectedTest(null);
  } catch (err) {
    setResponseModalConfig({
      isOpen: true,
      variant: 'error',
      title: 'Failed to Save Student Marks',
      subtitle: 'An error occurred while committing student test scores.',
      errorObj: {
        code: err.code || 'BULK_MARKS_SAVE_ERROR',
        message: err.message || 'Failed to submit bulk marks payload.'
      },
      items: [],
      onRetry: handleSaveAllMarks
    });
  }
};
```

---

## 7. Mandatory UI Component Catalog Mapping

| UI Feature | Target Primitive Component | Source Location |
| :--- | :--- | :--- |
| Success / Error Result Modal | `ResponseModal` | `src/components/ui/ResponseModal.jsx` |

---

## User Review Required

> [!NOTE]
> Please review the proposed `ResponseModal` integration plan for decorated success/error dialogs on Test Creation and Bulk Marks Save actions.

---

## Open Questions

None at this time.

---

## Proposed Changes

#### [MODIFY] [BatchTestsTab.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/BatchTestsTab.jsx)
- Import `ResponseModal` from `../../../../components/ui/ResponseModal`.
- Add `responseModalConfig` state.
- Trigger `setResponseModalConfig` on success and error in `handleModalSubmit` and `handleSaveAllMarks`.
- Render `<ResponseModal {...responseModalConfig} onClose={handleResponseModalClose} />`.

---

## Verification Plan

### Manual Verification
1. Open Batch Details -> **Tests** tab.
2. Click **+ Create New Test** -> Fill form -> Click **Save**. Verify decorated green `Success` `ResponseModal` appears showing Test Title, Total Marks, and Status.
3. Click **Enter Marks** on a test -> Enter student marks -> Click **Save All Marks**. Verify decorated green `Success` `ResponseModal` appears showing Students Evaluated count and timestamp.
4. Simulate a network error (e.g. offline mode) -> Submit -> Verify red `Error` `ResponseModal` appears with error code and `Retry Action` button.

---
Date: 2026-07-27T15:10:00+05:30
Status: Proposed
---

# Implementation Plan: Restructure `TestFormModal` with Compound `Modal` Subcomponents

This document outlines the technical plan to refactor [TestFormModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/components/TestFormModal.jsx) using compound `<Modal.Header>`, `<Modal.Body>`, and `<Modal.Footer>` components, eliminating modal header clipping, improving vertical spacing, and fixing dark mode dialog aesthetics.

---

## **1. Background Knowledge & Traceability (Rule N2)**

* **Referenced Core Primitive:**
  * `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\components\ui\Modal.jsx` (`Modal.Header`, `Modal.Body`, `Modal.Footer` API signature)
* **Referenced Target Modal:**
  * `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\features\batch\components\profile\tests\components\TestFormModal.jsx`
* **Design Guidelines:**
  * `.agents/rules/plan-drafting-rule.md`
  * `.agents/rules/zero-new-ui-components-policy.md`

---

## **2. Fact vs. Assumption Boundary Declaration (Rule N3)**

### Actual Verified Facts
1. The base `Modal` component in `src/components/ui/Modal.jsx` uses the **Composition Component Pattern** requiring `<Modal.Header>`, `<Modal.Body>`, and `<Modal.Footer>` as children.
2. Currently, `TestFormModal.jsx` passes `title` and `maxWidth` directly to the `<Modal>` container (`<Modal isOpen={isOpen} title="..." maxWidth="...">`). Because `<Modal>` ignores the `title` prop on the root tag, no header is rendered, causing form labels ("TEST TITLE *") to clip directly against the rounded top border of the modal portal.

### System Assumptions
1. Standard size `size="lg"` provides optimal layout width for 2-column input form grids on desktop and mobile.

---

## **3. Technical Legacy Caution Isolation (Rule N6)**

> [!CAUTION]
> **LEGACY MAINTENANCE IDENTIFIED:**
>
> * **Technical Path Endpoint:** [TestFormModal.jsx:L64-L148](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/components/TestFormModal.jsx#L64-L148)
> * **Core Technical Debt Risk:** Passing `title` to `<Modal>` instead of composing `<Modal.Header>` breaks header padding, hides title labels, and removes the dismiss `x` icon button.
> * **Remediation Option:** Refactor `TestFormModal.jsx` to wrap form content inside `<Modal.Header>`, `<Modal.Body>`, and `<Modal.Footer>`.

---

## **4. GAS Execution Boundary & Round-Trip Safeguards (Rule N4)**

* **Pure UI Refactoring:** Form rendering and layout adjustments occur strictly in React DOM; zero backend API impact.

---

## **5. Performance Benchmarks & Assertions (Rule N5)**

* **Layout Render Target:** $< 2\text{ ms}$ modal mount time.

---

## **6. Positional Signatures & Execution Blueprints (Rule N1)**

### Refactored `TestFormModal.jsx` ([TestFormModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/components/TestFormModal.jsx))

```javascript
import React, { useState, useEffect } from 'react';
import Modal from '../../../../../../components/ui/Modal';
import FormField from '../../../../../../components/ui/v2/FormField';
import TextInput from '../../../../../../components/ui/v2/TextInput';
import DateInput from '../../../../../../components/ui/v2/DateInput';
import SelectInput from '../../../../../../components/ui/v2/SelectInput';
import Button from '../../../../../../components/ui/v2/Button';

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Published', label: 'Published' },
  { value: 'Completed', label: 'Completed' },
];

export default function TestFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false
}) {
  const [formData, setFormData] = useState({
    title: '',
    test_date: new Date().toISOString().split('T')[0],
    total_marks: 100,
    passing_marks: 40,
    status: 'Draft',
    remarks: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        test_date: initialData.test_date ? initialData.test_date.split('T')[0] : new Date().toISOString().split('T')[0],
        total_marks: initialData.total_marks || 100,
        passing_marks: initialData.passing_marks || 40,
        status: initialData.status || 'Draft',
        remarks: initialData.remarks || ''
      });
    } else {
      setFormData({
        title: '',
        test_date: new Date().toISOString().split('T')[0],
        total_marks: 100,
        passing_marks: 40,
        status: 'Draft',
        remarks: ''
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header
        title={initialData ? 'Edit Test Details' : 'Create New Test'}
        subtitle={initialData ? 'Update test parameters and scoring rules' : 'Define test details, schedule date, total marks, and passing criteria'}
        icon="assignment"
        onClose={onClose}
      />
      <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
        <Modal.Body className="space-y-4">
          <FormField label="Test Title *" subtext="Enter a descriptive title (e.g. Mathematics Unit Test - 1)">
            <TextInput
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Mathematics Unit Test - 1"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Test Date *">
              <DateInput
                value={formData.test_date}
                onChange={(e) => handleChange('test_date', e.target.value)}
                required
              />
            </FormField>

            <FormField label="Status *">
              <SelectInput
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                options={STATUS_OPTIONS}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Total Marks *">
              <TextInput
                type="number"
                value={formData.total_marks}
                onChange={(e) => handleChange('total_marks', Number(e.target.value))}
                min={1}
                required
              />
            </FormField>

            <FormField label="Passing Marks *">
              <TextInput
                type="number"
                value={formData.passing_marks}
                onChange={(e) => handleChange('passing_marks', Number(e.target.value))}
                min={0}
                required
              />
            </FormField>
          </div>

          <FormField label="Remarks" subtext="Optional notes or topics covered">
            <TextInput
              value={formData.remarks}
              onChange={(e) => handleChange('remarks', e.target.value)}
              placeholder="Chapters 1-3 included..."
            />
          </FormField>
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            {initialData ? 'Update Test' : 'Create Test'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
```

---

## 7. Mandatory UI Component Catalog Mapping

| UI Feature | Target Primitive Component | Source Location |
| :--- | :--- | :--- |
| Modal Container | `Modal` | `src/components/ui/Modal.jsx` |
| Form Fields | `FormField` | `src/components/ui/v2/FormField.jsx` |
| Text Input | `TextInput` | `src/components/ui/v2/TextInput.jsx` |
| Date Input | `DateInput` | `src/components/ui/v2/DateInput.jsx` |
| Select Input | `SelectInput` | `src/components/ui/v2/SelectInput.jsx` |
| Action Buttons | `Button` | `src/components/ui/v2/Button.jsx` |

---

## User Review Required

> [!NOTE]
> Please review the proposed `TestFormModal` compound subcomponent restructuring.

---

## Open Questions

None at this time.

---

## Proposed Changes

#### [MODIFY] [TestFormModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/components/TestFormModal.jsx)
- Use `size="lg"` on `<Modal>`.
- Add `<Modal.Header title="..." subtitle="..." icon="assignment" onClose={onClose} />`.
- Wrap form body in `<Modal.Body>`.
- Move action buttons into `<Modal.Footer>`.

---

## Verification Plan

### Manual Verification
1. Open Batch Details -> **Tests** tab.
2. Click **+ Create New Test**.
3. Inspect dialog header — verify clean `Modal.Header` with assignment icon, title ("Create New Test"), subtitle, and close `x` button.
4. Verify top form label ("TEST TITLE *") has proper 24px padding and is no longer clipped by the top curve of the modal.
5. Verify footer tray buttons are neatly aligned in `Modal.Footer`.

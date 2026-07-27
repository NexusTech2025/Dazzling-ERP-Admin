---
Title: Implementation Plan: WhatsApp Test Report & Student Marksheet Sharing Feature
Date: 2026-07-27T15:56:00+05:30
Status: Approved-Completed
---

# Implementation Plan: WhatsApp Test Report & Student Marksheet Sharing Feature

This document outlines the technical design to implement WhatsApp report sharing for batch test performance summaries and individual student marksheets using `https://api.whatsapp.com/send?text=${encodedMsg}`.

---

## **1. Background Knowledge & Traceability (Rule N2)**

* **Referenced Core Modules:**
  * `src/features/batch/components/profile/tests/utils/testCalculators.js` (Analytical stats calculator)
  * `src/features/batch/components/profile/BatchTestsTab.jsx` (Test view controller)
  * `src/features/batch/components/profile/tests/components/StudentResultTable.jsx` (Student results table)
* **Referenced UI Primitives:**
  * `src/components/ui/v2/Button.jsx`
* **Design Runbooks:**
  * `.agents/rules/plan-drafting-rule.md`
  * `.agents/rules/zero-new-ui-components-policy.md`

---

## **2. Fact vs. Assumption Boundary Declaration (Rule N3)**

### Actual Verified Facts
1. WhatsApp Web and mobile apps accept message payloads via `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}` (allowing contact or group selection) or `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` for targeted direct contacts.
2. WhatsApp supports basic Markdown formatting: `*bold*`, `_italics_`, `~strikethrough~`, and list bullet points (`•`).
3. `BatchTestsTab.jsx` holds `selectedTest`, `batch`, `reportData` (KPIs, toppers, studentResults), and `studentsMap`.

### System Assumptions
1. Mobile numbers on student profiles match standard 10-digit Indian formats (e.g. `9876543210`), which can be prefixed with `91` for direct `wa.me` links.

---

## **3. Technical Legacy Caution Isolation (Rule N6)**

> [!CAUTION]
> **LEGACY MAINTENANCE IDENTIFIED:**
>
> * **Technical Path Endpoint:** [BatchTestsTab.jsx:L340-L352](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/BatchTestsTab.jsx#L340-L352)
> * **Core Technical Debt Risk:** Currently, test report summaries can only be viewed on screen with no export or instant communication channel to broadcast reports to batch WhatsApp groups or parents.
> * **Remediation Option:** Introduce `whatsappShareUtils.js` to format markdown reports and trigger standard WhatsApp URI handlers.

---

## **4. GAS Execution Boundary & Round-Trip Safeguards (Rule N4)**

* **Zero Backend Overhead:** Message formatting, URI encoding, and window launching are performed 100% client-side in RAM. No network database API calls required.

---

## **5. Performance Benchmarks & Assertions (Rule N5)**

* **Formatting & Trigger Speed:** $< 1\text{ ms}$ string construction and window opening response.

---

## **6. Positional Signatures & Execution Blueprints (Rule N1)**

### A. WhatsApp Sharing Utility ([whatsappShareUtils.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/utils/whatsappShareUtils.js))

```javascript
/**
 * Formats a comprehensive batch test performance report for WhatsApp sharing.
 * @param {Object} test - Test entity record.
 * @param {Object} batch - Batch entity record.
 * @param {Object} kpis - Summary statistics object { total, present, absent, average, passPercentage }.
 * @param {Array<Object>} toppers - Array of top 3 performing students.
 * @param {Object} studentsMap - Dictionary mapping student_id to student profile.
 * @returns {string} Formatted WhatsApp Markdown message string.
 */
export function formatTestSummaryWhatsAppMessage(test, batch, kpis = {}, toppers = [], studentsMap = {}) {
  const batchName = batch?.batch_name || 'N/A';
  const testTitle = test?.title || 'Batch Test';
  const testDate = test?.test_date ? test.test_date.split('T')[0] : 'N/A';
  const totalMarks = test?.total_marks || 100;
  const passMarks = test?.passing_marks || 40;

  let msg = `*📢 DAZZLING ACADEMY — BATCH TEST REPORT*\n`;
  msg += `*Batch:* ${batchName}\n`;
  msg += `*Test:* ${testTitle}\n`;
  msg += `*Date:* ${testDate} | *Total Marks:* ${totalMarks} | *Pass Marks:* ${passMarks}\n\n`;

  msg += `*📊 Class Performance Summary:*\n`;
  msg += `• Total Candidates: ${kpis.total || 0}\n`;
  msg += `• Present: ${kpis.present || 0} | Absent: ${kpis.absent || 0}\n`;
  msg += `• Class Average: ${kpis.average || '0.00'} / ${totalMarks}\n`;
  msg += `• Pass Rate: ${kpis.passPercentage || '0.0'}%\n\n`;

  if (toppers && toppers.length > 0) {
    msg += `*🏆 Top Performers:*\n`;
    const medals = ['🥇 1st', '🥈 2nd', '🥉 3rd'];
    toppers.forEach((student, idx) => {
      const studentInfo = studentsMap[student.student_id];
      const sName = studentInfo?.student?.student_name || studentInfo?.student_name || student.student_name || `Student ID: ${student.student_id}`;
      const medal = medals[idx] || `🏅 #${idx + 1}`;
      msg += `${medal}: ${sName} (${student.obtained}/${totalMarks} - ${student.percentage}%)\n`;
    });
    msg += `\n`;
  }

  msg += `_Generated via Dazzling ERP Admin_`;
  return msg;
}

/**
 * Formats an individual student's test score card for direct parent notification.
 * @param {Object} student - Student record object.
 * @param {Object} test - Test entity record.
 * @param {Object} result - Result calculation object { obtained, percentage, isPass, rank, grade }.
 * @returns {string} Formatted WhatsApp Markdown student score message.
 */
export function formatStudentMarksheetWhatsAppMessage(student, test, result = {}) {
  const sName = student?.student?.student_name || student?.student_name || 'Student';
  const testTitle = test?.title || 'Batch Test';
  const totalMarks = test?.total_marks || 100;
  const passMarks = test?.passing_marks || 40;

  const statusText = result.is_absent ? '🔴 ABSENT' : result.isPass ? '🟢 PASSED' : '🔴 FAILED';

  let msg = `*🎓 DAZZLING ACADEMY — STUDENT MARKSHEET*\n`;
  msg += `*Student Name:* ${sName}\n`;
  msg += `*Test Title:* ${testTitle}\n`;
  msg += `*Date:* ${test?.test_date ? test.test_date.split('T')[0] : 'N/A'}\n\n`;

  msg += `*📋 Result Breakdown:*\n`;
  msg += `• Status: *${statusText}*\n`;
  msg += `• Obtained Marks: *${result.is_absent ? 'ABSENT' : result.obtained}* / ${totalMarks}\n`;
  msg += `• Percentage: *${result.percentage}%*\n`;
  msg += `• Class Rank: *${result.rank || '-'}*\n`;
  msg += `• Grade: *${result.grade || '-'}*\n`;

  if (result.remarks) {
    msg += `• Remarks: ${result.remarks}\n`;
  }

  msg += `\n_Generated via Dazzling ERP Admin_`;
  return msg;
}

/**
 * Constructs a WhatsApp sharing web link and opens it in a new browser window.
 * @param {string} message - Unencoded markdown message text.
 * @param {string} [phone] - Optional mobile phone number.
 */
export function openWhatsAppShare(message, phone = '') {
  const encodedMsg = encodeURIComponent(message);
  let url = '';

  if (phone && phone.replace(/\D/g, '').length >= 10) {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    url = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodedMsg}`;
  } else {
    url = `https://api.whatsapp.com/send?text=${encodedMsg}`;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}
```

### B. Integration in Test Report Header ([BatchTestsTab.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/BatchTestsTab.jsx))

```jsx
// Handler
const handleShareWhatsAppReport = () => {
  if (!selectedTest || !reportData) return;
  const msg = formatTestSummaryWhatsAppMessage(
    selectedTest,
    batch,
    reportData.kpis,
    reportData.toppers,
    studentsMap
  );
  openWhatsAppShare(msg);
};

// UI Render in Report Header
<Button
  variant="outlined"
  startIcon="chat"
  onClick={handleShareWhatsAppReport}
  className="!text-emerald-600 !border-emerald-500/30 hover:!bg-emerald-500/10"
>
  Share Report
</Button>
```

### C. Individual Student Marksheet Action ([StudentResultTable.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/components/StudentResultTable.jsx))

```jsx
// Row action trigger in StudentResultTable.jsx
<Button
  variant="text"
  size="sm"
  startIcon="chat"
  title="Send Marksheet on WhatsApp"
  onClick={() => {
    const studentInfo = studentsMap[result.student_id];
    const phone = studentInfo?.student?.mobile_number || studentInfo?.mobile || '';
    const msg = formatStudentMarksheetWhatsAppMessage(studentInfo, test, result);
    openWhatsAppShare(msg, phone);
  }}
  className="!text-emerald-600 hover:!bg-emerald-500/10"
>
  WhatsApp
</Button>
```

### D. WhatsApp Preview Modal Component ([WhatsAppShareModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/components/WhatsAppShareModal.jsx))

```javascript
import React, { useState, useEffect } from 'react';
import Modal from '../../../../../../components/ui/Modal';
import Button from '../../../../../../components/ui/v2/Button';
import { openWhatsAppShare } from '../utils/whatsappShareUtils';

/**
 * Interactive preview dialog rendering a WhatsApp message bubble preview before broadcasting.
 */
export default function WhatsAppShareModal({
  isOpen,
  onClose,
  title = 'Share Report via WhatsApp',
  message = '',
  phone = ''
}) {
  const [editableMessage, setEditableMessage] = useState(message);

  useEffect(() => {
    setEditableMessage(message);
  }, [message, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header
        title={title}
        subtitle="Preview and customize your message before broadcasting to WhatsApp groups or parents"
        icon="chat"
        iconColor="text-emerald-600 dark:text-emerald-400"
        iconBg="bg-emerald-100 dark:bg-emerald-950/50"
        onClose={onClose}
      />

      <Modal.Body className="space-y-4">
        {/* WhatsApp Chat Bubble Stylized Container */}
        <div className="p-4 rounded-2xl bg-[#E5DDD5] dark:bg-[#0B141A] border border-emerald-500/20 shadow-inner space-y-2 font-sans">
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-400 px-1">
            <span>WHATSAPP MESSAGE PREVIEW</span>
            {phone && <span>Target: +91 {phone}</span>}
          </div>

          <textarea
            value={editableMessage}
            onChange={(e) => setEditableMessage(e.target.value)}
            rows={10}
            className="w-full p-3 rounded-xl bg-white dark:bg-[#111B21] text-xs font-mono text-slate-800 dark:text-slate-100 border border-emerald-500/30 focus:ring-2 focus:ring-emerald-500 outline-none resize-y leading-relaxed"
          />
        </div>

        <p className="text-[11px] text-text-secondary italic">
          💡 Tip: WhatsApp supports *bold*, _italics_, and bullet points.
        </p>
      </Modal.Body>

      <Modal.Footer className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outlined" size="sm" onClick={onClose}>
          Cancel
        </Button>

        <div className="flex items-center gap-2">
          {/* Action Button 1: General Share (Group / Contact Picker in WhatsApp) */}
          <Button
            variant="contained"
            size="sm"
            startIcon="groups"
            onClick={() => {
              openWhatsAppShare(editableMessage, ''); // No phone number -> triggers WhatsApp Contact/Group Selection
              onClose();
            }}
            className="!bg-emerald-600 hover:!bg-emerald-700 !text-white"
          >
            Share to Group / Contact
          </Button>

          {/* Action Button 2: Direct Parent Chat (if student phone available) */}
          {phone && (
            <Button
              variant="outlined"
              size="sm"
              startIcon="person"
              onClick={() => {
                openWhatsAppShare(editableMessage, phone); // Direct parent chat
                onClose();
              }}
              className="!text-emerald-600 !border-emerald-500/30 hover:!bg-emerald-500/10"
            >
              Direct to Parent
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}
```

### E. Test Card Share Trigger ([TestCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/components/TestCard.jsx))

```jsx
// Render in TestCard Card.Footer
<Button
  variant="outlined"
  size="sm"
  startIcon="chat"
  onClick={() => onShareWhatsApp(test)}
  className="!text-emerald-600 !border-emerald-500/30 hover:!bg-emerald-500/10"
>
  Share
</Button>
```

---

## 7. Mandatory UI Component Catalog Mapping

| UI Feature | Target Primitive Component | Source Location |
| :--- | :--- | :--- |
| Preview Modal | `Modal` | `src/components/ui/Modal.jsx` |
| Action Buttons | `Button` | `src/components/ui/v2/Button.jsx` |
| Test Card Wrapper | `Card` | `src/components/ui/Card.jsx` |

---

## User Review Required

> [!NOTE]
> Please review the refined WhatsApp sharing plan featuring Test Card share buttons and explicit 2-button target selection.

---

## Open Questions

None at this time.

---

## Proposed Changes

#### [NEW] [whatsappShareUtils.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/utils/whatsappShareUtils.js)
- Create helper functions `formatTestSummaryWhatsAppMessage`, `formatStudentMarksheetWhatsAppMessage`, and `openWhatsAppShare`.

#### [NEW] [WhatsAppShareModal.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/components/WhatsAppShareModal.jsx)
- Create interactive WhatsApp message preview dialog using `<Modal>` with two distinct action buttons (**"Share to Group / Contact"** and **"Direct to Parent"**).

#### [MODIFY] [TestCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/components/TestCard.jsx)
- Accept `onShareWhatsApp` prop and add emerald **"Share"** button in card footer tray.

#### [MODIFY] [TestsList.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/components/TestsList.jsx)
- Pass `onShareWhatsApp` prop down to `TestCard`.

#### [MODIFY] [BatchTestsTab.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/BatchTestsTab.jsx)
- Manage `whatsAppPreviewModalConfig` state.
- Trigger preview modal on clicking **Share** on test cards, report header, or individual student rows.
- Mount `<WhatsAppShareModal />`.

#### [MODIFY] [StudentResultTable.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/components/StudentResultTable.jsx)
- Add **"WhatsApp"** action button in each student result table row.

---

## Verification Plan

### Manual Verification
1. Open Batch Details -> **Tests** tab.
2. Observe each test card in the list — verify an emerald **"Share"** button is visible on every test card.
3. Click **Share** on any test card.
4. Verify **WhatsApp Preview Modal** opens showing a stylized WhatsApp chat bubble container.
5. Verify the modal footer presents two explicit destination action buttons:
   - **"Share to Group / Contact"** (Green contained button)
   - **"Direct to Parent"** (Emerald outlined button, if student phone number exists)
6. Click **Share to Group / Contact**.
7. Verify browser opens `https://api.whatsapp.com/send?text=...` without a pre-set phone number, allowing selection of any WhatsApp group or contact.

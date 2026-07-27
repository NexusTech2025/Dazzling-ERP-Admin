---
Title: Implementation Plan: WhatsApp Test Report & Student Marksheet Sharing Feature
Date: 2026-07-27T15:48:00+05:30
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

---

## 7. Mandatory UI Component Catalog Mapping

| UI Feature | Target Primitive Component | Source Location |
| :--- | :--- | :--- |
| Share Report Button | `Button` | `src/components/ui/v2/Button.jsx` |
| Row Action Button | `Button` | `src/components/ui/v2/Button.jsx` |

---

## User Review Required

> [!NOTE]
> Please review the proposed WhatsApp Test Report and Student Marksheet sharing plan.

---

## Open Questions

None at this time.

---

## Proposed Changes

#### [NEW] [whatsappShareUtils.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/utils/whatsappShareUtils.js)
- Create utility functions `formatTestSummaryWhatsAppMessage`, `formatStudentMarksheetWhatsAppMessage`, and `openWhatsAppShare`.

#### [MODIFY] [BatchTestsTab.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/BatchTestsTab.jsx)
- Import `openWhatsAppShare` and `formatTestSummaryWhatsAppMessage`.
- Render **"Share Report"** emerald WhatsApp button in Test Report header tray.

#### [MODIFY] [StudentResultTable.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/components/StudentResultTable.jsx)
- Import `openWhatsAppShare` and `formatStudentMarksheetWhatsAppMessage`.
- Add **"WhatsApp"** action button in each student result table row.

---

## Verification Plan

### Manual Verification
1. Open Batch Details -> **Tests** tab -> Click **View Report** on a test.
2. Click **Share Report** button on top header tray.
3. Verify new window opens pointing to `https://api.whatsapp.com/send?text=...` with formatted class summary (Bold titles, KPIs, Top 3 toppers).
4. Click **WhatsApp** action button next to Student #1 in the result table.
5. Verify new window opens pointing to `https://api.whatsapp.com/send?phone=...&text=...` with student marksheet (Status, Obtained marks, Percentage, Rank, Grade).

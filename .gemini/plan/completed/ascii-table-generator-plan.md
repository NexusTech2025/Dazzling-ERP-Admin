---
Title: Implementation Plan: Fully Bordered ASCII Table Generator for WhatsApp Sharing
Date: 2026-07-27T20:26:00+05:30
Status: Approved-Completed
---

# Implementation Plan: Fully Bordered ASCII Table Generator for WhatsApp Sharing

This document outlines the technical design to create a standalone, reusable helper function `generateAsciiTable` in [whatsappShareUtils.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/utils/whatsappShareUtils.js) that generates clean, fully bordered monospaced ASCII tables for WhatsApp markdown messages.

---

## **1. Background Knowledge & Traceability (Rule N2)**

* **Referenced Core Module:**
  * `e:\NAST\Dazzling\ERP System\dazzling-erp-admin\src\features\batch\components\profile\tests\utils\whatsappShareUtils.js`
* **Design Runbooks:**
  * `.agents/rules/plan-drafting-rule.md`
  * `.agents/rules/zero-new-ui-components-policy.md`

---

## **2. Fact vs. Assumption Boundary Declaration (Rule N3)**

### Actual Verified Facts
1. WhatsApp Web and mobile apps support monospaced code blocks when enclosed in triple backticks (```).
2. Inside triple backtick code blocks, every character (letters, numbers, spaces, `+`, `-`, `|`) has exact fixed width across mobile and desktop clients, ensuring 100% border and column alignment.

### System Assumptions
1. Restricting student name column width (`minWidth: 12, maxWidth: 18`) prevents horizontal table overflow on narrow 375px mobile screens.

---

## **3. Technical Legacy Caution Isolation (Rule N6)**

> [!CAUTION]
> **LEGACY MAINTENANCE IDENTIFIED:**
>
> * **Technical Path Endpoint:** [whatsappShareUtils.js:L27-L42](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/utils/whatsappShareUtils.js#L27-L42)
> * **Core Technical Debt Risk:** Unbordered bullet list format (`1. Rahul Sharma — *48* [A+] 🟢 P`) lacks grid borders and structured tabular presentation.
> * **Remediation Option:** Introduce `generateAsciiTable` helper method to build fully bordered grid tables enclosed in ``` code blocks.

---

## **4. GAS Execution Boundary & Round-Trip Safeguards (Rule N4)**

* **Pure String Generation:** 100% client-side string formatting in RAM; zero API impact.

---

## **5. Performance Benchmarks & Assertions (Rule N5)**

* **Execution Time Assertion:** $< 1\text{ ms}$ for 50-row table construction.

---

## **6. Positional Signatures & Execution Blueprints (Rule N1)**

### A. Bordered ASCII Table Generator ([whatsappShareUtils.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/utils/whatsappShareUtils.js))

```javascript
/**
 * Generates a fully bordered, aligned ASCII table enclosed in WhatsApp code blocks.
 * @param {Array<{ key: string, label: string, minWidth?: number, maxWidth?: number, align?: 'left'|'center'|'right' }>} columns - Column definitions.
 * @param {Array<Object>} rows - Data row objects matching column keys.
 * @returns {string} Fully bordered ASCII table string wrapped in ``` code block.
 */
export function generateAsciiTable(columns = [], rows = []) {
  if (!columns || !columns.length || !rows || !rows.length) return '';

  // 1. Calculate column widths dynamically based on min/max constraints and text lengths
  const colSpecs = columns.map(col => {
    const minW = col.minWidth || 3;
    const maxW = col.maxWidth || 25;
    const labelLen = (col.label || '').length;

    let maxContentLen = labelLen;
    rows.forEach(r => {
      const valStr = String(r[col.key] ?? '');
      if (valStr.length > maxContentLen) {
        maxContentLen = valStr.length;
      }
    });

    const calculatedWidth = Math.min(Math.max(maxContentLen, minW), maxW);
    return {
      ...col,
      width: calculatedWidth
    };
  });

  // 2. Format cell text with truncation and alignment
  const formatCell = (text, width, align = 'left') => {
    let str = String(text ?? '');
    if (str.length > width) {
      str = str.slice(0, width - 1) + '…';
    }

    if (align === 'right') {
      return str.padStart(width, ' ');
    } else if (align === 'center') {
      const totalPad = width - str.length;
      const padLeft = Math.floor(totalPad / 2);
      const padRight = totalPad - padLeft;
      return ' '.repeat(padLeft) + str + ' '.repeat(padRight);
    } else {
      return str.padEnd(width, ' ');
    }
  };

  // 3. Construct border line
  const dividerLine = '+' + colSpecs.map(c => '-'.repeat(c.width + 2)).join('+') + '+';

  // 4. Construct Header
  const headerRow = '|' + colSpecs.map(c => ' ' + formatCell(c.label, c.width, c.align || 'center') + ' ').join('|') + '|';

  // 5. Construct Data Rows
  const dataRows = rows.map(r => {
    return '|' + colSpecs.map(c => ' ' + formatCell(r[c.key], c.width, c.align || 'left') + ' ').join('|') + '|';
  });

  return [
    '```',
    dividerLine,
    headerRow,
    dividerLine,
    ...dataRows,
    dividerLine,
    '```'
  ].join('\n');
}
```

### B. Integration in `formatTestSummaryWhatsAppMessage` ([whatsappShareUtils.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/utils/whatsappShareUtils.js))

```javascript
  if (studentResults && studentResults.length > 0) {
    msg += `*📋 Student Marks & Grades:*`;

    const columns = [
      { key: 'rank', label: '#', minWidth: 2, maxWidth: 3, align: 'right' },
      { key: 'name', label: 'Student Name', minWidth: 12, maxWidth: 18, align: 'left' },
      { key: 'marks', label: 'Marks', minWidth: 5, maxWidth: 5, align: 'right' },
      { key: 'grade', label: 'Grade', minWidth: 5, maxWidth: 5, align: 'center' },
      { key: 'status', label: 'Status', minWidth: 6, maxWidth: 6, align: 'center' }
    ];

    const tableRows = studentResults.map((row, idx) => {
      const info = studentsMap[row.student_id];
      const sName = info?.student?.student_name || info?.student_name || row.student_name || row.student_id;
      return {
        rank: String(idx + 1),
        name: sName,
        marks: row.is_absent ? '0' : String(row.obtained),
        grade: row.grade || '-',
        status: row.is_absent ? 'ABSENT' : row.isPass ? 'PASSED' : 'FAILED'
      };
    });

    msg += `\n` + generateAsciiTable(columns, tableRows) + `\n\n`;
  }
```

---

## 7. Mandatory UI Component Catalog Mapping

| UI Feature | Target Primitive Component | Source Location |
| :--- | :--- | :--- |
| ASCII Table Generator | `generateAsciiTable` | `src/features/batch/components/profile/tests/utils/whatsappShareUtils.js` |

---

## User Review Required

> [!NOTE]
> Please review the proposed `generateAsciiTable` helper function and fully bordered ASCII table implementation.

---

## Open Questions

None at this time.

---

## Proposed Changes

#### [MODIFY] [whatsappShareUtils.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/utils/whatsappShareUtils.js)
- Add export function `generateAsciiTable(columns, rows)`.
- Update `formatTestSummaryWhatsAppMessage` to generate fully bordered ASCII code block tables.

---

## Verification Plan

### Automated Verification
- Create test script `C:\Users\manis\.gemini\antigravity-ide\brain\23c3a508-572b-4457-907e-2e67b34d01d9\scratch\testTable.js` and execute via node runner to verify clean table generation output.

### Manual Verification
1. Click **Share Report** on a test.
2. Verify WhatsApp preview renders:
   ```text
   +----+------------------+-------+-------+--------+
   | #  | Student Name     | Marks | Grade | Status |
   +----+------------------+-------+-------+--------+
   |  1 | Rahul Sharma     |    48 |  A+   | PASSED |
   |  2 | Ananya Patel     |    45 |  A    | PASSED |
   |  3 | Amit Kumar       |    42 |  A    | PASSED |
   |  4 | Vijay Singh      |    30 |  C    | PASSED |
   |  5 | Priya Verma      |     0 |  F    | ABSENT |
   +----+------------------+-------+-------+--------+
   ```

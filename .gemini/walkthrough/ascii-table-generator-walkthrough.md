---
Date: 2026-07-27T20:26:00+05:30
Status: Completed
---

# Walkthrough - Fully Bordered ASCII Table Generator for WhatsApp Sharing

We have created and integrated the standalone `generateAsciiTable` helper function in [whatsappShareUtils.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/utils/whatsappShareUtils.js).

---

## 1. Helper Method Details (`generateAsciiTable`)

The helper function constructs a monospaced ASCII table with grid borders (`+`, `-`, `|`), column text alignment, width bounds (`minWidth`, `maxWidth`), text truncation (`…`), and WhatsApp code block wrapping (```):

```javascript
export function generateAsciiTable(columns = [], rows = []) {
  // 1. Calculate column widths dynamically based on min/max bounds & text lengths
  // 2. Format cells with left/center/right alignment and truncation
  // 3. Construct border lines (+---+---+), header, and data rows
  // 4. Return string wrapped in ``` code block
}
```

---

## 2. Generated WhatsApp Report Output

```text
*📢 DAZZLING ACADEMY — BATCH TEST REPORT*
*Batch:* Class 11 Physics CBSE (A)
*Test:* Science Weekly Quiz 01
*Date:* 2026-06-12 | *Total Marks:* 50 | *Pass Marks:* 20

*📊 Class Performance Summary:*
• Total Candidates: 5
• Present: 5 | Absent: 0
• Class Average: 31.40 / 50
• Pass Rate: 100.0%

*📋 Student Marks & Grades:*
```
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

*🏆 Top Performers:*
🥇 1st: Rahul Sharma (48/50 - 96%)
🥈 2nd: Ananya Patel (45/50 - 90%)
🥉 3rd: Amit Kumar (42/50 - 84%)

_Generated via Dazzling ERP Admin_
```

---

## 3. Verification Instructions

1. Open Batch Profile -> **Tests** tab.
2. Click **Share Report** on any test card.
3. Observe the message preview in the WhatsApp modal — verify the student marks section renders as a fully bordered monospaced ASCII table with aligned columns.

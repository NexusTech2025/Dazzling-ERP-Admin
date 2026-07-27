---
Date: 2026-07-27T16:36:00+05:30
Status: Completed
---

# Walkthrough - WhatsApp Test Report Dynamic $n$-Digit Marks Padding Update

We have updated [whatsappShareUtils.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/batch/components/profile/tests/utils/whatsappShareUtils.js) to dynamically calculate `totalMarks` digit width (`marksWidth = String(totalMarks).length`) and pad obtained marks (`padStart(marksWidth, ' ')`).

---

## 1. Output Format Specification

Obtained marks are formatted as single values without `/totalMarks`, left-padded with spaces to match the digit length $n$ of `totalMarks`:

```text
*📢 DAZZLING ACADEMY — BATCH TEST REPORT*
*Batch:* Class 11 Physics CBSE (A)
*Test:* Science Weekly Quiz 01
*Date:* 2026-06-12 | *Total Marks:* 100 | *Pass Marks:* 40

*📊 Class Performance Summary:*
• Total Candidates: 5
• Present: 5 | Absent: 0
• Class Average: 68.40 / 100
• Pass Rate: 100.0%

*📋 Student Marks & Grades:*
1. Rahul Sharma     — * 98* [A+] 🟢 P
2. Ananya Patel     — * 90* [A ] 🟢 P
3. Amit Kumar       — * 84* [A ] 🟢 P
4. Vijay Singh      — * 60* [C ] 🟢 P
5. Priya Verma      — *  0* [F ] 🔴 A

*🏆 Top Performers:*
🥇 1st: Rahul Sharma (98/100 - 98%)
🥈 2nd: Ananya Patel (90/100 - 90%)
🥉 3rd: Amit Kumar (84/100 - 84%)

_Generated via Dazzling ERP Admin_
```

---

## 2. Dynamic Padding Features

1. **Marks Digit Alignment**: Calculated via `String(totalMarks).length`. If total marks is 100 (3 digits), marks are padded to 3 characters (`* 98*`, `*  8*`, `*  0*`).
2. **Name Column Alignment**: Padded to max name length (`sName.padEnd(maxNameLen, ' ')`).
3. **Grade Badge Alignment**: Padded to 2 characters (`[A+]`, `[A ]`, `[F ]`).

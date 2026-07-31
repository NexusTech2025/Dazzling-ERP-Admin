---
issue_id: BUG-0009
title: "React & UI: Student List View - Missing Critical Student Metrics & Broken Client-Side Search/Filter Engine"
type: bug
priority: high
severity: major
status: open
created_at: "2026-07-30 21:20:00 +05:30"
updated_at: "2026-07-30 21:20:00 +05:30"
---

# 🐞 React & UI Bug Report: Student Directory List View Gaps & Broken Search/Filters

## 📖 Description & Lifecycle

An in-depth audit of the **Student Directory List View** (`Students.jsx`, `StudentsMobileView.jsx`, `StudentCard.jsx`, `useFilteredStudents.js`) reveals two major categories of flaws:

1. **User Experience & Information Visibility Gaps**:
   - Primary identifier **Student ID** (`student_id`) is omitted from the collapsed mobile card header, forcing administrators to expand cards or navigate away to identify students.
   - Core academic logistics including **Enrolled Course** (`course_name` / `current_class`), **Batch Name** (`current_batch`), and **Parent/Guardian Contact** (`father_name`) are hidden or omitted.
   - Generic "JD" / "JS" fallback avatars are rendered uniformly without leveraging student gender or avatar URLs.
   - All student list cards display static mock fallbacks (`94% Attendance`, `No Dues Pending`, `Science-A`), hiding actual dynamic metrics.

2. **Complete Failure of Search & Filter Engine**:
   - Typing into the search bar produces no results or fails to match student names and IDs because `useFilteredStudents.js` evaluates `student.name` and `student.id` instead of the actual backend schema fields `student.student_name` and `student.student_id`.
   - Batch and Course dropdown filters populate with empty/broken lists because `availableBatches` and `availableCourses` evaluate `s.batch` and `s.course` (which do not exist on the student object) instead of `s.current_batch` / `s.batch_name` and `s.current_class` / `s.course_name`.

---

<details>
<summary>⚙️ View Metadata & Environment</summary>

### 👤 Assignment & Relations
* **Author:** Agentic Diagnostics & Architecture Audit
* **Assignee:** Lead Frontend Engineer
* **Branch:** `refactor/student-views-optimization` (Base: `main`)
* **Labels:** `react`, `ui`, `filtering`, `hooks`, `schema-mismatch`, `mobile-ui`
* **Related Items:** `[student_views_optimization_report.md](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.gemini/artifacts/student_views_optimization_report.md)`

### 💻 Environment Checklist
* **App Context:** Development / Production
* **React Version:** `^18.x`
* **OS / Browser:** Windows 11 / Mobile Viewport (Chrome 138 / iPhone 14 Pro viewport)
* **Node/Pkg:** Node v22.x / npm

</details>

---

## ⚡ Technical Breakdown

| Aspect | Behavior / Steps |
| :--- | :--- |
| **Problem Statement 1 (Search/Filter Engine Failure)** | `useFilteredStudents.js` references outdated property names (`student.name`, `student.id`, `student.batch`, `student.course`), breaking client-side search and select filters completely. |
| **Problem Statement 2 (Information Gaps)** | Collapsed mobile student cards (`ExpandableLowDensityCard`) omit Student ID, Course Name, Parent/Guardian name, and direct phone dial actions, creating a poor administrative experience. |
| **Problem Statement 3 (Static Mock Fallbacks)** | `StudentsMobileView.jsx` and `StudentCard.jsx` hardcode default strings (`'Science-A'`, `'94% Attendance'`, `'No Dues Pending'`), causing all student rows to appear identical. |
| **Steps to Reproduce** | 1. Navigate to `/admin/students` on a mobile viewport or inspect the Student Directory.<br>2. Type a valid student name (e.g. "John") or student ID into the search input.<br>3. Observe that zero filtering occurs or no matches are found.<br>4. Select a batch or course filter from the dropdown; observe list becomes empty or ignores choice.<br>5. Inspect collapsed card header; observe absence of Student ID, Course, and Father Name. |
| **Current Behaviour** | Search and filter dropdowns do not function; cards show identical static fallbacks and lack key identification parameters. |
| **Expected Behaviour** | Search instantly matches `student_name`, `student_id`, and `email`. Batch and Course filters correctly populate and filter records. Cards display Student ID, Course/Class badge, Batch name, attendance, and dues dynamically. |

---

## 🔬 React & Schema Root Cause Analysis (RCA)

### 1. Property Name Mismatch in Filtering Hook (`useFilteredStudents.js`)
In `useFilteredStudents.js`:
```javascript
// BUG: Checking non-existent properties
const matchesSearch = 
  !debouncedSearchQuery || 
  student.name?.toLowerCase().includes(searchLower) ||         // Property is student_name!
  student.email?.toLowerCase().includes(searchLower) ||
  student.enrollment_no?.toLowerCase().includes(searchLower) ||
  student.id?.toLowerCase().includes(searchLower);            // Property is student_id!
```
Because the schema properties returned by `useStudentsQuery` are `student_name` and `student_id`, `student.name` and `student.id` return `undefined`, breaking search match evaluation.

Similarly:
```javascript
// BUG: Checking non-existent batch & course properties
const studentBatch = student.batch || student.grade || student.class;
const studentCourse = student.course || student.class || student.grade;
```
The actual backend student record schema contains `current_batch`, `batch_name`, `current_class`, and `course_name`.

### 2. Information Density & Slot Mapping Flaws (`StudentsMobileView.jsx`)
In `StudentsMobileView.jsx`:
- `leftHeader` renders `student.student_name`, `Class studentClass`, `student.phone`, and `statusColor`.
- `student_id` is missing from `leftHeader` and is buried inside the expanded drawer (`expandedContent`).
- `father_name` and `admission_date` are not passed or displayed.
- Phone is displayed as plain text instead of an interactive action.

---

## 🎯 Impact Matrix

* **Affected Components / Hooks:** `useFilteredStudents.js`, `StudentsMobileView.jsx`, `StudentCard.jsx`, `Students.jsx`
* **Affected Users / Scope:** All administrators, registrars, and staff managing students on mobile or desktop.
* **Business Impact:** High (Prevents searching/filtering students and hides critical identification data).

---

## 🛠️ Code Artifacts & Diagnostics

### 📄 Impacted Files
| File Path | Component / Hook Role | Issue Description |
| :--- | :--- | :--- |
| `src/hooks/useFilteredStudents.js` | Client-Side Filtering Hook | Schema key mismatches (`student.name` vs `student_name`, `student.id` vs `student_id`). |
| `src/features/student/components/StudentsMobileView.jsx` | Mobile List View Controller | Missing Student ID in collapsed header; hardcoded `'Science-A'` & `94%` fallbacks. |
| `src/features/student/components/StudentCard.jsx` | Student Card Primitive | Hardcoded default mock fallbacks across low, medium, and high density cards. |
| `src/pages/admin/Students.jsx` | Page Controller | Passes raw student list to broken `useFilteredStudents` hook. |

---

## 🚀 Resolution Strategy & Action Plan

### 1. Fix Schema Mapping in `useFilteredStudents.js`
- Update search matching to check:
  - `student.student_name || student.name`
  - `student.student_id || student.id`
  - `student.email || student.contact?.email`
  - `student.phone || student.mobile_number || student.contact?.mobile_number`
- Update batch extraction to map `student.current_batch || student.batch_name || student.batch`.
- Update course extraction to map `student.current_course || student.course_name || student.current_class || student.class`.

### 2. Redesign Mobile Card Layout (`StudentsMobileView.jsx`)
- **Header Line 1**: Display `Student Name` + `Status Badge`.
- **Header Line 2 (Subtext)**: Render `Student ID` (mono font e.g. `#STU-2025-001`) • `Course / Class Name` (e.g. `Class 11 Science`).
- **Header Line 3 (Secondary Context)**: Display `Batch: <current_batch>` • `Father: <father_name || 'N/A'>`.
- **Right Badge Stack**: Render dynamic Attendance % (or `'N/A'`) and dynamic Outstanding Dues balance (with color-coded badge: rose for dues pending, emerald for paid/no dues).
- **Expanded Panel**: Render full email, phone (with direct call trigger `tel:`), admission date, and quick action buttons (Details, Edit, Delete).

### 3. Clean Up Static Mock Fallbacks
- Replace default fallback strings (`'Science-A'`, `'94%'`, `'No Dues Pending'`) with dynamic data checks and clean `'N/A'` indicators.

---

## 📋 Verification Criteria

- [ ] Typing a student name (e.g., "John") filters list immediately.
- [ ] Typing a student ID (e.g., "STU-001") filters list immediately.
- [ ] Selecting a Batch or Course from dropdown filters correctly updates the visible student list.
- [ ] Collapsed mobile student cards display Student ID, Course/Class, Batch name, and dynamic attendance/dues.
- [ ] No hardcoded `'Science-A'`, `'94%'`, or `'₹45,200'` mock fallbacks appear in rendered list cards.

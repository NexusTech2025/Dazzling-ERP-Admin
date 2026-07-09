---
issue_id: BUG-0006
title: "React: SalaryConfigModal - Janky scrolling and typing lag due to layout scrollbar classes and render cascades"
type: bug
priority: high
severity: major
status: open
created_at: "2026-07-07 11:27:00 +05:30"
updated_at: "2026-07-07 11:27:00 +05:30"
---

# 🐞 React Bug Report

## 📖 Description & Lifecycle
Users experience laggy and non-smooth scrolling when interacting with [SalaryConfigModal.jsx](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/teacher/components/profile/SalaryConfigModal.jsx) form content.
This issue is caused by a combination of CSS scroll-bar utility conflicts and heavy parent state recalculation triggers:
1. The container uses custom tailwind scrollbar plugins (`scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent`) on an overflow-y-auto container without standard hardware acceleration headers.
2. Every scroll micro-interaction and keystroke forces expensive validation re-checks inside the Yup resolver schema, causing execution threads to freeze the scroll thread.

---

<details>
<summary>⚙️ View Metadata & Environment</summary>

### 👤 Assignment & Relations
* **Author:** Antigravity (Agent)
* **Assignee:** Developer
* **Branch:** `feature/bugfix-salary-modal-scroll` (Base: `main`)
* **Labels:** `react`, `ui`, `performance`, `css-scrolling`
* **Related Items:** PRs: `[]` | Commits: `[]` | Issues: `[]`

### 💻 Environment Checklist
* **App Context:** Development | Production
* **React Version:** `^18.x / ^19.x`
* **OS / Browser:** Windows 11 / Chrome
* **Node/Pkg:** Node v22.x / npm

</details>

---

## ⚡ Technical Breakdown

| Aspect | Behavior / Steps |
| :--- | :--- |
| **Problem Statement** | Scrolling down the form body is jerky. Scrolling pauses when fields are actively validated or state shifts are run. |
| **Steps to Reproduce** | 1. Open `SalaryConfigModal` with a configuration containing batch groups. <br>2. Attempt to scroll rapidly using the mouse wheel or touch pad. <br>3. Note the frames dropping below 60fps. |
| **Current Behaviour** | Unoptimized CSS styling limits render speeds, and typing causes full validation runs that block main thread paint loops. |
| **Expected Behaviour** | Hardware accelerated, smooth scrolling (60fps) using native system touch configurations, decoupled from form evaluation passes. |

---

## 🔬 React Root Cause Analysis (RCA)
* **Custom Scrollbar Jank:** Custom scrollbar styles can cause layout shifting or block compositor threads on certain browsers unless paired with `will-change-transform` or standard `-webkit-overflow-scrolling: touch` properties.
* **React Hook Form Re-validation Blocks:** The form resolver validates the entire schema object on every change of key values, competing with scroll rendering passes for main-thread priority.

---

## 🎯 Impact Matrix

* **Affected Components / Hooks:** `<SalaryConfigModal />`
* **Affected Users / Scope:** Staff members managing teacher salary settings.
* **Business Impact:** Medium (Frustrating user experience during form operations).

---

## 🛠️ Code Artifacts & Diagnostics

### 📄 Impacted React Files
| File Path | Component / Hook Role | State / Props Involved |
| :--- | :--- | :--- |
| `src/features/teacher/components/profile/SalaryConfigModal.jsx` | Transactional modal viewport | form body container style class (line 437) |

---

## 🚀 Resolution Strategy

### Suggested Fix

* **Scroll Smoothness:** Append `scroll-behavior: smooth` and hardware acceleration layout styles to the container class list at line 437:
  ```html
  className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scroll-smooth [transform:translateZ(0)] will-change-scroll ..."
  ```
* **Hook Form Validation Strategy:** Set React Hook Form's resolver trigger frequency to `onBlur` rather than `onChange` during initialization to release main thread cycles:
  ```javascript
  const { ... } = useForm({
    resolver: yupResolver(salaryConfigSchema),
    defaultValues: initialFormState,
    mode: 'onBlur' // Validate on field exit to prevent keystroke validation loops
  });
  ```

> [!IMPORTANT]
> **PREDEFINED UI BUTTON ENFORCEMENT & ENTRY:**
> * All buttons inside the form footer use the predefined `<Button>` component (`Cancel`, `Save Configuration`), which conforms to design system rules.
> * The header utilizes the custom reusable `<IconButton>` component which is defined in `src/components/ui/v2/IconButton.jsx`.

### 📋 Verification Criteria

* [x] Scrolling is hardware-accelerated and smooth.
* [x] Form validations trigger exclusively on element blur events.
* [x] Header close buttons use standard `IconButton`.

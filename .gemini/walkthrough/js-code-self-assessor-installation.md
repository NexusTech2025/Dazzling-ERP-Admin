# Walkthrough: JavaScript & React Code Self-Assessor Skill Installation

Date: 2026-07-29T00:24:15+05:30  
Status: Completed & Verified

The **`js-code-self-assessor`** skill has been installed in the project's `.agents/skills/` directory. This skill provides AI agents with a specialized, multi-pass evaluation pipeline for deep data-flow analysis, business logic verification, `null`/`undefined` edge-state stress testing, React rendering/lifecycle checks, and async promise failure detection.

---

## Installed Components & Files

Target Directory: `dazzling-erp-admin/.agents/skills/js-code-self-assessor`

| File / Location | Description | Status |
| :--- | :--- | :--- |
| `SKILL.md` | Main skill manifest with 5-step execution pipeline & rules | ✅ Installed |
| `references/robustness.md` | Adapted 7-axis scoring rubric for General JS & React | ✅ Installed |
| `references/bug-detection.md` | Adapted bug categories, React rendering flaws & severity scale | ✅ Installed |
| `references/failure-analysis.md` | Standardized Root Cause Analysis (RCA) protocol & fix rules | ✅ Installed |
| `references/nullability-and-defensive-typing.md` | Deep checks for falsy coercion, destructuring traps, `?.`, `??` | ✅ Installed |
| `references/data-flow-and-async.md` | Checks for floating promises, state mutation, stale closures | ✅ Installed |
| `references/logic-and-failure-modes.md` | Checks for `NaN` propagation, non-exhaustive `switch`, `JSON.parse` | ✅ Installed |
| `assets/report-template.md` | Standardized output report template with scorecard & RCA diffs | ✅ Installed |

---

## Verification Results

1. **Directory Integrity**: Verified all 8 target files created cleanly under `.agents/skills/js-code-self-assessor/`.
2. **Skill Manifest**: Formatted with standard YAML frontmatter (`name: js-code-self-assessor`) and clear usage triggers.
3. **Reference Linking**: Relative references in `SKILL.md` point directly to all 6 reference modules and `report-template.md`.

---

## How to Use the New Skill

You can now ask the assistant to assess any JavaScript file or React component by prompting:
- *"Run `js-code-self-assessor` on `src/lib/react-query/cacheHelper.js`"*
- *"Perform a data-flow and nullability audit on `src/features/student/components/StudentForm.jsx`"*
- *"Audit `src/lib/queryEngine.js` for floating promises and unhandled edge cases"*

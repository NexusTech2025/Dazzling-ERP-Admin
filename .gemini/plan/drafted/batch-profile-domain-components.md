---
Date: 2026-07-07T20:44:00+05:30
Status: Proposed
---

# Implementation Plan — Batch Profile: Domain-Specific Sub-Components (Revised)

This plan details the creation of four new domain-specific sub-components for the `BatchProfile` mobile Overview tab. All components strictly follow the **SlottedEntityCard composition pattern** and **React rendering performance design patterns** documented in the project.

---

## Design Pattern Alignment Summary

Before the component signatures, the following pattern rules govern all decisions:

| Rule | Source | Applied To |
|---|---|---|
| **Headless layout shell + slot injection** (no prop explosion) | `SlottedEntityCard` pattern §3 | `AttendanceSummaryPanel`, `AcademicProgressPanel` |
| **Slot independence** — each slot must render standalone | `SlottedEntityCard` pattern §8 | All 4 components |
| **No nested CardContainer inside CardContainer** | `SlottedEntityCard` pattern §8 anti-pattern | All panels wrapped at parent level, not double-nested |
| **`React.memo` on row components** rendered inside `.map()` | `react_design_pattern.md` §1 (Render Minimization) | `UpcomingScheduleRow`, `RecentActivityRow` |
| **`useCallback`-stable callbacks** passed as props into lists | `react_design_pattern.md` §1 (Stable Function References) | `onClick` / `onViewDetails` / `onViewPerformance` callers |
| **`useMemo` for derived color configurations** | `react_design_pattern.md` §1 (Client-Side Memoization) | Color derivation in `AttendanceSummaryPanel` |
| **Existing `SlottedEntityCard` as row shell** for list rows | User feedback + SlottedEntityCard pattern §5 | `UpcomingScheduleRow`, `RecentActivityRow` |
| **No raw `<table>` HTML** — use `SlottedEntityCard` rows | User comment on legacy `BatchUpcomingSchedule` | `UpcomingScheduleRow` replaces table rows |
| **`JS-Conditional Responsive Viewports`** — mobile-only mount | `react_design_pattern.md` §1 | Parent `BatchProfile.jsx` gates these via `isMobile` |

---

## 1. Non-Domain Driven Infrastructure Rules

### Rule N1: Explicit Positional Signatures & Execution Blueprints

---

#### Component 1: `AttendanceSummaryPanel`
* **Path Reference:** `src/features/batch/components/profile/AttendanceSummaryPanel.jsx`

```javascript
/**
 * AttendanceSummaryPanel renders a compact, read-only attendance statistics card.
 * Follows the SlottedEntityCard slot-injection pattern:
 *   - Outer visual shell = CardContainer (headless, no domain knowledge)
 *   - Inner content = slot-injected primitives (ProgressBar, KeyValuePair, Button)
 *
 * Color derivation for ProgressBar is memoized to prevent re-computation on
 * unrelated parent re-renders.
 *
 * @param {Object} props - Component properties.
 * @param {number} props.overallPercent - Overall attendance rate (0–100).
 * @param {number} props.lastWeekPercent - Last week attendance percentage.
 * @param {string} props.presentToday - Present/Total string (e.g. "29 / 30").
 * @param {number} props.totalClasses - Total classes conducted so far.
 * @param {function} [props.onViewDetails] - Stable callback (must be useCallback-wrapped
 *   at call site) for "View Attendance Details" action.
 * @returns {React.ReactElement} Attendance summary panel card.
 */
export default function AttendanceSummaryPanel({
  overallPercent,
  lastWeekPercent,
  presentToday,
  totalClasses,
  onViewDetails
}) { ... }
```

**Execution Workflow:**
1. Receives flat numeric/string props — **zero internal hooks or API calls** (slot independence rule).
2. Derives `progressColor` via `useMemo([overallPercent])`: `≥ 90` → `'success'`, `≥ 70` → `'warning'`, else `'danger'`.
3. Renders a **`CardContainer` (density `medium`)** as the headless layout shell:
   - **Header slot**: title text "Attendance Summary" + `trending_up` icon (emerald tint).
   - **Hero slot**: large `{overallPercent}%` headline + "Overall Attendance" sub-label.
   - **Stats slot**: `<ProgressBar value={overallPercent} max={100} color={progressColor} size="md" />`.
   - **Metadata slot**: 3 `<KeyValuePair layout="horizontal">` rows — Last Week / Present Today / Total Classes.
   - **Footer slot**: `<Button variant="text" size="sm" endIcon="chevron_right" onClick={onViewDetails}>View Attendance Details</Button>`.

> [!NOTE]
> `onViewDetails` **must** be wrapped in `useCallback` at the parent call site to prevent identity change on every parent render, which would cascade into button re-renders.

---

#### Component 2: `AcademicProgressPanel`
* **Path Reference:** `src/features/batch/components/profile/AcademicProgressPanel.jsx`

```javascript
/**
 * AcademicProgressPanel renders a compact, read-only academic progress card.
 * Follows the SlottedEntityCard slot-injection pattern.
 * All slot content is self-contained — renders cleanly in isolation without
 * needing sibling slot data.
 *
 * @param {Object} props - Component properties.
 * @param {number} props.syllabusPercent - Syllabus completion percentage (0–100).
 * @param {number} props.testsConducted - Number of tests conducted.
 * @param {number} props.averageScore - Class average test score percentage (0–100).
 * @param {number} props.highestScore - Highest individual score percentage (0–100).
 * @param {function} [props.onViewPerformance] - Stable callback (must be useCallback-wrapped
 *   at call site) for "View Test Performance" action.
 * @returns {React.ReactElement} Academic progress panel card.
 */
export default function AcademicProgressPanel({
  syllabusPercent,
  testsConducted,
  averageScore,
  highestScore,
  onViewPerformance
}) { ... }
```

**Execution Workflow:**
1. Receives flat props — **zero internal hooks or API calls**.
2. Renders a **`CardContainer` (density `medium`)** as the headless layout shell:
   - **Header slot**: title "Academic Progress" + `auto_graph` icon (primary tint).
   - **Stats slot**: `<ProgressBar value={syllabusPercent} max={100} variant="stacked" label="Syllabus Completed" showPercentage color="primary" />`.
   - **Metadata slot**: 3 `<KeyValuePair layout="horizontal">` rows — Tests Conducted / Average Score / Highest Score.
   - **Footer slot**: `<Button variant="text" size="sm" endIcon="chevron_right" onClick={onViewPerformance}>View Test Performance</Button>`.

> [!IMPORTANT]
> Both panels (`AttendanceSummaryPanel` and `AcademicProgressPanel`) must **not** be nested inside another `CardContainer` by the parent. The parent `BatchProfile.jsx` mobile layout renders them directly in a `flex flex-col gap-4` stack — no wrapping card shell above.

---

#### Component 3: `UpcomingScheduleRow`
* **Path Reference:** `src/features/batch/components/profile/UpcomingScheduleRow.jsx`

```javascript
/**
 * UpcomingScheduleRow renders a single schedule session row using SlottedEntityCard
 * as the structural shell. It injects a color-coded date pill into the `icon` slot
 * and schedule metadata into the `title`/`subtitle`/`metaText` slots.
 *
 * This component is memoized via React.memo to prevent re-renders when sibling
 * rows in the parent .map() update unrelated state.
 *
 * @param {Object} props - Component properties.
 * @param {'today'|'tomorrow'|'future'} props.dayType - Controls date pill color + label.
 * @param {string} props.dateLabel - Formatted label for 'future' type (e.g. "FRI, 25 JUL").
 * @param {string} props.time - Session start time string (e.g. "09:00 AM").
 * @param {string} props.topic - Topic or lesson name.
 * @param {string} [props.chapter] - Chapter or sub-descriptor (e.g. "Chapter 2").
 * @param {function} [props.onClick] - Stable click callback (useCallback-wrapped at call site).
 * @returns {React.ReactElement} A single schedule list row wrapped in SlottedEntityCard.
 */
const UpcomingScheduleRow = React.memo(function UpcomingScheduleRow({
  dayType,
  dateLabel,
  time,
  topic,
  chapter,
  onClick
}) { ... });

export default UpcomingScheduleRow;
```

**Execution Workflow:**
1. Derives `pillConfig` from `dayType` enum via a static lookup object (not `useMemo` — static config, no reactivity needed):
   - `today` → `{ label: 'TODAY', classes: 'bg-primary/10 text-primary' }`
   - `tomorrow` → `{ label: 'TOMORROW', classes: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' }`
   - `future` → `{ label: dateLabel, classes: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' }`
2. Constructs a `dateNode` — a compact `<div>` containing `time` (small text above) + colored pill below — to inject into `SlottedEntityCard`'s `icon` slot area using `renderSelectedCard` override technique or directly via the `icon` slot.
3. Renders **`<SlottedEntityCard>`** with:
   - Custom left node: date/time stack with pill (passed as a JSX node replacing the `icon` prop area).
   - `title={topic}` → bold center title.
   - `subtitle={chapter}` → muted chapter text.
   - `badge={undefined}` → no badge; the date pill is on the left.
   - `onClick={onClick}` → row tap handler.
4. `React.memo` prevents re-render when parent `BatchProfile` state unrelated to this row changes.

> [!NOTE]
> `SlottedEntityCard` already provides the chevron arrow on the right and the full hover/tap interaction surface. We do **not** add another wrapping button — composing into `SlottedEntityCard` directly avoids the nested card anti-pattern.

---

#### Component 4: `RecentActivityRow`
* **Path Reference:** `src/features/batch/components/profile/RecentActivityRow.jsx`

```javascript
/**
 * RecentActivityRow renders a single recent activity entry as a SlottedEntityCard row.
 * The icon tile (colored by iconVariant) is injected into the icon slot.
 * Activity title and timestamp map to title/subtitle slots.
 * The detail string (e.g. "29 Present / 30") maps to the badge slot.
 *
 * Memoized via React.memo to prevent list re-renders.
 *
 * @param {Object} props - Component properties.
 * @param {string} props.icon - Material Symbol icon name (e.g. "how_to_reg").
 * @param {'primary'|'success'|'warning'|'info'|'danger'} [props.iconVariant='primary'] - Icon tile color theme.
 * @param {string} props.title - Activity label (e.g. "Attendance Taken").
 * @param {string} props.timestamp - Time string (e.g. "Today, 09:15 AM").
 * @param {string} [props.detail] - Right-aligned detail text (e.g. "29 Present / 30").
 * @returns {React.ReactElement} A single activity row wrapped in SlottedEntityCard.
 */
const RecentActivityRow = React.memo(function RecentActivityRow({
  icon,
  iconVariant = 'primary',
  title,
  timestamp,
  detail
}) { ... });

export default RecentActivityRow;
```

**Execution Workflow:**
1. Resolves `iconConfig` from `iconVariant` via static lookup (no `useMemo` — static map):
   - `primary` → `{ bg: 'bg-primary/10', color: 'text-primary' }`
   - `success` → `{ bg: 'bg-emerald-50 dark:bg-emerald-900/20', color: 'text-emerald-600 dark:text-emerald-400' }`
   - `warning` → `{ bg: 'bg-amber-50 dark:bg-amber-900/20', color: 'text-amber-600 dark:text-amber-400' }`
   - `info` → `{ bg: 'bg-blue-50 dark:bg-blue-900/20', color: 'text-blue-600 dark:text-blue-400' }`
   - `danger` → `{ bg: 'bg-rose-50 dark:bg-rose-900/20', color: 'text-rose-600 dark:text-rose-400' }`
2. Renders **`<SlottedEntityCard>`** with:
   - `icon={icon}` + `iconColor={iconConfig.color}` — the card's native icon slot with a themed tint class.
   - `title={title}` — primary activity label.
   - `subtitle={timestamp}` — muted timestamp.
   - `badge={detail && <span className="text-xs font-bold text-text-secondary">{detail}</span>}` — right-side detail string in badge slot.
   - `onClick={undefined}` — activity rows are read-only; no navigation trigger.
3. `React.memo` wrapping ensures list renders are skipped on unrelated parent state changes.

> [!NOTE]
> `SlottedEntityCard`'s native `icon` prop + `iconColor` prop already provides the icon tile container (`size-10 rounded-xl bg-slate-100`). We override `iconColor` with the variant-specific Tailwind color to achieve the tinted icon tile — no new DOM nesting required.

---

### Rule N2: Absolute Background Base Knowledge Traceability

* **Referenced Core Modules:**
  * [react_design_pattern.md](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.agents/react_design_pattern.md) — §1 Render Minimization (React.memo, useCallback, useMemo rules).
  * [react-slotted-entity-card-design-pattern.md](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/.gemini/memory/knowledge/react-slotted-entity-card-design-pattern.md) — Slot independence, no nested cards, headless layout shell.
  * [SlottedEntityCard.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/v2/cards/SlottedEntityCard.jsx) — `icon`, `iconColor`, `title`, `subtitle`, `metaText`, `badge`, `onClick` props confirmed.
  * [ProgressBar.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/v2/ProgressBar.jsx) — `value`, `max`, `color`, `variant`, `showPercentage` props confirmed.
  * [KeyValuePair.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/v2/KeyValuePair.jsx) — `layout="horizontal"` confirmed.
  * [Button.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/v2/Button.jsx) — `variant="text"`, `size="sm"`, `endIcon` confirmed.
  * [CardContainer.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/components/ui/v2/cards/CardContainer.jsx) — `density="medium"` confirmed.
  * [BatchActivityLog.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/profile/BatchActivityLog.jsx) — Legacy reference.
  * [BatchUpcomingSchedule.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/profile/BatchUpcomingSchedule.jsx) — Legacy reference (raw `<table>` being replaced).
  * [overview_tab_view_architecture.md](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/temp/batchViews/overview_tab_view_architecture.md) — Design specification source.

---

### Rule N3: Explicit Fact vs. Assumption Boundary Declaration

#### Actual Verified Facts:
1. `SlottedEntityCard` accepts `icon` (string), `iconColor` (Tailwind classes), `title`, `subtitle`, `metaText`, `badge` (ReactNode), and `onClick` — confirmed from source.
2. `SlottedEntityCard` already provides the `chevron_right` on the right and the full hover tap surface via `<button type="button">` — confirmed from source.
3. `ProgressBar` `color` prop accepts only `'primary' | 'success' | 'warning' | 'danger'` — confirmed from source.
4. `KeyValuePair` supports `layout="horizontal"` and `sizeProp` for anchor font sizing — confirmed from source.
5. `Button` `endIcon` prop takes a Material Symbol name string — confirmed from source.
6. `CardContainer`'s `hoverable` prop defaults to `true`, which adds hover border/scale effects — confirmed; panels must set `hoverable={false}` since they are non-interactive containers.
7. `BatchUpcomingSchedule.jsx` uses raw `<table>` and hardcoded rows — confirmed; violates the design system.
8. `BatchActivityLog.jsx` uses hardcoded mock data and raw `<button>` — confirmed; violates the design system.

#### System Assumptions:
1. The parent `BatchProfile.jsx` will gate these mobile components behind `useIsMobile()` so desktop renders do not mount them — following the JS-Conditional Responsive Viewports rule.
2. Parent will wrap all `onClick` / `onViewDetails` / `onViewPerformance` callbacks in `useCallback` before passing down to prevent identity churn causing `React.memo` bypasses.
3. Data for `overallPercent`, `syllabusPercent`, etc. will be derived from the existing `useBatchDetailQuery` result and passed as flat scalars — no object references that would break `React.memo` shallow comparison.

---

### Rule N4: GAS Execution Boundary & Round-Trip Round Up

> [!NOTE]
> These are pure client-side React presentation leaf components. They contain zero API calls, zero Google Apps Script executions, and zero Sheets operations. All data is pre-computed by the parent and passed as flat scalar props.

---

### Rule N5: Performance Regression & Benchmark Assertions

* **Metric Formula:** `T(n) = O(1) rendering time` for each component instance. `React.memo` on row components guarantees `O(1)` re-render cost per row in `.map()` contexts when sibling/parent unrelated state updates occur.
* **Harness Assertion:** React DevTools Profiler flamegraph should show zero `UpcomingScheduleRow` or `RecentActivityRow` renders when `BatchProfile` parent state (e.g., active tab) changes while the schedule/activity lists themselves have not changed.

---

### Rule N6: Legacy Maintenance Mitigation & Red Flag Isolation

> [!CAUTION]
> **LEGACY MAINTENANCE IDENTIFIED:**
>
> * **Technical Path Endpoint:** [BatchActivityLog.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/profile/BatchActivityLog.jsx) and [BatchUpcomingSchedule.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/profile/BatchUpcomingSchedule.jsx)
> * **Core Technical Debt Risk:** Both legacy files violate the Zero-New-UI-Components Policy (raw `<table>`, raw `<button>`, hardcoded mock data, no design system primitives). Left in place on the desktop `BatchProfile` Overview tab, they will create visual inconsistency between mobile and desktop renders.
> * **Remediation Option:** After mobile component verification, replace both legacy files' usages in the desktop `BatchProfile` Overview tab with the same `UpcomingScheduleRow` / `RecentActivityRow` list-row compositions. Files are retained but effectively superseded. This will be tracked as a follow-up item in the next session.

---

## Proposed Changes

### New Domain-Specific Components

---

#### [NEW] [AttendanceSummaryPanel.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/profile/AttendanceSummaryPanel.jsx)
* Stateless functional component (no `React.memo` — panel is rendered once, not in a list).
* Composes: `CardContainer` (`hoverable={false}`), `ProgressBar`, `KeyValuePair` (horizontal, 3×), `Button` (text).
* `useMemo` for `progressColor` derivation from `overallPercent`.
* Props: `overallPercent`, `lastWeekPercent`, `presentToday`, `totalClasses`, `onViewDetails`.

---

#### [NEW] [AcademicProgressPanel.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/profile/AcademicProgressPanel.jsx)
* Stateless functional component (no `React.memo` — panel is rendered once, not in a list).
* Composes: `CardContainer` (`hoverable={false}`), `ProgressBar` (stacked variant), `KeyValuePair` (horizontal, 3×), `Button` (text).
* Props: `syllabusPercent`, `testsConducted`, `averageScore`, `highestScore`, `onViewPerformance`.

---

#### [NEW] [UpcomingScheduleRow.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/profile/UpcomingScheduleRow.jsx)
* `React.memo`-wrapped functional component — rendered inside `.map()`.
* Composes: **`SlottedEntityCard`** as the structural row shell (provides tap surface + chevron + icon slot).
* Static `pillConfig` lookup object (no hook overhead).
* Props: `dayType`, `dateLabel`, `time`, `topic`, `chapter`, `onClick`.

---

#### [NEW] [RecentActivityRow.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/batch/components/profile/RecentActivityRow.jsx)
* `React.memo`-wrapped functional component — rendered inside `.map()`.
* Composes: **`SlottedEntityCard`** as the structural row shell (provides icon tile + title + subtitle + badge slots).
* Static `iconConfig` lookup object (no hook overhead).
* `badge` slot receives a plain `<span>` with the `detail` text.
* Props: `icon`, `iconVariant`, `title`, `timestamp`, `detail`.

---

## Verification Plan

### Manual Verification
1. **`AttendanceSummaryPanel`**: Render with `{ overallPercent: 92, lastWeekPercent: 94, presentToday: '29 / 30', totalClasses: 24 }`. Confirm ProgressBar is green (`success`), 3 stat rows display, footer link fires `onViewDetails`.
2. **`AcademicProgressPanel`**: Render with `{ syllabusPercent: 74, testsConducted: 8, averageScore: 81, highestScore: 98 }`. Confirm stacked ProgressBar shows 74%, stat rows render.
3. **`UpcomingScheduleRow`**: Render for all 3 `dayType` values. Confirm pill color and label match the design spec. Confirm `SlottedEntityCard` chevron appears on the right.
4. **`RecentActivityRow`**: Render for all 5 `iconVariant` values. Confirm the icon tile background color matches the theme. Confirm `detail` text appears in the right badge slot.
5. **Anti-pattern check**: Inspect DOM in React DevTools — confirm no `CardContainer` nesting inside another `CardContainer`.
6. **`React.memo` check**: Use React DevTools Profiler — confirm row components do not re-render when `BatchProfile` active tab changes.

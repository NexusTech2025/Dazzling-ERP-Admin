# Attendance Management Design Patterns (Teachers & Students)

This document serves as the core design pattern and rule registry for all daily register sheets (Student, Teacher, or any future attendance module). All implementations must adhere to the following technical and visual standards:

## 1. Client-Side Batch Caching & Zero-Refetch Filtering
* **Unified Fetch**: Do not fetch registers individually by batch. Force the React Query hooks or component calls to fetch all batch records simultaneously (using `'all'` or similar date-wide endpoint).
* **In-Memory Filtering**: Filter records dynamically inside the component's state using selectors and memoized hooks (`useMemo`) to handle search queries, batch selections, and status filters.
* **Initial Snapshot**: Store a deep copy of the raw network response (`initialSnapshot` using `JSON.parse(JSON.stringify(initial))`) upon loading. The **Reset** button must restore staged records back to this snapshot rather than applying hardcoded fallback defaults (like always setting to 'P').

## 2. Not Recorded (NR) Status & Validation
* **Timezone-Safe Date Boundary**: Always use timezone-safe, local midnight date calculations (`isPastLocalDate` in `src/lib/dateUtils.js`) instead of UTC string parsing (`toISOString()`) when classifying historical logs.
* **Unrecorded Past Dates**: Flag empty logs on past dates as `isUnmarkedPastDate` and display a static gray `NR` badge with a slate ball icon.
* **Unrecorded Current Date**: Flag today's empty logs as `isUnmarkedCurrentDate` and initialize their status as an empty string (`''`) so they are visually unselected. Render a pulsing blue dot badge.
* **Block Unmarked Submissions**: Ensure validation blocks register saves if any record in the selected filter is still unmarked (`status === ''`).

## 3. P, A, L Selector Typography & Targets
* **Empty/Unselected Status States & Save Locks**:
  Multi-option status form controllers (like P, A, L segment buttons) must initialize to an empty/unselected state by default on mount/open. Ensure that the form submit/update button remains disabled (`disabled={!localStatus}`) until the user explicitly selects one of the active status options, preventing accidental record overrides.

* **Desktop Size**: Status selector buttons must scale to `w-12 h-12 rounded-xl text-[32px] font-black`.
* **Mobile Size**: Status selector buttons must scale to `w-10 h-10 rounded-xl text-[26px] font-black`.

## 4. Adaptive KPIs & Read-Only Locks
* **Stats Cards**: Display a row of 5 small horizontal cards on desktop (`hidden md:grid`) and a horizontal badge ribbon on mobile (`flex md:hidden`).
* **Locks Alert**: Disable editing for past dates unless the user is a `superadmin`. Display a lock banner alert in the title header block, disable all table/card inputs, and render custom read-only calendars for profiles.

## 5. Zero-Width Mobile Card Selection
* **Zero-Width Avatar selection**: In low-density mobile card layouts, map checkboxes directly inside the visual avatar/initials slot when selection mode is active. This avoids layout shift or horizontal reflow when entering multi-select states.

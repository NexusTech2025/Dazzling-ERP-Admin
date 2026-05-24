# Report: Package Details Diagnostic Analysis

This report documents the architectural, React Query, and schema field analysis of the Package Details page (`PackageDetails.jsx`).

---

## 1. React Query Cache Usage
- **Hook Used**: `usePackageDetailQuery(id)`
- **Diagnosis**: 
  - **Missing Cache Lookup**: Unlike other detail queries, `usePackageDetailQuery(id)` (defined in `useCourseQueries.js` line 190) has **no `initialData` cache fallback function**.
  - When navigating from the packages directory list to this detail page, it completely ignores the cached list of packages and triggers a redundant network request.

---

## 2. Refetch on Mount
- **Diagnosis**:
  - `usePackageDetailQuery` does not specify `staleTime`, `refetchOnMount`, or `refetchOnWindowFocus` options.
  - As a result, it defaults to `staleTime: 0`, and always triggers a network refetch on mount.
  - The other tabs ("Enrollments", "Revenue") are placeholders and do not perform extra fetches.

---

## 3. Form Submission Alignment
- **Diagnosis**:
  - There are no forms or mutations (such as package editing or package deletion) implemented within `PackageDetails.jsx` itself.
  - The "Enroll New Student" and "Export" buttons are pure presentational placeholders.

---

## 4. Schema Field Alignment
- **Target Schema**: `Package`, `PackageCourse` (join table), `PackagePerk`, and `Course` tables.
- **Diagnosis & Field Gaps**:
  - **Relational Field Mismatch**: 
    - The schema defines the relation between `Package` and `PackageCourse` as **`packagecourses`** (hasMany).
    - The page references **`pkg.courses`** (lines 17, 119, 226) and assumes it is an array of course objects. In the database schema, this is a multi-step join: `Package` -> `packagecourses` -> `course`. If the backend API or mapper does not resolve this join and flatten it to `courses`, `pkg.courses` will be `undefined`.
  - **Perks Relation Mismatch**:
    - The schema defines the relation between `Package` and `PackagePerk` as **`packageperks`** (hasMany).
    - The page references **`pkg.perks`** (line 150) instead of `pkg.packageperks`.
  - **No `base_fee` in Package**:
    - Line 18 fallback refers to `pkg.base_fee` which does not exist in the `Package` schema (it only has `package_fee` and `discount_percent`).

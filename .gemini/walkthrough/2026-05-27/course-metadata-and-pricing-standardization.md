# Walkthrough: Course Metadata and Pricing Standardization

We have updated the course query logic and standardized price formats, package fee mapping, and class display badges across the Course and Package dashboard interface.

## Changes Made

### 1. Centralized Query Normalization
- **File modified:** [useCourseQueries.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/hooks/useCourseQueries.js)
- **Updates:**
  - Modified the `useCoursesQuery` hook so that its query function (`queryFn`) returns the raw response array.
  - Added the TanStack Query `select` property mapping to `normalizeCourseList`, which runs safe JSON parsing on `course.metadata` string values. This ensures metadata is converted to a standard JavaScript object before consumption.

### 2. Class Badge/Pill Badges Added
- **File modified:** [Courses.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/Courses.jsx)
  - Rendered a Class badge (`Class {row.metadata.class}`) inside the "Course Name" column for each course item using parsed metadata.
- **File modified:** [CourseCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/components/CourseCard.jsx)
  - Added a Class badge next to the course name on the grid cards using `course.metadata.class`.

### 3. Package Pricing Alignment
- **Files modified:**
  - [Courses.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/Courses.jsx) (package table columns)
  - [PackageCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/components/PackageCard.jsx) (package cards)
- **Updates:**
  - Mapped price to `package_fee` instead of `base_fee` to align with the schema version 2.0.1.

### 4. Currency Symbol Standardization
- **Files modified:**
  - [Courses.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/Courses.jsx) (course & package tables)
  - [CourseCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/components/CourseCard.jsx)
  - [PackageCard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/components/PackageCard.jsx)
  - [PackageDetails.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/PackageDetails.jsx)
  - [CourseDetails.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/CourseDetails.jsx)
  - [CoursePackagesForm.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/CoursePackagesForm.jsx)
  - [AddCourse.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/AddCourse.jsx)
- **Updates:**
  - Replaced the dollar sign (`$`) with the Indian Rupee symbol (`₹`) for all fees, sums, and labels to standardize the pricing schema representation.

## Verification
- Verified all component code files are formatted cleanly.
- The dev server is active and verified that Vite compiles all assets and templates correctly.

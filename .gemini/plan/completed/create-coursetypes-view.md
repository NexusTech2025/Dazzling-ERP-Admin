---
Date: 2026-05-27T19:55:00+05:30
Status: Approved-Completed
---

# Create CourseType Categories View & Navigation Dropdown

Create a dedicated categories management page (`CourseTypes`) and set up its sidebar dropdown submenu navigation.

## User Review Required

> [!IMPORTANT]
> - **Navigation Restructuring**: Restructuring the `Courses` sidebar navigation link into a dropdown menu containing:
>   1. **Course Catalog** (`/admin/courses`)
>   2. **Course Categories** (`/admin/courses/types`)
> - **New Page layout**: Creating the Course Categories page using a clean two-column dashboard layout (DataTable of categories on the left, creation form on the right) for an optimized experience.

## Open Questions

- *None.*

## Proposed Changes

### Navigation and Routing

#### [MODIFY] [Sidebar.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/layout/Sidebar.jsx)
- Convert the flat `Courses` link into a dropdown containing sub-items: `Course Catalog` (pointing to `/admin/courses`) and `Course Categories` (pointing to `/admin/courses/types`).
- Ensure auto-expand behavior works when navigating to either sub-route.

#### [MODIFY] [AppRoutes.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/routes/AppRoutes.jsx)
- Import `CourseTypes` page.
- Add `<Route path="courses/types" element={<CourseTypes />} />` inside the protected route structure.

### Course Feature Pages

#### [NEW] [CourseTypes.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/course/CourseTypes.jsx)
- Create categories view page combining categories display table and category creation card side-by-side using a responsive grid layout.
- Use `useCourseTypesQuery` to load dynamic segments.
- Use `useCreateCourseTypeMutation` to handle category creation.
- Integrate standard V2 components: `Breadcrumbs`, `FormSection`, `FormField`, `TextInput`, `SelectInput`, `Button`, `DataTable`, `Badge`.

---

## Verification Plan

### Manual Verification
> [!NOTE]
> The user will perform manual testing to verify that:
> 1. Clicking "Courses" in the sidebar expands to reveal "Course Catalog" and "Course Categories".
> 2. Clicking "Course Categories" routes successfully to `/admin/courses/types` and loads existing types.
> 3. Creating a new category adds it to the list and displays the success state.

# Component Memory

## ButtonGroupFilter

**Location:** `src/components/ui/filters/ButtonGroupFilter.jsx`

### Description

A standardized, high-performance toggle group used for multi-dimensional filtering (e.g., Categories, Languages, Boards, Classes). It provides a consistent look and feel across the Admin dashboard and replaces manual button mapping logic.

### Usage Guidelines

In future sessions, ALWAYS use this component when implementing horizontal toggle-based filters. Do not build custom button loops for this purpose.

### Props API

| Prop         | Type         | Description                                                                |
| :----------- | :----------- | :------------------------------------------------------------------------- |
| `options`  | `Array`    | List of objects:`{ label: string, value: any, icon?: string }`           |
| `value`    | `any`      | The currently selected value matching an option's `value`.               |
| `onChange` | `Function` | Returns the selected value:`(newValue) => { ... }`                       |
| `variant`  | `string`   | `'primary'` (Blue/Brand theme) or `'secondary'` (Slate/Neutral theme). |
| `size`     | `string`   | `'md'` (Default) or `'sm'` (Compact mode).                             |
| `label`    | `string`   | Optional uppercase tracking label displayed above the group.               |

### Implementation Example

```jsx
const categoryOptions = [
  { label: 'All', value: '', icon: 'apps' },
  { label: 'Academic', value: 'SEG-ACA', icon: 'menu_book' }
];

<ButtonGroupFilter 
  label="Category"
  options={categoryOptions} 
  value={currentFilter} 
  onChange={setFilter} 
  variant="primary"
/>
```

---

## SelectGroupFilter
**Location:** `src/components/ui/filters/SelectGroupFilter.jsx`

### Description
A compact, styled dropdown filter used for selections with many options (e.g., Classes 1-12). It shares the same visual language as the `ButtonGroupFilter` but utilizes a standard `<select>` element for better usability with large datasets.

### Usage Guidelines
Use this for filters where horizontal space is limited or where the number of options exceeds 5 items.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `options` | `Array` | List of `{ label, value }` objects or plain strings/numbers. |
| `value` | `any` | Current active value. |
| `onChange` | `Function` | Callback returning the selected value. |
| `label` | `string` | The prefix label (e.g., "CLASS"). |
| `defaultLabel` | `string` | Label for the reset/all option (default: "ALL"). |

### Implementation Example
```jsx
<SelectGroupFilter 
  label="Class"
  options={[1, 2, 3, 4, 5]} 
  value={selectedClass} 
  onChange={setSelectedClass} 
/>
```

---

## Breadcrumbs
**Location:** `src/components/ui/Breadcrumbs.jsx`

### Description
A dynamic navigation utility that helps users track their location within the system. It supports icon-integration, automated "active state" detection for the current page, and responsive flex-layout.

### Usage Guidelines
Include this at the top of every dashboard sub-page (Create, Edit, Profile, Details). Ensure the first item is always "Home" or the main Dashboard.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `items` | `Array` | List of `{ label: string, path?: string, icon?: string }`. |
| `separator` | `string` | Optional Material Symbol icon name (default: "chevron_right"). |

### Implementation Example
```jsx
const crumbs = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'home' },
  { label: 'Courses', path: '/admin/courses' },
  { label: 'Create Package' }
];

<Breadcrumbs items={crumbs} />
```

---

## Form UI Primitives
**Location:** `src/components/ui/form/`

### Description
Standardized input components (`FormInput`, `FormTextarea`, `FormSelect`) that enforce the ERP's visual language. They include support for icons, labels, and error messaging.

### Usage Guidelines
ALWAYS use these components for any administrative form. Do not use raw `<input>` or `<select>` tags.

### Props API (Shared)
| Prop | Type | Description |
| :--- | :--- | :--- |
| `label` | `string` | Uppercase bold label displayed above. |
| `icon` | `string` | Material Symbol icon name (left-aligned). |
| `error` | `string` | Validation error message. |
| `required` | `boolean` | Shows a red asterisk next to label. |

---

## ActionCardButton
**Location:** `src/components/ui/buttons/ActionCardButton.jsx`

### Description
A highly flexible card-style button used for empty states (e.g., "No Perks Yet") and grid-based additions (e.g., "Add Another Perk"). It supports multiple layouts and stylistic variants to fit different UI contexts.

### Usage Guidelines
- Use `layout="centered"` for initial empty states to provide a clear Call to Action.
- Use `layout="grid"` when the button should sit alongside existing items in a list.
- Use `layout="row"` for compact horizontal list items.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `variant` | `string` | `'dashed'` (Default), `'solid'`, `'ghost'`, `'tinted'`. |
| `layout` | `string` | `'centered'` (Wide), `'grid'` (Card), `'row'` (Horizontal). |
| `label` | `string` | The primary text (e.g., "Add Perk"). |
| `description`| `string` | Optional supporting sub-text. |
| `icon` | `string` | Material symbol name (default: "add"). |
| `onClick` | `Function` | Click event handler. |

### Implementation Example
```jsx
<ActionCardButton 
  variant="dashed" 
  layout="centered" 
  label="Add New Student" 
  description="Register a new student profile to get started." 
  icon="person_add" 
  onClick={() => {}} 
/>
```

---

## CourseSelectionModal
**Location:** `src/features/course/components/CourseSelectionModal.jsx`

### Description
A high-fidelity, multi-pane selection modal designed for complex entity assignment (e.g., assigning subjects to teachers). It features a segmented filter sidebar (Segment, Board, Grade, Medium) and a searchable main list.

### Usage Guidelines
- **Mandatory for Course Selection**: Replaces standard `MultiSelect` for subjects/courses in complex forms.
- **Data Contract**: Expects full course objects as `availableCourses`.
- **Selection Mode**: Supports both `singleSelect` (radio-style) and multi-selection (checkbox-style).

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `isOpen` | `boolean` | Modal visibility state. |
| `onClose` | `Function` | Callback to close the modal. |
| `onSelect` | `Function` | Callback returning array of selected objects: `(objs) => { ... }`. |
| `availableCourses` | `Array` | List of all course objects from `useCoursesQuery`. |
| `selectedCourses` | `Array` | Currently selected course objects (for sync). |
| `singleSelect` | `boolean` | If true, enforces single item selection. |

### Implementation Example
```jsx
const [isOpen, setIsOpen] = useState(false);
const { data: courses } = useCoursesQuery();

<CourseSelectionModal 
  isOpen={isOpen}
  availableCourses={courses}
  selectedCourses={selectedCourseObjects}
  onSelect={(objs) => handleSelect(objs)}
  onClose={() => setIsOpen(false)}
/>
```

---

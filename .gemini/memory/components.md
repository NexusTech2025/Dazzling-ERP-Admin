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

## BaseInput
**Location:** `src/components/ui/v2/BaseInput.jsx`

### Description
The core, production-grade input component that provides the foundational UI styling, size variations, and state visual styles (hover, focus-within, disabled, error) for all other text-like inputs (such as `TextInput` and `PhoneInput`). It separates the visual theme/design token implementation from specialized field behaviors.

### Usage Guidelines
- Use this as the base for building specialized inputs.
- Can be used directly if a standard input field is needed and no specialized wrapper exists.
- Supports left and right decorative/functional icons using Material Symbols.
- Forward refs are fully supported.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `label` | `string` | Optional text label displayed above the input. |
| `error` | `string` | Optional validation error message. Displays below the input in red and changes input border color. |
| `helperText` | `string` | Optional instructional sub-text displayed below the input when there is no error. |
| `leftIcon` | `string` | Optional Material Symbol icon name to display on the left side of the input. |
| `rightIcon` | `string` | Optional Material Symbol icon name to display on the right side of the input. |
| `className` | `string` | Optional additional CSS classes for the input wrapper. |
| `containerClassName` | `string` | Optional CSS classes for the outermost component wrapper div. |
| `variant` | `string` | Visual variant: `'default'` (bordered, surface background), `'filled'` (transparent border, background background), or `'ghost'` (transparent bg/border, hover style). Default is `'default'`. |
| `inputSize` | `string` | Field sizing: `'sm'` (small/compact), `'md'` (medium/standard), or `'lg'` (large). Default is `'md'`. |
| `disabled` | `boolean` | Disables user interaction and changes cursor style. |
| `id` | `string` | Unique HTML id for the input element. Defaults to the `name` prop if not provided. |
| `required` | `boolean` | If true, renders a red asterisk `*` next to the label. |
| `...props` | `object` | Any other standard HTML input attributes (e.g. `value`, `onChange`, `placeholder`, `name`, `type`). |

### Implementation Example
```jsx
<BaseInput
  label="Username"
  placeholder="Enter your username"
  leftIcon="person"
  required
  variant="default"
  inputSize="md"
  onChange={(e) => console.log(e.target.value)}
/>
```

---

## TextInput
**Location:** `src/components/ui/v2/TextInput.jsx`

### Description
A thin wrapper around `BaseInput` designed for standard text entry. It follows the "Separation of Concerns" principle from the design system and provides optional auto-trimming capability on blur.

### Usage Guidelines
- Use for standard single-line text fields (e.g., Names, Emails, Passwords, Codes).
- Set `trim={true}` to automatically clean up leading/trailing whitespace when the user leaves the input field.
- Supports all styling variants, sizes, icons, helper text, and errors from `BaseInput`.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `type` | `string` | HTML input type (e.g. `"text"`, `"email"`, `"password"`, `"url"`). Defaults to `"text"`. |
| `trim` | `boolean` | If true, automatically trims whitespace from the input value on blur. Defaults to `false`. |
| `onBlur` | `function` | Custom event handler for blur events. Called after any automatic value trimming. |
| `...props` | `object` | All other props are forwarded to `BaseInput` (and subsequently the HTML `<input>`). |

### Implementation Example
```jsx
<TextInput
  label="Email Address"
  type="email"
  placeholder="name@example.com"
  leftIcon="mail"
  trim={true}
  required
/>
```

---

## PhoneInput
**Location:** `src/components/ui/v2/PhoneInput.jsx`

### Description
A specialized composite input component for entering telephone numbers. It integrates a country code select dropdown on the left with a telephone number `BaseInput` on the right.

### Usage Guidelines
- Use this for collecting 10-digit mobile or telephone numbers across CRM, lead addition, or student registration modules.
- Ensure state handling supports both `countryCode` (for the dropdown) and the main phone number `value` (which gets passed to `BaseInput`).
- Standardizes the left icon to `"call"` and sets the input type to `"tel"`.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `countryCode` | `string` | Active country code value (e.g., `"+91"`, `"+1"`, `"+44"`, `"+971"`). Defaults to `"+91"`. |
| `onCountryCodeChange` | `function` | Callback function triggered when the country code selection changes: `(val) => { ... }`. |
| `...props` | `object` | All other props (e.g., `value`, `onChange`, `label`, `error`, `required`) are forwarded to the internal `BaseInput` component. |

### Implementation Example
```jsx
const [countryCode, setCountryCode] = useState('+91');
const [phoneNumber, setPhoneNumber] = useState('');

<PhoneInput
  label="Mobile Number"
  countryCode={countryCode}
  onCountryCodeChange={setCountryCode}
  value={phoneNumber}
  onChange={(e) => setPhoneNumber(e.target.value)}
  required
/>
```

---

## FormField
**Location:** `src/components/ui/v2/FormField.jsx`

### Description
A container and wrapper component that manages the semantic layout, label rendering, required indicators, and accessibility helpers for standard form input controls. It acts as the orchestrator for input field structures, supporting both vertical stack layouts and horizontal inline layouts.

### Usage Guidelines
- Wrap any V2 input components inside `FormField` to ensure unified layout styling and accessibility.
- It dynamically clones its single child component and injects relevant attributes like `id`, `name`, `error`, and `aria` attributes.
- Use `layout="horizontal"` for dense forms, sidebars, or table inline edits where labels and inputs must reside on the same row.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `label` | `string` | Uppercase bold label text displayed above or next to the child. |
| `name` | `string` | Name attribute of the form field. Passed to the child's `id` and `name` attributes. |
| `required` | `boolean` | If true, renders a red asterisk `*` next to the label. |
| `error` | `string` | Validation error message passed down to the child input. |
| `helperText` | `string` | Helpful guidance text. Triggers accessibility `aria-describedby` configuration. |
| `children` | `element` | A single React element (e.g., `TextInput`, `SelectInput`, `PhoneInput`). |
| `layout` | `string` | Layout orientation: `'vertical'` (stacked) or `'horizontal'` (inline). Defaults to `'vertical'`. |
| `labelWidth` | `string` | Width of the label when layout is set to `'horizontal'`. Defaults to `"150px"`. |
| `className` | `string` | Optional CSS classes for the form field container. |
| `containerClassName` | `string` | Optional CSS classes for the container wrapper. |

### Implementation Example
```jsx
<FormField
  label="Student Name"
  name="student_name"
  required={true}
  error={errors.student_name}
>
  <TextInput placeholder="Enter full name" leftIcon="person" />
</FormField>
```

---

## Button
**Location:** `src/components/ui/v2/Button.jsx`

### Description
A foundational action component supporting various styles, sizes, states (loading, disabled), prefix/suffix icons, internal routing, and external links. It acts as the primary interactive element for form submissions and page redirection.

### Usage Guidelines
- Use for all user-triggered actions, form submissions, and page navigation.
- For internal navigation, prefer the `navigateTo` prop over wrapping the button in a standard router link or using an inline `useNavigate` hook callback.
- Set the `loading` prop during async operations (e.g., API requests) to automatically display a spinner and prevent double-submission.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `children` | `node` | Button text or content. |
| `variant` | `string` | Visual variant: `'contained'` (default), `'outlined'`, `'text'`, `'danger'`, or `'success'`. |
| `size` | `string` | Size variant: `'sm'`, `'md'` (default), or `'lg'`. |
| `startIcon` | `string` | Material Symbol icon name to display on the left. |
| `endIcon` | `string` | Material Symbol icon name to display on the right. |
| `loading` | `boolean` | If true, renders a spinning icon and disables interaction. |
| `disabled` | `boolean` | If true, disables interaction and reduces opacity. |
| `onClick` | `function` | Click event handler. |
| `navigateTo` | `string` | Internal route destination using `react-router-dom`. |
| `href` | `string` | External URL. If provided, renders as an `<a>` element. |
| `type` | `string` | HTML button type attribute (`'button'`, `'submit'`, `'reset'`). Default is `'button'`. |
| `className` | `string` | Additional custom classes for styling overrides. |

### Implementation Example
```jsx
<Button
  variant="contained"
  startIcon="save"
  loading={isSubmitting}
  type="submit"
>
  Save Details
</Button>
```

---

## SelectInput
**Location:** `src/components/ui/v2/SelectInput.jsx`

### Description
A flexible single or multi-select dropdown field mimicking `BaseInput`'s visual aesthetic. It supports custom placeholder text, left icons, dropdown search functionality for large datasets, and validation error presentation.

### Usage Guidelines
- Use for single-item selection dropdowns or searchable lists where standard HTML select fields are too restrictive.
- Set `searchable={true}` when the options count exceeds 8-10 items to facilitate quick filtering.
- For multi-select fields with tag-based deletion/viewing, use `MultiSelect` instead.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `options` | `Array` | List of option objects: `[{ label: string, value: any }]`. |
| `value` | `any` | Selected value(s). Matches an option's `value`. |
| `onChange` | `function` | Callback triggered when selection changes. |
| `placeholder` | `string` | Placeholder text. Default is `"Select an option..."`. |
| `label` | `string` | Optional uppercase label text. |
| `error` | `string` | Optional error validation message. |
| `multiple` | `boolean` | Enables multi-select behavior when true. Default is `false`. |
| `searchable` | `boolean` | Enables search filtering box within the dropdown menu. Default is `false`. |
| `leftIcon` | `string` | Material Symbol icon name displayed on the left. |
| `className` | `string` | Custom CSS classes for the input field. |
| `containerClassName` | `string` | Custom CSS classes for the container wrapper. |
| `variant` | `string` | Visual style: `'default'` (default), `'filled'`, or `'ghost'`. |
| `inputSize` | `string` | Sizing option: `'sm'`, `'md'` (default), or `'lg'`. |

### Implementation Example
```jsx
const options = [
  { label: 'High Priority', value: 'high' },
  { label: 'Medium Priority', value: 'medium' },
  { label: 'Low Priority', value: 'low' }
];

<SelectInput
  label="Lead Priority"
  options={options}
  value={priority}
  onChange={setPriority}
  searchable
  leftIcon="priority_high"
/>
```

---

## MultiSelect
**Location:** `src/components/ui/v2/MultiSelect.jsx`

### Description
An advanced multi-selection component featuring integrated tags for selected options. It allows users to quickly search, check/uncheck options in a dropdown list, and remove selected options directly using close buttons on the tags.

### Usage Guidelines
- Use this when users need to select multiple items from a medium-to-large dataset (e.g. assigning roles, selecting branches, choosing subjects).
- Enables visual verification of selected values directly inside the closed input field via pills/tags.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `options` | `Array` | List of option objects: `[{ label: string, value: any }]`. |
| `value` | `Array` | List of selected option values. Default is `[]`. |
| `onChange` | `function` | Callback triggered on selection change: `(newValues) => { ... }`. |
| `placeholder` | `string` | Placeholder text. Default is `"Select options..."`. |
| `label` | `string` | Optional uppercase label text. |
| `error` | `string` | Optional validation error text. |
| `searchable` | `boolean` | If true, renders a search box inside the dropdown. Default is `true`. |
| `className` | `string` | Custom CSS classes for the select field. |
| `containerClassName` | `string` | Custom CSS classes for the container wrapper. |
| `variant` | `string` | Visual variant: `'default'` (default) or `'filled'`. |

### Implementation Example
```jsx
const subjectOptions = [
  { label: 'Mathematics', value: 'math' },
  { label: 'Physics', value: 'physics' },
  { label: 'Chemistry', value: 'chemistry' }
];

<MultiSelect
  label="Assigned Subjects"
  options={subjectOptions}
  value={selectedSubjects}
  onChange={setSelectedSubjects}
  searchable
/>
```

---

## RadioGroup
**Location:** `src/components/ui/v2/RadioGroup.jsx`

### Description
A card-style or simple list grouping component for radio inputs. Options can feature dedicated descriptions, status tags, and custom Material Symbols icons. It handles single selection natively.

### Usage Guidelines
- Use for prominent single-choice configurations where options benefit from supporting text or visual styling.
- Highly recommended for choosing Lead Channels, Genders, or Status groups (e.g., Prospect, Registered).
- Set `layout="grid"` to display options as side-by-side cards, or `layout="list"` for a vertical stack.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `options` | `Array` | List of option objects: `[{ label: string, value: any, description?: string, icon?: string }]`. |
| `value` | `any` | Active/selected value. |
| `onChange` | `function` | Callback triggered on value select: `(val) => { ... }`. |
| `name` | `string` | Standard HTML name attribute for the group. |
| `label` | `string` | Optional uppercase label text. |
| `error` | `string` | Optional validation error message. |
| `layout` | `string` | Layout alignment: `'grid'` (default) or `'list'`. |
| `columns` | `number` | Number of grid columns for wide screens when layout is `'grid'`. Default is `2`. |
| `className` | `string` | Optional additional styling classes. |

### Implementation Example
```jsx
const sourceOptions = [
  { label: 'Walk-In', value: 'walkin', description: 'Visits office directly', icon: 'directions_walk' },
  { label: 'Social Media', value: 'social', description: 'FB/Instagram Ads', icon: 'campaign' }
];

<RadioGroup
  label="Lead Source"
  name="lead_source"
  options={sourceOptions}
  value={source}
  onChange={setSource}
  layout="grid"
  columns={2}
/>
```

---

## FormSection
**Location:** `src/components/ui/v2/FormSection.jsx`

### Description
A card-based layout component designed to group related form inputs together. It features a header row with an optional custom title, icon, and actions container, and outputs its child inputs into a responsive two-column grid.

### Usage Guidelines
- Always use this component to segment extensive administrative pages into manageable sections (e.g., "Personal Info", "Contact Details", "Preferences").
- The children inside the section body are automatically placed into a `grid grid-cols-1 md:grid-cols-2 gap-6` layout. Use custom wrapper elements for single-column full-width elements if needed.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | Main header title text. |
| `icon` | `string` | Material Symbol icon name for the header badge. |
| `children` | `node` | Inner elements/fields. Renders in a 2-column responsive grid. |
| `className` | `string` | Custom CSS classes for the card container. |
| `headerAction` | `node` | Optional JSX node (e.g. a button) rendered on the right side of the header. |

### Implementation Example
```jsx
<FormSection
  title="Academic Details"
  icon="school"
  headerAction={<Button size="sm" variant="text">Clear Section</Button>}
>
  <FormField label="Batch" name="batch_id"><SelectInput options={batches} /></FormField>
  <FormField label="Roll Number" name="roll_no"><TextInput /></FormField>
</FormSection>
```

---

## ToggleSwitch
**Location:** `src/components/ui/v2/ToggleSwitch.jsx`

### Description
A modern custom toggle switch for boolean states, built on top of a styled `<input type="checkbox">`. It features custom track and knob styling, transitions, and hover-triggered label styling. It supports standard disabled and custom className overrides.

### Usage Guidelines
- Use for binary (true/false) configurations (e.g., enabling/disabling a feature, toggling settings, activating a mode).
- Prefer this over a simple checkbox when the action takes effect immediately or represents a clear state change.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `label` | `string` | Optional label text displayed to the right of the toggle switch, styled in uppercase tracking format. |
| `checked` | `boolean` | Current checked/active state. |
| `onChange` | `Function` | Callback triggered when state changes, returning the new boolean checked status: `(newChecked) => { ... }`. |
| `name` | `string` | Optional name attribute for the input element. |
| `disabled` | `boolean` | If true, disables interaction and lowers opacity. Defaults to `false`. |
| `className` | `string` | Optional custom classes for the container label element. |

### Implementation Example
```jsx
const [isActive, setIsActive] = useState(false);

<ToggleSwitch
  label="Enable Notifications"
  checked={isActive}
  onChange={setIsActive}
/>
```

---

## SegmentedControl
**Location:** `src/components/ui/v2/SegmentedControl.jsx`

### Description
A button-group style selection component designed for switching between small sets of options (e.g. tabs, views, modes). It displays options side-by-side with a rounded container and utilizes a slide/fade active indicator effect (highlighted background) for the selected button. Each option can optionally display a Material Symbol icon on the left.

### Usage Guidelines
- Use this when switching views, layouts, or filters with 2 to 4 options (e.g., Grid vs. List views).
- For tabbed page navigation or larger structures, use the `Tabs` component instead.
- Do not use for long lists of options where layout might overflow horizontally.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `options` | `Array` | List of option objects: `[{ label: string, value: any, icon?: string }]`. Defaults to `[]`. |
| `value` | `any` | Currently selected value. Matches the `value` in one of the options. |
| `onChange` | `Function` | Callback triggered when an option is selected: `(newValue) => { ... }`. |
| `label` | `string` | Optional uppercase label text displayed above the control. |
| `className` | `string` | Optional custom classes for the inner button-container div. |
| `containerClassName` | `string` | Optional custom classes for the outer wrapper div. |

### Implementation Example
```jsx
const [viewMode, setViewMode] = useState('list');
const viewOptions = [
  { label: 'List View', value: 'list', icon: 'format_list_bulleted' },
  { label: 'Grid View', value: 'grid', icon: 'grid_view' }
];

<SegmentedControl
  label="Display Format"
  options={viewOptions}
  value={viewMode}
  onChange={setViewMode}
/>
```

---

## Tabs
**Location:** `src/components/ui/v2/Tabs.jsx`

### Description
A modular tabbing system composed of two exported components: `TabGroup` (the outer container) and `TabButton` (the individual tab buttons). It features active state transition styling with shadow depth, optional icon alignment, and responsive button scale micro-animations.

### Usage Guidelines
- Use this for tabbed sections, primary content filtering, or multi-pane views on dashboard pages.
- Place `TabButton` elements inside a `TabGroup` to maintain proper theme borders and padding.
- For compact inline switch options with a slate pill background, use `SegmentedControl` instead.

### Props API
#### TabGroup Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `children` | `node` | A list of `TabButton` components to display horizontally inside the group. |

#### TabButton Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `active` | `boolean` | If true, highlights the button with the primary theme and applies a shadow. |
| `icon` | `string` | Optional Material Symbol icon name to display on the left of the label. |
| `onClick` | `Function` | Click event handler. |
| `children` | `node` | The label text or nodes to render inside the button. |

### Implementation Example
```jsx
import { TabGroup, TabButton } from 'src/components/ui/v2/Tabs';

const [activeTab, setActiveTab] = useState('general');

<TabGroup>
  <TabButton 
    active={activeTab === 'general'} 
    icon="settings" 
    onClick={() => setActiveTab('general')}
  >
    General
  </TabButton>
  <TabButton 
    active={activeTab === 'security'} 
    icon="security" 
    onClick={() => setActiveTab('security')}
  >
    Security
  </TabButton>
</TabGroup>
```

---

## Timeline
**Location:** `src/components/ui/v2/Timeline.jsx`

### Description
A modular chronological visualization component representing event histories or audit logs. It exports two components: `Timeline` (the main wrapper accepting an array of events) and `TimelineItem` (the individual event node with line connectors, colored nodes, and text layouts). It features hover-based line coloring and node scaling animations.

### Usage Guidelines
- Use to display log histories, progress tracking, user audit trails, or batch status changes in detail sheets or CRM sidebars.
- Customize the status colors using Tailwind background classes (`bg-primary`, `bg-emerald-500`, `bg-rose-500`, etc.) passed to `color`.

### Props API
#### Timeline Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `items` | `Array` | An array of timeline item objects: `[{ time: string, title: string, description?: string, color?: string }]`. Defaults to `[]`. |
| `className` | `string` | Optional custom classes for the outer wrapper container. |

#### TimelineItem Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `color` | `string` | Tailwind background class for the dot indicator (e.g. `'bg-primary'`, `'bg-emerald-500'`). Defaults to `'bg-primary'`. |
| `time` | `string` | The timestamp or time string displayed above the title. |
| `title` | `string` | The main title/action header text of the event. |
| `description` | `string` | Optional detailed context or description of the event. |
| `isLast` | `boolean` | If true, hides the line connector below the dot (automatically computed by the parent `Timeline` component). Defaults to `false`. |

### Implementation Example
```jsx
import { Timeline } from 'src/components/ui/v2/Timeline';

const auditHistory = [
  { time: "2 hours ago", title: "Lead Created", description: "Added via Walk-In channel by Admin.", color: "bg-primary" },
  { time: "1 hour ago", title: "Assigned to Advisor", description: "Assigned to Rahul Sharma.", color: "bg-amber-500" },
  { time: "10 mins ago", title: "Status Changed", description: "Updated from Prospect to Hot Lead.", color: "bg-emerald-500" }
];

<Timeline items={auditHistory} />
```

---

## SelectionActionBar
**Location:** `src/components/ui/v2/SelectionActionBar.jsx`

### Description
A floating, fixed multi-action bar displayed at the bottom center of the screen when one or more items are selected in list/grid views. It features an entrance slide/fade animation, standard count tracking (auto-pluralizing the item name), a select-clear button, and action buttons for deleting selected items or performing secondary operations like deleting all.

### Usage Guidelines
- Render this component on pages containing bulk-selectable items (e.g. Lead lists, Student tables, Course packages).
- Position/render this component near the bottom of the page container. It internally implements `fixed bottom-6 left-1/2 -translate-x-1/2` and only shows when `selectedCount > 0`.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `selectedCount` | `number` | Count of selected items. If `0`, the component returns `null` and is not rendered. Defaults to `0`. |
| `onClear` | `Function` | Callback triggered when the clear button (cross icon) is clicked: `() => { ... }`. |
| `onDeleteSelected` | `Function` | Callback triggered when the "Delete Selected" button is clicked: `() => { ... }`. |
| `onDeleteAll` | `Function` | Optional callback triggered when the "Delete All" button is clicked: `() => { ... }`. Hides the button if not provided. |
| `itemName` | `string` | Singular string representing the type of items (e.g. `'lead'`, `'student'`). Automatically appends `'s'` for plural counts. Defaults to `'item'`. |
| `className` | `string` | Optional custom classes for the floating action bar container. |

### Implementation Example
```jsx
const [selectedIds, setSelectedIds] = useState([]);

const handleClear = () => setSelectedIds([]);
const handleDelete = () => {
  console.log("Delete selected items:", selectedIds);
};

<SelectionActionBar
  selectedCount={selectedIds.length}
  itemName="lead"
  onClear={handleClear}
  onDeleteSelected={handleDelete}
/>
```

---

## Avatar
**Location:** `src/components/ui/v2/Avatar.jsx`

### Description
A foundational component for displaying user images, fallback initials, or a generic placeholder. It supports multiple predefined sizes, shapes (circle, square, rounded), status indicators (online, offline, busy, away), and custom styling overrides.

### Usage Guidelines
- Use to represent student profiles, staff accounts, or active user headers.
- If no image source (`src`) is available, provide `initials` (e.g., "JD" for John Doe). If neither is provided, a "?" fallback is rendered.
- Choose sizes according to context (e.g., `sm` for chat logs, `md`/`lg` for cards, and `2xl` for profile layout headers).

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `src` | `string` | Optional image source URL to load. |
| `initials` | `string` | Optional user initials to display as a fallback if `src` is missing or fails to load. Up to 2 characters are shown. |
| `alt` | `string` | Alternative text description for the image. Defaults to `"Avatar"`. |
| `size` | `string` | Predefined sizes: `'xs'` (24px), `'sm'` (32px), `'md'` (48px, default), `'lg'` (64px), `'xl'` (96px), `'2xl'` (128px). |
| `variant` | `string` | Border radius shape: `'circle'` (default), `'square'`, or `'rounded'`. |
| `status` | `string` | Optional user status indicator: `'online'`, `'offline'`, `'busy'`, or `'away'`. |
| `className` | `string` | Optional CSS classes for outer container customization. |

### Implementation Example
```jsx
// With image source and status indicator
<Avatar 
  src="/path/to/profile.jpg" 
  alt="John Doe" 
  size="lg" 
  status="online" 
/>

// Fallback to initials with rounded variant
<Avatar 
  initials="JD" 
  variant="rounded" 
  size="md" 
/>
```

---

## DateInput
**Location:** `src/components/ui/v2/DateInput.jsx`

### Description
A semantic wrapper around the `BaseInput` component specifically configured for date selection. It defaults the input type to `"date"`, enforces the `"calendar_today"` icon on the left, and forwards references to the underlying DOM input element.

### Usage Guidelines
- Use this for any date input fields (e.g., Date of Birth, Registration Date, Payment Due Date).
- Integrates seamlessly with form layout utilities like `FormField` and supports all visual states, error styling, and sizes provided by `BaseInput`.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `...props` | `object` | All props are forwarded to `BaseInput` (and subsequently the HTML `<input type="date">`), including standard properties like `label`, `error`, `helperText`, `value`, `onChange`, `required`, `disabled`, and `inputSize`. |

### Implementation Example
```jsx
<DateInput
  label="Date of Birth"
  required
  value={birthDate}
  onChange={(e) => setBirthDate(e.target.value)}
  error={errors.birthDate}
/>
```

---

## FileUpload
**Location:** `src/components/ui/v2/FileUpload.jsx`

### Description
A dropzone and button style file upload component. It supports standard click-to-upload file picker menus, drag-and-drop file imports, file input type customization (filters via `accept`), single/multiple file selections, and custom error/helper text feedback.

### Usage Guidelines
- Ideal for collecting student enrollment attachments, profile pictures, or staff resumes.
- If `multiple` is true, the `onFileSelect` callback passes the entire `FileList` object. If `multiple` is false (default), it passes a single `File` object.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `label` | `string` | Optional uppercase label text displayed above the dropzone. |
| `onFileSelect` | `function` | Callback triggered when file selection occurs. Receives a single `File` object (if `multiple={false}`) or a `FileList` (if `multiple={true}`). |
| `accept` | `string` | File type filter string accepted by the browser file explorer (e.g. `image/*`, `.pdf`, `.csv`). Default is `*`. |
| `multiple` | `boolean` | Allow selection of multiple files. Default is `false`. |
| `error` | `string` | Optional error validation message displayed below the dropzone in red. Triggers a red dashed border state. |
| `helperText` | `string` | Optional detailed instruction subtext. Defaults to displaying accepted formats. |
| `className` | `string` | Optional custom CSS classes for the container element. |

### Implementation Example
```jsx
<FileUpload
  label="Student Photo"
  accept="image/*"
  onFileSelect={(file) => console.log("Selected file:", file.name)}
  helperText="JPG or PNG up to 2MB"
  error={uploadError}
/>
```

---

## HighlightBox
**Location:** `src/components/ui/v2/HighlightBox.jsx`

### Description
A Callout/Key Indicator box used to highlight core metrics, snapshots, or status overviews. It supports distinct semantic status color variants (`primary`, `success`, `warning`, `danger`, `neutral`), optional badges or icons, and customizable trailing components (e.g. action buttons or tags).

### Usage Guidelines
- Ideal for display lists, dashboard summary cards, or quick profile sheets.
- Use the `trailingNode` to embed contextual buttons (e.g. "Edit", "View Detail") or additional tags that align to the right on wide displays.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `label` | `string` | The small uppercase identifier text describing the metric (e.g. `"Total Revenue"`). |
| `value` | `string` or `number` | The bold primary data point or metric value (e.g. `"$24,000"`). |
| `icon` | `string` | Optional Material Symbol icon name to display on the left. |
| `variant` | `string` | Visual color variants: `'neutral'` (default), `'primary'`, `'success'`, `'warning'`, `'danger'`. |
| `trailingNode` | `node` | Optional React element rendered on the right side of the card, separated by a vertical divider line on larger screens. |
| `className` | `string` | Optional custom CSS classes for layout overrides. |

### Implementation Example
```jsx
<HighlightBox
  label="Registration Fee"
  value="₹12,500"
  icon="payments"
  variant="success"
  trailingNode={
    <span className="text-xs font-bold text-emerald-500">PAID</span>
  }
/>
```

---

## KeyValuePair
**Location:** `src/components/ui/v2/KeyValuePair.jsx`

### Description
A layout component designed for clean display of read-only attributes, info details, or profile parameters. It features vertical and horizontal stack behaviors, size presets (sm, md, lg), automatic fallback handling for empty or nullish values, and optional Material Symbols icon integration.

### Usage Guidelines
- Ideal for student detail tabs, CRM sidebars, or read-only summary sheets.
- Use `layout="horizontal"` when aligning key-value rows in narrow settings like list items or sidebar widgets. Use `layout="vertical"` inside multi-column profile layouts.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `label` | `string` | The title/key representing the attribute (e.g. `"Email"`). Displays in uppercase tracking style. |
| `value` | `node` | The value/content of the attribute. If empty or null, renders the `fallback` value instead. |
| `icon` | `string` | Optional Material Symbol icon name to display on the left of the label. |
| `fallback` | `string` | Text to display if `value` is nullish or empty. Default is `"N/A"`. |
| `layout` | `string` | Visual stack direction: `'vertical'` (stacked) or `'horizontal'` (side-by-side). Default is `'vertical'`. |
| `size` | `string` | Text sizing: `'sm'`, `'md'` (default), or `'lg'`. |
| `className` | `string` | Optional custom CSS classes for custom spacing/margins. |

### Implementation Example
```jsx
// Vertical stack with fallback
<KeyValuePair
  label="Father's Name"
  value={profile.fatherName}
  icon="person"
  fallback="Not Specified"
/>

// Horizontal row with small size
<KeyValuePair
  label="Status"
  value="Active"
  layout="horizontal"
  size="sm"
/>
```

---

## MaskedInput
**Location:** `src/components/ui/v2/MaskedInput.jsx`

### Description
A specialized input component that wraps `BaseInput` and applies character masking formatting on the fly (e.g. formatting a number as `999-999-9999`). It intercepts the native change events and outputs a formatted value matching the provided mask pattern.

### Usage Guidelines
- Ideal for fields requiring strict text formats like phone numbers, registration codes, tax IDs, etc.
- In the `mask` string, the character `'9'` represents any digit (`0-9`), and any other characters are treated as static delimiters (e.g., `-`, `(`, `)`).
- When a user types, it automatically handles digit validation and formats the input field value accordingly.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `mask` | `string` | The masking pattern to apply (e.g., `"999-999-9999"`). Where `'9'` matches digits and other characters are delimiters. |
| `onChange` | `function` | Callback function triggered when the formatted value changes: `(event) => { ... }`. Passes a synthetic event containing the formatted value in `event.target.value`. |
| `...props` | `object` | All other props are forwarded directly to `BaseInput`. |

### Implementation Example
```jsx
<MaskedInput
  label="Phone Number"
  mask="999-999-9999"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  placeholder="123-456-7890"
/>
```

---

## PasswordInput
**Location:** `src/components/ui/v2/PasswordInput.jsx`

### Description
A secure text input component designed for passwords and other hidden fields. It wraps the standard `BaseInput` with a preset security icon on the left (`"lock"`) and provides an optional right-aligned visibility toggle button that switches the input visibility between obscured (`type="password"`) and plain text (`type="text"`).

### Usage Guidelines
- Use this for any password input fields (e.g., Login, Password Reset, Registration Forms).
- The password visibility toggle button is displayed by default, but can be hidden using `showToggle={false}` if required.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `showToggle` | `boolean` | Whether to display the show/hide password visibility toggle button on the right. Default is `true`. |
| `...props` | `object` | All other props are forwarded to `BaseInput`. |

### Implementation Example
```jsx
<PasswordInput
  label="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
  showToggle={true}
/>
```

---

## SearchInput
**Location:** `src/components/ui/v2/SearchInput.jsx`

### Description
A debounced input component specifically optimized for searching operations. It manages its own internal value state, wraps it with a `"search"` icon on the left, and features an automatic "clear" action button on the right when there is active input. It uses a custom `useDebounce` hook to delay execution of the search callback until the user stops typing.

### Usage Guidelines
- Use this for table filters, list searches, or autocomplete triggers to avoid firing heavy API search requests on every single key stroke.
- Make sure to handle the debounced value in the `onSearch` callback.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `onSearch` | `function` | Callback triggered when the debounced search term updates. Receives the updated search string: `(debouncedSearchTerm) => { ... }`. |
| `debounceTime` | `number` | Debounce delay in milliseconds before triggering `onSearch`. Default is `400`. |
| `placeholder` | `string` | The input placeholder text. Default is `"Search..."`. |
| `...props` | `object` | All other props are forwarded directly to `BaseInput`. |

### Implementation Example
```jsx
<SearchInput
  placeholder="Search students..."
  onSearch={(term) => fetchFilteredResults(term)}
  debounceTime={500}
/>
```

---

## FullScreenSplash
**Location:** `src/components/ui/v2/loaders/FullScreenSplash.jsx`

### Description
A premium full-screen splash loading view designed to keep users engaged during application boot or critical authorization checks. It features a modern dark/light mode background, a pulse background glow effect, an animated bouncing central rocket logo enclosed by expanding circular ping rings, custom status messages, a linear progress bar, and a secure connection status badge at the bottom.

### Usage Guidelines
- Intended for high-level app initialization states (e.g., HydrationGuard during user authentication and config loading).
- It takes up the entire browser window (`fixed inset-0 z-[9999]`) and should only be shown when the rest of the application layout is not yet ready to mount.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `message` | `string` | The message string displayed under the "Welcome Back" title. Default is `"Initializing Dazzling ERP..."`. |

### Implementation Example
```jsx
<FullScreenSplash message="Verifying user credentials..." />
```

---

## ProgressStepper
**Location:** `src/features/student/registration/components/ProgressStepper.jsx`

### Description
A flexible, multi-variant wizard step-progression component. It tracks and highlights the active stage of a sequential workflow (like student registration). It features four visual variants: standard/simple, brand orange, gradient track, and glassmorphic indicator, providing step-level styling, active rings, and complete validation indicators.

### Usage Guidelines
- Use in multi-step wizard layouts (e.g., registration processes, checkout streams, setup wizards).
- Choose the visual layout style that fits the host container via the `variant` prop.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `currentStep` | `number` | The active step index (1-indexed, e.g. `1`, `2`, etc.). |
| `totalSteps` | `number` | The total count of steps in the sequence. Default is `4`. |
| `steps` | `array` | An array of strings representing the step labels. Default is `['Profile', 'Academic', 'Finance', 'Activate']`. |
| `variant` | `string` | Visual style layout variant: `'simple'` (default), `'brand-orange'`, `'gradient-accent'`, or `'glass-indicator'`. |

### Implementation Example
```jsx
<ProgressStepper
  currentStep={2}
  totalSteps={3}
  steps={['Basic Info', 'Upload Documents', 'Review & Pay']}
  variant="glass-indicator"
/>
```

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

---

## KpiCard
**Location:** `src/components/ui/v2/KpiCard.jsx`

### Description
A highly-dense KPI metric display card designed for dashboard summary sections. It supports color-themed variants, Material Symbol icon indicators, three size presets, optional trend indicator nodes, and micro-animations (shadow lift on hover). When `isCount` is false (default), numeric values are automatically formatted as Indian Rupee currency (`₹`).

### Usage Guidelines
- Use to display key financial or operational metrics in dashboard headers (e.g., Total Collected, Pending Dues, Student Count).
- Wrap multiple `KpiCard` instances inside a `KpiGrid` for responsive column layouts.
- For the Finance Dashboard, always use `size="lg"` to maintain visual parity with the established design.
- Use the `trend` prop to embed a small green/red label node showing percentage change.

### Size Variants
| Size | Height | Padding | Label Text | Value Text | Icon Text |
| :--- | :----- | :------ | :--------- | :--------- | :-------- |
| `sm` | `h-16` | `p-2` | `text-[8px]` | `text-sm` | `text-[12px]` |
| `md` | `h-20` | `p-2.5` | `text-[9px]` | `text-base` | `text-[14px]` |
| `lg` | `h-24` | `p-3.5` | `text-[10px]` | `text-lg` | `text-[16px]` |

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `label` | `string` | Uppercase metric identifier displayed at the top-left (e.g. `"TOTAL COLLECTED"`). |
| `value` | `string\|number` | The primary bold display metric. Numeric values are auto-formatted as `₹` currency unless `isCount={true}`. |
| `icon` | `string` | Optional Material Symbol icon name displayed at the top-right. |
| `size` | `string` | Size preset: `'sm'` (compact), `'md'` (standard), or `'lg'` (large, default). |
| `variant` | `string` | Color theme: `'neutral'` (default), `'success'` (emerald), `'warning'` (amber), `'danger'` (rose), or `'info'` (blue). |
| `trend` | `node` | Optional React element rendered at the bottom-right (e.g., a green/red percentage label). |
| `isCount` | `boolean` | If `true`, renders the value as a plain number without currency formatting. Default is `false`. |
| `className` | `string` | Optional custom CSS classes for the card container. |

### Implementation Example
```jsx
import KpiCard from 'src/components/ui/v2/KpiCard';

// Currency metric
<KpiCard
  label="Total Collected"
  value={245000}
  icon="payments"
  variant="success"
  size="lg"
/>

// Count metric with trend
<KpiCard
  label="Total Students"
  value={148}
  icon="group"
  variant="info"
  isCount={true}
  size="lg"
  trend={<span className="text-[9px] font-bold text-emerald-500">+12%</span>}
/>
```

---

## KpiGrid
**Location:** `src/components/ui/v2/KpiGrid.jsx`

### Description
A responsive grid container that wraps `KpiCard` (or any grid-ready children) into configurable column layouts across breakpoints. It uses static class mapping objects internally to guarantee Tailwind CSS compiler detection of all generated utility classes, preventing purge issues in production builds.

### Usage Guidelines
- Always wrap `KpiCard` instances in `KpiGrid` rather than writing raw `grid` divs inline.
- The `cols`, `smCols`, `mdCols`, `lgCols`, and `xlCols` props accept integer values from `1–6` (plus `12` for `cols`). Only provide breakpoints you need — unspecified breakpoints are omitted from the class string.
- Finance Dashboard standard: `cols={1} smCols={2} lgCols={5} gap={3}`.

### Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `children` | `node` | `KpiCard` components or any grid items to wrap. |
| `cols` | `number` | Base column count (mobile-first). Supports `1–6` and `12`. Default is `1`. |
| `smCols` | `number` | Column count on `sm` breakpoint (≥640px). Supports `1–6`. Default is `2`. |
| `mdCols` | `number` | Optional column count on `md` breakpoint (≥768px). Supports `1–6`. Omitted if not provided. |
| `lgCols` | `number` | Optional column count on `lg` breakpoint (≥1024px). Supports `1–6`. Default is `5`. |
| `xlCols` | `number` | Optional column count on `xl` breakpoint (≥1280px). Supports `1–6`. Omitted if not provided. |
| `gap` | `number` | Tailwind gap scale value. Supports `0, 1, 2, 3, 4, 5, 6, 8`. Default is `3`. |
| `className` | `string` | Optional additional CSS classes for the grid container. |

### Implementation Example
```jsx
import KpiGrid from 'src/components/ui/v2/KpiGrid';
import KpiCard from 'src/components/ui/v2/KpiCard';

<KpiGrid cols={1} smCols={2} lgCols={5} gap={3}>
  {kpis.map((kpi, idx) => (
    <KpiCard
      key={idx}
      label={kpi.label}
      value={kpi.value}
      icon={kpi.icon}
      isCount={kpi.isCount}
      variant={kpi.variant}
      size="lg"
    />
  ))}
</KpiGrid>
```

---

## HydrationGuard

**Location:** `src/components/guards/HydrationGuard.jsx`

### Description

App initialization guard that blocks rendering of children/routes until critical ERP initialization data is hydrated and cached.

### Usage Guidelines

Wrap the root provider or private route stack with `HydrationGuard` to guarantee cache presence for child elements.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `children` | `node` | React children to mount after successful data hydration. |

### Implementation Example

```jsx
import HydrationGuard from 'src/components/guards/HydrationGuard';

<HydrationGuard>
  <AdminLayout />
</HydrationGuard>
```

---

## AdminLayout

**Location:** `src/components/layout/AdminLayout.jsx`

### Description

Primary structural skeleton for the administrative route section, providing header layout and sidebar navigation boundaries.

### Usage Guidelines

Used as the route layout component in React Router for `/admin` sub-paths.

### Props API

*This component has no public Props API.*

### Implementation Example

```jsx
import AdminLayout from 'src/components/layout/AdminLayout';

// React Router Route definition
<Route path="/admin" element={<AdminLayout />} />
```

---

## MainLayout

**Location:** `src/components/layout/MainLayout.jsx`

### Description

A flexible three-segment vertical layout (Header, Scrollable Body, Footer) that locks viewport scroll behavior and isolates content scrolling to the body context.

### Usage Guidelines

Used inside dashboard feature panels to maintain sticky header/footer actions panels during scrollable list/detail navigation.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `header` | `node` | Fixed upper segment node element. |
| `body` | `node` | Primary scrollable viewport content area. |
| `footer` | `node` | Fixed lower segment node element (such as `SelectionActionBar`). |
| `className` | `string` | Optional CSS utility class string for customization. |
| `slotClasses` | `object` | Style overrides mapping for `container`, `header`, `body`, and `footer`. |
| `onBodyScroll` | `function` | Scroll callback hook bound directly to the body segment container. |

### Implementation Example

```jsx
import MainLayout from 'src/components/layout/MainLayout';

<MainLayout
  header={<HeaderSegment />}
  body={<BodyContent />}
  footer={<FooterSegment />}
/>
```

---

## Header

**Location:** `src/components/layout/Header.jsx`

### Description

The standard top-bar element containing navigation triggers, branding metadata tags, instant search bar, light/dark theme switchers, and user status indicators.

### Usage Guidelines

Rendered globally by `AdminLayout` at the top of the viewport.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `onMenuClick` | `function` | Callback triggered when the sidebar toggle menu button is clicked (for responsive layout sizes). |

### Implementation Example

```jsx
import Header from 'src/components/layout/Header';

<Header onMenuClick={() => setSidebarOpen(true)} />
```

---

## Sidebar

**Location:** `src/components/layout/Sidebar.jsx`

### Description

The main navigation sidebar, supporting multi-level collapsible group menus, responsive overlay views for mobile screens, and automatic menu expansion based on active route paths.

### Usage Guidelines

Rendered by `AdminLayout` on the side of the main workspace.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `isOpen` | `boolean` | Sidebar drawer visibility state (on mobile devices). |
| `onClose` | `function` | Close callback hook when clicking backdrop or close buttons. |

### Implementation Example

```jsx
import Sidebar from 'src/components/layout/Sidebar';

<Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
```

---

## Card

**Location:** `src/components/ui/Card.jsx`

### Description

A versatile presentation card container supporting distinct visual variants, configurable headers/footers with border separations, backgrounds, and interactive hover highlight styles.

### Usage Guidelines

Used as the standard bounding box/sheet container for form segments, detail dashboards, lists, and charts to preserve depth and consistent structure.

### Props API

#### Card Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `children` | `node` | Inner elements of the card (e.g. Card.Header, Card.Body, Card.Footer). |
| `className` | `string` | Optional CSS custom classes. |
| `variant` | `string` | Visual variant: `'default'` (surface bg), `'primary'` (tinted bg), or `'background'` (transparent surface bg). Default is `'default'`. |
| `onClick` | `function` | Click trigger. If defined, turns cursor to pointer and adds hover shadow animations. |

#### Card.Header Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `children` | `node` | Header titles or control panels. |
| `className` | `string` | Optional CSS custom classes. |
| `border` | `boolean` | If true, adds a border at the bottom segment boundary. Default is `true`. |

#### Card.Body Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `children` | `node` | Core card body contents. |
| `className` | `string` | Optional CSS custom classes. |

#### Card.Footer Props API
| Prop | Type | Description |
| :--- | :--- | :--- |
| `children` | `node` | Footer text or button trays. |
| `className` | `string` | Optional CSS custom classes. |
| `bg` | `boolean` | If true, applies a slate background overlay. Default is `false`. |

### Implementation Example

```jsx
import Card from 'src/components/ui/Card';

<Card variant="default">
  <Card.Header border={true}>
    <h3 className="text-lg font-bold">User Profile</h3>
  </Card.Header>
  <Card.Body>
    <p>User details go here...</p>
  </Card.Body>
  <Card.Footer bg={true}>
    <button>Save Details</button>
  </Card.Footer>
</Card>
```

---

## Badge

**Location:** `src/components/ui/Badge.jsx`

### Description

A static uppercase micro-badge component mapping status conditions directly to semantic status color templates.

### Usage Guidelines

Use for tags, table column labels, or category names where compact status highlights (e.g. "Active", "Pending") are required.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `children` | `node` | Text label/status inside the badge. |
| `variant` | `string` | Color variant: `'default'` (slate), `'primary'` (brand), `'success'` (green), `'warning'` (amber), `'danger'` (red), `'info'` (blue). Default is `'default'`. |
| `className` | `string` | Optional custom classes. |

### Implementation Example

```jsx
import Badge from 'src/components/ui/Badge';

<Badge variant="success">Active</Badge>
```

---

## APIErrorModal

**Location:** `src/components/ui/APIErrorModal.jsx`

### Description

A modal pop-up error dialog that captures backend action failures, showing structured semantic warnings with copyable diagnostics and collapsible technical/stack trace details.

### Usage Guidelines

Bind to global query/mutation error states to inform users of query exceptions, replacing browser alert fallbacks.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `isOpen` | `boolean` | Modal visibility state. |
| `onClose` | `function` | Dismiss click callback to close the modal. |
| `title` | `string` | Error header text. Default is `"API Execution Error"`. |
| `error` | `object` | The error object containing `message`, `type`, `details`, or `stack`. |
| `onRetry` | `function` | Optional callback to retry the failed operation. |
| `retryText` | `string` | Button text for retry callback. Default is `"Try Again"`. |

### Implementation Example

```jsx
import APIErrorModal from 'src/components/ui/APIErrorModal';

<APIErrorModal
  isOpen={hasError}
  onClose={() => setHasError(false)}
  error={apiError}
  onRetry={refetchData}
/>
```

---

## ConfirmModal

**Location:** `src/components/ui/ConfirmModal.jsx`

### Description

A deletion/action confirmation dialog supporting status overlays (idle, processing, success, error) and showing dynamic result feedback labels.

### Usage Guidelines

Used before executing destructive actions (e.g., delete record mutations) to confirm user intent.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `isOpen` | `boolean` | Modal visibility state. |
| `onClose` | `function` | Cancel/dismiss callback hook. |
| `onConfirm` | `function` | Confirm action click hook. |
| `title` | `string` | Modal title. Default is `"Confirm Action"`. |
| `message` | `string` | Descriptive confirmation message. Default is `"Are you sure you want to proceed?"`. |
| `confirmText` | `string` | Bold button confirm text label. Default is `"Delete"`. |
| `cancelText` | `string` | Dismiss action label. Default is `"Cancel"`. |
| `isProcessing` | `boolean` | If true, disables controls and presents spinner overlay. Default is `false`. |
| `status` | `string` | Workflow state: `'idle'`, `'processing'`, `'success'`, `'error'`. Default is `'idle'`. |
| `resultMessage` | `string` | Supporting detail label when status resolves to success/error. |

### Implementation Example

```jsx
import ConfirmModal from 'src/components/ui/ConfirmModal';

<ConfirmModal
  isOpen={isConfirming}
  onClose={() => setIsConfirming(false)}
  onConfirm={handleDeleteRecord}
  title="Delete Course"
  message="This action is irreversible. Proceed?"
/>
```

---

## DeleteDependencyModal

**Location:** `src/components/ui/DeleteDependencyModal.jsx`

### Description

A modal window that blocks item deletion when referenced active dependencies (foreign key violations) exist. It renders parsed violations in an accordion list and redirects users to a detail/conflict resolution page.

### Usage Guidelines

Use in entity managers (e.g. Student Directory, Courses) when a delete request throws referential constraint violations from the backend.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `isOpen` | `boolean` | Modal visibility state. |
| `onClose` | `function` | Close button click handler. |
| `errorPayload` | `object` | The error payload containing the violations list from the API response. |
| `parentId` | `string` | Unique identifier of the record that user wants to delete. |
| `parentName` | `string` | Readable name of the entity being deleted (e.g., student name, course name). |
| `onResolve` | `function` | Callback triggered when a dependency gets resolved or cleared. |
| `parentType` | `string` | Entity type identifier matching mapping dict keys (e.g., `'Student'`, `'Course'`). |

### Implementation Example

```jsx
import DeleteDependencyModal from 'src/components/ui/DeleteDependencyModal';

<DeleteDependencyModal
  isOpen={showBlockers}
  onClose={() => setShowBlockers(false)}
  errorPayload={apiErrorDetails}
  parentId="STU-1002"
  parentName="Jane Doe"
  parentType="Student"
/>
```

---

## ResolveDeleteConflict

**Location:** `src/components/ui/ResolveDeleteConflict.jsx`

### Description

An accordioned helper view that displays database referential conflicts grouped by tables, presenting custom warning notes (e.g. for finance ledgers) and exposing checklist options for single or bulk item deletion.

### Usage Guidelines

Used as a sub-component within `DeleteDependencyModal` or on dedicated conflict resolution full-screen pages.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `blockers` | `array` | A list of parsed blocker objects mapping `blockerTable`, `blockerId`, `foreignKey`, and `detailLabel`. |
| `parentType` | `string` | Entity type name being inspected for deletion. |
| `onItemDeleted` | `function` | Callback hook triggered immediately after a successful mutation deletes an inline dependent item. |

### Implementation Example

```jsx
import { ResolveDeleteConflict } from 'src/components/ui/ResolveDeleteConflict';

<ResolveDeleteConflict
  blockers={parsedBlockers}
  parentType="Course"
  onItemDeleted={refetchDependencies}
/>
```

---

## DataTable

**Location:** `src/components/ui/DataTable.jsx`

### Description

A structured composite template that groups table titles, primary actions buttons, dynamic filters grid bars, loading indicators, empty indicators, and the data table.

### Usage Guidelines

Ideal for primary resource index views (e.g., Courses Catalog, Batches Directory) to standardize lists across features.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | Primary header label text. |
| `subtitle` | `string` | Optional smaller explanation text below the title. |
| `primaryAction` | `node` | Button element aligned to the right (e.g. "Create New"). |
| `secondaryAction` | `node` | Optional button element placed left of primary action. |
| `filters` | `node` | Flex or grid elements comprising the inputs/filters row. |
| `columns` | `array` | List of column configurations: `[{ header: string, accessor: string|func, align?: string, cell?: func }]`. |
| `data` | `array` | Data array to list. Default is `[]`. |
| `isLoading` | `boolean` | Activates loading placeholder table rows. |
| `error` | `object` | Activates table error fallback container. |
| `onRetry` | `function` | Retry callback bound to error indicator button. |
| `emptyMessage` | `string` | Text displayed when data is empty. Default is `"No records found."`. |
| `emptyIcon` | `string` | Material Symbol icon for empty state. Default is `"person_off"`. |

### Implementation Example

```jsx
import DataTable from 'src/components/ui/DataTable';

<DataTable
  title="Batches Directory"
  columns={columnsConfig}
  data={batches}
  isLoading={loading}
/>
```

---

## DataTableV2

**Location:** `src/components/ui/table/DataTableV2.jsx`

### Description

A dense, high-performance visual table component that supports sticky headers, padding density profiles (low, medium, high), fixed height limits, and interactive selected row markers.

### Usage Guidelines

Used for dense detail lists (e.g. installments sheets, transactions history tables) where responsive row clicks and compact sizing are required.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `data` | `array` | Plain records array to render. Default is `[]`. |
| `columns` | `array` | Array of column config definitions. |
| `density` | `string` | Sizing padding: `'low'`, `'medium'`, `'high'`. Default is `'medium'`. |
| `maxHeight` | `string` | CSS max-height limit string (e.g. `"400px"`) that clips vertical bounds and makes header sticky. |
| `stickyHeader` | `boolean` | Makes header float fixed at the top of scroll view. Default is `false`. |
| `isLoading` | `boolean` | Shows loading spinner rows. |
| `error` | `object` | Shows error message row. |
| `onRetry` | `function` | Callback for retry actions in error states. |
| `selectedRowValue` | `any` | Value of selected row identifier for highlighting active selection. |
| `selectedRowKey` | `string` | Record property key to match against selectedRowValue. |
| `onRowClick` | `function` | Row click handler callback: `(row, index) => {}`. |
| `emptyMessage` | `string` | Blank state feedback string. |
| `emptyIcon` | `string` | Material symbol icon name for blank state. |

### Implementation Example

```jsx
import DataTableV2 from 'src/components/ui/table/DataTableV2';

<DataTableV2
  data={installments}
  columns={columns}
  density="high"
  maxHeight="300px"
  stickyHeader={true}
  onRowClick={(row) => console.log('Selected:', row)}
/>
```

---

## ActionFooter

**Location:** `src/components/ui/v2/ActionFooter.jsx`

### Description

A sticky footer action panel specifically structured to render multiple primary/secondary buttons (such as submit, cancel, dismiss) centered at the bottom of the layout viewport.

### Usage Guidelines

Used inside slide-over details, mobile viewports, or CRM sheets to align actionable controls persistently.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `actions` | `array` | List of action objects: `[{ label: string, onClick: func, icon?: string, variant?: string, disabled?: boolean, loading?: boolean }]`. |
| `className` | `string` | Optional CSS custom classes. |

### Implementation Example

```jsx
import ActionFooter from 'src/components/ui/v2/ActionFooter';

const footerActions = [
  { label: 'Cancel', onClick: handleClose, variant: 'outlined' },
  { label: 'Save changes', onClick: handleSave, variant: 'contained', loading: saving }
];

<ActionFooter actions={footerActions} />
```

---

## ProgressBar

**Location:** `src/components/ui/v2/ProgressBar.jsx`

### Description

A horizontal progress visual bar indicator showing completion states, supporting inline label prefixes, computed percentage text labels, and color states.

### Usage Guidelines

Ideal for loading states, setup wizards, file uploads status tracking, or visual completion percentages (e.g. attendance, syllabus completion).

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `value` | `number` | Completed progress quantity. Default is `0`. |
| `max` | `number` | Max limit progress bounds. Default is `100`. |
| `color` | `string` | Filler color theme: `'primary'` (brand), `'success'` (green), `'warning'` (amber), `'danger'` (red). Default is `'primary'`. |
| `size` | `string` | Thickness sizing: `'sm'`, `'md'`, `'lg'`. Default is `'md'`. |
| `variant` | `string` | Layout type: `'default'` (bare progress bar), `'inline'` (aligned on a single row with labels), `'stacked'` (top labels row stacked above bar). Default is `'default'`. |
| `label` | `string` | Header text prefix description. |
| `showPercentage` | `boolean` | Dynamically appends computed `%` label text when true. Default is `false`. |
| `percentageLabel` | `string` | Custom string overriding the default percentage text. |
| `className` | `string` | CSS class string. |

### Implementation Example

```jsx
import ProgressBar from 'src/components/ui/v2/ProgressBar';

<ProgressBar
  value={4}
  max={5}
  variant="stacked"
  label="Installments Paid"
  showPercentage={true}
  color="success"
/>
```

---

## RadioIndicator

**Location:** `src/components/ui/v2/RadioIndicator.jsx`

### Description

A lightweight checkbox/radio mimic component representing selection indicators.

### Usage Guidelines

Ideal for building customizable cards or row checkbox grids where native checkboxes/radios cannot fit the style design.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `checked` | `boolean` | Checked selection indicator state. Default is `false`. |
| `disabled` | `boolean` | Deactivates interactive trigger look. Default is `false`. |
| `className` | `string` | CSS utility classes. |

### Implementation Example

```jsx
import RadioIndicator from 'src/components/ui/v2/RadioIndicator';

<RadioIndicator checked={isSelected} />
```

---

## GenericSelectDropdown

**Location:** `src/components/ui/v2/GenericSelectDropdown.jsx`

### Description

A premium searchable combobox/dropdown component supporting custom item row cards, custom selected item views, dynamic alignment boundaries (automatically adjusting alignment direction when pushed near viewport edges), and standard form name hooks.

### Usage Guidelines

Recommended for selections with complex records (e.g. choosing Students, Batches, Teachers, and Course packages) where standard HTML selects do not support multi-line styling or search filtering.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `items` | `array` | Selection choices data array. Default is `[]`. |
| `selectedId` | `any` | Identifier value of the selected item. |
| `onChange` | `function` | Selection trigger callback returning selected ID: `(id) => {}`. |
| `idProp` | `string` | Record parameter serving as unique ID (e.g. `'batch_id'`). |
| `labelProp` | `string` | Record parameter used for text identification (e.g. `'batch_name'`). |
| `searchFields` | `array` | Parameters scanned by the inline filter (e.g. `['name', 'code']`). |
| `selectedViewMode` | `string` | Presentation mode: `'one-line'`, `'card'`, `'native-fallback'`. Default is `'one-line'`. |
| `placeholder` | `string` | Empty field label placeholder. Default is `"Select an option..."`. |
| `disabled` | `boolean` | Lock component interaction. Default is `false`. |
| `name` | `string` | Native form submit parameter name. |
| `label` | `string` | Uppercase field label. |
| `required` | `boolean` | Appends a red asterisk label indicator when true. |
| `error` | `string` | Displays red validation error text below and wraps input border. |
| `helperText` | `string` | Auxiliary instructional label below component. |
| `leftIcon` | `string` | Material Symbol icon display on trigger control. |
| `renderItem` | `function` | Polymorphic row rendering hook: `(item, isSelected) => node`. |
| `renderSelectedCard` | `function` | Custom header trigger card rendering hook: `(item) => node`. |
| `dropdownWidth` | `string` | Sizing width of the options menu container. Default is `"min-w-full"`. |

### Implementation Example

```jsx
import { GenericSelectDropdown } from 'src/components/ui/v2/GenericSelectDropdown';

<GenericSelectDropdown
  label="Select Batch"
  items={batches}
  idProp="batch_id"
  labelProp="batch_name"
  selectedId={selectedBatchId}
  onChange={setSelectedBatchId}
  searchFields={['batch_name', 'code']}
  renderItem={(item) => (
    <div className="p-3">
      <p className="font-bold">{item.batch_name}</p>
      <p className="text-xs text-slate-400">{item.code}</p>
    </div>
  )}
/>
```

---

## CardContainer

**Location:** `src/components/ui/v2/cards/CardContainer.jsx`

### Description

A base styling wrapper element that implements standard visual themes, border settings, shadow depths, and click scaling micro-animations for cards.

### Usage Guidelines

Used as the core visual container for all custom cards under `src/components/ui/v2/cards/`.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `children` | `node` | Inner content/layout of the card. |
| `className` | `string` | Optional CSS custom classes. |
| `onClick` | `function` | Click callback trigger. |
| `hoverable` | `boolean` | If true, adds hover border/translate scale effects. Default is `true`. |
| `density` | `string` | Sizing border radius profile: `'low'` (rounded-xl) or `'medium'` (rounded-2xl). Default is `'medium'`. |
| `overflowVisible` | `boolean` | If true, overrides default `'overflow-hidden'` with `'overflow-visible'`. Default is `false`. |

### Implementation Example

```jsx
import CardContainer from 'src/components/ui/v2/cards/CardContainer';

<CardContainer hoverable={true} onClick={handleSelect}>
  <p className="p-4">Card content...</p>
</CardContainer>
```

---

## ExpandableLowDensityCard

**Location:** `src/components/ui/v2/cards/ExpandableLowDensityCard.jsx`

### Description

A responsive low-density row card with selection checkbox hooks and a collapsible details panel designed for mobile screens.

### Usage Guidelines

Used inside list views where items must support bulk actions (selection) and detailed metrics without full redirection.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `isChecked` | `boolean` | Checkbox state. |
| `onSelect` | `function` | Checkbox click toggle callback. |
| `isExpanded` | `boolean` | detailed panel toggle state. |
| `onToggleExpand` | `function` | Chevron action toggle callback. |
| `leftHeader` | `node` | Header metadata text elements. |
| `rightHeader` | `node` | Status badges, metrics, or date stamps. |
| `expandedContent` | `node` | Details pane elements mounted when expanded. |
| `onCardClick` | `function` | Card click handler callback. |
| `className` | `string` | Optional CSS custom classes. |

### Implementation Example

```jsx
import ExpandableLowDensityCard from 'src/components/ui/v2/cards/ExpandableLowDensityCard';

<ExpandableLowDensityCard
  isChecked={selected}
  onSelect={toggleSelected}
  isExpanded={expanded}
  onToggleExpand={toggleExpanded}
  leftHeader={<div><p className="font-bold">Student Lead</p></div>}
  rightHeader={<span className="text-xs">Hot Lead</span>}
  expandedContent={<p>Actions & Notes...</p>}
/>
```

---

## HighDensityCard

**Location:** `src/components/ui/v2/cards/HighDensityCard.jsx`

### Description

A feature-dense profile or card summary block supporting avatars (or initials fallbacks), title bars, multi-column metric counters, description bodies, checklists, progress bars, and trailing actions buttons.

### Usage Guidelines

Ideal for detailed grid views (e.g. Teacher directory grids, Branch dashboards) where cards must display complete entity overviews.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `avatar` | `string` | Profile image source URL. |
| `avatarText` | `string` | Initials fallback text if `avatar` URL is missing. |
| `icon` | `string\|node` | Material symbol name or custom JSX node icon fallback. |
| `title` | `string` | Bold primary header text. |
| `subtitle` | `string` | Supporting title text. |
| `idText` | `string` | Monospace identifier text label. |
| `headerActions` | `node` | Control buttons aligned to top right of header. |
| `metrics` | `array` | Metrics list: `[{ label: string, value: any, colorClass?: string }]`. |
| `description` | `string` | Card description body paragraph. |
| `checklist` | `array` | Checklist configuration: `[{ label: string, checked: boolean, icon?: string }]`. |
| `progress` | `object\|number`| Percentage number or progress object: `{ value, max, label, colorClass }`. |
| `footerActions` | `array` | Action buttons tray: `[{ label: string, icon?: string, onClick: func }]`. |
| `customFooter` | `node` | Custom JSX element rendering in the footer tray. |
| `className` | `string` | Custom layout overrides. |
| `slotClasses` | `object` | Styling classes overrides mapping for sub-elements (`container`, `header`, `avatar`, `title`, `subtitle`). |

### Implementation Example

```jsx
import HighDensityCard from 'src/components/ui/v2/cards/HighDensityCard';

<HighDensityCard
  title="Jane Doe"
  subtitle="Lead Instructor"
  avatarText="JD"
  metrics={[{ label: 'Active Batches', value: '4' }]}
/>
```

---

## LowDensityCard

**Location:** `src/components/ui/v2/cards/LowDensityCard.jsx`

### Description

A low-density list view row supporting action menus, avatar/badge layouts, selection checks, progress bars, and capacity limit gauges.

### Usage Guidelines

Used for list directories (such as Batches lists or Course items) where rows must fit cleanly and show status overviews.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `avatar` | `string` | Profile image URL. |
| `avatarText` | `string` | Fallback initials. |
| `icon` | `string` | Material Symbol name fallback. |
| `title` | `string` | Bold primary row header. |
| `subtitle1` | `string` | Primary description text. |
| `subtitle2` | `string` | Secondary details text. |
| `bodyText` | `string` | Small body paragraph. |
| `actions` | `array` | Dropdown actions: `[{ label: string, onClick: func, priority?: string }]`. |
| `onClick` | `function` | Row selection callback trigger. |
| `className` | `string` | Optional CSS custom classes. |
| `slotClasses` | `object` | Overrides classes for `container`, `title`, `body`. |
| `variant` | `string` | Row style: `'default'` or `'selection-card'`. Default is `'default'`. |
| `enrolled` | `number` | Enrolled count (for selection-card variant). Default is `0`. |
| `capacity` | `number` | Max capacity limit (for selection-card variant). Default is `30`. |
| `isSelected` | `boolean` | Selected highlight state. Default is `false`. |

### Implementation Example

```jsx
import LowDensityCard from 'src/components/ui/v2/cards/LowDensityCard';

<LowDensityCard
  title="Advanced Physics Section"
  subtitle1="Class 12 • Science"
  variant="selection-card"
  enrolled={22}
  capacity={25}
/>
```

---

## MediumDensityCard

**Location:** `src/components/ui/v2/cards/MediumDensityCard.jsx`

### Description

A medium-density dashboard card showing trends (up/down/neutral), custom metric pills, metadata tags, progress indicators, and actionable triggers.

### Usage Guidelines

Ideal for analytics boards, KPI overviews, or course package catalog cards.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `icon` | `string` | Material symbol icon name. |
| `avatar` | `string` | Image fallback URL. |
| `badgeText` | `string` | Custom badge text displayed on the top right. |
| `badgeClass` | `string` | Tailwind CSS custom badge classes override. |
| `title` | `string` | Bold header title. |
| `subtitle` | `string` | Smaller description text. |
| `tags` | `array` | Tag array: `[string]` or `[{ label: string, variant: string }]`. |
| `metrics` | `array` | Counters list: `[{ label: string, value: any, colorClass?: string }]`. |
| `progress` | `object\|number`| Progress bar value (percentage number or progress object). |
| `trend` | `object` | Trend parameters: `{ value: string, direction: 'up'\|'down'\|'neutral' }`. |
| `actionText` | `string` | Custom button action text. |
| `onAction` | `function` | Button click event handler. |
| `onClick` | `function` | Full-card selection click callback trigger. |
| `className` | `string` | Custom CSS container classes. |
| `children` | `node` | Custom content elements rendered inside card body. |
| `slotClasses` | `object` | Sub-elements class overrides. |

### Implementation Example

```jsx
import MediumDensityCard from 'src/components/ui/v2/cards/MediumDensityCard';

<MediumDensityCard
  title="Chemistry Pack"
  subtitle="5 Subjects"
  badgeText="POPULAR"
  trend={{ value: '14% Increase', direction: 'up' }}
/>
```

---

## BarChartTrend

**Location:** `src/components/ui/v2/cards/widgets/BarChartTrend.jsx`

### Description

A micro chart widget displaying sequential height percentage bars representing trend statistics.

### Usage Guidelines

Used as visual segments inside layouts to display historical data.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | Widget header title label. |
| `trendBadge` | `string` | Custom pill text highlighting change (e.g. `"+18%"`). |
| `data` | `array` | Bar height percentages list: `[number]`. |
| `labels` | `array` | Axis labels array: `[startLabel, endLabel]`. |
| `tooltips` | `array` | Row value details strings corresponding to data indices. |
| `className` | `string` | Optional CSS custom classes. |

### Implementation Example

```jsx
import BarChartTrend from 'src/components/ui/v2/cards/widgets/BarChartTrend';

<BarChartTrend
  title="Weekly Registration"
  trendBadge="+8%"
  data={[30, 45, 60, 80, 95]}
  labels={['Mon', 'Fri']}
/>
```

---

## CircularProgress

**Location:** `src/components/ui/v2/cards/widgets/CircularProgress.jsx`

### Description

A radial gauge progress widget displaying completion percentages enclosed inside a circular track.

### Usage Guidelines

Used inside dashboard sections to display budget metrics, enrollment statistics, or resource limits.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | Header text description. |
| `percent` | `number` | Completion percentage (0 to 100). Default is `0`. |
| `subtitle` | `string` | Inner circular label text (e.g. `'Allocated'`). |
| `metrics` | `array` | Details metrics array: `[{ label: string, value: any }]`. |
| `className` | `string` | Custom CSS classes. |

### Implementation Example

```jsx
import CircularProgress from 'src/components/ui/v2/cards/widgets/CircularProgress';

<CircularProgress
  title="Syllabus Progress"
  percent={72}
  subtitle="Completed"
  metrics={[{ label: 'Topics Remaining', value: '4' }]}
/>
```

---

## Badge (V2 Indicator)

**Location:** `src/components/ui/v2/indicators/Badge.jsx`

### Description

An atomic indicator component supporting status labels, achievement layouts, numeric notification badges, and small pulsating overlay dots.

### Usage Guidelines

Used for overlays on top of parent layout shapes (e.g., Avatars, notification bells) or for inline pills.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `children` | `node` | Element onto which the badge is anchored as an absolute overlay. |
| `variant` | `string` | Visual variant: `'dot'`, `'count'`, `'status'`, `'achievement'`. Default is `'status'`. |
| `color` | `string` | Theme color variables mapping: `'primary'`, `'secondary'`, `'success'`, `'warning'`, `'error'`, `'neutral'`. Default is `'neutral'`. |
| `content` | `string\|number`| Label description/count displayed inside the pill. |
| `pulsing` | `boolean` | Activates scale pulsing animation (valid for `'dot'` variant). Default is `false`. |
| `size` | `string` | Sizing bounds: `'sm'`, `'md'`, `'lg'`. Default is `'sm'`. |
| `placement` | `string` | Anchor placement: `'top-right'`, `'top-left'`, `'inline'`. Default is `'inline'`. |
| `className` | `string` | Optional CSS custom classes. |

### Implementation Example

```jsx
import Badge from 'src/components/ui/v2/indicators/Badge';

<Badge variant="dot" color="success" pulsing={true} placement="top-right">
  <Avatar initials="JD" />
</Badge>
```

---

## Chip

**Location:** `src/components/ui/v2/indicators/Chip.jsx`

### Description

An interactive selection indicator showing choice items, containing support for leading avatars, customizable close click actions, and active/focused scale transitions.

### Usage Guidelines

Used for list filters, role managers, tag-selections checklist, or active query indicators.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `label` | `string` | Main descriptor label text. |
| `variant` | `string` | Outline/Background combination format: `'filled'`, `'outlined'`, `'subtle'`. Default is `'subtle'`. |
| `color` | `string` | HSL theme color mapping: `'primary'`, `'secondary'`, `'success'`, `'warning'`, `'error'`, `'neutral'`. Default is `'neutral'`. |
| `active` | `boolean` | Highlights active selection borders. Default is `false`. |
| `clickable` | `boolean` | Adds hover effects, pointer indicators, and key selectors. Default is `true`. |
| `size` | `string` | Sizing dimensions: `'sm'`, `'md'`, `'lg'`. Default is `'sm'`. |
| `avatar` | `string\|node` | Leading initials text, image source URL, or custom icon. |
| `onClick` | `function` | Selection trigger callback. |
| `onDelete` | `function` | Close callback hook. If provided, renders trailing close button icon. |
| `className` | `string` | Custom CSS classes. |

### Implementation Example

```jsx
import Chip from 'src/components/ui/v2/indicators/Chip';

<Chip
  label="Mathematics"
  color="primary"
  active={true}
  onDelete={() => handleRemoveFilter('math')}
/>
```

---

## Tag (V2 Indicator)

**Location:** `src/components/ui/v2/indicators/Tag.jsx`

### Description

A static categorization label supporting visual accents, prefix icons, and optional click listeners.

### Usage Guidelines

Used to tag card elements with metadata labels (e.g. course segments, grade categories) where full interactive close buttons are not needed.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `label` | `string` | Text string displayed inside the tag. |
| `variant` | `string` | Layout combination variant: `'filled'`, `'outlined'`, `'subtle'`. Default is `'subtle'`. |
| `color` | `string` | Theme color variables mapping: `'primary'`, `'secondary'`, `'success'`, `'warning'`, `'error'`, `'neutral'`, `'amber'`, `'emerald'`, `'rose'`. Default is `'neutral'`. |
| `size` | `string` | Sizing scale: `'sm'`, `'md'`, `'lg'`. Default is `'sm'`. |
| `icon` | `string\|node` | Prefix Material Symbol icon name or custom element. |
| `onClick` | `function` | Click listener callback hook. |
| `className` | `string` | Optional CSS custom classes. |

### Implementation Example

```jsx
import Tag from 'src/components/ui/v2/indicators/Tag';

<Tag
  label="High Priority"
  color="rose"
  icon="priority_high"
  variant="outlined"
/>
```

---

## Logout

**Location:** `src/components/ui/btn/Logout.jsx`

### Description

An interactive sidebar logout control button that triggers the auth manager context logout workflow with loading spinner feedback.

### Usage Guidelines

Rendered at the bottom of the navigation drawer/sidebar.

### Props API

*This component has no public Props API.*

### Implementation Example

```jsx
import Logout from 'src/components/ui/btn/Logout';

<Logout />
```

---

## RefreshButton

**Location:** `src/components/ui/btn/RefreshButton.jsx`

### Description

A generic refresh control button that displays data hydration fetching/spinning states.

### Usage Guidelines

Used on directory index headers alongside action menus to trigger React Query manual refetches.

### Props API

| Prop | Type | Description |
| :--- | :--- | :--- |
| `isFetching` | `boolean` | Triggers spinning loading animation on the refresh icon. |
| `onRefresh` | `function` | Click handler callback to fetch updated data. |

### Implementation Example

```jsx
import RefreshButton from 'src/components/ui/btn/RefreshButton';

<RefreshButton
  isFetching={isRefetching}
  onRefresh={refetch}
/>
```






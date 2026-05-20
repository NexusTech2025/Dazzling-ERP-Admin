# Select Components (SelectInput, MultiSelect)

A set of advanced selection components powered by a headless selection hook for consistent logic and flexible UI.

## SelectInput
Custom dropdown for single selections.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `options` | `Array<{label, value}>` | `[]` | List of items to select from. |
| `searchable` | `boolean` | `false` | Enables filter input in the dropdown. |
| `placeholder` | `string` | `'Select...'` | Initial text when no value is set. |

```jsx
<SelectInput 
  label="Gender" 
  options={[{label: 'Male', value: 'M'}, {label: 'Female', value: 'F'}]} 
  onChange={(v) => console.log(v)}
/>
```

---

## MultiSelect
Chip-based input for multiple selections.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `Array<any>` | `[]` | Current selected values. |
| `searchable` | `boolean` | `true` | Recommended for multi-select. |

```jsx
<MultiSelect 
  label="Subjects" 
  options={[{label: 'Math', value: 'math'}, {label: 'Physics', value: 'phys'}]} 
  value={['math']}
/>
```

## Internal Architecture: useSelect Hook
The core logic (dropdown opening, filtering, keyboard navigation) is abstracted into `useSelect.js`.

**Returns**:
- `isOpen`: Boolean state of the dropdown.
- `filteredOptions`: Options matching the search query.
- `isSelected(option)`: Helper function for UI state.
- `selectOption(option)`: Action to update state.

## Accessibility Features
- **Keyboard Navigation**: `ArrowDown` / `ArrowUp` to highlight, `Enter` to select, `Esc` to close.
- **Click Outside**: Automatically closes the dropdown when clicking outside the container.
- **Portals (Future)**: Designed for future portal integration to prevent overflow issues.

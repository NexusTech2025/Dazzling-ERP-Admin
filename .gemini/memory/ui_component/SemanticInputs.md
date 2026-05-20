# Semantic Inputs (TextInput, DateInput, PasswordInput)

A family of components that wrap `BaseInput` to provide specific behavior while maintaining a unified UI.

## TextInput
Semantic wrapper for general text entry.

| Unique Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `trim` | `boolean` | `false` | Automatically trims whitespace on blur. |

```jsx
<TextInput trim placeholder="Username" />
```

---

## DateInput
A date-specific input with fixed `type="date"`.

| Unique Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `leftIcon` | `string` | `'calendar_today'` | Default icon for date context. |

```jsx
<DateInput label="Joining Date" />
```

---

## PasswordInput
Secure text entry with a built-in visibility toggle.

| Unique Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `showToggle` | `boolean` | `true` | Show/hide the eye icon button. |
| `leftIcon` | `string` | `'lock'` | Default lock icon. |

```jsx
<PasswordInput label="Account Password" />
```

## Behavior Highlights
- **State Management**: `PasswordInput` manages its own `isVisible` state locally.
- **Inheritance**: All `BaseInput` props (variants, sizes, etc.) are passed through to these components.
- **Accessibility**: All icons and buttons are configured to be `aria-hidden` or correctly labeled for screen readers.

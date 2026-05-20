# FormField

The "Backbone" of the ERP form system. It wraps any input component to provide consistent layout, label management, required markers, and accessibility injection.

## Features
- **Prop Injection**: Automatically injects `id`, `name`, `error`, and `aria-` attributes into its child input.
- **Layout Management**: Supports `vertical` (default) and `horizontal` (standard for admin forms) layouts.
- **Accessibility**: Automatically links labels to inputs and error messages via `aria-describedby`.

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | `string` | `undefined` | Field label. |
| `name` | `string` | `undefined` | Critical for accessibility (links to id). |
| `layout` | `'vertical' \| 'horizontal'` | `'vertical'` | Horizontal layout is optimized for desktop admin panels. |
| `labelWidth` | `string` | `'150px'` | Width of the label column in horizontal layout. |
| `required` | `boolean` | `false` | Shows red asterisk next to label. |
| `error` | `string` | `undefined` | Error text; injected into the child input. |
| `helperText` | `string` | `undefined` | Helper text shown below the input. |

## Usage

### Basic (Vertical)
```jsx
<FormField label="Full Name" name="fullName" required>
  <TextInput placeholder="Enter full name" />
</FormField>
```

### Horizontal Layout (ERP Standard)
```jsx
<FormField label="Email Address" name="email" layout="horizontal" labelWidth="120px">
  <TextInput type="email" leftIcon="mail" />
</FormField>
```

## Accessibility (Child Injection)
FormField uses `cloneElement` to ensure the wrapped input receives:
- `id` matching the `name` prop.
- `aria-invalid` set to true if `error` exists.
- `aria-describedby` linking the input to the error message or helper text.

# BaseInput

The foundational primitive for all input components in the ERP system. It provides consistent styling, variant management, and icon support while remaining logic-agnostic.

## Features
- **Variant System**: Supports `default`, `filled`, and `ghost` styles.
- **Size System**: Supports `sm`, `md`, and `lg` scaling.
- **Icon Support**: Built-in slots for left and right icons (Material Symbols).
- **Ref Forwarding**: Fully supports React `forwardRef` for integration with libraries like React Hook Form.

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `'default' \| 'filled' \| 'ghost'` | `'default'` | Visual style of the input. |
| `inputSize` | `'sm' \| 'md' \| 'lg'` | `'md'` | Vertical padding and font size. |
| `leftIcon` | `string` | `undefined` | Material Symbol name for the left slot. |
| `rightIcon` | `string` | `undefined` | Material Symbol name for the right slot. |
| `error` | `string` | `undefined` | Error message; triggers red border and error text. |
| `helperText` | `string` | `undefined` | Informational text shown below the input. |
| `label` | `string` | `undefined` | Input label. |
| `required` | `boolean` | `false` | Shows red asterisk next to label. |

## Usage

```jsx
import BaseInput from '@/components/ui/v2/BaseInput';

<BaseInput 
  label="Username" 
  leftIcon="person" 
  variant="filled" 
  placeholder="Enter username" 
/>
```

## Design Notes
- **Focus States**: Uses `ring-2 ring-primary/10` for a soft, modern focus glow.
- **Transitions**: All state changes (hover, focus, error) are animated with `duration-200`.
- **Dark Mode**: Fully compatible with `dark:` utility classes using surface and background tokens.

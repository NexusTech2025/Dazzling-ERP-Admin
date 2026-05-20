# FormSection

A card-based layout component designed to group related form fields logically (e.g., "Basic Information", "Account Settings").

## Features
- **Header Structure**: Icon + Title + Action area (for buttons like "Add Subject").
- **Card Styling**: Consistent borders, rounded corners (`2xl`), and subtle background colors.
- **Responsive Grid**: Built-in `grid` system (1 col mobile, 2 col tablet, 3 col desktop) for field children.

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | `undefined` | Section heading. |
| `icon` | `string` | `undefined` | Material Symbol name for the header. |
| `headerAction`| `ReactNode`| `undefined` | Custom component/button in the right of the header. |
| `children` | `ReactNode`| `undefined` | Form fields (usually `FormField` wraps). |

## Usage

```jsx
<FormSection 
  title="Professional Details" 
  icon="work"
  headerAction={<Button>Edit</Button>}
>
  <FormField label="Experience">
    <TextInput placeholder="Years of experience" />
  </FormField>
  <FormField label="Qualification">
    <TextInput placeholder="PhD, MSc, etc." />
  </FormField>
</FormSection>
```

## Styling Notes
- **Grid Layout**: Children are automatically laid out in a responsive grid (`md:grid-cols-2 lg:grid-cols-3`).
- **Borders**: Uses `border-border-light` and `border-border-dark` for standard ERP theming.
- **Headers**: Subtle gray background (`background-light/30`) to distinguish from field area.

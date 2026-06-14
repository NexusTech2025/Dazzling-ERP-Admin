# Specialized Inputs (FileUpload, SearchInput, MaskedInput)

Specialized components for advanced data entry tasks.

## FileUpload
A card-style dropzone for file uploads.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `accept` | `string` | `'*'` | Allowed file types (e.g. `image/*`). |
| `multiple` | `boolean` | `false` | Support for multiple files. |
| `onFileSelect`| `Function` | `undefined` | Callback returning selected file(s). |

```jsx
<FileUpload 
  label="Avatar" 
  accept="image/*" 
  onFileSelect={(file) => console.log(file)}
/>
```

---

## SearchInput
Debounced search with built-in clear action.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `onSearch` | `Function` | `undefined` | Called with debounced value. |
| `debounceTime`| `number` | `400` | Delay in ms. |

```jsx
<SearchInput 
  onSearch={(q) => console.log('Searching for:', q)} 
/>
```

---

## MaskedInput
Input for formatted data patterns.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `mask` | `string` | `undefined` | Pattern using `9` for digits (e.g. `999-99-9999`). |

```jsx
<MaskedInput 
  mask="999-999-9999" 
  label="Mobile Number" 
/>
```

## Best Practices
- **FileUpload**: Always provide a `helperText` indicating allowed formats and max sizes.
- **SearchInput**: Use the default `400ms` debounce for most use cases; increase to `800ms` for heavy API searches.
- **MaskedInput**: Avoid complex masks; use for strictly formatted data like IDs or phone numbers.

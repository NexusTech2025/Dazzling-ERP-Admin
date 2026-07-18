Here is a comprehensive, step-by-step diagnostic and integration guide designed for an AI agent to analyze, refactor, or implement `react-hook-form` with `yup` validation.

---

# AI Agent Protocol: `react-hook-form` + `yup` Integration & Diagnosis

This guide outlines the protocol for diagnosing an existing form implementation and applying the correct pattern for local state management, field-level error feedback, and global validation failure banners.

---

## Phase 1: The Diagnosis Protocol

When handed a component containing a form, run the following checks to evaluate its structural integrity:

### 1. Check for State Redundancy (Local State Rule)

* **Target:** Look for standard React `useState` hooks tracking input values (e.g., `const [email, setEmail] = useState('')`).
* **Diagnostic rule:** If `react-hook-form` is intended to manage the form, individual input `useState` hooks must be removed. `react-hook-form` handles local input state internally via element registration.

### 2. Verify Hook Initialization & Resolver Linking

* **Target:** Check the `useForm` initialization block.
* **Diagnostic rule:** Ensure that the `yup` schema is passed using the `yupResolver` from `@hookform/resolvers/yup`.
* *Incorrect:* `useForm()` (without arguments, or using manual validation functions).
* *Correct:* `useForm({ resolver: yupResolver(schema) })`.



### 3. Verify Input Bindings

* **Target:** Look at the standard HTML `<input>`, `<select>`, or `<textarea>` elements.
* **Diagnostic rule:** Ensure inputs utilize the spread operator with the `register` function.
* *Incorrect:* `<input name="email" value={email} onChange={handleChange} />`
* *Correct:* `<input {...register('email')} />`



### 4. Verify Error Handling Subsystem

* **Target:** Look for global error layouts and field-specific error elements.
* **Diagnostic rule:** Ensure field errors read directly from the `formState.errors` object, and verify that a global error mechanism handles general form validation failures when `handleSubmit` rejects the payload.

---

## Phase 2: The Implementation Blueprint

Provide this complete, standard implementation template to the agent as the reference target.

```tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// 1. Define the Validation Schema using Yup
const formSchema = yup.object({
  username: yup.string().required('Username is a required field.').min(3, 'Must be at least 3 characters.'),
  email: yup.string().email('Please enter a valid email address.').required('Email is required.'),
  password: yup.string().required('Password is required.').min(6, 'Password must be at least 6 characters.'),
}).required();

type FormData = yup.InferType<typeof formSchema>;

export default function ValidatedForm() {
  // 2. Initialize useForm with yupResolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(formSchema),
    mode: 'onSubmit', // Validates on form submission
  });

  const onSubmit = (data: FormData) => {
    console.log('Form successfully submitted data:', data);
    // Handle API submission here
  };

  // Determine if a global generic error banner should be shown
  // Displays only if the user attempted submission and validation failed
  const hasValidationErrors = isSubmitted && !isValid && Object.keys(errors).length > 0;

  return (
    <div className="form-container">
      {/* 3. Global Generic Error Banner */}
      {hasValidationErrors && (
        <div className="global-error-banner" style={{ color: 'white', backgroundColor: 'red', padding: '10px', marginBottom: '15px' }}>
          <strong>Submission Failed:</strong> Please check the highlighted fields below and try again.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Username Input Group */}
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input id="username" {...register('username')} />
          {/* 4. Specific Field Error */}
          {errors.username && <p className="field-error" style={{ color: 'red', margin: '4px 0 0 0' }}>{errors.username.message}</p>}
        </div>

        {/* Email Input Group */}
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register('email')} />
          {/* 4. Specific Field Error */}
          {errors.email && <p className="field-error" style={{ color: 'red', margin: '4px 0 0 0' }}>{errors.email.message}</p>}
        </div>

        {/* Password Input Group */}
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" {...register('password')} />
          {/* 4. Specific Field Error */}
          {errors.password && <p className="field-error" style={{ color: 'red', margin: '4px 0 0 0' }}>{errors.password.message}</p>}
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

```

---

## Phase 3: Step-by-Step Refactoring & Integration Guide

If the diagnosis reveals structural issues or if building from scratch, the AI agent must execute these implementation steps sequentially:

### Step 1: Establish the Validation Contract (`yup`)

Define a declarative `yup` schema outside the component. Ensure every form input matches a key within this schema object, along with explicit error strings inside the validation rules (e.g., `.required('Custom message')`).

### Step 2: Initialize Form State Management

Invoke `useForm`, injecting the `yupResolver(schema)`. Destructure only the necessary ecosystem variables:

* `register`: For binding HTML controls.
* `handleSubmit`: The submission wrapper.
* `formState: { errors, isSubmitted, isValid }`: For conditional UI logic.

> **Note on State Management:** Do not wire up `value` or `onChange` properties manually. `react-hook-form` registers elements via refs under the hood, managing the internal local state dynamically without causing unnecessary component-wide re-renders.

### Step 3: Wire the HTML Form and Input Elements

* Pass `handleSubmit(onSubmit)` directly to the `<form>` element's `onSubmit` prop.
* Spread the execution of `register('fieldName')` onto every raw input element.
* *Crucial:* Ensure the name provided to `register` exactly matches the key inside the `yup` schema definition.

### Step 4: Add Field-Specific Feedback

Directly underneath each input element, insert a conditional rendering block targeting that specific field inside the `errors` object:

```tsx
{errors.fieldName && <span className="error">{errors.fieldName.message}</span>}

```

### Step 5: Add the Global Error Banner

At the top of the form layout, place a container that renders conditionally based on the submission state and form validity:

```tsx
const showGlobalError = isSubmitted && Object.keys(errors).length > 0;

// Render logic:
{showGlobalError && <div className="global-error">Something went wrong. Please review your entries.</div>}

```

Using `isSubmitted && Object.keys(errors).length > 0` ensures the global message cleanly displays immediately upon an invalid submission attempt, without polluting the UI during initial rendering or clean states.



When dealing with predefined, third-party UI libraries (like Material UI, Ant Design, Radix, or custom internal design systems), standard string-based element registration (`{...register('name')}`) fails. This happens because these components often mask the native input element, use custom event signatures instead of standard `ChangeEvent` objects, or manage their own internal focus states.

To handle this, the AI agent needs an updated protocol utilizing the **`<Controller />`** component provided by `react-hook-form`. This component acts as a control wrapper or wrapper bridge, linking the form's core state directly to any custom UI component.

---

## Phase 1: Predefined Component Diagnosis Protocol

The AI agent must run these checks when encountering custom or external input components:

### 1. Identify "Register-Incompatible" Components

* **Target:** Check if the component is a wrapper (e.g., `<CustomInput>`, `<Select>`, `<DatePicker>`, or `<MUI.TextField>`).
* **Diagnostic rule:** If passing `{...register('name')}` breaks layout styling, fails to track value changes, throws ref errors, or the component requires a non-standard `value` structure (like an object or a Date instance), it is **incompatible with direct registration**.

### 2. Check for Manual State Anti-Patterns

* **Target:** Look for instances where developers try to sync third-party components by keeping parallel `useState` hooks and updating the form via `setValue` inside an `onChange` callback.
* **Diagnostic rule:** Flag this as an anti-pattern. The `<Controller />` component removes the need for manual synchronization hooks.

---

## Phase 2: The Controlled Integration Blueprint

Provide this updated template to the agent as the standard pattern for integrating custom, predefined components alongside Yup validation.

```tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Predefined component simulator (representing an incompatible/third-party component)
interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  hasError?: boolean;
}
const CustomSelect = ({ value, onChange, options, hasError }: CustomSelectProps) => (
  <select 
    value={value} 
    onChange={(e) => onChange(e.target.value)}
    style={{ borderColor: hasError ? 'red' : 'gray', display: 'block', width: '100%', padding: '8px' }}
  >
    <option value="">Select a role...</option>
    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
  </select>
);

// 1. Validation Schema
const schema = yup.object({
  fullName: yup.string().required('Name is required.'),
  role: yup.string().required('Please select a valid role.'),
}).required();

type FormData = yup.InferType<typeof schema>;

export default function ControlledForm() {
  const {
    control, // <-- REQUIRED for wrapper controllers
    register, // <-- Can still coexist for native elements
    handleSubmit,
    formState: { errors, isSubmitted, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onSubmit',
    defaultValues: { fullName: '', role: '' } // Good practice when using Controller
  });

  const onSubmit = (data: FormData) => console.log('Submitted Data:', data);
  const hasValidationErrors = isSubmitted && !isValid && Object.keys(errors).length > 0;

  return (
    <div className="form-container">
      {/* Global Generic Error Banner remains unchanged */}
      {hasValidationErrors && (
        <div style={{ color: 'white', backgroundColor: 'red', padding: '10px', marginBottom: '15px' }}>
          <strong>Submission Failed:</strong> Check the form details and re-submit.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Standard Native Input (Using standard register) */}
        <div className="input-group">
          <label>Full Name</label>
          <input {...register('fullName')} />
          {errors.fullName && <p style={{ color: 'red' }}>{errors.fullName.message}</p>}
        </div>

        {/* Predefined / Third-Party Component Layout (Using Controller) */}
        <div className="input-group" style={{ marginTop: '15px' }}>
          <label htmlFor="role-select">Job Role</label>
          
          <Controller
            name="role"
            control={control}
            render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => (
              <>
                <CustomSelect
                  value={value}
                  onChange={onChange} // Passes the updated value straight back to react-hook-form state
                  options={['Developer', 'Designer', 'Product Manager']}
                  hasError={!!error}
                />
                {/* Specific Field Error extracted directly from the controller's local field state */}
                {error && <p style={{ color: 'red', margin: '4px 0 0 0' }}>{error.message}</p>}
              </>
            )}
          />
        </div>

        <button type="submit" style={{ marginTop: '15px' }}>Submit</button>
      </form>
    </div>
  );
}

```

---

## Phase 3: Step-by-Step Controller Refactoring Guide

When the agent needs to transition a predefined component into the form ecosystem, instruct it to execute these actions:

### Step 1: Extract the `control` Object

Ensure the agent extracts `control` from the `useForm` initialization alongside `register`.

```tsx
const { control, register, handleSubmit, formState: { errors } } = useForm(...);

```

### Step 2: Wrap the Component in a `<Controller />`

Isolate the predefined component and wrap it in the `<Controller />` component. Provide two mandatory configuration props:

* `name`: The exact string targeting the validation schema key.
* `control`: The extracted object from Step 1.

### Step 3: Utilize the `render` Callback Injection

The `<Controller />` uses a render prop pattern. Destructure the payload:

* `field`: Contains the operational wiring functions (`onChange`, `onBlur`, `value`, `ref`).
* `fieldState`: Contains target parameters specific to that field, namely `error`.

### Step 4: Map Parameters to the Predefined Props

Map the destructured properties to the properties expected by the third-party framework:

* Connect `field.value` to the component's value prop.
* Connect `field.onChange` to the component's state-change callback mechanism.
* Connect `field.ref` if the component supports forwarding references (critical for automatic error focus tracking).

### Step 5: Unified Error Execution

The agent can choose to read the field error either via the global `errors.role` object or locally from the injected `fieldState.error`. Both reference the identical `yup` validation output, preserving the unified global banner check (`Object.keys(errors).length > 0`) seamlessly.
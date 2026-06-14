# Active Tech Stack Constraints

**Frontend UI:**
* React (Vite environment)
* Tailwind CSS **v4** (Do not document v3 arbitrary value patterns unless required)
* Material Symbols (Do not use FontAwesome or other icon libraries)

**State & Data Fetching:**
* React Query (Strict rule: All data fetching must go through a custom hook, no direct `fetch` calls in components).

**UI Components:**
* All forms must use the internal semantic wrappers (`<FormSection>`, `<TextInput>`, `<SelectInput>`). Do not document raw HTML `<div>` structures for form inputs.

I will search for `overflow-hidden` in `ProfileStep.jsx` to see if there are card containers that might clip absolute dropdown menus.

Searched for "overflow-hidden"

I will search for usage of `StudentRegistrationWizard` in the codebase to inspect the page wrapper or layout structure that might restrict layout bounds.

Searched for "StudentRegistrationWizard"

I will view `AddStudent.jsx` to see the wrapping layout around the wizard component.

Viewed AddStudent.jsx:1-60

I will list the directories in `src/components` to find layout files and check if there are styling rules that could cause overflow or visibility issues.

Listed directory components
Viewed implementation_plan.md:1-81
Viewed ProfileStep.jsx:1-289
Viewed PhoneInput.jsx:1-58
Listed directory v2
Viewed BaseInput.jsx:1-90
Searched for "ProfileStep"
Viewed StudentRegistrationWizard.jsx:1-303
Viewed DateInput.jsx:1-22
Viewed SelectInput.jsx:1-154
Searched for "StudentRegistrationWizard"
Viewed AddStudent.jsx:1-60
Searched for "DashboardLayout"
Listed directory components
Listed directory layout
Viewed AdminLayout.jsx:1-31
Viewed TextInput.jsx:1-29
Searched for "input"
Searched for "@import"
Viewed index.css:1-69
Viewed package.json:1-35
Searched for "ProgressStepper"
Viewed ProgressStepper.jsx:1-225

I have performed a diagnostic review of the **Step One View (Profile Step)** and identified several visibility, overflow, and layout alignment issues in [ProfileStep.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/steps/ProfileStep.jsx) and its surrounding container components:

---

### 1. Severe Text/Input Clipping on Phone Inputs
In the 7:5 desktop layout grid, the right column (which hosts **Section 3: Emergency Contact**) is allocated a narrow space: `col-span-12 lg:col-span-5`.
* **The Squeeze:** Inside Section 3, the `Phone Number` input is wrapped inside a 2-column grid (`grid grid-cols-1 sm:grid-cols-2 gap-4`). At standard desktop resolutions, the entire [PhoneInput](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/PhoneInput.jsx) container is squeezed down to about **`181px`** in width.
* **The Math:**
  * Dropdown width (`w-20`): **`80px`**
  * Left & right inner padding (`px-4`): **`32px`**
  * Left Icon (`call`) and its spacing: **`28px`**
  * **Remaining Input Field Space:** `181px - (80px + 32px + 28px) =` **`41px`** (under 4 characters wide).
* **The Symptom:** Typing a 10-digit number like `9876543210` causes the input text to immediately overflow, clip, and scroll out of view horizontally, making it impossible to read.

---

### 2. Redundant Icon Inside Squeezed `PhoneInput`
* **The issue:** The [PhoneInput](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/PhoneInput.jsx) component passes `leftIcon="call"` to the underlying [BaseInput](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/BaseInput.jsx). 
* **The Symptom:** Rendering a telephone icon right next to a country-code selector like `+91 (IN)` is visually redundant and wastes **`28px`** of horizontal text input space.

---

### 3. Country Code Selector Focus & Border Disparity
* **The issue:** The country code `<select>` dropdown sits adjacent to [BaseInput](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/BaseInput.jsx) inside [PhoneInput](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/PhoneInput.jsx):
  ```jsx
  <select className="border border-r-0 ... rounded-l-lg" />
  <BaseInput className="rounded-l-none" />
  ```
* **The Symptom:** When a user clicks inside the phone number text input, the [BaseInput](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/components/ui/v2/BaseInput.jsx) receives focus and draws a primary focus border/ring. However, the country code `<select>` component does not respond, leaving a disconnected layout where only the right half of the input group indicates focus.

---

### 4. Stepper Horizontal Overflow on Mobile Devices
* **The issue:** In [StudentRegistrationWizard.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/StudentRegistrationWizard.jsx), the stepper is configured to use the `glass-indicator` variant:
  ```jsx
  <ProgressStepper variant='glass-indicator' />
  ```
* **The Symptom:** Inside [ProgressStepper.jsx](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/features/student/registration/components/ProgressStepper.jsx#L152-L197), the `GlassIndicatorStepper` renders a title block, a fixed dot track (`max-w-xs` / `320px`), and a percentage badge horizontally (`flex items-center justify-between gap-6`). On typical mobile devices with screen widths of `320px` to `375px`, the total width exceeds `450px`, causing the progress stepper card to overflow horizontally off the page.

---

### 5. Static 2-Column Mobile Layout Squeezing State / Pincode
* **The issue:** In Section 2 (Contact & Address Details), the fields for State and Pin Code are wrapped inside:
  ```jsx
  <div className="grid grid-cols-2 gap-4">
  ```
* **The Symptom:** Unlike other inputs in the form that gracefully stack vertically on smaller screens, this grid maintains 2 columns at all times. On narrow mobile viewports, this forces labels to truncate and input texts to clip.
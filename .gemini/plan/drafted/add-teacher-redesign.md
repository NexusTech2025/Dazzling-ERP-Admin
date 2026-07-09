---
Date: 2026-07-07T13:50:00+05:30
Status: Approved-Completed
---

# Implementation Plan - Teacher Registration Layout Redesign

Refactor the `TeacherForm` and its orchestrating page controller `AddTeacher` to implement the new two-column high-density layout. Document uploads, subject assignments, and salary configuration settings will be managed via modal popups and represented dynamically as interactive info cards.

## ASCII Layout Wireframe
```
+-------------------------------------------------------------------------------------------------------------------+
|  [Profile Photo]   Status: [Active]      Teacher Type: [Full Time]    Joining Date: [19-05-2026]   Experience: [6] |
|  (Change Photo)    Branch: [Jaipur]      Created By: [Admin]                                                      |
+-----------------------------------------------------------------+-------------------------------------------------+
| LEFT PANEL (Forms & Documents)                                  | RIGHT PANEL (Subjects & Salary)                 |
+-----------------------------------------------------------------+-------------------------------------------------+
|  [Personal Information]                                         |  [Subjects (3)]                 [+ Add Subject] |
|  Full Name*       Mobile Number*      Email                     |  +-------------------------------------------+  |
|  [             ]  [            ]      [                     ]   |  | Organic Chemistry              (Edit)(Del) |  |
|  Gender           Date of Birth       Preferred Time Slot       |  | Code: CRS-CHEM-101  Status: [Active]        |  |
|  [             ]  [            ]      [                     ]   |  +-------------------------------------------+  |
|  ...                                                            |  | Physical Chemistry             (Edit)(Del) |  |
|                                                                 |  +-------------------------------------------+  |
|  [Login Account]  (Login will be created)                       |                                                 |
|  Username         Password                                      |  [Salary Configurations (2)]  [+ New Salary]    |
|  [             ]  [            ]                                |  +-------------------------------------------+  |
|                                                                 |  | Monthly Fixed (₹45,000)        (Edit)(Del) |  |
|  [Documents (3)]                     [+ Upload Document]        |  | Scope: Global      Status: [Drafted]         |  |
|  +------------------+ +------------------+ +------------------+  |  +-------------------------------------------+  |
|  | Resume.pdf       | | Aadhaar Card.pdf | | Certificate.pdf  |  |  | Revenue Sharing (20% Rev)      (Edit)(Del) |  |
|  | [PDF] 2.4 MB     | | [PDF] 1.8 MB     | | [PDF] 1.2 MB     |  |  +-------------------------------------------+  |
|  +------------------+ +------------------+ +------------------+  |                                                 |
+-----------------------------------------------------------------+-------------------------------------------------+
|                               [Cancel]     [Save Draft]    [Register Teacher]                                     |
+-------------------------------------------------------------------------------------------------------------------+
```

---

## Traceability & References (Rule N2)
* **Referenced Schemas:**
  * `DazzlingDB/Config/Schema/Staff/Teacher.json`
  * `DazzlingDB/Config/Schema/Staff/TeacherSalaryConfig.json`
* **Referenced Core Modules:**
  * [AddTeacher.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/pages/admin/AddTeacher.jsx)
  * [TeacherForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/TeacherForm.jsx)

---

## Boundary Declaration: Facts vs. Assumptions (Rule N3)
* **Actual Verified Facts:**
  * The current form layout is vertical and single-column, causing extreme vertical height when all fields are rendered.
  * Salary configurations during creation are currently hardcoded to a single entry in `formData`, limiting multiple payroll setup capabilities.
* **System Assumptions:**
  * In "Add Mode", salary configs, subjects, and documents will be accumulated in local component state arrays and sent as a single unified payload on clicking "Register Teacher".
  * In "Edit Mode", these sub-entities can either be manipulated locally and patched, or saved directly using their respective mutation hooks with real-time feedback.

---

## Proposed Changes

### Component: Teacher Features

#### [MODIFY] [TeacherForm.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/TeacherForm.jsx)
Redesign the form structure to support the dual-column layout.
1. **Top Header/Metadata Block**: Displays profile photo uploader alongside metadata like Status, Teacher Type, Joining Date, Experience, Branch, etc.
2. **Left Column**:
   - **Personal Information Card**: High-density grid containing Name, DOB, Gender, Mobile, Email, Address, Specialization, and Qualification.
   - **Login Account Card**: Username, Password fields with toggle validation.
   - **Documents Grid Card**: Grid layout displaying uploaded documents as cards, with a "+ Upload Document" trigger.
3. **Right Column**:
   - **Subjects Card**: Assigned course list showing code, name, department, status, and action buttons, with a "+ Add Subject" trigger.
   - **Salary Configurations Card**: Added contracts list showing types, amounts, scopes, validity windows, and action buttons, with a "+ New Salary Configuration" trigger.

---

### Component: Modals & Integrations

#### [NEW] [DocumentUploadModal.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/profile/DocumentUploadModal.jsx)
A modal to select document type (ID Proof, Resume, Certificate) and upload a file.

#### [MODIFY] [SalaryConfigModal.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/features/teacher/components/profile/SalaryConfigModal.jsx)
Enhance the modal to support a "local-only" memory mode when used inside the onboarding registration flow. Instead of triggering TanStack mutations directly, it will pass the configured salary object back to `TeacherForm` via an `onSubmitLocal` callback.

##### Planned Code Changes Snippet:
```javascript
/**
 * Processes form submission. Runs validation checks and delegates payload handling.
 * 
 * @param {Object} data - Validated form field parameters from useForm.
 * @returns {void}
 */
const onSubmitForm = (data) => {
  const payload = {
    salaryConfigType: data.salaryConfigType,
    rateType: data.rateType,
    baseValue: Number(data.baseValue),
    scopeType: data.scopeType,
    scopeId: data.scopeId || null,
    totalContractValue: data.totalContractValue ? Number(data.totalContractValue) : null,
    effectiveFrom: data.effectiveFrom,
    effectiveTo: data.effectiveTo || null,
    remark: data.remark || null,
    notes: data.notes || null,
    contractStatus: data.contractStatus,
    settlementState: data.settlementState
  };

  // Enforce mutual exclusivity of onSubmit and onSubmitLocal callbacks
  if (onSubmit && onSubmitLocal) {
    throw new Error('SalaryConfigModal: onSubmit and onSubmitLocal callbacks are mutually exclusive and cannot both be provided.');
  }

  // If local callback is registered, delegate payload and close modal immediately
  if (onSubmitLocal) {
    onSubmitLocal(payload);
    onClose();
    return;
  }

  // If custom onSubmit is registered, execute it instead of mutations
  if (onSubmit) {
    onSubmit(payload);
    return;
  }

  // Fallback to query client mutation engine for profile view mode
  const options = {
    onSuccess: (res) => { ... },
    onError: (err) => { ... }
  };

  if (config) {
    updateConfigMutation.mutate({ teacherId, salaryConfigId: config.salary_config_id, data: payload }, options);
  } else {
    setConfigMutation.mutate(payload, options);
  }
};
```

---

### Component: Controller

#### [MODIFY] [AddTeacher.jsx](e:/NAST/Dazzling/ERP System/dazzling-erp-admin/src/pages/admin/AddTeacher.jsx)
Update payload mapping to support validation sanitization and key transformations matching the API specifications:
* Parse `experience_years` as integer: `parseInt(formData.experience_years, 10)`.
* Map root notes correctly: `notes: formData.internal_notes || null`.
* Sanitize `subjects` to string arrays of Course IDs: `subjects: formData.subjects || []`.
* Sanitize `documents` to `{ file_url: string, document_type: string }` structures.
* Extract only the first/active salary configuration from local form state under the singular snake_case parameter key **`salary_config`**, mapping camelCase form properties to snake_case API specifications.

##### Method Signatures & JSDoc (Rule N1)

```javascript
/**
 * Submits the unified teacher onboarding payload to the staff_onboard_teacher endpoint.
 * 
 * @param {Object} formData - Full combined form parameters including arrays of subjects, salaryConfigs, and documents.
 * @returns {Promise<void>}
 */
const handleFormSubmit = useCallback(async (formData) => {
  const primarySalary = formData.salaryConfigs?.[0]; // Extract primary active configuration
  
  const requestPayload = {
    full_name: formData.full_name,
    mobile_number: formData.mobile_number,
    email: formData.email || null,
    experience_years: parseInt(formData.experience_years, 10) || 0,
    qualification: formData.qualification || null,
    teacher_type: formData.teacher_type,
    joining_date: formData.joining_date,
    branch_id: formData.branch,
    address: formData.address || null,
    status: formData.status,
    notes: formData.internal_notes || null, // Map internal_notes to root notes key
    subjects: formData.subjects || [],     // Sanitize to string course ID list
    userData: formData.createLogin ? {
      username: formData.username,
      password: formData.password
    } : undefined,
    salary_config: primarySalary ? {        // Map singular config and transform keys
      salary_config_type: primarySalary.salaryConfigType,
      rate_type: primarySalary.rateType,
      base_value: Number(primarySalary.baseValue),
      scope_type: primarySalary.scopeType,
      scope_id: primarySalary.scopeId || null,
      effective_from: primarySalary.effectiveFrom,
      effective_to: primarySalary.effectiveTo || null,
      total_contract_value: primarySalary.totalContractValue ? Number(primarySalary.totalContractValue) : null,
      remark: primarySalary.remark || null,
      notes: primarySalary.notes || null,
      contract_status: primarySalary.contractStatus || 'drafted',
      settlement_state: primarySalary.settlementState || 'unsettled'
    } : undefined,
    documents: formData.documents?.map(doc => ({
      file_url: doc.file_url || doc.url,
      document_type: doc.document_type || 'other'
    })) || []
  };

  // Dispatch addMutation/updateMutation as appropriate...
}, [isEditMode, id, addMutation, updateMutation]);
```

---

## Performance Regression & Benchmark Assertions (Rule N5)
* **Typing Benchmarks**: Ensure keystroke lag does not exceed 16ms inside the Personal Information forms by keeping sub-sections memoized and independent.

## Legacy Maintenance Mitigation (Rule N6)
No legacy code conflicts are introduced. Existing edit modes will fetch and map data to the same cards.

---

## Verification Plan

### Manual Verification
1. Open "/admin/teachers/new".
2. Fill in Personal Details, upload two mock documents via the modal, select two subjects, and create a "Monthly Fixed" salary configuration.
3. Assert that all info cards render correctly on the registration page before clicking submit.
4. Click "Register Teacher" and check database payload parameters.

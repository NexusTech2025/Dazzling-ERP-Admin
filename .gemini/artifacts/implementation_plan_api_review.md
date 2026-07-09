# Implementation Plan Review: Teacher Registration Layout Redesign

This analysis compares the proposed [implementation_plan.md](file:///C:/Users/manis/.gemini/antigravity-ide/brain/84dcd0fc-c72c-4473-ae7f-574b8c213d54/implementation_plan.md) with the updated API contract documented in [teacher_onboard_api.md](file:///E:/NAST/Dazzling/GAS/docs/client/teacher_onboard_api.md).

---

## 📋 API Schema Alignment Review

### 1. Root Profile Parameter Alignments
* **`notes` vs `internal_notes`:**
  * The API specification ([teacher_onboard_api.md Line 55](file:///E:/NAST/Dazzling/GAS/docs/client/teacher_onboard_api.md#L55)) uses **`notes`** at the root of the teacher payload.
  * In the existing code, form fields frequently mapped to `internal_notes`. The UI registration mapping layer in the implementation plan must map `formData.internal_notes` -> `notes` to align with the server validation engine.
* **`experience_years` type:**
  * The API defines this field as a **number** ([teacher_onboard_api.md Line 41](file:///E:/NAST/Dazzling/GAS/docs/client/teacher_onboard_api.md#L41)).
  * The implementation plan must ensure parsing handles this cleanly: `parseInt(formData.experience_years, 10)` before payload delivery.

### 2. Initial Salary Configuration (`salary_config`) Block
The implementation plan proposes collecting a list of `salaryConfigs` inside the local form state. However, the onboarding API specification accepts exactly **one** initial configuration object under the parameter key **`salary_config`** ([teacher_onboard_api.md Line 64-78](file:///E:/NAST/Dazzling/GAS/docs/client/teacher_onboard_api.md#L64-L78)).

* **Single vs Multiple Initial Configs:**
  * **API Limitation:** `StaffService.onboardTeacher` expects a single object for `salary_config` at registration, not an array.
  * **Plan Adjustment:** The implementation plan wireframe and controller submit logic show "Salary Configurations (2)" and suggest sending an array of multiple contracts during registration. The plan **must be revised** to either:
    1. Only send the primary active contract under `salary_config` during onboarding, and save subsequent configurations post-registration.
    2. Revise the controller payload mapping to extract the first/active contract from the UI's local array to populate the singular `salary_config` API envelope.
* **Property Key Discrepancies:**
  * **`salary_config_type`:** The API uses **`salary_config_type`** ([teacher_onboard_api.md Line 66](file:///E:/NAST/Dazzling/GAS/docs/client/teacher_onboard_api.md#L66)). The planned codebase code snippet maps this to `salaryConfigType` (camelCase).
  * **`base_value`:** The API uses **`base_value`** ([teacher_onboard_api.md Line 68](file:///E:/NAST/Dazzling/GAS/docs/client/teacher_onboard_api.md#L68)). The planned codebase snippet maps it to `baseValue` (camelCase).
  * **`scope_type`:** The API uses **`scope_type`** ([teacher_onboard_api.md Line 69](file:///E:/NAST/Dazzling/GAS/docs/client/teacher_onboard_api.md#L69)). The planned codebase snippet maps it to `scopeType` (camelCase).
  * **`effective_from` / `effective_to`:** The API uses snake_case (`effective_from`, `effective_to`) ([teacher_onboard_api.md Line 70-71](file:///E:/NAST/Dazzling/GAS/docs/client/teacher_onboard_api.md#L70-L71)). The planned codebase snippet maps it to camelCase (`effectiveFrom`, `effectiveTo`).
  * **`total_contract_value`:** The API uses **`total_contract_value`** ([teacher_onboard_api.md Line 72](file:///E:/NAST/Dazzling/GAS/docs/client/teacher_onboard_api.md#L72)). The planned codebase snippet maps it to `totalContractValue`.
  * **`contract_status` / `settlement_state`:** The API uses snake_case (`contract_status`, `settlement_state`) ([teacher_onboard_api.md Line 76-77](file:///E:/NAST/Dazzling/GAS/docs/client/teacher_onboard_api.md#L76-L77)). The planned codebase snippet maps it to camelCase (`contractStatus`, `settlementState`).

> [!WARNING]
> The orchestrating `AddTeacher` page controller must run a key transformation step to convert camelCase UI form states to the snake_case keys expected by the onboarding API (`salary_config_type`, `base_value`, `scope_type`, etc.) before dispatching `addMutation`.

### 3. Subject Assignment Mapping (`subjects`)
* **Data Contract:** The API expects an array of strings representing Course IDs: `["CRS-TEST-CHEM101"]` ([teacher_onboard_api.md Line 81-83](file:///E:/NAST/Dazzling/GAS/docs/client/teacher_onboard_api.md#L81-L83)).
* **Validation:** The implementation plan must verify that subjects selected via `CourseSelectionModal` map down to an array of string primary keys (course IDs) instead of passing full course objects directly in the API payload.

### 4. Verification Documents Block (`documents`)
* **Property Key Discrepancies:**
  * **`document_type`:** The API uses **`document_type`** ([teacher_onboard_api.md Line 89](file:///E:/NAST/Dazzling/GAS/docs/client/teacher_onboard_api.md#L89)) with choices `["id_proof", "resume", "other"]`.
  * **`file_url`:** The API uses **`file_url`** ([teacher_onboard_api.md Line 88](file:///E:/NAST/Dazzling/GAS/docs/client/teacher_onboard_api.md#L88)).
* **Validation:** Ensure the document array maps each object to `{ file_url: string, document_type: string }`.

---

## 🛠️ Recommended Action Items for the Implementation Plan

1. **Transform Key Case:** The controller mapping layer inside `handleFormSubmit` must perform explicit transformation mapping:
   ```javascript
   salary_config: formData.salaryConfig ? {
     salary_config_type: formData.salaryConfig.salaryConfigType,
     rate_type: formData.salaryConfig.rateType,
     base_value: Number(formData.salaryConfig.baseValue),
     scope_type: formData.salaryConfig.scopeType,
     scope_id: formData.salaryConfig.scopeId || null,
     effective_from: formData.salaryConfig.effectiveFrom,
     effective_to: formData.salaryConfig.effectiveTo || null,
     total_contract_value: formData.salaryConfig.totalContractValue ? Number(formData.salaryConfig.totalContractValue) : null,
     remark: formData.salaryConfig.remark || null,
     notes: formData.salaryConfig.notes || null,
     contract_status: formData.salaryConfig.contractStatus || 'drafted',
     settlement_state: formData.salaryConfig.settlementState || 'unsettled'
   } : undefined
   ```
2. **Restrict Onboarding Configurations:** Modify the onboarding UI wireframe logic to restrict initial salary config to a single active contract selection. Alternatively, if multiple configs are captured locally, extract only the primary active contract for the onboarding payload envelope, saving secondary contracts post-registration via individual mutations.
3. **Array Sanitization:** Ensure `subjects` maps to an array of course ID strings before mutating.

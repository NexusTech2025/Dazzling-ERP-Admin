# Antigravity & Gemini Operational Guidelines

Welcome! This file documents our established architectural patterns, UI standards, API integration practices, and workflow conventions for the **Dazzling ERP Admin** codebase. Any AI coding assistant working on this codebase **MUST** read and adhere to these instructions.

---

## 1. Core Operational Principles

1. **Adhere to Conventions**: Rigorously follow the project's existing structure, file layout, and directory patterns (e.g. modular features folders under `src/features/` and page controllers under `src/pages/`).
2. **Verify Dependencies**: Never assume a package, library, or framework is present. Proactively check `package.json` first.
3. **Integrate Idiomatically**: Write code that blends seamlessly with the surrounding logic and coding style (matching modern React standards, using Hooks, TanStack Query, and React Router).
4. **Use Comments Sparingly**: Avoid obvious comments explaining *what* the code does. Focus strictly on *why* non-obvious architecture or business logic was chosen.
5. **No Ad-Hoc Styling**: Reuse established tokens and utilities. Do not write vanilla inline styles unless absolutely necessary.
6. **Ask Before Expanding Scope**: Fulfill user requests precisely. Do not introduce major additions or side modifications without explicit permission.
7. **Use Absolute Paths**: Always use absolute paths for file system operations.
8. **No Reversions**: Do not roll back, undo, or overwrite completed files or features unless explicitly requested to.
9. **Explain Critical Commands**: Before running shell or CLI commands that modify files, explain their purpose and scope.
10. **Prioritize Security**: Never log, expose, or commit secrets, credentials, tokens, or API keys.
11. **Primary Database Schema**: The local `src/Schema` directory is outdated and **MUST NOT** be followed. Refer exclusively to `E:\NAST\Dazzling\GAS\DazzlingDB\full_schemav3.json` (schema version 2.0.1) as the primary source of truth for all database tables and fields.
12. **REST API Documentation**: Refer to `E:\NAST\Dazzling\GAS\DazzlingDB\REST-api-doc.md` for the official REST API request/response format rules during code editing, debugging, or diagnostics. If the rules for a specific REST API action are undefined or ambiguous, notify the user immediately before proceeding.

---

## 2. UI & Design System Guidelines (V2 Atomic UI)

We utilize a modern, highly aesthetic dark-mode slate theme featuring glassmorphism and subtle micro-animations.

*   **Atomic V2 Inputs**: Always use unified components found under `src/components/ui/v2/`:
    - `FormField`: Handles labels, subtext, errors, and styling.
    - `TextInput`: Handles standard texts, emails, passwords with left icons.
    - `PhoneInput`: Handles formatted 10-digit mobile numbers.
    - `SelectInput`: Handles searchable or standard select lists.
    - `RadioGroup`: For clean button grids or list selectors.
*   **High-Density Layouts**:
    - Use responsive grids: `grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8` to separate core input sheets from secondary CRM tools.
    - Container width guidelines: Core single-column is `max-w-2xl`, while two-column layouts scale gracefully to `max-w-5xl`.
*   **Collapsible UI & Accordion Systems**:
    - Integrate collapsible drawers (`showCrmOptions`, `showPriorityOptions`) to minimize vertical scrolling.
    - Use smooth CSS transitions (`transition-all duration-300 ease-in-out overflow-hidden`) with height gates (`max-h-[500px]` vs `max-h-0`).
    - **Crucial Rule**: When accordions are collapsed, always show a dynamic, live text summary pill (e.g. `Walk-In • Hot Lead • Clear Form`) on the header to ensure parameters are visible at a glance without expanding.

---

## 3. API Integration & Payload Conventions

We connect to a live Google Apps Script (GAS) web app backend for production CRUD operations, paired with a TanStack Query (React Query) layer.

*   **Real API vs. Mock API**:
    - Real endpoints are maintained under `src/services/api.js` and imported in `src/features/[feature]/api/[feature].api.js`.
    - For development/preview, mock lists are maintained under `src/features/[feature]/api/[feature].mockApi.js`.
    - Always ensure core operations (such as lead additions or registrations) target the real `*.api.js` production methods rather than mock files when hitting production stages.
*   **Unregistered Student Lead (Prospect) Payload Structure**:
    - Unregistered student leads/prospects are decoupled from the core student registration, targeting a dedicated Leads table on the backend.
    - We utilize the centralized `apiRegistry.js` action `'STUDENT.ADD_LEAD'` which maps to `'student_add_lead'`.
    - UI components call the `useCreateStudentLeadMutation` query hook and submit only a flat `leadData` object. The modern `apiClient` automatically structures and transmits it inside a `payload` envelope:
      ```javascript
      const leadData = {
        student_name: formData.fullName.trim(),
        phone: formData.mobile.replace(/\D/g, ''),
        email: formData.email.trim() || null,
        batch_id: formData.batchId,
        status: 'prospect',
        is_registered: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      ```
*   **Observability & Debugging**:
    - Always log outgoing payloads and incoming responses in mutation callbacks:
      - `console.log('[Component] Submitting Request:', payload);`
      - `console.log('[Component] API Response:', response);`
      - `console.error('[Component] API Error:', err);`

---

## 4. Git & Sandbox Rules

*   **Staging & Commits**: Never perform aggressive git additions (like `git add .`) or make commits unless the user explicitly asks you to.
*   **Non-Destructive Work**: Never run physical file deletion commands like `git clean` or `git rm` that destroy untracked files or local staging states. Keep all operations stage-only and non-destructive.

---

## 5. Artifact Archival Policies

To ensure that both future AI agents and human developers have immediate local access to architectural designs and verification records, we maintain local backup directories under `.gemini/`:

*   **Implementation Plans**:
    - **Target Directories**:
      - Drafted/Proposed: `dazzling-erp-admin/.gemini/plan/drafted/`
      - Approved: `dazzling-erp-admin/.gemini/plan/approved/`
      - Completed/Implemented: `dazzling-erp-admin/.gemini/plan/completed/`
    - **Naming Convention**: Use a descriptive, proper title in lowercase kebab-case (e.g. `student-quick-add-mode.md`).
    - **Frequency**: Save a backup of the approved `implementation_plan.md` under the designated plan subdirectories.
    - **Metadata Headers**: Every plan MUST include standard YAML frontmatter:
      ```yaml
      ---
      Date: YYYY-MM-DDTHH:MM:SS+05:30
      Status: [Proposed | Approved | Approved-Completed]
      ---
      ```
    - **Status Updates & File Movement Rule**: The agent is responsible for updating the `Status:` field in the plan's YAML frontmatter. However, the agent **MUST NOT** physically move or rename files between these subdirectories automatically. File organization/movement in the file system is managed exclusively by the user.

*   **Walkthroughs**:
    - **Target Directory**: `dazzling-erp-admin/.gemini/walkthrough/`
    - **Naming Convention**: Match the corresponding plan title in lowercase kebab-case (e.g. `student-quick-add-mode.md`).
    - **Frequency**: Save a backup of the finalized `walkthrough.md` here immediately after finishing all development and manual validation.
    - **Metadata Headers**: Always include a header at the top recording:
      - **Date**: ISO timestamp of completion and verification (e.g. `2026-05-20T15:10:00+05:30`)
      - **Status**: The state of the work (e.g. `Completed`, `Verified`)

*   **Core Plan Lifecycle Instructions**:
    - For full details, operational constraints, and metadata guidelines regarding the plan lifecycle, see the master core instructions file: [instructions.md](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.gemini/memory/core/instructions.md).

---

## 6. Database Schema Source of Truth

*   **Outdated Schema Directory**: The directory `src/Schema/` is completely deprecated and **MUST NOT** be used or referenced for schema definitions.
*   **Primary Source of Truth**: The database schema contract is defined in `E:\NAST\Dazzling\GAS\DazzlingDB\full_schemav3.json` (schema version 2.0.1). Always refer to this master file for table columns, constraints, relations, and primary keys.

---

## 7. REST API Documentation Source of Truth

*   **Primary Source of Truth**: The REST API specifications are defined in `E:\NAST\Dazzling\GAS\DazzlingDB\REST-api-doc.md`. Always follow the documented action keys, request payload structures, and response envelopes.
*   **Undefined Actions Protocol**: If a needed REST API action is not defined, or its payload constraints are not documented in the API specification, stop and notify the user to clarify the schema requirements.

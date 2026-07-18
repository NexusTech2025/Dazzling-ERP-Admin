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
11. **Primary Database Schema**: The local `src/Schema` directory is outdated and **MUST NOT** be followed. Refer exclusively to the decoupled, domain-grouped JSON schema files inside `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\` as the primary source of truth for all database tables and fields.
12. **REST API Documentation**: Refer to `E:\NAST\Dazzling\GAS\DazzlingDB\REST-api-doc.md` for the official REST API request/response format rules during code editing, debugging, or diagnostics. If the rules for a specific REST API action are undefined or ambiguous, notify the user immediately before proceeding.
13. **Centralized Query Keys**: Always define and reference React Query cache keys exclusively via the centralized Query Key Factory in [queryKeys.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/queryKeys.js). Do not write raw query key arrays inline in hooks or mutations; use the factory methods to prevent cache collisions and guarantee invalidation consistency.
14. **Shell Execution Rule**: Do NOT run any terminal or shell commands using any kind of prefix (such as `cmd /c`). The agent must always show/propose the full, direct command without prefixes so the user can review and run it.
15. **File Copy & Move Operations**: Never copy or move files by reading the content from one location and writing it to another. Doing so consumes excessive tokens and creates redundant operations. Always execute shell/terminal commands using the `run_command` tool to perform copies (`Copy-Item`, `cp`, `copy`) or moves (`Move-Item`, `mv`, `move`) directly.

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
*   **Presentational Preset Components (`src/components/ui/presets/`)**:
    - Paired value displays (date ranges, time ranges) must use the preset components: `DateRange`, `TimeRange`, `DateDisplay`, and `Time`.
    - Presets compose atomic primitives (`DateDisplay`, `Time`, `Badge`) into standardized display patterns.
    - Support `layout` (`horizontal` / `vertical`), `useBadge`, and `className` props for flexible placement.
*   **Domain-Specific Shared Components (`src/components/domain/`)**:
    - Components shared across multiple feature entities but specific to a domain pattern (e.g. `ProfileHero` used by batches, students, and teachers) are placed here.
    - These differ from generic UI primitives by encoding domain-specific layout patterns (profile hero 3-tier layouts, entity cards, etc.).

---

## 3. API Integration & Payload Conventions

We connect to a live Google Apps Script (GAS) web app backend for production CRUD operations, paired with a TanStack Query (React Query) layer.

*   **Absolute Deprecation of Mock Data**:
    - The mock API data directory has been completely deleted. We **MUST NEVER** use or create mock files or mock data.
    - All data fetching and mutations must interact exclusively with the live API client.
*   **Centralized Cache & Schema Validation Layer**:
    - All queries and cache lookups must pass through the centralized cache helpers (`src/lib/react-query/cacheHelper.js`), which run data normalization and validate payloads against the schema engine.
    - Read-time queries must delegate relational stitching to the selector layer via `hydrateRecord` (found in `src/lib/react-query/hydrate.js`), which enforces strict validation check constraints dynamically before passing records to UI components.
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
*   **Transactional Accounting (Finance Dashboard & Student Fees) Batch API Pattern**:
    - Retrieve all student fee accounts, installments, payments, and fee adjustments in a single post request using `"sheet_get_accounting_data"`.
    - Cache results globally via React Query under key `['finance', 'accounting-data']`.
    - Implement a dynamic master-detail dashboard; selecting a student from the directory updates the side-by-side Installments and Payments tables instantly from cached values.
    - Plan Reference: [Adding FeeAccounts View & Finance Dashboard](C:/Users/manis/.gemini/antigravity-ide/brain/7ea0e31d-d4e2-4e27-bc8b-6b28f6882535/implementation_plan.md)

---

## 4. Git & Sandbox Rules

*   **Staging & Commits**: Never perform aggressive git additions (like `git add .`) or make commits unless the user explicitly asks you to.
*   **Non-Destructive Work**: Never run physical file deletion commands like `git clean` or `git rm` that destroy untracked files or local staging states. Keep all operations stage-only and non-destructive.
*   **Smart-Commit Skill Workflow**:
    1. **Get Status**: Run `git status` to identify modified, untracked, and staged files. Present a brief summary of this status to the user.
    2. **Identify Target & Get Diff**:
       - Ask the user which specific files or directories they want to target for this commit (if not already specified).
       - Run `git diff <targeted_directory_or_file>` to analyze the exact changes.
    3. **Generate Commit Message**:
       - Generate a detailed git commit message using Conventional Commits format: `<type>(<scope>): <subject>\n\n<body>`.
       - Present the drafted commit message to the user for review.
    4. **Confirm Staging (Add)**:
       - Explicitly ask: "Do you want me to stage these files by running `git add <targeted_directory_or_file>`?"
       - **WAIT** for user confirmation before executing `git add`.
    5. **Confirm and Execute Commit**:
       - Explicitly ask: "Do you want me to commit these changes with the drafted message?"
       - **WAIT** for user confirmation.
       - If approved, write the message to `.git/temp_commit_msg.txt`, execute `git commit -F .git/temp_commit_msg.txt`, and clean up by removing the temp file (`Remove-Item` on Windows, `rm` on Unix).

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
*   **Primary Source of Truth**: The database schema contract is defined in the decoupled JSON files grouped by domain under `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\`. Always refer to these specific files (e.g., `Students/Student.json`, `Staff/Teacher.json`) for table columns, constraints, relations, and primary keys.

---

## 7. REST API Documentation Source of Truth

*   **Primary Source of Truth**: The REST API specifications are defined in `E:\NAST\Dazzling\GAS\DazzlingDB\REST-api-doc.md`. Always follow the documented action keys, request payload structures, and response envelopes.
*   **Undefined Actions Protocol**: If a needed REST API action is not defined, or its payload constraints are not documented in the API specification, stop and notify the user to clarify the schema requirements.

---

## 8. Frontend Component & Modal Memory Reference

We maintain local catalogs documenting reusable frontend components and interactive modals under `.gemini/memory/` for rapid context retrieval. Any developer or AI assistant working on new pages or features **MUST** consult these references to avoid duplicating code and to ensure styling consistency:

*   **Component Index Catalog**: Defined in `.gemini/memory/ui_component/components.index.json`.
    - *Purpose*: A structured JSON registry mapping every reusable UI component to its documentation line reference (in `components.md`) and source file location. Covers atomic inputs, layout shells, cards, filters, display badges, modals, domain compounds, and presentational presets.
    - *Mandatory Workflow*: **Before** writing any new component, creating a new page view, or refactoring existing React code, the agent **MUST** read `components.index.json` first. Scan the registry to identify existing primitives that satisfy the requirement. Only create a new component if no existing match is found. During refactoring, actively suggest and utilize catalog components to replace ad-hoc inline markup.
    - *How to Use*: Open the file, scan the `components` array for matching `title` entries, then read the detailed documentation at the corresponding `line` number in `.gemini/memory/ui_component/components.md`, and inspect the source implementation via the `location` path.
*   **Generic & Reusable Components**: Detailed in `E:/NAST/Dazzling/ERP System/dazzling-erp-admin/.gemini/memory/components.md`.
    - *Purpose*: Documents standard V2 inputs (`TextInput`, `SelectInput`, `RadioGroup`, `PhoneInput`, `FormField`), layouts, steppers, and generic presentation blocks.
    - *How to Use*: Refer to this file whenever you need to build forms, lists, tabs, timelines, or selection actions. Use the documented props API and implementation examples directly to maintain theme compliance.
*   **Interactive Popup Modals**: Detailed in `E:/NAST/Dazzling/ERP System/dazzling-erp-admin/.gemini/memory/models.md`.
    - *Purpose*: Documents all dialogs and modals (e.g. `ConfirmModal`, `APIErrorModal`, `BatchSelectionModal`, `CourseSelectionModal`).
    - *How to Use*: Refer to this file when you need to trigger confirmations, show errors, or implement split-pane selection wizards. Ensure you bind the state hooks and prop signatures exactly as specified in the documented examples.

---

## 9. Date Processing & Data Aggregation Standards

*   **Date Operations**:
    - Always use the `date-fns` library for parsing, comparing, and formatting dates. Do not use native `new Date(...)` parsing or `.toLocaleDateString(...)` for user-facing tables, to prevent timezone and consistency drift.
    - Standard operations:
      - Use `parseISO(dateString)` to instantiate dates from strings.
      - Use `compareDesc(dateA, dateB)` or `compareAsc(dateA, dateB)` for sorting lists.
      - Use `isBefore`, `isAfter`, and `isEqual` to validate active date window ranges.
      - Use `format(parsedDate, 'MMM d, yyyy')` to display clean, user-facing dates.
*   **Fluent Data Wrangling (`queryEngine.js`)**:
    - For all client-side array aggregations, grouping, filtering, or pivot-like summary operations, import and use the custom query engine from `src/lib/queryEngine.js`.
    - Always use the fluent `aq(data)` table wrapper:
      ```javascript
      import { aq, op } from 'src/lib/queryEngine';
      
      const summary = aq(transactions)
        .filter(tx => tx.amount > 0)
        .groupby('payment_method')
        .rollup({
          total: op.sum('amount'),
          count: op.count()
        })
        .orderby('-total')
        .objects();
      ```

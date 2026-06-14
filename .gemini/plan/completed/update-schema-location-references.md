---
Date: 2026-06-02T00:43:00+05:30
Status: Approved-Completed
---

# Plan: Migrate Database Schema Location References to Decoupled Domain-Grouped Files

This plan outlines the steps required to update all Dazzling ERP Admin project documentation, memory files, and operational rules to reference the new decoupled schema directory located at `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema`.

---

## 1. Context & Background

The database schema has migrated from a single unified JSON file (`full_schemav3.json`) to a modular, decoupled folder structure:
* **New Location:** `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema/`
* **Structure:** Separated into 6 highly cohesive subdirectories (Domains):
  - **Academic:** `Batch.json`, `BatchAllocation.json`, `Course.json`, `CourseType.json`, `Enrollment.json`, `Package.json`, `PackageItem.json`, `PackagePerk.json`
  - **Auth:** `Session.json`, `User.json`
  - **Core:** `Branch.json`, `PromoCode.json`
  - **Finance:** `FeeAdjustment.json`, `FeePlan.json`, `Installment.json`, `Payment.json`, `StudentFeeAccount.json`
  - **Staff:** `Teacher.json`, `TeacherAttendance.json`, `TeacherDocument.json`, `TeacherPaymentTransaction.json`, `TeacherSalaryConfig.json`, `TeacherSubject.json`
  - **Students:** `Address.json`, `ContactInfo.json`, `Education.json`, `Student.json`, `StudentLead.json`

---

## 2. Target Files & Updates Schedule

The following files contain outdated references and will be updated based on their specific documentation context:

### A. Operational Rules Checklist (`GEMINI.md`)
* **Location:** `E:\NAST\Dazzling\ERP System\dazzling-erp-admin\GEMINI.md`
* **Context:** Holds system rules for AI coding assistants.
* **Proposed Updates:**
  - Update Rule **11 (Primary Database Schema)** to specify `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema` as the primary source of truth, explaining that the schema is now decoupled into isolated JSON files by domain.
  - Update Section **6 (Database Schema Source of Truth)** to mirror this change.

### B. Schema Design Standards (`schema_design.md`)
* **Location:** `\.gemini\memory\schema_design.md`
* **Context:** Document standard definitions, properties, entities, and primary key targets.
* **Proposed Updates:**
  - Replace the unified `full_schemav3.json` reference at lines 4-5 with a description of the decoupled modular folder structure.
  - Map each grouping in **Section 7 (Cohesive Schema Groupings)** directly to its folder relative path (e.g. `Config/Schema/Students/` for Domain A).
  - Explicitly link the Example Schema in **Section 8** to `Config/Schema/Academic/Course.json`.
  - Update references to `DATABASE_SCHEMA` to refer to the folder inventory.

### C. System Architecture Documentation (`architecture.md`)
* **Location:** `\.gemini\memory\architecture.md`
* **Context:** Describes high-level design patterns and mocking structures.
* **Proposed Updates:**
  - In **Section 7 (Schema-UI Synchronization)**, replace references to the deprecated `full_schema.json` with the new decoupled schema folder structure.
  - In **Section 8 (Development Workflow)**, update the **Source of Truth** statement to point to `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema` and specify that mock files (`.mockApi.js`) are driven by these domain-based JSON files.

### D. Anti-Patterns Registry (`anti_patterns.md`)
* **Location:** `\.gemini\memory\anti_patterns.md`
* **Context:** Records common architectural pitfalls and how to avoid them.
* **Proposed Updates:**
  - Update **Section 6 (Case-Sensitivity)** to suggest checking status and enum casings against the decoupled schema files under `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema/[Domain]/[Entity].json` instead of a generic `full_schema.json`.

### E. Quality Assurance Guide (`knowledge/how_to_add_new_section.md`)
* **Location:** `\.gemini\memory\knowledge\how_to_add_new_section.md`
* **Context:** Checklists followed before feature integration.
* **Proposed Updates:**
  - In **Section 4 (Quality Rules Checklist)**, change the `full_schemav3.json` reference to:
    `[Config/Schema](file:///E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema)` and instruct checking against the respective isolated JSON schema for that entity.

### F. Memory Index Chronological Log (`MEMORY_INDEX.md`)
* **Location:** `\.gemini\memory\MEMORY_INDEX.md`
* **Context:** Tracks memory file sessions.
* **Proposed Updates:**
  - Register a new session entry under **Recent Session Updates** documenting the schema migration to decoupled domain folders.

---

## 3. Detailed Diff Specifications

Below are the exact search-and-replace scopes planned:

#### 1. `GEMINI.md`
```diff
- 11. **Primary Database Schema**: The local `src/Schema` directory is outdated and **MUST NOT** be followed. Refer exclusively to `E:\NAST\Dazzling\GAS\DazzlingDB\full_schemav3.json` (schema version 2.0.1) as the primary source of truth for all database tables and fields.
+ 11. **Primary Database Schema**: The local `src/Schema` directory is outdated and **MUST NOT** be followed. Refer exclusively to the decoupled schema files inside `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\` grouped by functional domains as the primary source of truth for all database tables and fields.
...
- *   **Primary Source of Truth**: The database schema contract is defined in `E:\NAST\Dazzling\GAS\DazzlingDB\full_schemav3.json` (schema version 2.0.1). Always refer to this master file for table columns, constraints, relations, and primary keys.
+ *   **Primary Source of Truth**: The database schema contract is defined in the decoupled domain-grouped files under `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\`. Always refer to these specific JSON files (e.g. `Students/Student.json`, `Staff/Teacher.json`) for table columns, constraints, relations, and primary keys.
```

#### 2. `schema_design.md`
```diff
- > The database schema is defined in [full_schemav3.json](file:///E:/NAST/Dazzling/GAS/DazzlingDB/full_schemav3.json).
- > All other schema `json` files from `src/Schema` are outdated and **MUST** be ignored. `DazzlingDB/full_schemav3.json` is the final and single source of truth for the database schema.
+ > The database schema is defined in decoupled modular JSON files located in [Config/Schema/](file:///E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/).
+ > All other schema `json` files from `src/Schema` are outdated and **MUST** be ignored. The isolated JSON files inside `DazzlingDB/Config/Schema/` grouped by domain are the final and single source of truth for all database tables and fields.
...
- The following table lists all valid `target` entities (PascalCase) and their corresponding primary keys as defined in the master `DATABASE_SCHEMA`.
+ The following table lists all valid `target` entities (PascalCase) and their corresponding primary keys as defined in the master schema directory.
```

#### 3. `architecture.md`
```diff
- All UI field names and data payloads **MUST** align perfectly with the backend `full_schema.json`.
+ All UI field names and data payloads **MUST** align perfectly with the backend decoupled JSON schemas under `Config/Schema/`.
...
- - **Source of Truth**: `src/Schema/full_schema.json` defines all data structures.
+ - **Source of Truth**: `E:\NAST\Dazzling\GAS\DazzlingDB\Config\Schema\` decoupled folder defines all data structures by domain.
```

#### 4. `anti_patterns.md`
```diff
- Always align status casing precisely with the schema definitions (`full_schema.json`), which standardizes on lowercase for statuses and enums.
+ Always align status casing precisely with the schema definitions inside the decoupled schema folder (`Config/Schema/`), which standardizes on lowercase for statuses and enums.
```

#### 5. `how_to_add_new_section.md`
```diff
- - [ ] **Schema Check**: Verified all field keys map exactly to relational structures in [full_schemav3.json](file:///E:/NAST/Dazzling/GAS/DazzlingDB/full_schemav3.json).
+ - [ ] **Schema Check**: Verified all field keys map exactly to relational structures in the decoupled schema files under [Config/Schema/](file:///E:/NAST/Dazzling/GAS/DazzlingDB/Config/Schema/).
```

---

## 4. Verification and Safety Strategy
1. **Validation Checks:** Every changed file will be reviewed line-by-line to ensure perfect formatting and valid link URIs.
2. **Commit Strategy:** Keep all modifications isolated. No modifications to functional code will take place. Only documentation and rule updates are targeted.

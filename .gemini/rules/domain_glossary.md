# Project Glossary & Standard Terminology

* **Dazzling Admin App:** The core ERP system for managing institutional workflows.
* **NestFlow:** The underlying data analytical and workflow execution engine.
* **Temporal Architecture:** Refers to the non-distributed custom workflow execution system used for data-intensive tasks.
* **Centralized Static Registry:** The architectural pattern where all API endpoints are mapped statically (e.g., `apiRegistry.js`) rather than hardcoded in React components.
* **Data Mappers:** The transformation layer (e.g., `batchMappers.js`) executed inside React Query's `select` function to sanitize backend payloads.

**Naming Rules:**
* Database fields MUST be `snake_case` (e.g., `date_of_birth`, never `dob`).
* API response data mapping targets MUST use `PascalCase` (e.g., `TeacherAttendance`).

---
name: admin-functionality-updater
description: Updates the admin_functionality.md tracker file under `.gemini/memory/` and appends a detailed changelog entry with a precise timestamp.
---

# Admin Functionality & Changelog Updater Skill

Use this skill whenever you make updates to any administrative functionality, routes, or CRUD operations in the Dazzling ERP Admin codebase. This ensures the central tracker remains the source of truth.

## Target File
- **Path**: [admin_functionality.md](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.gemini/memory/admin_functionality.md)

## Structure of the Target File
The tracker file strictly follows this section structure:

1. **Title**: `# Admin Functionality & CRUD Status`
2. **Section 1**: `## 1. Module CRUD Status Map`
   - A markdown table mapping sidebar sections, sub-menus, paths, CRUD status symbols (🟢, 🟡, ➖), and short notes.
3. **Section 2**: `## 2. Detailed Verification & Implementation Checklist`
   - Modular task/verification checkmarks (`- [ ]`) grouping specific validation actions for all main menus and administrative directories.
4. **Section 3**: `## 3. Changelogs`
   - Chronological change log entries ordered newest first, using the header format: `### [YYYY-MM-DDTHH:MM:SS+05:30] <Short Description>`.

## Execution Protocol

### Step 1: Read the current CRUD Status Map
Read the target file to locate the sections and existing content.

### Step 2: Update the CRUD Status Map Table (Section 1)
If your changes modified the capabilities (Create, Read, Update, Delete) of any sidebar navigation module:
1. Locate the row corresponding to that module.
2. Update the symbols:
   - `🟢` for fully implemented/stable.
   - `🟡` for in-progress or partially implemented.
   - `➖` for not applicable.
3. Update the **Status / Notes** column to describe the updated state.

### Step 3: Update the Verification Checklist (Section 2)
If a new checkbox is required to track an action or a feature of a module:
1. Find the module section under `## 2. Detailed Verification & Implementation Checklist`.
2. Append/adjust the task item checkbox (e.g. `- [ ] **[Create]**: ...` or `- [x] ...` if already completed).

### Step 4: Add a Timestamped Changelog Entry (Section 3)
Under the `## 3. Changelogs` section, insert a new changelog block at the top of the list.

- **Changelog Header format**: `### [YYYY-MM-DDTHH:MM:SS+05:30] <Short Description>`
  - *Note: The timestamp MUST contain both the date and the local time.*
- **Changelog Details**:
  - **Feature**: Name the target module/route.
  - **Changes**: Provide a clean, bulleted list of specific changes or additions made.

### Step 5: Write and Validate
Save the file back to its target location and verify that markdown formatting (especially the tables and links) remains intact.

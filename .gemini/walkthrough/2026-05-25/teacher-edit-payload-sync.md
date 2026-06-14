---
date: 2026-05-25T22:05:40+05:30
status: Completed
---

# Walkthrough: Synchronize Edit Profile Mutations and Split Payload

Successfully implemented the decoupled update mutations pattern on the Faculty Edit view form to comply with the database schema and REST API documentation.

## Changes Made

### 1. Mutation Payload Sync (`AddTeacher.jsx`)
- Cleaned the payload sent to `useUpdateTeacherMutation` to contain only direct columns defined in the `Teacher` schema table. Removed deprecated properties (`subject_code`, `metadata`).
- Refactored form submission in Edit mode to execute subsequent relational updates concurrently upon a successful core profile update:
  - Invokes `useAssignTeacherSubjectsMutation` (`staff_assign_subjects` API action) to assign subject links.
  - Invokes `useSetTeacherSalaryConfigMutation` (`staff_set_salary_config` API action) to store base rates.

### 2. Mutation Hook Definitions (`useTeacherQueries.js`)
- Added mutation hooks:
  - `useAssignTeacherSubjectsMutation`: Updates teacher subjects.
  - `useSetTeacherSalaryConfigMutation`: Updates teacher salary config.

---

## Verification Results
- **Payload verification**: Confirmed that the Teacher update payload no longer carries nested `metadata` or `subject_code` variables.
- **Relational mutation chain**: Verified that clicking "Update Profile" sequentially executes core profile update and relational links, redirecting on complete success.

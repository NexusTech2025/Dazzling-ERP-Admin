# Core Operational Instructions: Plan Lifecycle & Archival Policies

This document establishes the architectural standards for creating, updating, and categorizing implementation plans and walkthroughs within the `.gemini/` workspace directory. All future AI agents and developers operating in this repository must strictly adhere to these guidelines.

---

## 🗂️ 1. Directory Structure

Plans and walkthroughs are organized by their lifecycle status under `.gemini/`. 

```
.gemini/
├── plan/
│   ├── drafted/        # Plans that are proposed or in draft state (Status: Proposed)
│   ├── approved/       # Plans that are approved by the user (Status: Approved)
│   └── completed/      # Plans that have been implemented and verified (Status: Approved-Completed)
└── walkthrough/        # Verified walkthrough documents corresponding to completed plans
```

---

## ⚙️ 2. Frontmatter & Status Definitions

Every plan MUST include standard YAML frontmatter at the very top:

```yaml
---
Date: YYYY-MM-DDTHH:MM:SS+05:30
Status: [Proposed | Approved | Approved-Completed]
---
```

### State Mappings:
1. **`Proposed`**: The initial draft of the plan. Placed in the `plan/drafted/` directory when created.
2. **`Approved`**: The user has reviewed and approved the plan for execution. Located in the `plan/approved/` directory.
3. **`Approved-Completed`**: Implementation is complete, tests are passed, and a walkthrough has been created. Located in the `plan/completed/` directory.

---

## 🛡️ 3. Rules for File Movement & Status Updates

1. **Auto-Update of Frontmatter**: The agent **MUST** proactively update the `Status:` field in the plan's YAML frontmatter as it transitions from drafted to approved, and finally to completed.
2. **Physical File Movement Constraint**: The agent **MUST NOT** physically move or rename the plan files to different subdirectories (e.g. from `drafted/` to `approved/` or `completed/`) automatically. Physical file movements are managed exclusively by the user.
3. **Walkthrough Generation**: Once a plan is implemented, a corresponding walkthrough file MUST be created under `.gemini/walkthrough/` matching the name of the plan exactly.

---

*Last Updated: 2026-05-25*

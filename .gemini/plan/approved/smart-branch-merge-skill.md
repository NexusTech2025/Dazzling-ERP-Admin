---
Date: 2026-07-30T00:19:30+05:30
Status: Approved
---

# Implementation Plan: Smart Agentic Branch Merge Skill (`smart-branch-merge`)

This plan establishes the architecture and workflow for the **`smart-branch-merge`** skill. It automates merging feature/bugfix branches into `main` with deep context analysis (What, Why, How, Verification), safe working tree stashing/popping, automatic `.gemini/memory/git_branches.json` status updates, and interactive branch deletion confirmation.

## User Review Required

> [!IMPORTANT]
> **Key Design Decisions**:
> 1. **Commit Message File Pattern**: To handle multiline, rich conventional commit messages safely across Windows PowerShell environments, the agent will write the drafted message to `.git/temp_merge_commit_msg.txt` and execute `git merge --no-ff <branch> -F .git/temp_merge_commit_msg.txt`, then clean up the file.
> 2. **Branch Deletion Safeguard**: The agent will **NEVER** pass `-D` or automatically delete a branch without explicitly displaying the merge confirmation and prompting the user for approval.
> 3. **Unrelated Stash Isolation**: Working tree changes on `main` will be isolated using `git stash -u -m "..."` prior to merge and popped immediately via `git stash pop` after completion.

## Proposed Changes

---

### `.agents/skills/smart-branch-merge`

#### [NEW] [SKILL.md](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.agents/skills/smart-branch-merge/SKILL.md)
* Create the skill manifest defining trigger conditions (`/smart-branch-merge`, `merge feature branch`, `merge bugfix branch`, `smart merge`).
* Document the 7-step execution workflow:
  1. Context Analysis & Diff Audit (analyze `git log`, `git diff`, and `.gemini/plan/` or `.gemini/issues/` context).
  2. Safe Stashing of Unrelated Working Directory Changes (`git stash -u`).
  3. Contextual Multiline Conventional Commit Synthesis (What, Why, How, Verification).
  4. Non-Fast-Forward Merge Execution (`git merge --no-ff -F .git/temp_merge_commit_msg.txt`).
  5. Restore Stashed Changes (`git stash pop`).
  6. Resync Branch Memory Store (`node .agents/skills/git-branch-status/scripts/update_branch_status.js`).
  7. Interactive Branch Deletion Confirmation.

#### [NEW] [generate_merge_commit.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.agents/skills/smart-branch-merge/scripts/generate_merge_commit.js)
* Helper script to analyze git diff stats and commit logs between `main` and the target branch, extracting high-level summary statistics to assist context generation.

---

### Backup / Archival Strategy

#### [NEW] [.gemini/plan/approved/smart-branch-merge-skill.md](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.gemini/plan/approved/smart-branch-merge-skill.md)
* Backup copy of the approved plan into `.gemini/plan/approved/` with standard YAML frontmatter.

---

## Verification Plan

### Automated Tests / Script Verification
1. Run `node .agents/skills/smart-branch-merge/scripts/generate_merge_commit.js` against an existing branch to verify log and diff analysis output.
2. Run `node .agents/skills/git-branch-status/scripts/update_branch_status.js` after simulated merge state to verify memory resync.

### Manual Verification
1. Verify skill manifest structure and path references.
2. Test end-to-end execution dry-run of `/smart-branch-merge`.

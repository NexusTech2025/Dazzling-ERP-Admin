---
name: git-branch-status
description: Evaluates git status, current branch details, uncommitted files, and commit history while maintaining a persistent local JSON memory store (.gemini/memory/git_branches.json). Provides intelligent lifecycle recommendations on when to merge, close, or create a new branch. Activate this skill when the user asks for git status, branch memory status, branch summaries, or advice on merging/closing/creating branches.
---

# Git Branch Status & Lifecycle Memory Skill

This skill maintains a semantic, persistent memory store of all Git branches in `.gemini/memory/git_branches.json`. It bridges the gap between raw Git commit logs and high-level feature development by tracking the **purpose**, **completion state**, **commit summaries**, and **lifecycle recommendations** for every branch.

---

## 🛠️ Operating Principles & Workflow

Whenever activated or requested to inspect branch status, the agent **MUST** follow these steps:

### Step 1: Execute Git Diagnostics
Run the following commands using `run_command`:
1. `git status` — Check current branch name, staged, unstaged, and untracked files.
2. `git log -n 5 --oneline` — Check recent commits on the active branch.
3. `git branch --list` — List all local branches.

### Step 2: Read & Synchronize Branch Memory Store
Read the local JSON memory store at `[git_branches.json](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.gemini/memory/git_branches.json)`.
If the file does not exist, initialize it using the schema defined in `resources/git_branches.schema.json`.

Update the active branch object inside `git_branches.json` with:
- **`branch_name`**: Name of the active branch (e.g., `package-patches-bugfix`).
- **`parent_branch`**: Base target branch (default: `main`).
- **`last_activity_at`**: Current ISO timestamp.
- **`uncommitted_changes_count`**: Number of modified/untracked files.
- **`working_tree_clean`**: Boolean indicating if `git status` has zero pending changes.
- **`commits_summary`**: Array of recent commit messages.
- **`purpose`**: Short description of the feature or bugfix scope.
- **`status`**: State enum: `active` | `in_progress` | `ready_for_merge` | `merged` | `stale`.

### Step 3: Compute Branch Lifecycle Recommendations & Merged Verification

Evaluate all tracked branch states against Git upstream status (`git branch --merged main`) and apply the standardized visual badge matrix:

| Status Enum | Badge & Emoji | Condition & Criteria | Actionable Lifecycle Recommendation |
| :--- | :---: | :--- | :--- |
| **`merged`** | 🔵 **Blue** | Commits are merged upstream into `main` / parent branch. | 🔵 **Merged Upstream**: Branch merged into `main`. Safe to delete locally (`git branch -d <branch>`). |
| **`ready_for_merge`** | 🟢 **Green** | `working_tree_clean` is `true` AND commits exist ahead of parent. | 🟢 **Ready for Merge / PR**: All changes committed and tree clean. Merge into `main` and delete branch. |
| **`in_progress`** | 🟡 **Orange** | `uncommitted_changes_count` > 0 (modified or untracked files). | 🟡 **Active Work in Progress**: Staged/unstaged changes exist. Commit or stash before switching branches. |
| **`active`** | ⚪ **Grey** | `working_tree_clean` is `true` with zero new commits ahead yet. | ⚪ **Clean & Ready**: Fresh branch with clean working tree. Ready for active development. |
| **`stale`** | 🔴 **Red** | Inactive for > 14 days or out of sync with base branch. | 🔴 **Stale / Outdated**: Branch is out of sync with `main`. Consider syncing or deleting. |

### Step 4: Present Structured Report to User
Output a clean, Github-formatted report containing:
1. **Current Branch & Status Summary** (Active branch, parent, status badge, working tree state).
2. **Recent Commit Log & Accomplishments** (Bullet list of recent commits and modified domains).
3. **Branch Memory Overview** (Summary of all tracked branches in `git_branches.json`).
4. **Lifecycle Recommendations** (Clear next steps for merging, committing, or creating a new branch).

---

## 📁 Related Schemas & Helper Tools

- **JSON Memory File**: `[git_branches.json](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.gemini/memory/git_branches.json)`
- **Memory Schema**: `[git_branches.schema.json](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.agents/skills/git-branch-status/resources/git_branches.schema.json)`
- **Update Script**: `[update_branch_status.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.agents/skills/git-branch-status/scripts/update_branch_status.js)`

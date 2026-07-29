---
name: smart-branch-merge
description: Merges any feature, bugfix, or atomic branch into main with agentic analysis, safe working tree stashing/popping, context-rich multiline conventional commit synthesis (What, Why, How, Verification), memory resync, and interactive branch deletion confirmation. Activate when the user asks to merge a branch, smart merge, or release a feature/bugfix branch.
---

# Smart Agentic Branch Merge Skill (`smart-branch-merge`)

This skill automates the complete lifecycle of merging any feature, bugfix, or atomic branch into `main` (or a base branch). It combines git status diagnostics, working tree stash isolation, context-rich conventional commit message synthesis, non-fast-forward merge execution, memory resync, and interactive user confirmation for branch cleanup.

---

## 🛠️ Operating Principles & 7-Step Workflow

Whenever activated (e.g., `/smart-branch-merge <branch_name>` or *"Merge feature/xyz into main"*), the agent **MUST** execute the following sequential workflow:

---

### Step 1: Execute Branch & Diff Diagnostics
1. Determine `<target_branch>` (e.g., `bugfix/batch-attendance-marking`).
2. Run `git status` to check current branch state and working tree cleanliness.
3. Run the helper script using `run_command`:
   ```bash
   node .agents/skills/smart-branch-merge/scripts/generate_merge_commit.js <target_branch> main
   ```
4. Read recent commit logs on `<target_branch>` and inspect any associated implementation plans in `.gemini/plan/` or issue reports in `.gemini/issues/` to understand the full context of the work.

---

### Step 2: Safe Working Tree Stashing (Isolation)
If `git status` shows uncommitted or untracked changes on the current working directory:
```powershell
git stash -u -m "Stashed untracked & working tree changes before merging <target_branch>"
```
*Note: This isolates unrelated edits so they are not accidentally committed during the merge.*

---

### Step 3: Contextual Multiline Conventional Commit Synthesis
Draft a structured conventional commit message that answers **What**, **Why**, **How**, and **Verification**.

**Required Format Schema**:
```text
merge(<domain>): merge <target_branch> into main

### 📌 Summary of Changes:
- [What] <High-level overview of key features, bug fixes, or enhancements>

### 🔍 Problem & Root Cause Context (Why):
- [Why] <Explanation of the bug root cause, business logic context, or requirement target>

### 🛠️ Technical Solution & Architecture (How):
- [How] <Specific modules updated, state hooks introduced, payload schema changes, or query optimizations>

### ✅ Verification & Quality Assurances:
- [Verification] <Tests run, UI walkthrough references, or schema validation steps verified>
```

---

### Step 4: Non-Fast-Forward Merge Execution
To avoid shell escaping errors with complex multiline commit messages in Windows PowerShell:
1. Write the drafted commit message to `.git/temp_merge_commit_msg.txt`.
2. Checkout `main` and execute the non-fast-forward merge using `-F`:
   ```powershell
   git checkout main
   git merge --no-ff <target_branch> -F .git/temp_merge_commit_msg.txt
   ```
3. Remove the temporary commit message file:
   ```powershell
   Remove-Item .git/temp_merge_commit_msg.txt
   ```

---

### Step 5: Restore Stashed Unrelated Changes
If changes were stashed in Step 2, restore them back to the working directory:
```powershell
git stash pop
```

---

### Step 6: Synchronize Persistent Branch Memory Store
Execute the branch memory update script to keep `.gemini/memory/git_branches.json` updated:
```powershell
node .agents/skills/git-branch-status/scripts/update_branch_status.js
```

---

### Step 7: Interactive Branch Deletion Gate
Present a summary of the merge to the user:
1. Display the synthesized merge commit message.
2. Confirm that `main` has been successfully updated and memory store resynchronized.
3. Explicitly ask for user permission before deleting the branch:
   > *"The branch `<target_branch>` has been successfully merged into `main`. Would you like me to delete the local branch by running `git branch -d <target_branch>`?"*

---

## 📁 Related Tools & References

- **Merge Analysis Script**: `[generate_merge_commit.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.agents/skills/smart-branch-merge/scripts/generate_merge_commit.js)`
- **Branch Memory Script**: `[update_branch_status.js](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.agents/skills/git-branch-status/scripts/update_branch_status.js)`
- **Branch Memory File**: `[git_branches.json](file:///e:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/.gemini/memory/git_branches.json)`

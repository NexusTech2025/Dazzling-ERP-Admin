import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const MEMORY_FILE = path.resolve(process.cwd(), '.gemini/memory/git_branches.json');

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch (err) {
    return '';
  }
}

function updateBranchStatus() {
  const currentBranch = runCmd('git branch --show-current') || 'main';
  const statusOutput = runCmd('git status --porcelain');
  const uncommittedLines = statusOutput ? statusOutput.split('\n').filter(Boolean) : [];
  const isWorkingTreeClean = uncommittedLines.length === 0;

  // Ensure memory dir exists
  const memoryDir = path.dirname(MEMORY_FILE);
  if (!fs.existsSync(memoryDir)) {
    fs.mkdirSync(memoryDir, { recursive: true });
  }

  // Load existing memory store
  let memoryStore = {
    active_branch: currentBranch,
    updated_at: new Date().toISOString(),
    branches: {}
  };

  if (fs.existsSync(MEMORY_FILE)) {
    try {
      const raw = fs.readFileSync(MEMORY_FILE, 'utf8');
      memoryStore = JSON.parse(raw);
    } catch (e) {
      console.warn('[git-branch-status] Existing memory store corrupted, re-initializing.');
    }
  }

  // Update active branch metadata
  memoryStore.active_branch = currentBranch;
  memoryStore.updated_at = new Date().toISOString();

  const existingBranchData = memoryStore.branches[currentBranch] || {};
  const createdAt = existingBranchData.created_at || new Date().toISOString();
  const purpose = existingBranchData.purpose || `Feature/bugfix work on ${currentBranch}`;

  // Get branch-specific commits ahead of parent branch
  const parentBranch = existingBranchData.parent_branch || 'main';
  const logCmd = currentBranch === parentBranch ? 'git log -n 5 --oneline' : `git log ${parentBranch}..HEAD --oneline`;
  const logOutput = runCmd(logCmd);
  const recentCommits = logOutput ? logOutput.split('\n').filter(Boolean) : [];

  // Determine branch status & lifecycle recommendation
  let status = 'active';
  let recommendation = '';

  if (isWorkingTreeClean) {
    if (recentCommits.length > 0) {
      status = 'ready_for_merge';
      recommendation = `🟢 Ready for Merge / PR: All recent work is committed and working tree is clean. Consider merging into main.`;
    } else {
      status = 'active';
      recommendation = `ℹ️ Clean working tree with no commits yet. Ready for development.`;
    }
  } else {
    status = 'in_progress';
    recommendation = `🟡 Active Work in Progress: You have ${uncommittedLines.length} uncommitted file(s). Commit or stash your changes before merging or switching branches.`;
  }

  memoryStore.branches[currentBranch] = {
    branch_name: currentBranch,
    parent_branch: parentBranch,
    purpose,
    status,
    working_tree_clean: isWorkingTreeClean,
    uncommitted_changes_count: uncommittedLines.length,
    commits_count_ahead: recentCommits.length,
    created_at: createdAt,
    last_activity_at: new Date().toISOString(),
    commits_summary: recentCommits,
    recommendation
  };

  // Write back to memory store
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memoryStore, null, 2), 'utf8');

  console.log(`[git-branch-status] Memory updated for branch "${currentBranch}". Status: ${status}`);
  return memoryStore;
}

updateBranchStatus();

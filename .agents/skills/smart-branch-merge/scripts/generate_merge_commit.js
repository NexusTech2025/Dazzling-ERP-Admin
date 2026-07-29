import { execSync } from 'child_process';
import path from 'path';
import fileURLToPath from 'url';

/**
 * Helper script to analyze git diff stats and commit logs between main and target branch.
 * Returns structured metadata to assist drafting a rich multiline commit message.
 */

function analyzeBranchMerge(targetBranch = '', baseBranch = 'main') {
  if (!targetBranch) {
    console.error('Error: Please provide a target branch name.');
    process.exit(1);
  }

  try {
    // 1. Get list of commits introduced by targetBranch ahead of baseBranch
    const commitsRaw = execSync(`git log ${baseBranch}..${targetBranch} --oneline`, { encoding: 'utf-8' }).trim();
    const commits = commitsRaw ? commitsRaw.split('\n') : [];

    // 2. Get shortstat (files changed, insertions, deletions)
    const diffStat = execSync(`git diff --shortstat ${baseBranch}...${targetBranch}`, { encoding: 'utf-8' }).trim();

    // 3. Get list of changed file names
    const changedFilesRaw = execSync(`git diff --name-only ${baseBranch}...${targetBranch}`, { encoding: 'utf-8' }).trim();
    const changedFiles = changedFilesRaw ? changedFilesRaw.split('\n') : [];

    // 4. Group changed files by domain/feature directory
    const domains = new Set();
    changedFiles.forEach(file => {
      if (file.startsWith('src/features/')) {
        const parts = file.split('/');
        if (parts[2]) domains.add(parts[2]);
      } else if (file.startsWith('src/components/')) {
        domains.add('components');
      } else if (file.startsWith('.gemini/')) {
        domains.add('docs/memory');
      } else if (file.startsWith('.agents/')) {
        domains.add('skills/agents');
      } else {
        domains.add('root/config');
      }
    });

    const analysis = {
      targetBranch,
      baseBranch,
      commitCount: commits.length,
      commits,
      diffStat,
      fileCount: changedFiles.length,
      domains: Array.from(domains),
      changedFiles: changedFiles.slice(0, 15) // Top 15 files
    };

    console.log(JSON.stringify(analysis, null, 2));
    return analysis;
  } catch (err) {
    console.error(`Failed to analyze branch ${targetBranch}:`, err.message);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const targetBranch = args[0];
const baseBranch = args[1] || 'main';

analyzeBranchMerge(targetBranch, baseBranch);

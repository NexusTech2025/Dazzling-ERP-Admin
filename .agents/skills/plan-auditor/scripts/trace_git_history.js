/**
 * trace_git_history.js - Git Commit Log & Branch Memory Matcher (ESM)
 * 
 * Cross-references implementation plans against git commit logs and branch memory
 * (.gemini/memory/git_branches.json) to detect features implemented on parallel branches.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_ROOT = path.resolve(__dirname, '../../../../');
const PLAN_ROOT = path.join(WORKSPACE_ROOT, '.gemini', 'plan');
const BRANCH_MEMORY_PATH = path.join(WORKSPACE_ROOT, '.gemini', 'memory', 'git_branches.json');

const args = process.argv.slice(2);
const IS_JSON = args.includes('--json');
const IS_VERBOSE = args.includes('--verbose') || args.includes('-v');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function getGitCommitLogs() {
  try {
    const output = execSync('git log -n 50 --oneline --name-status', {
      cwd: WORKSPACE_ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024
    }).toString();
    return output;
  } catch (err) {
    if (IS_VERBOSE) console.error('Failed to read git commit log:', err.message);
    return '';
  }
}

function readBranchMemory() {
  try {
    if (fs.existsSync(BRANCH_MEMORY_PATH)) {
      const content = fs.readFileSync(BRANCH_MEMORY_PATH, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    // Ignore error
  }
  return null;
}

function runTrace() {
  const commitLogs = getGitCommitLogs();
  const branchMemory = readBranchMemory();
  const folders = ['drafted', 'approved', 'completed'];

  const results = [];

  folders.forEach(folder => {
    const dirPath = path.join(PLAN_ROOT, folder);
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const planTitle = (file.replace(/\.md$/, '').replace(/[-_]/g, ' ')).toLowerCase();

        const titleMatch = commitLogs.toLowerCase().includes(planTitle);

        const targetFiles = [...content.matchAll(/####\s*\[(MODIFY|NEW|DELETE)\]\s*\[?([^\]\(\n]+)\]?/gi)].map(m => m[2].trim());
        let matchedFilesCount = 0;

        targetFiles.forEach(tf => {
          if (tf && commitLogs.includes(tf)) {
            matchedFilesCount++;
          }
        });

        const commitMatchScore = targetFiles.length > 0 ? Math.round((matchedFilesCount / targetFiles.length) * 100) : 0;

        results.push({
          fileName: file,
          folder,
          titleMatch,
          targetFilesCount: targetFiles.length,
          matchedFilesCount,
          commitMatchScore
        });
      } catch (err) {
        if (IS_VERBOSE) console.error(`Error tracing file ${file}:`, err.message);
      }
    });
  });

  if (IS_JSON) {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), branchMemory, results }, null, 2));
    return;
  }

  console.log(`\n${colors.bright}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan} 🔍 GIT HISTORY & BRANCH TRACE (trace_git_history.js)${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}====================================================${colors.reset}\n`);

  if (branchMemory && branchMemory.active_branch) {
    console.log(`${colors.bright}Active Branch:${colors.reset} ${colors.cyan}${branchMemory.active_branch}${colors.reset}\n`);
  }

  results.forEach(res => {
    const icon = res.commitMatchScore > 50 || res.titleMatch ? `${colors.green}✔${colors.reset}` : `${colors.gray}⚪${colors.reset}`;
    console.log(`  ${icon} ${colors.bright}${res.fileName}${colors.reset} [${res.folder}/]`);
    console.log(`     ${colors.gray}Commit Log Target File Match:${colors.reset} ${res.matchedFilesCount}/${res.targetFilesCount} (${res.commitMatchScore}%)`);
    console.log(`     ${colors.gray}Commit Title Match:${colors.reset} ${res.titleMatch ? `${colors.green}Yes${colors.reset}` : `${colors.gray}No${colors.reset}`}\n`);
  });
}

runTrace();

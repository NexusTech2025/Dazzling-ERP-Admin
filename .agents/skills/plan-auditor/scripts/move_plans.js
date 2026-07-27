/**
 * move_plans.js - Safe Plan File Mover & YAML Status Synchronizer (ESM)
 * 
 * Relocates implementation plan files between .gemini/plan/ subdirectories (drafted, approved, completed),
 * updates YAML frontmatter Status headers, and executes git mv (or fs.renameSync) safely.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_ROOT = path.resolve(__dirname, '../../../../');
const PLAN_ROOT = path.join(WORKSPACE_ROOT, '.gemini', 'plan');

const args = process.argv.slice(2);
function getArgVal(flag) {
  const idx = args.indexOf(flag);
  return idx > -1 && args[idx + 1] ? args[idx + 1] : null;
}

const TARGET_PLAN = getArgVal('--plan');
const TARGET_TO = getArgVal('--to');
const IS_SYNC_ALL = args.includes('--sync-all');
const IS_MOVE_FULLY_IMPLEMENTED = args.includes('--move-fully-implemented') || IS_SYNC_ALL;
const IS_DRY_RUN = args.includes('--dry-run');
const IS_FORCE = args.includes('--force');
const IS_JSON = args.includes('--json');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const STATUS_MAP = {
  drafted: 'Proposed',
  approved: 'Approved',
  completed: 'Approved-Completed'
};

function extractTargetFiles(content) {
  const fileRegex = /####\s*\[(MODIFY|NEW|DELETE)\]\s*(?:\[([^\]]+)\])?(?:\((file:\/\/\/[^\)\n]+|[^\)\n]+)\))?/gi;
  const files = [];
  let match;

  while ((match = fileRegex.exec(content)) !== null) {
    const action = match[1].toUpperCase();
    const rawName = match[2] || '';
    const rawPath = match[3] || '';

    let cleanPath = rawPath;
    if (cleanPath.startsWith('file:///')) {
      cleanPath = cleanPath.replace(/^file:\/\/\//, '');
      cleanPath = decodeURIComponent(cleanPath);
    }

    if (!cleanPath && rawName) {
      cleanPath = rawName;
    }

    if (cleanPath) {
      files.push({ action, cleanPath });
    }
  }

  return files;
}

function verifyFileExistence(filePath) {
  try {
    let resolvedPath = filePath;
    if (!path.isAbsolute(resolvedPath)) {
      resolvedPath = path.join(WORKSPACE_ROOT, filePath);
    }
    return fs.existsSync(resolvedPath);
  } catch (err) {
    return false;
  }
}

function findPlanFile(filename) {
  const folders = ['drafted', 'approved', 'completed', ''];
  for (const folder of folders) {
    const filePath = path.join(PLAN_ROOT, folder, filename);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return { found: true, folder: folder || 'root', filePath };
    }
  }
  return { found: false, folder: null, filePath: null };
}

function updateFrontmatterStatus(content, newStatus) {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) {
    const newHeader = `---\nTitle: Implementation Plan\nStatus: ${newStatus}\n---\n\n`;
    return newHeader + content;
  }

  let yamlBody = fmMatch[1];
  if (/Status\s*:/i.test(yamlBody)) {
    yamlBody = yamlBody.replace(/Status\s*:\s*[^\r\n]+/i, `Status: ${newStatus}`);
  } else {
    yamlBody += `\nStatus: ${newStatus}`;
  }

  return content.replace(/^---\r?\n[\s\S]*?\r?\n---/, `---\n${yamlBody}\n---`);
}

function relocateFile(srcPath, destPath) {
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  let method = 'fs.renameSync';
  let success = false;
  let errorMsg = null;

  if (IS_DRY_RUN) {
    return { success: true, method: 'dry-run', errorMsg: null };
  }

  try {
    const relSrc = path.relative(WORKSPACE_ROOT, srcPath).replace(/\\/g, '/');
    const relDest = path.relative(WORKSPACE_ROOT, destPath).replace(/\\/g, '/');
    const gitCmd = `git mv "${relSrc}" "${relDest}"`;
    execSync(gitCmd, { cwd: WORKSPACE_ROOT, stdio: 'pipe' });
    method = 'git mv';
    success = true;
  } catch (gitErr) {
    try {
      if (fs.existsSync(destPath) && !IS_FORCE) {
        throw new Error(`Destination file already exists: ${destPath}`);
      }
      fs.renameSync(srcPath, destPath);
      method = 'fs.renameSync';
      success = true;
    } catch (fsErr) {
      errorMsg = fsErr.message;
    }
  }

  return { success, method, errorMsg };
}

function processSingleMove(filename, targetFolder) {
  if (!STATUS_MAP[targetFolder]) {
    return { success: false, error: `Invalid target folder '${targetFolder}'. Valid folders: drafted, approved, completed.` };
  }

  const fileInfo = findPlanFile(filename);
  if (!fileInfo.found) {
    return { success: false, error: `Plan file '${filename}' not found under .gemini/plan/` };
  }

  const destPath = path.join(PLAN_ROOT, targetFolder, filename);

  if (fileInfo.filePath === destPath) {
    return { success: true, skipped: true, message: `File '${filename}' is already in target folder '${targetFolder}'.` };
  }

  const targetStatus = STATUS_MAP[targetFolder];

  try {
    let content = fs.readFileSync(fileInfo.filePath, 'utf8');
    content = updateFrontmatterStatus(content, targetStatus);

    if (!IS_DRY_RUN) {
      fs.writeFileSync(fileInfo.filePath, content, 'utf8');
    }

    const moveRes = relocateFile(fileInfo.filePath, destPath);

    return {
      success: moveRes.success,
      fromFolder: fileInfo.folder,
      toFolder: targetFolder,
      srcPath: fileInfo.filePath,
      destPath,
      method: moveRes.method,
      newStatus: targetStatus,
      error: moveRes.errorMsg
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function main() {
  const results = [];

  if (TARGET_PLAN && TARGET_TO) {
    const res = processSingleMove(TARGET_PLAN, TARGET_TO);
    results.push({ plan: TARGET_PLAN, ...res });
  } else if (IS_SYNC_ALL || IS_MOVE_FULLY_IMPLEMENTED) {
    const folders = ['drafted', 'approved'];
    folders.forEach(folder => {
      const dirPath = path.join(PLAN_ROOT, folder);
      if (!fs.existsSync(dirPath)) return;

      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
      files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
          const yamlStr = fmMatch ? fmMatch[1] : '';
          const statusMatch = yamlStr.match(/Status\s*:\s*([^\r\n]+)/i);
          const status = statusMatch ? statusMatch[1].trim().replace(/^['"]|['"]$/g, '') : null;

          let targetFolder = folder;

          // Check implementation status in src/
          const targetFiles = extractTargetFiles(content);
          if (targetFiles.length > 0) {
            const verifiedCount = targetFiles.filter(tf => verifyFileExistence(tf.cleanPath)).length;
            if (verifiedCount === targetFiles.length) {
              targetFolder = 'completed';
            }
          }

          if (folder !== targetFolder) {
            const res = processSingleMove(file, targetFolder);
            results.push({ plan: file, ...res });
          }
        } catch (err) {
          results.push({ plan: file, success: false, error: err.message });
        }
      });
    });
  } else {
    console.log(`${colors.bright}Usage:${colors.reset}`);
    console.log(`  node move_plans.js --plan <filename.md> --to <drafted|approved|completed> [--dry-run] [--force]`);
    console.log(`  node move_plans.js --sync-all [--dry-run]`);
    return;
  }

  if (IS_JSON) {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), isDryRun: IS_DRY_RUN, results }, null, 2));
    return;
  }

  console.log(`\n${colors.bright}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan} 📦 PLAN FILE RELOCATION SUMMARY (move_plans.js)    ${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}====================================================${colors.reset}\n`);

  if (IS_DRY_RUN) {
    console.log(`${colors.yellow}⚠️ DRY RUN MODE ACTIVE - No physical file changes performed.${colors.reset}\n`);
  }

  if (results.length === 0) {
    console.log(`  ${colors.green}✔ All plans are in their correct locations.${colors.reset}\n`);
    return;
  }

  results.forEach(r => {
    if (r.skipped) {
      console.log(`  ${colors.cyan}ℹ ${r.plan}:${colors.reset} ${r.message}`);
    } else if (r.success) {
      console.log(`  ${colors.green}✔ ${r.plan}:${colors.reset} [${r.fromFolder}/] ➔ [${r.toFolder}/] (${r.method})`);
      console.log(`     ${colors.cyan}Updated Status Tag:${colors.reset} Status: ${r.newStatus}`);
    } else {
      console.log(`  ${colors.red}✖ ${r.plan}:${colors.reset} Failed to move - ${r.error}`);
    }
  });
  console.log('');
}

main();

/**
 * fix_frontmatter.js - Plan YAML Frontmatter Normalizer (ESM)
 * 
 * Automatically inspects implementation plans under .gemini/plan/, checks for missing
 * or incomplete YAML frontmatter headers (Title, Date, Status), and normalizes them.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_ROOT = path.resolve(__dirname, '../../../../');
const PLAN_ROOT = path.join(WORKSPACE_ROOT, '.gemini', 'plan');

const args = process.argv.slice(2);
const IS_DRY_RUN = args.includes('--dry-run');
const IS_JSON = args.includes('--json');
const IS_VERBOSE = args.includes('--verbose') || args.includes('-v');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const DEFAULT_STATUS_MAP = {
  drafted: 'Proposed',
  approved: 'Approved',
  completed: 'Approved-Completed'
};

function extractTitleFromMarkdown(body) {
  const match = body.match(/^#\s+([^\r\n]+)/m);
  if (match) {
    return match[1].trim().replace(/^\[|\]$/g, '');
  }
  return null;
}

function normalizeFrontmatter(filePath, folderName) {
  const fileStats = fs.statSync(filePath);
  const rawContent = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);

  const fmMatch = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  let hasFrontmatter = !!fmMatch;
  let yamlBody = fmMatch ? fmMatch[1] : '';
  let bodyContent = fmMatch ? rawContent.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '') : rawContent;

  const metadata = {};
  if (hasFrontmatter) {
    yamlBody.split(/\r?\n/).forEach(line => {
      const idx = line.indexOf(':');
      if (idx > -1) {
        const k = line.slice(0, idx).trim();
        let v = line.slice(idx + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        metadata[k] = v;
      }
    });
  }

  let modified = false;

  if (!metadata.Title) {
    const extractedTitle = extractTitleFromMarkdown(bodyContent) || fileName.replace(/\.md$/, '').replace(/[-_]/g, ' ');
    metadata.Title = extractedTitle;
    modified = true;
  }

  if (!metadata.Date) {
    metadata.Date = fileStats.mtime.toISOString();
    modified = true;
  }

  if (!metadata.Status) {
    metadata.Status = DEFAULT_STATUS_MAP[folderName] || 'Proposed';
    modified = true;
  }

  if (!modified && hasFrontmatter) {
    return { fileName, folderName, modified: false, action: 'already-valid' };
  }

  const newHeader = `---\nTitle: ${metadata.Title}\nDate: ${metadata.Date}\nStatus: ${metadata.Status}\n---\n\n`;
  const finalContent = newHeader + bodyContent.trimStart();

  if (!IS_DRY_RUN) {
    fs.writeFileSync(filePath, finalContent, 'utf8');
  }

  return {
    fileName,
    folderName,
    modified: true,
    action: hasFrontmatter ? 'updated-header' : 'injected-header',
    metadata
  };
}

function runFixer() {
  const folders = ['drafted', 'approved', 'completed'];
  const results = [];

  folders.forEach(folder => {
    const dirPath = path.join(PLAN_ROOT, folder);
    if (!fs.existsSync(dirPath)) return;

    try {
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
      files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        try {
          const res = normalizeFrontmatter(fullPath, folder);
          results.push(res);
        } catch (err) {
          results.push({ fileName: file, folderName: folder, modified: false, error: err.message });
        }
      });
    } catch (dirErr) {
      if (IS_VERBOSE) console.error(`Error reading directory ${folder}:`, dirErr.message);
    }
  });

  if (IS_JSON) {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), isDryRun: IS_DRY_RUN, results }, null, 2));
    return;
  }

  console.log(`\n${colors.bright}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan} 🛠 FRONTMATTER NORMALIZER REPORT (fix_frontmatter.js)${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}====================================================${colors.reset}\n`);

  if (IS_DRY_RUN) {
    console.log(`${colors.yellow}⚠️ DRY RUN MODE ACTIVE - No physical file edits executed.${colors.reset}\n`);
  }

  const modifiedList = results.filter(r => r.modified);
  if (modifiedList.length === 0) {
    console.log(`  ${colors.green}✔ All plans already contain valid YAML frontmatter headers.${colors.reset}\n`);
    return;
  }

  modifiedList.forEach(r => {
    console.log(`  ${colors.green}✔ ${r.fileName}${colors.reset} [${r.folderName}/] - ${colors.cyan}${r.action}${colors.reset}`);
    console.log(`     Title: ${r.metadata.Title} | Status: ${r.metadata.Status}`);
  });
  console.log('');
}

runFixer();

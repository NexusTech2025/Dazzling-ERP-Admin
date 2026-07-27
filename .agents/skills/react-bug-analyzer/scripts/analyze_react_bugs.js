/**
 * analyze_react_bugs.js - Static Analysis & React Code Smell Diagnostic Tool (ESM)
 * 
 * Audits React component files and custom hooks for:
 * 1. TanStack Query Key Factory & cacheHelper compliance
 * 2. Overly deep query keys & filter parameter pollution
 * 3. Zero-New-UI-Components Policy violations (raw <input>, <select>, <button>)
 * 4. Missing React key props or array index key usage in .map()
 * 5. Native new Date() string parsing instead of date-fns parseISO
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_ROOT = path.resolve(__dirname, '../../../../');

// CLI Arguments
const args = process.argv.slice(2);
function getArgVal(flag) {
  const idx = args.indexOf(flag);
  return idx > -1 && args[idx + 1] ? args[idx + 1] : null;
}

const TARGET_PATH_ARG = getArgVal('--path') || 'src';
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

/**
 * Scans directory recursively for .js and .jsx files.
 */
function scanFiles(dirPath, fileList = []) {
  if (!fs.existsSync(dirPath)) return fileList;

  const stats = fs.statSync(dirPath);
  if (stats.isFile()) {
    if (dirPath.endsWith('.js') || dirPath.endsWith('.jsx')) {
      fileList.push(dirPath);
    }
    return fileList;
  }

  const entries = fs.readdirSync(dirPath);
  entries.forEach(entry => {
    // Ignore node_modules, .git, dist, build
    if (['node_modules', '.git', 'dist', 'build'].includes(entry)) return;
    const fullPath = path.join(dirPath, entry);
    scanFiles(fullPath, fileList);
  });

  return fileList;
}

/**
 * Analyzes a single file for React architectural code smells.
 */
function analyzeFile(filePath) {
  const relPath = path.relative(WORKSPACE_ROOT, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const issues = [];

  const isUiPrimitive = relPath.includes('src/components/ui/') || relPath.includes('src/components/guards/');
  const isQueryHook = relPath.includes('/hooks/') && relPath.endsWith('Queries.js');

  lines.forEach((line, lineIdx) => {
    const lineNo = lineIdx + 1;
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

    // Rule 1A: Inline Query Key Array in useQuery/useMutation
    if (/(?:useQuery|useMutation)\s*\(\s*\{\s*queryKey\s*:\s*\[\s*['"`]/i.test(line) || /queryKey\s*:\s*\[\s*['"`][a-zA-Z0-9_-]+['"`]/i.test(line)) {
      if (!isUiPrimitive) {
        issues.push({
          lineNo,
          rule: 'QUERY_KEY_FACTORY_VIOLATION',
          severity: 'HIGH',
          message: 'Inline string array used for queryKey. Use centralized factory methods from queryKeys.js instead.'
        });
      }
    }

    // Rule 1B: Filter variables passed directly into query key parameter
    if (/queryKeys\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\([^)]*,\s*[{a-zA-Z0-9_-]*filter/i.test(line)) {
      issues.push({
        lineNo,
        rule: 'QUERY_KEY_FILTER_POLLUTION',
        severity: 'HIGH',
        message: 'Ephemeral UI filter object detected inside query key parameters. Decouple filters into the select option to prevent cache misses.'
      });
    }

    // Rule 1C: Overly deep query keys (e.g. ['batches', 'tests', batchId, testId])
    if (/queryKeys\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\([^)]*,\s*[^)]*,\s*[^)]*\)/i.test(line) && !line.includes('queryKeys.js')) {
      issues.push({
        lineNo,
        rule: 'QUERY_KEY_OVERLY_DEEP',
        severity: 'MEDIUM',
        message: 'Query key appears overly deep (> 2 parameters). Derive single item details using the select option over parent collection.'
      });
    }

    // Rule 2: Zero-New-UI-Components Policy (Raw <input>, <select>, <button>)
    if (!isUiPrimitive) {
      if (/<input\b[^>]*>/i.test(line) && !line.includes('TextInput') && !line.includes('type="checkbox"')) {
        issues.push({
          lineNo,
          rule: 'ZERO_NEW_UI_VIOLATION_INPUT',
          severity: 'HIGH',
          message: 'Raw HTML <input> element detected. Use atomic TextInput component from src/components/ui/v2/TextInput.jsx.'
        });
      }
      if (/<select\b[^>]*>/i.test(line) && !line.includes('SelectInput')) {
        issues.push({
          lineNo,
          rule: 'ZERO_NEW_UI_VIOLATION_SELECT',
          severity: 'HIGH',
          message: 'Raw HTML <select> element detected. Use atomic SelectInput component from src/components/ui/v2/SelectInput.jsx.'
        });
      }
      if (/<button\b[^>]*>/i.test(line) && !line.includes('Button') && !line.includes('subComponents')) {
        issues.push({
          lineNo,
          rule: 'ZERO_NEW_UI_VIOLATION_BUTTON',
          severity: 'MEDIUM',
          message: 'Raw HTML <button> element detected. Use atomic Button component from src/components/ui/v2/Button.jsx.'
        });
      }
    }

    // Rule 3: Missing Key Prop or Array Index Key in .map()
    if (/\.map\s*\(\s*\((?:[a-zA-Z0-9_]+),\s*([a-zA-Z0-9_]+)\)\s*=>/i.test(line)) {
      const idxVar = line.match(/\.map\s*\(\s*\((?:[a-zA-Z0-9_]+),\s*([a-zA-Z0-9_]+)\)\s*=>/i)[1];
      if (new RegExp(`key=\\{${idxVar}\\}`, 'i').test(line) || new RegExp(`key=\\{idx\\}`, 'i').test(line)) {
        issues.push({
          lineNo,
          rule: 'MAP_INDEX_KEY_PROPOSED',
          severity: 'LOW',
          message: `Array index ('${idxVar}') used as React key in .map(). Use unique entity primary keys (e.g. item.id) to prevent state drift.`
        });
      }
    }

    // Rule 4: Native new Date("...") string parsing
    if (/new\s+Date\s*\(\s*(?:[a-zA-Z0-9_.]*(?:Date|Iso|Str|String|Time|Created|Updated))\s*\)/i.test(line) && !line.includes('Date.now()')) {
      issues.push({
        lineNo,
        rule: 'NATIVE_DATE_PARSING',
        severity: 'MEDIUM',
        message: 'Native new Date(string) parsing detected. Use parseISO from date-fns to prevent timezone drift.'
      });
    }
  });

  // Rule 1D: Custom Query Hook Missing cacheHelper Resolvers
  if (isQueryHook && content.includes('useQuery') && !content.includes('resolveList') && !content.includes('resolveRecord')) {
    issues.push({
      lineNo: 1,
      rule: 'QUERY_HOOK_MISSING_CACHE_HELPER',
      severity: 'HIGH',
      message: 'Custom query hook does not import or invoke resolveList / resolveRecord from cacheHelper.js.'
    });
  }

  return {
    filePath,
    relPath,
    issueCount: issues.length,
    issues
  };
}

/**
 * Main Diagnostic Runner
 */
function main() {
  let targetAbsPath = path.isAbsolute(TARGET_PATH_ARG) 
    ? TARGET_PATH_ARG 
    : path.join(WORKSPACE_ROOT, TARGET_PATH_ARG);

  if (!fs.existsSync(targetAbsPath)) {
    console.error(`${colors.red}Error: Target path '${TARGET_PATH_ARG}' does not exist.${colors.reset}`);
    process.exit(1);
  }

  const files = scanFiles(targetAbsPath);
  const reports = files.map(f => analyzeFile(f)).filter(r => r.issueCount > 0);

  const totalIssues = reports.reduce((acc, r) => acc + r.issueCount, 0);

  if (IS_JSON) {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), targetPath: TARGET_PATH_ARG, filesScanned: files.length, totalIssues, reports }, null, 2));
    return;
  }

  console.log(`\n${colors.bright}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan} ⚛ REACT BUG & ARCHITECTURE DIAGNOSTIC REPORT        ${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}====================================================${colors.reset}\n`);

  console.log(`${colors.bright}Scanned Target:${colors.reset} ${TARGET_PATH_ARG} (${files.length} files scanned)`);
  console.log(`${colors.bright}Total Issues Flagged:${colors.reset} ${totalIssues === 0 ? colors.green + '0' : colors.red + totalIssues}${colors.reset}\n`);

  if (totalIssues === 0) {
    console.log(`  ${colors.green}✔ No code smells or architectural violations detected in target scope.${colors.reset}\n`);
    return;
  }

  reports.forEach(rep => {
    console.log(`📄 ${colors.bright}${rep.relPath}${colors.reset} (${rep.issueCount} issue${rep.issueCount > 1 ? 's' : ''})`);
    rep.issues.forEach(iss => {
      const sevColor = iss.severity === 'HIGH' ? colors.red : (iss.severity === 'MEDIUM' ? colors.yellow : colors.gray);
      console.log(`   Line ${String(iss.lineNo).padStart(4)}: [${sevColor}${iss.severity}${colors.reset}] [${colors.cyan}${iss.rule}${colors.reset}]`);
      console.log(`          ↳ ${iss.message}`);
    });
    console.log('');
  });
}

main();

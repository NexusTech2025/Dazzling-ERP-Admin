/**
 * audit_plans.js - Plan Status & Implementation Gap Analyzer (ESM)
 * 
 * High-speed, token-efficient Node.js script to scan implementation plans under .gemini/plan/,
 * parse YAML frontmatter headers, inspect source code files in src/, cross-reference walkthroughs,
 * and output structured status reports.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root paths
const WORKSPACE_ROOT = path.resolve(__dirname, '../../../../');
const PLAN_ROOT = path.join(WORKSPACE_ROOT, '.gemini', 'plan');
const WALKTHROUGH_ROOT = path.join(WORKSPACE_ROOT, '.gemini', 'walkthrough');

// CLI options
const args = process.argv.slice(2);
const IS_JSON = args.includes('--json');
const IS_VERBOSE = args.includes('--verbose') || args.includes('-v');

// Helper: Colors for terminal output
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
 * Parses YAML frontmatter from markdown file content.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { hasFrontmatter: false, metadata: {} };

  const yamlStr = match[1];
  const metadata = {};

  yamlStr.split(/\r?\n/).forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > -1) {
      const key = line.slice(0, colonIdx).trim();
      let value = line.slice(colonIdx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      metadata[key] = value;
    }
  });

  return { hasFrontmatter: true, metadata };
}

/**
 * Extracts target file references (e.g. #### [MODIFY] [file.js](file:///path)) from markdown.
 */
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
      files.push({ action, rawPath, cleanPath });
    }
  }

  return files;
}

/**
 * Checks if target file exists on filesystem.
 */
function verifyFileExistence(filePath) {
  try {
    let resolvedPath = filePath;
    if (!path.isAbsolute(resolvedPath)) {
      resolvedPath = path.join(WORKSPACE_ROOT, filePath);
    }
    if (fs.existsSync(resolvedPath)) {
      const stats = fs.statSync(resolvedPath);
      return { exists: true, size: stats.size, resolvedPath };
    }
  } catch (err) {
    // Ignore error
  }
  return { exists: false, size: 0, resolvedPath: filePath };
}

/**
 * Main Audit Logic
 */
function runAudit() {
  const folders = ['drafted', 'approved', 'completed'];
  const auditResults = [];

  folders.forEach(folder => {
    const dirPath = path.join(PLAN_ROOT, folder);
    if (!fs.existsSync(dirPath)) return;

    try {
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));

      files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const { hasFrontmatter, metadata } = parseFrontmatter(content);
          const targetFiles = extractTargetFiles(content);

          const fmStatus = metadata.Status || 'Missing';
          
          let expectedFolder = folder;
          if (fmStatus === 'Proposed') expectedFolder = 'drafted';
          else if (fmStatus === 'Approved') expectedFolder = 'approved';
          else if (fmStatus === 'Approved-Completed' || fmStatus === 'Completed') expectedFolder = 'completed';

          const isLocationMisaligned = folder !== expectedFolder;

          let verifiedCount = 0;
          const fileChecks = targetFiles.map(tf => {
            const check = verifyFileExistence(tf.cleanPath);
            if (check.exists) verifiedCount++;
            return {
              action: tf.action,
              path: tf.cleanPath,
              exists: check.exists,
              size: check.size
            };
          });

          const totalTargetFiles = targetFiles.length;
          const completionPct = totalTargetFiles > 0 
            ? Math.round((verifiedCount / totalTargetFiles) * 100) 
            : 0;

          let depthGrade = 'UNIMPLEMENTED';
          let depthBadge = '🔴';
          if (completionPct === 100 && totalTargetFiles > 0) {
            depthGrade = 'FULLY_IMPLEMENTED';
            depthBadge = '🟢';
          } else if (completionPct > 0 || (totalTargetFiles === 0 && folder === 'completed')) {
            depthGrade = 'PARTIALLY_IMPLEMENTED';
            depthBadge = '🟡';
          }

          const walkthroughName = file;
          const walkthroughPath = path.join(WALKTHROUGH_ROOT, walkthroughName);
          const hasWalkthrough = fs.existsSync(walkthroughPath);

          auditResults.push({
            fileName: file,
            currentFolder: folder,
            expectedFolder,
            isLocationMisaligned,
            hasFrontmatter,
            frontmatterStatus: fmStatus,
            title: metadata.Title || file.replace(/\.md$/, ''),
            date: metadata.Date || null,
            totalTargetFiles,
            verifiedCount,
            completionPct,
            depthGrade,
            depthBadge,
            hasWalkthrough,
            fileChecks
          });
        } catch (fileErr) {
          if (IS_VERBOSE) console.error(`Error processing file ${file}:`, fileErr.message);
        }
      });
    } catch (dirErr) {
      if (IS_VERBOSE) console.error(`Error reading directory ${folder}:`, dirErr.message);
    }
  });

  if (IS_JSON) {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), results: auditResults }, null, 2));
    return;
  }

  console.log(`\n${colors.bright}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan} 📊 IMPLEMENTATION PLAN AUDIT REPORT (plan-auditor) ${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}====================================================${colors.reset}\n`);

  console.log(`${colors.bright}Total Plans Audited:${colors.reset} ${auditResults.length}\n`);

  const misaligned = auditResults.filter(r => r.isLocationMisaligned || !r.hasFrontmatter);
  console.log(`${colors.bright}📁 1. Directory & Frontmatter Alignment Audit:${colors.reset}`);
  if (misaligned.length === 0) {
    console.log(`  ${colors.green}✔ All plans are correctly aligned with their target directories and frontmatter headers.${colors.reset}\n`);
  } else {
    misaligned.forEach(m => {
      const statusStr = m.hasFrontmatter ? `Status: ${m.frontmatterStatus}` : `${colors.red}No Frontmatter${colors.reset}`;
      console.log(`  - ${colors.yellow}${m.fileName}${colors.reset} [${m.currentFolder}/] -> ${statusStr}`);
      if (m.isLocationMisaligned) {
        console.log(`    ${colors.cyan}↳ Target Location:${colors.reset} .gemini/plan/${m.expectedFolder}/`);
      }
    });
    console.log('');
  }

  console.log(`${colors.bright}🔍 2. Codebase Implementation & Gap Audit:${colors.reset}`);
  auditResults.forEach(res => {
    console.log(`  ${res.depthBadge} ${colors.bright}${res.fileName}${colors.reset} (${res.currentFolder}/)`);
    console.log(`     ${colors.gray}Title:${colors.reset} ${res.title}`);
    console.log(`     ${colors.gray}Status:${colors.reset} ${res.frontmatterStatus} | ${colors.gray}Target Files Verified:${colors.reset} ${res.verifiedCount}/${res.totalTargetFiles} (${res.completionPct}%)`);
    console.log(`     ${colors.gray}Walkthrough Logs:${colors.reset} ${res.hasWalkthrough ? `${colors.green}Present${colors.reset}` : `${colors.gray}None${colors.reset}`}`);

    if (IS_VERBOSE && res.fileChecks.length > 0) {
      res.fileChecks.forEach(fc => {
        const icon = fc.exists ? `${colors.green}✔${colors.reset}` : `${colors.red}✖${colors.reset}`;
        console.log(`        ${icon} [${fc.action}] ${fc.path}`);
      });
    }
    console.log('');
  });
}

runAudit();

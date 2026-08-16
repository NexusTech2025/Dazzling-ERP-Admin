const fs = require('fs');
const path = require('path');
const { parseTranscript } = require('./parse_transcript');
const { extractDiffs } = require('./extract_diff');

function exportDigest(target, options = {}) {
  const parsed = parseTranscript(target, options);
  const diffs = extractDiffs(target, options);

  const outputPath = options.out || path.join(process.cwd(), '.gemini', 'memory', 'sessions', `${parsed.conversationId}_digest.md`);
  const outDir = path.dirname(outputPath);

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const modifiedFiles = Array.from(new Set(diffs.map(d => d.file).filter(Boolean)));

  let markdown = `# 📜 Chat Session Digest: ${parsed.conversationId}\n\n`;
  markdown += `**Export Date**: \`${new Date().toISOString()}\`  \n`;
  markdown += `**Source Directory**: \`${parsed.dirPath}\`  \n`;
  markdown += `**Total Session Steps**: \`${parsed.totalSteps}\`  \n\n`;
  markdown += `---\n\n`;

  markdown += `## 💬 User Prompts & Objectives\n\n`;
  parsed.userPrompts.forEach((p, idx) => {
    markdown += `### Prompt #${idx + 1} (Step ${p.stepIndex})\n`;
    markdown += `${p.content}\n\n`;
  });

  markdown += `---\n\n`;
  markdown += `## 🛠️ Code Modifications (${modifiedFiles.length} Files Edited)\n\n`;
  modifiedFiles.forEach(f => {
    markdown += `- \`${f}\`\n`;
  });

  markdown += `\n---\n\n`;
  markdown += `## 📄 Detailed Code Diffs Summary\n\n`;
  diffs.forEach((d, i) => {
    markdown += `### Edit #${i + 1} - Step ${d.stepIndex} (${d.action})\n`;
    markdown += `**File**: \`${d.file}\`  \n`;
    if (d.description) markdown += `**Context**: ${d.description}  \n`;
    if (d.targetContent) {
      markdown += `\`\`\`diff\n- ${d.targetContent.split('\n').join('\n- ')}\n+ ${d.replacementContent.split('\n').join('\n+ ')}\n\`\`\`\n\n`;
    }
  });

  fs.writeFileSync(outputPath, markdown, 'utf8');
  return { outputPath, conversationId: parsed.conversationId };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const nonFlags = args.filter(a => !a.startsWith('--'));
  const target = nonFlags[0];

  const outIndex = args.indexOf('--out');
  const outPath = outIndex !== -1 ? args[outIndex + 1] : null;

  if (!target) {
    console.error('Usage: node export_digest.js <dir_path_or_id> [--out <output_path>]');
    process.exit(1);
  }

  try {
    const res = exportDigest(target, { out: outPath });
    console.log(`✔ Session Digest Exported Successfully!`);
    console.log(`📄 Saved to: ${res.outputPath}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { exportDigest };

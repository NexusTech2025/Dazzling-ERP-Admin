const fs = require('fs');
const { resolveSession } = require('./locate_session.cjs');

function extractDiffs(target, options = {}) {
  const resolved = resolveSession(target, options);
  if (!resolved.exists || !resolved.transcriptPath) {
    throw new Error(`Transcript file not found for: ${target}`);
  }

  const raw = fs.readFileSync(resolved.transcriptPath, 'utf8');
  const lines = raw.split('\n');
  const diffs = [];

  lines.forEach((line, idx) => {
    if (!line.trim()) return;
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'PLANNER_RESPONSE' && Array.isArray(obj.tool_calls)) {
        obj.tool_calls.forEach(tc => {
          const name = tc.name || tc.function?.name || '';
          const args = tc.args || tc.parameters || tc.arguments || {};
          const file = args.TargetFile || args.targetFile || args.filePath || '';

          if (options.file && file && !file.toLowerCase().includes(options.file.toLowerCase())) {
            return;
          }

          if (name.includes('replace_file_content')) {
            diffs.push({
              stepIndex: obj.step_index ?? idx,
              action: 'MODIFY',
              file,
              description: args.Description || args.Instruction || '',
              targetContent: args.TargetContent || args.targetContent || '',
              replacementContent: args.ReplacementContent || args.replacementContent || '',
              startLine: args.StartLine || args.startLine,
              endLine: args.EndLine || args.endLine
            });
          } else if (name.includes('multi_replace_file_content')) {
            const chunks = args.ReplacementChunks || args.replacementChunks || [];
            chunks.forEach(chunk => {
              diffs.push({
                stepIndex: obj.step_index ?? idx,
                action: 'MULTI_MODIFY',
                file,
                description: args.Description || args.Instruction || '',
                targetContent: chunk.TargetContent || chunk.targetContent || '',
                replacementContent: chunk.ReplacementContent || chunk.replacementContent || '',
                startLine: chunk.StartLine || chunk.startLine,
                endLine: chunk.EndLine || chunk.endLine
              });
            });
          } else if (name.includes('write_to_file')) {
            diffs.push({
              stepIndex: obj.step_index ?? idx,
              action: args.Overwrite ? 'OVERWRITE' : 'NEW_FILE',
              file,
              description: args.Description || '',
              contentLength: (args.CodeContent || '').length
            });
          }
        });
      }
    } catch (e) {}
  });

  return diffs;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const nonFlags = args.filter(a => !a.startsWith('--'));
  const target = nonFlags[0];
  const fileFilter = nonFlags[1];

  if (!target) {
    console.error('Usage: node extract_diff.cjs <dir_path_or_id> [file_filter_path]');
    process.exit(1);
  }

  try {
    const diffs = extractDiffs(target, { file: fileFilter });
    console.log(`\n====================================================`);
    console.log(` 📝 CODE DIFFS EXTRACTOR (${diffs.length} edits found)`);
    console.log(`====================================================\n`);

    diffs.forEach((d, idx) => {
      console.log(`[Edit #${idx + 1} - Step ${d.stepIndex} | Action: ${d.action}]`);
      console.log(`📄 File: ${d.file}`);
      if (d.description) console.log(`📌 Context: ${d.description}`);
      if (d.targetContent) {
        console.log(`\n--- Target (Lines ${d.startLine}-${d.endLine}) ---`);
        console.log(d.targetContent.substring(0, 300));
        console.log(`\n+++ Replacement +++`);
        console.log(d.replacementContent.substring(0, 300));
      } else if (d.contentLength) {
        console.log(`✨ Written Code Content Size: ${d.contentLength} bytes`);
      }
      console.log('\n----------------------------------------------------\n');
    });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { extractDiffs };

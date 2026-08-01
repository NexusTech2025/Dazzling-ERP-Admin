const fs = require('fs');
const path = require('path');
const { resolveSession } = require('./locate_session');

function parseTranscript(target, options = {}) {
  const resolved = resolveSession(target, options);
  if (!resolved.exists || !resolved.transcriptPath) {
    throw new Error(`Transcript file not found for: ${target}`);
  }

  const raw = fs.readFileSync(resolved.transcriptPath, 'utf8');
  const lines = raw.split('\n');
  const userPrompts = [];
  const modelSummaries = [];
  const toolExecutions = [];
  let totalSteps = 0;

  lines.forEach((line, idx) => {
    if (!line.trim()) return;
    try {
      const obj = JSON.parse(line);
      totalSteps++;

      if (obj.type === 'USER_INPUT') {
        let text = obj.content || '';
        text = text.replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/g, '').trim();
        userPrompts.push({
          stepIndex: obj.step_index ?? idx,
          content: text
        });
      } else if (obj.type === 'PLANNER_RESPONSE') {
        if (obj.content && obj.content.trim()) {
          modelSummaries.push({
            stepIndex: obj.step_index ?? idx,
            content: obj.content.substring(0, 500)
          });
        }
        if (Array.isArray(obj.tool_calls)) {
          obj.tool_calls.forEach(tc => {
            toolExecutions.push({
              stepIndex: obj.step_index ?? idx,
              name: tc.name || tc.function?.name || tc.toolAction || 'unknown',
              args: tc.args || tc.parameters || tc.arguments || {}
            });
          });
        }
      }
    } catch (e) {}
  });

  return {
    conversationId: resolved.conversationId,
    dirPath: resolved.dirPath,
    transcriptPath: resolved.transcriptPath,
    totalSteps,
    userPrompts,
    modelSummaries,
    toolExecutions
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const target = args.find(a => !a.startsWith('--'));
  const isSummaryOnly = args.includes('--summary-only');
  const isJson = args.includes('--json');

  if (!target) {
    console.error('Usage: node parse_transcript.js <dir_path_or_id> [--summary-only] [--json]');
    process.exit(1);
  }

  try {
    const data = parseTranscript(target);
    if (isJson) {
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(`\n====================================================`);
      console.log(` 📜 SESSION DIGEST REPORT (${data.conversationId})`);
      console.log(`====================================================\n`);
      console.log(`📍 Path: ${data.dirPath}`);
      console.log(`🔢 Total Parsed Steps: ${data.totalSteps}\n`);

      console.log(`--- 💬 USER PROMPTS (${data.userPrompts.length}) ---`);
      data.userPrompts.forEach((p, i) => {
        console.log(`\n[Prompt #${i + 1} - Step ${p.stepIndex}]`);
        console.log(p.content.substring(0, 300) + (p.content.length > 300 ? '...' : ''));
      });

      if (!isSummaryOnly) {
        console.log(`\n--- 🛠️ TOOL EXECUTIONS SUMMARY (${data.toolExecutions.length}) ---`);
        const toolCounts = {};
        data.toolExecutions.forEach(t => {
          toolCounts[t.name] = (toolCounts[t.name] || 0) + 1;
        });
        console.table(toolCounts);
      }
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { parseTranscript };

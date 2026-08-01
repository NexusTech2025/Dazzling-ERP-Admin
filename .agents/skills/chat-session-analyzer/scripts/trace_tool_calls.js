const fs = require('fs');
const { resolveSession } = require('./locate_session');

function traceToolCalls(target, options = {}) {
  const resolved = resolveSession(target, options);
  if (!resolved.exists || !resolved.transcriptPath) {
    throw new Error(`Transcript file not found for: ${target}`);
  }

  const raw = fs.readFileSync(resolved.transcriptPath, 'utf8');
  const lines = raw.split('\n');
  const traces = [];

  lines.forEach((line, idx) => {
    if (!line.trim()) return;
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'PLANNER_RESPONSE' && Array.isArray(obj.tool_calls)) {
        obj.tool_calls.forEach(tc => {
          const name = tc.name || tc.function?.name || tc.toolAction || '';
          if (options.tool && !name.toLowerCase().includes(options.tool.toLowerCase())) {
            return;
          }

          const args = tc.args || tc.parameters || tc.arguments || {};
          traces.push({
            stepIndex: obj.step_index ?? idx,
            toolName: name,
            toolSummary: tc.toolSummary || '',
            commandLine: args.CommandLine || args.commandLine || '',
            cwd: args.Cwd || args.cwd || '',
            query: args.Query || args.query || '',
            path: args.SearchPath || args.AbsolutePath || args.TargetFile || args.DirectoryPath || ''
          });
        });
      }
    } catch (e) {}
  });

  return traces;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const nonFlags = args.filter(a => !a.startsWith('--'));
  const target = nonFlags[0];

  const toolIndex = args.indexOf('--tool');
  const toolFilter = toolIndex !== -1 ? args[toolIndex + 1] : null;

  if (!target) {
    console.error('Usage: node trace_tool_calls.js <dir_path_or_id> [--tool run_command]');
    process.exit(1);
  }

  try {
    const traces = traceToolCalls(target, { tool: toolFilter });
    console.log(`\n====================================================`);
    console.log(` 🔧 TOOL EXECUTION TRACER (${traces.length} calls logged)`);
    console.log(`====================================================\n`);

    traces.forEach((t, i) => {
      console.log(`[#${i + 1} Step ${t.stepIndex}] Tool: ${t.toolName} ${t.toolSummary ? '(' + t.toolSummary + ')' : ''}`);
      if (t.commandLine) console.log(`   💻 Command: ${t.commandLine}`);
      if (t.query) console.log(`   🔍 Query:   ${t.query}`);
      if (t.path) console.log(`   📁 Target:  ${t.path}`);
      console.log('');
    });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { traceToolCalls };

const fs = require('fs');
const { resolveSession } = require('./locate_session');

function searchTranscript(target, pattern, options = {}) {
  const resolved = resolveSession(target, options);
  if (!resolved.exists || !resolved.transcriptPath) {
    throw new Error(`Transcript file not found for: ${target}`);
  }

  if (!pattern) {
    throw new Error('Pattern is required for search');
  }

  const flags = options.caseSensitive ? 'g' : 'gi';
  const regex = new RegExp(pattern, flags);
  const raw = fs.readFileSync(resolved.transcriptPath, 'utf8');
  const lines = raw.split('\n');
  const matches = [];

  lines.forEach((line, idx) => {
    if (!line.trim()) return;
    if (regex.test(line)) {
      try {
        const obj = JSON.parse(line);
        if (options.type && obj.type !== options.type) return;

        const content = JSON.stringify(obj);
        const matchSnippets = [];
        let match;
        const re = new RegExp(pattern, flags);
        while ((match = re.exec(content)) !== null) {
          const start = Math.max(0, match.index - 50);
          const end = Math.min(content.length, match.index + match[0].length + 50);
          matchSnippets.push(content.substring(start, end));
        }

        matches.push({
          lineNumber: idx + 1,
          stepIndex: obj.step_index ?? idx,
          type: obj.type,
          snippets: matchSnippets
        });
      } catch (e) {}
    }
  });

  return matches;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const nonFlags = args.filter(a => !a.startsWith('--'));
  const target = nonFlags[0];
  const pattern = nonFlags[1];

  const caseSensitive = args.includes('--case-sensitive');
  const typeIndex = args.indexOf('--type');
  const typeFilter = typeIndex !== -1 ? args[typeIndex + 1] : null;

  if (!target || !pattern) {
    console.error('Usage: node search_transcript.js <dir_path_or_id> <pattern> [--type USER_INPUT] [--case-sensitive]');
    process.exit(1);
  }

  try {
    const results = searchTranscript(target, pattern, { caseSensitive, type: typeFilter });
    console.log(`\n====================================================`);
    console.log(` 🔍 SEARCH RESULTS FOR "${pattern}" (${results.length} matches)`);
    console.log(`====================================================\n`);

    results.forEach(m => {
      console.log(`[Line ${m.lineNumber} | Step ${m.stepIndex} | ${m.type}]`);
      m.snippets.forEach(s => console.log(`   ... ${s.trim()} ...`));
      console.log('');
    });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { searchTranscript };

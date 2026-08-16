const fs = require('fs');
const path = require('path');

function resolveSession(input, options = {}) {
  if (!input) {
    console.error('Usage: node locate_session.cjs <dir_path_or_id> [--full] [--json]');
    process.exit(1);
  }

  const targetName = options.full ? 'transcript_full.jsonl' : 'transcript.jsonl';
  const cleanInput = input.trim().replace(/^['"]|['"]$/g, '');

  // Case 1: Direct absolute folder path or file path
  if (fs.existsSync(cleanInput)) {
    let dirPath = cleanInput;
    if (fs.statSync(cleanInput).isFile()) {
      dirPath = path.dirname(cleanInput);
      if (dirPath.endsWith('.system_generated' + path.sep + 'logs') || dirPath.endsWith('.system_generated/logs')) {
        dirPath = path.dirname(path.dirname(dirPath));
      }
    }

    const candidateLogs = [
      path.join(dirPath, '.system_generated', 'logs', targetName),
      path.join(dirPath, targetName),
      path.join(dirPath, '.system_generated', 'logs', 'transcript.jsonl')
    ];

    for (const cand of candidateLogs) {
      if (fs.existsSync(cand)) {
        return {
          conversationId: path.basename(dirPath),
          dirPath,
          transcriptPath: cand,
          exists: true
        };
      }
    }

    return {
      conversationId: path.basename(dirPath),
      dirPath,
      transcriptPath: path.join(dirPath, '.system_generated', 'logs', targetName),
      exists: false
    };
  }

  // Case 2: Scan .gemini root directories for conversation ID
  const geminiRoot = path.join(process.env.USERPROFILE || 'C:/Users/manis', '.gemini');
  const results = [];

  function searchDir(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        const full = path.join(currentDir, item);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          if (item === cleanInput || full.includes(cleanInput)) {
            const transcript = path.join(full, '.system_generated', 'logs', targetName);
            if (fs.existsSync(transcript)) {
              results.push({
                conversationId: item,
                dirPath: full,
                transcriptPath: transcript,
                exists: true
              });
            }
          }
          if (!full.includes('.system_generated') && !full.includes('node_modules')) {
            searchDir(full);
          }
        }
      }
    } catch (e) {}
  }

  if (fs.existsSync(geminiRoot)) {
    searchDir(geminiRoot);
  }

  if (results.length > 0) {
    return results[0];
  }

  return {
    conversationId: cleanInput,
    dirPath: cleanInput,
    transcriptPath: null,
    exists: false
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const input = args.find(a => !a.startsWith('--'));
  const isFull = args.includes('--full');
  const isJson = args.includes('--json');

  const res = resolveSession(input, { full: isFull });
  if (isJson) {
    console.log(JSON.stringify(res, null, 2));
  } else if (res.exists) {
    console.log(`✔ Session Located: ${res.conversationId}`);
    console.log(`  Directory:  ${res.dirPath}`);
    console.log(`  Transcript: ${res.transcriptPath}`);
  } else {
    console.error(`✖ Session transcript not found for: "${input}"`);
    process.exit(1);
  }
}

module.exports = { resolveSession };

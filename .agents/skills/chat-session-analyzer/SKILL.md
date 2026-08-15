---
name: chat-session-analyzer
description: Reads, parses, searches, and extracts task context, code diffs, terminal outputs, and architectural decisions from past Antigravity conversation sessions (transcript.jsonl / transcript_full.jsonl). Activate this skill when asked to inspect past chat sessions, extract work context from conversation folders, search session logs, or export session memory digests.
---

# Chat Session Analyzer & Context Extractor Skill

## Overview
This skill provides a multi-script analytical toolkit to inspect past Antigravity conversation sessions. It extracts user requirements, code modifications, terminal outputs, and architectural decisions from transcript logs (`transcript.jsonl` / `transcript_full.jsonl`), allowing AI agents and users to carry over past work context into future sessions.

---

## 🛠️ Specialized Helper Scripts (`scripts/`)

| Script | Command Usage | Description |
| :--- | :--- | :--- |
| **`locate_session.cjs`** | `node .agents/skills/chat-session-analyzer/scripts/locate_session.cjs <dir_path_or_id> [--full] [--json]` | Resolves direct folder paths or searches Conversation IDs across `.gemini/` directories. |
| **`parse_transcript.cjs`** | `node .agents/skills/chat-session-analyzer/scripts/parse_transcript.cjs <dir_path_or_file> [--summary-only] [--json]` | Parses transcript and outputs user prompts, model responses, and workflow step digests. |
| **`search_transcript.cjs`** | `node .agents/skills/chat-session-analyzer/scripts/search_transcript.cjs <dir_path_or_file> <pattern> [--type USER_INPUT]` | Searches regex/text patterns across transcript steps with line numbers and snippets. |
| **`extract_diff.cjs`** | `node .agents/skills/chat-session-analyzer/scripts/extract_diff.cjs <dir_path_or_file> [--file <path>]` | Extracts file modifications (`replace_file_content`, `write_to_file`) as unified diffs. |
| **`trace_tool_calls.cjs`** | `node .agents/skills/chat-session-analyzer/scripts/trace_tool_calls.cjs <dir_path_or_file> [--tool run_command]` | Audits executed terminal commands, search queries, and tool execution logs. |
| **`export_digest.cjs`** | `node .agents/skills/chat-session-analyzer/scripts/export_digest.cjs <dir_path_or_file> [--out <output_path>]` | Generates a persistent Markdown digest (`<session_id>_digest.md`) into `.gemini/memory/`. |

---

## 🛠️ Execution Pipeline & Workflows

### 1. User Provides Direct Chat Session Directory Path
When the user provides a direct folder path (e.g. `C:\Users\manis\.gemini\antigravity-ide\brain\45ac5707-8980-4661-8c7a-459f7f417ebb`):
1. **Resolve Transcript File**:  
   Run `node .agents/skills/chat-session-analyzer/scripts/locate_session.cjs "C:\Users\manis\.gemini\antigravity-ide\brain\45ac5707-8980-4661-8c7a-459f7f417ebb"` to verify `transcript.jsonl` exists.
2. **Extract Session Digest**:  
   Run `node .agents/skills/chat-session-analyzer/scripts/parse_transcript.cjs "<dir_path>" --summary-only` to summarize user prompts and accomplishments.
3. **Extract Code Changes**:  
   Run `node .agents/skills/chat-session-analyzer/scripts/extract_diff.cjs "<dir_path>"` to view exact code diffs made in that session.
4. **Search Pattern / Error Diagnostic** *(if requested)*:  
   Run `node .agents/skills/chat-session-analyzer/scripts/search_transcript.cjs "<dir_path>" "<pattern>"` to find specific error messages or keyword matches.

---

## 📄 Standard Session Digest Output

```markdown
# 📜 Session Context Digest: `[session_id]`

**Session Directory**: `[dir_path]`  
**Total Steps Parsed**: `[count]`

---

## 💬 User Prompts & Objectives
- **Step 0**: [Initial prompt summary]
- **Step 14**: [Follow-up prompt summary]

---

## 🛠️ Code Modifications & Diffs Summary
- `[file_path]`: Modified lines [StartLine - EndLine]
- `[new_file_path]`: Created new file

---

## 💡 Key Architectural Decisions & Context
- [Key decision or bugfix summary]
```

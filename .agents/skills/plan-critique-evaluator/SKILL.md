---
name: plan-critique-evaluator
description: Evaluates and criticizes technical implementation plans (implementation_plan.md) against chat session context logs (.jsonl or .md chat exports). Generates a detailed Critique & Value Assessment Report highlighting strengths, weaknesses, UX impact, and user utility. Activate this skill when asked to review, critique, audit, or evaluate an implementation plan.
---

# Plan Critique & Value Evaluator Skill

This skill conducts a rigorous technical audit and value analysis of an `implementation_plan.md` artifact by cross-referencing it with the full context of the chat session transcript (`.jsonl` or `.md` chat export).

---

## 🛠️ Operational Protocol & Execution Workflow

Whenever activated to review or critique an implementation plan, the agent **MUST** follow these steps:

### Step 1: Identify Chat Session Context File
To diagnose the plan completely, the skill **MUST verify or request access to the chat session file**:
- Check for session logs in `.gemini/memory/sessions/` or the Antigravity conversation directory `<appDataDir>\brain\<conversation-id>\.system_generated\logs\transcript.jsonl`.
- If the chat transcript location is not specified, **ask the user** to specify or confirm the path to the chat log file (e.g. `C:\Users\manis\Downloads\Feature_Chat_Log.md` or conversation directory).

### Step 2: Read & Synthesize Inputs
1. Read the target `implementation_plan.md` artifact.
2. Read the chat session context file (`transcript.jsonl` or `.md` log) to extract:
   - Original user intent and explicit requirements.
   - Constraints, schema rules, and business logic mandates.
   - Key design decisions discussed in the conversation.

### Step 3: Perform 4-Axis Technical & Value Critique

Evaluate the implementation plan across four critical dimensions:

#### 1. 🌟 The Good (Strengths & Architectural Merit)
- Alignment with system conventions (atomic components, date-fns parsing, query key factory).
- Schema compliance with decoupled database definitions.
- Clean component isolation and state scoping.

#### 2. ⚠️ The Bad & Gaps (Technical Weaknesses & Missing Details)
- Unhandled edge cases (empty states, offline/error boundaries, partial API failures).
- Over-engineering or violation of the **Zero-New-UI-Components Policy**.
- Hidden performance risks (un-memoized array transformations, missing cache TTLs).
- Gaps between user request and proposed plan.

#### 3. 🎯 User Value & Real-World Impact
- **End-User Utility**: How much speed, clarity, or convenience this feature delivers to administrative users.
- **UX Improvement**: Visual ergonomics, density, responsiveness, micro-interactions.
- **Return on Investment (ROI)**: Effort vs. tangible business/workflow benefit.

#### 4. 🛠️ Remediation & Refinement Recommendations
- Concrete, step-by-step modifications to improve the plan before execution.

---

## 📄 Standard Report Output Format

The output report must be structured using the following format:

```markdown
# 📋 Implementation Plan Critique & Value Assessment

**Target Plan**: `[path/to/implementation_plan.md]`  
**Context Session**: `[path/to/chat_session]`  
**Audit Date**: `YYYY-MM-DD`

---

## 🟢 1. The Good (Strengths & Structural Merit)
- [Strength 1 with exact file/code reference]
- [Strength 2...]

## 🔴 2. The Bad (Weaknesses, Risks & Missing Gaps)
- [Gap/Risk 1: Description and impact]
- [Gap/Risk 2: Edge case not handled]

## 💡 3. End-User Value & UX Impact Analysis
- **User Convenience & ROI**: [High/Medium/Low assessment]
- **Workflow Speedup**: [How it reduces administrative clicks/friction]
- **Design & Visual Density**: [Alignment with V2 Dark Slate theme]

## 🔧 4. Actionable Refinement Recommendations
1. [Recommendation 1]
2. [Recommendation 2]
```

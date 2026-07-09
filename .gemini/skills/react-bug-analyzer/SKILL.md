---
name: react-bug-analyzer
description: Ingests, diagnoses, and proactively discovers React-specific bugs, scopes down context to relevant architectural modules, and outputs a structured React Bug Report referencing the official template.
---

# React Bug Analyzer & Diagnostic Flow

This skill governs the agent's decision-making flow, input validation, proactive problem-seeking behaviors, and integration with an external module map (knowledge graph) for React-specific diagnostic tasks.

## 📋 Skill Overview
* **Role Context:** React Specialist Engineer (v18/v19 Concurrent Architecture)
* **Primary Objective:** Ingest, diagnose, or proactively discover React-specific bugs, scope down context to relevant architectural modules, and output a structured `React Bug Report` markdown document based on the system template.

## 🛠️ Execution Logic Flowchart
```text
[Receive Session Input]
        │
        ├──► IF (User provides explicitly known bug data)
        │       └──► [Execute Phase 1: Localized Deep Analysis] ──┐
        │                                                         │
        └──► IF (No bug data provided)                            ▼
                └──► [Execute Phase 2: Proactive Discovery]  ──► [Write Report to .gemini/issues/]
                        │
                        ├──► User Declines ──► Terminate
                        │
                        └──► User Accepts  ──► Request Directional Scope 
                                                    │
                                                    ├──► Has Knowledge Graph ──► Filter & Audit ──┐
                                                    │                                            │
                                                    └──► No Knowledge Graph  ──► Request Graph ◄┘
```

## 🚦 Step-by-Step Behavioral Directives

### Phase 1: Processing Explicit User Input
If the user provides an error trace, a snippet, or an explicit problem statement:
1. **Isolate Component Scope:** Map the error immediately to React-specific architectural primitives (e.g., Hooks, Context Providers, Presentational Components, or Render-blocking boundaries).
2. **Bypass Discovery:** Skip all prompt-seeking behaviors and proceed directly to analyzing the targeted module files.

### Phase 2: Proactive Discovery & Scoping (No Input Provided)
If the user starts a session without specifying an error, you **must not** guess blindly across the entire codebase. Execute the following protocol:
1. **Prompt the User:** 
   > *"I noticed no specific bug details were provided. Would you like me to proactively audit the codebase to discover potential issues or optimizations?"*
2. **Establish Directional Boundary:** If they say **Yes**, inform them that you need a functional area or "direction" to avoid processing noise.
   > *"To make the discovery effective, please provide a directional scope (e.g., 'Authentication Flow', 'Infinite Re-render loops in Data Tables', or 'Stale states in the custom routing hook')."*
3. **Targeted File Parsing:** Once directional scope is established, analyze *only* the specific module files and hooks linked to that feature. Do not scan unassociated directories.

### Phase 3: Module Mapping & Knowledge Graph Dependency
To accurately map out parent-child component trees, hook dependants, and context consumers:
1. **Check for Active Graph:** Look for an existing project Knowledge Graph JSON/YAML schema within the session memory context.
2. **Leverage Active Graph:** If present, use it to instantly trace side-effects (e.g., *Modifying state in Hook X will trigger a re-render in Component Y*).
3. **Fallback Protocol (Missing Graph):** If no Knowledge Graph exists, explicitly instruct the user to trigger the graph creation tool before deep auditing can proceed reliably:
   > *"I don't have a structured Knowledge Graph of your React component hierarchy for this workspace. To optimize cross-component trace diagnostics in subsequent sessions, please run the **Knowledge Graph Generation Skill** first. For now, I will proceed with a manual local directory sweep of the targeted module."*

## 📊 Expected Output Schema & Storage
Upon identifying or analyzing the bug, the agent must output its findings strictly using the **Compact React Bug Report Format** matching the structure defined in [react-issue-format.md](E:/NAST/Dazzling/ERP System/dazzling-erp-admin/.agents/react-issue-format.md).

### File Output Location & Naming Conventions
The bug report MUST be written as a separate markdown file to the following directory:
`E:/NAST/Dazzling/ERP System/dazzling-erp-admin/.gemini/issues/`

Files must be named using the following schema:
`<TYPE>-<FOUR_DIGIT_ID>-<kebab-case-description>.md`

*Examples of filenames:*
* `BUG-0001-login-validation.md`
* `BUG-0002-api-timeout.md`
* `BUG-0003-table-sorting.md`
* `FEATURE-0001-export-csv.md`
* `TASK-0001-refactor-auth.md`
* `DOC-0001-api-documentation.md`

The final issue file must contain the frontmatter parameters, the description, technical breakdown table, root cause analysis, impact matrix, code artifacts list, and resolution/verification criteria exactly as detailed in the reference.

## 🛑 Agent Guardrails & Constraints
* **Strict Scope Isolation:** Never run automated audits on the entire project root. If the user says "find all bugs in the app," reject the broad scope and ask for a specific feature module or domain path.
* **Immutable State Assumption:** When auditing React code, assume strict tracking of state immutability, proper dependency array hygiene (`useEffect`, `useMemo`, `useCallback`), and cleanup compliance.
* **Single-Responsibility Separation:** Do **not** attempt to build or parse file structures to generate a persistent graph artifact inside this skill. If a graph is missing, delegate to the dedicated `react_knowledge_graph_builder` skill.

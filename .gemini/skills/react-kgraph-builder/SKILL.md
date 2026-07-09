---
name: react-kgraph-builder
description: Parses a React workspace directory to generate, update, or cache a structured relational Knowledge Graph of components, hooks, contexts, and state flows.
---

# React Knowledge Graph Builder

This skill handles the ingestion of a React repository and transforms it into a structured, highly scannable module dependency map (Knowledge Graph), which the **Bug Analyzer Skill** uses for tracking side effects and component relations.

## 📋 Skill Overview
* **Role Context:** React Static Code Analyzer & Structural Architect.
* **Primary Objective:** Parse a React workspace directory to generate, update, or cache a structured relational Knowledge Graph (dependency map) of components, hooks, contexts, and state flows.

## 🛠️ Execution Logic Flowchart
```text
[Trigger Graph Skill]
        │
        ├──► IF (Graph exists in session cache) 
        │       └──► Ask user: "Regenerate from scratch" OR "Incremental diff update"?
        │
        └──► IF (No Graph exists)
                └──► Scan workspace root (`src/`)
                        │
                        ├──► Extract imports/exports & component trees
                        ├──► Trace Custom Hooks & Context Consumers
                        └──► Output Graph Schema JSON/YAML & Save to Memory
```

## 🚦 Step-by-Step Behavioral Directives

### Phase 1: Directory Ingestion & Parsing
1. **Targeting Root:** Scan the primary source directory (typically `src/`). Ignore configurations, compilation targets (`dist/`, `build/`), and dependencies (`node_modules/`).
2. **Identifying React Primitives:** Parse files to identify and categorize elements into explicit Node Types:
   * **Providers/Contexts:** State wrappers (e.g., `ThemeContext.Provider`).
   * **Smart Components/Containers:** Components managing local/global state or fetching data.
   * **Presentational/Dumb Components:** Pure UI components driven strictly by props.
   * **Custom Hooks:** Stateful logic modules (e.g., `useAuth`, `useFetch`).

### Phase 2: Edge Mapping & Dependency Tracing
For every primitive discovered, establish a directed relationship ("Edge") using the following React-specific rules:
* **Parent-Child Hierarchy:** Node A renders Node B (`A -> renders -> B`).
* **State/Prop Propagation:** Node A passes specific prop structures to Node B (`A -> injects_props -> B`).
* **Hook Consumption:** Node A calls Custom Hook Y (`A -> consumes_hook -> Y`).
* **Context Subscription:** Node A reads from Context Z (`A -> subscribes_to -> Z`).

### Phase 3: Schema Output & Storage
Do not write human prose or bug analysis during this phase. Compile the structural data strictly into a standardized machine-readable state file (JSON or YAML) and save it to the agent's active workspace memory.

## 📊 Knowledge Graph Schema Definition (JSON)
The skill must output and persist the graph in the following format. For each node discovered, provide a 1 to 2-line description detailing its functional role and boundaries in the application.

```json
{
  "project_name": "My-React-App",
  "last_updated": "2026-07-06T22:28:00Z",
  "nodes": [
    {
      "id": "src/context/AuthContext.js",
      "type": "context_provider",
      "description": "Global authentication context provider managing logged-in user state, loading transitions, and API error states.",
      "exports": ["AuthContext", "AuthProvider"],
      "state_managed": ["user", "loading", "error"]
    },
    {
      "id": "src/hooks/useAuth.js",
      "type": "custom_hook",
      "description": "Convenience hook exposing authentication context and actions like login, logout, and token refresh.",
      "dependencies": ["src/context/AuthContext.js"]
    },
    {
      "id": "src/components/Login.jsx",
      "type": "smart_component",
      "description": "Interactive login form handling user credential input, validation, and submission via useAuth hook.",
      "hooks_used": ["useAuth"],
      "props_accepted": []
    }
  ],
  "edges": [
    {
      "source": "src/hooks/useAuth.js",
      "target": "src/context/AuthContext.js",
      "relationship": "subscribes_to"
    },
    {
      "source": "src/components/Login.jsx",
      "target": "src/hooks/useAuth.js",
      "relationship": "consumes_hook"
    }
  ]
}
```

## 🛑 Agent Guardrails & Constraints
* **Strict Boundary of Responsibility:** This skill **only** maps structure. It does not evaluate code quality, look for bugs, or suggest modifications. It leaves diagnostics entirely to the `react_bug_analyzer` skill.
* **Token Budget Conservation:** For large codebases, do not read full method bodies. Only parse import statements, export footprints, component declarations, and top-level hook invocations (e.g., lines containing `useState`, `useEffect`, `useContext`).
* **State Synchronization:** If a user modifies or patches a file via a bug-fix skill, this builder skill must be notified to run an **incremental update** on that specific node rather than parsing the entire project again.

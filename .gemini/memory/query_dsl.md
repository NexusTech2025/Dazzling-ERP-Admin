# DazzlingDB Advanced Query DSL - Frontend Documentation

This document defines the high-level specification for the `data_query`, `data_update`, and `data_delete` actions used in the DazzlingDB ecosystem.

---

## 1. Core Principles

### Target Specification
- **Field Name**: All data operations MUST use the key `target` to specify the database entity (table).
- **Naming Convention**: The `target` value MUST be in **PascalCase** (e.g., `Batch`, `Student`, `TeacherAttendance`).
- **Legacy Note**: The key `table` is deprecated and should not be used in new implementations.

### Action Types
- `data_query`: Retrieve records based on filters, sorting, and pagination.
- `data_update`: Modify existing records.
- `data_delete`: Remove records from the database.

---

## 2. Standard CRUD Protocol

### Data Query (`data_query`)
Retrieves records with advanced filtering and relational hydration.

**Payload Shape:**
```json
{
  "action": "data_query",
  "token": "AUTH_TOKEN",
  "payload": {
    "target": "PascalCaseTarget",
    "where": { ... filters ... },
    "include": { ... relations ... },
    "select": [ "field1", "field2" ],
    "sort": [ { "field": "name", "order": "ASC" } ],
    "pagination": { "limit": 50, "offset": 0 }
  }
}
```

### Data Update (`data_update`)
Updates records matching the criteria.

**Payload Shape:**
```json
{
  "action": "data_update",
  "token": "AUTH_TOKEN",
  "payload": {
    "target": "PascalCaseTarget",
    "where": { ... filters ... },
    "data": { ... fields_to_update ... }
  }
}
```

### Data Delete (`data_delete`)
Deletes records matching the criteria.

**Payload Shape:**
```json
{
  "action": "data_delete",
  "token": "AUTH_TOKEN",
  "payload": {
    "target": "PascalCaseTarget",
    "where": { ... filters ... }
  }
}
```

---

## 3. Query DSL Operators

Filters in the `where` clause support both simple equality and complex operators.

| Operator | Description | Example Payload |
| :--- | :--- | :--- |
| `eq` | Equal to | `{ "field": { "operator": "eq", "value": "val" } }` |
| `neq` | Not equal to | `{ "field": { "operator": "neq", "value": "val" } }` |
| `gt` | Greater than | `{ "age": { "operator": "gt", "value": 18 } }` |
| `gte` | Greater than or equal to | `{ "age": { "operator": "gte", "value": 18 } }` |
| `lt` | Less than | `{ "age": { "operator": "lt", "value": 60 } }` |
| `lte` | Less than or equal to | `{ "age": { "operator": "lte", "value": 60 } }` |
| `contains` | Substring match (case-insensitive) | `{ "name": { "operator": "contains", "value": "Ali" } }` |
| `in` | Value in array | `{ "status": { "operator": "in", "value": ["active", "pending"] } }` |
| `between`| Range check (inclusive) | `{ "date": { "operator": "between", "value": ["2023-01-01", "2023-12-31"] } }` |

---

## 4. Relational Hydration (`include`)

The `include` field allows fetching related entities in a single request, solving the N+1 problem.

### Array Format (Flat)
Fetches related entities as nested objects or arrays.
```json
"include": ["address", "enrollments"]
```

### Object Format (Deep/Nested)
Supports recursive hydration and custom sub-queries.
```json
"include": {
  "address": {},
  "enrollments": {
    "include": {
      "batch": {}
    }
  }
}
```

---

## 5. Pagination & Sorting

### Sort
Defines multi-column ordering.
```json
"sort": [
  { "field": "created_at", "order": "DESC" },
  { "field": "name", "order": "ASC" }
]
```

---

## 6. Frontend Optimization: Cache-First Local Relation Resolver

To optimize performance and reduce server load, the frontend implements a "Cache-First" strategy for resolving entities and their relations.

### Pattern Overview
When a component needs detailed information for an entity (e.g., during navigation from a list to a profile), it should prioritize the local React Query cache.

### The Two-Tier Lookup
1.  **Direct Detail Lookup**: Check the specific detail query key (e.g., `['batch', 'detail', id]`).
2.  **Broad List Search**: If not found, iterate through all cached list queries (e.g., all `['batch', 'list', ...]` results) to find a matching item.

### Implementation Standard (Hooks)
Custom hooks (e.g., `useBatchDetailQuery`) MUST implement `initialData` with this lookup logic:

```javascript
initialData: () => {
  // 1. Direct Cache
  const cachedDetail = queryClient.getQueryData(queryKeys.entity.detail(id));
  if (cachedDetail) return cachedDetail;

  // 2. List Fallback
  const listQueries = queryClient.getQueriesData({ queryKey: queryKeys.entity.lists() });
  for (const [key, listData] of listQueries) {
    if (Array.isArray(listData)) {
      const item = listData.find(e => e.entity_id === id || e.id === id);
      if (item) return item;
    }
  }
}
```

### Relational Resolution (Independent Hooks)
For related descriptive fields (e.g., `course_name` on a Batch record), use independent optimized detail hooks:
```javascript
const { data: batch } = useBatchDetailQuery(id);
const { data: course } = useCourseDetailQuery(batch?.course_id); // Instant cache resolution
```

> **Rationale**: This pattern ensures the UI is always responsive (instant loads) and eliminates redundant "N+1" style API requests for data already present in the client's memory.

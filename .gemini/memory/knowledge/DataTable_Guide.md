# DataTable Component Guide

## Overview
The `DataTable` component is a flexible, compositional React component designed for rendering and managing tabular data. It provides a unified structure for the UI, combining table headers, filters, actions, loading states, error handling, and empty states. Under the hood, it abstracts the repetitive boilerplate of styling HTML tables and delegates granular rendering to semantic sub-components (like `TableContainer`, `TableHeader`, `TableBody`, etc.) exported from `ui/table/index.jsx`.

---

## Component Hierarchy
The component manages the layout and wraps various states gracefully. Here is a structural representation of the `DataTable`:

```text
DataTable
 ├── Header Section
 │    ├── Title & Subtitle
 │    └── Actions (primaryAction, secondaryAction)
 ├── Filters Section
 │    └── (Optional: filter components rendered in a styled box)
 └── Table Area (TableContainer)
      ├── [Conditional: TableLoading if isLoading is true]
      ├── [Conditional: TableError if error is truthy]
      └── TableContainer
           ├── TableHeader
           │    └── TableRow
           │         └── TableHead (maps over columns prop)
           └── TableBody
                ├── [Conditional: TableEmpty if data is empty]
                └── TableRow (maps over data prop)
                     └── TableCell (renders value based on column definition)
```

---

## Props Table

| Prop | Type | Description |
| :--- | :--- | :--- |
| `title` | String / ReactNode | The main title of the data table. |
| `subtitle` | String / ReactNode | An optional subtitle displayed below the main title. |
| `primaryAction` | ReactNode | Typically a primary button (e.g., "Add New") rendered at the top right. |
| `secondaryAction` | ReactNode | Typically a secondary button (e.g., "Export") rendered next to the primary action. |
| `filters` | ReactNode | Filter elements (like search bars or dropdowns) to render above the table. |
| `columns` | Array | **Required.** An array of objects defining the column schema. (See Column Schema Guide below). |
| `data` | Array | The array of objects (rows) to render. Defaults to `[]`. |
| `isLoading` | Boolean | If `true`, the table body is replaced with a loading spinner component. |
| `error` | Object / String | If truthy, the table body is replaced with an error component. Extracts `.message` if it's an object. |
| `onRetry` | Function | Callback function passed to the `TableError` component to retry failed fetch requests. |
| `emptyMessage` | String | Message shown when the `data` array is empty. Defaults to `"No records found."`. |
| `emptyIcon` | String | Material Symbols icon name for the empty state. Defaults to `"person_off"`. |

---

## Column Schema Guide

The `columns` prop expects an array of objects. **CRITICAL:** There are specific nuances to how `DataTable` processes columns compared to other popular libraries like React Table/TanStack Table.

### Expected Column Object Structure
| Key | Type | Description |
| :--- | :--- | :--- |
| `header` | String / ReactNode | The label for the column header. |
| `align` | `'left'`, `'center'`, `'right'` | Alignment for both the header and the cells in this column. Defaults to `'left'`. |
| `headerClassName` | String | Custom Tailwind/CSS classes for the `<th>` (TableHead). |
| `className` | String | Custom Tailwind/CSS classes for the `<td>` (TableCell). |
| `accessor` | String / Function | The key mapping to the row's property (e.g., `'id'`). Can also be a function taking the raw `row`. |
| `cell` | Function | Custom render function. Receives the raw `row` object. |
| `render` | Function | Alternative to `cell`. Functions exactly the same way. |

### ⚠️ Quirks & Critical Rules

1. **Use `accessor`, NOT `accessorKey`:** Unlike standard TanStack Table which relies on `accessorKey`, this component explicitly looks for `accessor`.
2. **Raw `row` parameter in render functions:** The `cell` and `render` functions receive the full raw `row` object as their **first and only argument**.
   - ✅ **CORRECT:** `cell: (row) => <span>{row.firstName}</span>`
   - ❌ **INCORRECT:** `cell: ({ row }) => ...` (Do not destructure it)
3. **Rendering Priority Hierarchy:** For a given column, the component resolves what to render in this order:
   1. `col.cell(row)` (if `cell` is a function)
   2. `col.render(row)` (if `render` is a function)
   3. `col.accessor(row)` (if `accessor` is a function)
   4. `row[col.accessor]` (if `accessor` is a string key)
   5. Fallback to `''` (empty string)

---

## Usage Examples

Here is a comprehensive example demonstrating how to configure columns and consume the `DataTable` component:

```jsx
import React, { useState } from 'react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';

const StudentList = () => {
  const [students, setStudents] = useState([
    { id: '1', name: 'John Doe', grade: 'A', status: 'active' },
    { id: '2', name: 'Jane Smith', grade: 'B', status: 'inactive' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Define columns adhering strictly to the schema rules
  const columns = [
    { 
      header: 'ID', 
      accessor: 'id', 
      className: 'font-mono text-gray-500' 
    },
    { 
      header: 'Full Name', 
      accessor: 'name' 
    },
    { 
      header: 'Grade', 
      align: 'center',
      // accessor can be a function receiving the raw row
      accessor: (row) => `Grade ${row.grade}` 
    },
    { 
      header: 'Status', 
      align: 'center',
      // CRITICAL: row is the raw object, NOT destructured { row }
      cell: (row) => (
        <Badge 
          status={row.status === 'active' ? 'success' : 'error'} 
          text={row.status} 
        />
      )
    },
    { 
      header: 'Actions', 
      align: 'right',
      // render acts identically to cell
      render: (row) => (
        <button 
          className="text-blue-500 hover:underline"
          onClick={() => console.log('Edit', row.id)}
        >
          Edit
        </button>
      )
    }
  ];

  return (
    <DataTable
      title="Students"
      subtitle="Manage and view student records"
      columns={columns}
      data={students}
      isLoading={isLoading}
      error={null} // Pass an error object or string if fetching failed
      onRetry={() => console.log('Retrying fetch...')}
      emptyMessage="No students currently enrolled."
      emptyIcon="school"
      primaryAction={
        <button className="bg-primary text-white px-4 py-2 rounded-lg">
          Add Student
        </button>
      }
      secondaryAction={
        <button className="border px-4 py-2 rounded-lg">
          Export CSV
        </button>
      }
      filters={
        <input 
          type="text" 
          placeholder="Search students..." 
          className="col-span-12 md:col-span-4 p-2 border rounded"
        />
      }
    />
  );
};

export default StudentList;
```
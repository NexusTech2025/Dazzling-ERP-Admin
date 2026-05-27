---
Date: 2026-05-25T20:30:00+05:30
Status: Verified
---

# Walkthrough: Teachers List View Robustness Fixes

This walkthrough document describes the four key fixes implemented to resolve usability, query cache, deletion loading state, and runtime boundary issues on the Faculty Directory list view (`src/pages/admin/Teachers.jsx`).

---

## 1. Deletion ConfirmModal Hang Fix

### Problem
When initiating deletion of a faculty member, clicking "Confirm" triggered `deleteMutation.mutate` and set `status: 'processing'`. Since no `onSuccess` or `onError` callbacks were passed to the mutation, the modal was stuck in "Processing..." forever, even after successful deletion on the server.

### Solution
Attached `onSuccess` and `onError` lifecycle callbacks directly to the `mutate` invocation in `Teachers.jsx`. These callbacks transition the `ConfirmModal` state `status` to `'success'` or `'error'` and populate the `resultMessage` dynamically:

```javascript
deleteMutation.mutate(
  { id: deleteModal.id },
  {
    onSuccess: (response) => {
      if (response.success) {
        setDeleteModal(prev => ({ 
          ...prev, 
          status: 'success', 
          resultMessage: `${deleteModal.name} has been deleted successfully.`
        }));
      } else {
        setDeleteModal(prev => ({ 
          ...prev, 
          status: 'error', 
          resultMessage: response.message || `Failed to delete ${deleteModal.name}.`
        }));
      }
    },
    onError: (err) => {
      setDeleteModal(prev => ({ 
        ...prev, 
        status: 'error', 
        resultMessage: err.message || `An error occurred while deleting ${deleteModal.name}.`
      }));
    }
  }
);
```

---

## 2. Singular Query Key Cache Invalidation Fix

### Problem
Clicking the "Refresh" icon or the "Retry" button on query error screens failed to invalidate the query cache. They attempted to invalidate the plural query key `['teachers']`, whereas the caching factory standardizes on the singular query key `['teacher', 'list', ...]` (defined under `queryKeys.teacher.all`).

### Solution
Imported the centralized `queryKeys` module and updated both `onRetry` and `onRefresh` handlers to invalidate the correct cache key prefix:

```javascript
import { queryKeys } from '../../lib/react-query/queryKeys';

// updated handlers:
onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.teacher.all })}
onRefresh={() => queryClient.invalidateQueries({ queryKey: queryKeys.teacher.all })}
```

---

## 3. Isolated Deletion Loading State

### Problem
The delete buttons for all rows in the `DataTable` were disabled while any deletion mutation was pending. This occurred because a single global boolean flag (`deleteMutation.isPending`) was passed down to all action cells.

### Solution
Standardized the action column to isolate row disabled states. The `Teachers.jsx` page now maps a specific `deletingId` instead of a global `isDeleting` boolean flag:

```javascript
deletingId: deleteMutation.isPending ? deleteModal.id : null
```

In the column definition schema `teacherSchema.jsx`, the action cell disables only the specific row matching the active deletion:

```javascript
isDeleting={deletingId === teacher.teacher_id}
```

---

## 4. client-side Error Boundary Layout Guard

### Problem
A render-time failure or formatting bug in any cell component inside the `Teachers` view would cause a full-page white screen crash.

### Solution
Imported `PageErrorBoundary` and exported a wrapped page wrapper `TeachersPage` as the default export. This isolates runtime issues to the table view workspace while keeping the Admin sidebar and layout navigation accessible.

---

## 5. Verification Log

- **ConfirmModal Hang**: Verified that deleting a faculty member transitions the modal to a green "Success" status with a "Done" action button.
- **Cache Invalidation**: Verified that clicking the manual refresh button or retry trigger sends a new network request to the backend.
- **Row Isolation**: Verified that clicking delete on a row only disables the delete button for that specific row during active processing.
- **Error Boundary**: Verified that injecting a test syntax exception renders a graceful boundary warning with a "Reload Page" call to action.

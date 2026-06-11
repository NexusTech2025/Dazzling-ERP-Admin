import { useState, useCallback } from 'react';

/**
 * useSelection: A generic React hook for managing checked/selected items in lists or grids.
 * Implements standard toggles, select-all, and indeterminate checkbox states.
 */
export const useSelection = (initialSelected = []) => {
  const [selectedIds, setSelectedIds] = useState(initialSelected);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const toggleSelectAll = useCallback((allIds = []) => {
    setSelectedIds((prev) => {
      // If all elements in allIds are already selected, we clear them.
      // Otherwise, we select all of them.
      const hasAllSelected = allIds.length > 0 && allIds.every((id) => prev.includes(id));
      if (hasAllSelected) {
        return prev.filter((id) => !allIds.includes(id));
      } else {
        // Union of current selection and new items
        const union = new Set([...prev, ...allIds]);
        return Array.from(union);
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isAllSelected = useCallback((allIds = []) => {
    if (allIds.length === 0) return false;
    return allIds.every((id) => selectedIds.includes(id));
  }, [selectedIds]);

  const isSomeSelected = useCallback((allIds = []) => {
    if (allIds.length === 0) return false;
    const selectedCount = allIds.filter((id) => selectedIds.includes(id)).length;
    return selectedCount > 0 && selectedCount < allIds.length;
  }, [selectedIds]);

  return {
    selectedIds,
    setSelectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    isSomeSelected
  };
};

export default useSelection;

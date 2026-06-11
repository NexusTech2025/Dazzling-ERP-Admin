import React, { useMemo } from 'react';

/**
 * useSelectableTable: A custom hook that acts as a decorator/adapter for table columns.
 * It prepends a checkbox selection column to the base columns configuration.
 * 
 * @param {object} params
 * @param {Array} params.columns - Base columns array for the table
 * @param {Array} params.data - The filtered rows currently displayed in the table
 * @param {string} params.idKey - The unique row identifier key (e.g. 'teacher_id', 'batch_id')
 * @param {Array} params.selectedIds - List of currently selected IDs (from useSelection)
 * @param {function} params.toggleSelect - Toggle function for a single row ID
 * @param {function} params.toggleSelectAll - Toggle function for selecting/deselecting all displayed row IDs
 * @param {function} params.isAllSelected - Function checking if all displayed row IDs are selected
 * @param {function} params.isSomeSelected - Function checking if some (but not all) displayed row IDs are selected
 * @returns {Array} Decorated columns array containing the checkbox column as the first element
 */
export const useSelectableTable = ({
  columns,
  data,
  idKey,
  selectedIds,
  toggleSelect,
  toggleSelectAll,
  isAllSelected,
  isSomeSelected
}) => {
  const visibleRowIds = useMemo(() => data.map(item => item[idKey]), [data, idKey]);
  const visibleRowIdsStr = visibleRowIds.join(',');

  const decoratedColumns = useMemo(() => {
    const selectColumn = {
      header: (
        <input
          type="checkbox"
          className="size-4 rounded border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary/20 cursor-pointer transition-all"
          checked={isAllSelected(visibleRowIds)}
          ref={input => {
            if (input) {
              input.indeterminate = isSomeSelected(visibleRowIds);
            }
          }}
          onChange={() => toggleSelectAll(visibleRowIds)}
        />
      ),
      accessor: 'checkbox',
      className: 'w-10',
      cell: (row) => (
        <input
          type="checkbox"
          className="size-4 rounded border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary/20 cursor-pointer transition-all"
          checked={selectedIds.includes(row[idKey])}
          onChange={() => toggleSelect(row[idKey])}
        />
      )
    };

    return [selectColumn, ...columns];
  }, [
    columns,
    idKey,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    isAllSelected,
    isSomeSelected,
    visibleRowIdsStr
  ]);

  return decoratedColumns;
};

export default useSelectableTable;

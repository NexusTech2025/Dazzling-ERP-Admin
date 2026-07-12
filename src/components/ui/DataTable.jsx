import React from 'react';
import PropTypes from 'prop-types';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell, TableLoading, TableError, TableEmpty } from './table';

// Decouple the row mapping into a memoized component to optimize keystroke rendering latency
const DataTableRow = React.memo(({ row, columns }) => {
  return (
    <TableRow>
      {columns.map((col, colIndex) => (
        <TableCell key={colIndex} align={col.align} className={col.className}>
          {col.cell 
            ? col.cell(row) 
            : col.render 
            ? col.render(row) 
            : (typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor] || '')
          }
        </TableCell>
      ))}
    </TableRow>
  );
}, (prevProps, nextProps) => {
  // Deep-check row status, times, remarks, and dirty state to prevent leaks on column reference shifts
  return (
    prevProps.row.student_id === nextProps.row.student_id &&
    prevProps.row.status === nextProps.row.status &&
    prevProps.row.entry_time === nextProps.row.entry_time &&
    prevProps.row.exit_time === nextProps.row.exit_time &&
    prevProps.row.remarks === nextProps.row.remarks &&
    prevProps.row.isRowDirty === nextProps.row.isRowDirty
  );
});

DataTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired
};

DataTableRow.displayName = 'DataTableRow';

const DataTable = ({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  filters,
  columns,
  data = [],
  isLoading,
  error,
  onRetry,
  emptyMessage = "No records found.",
  emptyIcon = "person_off"
}) => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main dark:text-white">{title}</h1>
          {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {secondaryAction}
          {primaryAction}
        </div>
      </div>

      {/* Filters Section */}
      {filters && (
        <div className="grid grid-cols-12 md:grid-cols-12 gap-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4 shadow-sm">
          {filters}
        </div>
      )}

      {/* Table Area with Loading/Error states */}
      <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        {isLoading ? (
          <TableLoading />
        ) : error ? (
          <TableError error={error} onRetry={onRetry} />
        ) : (
          <TableContainer>
            <TableHeader>
              <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                {columns.map((col, index) => (
                  <TableHead key={index} align={col.align} className={col.headerClassName}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                  <TableCell colSpan={columns.length} align="center">
                    <TableEmpty message={emptyMessage} icon={emptyIcon} />
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, rowIndex) => (
                  <DataTableRow 
                    key={row.id || rowIndex} 
                    row={row} 
                    columns={columns} 
                  />
                ))
              )}
            </TableBody>
          </TableContainer>
        )}
      </div>
    </div>
  );
};

export default DataTable;

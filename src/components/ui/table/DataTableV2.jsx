import React from 'react';
import { 
  TableContainer, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableLoading, 
  TableError, 
  TableEmpty 
} from './index';

/**
 * A highly customizable presentation table component supporting sticky headers, 
 * multiple layout densities, fixed heights, row selection, and loading/error states.
 * Scoped locally to the Finance feature module.
 * 
 * @component
 */
const DataTableV2 = ({
  data = [],
  columns = [],
  density = 'medium',
  maxHeight,
  stickyHeader = false,
  isLoading = false,
  error = null,
  onRetry,
  selectedRowValue,
  selectedRowKey,
  onRowClick,
  emptyMessage = "No records found.",
  emptyIcon = "person_off"
}) => {
  // Map density to padding classes
  const getPaddingClass = () => {
    switch (density) {
      case 'low':
        return 'px-6 py-4';
      case 'high':
        return 'px-3 py-2';
      case 'medium':
      default:
        return 'px-4 py-3';
    }
  };

  const paddingClass = getPaddingClass();

  if (isLoading) {
    return <TableLoading />;
  }

  if (error) {
    return <TableError error={error} onRetry={onRetry} />;
  }

  const tableBodyContent = data.length === 0 ? (
    <tr>
      <td colSpan={columns.length} className="text-center py-8">
        <TableEmpty message={emptyMessage} icon={emptyIcon} />
      </td>
    </tr>
  ) : (
    data.map((row, rowIndex) => {
      const isSelected = selectedRowKey && row[selectedRowKey] === selectedRowValue;
      
      return (
        <tr
          key={row.id || row.student_fee_id || row.installment_id || row.payment_id || rowIndex}
          onClick={() => onRowClick && onRowClick(row, rowIndex)}
          className={`
            border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors
            ${onRowClick ? 'cursor-pointer' : ''}
            ${isSelected ? 'bg-indigo-50/40 border-r-4 border-r-[#1a237e]' : ''}
          `}
        >
          {columns.map((col, colIndex) => {
            const alignmentClass = col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
            
            return (
              <td
                key={colIndex}
                className={`${paddingClass} ${alignmentClass} text-slate-800 ${col.className || ''}`}
              >
                {col.cell 
                  ? col.cell(row) 
                  : (typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor] ?? '')
                }
              </td>
            );
          })}
        </tr>
      );
    })
  );

  return (
    <div 
      className="overflow-x-auto w-full transition-all duration-300"
      style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
    >
      <table className="w-full text-left text-xs border-collapse">
        <thead className={`bg-slate-50/30 border-b border-slate-200 ${stickyHeader ? 'sticky top-0 z-10 backdrop-blur-md' : ''}`}>
          <tr>
            {columns.map((col, colIndex) => {
              const alignmentClass = col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
              return (
                <th
                  key={colIndex}
                  className={`${paddingClass} ${alignmentClass} font-bold uppercase tracking-wider text-slate-400 ${col.headerClassName || ''}`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tableBodyContent}
        </tbody>
      </table>
    </div>
  );
};

export default DataTableV2;

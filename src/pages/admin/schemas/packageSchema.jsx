import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../../components/ui/Badge';

/**
 * Creates the column schema for the Package table.
 * 
 * @param {Object} handlers - Callbacks for user interactions.
 * @param {Function} [handlers.onDelete] - (id, name, type) => void
 * @returns {Array} Array of column configuration objects compatible with DataTable.
 */
export const createPackageColumns = ({ onDelete } = {}) => {
  return [
    {
      header: 'Package Name',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded bg-primary/10 text-primary flex items-center justify-center font-black text-[10px]">
            <span className="material-symbols-outlined text-sm">inventory_2</span>
          </div>
          <span className="font-bold text-text-main dark:text-white">{row.name}</span>
        </div>
      )
    },
    {
      header: 'Included Courses',
      accessor: 'courses',
      cell: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {(row.courses || []).map((c, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-bold text-text-secondary border border-border-light dark:border-border-dark whitespace-nowrap">
              {c.name}
            </span>
          ))}
        </div>
      )
    },
    {
      header: 'Price',
      accessor: 'package_fee',
      className: 'text-right font-black text-primary',
      cell: (row) => `₹${row.package_fee?.toLocaleString()}`
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'default'}>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Link to={`/admin/packages/edit/${row.package_id}`} className="p-1.5 text-text-secondary hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </Link>
          <button 
            onClick={() => onDelete?.(row.package_id, row.name, 'package')}
            className="p-1.5 text-text-secondary hover:text-red-500 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      )
    }
  ];
};

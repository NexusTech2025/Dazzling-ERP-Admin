import React, { useMemo, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../../components/ui/DataTable';
import Badge from '../../../components/ui/Badge';
import useSelectableTable from '../../../hooks/useSelectableTable';
import { CoursesMobileView } from './CoursesMobileView';

/**
 * CourseListView Component
 * Renders the DataTable list representation of courses.
 * Wrapped in React.memo to prevent unnecessary column rebuilds and calculations on selection change.
 */
const CourseListView = ({ courses = [], onDelete, selection }) => {
  const navigate = useNavigate();
  const courseColumns = useMemo(() => [
    {
      header: 'Course Name',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded bg-primary/10 text-primary flex items-center justify-center font-black text-[10px]">
            {row.name ? row.name.substring(0, 2).toUpperCase() : '??'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-text-main dark:text-white leading-none">{row.name}</p>
              {row.metadata?.class && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-wider">
                  Class {row.metadata.class}
                </span>
              )}
            </div>
            <p className="text-[10px] text-text-secondary mt-1 font-mono">{row.language_medium} • {row.metadata?.board || 'N/A'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'ID',
      accessor: 'course_id',
      className: 'font-mono text-xs'
    },
    {
      header: 'Fee',
      accessor: 'base_fee',
      className: 'text-right font-black',
      cell: (row) => `₹${row.base_fee?.toLocaleString()}`
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
          <Link
            to={`/admin/courses/edit/${row.course_id}`}
            className="p-1.5 text-text-secondary hover:text-primary transition-colors"
            title="Edit Course"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </Link>
          <button
            type="button"
            onClick={() => onDelete(row.course_id, row.name)}
            className="p-1.5 text-text-secondary hover:text-red-500 transition-colors"
            title="Delete Course"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      )
    }
  ], [onDelete]);

  const columns = useSelectableTable({
    columns: courseColumns,
    data: courses,
    idKey: 'course_id',
    selectedIds: selection?.selectedIds || [],
    toggleSelect: selection?.toggleSelect,
    toggleSelectAll: selection?.toggleSelectAll,
    isAllSelected: selection?.isAllSelected,
    isSomeSelected: selection?.isSomeSelected
  });

  // Only use decorated columns if selection is supplied (e.g. not null/undefined)
  const finalColumns = selection ? columns : courseColumns;

  return (
    <>
      {/* Mobile Card-based List view */}
      <div className="md:hidden">
        <CoursesMobileView
          courses={courses}
          selection={selection}
          onDelete={onDelete}
        />
      </div>

      {/* Desktop Tabular List view */}
      <div className="hidden md:block">
        <DataTable
          data={courses}
          columns={finalColumns}
          isLoading={false}
        />
      </div>
    </>
  );
};

export default memo(CourseListView);
